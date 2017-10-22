angular.module('starter').factory('qmLogService', function($state, $q, $rootScope) {
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
    var qmLogService = {};
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
    qmLogService.setupBugsnag = function(){
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

    qmLogService.debug = function (name, message, metaData, stackTrace) {
        message = message || name;
        name = name || message;
        metaData = metaData || null;
        message = addStateNameToMessage(message);
        qmLog.debug(name, message, metaData, stackTrace);
    };
    qmLogService.info = function (name, message, metaData, stackTrace) {
        message = message || name;
        name = name || message;
        metaData = metaData || null;
        message = addStateNameToMessage(message);
        qmLog.info(name, message, metaData, stackTrace);
    };
    qmLogService.errorOrInfoIfTesting = function (name, message, metaData, stackTrace) {
        message = message || name;
        name = name || message;
        metaData = metaData || null;
        if(envIsTesting()){
            qmLogService.info(name, message, metaData, stackTrace);
        } else {
            qmLogService.error(name, message, metaData, stackTrace);
        }
    };
    qmLogService.error = function (name, message, metaData, stackTrace){
        message = message || name;
        name = name || message;
        metaData = metaData || null;
        if(message && message.message){message = message.message;}
        message = stringifyIfNecessary(message);
        message = addStateNameToMessage(message);
        window.qmLog.error(name, message, metaData, stackTrace);
    };
    qmLogService.exception = function(exception, name, metaData){
        qmLogService.error('ERROR: ' + exception.message);
        qmLogService.setupBugsnag().then(function () {
            Bugsnag.notifyException(exception, name, metaData);
        }, function (error) {qmLogService.error(error);});
    };
    return qmLogService;
});
