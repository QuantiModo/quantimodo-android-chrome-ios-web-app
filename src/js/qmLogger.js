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
var qmLog = {
    name: null,
    setName: function(name, message){
        if(name && name.response && name.response.body){
            var body = name.response.body;
            qmLog.name = body.errorMessage || body.message || JSON.stringify(body);
        }
        qmLog.name = name || message;
        if(qmLog.qm.platform.isMobile()){
            qmLog.name = "QM: " + name;
        } // Use for filtering in LogCat
        qmLog.name = qmLog.replaceSecretValuesInString(qmLog.name);
    },
    message: null,
    setMessage: function(name, message){
        if(message && typeof message === 'object'){
            qmLog.message = message.message || JSON.stringify(message);
        }else{
            qmLog.message = message || name;
        }
        if(qmLog.qm.platform.isMobile() && qmLog.isDebugMode()){
            qmLog.message = addCallerFunctionToMessage(qmLog.message || "");
        }
        qmLog.message = qmLog.replaceSecretValuesInString(qmLog.message);
        return qmLog.message;
    },
    globalMetaData: {
        context: null,
        chcpInfo: {
            error: null
        },
        message: {},
        name: {}
    },
    getCombinedMetaData: function(name, message, errorSpecificMetaData, stackTrace){
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
        qmLog.stacktrace = stacktrace || null;
    },
    mobileDebug: null,
    logLevel: null,
    setLogLevelName: function(value){
        if(qmLog.logLevel === value){
            return;
        }
        qmLog.logLevel = value;
        if(typeof localStorage !== "undefined"){
            localStorage.setItem(qmLog.qm.items.logLevel, value); // Can't use qmLog.qm.storage because of recursion issue
        }
    },
    getLogLevelName: function(){
        //qmService.setUseif(window.location.href.indexOf('utopia.quantimo.do') > -1){return "debug";}
        if(qmLog.qm.urlHelper.getParam('debug') || qmLog.qm.urlHelper.getParam('debugMode')){
            qmLog.setLogLevelName("debug");
        }
        if(qmLog.qm.urlHelper.getParam(qmLog.qm.items.logLevel)){
            qmLog.setLogLevelName(qmLog.qm.urlHelper.getParam(qmLog.qm.items.logLevel));
        }
        if(qmLog.logLevel){
            return qmLog.logLevel;
        }
        if(typeof localStorage !== "undefined"){
            qmLog.logLevel = localStorage.getItem(qmLog.qm.items.logLevel);  // Can't use qmLog.qm.storage because of recursion issue
        }
        if(qmLog.logLevel){
            return qmLog.logLevel;
        }
        var defaultLevel = (qmLog.qm.appMode.isDevelopment()) ? "info" : "error";
        qmLog.setLogLevelName(defaultLevel); // I think info logs might be slowing down iOS app so default to error
        return qmLog.logLevel;
    },
    setAuthDebugEnabled: function(value){
        if(!qmLog.qm.platform.getWindow()){
            return false;
        }
        qmLog.authDebugEnabled = value;
        if(qmLog.authDebugEnabled && window.localStorage){
            qmLog.qm.storage.setItem('authDebugEnabled', value);
        }
        return qmLog.authDebugEnabled;
    },
    setDebugMode: function(value){
        if(value){
            if(qm.getUser() && qm.getUser().id === 230){
                qmLog.qm.storage.setItem(qmLog.qm.items.apiUrl, 'utopia.quantimo.do');
            }
            qmLog.setLogLevelName("debug");
        }else{
            qmLog.qm.storage.removeItem(qmLog.qm.items.apiUrl);
            qmLog.setLogLevelName("info");
        }
        return value;
    },
    itemAndThrowException: function(item, message){
        qmLog.itemProperties(item);
        throw message;
    },
    itemProperties: function(item, propertiesToLog, message){
        var string = '';
        if(item.name){
            string = item.name + ": ";
        }
        for(var i = 0; i < propertiesToLog.length; i++){
            var property = propertiesToLog[i];
            var value = item[property];
            string += property + " " + value + ", ";
        }
        if(message){
            string += message;
        }
        qmLog.qm.qmLog.info(string);
    },
    arrayValues: function(array, propertiesToLog, message){
        if(array.constructor !== Array){
            array = [array];
        }
        for(var j = 0; j < array.length; j++){
            var item = array[j];
            qmLog.itemProperties(item, propertiesToLog, message);
        }
    },
    variables: function(variables, propertiesToLog){
        if(!propertiesToLog){
            return;
        }
        if(propertiesToLog.constructor !== Array){
            propertiesToLog = [propertiesToLog];
        }
        propertiesToLog = [
            //'name',
            'userId'].concat(propertiesToLog);
        propertiesToLog.push('lastSelected');
        propertiesToLog = propertiesToLog.filter(function(propertyToLog){
            return propertyToLog !== 'lastSelectedAt';
        });
        for(var j = 0; j < variables.length; j++){
            var variable = variables[j];
            variable.lastSelected = qmLog.qm.timeHelper.getTimeSinceString(variable.lastSelectedAt);
        }
        qmLog.arrayValues(variables, propertiesToLog);
    },
    isDebugMode: function(){
        return qmLog.getLogLevelName() === "debug";
    },
    getDebugMode: function(){
        return qmLog.isDebugMode();
    },
    setMobileDebug: function(value){
        qmLog.mobileDebug = value;
    },
    replaceSecretValuesInString: function(string){
        if(qmLog.isDebugMode()){
            return string;
        }
        if(typeof string !== 'string'){
            return string;
        }
        var secretValues = qmLog.getSecretValues();
        for(var i = 0; i < secretValues.length; i++){
            var secretValue = secretValues[i];
            string = string.replace(secretValue, '[SECURE]');
        }
        return string;
    },
    stringIsSecretAlias: function(stringToCheck){
        var lowerCaseString = stringToCheck.toLowerCase();
        for(var i = 0; i < qmLog.secretAliases.length; i++){
            var secretSubString = qmLog.secretAliases[i];
            if(lowerCaseString.indexOf(secretSubString) !== -1){
                return true;
            }
        }
        return false;
    },
    getSecretValues: function(){
        var secretValues = [];
        if(typeof process === "undefined" || typeof process.env === "undefined"){
            return secretValues;
        }
        for(var propertyName in process.env){
            if(!process.env.hasOwnProperty(propertyName)){
                continue;
            }
            if(qmLog.stringIsSecretAlias(propertyName)){
                secretValues.push(process.env[propertyName]);
            }
        }
        return secretValues;
    },
    obfuscateSecrets: function(object){
        if(qmLog.isDebugMode()){
            return object;
        }
        if(typeof object !== 'object'){
            return object;
        }
        try{
            object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        }catch (error){
            console.error(error, object); // Avoid infinite recursion
            return {};
        }
        for(var propertyName in object){
            if(object.hasOwnProperty(propertyName)){
                if(qmLog.stringIsSecretAlias(propertyName)){
                    object[propertyName] = "[SECURE]";
                }else{
                    object[propertyName] = qmLog.obfuscateSecrets(object[propertyName]);
                }
            }
        }
        return object;
    },
    secretAliases: ['secret', 'password', 'token', 'secret', 'private'],
    stringContainsSecretAliasWord: function(string){
        if(!string.toLowerCase){
            var consoleMessage = "This is not a string: ";
            if(qmLog.color){
                consoleMessage = qmLog.color.red(consoleMessage);
            }
            console.error(consoleMessage, string);
            return false;
        }
        var lowerCase = string.toLowerCase();
        var censoredString = lowerCase;
        for(var i = 0; i < qmLog.secretAliases.length; i++){
            var secretAlias = qmLog.secretAliases[i];
            if(lowerCase.indexOf(secretAlias) !== -1){
                censoredString = qmLog.qm.stringHelper.getStringBeforeSubstring(secretAlias, censoredString) + " " + secretAlias + "[redacted]";
            }
        }
        if(censoredString !== lowerCase){
            return censoredString;
        }
        return false;
    },
    bugsnagNotify: function(name, message, errorSpecificMetaData, logLevel, stackTrace){
        if(typeof bugsnagClient === "undefined"){
            if(!qmLog.qm.appMode.isDevelopment()){
                console.error('bugsnagClient not defined', errorSpecificMetaData);
            }
            return;
        }
        var combinedMetaData = qmLog.getCombinedMetaData(name, message, errorSpecificMetaData, stackTrace);
        if(!name){
            name = "No error name provided";
        }
        if(!message){
            message = "No error message provided";
        }
        if(typeof name !== "string"){
            name = message;
        }
        if(typeof message !== "string"){
            message = JSON.stringify(message);
        }
        bugsnagClient.notify({name: name, message: message}, {severity: logLevel, metaData: combinedMetaData});
    },
    error: function(name, message, errorSpecificMetaData, stackTrace){
        if(!qmLog.shouldWeLog("error")){
            return;
        }
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        var consoleMessage = qmLog.getConsoleLogString("ERROR", errorSpecificMetaData);
        if(qmLog.color){
            consoleMessage = qmLog.color.red(consoleMessage);
        }
        console.error(consoleMessage, errorSpecificMetaData);
        qmLog.globalMetaData = qmLog.addGlobalMetaDataAndLog(qmLog.name, qmLog.message, errorSpecificMetaData, qmLog.stackTrace);
        qmLog.bugsnagNotify(qmLog.name, qmLog.message, errorSpecificMetaData, "error", qmLog.stackTrace);
        //if(window.qmLog.mobileDebug){alert(name + ": " + message);}
    },
    pushDebug: function(name, message, errorSpecificMetaData, stackTrace){
        if(!qmLog.qm.platform.getWindow()){
            return false;
        }
        //qmLog.pushDebugEnabled = true;
        if(!qmLog.pushDebugEnabled){
            qmLog.pushDebugEnabled = window.location.href.indexOf("pushDebugEnabled") !== -1;
            if(qmLog.pushDebugEnabled && window.localStorage){
                localStorage.setItem('pushDebugEnabled', "true");
            }
        }
        if(!qmLog.pushDebugEnabled && window.localStorage){
            qmLog.pushDebugEnabled = localStorage.getItem('pushDebugEnabled');
        }
        if(qmLog.pushDebugEnabled || qmLog.isDebugMode()){
            qmLog.error("PushNotification Debug: " + name, message, errorSpecificMetaData, stackTrace);
        }else{
            qmLog.info("PushNotification Debug: " + name, message, errorSpecificMetaData, stackTrace);
        }
    },
    getAuthDebugEnabled: function(message){
        if(qmLog.qm.platform.isBackEnd()){
            return false;
        }
        if(message.indexOf("cloudtestlabaccounts") !== -1){ // Keeps spamming bugsnag
            return qmLog.setAuthDebugEnabled(false);
        }
        if(!qmLog.authDebugEnabled && window.location.href.indexOf("authDebug") !== -1){
            return qmLog.setAuthDebugEnabled(true);
        }
        if(qmLog.authDebugEnabled === null && window.localStorage){
            qmLog.authDebugEnabled = localStorage.getItem('authDebugEnabled');
        }
        return qmLog.authDebugEnabled;
    },
    authDebug: function(name, message, errorSpecificMetaData){
        name = "Auth Debug: " + name;
        if(!qmLog.getAuthDebugEnabled(name)){
            qmLog.debug(name, message, errorSpecificMetaData);
            return;
        }
        if(qmLog.qm.platform.isMobile()){
            qmLog.error(name, message, errorSpecificMetaData);
        }else{
            qmLog.info(name, message, errorSpecificMetaData);
        }
    },
    webAuthDebug: function(name, message, errorSpecificMetaData){
        if(!qmLog.qm.platform.isMobile()){
            qmLog.authDebug(name, message, errorSpecificMetaData);
        }
    },
    warn: function(name, message, errorSpecificMetaData, stackTrace){
        if(!qmLog.shouldWeLog("warn")){
            return;
        }
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        var consoleMessage = qmLog.getConsoleLogString("WARNING", errorSpecificMetaData);
        if(qmLog.color){
            consoleMessage = qmLog.color.yellow(consoleMessage);
        }
        if(errorSpecificMetaData){
            console.warn(consoleMessage, errorSpecificMetaData);
        }else{
            console.warn(consoleMessage);
        }
    },
    info: function(name, message, errorSpecificMetaData, stackTrace){
        if(!qmLog.shouldWeLog("info")){
            return;
        }
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        var consoleMessage = qmLog.getConsoleLogString("INFO", errorSpecificMetaData);
        if(qmLog.color){
            consoleMessage = qmLog.color.blue(consoleMessage);
        }
        if(errorSpecificMetaData){
            console.info(consoleMessage, errorSpecificMetaData);
        }else{
            console.info(consoleMessage);
        }
    },
    logProperties: function(message, object){
        message = message.toUpperCase();
        message += ": ";
        var properties = [];
        for(var key in object){
            if(!object.hasOwnProperty(key)){
                continue;
            }
            properties.push(key);
        }
        message += properties.join(', ');
        qmLog.info(message);
    },
    green: function(message){
        qmLog.colorfulLog(message, 'green');
    },
    red: function(message){
        qmLog.colorfulLog(message, 'red');
    },
    yellow: function(message){
        qmLog.colorfulLog(message, 'yellow');
    },
    colorfulLog: function(message, color){
        console.log(qmLog.color[color](message)); // Nest styles of the same type even (color, underline, background)
    },
    debug: function(name, message, errorSpecificMetaData, stackTrace){
        if(!qmLog.shouldWeLog("debug")){
            return;
        }
        qmLog.populateReport(name, message, errorSpecificMetaData, stackTrace);
        if(errorSpecificMetaData){
            console.debug(qmLog.getConsoleLogString("DEBUG", errorSpecificMetaData), errorSpecificMetaData);
        }else{
            console.debug(qmLog.getConsoleLogString("DEBUG", errorSpecificMetaData));
        }
    },
    errorOrInfoIfTesting: function(name, message, metaData, stackTrace){
        message = message || name;
        name = name || message;
        qmLog.globalMetaData = qmLog.globalMetaData || null;
        if(qmLog.qm.appMode.isTesting()){
            qmLog.info(name, message, metaData, stackTrace);
        }else{
            qmLog.error(name, message, metaData, stackTrace);
        }
    },
    errorOrDebugIfTesting: function(name, message, metaData, stackTrace){
        message = message || name;
        name = name || message;
        qmLog.globalMetaData = qmLog.globalMetaData || null;
        if(qmLog.qm.appMode.isTesting()){
            qmLog.debug(name, message, metaData, stackTrace);
        }else{
            qmLog.error(name, message, metaData, stackTrace);
        }
    },
    errorAndExceptionTestingOrDevelopment: function(name, message, metaData, stackTrace){
        message = message || name;
        name = name || message;
        qmLog.globalMetaData = qmLog.globalMetaData || null;
        qmLog.error(name, message, metaData, stackTrace);
        if(qmLog.qm.appMode.isTesting() || qmLog.qm.appMode.isDevelopment()){
            throw name;
        }
    },
    getConsoleLogString: function(logLevel, errorSpecificMetaData){
        var logString = qmLog.name;
        if(qmLog.message && logString !== qmLog.message){
            logString = logString + ": " + qmLog.message;
        }
        if(qmLog.qm.platform.isMobileOrTesting() && qmLog.isDebugMode()){
            logString = addCallerFunctionToMessage(logString);
        }
        if(qmLog.stackTrace){
            logString = logString + ". stackTrace: " + qmLog.stackTrace;
        }
        if(errorSpecificMetaData && qmLog.qm.platform.isMobileOrTesting()){ // Meta object is already logged nicely in browser console
            try{
                if(qmLog.isDebugMode()){  // stringifyCircularObject might be too resource intensive
                    logString = logString + ". metaData: " + qmLog.qm.stringHelper.stringifyCircularObject(errorSpecificMetaData);
                }
            }catch (error){
                console.error("Could not stringify log meta data", error);
            }
        }
        if(!logString || typeof logString !== "string" || !logString.toLowerCase){
            console.error("logString not a string and is: ", logString);
            return "logString not a string: ";
        }
        var censored = qmLog.stringContainsSecretAliasWord(logString);
        if(censored){
            logString = censored;
        }
        if(qmLog.qm.platform.isMobileOrTesting()){
            logString = logLevel + ": " + logString;
        }
        logString = qmLog.replaceSecretValuesInString(logString);
        return logString;
    },
    shouldWeLog: function(providedLogLevelName){
        var globalLogLevelValue = qmLog.logLevels[qmLog.getLogLevelName()];
        var providedLogLevelValue = qmLog.logLevels[providedLogLevelName];
        return globalLogLevelValue >= providedLogLevelValue;
    },
    getGlobalMetaData: function(){
        function getTestUrl(){
            function getCurrentRoute(){
                if(!qmLog.qm.platform.getWindow()){
                    return false;
                }
                var parts = window.location.href.split("#/app");
                return parts[1];
            }
            var url = "https://dev-web.quantimo.do/#/app" + getCurrentRoute();
            if(qmLog.qm.getUser()){
                url = qmLog.qm.urlHelper.addUrlQueryParamsToUrlString({userEmail: qmLog.qm.getUser().email}, url);
            }
            return url;
        }
        function cordovaPluginsAvailable(){
            if(typeof cordova === "undefined"){
                return false;
            }
            return typeof cordova.plugins !== "undefined";
        }
        if(qmLog.qm.platform.getWindow()){
            qmLog.globalMetaData.plugins = {
                "Analytics": (typeof Analytics !== "undefined") ? "installed" : "not installed",
                "backgroundGeoLocation": (typeof backgroundGeoLocation !== "undefined") ? "installed" : "not installed",
                "cordova.plugins.notification": (cordovaPluginsAvailable() && typeof cordova.plugins.notification !== "undefined") ? "installed" : "not installed",
                "facebookConnectPlugin": (typeof facebookConnectPlugin !== "undefined"),
                "window.plugins.googleplus": (window && window.plugins && window.plugins.googleplus) ? "installed" : "not installed",
                "window.overApps": (cordovaPluginsAvailable() && typeof window.overApps !== "undefined") ? "installed" : "not installed",
                "inAppPurchase": (typeof window.inAppPurchase !== "undefined") ? "installed" : "not installed",
                "ionic": (typeof ionic !== "undefined") ? "installed" : "not installed",
                "ionicDeploy": (typeof $ionicDeploy !== "undefined") ? "installed" : "not installed",
                "PushNotification": (typeof PushNotification !== "undefined") ? "installed" : "not installed",
                "SplashScreen": (typeof navigator !== "undefined" && typeof navigator.splashscreen !== "undefined") ? "installed" : "not installed",
                "UserVoice": (typeof UserVoice !== "undefined") ? "installed" : "not installed"
            };
        }
        qmLog.globalMetaData.notifications = {
            "deviceTokenOnServer": qmLog.qm.storage.getItem(qmLog.qm.items.deviceTokenOnServer),
            "deviceTokenToSync": qmLog.qm.storage.getItem(qmLog.qm.items.deviceTokenToSync),
            "time since last push": qmLog.qm.push.getTimeSinceLastPushString(),
            "push enabled": qmLog.qm.push.enabled(),
            "draw over apps enabled": qmLog.qm.storage.getItem(qmLog.qm.items.drawOverAppsPopupEnabled), // Don't use function drawOverAppsPopupEnabled() because of recursion error
            "last popup": qmLog.qm.notifications.getTimeSinceLastPopupString(),
            'last push data': qmLog.qm.storage.getItem(qmLog.qm.items.lastPushData),
            'last Local Notification Triggered': qmLog.qm.notifications.getTimeSinceLastLocalNotification(),
            'drawOverAppsPopupEnabled': qmLog.qm.storage.getItem(qmLog.qm.items.drawOverAppsPopupEnabled),
            scheduled_local_notifications: qmLog.qm.storage.getItem(qmLog.qm.items.scheduledLocalNotifications),
        };
        qmLog.globalMetaData.platform = {
            'platform': qmLog.qm.platform.getCurrentPlatform(),
            browser: qmLog.qm.platform.browser.get()
        };
        if(qmLog.isDebugMode()){
            qmLog.globalMetaData.local_storage = qmLog.qm.storage.getLocalStorageList();
        } // Too slow to do for every error
        qmLog.globalMetaData.api = {log: qmLog.qm.api.requestLog, ApiUrl: qmLog.qm.api.getApiUrl()};
        if(qmLog.qm.getAppSettings()){
            qmLog.globalMetaData.api.client_id = qmLog.qm.api.getClientId();
            qmLog.globalMetaData.build = {
                build_server: qmLog.qm.getAppSettings().buildServer,
                build_link: qmLog.qm.getAppSettings().buildLink,
                build_at: qmLog.qm.timeHelper.getTimeSinceString(qmLog.qm.getAppSettings().builtAt),
            };
        }
        qmLog.globalMetaData.test_app_url = getTestUrl();
        if(qmLog.qm.platform.getWindow()){
            qmLog.globalMetaData.window_location_href = window.location.href;
            qmLog.globalMetaData.window_location_origin = window.location.origin;
        }
        function addQueryParameter(url, name, value){
            if(url.indexOf('?') === -1){
                return url + "?" + name + "=" + value;
            }
            return url + "&" + name + "=" + value;
        }
        if(qmLog.globalMetaData.apiResponse){
            var request = qmLog.globalMetaData.apiResponse.req;
            qmLog.globalMetaData.test_api_url = request.method + " " + request.url;
            if(request.header.Authorization){
                qmLog.globalMetaData.test_api_url = addQueryParameter(qmLog.globalMetaData.test_api_url, "access_token",
                    request.header.Authorization.replace("Bearer ", ""));
            }
            var consoleMessage = 'API ERROR URL ' + qmLog.globalMetaData.test_api_url;
            if(qmLog.color){
                consoleMessage = qmLog.color.red(consoleMessage);
            }
            console.error(consoleMessage, qmLog.globalMetaData);
            delete qmLog.globalMetaData.apiResponse;
        }
        if(typeof ionic !== "undefined"){
            qmLog.globalMetaData.platform = ionic.Platform.platform();
            qmLog.globalMetaData.platformVersion = ionic.Platform.version();
        }
        if(qmLog.qm.getAppSettings()){
            qmLog.globalMetaData.appDisplayName = qmLog.qm.getAppSettings().appDisplayName;
        }
        return qmLog.globalMetaData;
    },
    setupIntercom: function(){
        if(!qmLog.qm.platform.getWindow()){
            return false;
        }
        window.intercomSettings = {
            app_id: "uwtx2m33",
            name: qmLog.qm.userHelper.getUserFromLocalStorage().displayName,
            email: qmLog.qm.userHelper.getUserFromLocalStorage().email,
            user_id: qmLog.qm.userHelper.getUserFromLocalStorage().id,
            app_name: qmLog.qm.getAppSettings().appDisplayName,
            app_version: qmLog.qm.getAppSettings().versionNumber,
            platform: qmLog.qm.platform.getCurrentPlatform()
        };
    },
    setupUserVoice: function(){
        if(typeof UserVoice !== "undefined"){
            UserVoice.push(['identify', {
                email: qmLog.qm.getUser().email, // User’s email address
                name: qmLog.qm.getUser().displayName, // User’s real name
                created_at: qmLog.qm.timeHelper.getUnixTimestampInSeconds(qmLog.qm.userHelper.getUserFromLocalStorage().userRegistered), // Unix timestamp for the date the user signed up
                id: qmLog.qm.userHelper.getUserFromLocalStorage().id, // Optional: Unique id of the user (if set, this should not change)
                type: qmLog.qm.getSourceName() + ' User (Subscribed: ' + qmLog.qm.userHelper.getUserFromLocalStorage().subscribed + ')', // Optional: segment your users by type
                account: {
                    //id: 123, // Optional: associate multiple users with a single account
                    name: qmLog.qm.getSourceName() + ' v' + qmLog.qm.getAppSettings().versionNumber, // Account name
                    //created_at: 1364406966, // Unix timestamp for the date the account was created
                    //monthly_rate: 9.99, // Decimal; monthly rate of the account
                    //ltv: 1495.00, // Decimal; lifetime value of the account
                    //plan: 'Subscribed' // Plan name for the account
                }
            }]);
        }
    },
    setupFreshChat: function(user){
        /** @namespace window.fcWidget */
        if(typeof window.fcWidget !== "undefined"){
            // Make sure fcWidget.init is included before setting these values
            // To set unique user id in your system when it is available
            window.fcWidget.setExternalId(user.loginName);
            // To set user name
            window.fcWidget.user.setFirstName(user.firstName);
            // To set user email
            window.fcWidget.user.setEmail(user.email);
            // To set user properties
            window.fcWidget.user.setProperties({
                plan: "Estate",                 // meta property 1
                status: "Active"                // meta property 2
            });
        }
    },
    setupBugsnag: function(user){
        if(typeof bugsnag !== "undefined"){
            var options = {
                apiKey: "ae7bc49d1285848342342bb5c321a2cf",
                releaseStage: qmLog.qm.appMode.getAppMode(),
                //notifyReleaseStages: [ 'staging', 'production' ],
                metaData: qmLog.getGlobalMetaData(),
                beforeSend: function(report){
                }
            };
            if(user){
                options.user = qmLog.obfuscateSecrets(user);
            }
            if(qmLog.qm.getAppSettings()){
                options.appVersion = qmLog.qm.getAppSettings().androidVersionCode;
            }
            if(qmLog.qm.staticData.buildInfo.gitCommitShaHash){
                options.appVersion = qmLog.qm.staticData.buildInfo.gitCommitShaHash;
            }
            if(qmLog.qm.platform.getWindow()){
                window.bugsnagClient = bugsnag(options);
            }
        }else{
            if(!qmLog.qm.appMode.isDevelopment()){
                qmLog.error('Bugsnag is not defined');
            }
        }
    },
    getStackTrace: function(){
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
    stringifyIfNecessary: function(variable){
        if(!variable || typeof message === "string"){
            return variable;
        }
        try{
            return JSON.stringify(variable);
        }catch (error){
            console.error("Could not stringify", variable);
            return "Could not stringify";
        }
    },
    addGlobalMetaDataAndLog: function(name, message, errorSpecificMetaData, stacktrace){
        var i = 0;
        var combinedMetaData = qmLog.getCombinedMetaData(name, message, errorSpecificMetaData, stacktrace);
        var logMetaData = false;
        if(!logMetaData){
            return combinedMetaData;
        }
        for(var propertyName in combinedMetaData){
            if(combinedMetaData.hasOwnProperty(propertyName)){
                if(combinedMetaData[propertyName]){
                    i++;
                    console.log(propertyName + ": " + qmLog.stringifyIfNecessary(combinedMetaData[propertyName]));
                    if(i > 10){
                        break;
                    }
                }
            }
        }
        return combinedMetaData;
    }
};
function getCalleeFunction(){
    var callee = arguments.callee.caller;
    if(callee.caller){
        callee = callee.caller;
    }
    if(callee.caller){
        callee = callee.caller;
    }
    if(callee.caller){
        callee = callee.caller;
    }
    if(callee.caller){
        callee = callee.caller;
    }
    if(callee.caller){
        callee = callee.caller;
    }
    return callee;
}
function getCalleeFunctionName(){
    try{
        if(getCalleeFunction() && getCalleeFunction().name && getCalleeFunction().name !== ""){
            return getCalleeFunction().name;
        }
    }catch (error){
        console.debug(error);
    }
    return null;
}
function getCallerFunctionName(){
    function getCallerFunction(){
        if(getCalleeFunction()){
            try{
                return getCalleeFunction().caller;
            }catch (error){
                console.error(error);
                return null;
            }
        }
        return null;
    }
    try{
        if(getCallerFunction() && getCallerFunction().name && getCallerFunction().name !== ""){
            return getCallerFunction().name;
        }
    }catch (error){
        console.debug(error);
    }
    return null;
}
function addCallerFunctionToMessage(message){
    if(qmLog.qm.platform.browser.isFirefox()){
        return message;
    }
    if(message === "undefined"){
        message = "";
    }
    var caller = getCallerFunctionName();
    var callee = getCalleeFunctionName();
    if(!callee && !caller){
        return message;
    }
    if(caller === callee){
        return callee + ": " + message || "";
    }
    if(callee){
        message = "callee " + callee + ": " + message || "";
    }
    if(caller){
        message = "Caller " + caller + " called " + message || "";
    }
    return message;
}
if(typeof window !== "undefined"){
    if(typeof bugsnag !== "undefined"){
        window.bugsnagClient = bugsnag("ae7bc49d1285848342342bb5c321a2cf");
    }
    window.qmLog = qmLog;
}else{
    module.exports = qmLog;
}
if(typeof qm !== "undefined"){
    qmLog.qm = qm;
}

