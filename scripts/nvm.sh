#!/bin/bash
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
