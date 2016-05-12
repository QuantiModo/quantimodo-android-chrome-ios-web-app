#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
PROJECT_ROOT=$PWD
ANDROID_KEYSTORE_PATH="/Users/Shared/Jenkins/Home/workspace/QM-Docker-Build/configs/android/quantimodo.keystore"

if [ -z "$1" ]
  then
    echo -e "${RED}Please provide lowercase app name as first parameter ${NC}"
else
    APP_NAME=$1
    echo -e "${RED}Lowercase app name is $APP_NAME ${NC}"
fi

if [ -z "$2" ]
  then
  echo -e "${RED}No ANDROID_KEYSTORE_PASSWORD first argument given to build_android_app.sh...${NC}"
else
    ANDROID_KEYSTORE_PASSWORD=$2
    echo -e "${RED}ANDROID_KEYSTORE_PASSWORD first argument given to build_app_extension.sh is $ANDROID_KEYSTORE_PASSWORD...${NC}"
fi

if [ -z "$3" ]
  then
    BUILD_PATH="${PROJECT_ROOT}/build"
else
    BUILD_PATH="$3"
fi

if [ ! -d "$ANDROID_HOME" ]
  then
  echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x ${NC}"
  exit
fi

if [ ! -d "$ANDROID_KEYSTORE_PASSWORD" ]
  then
  echo -e "${RED} ANDROID_KEYSTORE_PASSWORD doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
  exit
fi

if [ ! -d "$ANDROID_KEYSTORE_PATH" ]
  then
  echo -e "${RED} ANDROID_KEYSTORE_PATH doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
  exit
fi

### Build Android App ###
cd ${PROJECT_ROOT}
ionic state reset
rm -rf platforms/android
ionic platform remove android
ionic platform add android
ionic resources
cordova build --debug android >/dev/null
cordova build --release android >/dev/null
mkdir -p ${BUILD_PATH}/${APP_NAME}/android
cp -R platforms/android/build/outputs/apk/* ${BUILD_PATH}/${APP_NAME}/android
cd ${BUILD_PATH}/${APP_NAME}/android
# Sign the app
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${ANDROID_KEYSTORE_PATH} -storepass ${ANDROID_KEYSTORE_PASSWORD} android-release-unsigned.apk quantimodo >/dev/null
# Optimize apk
${ANDROID_HOME}/build-tools/23.0.1/zipalign 4 android-release-unsigned.apk ${APP_NAME}-signed.apk >/dev/null
${ANDROID_HOME}/build-tools/23.0.2/zipalign 4 android-release-unsigned.apk ${APP_NAME}-signed.apk >/dev/null
${ANDROID_HOME}/build-tools/22.0.1/zipalign 4 android-release-unsigned.apk ${APP_NAME}-signed.apk >/dev/null

echo "Android app is ready"
### Build Android App ###
