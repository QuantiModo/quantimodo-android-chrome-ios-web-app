#!/bin/bash

if [ -z "$LOWERCASE_APP_NAME" ]
  then
    echo -e "${RED}build_android.sh: Please provide lowercase LOWERCASE_APP_NAME ${NC}"
    exit
fi

if [ -z "$BUILD_PATH" ]
    then
        echo -e "${RED}build_android.sh: No BUILD_PATH!${NC}"
        exit
fi

if [ ! -d "$ANDROID_BUILD_TOOLS" ]
    then
        echo -e "${RED}build_android.sh: ANDROID_BUILD_TOOLS directory $ANDROID_BUILD_TOOLS does not exist! Please update env!${NC}"
        exit
fi

echo -e "${GREEN}build_android.sh: BUILD_PATH is ${BUILD_PATH}...${NC}"

if [ -z "${ANDROID_HOME}" ]
    then
        echo -e "${RED}build_android.sh: ANDROID_HOME variable not set. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x ${NC}"
        exit
    else
        echo -e "${GREEN}build_android.sh: Android home is $ANDROID_HOME ${NC}"
fi

echo -e "${GREEN}build_android.sh: ANDROID_KEYSTORE_PASSWORD second argument given is ${ANDROID_KEYSTORE_PASSWORD}...${NC}"
if [ -z "${ANDROID_KEYSTORE_PASSWORD}" ]
  then
      echo -e "${RED}build_android.sh: ANDROID_KEYSTORE_PASSWORD doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit
fi

if [ -z "${ANDROID_KEYSTORE_PATH}" ]
    then
      echo -e "${RED}build_android.sh: ANDROID_KEYSTORE_PATH doesn't exist. Please set it in Jenkins->Manage Jenkins->Configure System->Environment variables${NC}"
      exit
fi

echo -e "${GREEN}build_android.sh: INTERMEDIATE_PATH is ${INTERMEDIATE_PATH}...${NC}"

### Build Android App ###
cd ${INTERMEDIATE_PATH}
echo "ionic state reset for $LOWERCASE_APP_NAME Android app..."
ionic state reset
echo "deleting platforms/android for $LOWERCASE_APP_NAME Android app..."
rm -rf platforms/android
echo "ionic platform remove android for $LOWERCASE_APP_NAME Android app..."
ionic platform remove android
echo "ionic platform add android for $LOWERCASE_APP_NAME Android app..."
ionic platform add android

echo "cordova plugin rm phonegap-facebook-plugin for $LOWERCASE_APP_NAME Android app..."
cordova plugin rm phonegap-facebook-plugin
echo "cordova plugin rm cordova-plugin-facebook4 for $LOWERCASE_APP_NAME Android app..."
cordova plugin rm cordova-plugin-facebook4
echo "rm -rf ../fbplugin for $LOWERCASE_APP_NAME Android app..."
rm -rf ../fbplugin
#echo "gulp addFacebookPlugin for $LOWERCASE_APP_NAME Android app..."
#gulp addFacebookPlugin
echo "cordova plugin add cordova-plugin-facebook4 --save  for $LOWERCASE_APP_NAME Android app..."
cordova plugin add https://github.com/jeduan/cordova-plugin-facebook4 --save --variable APP_ID="${FACEBOOK_APP_ID}" --variable APP_NAME="${FACEBOOK_APP_NAME}"

#echo "gulp addFacebookPlugin for $LOWERCASE_APP_NAME Android app..."
#gulp addGooglePlusPlugin

echo "cordova plugin add https://github.com/EddyVerbruggen/cordova-plugin-googleplus for $LOWERCASE_APP_NAME Android app..."
cordova plugin add https://github.com/EddyVerbruggen/cordova-plugin-googleplus --variable REVERSED_CLIENT_ID=${GOOGLE_REVERSED_CLIENT_ID}

#echo "push for $LOWERCASE_APP_NAME Android app..."
#cordova plugin add phonegap-plugin-push --variable SENDER_ID="quantimo-do"
echo "Generating image resources for $LOWERCASE_APP_NAME..."
ionic resources >/dev/null
cordova build --debug android >/dev/null
cordova build --release android >/dev/null
mkdir -p ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android
cp -R platforms/android/build/outputs/apk/* ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android
cd ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android
# Sign the app
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${ANDROID_KEYSTORE_PATH} -storepass ${ANDROID_KEYSTORE_PASSWORD} android-release-unsigned.apk quantimodo >/dev/null
# Optimize apk
${ANDROID_BUILD_TOOLS}/zipalign 4 android-release-unsigned.apk ${LOWERCASE_APP_NAME}-android-release-signed.apk >/dev/null

cp android-debug.apk "$DROPBOX_PATH/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-android-debug.apk"
cp ${LOWERCASE_APP_NAME}-android-release-signed.apk "$DROPBOX_PATH/${LOWERCASE_APP_NAME}/"
echo "Android app is ready"

mkdir "$DROPBOX_PATH/$LOWERCASE_APP_NAME"
echo -e "${GREEN}Copying ${BUILD_PATH}/${LOWERCASE_APP_NAME} to $DROPBOX_PATH/${LOWERCASE_APP_NAME}/${NC}"
#cp -R ${BUILD_PATH}/${LOWERCASE_APP_NAME}/* "$DROPBOX_PATH/${LOWERCASE_APP_NAME}/"
#rsync ${BUILD_PATH}/${LOWERCASE_APP_NAME}/* "$DROPBOX_PATH/${LOWERCASE_APP_NAME}/"
### Build Android App ###
