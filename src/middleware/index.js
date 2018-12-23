const response = require('./response');

module.exports = app => {
  response(app);

  return app;
};
