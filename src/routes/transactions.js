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

router.get('/', auth.jwt(), auth.isAdmin.bind(auth), controller.getAll.bind(controller));
router.post('/', auth.jwt(), controller.createTransaction.bind(controller));
router.post('/AYIuLzM8wp/check', controller.checkTransaction.bind(controller));
router.get('/me', auth.jwt(), controller.getAllByUser.bind(controller));
router.get('/referrals/me', auth.jwt(), controller.getAllReferralsByUser.bind(controller));
router.get('/referrals', auth.jwt(), auth.isAdmin.bind(auth), controller.getAllReferrals.bind(controller));
router.post('/referrals/paid', auth.jwt(), auth.isAdmin.bind(auth), controller.paidUser.bind(controller));
router.get('/rates', auth.jwt(), controller.getRates.bind(controller));
router.get('/status', auth.jwt(), controller.getStatus.bind(controller));
router.get('/:id', auth.jwt(), controller.get.bind(controller));

module.exports = router;
