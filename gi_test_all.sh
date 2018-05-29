#!/usr/bin/env bash
set +x
if [ -z "$START_URL" ]
  then
    START_URL=https://medimodo.herokuapp.com/
    echo "No START_URL specified so falling back to $START_URL"
else
    echo "Using START_URL $START_URL"
fi
if [[ "$START_URL" = *"medimodo.herokuapp.com"* ]]; then
    echo "=== Check build progress at https://dashboard.heroku.com/apps/medimodo/activity ==="
    git push git@heroku.com:medimodo.git master -ff || true;  # Doesn't work on Jenkins for some reason
    git push heroku master -f || true;  # Doesn't work on Jenkins for some reason
fi
if [ -z "$CLIENT_ID" ]
  then
    CLIENT_ID=oauth_test_client
    echo "No CLIENT_ID specified so falling back to $CLIENT_ID"
else
    echo "Using CLIENT_ID $CLIENT_ID"
fi
echo "===== BRANCH: ${GIT_BRANCH} ====="
COMMIT_MESSAGE=$(git log -1 HEAD --pretty=format:%s) && echo "===== COMMIT: $COMMIT_MESSAGE ====="
set -x
GI_API_KEY=f5b531ccd55da08abf35fadabd7b7b04f3d64312
SUITE_ID=56f5b92519d90d942760ea96  # Ionic
URL="https://api.ghostinspector.com/v1/suites/${SUITE_ID}/execute/?startUrl=${START_URL}&clientId=${CLIENT_ID}&apiKey=${GI_API_KEY}&commit="$(git rev-parse HEAD)
curl "${URL}" > ghostinspector.json
echo "=== Check progress at https://app.ghostinspector.com/suites/56f5b92519d90d942760ea96 ==="
php ghostinspector_parser.php
set -x
echo "===== BRANCH: ${GIT_BRANCH} ====="
echo "===== COMMIT: $COMMIT_MESSAGE ====="
# curl "https://api.ghostinspector.com/v1/suites/56f5b92519d90d942760ea96/execute/?startUrl=https://utopia.quantimo.do:4470/ionic/Modo/src/#/&clientId=oauth_test_client&apiKey=f5b531ccd55da08abf35fadabd7b7b04f3d64312&commit=eaf513d9b35aaa0e16133a79eb71fcdd0456702e" > ghostinspector.json
