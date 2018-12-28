#!/usr/bin/env bash

# load node v6
cd "$(dirname "$0")/.."
. .env
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v11

host=$TORULA_HOST
name=$TORULA_PATH
project=torula-backend

node -v
npm -v

echo "current name: $name"

cd $HOME/www/${name}/${project}
npm i
if [[ $name == 'torula-dev' ]]; then
  npm run restart &
else
  npm run restart:production
fi
