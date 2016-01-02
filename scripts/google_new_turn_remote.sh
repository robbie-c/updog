#!/usr/bin/env bash

set -x
set -e

ROOT_DIR="/updog/"
NONROOT_USER="updog"

apt-get update
apt-get install -y coturn

cp $ROOT_DIR/config/turnserver/turnserver.conf /etc/turnserver.conf

turnserver --daemon
