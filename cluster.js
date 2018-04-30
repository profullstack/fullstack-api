'use strict';

const argOpts = {
  alias: {
    c: 'capacity'
  },
  default: {
    capacity: 1
  }
};

const argv = require('minimist')(process.argv.slice(2), argOpts);
const cluster = require('cluster');
const numCPUs = Math.ceil(require('os').cpus().length * argv.capacity);

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  require('./index')
}

