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
qmLog.color = require('./../node_modules/ansi-colors');
qm.github = require('./../node_modules/gulp-github');
qm.Quantimodo = require('./../node_modules/quantimodo');
qm.staticData = false;
qm.qmLog = qmLog;
qm.qmLog.setLogLevelName(process.env.LOG_LEVEL || 'info');
var qmTests = {
    getAccessToken: function(){
        var t = process.env.QUANTIMODO_ACCESS_TOKEN;
        if(!t){throw "Please set process.env.QUANTIMODO_ACCESS_TOKEN";}
        return t;
    },
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
        /** @namespace params.commit_url */
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
                qm.assert.doesNotEqual(typeof matchedEntities[expectedEntityName], "undefined", expectedEntityName + " not in matchedEntities!");
                qm.assert.equals(matchedEntities[expectedEntityName].matchedEntryValue, expectedEntities[expectedEntityName]);
            }
            var expectedIntent = intents[expectedIntentName];
            var triggerPhraseMatchedIntent = qm.dialogFlow.getIntentMatchingCommandOrTriggerPhrase(userInput);
            qm.assert.equals(triggerPhraseMatchedIntent.name, expectedIntentName);
            var score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput);
            var filledParameters = expectedIntent.parameters;
            var expectedParameterName;
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) {continue;}
                if(typeof filledParameters[expectedParameterName] === "undefined"){
                    score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput);
                }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!");
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName]);
            }
            qm.assert.greaterThan(-2, score);
            var matchedIntent = qm.dialogFlow.getIntent(userInput);
            filledParameters = matchedIntent.parameters;
            qm.assert.equals(matchedIntent.name, expectedIntentName);
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) {continue;}
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!");
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName]);
            }
            if(callback){callback();}
        },
        getUnitsTest: function(callback){
            var units = qm.unitHelper.getAllUnits();
            qmLog.debug("units:", units);
            qm.assert.greaterThan(5, units.length);
            if(callback){callback();}
        },
        getUsersTest: function(callback){
            qm.storage.setItem(qm.items.accessToken, qmTests.getAccessToken());
            qm.storage.setItem(qm.items.apiUrl, 'local.quantimo.do');
            qm.userHelper.getUsersFromApi(function(users){
                qmLog.debug("users:", users);
                qm.assert.greaterThan(0, users.length);
                if(callback){callback();}
            }, function(error){
                throw error;
            });
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
            var message = "Testing "+test.name +" from "+test.suite.name + ' on startUrl '+ options.startUrl +'...';
            qmLog.info(time+": " + message);
            var testUrl = "https://app.ghostinspector.com/tests/"+test._id;
            qmLog.info("Check progress at " + testUrl +" ");
            qm.gitHelper.createStatusToCommit({
                description: message,
                context: qm.currentTask,
                target_url: testUrl,
                state: 'pending'
            });
            GhostInspector.executeTest(test._id, options, function (err, testResults, passing) {
                if (err) {
                    qm.gitHelper.createStatusToCommit({
                        description: err,
                        context: qm.currentTask,
                        target_url: testUrl,
                        state: 'error'
                    });
                    throw test.name + " Error: " + err;
                }
                if(!passing){
                    qmTests.outputErrorsForTest(testResults);
                }
                console.log(test.name + ' ' + ' passed! :D');
                if (tests && tests.length) {
                    qmTests.tests.executeTests(tests, callback, startUrl);
                } else if (callback) {
                    qm.gitHelper.createStatusToCommit({
                        description: test.name + ' ' + ' passed! :D',
                        context: qm.currentTask,
                        target_url: testUrl,
                        state: 'success'
                    });
                    callback();
                }
            });
        },
        executeSuite: function(suiteId, callback, startUrl){
            var options = qmTests.tests.getOptions(startUrl);
            var message = 'Testing suite on startUrl '+ options.startUrl + " with API url " + options.apiUrl +'...';
            console.info(message);
            var suiteUrl = "https://app.ghostinspector.com/suites/"+suiteId;
            console.info("Check progress at " + suiteUrl);
            qm.gitHelper.createStatusToCommit({
                description: message,
                context: qm.currentTask,
                target_url: suiteUrl,
                state: 'pending'
            });
            GhostInspector.executeSuite(suiteId, options, function (err, suiteResults, passing) {
                if (err) {
                    qm.gitHelper.createStatusToCommit({
                        description: err,
                        context: qm.currentTask,
                        target_url: suiteUrl,
                        state: 'error'
                    });
                    throw suiteUrl + " Error: " + err;
                }
                console.log(passing === true ? 'Passed' : 'Failed');
                if(!passing){
                    for(var i = 0; i < suiteResults.length; i++){
                        var testResults = suiteResults[i];
                        if(!testResults.passing){qmTests.outputErrorsForTest(testResults);}
                    }
                    qm.gitHelper.createStatusToCommit({
                        description: "Failed on startUrl "+ options.startUrl + " with API url " + options.apiUrl,
                        context: qm.currentTask,
                        target_url: suiteUrl,
                        state: 'failure'
                    });
                }
                console.log(suiteUrl + ' ' + ' passed! :D');
                qm.gitHelper.createStatusToCommit({
                    description: 'Suite passed! :D',
                    context: qm.currentTask,
                    target_url: suiteUrl,
                    state: 'success'
                });
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
                qm.storage.setItem(qm.items.accessToken, qmTests.getAccessToken());
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
                        qm.assert.greaterThan(5, variables.length);
                        var variable5 = variables[4];
                        var timestamp = qm.timeHelper.getUnixTimestampInSeconds();
                        qm.variablesHelper.setLastSelectedAtAndSave(variable5);
                        var userVariables = qm.globalHelper.getItem(qm.items.userVariables);
                        //qm.assert.isNull(userVariables, qm.items.userVariables);
                        qm.variablesHelper.getFromLocalStorageOrApi({id: variable5.id, includePublic: true}, function(variables){
                            qm.assert.doesNotHaveProperty(variables, 'userId');
                            qm.assert.variables.descendingOrder(variables, 'lastSelectedAt');
                            qm.assert.equals(timestamp, variables[0].lastSelectedAt, 'lastSelectedAt');
                            qm.assert.equals(variable5.name, variables[0].name, 'name');
                            qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt');
                                var variable1 = variables[0];
                                qm.assert.equals(variable1.lastSelectedAt, timestamp);
                                qm.assert.equals(variable1.variableId, variable5.variableId);
                                qm.assert.equals(2, qm.api.requestLog.length, "We should have made 1 request but have "+
                                    JSON.stringify(qm.api.requestLog));
                                if(callback){callback();}
                            });
                        }, function(error){
                            qm.qmLog.error(error);
                        });
                    });
                });
            }
        },
        parseCorrelationNotificationTest: function(cb){
            var pushData = {
                color: "#2196F3",
                "content-available": "1",
                "force-start": "0",
                forceStart: "0",
                foreground: "false",
                image: "https://web.quantimo.do/img/variable_categories/symptoms.png",
                isBackground: "true",
                message: "Your EffectVariableName is generally 40% higher after $1.1 over the previous 30 days. ",
                notId: "100624100625",
                soundName: "false",
                title: "↑Higher Purchases Of CauseVariableName Predicts Significantly ↑Higher EffectVariableName",
                url: "https://web.quantimo.do/#/app/study?causeVariableId=100624&effectVariableId=100625&userId=1&clientId=quantimodo",
                user: "1"
            };
            var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, qm.getAppSettings());
            qm.assert.equals(notificationOptions.title, pushData.title);
            qm.assert.equals(notificationOptions.body, pushData.message);
            cb();
        },
        parsePushDataTest: function(callback){
            var pushData = {
                actions: '[{"longTitle":"Rate 3\\/5","callback":"trackThreeRatingAction","modifiedValue":3,"action":"track","foreground":false,"shortTitle":"3\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_ok.png","accessibilityText":"3\\/5","functionName":"track","html":"<md-tooltip>Rate 3\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_ok.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":3,"modifiedValue":3,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 3 out of 5","text":"3\\/5","title":"3\\/5","tooltip":"Rate 3\\/5"},{"longTitle":"Rate 2\\/5","callback":"trackTwoRatingAction","modifiedValue":2,"action":"track","foreground":false,"shortTitle":"2\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_sad.png","accessibilityText":"2\\/5","functionName":"track","html":"<md-tooltip>Rate 2\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_sad.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":2,"modifiedValue":2,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 2 out of 5","text":"2\\/5","title":"2\\/5","tooltip":"Rate 2\\/5"},{"longTitle":"Rate 4\\/5","callback":"trackFourRatingAction","modifiedValue":4,"action":"track","foreground":false,"shortTitle":"4\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_happy.png","accessibilityText":"4\\/5","functionName":"track","html":"<md-tooltip>Rate 4\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_happy.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":4,"modifiedValue":4,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 4 out of 5","text":"4\\/5","title":"4\\/5","tooltip":"Rate 4\\/5"}]',
                color: "#2196F3",
                "content-available": "1",
                "force-start": "1",
                foreground: "false",
                icon: "https://web.quantimo.do/img/variable_categories/emotions.png",
                image: "",
                isBackground: "true",
                lastValue: "3",
                message: "Pull down and select a value to record or tap to open inbox for more options",
                notId: "1398",
                secondToLastValue: "2",
                soundName: "false",
                thirdToLastValue: "4",
                title: "Track Overall Mood",
                trackingReminderNotificationId: "40611535",
                unitAbbreviatedName: "/5",
                url: "https://web.quantimo.do/#/app/reminders-inbox",
                valence: "positive",
                variableCategoryId: "1",
                variableDisplayName: "Overall Mood",
                variableName: "Overall Mood"
            };
            var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, qm.getAppSettings());
            qm.assert.equals(3, notificationOptions.actions.length);
            qm.assert.equals("Overall Mood", notificationOptions.title);
            callback();
        }
    },
    logBugsnagLink: function(suite, start, end){
        var query = "filters[event.since][0]="+
            start + "&filters[error.status][0]=open&filters[event.before][0]="+
            end +"&sort=last_seen";
        console.error(suite.toUpperCase()+" errors: https://app.bugsnag.com/quantimodo/"+suite+"/errors?"+ query);
    },
    outputErrorsForTest: function(testResults){
        var name = testResults.testName || testResults.name;
        console.error(name + " FAILED: https://app.ghostinspector.com/results/" + testResults._id);
        qmTests.logBugsnagLink('ionic', testResults.dateExecutionStarted, testResults.dateExecutionFinished);
        qmTests.logBugsnagLink('slim-api', testResults.dateExecutionStarted, testResults.dateExecutionFinished);
        console.error("=== CONSOLE ERRORS ====");
        for (var i = 0; i < testResults.console.length; i++) {
            var logObject = testResults.console[i];
            if(logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1){
                console.error(logObject.output + " at "+ logObject.url);
            }
        }
        process.exit(1);
    },
    runAllTestsForType: function (testType, callback) {
        console.info("=== "+testType+" Tests ===");
        qmTests.getStaticData();
        qmTests.setTestParams(this._params);
        var tests = qm.tests[testType];
        for (var testName in tests) {
            if (!tests.hasOwnProperty(testName)) continue;
            console.info(testName+"...");
            tests[testName]();
            console.info(testName+" passed! :D");
        }
        if(callback){callback();}
    }
};
gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask; // Lets us get task name
gulp.Gulp.prototype._runTask = function(task) { this.currentTask = task; this.__runTask(task);};
gulp.task('oauth-disabled-utopia', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://utopia.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-staging', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', false, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-staging-failed', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('oauth-disabled-failed', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    var url = process.env.APP_HOST_NAME;
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('57aa05ac6f43214f19b2f055', true, callback, url+'/api/v2/auth/login');
});
gulp.task('api-failed', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    var url = process.env.APP_HOST_NAME;
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('559020a9f71321f80c6d8176', true, callback, url+'/api/v2/auth/login');
});
gulp.task('api-staging-failed', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('559020a9f71321f80c6d8176', true, callback, 'https://staging.quantimo.do/api/v2/auth/login');
});
gulp.task('gi-all', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    var suiteId = '56f5b92519d90d942760ea96';
    //suiteId = '5c081c4f4a85d01c0233a9bd'; // Experimental suite with 1 success and 1 failure for debugging test runner
    qmTests.tests.executeSuite(suiteId, callback);
    //qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', false, callback);
});
gulp.task('gi-failed', function (callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    qmLog.info("Running failed tests sequentially so we don't use up all our test runs re-running successful tests");
    qmTests.tests.getSuiteTestsAndExecute('56f5b92519d90d942760ea96', true, callback);
});
gulp.task('test-get-common-variable', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params);
    qmTests.tests.commonVariables.getCar(callback);
});
gulp.task('test-record-measurement-intent', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    qmTests.tests.recordMeasurementIntentTest(callback);
});
gulp.task('test-get-units', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    qmTests.tests.getUnitsTest(callback);
});
gulp.task('test-get-users', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    qmTests.tests.getUsersTest(callback);
});
gulp.task('test-push-parsing', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    qmTests.tests.parsePushDataTest(function(){
        qmTests.tests.parseCorrelationNotificationTest(callback);
    });
});
gulp.task('_unit-tests', function(callback){
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    qmTests.runAllTestsForType('menu');
    runSequence(
        'test-push-parsing',
        'test-get-common-variable',
        'test-record-measurement-intent',
        'test-get-units',
        function(error){
            if (error) {throw error.message;}
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
gulp.task('study-tests', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.getStaticData();
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    qm.tests.study.testGetVariableAfterGettingStudy(callback);
});
gulp.task('_unit-gi-failed-gi-all', function(callback) {
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params); // For tests triggered by gulp API
    runSequence(
        '_unit-tests',
        'gi-failed',
        'gi-all',
        function(error){
            if(error){
                throw error.message;
            }
            qmLog.green('TESTS FINISHED SUCCESSFULLY');
            callback(error);
        });
});
gulp.task('chcp-dev-unit-gi-failed-gi-all', function(callback) {
    qm.currentTask = this.currentTask.name;
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
    qm.currentTask = this.currentTask.name;
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
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    qmTests.startUrl = 'https://qm-cordova-hot-code-push.s3.amazonaws.com/quantimodo/production/';
    runSequence(
        '_unit-gi-failed-gi-all',
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
    qm.currentTask = this.currentTask.name;
    qmTests.setTestParams(this._params);
    var options = {
        uri: 'http://auto:'+process.env.JENKINS_TOKEN+'@quantimodo2.asuscomm.com:8082/view/Ionic/job/ionic-gulp/buildWithParameters?token=ionic-test',
        qs: {
            API_URL: 'app.quantimo.do',
            cause: 'Netflify Deploy',
            START_URL: process.env.DEPLOY_PRIME_URL,
            SUB_FOLDER: 'tests',
            TASK_NAME: '_unit-gi-failed-gi-all',
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
gulp.task('chrome-tests', function(callback) {
    qmTests.runAllTestsForType('chrome', callback);
});