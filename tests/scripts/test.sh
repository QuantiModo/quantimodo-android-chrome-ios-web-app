#!/usr/bin/env bash
called=$_ && [[ ${called} != $0 ]] && echo "${BASH_SOURCE[@]} is being sourced" || echo "${0} is being run"
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}` && cd ${SCRIPT_FOLDER} && cd .. && export REPO_DIR="$PWD"
set -x
rm cypress.env.json || true
set +x
PKG_OK=$(dpkg-query -W --showformat='${Status}\n' xvfb|grep "install ok installed")
if [[ "" == "$PKG_OK" ]]; then
    echo "xvfb not found so installing..."
    sudo apt-get install -y xvfb libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2
fi
PKG_OK=$(dpkg-query -W --showformat='${Status}\n' nodejs|grep "install ok installed")
if [[ "" == "$PKG_OK" ]]; then
    echo "nodejs not found so installing..."
    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
set -x
set -e
npm install
set +x
echo "Saving host environment variables to host.env to access within docker"
printenv > ${REPO_DIR}/.env
echo "Creating /etc/asound.conf to deal with cannot find card '0' error message spam output"
sudo cp asound.conf /etc/asound.conf
echo -e 'pcm.!default {\n type hw\n card 0\n}\n\nctl.!default {\n type hw\n card 0\n}' > ~/.asoundrc
echo "Deleting videos because they take a ton of space..."
set -x
rm cypress/videos/* || true
#export RELEASE_STAGE=development
npm run test
#npm run test:ghostinspector