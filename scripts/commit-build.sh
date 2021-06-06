#!/usr/bin/env bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER"
cd ${SCRIPT_FOLDER}
cd ..
export IONIC_PATH="$PWD"
echo "IONIC_PATH is $IONIC_PATH"
BUILD_REPO=$IONIC_PATH/tmp/qm-web-build

set -x
set -e

git config user.email "m@quantimodo.com"
git config user.name "mikepsinn"

rm -rf $BUILD_REPO || true
set +x && git clone https://${GITHUB_ACCESS_TOKEN}@github.com/mikepsinn/qm-web-build.git $BUILD_REPO || true && set -x
rm -rf $BUILD_REPO/docs/* &> /dev/null
cp -R $IONIC_PATH/src/* $BUILD_REPO/docs
cd $BUILD_REPO
git add -A  &> /dev/null
git commit -m "$BUILD_URL $CHANGE_URL"
git push

