#!/usr/bin/env bash
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")" && export TEST_FOLDER=`dirname ${SCRIPT_PATH}`
cd ${TEST_FOLDER} && cd .. && export IONIC=${PWD}
if [[ -z "$START_URL" ]]; then
    START_URL=https://medimodo.herokuapp.com/
    echo "No START_URL specified so falling back to $START_URL"
    cd ${IONIC} && git push git@heroku.com:medimodo.git master -ff
else
    echo "Using START_URL env $START_URL"
fi
if [[ -z "$GI_API_KEY" ]]; then echo "Please set GI_API_KEY env!  You can get it here: https://app.ghostinspector.com/account" && exit 1; fi
export GI_BASE_URL=https://api.ghostinspector.com/v1/
export GI_URL_QUERY_STRING="/execute/?clientId=oauth_test_client&apiKey=${GI_API_KEY}&startUrl=${START_URL}"
if [[ -z "$1" ]]; then echo "No TEST_ID command line argument specified"; else  TEST_ID=$1; fi
if [[ -z "$TEST_ID" ]]; then echo "No TEST_ID specified"; else export GI_MIDDLE_URL_FRAGMENT=tests/${TEST_ID} fi
if [[ -z "$SUITE_ID" ]]; then echo "No SUITE_ID specified"; else GI_MIDDLE_URL_FRAGMENT=suites/$SUITE_ID; fi
export FULL_GI_URL=${GI_BASE_URL}${GI_MIDDLE_URL_FRAGMENT}${GI_URL_QUERY_STRING}
set -x
cd ${TEST_FOLDER} && curl "${FULL_GI_URL}" > ghostinspector.json
cd ${TEST_FOLDER} && php ghostinspector_parser.php
set +x
if [[ -e ghostinspector.json ]]; then exit 1; else exit 0; fi