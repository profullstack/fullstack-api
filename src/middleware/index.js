const response = require('./response');

exports default = app => {
  response(app);

  return app;
};
