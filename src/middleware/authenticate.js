const jwt = require('koa-jwt');
const bcrypt = require('bcrypt');

class Authenticate {
  // constructor() {
  // }

  // see https://github.com/kelektiv/node.bcrypt.js
  async hashPassword(plaintext) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = bcrypt.hash(plaintext, salt);

    return hash;
  }

  async compare(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  }

  // see https://www.theodo.fr/blog/2016/11/securize-a-koa-api-with-a-jwt-token/
  jwt() {
    return jwt({ secret: process.env.FULLSTACK_API_SHARED_SECRET });
  }
}

exports default Authenticate;
