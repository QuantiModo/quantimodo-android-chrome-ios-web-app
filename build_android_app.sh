#!/usr/bin/env bash
# Run from root of Ionic repo
ionic plugin add cordova-plugin-inappbrowser
ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
ionic build android