#!/bin/bash

if [ -z "$IONIC_APP_VERSION_NUMBER" ]
  then
    echo "${GREEN}Please provide IONIC_APP_VERSION_NUMBER...${NC}"
    exit 1
else
    echo -e "IONIC_APP_VERSION_NUMBER is $IONIC_APP_VERSION_NUMBER...${NC}"
fi

if [ -z "$INTERMEDIATE_PATH" ]
    then
      export INTERMEDIATE_PATH="$PWD"
      echo "No INTERMEDIATE_PATH given. Using $INTERMEDIATE_PATH..."
fi

if [ -z "$BUILD_PATH" ]
    then
      export BUILD_PATH="$IONIC_PATH"/build
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

echo "Removing left over resources from previous app"
rm -rf ${INTERMEDIATE_PATH}/resources/*

export LC_CTYPE=C
export LANG=C
echo -e "${GREEN}Replacing IONIC_APP_VERSION_NUMBER with ${IONIC_APP_VERSION_NUMBER}...${NC}"
cp ${INTERMEDIATE_PATH}/config-template.xml ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}/config.xml
cd ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}
find . -type f -exec sed -i '' -e 's/IONIC_IOS_APP_VERSION_NUMBER_PLACEHOLDER/'${IONIC_IOS_APP_VERSION_NUMBER}'/g' {} \; >> /dev/null 2>&1
find . -type f -exec sed -i '' -e 's/IONIC_APP_VERSION_NUMBER_PLACEHOLDER/'${IONIC_APP_VERSION_NUMBER}'/g' {} \; >> /dev/null 2>&1
find . -type f -exec sed -i '' -e 's/APP_DISPLAY_NAME_PLACEHOLDER/'${APP_DISPLAY_NAME}'/g' {} \; >> /dev/null 2>&1
find . -type f -exec sed -i '' -e 's/APP_IDENTIFIER_PLACEHOLDER/'${APP_IDENTIFIER}'/g' {} \; >> /dev/null 2>&1

echo "MAKE SURE NOT TO USE QUOTES OR SPECIAL CHARACTERS WITH export APP_DESCRIPTION OR IT WILL NOT REPLACE PROPERLY"
find . -type f -exec sed -i '' -e 's/APP_DESCRIPTION_PLACEHOLDER/'${APP_DESCRIPTION}'/g' {} \; >> /dev/null 2>&1

export LANG=en_US.UTF-8

echo -e "${GREEN}Copy ${LOWERCASE_APP_NAME} config and resource files${NC}"
cp -R ${INTERMEDIATE_PATH}/apps/${LOWERCASE_APP_NAME}/*  "${INTERMEDIATE_PATH}"

echo -e "${GREEN}cp resources/icon_transparent.png resources/icon.png${NC}"
cp resources/icon_transparent.png resources/icon.png || true

ionic config build

cd "${INTERMEDIATE_PATH}"
#ionic state reset

echo "Copying generated images from ${INTERMEDIATE_PATH}/resources/android to ${INTERMEDIATE_PATH}/www/img/"
cp -R ${INTERMEDIATE_PATH}/resources/android/*  "${INTERMEDIATE_PATH}/www/img/"

echo "Removing ${BUILD_PATH}/${LOWERCASE_APP_NAME}"
rm -rf "${BUILD_PATH}/${LOWERCASE_APP_NAME}"

if [ ! -f ${INTERMEDIATE_PATH}/www/private_configs//${LOWERCASE_APP_NAME}.config.js ]; then
    echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.config.js private config to ${INTERMEDIATE_PATH}/www/private_configs/${NC}"
    cp "${APP_PRIVATE_CONFIG_PATH}/${LOWERCASE_APP_NAME}.config.js" "${INTERMEDIATE_PATH}/www/private_configs/"
fi