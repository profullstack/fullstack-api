const Controller = require('./controller');
const api = require('../../package.json').version;

class Home extends Controller {
  constructor() {
    super();
    this.version = {
      api,
      providers
    };
  }

  async home(ctx) {
    const env = process.env.FULLSTACK_ENV || 'development';

    ctx.body = {
      'fullstack-api': this.version.api
      env
    };
  }
}

module.exports = Home;
