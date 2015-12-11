#!/usr/bin/env bash

set -x

NONROOT_USER="updog"
ROOT_DIR="/updog/"

su - $NONROOT_USER $ROOT_DIR/scripts/google_update_code_remote_nonroot.sh
