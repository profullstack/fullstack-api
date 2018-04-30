const env = require('./env');

module.exports = {
  env: env[process.env.NODE_ENV || 'development']
};

