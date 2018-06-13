#!/usr/bin/env bash
export LAST_BUILD=${WORKSPACE}-last-build
echo "Copying workspace to ${LAST_BUILD} in case you need to run in simulator for debugging"
mkdir ${LAST_BUILD} || true
EXCLUDE="--exclude {.git/,*.git}"
rsync -am --stats --no-perms --omit-dir-times --delete ${WORKSPACE}/ ${LAST_BUILD} ${EXCLUDE}