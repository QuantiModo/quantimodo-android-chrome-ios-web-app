#!/bin/bash

if [ -z "$VERSION_NUMBER" ]
  then
    echo "${GREEN}No version parameter second argument given so using ${VERSION_NUMBER} as default version number...${NC}"
else
    echo -e "VERSION_NUMBER is $VERSION_NUMBER...${NC}"
fi

if [ -z "$PROJECT_ROOT" ]
    then
      $PROJECT_ROOT="$PWD"
      echo "No PROJECT_ROOT given. Using $PROJECT_ROOT..."
fi

if [ -z "$BUILD_PATH" ]
    then
      $BUILD_PATH="$PROJECT_ROOT"/build
      echo "No BUILD_PATH given. Using $BUILD_PATH..."
fi

rm -rf ${BUILD_PATH}/${APP_NAME}

if [ -d "${PROJECT_ROOT}/apps" ];
    then
        echo "${PROJECT_ROOT}/apps path exists";
    else
        echo "${PROJECT_ROOT}/apps path not found!";
        exit
fi

export LC_CTYPE=C
export LANG=C
echo -e "${GREEN}Replacing QUANTIMODO_TEMPLATE_APP_VERSION with ${VERSION_NUMBER}...${NC}"
cd "${PROJECT_ROOT}/apps" && find . -type f -exec sed -i '' -e 's/QUANTIMODO_TEMPLATE_APP_VERSION/'${VERSION_NUMBER}'/g' {} \;
export LANG=en_US.UTF-8

echo -e "${GREEN}Copy ${APP_NAME} config and resource files${NC}"
cp -R ${PROJECT_ROOT}/apps/${APP_NAME}/*  "${PROJECT_ROOT}"

cd "${PROJECT_ROOT}"
#ionic state reset
source "${IMAGES_SCRIPT}"
cp -R ${PROJECT_ROOT}/resources/android/*  "${PROJECT_ROOT}/www/img/"

rm -rf "${BUILD_PATH}/${APP_NAME}"

echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG_PATH}/${APP_NAME}.config.js private config to ${PROJECT_ROOT}/www/private_configs/${NC}"
cp "${APP_PRIVATE_CONFIG_PATH}/${APP_NAME}.config.js" "${PROJECT_ROOT}/www/private_configs/"
