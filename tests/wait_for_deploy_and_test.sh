#!/usr/bin/env bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && export TEST_FOLDER=`dirname ${SCRIPT_PATH}`
cd ${TEST_FOLDER} && cd .. && export IONIC=${PWD}
GIT_BRANCH=${GIT_BRANCH:-${TRAVIS_BRANCH}} && GIT_BRANCH=${GIT_BRANCH:-${BUDDYBUILD_BRANCH}} && export GIT_BRANCH=${GIT_BRANCH:-${CIRCLE_BRANCH}}
export GIT_COMMIT=${GIT_COMMIT:-${TRAVIS_COMMIT}}
if [[ -z "$START_URL" ]]; then echo "Please set START_URL env!" && exit 1; fi
COMMIT_URL=${START_URL}data/commits/${GIT_COMMIT}
until $(curl --output /dev/null --silent --head --fail ${COMMIT_URL}); do
    echo "Waiting for ${COMMIT_URL}" && sleep 30;
done
set -e && cd ${TEST_FOLDER} && gulp unit-gi-failed-gi-all