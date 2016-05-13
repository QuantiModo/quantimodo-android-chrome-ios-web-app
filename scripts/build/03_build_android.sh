#!/bin/bash

if [ -z "$APP_NAME" ]
  then
    echo -e "${RED}build_android.sh: Please provide lowercase APP_NAME ${NC}"
    exit
fi

if [ -z "$BUILD_PATH" ]
    then
  echo -e "${RED}build_android.sh: No BUILD_PATH...${NC}"
    exit
fi

echo -e "${GREEN}build_android.sh: BUILD_PATH is ${BUILD_PATH}...${NC}"

if [ -z "${ANDROID_HOME}" ]
    then
      echo -e "${RED}build_android.sh: Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x ${NC}"
      exit
    else
         echo -e "${GREEN}build_android.sh: Android home is $ANDROID_HOME ${NC}"
fi

echo -e "${GREEN}build_android.sh: ANDROID_KEYSTORE_PASSWORD second argument given is ${ANDROID_KEYSTORE_PASSWORD}...${NC}"
if [ -z "${ANDROID_KEYSTORE_PASSWORD}" ]
  then
      echo -e "${RED}build_android.sh: ANDROID_KEYSTORE_PASSWORD doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit
  else
      echo -e "${GREEN}build_android.sh: ANDROID_KEYSTORE_PASSWORD is ${ANDROID_KEYSTORE_PASSWORD}${NC}"
fi

if [ -z "${ANDROID_KEYSTORE_PATH}" ]
    then
      echo -e "${RED}build_android.sh: ANDROID_KEYSTORE_PATH doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit
    else
      echo -e "${GREEN}build_android.sh: ANDROID_KEYSTORE_PATH is $ANDROID_KEYSTORE_PATH${NC}"
fi

echo -e "${GREEN}build_android.sh: PROJECT_ROOT is ${PROJECT_ROOT}...${NC}"
echo -e "${GREEN}build_android.sh: INTERMEDIATE_PATH is ${INTERMEDIATE_PATH}...${NC}"

### Build Android App ###
cd ${INTERMEDIATE_PATH}
ionic state reset
rm -rf platforms/android
ionic platform remove android
ionic platform add android
echo "Generating image resources for $APP_NAME..."
ionic resources >/dev/null
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

mkdir "$DROPBOX_PATH/$APP_NAME"
echo -e "${GREEN}Copying ${BUILD_PATH}/${APP_NAME} to $DROPBOX_PATH/${APP_NAME}/${NC}"
cp -R ${BUILD_PATH}/${APP_NAME}/* "$DROPBOX_PATH/${APP_NAME}/"
#rsync ${BUILD_PATH}/${APP_NAME}/* "$DROPBOX_PATH/${APP_NAME}/"
### Build Android App ###
