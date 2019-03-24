#!/usr/bin/env bash
if [[ -z ${BUILD_REPO} ]]; then export BUILD_REPO=${WORKSPACE}-last-build; fi
echo "Copying workspace to BUILD_REPO ${BUILD_REPO} in case you need to run in simulator for debugging"
mkdir ${BUILD_REPO} || true
EXCLUDE="--exclude {.git/,*.git}"
rsync -am --stats --no-perms --omit-dir-times --delete ${WORKSPACE}/ ${BUILD_REPO} ${EXCLUDE}