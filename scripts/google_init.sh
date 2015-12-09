#!/usr/bin/env bash

set -x
set -e

PROJECT_NAME="updog-chatter"
ZONE="europe-west1-d"

gcloud config set project $PROJECT_NAME
gcloud config set compute/zone $ZONE
