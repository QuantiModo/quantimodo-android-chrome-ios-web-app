<?php

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo "Error: $errstr\n";
    exit(1);
});

$contents = file_get_contents('ghostinspector.json');
$json = json_decode($contents);
$success = $json->code == 'SUCCESS';
if (!$success) {
    echo "Contents of ghostinspector.json: ";
    print_r($json);
    echo "GhostInspector tests failed\n";
    exit(1);
}
if(isset($json->data->passing)){
    if(!$json->data->passing){

        echo " _______  _______  ___   ___      _______  ______   __     ___    ____  ";
        echo "|       ||   _   ||   | |   |    |       ||      | |  |   |   |  |    | ";
        echo "|    ___||  |_|  ||   | |   |    |    ___||  _    ||  |   |___| |    _| ";
        echo "|   |___ |       ||   | |   |    |   |___ | | |   ||  |    ___  |   |   ";
        echo "|    ___||       ||   | |   |___ |    ___|| |_|   ||__|   |   | |   |   ";
        echo "|   |    |   _   ||   | |       ||   |___ |       | __    |___| |   |_  ";
        echo "|___|    |__| |__||___| |_______||_______||______| |__|          |____| ";

        echo $json->data->name . " failed: https://app.ghostinspector.com/tests/" .  $json->data->test->_id;
        exit(1);
    } else {

        echo " _______  _______  _______  _______  _______  ______   __     ___   ______  ";
        echo "|       ||   _   ||       ||       ||       ||      | |  |   |   | |      | ";
        echo "|    _  ||  |_|  ||  _____||  _____||    ___||  _    ||  |   |___| |  _    |";
        echo "|   |_| ||       || |_____ | |_____ |   |___ | | |   ||  |    ___  | | |   |";
        echo "|    ___||       ||_____  ||_____  ||    ___|| |_|   ||__|   |   | | |_|   |";
        echo "|   |    |   _   | _____| | _____| ||   |___ |       | __    |___| |       |";
        echo "|___|    |__| |__||_______||_______||_______||______| |__|         |______| ";

        echo $json->data->name . " PASSED!  Yay! :D";
        unlink('ghostinspector.json');
        exit(0);
    }
}
$failedTests = [];
foreach ($json->data as $test) {
    if (!$test->passing) {
        $failedTests[$test->_id] = $test->testName;
    }
}

if ($failedTests) {
    echo "Failed tests\n";
    foreach ($failedTests as $id => $name) {
        echo "$name: https://app.ghostinspector.com/results/$id\n";
    }
    exit(1);
}

echo "GhostInspector tests were successful\n";
unlink('ghostinspector.json');
exit(0);
