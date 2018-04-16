#!/bin/bash

echo "DO NOT RUN THIS SCRIPT AS ROOT WITH SUDO!  IF YOU DID, PRESS CONROL-C NOW!"
sleep 5
echo "This script must be run on OSX"
echo "Prerequisites:  http://brew.sh/"

if [ -z "$1" ]
  then
    echo -e "${RED}Please provide QUANTIMODO_CLIENT_ID as first parameter ${NC}"
    exit
else
    export QUANTIMODO_CLIENT_ID=$1
    echo -e "${GREEN}QUANTIMODO_CLIENT_ID is $QUANTIMODO_CLIENT_ID ${NC}"
fi

if [ -z "$2" ]
  then
    echo -e "${RED}Please provide APP_DISPLAY_NAME as second parameter ${NC}"
    exit
else
    export APP_DISPLAY_NAME="$2"
    echo -e "${GREEN}APP_DISPLAY_NAME is $QUANTIMODO_CLIENT_ID ${NC}"
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

chmod -R a+x ./hooks

cp -R apps/${QUANTIMODO_CLIENT_ID}/* $PWD
#ionic state reset
#npm install
#echo "npm has installed"
npm install gulp
gulp generateXmlConfigAndUpdateAppsJs


#ionic resources - We already do this in gulp makeIosApp
echo "Executing gulp updateConfigXmlUsingEnvs"
gulp updateConfigXmlUsingEnvs
#echo "ionic add ionic-platform-web-client"
#ionic add ionic-platform-web-client

# We shouldn't need to do this because it should already be in package.json
cordova plugin add phonegap-plugin-push@1.10.5 --variable SENDER_ID="${GCM_SENDER_ID}"

#ionic io init -email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
ionic config set dev_push false

#ionic push --google-api-key ${GCM_SERVER_API_KEY}
ionic config set gcm_key ${GCM_SENDER_ID}

echo "Generating image resources for $QUANTIMODO_CLIENT_ID..."

#ionic config build

npm install -g gulp cordova@7.1.0 ionic@2.2.3 bower yarn  # Adding plugins from Github doesn't work on cordova@7.0.0
npm install -g ios-sim ios-deploy
ionic platform rm ios
ionic platform add ios@4.1.0

ionic resources >/dev/null
cp apps/${QUANTIMODO_CLIENT_ID}/resources/icon_white.png $PWD/resources/icon.png

gulp makeIosAppSimplified
#ionic emulate ios

#chmod a+x ./scripts/package-and-upload.sh
#./scripts/package-and-upload.sh
