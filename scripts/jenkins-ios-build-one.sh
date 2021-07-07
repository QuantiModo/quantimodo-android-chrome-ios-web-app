#!/usr/bin/env bash
set +x
called=$_ && [[ ${called} != $0 ]] && echo "${BASH_SOURCE[@]} is being sourced" || echo "${0} is being run"
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}` && cd ${SCRIPT_FOLDER} && cd ..
if [[ -z ${APP_IDENTIFIER} ]]; then echo "Please specify APP_IDENTIFIER env" && exit 1; fi
if [[ -z ${APP_DISPLAY_NAME} ]]; then echo "Please specify APP_DISPLAY_NAME env" && exit 1; fi
if [[ -z ${QUANTIMODO_CLIENT_ID} ]]; then echo "Please specify APP_DISPLAY_NAME env" && exit 1; fi

source ${SCRIPT_FOLDER}/scripts/ios_install_dependencies.sh

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
source ${SCRIPT_FOLDER}/save_last_build_workspace.sh
