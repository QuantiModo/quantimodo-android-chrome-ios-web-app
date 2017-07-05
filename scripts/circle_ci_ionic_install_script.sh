#!/usr/bin/env bash
npm install -g gulp cordova@7.0.0 ionic@2.2.3 bower
npm install -g bamlab/cordova-deploy
npm install && gulp configureApp
npm install -g karma-cli
bower install
ionic config build
