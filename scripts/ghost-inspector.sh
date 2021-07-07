#!/bin/bash
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=$(dirname "${PARENT_SCRIPT_PATH}")
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
# shellcheck source=./log_start.sh
source "$IONIC_PATH"/scripts/log_start.sh
set -xe
npm run test:ghostinspector
# shellcheck source=./log_end.sh
source "$IONIC_PATH"/scripts/log_end.sh
