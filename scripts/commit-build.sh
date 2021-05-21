#!/usr/bin/env bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd ${SCRIPT_FOLDER}
cd ..
export IONIC_PATH="$PWD"
echo "IONIC_PATH is $IONIC_PATH"
BUILD_REPO=$IONIC_PATH/tmp/qm-web-build/

git clone https://${GITHUB_TOKEN}@github.com/mikepsinn/qm-web-build.git $BUILD_REPO
rm -rf $BUILD_REPO/www
cp -R $IONIC_PATH/www $BUILD_REPO/
cd $BUILD_REPO
git add -A
git commit -m "updated by travis build #$TRAVIS_BUILD_NUMBER"
git push --quiet origin master > /dev/null 2>&1
