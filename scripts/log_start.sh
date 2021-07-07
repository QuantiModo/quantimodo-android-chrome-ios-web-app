#!/bin/bash
set +x
THIS_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPTS_FOLDER=$(dirname "${THIS_SCRIPT_PATH}")
cd "${SCRIPTS_FOLDER}" || exit 1
cd ..
export QM_API_WITH_SLASH="$PWD/"
CALLER_SCRIPT_MAYBE_WITH_REPO=$0
REPLACEMENT=""
CALLER_SCRIPT_WITHOUT_REPO="${CALLER_SCRIPT_MAYBE_WITH_REPO/$QM_API_WITH_SLASH/$REPLACEMENT}"

echo "STARTING $CALLER_SCRIPT_WITHOUT_REPO"
echo "====================================="
