const path = require('path');
const Router = require('koa-router');
const Auth = require('../middleware/authenticate');
const Filter = require('../middleware/filter');

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();
const router = new Router({ prefix: `/api/1/${name}` });
const auth = new Auth();
const filter = new Filter();

// router.use(auth.jwt());

router.get('/bKIvEvxhlH', controller.getFairplayCert.bind(controller));
router.post('/g1Ilryrq0i/:channelId', controller.processFairplayCert.bind(controller));
router.post('/yGsZQrFlUn', auth.jwt(), filter.ip.bind(filter), filter.active.bind(filter), controller.processWidevine.bind(controller));
router.post('/tLnhgQIIu', auth.jwt(), filter.ip.bind(filter), filter.active.bind(filter), controller.processPlayready.bind(controller));
router.get('/:channelId.mpd', auth.jwt(), filter.ip.bind(filter), filter.active.bind(filter), controller.getStream.bind(controller));
router.get('/:channelId.m3u8', controller.getFairplayStream.bind(controller));
router.get('/:channelId/:quality.m3u8', controller.getFairplayVariant.bind(controller));
router.get('/disney/:brand', auth.jwt(), controller.getDisneyStream.bind(controller));
router.get('/:title/logo.png', controller.getLogo.bind(controller));
router.get('/schedule.json', auth.jwt(), filter.ip.bind(filter), filter.active.bind(filter), controller.getScheduleJson.bind(controller));

module.exports = router;
