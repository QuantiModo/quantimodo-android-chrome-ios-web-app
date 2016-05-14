#!/bin/bash

if [ -z "$VERSION_NUMBER" ]
  then
    echo "${GREEN}No version parameter second argument given so using ${VERSION_NUMBER} as default version number...${NC}"
else
    echo -e "VERSION_NUMBER is $VERSION_NUMBER...${NC}"
fi

if [ -z "$BUILD_PATH" ]
  then
    $BUILD_PATH="$IONIC_PATH"/build
    echo "No BUILD_PATH given. Using $BUILD_PATH..."
fi

if [ -z "$INTERMEDIATE_PATH" ]
  then
  echo "No INTERMEDIATE_PATH given..."
    exit
fi

if [ -d "${INTERMEDIATE_PATH}/apps" ];
    then
        echo "${INTERMEDIATE_PATH}/apps path exists";
    else
        echo "${INTERMEDIATE_PATH}/apps path not found!";
        exit
fi

echo -e "${GREEN}Copying www folder into app and extension${NC}"
mkdir -p "${BUILD_PATH}/${APP_NAME}/chrome_app/www"
mkdir -p "${BUILD_PATH}/${APP_NAME}/chrome_extension/www"
cp -R ${INTERMEDIATE_PATH}/resources/chrome_app/* "${BUILD_PATH}/${APP_NAME}/chrome_app/"
cp -R ${INTERMEDIATE_PATH}/resources/chrome_extension/* "${BUILD_PATH}/${APP_NAME}/chrome_extension/"
cp -R ${INTERMEDIATE_PATH}/www/*  "${BUILD_PATH}/${APP_NAME}/chrome_app/www/"
cp -R ${INTERMEDIATE_PATH}/www/*  "${BUILD_PATH}/${APP_NAME}/chrome_extension/www/"

rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_extension/www/lib/phonegap-facebook-plugin/platforms/android"
rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_extension/www/lib/phonegap-facebook-plugin/platforms/ios"
cd "${BUILD_PATH}/${APP_NAME}" && zip -r "${BUILD_PATH}/${APP_NAME}/${APP_NAME}-Chrome-Extension.zip" chrome_extension >/dev/null
echo "${APP_NAME} Chrome extension is ready"

rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_app/www/lib/phonegap-facebook-plugin/platforms/android"
rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_app/www/lib/phonegap-facebook-plugin/platforms/ios"
cd "${BUILD_PATH}/${APP_NAME}" && zip -r "${BUILD_PATH}/${APP_NAME}/${APP_NAME}-Chrome-App.zip" chrome_app >/dev/null
echo "${APP_NAME} Chrome app is ready"

mkdir "$DROPBOX_PATH/$APP_NAME"
echo -e "${GREEN}Copying ${BUILD_PATH}/${APP_NAME} to $DROPBOX_PATH/${APP_NAME}/${NC}"
cp -R ${BUILD_PATH}/${APP_NAME}/* "$DROPBOX_PATH/${APP_NAME}/"
#rsync ${BUILD_PATH}/${APP_NAME}/* "$DROPBOX_PATH/${APP_NAME}/"
