const Controller = require('./controller');

class Notes extends Controller {
  constructor() {
    super();
    this.col = 'notes';
  }
}

module.exports = Notes;
