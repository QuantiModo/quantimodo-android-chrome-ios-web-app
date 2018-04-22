#!/usr/bin/env bash

gulp _build-all-chromeAndAndroidApps
#gulp _build-qm-android  # Did not solve "Your build has exceeded the memory limit of 4G on 1 container"
if [ ! -f platforms/android/build/outputs/apk/android-armv7-release.apk ]; then exit 1; fi
if [ -f platforms/android/build/outputs/apk/android-armv7-release.apk ]; then echo "Successfully built Android app" ; fi
cp -r build/*.zip ${CIRCLE_ARTIFACTS}
