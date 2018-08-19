/* eslint-disable no-irregular-whitespace */
// A separate logger file allows us to use "black-boxing" in the Chrome dev console to preserve actual file line numbers
// BLACK BOX THESE
// \.min\.js$ — for all minified sources
// qmLogger.js
// qmLogService.js
// bugsnag.js
// node_modules and bower_components — for dependencies
// — home for dependencies in Webpack bundle
// bundle.js — it’s a bundle itself (we use sourcemaps, don’t we?)
// \(webpack\)-hot-middleware — HMR
window.qmLog = {
    name: null,
    setName: function(name, message) {
        if(name && name.response && name.response.body){
            var body = name.response.body;
            qmLog.name = body.errorMessage || body.message || JSON.stringify(body);
        }
        qmLog.name = name || message;
        if(qm.platform.isMobile()){qmLog.name = "QM: " + name;} // Use for filtering in LogCat
    },
    message: null,
    setMessage: function(name, message) {
        if(message && typeof message === 'object'){
            qmLog.message = message.message || JSON.stringify(message);
        } else {
            qmLog.message = message || name;
        }
        if(qm.platform.isMobile() && qmLog.isDebugMode()){qmLog.message = addCallerFunctionToMessage(qmLog.message || "");}
        return qmLog.message;
    },
    globalMetaData : {
        context: null,
        chcpInfo: {
            error: null
        },
        message: {},
        name: {}
    },
    getCombinedMetaData: function(name, message, errorSpecificMetaData, stackTrace) {
        var combinedMetaData = qmLog.getGlobalMetaData();
        combinedMetaData = JSON.parse(JSON.stringify(combinedMetaData));
        combinedMetaData.errorSpecificMetaData = errorSpecificMetaData;
        combinedMetaData.stackTrace = stackTrace;
        combinedMetaData.message = message;
        combinedMetaData.name = name;
        combinedMetaData = qmLog.obfuscateSecrets(combinedMetaData);
        return combinedMetaData;
    },
    stacktrace: null,
    populateReport: function(name, message, metaData, stacktrace){
        qmLog.setName(name, message);
        qmLog.setMessage(name, message);
        qmLog.stacktrace = stacktrace | null;
    },
    mobileDebug: null,
    logLevel: null,
    setLogLevelName: function(value){
        if(qmLog.logLevel === value){return;}
        qmLog.logLevel = value;
        if(typeof localStorage !== "undefined"){
            localStorage.setItem(qm.items.logLevel, value); // Can't use qm.storage because of recursion issue
        }
    },
    getLogLevelName: function() {
        if(window.location.href.indexOf('utopia.quantimo.do') > -1){return "debug";}
        if(qm.urlHelper.getParam('debug') || qm.urlHelper.getParam('debugMode')){qmLog.setLogLevelName("debug");}
        if(qm.urlHelper.getParam(qm.items.logLevel)){qmLog.setLogLevelName(qm.urlHelper.getParam(qm.items.logLevel));}
        if(qmLog.logLevel){return qmLog.logLevel;}
        if(typeof localStorage !== "undefined"){
            qmLog.logLevel = localStorage.getItem(qm.items.logLevel);  // Can't use qm.storage because of recursion issue
        }
        if(qmLog.logLevel){return qmLog.logLevel;}
        var defaultLevel = (qm.appMode.isDevelopment()) ? "info" : "error";
        qmLog.setLogLevelName(defaultLevel); // I think info logs might be slowing down iOS app so default to error
        return qmLog.logLevel;
    },
    setAuthDebugEnabled: function (value) {
        qmLog.authDebugEnabled = value;
        if(qmLog.authDebugEnabled && window.localStorage){
            qm.storage.setItem('authDebugEnabled', value);
        }
        return qmLog.authDebugEnabled;
    },
    setDebugMode: function (value) {
        if (value) {
            qmLog.setLogLevelName("debug");
        } else {
            qmLog.setLogLevelName("info");
        }
        return value;
    },
    isDebugMode: function() {
        return qmLog.getLogLevelName() === "debug";
    },
    getDebugMode: function () {
        return qmLog.isDebugMode();
    },
    setMobileDebug: function (value) {
        qmLog.mobileDebug = value;
    },
    obfuscateSecrets: function(object){
        if(typeof object !== 'object'){return object;}
        try {
            object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        } catch (error) {
            if(typeof Bugsnag !== "undefined"){
                bugsnagClient.notify("Could not decouple object to obfuscate secrets: " + error ,
                    "object = JSON.parse(JSON.stringify(object))", {problem_object: object}, "error");
            }
            //window.qmLog.error(error, object); // Avoid infinite recursion
            return {};
        }
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                var lowerCaseProperty = propertyName.toLowerCase();
                if(qmLog.secretAliases.indexOf(lowerCaseProperty) !== -1){
                    object[propertyName] = "HIDDEN";
                } else {
                    object[propertyName] = qmLog.obfuscateSecrets(object[propertyName]);
                }
            }
        }
        return object;
    },
    secretAliases: ['secret', 'password', 'token', 'secret', 'private'],
    stringContainsSecretAliasWord: function(string){
        var lowerCase = string.toLowerCase();
        var censoredString = lowerCase;
        for (var i = 0; i < qmLog.secretAliases.length; i++) {
            var secretAlias = qmLog.secretAliases[i];
            if(lowerCase.indexOf(secretAlias) !== -1){
                censoredString = qm.stringHelper.getStringBeforeSubstring(secretAlias, censoredString) + " " + secretAlias + "...";
            }
        }
        if(censoredString !== lowerCase){return censoredString;}
        return false;
    },
    error: function (name, message, errorSpecificMetaData, stackTrace) {
        if(!qmLog.shouldWeLog("error")){return;}
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        console.error(qmLog.getConsoleLogString("ERROR", errorSpecificMetaData), errorSpecificMetaData);
        qmLog.globalMetaData = qmLog.addGlobalMetaDataAndLog(qmLog.name, qmLog.message, errorSpecificMetaData, qmLog.stackTrace);
        function bugsnagNotify(name, message, errorSpecificMetaData, logLevel, stackTrace){
            if(typeof bugsnagClient === "undefined") {
                if (!qm.appMode.isDevelopment()) {console.error('bugsnagClient not defined', errorSpecificMetaData);}
                return;
            }
            var combinedMetaData = qmLog.getCombinedMetaData(name, message, errorSpecificMetaData, stackTrace);
            if(!name){name = "No error name provided";}
            if(!message){message = "No error message provided";}
            if(typeof name !== "string"){name = message;}
            if(typeof message !== "string"){message = JSON.stringify(message);}
            bugsnagClient.notify({ name: name, message: message}, {severity: logLevel, metaData: combinedMetaData});
        }
        bugsnagNotify(qmLog.name, qmLog.message, errorSpecificMetaData, "error", qmLog.stackTrace);
        //if(window.qmLog.mobileDebug){alert(name + ": " + message);}
    },
    pushDebug: function(name, message, errorSpecificMetaData, stackTrace) {
        //qmLog.pushDebugEnabled = true;
        if(!qmLog.pushDebugEnabled){
            qmLog.pushDebugEnabled = window.location.href.indexOf("pushDebugEnabled") !== -1;
            if(qmLog.pushDebugEnabled && window.localStorage){
                localStorage.setItem('pushDebugEnabled', "true");
            }
        }
        if(!qmLog.pushDebugEnabled && window.localStorage){qmLog.pushDebugEnabled = localStorage.getItem('pushDebugEnabled');}
        if(qmLog.pushDebugEnabled || qmLog.isDebugMode()){
            qmLog.error("PushNotification Debug: " + name, message, errorSpecificMetaData, stackTrace);
        } else {
            qmLog.info("PushNotification Debug: " + name, message, errorSpecificMetaData, stackTrace);
        }
    },
    getAuthDebugEnabled: function(message){
        if(message.indexOf("cloudtestlabaccounts") !== -1){ // Keeps spamming bugsnag
            return qmLog.setAuthDebugEnabled(false);
        }
        if(!qmLog.authDebugEnabled && window.location.href.indexOf("authDebug") !== -1){
            return qmLog.setAuthDebugEnabled(true)
        }
        if(qmLog.authDebugEnabled === null && window.localStorage){
            qmLog.authDebugEnabled = localStorage.getItem('authDebugEnabled');
        }
        return qmLog.authDebugEnabled;
    },
    authDebug: function(name, message, errorSpecificMetaData) {
        if(!qmLog.getAuthDebugEnabled(name)){return;}
        name = "Auth Debug: " + name;
        if(qm.platform.isMobile()){
            qmLog.error(name, message, errorSpecificMetaData);
        } else {
            qmLog.info(name, message, errorSpecificMetaData);
        }
    },
    webAuthDebug: function(name, message, errorSpecificMetaData) {
        if(!qm.platform.isMobile()){qmLog.authDebug(name, message, errorSpecificMetaData);}
    },
    warn: function (name, message, errorSpecificMetaData, stackTrace) {
        if(!qmLog.shouldWeLog("warn")){return;}
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        if(errorSpecificMetaData){
            console.warn(qmLog.getConsoleLogString("WARNING", errorSpecificMetaData), errorSpecificMetaData);
        } else {
            console.warn(qmLog.getConsoleLogString("WARNING", errorSpecificMetaData));
        }
    },
    info: function (name, message, errorSpecificMetaData, stackTrace) {
        if(!qmLog.shouldWeLog("info")){return;}
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        if(errorSpecificMetaData){
            console.info(qmLog.getConsoleLogString("INFO", errorSpecificMetaData), errorSpecificMetaData);
        } else {
            console.info(qmLog.getConsoleLogString("INFO", errorSpecificMetaData));
        }
    },
    debug: function (name, message, errorSpecificMetaData, stackTrace) {
        if(!qmLog.shouldWeLog("debug")){return;}
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        if(errorSpecificMetaData){
            console.debug(qmLog.getConsoleLogString("DEBUG", errorSpecificMetaData), errorSpecificMetaData);
        } else {
            console.debug(qmLog.getConsoleLogString("DEBUG", errorSpecificMetaData));
        }
    },
    errorOrInfoIfTesting: function (name, message, metaData, stackTrace) {
        message = message || name;
        name = name || message;
        qmLog.globalMetaData = qmLog.globalMetaData || null;
        if(qm.appMode.isTesting()){
            qmLog.info(name, message, metaData, stackTrace);
        } else {
            qmLog.error(name, message, metaData, stackTrace);
        }
    },
    getConsoleLogString: function (logLevel, errorSpecificMetaData){
        var logString = qmLog.name;
        if(qmLog.message && logString !== qmLog.message){logString = logString + ": " + qmLog.message;}
        if(qm.platform.isMobileOrTesting() && qmLog.isDebugMode()){logString = addCallerFunctionToMessage(logString);}
        if(qmLog.stackTrace){logString = logString + ". stackTrace: " + qmLog.stackTrace;}
        if(errorSpecificMetaData && qm.platform.isMobileOrTesting()){ // Meta object is already logged nicely in browser console
            try {
                if(qmLog.isDebugMode()){  // stringifyCircularObject might be too resource intensive
                    logString = logString + ". metaData: " + qm.stringHelper.stringifyCircularObject(errorSpecificMetaData);
                }
            } catch (error) {
                console.error("Could not stringify log meta data", error);
            }
        }
        var censored = qmLog.stringContainsSecretAliasWord(logString);
        if(censored){logString = censored;}
        if(qm.platform.isMobileOrTesting()){logString = logLevel + ": " + logString;}
        return logString;
    },
    shouldWeLog: function(providedLogLevelName) {
        var globalLogLevelValue = qmLog.logLevels[qmLog.getLogLevelName()];
        var providedLogLevelValue = qmLog.logLevels[providedLogLevelName];
        return globalLogLevelValue >= providedLogLevelValue;
    },
    getGlobalMetaData: function() {
        function getTestUrl() {
            function getCurrentRoute() {
                var parts = window.location.href.split("#/app");
                return parts[1];
            }
            var url = "https://local.quantimo.do/ionic/Modo/www/index.html#/app" + getCurrentRoute();
            if(qm.getUser()){url = qm.urlHelper.addUrlQueryParamsToUrlString({userEmail: qm.getUser().email}, url);}
            return url;
        }
        function cordovaPluginsAvailable() {
            if(typeof cordova === "undefined"){return false;}
            return typeof cordova.plugins !== "undefined";
        }
        qmLog.globalMetaData.installed_plugins = {
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
        qmLog.globalMetaData.push_data = {
            "deviceTokenOnServer": qm.storage.getItem(qm.items.deviceTokenOnServer),
            "deviceTokenToSync": qm.storage.getItem(qm.items.deviceTokenToSync),
            "last_push": window.qm.push.getTimeSinceLastPushString(),
            "push enabled": qm.push.enabled(),
            "draw over apps enabled": qm.storage.getItem(qm.items.drawOverAppsPopupEnabled), // Don't use function drawOverAppsPopupEnabled() because of recursion error
            "last popup": qm.notifications.getTimeSinceLastPopupString()
        };
        if(qmLog.isDebugMode()){qmLog.globalMetaData.local_storage = window.qm.storage.getLocalStorageList();} // Too slow to do for every error
        if(qm.getAppSettings()){
            qmLog.globalMetaData.build_server = qm.getAppSettings().buildServer;
            qmLog.globalMetaData.build_link = qm.getAppSettings().buildLink;
        }
        qmLog.globalMetaData.test_app_url = getTestUrl();
        qmLog.globalMetaData.window_location_href = window.location.href;
        qmLog.globalMetaData.window_location_origin = window.location.origin;
        function addQueryParameter(url, name, value){
            if(url.indexOf('?') === -1){return url + "?" + name + "=" + value;}
            return url + "&" + name + "=" + value;
        }
        if(qmLog.globalMetaData.apiResponse){
            var request = qmLog.globalMetaData.apiResponse.req;
            qmLog.globalMetaData.test_api_url = request.method + " " + request.url;
            if(request.header.Authorization){
                qmLog.globalMetaData.test_api_url = addQueryParameter(qmLog.globalMetaData.test_api_url, "access_token", request.header.Authorization.replace("Bearer ", ""));
            }
            console.error('API ERROR URL ' + qmLog.globalMetaData.test_api_url, qmLog.globalMetaData);
            delete qmLog.globalMetaData.apiResponse;
        }
        qmLog.globalMetaData.local_notifications = qm.storage.getItem(qm.items.scheduledLocalNotifications);
        if(typeof ionic !== "undefined"){
            qmLog.globalMetaData.platform = ionic.Platform.platform();
            qmLog.globalMetaData.platformVersion = ionic.Platform.version();
        }
        if(qm.getAppSettings()){qmLog.globalMetaData.appDisplayName = qm.getAppSettings().appDisplayName;}
        return qmLog.globalMetaData;
    },
    setupIntercom: function() {
        window.intercomSettings = {
            app_id: "uwtx2m33",
            name: qm.userHelper.getUserFromLocalStorage().displayName,
            email: qm.userHelper.getUserFromLocalStorage().email,
            user_id: qm.userHelper.getUserFromLocalStorage().id,
            app_name: qm.getAppSettings().appDisplayName,
            app_version: qm.getAppSettings().versionNumber,
            platform: qm.platform.getCurrentPlatform()
        };
    },
    setupUserVoice: function() {
        if (typeof UserVoice !== "undefined") {
            UserVoice.push(['identify', {
                email: qm.getUser().email, // User’s email address
                name: qm.getUser().displayName, // User’s real name
                created_at: window.qm.timeHelper.getUnixTimestampInSeconds(qm.userHelper.getUserFromLocalStorage().userRegistered), // Unix timestamp for the date the user signed up
                id: qm.userHelper.getUserFromLocalStorage().id, // Optional: Unique id of the user (if set, this should not change)
                type: qm.getSourceName() + ' User (Subscribed: ' + qm.userHelper.getUserFromLocalStorage().subscribed + ')', // Optional: segment your users by type
                account: {
                    //id: 123, // Optional: associate multiple users with a single account
                    name: qm.getSourceName() + ' v' + qm.getAppSettings().versionNumber, // Account name
                    //created_at: 1364406966, // Unix timestamp for the date the account was created
                    //monthly_rate: 9.99, // Decimal; monthly rate of the account
                    //ltv: 1495.00, // Decimal; lifetime value of the account
                    //plan: 'Subscribed' // Plan name for the account
                }
            }]);
        }
    },
    setupBugsnag: function(){
        if (typeof bugsnag !== "undefined") {
            var options = {
                apiKey: "ae7bc49d1285848342342bb5c321a2cf",
                releaseStage: qm.appMode.getAppMode(),
                //notifyReleaseStages: [ 'staging', 'production' ],
                metaData: qmLog.getGlobalMetaData(),
                user: qmLog.obfuscateSecrets(qm.userHelper.getUserFromLocalStorage()),
                beforeSend: function (report) {}
            };
            if(qm.getUser()){options.user = qmLog.obfuscateSecrets(qm.getUser());}
            if(qm.getAppSettings()){options.appVersion = qm.getAppSettings().androidVersionCode;}
            window.bugsnagClient = bugsnag(options);
        } else {
            if(!qm.appMode.isDevelopment()){qmLog.error('Bugsnag is not defined');}
        }
    },
    getStackTrace: function() {
        var err = new Error();
        var stackTrace = err.stack;
        if(!stackTrace){
            console.log("Could not get stack trace");
            return null;
        }
        stackTrace = stackTrace.substring(stackTrace.indexOf('getStackTrace')).replace('getStackTrace', '');
        stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.debug')).replace('window.qmLog.debug', '');
        stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.info')).replace('window.qmLog.info', '');
        stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.error')).replace('window.qmLog.error', '');
        stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.debug')).replace('window.qmLog.debug', '');
        stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.info')).replace('window.qmLog.info', '');
        stackTrace = stackTrace.substring(stackTrace.indexOf('window.qmLog.error')).replace('window.qmLog.error', '');
        return stackTrace;
    },
    logLevels: {
        "error": 1,
        "warn": 2,
        "info": 3,
        "debug": 4
    },
    addGlobalMetaDataAndLog: function(name, message, errorSpecificMetaData, stacktrace) {
        var i = 0;
        var combinedMetaData = qmLog.getCombinedMetaData(name, message, errorSpecificMetaData, stacktrace);
        var logMetaData = false;
        if (!logMetaData){return combinedMetaData;}
        for (var propertyName in combinedMetaData) {
            if (combinedMetaData.hasOwnProperty(propertyName)) {
                if(combinedMetaData[propertyName]){
                    i++;
                    console.log(propertyName + ": " + window.stringifyIfNecessary(combinedMetaData[propertyName]));
                    if(i > 10){
                        break;
                    }
                }
            }
        }
        return combinedMetaData;
    }
};
if(typeof bugsnag !== "undefined"){
    window.bugsnagClient = bugsnag("ae7bc49d1285848342342bb5c321a2cf");
}
if(!window.qmUser){
    if(typeof localStorage !== "undefined"){
        window.qmUser = localStorage.getItem('user');
    }
    if(window.qmUser){window.qmUser = JSON.parse(window.qmUser);}
}
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
function getCalleeFunction() {
    var callee = arguments.callee.caller;
    if(callee.caller){callee = callee.caller;}
    if(callee.caller){callee = callee.caller;}
    if(callee.caller){callee = callee.caller;}
    if(callee.caller){callee = callee.caller;}
    if(callee.caller){callee = callee.caller;}
    return callee;
}
function getCalleeFunctionName() {
    try {
        if(getCalleeFunction() && getCalleeFunction().name && getCalleeFunction().name !== ""){
            return getCalleeFunction().name;
        }
    } catch (error) {
        console.debug(error);
    }
    return null;
}
function getCallerFunctionName() {
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
    try {
        if(getCallerFunction() && getCallerFunction().name && getCallerFunction().name !== ""){
            return getCallerFunction().name;
        }
    } catch (error) {
        console.debug(error);
    }
    return null;
}
function addCallerFunctionToMessage(message) {
    if(qm.platform.browser.isFirefox()){return message;}
    if(message === "undefined"){message = "";}
    if(getCalleeFunctionName()){message = "callee " + getCalleeFunctionName() + ": " + message || "";}
    if(getCallerFunctionName()){message = "Caller " + getCallerFunctionName() + " called " + message || "";}
    return message;
}

