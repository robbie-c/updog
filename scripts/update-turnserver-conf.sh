#!/bin/bash

gcloud --project updog-chatter compute copy-files --zone europe-west1-d ./third_party/turnserver/turnserver.conf turn@turn-2:/etc/turnserver/turnserver.conf


