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
    echo -e "${RED}Lowercase app name is $LOWERCASE_APP_NAME ${NC}"
fi

if [ -z "$2" ]
  then
    echo -e "${RED}Please provide APP_DISPLAY_NAME as second parameter ${NC}"
    exit
else
    export APP_DISPLAY_NAME="$2"
fi

if [ -z "$3" ]
  then
    echo -e "${RED}Please provide APPLE_ID as third parameter ${NC}"
    exit
else
    export APPLE_ID=$3
fi

if [ -z "$4" ]
  then
    echo -e "${RED}Please provide APP_IDENTIFIER as fourth parameter ${NC}"
    exit
else
    export APP_IDENTIFIER=$4
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
gulp generateXmlConfig
cp apps/${LOWERCASE_APP_NAME}/resources/icon_white.png $PWD/resources/icon.png
ionic resources
gulp setVersionNumbersWithEnvs
gulp makeIosApp
chmod a+x ./scripts/package-and-upload.sh
./scripts/package-and-upload.sh