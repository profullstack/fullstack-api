#!/usr/bin/env bash

cd "$(dirname "$0")/.."
. .env
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v11

host=$TORULA_HOST
name=$TORULA_PATH
project=$TORULA_PROJECT

node -v
npm -v

echo "current name: $name"

cd $HOME/www/${name}/${project}
npm i
if [[ $name == 'torula' ]]; then
  npm run restart:production
fi
