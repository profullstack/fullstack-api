const http = require('http');
const r = require('rethinkdb');
const conf = require('./conf');

class RethinkDB {
  constructor(opts) {
    this.opts = opts;
    this.connect = this.connect.bind(this);
    this.close = this.close.bind(this);
  }

  async connect(ctx, next) {
		this.conn = await this.r.connect({
			host: conf.rethinkdb.host,
			port: conf.rethinkdb.port,
			db: conf.rethinkdb.db
		});

    try {
      ctx.db = await this.connect(this.dbUrl);
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

exports default RethinkDB;

