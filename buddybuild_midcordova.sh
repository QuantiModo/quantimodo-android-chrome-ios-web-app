#!/usr/bin/env bash

echo "=== buddybuild_midcordova.sh ==="

npm install -g gulp bower

#echo "Running gulp configureAppAfterNpmInstall in buddybuild_midcordova.sh"
#gulp configureAppAfterNpmInstall

if [ -z ${BUDDYBUILD_SCHEME} ];
    then
        echo "BUILDING ANDROID APP because BUDDYBUILD_SCHEME is not set ${BUDDYBUILD_SCHEME}"
        gulp prepareRepositoryForAndroid
    else
        echo "BUILDING IOS APP because BUDDYBUILD_SCHEME env is ${BUDDYBUILD_SCHEME}"
fi
