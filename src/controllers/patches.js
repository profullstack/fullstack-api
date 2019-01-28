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
      const duplicates = accounts.filter(x => (
        user.username === x.username.toLowerCase().trim() ||
        user.email === x.email.toLowerCase().trim()) &&
        x._id !== user._id);

      if (duplicates.length) {
        ctx.status = 500;
        ctx.body = {
          error: {
            message: 'duplicate users found'
          },
          duplicates
        };
        return;
      }
      collection.save(user);
    }
    ctx.status = 200;
  }
}

module.exports = Patches;
