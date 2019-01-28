const path = require('path');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Auth = require('../middleware/authenticate');

const auth = new Auth();

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();
const router = new Router({ prefix: `/api/1/${name}` });

router.use(bodyParser());

// lowercase all users in mongo
router.get('/lowerCaseNames', auth.jwt(), auth.isAdmin.bind(auth), controller.lowerCaseNames.bind(controller));

module.exports = router;
