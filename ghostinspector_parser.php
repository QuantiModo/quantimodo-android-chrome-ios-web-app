<?php

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo "Error: $errstr\n";
    exit(1);
});

$contents = file_get_contents('ghostinspector.json');
$json = json_decode($contents);
//echo "Contents of ghostinspector.json: ";
//print_r($json);
$success = $json->code == 'SUCCESS';
if (!$success) {
    echo "GhostInspector tests failed\n";
    exit(1);
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
exit(0);