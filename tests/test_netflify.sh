#!/usr/bin/env bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && export TEST_FOLDER=`dirname ${SCRIPT_PATH}`
cd ${TEST_FOLDER} && cd .. && export IONIC=${PWD}
GIT_BRANCH=${GIT_BRANCH:-${TRAVIS_BRANCH}} && GIT_BRANCH=${GIT_BRANCH:-${BUDDYBUILD_BRANCH}} && export GIT_BRANCH=${GIT_BRANCH:-${CIRCLE_BRANCH}}
export GIT_COMMIT=${GIT_COMMIT:-${TRAVIS_COMMIT}}
echo "=== NETLIFY TESTING ==="
case ${GIT_BRANCH} in
    *"develop"*)
        SUB_DOMAIN="staging-web";;
    *"master"*)
        SUB_DOMAIN="web";;
    *)
        echo "Branch ${GIT_BRANCH} is not deployed to NETLIFY!" && exit 1;;
esac
START_URL=https://${SUB_DOMAIN}.quantimo.do/
source ${TEST_FOLDER}/wait_for_deploy_and_test.sh