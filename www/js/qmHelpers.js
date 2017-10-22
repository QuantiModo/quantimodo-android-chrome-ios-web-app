String.prototype.toCamel = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
window.getUrlParameter = function(parameterName, url, shouldDecode) {
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
};
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
window.isTruthy = function(value){return value && value !== "false"; };
window.isFalsey = function(value) {if(value === false || value === "false"){return true;}};
function getSubDomain(){
    var full = window.location.host;
    var parts = full.split('.');
    return parts[0].toLowerCase();
}
function getClientIdFromQueryParameters() {
    var clientId = window.getUrlParameter('clientId');
    if(!clientId){clientId = window.getUrlParameter('appName');}
    if(!clientId){clientId = window.getUrlParameter('lowerCaseAppName');}
    if(!clientId){clientId = window.getUrlParameter('quantimodoClientId');}
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
    window.logDebug("Using subdomain as client id: " + subdomain);
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
        return window.getUrlParameter(parameterName, url, shouldDecode);
    },
    getQuantiModoClientId: function () {
        return getQuantiModoClientId();
    },
    getQuantiModoApiUrl: function () {
        var apiUrl = window.getUrlParameter('apiUrl');
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
function isChromeExtension(){
    if(typeof chrome === "undefined"){
        window.logDebug("chrome is undefined");
        return false;
    }
    if(typeof chrome.runtime === "undefined"){
        window.logDebug("chrome.runtime is undefined");
        return false;
    }
    if(typeof chrome.alarms === "undefined"){
        window.logDebug("chrome.alarms is undefined");
        return false;
    }
    window.logDebug("isChromeExtension returns true");
    return true;
}
function getChromeManifest() {if(isChromeExtension()){return chrome.runtime.getManifest();}}
function getAppName() {
    if(getChromeManifest()){return getChromeManifest().name;}
    return window.getUrlParameter('appName');
}
function getClientId() {
    if(appSettings){return appSettings.clientId;}
    return window.getUrlParameter('clientId');
}
function getAppVersion() {
    if(getChromeManifest()){return getChromeManifest().version;}
    if(appSettings){return appSettings.versionNumber;}
    return window.getUrlParameter('appVersion');
}
window.getAccessToken = function() {
    if(localStorage.accessToken){return localStorage.accessToken;}
    return window.getUrlParameter('accessToken');
};
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
var introWindowParams = { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2),
    left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true};
var facesRatingPopupWindowParams = { url: "templates/chrome/faces_popup.html", type: 'panel',
    top: screen.height - 150, left: screen.width - 380, width: 390, height: 110, focused: true};
var loginPopupWindowParams = { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2),
    left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true};
var reminderInboxPopupWindowParams = { url: "index.html", type: 'panel', top: screen.height - 800,
    left: screen.width - 455, width: 450, height: 750};
var compactInboxPopupWindowParams = { url: "index.html#/app/reminders-inbox-compact", type: 'panel',
    top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360};
var inboxNotificationParams = { type: "basic", title: "How are you?", message: "Click to open reminder inbox",
    iconUrl: "img/icons/icon_700.png", priority: 2};
var signInNotificationParams = { type: "basic", title: "How are you?",
    message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2};
