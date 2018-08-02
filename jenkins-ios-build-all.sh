#!/usr/bin/env bash
#printenv
BRANCH_NAME=${BRANCH_NAME:-${TRAVIS_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${BUDDYBUILD_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${CIRCLE_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${GIT_BRANCH}}
COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s) && echo "===== Building $COMMIT_MESSAGE on ${BRANCH_NAME} ====="
set -x
bundle install
bundle update
npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli
cordova platform rm ios
cordova platform add ios@4.5.2
cordova plugin rm cordova-plugin-console --save
yarn install
fastlane add_plugin upgrade_super_old_xcode_project
fastlane add_plugin cordova
fastlane add_plugin ionic

gulp prepareMediModoIos
export APP_IDENTIFIER=com.quantimodo.medimodo
export APP_DISPLAY_NAME=MediModo
export QUANTIMODO_CLIENT_ID=medimodo
if [[ ${BRANCH_NAME} = *"develop"* || ${BRANCH_NAME} = *"master"* ]]; then fastlane deploy; else gulp build-ios-app; fi

gulp prepareMoodiModoIos
export APP_IDENTIFIER=com.quantimodo.moodimodoapp
export APP_DISPLAY_NAME=MoodiModo
export QUANTIMODO_CLIENT_ID=moodimodoapp
if [[ ${BRANCH_NAME} = *"develop"* || ${BRANCH_NAME} = *"master"* ]]; then fastlane deploy; else gulp build-ios-app; fi

gulp prepareQuantiModoIos
export APP_IDENTIFIER=com.quantimodo.quantimodo
export APP_DISPLAY_NAME=QuantiModo
export QUANTIMODO_CLIENT_ID=quantimodo
if [[ ${BRANCH_NAME} = *"develop"* || ${BRANCH_NAME} = *"master"* ]]; then fastlane deploy; else gulp build-ios-app; fi

source ${WORKSPACE}/scripts/save_last_build_workspace.sh