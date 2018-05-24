const Controller = require('./controller');
const jwt = require('jsonwebtoken');
const Auth = require('../middleware/authenticate');
const ObjectId = require('mongodb').ObjectId;

class Items extends Controller {
  constructor() {
    super();
    this.col = 'items';
  }
}

module.exports = Items;
