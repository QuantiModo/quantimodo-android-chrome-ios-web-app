#!/bin/bash

export RED='\033[0;31m'
export GREEN='\033[0;32m'
export NC='\033[0m' # No Color
export IONIC_PATH="$PWD"
export VERSION_NUMBER="1.2.0"
export DROPBOX_PATH=/Users/Shared/Jenkins/Dropbox/QuantiModo/apps
export ANDROID_KEYSTORE_PATH="/Users/Shared/Jenkins/Home/workspace/QM-Docker-Build/configs/android/quantimodo.keystore"
export QM_DOCKER_PATH="/Users/Shared/Jenkins/Home/workspace/QM-Docker-Build"
export IMAGES_SCRIPT=${IONIC_PATH}/scripts/create_icons.sh
export APP_PRIVATE_CONFIG_PATH="${QM_DOCKER_PATH}/configs/ionic"
export BUILD_PATH="${IONIC_PATH}/build"
export INTERMEDIATE_PATH="${IONIC_PATH}/build/intermediate"
mkdir ${INTERMEDIATE_PATH}
export LANG=en_US.UTF-8
export TEAM_ID="YD2FK7S2S5"
export DEVELOPER_NAME="iPhone Distribution=Mike Sinn (YD2FK7S2S5)"
export PROFILE_NAME="028ab892-9a5e-4004-adac-b8472e760bdb"
export PROFILE_UUID="028ab892-9a5e-4004-adac-b8472e760bdb"
export APP_UPLOAD_BRANCH="app/moodimodo"
export DELIVER_USER="ios@quantimodo.com"
export FASTLANE_USER="ios@quantimodo.com"
export ENCRYPTION_SECRET=$ENCRYPTION_SECRET
export KEY_PASSWORD=$KEY_PASSWORD
export FASTLANE_PASSWORD=$FASTLANE_PASSWORD
export DELIVER_PASSWORD=$DELIVER_PASSWORD

if [ -z "$ANDROID_HOME" ]
  then
    export ANDROID_HOME="/Users/Shared/Jenkins/Library/Android/sdk"
  # echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x "
  # exit
fi
echo "ANDROID_HOME is $ANDROID_HOME"

if [ -z "$ANDROID_KEYSTORE_PASSWORD" ]
  then
  echo -e "${RED} ANDROID_KEYSTORE_PASSWORD does not exist for build_all_apps.sh! Quitting! "
  exit
fi
echo "ANDROID_KEYSTORE_PASSWORD is $ANDROID_KEYSTORE_PASSWORD"

echo "Copying everything from ${IONIC_PATH} to $INTERMEDIATE_PATH"
rsync -a --exclude=build/ --exclude=.git/ --exclude=platforms/ --exclude=node_modules/ --exclude=plugins/ ${IONIC_PATH}/* ${INTERMEDIATE_PATH}
cd ${INTERMEDIATE_PATH}

#source ${IONIC_PATH}/scripts/build_scripts/00_install_dependencies.sh

export APP_NAME=moodimodo
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh
#source ${INTERMEDIATE_PATH}/04_reset_workspace.sh

export APP_NAME=mindfirst
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

export APP_NAME=energymodo
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

export APP_NAME=medtlc
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh
