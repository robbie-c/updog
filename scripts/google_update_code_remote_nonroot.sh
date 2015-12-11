#!/usr/bin/env bash

set -x

GIT_URL="ssh://git@bitbucket.org/robbie_c/updog.git"
ROOT_DIR="/updog/"
GIT_DIR="/updog/git"

cd $GIT_DIR

eval `ssh-agent -s`
ssh-add $ROOT_DIR/config/bitbucket/updog_readonly_rsa

git checkout .
git reset
git clean -f
git pull --rebase

source ~/.nvm/nvm.sh
nvm use 5.1.1

npm update
npm install

pm2 restart updog
