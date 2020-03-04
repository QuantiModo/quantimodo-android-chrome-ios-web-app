#!/usr/bin/env bash
set -e
called=$_ && [[ ${called} != $0 ]] && echo "${BASH_SOURCE[@]} is being sourced" || echo "${0} is being run"
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
SCRIPT_FOLDER=`dirname ${SCRIPT_PATH}` && cd ${SCRIPT_FOLDER} && cd .. && export QM_API="$PWD"
export RELEASE_STAGE=ionic
TEST_REPO=${QM_API}/tmp/quantimodo-sdk-javascript
if [[ -d "${TEST_REPO}" ]]
then
    echo "Skipping clone because ${TEST_REPO} exists...."
else
    git clone https://github.com/quantimodo/quantimodo-sdk-javascript.git ${TEST_REPO} || true
fi
set -x
cd ${TEST_REPO}
git stash
set +x
branch=`git branch | grep "\*" | cut -d " " -f 2-9`;
if [[ "$branch" != "develop" ]]; then git checkout develop || true; fi
set -x
git pull origin develop;
#source scripts/cypress-docker-compose.sh
#sudo chown -R $USER ~/.npm
#sudo chown -R $USER /usr/lib/node_modules
#sudo chown -R $USER /usr/local/lib/node_modules
#npm i -g gulp-cli
export CYPRESS_RETRIES=2
source scripts/test.sh