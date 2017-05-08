#!/usr/bin/env bash

echo "Running buddybuild_postclone.sh. Current folder is $PWD..."
#echo "folder contents are:"
#ls

echo "Making scripts and hooks executable..."
chmod -R a+x ./hooks
chmod -R a+x ./package-hooks
chmod -R a+x ./scripts

echo "LOWERCASE_APP_NAME is ${LOWERCASE_APP_NAME}"

if [ -z ${PREPARE_IOS_APP} ];
    then
        echo "NOT BUILDING IOS APP because PREPARE_IOS_APP env is ${PREPARE_IOS_APP}"
    else
        echo "BUILDING IOS APP because PREPARE_IOS_APP env is ${PREPARE_IOS_APP}"

        echo "Running sudo brew install imagemagick"
        brew install imagemagick

        #echo "Running npm install -g gulp bower ionic cordova"
        #sudo npm install -g gulp bower ionic cordova  # Done in gulpfile now

        #echo "Running npm install"
        #npm install  # Done in gulpfile now

        #echo "gulp prepareIosApp"
        #gulp prepareIosApp  # Done in gulpfile now
fi

if [ -z ${BUILD_ANDROID} ];
    then
        echo "NOT BUILDING ANDROID APP because BUILD_ANDROID env is not true"
    else
        echo "BUILDING ANDROID APP because BUILD_ANDROID is true"

        echo "Running apt-get install imagemagick"
        echo password | sudo -S apt-get install imagemagick

        echo "Running npm install -g gulp bower ionic cordova"
        npm install -g gulp bower ionic cordova

        npm install
        gulp configureAppAfterNpmInstall

        #echo "Running npm install"
        #npm install  # Done in gulpfile now

        #echo "gulp buildQuantiModoAndroid"
        #gulp buildQuantiModoAndroid  # Done in gulpfile now
fi
