const path = require('path');
const glob = require('glob');

const filePath = path.resolve(__dirname, '**', '*.js');
const files = glob.sync(filePath).filter(f => f.indexOf('index.js') === -1);
/* eslint import/no-dynamic-require: 'off', global-require: 'off' */
const routes = files.map(file => require(file));

module.exports = app => {
  routes.forEach(route => {
    app.use(route.routes());
    app.use(route.allowedMethods());
  });

  return app;
};
