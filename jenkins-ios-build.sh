#!/usr/bin/env bash
#printenv
bundle install
bundle update
yarn install
fastlane add_plugin upgrade_super_old_xcode_project
fastlane add_plugin cordova
fastlane add_plugin ionic

gulp prepareMoodiModoIos
export APP_IDENTIFIER=com.quantimodo.moodimodoapp
export APP_DISPLAY_NAME=MoodiModo
fastlane deploy

gulp prepareMediModoIos
export APP_IDENTIFIER=com.quantimodo.medimodo
export APP_DISPLAY_NAME=MediModo
fastlane deploy

gulp prepareQuantiModoIos
export APP_IDENTIFIER=com.quantimodo.quantimodo
export APP_DISPLAY_NAME=QuantiModo
fastlane deploy
