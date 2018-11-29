#!/usr/bin/env bash
GIT_BRANCH=${GIT_BRANCH:-${TRAVIS_BRANCH}} && GIT_BRANCH=${GIT_BRANCH:-${BUDDYBUILD_BRANCH}} && export GIT_BRANCH=${GIT_BRANCH:-${CIRCLE_BRANCH}}
export GIT_COMMIT=${GIT_COMMIT:-${TRAVIS_COMMIT}}
gulp buildAndroidAfterCleaning
if [[ ${GIT_BRANCH} == *"feature"* ]]; then SUB_DOMAIN=dev; fi
if [[ ${GIT_BRANCH} == *"renovate"* ]]; then SUB_DOMAIN=dev; fi
if [[ ${GIT_BRANCH} == *"develop"* ]]; then SUB_DOMAIN=qa; fi
if [[ ${GIT_BRANCH} == *"master"* ]]; then SUB_DOMAIN=production; fi
START_URL=https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/${SUB_DOMAIN}/ && COMMIT_URL=${START_URL}data/commits/${GIT_COMMIT}
until $(curl --output /dev/null --silent --head --fail ${COMMIT_URL}); do
    echo "Waiting for ${COMMIT_URL}" && sleep 30;
done
set -e && cd tests && gulp unit-gi-failed-gi-all