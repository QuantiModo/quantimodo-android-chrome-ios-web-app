#!/bin/bash

if [ -z "$IONIC_APP_VERSION_NUMBER" ]
  then
    echo "${GREEN}No version parameter second argument given so using ${IONIC_APP_VERSION_NUMBER} as default version number...${NC}"
else
    echo -e "IONIC_APP_VERSION_NUMBER is $IONIC_APP_VERSION_NUMBER...${NC}"
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

if [ -z "$LOWERCASE_APP_NAME" ]
    then
      echo "ERROR: No LOWERCASE_APP_NAME given!"
      exit 1
fi

rm -rf ${BUILD_PATH}/${LOWERCASE_APP_NAME}

if [ -d "${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}" ];
    then
        echo "${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME} path exists";
    else
        echo "ERROR: ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME} path not found!";
        exit 1
fi

if [ -d "${APP_PRIVATE_CONFIG_PATH}" ];
    then
        echo "${APP_PRIVATE_CONFIG_PATH} path exists";
    else
        echo "ERROR: APP_PRIVATE_CONFIG_PATH ${APP_PRIVATE_CONFIG_PATH} path not found!";
        exit 1
fi

if [ ! -f ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.config.js ]; then
    echo "ERROR: ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.config.js file not found!";
    exit 1
fi

export LC_CTYPE=C
export LANG=C
echo -e "${GREEN}Replacing IONIC_APP_VERSION_NUMBER with ${IONIC_APP_VERSION_NUMBER}...${NC}"
cd "${INTERMEDIATE_PATH}/apps" && find . -type f -exec sed -i '' -e 's/IONIC_APP_VERSION_NUMBER/'${IONIC_APP_VERSION_NUMBER}'/g' {} \; >> /dev/null 2>&1
export LANG=en_US.UTF-8

echo -e "${GREEN}Copy ${LOWERCASE_APP_NAME} config and resource files${NC}"
cp -R ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}/*  "${INTERMEDIATE_PATH}"
rm ${INTERMEDIATE_PATH}/config.xml
mv ${INTERMEDIATE_PATH}/config.xml.conflict ${INTERMEDIATE_PATH}/config.xml
ionic config build

cd "${INTERMEDIATE_PATH}"
#ionic state reset

echo "Copying generated images from ${INTERMEDIATE_PATH}/resources/android to ${INTERMEDIATE_PATH}/www/img/"
cp -R ${INTERMEDIATE_PATH}/resources/android/*  "${INTERMEDIATE_PATH}/www/img/"

rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}"

echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.config.js private config to ${INTERMEDIATE_PATH}/www/private_configs/${NC}"
cp "${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.config.js" "${INTERMEDIATE_PATH}/www/private_configs/"
