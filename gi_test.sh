#!/usr/bin/env bash
if [ -z "$START_URL" ]
then
    START_URL=https://medimodo.herokuapp.com/
    echo "No START_URL specified so falling back to $START_URL"
    git push git@heroku.com:medimodo.git master -ff
else
    echo "Using START_URL env $START_URL"
fi
GI_API_KEY=f5b531ccd55da08abf35fadabd7b7b04f3d64312
export GI_BASE_URL=https://api.ghostinspector.com/v1/
export GI_URL_QUERY_STRING="/execute/?clientId=oauth_test_client&apiKey=${GI_API_KEY}&startUrl=${START_URL}"
if [ -z "$1" ]
    then
        echo "No TEST_ID command line argument specified"
    else
        TEST_ID=$1
fi
if [ -z "$TEST_ID" ]
    then
        echo "No TEST_ID specified"
    else
        export GI_MIDDLE_URL_FRAGMENT=tests/${TEST_ID}
fi
if [ -z "$SUITE_ID" ]
    then
        echo "No SUITE_ID specified"
    else
       GI_MIDDLE_URL_FRAGMENT=suites/$SUITE_ID
fi
export FULL_GI_URL=${GI_BASE_URL}${GI_MIDDLE_URL_FRAGMENT}${GI_URL_QUERY_STRING}
echo "curl "${FULL_GI_URL}" > ghostinspector.json"
curl "${FULL_GI_URL}" > ghostinspector.json
php ghostinspector_parser.php
