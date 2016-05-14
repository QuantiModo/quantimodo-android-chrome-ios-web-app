#!/bin/bash

echo "DO NOT RUN THIS SCRIPT AS ROOT WITH SUDO!  IF YOU DID, PRESS CONROL-C NOW!"
sleep 5

git config --global user.email "m@quantimodo.com"
git config --global user.name "Mike Sinn"

if ! type "zip" > /dev/null;
  then
    echo -e "${GREEN}Installing zip package...${NC}"
    apt-get install zip -y
  else
    echo -e "${GREEN}Zip package already installed...${NC}"
fi

cd ${INTERMEDIATE_PATH}
brew update && brew upgrade
brew prune
echo "npm cache clean"
npm cache clean
echo "brew install nvm"
brew install nvm
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
echo "Using node 4.4.4 because 6 seems to break stuff: https://github.com/steelbrain/exec/issues/13"
nvm install 4.4.4
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

cd "${INTERMEDIATE_PATH}" && npm install && bower install
#npm rebuild node-sass
