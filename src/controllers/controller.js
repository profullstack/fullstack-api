const ObjectId = require('mongodb').ObjectId;

class Controller {
  // constructor() {}

  async getAll(ctx) {
    ctx.body = await ctx.db.collection(this.collection)
      .find({})
      .toArray();
  }

  async noop(ctx) {
    ctx.status = 200;
  }

  async getAllByUser(ctx) {
    ctx.body = await ctx.db.collection(this.collection)
      .find({
        createdBy: ObjectId(ctx.state.user._id)
      })
      .toArray();
  }

  async get(ctx) {
    ctx.body = await ctx.db.collection(this.collection)
      .findOne({
        _id: ObjectId(ctx.params.id)
      });
  }

  async me(ctx) {
    const data = await ctx.db.collection(this.collection)
      .findOne({
        _id: ObjectId(ctx.state.user._id)
      });

    delete data.hashedPassword;
    ctx.body = data;
  }

  async delete(ctx) {
    // only delete objects user has created
    try {
      const res = await ctx.db.collection(this.collection)
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
      delete data._id;
      const updatedDoc = await ctx.db.collection(this.collection)
        .findOneAndUpdate(match.id, {
          $set: { ...data, ...match }
        }, {
          returnOriginal: false,
          returnNewDocument: true
        });

      ctx.body = updatedDoc.value;
    } else {
      const newDoc = await ctx.db.collection(this.collection)
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
