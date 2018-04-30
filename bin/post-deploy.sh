#!/usr/bin/env bash

# load node
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v10

production=$FULLSTACK_PRODUCTION_HOST
host=$(hostname)
name=fullstack
project=fullstack-api

node -v
npm -v

echo "current host: $host production: $production"

if [[ $host == "$production" ]]; then
  cd $HOME/www/${name}/${project}
  #npm i -f fullstack-providers
  npm i
  #  pm2 restart
  . $HOME/.bashrc
  npm run restart:production
fi
