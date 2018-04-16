#!/usr/bin/env bash
npm install -g gulp cordova@7.1.0 ionic@2.2.3 bower yarn # Adding plugins from Github doesn't work on cordova@7.0.0
npm install -g bamlab/cordova-deploy
npm install && gulp configureApp
npm install -g karma-cli
bower install --allow-root
#ionic config build
