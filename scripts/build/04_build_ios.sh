#!/bin/bash

echo "DO NOT RUN THIS SCRIPT AS ROOT WITH SUDO!  IF YOU DID, PRESS CONROL-C NOW!"
sleep 5
echo "This script must be run on OSX"
echo "Prerequisites:  http://brew.sh/"

if [ -z "$APP_NAME" ]
  then
    echo -e "${RED}Please provide lowercase app name as first parameter ${NC}"
    exit
fi

if [ -z "$PROJECT_ROOT" ]
  then
  echo -e "No PROJECT_ROOT..."
    exit
  else
    echo "PROJECT_ROOT is $PROJECT_ROOT"
fi

if [ "$APP_NAME" == "moodimodo" ]; then
    ### Build iOS App ###

    cd ${PROJECT_ROOT}
    ionic state reset
    echo "Generating image resources for $APP_NAME..."
    ionic resources >/dev/null
    chmod a+x ./scripts/decrypt-key.sh
    ./scripts/decrypt-key.sh
    chmod a+x ./scripts/add-key.sh
    ./scripts/add-key.sh
    gulp -v
#    gulp generateXmlConfig
    gulp makeIosApp
    chmod a+x ./scripts/package-and-upload.sh
    ./scripts/package-and-upload.sh
    ### Build iOS App ###
else
    echo "Can only build moodimodo iOS app for now"
fi
