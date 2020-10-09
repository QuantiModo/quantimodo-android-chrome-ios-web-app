#!/usr/bin/env bash
set +x #Don't echo the NPM key

NPMRC_FILE=.npmrc
echo "YOU54F:registry=https://registry.npmjs.org/" > $NPMRC_FILE
echo "//registry.npmjs.org/:_authToken=${NPM_KEY}" >> $NPMRC_FILE
echo "//registry.npmjs.org/:username=quantimodo" >> $NPMRC_FILE
echo "//registry.npmjs.org/:email=mike@quantimo.do" >> $NPMRC_FILE
echo "//registry.npmjs.org/:always-auth=true" >> $NPMRC_FILE

set -x