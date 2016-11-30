#!/usr/bin/env bash

SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd ${SCRIPT_FOLDER}
cd ..
export IONIC_PATH="$PWD"
echo "IONIC_PATH is $IONIC_PATH"

sudo bash ${IONIC_PATH}/scripts/android_sdk_install.sh

sudo curl -sSL https://get.docker.com/ | sh

sudo bash ${IONIC_PATH}/scripts/node_js_install.sh

sudo ${IONIC_PATH}/scripts/nvm_install.sh

nvm install 4.4.4
nvm use 4.4.4

echo -e "${GREEN}Installing Ionic...${DEFAULT}"
sudo npm install -g cordova ionic

echo -e "${GREEN}Installing Gulp...${DEFAULT}"
sudo npm install -g gulp

echo -e "${GREEN}Installing Bower...${DEFAULT}"
sudo npm install -g bower

sudo chmod -R 777 /usr/local/lib
sudo chmod -R 777 /usr/lib/node_modules

sudo mkdir /home/ubuntu/Dropbox/QuantiModo
sudo mkdir /home/ubuntu/Dropbox/QuantiModo/apps
sudo chmod -R 777 /home/ubuntu/Dropbox/QuantiModo
sudo usermod -a -G ubuntu jenkins

ionic info
sudo chmod 777 -R $PWD
sudo chmod -R 770 ${IONIC_PATH}/scripts