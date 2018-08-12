const path = require('path');
const Router = require('koa-router');
const Auth = require('../middleware/authenticate');
const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();
const router = new Router({ prefix: `/api/1/${name}` });
const auth = new Auth();

router.post('/', controller.post.bind(controller));
router.get('/me', auth.jwt(), controller.me.bind(controller));
router.get('/:id', auth.jwt(), controller.get.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.post('/login', controller.login.bind(controller));

module.exports = router;
