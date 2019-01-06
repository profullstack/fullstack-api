const path = require('path');
const Router = require('koa-router');
const Auth = require('../middleware/authenticate');
const bodyParser = require('koa-bodyparser');

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();
const router = new Router({ prefix: `/api/1/${name}` });
const auth = new Auth();

router.use(bodyParser());

router.get('/', auth.jwt(), controller.getAll.bind(controller));
router.get('/me', auth.jwt(), controller.getAllByUser.bind(controller));
router.post('/', auth.jwt(), controller.post.bind(controller));
router.delete('/:id', auth.jwt(), controller.delete.bind(controller));
router.get('/:id', controller.get.bind(controller));
router.put('/:id', auth.jwt(), controller.put.bind(controller));

module.exports = router;
