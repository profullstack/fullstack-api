const path = require('path');
const Router = require('koa-router');
const Auth = require('../middleware/authenticate');
const getRawBody = require('raw-body');

const name = path.basename(__filename, '.js');

/* eslint import/no-dynamic-require: 'off' */
const Controller = require(`../controllers/${name}`);
const controller = new Controller();
const router = new Router({ prefix: `/api/1/${name}` });
const auth = new Auth();

// router.use(auth.jwt());
router.use(async (ctx, next) => {
  if (ctx.request.method === 'POST') {
    ctx.text = await getRawBody(ctx.req);
  }
  await next();
});

router.get('/bKIvEvxhlH', auth.jwt(), controller.getFairplayCert.bind(controller));
router.post('/g1Ilryrq0i/:channelId', auth.jwt(), controller.processFairplayCert.bind(controller));
router.post('/yGsZQrFlUn', auth.jwt(), controller.processWidevine.bind(controller));
router.post('/tLnhgQIIu', auth.jwt(), controller.processPlayready.bind(controller));
router.get('/:channelId.mpd', auth.jwt(), controller.getStream.bind(controller));
router.get('/:channelId.m3u8', controller.getFairplayStream.bind(controller));
router.get('/:channelId/:quality.m3u8', controller.getFairplayVariant.bind(controller));
router.get('/disney/:brand', auth.jwt(), controller.getDisneyStream.bind(controller));
router.get('/:title/logo.png', auth.jwt(), controller.getLogo.bind(controller));
router.get('/schedule.json', auth.jwt(), controller.getScheduleJson.bind(controller));

module.exports = router;
