const http = require('http');
const r = require('rethinkdb');
const conf = require('./conf');

class RethinkDB {
  constructor(opts) {
    this.opts = opts;
    this.r = r;
    this.connect = this.connect.bind(this);
    this.close = this.close.bind(this);
  }

  async connect(ctx, next) {
    try {
      ctx.db = await this.r.connect({
        host: conf.rethinkdb.host,
        port: conf.rethinkdb.port,
        db: conf.rethinkdb.db
      });
    } catch (err) {
      console.warn('unable to connect: ', `rethinkdb://${conf.rethinkdb.host}:${conf.rethinkdb.port}/${conf.rethinkdb.db}`);
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

module.exports = RethinkDB;
