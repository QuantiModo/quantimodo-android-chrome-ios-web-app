#!/usr/bin/env bash

sudo npm install -g gulp bower ionic cordova
echo "Running sudo npm install -g gulp bower ionic cordova"
sudo brew install imagemagick
echo "Running sudo brew install imagemagick"
npm install
echo "Running npm install"
gulp prepareQuantiModoIos
echo "Running gulp prepareQuantiModoIos"
gulp buildAndReleaseIosApp
echo "Running gulp buildAndReleaseIosApp"