#!/usr/bin/env bash
if [ -z "$START_URL" ]
  then
    START_URL=https://medimodo.herokuapp.com/
    echo "No START_URL specified so falling back to $START_URL"
    git push git@heroku.com:medimodo.git master -ff
else
    echo "Using START_URL $START_URL"
fi
GI_API_KEY=f5b531ccd55da08abf35fadabd7b7b04f3d64312
SUITE_ID=56f5b92519d90d942760ea96  # Ionic
URL="https://api.ghostinspector.com/v1/suites/${SUITE_ID}/execute/?startUrl=${START_URL}&clientId=oauth_test_client&apiKey=${GI_API_KEY}&commit="$(git rev-parse HEAD)
echo "curl ${URL} > ghostinspector.json"
curl "${URL}" > ghostinspector.json
php ghostinspector_parser.php
# curl "https://api.ghostinspector.com/v1/suites/56f5b92519d90d942760ea96/execute/?startUrl=https://utopia.quantimo.do:4470/ionic/Modo/src/#/&clientId=oauth_test_client&apiKey=f5b531ccd55da08abf35fadabd7b7b04f3d64312&commit=eaf513d9b35aaa0e16133a79eb71fcdd0456702e" > ghostinspector.json
