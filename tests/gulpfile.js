if(!process.env.GI_API_KEY){throw "Please set GI_API_KEY env from https://app.ghostinspector.com/account"}
console.info("Using GI_API_KEY starting with "+process.env.GI_API_KEY.substr(0, 4)+'...');
//var localforage = require('./../src/lib/localforage/dist/localforage');
var argv = require('./../node_modules/yargs').argv;
var assert = require('./../node_modules/power-assert');
var GhostInspector = require('./../node_modules/ghost-inspector')(process.env.GI_API_KEY);
var gulp = require('./../node_modules/gulp');
var runSequence = require('../node_modules/run-sequence').use(gulp);
var qm = require('./../src/js/qmHelpers');
qm.appMode.mode = 'testing';
var qmLog = require('./../src/js/qmLogger');
qmLog.qm = qm;
qmLog.color = require('ansi-colors');
qm.Quantimodo = require('./../node_modules/quantimodo');
qm.staticData = false;
qm.qmLog = qmLog;
qm.qmLog.setLogLevelName(process.env.LOG_LEVEL || 'info');
var qmTests = {
    testParams: {},
    getStaticData: function(){
        if(qm.staticData){return qm.staticData;}
        qm.staticData = require('./../src/data/qmStaticData');
        qm.stateNames = qm.staticData.stateNames;
        qm.nlp = require('./../src/lib/compromise');
        return qm.staticData;
    },
    setTestParams: function(params){
        qmTests.testParams = params;
        qmLog.debug("Setting test params: " + JSON.stringify(params));
    },
    getTestParams: function(){
        if(typeof qmTests.testParams === 'string'){
            return JSON.parse(qmTests.testParams);
        }
        return qmTests.testParams;
    },
    startUrl: null,
    getStartUrl: function(){
        var params = qmTests.getTestParams();
        var startUrl = 'https://medimodo.herokuapp.com';
        if(params && params.startUrl){startUrl = params.startUrl;}
        if(params && params.deploy_ssl_url){startUrl = params.deploy_ssl_url;}
        if(params && params.START_URL){startUrl = params.START_URL;}
        if(process.env.START_URL){startUrl = process.env.START_URL;}
        if(process.env.DEPLOY_PRIME_URL){startUrl = process.env.DEPLOY_PRIME_URL;}
        if(argv.startUrl){startUrl = argv.startUrl;}
        if(startUrl.indexOf('https') === -1){startUrl = "https://"+startUrl;}
        return startUrl;
    },
    getSha: function(){
        var params = qmTests.getTestParams();
        if(params && params.commit_ref){return params.commit_ref;}
        if(params && params.sha){return params.sha;}
    },
    getStatusesUrl: function(){
        var params = qmTests.getTestParams();
        if(params && params.statuses_url){return params.statuses_url;}
        if(params && params.commit_url){
            var url = params.commit_url;
            url = url.replace('github.com', 'api.github.com/repos');
            url = url.replace('commit', 'statuses');
            return url;
        }
        return null;
    },
    getApiUrl: function(){
        var params = qmTests.getTestParams();
        if(params && params.API_URL){return params.API_URL;}
        if(process.env.API_URL){return process.env.API_URL;}
        if(argv.apiUrl){return argv.apiUrl;}
        return 'api.quantimo.do';
    },
    tests: {
        checkIntent: function(userInput, expectedIntentName, expectedEntities, expectedParameters, callback){
            var intents = qmTests.getStaticData().dialogAgent.intents;
            var entities = qmTests.getStaticData().dialogAgent.entities;
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
            qmLog.debug("units:", units);
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
        getOptions: function(startUrl){
            var options = {};
            options.startUrl = startUrl || qmTests.getStartUrl();
            options.apiUrl = qmTests.getApiUrl();
            if(qmTests.getSha()){options.sha = qmTests.getSha();}
            if(qmTests.getStatusesUrl()){options.statuses_url = qmTests.getStatusesUrl();}
            return options;
        },
        executeTests: function(tests, callback, startUrl){
            var options = qmTests.tests.getOptions(startUrl);
            var test = tests.pop();
            var time = new Date(Date.now()).toLocaleString();
            qmLog.info(time+": Testing "+test.name +" from "+test.suite.name + ' on startUrl '+ options.startUrl +'...');
            var testUrl = "https://app.ghostinspector.com/tests/"+test._id;
            qmLog.info("Check progress at " + testUrl +" ");
            GhostInspector.executeTest(test._id, options, function (err, results, passing) {
                if (err) throw test.name + " Error: " + err;
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
                console.log(test.name + ' ' + ' passed! :D');
                if (tests && tests.length) {
                    qmTests.tests.executeTests(tests, callback, startUrl);
                } else if (callback) {
                    callback();
                }
            });
        },
        executeSuite: function(suiteId, callback, startUrl){
            var options = qmTests.tests.getOptions(startUrl);
            qmLog.info('Testing suite on startUrl '+ options.startUrl +'...');
            var testUrl = "https://app.ghostinspector.com/suites/"+suiteId;
            qmLog.info("Check progress at " + testUrl +" ");
            GhostInspector.executeSuite(suiteId, options, function (err, results, passing) {
                if (err) return console.log('Error: ' + err);
                console.log(passing === true ? 'Passed' : 'Failed');
                if (err) throw testUrl + " Error: " + err;
                if(!passing){
                    for (var i = 0; i < results.console.length; i++) {
                        var logObject = results.console[i];
                        if(logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1){
                            console.error(logObject.output);
                            console.error(logObject.url);
                        }
                    }
                    console.error(testUrl + " failed: " + testUrl);
                    process.exit(1);
                }
                console.log(testUrl + ' ' + ' passed! :D');
                callback();
            });
        },
        getSuiteTestsAndExecute: function(suiteId, failedOnly, callback, startUrl){
            if(!failedOnly){
                qmTests.tests.executeSuite(suiteId, callback, startUrl);
            } else {
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
            }
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
            }
        }
    }
};
gulp.task('oauth-disabled-utopia', function (callback) {
    qmTests.setTestParams(this._params);
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://utopia.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-staging', function (callback) {
    qmTests.setTestParams(this._params);
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', false, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-staging-failed', function (callback) {
    qmTests.setTestParams(this._params);
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-failed', function (callback) {
    qmTests.setTestParams(this._params);
    var url = process.env.APP_HOST_NAME;
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, url+'/api/v2/auth/login');
});
gulp.task('api-failed', function (callback) {
    qmTests.setTestParams(this._params);
    var url = process.env.APP_HOST_NAME;
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('559020a9f71321f80c6d8176', true, callback, url+'/api/v2/auth/login');
});
gulp.task('api-staging-failed', function (callback) {
    qmTests.setTestParams(this._params);
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('559020a9f71321f80c6d8176', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('gi-all', function (callback) {
    qmTests.setTestParams(this._params);
    qmTests.tests.executeSuite('56f5b92519d90d942760ea96', callback);
    //qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', false, callback);
});
gulp.task('gi-failed', function (callback) {
    qmTests.setTestParams(this._params);
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', true, callback);
});
gulp.task('test-get-common-variable', function(callback) {
    qmTests.getStaticData();
    qmTests.setTestParams(this._params);
    qmTests.tests.commonVariables.getCar(callback);
});
gulp.task('test-record-measurement-intent', function(callback) {
    qmTests.getStaticData();
    qmTests.setTestParams(this._params);
    qmTests.tests.recordMeasurementIntentTest(callback);
});
gulp.task('test-get-units', function(callback) {
    qmTests.getStaticData();
    qmTests.setTestParams(this._params);
    qmTests.tests.getUnitsTest(callback);
});
gulp.task('unit-tests', function(callback) {
    qmTests.getStaticData();
    qmTests.setTestParams(this._params);
    runSequence(
        'test-get-common-variable',
        'test-record-measurement-intent',
        'test-get-units',
        function (error) {
            if (error) {throw error.message;}
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
gulp.task('unit-gi-failed-gi-all', function(callback) {
    qmTests.setTestParams(this._params);
    runSequence(
        'unit-tests',
        'gi-failed',
        'gi-all',
        function (error) {
            if (error) {throw error.message;}
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
gulp.task('chcp-dev-unit-gi-failed-gi-all', function(callback) {
    qmTests.setTestParams(this._params);
    qmTests.startUrl = 'https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/dev/';
    runSequence(
        'unit-gi-failed-gi-all',
        function (error) {
            if (error) {throw error.message;}
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
gulp.task('chcp-qa-unit-gi-failed-gi-all', function(callback) {
    qmTests.setTestParams(this._params);
    qmTests.startUrl = 'https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/qa/';
    runSequence(
        'unit-gi-failed-gi-all',
        function (error) {
            if (error) {throw error.message;}
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
gulp.task('chcp-production-unit-gi-failed-gi-all', function(callback) {
    qmTests.setTestParams(this._params);
    qmTests.startUrl = 'https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/production/';
    runSequence(
        'unit-gi-failed-gi-all',
        function (error) {
            if (error) {throw error.message;}
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
var qmReq = {
    postToGhostInspector: function(testOrSuite, callback){
        var options = {
            uri: "https://api.ghostinspector.com/v1/"+testOrSuite+"/execute/?apiKey="+process.env.GI_API_KEY,
            body: {
                repository: {
                    statuses_url: qmTests.getStatusesUrl()
                },
                sha: qmTests.getSha()
            },
            qs: {
                apiUrl: qmTests.getApiUrl(),
                startUrl: qmTests.getStartUrl()
            },
            headers: {'User-Agent': 'Request-Promise', 'Content-Type': 'application/json'},
            json: true, // Automatically parses the JSON string in the response
            strictSSL: false,
            method: "POST"
        };
        var rp = require('request-promise');
        qmLog.info('=== Testing '+qmTests.getStartUrl() +' ===');
        qmLog.info('=== Check progress at https://app.ghostinspector.com/' + testOrSuite + " ===");
        return rp(options).then(function (response) {
            qmLog.info("Successful response from " + options.uri);
            qmLog.debug(options.uri + " response", response);
            if(callback){callback();}
        }).catch(function (err) {
            qmLog.error(err, options);
            throw err;
        });
    }
};
gulp.task('trigger-jenkins', function() {
    qmTests.setTestParams(this._params);
    var options = {
        uri: 'http://auto:'+process.env.JENKINS_TOKEN+'@quantimodo2.asuscomm.com:8082/view/Ionic/job/ionic-gulp/buildWithParameters?token=ionic-test',
        qs: {
            API_URL: 'app.quantimo.do',
            cause: 'Netflify Deploy',
            START_URL: process.env.DEPLOY_PRIME_URL,
            SUB_FOLDER: 'tests',
            TASK_NAME: 'unit-gi-failed-gi-all',
            token: 'ionic-test',
        },
        headers: {'User-Agent': 'Request-Promise', 'Content-Type': 'application/json'},
        json: true, // Automatically parses the JSON string in the response
        strictSSL: false,
        method: "POST"
    };
    var rp = require('request-promise');
    qmLog.info('Making '+options.method+' request to ' + options.uri);
    qmLog.debug(options.uri, options, 280);
    return rp(options).then(function (response) {
        qmLog.info("Successful response from " + options.uri);
        qmLog.debug(options.uri + " response", response);
        if(typeof successHandler !== "undefined"){successHandler(response);}
    }).catch(function (err) {
        qmLog.error(err, options);
        throw err;
    });
});