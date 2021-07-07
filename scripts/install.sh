#!/bin/bash
# shellcheck disable=SC2006
# shellcheck disable=SC2086
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
# shellcheck source=./log_start.sh
source $IONIC_PATH/scripts/log_start.sh
set -e
set -x
# shellcheck source=./no-root.sh
source "$SCRIPT_FOLDER"/no-root.sh
sudo chown -R $USER ~/.nvm || true
set +x
echo "nvm install 10..."
nvm install 10
echo "nvm use 10..."
nvm use 10
set -x
node -v
npm install
if [[ ${NODE_NAME} = "sonicmaster-ubuntu" ]];
    then
        echo "Have to run rebuild node-sass on sonicmaster slave.  TODO: Remove this";
        npm rebuild node-sass;
fi
npm run configure:app
# shellcheck source=./log_start.sh
source $IONIC_PATH/scripts/log_end.sh
