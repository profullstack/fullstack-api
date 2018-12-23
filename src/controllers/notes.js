const Controller = require('./controller');

class Notes extends Controller {
  constructor() {
    super();
    this.collection = 'notes';
  }
}

module.exports = Notes;
