#!/usr/bin/env bash

echo "Running buddybuild_prebuild.sh. Current folder is $PWD and folder contents are:"
ls

echo "PREPARE_IOS_APP env is ${PREPARE_IOS_APP}"

echo "cd ../.. && gulp prepareQuantiModoIos && cd platforms/ios"
cd ../.. && gulp prepareQuantiModoIos && cd platforms/ios