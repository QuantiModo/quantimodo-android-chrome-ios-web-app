#!/usr/bin/env bash

gulp buildAllChromeExtensionsAndAndroidApps
if [ ! -f platforms/android/build/outputs/apk/android-armv7-release.apk ]; then exit 1; fi
if [ -f platforms/android/build/outputs/apk/android-armv7-release.apk ]; then echo "Succesfully built Android app" ; fi
cp -r build/*.zip $CIRCLE_ARTIFACTS
cp -r dropbox/* $CIRCLE_ARTIFACTS