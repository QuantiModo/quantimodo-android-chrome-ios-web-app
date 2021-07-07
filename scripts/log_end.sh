#!/bin/bash
set +x
LOGGER_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPTS_FOLDER=$(dirname "${LOGGER_SCRIPT_PATH}")
cd "${SCRIPTS_FOLDER}" || exit 1
cd ..
export REPO_BASE_WITH_SLASH="$PWD/"
PARENT_SCRIPT_PATH=$1
REPLACEMENT=""
CALLER_SCRIPT_WITHOUT_REPO="${PARENT_SCRIPT_PATH/$REPO_BASE_WITH_SLASH/$REPLACEMENT}"
echo "====================================="
echo "DONE WITH $CALLER_SCRIPT_WITHOUT_REPO"
