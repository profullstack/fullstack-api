const path = require('path');
const Router = require('koa-router');
const Auth = require('../middleware/authenticate');

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();
const router = new Router({ prefix: `/api/1/${name}` });
const auth = new Auth();

router.get('/', auth.jwt(), controller.createTransaction.bind(controller));
router.post('/AYIuLzM8wp/check', controller.checkTransaction.bind(controller));

module.exports = router;