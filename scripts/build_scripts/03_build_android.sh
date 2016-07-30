#!/bin/bash

mkdir "$DROPBOX_PATH/QuantiModo/apps/$LOWERCASE_APP_NAME"  || true

if [ -z "$LOWERCASE_APP_NAME" ]
  then
    echo -e "${RED}build_android.sh: Please provide lowercase LOWERCASE_APP_NAME ${NC}"
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
echo "ionic state reset for $LOWERCASE_APP_NAME Android app..."
ionic state reset
echo "deleting platforms/android for $LOWERCASE_APP_NAME Android app..."
rm -rf platforms/android
echo "ionic platform remove android for $LOWERCASE_APP_NAME Android app..."
ionic platform remove android
echo "ionic platform add android for $LOWERCASE_APP_NAME Android app..."
ionic platform add android
source scripts/create_icons.sh

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

echo "ionic plugin add https://github.com/DrMoriarty/cordova-fabric-crashlytics-plugin -–variable CRASHLYTICS_API_KEY=${FABRIC_API_KEY} –-variable CRASHLYTICS_API_SECRET=${FABRIC_API_SECRET}  for $LOWERCASE_APP_NAME Android app..."
ionic plugin add https://github.com/DrMoriarty/cordova-fabric-crashlytics-plugin -–variable CRASHLYTICS_API_KEY=${FABRIC_API_KEY} –-variable CRASHLYTICS_API_SECRET=${FABRIC_API_SECRET}

echo "ionic add ionic-platform-web-client"
ionic add ionic-platform-web-client

echo "ionic plugin add https://github.com/DrMoriarty/cordova-fabric-crashlytics-plugin -–variable CRASHLYTICS_API_KEY=${FABRIC_API_KEY} –-variable CRASHLYTICS_API_SECRET=${FABRIC_API_SECRET}  for $LOWERCASE_APP_NAME Android app..."
ionic plugin add phonegap-plugin-push --variable SENDER_ID="GCM_PROJECT_NUMBER"

ionic io init
ionic config set dev_push true

#echo "push for $LOWERCASE_APP_NAME Android app..."
#cordova plugin add phonegap-plugin-push --variable SENDER_ID="quantimo-do"
echo "Generating image resources for $LOWERCASE_APP_NAME..."
ionic resources >/dev/null
ionic config build
cordova build --debug android >/dev/null
cordova build --release android >/dev/null
mkdir -p ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android
cp -R platforms/android/build/outputs/apk/* ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android
cd ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android

UNSIGNED_APK_FILENAME="android-release-unsigned.apk"
SIGNED_APK_FILENAME=${LOWERCASE_APP_NAME}-android-release-signed.apk
ALIAS=quantimodo

UNSIGNED_DEBUG_APK_FILENAME="android-debug-unaligned.apk"
SIGNED_DEBUG_APK_FILENAME=${LOWERCASE_APP_NAME}-android-debug-signed.apk
ANDROID_DEBUG_KEYSTORE_PASSWORD=android
DEBUG_ALIAS=androiddebugkey

echo "zip -d ${UNSIGNED_DEBUG_APK_FILENAME} META-INF/\*"
zip -d ${UNSIGNED_DEBUG_APK_FILENAME} META-INF/\*
echo "Signing ${UNSIGNED_DEBUG_APK_FILENAME}"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${ANDROID_DEBUG_KEYSTORE_PATH} -storepass ${ANDROID_DEBUG_KEYSTORE_PASSWORD} ${UNSIGNED_DEBUG_APK_FILENAME} ${DEBUG_ALIAS} >/dev/null
echo "Verifying ${UNSIGNED_DEBUG_APK_FILENAME}"
jarsigner -verify ${UNSIGNED_DEBUG_APK_FILENAME} >/dev/null
echo "Zipaligning ${UNSIGNED_DEBUG_APK_FILENAME}"
${ANDROID_BUILD_TOOLS}/zipalign -v 4 ${UNSIGNED_DEBUG_APK_FILENAME} ${SIGNED_DEBUG_APK_FILENAME} >/dev/null

echo -e "${GREEN}Copying ${SIGNED_DEBUG_APK_FILENAME} to $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_DEBUG_APK_FILENAME}${NC}"
cp ${SIGNED_DEBUG_APK_FILENAME} "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_DEBUG_APK_FILENAME}"

if [ -f "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_DEBUG_APK_FILENAME}" ];
then
   echo echo "${SIGNED_DEBUG_APK_FILENAME} is ready in $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_DEBUG_APK_FILENAME}"
else
   echo "ERROR: File ${SIGNED_DEBUG_APK_FILENAME} does not exist. Build FAILED"
   exit 1
fi

echo "zip -d ${UNSIGNED_APK_FILENAME} META-INF/\* "
zip -d ${UNSIGNED_APK_FILENAME} META-INF/\*

echo "Signing ${UNSIGNED_APK_FILENAME}"
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${ANDROID_KEYSTORE_PATH} -storepass ${ANDROID_KEYSTORE_PASSWORD} ${UNSIGNED_APK_FILENAME} ${ALIAS} >/dev/null
echo "Verifying ${UNSIGNED_APK_FILENAME}"
jarsigner -verify ${UNSIGNED_APK_FILENAME} >/dev/null
echo "Zipaligning ${UNSIGNED_APK_FILENAME}"
${ANDROID_BUILD_TOOLS}/zipalign -v 4 ${UNSIGNED_APK_FILENAME} ${SIGNED_APK_FILENAME} >/dev/null

echo -e "${GREEN}Copying ${SIGNED_APK_FILENAME} to $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_APK_FILENAME}${NC}"
cp ${SIGNED_APK_FILENAME} "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_APK_FILENAME}"

rm ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android/android-debug.apk
rm ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android/android-debug-unaligned.apk
rm ${BUILD_PATH}/${LOWERCASE_APP_NAME}/android/android-release-unsigned.apk

# Sign the app
#jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${ANDROID_KEYSTORE_PATH} -storepass ${ANDROID_KEYSTORE_PASSWORD} ${UNSIGNED_APK_FILENAME} ${ALIAS} >/dev/null

# Optimize apk
#${ANDROID_BUILD_TOOLS}/zipalign 4 ${UNSIGNED_APK_FILENAME} ${SIGNED_APK_FILENAME} >/dev/null

if [ -f "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_APK_FILENAME}" ];
then
    cd ${INTERMEDIATE_PATH}
    COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s)
    ionic upload --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD} --note "$COMMIT_MESSAGE"
    ionic package build android --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
    ionic package build android --release --profile production --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
    ionic package build ios --release --profile production --email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
    echo echo "${SIGNED_APK_FILENAME} is ready in $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/android/${SIGNED_APK_FILENAME}"
else
   echo "ERROR: File ${SIGNED_APK_FILENAME} does not exist. Build FAILED"
   exit 1
fi

#cp -R ${BUILD_PATH}/${LOWERCASE_APP_NAME}/* "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
#rsync ${BUILD_PATH}/${LOWERCASE_APP_NAME}/* "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
### Build Android App ###
