#!/usr/bin/env bash
npm rebuild node-sass
ionic resources
if [ -z "${APP_DISPLAY_NAME}" ]
    then
      export APP_DISPLAY_NAME=MoodiModo
      echo -e "${RED}APP_DISPLAY_NAME env is not defined so assuming it to be ${APP_DISPLAY_NAME}${NC}"
      exit 1
fi
ruby hooks/after_platform_add.bak/xcodeprojectfix.rb
fastlane beta