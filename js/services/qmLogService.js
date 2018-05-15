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
        qmLog.context = $state.current.name;
        return message;
    }
    qmLogService.setupBugsnag = function(){
        var deferred = $q.defer();
        qmLog.setupBugsnag();
        qmLog.metaData.platform = ionic.Platform.platform();
        qmLog.metaData.platformVersion = ionic.Platform.version();
        deferred.resolve();
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
    return qmLogService;
}]);
