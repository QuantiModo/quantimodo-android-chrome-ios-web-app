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

if [ -z "$INTERMEDIATE_PATH" ]
  then
  echo -e "No INTERMEDIATE_PATH!"
    exit
  else
    echo "INTERMEDIATE_PATH is $INTERMEDIATE_PATH"
fi

if [ "$APP_NAME" == "moodimodo" ]; then
    ### Build iOS App ###

    cd ${INTERMEDIATE_PATH}
    #ionic state reset
    #echo "Generating image resources for $APP_NAME..."
    ionic resources >/dev/null
    chmod a+x ./scripts/decrypt-key.sh
    ./scripts/decrypt-key.sh
    chmod a+x ./scripts/add-key.sh
    ./scripts/add-key.sh
    gulp -v
    rm -rf plugins/ && rm -rf platforms/
    gulp addFacebookPlugin
    gulp addGooglePlusPlugin
    cordova platform add ios
    ionic resources
    gulp readKeysForCurrentApp
    gulp fixResourcesPlist
    gulp addBugsnagInObjC
#    gulp enableBitCode
    gulp addInheritedToOtherLinkerFlags
    gulp addDeploymentTarget
    gulp addPodfile
    gulp installPods
#    gulp generateXmlConfig
    #gulp makeIosApp
    chmod a+x ./scripts/package-and-upload.sh
    ./scripts/package-and-upload.sh
    ### Build iOS App ###
else
    echo "Can only build moodimodo iOS app for now"
fi
