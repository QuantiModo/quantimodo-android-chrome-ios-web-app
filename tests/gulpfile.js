console.info("Using GI_API_KEY starting with "+process.env.GI_API_KEY.substr(0, 4)+'...');
//var localforage = require('./../src/lib/localforage/dist/localforage');
var assert = require('assert');
var GhostInspector = require('ghost-inspector')(process.env.GI_API_KEY);
var gulp = require('gulp');
var runSequence = require('../node_modules/run-sequence').use(gulp);

var qm = require('./../src/js/qmHelpers');
qm.appMode.mode = 'testing';
var qmLog = require('./../src/js/qmLogger');
qmLog.qm = qm;
qmLog.color = require('ansi-colors');
qm.Quantimodo = require('quantimodo');
qm.staticData = require('./../src/data/qmStaticData');
qm.stateNames = qm.staticData.stateNames;
qm.nlp = require('./../src/lib/compromise');
qm.qmLog = qmLog;
qm.qmLog.setLogLevelName('debug');
var qmTests = {
    tests: {
        checkIntent: function(userInput, expectedIntentName, expectedEntities, expectedParameters, callback){
            var intents = qm.staticData.dialogAgent.intents;
            var entities = qm.staticData.dialogAgent.entities;
            var matchedEntities = qm.dialogFlow.getEntitiesFromUserInput(userInput);
            for (var expectedEntityName in expectedEntities) {
                if (!expectedEntities.hasOwnProperty(expectedEntityName)) {continue;}
                assert(typeof matchedEntities[expectedEntityName] !== "undefined", expectedEntityName + " not in matchedEntities!");
                assert(matchedEntities[expectedEntityName].matchedEntryValue === expectedEntities[expectedEntityName]);
            }
            var expectedIntent = intents[expectedIntentName];
            var triggerPhraseMatchedIntent = qm.dialogFlow.getIntentMatchingCommandOrTriggerPhrase(userInput);
            assert(triggerPhraseMatchedIntent.name === expectedIntentName);
            var score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput);
            var filledParameters = expectedIntent.parameters;
            var expectedParameterName;
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) {continue;}
                if(typeof filledParameters[expectedParameterName] === "undefined"){
                    score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput);
                }
                assert(typeof filledParameters[expectedParameterName] !== "undefined", expectedParameterName + " not in filledParameters!");
                assert(filledParameters[expectedParameterName] === expectedParameters[expectedParameterName]);
            }
            assert(score > -2);
            var matchedIntent = qm.dialogFlow.getIntent(userInput);
            filledParameters = matchedIntent.parameters;
            assert(matchedIntent.name === expectedIntentName);
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) {continue;}
                assert(typeof filledParameters[expectedParameterName] !== "undefined", expectedParameterName + " not in filledParameters!");
                assert(filledParameters[expectedParameterName] === expectedParameters[expectedParameterName]);
            }
            if(callback){callback();}
        },
        getUnitsTest: function(callback){
            var units = qm.unitHelper.getAllUnits();
            console.log(units);
            assert(units.length > 5);
            if(callback){callback();}
        },
        rememberIntentTest: function(callback){
            var userInput = "Remember where my keys are";
            var expectedIntentName = 'Remember Intent';
            var expectedEntities = {interrogativeWord: 'where', rememberCommand: "remember"};
            var expectedParameters = {memoryQuestion: 'where my keys are'};
            qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, callback);
        },
        recordMeasurementIntentTest: function(callback){
            var userInput = "Record 1 Overall Mood";
            var expectedIntentName = 'Record Measurement Intent';
            var expectedEntities = {variableName: 'Overall Mood', recordMeasurementTriggerPhrase: "record"};
            var expectedParameters = {variableName: 'Overall Mood', value: 1};
            qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, callback);
        },
        executeTests: function(tests, callback, startUrl){
            var options = {};
            if(startUrl){options.startUrl = startUrl;}
            var test = tests.pop();
            var time = new Date(Date.now()).toLocaleString();
            qmLog.info(time+": Testing "+test.name +" from "+test.suite.name + ' on '+ startUrl +'...');
            var testUrl = "https://app.ghostinspector.com/tests/"+test._id;
            qmLog.info("Check progress at " + testUrl +" ");
            GhostInspector.executeTest(test._id, options, function (err, results, passing) {
                if (err) return console.log('Error: ' + err);
                console.log(passing === true ? 'Passed' : 'Failed');
                //qmLog.info("results", results, 1000);
                if(!passing){
                    for (var i = 0; i < results.console.length; i++) {
                        var logObject = results.console[i];
                        if(logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1){
                            console.error(logObject.output);
                            console.error(logObject.url);
                        }
                    }
                    throw test.name + " failed: " + testUrl;
                }
                if (tests && tests.length) {
                    qmTests.tests.executeTests(tests, callback, startUrl);
                } else if (callback) {
                    callback();
                }
            });
        },
        getSuiteTestsAndExecute: function(suiteId, failedOnly, callback, startUrl){
            GhostInspector.getSuiteTests(suiteId, function (err, tests) {
                if (err) return console.log('Error: ' + err);
                if(failedOnly){
                    var failedTests = tests.filter(function(test){
                        return !test.passing;
                    });
                    if(!failedTests || !failedTests.length){
                        qmLog.info("No failed tests!");
                        if(callback){callback();}
                        return;
                    } else {
                        tests = failedTests;
                    }
                }
                for (var i = 0; i < tests.length; i++) {
                    var test = tests[i];
                    var passFail = (test.passing) ? 'passed' : 'failed';
                    qmLog.info(test.name + " recently " + passFail);
                }
                qmTests.tests.executeTests(tests, callback, startUrl);
            });
        },
        commonVariables: {
            getCar: function (callback) {
                qm.storage.setItem(qm.items.accessToken, process.env.QUANTIMODO_ACCESS_TOKEN);
                qm.userHelper.getUserFromLocalStorageOrApi(function (user) {
                    if(!qm.getUser()){throw "No user!"}
                    var requestParams = {
                        excludeLocal: null,
                        includePublic: true,
                        minimumNumberOfResultsRequiredToAvoidAPIRequest: 20,
                        searchPhrase: "car"
                    };
                    qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                        qmLog.info('=== Got ' + variables.length + ' variables matching '+requestParams.searchPhrase);
                        qm.assert.doesNotHaveUserId(variables);
                        qm.assert.variables.descendingOrder(variables, 'lastSelectedAt');
                        assert(variables.length > 5);
                        var variable5 = variables[4];
                        var timestamp = qm.timeHelper.getUnixTimestampInSeconds();
                        qm.variablesHelper.setLastSelectedAtAndSave(variable5);
                        var userVariables = qm.globalHelper.getItem(qm.items.userVariables);
                        qm.assert.isNull(userVariables, qm.items.userVariables);
                        qm.variablesHelper.getFromLocalStorageOrApi({id: variable5.id, includePublic: true}, function(variables){
                            qm.assert.doesNotHaveProperty(variables, 'userId');
                            qm.assert.variables.descendingOrder(variables, 'lastSelectedAt');
                            qm.assert.equals(timestamp, variables[0].lastSelectedAt, 'lastSelectedAt');
                            qm.assert.equals(variable5.name, variables[0].name, 'name');
                            qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt');
                                var variable1 = variables[0];
                                assert(variable1.lastSelectedAt === timestamp);
                                assert(variable1.variableId === variable5.variableId);
                                assert(qm.api.requestLog.length === 1);
                                if(callback){callback();}
                            });
                        }, function(error){
                            qm.qmLog.error(error);
                        });
                    });
                });
            },
        }
    }
};
gulp.task('oauth-disabled-utopia', function (callback) {
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://utopia.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-staging', function (callback) {
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', false, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-staging-failed', function (callback) {
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-failed', function (callback) {
    var url = process.env.APP_HOST_NAME;
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, url+'/api/v2/auth/login');
});
gulp.task('api-failed', function (callback) {
    var url = process.env.APP_HOST_NAME;
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('559020a9f71321f80c6d8176', true, callback, url+'/api/v2/auth/login');
});
gulp.task('api-staging-failed', function (callback) {
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('559020a9f71321f80c6d8176', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('ionic-gi', function (callback) {
    qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', false, callback, 'https://medimodo.herokuapp.com');
});
gulp.task('ionic-failed', function (callback) {
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', true, callback, 'https://medimodo.herokuapp.com');
});

gulp.task('test-get-common-variable', function(callback) {
    qmTests.tests.commonVariables.getCar(callback);
});
gulp.task('test-record-measurement-intent', function(callback) {
    qmTests.tests.recordMeasurementIntentTest(callback);
});
gulp.task('test-get-units', function(callback) {
    qmTests.tests.getUnitsTest(callback);
});
gulp.task('tests', function(callback) {
    runSequence(
        'test-get-common-variable',
        'test-record-measurement-intent',
        'test-get-units',
        function (error) {
            if (error) {qmLog.error(error.message);} else {qmLog.green('TESTS FINISHED SUCCESSFULLY');}
            callback(error);
        });
});