function getChromeRatingNotificationParams(trackingReminderNotification){
    return { url: getRatingNotificationPath(trackingReminderNotification), type: 'panel', top: screen.height - 150,
        left: screen.width - 380, width: 390, height: 110, focused: true}
}
function addGlobalQueryParameters(url) {
    if (window.getAccessToken()) {
        url = addQueryParameter(url, 'access_token', window.getAccessToken());
    } else {
        window.logError("No access token!");
        showSignInNotification();
    }
    if(getAppName()){url = addQueryParameter(url, 'appName', getAppName());}
    if(getAppVersion()){url = addQueryParameter(url, 'appVersion', getAppVersion());}
    if(getClientId()){url = addQueryParameter(url, 'clientId', getClientId());}
    return url;
}
function loadAppSettings() {  // I think adding appSettings to the chrome manifest breaks installation
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'configs/default.config.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4) {
            var json = xobj.responseText;
            window.logDebug("AppSettings:" + json);
            appSettings = JSON.parse(json);
        }
    };
    xobj.send(null);
}
if(!window.getUrlParameter('clientId')){loadAppSettings();}
function getAppHostName() {
    if(appSettings && appSettings.apiUrl){return "https://" + appSettings.apiUrl;}
    return "https://app.quantimo.do";
}
if(isChromeExtension()) {
    if (!localStorage.introSeen) {
        window.logInfo("introSeen false on chrome extension so opening intro window popup");
        window.localStorage.setItem('introSeen', true);
        openOrFocusChromePopupWindow(introWindowParams);
    }
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
        var trackingReminderNotification = window.getMostRecentRatingNotificationFromLocalStorage();
        if(trackingReminderNotification){
            openOrFocusChromePopupWindow(getChromeRatingNotificationParams(trackingReminderNotification));
            updateBadgeText("");
        } else if (localStorage.useSmallInbox && localStorage.useSmallInbox === "true") {
            openOrFocusChromePopupWindow(compactInboxPopupWindowParams);
            //openOrFocusChromePopupWindow(facesRatingPopupWindowParams);
        } else {
            checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
        }
    });
}
function openOrFocusChromePopupWindow(windowParams) {
    if(!isChromeExtension()){
        window.logInfo("Can't open popup because chrome is undefined");
        return;
    }
    window.logInfo('openOrFocusChromePopupWindow checking if a window is already open', windowParams );
    function createWindow(windowParams) {
        chrome.windows.create(windowParams, function (chromeWindow) {
            localStorage.setItem('chromeWindowId', chromeWindow.id);
            chrome.windows.update(chromeWindow.id, { focused: windowParams.focused });
        });
    }
    var chromeWindowId = parseInt(localStorage.getItem('chromeWindowId'), null);
    if(!chromeWindowId){
        window.logInfo('openOrFocusChromePopupWindow: No window id from localStorage. Creating one...', windowParams );
        createWindow(windowParams);
        return;
    }
    window.logInfo('openOrFocusChromePopupWindow: window id from localStorage: ' + chromeWindowId, windowParams );
    chrome.windows.get(chromeWindowId, function (chromeWindow) {
        if (!chrome.runtime.lastError && chromeWindow){
            if(windowParams.focused){
                window.logInfo('openOrFocusChromePopupWindow: Window already open. Focusing...', windowParams );
                chrome.windows.update(chromeWindowId, {focused: true});
            } else {
                window.logInfo('openOrFocusChromePopupWindow: Window already open. NOT focusing...', windowParams );
            }
        } else {
            window.logInfo('openOrFocusChromePopupWindow: Window NOT already open. Creating one...', windowParams );
            createWindow(windowParams);
        }
    });
}
function openChromePopup(notificationId, focusWindow) {
    if(!isChromeExtension()){
        window.logDebug("Can't open popup because chrome is undefined");
        return;
    }
	if(!notificationId){notificationId = null;}
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);
	if(notificationId === "moodReportNotification") {
        openOrFocusChromePopupWindow(facesRatingPopupWindowParams);
	} else if (notificationId === "signin") {
        openOrFocusChromePopupWindow(loginPopupWindowParams);
	} else if (notificationId && IsJsonString(notificationId)) {
        reminderInboxPopupWindowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusChromePopupWindow(reminderInboxPopupWindowParams);
	} else {
        openOrFocusChromePopupWindow(reminderInboxPopupWindowParams);
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
        if(request.message === "uploadMeasurements") {window.pushMeasurements(request.payload, null);}
    });
}
window.pushMeasurements = function(measurements, onDoneListener) {
	postToQuantiModo(measurements,"v1/measurements", onDoneListener);
};
window.postTrackingReminderNotifications = function(trackingReminderNotifications, onDoneListener) {
    postToQuantiModo(trackingReminderNotifications, "v1/trackingReminderNotifications", onDoneListener);
};
function postToQuantiModo(body, path, onDoneListener) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST",  window.getRequestUrl(path), true);
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
    if(!isChromeExtension()){
        console.log("Can't showSignInNotification because chrome is undefined");
        return;
    }
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, signInNotificationParams, function (id) {});
}
window.getRequestUrl = function(path) {
    var url = addGlobalQueryParameters(getAppHostName() + "/api/" + path);
    console.log("Making API request to " + url);
    return url;
};
function updateBadgeText(string) {if(isChromeExtension()){chrome.browserAction.setBadgeText({text: string});}}
function refreshNotificationsAndShowPopupIfSo(notificationParams, alarm) {
    var type = "GET";
    var route = "v1/trackingReminderNotifications/past";
    if(!canWeMakeRequestYet(type, route, {blockRequests: true, minimumSecondsBetweenRequests: 300})){return;}
    var xhr = new XMLHttpRequest();
    xhr.open(type, window.getRequestUrl(route), false);
    xhr.onreadystatechange = function () {
        var notificationId;
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            window.setLocalStorageItem('trackingReminderNotifications', notificationsObject.data);
            var trackingReminderNotification = window.getMostRecentRatingNotificationFromLocalStorage();
            if(trackingReminderNotification){
                openOrFocusChromePopupWindow(getChromeRatingNotificationParams(trackingReminderNotification));
                updateBadgeText("");
            } else if (numberOfWaitingNotifications > 0) {
                window.setLocalStorageItem('trackingReminderNotifications', notificationsObject.data);
                if(isChromeExtension()){
                    notificationId = alarm.name;
                    updateBadgeText("?");
                    //chrome.browserAction.setBadgeText({text: String(numberOfWaitingNotifications)});
                    chrome.notifications.create(notificationId, inboxNotificationParams, function (id) {});
                    openChromePopup(notificationId);
                }
            } else {
                openOrFocusChromePopupWindow(facesRatingPopupWindowParams);
                updateBadgeText("");
            }
        }
    };
    xhr.send();
    return notificationParams;
}
function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm) {
    if(!isChromeExtension()){
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
        refreshNotificationsAndShowPopupIfSo(notificationParams, alarm);
	} else {
		console.debug('alarm.name is not a json object', alarm);
        refreshNotificationsAndShowPopupIfSo(inboxNotificationParams, alarm);
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
        window.logError("Local storage item " + localStorageItemName + " not found! Local storage items: " + JSON.stringify(getLocalStorageList()));
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
            //window.logError(error, object); // Avoid infinite recursion
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
    function cordovaPluginsAvailable() {
        if(typeof cordova === "undefined"){return false;}
        return typeof cordova.plugins !== "undefined";
    }
    function getInstalledPluginList(){
        function localNotificationsPluginInstalled() {return cordovaPluginsAvailable() && typeof cordova.plugins.notification !== "undefined";}
        return {
            "Analytics": (typeof Analytics !== "undefined"),
            "backgroundGeoLocation": (typeof backgroundGeoLocation !== "undefined"),
            "cordova.plugins.notification": localNotificationsPluginInstalled(),
            "facebookConnectPlugin": (typeof facebookConnectPlugin !== "undefined"),
            "window.plugins.googleplus": (window && window.plugins && window.plugins.googleplus) ? true : false,
            "window.overApps": (cordovaPluginsAvailable() && typeof window.overApps !== "undefined"),
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
    //Bugsnag.context = $state.current.name;
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
window.getElementsFromLocalStorageItemWithFilters = function(localStorageItemName, filterPropertyName, filterPropertyValue,
                                                                 lessThanPropertyName, lessThanPropertyValue,
                                                                 greaterThanPropertyName, greaterThanPropertyValue) {
    var unfilteredElementArray = [];
    var itemAsString;
    var i;
    itemAsString = localStorage.getItem(localStorageItemName);
    if(!itemAsString){return null;}
    if(itemAsString === "undefined"){
        window.logError(localStorageItemName  + " local storage item is undefined!");
        return null;
    }
    var matchingElements = JSON.parse(itemAsString);
    if(matchingElements.length){
        if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined") {
            window.logError(greaterThanPropertyName + " greaterThanPropertyName does not exist for " + localStorageItemName);
        }
        if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
            window.logError(filterPropertyName + " filterPropertyName does not exist for " + localStorageItemName);
        }
        if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
            window.logError(lessThanPropertyName + " lessThanPropertyName does not exist for " + localStorageItemName);
        }
    }
    if(filterPropertyName && typeof filterPropertyValue !== "undefined" && filterPropertyValue !== null){
        if(matchingElements){unfilteredElementArray = matchingElements;}
        matchingElements = [];
        for(i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][filterPropertyName] === filterPropertyValue){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
    }
    if(lessThanPropertyName && lessThanPropertyValue){
        if(matchingElements){unfilteredElementArray = matchingElements;}
        matchingElements = [];
        for(i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][lessThanPropertyName] < lessThanPropertyValue){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
    }
    if(greaterThanPropertyName && greaterThanPropertyValue){
        if(matchingElements){unfilteredElementArray = matchingElements;}
        matchingElements = [];
        for(i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][greaterThanPropertyName] > greaterThanPropertyValue){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
    }
    return matchingElements;
};
window.getTrackingReminderNotificationsFromLocalStorage = function(variableCategoryName) {
    var trackingReminderNotifications = window.getElementsFromLocalStorageItemWithFilters('trackingReminderNotifications',
        'variableCategoryName', variableCategoryName);
    if(!trackingReminderNotifications){ trackingReminderNotifications = []; }
    if(trackingReminderNotifications.length){
        if (isChromeExtension()) {
            //noinspection JSUnresolvedFunction
            chrome.browserAction.setBadgeText({text: "?"});
            //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
        }
    }
    return trackingReminderNotifications;
};
window.getLocalStorageItemAsString = function(key) {
    var item = localStorage.getItem(key);
    if(item === "null" || item === "undefined"){
        localStorage.removeItem(key);
        return null;
    }
    return item;
};
window.deleteElementOfLocalStorageItemById = function(localStorageItemName, elementId){
    var elementsToKeep = [];
    var localStorageItemAsString = window.getLocalStorageItemAsString(localStorageItemName);
    var localStorageItemArray = JSON.parse(localStorageItemAsString);
    if(!localStorageItemArray){
        console.warn("Local storage item " + localStorageItemName + " not found");
    } else {
        for(var i = 0; i < localStorageItemArray.length; i++){
            if(localStorageItemArray[i].id !== elementId){elementsToKeep.push(localStorageItemArray[i]);}
        }
        this.setLocalStorageItem(localStorageItemName, JSON.stringify(elementsToKeep));
    }
    return elementsToKeep;
};
window.deleteLargeLocalStorageItems = function(localStorageItemsArray){
    for (var i = 0; i < localStorageItemsArray.length; i++){
        if(localStorageItemsArray[i].kB > 2000){ localStorage.removeItem(localStorageItemsArray[i].name); }
    }
};
window.setLocalStorageItem = function(key, value){
    if(typeof value !== "string"){value = JSON.stringify(value);}
    window.logDebug("Setting localStorage." + key + " to " + value.substring(0, 18) + '...');
    try {
        localStorage.setItem(key, value);
    } catch(error) {
        var metaData = { localStorageItems: getLocalStorageList() };
        var message = 'Error saving ' + key + ' to local storage';
        window.logError(message, metaData, getStackTrace());
        window.deleteLargeLocalStorageItems(metaData.localStorageItems);
        localStorage.setItem(key, value);
    }
};
window.getMostRecentRatingNotificationFromLocalStorage = function (){
    var trackingReminderNotifications = window.getElementsFromLocalStorageItemWithFilters('trackingReminderNotifications', 'unitAbbreviatedName', '/5');
    trackingReminderNotifications = window.sortByProperty(trackingReminderNotifications, 'trackingReminderNotificationTime');
    if(trackingReminderNotifications.length) {
        var notification = trackingReminderNotifications[trackingReminderNotifications.length - 1];
        if(notification.trackingReminderNotificationTimeEpoch < getUnixTimestampInSeconds() - 86400){
            window.logInfo("Got this notification but it's from yesterday: " + JSON.stringify(notification).substring(0, 140) + '...');
            //return;
        }
        window.logInfo("Got this notification: " + JSON.stringify(notification).substring(0, 140) + '...');
        window.deleteTrackingReminderNotificationFromLocalStorage(notification.trackingReminderNotificationId);
        return notification;
    } else {
        refreshNotificationsAndShowPopupIfSo();
        //window.refreshNotificationsIfEmpty();
        console.info("No notifications for popup");
        return null;
    }
};
window.sortByProperty = function(arrayToSort, propertyName){
    if(!arrayToSort){return [];}
    if(arrayToSort.length < 2){return arrayToSort;}
    if(propertyName.indexOf('-') > -1){
        arrayToSort.sort(function(a, b){return b[propertyName.replace('-', '')] - a[propertyName.replace('-', '')];});
    } else {
        arrayToSort.sort(function(a, b){return a[propertyName] - b[propertyName];});
    }
    return arrayToSort;
};
window.refreshNotificationsIfEmpty = function(){
    var count = window.getTrackingReminderNotificationsFromLocalStorage().length;
    if(!count){
        window.logInfo("No notifications in local storage");
        refreshNotificationsAndShowPopupIfSo();
    } else {
        window.logInfo(count + " notifications in local storage");
    }
};
window.deleteTrackingReminderNotificationFromLocalStorage = function(body){
    var trackingReminderNotificationId = body;
    if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotification){trackingReminderNotificationId = body.trackingReminderNotification.id;}
    if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotificationId){trackingReminderNotificationId = body.trackingReminderNotificationId;}
    if(window.getTrackingReminderNotificationsFromLocalStorage().length){
        window.logInfo("Deleting notification with id " + trackingReminderNotificationId);
        window.deleteElementOfLocalStorageItemById('trackingReminderNotifications', trackingReminderNotificationId);
    } else {
        window.refreshNotificationsIfEmpty();
    }
};
window.showAndroidPopupForMostRecentNotification = function(){
    if(!drawOverAppsEnabled()){qmService.logInfo("Can only show popups on Android"); return;}
    var trackingReminderNotification = window.getMostRecentRatingNotificationFromLocalStorage();
    if(trackingReminderNotification) {
        //window.logInfo("No notifications for popup");
        window.drawOverAppsRatingNotification(trackingReminderNotification);
    // } else if (window.getTrackingReminderNotificationsFromLocalStorage().length) {
    //     window.drawOverAppsCompactInboxNotification();  // TODO: Fix me
    } else {
        window.refreshNotificationsIfEmpty();
        window.logInfo("No notifications for popup");
    }
};
function getRatingNotificationPath(trackingReminderNotification){
    return "android_popup.html?variableName=" + trackingReminderNotification.variableName +
    "&valence=" + trackingReminderNotification.valence +
    "&trackingReminderNotificationId=" + trackingReminderNotification.trackingReminderNotificationId +
    "&clientId=" + window.getClientId() +
    "&accessToken=" + window.getAccessToken();
}
window.drawOverAppsRatingNotification = function(trackingReminderNotification) {
    window.drawOverAppsPopup(getRatingNotificationPath(trackingReminderNotification));
};
window.drawOverAppsCompactInboxNotification = function() {
    window.drawOverAppsPopup(compactInboxPopupWindowParams.url);
};
window.drawOverAppsPopup = function(path){
    if(typeof window.overApps === "undefined"){
        window.logError("window.overApps is undefined!");
        return;
    }
    //window.overApps.checkPermission(function(msg){console.log("checkPermission: " + msg);});
    var options = {
        path: path,          // file path to display as view content.
        hasHead: false,              // display over app head image which open the view up on click.
        dragToSide: false,          // enable auto move of head to screen side after dragging stop.
        enableBackBtn: true,       // enable hardware back button to close view.
        enableCloseBtn: true,      //  whether to show native close btn or to hide it.
        verticalPosition: "bottom",    // set vertical alignment of view.
        horizontalPosition: "center"  // set horizontal alignment of view.
    };
    window.logInfo("drawOverAppsRatingNotification options: " + JSON.stringify(options));
    window.overApps.startOverApp(options, function (success){
        window.logInfo("startOverApp success: " + success);
    },function (err){
        window.logError("startOverApp error: " + err);
    });
};
window.getUnixTimestampInSeconds = function(dateTimeString) {
    if(!dateTimeString){dateTimeString = new Date().getTime();}
    return Math.round(window.getUnixTimestampInMilliseconds(dateTimeString)/1000);
};
function getSecondsSinceLastRequest(type, route){
    var secondsSinceLastRequest = 99999999;
    if(localStorage.getItem(getLocalStorageNameForRequest(type, route))){
        secondsSinceLastRequest = window.getUnixTimestampInSeconds() - localStorage.getItem(getLocalStorageNameForRequest(type, route));
    }
    return secondsSinceLastRequest;
}
function getLocalStorageNameForRequest(type, route) {
    return 'last_' + type + '_' + route.replace('/', '_') + '_request_at';
}
window.canWeMakeRequestYet = function(type, route, options){
    var blockRequests = false;
    if(options && options.blockRequests){blockRequests = options.blockRequests;}
    var minimumSecondsBetweenRequests;
    if(options && options.minimumSecondsBetweenRequests){
        minimumSecondsBetweenRequests = options.minimumSecondsBetweenRequests;
    } else {
        minimumSecondsBetweenRequests = 1;
    }
    if(getSecondsSinceLastRequest(type, route) < minimumSecondsBetweenRequests){
        var name = 'Just made a ' + type + ' request to ' + route;
        var message = name + ". We made the same request within the last " + minimumSecondsBetweenRequests + ' seconds (' +
            getSecondsSinceLastRequest(type, route) + ' ago). stackTrace: ' + options.stackTrace;
        window.logError(message);
        if(blockRequests){
            window.logError("BLOCKING REQUEST because " + message);
            return false;
        }
    }
    window.setLocalStorageItem(getLocalStorageNameForRequest(type, route), getUnixTimestampInSeconds());
    return true;
};
window.getUser = function(){
    if(window.user){return user;}
    if(localStorage.getItem('user')){window.user = localStorage.getItem('user');}
    if(window.user){return window.user;}
};
window.getUnixTimestampInMilliseconds = function(dateTimeString) {
    if(!dateTimeString){return new Date().getTime();}
    return new Date(dateTimeString).getTime();
};
window.getUserFromApi = function(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", window.getRequestUrl("user/me"), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            window.user = JSON.parse(xhr.responseText);
            localStorage.setItem('user', window.user);
            if (typeof window.user.displayName !== "undefined") {
                console.debug(window.user.displayName + " is logged in.  ");
            } else {
                if(isChromeExtension()){
                    var url = window.getRequestUrl("v2/auth/login");
                    chrome.tabs.create({"url": url, "selected": true});
                }
            }
        }
    };
    xhr.send();
};
window.isTestUser = function(){return getUser() && getUser().displayName.indexOf('test') !== -1 && getUser().id !== 230;};