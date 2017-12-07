/** @namespace window.qmLog */
angular.module('starter').factory('qmLogService', ["$state", "$q", "$rootScope", function($state, $q, $rootScope) {
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
    function addStateNameToMessage(message) {
        if($state.current.name){message = message + " in state " + $state.current.name;}
        Bugsnag.context = $state.current.name;
        return message;
    }
    qmLogService.setupBugsnag = function(){
        var deferred = $q.defer();
        if (typeof Bugsnag !== "undefined") {
            qmLog.setupBugsnag();
            Bugsnag.metaData.platform = ionic.Platform.platform();
            Bugsnag.metaData.platformVersion = ionic.Platform.version();
            deferred.resolve();
        } else {
            deferred.reject('Bugsnag is not defined');
        }
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
    qmLogService.error = function (name, message, metaData, stackTrace){
        message = message || name;
        name = name || message;
        metaData = metaData || null;
        if(message && message.message){message = message.message;}
        message = window.stringifyIfNecessary(message);
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
}]);
