const Koa = require('koa');
const logger = require('koa-logger');
const https = require('https');
const fs = require('fs');
// const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const debugHttp = require('debug-http');
const mongo = require('koa-mongo');
// const DB = require('./db.mongo');
const Cache = require('./db.redis');
const routes = require('./routes');
// const router = require('koa-router');
// const websockify = require('koa-websocket');
const middleware = require('./middleware');
const conf = require('./conf');

debugHttp();
// const db = new DB();
const cache = new Cache();
// const api = router();
const app = new Koa();
// const socket = websockify(app);

app
  .use(cors({
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']
  }))
  .use(logger())
  .use(mongo({
    uri: conf.env.mongodb.url,
    max: 50000,
    min: 1
  }))
  .use(cache.connect);

middleware(app);
routes(app);

// api.get('/test', async (ctx, next) => {
//   ctx.websocket.send('Hello World');
//   ctx.websocket.on('message', function(message) {
//     console.log(message);
//   });
// });
//
// app.ws.use(api.routes()).use(api.allowedMethods());

// // response
// app.use(async (ctx) => {
//   ctx.body = 'Hello World'
// });

app.listen(process.env.PORT, () => console.warn(`server started http://localhost:${process.env.PORT} ${process.pid} pid`));

if (process.env.TORULA_USE_SSL) {
  const options = {
    key: fs.readFileSync('./sslcert/key.pem', 'utf8'),
    cert: fs.readFileSync('./sslcert/cert.pem', 'utf8')
  };
  https.createServer(options, app.callback()).listen(process.env.SSL_PORT);
}

module.exports = app;

