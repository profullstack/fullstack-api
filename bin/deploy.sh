#!/usr/bin/env bash

args=(-azvP --delete --exclude=node_modules --exclude=.idea --exclude=.git)
hosts=(cubs) # tornado lightning thunder tundra jefferson
dry=() #add --dry-run to enable testing
name=fullstack
project=fullstack-api

for host in "${hosts[@]}"
do
  echo ""
  date
  echo "---------------------"
  echo "syncing ${host}"
  echo "---------------------"
  rsync ${dry[@]} ${args[@]} ./ ${name}@${host}:www/${name}/${project}
  ssh -t ${name}@${host} \$HOME/www/${name}/${project}/bin/post-deploy.sh
done

version=$(jq -r .version package.json)
say "fullstack API is live!"
exit
