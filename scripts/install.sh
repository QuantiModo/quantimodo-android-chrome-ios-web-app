#!/bin/bash
# shellcheck disable=SC2006
# shellcheck disable=SC2086
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
set -xe
nvm install 10
nvm use 10
node -v
npm install
if [[ ${NODE_NAME} = "sonicmaster-ubuntu" ]];
    then
        echo "Have to run rebuild node-sass on sonicmaster slave.  TODO: Remove this";
        npm rebuild node-sass;
fi
npm run configure:app
