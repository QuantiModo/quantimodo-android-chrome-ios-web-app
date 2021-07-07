#!/bin/bash
# shellcheck disable=SC2086
# shellcheck disable=SC2006
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}`
echo "SCRIPT_FOLDER is $SCRIPT_FOLDER" && cd "${SCRIPT_FOLDER}" && cd .. && export IONIC_PATH="$PWD" && echo "IONIC_PATH is $IONIC_PATH"
source "$SCRIPT_FOLDER"/no-root.sh
set +x
sudo chown -R $USER ~/.nvm
command -v nvm >/dev/null 2>&1 || {
    echo >&2 "nvm is required, but it's not installed.  Trying to install it now...";
    echo "Installing curl..."
    sudo apt install -y curl
    echo "Installing nvm..."
    curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash;
    echo "Loading nvm command for shell access..."
    # shellcheck disable=SC2155
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")";
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
}
