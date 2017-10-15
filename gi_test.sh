#!/usr/bin/env bash
if [ -z "$START_URL" ]
  then
    START_URL=https://medimodo.herokuapp.com/
    echo "No START_URL specified so falling back to $START_URL"
    git push git@heroku.com:medimodo.git master -ff
else
    echo "Using START_URL $START_URL"
fi
#START_URL=https://utopia.quantimo.do/ionic/Modo/www/#/
GI_API_KEY=f5b531ccd55da08abf35fadabd7b7b04f3d64312
#SUITE_ID=56f5b92519d90d942760ea96
#curl "https://api.ghostinspector.com/v1/suites/${SUITE_ID}/execute/?startUrl=${START_URL}&clientId=oauth_test_client&apiKey=${GI_API_KEY}&commit="$(git rev-parse HEAD) > ghostinspector.json
if [ -z "$1" ]
  then
    echo "No TEST_ID command line argument specified"
else
    TEST_ID=$1
    echo "Using TEST_ID command line argument $TEST_ID"
fi
if [ -z "$TEST_ID" ]
  then
    TEST_ID=57f13c17aa9d47af0cc56e4a # Reminder snooze (Foods)
    echo "No TEST_ID specified so falling back to $TEST_ID"
else
    echo "Using TEST_ID $TEST_ID"
fi
echo "${START_URL}"
echo "https://api.ghostinspector.com/v1/tests/${TEST_ID}/execute/?clientId=oauth_test_client&apiKey=${GI_API_KEY}&startUrl=${START_URL}"
curl "https://api.ghostinspector.com/v1/tests/${TEST_ID}/execute/?clientId=oauth_test_client&apiKey=${GI_API_KEY}&startUrl=${START_URL}" > ghostinspector.json
echo "Current directory: $PWD"
php ghostinspector_parser.php