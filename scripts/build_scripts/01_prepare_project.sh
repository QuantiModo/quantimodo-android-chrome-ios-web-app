#!/bin/bash

if [ -z "$VERSION_NUMBER" ]
  then
    echo "${GREEN}No version parameter second argument given so using ${VERSION_NUMBER} as default version number...${NC}"
else
    echo -e "VERSION_NUMBER is $VERSION_NUMBER...${NC}"
fi

if [ -z "$INTERMEDIATE_PATH" ]
    then
      $INTERMEDIATE_PATH="$PWD"
      echo "No INTERMEDIATE_PATH given. Using $INTERMEDIATE_PATH..."
fi

if [ -z "$BUILD_PATH" ]
    then
      $BUILD_PATH="$IONIC_PATH"/build
      echo "No BUILD_PATH given. Using $BUILD_PATH..."
fi

rm -rf ${BUILD_PATH}/${APP_NAME}

if [ -d "${INTERMEDIATE_PATH}/apps/${APP_NAME}" ];
    then
        echo "${INTERMEDIATE_PATH}/apps/${APP_NAME} path exists";
    else
        echo "${INTERMEDIATE_PATH}/apps/${APP_NAME} path not found!";
        exit
fi

export LC_CTYPE=C
export LANG=C
echo -e "${GREEN}Replacing QUANTIMODO_TEMPLATE_APP_VERSION with ${VERSION_NUMBER}...${NC}"
cd "${INTERMEDIATE_PATH}/apps" && find . -type f -exec sed -i '' -e 's/QUANTIMODO_TEMPLATE_APP_VERSION/'${VERSION_NUMBER}'/g' {} \;
export LANG=en_US.UTF-8

echo -e "${GREEN}Copy ${APP_NAME} config and resource files${NC}"
cp -R ${INTERMEDIATE_PATH}/apps/${APP_NAME}/*  "${INTERMEDIATE_PATH}"

cd "${INTERMEDIATE_PATH}"
#ionic state reset

echo "Generating images for ${APP_NAME}..."
source "${IMAGES_SCRIPT}"

echo "Copying generated images from ${INTERMEDIATE_PATH}/resources/android to ${INTERMEDIATE_PATH}/www/img/"
cp -R ${INTERMEDIATE_PATH}/resources/android/*  "${INTERMEDIATE_PATH}/www/img/"

rm -rf "${BUILD_PATH}/${APP_NAME}"

echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG_PATH}/${APP_NAME}.config.js private config to ${INTERMEDIATE_PATH}/www/private_configs/${NC}"
cp "${APP_PRIVATE_CONFIG_PATH}/${APP_NAME}.config.js" "${INTERMEDIATE_PATH}/www/private_configs/"
