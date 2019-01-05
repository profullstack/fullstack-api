#!/usr/bin/env bash

. .env
. $HOME/.bashrc

args=(-azvP --delete --exclude=node_modules --exclude=.idea --exclude=.git)
hosts=(toruladev) # tornado lightning thunder tundra jefferson
dry=() #add --dry-run to enable testing
user=$TORULA_USER
name=$TORULA_PATH
project=torula-backend

for host in "${hosts[@]}"
do
  echo ""
  date
  echo "---------------------"
  echo "syncing ${host}"
  echo "---------------------"
  rsync ${dry[@]} ${args[@]} ./ ${user}@${host}:www/${name}/${project}
  ssh -t ${user}@${host} \$HOME/www/${name}/${project}/bin/post-deploy.sh
done

version=$(jq -r .version package.json)
say "torula backend is live!"
exit
