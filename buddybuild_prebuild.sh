#!/usr/bin/env bash

echo "Running buddybuild_prebuild.sh. Current folder is $PWD and folder contents are:"
ls

echo "PREPARE_IOS_APP env is ${PREPARE_IOS_APP}"

echo "LOWERCASE_APP_NAME is ${LOWERCASE_APP_NAME}"

gulp getCommonVariables

#echo "cd ../.. && gulp prepareQuantiModoIos && cd platforms/ios"
#cd ../.. && gulp prepareQuantiModoIos && cd platforms/ios