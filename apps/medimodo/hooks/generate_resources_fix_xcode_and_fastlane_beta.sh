#!/usr/bin/env bash
npm rebuild node-sass
ionic resources
if [ -z "${APP_DISPLAY_NAME}" ]
    then
      export APP_DISPLAY_NAME=MediModo
      echo -e "${RED}APP_DISPLAY_NAME env is not defined so assuming it to be ${APP_DISPLAY_NAME}${NC}"
fi
if [ -z "${QUANTIMODO_CLIENT_ID}" ]
    then
      export QUANTIMODO_CLIENT_ID=medimodo
      echo -e "${RED}QUANTIMODO_CLIENT_ID env is not defined so assuming it to be ${QUANTIMODO_CLIENT_ID}${NC}"
fi
ruby hooks/after_platform_add.bak/xcodeprojectfix.rb
# Commented due to podfile.lock error
#npm install && gulp configureApp
#gulp addBugsnagInObjC
#gulp enableBitCode
#gulp addDeploymentTarget
#gulp addPodfile
#gulp installPods
fastlane beta