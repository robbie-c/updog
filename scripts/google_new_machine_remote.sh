#!/usr/bin/env bash

set -x

ROOT_DIR="/updog/"
NONROOT_USER="updog"
DOMAIN="updog.gg"
LE_TEMP="$ROOT_DIR/letsencrypt-auto"

cd $ROOT_DIR

apt-get update
apt-get install -y git build-essential libssl-dev curl libkrb5-dev nginx

cp /updog/config/nginx/nginx_letsencrypt.conf /etc/nginx/nginx.conf
nginx -s reload

cd $ROOT_DIR
git clone https://github.com/letsencrypt/letsencrypt
cd $ROOT_DIR/letsencrypt
mkdir -p $LE_TEMP
./letsencrypt-auto certonly --server https://acme-v01.api.letsencrypt.org/directory -a webroot --webroot-path=$LE_TEMP -d $DOMAIN

cp /updog/config/nginx/nginx.conf /etc/nginx/nginx.conf
nginx -s reload

adduser --disabled-password --gecos "" $NONROOT_USER

chown -R $NONROOT_USER $ROOT_DIR

su - $NONROOT_USER $ROOT_DIR/scripts/google_new_machine_remote_nonroot.sh
