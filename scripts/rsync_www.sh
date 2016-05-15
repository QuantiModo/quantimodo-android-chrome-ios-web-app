#!/usr/bin/env bash

PROJECT_ROOT=/vagrant
IONIC_PATH="${PROJECT_ROOT}/public.built/ionic/Modo"
CHROME_EXTENSION_PATH="${IONIC_PATH}/resources/chrome_extension"

APP_PATH=${IONIC_PATH}/resources/chrome_app
APP_CONFIG=${PROJECT_ROOT}/configs/ionic/${LOWERCASE_APP_NAME}.config.js

# rsync -a /vagrant/public.built/ionic/Modo/www/ /vagrant/public.built/ionic/Modo/resources/chrome_extension/www

while :
do
    now=$(date +"%T")
    echo "Current time : $now"
    rsync -a /vagrant/public.built/ionic/Modo/www/ /vagrant/public.built/ionic/Modo/resources/chrome_extension/www
    echo "Synced www to resources/chrome_extension/www. Sleeping 5 seconds."
    sleep 5
done