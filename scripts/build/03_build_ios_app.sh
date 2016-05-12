#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

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
fi

BUILD_PATH="${PROJECT_ROOT}/build"

if [ "$APP_NAME" == "moodimodo" ]; then
    ### Build iOS App ###
    export APP_NAME="MoodiModo"
    export TEAM_ID="YD2FK7S2S5"
    export DEVELOPER_NAME="iPhone Distribution=Mike Sinn (YD2FK7S2S5)"
    export PROFILE_NAME="028ab892-9a5e-4004-adac-b8472e760bdb"
    export PROFILE_UUID="028ab892-9a5e-4004-adac-b8472e760bdb"
    export APP_UPLOAD_BRANCH="app/moodimodo"
    export DELIVER_USER="ios@quantimodo.com"
    export FASTLANE_USER="ios@quantimodo.com"
    export ENCRYPTION_SECRET=$ENCRYPTION_SECRET
    export KEY_PASSWORD=$KEY_PASSWORD
    export FASTLANE_PASSWORD=$FASTLANE_PASSWORD
    export DELIVER_PASSWORD=$DELIVER_PASSWORD
    export LANG=en_US.UTF-8

    cd ${PROJECT_ROOT}
    npm install -g gulp@3.9.0
    npm install -g grunt-cli@0.1.13
    npm install -g cordova@5.4.0
    npm install -g ionic@1.7.10
    ionic state reset
    ionic resources
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
