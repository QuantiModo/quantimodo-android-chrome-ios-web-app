console.info("Using GI_API_KEY starting with "+process.env.GI_API_KEY.substr(0, 4)+'...');
var assert = require('assert');
var localforage = require('./../src/lib/localforage/dist/localforage');
var GhostInspector = require('ghost-inspector')(process.env.GI_API_KEY);
var gulp = require('gulp');
var qm = require('./../src/js/qmHelpers');
var qmLog = require('./../modules/qmLog');
qm.Quantimodo = require('quantimodo');
qm.staticData = require('./../src/data/qmStaticData');
qm.nlp = require('compromise');
qm.qmLog = qmLog;
qm.qmLog.setLogLevelName('debug');
var qmTests = {
    tests: {
        checkIntent: function(userInput, expectedIntentName, expectedEntities, expectedParameters){
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
        },
        getUnitsTest: function(){
            var units = qm.unitHelper.getAllUnits();
            console.log(units);
            assert(units.length > 5);
        },
        rememberIntentTest: function(){
            var userInput = "Remember where my keys are";
            var expectedIntentName = 'Remember Intent';
            var expectedEntities = {interrogativeWord: 'where', rememberCommand: "remember"};
            var expectedParameters = {memoryQuestion: 'where my keys are'};
            qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters);
        },
        recordMeasurementIntentTest: function(){
            var userInput = "Record 1 Overall Mood";
            var expectedIntentName = 'Record Measurement Intent';
            var expectedEntities = {variableName: 'Overall Mood', recordMeasurementTriggerPhrase: "record"};
            var expectedParameters = {variableName: 'Overall Mood', value: 1};
            qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters);
        },
        executeTests: function(tests, callback, startUrl){
            var options = {};
            if(startUrl){options.startUrl = startUrl;}
            var test = tests.pop();
            var time = new Date(Date.now()).toLocaleString();
            qmLog.info(time+": Testing "+test.name +" from "+test.suite.name + ' on '+ startUrl +'...');
            var testUrl = "https://app.ghostinspector.com/tests/"+test._id;
            qmLog.info("Check progress at " + testUrl);
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
        userVariables: {
            getHeartRateZone: function (callback) {
                qm.storage.setItem(qm.items.accessToken, process.env.QUANTIMODO_ACCESS_TOKEN);
                var requestParams = {
                    excludeLocal: null,
                    includePublic: true,
                    minimumNumberOfResultsRequiredToAvoidAPIRequest: 20,
                    searchPhrase: "heart"
                };
                qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                    qmLog.info('Got ' + variables.length + ' user variables matching '+requestParams.searchPhrase);
                    assert(variables.length > 5);
                    if(callback){callback();}
                });
            }
        }
    }
};
gulp.task('ghostInspectorOAuthDisabledUtopia', function (callback) {
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://utopia.quantimo.do/api/v2/auth/login');
});
gulp.task('ghostInspectorOAuthDisabledStaging', function (callback) {
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', false, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('ghostInspectorOAuthDisabledStagingFailed', function (callback) {
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('ghostInspectorIonic', function (callback) {
    qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', false, callback, 'https://medimodo.herokuapp.com');
});
gulp.task('ghostInspectorIonicFailed', function (callback) {
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', true, callback, 'https://medimodo.herokuapp.com');
});
gulp.task('tests', function() {
    qmTests.tests.userVariables.getHeartRateZone();
    qmTests.tests.recordMeasurementIntentTest();
    qmTests.tests.getUnitsTest();
});
gulp.task('get-heart-rate-zone', function(callback) {
    qmTests.tests.userVariables.getHeartRateZone(callback);
});