#!/usr/bin/env bash

set -x

GIT_URL="ssh://git@bitbucket.org/robbie_c/updog.git"
ROOT_DIR="/updog/"
GIT_DIR="/updog/git"

cd $ROOT_DIR

eval `ssh-agent -s`
ssh-add $ROOT_DIR/config/bitbucket/updog_readonly_rsa
mkdir -p ~/.ssh/
cat $ROOT_DIR/config/bitbucket/known_hosts >> ~/.ssh/known_hosts

git clone $GIT_URL $GIT_DIR

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 5.1.1

npm install -g pm2

cd $GIT_DIR
npm update
npm install

cd $GIT_DIR
NODE_ENV=production pm2 start $GIT_DIR/src/runServer.js --name updog
