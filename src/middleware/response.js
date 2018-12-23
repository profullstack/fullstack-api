/* eslint arrow-body-style: 'off' */
module.exports = app => {
  return app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });
};

