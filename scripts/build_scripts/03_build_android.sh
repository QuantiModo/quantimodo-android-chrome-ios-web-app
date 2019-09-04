#!/bin/bash

sudo chmod -R 777 ${DROPBOX_PATH}
mkdir "$DROPBOX_PATH/QuantiModo/apps/$QUANTIMODO_CLIENT_ID"  || true

echo "Removing old ${QUANTIMODO_CLIENT_ID} Android versions to archive so we catch build failures"
rm ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}/android/*.apk

if [ -z "$QUANTIMODO_CLIENT_ID" ]
  then
    echo -e "${RED}build_android.sh: Please provide lowercase QUANTIMODO_CLIENT_ID ${NC}"
    exit 1
fi

if [ -z "$IONIC_PATH" ]
  then
    echo -e "${RED}build_android.sh: Please provide lowercase IONIC_PATH ${NC}"
    exit 1
fi

if [ -z "$BUILD_PATH" ]
    then
        echo -e "${RED}build_android.sh: No BUILD_PATH!${NC}"
        exit 1
fi

if [ ! -d "$ANDROID_BUILD_TOOLS" ]
    then
        echo -e "${RED}build_android.sh: ANDROID_BUILD_TOOLS directory $ANDROID_BUILD_TOOLS does not exist! Please update env!${NC}"
        exit 1
fi

echo -e "${GREEN}build_android.sh: BUILD_PATH is ${BUILD_PATH}...${NC}"

if [ -z "${ANDROID_HOME}" ]
    then
        echo -e "${RED}build_android.sh: ANDROID_HOME variable not set. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x ${NC}"
        exit 1
    else
        echo -e "${GREEN}build_android.sh: Android home is $ANDROID_HOME ${NC}"
fi

echo -e "${GREEN}build_android.sh: ANDROID_KEYSTORE_PASSWORD second argument given is ${ANDROID_KEYSTORE_PASSWORD}...${NC}"
if [ -z "${ANDROID_KEYSTORE_PASSWORD}" ]
  then
      echo -e "${RED}build_android.sh: ANDROID_KEYSTORE_PASSWORD doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit 1
fi

if [ -z "${ANDROID_KEYSTORE_PATH}" ]
    then
      echo -e "${RED}build_android.sh: ANDROID_KEYSTORE_PATH doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit 1
fi

if [ -z "${ANDROID_DEBUG_KEYSTORE_PATH}" ]
    then
      echo -e "${RED}build_android.sh: ANDROID_DEBUG_KEYSTORE_PATH doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit 1
fi

if [ -z "${FACEBOOK_APP_ID}" ]
    then
      echo -e "${RED}build_android.sh: FACEBOOK_APP_ID doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit 1
fi

if [ -z "${FACEBOOK_APP_NAME}" ]
    then
      echo -e "${RED}build_android.sh: FACEBOOK_APP_NAME doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit 1
fi

if [ -z "${REVERSED_CLIENT_ID}" ]
    then
      echo -e "${RED}build_android.sh: REVERSED_CLIENT_ID doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit 1
fi


echo -e "${GREEN}build_android.sh: INTERMEDIATE_PATH is ${INTERMEDIATE_PATH}...${NC}"

### Build Android App ###
cd ${INTERMEDIATE_PATH}
#echo "ionic state reset for $QUANTIMODO_CLIENT_ID Android app..."
#ionic state reset
echo "deleting platforms/android for $QUANTIMODO_CLIENT_ID Android app..."
rm -rf platforms/android
echo "ionic platform remove android for $QUANTIMODO_CLIENT_ID Android app..."
ionic platform remove android

gulp setIonicAppId

echo "ionic platform add android@8.0.0 for $QUANTIMODO_CLIENT_ID Android app..."
ionic platform add android@8.0.0

source ${IONIC_PATH}/scripts/create_icons.sh

ionic info
java -version
#echo "ionic browser rm crosswalk"
#ionic browser rm crosswalk
#cordova build --debug android >/dev/null
#cordova build --release android >/dev/null

#echo "ionic browser add crosswalk@12.41.296.5"
#ionic browser add crosswalk@12.41.296.5
cordova build --debug android >/dev/null
cordova build --release android

mkdir -p ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}/android
cp -R platforms/android/build/outputs/apk/* ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}/android

UNSIGNED_APK_FILENAME="android-release-unsigned.apk"
SIGNED_APK_FILENAME=${QUANTIMODO_CLIENT_ID}-android-release-signed.apk
ALIAS=quantimodo

UNSIGNED_DEBUG_APK_FILENAME="android-debug-unaligned.apk"
SIGNED_DEBUG_APK_FILENAME=${QUANTIMODO_CLIENT_ID}-android-debug-signed.apk
ANDROID_DEBUG_KEYSTORE_PASSWORD=android
DEBUG_ALIAS=androiddebugkey

export UNSIGNED_GENERIC_APK_FILENAME=${UNSIGNED_DEBUG_APK_FILENAME}
export ANDROID_GENERIC_KEYSTORE_PATH=${ANDROID_DEBUG_KEYSTORE_PATH}
export ANDROID_GENERIC_KEYSTORE_PASSWORD=${ANDROID_DEBUG_KEYSTORE_PASSWORD}
export GENERIC_ALIAS=${DEBUG_ALIAS}
export SIGNED_GENERIC_APK_FILENAME=${SIGNED_DEBUG_APK_FILENAME}
#source ${IONIC_PATH}/scripts/build_scripts/android_sign.sh

#export UNSIGNED_GENERIC_APK_FILENAME="android-armv7-debug-unaligned.apk"
export UNSIGNED_GENERIC_APK_FILENAME="android-armv7-debug.apk"
export SIGNED_GENERIC_APK_FILENAME=${QUANTIMODO_CLIENT_ID}-android-armv7-debug-signed.apk
source ${IONIC_PATH}/scripts/build_scripts/android_sign.sh

#export UNSIGNED_GENERIC_APK_FILENAME="android-x86-debug-unaligned.apk"
export UNSIGNED_GENERIC_APK_FILENAME="android-x86-debug.apk"
export SIGNED_GENERIC_APK_FILENAME=${QUANTIMODO_CLIENT_ID}-android-x86-debug-signed.apk
source ${IONIC_PATH}/scripts/build_scripts/android_sign.sh

export UNSIGNED_GENERIC_APK_FILENAME=${UNSIGNED_APK_FILENAME}
export ANDROID_GENERIC_KEYSTORE_PATH=${ANDROID_KEYSTORE_PATH}
export ANDROID_GENERIC_KEYSTORE_PASSWORD=${ANDROID_KEYSTORE_PASSWORD}
export GENERIC_ALIAS=${ALIAS}
export SIGNED_GENERIC_APK_FILENAME=${SIGNED_APK_FILENAME}
#source ${IONIC_PATH}/scripts/build_scripts/android_sign.sh

export UNSIGNED_GENERIC_APK_FILENAME="android-armv7-release-unsigned.apk"
export SIGNED_GENERIC_APK_FILENAME=${QUANTIMODO_CLIENT_ID}-android-armv7-release-signed.apk
source ${IONIC_PATH}/scripts/build_scripts/android_sign.sh

export UNSIGNED_GENERIC_APK_FILENAME="android-x86-release-unsigned.apk"
export SIGNED_GENERIC_APK_FILENAME=${QUANTIMODO_CLIENT_ID}-android-x86-release-signed.apk
source ${IONIC_PATH}/scripts/build_scripts/android_sign.sh

if [ -f "$DROPBOX_PATH/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${SIGNED_GENERIC_APK_FILENAME}" ];
then
    cd ${INTERMEDIATE_PATH}
    COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s)
    echo "Deploying with note: $COMMIT_MESSAGE"
    echo "ionic upload --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD} --note "$COMMIT_MESSAGE" --deploy staging"
    ionic upload --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD} --note "$COMMIT_MESSAGE" --deploy staging
    #ionic package build android --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
    #ionic package build android --release --profile production --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
    #ionic package build ios --release --profile production --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
    echo echo "${SIGNED_GENERIC_APK_FILENAME} is ready in $DROPBOX_PATH/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/android/${SIGNED_GENERIC_APK_FILENAME}"
else
   echo "ERROR: File ${SIGNED_GENERIC_APK_FILENAME} does not exist. Build FAILED"
   exit 1
fi

#cp -R ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}/* "$DROPBOX_PATH/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/"
#rsync ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}/* "$DROPBOX_PATH/QuantiModo/apps/${QUANTIMODO_CLIENT_ID}/"
### Build Android App ###
