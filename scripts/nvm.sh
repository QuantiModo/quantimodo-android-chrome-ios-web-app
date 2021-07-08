#!/bin/bash
# shellcheck disable=SC2086
# shellcheck disable=SC2006
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
set +x
sudo chown -R $USER ~/.nvm
command -v nvm >/dev/null 2>&1 || {
    echo >&2 "nvm is required, but it's not installed.  Trying to install it now...";
    # shellcheck source=./nvm_load.sh
    source "$IONIC_PATH"/scripts/install.sh
}
# shellcheck source=./nvm_load.sh
source "$IONIC_PATH"/scripts/nvm_load.sh
set +x
echo "nvm install $1..."
nvm install $1
echo "nvm use $1..."
nvm use $1
set -x
node -v
