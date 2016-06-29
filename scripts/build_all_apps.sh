#!/bin/bash

export IONIC_APP_VERSION_NUMBER=1.6.0
export IONIC_IOS_APP_VERSION_NUMBER="1.6.0.0"

export RED='\033[0;31m'
export GREEN='\033[0;32m'
export NC='\033[0m' # No Color

SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd ${SCRIPT_FOLDER}
cd ..
export IONIC_PATH="$PWD"
echo "IONIC_PATH is $IONIC_PATH"
#cd ..
#mkdir qm-ionic-intermediates
#cd qm-ionic-intermediates
#export INTERMEDIATE_PATH="$PWD"
export INTERMEDIATE_PATH="$IONIC_PATH"
echo "INTERMEDIATE_PATH is $INTERMEDIATE_PATH"
if [ -z "$DROPBOX_PATH" ]
    then
        echo -e "${RED}ERROR: DROPBOX_PATH does not exist for build_all_apps.sh! Quitting! "
        exit 1
fi

if [ -z "$QM_DOCKER_PATH" ]
    then
        echo -e "${RED}ERROR: QM_DOCKER_PATH does not exist for build_all_apps.sh! Quitting! "
        exit 1
fi

export APP_PRIVATE_CONFIG_PATH="${QM_DOCKER_PATH}/configs/ionic/private_configs"
export BUILD_PATH="${IONIC_PATH}/build"
export LANG=en_US.UTF-8
export ENCRYPTION_SECRET=$ENCRYPTION_SECRET

### ANDROID CRAP ###
export ANDROID_KEYSTORE_PATH="$QM_DOCKER_PATH/configs/android/quantimodo.keystore"

### IOS CRAP ###
export TEAM_ID="YD2FK7S2S5"
export DEVELOPER_NAME="iPhone Distribution=Mike Sinn (YD2FK7S2S5)"
export PROFILE_NAME="028ab892-9a5e-4004-adac-b8472e760bdb"
export PROFILE_UUID="028ab892-9a5e-4004-adac-b8472e760bdb"
export DELIVER_USER="ios@quantimodo.com"
export FASTLANE_USER="ios@quantimodo.com"
export FASTLANE_PASSWORD=$FASTLANE_PASSWORD
export DELIVER_PASSWORD=$DELIVER_PASSWORD
export DELIVER_WHAT_TO_TEST="Test the basics of the app and see if something breaks!"
export KEY_PASSWORD=$KEY_PASSWORD

if [ -z "$ANDROID_HOME" ]
  then
    export ANDROID_HOME="/Users/Shared/Jenkins/Library/Android/sdk"
  # echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x "
  # exit
fi
echo "ANDROID_HOME is $ANDROID_HOME"

if [ -z "$ANDROID_BUILD_TOOLS" ]
  then
    export ANDROID_BUILD_TOOLS="${ANDROID_HOME}/build-tools/23.0.3"
  # echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x "
  # exit
fi
echo "ANDROID_BUILD_TOOLS is $ANDROID_BUILD_TOOLS"

if [ -z "$ANDROID_KEYSTORE_PASSWORD" ]
  then
  echo -e "${RED}ERROR: ANDROID_KEYSTORE_PASSWORD does not exist for build_all_apps.sh! Quitting! "
  exit 1
fi

#echo "Copying everything from ${IONIC_PATH} to $INTERMEDIATE_PATH"
#rsync -a --exclude=build/ --exclude=.git/ ${IONIC_PATH}/* ${INTERMEDIATE_PATH}
cd ${INTERMEDIATE_PATH}
#npm install -g bower
bower install
ionic config build

if [ -f ${INTERMEDIATE_PATH}/www/lib/angular/angular.js ];
then
   echo echo "Dependencies installed via bower"
else
   echo "ERROR: Dependencies not installed! Build FAILED"
   exit 1
fi

#source ${IONIC_PATH}/scripts/build_scripts/00_install_dependencies.sh

export APPLE_ID="1115037060"
export APP_IDENTIFIER="com.quantimodo.quantimodo"
export APP_DISPLAY_NAME="QuantiModo"
export LOWERCASE_APP_NAME=quantimodo
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh
#source ${INTERMEDIATE_PATH}/04_reset_workspace.sh

export APPLE_ID="1046797567"
export APP_IDENTIFIER="com.quantimodo.moodimodoapp"
export APP_DISPLAY_NAME="MoodiModo"
export LOWERCASE_APP_NAME=moodimodo
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh
#source ${INTERMEDIATE_PATH}/04_reset_workspace.sh

if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-android-release-signed.apk ];
then
   echo echo "${LOWERCASE_APP_NAME} Android app is ready in $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
else
   echo "ERROR: File ${LOWERCASE_APP_NAME}-android-release-signed.apk does not exist. Build FAILED"
   exit 1
fi

export APPLE_ID="1024924226"
export APP_IDENTIFIER="com.quantimodo.moodimodo"
export APP_DISPLAY_NAME="Mind First"
export LOWERCASE_APP_NAME=mindfirst
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-android-release-signed.apk ];
then
   echo echo "${LOWERCASE_APP_NAME} Android app is ready in $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
else
   echo "ERROR: File ${LOWERCASE_APP_NAME}-android-release-signed.apk does not exist. Build FAILED"
   exit 1
fi

export APPLE_ID="1115037652"
export APP_IDENTIFIER="com.quantimodo.energymodo"
export APP_DISPLAY_NAME="EnergyModo"
export LOWERCASE_APP_NAME=energymodo
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-android-release-signed.apk ];
then
   echo echo "${LOWERCASE_APP_NAME} Android app is ready in $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
else
   echo "ERROR: File ${LOWERCASE_APP_NAME}-android-release-signed.apk does not exist. Build FAILED"
   exit 1
fi

export APPLE_ID="1115037661"
export APP_IDENTIFIER="com.quantimodo.medtlc"
export APP_DISPLAY_NAME="MedTLC"
export LOWERCASE_APP_NAME=medtlc
source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
#source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-android-release-signed.apk ];
then
   echo echo "${LOWERCASE_APP_NAME} Android app is ready in $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
else
   echo "ERROR: File $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-android-release-signed.apk does not exist. Build FAILED"
   exit 1
fi

sudo chmod -R 777 ${DROPBOX_PATH}/QuantiModo/apps

exit 0
