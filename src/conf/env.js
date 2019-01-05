module.exports = {
  production: {
    mongodb: {
      url: process.env.TORULA_MONGODB_URL
    },
    rethinkdb: {
      host: process.env.TORULA_RETHINKDB_HOST,
      port: process.env.TORULA_RETHINKDB_PORT,
      url: process.env.TORULA_RETHINKDB_DB
    },
    redis: {
      url: process.env.TORULA_REDIS_URL
    }
  },

  development: {
    mongodb: {
      url: process.env.TORULA_MONGODB_URL
    },
    rethinkdb: {
      host: process.env.TORULA_RETHINKDB_HOST,
      port: process.env.TORULA_RETHINKDB_PORT,
      url: process.env.TORULA_RETHINKDB_DB
    },
    redis: {
      url: process.env.TORULA_REDIS_URL
    }
  },

  test: {
    mongodb: {
      url: process.env.TORULA_MONGODB_URL
    },
    redis: {
      url: process.env.TORULA_REDIS_URL
    }
  }
};

