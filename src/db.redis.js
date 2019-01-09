const http = require('http');
const redis = require('redis');
const conf = require('./conf');
const bluebird = require('bluebird');
const { promisify } = require('util');

class Redis {
  constructor(opts) {
    this.opts = opts;

    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);

    this.dbUrl = conf.env.redis.url;
    this.connect = this.connect.bind(this);
    this.close = this.close.bind(this);
    this.client = redis.createClient({
      url: this.dbUrl
    });
  }

  async connect(ctx, next) {
    try {
      ctx.cache = this.client;
      ctx.cachePromise = promisify(ctx.cache.get).bind(ctx.cache);
    } catch (err) {
      console.warn('unable to connect: ', this.dbUrl);
      ctx.status = 500;
      ctx.body = err.message || http.STATUS_CODES[ctx.status];
    }

    await next();
  }

  async close(ctx, next) {
    await ctx.cache.quit();
    await next();
  }
}

module.exports = Redis;

