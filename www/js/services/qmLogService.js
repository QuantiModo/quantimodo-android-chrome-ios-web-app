angular.module('starter').factory('qmLog', function($state, $q, $rootScope) {
    // A separate logger file allows us to use "black-boxing" in the Chrome dev console to preserve actual file line numbers
    // BLACK BOX THESE
    // \.min\.js$ — for all minified sources
    // qmLogger.js
    // qmLogService.js
    // bugsnag.js
    // node_modules and bower_components — for dependencies
    //     ~ — home for dependencies in Webpack bundle
    // bundle.js — it’s a bundle itself (we use sourcemaps, don’t we?)
    // \(webpack\)-hot-middleware — HMR
    var qmLog = {};
    function stringifyIfNecessary(variable){
        if(!variable || typeof message === "string"){return variable;}
        return JSON.stringify(variable);
    }
    function addStateNameToMessage(message) {
        if($state.current.name){message = message + " in state " + $state.current.name;}
        Bugsnag.context = $state.current.name;
        return message;
    }
    function envIsDevelopment() {return getEnv() === 'development';}
    function envIsTesting() {return getEnv() === 'testing';}
    function getEnv(){
        var env = "production";
        if(window.location.origin.indexOf('local') !== -1){env = "development";}
        if(window.location.origin.indexOf('staging') !== -1){env = "staging";}
        if(window.location.origin.indexOf('ionic.quantimo.do') !== -1){env = "staging";}
        if($rootScope.user){
            if($rootScope.user.email && $rootScope.user.email.toLowerCase().indexOf('test') !== -1){env = "testing";}
            if($rootScope.user.displayName && $rootScope.user.displayName.toLowerCase().indexOf('test') !== -1){env = "testing";}
        }
        if(window.location.href.indexOf("heroku") !== -1){env = "testing";}
        return env;
    }
    qmLog.setupBugsnag = function(){
        var deferred = $q.defer();
        if (typeof Bugsnag !== "undefined") {
            //Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
            //Bugsnag.notifyReleaseStages = ['Production','Staging'];
            Bugsnag.releaseStage = getEnv();
            Bugsnag.metaData = {platform: ionic.Platform.platform(), platformVersion: ionic.Platform.version()};
            if(typeof config !== "undefined"){
                Bugsnag.appVersion = config.appSettings.versionNumber;
                Bugsnag.metaData.appDisplayName = config.appSettings.appDisplayName;
            }
            if($rootScope.user){Bugsnag.metaData.user = {name: $rootScope.user.displayName, email: $rootScope.user.email};}
            deferred.resolve();
        } else {deferred.reject('Bugsnag is not defined');}
        return deferred.promise;
    };
    qmLog.getDebugMode = function() {
        if(getUrlParameter('debug') || getUrlParameter('debugMode') || (typeof appSettings !== "undefined" && isTruthy(appSettings.debugMode))){
            qmLog.debugMode = true;
            window.debugMode = true;
        }
        return window.debugMode || qmLog.debugMode;
    };
    qmLog.debug = function(message, stackTrace) {
        message = addStateNameToMessage(message);
        logDebug(message, stackTrace);
    };
    qmLog.info = function(message, stackTrace) {
        message = addStateNameToMessage(message);
        logInfo(message, stackTrace);
    };
    qmLog.errorOrInfoIfTesting = function(message, additionalMetaData, stackTrace) {
        if(envIsTesting()){
            qmLog.info(message, stackTrace)
        } else {
            qmLog.error(message, additionalMetaData, stackTrace);
        }
    };
    qmLog.error = function(message, additionalMetaData, stackTrace){
        if(message && message.message){message = message.message;}
        message = stringifyIfNecessary(message);
        message = addStateNameToMessage(message);
        window.logError(message, additionalMetaData, stackTrace);
    };
    qmLog.exception = function(exception, name, metaData){
        qmLog.error('ERROR: ' + exception.message);
        qmLog.setupBugsnag().then(function () {
            Bugsnag.notifyException(exception, name, metaData);
        }, function (error) {qmLog.error(error);});
    };
    return qmLog;
});
