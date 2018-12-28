const Controller = require('./controller');
const api = require('../../package.json').version;

class Home extends Controller {
  constructor() {
    super();
    this.version = {
      api
    };
  }

  async home(ctx) {
    const env = process.env.NODE_ENV || 'development';

    ctx.body = {
      'torula-api': this.version.api,
      env
    };
  }
}

module.exports = Home;
