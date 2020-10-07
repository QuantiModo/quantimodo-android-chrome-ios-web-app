if(!process.env.GI_API_KEY){throw "Please set GI_API_KEY env from https://app.ghostinspector.com/account"}
console.info("Using GI_API_KEY starting with "+process.env.GI_API_KEY.substr(0, 4)+'...');
//var localforage = require('./../src/lib/localforage/dist/localforage');
var argv = require('./../node_modules/yargs').argv;
var GhostInspector = require('./../node_modules/ghost-inspector')(process.env.GI_API_KEY);
var gulp = require('./../node_modules/gulp');
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
