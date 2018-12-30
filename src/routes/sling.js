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

router.use(auth.jwt());
router.use(async (ctx, next) => {
  if (ctx.request.method === 'POST') {
    ctx.text = await getRawBody(ctx.req);
    await next();
  }
});

router.get('/bKIvEvxhlH', controller.getFairplayCert.bind(controller));
router.post('/g1Ilryrq0i/:channelId', controller.processFairplayCert.bind(controller));
router.post('/yGsZQrFlUn', controller.processWidevine.bind(controller));
router.post('/tLnhgQIIu', controller.processPlayready.bind(controller));
router.get('/:channelId.mpd', controller.getStream.bind(controller));
router.get('/:channelId.m3u8', controller.getFairplayStream.bind(controller));
router.get('/:channelId/:quality.m3u8', controller.getFairplayVariant.bind(controller));
router.get('/disney/:brand', controller.getDisneyStream.bind(controller));
router.get('/:title/logo.png', controller.getLogo.bind(controller));
router.get('/schedule.json', controller.getScheduleJson.bind(controller));

module.exports = router;
