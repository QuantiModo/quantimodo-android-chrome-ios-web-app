#!/usr/bin/env bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && export TEST_FOLDER=`dirname ${SCRIPT_PATH}`
cd ${TEST_FOLDER} && cd .. && export IONIC=${PWD}
GIT_BRANCH=${GIT_BRANCH:-${TRAVIS_BRANCH}} && GIT_BRANCH=${GIT_BRANCH:-${BUDDYBUILD_BRANCH}} && export GIT_BRANCH=${GIT_BRANCH:-${CIRCLE_BRANCH}}
export GIT_COMMIT=${GIT_COMMIT:-${TRAVIS_COMMIT}}
if [[ ${GIT_BRANCH} == *"feature"* ]]; then SUB_DOMAIN=dev; fi
if [[ ${GIT_BRANCH} == *"renovate"* ]]; then SUB_DOMAIN=dev; fi
if [[ ${GIT_BRANCH} == *"develop"* ]]; then SUB_DOMAIN=qa; fi
if [[ ${GIT_BRANCH} == *"master"* ]]; then SUB_DOMAIN=production; fi
export START_URL=https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/${SUB_DOMAIN}/index.html
export COMMIT_URL=https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/${SUB_DOMAIN}/data/commits/${GIT_COMMIT}
source ${TEST_FOLDER}/wait_for_deploy_and_test.sh