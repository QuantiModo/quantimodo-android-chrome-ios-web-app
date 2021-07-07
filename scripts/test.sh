#!/bin/bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=$(dirname "${SCRIPT_PATH}")
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_start.sh
set -xe
sudo bash "${SCRIPT_FOLDER}"/output_commit_message_and_env.sh
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
# shellcheck source=./mocha.sh
source "$SCRIPT_FOLDER"/mocha.sh
if [[ ${GIT_BRANCH} = "origin/develop" ]]; then bash "${SCRIPT_FOLDER}"/commit-build.sh && exit 0; fi
if [[ ${GIT_BRANCH} != *"feature"* && ${GIT_BRANCH} != *"renovate"* ]]; then exit 0; fi
# shellcheck source=./heroku.sh
source "${SCRIPT_FOLDER}"/heroku.sh
# shellcheck source=./cypress_install.sh
source "${SCRIPT_FOLDER}"/cypress_install.sh
# shellcheck source=./cypress_run.sh
source "${SCRIPT_FOLDER}"/cypress_run.sh
# shellcheck source=./ghost-inspector.sh
source "${SCRIPT_FOLDER}"/ghost-inspector.sh
# shellcheck source=./log_end.sh
source "$IONIC_PATH"/scripts/log_end.sh
