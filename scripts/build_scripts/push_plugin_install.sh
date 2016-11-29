#!/bin/bash

if [ -z "$IONIC_EMAIL" ]
    then
        echo -e "${RED}build_android.sh: Please set IONIC_EMAIL env!${NC}"
        exit 1
fi

if [ -z "$GCM_SENDER_ID" ]
    then
        echo -e "${RED}build_android.sh: Please set GCM_SENDER_ID env!${NC}"
        exit 1
fi


if [ -z "$IONIC_PASSWORD" ]
    then
        echo -e "${RED}build_android.sh: Please set IONIC_PASSWORD env!${NC}"
        exit 1
fi


echo "ionic add ionic-platform-web-client"
bower install --save-dev ionic-platform-web-client

cordova plugin remove phonegap-plugin-push
ionic plugin remove phonegap-plugin-push

cordova plugin add https://github.com/mikepsinn/phonegap-plugin-push#93cef15c1027353132bafdd49b66805aa917defb --variable SENDER_ID="${GCM_SENDER_ID}"
#cordova plugin add phonegap-plugin-push --variable SENDER_ID="${GCM_SENDER_ID}"

# I think this is created a new app in https://apps.ionic.io/apps all the time
#ionic io init -email ${IONIC_EMAIL} --password ${IONIC_PASSWORD}
ionic config set dev_push false

ionic push --google-api-key ${GCM_SERVER_API_KEY}
ionic config set gcm_key ${GCM_SENDER_ID}

ionic config build

# Install Ionic Deploy
npm install @ionic/cloud --save
cordova plugin add ionic-plugin-deploy --save

