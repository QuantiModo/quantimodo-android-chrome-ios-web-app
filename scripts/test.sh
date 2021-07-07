#!/bin/bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=$(dirname "${SCRIPT_PATH}")
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_start.sh
set -xe
sudo bash "${SCRIPT_FOLDER}"/output_commit_message_and_env.sh
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh

set -e
npm run types
npm run test:mocha
if [[ ${GIT_BRANCH} = "origin/develop" ]]; then bash "${SCRIPT_FOLDER}"/commit-build.sh && exit 0; fi
if [[ ${GIT_BRANCH} != *"feature"* && ${GIT_BRANCH} != *"renovate"* ]]; then exit 0; fi
git push git@heroku.com:medimodo.git HEAD:master -f;
# shellcheck source=./cypress_install.sh
source "${SCRIPT_FOLDER}"/cypress_install.sh
npm run cy:run
if [[ ! -f success-file ]] ; then
    echo 'success-file is not there, aborting.'
    exit 1
else
	echo "success-file exists so running ghostinspector tests..."
fi
npm run test:ghostinspector
# shellcheck source=./log_end.sh
source "$IONIC_PATH"/scripts/log_end.sh
