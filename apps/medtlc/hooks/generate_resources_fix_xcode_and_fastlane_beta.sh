#!/usr/bin/env bash
npm rebuild node-sass
ionic resources
if [ -z "${APP_DISPLAY_NAME}" ]
    then
      export APP_DISPLAY_NAME=MedTLC
      echo -e "${RED}APP_DISPLAY_NAME env is not defined so assuming it to be ${APP_DISPLAY_NAME}${NC}"
fi
if [ -z "${LOWERCASE_APP_NAME}" ]
    then
      export LOWERCASE_APP_NAME=medtlc
      echo -e "${RED}LOWERCASE_APP_NAME env is not defined so assuming it to be ${LOWERCASE_APP_NAME}${NC}"
fi
ruby hooks/after_platform_add.bak/xcodeprojectfix.rb
# Commented due to podfile.lock error
#npm install
#gulp addBugsnagInObjC
#gulp enableBitCode
#gulp addDeploymentTarget
#gulp addPodfile
#gulp installPods
fastlane beta