#!/usr/bin/env bash
set +x
called=$_ && [[ ${called} != $0 ]] && echo "${BASH_SOURCE[@]} is being sourced" || echo "${0} is being run"
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}` && cd ${SCRIPT_FOLDER} && cd ..

source ${SCRIPT_FOLDER}/ios_install_dependencies.sh

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

source ${SCRIPT_FOLDER}/save_last_build_workspace.sh
