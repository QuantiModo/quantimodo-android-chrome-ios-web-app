#!/bin/bash

export IONIC_APP_VERSION_NUMBER=2.0.6
export IONIC_IOS_APP_VERSION_NUMBER="2.0.6.0"

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
export ENCRYPTION_SECRET=${ENCRYPTION_SECRET}

### ANDROID CRAP ###
export ANDROID_KEYSTORE_PATH="$QM_DOCKER_PATH/configs/android/quantimodo.keystore"

### IOS CRAP ###
export TEAM_ID="YD2FK7S2S5"
export DEVELOPER_NAME="iPhone Distribution=Mike Sinn (YD2FK7S2S5)"
export PROFILE_NAME="match_AppStore_comquantimodomoodimodoapp"
export PROFILE_UUID="cd6448f6-e30d-4d74-8413-58f96a770671"
export DELIVER_USER="ios@quantimodo.com"
export FASTLANE_USER="ios@quantimodo.com"
export FASTLANE_PASSWORD=${FASTLANE_PASSWORD}
export DELIVER_PASSWORD=${DELIVER_PASSWORD}
export DELIVER_WHAT_TO_TEST="Test the basics of the app and see if something breaks!"
export KEY_PASSWORD=${KEY_PASSWORD}

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

echo "ionic state reset"
ionic state reset

echo "cordova plugin rm phonegap-facebook-plugin for $LOWERCASE_APP_NAME Android app..."
cordova plugin rm phonegap-facebook-plugin || true
echo "cordova plugin rm cordova-plugin-facebook4 for $LOWERCASE_APP_NAME Android app..."
cordova plugin rm cordova-plugin-facebook4 || true
echo "rm -rf ../fbplugin for $LOWERCASE_APP_NAME Android app..."
rm -rf ../fbplugin
#echo "gulp addFacebookPlugin for $LOWERCASE_APP_NAME Android app..."
#gulp addFacebookPlugin
echo "cordova plugin add cordova-plugin-facebook4 APP_ID=${FACEBOOK_APP_ID} APP_NAME=${FACEBOOK_APP_NAME} for $LOWERCASE_APP_NAME Android app..."
cordova plugin add cordova-plugin-facebook4@1.7.1 --save --variable APP_ID="${FACEBOOK_APP_ID}" --variable APP_NAME="${FACEBOOK_APP_NAME}"

#echo "gulp addFacebookPlugin for $LOWERCASE_APP_NAME Android app..."
#gulp addGooglePlusPlugin

echo "cordova plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git REVERSED_CLIENT_ID=${REVERSED_CLIENT_ID} for $LOWERCASE_APP_NAME Android app..."
cordova plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git --variable REVERSED_CLIENT_ID=${REVERSED_CLIENT_ID}

#echo "cordova plugin add cordova-fabric-plugin --variable FABRIC_API_KEY=${FABRIC_API_KEY} --variable FABRIC_API_SECRET=${FABRIC_API_SECRET} for $LOWERCASE_APP_NAME Android app..."
#cordova plugin add cordova-fabric-plugin --variable FABRIC_API_KEY=${FABRIC_API_KEY} --variable FABRIC_API_SECRET=${FABRIC_API_SECRET}

echo "cordova plugin add cordova-fabric-plugin -–variable FABRIC_API_KEY=${FABRIC_API_KEY} –-variable FABRIC_API_SECRET=${FABRIC_API_SECRET} for $LOWERCASE_APP_NAME Android app..."
cordova plugin add cordova-fabric-plugin -–variable FABRIC_API_KEY=${FABRIC_API_KEY} –-variable FABRIC_API_SECRET=${FABRIC_API_SECRET}

source ${IONIC_PATH}/scripts/build_scripts/push_plugin_install.sh

echo "ionic browser add crosswalk@12.41.296.5"
ionic browser add crosswalk@12.41.296.5

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
export APP_DESCRIPTION=Perfect your life
echo "Cannot use exclamation point in app description"

if [ -z ${BUILD_QUANTIMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk ];
        then
           echo echo "${LOWERCASE_APP_NAME} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1046797567"
export APP_IDENTIFIER="com.quantimodo.moodimodoapp"
export APP_DISPLAY_NAME="MoodiModo"
export LOWERCASE_APP_NAME=moodimodo
export APP_DESCRIPTION=Track and find out what affects your mood

if [ -z ${BUILD_MOODIMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk ];
        then
           echo echo "${LOWERCASE_APP_NAME} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1024924226"
export APP_IDENTIFIER="com.quantimodo.mindfirst"
export APP_DISPLAY_NAME=MindFirst
echo "Replace doesn't work if there's a space"
export LOWERCASE_APP_NAME=mindfirst
export APP_DESCRIPTION=Empowering a New Approach to Mind Research

if [ -z ${BUILD_MINDFIRST} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk ];
        then
           echo echo "${LOWERCASE_APP_NAME} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1115037652"
export APP_IDENTIFIER="com.quantimodo.energymodo"
export APP_DISPLAY_NAME="EnergyModo"
export LOWERCASE_APP_NAME=energymodo
export APP_DESCRIPTION=Track and find out what affects your energy levels

if [ -z ${BUILD_ENERGYMODO} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk ];
        then
           echo echo "${LOWERCASE_APP_NAME} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

export APPLE_ID="1115037661"
export APP_IDENTIFIER="com.quantimodo.medtlcapp"
export APP_DISPLAY_NAME="MedTLC"
export LOWERCASE_APP_NAME=medtlc
export APP_DESCRIPTION=Medication Track Learn Connect

if [ -z ${BUILD_MEDTLC} ];
    then
        echo "NOT BUILDING ${APP_DISPLAY_NAME}"
    else
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/01_prepare_project.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/03_build_android.sh
        source ${INTERMEDIATE_PATH}/scripts/build_scripts/02_build_chrome.sh
        #source ${INTERMEDIATE_PATH}/scripts/build_scripts/04_build_ios.sh

        # We do this at this higher level so Jenkins can detect the exit code
        if [ -f ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk ];
        then
           echo echo "${LOWERCASE_APP_NAME} Android app is ready in ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk"
        else
           echo "ERROR: File ${DROPBOX_PATH}/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${LOWERCASE_APP_NAME}-android-armv7-release-signed.apk does not exist. Build FAILED"
           exit 1
        fi
fi

sudo chmod -R 777 ${DROPBOX_PATH}/QuantiModo/apps

exit 0
