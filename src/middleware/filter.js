const ObjectId = require('mongodb').ObjectId;

class Filter {
  async getUser(ctx) {
    // eslint-disable-next-line no-underscore-dangle
    return ctx.mongo.db(process.env.TORULA_MONGODB_NAME).collection('accounts').findOne(ObjectId(ctx.state.user._id));
  }

  async updateWhiteList(ctx, whitelist) {
    // eslint-disable-next-line no-underscore-dangle
    return ctx.mongo.db(process.env.TORULA_MONGODB_NAME).collection('accounts')
      .updateOne({
        _id: ObjectId(ctx.state.user._id)
      }, {
        $set: {
          whitelist,
          updatedAt: new Date().toISOString()
        }
      });
  }

  async updateIsActive(ctx, isActive) {
    // eslint-disable-next-line no-underscore-dangle
    return ctx.mongo.db(process.env.TORULA_MONGODB_NAME).collection('accounts')
      .updateOne({
        _id: ObjectId(ctx.state.user._id)
      }, {
        $set: {
          isActive,
          updatedAt: new Date().toISOString()
        }
      });
  }

  async active(ctx, next) {
    const user = await this.getUser(ctx);
    const isActive = !!(
      user.expiresAt &&
      new Date(user.expiresAt) > new Date()
    );
    if (user.isActive === undefined || isActive !== user.isActive) {
      this.updateIsActive(ctx, isActive);
    }
    if (!isActive) {
      ctx.status = 401;
      ctx.body = 'you are not a subscriber';
      return;
    }
    await next();
  }

  async ip(ctx, next) {
    const realIp = ctx.request.headers['x-real-ip'] || ctx.request.ip;
    const user = await this.getUser(ctx);
    const whitelist = user.whitelist || [];
    if (whitelist.indexOf(realIp) === -1) {
      if (whitelist.length < 3) {
        whitelist.push(realIp);
        await this.updateWhiteList(ctx, whitelist);
      } else {
        ctx.status = 401;
        ctx.body = 'You have reached the max number of IP\'s, Please delete older IP addresses.';
        return;
      }
    }

    await next();
  }
}

module.exports = Filter;
