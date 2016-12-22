#!/usr/bin/env bash

echo "Running buddybuild_postclone.sh. Current folder is $PWD..."
#echo "folder contents are:"
#ls

echo "PREPARE_IOS_APP env is ${PREPARE_IOS_APP}"

echo "Making scripts and hooks executable..."
chmod -R a+x ./hooks
chmod -R a+x ./package-hooks
chmod -R a+x ./scripts

echo "Running sudo brew install imagemagick"
brew install imagemagick

echo "Running sudo npm install -g gulp bower"
sudo npm install -g gulp bower

echo "Running npm install"
npm install

echo "gulp prepareQuantiModoIos"
gulp prepareQuantiModoIos

ionic platform remove android
ionic platform add ios