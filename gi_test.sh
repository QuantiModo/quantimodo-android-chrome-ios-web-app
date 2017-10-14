#!/usr/bin/env bash

git push git@heroku.com:medimodo.git master -ff
START_URL=https://medimodo.herokuapp.com/

#START_URL=https://utopia.quantimo.do
GI_API_KEY=f5b531ccd55da08abf35fadabd7b7b04f3d64312

#SUITE_ID=56f5b92519d90d942760ea96
#curl "https://api.ghostinspector.com/v1/suites/${SUITE_ID}/execute/?startUrl=${START_URL}&clientId=oauth_test_client&apiKey=${GI_API_KEY}&commit="$(git rev-parse HEAD) > ghostinspector.json

#TEST_ID=57f13c17aa9d47af0cc56e4a # Reminder snooze (Foods)
echo "${START_URL}"
echo "https://api.ghostinspector.com/v1/tests/${TEST_ID}/execute/?startUrl=${START_URL}&clientId=oauth_test_client&apiKey=${GI_API_KEY}"
curl "https://api.ghostinspector.com/v1/tests/${TEST_ID}/execute/?startUrl=${START_URL}&clientId=oauth_test_client&apiKey=${GI_API_KEY}" > ghostinspector.json

php ghostinspector_parser.php