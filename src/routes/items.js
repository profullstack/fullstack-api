const path = require('path');
const Router = require('koa-router');

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);

const controller = new Controller();

const router = new Router({ prefix: `/api/1/${name}` });

router.post('/', controller.post.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;
