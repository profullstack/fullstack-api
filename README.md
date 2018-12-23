# torula-backend

Fullstack API starter kit with Koa, rethinkdb and websockets.

## install
	
	git clone <url>
	npm i
	npm start

## production

    # locally
    ./bin/deploy.sh
    
    # on server
    npm run start:production

## generate certs

Self-signed certs:

    ./bin/certs

## requirements

MacOS:

	- xcode is required (see App Store)

## env

    # rethinkdb
    FULLSTACK_RETHINKDB_HOST=localhost
    FULLSTACK_RETHINKDB_PORT=28015
    FULLSTACK_RETHINKDB_DB=fullstack
    
    # mongodb
    FULLSTACK_MONGODB_URL=mongodb://localhost:27017/fullstack
    
    # redis
    FULLSTACK_REDIS_URL=redis://localhost:6379/fullstack
    
    # other
    FULLSTACK_API_SHARED_SECRET=fullstackSharedSecretDoNotCommit
    FULLSTACK_PRODUCTION_HOST=slots
    FULLSTACK_NODE_ENV=production
