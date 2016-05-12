#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
#echo -e "${RED}Please don't forget to update manifest.json file with new version ${NC}"
VERSION_NUMBER="1.2.0"
DROPBOX_PATH=/Users/Shared/Jenkins/Dropbox/QuantiModo/apps
PROJECT_ROOT=$PWD

if [ -z "$1" ]
  then
    echo -e "${RED}Please provide lowercase app name as first parameter ${NC}"
else
    APP_NAME=$1
    echo -e "${RED}Lowercase app name is $APP_NAME ${NC}"
fi

if [ -z "$2" ]
  then
    echo "No version parameter second argument given so using ${VERSION_NUMBER} as default version number..."
else
    VERSION_NUMBER="$2"
fi

if [ -z "$3" ]
  then
  echo -e "No Android keystore password third argument given so quitting..."
   exit
else
    ANDROID_KEYSTORE_PASSWORD=$3
fi

if [ -z "$4" ]
  then
  echo "No build path 4th argument given so using ${PROJECT_ROOT}/build as build path..."
    BUILD_PATH="${PROJECT_ROOT}/build"
else
    BUILD_PATH=$4
fi

QM_DOCKER_PATH="/Users/Shared/Jenkins/Home/workspace/QM-Docker-Build"

ANDROID_APP_SCRIPT=${PROJECT_ROOT}/scripts/build_android_app.sh
IOS_APP_SCRIPT=${PROJECT_ROOT}/scripts/build_ios_app.sh
IMAGES_SCRIPT=${PROJECT_ROOT}/scripts/create_icons.sh
APP_PRIVATE_CONFIG="${QM_DOCKER_PATH}/configs/ionic/${APP_NAME}.config.js"

if ! type "zip" > /dev/null;
  then
    echo -e "${GREEN}Installing zip package...${NC}"
    apt-get install zip -y
  else
    echo -e "${GREEN}Zip package already installed...${NC}"
fi

rm -rf ${BUILD_PATH}/${APP_NAME}

git config --global user.email "m@quantimodo.com"
git config --global user.name "Mike Sinn"

export LC_CTYPE=C
export LANG=C
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
bash "${IMAGES_SCRIPT}"
cp -R ${PROJECT_ROOT}/resources/android/*  "${PROJECT_ROOT}/www/img/"

rm -rf "${BUILD_PATH}/${APP_NAME}"

echo -e "${GREEN}Copy ${APP_PRIVATE_CONFIG} private config to ${PROJECT_ROOT}/www/private_configs/${NC}"
cp "${APP_PRIVATE_CONFIG}" "${PROJECT_ROOT}/www/private_configs/"

echo -e "${GREEN}Copying www folder into app and extension${NC}"
mkdir -p "${BUILD_PATH}/${APP_NAME}/chrome_app/www"
mkdir -p "${BUILD_PATH}/${APP_NAME}/chrome_extension/www"
cp -R ${PROJECT_ROOT}/resources/chrome_app/* "${BUILD_PATH}/${APP_NAME}/chrome_app/"
cp -R ${PROJECT_ROOT}/resources/chrome_extension/* "${BUILD_PATH}/${APP_NAME}/chrome_extension/"
cp -R ${PROJECT_ROOT}/www/*  "${BUILD_PATH}/${APP_NAME}/chrome_app/www/"
cp -R ${PROJECT_ROOT}/www/*  "${BUILD_PATH}/${APP_NAME}/chrome_extension/www/"

rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_extension/www/lib/phonegap-facebook-plugin/platforms/android"
rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_extension/www/lib/phonegap-facebook-plugin/platforms/ios"
cd "${BUILD_PATH}/${APP_NAME}" && zip -r "${BUILD_PATH}/${APP_NAME}/${APP_NAME}-Chrome-Extension.zip" chrome_extension >/dev/null
echo "${APP_NAME} Chrome extension is ready"

rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_app/www/lib/phonegap-facebook-plugin/platforms/android"
rm -rf "${BUILD_PATH}/${APP_NAME}/chrome_app/www/lib/phonegap-facebook-plugin/platforms/ios"
cd "${BUILD_PATH}/${APP_NAME}" && zip -r "${BUILD_PATH}/${APP_NAME}/${APP_NAME}-Chrome-App.zip" chrome_app >/dev/null
echo "${APP_NAME} Chrome app is ready"

echo -e "${GREEN}Building ${APP_NAME} Android App... ${NC}"
bash "${ANDROID_APP_SCRIPT}" ${APP_NAME} "${ANDROID_KEYSTORE_PASSWORD}"

echo -e "${GREEN}*** Building ${APP_NAME} iOS App... ***${NC}"
bash "${IOS_APP_SCRIPT}" ${APP_NAME} "${PROJECT_ROOT}"

cd "${PROJECT_ROOT}" && git reset --hard

mkdir "$DROPBOX_PATH/$APP_NAME"
echo -e "${GREEN}Copying ${BUILD_PATH}/${APP_NAME} to $DROPBOX_PATH/${APP_NAME}/${NC}"
cp -R ${BUILD_PATH}/${APP_NAME}/* "$DROPBOX_PATH/${APP_NAME}/"
