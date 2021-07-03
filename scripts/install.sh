#!/bin/bash
# shellcheck disable=SC2006
# shellcheck disable=SC2086
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
set -e
set +x
command -v nvm >/dev/null 2>&1 || {
    echo >&2 "nvm is required, but it's not installed.  Trying to install it now...";
    echo "Installing curl..."
    sudo apt install -y curl
    echo "Installing nvm..."
    curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash;
    echo "Loading nvm command for shell access..."
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")";
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
}
set -x
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
