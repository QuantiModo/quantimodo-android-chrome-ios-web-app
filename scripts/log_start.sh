#!/bin/bash
set +x
LOGGER_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPTS_FOLDER=$(dirname "${LOGGER_SCRIPT_PATH}")
cd "${SCRIPTS_FOLDER}" || exit 1
cd ..
PARENT_SCRIPT_PATH=$1
export REPO_BASE_WITH_SLASH="$PWD/"
REPLACEMENT=""
CALLER_SCRIPT_WITHOUT_REPO="${PARENT_SCRIPT_PATH/$REPO_BASE_WITH_SLASH/$REPLACEMENT}"
echo "STARTING $CALLER_SCRIPT_WITHOUT_REPO"
echo "====================================="
