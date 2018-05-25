const Controller = require('./controller');

class Items extends Controller {
  constructor() {
    super();
    this.col = 'items';
  }
}

module.exports = Items;
