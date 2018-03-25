#!/bin/bash

if [ -z "$CORDOVA_CACHE" ]
    then
        echo -e "Add an environment variable to your system (or build) called CORDOVA_CACHE pointing to where you want to create cache of the different versions of the Cordova CLI used to build your projects.  See http://taco.visualstudio.com/en-us/docs/general/"
        exit 1
fi

if [ -z "$KEYCHAIN_PWD" ]
    then
        echo -e "Please set KEYCHAIN_PWD env!"
        exit 1
fi


if [ -z "$ENCRYPTION_SECRET" ]
    then
        echo -e "Please set ENCRYPTION_SECRET env!"
        exit 1
fi

echo

echo "sudo npm cache clear"
sudo npm cache clear

echo "sudo chown -R `whoami` ~/.npm"
sudo chown -R `whoami` ~/.npm

echo "Making hooks and scripts executable"
sudo chmod +x scripts/*
sudo chmod +x hooks/*
sudo chmod +x hooks/*
sudo chmod +x setup-cordova.js

echo "npm install"
npm install

echo "node setup-cordova.js"
node setup-cordova.js

if [ ! -d "platforms/android" ];
    echo "platforms/android not found so adding it..."
    then ./cordova.sh platform add android;
fi;

if [ ! -d "platforms/ios" ];
    echo "platforms/ios not found so adding it..."
    then ./cordova.sh platform add ios;
fi;

security unlock-keychain -p ${KEYCHAIN_PWD} ${HOME}/Library/Keychains/login.keychain
./cordova.sh build ios --device --release
