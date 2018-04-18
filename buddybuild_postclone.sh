#!/usr/bin/env bash

echo "=== buddybuild_postclone.sh ==="

#echo "ENVIRONMENTAL VARIABLES"
#printenv | more

echo "Current folder is $PWD..."
#echo "folder contents are:"
#ls

echo "Making scripts and hooks executable..."
chmod -R a+x ./hooks
chmod -R a+x ./hooks
chmod -R a+x ./scripts

echo "Running npm install -g gulp bower ionic cordova"
npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower # Adding plugins from Github doesn't work on cordova@7.0.0

echo "QUANTIMODO_CLIENT_ID is ${QUANTIMODO_CLIENT_ID}"

if [ -z "${BUDDYBUILD_SCHEME}" ];
    then
        echo "NOT BUILDING IOS APP because BUDDYBUILD_SCHEME env is not set ${BUDDYBUILD_SCHEME}"
        echo "BUILDING ANDROID APP because BUDDYBUILD_SCHEME is not set ${BUDDYBUILD_SCHEME}"

        echo "password | sudo -S apt-get update"
        echo password | sudo -S apt-get update

        echo "Running apt-get install -y imagemagick"
        echo password | sudo -S apt-get install -y imagemagick

    else
        echo "BUILDING IOS APP because BUDDYBUILD_SCHEME env is ${BUDDYBUILD_SCHEME}"
        echo "NOT BUILDING ANDROID APP because BUDDYBUILD_SCHEME env is set"
        echo "Running sudo brew install imagemagick"
        brew install imagemagick

        #echo "Running npm install -g gulp bower ionic cordova"
        #sudo npm install -g gulp bower ionic cordova  # Done in gulpfile now

        #echo "Running npm install"
        #npm install  # Done in gulpfile now

        #echo "gulp prepareIosApp"
        #gulp prepareIosApp  # Done in gulpfile now
fi
