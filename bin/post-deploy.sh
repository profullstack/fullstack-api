#!/usr/bin/env bash

cd "$(dirname "$0")/.."
. .env
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v11

host=$FULLSTACK_HOST
name=$FULLSTACK_PATH
project=$FULLSTACK_PROJECt

node -v
npm -v

echo "current name: $name"

cd $HOME/www/${name}/${project}
npm i
if [[ $name == 'fullstack-dev' ]]; then
  npm run restart &
else
  npm run restart:production
fi
