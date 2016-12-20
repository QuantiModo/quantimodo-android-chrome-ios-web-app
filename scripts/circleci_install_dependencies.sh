#!/usr/bin/env bash

npm install -g gulp cordova ionic bower
npm install
      # Android SDK Platform 25
if [ ! -d "/usr/local/android-sdk-linux/platforms/android-25" ]; then echo y | android update sdk --no-ui --all --filter "android-25"; fi
      # Android SDK Build-tools, revision 25.0.0
if [ ! -d "/usr/local/android-sdk-linux/build-tools/25.0.5" ]; then echo y | android update sdk --no-ui --all --filter "build-tools-25.0.5"; fi
      # Android Support Repository, revision 39 / Local Maven repository for Support Libraries
if [ ! -d "/usr/local/android-sdk-linux/extras/android/m2repository/com/android/support/design/25.0.0" ]; then echo y | android update sdk --no-ui --all --filter "extra-android-m2repository"; fi
echo y | android update sdk --no-ui --all --filter "android-24"
echo y | android update sdk --no-ui --all --filter "extra-google-m2repository"