#!/usr/bin/env bash

set -x
set -e

ROOT_DIR="/updog/"
NONROOT_USER="updog"

cd $ROOT_DIR

apt-get update
apt-get install -y git build-essential libssl-dev curl

adduser --disabled-password --gecos "" $NONROOT_USER

chown -R $NONROOT_USER $ROOT_DIR

su - $NONROOT_USER $ROOT_DIR/scripts/google_new_machine_remote_nonroot.sh
