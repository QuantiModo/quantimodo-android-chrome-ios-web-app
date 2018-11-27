#!/usr/bin/env bash
#printenv
BRANCH_NAME=${BRANCH_NAME:-${TRAVIS_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${BUDDYBUILD_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${CIRCLE_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${GIT_BRANCH}}
echo "BRANCH_NAME is ${BRANCH_NAME}"
set -x
sudo apt-get update && sudo apt-get install tree imagemagick
bundle install
bundle update
npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli
yarn install
gulp buildAllAndroidAppsWithCleaning
