#!/bin/bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
set -xe
sudo bash "${SCRIPT_FOLDER}"/output_commit_message_and_env.sh

set -e
npm run test:mocha
if [[ ${GIT_BRANCH} = "origin/develop" ]]; then bash "${SCRIPT_FOLDER}"/commit-build.sh && exit 0; fi
if [[ ${GIT_BRANCH} != *"feature"* && ${GIT_BRANCH} != *"renovate"* ]]; then exit 0; fi
git push git@heroku.com:medimodo.git HEAD:master -f;
source "${SCRIPT_FOLDER}"/cypress_install.sh
npm run cy:run
if [[ ! -f success-file ]] ; then
    echo 'success-file is not there, aborting.'
    exit 1
else
	echo "success-file exists so running ghostinspector tests..."
fi
npm run test:ghostinspector
