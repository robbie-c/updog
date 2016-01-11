#!/usr/bin/env bash

set -x
set -e

SERVER_NAME="web-2"
ROOT_DIR="/updog/"

gcloud compute ssh root@$SERVER_NAME "mkdir $ROOT_DIR"
gcloud compute copy-files scripts root@$SERVER_NAME:$ROOT_DIR
gcloud compute copy-files config root@$SERVER_NAME:$ROOT_DIR
gcloud compute ssh root@$SERVER_NAME bash $ROOT_DIR/scripts/google_new_machine_remote.sh
