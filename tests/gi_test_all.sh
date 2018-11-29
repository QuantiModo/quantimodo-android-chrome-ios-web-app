#!/usr/bin/env bash
export GI_API_KEY=f5b531ccd55da08abf35fadabd7b7b04f3d64312 && set +x
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
export TEST_FOLDER=`dirname ${SCRIPT_PATH}` && cd ${TEST_FOLDER} && cd .. && export IONIC=${PWD}
if [[ -z "$START_URL" ]]; then START_URL=https://medimodo.herokuapp.com/ && echo "No START_URL specified so falling back to $START_URL"; else echo "Using START_URL $START_URL"; fi
if [[ "$START_URL" = *"medimodo.herokuapp.com"* ]]; then
    echo "=== Check build progress at https://dashboard.heroku.com/apps/medimodo/activity ==="
    cd ${IONIC} && git push git@heroku.com:medimodo.git HEAD:master -f;
    EXIT_CODE=$? && echo "git push exit code was $EXIT_CODE" # $? now contains the exit code of the preceding echo
    if [[ ${EXIT_CODE} -eq 0 ]]; then echo "Heroku push successful!"; else echo "Heroku push FAILED with exit code $EXIT_CODE" && exit 1; fi
fi
if [[ -z "$CLIENT_ID" ]]; then CLIENT_ID=oauth_test_client && echo "No CLIENT_ID specified so falling back to $CLIENT_ID"; else echo "Using CLIENT_ID $CLIENT_ID"; fi
echo "===== BRANCH: ${GIT_BRANCH} ====="
cd ${IONIC} && export COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s) && echo "===== COMMIT: $COMMIT_MESSAGE =====" && set -x
export SUITE_ID=56f5b92519d90d942760ea96  # Ionic
set -e && cd ${TEST_FOLDER} && gulp gi-failed
URL="https://api.ghostinspector.com/v1/suites/${SUITE_ID}/execute/?startUrl=${START_URL}&clientId=${CLIENT_ID}&apiKey=${GI_API_KEY}&commit="$(git rev-parse HEAD)
cd ${TEST_FOLDER} && curl "${URL}" > ghostinspector.json
echo "=== Check progress at https://app.ghostinspector.com/suites/56f5b92519d90d942760ea96 ==="
php ghostinspector_parser.php
set +x && echo "===== BRANCH: ${GIT_BRANCH} =====" && echo "===== COMMIT: $COMMIT_MESSAGE ====="
# curl "https://api.ghostinspector.com/v1/suites/56f5b92519d90d942760ea96/execute/?startUrl=https://utopia.quantimo.do:4470/ionic/Modo/src/#/&clientId=oauth_test_client&apiKey=f5b531ccd55da08abf35fadabd7b7b04f3d64312&commit=eaf513d9b35aaa0e16133a79eb71fcdd0456702e" > ghostinspector.json
if [[ -e ghostinspector.json ]]; then exit 1; else exit 0; fi