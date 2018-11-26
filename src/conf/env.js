module.exports = {
  production: {},

  development: {
    mongodb: {
      url: process.env.FULLSTACK_MONGODB_URL
    },
    rethinkdb: {
      host: process.env.FULLSTACK_RETHINKDB_HOST,
      port: process.env.FULLSTACK_RETHINKDB_PORT,
      url: process.env.FULLSTACK_RETHINKDB_DB
    },
    redis: {
      url: process.env.FULLSTACK_REDIS_URL
    }
  },

  test: {
    mongodb: {
      url: process.env.FULLSTACK_TEST_MONGODB_URL
    }
  }
};

