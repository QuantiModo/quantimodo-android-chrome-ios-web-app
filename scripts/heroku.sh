#!/bin/bash
set +x
set -e
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
# shellcheck source=./log_start.sh
cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && source "$IONIC_PATH"/scripts/log_start.sh "${BASH_SOURCE[0]}"
set -xe
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
git push git@heroku.com:medimodo.git HEAD:master -f;
# shellcheck source=./log_end.sh
source "$IONIC_PATH"/scripts/log_end.sh "${BASH_SOURCE[0]}"
