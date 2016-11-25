#!/bin/bash

if [ -z "$IONIC_APP_VERSION_NUMBER" ]
  then
    echo "${GREEN}IONIC_APP_VERSION_NUMBER not set!${NC}"
    exit
else
    echo -e "IONIC_APP_VERSION_NUMBER is $IONIC_APP_VERSION_NUMBER...${NC}"
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

echo "Generating images for ${LOWERCASE_APP_NAME} Chrome at ${PWD}..."
convert resources/icon_transparent.png -resize 700x700 www/img/icons/icon_700.png
convert resources/icon_transparent.png -resize 16x16 www/img/icons/icon_16.png
convert resources/icon_transparent.png -resize 48x48 www/img/icons/icon_48.png
convert resources/icon_transparent.png -resize 128x128 www/img/icons/icon_128.png


echo -e "${GREEN}Copying www folder into app and extension${NC}"
mkdir -p "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app/www"
mkdir -p "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension/www"

cp -R ${INTERMEDIATE_PATH}/resources/chrome_app/* "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app/"
cp -R ${INTERMEDIATE_PATH}/resources/chrome_extension/* "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension/"

#rsync -aP --exclude=build/ --exclude=.git/ ${INTERMEDIATE_PATH}/www/* "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app/www/"
#rsync -aP --exclude=build/ --exclude=.git/ ${INTERMEDIATE_PATH}/www/* "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension/www/"
cp -R ${INTERMEDIATE_PATH}/www/*  "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app/www/"
cp -R ${INTERMEDIATE_PATH}/www/*  "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension/www/"

rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension/www/lib/phonegap-facebook-plugin/platforms/android"
rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension/www/lib/phonegap-facebook-plugin/platforms/ios"
cd "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension" && zip -r "${BUILD_PATH}/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-Chrome-Extension.zip" * >/dev/null
rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_extension"
cp "${BUILD_PATH}/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-Chrome-Extension.zip" "$DROPBOX_PATH/QuantiModo/apps/"
echo "${LOWERCASE_APP_NAME} Chrome extension is ready"

rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app/www/lib/phonegap-facebook-plugin/platforms/android"
rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app/www/lib/phonegap-facebook-plugin/platforms/ios"
cd "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app" && zip -r "${BUILD_PATH}/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-Chrome-App.zip" * >/dev/null
rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}/chrome_app"
cp "${BUILD_PATH}/${LOWERCASE_APP_NAME}/${LOWERCASE_APP_NAME}-Chrome-App.zip" "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
echo "${LOWERCASE_APP_NAME} Chrome app is ready"

#mkdir "$DROPBOX_PATH/QuantiModo/apps/$LOWERCASE_APP_NAME" || true
#echo -e "${GREEN}Copying ${BUILD_PATH}/${LOWERCASE_APP_NAME} to $DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/${NC}"
#cp -R ${BUILD_PATH}/${LOWERCASE_APP_NAME}/* "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
#rsync ${BUILD_PATH}/${LOWERCASE_APP_NAME}/* "$DROPBOX_PATH/QuantiModo/apps/${LOWERCASE_APP_NAME}/"
