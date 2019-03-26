#!/usr/bin/env bash
called=$_ && [[ ${called} != $0 ]] && echo "${BASH_SOURCE[@]} is being sourced" || echo "${0} is being run"
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}` && cd ${SCRIPT_FOLDER}&& cd .. && export QM_API="$PWD"
if [[ -z ${APP_IDENTIFIER} ]]; then echo "Please specify APP_IDENTIFIER env" && exit 1; fi
if [[ -z ${APP_DISPLAY_NAME} ]]; then echo "Please specify APP_DISPLAY_NAME env" && exit 1; fi
if [[ -z ${QUANTIMODO_CLIENT_ID} ]]; then echo "Please specify APP_DISPLAY_NAME env" && exit 1; fi
BRANCH_NAME=${BRANCH_NAME:-${TRAVIS_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${BUDDYBUILD_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${CIRCLE_BRANCH}}
BRANCH_NAME=${BRANCH_NAME:-${GIT_BRANCH}}
COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s) && echo "===== Building $COMMIT_MESSAGE on ${BRANCH_NAME} ====="
set -x
bundle install
bundle update
# npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli  # Too slow to do every time!
# yarn install # Fresh one takes 12 minutes on OSX
bower install
npm install
fastlane add_plugin upgrade_super_old_xcode_project
fastlane add_plugin cordova
fastlane add_plugin ionic
cordova plugin rm cordova-plugin-console --save
cordova plugin rm cordova-plugin-mauron85-background-geolocation --save
cordova platform rm ios
cordova platform add ios@4.5.2
if [[ ${BRANCH_NAME} = *"develop"* || ${BRANCH_NAME} = *"master"* ]];
    then
        #gulp prepare-ios-app-without-cleaning;
        gulp build-ios-app-without-cleaning; # Need to use build in case we don't have platform folder yet
        fastlane deploy;
    else
        gulp build-ios-app-without-cleaning;
fi
if [[ ${QUANTIMODO_CLIENT_ID} = *"moodimodoapp"* ]];
    then
        gulp cordova-hcp-deploy
    else
        echo "CHCP deploy should be done in Android build"
fi
cd platforms/ios/cordova && npm install ios-sim@latest && cd ../../..
ionic emulate ios
source ${WORKSPACE}/scripts/save_last_build_workspace.sh