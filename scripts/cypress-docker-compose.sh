#!/usr/bin/env bash
set -e
called=$_ && [[ ${called} != $0 ]] && echo "${BASH_SOURCE[@]} is being sourced" || echo "${0} is being run"
PARENT_SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${PARENT_SCRIPT_PATH}` && cd ${SCRIPT_FOLDER} && cd .. && export REPO_DIR="$PWD"
export RELEASE_STAGE="${RELEASE_STAGE:-production}"

cp cypress/config/cypress.${RELEASE_STAGE}.json cypress.json
set +x
if [[ -z ${DOCKERFILE_MODIFIED+x} ]]; then
    echo "DOCKERFILE_MODIFIED is unset so not doing docker-compose build";
else
    set -x
    sudo docker-compose build
fi
set +x
if [[ -z ${USE_DOCKER_FOR_NPM_INSTALL+x} ]]; then
    echo "Running npm install without docker because USE_DOCKER_FOR_NPM_INSTALL is not set";
    npm install
else
    sudo docker-compose up -d || true
    sudo docker-compose exec -T e2e bash -c "npm install"
fi
set -x
echo "Saving host environment variables to host.env to access within docker"
printenv > ${REPO_DIR}/.env
sudo docker-compose up --abort-on-container-exit --exit-code-from e2e
if [[ -f success-file ]]; then
    echo "success-file exists so I guess the cypress tests PASSED!"
else
    echo "success-file does not exist so I guess the cypress tests FAILED!"
    exit 1
fi
