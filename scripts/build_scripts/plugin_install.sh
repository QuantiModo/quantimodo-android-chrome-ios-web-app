#!/usr/bin/env bash
echo "This script is an alternative to ionic state restore. I'm using it because ionic state restore is failing on OSX"
export GCM_SENDER_ID="1052648855194"
export REVERSED_CLIENT_ID="com.googleusercontent.apps.1052648855194-djmit92q5bbglkontak0vdc7lafupt0d"
export FACEBOOK_APP_ID=225078261031461
export FACEBOOK_APP_NAME=QuantiModo

ionic plugin add https://github.com/katzer/cordova-plugin-local-notifications#a3f2be443b4d4539557611b5081453a7bfd1be46
ionic plugin add cordova-plugin-device
ionic plugin add cordova-plugin-console
ionic plugin add cordova-plugin-whitelist
ionic plugin add cordova-plugin-splashscreen
ionic plugin add ionic-plugin-keyboard
ionic plugin add https://github.com/apache/cordova-plugin-inappbrowser
ionic plugin add cordova-plugin-statusbar
ionic plugin add cordova-plugin-datepicker
ionic plugin add cordova-plugin-file-opener2
ionic plugin add cordova-plugin-ios-non-exempt-encryption
ionic plugin add cordova-plugin-email-composer
ionic plugin add cordova-plugin-geolocation
ionic plugin add cordova-plugin-facebook4@1.7.1 --save --variable APP_ID="${FACEBOOK_APP_ID}" --variable APP_NAME="${FACEBOOK_APP_NAME}"
ionic plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git --variable REVERSED_CLIENT_ID=${REVERSED_CLIENT_ID}
ionic plugin add phonegap-plugin-push --variable SENDER_ID="${GCM_SENDER_ID}"

ionic add ionic-platform-web-client
ionic io init
ionic config set dev_push false
ionic config set gcm_key ${GCM_SENDER_ID}
ionic config build