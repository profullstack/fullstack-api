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
		}
  },

  test: {}
};

