#!/usr/bin/env bash

echo "Running buddybuild_postclone.sh. Current folder is $PWD and folder contents are:"
ls

echo "Making scripts and hooks executable..."
chmod -R a+x ./hooks
chmod -R a+x ./package-hooks
chmod -R a+x ./scripts

echo "Running sudo brew install imagemagick"
brew install imagemagick

echo "Running sudo npm install -g gulp bower ionic cordova"
sudo npm install -g gulp bower

export PREPARE_IOS_APP=1