const Controller = require('./controller');

class Items extends Controller {
  constructor() {
    super();
    this.collection = 'items';
  }
}

module.exports = Items;
