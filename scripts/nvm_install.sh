#!/usr/bin/env bash

sudo apt-get update
sudo apt-get install build-essential libssl-dev
sudo curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash

echo "You'll probably have to restart the script to use nvm"