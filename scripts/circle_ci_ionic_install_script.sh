#!/usr/bin/env bash
npm install -g ionic@1.7.16
npm install -g cordova@6.0.x
npm install -g bamlab/cordova-deploy
npm install
npm install -g karma-cli bower
bower install
ionic config build