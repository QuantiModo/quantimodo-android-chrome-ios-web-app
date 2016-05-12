#!/bin/bash
#Example Usage: bash tooling/scripts/apps/build_all_apps.sh $PWD $PWD/build"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
VERSION_NUMBER=1.2.0
PROJECT_ROOT="$PWD"

if [ -z "$ANDROID_HOME" ]
  then
  echo -e "${RED} Android home doesn't exist. On OSX, you can set it like this: http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x "
  exit
fi

if [ -z "$1" ]
  then
  echo -e "No Android keystore password first argument given to build_all_apps.sh..."
else
    ANDROID_KEYSTORE_PASSWORD="$1"
fi

if [ -z "$ANDROID_KEYSTORE_PASSWORD" ]
  then
  echo -e "${RED} ANDROID_KEYSTORE_PASSWORD doesn't exist for build_all_apps.sh! Quitting! "
  exit
fi

if [ -z "$2" ]
  then
    BUILD_PATH="${PROJECT_ROOT}/build"
    echo "No build path 2nd argument given. Using $BUILD_PATH..."
else
    BUILD_PATH="$2"
fi

cd ${PROJECT_ROOT}
#brew update && brew upgrade
#brew prune
#echo "npm cache clean"
#npm cache clean
#echo "brew install nvm"
#brew install nvm
#export NVM_DIR=~/.nvm
#source $(brew --prefix nvm)/nvm.sh
echo "Using node 4.4.4 because 6 seems to break stuff: https://github.com/steelbrain/exec/issues/13"
#nvm install 4.4.4
nvm use 4.4.4
npm install -g bower
brew install ruby
gem install pilot
gem install xcodeproj -v 0.28.2
gem install cocoapods -v 0.39.0
npm install -g gulp@3.9.0
npm install -g grunt-cli@0.1.13
npm install -g cordova@5.4.0
npm install -g ionic@1.7.10

cd "${PROJECT_ROOT}" && npm install && bower install
#npm rebuild node-sass

export APP_NAME=moodimodo
run-parts ${PROJECT_ROOT}/scripts/build/

export APP_NAME=mindfirst
run-parts ${PROJECT_ROOT}/scripts/build/

export APP_NAME=energymodo
run-parts ${PROJECT_ROOT}/scripts/build/

export APP_NAME=medtlc
run-parts ${PROJECT_ROOT}/scripts/build/
