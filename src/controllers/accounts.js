const Controller = require('./controller');
const jwt = require('jsonwebtoken');
const Auth = require('../middleware/authenticate');
const ObjectId = require('mongodb').ObjectId;

class Accounts extends Controller {
  constructor() {
    super();
    this.col = 'accounts';
  }

  async login(ctx) {
    const auth = new Auth();
    const user = await this.getUser(ctx);
    const isOk = await auth.compare(ctx.request.body.password, user.hashedPassword);

    delete user.hashedPassword;

    if (isOk) {
      ctx.status = 201;
      ctx.body = {
        token: jwt.sign({
          role: 'user',
          _id: user._id
        }, process.env.FULLSTACK_API_SHARED_SECRET),
        message: 'Successfully logged in!',
        user
      };
    } else {
      ctx.status = 401;
      ctx.body = {
        message: 'Authentication failed'
      };
    }
  }

  async getUser(ctx) {
    return ctx.db.collection(this.col).findOne(({ username: ctx.request.body.username }));
  }

  // new user creation
  async post(ctx) {
    const auth = new Auth();
    const data = ctx.request.body;

    if (ctx.request.body.password !== ctx.request.body.passwordRepeat) {
      ctx.status = 401;
      ctx.body = {
        message: 'Passwords do not match!'
      };
      return ctx;
    }

    // auth failed, password required
    if (!ctx.request.body.password) {
      ctx.status = 401;
      ctx.body = {
        message: 'Password is required!'
      };
      return ctx;
    }

    const existingUser = await this.getUser(ctx);

    if (existingUser) {
      ctx.status = 401;
      ctx.body = {
        message: 'User already exists'
      };
      return ctx;
    }

    // hash the password and update user
    data.hashedPassword = await auth.hashPassword(ctx.request.body.password);
    data.updatedAt = new Date().toISOString();

    const password = data.password;
    delete data.password;
    delete data.passwordRepeat;

    const newUser = await ctx.db.collection(this.col).findOneAndUpdate({
      username: data.username
    }, {
      $set: data,
      $setOnInsert: {
        createdAt: new Date().toISOString()
      }
    }, {
      upsert: true,
      returnOriginal: false,
      returnNewDocument: true
    });

    const isOk = await auth.compare(password, newUser.value.hashedPassword);
    delete newUser.value.hashedPassword;

    if (isOk) {
      ctx.status = 201;
      ctx.body = {
        token: jwt.sign({
          role: 'user',
          _id: newUser.value._id
        }, process.env.FULLSTACK_API_SHARED_SECRET),
        message: 'Successfully registered!',
        user: newUser.value
      };
    } else {
      ctx.status = 401;
      ctx.body = {
        message: 'Registration failed'
      };
    }
  }

  async delete(ctx) {
    const auth = new Auth();
    const user = await this.getUser(ctx);
    let isOk = false;

    if (user && ctx.request.body.username && ctx.request.body.password) {
      isOk = await auth.compare(ctx.request.body.password, user.hashedPassword);
    }

    if (isOk) {
      try {
        const res = await ctx.db.collection(this.col).removeOne({ _id: ObjectId(ctx.params.id) });
        ctx.status = 204;
        ctx.body = res;
      } catch (err) {
        ctx.status = 500;
        ctx.body = err;
      }
    } else {
      ctx.status = 401;
      ctx.body = {
        message: 'Authentication failed'
      };
    }
  }

  async get(ctx) {
    const data = await ctx.db.collection(this.col)
      .findOne({
        _id: ObjectId(ctx.params.id)
      });

    delete data.hashedPassword;
    ctx.body = data;
  }
}

module.exports = Accounts;
