#!/bin/bash

if [ -z "$VERSION_NUMBER" ]
  then
    echo "${RED}No version parameter second argument given so using ${VERSION_NUMBER} as default version number...${NC}"
else
    echo -e "VERSION_NUMBER is $VERSION_NUMBER...${NC}"
fi

if [ -z "$BUILD_PATH" ]
  then
  echo "No BUILD_PATH given..."
    exit
fi

if [ -z "$PROJECT_ROOT" ]
  then
  echo "No PROJECT_ROOT given..."
    exit
fi

rm -rf ${BUILD_PATH}/${APP_NAME}

if [ -d "${PROJECT_ROOT}/apps" ];
    then
        echo "${PROJECT_ROOT}/apps path exists";
    else
        echo "${PROJECT_ROOT}/apps path not found!";
        exit
fi

echo -e "${GREEN}Replacing QUANTIMODO_TEMPLATE_APP_VERSION with ${VERSION_NUMBER}...${NC}"
cd "${PROJECT_ROOT}/apps" && find . -type f -exec sed -i '' -e 's/QUANTIMODO_TEMPLATE_APP_VERSION/'${VERSION_NUMBER}'/g' {} \;

echo -e "${GREEN}Copy ${APP_NAME} config and resource files${NC}"
cp -R ${PROJECT_ROOT}/apps/${APP_NAME}/*  "${PROJECT_ROOT}"

cd "${PROJECT_ROOT}"
#ionic state reset
source "${IMAGES_SCRIPT}"
cp -R ${PROJECT_ROOT}/resources/android/*  "${PROJECT_ROOT}/www/img/"

rm -rf "${BUILD_PATH}/${APP_NAME}"

echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG} private config to ${PROJECT_ROOT}/www/private_configs/${NC}"
cp "${APP_PRIVATE_CONFIG}" "${PROJECT_ROOT}/www/private_configs/"
