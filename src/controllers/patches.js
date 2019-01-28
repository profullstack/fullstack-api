const Controller = require('./controller');

class Patches extends Controller {
  constructor() {
    super();
  }

  async lowerCaseNames(ctx) {
    const collection = ctx.mongo.db(process.env.TORULA_MONGODB_NAME)
      .collection('accounts');
    const accounts = await collection.find().toArray();
    // eslint-disable-next-line no-restricted-syntax
    for (const user of accounts) {
      user.username = user.username.toLowerCase().trim();
      user.email = user.email.toLowerCase().trim();
      if (accounts.some(x => (
        user.username === x.username.toLowerCase().trim() ||
            user.email === x.email.toLowerCase().trim()) &&
            x._id !== user._id)
      ) {
        ctx.status = 500;
        ctx.body = 'duplicate users found';
        return;
      }
      collection.save(user);
    }
    ctx.status = 200;
  }
}

module.exports = Patches;
