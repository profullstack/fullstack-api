const path = require('path');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();

const router = new Router({ prefix: '/api/1' });
router.use(bodyParser());

router.get('/', controller.home.bind(controller));
router.get('/noop', controller.noop.bind(controller));
router.post('/noop', controller.noop.bind(controller));

module.exports = router;
