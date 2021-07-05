#!/usr/bin/env bash
set +x
#printenv
BRANCH_NAME=${BRANCH_NAME:-${TRAVIS_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${BUDDYBUILD_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${CIRCLE_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${GIT_BRANCH}}
COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s) && echo "
=====
Building
$COMMIT_MESSAGE
on branch: ${BRANCH_NAME}
====="
set -x

bundle install
bundle update

npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli
npm install -g ios-sim ios-deploy

bower install
npm install
#yarn install

bundle install
bundle update

fastlane add_plugin upgrade_super_old_xcode_project
fastlane add_plugin cordova
fastlane add_plugin ionic

cordova plugin rm cordova-plugin-console --save
cordova plugin rm cordova-plugin-mauron85-background-geolocation --save
cordova plugin rm phonegap-plugin-push --save # Need to update to Firebase

cordova platform rm ios
cordova platform add ios@4.5.2
