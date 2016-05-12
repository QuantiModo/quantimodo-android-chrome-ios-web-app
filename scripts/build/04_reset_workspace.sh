#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

cd "${PROJECT_ROOT}" && git reset --hard

mkdir "$DROPBOX_PATH/$APP_NAME"
echo -e "${GREEN}Copying ${BUILD_PATH}/${APP_NAME} to $DROPBOX_PATH/${APP_NAME}/${NC}"
cp -R ${BUILD_PATH}/${APP_NAME}/* "$DROPBOX_PATH/${APP_NAME}/"
