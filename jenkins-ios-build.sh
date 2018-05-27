#!/usr/bin/env bash
#printenv
set -x
bundle install
bundle update
yarn install
fastlane add_plugin upgrade_super_old_xcode_project
fastlane add_plugin cordova
fastlane add_plugin ionic

gulp prepareMediModoIos
export APP_IDENTIFIER=com.quantimodo.medimodo
export APP_DISPLAY_NAME=MediModo
export QUANTIMODO_CLIENT_ID=medimodo
fastlane deploy

gulp prepareMoodiModoIos
export APP_IDENTIFIER=com.quantimodo.moodimodoapp
export APP_DISPLAY_NAME=MoodiModo
export QUANTIMODO_CLIENT_ID=moodimodoapp
fastlane deploy

gulp prepareQuantiModoIos
export APP_IDENTIFIER=com.quantimodo.quantimodo
export APP_DISPLAY_NAME=QuantiModo
export QUANTIMODO_CLIENT_ID=quantimodo
fastlane deploy
