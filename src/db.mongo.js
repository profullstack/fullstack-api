const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const conf = require('./conf');

class Mongo {
  constructor(opts) {
    this.opts = opts;
    this.dbUrl = conf.env.mongodb.url;

    this.connect = this.connect.bind(this);
    this.close = this.close.bind(this);
    this.mongoClient = MongoClient.connect(this.dbUrl);
  }

  async connect(ctx, next) {
    try {
      console.log('Connecting to database: ', this.dbUrl);
      ctx.db = await this.mongoClient;
    } catch (err) {
      console.warn('unable to connect: ', this.dbUrl);
      ctx.status = 500;
      ctx.body = err.message || http.STATUS_CODES[ctx.status];
    }

    await next();
  }

  async close(ctx, next) {
    await ctx.db.close();
    await next();
  }
}

module.exports = Mongo;

