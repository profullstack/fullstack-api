const ObjectId = require('mongodb').ObjectId;

class Controller {
  // constructor() {}

  async getAll(ctx) {
    ctx.body = await ctx.db.collection(this.col)
      .find({})
      .toArray();
  }

  async getAllByUser(ctx) {
    debugger;
    ctx.body = await ctx.db.collection(this.col)
      .find({
        createdBy: ObjectId(ctx.state.user._id)
      })
      .toArray();
  }

  async get(ctx) {
    ctx.body = await ctx.db.collection(this.col)
      .findOne({
        _id: ObjectId(ctx.params.id),
        createdBy: ObjectId(ctx.state.user._id)
      });
  }

  async delete(ctx) {
    // only delete objects user has created
    try {
      const res = await ctx.db.collection(this.col)
        .removeOne({
          _id: ObjectId(ctx.params.id),
          createdBy: ObjectId(ctx.state.user._id)
        });
      ctx.status = 204;
      ctx.body = res;
    } catch (err) {
      ctx.status = 500;
      ctx.body = err;
    }
  }

  async post(ctx) {
    const data = ctx.request.body;

    data.updatedAt = new Date().toISOString();

    const match = {};
    const $setOnInsert = {
      createdAt: new Date().toISOString()
    };

    if (ctx.params.id) {
      match.id = ObjectId(ctx.params.id);
      match.createdBy = ObjectId(ctx.state.user._id);
    }

    if (ctx.state.user) {
      $setOnInsert.createdBy = ObjectId(ctx.state.user._id);
    }

    if (match.id) {
      const updatedDoc = await ctx.db.collection(this.col)
        .findOneAndUpdate(match, {
          $set: data,
          $setOnInsert
        }, {
          upsert: true,
          returnOriginal: false,
          returnNewDocument: true
        });

      ctx.body = updatedDoc.value;
    } else {
      const newDoc = await ctx.db.collection(this.col)
        .insertOne(Object.assign(data, $setOnInsert));
      ctx.body = newDoc.ops.shift();
    }
  }

  async put(ctx, next) {
    return this.post(ctx, next);
  }

  async patch(ctx, next) {
    return this.post(ctx, next);
  }
}

module.exports = Controller;
