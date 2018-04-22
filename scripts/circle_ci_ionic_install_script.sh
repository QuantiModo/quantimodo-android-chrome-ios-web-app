#!/usr/bin/env bash
npm install -g gulp cordova@6.5.0 ionic@2.2.3 bower cordova-hot-code-push-cli # Adding plugins from Github doesn't work on cordova@7.0.0
npm install -g bamlab/cordova-deploy
npm install && gulp configureApp
npm install -g karma-cli
bower install --allow-root
#ionic config build
