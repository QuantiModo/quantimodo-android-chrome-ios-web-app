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
window.qmLog = {debugMode:false};
Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
var logMetaData = false;
if(!window.qmUser){
    window.qmUser = localStorage.getItem('user');
    if(window.qmUser){window.qmUser = JSON.parse(window.qmUser);}
}
qmLog.mobileDebug = false;
qmLog.loglevel = "info";
window.isTruthy = function(value){return value && value !== "false"; };
window.stringifyIfNecessary = function(variable){
    if(!variable || typeof message === "string"){return variable;}
    try {
        return JSON.stringify(variable);
    } catch (error) {
        console.error("Could not stringify", variable);
        return "Could not stringify";
    }
};
window.qmLog.getLogLevelName = function() {
    if(window.location.href.indexOf('utopia.quantimo.do') > -1){
        return "debug";
    }
    if(qmLog.debugMode){return "debug";}
    if(qmLog.loglevel){return qmLog.loglevel;}
    if(urlHelper.getParam('debug') || urlHelper.getParam('debugMode')){
        qmLog.loglevel = "debug";
        return qmLog.loglevel;
    }
    if(urlHelper.getParam('logLevel')){
        qmLog.loglevel = urlHelper.getParam('logLevel');
        return qmLog.loglevel;
    }
    return "error";
};
window.qmLog.isDebugMode = function() {return qmLog.getLogLevelName() === "debug";};
window.qmLog.getStackTrace = function() {
    var err = new Error();
    var stackTrace = err.stack;
    stackTrace = stackTrace.substring(stackTrace.indexOf('getStackTrace')).replace('getStackTrace', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.debug')).replace('window.qmLog.debug', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.info')).replace('window.qmLog.info', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.error')).replace('window.qmLog.error', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.debug')).replace('window.qmLog.debug', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.info')).replace('window.qmLog.info', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.error')).replace('window.qmLog.error', '');
    return stackTrace;
};
function addStackTraceToMessage(message, stackTrace) {
    if(message.toLowerCase().indexOf('stacktrace') !== -1){return message;}
    if(!stackTrace){stackTrace = qmLog.getStackTrace();}
    return message + ".  StackTrace: " + stackTrace;
}
function getCalleeFunction() {
    return arguments.callee.caller.caller.caller.caller;
}
function getCalleeFunctionName() {
    if(getCalleeFunction() && getCalleeFunction().name && getCalleeFunction().name !== ""){
        return getCalleeFunction().name;
    }
    return null;
}
function getCallerFunction() {
    if(getCalleeFunction()){
        try {
            return getCalleeFunction().caller;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    return null;
}
function getCallerFunctionName() {
    if(getCallerFunction() && getCallerFunction().name && getCallerFunction().name !== ""){
        return getCallerFunction().name;
    }
    return null;
}
function addCallerFunctionToMessage(message) {
    if(getCalleeFunctionName()){message = "callee " + getCalleeFunctionName() + ": " + message;}
    if(getCallerFunctionName()){message = "Caller " + getCallerFunctionName() + " called " + message;}
    return message;
}
qmLog.addGlobalMetaDataAndLog = function(name, message, metaData, stacktrace) {
    var i = 0;
    metaData = qmLog.addGlobalMetaData(name, message, metaData, stacktrace);
    if (!logMetaData){return metaData;}
    for (var propertyName in metaData) {
        if (metaData.hasOwnProperty(propertyName)) {
            if(metaData[propertyName]){
                i++;
                console.log(propertyName + ": " + window.stringifyIfNecessary(metaData[propertyName]));
                if(i > 10){
                    break;
                }
            }
        }
    }
    return metaData;
};
window.qmLog.getEnv = function(){
    var env = "production";
    if(window.location.origin.indexOf('local') !== -1){env = "development";}
    if(window.location.origin.indexOf('staging') !== -1){env = "staging";}
    if(window.location.origin.indexOf('ionic.quantimo.do') !== -1){env = "staging";}
    if(qmUser){
        if(qmUser.email && qmUser.email.toLowerCase().indexOf('test') !== -1){env = "testing";}
        if(qmUser.displayName && qmUser.displayName.toLowerCase().indexOf('test') !== -1){env = "testing";}
    }
    if(window.location.href.indexOf("heroku") !== -1){env = "testing";}
    return env;
};
qmLog.envIsTesting = function(){
    return qmLog.getEnv() === 'testing';
};
window.qmLog.addGlobalMetaData = function(name, message, metaData, logLevel, stackTrace) {
    metaData = metaData || {};
    function obfuscateSecrets(object){
        if(typeof object !== 'object'){return object;}
        try {
            object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        } catch (error) {
            Bugsnag.notify("Could not decouple object: " + error , "object = JSON.parse(JSON.stringify(object))", object, "error");
            //window.qmLog.error(error, object); // Avoid infinite recursion
            return object;
        }
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                var lowerCaseProperty = propertyName.toLowerCase();
                if(lowerCaseProperty.indexOf('secret') !== -1 || lowerCaseProperty.indexOf('password') !== -1 || lowerCaseProperty.indexOf('token') !== -1){
                    object[propertyName] = "HIDDEN";
                } else {
                    object[propertyName] = obfuscateSecrets(object[propertyName]);
                }
            }
        }
        return object;
    }
    function getTestUrl() {
        function getCurrentRoute() {
            var parts = window.location.href.split("#/app");
            return parts[1];
        }
        var url = "https://local.quantimo.do/ionic/Modo/www/index.html#/app" + getCurrentRoute();
        if(window.qmUser){
            url +=  "?userEmail=" + encodeURIComponent(window.qmUser.email);
        }
        return url;
    }
    function cordovaPluginsAvailable() {
        if(typeof cordova === "undefined"){return false;}
        return typeof cordova.plugins !== "undefined";
    }
    metaData.installed_plugins = {
        "Analytics": (typeof Analytics !== "undefined") ? "installed" : "not installed",
        "backgroundGeoLocation": (typeof backgroundGeoLocation !== "undefined") ? "installed" : "not installed",
        "cordova.plugins.notification": (cordovaPluginsAvailable() && typeof cordova.plugins.notification !== "undefined") ? "installed" : "not installed",
        "facebookConnectPlugin": (typeof facebookConnectPlugin !== "undefined"),
        "window.plugins.googleplus": (window && window.plugins && window.plugins.googleplus)  ? "installed" : "not installed",
        "window.overApps": (cordovaPluginsAvailable() && typeof window.overApps !== "undefined") ? "installed" : "not installed",
        "inAppPurchase": (typeof window.inAppPurchase !== "undefined") ? "installed" : "not installed",
        "ionic": (typeof ionic !== "undefined") ? "installed" : "not installed",
        "ionicDeploy": (typeof $ionicDeploy !== "undefined") ? "installed" : "not installed",
        "PushNotification": (typeof PushNotification !== "undefined") ? "installed" : "not installed",
        "SplashScreen": (typeof navigator !== "undefined" && typeof navigator.splashscreen !== "undefined") ? "installed" : "not installed",
        "UserVoice": (typeof UserVoice !== "undefined") ? "installed" : "not installed"
    };
    metaData.push_data = {
        "deviceTokenOnServer": qmStorage.getItem(qmItems.deviceTokenOnServer),
        "deviceTokenToSync": qmStorage.getItem(qmItems.deviceTokenToSync),
        "last_push": window.qmPush.getTimeSinceLastPushString(),
        "push enabled": qmPush.enabled(),
        "draw over apps enabled": window.qmNotifications.drawOverAppsEnabled(),
        "last popup": qmNotifications.getTimeSinceLastPopupString()
    };
    if(qmLog.isDebugMode()){metaData.local_storage = window.qmStorage.getLocalStorageList();} // Too slow to do for every error
    if(qm.getAppSettings()){
        metaData.build_server = config.appSettings.buildServer;
        metaData.build_link = config.appSettings.buildLink;
    }
    metaData.test_app_url = getTestUrl();
    if (!metaData.groupingHash) {metaData.groupingHash = name;}
    if (!metaData.callerFunctionName) {metaData.callerFunctionName = getCallerFunctionName();}
    if (!metaData.calleeFunctionName) {metaData.calleeFunctionName = getCalleeFunctionName();}
    if (stackTrace) {
        metaData.stackTrace = stackTrace;
    } else {
        metaData.stackTrace = qmLog.getStackTrace();
    }
    if(metaData.apiResponse){
        var request = metaData.apiResponse.req;
        metaData.test_api_url = request.method + " " + request.url;
        if(request.header.Authorization){
            metaData.test_api_url = addQueryParameter(metaData.test_api_url, "access_token", request.header.Authorization.replace("Bearer ", ""));
        }
        console.error('API ERROR URL ' + metaData.test_api_url, metaData);
        delete metaData.apiResponse;
    }
    //metaData.appSettings = config.appSettings;  // Request Entity Too Large
    //if(metaData){metaData.additionalInfo = metaData;}
    //if(window.qmUser){metaData.user = window.qmUser;} // Request Entity Too Large
    metaData = obfuscateSecrets(metaData);
    return metaData;
};
window.qmLog.setupBugsnag = function(){
    if (typeof Bugsnag !== "undefined") {
        //Bugsnag.notifyReleaseStages = ['Production','Staging'];
        Bugsnag.releaseStage = qmLog.getEnv();
        if(typeof Bugsnag.metaData === "undefined"){Bugsnag.metaData = {};}
        Bugsnag.metaData = qmLog.addGlobalMetaData(null, null, Bugsnag.metaData, null, null);
        if(qm.getAppSettings()){
            Bugsnag.appVersion = config.appSettings.versionNumber;
            Bugsnag.metaData.appDisplayName = config.appSettings.appDisplayName;
        }
        if(qmUser){Bugsnag.metaData.user = {name: qmUser.displayName, email: qmUser.email, id: qmUser.id};}
    } else {
        qmLog.error('Bugsnag is not defined');
    }
};
//window.qmLog.setupBugsnag();
window.qmLog.setupUserVoice = function() {
    if (typeof UserVoice !== "undefined") {
        UserVoice.push(['identify', {
            email: qmUser.email, // User’s email address
            name: qmUser.displayName, // User’s real name
            created_at: window.timeHelper.getUnixTimestampInSeconds(userHelper.getUser().userRegistered), // Unix timestamp for the date the user signed up
            id: userHelper.getUser().id, // Optional: Unique id of the user (if set, this should not change)
            type: qm.getSourceName() + ' User (Subscribed: ' + userHelper.getUser().subscribed + ')', // Optional: segment your users by type
            account: {
                //id: 123, // Optional: associate multiple users with a single account
                name: qm.getSourceName() + ' v' + config.appSettings.versionNumber, // Account name
                //created_at: 1364406966, // Unix timestamp for the date the account was created
                //monthly_rate: 9.99, // Decimal; monthly rate of the account
                //ltv: 1495.00, // Decimal; lifetime value of the account
                //plan: 'Subscribed' // Plan name for the account
            }
        }]);
    }
};
window.qmLog.setupIntercom = function() {
    window.intercomSettings = {
        app_id: "uwtx2m33",
        name: userHelper.getUser().displayName,
        email: userHelper.getUser().email,
        user_id: userHelper.getUser().id,
        app_name: config.appSettings.appDisplayName,
        app_version: config.appSettings.versionNumber,
        platform: qm.getPlatform()
    };
};
function bugsnagNotify(name, message, metaData, logLevel, stackTrace){
    if(typeof Bugsnag === "undefined"){ console.error('Bugsnag not defined', metaData); return; }
    metaData = qmLog.addGlobalMetaData(name, message, metaData, logLevel, stackTrace);
    Bugsnag.notify(name, message, metaData, logLevel);
}
window.qmLog.shouldWeLog = function(providedLogLevelName) {
    var globalLogLevelValue = logLevels[qmLog.getLogLevelName()];
    var providedLogLevelValue = logLevels[providedLogLevelName];
    return globalLogLevelValue >= providedLogLevelValue;
};
var logLevels = {
  "error": 1,
  "info": 2,
  "debug": 3
};
function getConsoleLogString(name, message, metaData, stackTrace){
    var logString = name;
    if(message && logString !== message){logString = logString + ": " + message;}
    logString = addCallerFunctionToMessage(logString);
    if(stackTrace){logString = logString + ". stackTrace: " + stackTrace;}
    if(metaData){logString = logString + ". metaData: " + metaData;}
    return logString;
}
window.qmLog.debug = function (name, message, metaData, stackTrace) {
    message = message || name;
    name = name || message;
    metaData = metaData || null;
    if(!qmLog.shouldWeLog("debug")){return;}
    message = addCallerFunctionToMessage(message);
    var logString = name;
    if(logString !== message){logString = logString + ": " + message;}
    if(stackTrace){logString = logString + ". stackTrace: " + stackTrace;}
    console.debug("DEBUG: " + getConsoleLogString(name, message, metaData, stackTrace), metaData);
    //metaData = qmLog.addGlobalMetaDataAndLog(name, message, metaData, stackTrace);
    //bugsnagNotify(name, message, metaData, "debug", stackTrace);
};
window.qmLog.info = function (name, message, metaData, stackTrace) {
    name = name || message;
    metaData = metaData || null;
    //console.info(name + ": " + message);
    if(!qmLog.shouldWeLog("info")){return;}
    message = addCallerFunctionToMessage(message);
    console.info("INFO: " + getConsoleLogString(name, message, metaData, stackTrace), metaData);
    //metaData = qmLog.addGlobalMetaDataAndLog(name, message, metaData, stackTrace);
    //bugsnagNotify(name, message, metaData, "info", stackTrace);
};
window.qmLog.error = function (name, message, metaData, stackTrace) {
    if(!qmLog.shouldWeLog("error")){return;}
    message = message || name;
    name = name || message;
    if(message && message.message){message = message.message;}
    console.error("ERROR: " + getConsoleLogString(name, message, metaData, stackTrace), metaData);
    metaData = qmLog.addGlobalMetaDataAndLog(name, message, metaData, stackTrace);
    bugsnagNotify(name, message, metaData, "error", stackTrace);
    if(window.qmLog.mobileDebug){alert(name + ": " + message);}
};
window.qmLog.authDebug = function(message) {
    var authDebug = false;
    if(authDebug || qmLog.debugMode){qmLog.debug(message, message, null);}
};
window.qmLog.pushDebug = function(name, message, metaData, stackTrace) {
    var pushDebug = false;
    if(pushDebug || qmLog.debugMode){
        qmLog.error("PushNotification Debug: " + name, message, metaData, stackTrace);
    } else {
        qmLog.info("PushNotification Debug: " + name, message, metaData, stackTrace);
    }
};
