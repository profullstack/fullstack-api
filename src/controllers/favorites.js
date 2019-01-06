const Controller = require('./controller');

class Favorites extends Controller {
  constructor() {
    super();
    this.collection = 'favorites';
  }
}

module.exports = Favorites;
