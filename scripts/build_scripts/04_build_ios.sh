#!/bin/bash

echo "DO NOT RUN THIS SCRIPT AS ROOT WITH SUDO!  IF YOU DID, PRESS CONROL-C NOW!"
sleep 5
echo "This script must be run on OSX"
echo "Prerequisites:  http://brew.sh/"

if [ -z "$1" ]
  then
    echo -e "${RED}Please provide LOWERCASE_APP_NAME as first parameter ${NC}"
    exit
else
    export LOWERCASE_APP_NAME=$1
    echo -e "${GREEN}LOWERCASE_APP_NAME is $LOWERCASE_APP_NAME ${NC}"
fi

if [ -z "$2" ]
  then
    echo -e "${RED}Please provide APP_DISPLAY_NAME as second parameter ${NC}"
    exit
else
    export APP_DISPLAY_NAME="$2"
    echo -e "${GREEN}APP_DISPLAY_NAME is $LOWERCASE_APP_NAME ${NC}"
fi

if [ -z "$3" ]
  then
    echo -e "${RED}Please provide APPLE_ID as third parameter ${NC}"
    exit
else
    export APPLE_ID=$3
    echo -e "${GREEN}APPLE_ID is $APPLE_ID ${NC}"
fi

if [ -z "$4" ]
  then
    echo -e "${RED}Please provide APP_IDENTIFIER as fourth parameter ${NC}"
    exit
else
    export APP_IDENTIFIER=$4
    echo -e "${GREEN}APP_IDENTIFIER is $APP_IDENTIFIER ${NC}"
fi

chmod a+x ./scripts/decrypt-key.sh
./scripts/decrypt-key.sh
chmod a+x ./scripts/add-key.sh
./scripts/add-key.sh

cp -R apps/${LOWERCASE_APP_NAME}/* $PWD
ionic state reset
npm install
echo "npm has installed"
gulp -v
echo "ran through gulp"
gulp generateXmlConfigAndUpdateAppsJs
cp apps/${LOWERCASE_APP_NAME}/resources/icon_white.png $PWD/resources/icon.png
#ionic resources - We already do this in gulp makeIosApp
gulp setVersionNumbersWithEnvs
gulp makeIosApp
chmod a+x ./scripts/package-and-upload.sh
./scripts/package-and-upload.sh
exit 0