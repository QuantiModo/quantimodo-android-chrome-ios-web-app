String.prototype.toCamel = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
function getUrlParameter(parameterName, url, shouldDecode) {
    if(!url){url = window.location.href;}
    if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
    if(url.split('?').length > 1){
        var queryString = url.split('?')[1];
        var parameterKeyValuePairs = queryString.split('&');
        for (var i = 0; i < parameterKeyValuePairs.length; i++) {
            var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
            if (currentParameterKeyValuePair[0].toCamel().toLowerCase() === parameterName.toCamel().toLowerCase()) {
                if(typeof shouldDecode !== "undefined")  {
                    return decodeURIComponent(currentParameterKeyValuePair[1]);
                } else {
                    return currentParameterKeyValuePair[1];
                }
            }
        }
    }
    return null;
}
var appSettings, user;
// SubDomain : Filename
var appConfigFileNames = {
    "app" : "quantimodo",
    "energymodo" : "energymodo",
    "default" : "default",
    "ionic" : "quantimodo",
    "local" : "quantimodo",
    "medimodo" : "medimodo",
    "mindfirst" : "mindfirst",
    "moodimodo" : "moodimodo",
    "oauth" : "quantimodo",
    "quantimodo" : "quantimodo",
    "your_quantimodo_client_id_here": "your_quantimodo_client_id_here"
};
function getStackTrace() {
    var err = new Error();
    var stackTrace = err.stack;
    stackTrace = stackTrace.substring(stackTrace.indexOf('getStackTrace')).replace('getStackTrace', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logDebug')).replace('window.logDebug', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logInfo')).replace('window.logInfo', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('window.logError')).replace('window.logError', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('qmService.logDebug')).replace('qmService.logDebug', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('qmService.logInfo')).replace('qmService.logInfo', '');
    stackTrace = stackTrace.substring(stackTrace.indexOf('qmService.logError')).replace('qmService.logError', '');
    return stackTrace;
}
function addStackTraceToMessage(message, stackTrace) {
    if(message.toLowerCase().indexOf('stacktrace') !== -1){return message;}
    if(!stackTrace){stackTrace = getStackTrace();}
    return message + ".  StackTrace: " + stackTrace;
}
function addCallerFunctionToMessage(message) {
    var calleeFunction = arguments.callee.caller.caller;
    if(calleeFunction && calleeFunction.name && calleeFunction.name !== ""){
        message = "callee " + calleeFunction.name + ": " + message
    } else if (getDebugMode()) {
        return addStackTraceToMessage(message);
    }
    try {
        var callerFunction = calleeFunction.caller;
    } catch (error) {
        console.error(error);
    }
    if(callerFunction && callerFunction.name && callerFunction.name !== ""){
        return "Caller " + callerFunction.name + " called " + message;
    } else if (getDebugMode()) {
        return addStackTraceToMessage(message);
    }
    return message;
}
window.isTruthy = function(value){return value && value !== "false"; };
window.getDebugMode = function() {
    //return true;
    if(getUrlParameter('debug') || getUrlParameter('debugMode') || (typeof appSettings !== "undefined" && isTruthy(appSettings.debugMode))){
        window.debugMode = true;
    }
    return window.debugMode;
};
window.logDebug = function(message, stackTrace) {
    message = addCallerFunctionToMessage(message);
    if(getDebugMode()){console.debug(message);}
};
window.logInfo = function(message, stackTrace) {
    message = addCallerFunctionToMessage(message);
    console.info(message);
};
window.logError = function(message, additionalMetaData, stackTrace) {
    if(message && message.message){message = message.message;}
    message = addCallerFunctionToMessage(message);
    bugsnagNotify(message, additionalMetaData, stackTrace);
    console.error(message);
};
function getSubDomain(){
    var full = window.location.host;
    var parts = full.split('.');
    return parts[0].toLowerCase();
}
function getClientIdFromQueryParameters() {
    var clientId = getUrlParameter('clientId');
    if(!clientId){clientId = getUrlParameter('appName');}
    if(!clientId){clientId = getUrlParameter('lowerCaseAppName');}
    if(!clientId){clientId = getUrlParameter('quantimodoClientId');}
    if(clientId){localStorage.setItem('clientId', clientId);}
    return clientId;
}
function getQuantiModoClientId() {
    if(onMobile()){
        console.debug("Using default.config.js because we're on mobile");
        return "default"; // On mobile
    }
    var clientId = getClientIdFromQueryParameters();
    if(clientId){
        console.debug("Using clientIdFromQueryParams: " + clientId);
        return clientId;
    }
    if(!clientId){clientId = localStorage.getItem('clientId');}
    if(clientId){
        console.debug("Using clientId From localStorage: " + clientId);
        return clientId;
    }
    if(window.location.href.indexOf('quantimo.do') === -1){
        console.debug("Using default.config.js because we're not on a quantimo.do domain");
        return "default"; // On mobile
    }
    var subdomain = getSubDomain();
    var clientIdFromAppConfigName = appConfigFileNames[getSubDomain()];
    if(clientIdFromAppConfigName){
        console.debug("Using client id " + clientIdFromAppConfigName + " derived from appConfigFileNames using subdomain: " + subdomain);
        return clientIdFromAppConfigName;
    }
    logDebug("Using subdomain as client id: " + subdomain);
    return subdomain;
}
function onMobile() {
    return window.location.href.indexOf('https://') === -1;
}
var appsManager = { // jshint ignore:line
    defaultApp : "default",
    getAppConfig : function(){
        console.debug('getQuantiModoClientId returns ' + getQuantiModoClientId());
        if(getQuantiModoClientId()){
            return 'configs/' + getQuantiModoClientId() + '.js';
        } else {
            return 'configs/' + appsManager.defaultApp + '.js';
        }
    },
    getPrivateConfig : function(){
        if(getQuantiModoClientId()){
            return './private_configs/'+ getQuantiModoClientId() + '.config.js';
        } else {
            return './private_configs/'+ appsManager.defaultApp + '.config.js';
        }
    },
    getUrlParameter: function (parameterName, url, shouldDecode) {
        return getUrlParameter(parameterName, url, shouldDecode);
    },
    getQuantiModoClientId: function () {
        return getQuantiModoClientId();
    },
    getQuantiModoApiUrl: function () {
        var apiUrl = getUrlParameter('apiUrl');
        if(!apiUrl){apiUrl = localStorage.getItem('apiUrl');}
        if(!apiUrl && window.location.origin.indexOf('staging.quantimo.do') !== -1){apiUrl = "https://staging.quantimo.do";}
        if(!apiUrl && window.location.origin.indexOf('local.quantimo.do') !== -1){apiUrl = "https://local.quantimo.do";}
        if(!apiUrl && window.location.origin.indexOf('utopia.quantimo.do') !== -1){apiUrl = "https://utopia.quantimo.do";}
        if(!apiUrl){apiUrl = "https://app.quantimo.do";}
        if(apiUrl.indexOf("https://") === -1){apiUrl = "https://" + apiUrl;}
        apiUrl = apiUrl.replace("https://https", "https");
        return apiUrl;
    },
    shouldWeUseLocalConfig: function (clientId) {
        if(clientId === "default"){return true;}
        if(onMobile()){return true;}
        var designMode = window.location.href.indexOf('configuration-index.html') !== -1;
        if(designMode){return false;}
        if(getClientIdFromQueryParameters() === 'app'){return true;}
    }
};
function isChromeExtension(){return (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && typeof chrome.runtime.onInstalled !== "undefined");}
function getChromeManifest() {if(isChromeExtension()){return manifest = chrome.runtime.getManifest();}}
function getAppName() {
    if(getChromeManifest()){return getChromeManifest().name;}
    return getUrlParameter('appName');
}
function getClientId() {
    if(appSettings){return appSettings.clientId;}
    return getUrlParameter('clientId');
}
function getAppVersion() {
    if(getChromeManifest()){return getChromeManifest().version;}
    if(appSettings){return appSettings.versionNumber;}
    return getUrlParameter('appVersion');
}
function getAccessToken() {
    if(localStorage.accessToken){return localStorage.accessToken;}
    return getUrlParameter('accessToken');
}
function getUser() {
    if(user){return user;}
    if(localStorage.getItem('user')){
        user = JSON.parse(localStorage.getItem('user'));
        return user;
    }
}
var v = null;
var vid = null;
function multiplyScreenHeight(factor) {return parseInt(factor * screen.height);}
function multiplyScreenWidth(factor) {return parseInt(factor * screen.height);}
var introWindowParams = { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750};
var facesRatingPopupWindowParams = { url: "templates/chrome/faces_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110};
var loginPopupWindowParams = { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750};
var reminderInboxPopupWindowParams = { url: "index.html", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
var compactInboxPopupWindowParams = { url: "index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360};
var inboxNotificationParams = { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "img/icons/icon_700.png", priority: 2};
var signInNotificationParams = { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2};
if (!localStorage.introSeen) {
    window.localStorage.setItem('introSeen', true);
    var focusWindow = true;
    openOrFocusChromePopupWindow(introWindowParams, focusWindow);
}
function getQueryParameterString() {
    if (getAccessToken()) {
        var queryParameterString = '?access_token=' + getAccessToken();
        if(getAppName()){queryParameterString += "&appName=" + encodeURIComponent(getAppName());}
        if(getAppVersion()){queryParameterString += "&appVersion=" + encodeURIComponent(getAppVersion());}
        if(getClientId()){queryParameterString += "&clientId=" + encodeURIComponent(getClientId());}
        return queryParameterString;
    }
    showSignInNotification();
}
function loadAppSettings() {  // I think adding appSettings to the chrome manifest breaks installation
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'configs/default.config.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4) {
            var json = xobj.responseText;
            logDebug("AppSettings:" + json);
            appSettings = JSON.parse(json);
        }
    };
    xobj.send(null);
}
if(!getUrlParameter('clientId')){loadAppSettings();}
function getAppHostName() {
    if(appSettings && appSettings.apiUrl){return "https://" + appSettings.apiUrl;}
    return "https://app.quantimo.do";
}
if(isChromeExtension()) {
    chrome.runtime.onInstalled.addListener(function () { // Called when the extension is installed
        var notificationInterval = parseInt(localStorage.notificationInterval || "60");
        if (notificationInterval === -1) {
            chrome.alarms.clear("moodReportAlarm");
            console.debug("Alarm cancelled");
        } else {
            var alarmInfo = {periodInMinutes: notificationInterval};
            chrome.alarms.create("moodReportAlarm", alarmInfo);
            console.debug("Alarm set, every " + notificationInterval + " minutes");
        }
    });
    chrome.alarms.onAlarm.addListener(function (alarm) { // Called when an alarm goes off (we only have one)
        console.debug('onAlarm Listener heard this alarm ', alarm);
        if (localStorage.useSmallInbox && localStorage.useSmallInbox === "true") {
            openOrFocusChromePopupWindow(facesRatingPopupWindowParams, focusWindow);
        } else {
            checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
        }
    });
}
function openOrFocusChromePopupWindow(windowParams, focusWindow) {
    if(!isChromeExtension()){
        logDebug("Can't open popup because chrome is undefined");
        return;
    }
    windowParams.focused = true;
    logDebug('openOrFocusChromePopupWindow', windowParams );
    if (vid) {
        chrome.windows.get(vid, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow) {
                // Commenting existing window focus so we don't irritate users
				if(focusWindow){ chrome.windows.update(vid, {focused: true}); }
                return;
            }
            chrome.windows.create(
                windowParams,
                function (chromeWindow) {
                    vid = chromeWindow.id;
                    chrome.windows.update(vid, { focused: false });
                }
            );
        });
    } else {
        chrome.windows.create(
            windowParams,
            function (chromeWindow) {
                vid = chromeWindow.id;
                chrome.windows.update(vid, { focused: false });
            }
        );
    }
}
function openChromePopup(notificationId, focusWindow) {
    if(isChromeExtension()){
        logDebug("Can't open popup because chrome is undefined");
        return;
    }
	if(!notificationId){notificationId = null;}
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);
	if(notificationId === "moodReportNotification") {
        openOrFocusChromePopupWindow(facesRatingPopupWindowParams, focusWindow);
	} else if (notificationId === "signin") {
        openOrFocusChromePopupWindow(loginPopupWindowParams, focusWindow);
	} else if (notificationId && IsJsonString(notificationId)) {
        var windowParams = reminderInboxPopupWindowParams;
		windowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusChromePopupWindow(windowParams, focusWindow);
	} else {
        openOrFocusChromePopupWindow(reminderInboxPopupWindowParams, focusWindow);
		console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
	}
	//chrome.windows.create(windowParams);
	if(notificationId){chrome.notifications.clear(notificationId);}
}
if(isChromeExtension()){
    // Called when the notification is clicked
    chrome.notifications.onClicked.addListener(function(notificationId) {
        console.debug('onClicked: notificationId:', notificationId);
        var focusWindow = true;
        openChromePopup(notificationId, focusWindow);
    });
    // Handles extension-specific requests that come in, such as a request to upload a new measurement
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        console.debug("Received request: " + request.message);
        if(request.message === "uploadMeasurements") {pushMeasurements(request.payload, null);}
    });
}
function pushMeasurements(measurements, onDoneListener) {
	postToQuantiModo(measurements,"v1/measurements", onDoneListener);
}
function postTrackingReminderNotification(trackingReminderNotification, onDoneListener) {
    deleteElementsOfLocalStorageItemByProperty('trackingReminderNotifications', 'trackingReminderNotificationId',
        trackingReminderNotification.trackingReminderNotificationId);
    postToQuantiModo(trackingReminderNotification, "v1/trackingReminderNotifications", onDoneListener);
}
function postToQuantiModo(body, path, onDoneListener) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST",  getRequestUrl(path), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {  // If the request is completed
            console.log("POST " + path + " response:" + xhr.responseText);
            if(onDoneListener) {onDoneListener(xhr.responseText);}
        }
    };
    xhr.send(JSON.stringify(body));
}
function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // or Object.prototype.hasOwnProperty.call(obj, prop)
            result++;
        }
    }
    return result;
}
function showSignInNotification() {
    if(isChromeExtension()){
        console.log("Can't showSignInNotification because chrome is undefined");
        return;
    }
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, signInNotificationParams, function (id) {});
}
function getRequestUrl(path) {
    var url = getAppHostName() + "/api/" + path + getQueryParameterString();
    console.log("Making API request to " + url);
    return url;
}
function updateBadgeText(string) {if(isChromeExtension()){chrome.browserAction.setBadgeText({text: string});}}
function checkForNotificationsAndShowPopupIfSo(notificationParams, alarm) {
    if(isChromeExtension()){
        console.log("Can't checkForNotificationsAndShowPopupIfSo because chrome is undefined");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", getRequestUrl("v1/trackingReminderNotifications/past"), false);
    xhr.onreadystatechange = function () {
        var notificationId;
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            if (numberOfWaitingNotifications > 0) {
                notificationId = alarm.name;
                updateBadgeText("?");
                //chrome.browserAction.setBadgeText({text: String(numberOfWaitingNotifications)});
                chrome.notifications.create(notificationId, inboxNotificationParams, function (id) {});
                openChromePopup(notificationId);
            } else {
                openOrFocusChromePopupWindow(facesRatingPopupWindowParams, focusWindow);
                updateBadgeText("");
            }
        }
    };
    xhr.send();
    return notificationParams;
}
function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm) {
    if(isChromeExtension()){
        console.log("Can't checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary because chrome is undefined");
        return;
    }
	console.debug('showNotificationOrPopupForAlarm alarm: ', alarm);
    var userString = localStorage.user;
    if(userString){
        var userObject = JSON.parse(userString);
        if(userObject){
            var now = new Date();
            var hours = now.getHours();
            var currentTime = hours + ':00:00';
            if(currentTime > userObject.latestReminderTime ||
                currentTime < userObject.earliestReminderTime ){
                console.debug('Not showing notification because outside allowed time range');
                return false;
            }
        }
    }
	if (IsJsonString(alarm.name)) {
        var notificationParams = inboxNotificationParams;
		console.debug('alarm.name IsJsonString', alarm);
		var trackingReminder = JSON.parse(alarm.name);
		notificationParams.title = 'Time to track ' + trackingReminder.variableName + '!';
		notificationParams.message = 'Click to add measurement';
        checkForNotificationsAndShowPopupIfSo(notificationParams, alarm);
	} else {
		console.debug('alarm.name is not a json object', alarm);
        checkForNotificationsAndShowPopupIfSo(inboxNotificationParams, alarm);
	}
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
        return false;
    }
    return true;
}
window.deleteElementsOfLocalStorageItemByProperty = function(localStorageItemName, propertyName, propertyValue){
    var elementsToKeep = [];
    var localStorageItemArray = JSON.parse(localStorage.getItem(localStorageItemName));
    if(!localStorageItemArray){
        logError("Local storage item " + localStorageItemName + " not found! Local storage items: " + JSON.stringify(getLocalStorageList()));
    } else {
        for(var i = 0; i < localStorageItemArray.length; i++){
            if(localStorageItemArray[i][propertyName] !== propertyValue){elementsToKeep.push(localStorageItemArray[i]);}
        }
        localStorage.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
    }
};
function addQueryParameter(url, name, value){
    if(url.indexOf('?') === -1){return url + "?" + name + "=" + value;}
    return url + "&" + name + "=" + value;
}
function bugsnagNotify(message, additionalMetaData, stackTrace){
    function obfuscateSecrets(object){
        if(typeof object !== 'object'){return object;}
        try {
            object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        } catch (error) {
            Bugsnag.notify("Could not decouple object: " + error , "object = JSON.parse(JSON.stringify(object))", object, "error");
            //logError(error, object); // Avoid infinite recursion
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
    if(typeof Bugsnag === "undefined"){ console.debug("Bugsnag not defined"); return; }
    function getTestUrl() {
        function getCurrentRoute() {
            var parts = window.location.href.split("#/app");
            return parts[1];
        }
        var url = "https://local.quantimo.do/ionic/Modo/www/index.html#/app" + getCurrentRoute();
        if(getUser()){url +=  "?userEmail=" + encodeURIComponent(getUser().email);}
        return url;
    }
    function getInstalledPluginList(){
        function localNotificationsPluginInstalled() {
            if(typeof cordova === "undefined"){return false;}
            if(typeof cordova.plugins === "undefined"){return false;}
            if(typeof cordova.plugins.notification === "undefined"){return false;}
            return true;
        }
        return {
            "Analytics": (typeof Analytics !== "undefined"),
            "backgroundGeoLocation": (typeof backgroundGeoLocation !== "undefined"),
            "cordova.plugins.notification": localNotificationsPluginInstalled(),
            "facebookConnectPlugin": (typeof facebookConnectPlugin !== "undefined"),
            "window.plugins.googleplus": (window && window.plugins && window.plugins.googleplus) ? true : false,
            "inAppPurchase": (typeof window.inAppPurchase !== "undefined"),
            "ionic": (typeof ionic !== "undefined"),
            "ionicDeploy": (typeof $ionicDeploy !== "undefined"),
            "PushNotification": (typeof PushNotification !== "undefined"),
            "SplashScreen": (typeof navigator !== "undefined" && typeof navigator.splashscreen !== "undefined"),
            "UserVoice": (typeof UserVoice !== "undefined")
        };
    }
    var name = message;
    if(window.mobileDebug){alert(message);}
    var metaData = {groupingHash: name, stackTrace: stackTrace};
    metaData.push_data = {
        "deviceTokenOnServer": localStorage.getItem('deviceTokenOnServer'),
        "deviceTokenToSync": localStorage.getItem('deviceTokenToSync')
    };
    if(typeof config !== "undefined"){
        metaData.build_server = config.appSettings.buildServer;
        metaData.build_link = config.appSettings.buildLink;
    }
    metaData.test_app_url = getTestUrl();
    if(additionalMetaData && additionalMetaData.apiResponse){
        var request = additionalMetaData.apiResponse.req;
        metaData.test_api_url = request.method + " " + request.url;
        if(request.header.Authorization){
            metaData.test_api_url = addQueryParameter(metaData.test_api_url, "access_token", request.header.Authorization.replace("Bearer ", ""));
        }
        console.error("API ERROR URL " + metaData.test_api_url);
        delete additionalMetaData.apiResponse;
    }
    //metaData.appSettings = config.appSettings;  // Request Entity Too Large
    if(additionalMetaData){metaData.additionalInfo = additionalMetaData;}
    //if(getUser()){metaData.user = getUser();} // Request Entity Too Large
    metaData.installed_plugins = getInstalledPluginList();
    Bugsnag.context = $state.current.name;
    Bugsnag.notify(name, message, obfuscateSecrets(metaData), "error");
}
function getLocalStorageList(){
    var localStorageItemsArray = [];
    for (var i = 0; i < localStorage.length; i++){
        localStorageItemsArray.push({
            name: localStorage.key(i),
            value: localStorage.getItem(localStorage.key(i)),
            kB: Math.round(localStorage.getItem(localStorage.key(i)).length*16/(8*1024))
        });
    }
    return localStorageItemsArray.sort( function ( a, b ) { return b.kB - a.kB; } );
}