#!/bin/bash

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

if [ -z "$QUANTIMODO_CLIENT_ID" ]
    then
      echo "ERROR: No QUANTIMODO_CLIENT_ID given!"
      exit 1
fi

rm -rf ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}

if [ -d "${INTERMEDIATE_PATH}/apps/${QUANTIMODO_CLIENT_ID}" ];
    then
        echo "${INTERMEDIATE_PATH}/apps/${QUANTIMODO_CLIENT_ID} path exists";
    else
        echo "ERROR: ${INTERMEDIATE_PATH}/apps/${QUANTIMODO_CLIENT_ID} path not found!";
        exit 1
fi

if [ -d "${APP_PRIVATE_CONFIG_PATH}" ];
    then
        echo "${APP_PRIVATE_CONFIG_PATH} path exists";
    else
        echo "ERROR: APP_PRIVATE_CONFIG_PATH ${APP_PRIVATE_CONFIG_PATH} path not found!";
        exit 1
fi

if [ ! -f ${APP_PRIVATE_CONFIG_PATH}/${QUANTIMODO_CLIENT_ID}.private_config.json ]; then
    echo "ERROR: ${APP_PRIVATE_CONFIG_PATH}/${QUANTIMODO_CLIENT_ID}.private_config.json file not found!";
    exit 1
fi

echo "Removing left over resources from previous app"
rm -rf ${INTERMEDIATE_PATH}/resources/*

export LC_CTYPE=C
export LANG=C
echo -e "${GREEN}Replacing QUANTIMODO_CLIENT_ID with ${QUANTIMODO_CLIENT_ID}...${NC}"
cp ${INTERMEDIATE_PATH}/config-template.xml ${INTERMEDIATE_PATH}/apps/${QUANTIMODO_CLIENT_ID}/config.xml
cd ${INTERMEDIATE_PATH}/apps/${QUANTIMODO_CLIENT_ID}

find . -type f -exec sed -i '' -e 's/YourAppDisplayNameHere/'${APP_DISPLAY_NAME}'/g' {} \; >> /dev/null 2>&1
find . -type f -exec sed -i '' -e 's/YourAppIdentifierHere/'${APP_IDENTIFIER}'/g' {} \; >> /dev/null 2>&1

echo "MAKE SURE NOT TO USE QUOTES OR SPECIAL CHARACTERS WITH export APP_DESCRIPTION OR IT WILL NOT REPLACE PROPERLY"
find . -type f -exec sed -i '' -e 's/YourAppDescriptionHere/'${APP_DESCRIPTION}'/g' {} \; >> /dev/null 2>&1

export LANG=en_US.UTF-8

echo -e "${GREEN}Copy ${QUANTIMODO_CLIENT_ID} config and resource files${NC}"
cp -R ${INTERMEDIATE_PATH}/apps/${QUANTIMODO_CLIENT_ID}/*  "${INTERMEDIATE_PATH}"
#ionic config build

cd "${INTERMEDIATE_PATH}"
#ionic state reset

echo "Copying generated images from ${INTERMEDIATE_PATH}/resources/android to ${INTERMEDIATE_PATH}/www/img/"
cp -R ${INTERMEDIATE_PATH}/resources/android/*  "${INTERMEDIATE_PATH}/www/img/"

echo "Removing ${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}"
rm -rf "${BUILD_PATH}/${QUANTIMODO_CLIENT_ID}"

if [ ! -f ${INTERMEDIATE_PATH}/www//${QUANTIMODO_CLIENT_ID}.private_config.json ]; then
    echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG_PATH}/${QUANTIMODO_CLIENT_ID}.private_config.json private config to ${INTERMEDIATE_PATH}/www/${NC}"
    cp "${APP_PRIVATE_CONFIG_PATH}/${QUANTIMODO_CLIENT_ID}.private_config.json" "${INTERMEDIATE_PATH}/www/"
fi
