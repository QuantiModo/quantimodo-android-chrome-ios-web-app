/** @namespace window.qmLog */
String.prototype.toCamel = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
var appSettings;
window.qm = {
    trackingReminderNotifications : []
};
window.apiPaths = {
    trackingReminderNotificationsPast: "v1/trackingReminderNotifications/past"
};
window.notificationsHelper = {};
window.userHelper = {};
window.qmStorage = {
    items: {
        accessToken: 'accessToken',
        apiUrl: 'apiUrl',
        chromeWindowId: 'chromeWindowId',
        clientId: 'clientId',
        defaultHelpCards: 'defaultHelpCards',
        deviceTokenOnServer: 'deviceTokenOnServer',
        deviceTokenToSync: 'deviceTokenToSync',
        drawOverAppsEnabled: 'drawOverAppsEnabled',
        expiresAtMilliseconds: 'expiresAtMilliseconds',
        lastGotNotificationsAtMilliseconds: 'lastGotNotificationsAtMilliseconds',
        lastLatitude: 'lastLatitude',
        lastLocationName: 'lastLocationName',
        lastLocationPostUnixtime: 'lastLocationPostUnixtime',
        lastLongitude: 'lastLongitude',
        lastPushTimestamp: 'lastPushTimestamp',
        notifications: 'trackingReminderNotifications',
        refreshToken: 'refreshToken',
        trackingReminderNotificationSyncScheduled: 'trackingReminderNotificationSyncScheduled',
        trackingReminderNotifications: 'trackingReminderNotifications',
        trackingReminders: 'trackingReminders',
    }
};
window.timeHelper = {};
window.apiHelper = {};
window.qmPush = {};
window.qmNotifications = {};
window.qmAnalytics = {
    eventCategories: {
        pushNotifications: "pushNotifications",
        inbox: "inbox"
    }
};
window.qmChrome = {
    introWindowParams: { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
    facesRatingPopupWindowParams: { url: "android_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110, focused: true},
    loginPopupWindowParams: { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
    reminderInboxPopupWindowParams: { url: "index.html", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750},
    compactInboxPopupWindowParams: { url: "index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360},
    inboxNotificationParams: { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "img/icons/icon_700.png", priority: 2},
    signInNotificationParams: { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2},
};
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
if(!window.qmUser){
    window.qmUser = localStorage.getItem(qmStorage.items.user);
    if(window.qmUser){window.qmUser = JSON.parse(window.qmUser);}
}
notificationsHelper.getFromGlobalsOrLocalStorage = function(){
    if(qm.trackingReminderNotifications){return qm.trackingReminderNotifications;}
    return qm.trackingReminderNotifications = qmStorage.getAsObject(qmStorage.items.trackingReminderNotifications);
};
window.qmStorage.getItem = function(key){
    var item = localStorage.getItem(key);
    if (typeof item === "string"){
        window.qmLog.debug('Got ' + key + ' from localStorage: ' + item.substring(0, 18) + '...');
    } else {
        window.qmLog.debug(key + ' not found in localStorage');
    }
    return item;
};
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
    if(clientId){qmStorage.setItem('clientId', clientId);}
    return clientId;
}
function getQuantiModoClientId() {
    if(onMobile()){
        window.qmLog.debug(null, 'Using default.config.js because we\'re on mobile', null);
        return "default"; // On mobile
    }
    var clientId = getClientIdFromQueryParameters();
    if(clientId){
        window.qmLog.debug(null, 'Using clientIdFromQueryParams: ' + clientId, null);
        return clientId;
    }
    if(!clientId){clientId = qmStorage.getItem(qmStorage.items.clientId);}
    if(clientId){
        window.qmLog.debug(null, 'Using clientId From localStorage: ' + clientId, null);
        return clientId;
    }
    if(window.location.href.indexOf('quantimo.do') === -1){
        window.qmLog.debug(null, 'Using default.config.js because we\'re not on a quantimo.do domain', null);
        return "default"; // On mobile
    }
    var subdomain = getSubDomain();
    var clientIdFromAppConfigName = appConfigFileNames[getSubDomain()];
    if(clientIdFromAppConfigName){
        window.qmLog.debug(null, 'Using client id ' + clientIdFromAppConfigName + ' derived from appConfigFileNames using subdomain: ' + subdomain, null);
        return clientIdFromAppConfigName;
    }
    window.qmLog.debug(null, 'Using subdomain as client id: ' + subdomain, null, null);
    return subdomain;
}
function onMobile() {
    return window.location.href.indexOf('https://') === -1;
}
var appsManager = { // jshint ignore:line
    defaultApp : "default",
    getAppConfig : function(){
        window.qmLog.debug(null, 'getQuantiModoClientId returns ' + getQuantiModoClientId(), null);
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
        var apiUrl = window.getUrlParameter(qmStorage.items.apiUrl);
        if(!apiUrl){apiUrl = qmStorage.getItem(qmStorage.items.apiUrl);}
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
window.isChromeExtension = function (){
    if(typeof chrome === "undefined"){
        window.qmLog.debug(null, 'chrome is undefined', null, null);
        return false;
    }
    if(typeof chrome.runtime === "undefined"){
        window.qmLog.debug(null, 'chrome.runtime is undefined', null, null);
        return false;
    }
    if(typeof chrome.alarms === "undefined"){
        window.qmLog.debug(null, 'chrome.alarms is undefined', null, null);
        return false;
    }
    window.qmLog.debug(null, 'isChromeExtension returns true', null, null);
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
    if(getUrlParameter('accessToken')){return getUrlParameter('accessToken');}
    if(userHelper.getUser() && userHelper.getUser().accessToken){return userHelper.getUser().accessToken;}
    if(localStorage.accessToken){return localStorage.accessToken;}
    qmLog.info("No access token or user!");
    return null;
};
function multiplyScreenHeight(factor) {return parseInt(factor * screen.height);}
function multiplyScreenWidth(factor) {return parseInt(factor * screen.height);}
function getChromeRatingNotificationParams(trackingReminderNotification){
    return { url: getRatingNotificationPath(trackingReminderNotification), type: 'panel', top: screen.height - 150,
        left: screen.width - 380, width: 390, height: 110, focused: true}
}
function addGlobalQueryParameters(url) {
    if (window.getAccessToken()) {
        url = addQueryParameter(url, 'access_token', window.getAccessToken());
    } else {
        window.qmLog.error(null, 'No access token!');
        showSignInNotification();
    }
    if(getAppName()){url = addQueryParameter(url, 'appName', getAppName());}
    if(getAppVersion()){url = addQueryParameter(url, 'appVersion', getAppVersion());}
    if(getClientId()){url = addQueryParameter(url, 'clientId', getClientId());}
    return url;
}
notificationsHelper.getNumberInGlobalsOrLocalStorage = function(){
    var notifications = notificationsHelper.getFromGlobalsOrLocalStorage();
    if(notifications){return notifications.length;}
    return 0;
};
function loadAppSettings() {  // I think adding appSettings to the chrome manifest breaks installation
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'configs/default.config.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4) {
            var json = xobj.responseText;
            window.qmLog.debug('Got appSettings from configs/default.config.json', null, json, null);
            appSettings = JSON.parse(json);
        } else {
            window.qmLog.debug('Could not get appSettings from configs/default.config.json! xobj.readyState:' + xobj.readyState);
        }
    };
    xobj.send(null);
}
if(!window.getUrlParameter('clientId')){loadAppSettings();}
function getAppHostName() {
    if(appSettings && appSettings.apiUrl){return "https://" + appSettings.apiUrl;}
    return "https://app.quantimo.do";
}
function openOrFocusChromePopupWindow(windowParams) {
    if(!isChromeExtension()){return;}
    window.qmLog.info('openOrFocusChromePopupWindow checking if a window is already open', null, windowParams );
    function createWindow(windowParams) {
        qmLog.info("creating popup window", null, windowParams);
        chrome.windows.create(windowParams, function (chromeWindow) {
            qmStorage.setItem('chromeWindowId', chromeWindow.id);
            chrome.windows.update(chromeWindow.id, { focused: windowParams.focused });
        });
    }
    var chromeWindowId = parseInt(qmStorage.getItem(qmStorage.items.chromeWindowId), null);
    if(!chromeWindowId){
        window.qmLog.info('openOrFocusChromePopupWindow: No window id from localStorage. Creating one...', windowParams );
        createWindow(windowParams);
        return;
    }
    window.qmLog.info('openOrFocusChromePopupWindow: window id from localStorage: ' + chromeWindowId, windowParams );
    chrome.windows.get(chromeWindowId, function (chromeWindow) {
        if (!chrome.runtime.lastError && chromeWindow){
            if(windowParams.focused){
                window.qmLog.info('openOrFocusChromePopupWindow: Window already open. Focusing...', windowParams );
                chrome.windows.update(chromeWindowId, {focused: true});
            } else {
                window.qmLog.info('openOrFocusChromePopupWindow: Window already open. NOT focusing...', windowParams );
            }
        } else {
            window.qmLog.info('openOrFocusChromePopupWindow: Window NOT already open. Creating one...', windowParams );
            createWindow(windowParams);
        }
    });
}
notificationsHelper.updateChromeBadge = function(numberOfNotifications){
    var text = "";
    if(isChromeExtension() && typeof chrome.browserAction !== "undefined"){
        if(numberOfNotifications){text = numberOfNotifications.toString();}
        if(numberOfNotifications > 9){text = "?";}
        chrome.browserAction.setBadgeText({text: text});
    }
};
function openChromePopup(notificationId, focusWindow) {
    if(!isChromeExtension()){return;}
	if(!notificationId){notificationId = null;}
	var windowParams;
	notificationsHelper.updateChromeBadge(0);
	if(notificationId === "moodReportNotification") {
        openOrFocusChromePopupWindow(qmChrome.facesRatingPopupWindowParams);
	} else if (notificationId === "signin") {
	    windowParams = qmChrome.loginPopupWindowParams;
	    if(focusWindow){windowParams.focused = true;}
        openOrFocusChromePopupWindow(qmChrome.loginPopupWindowParams);
	} else if (notificationId && IsJsonString(notificationId)) {
        windowParams = qmChrome.reminderInboxPopupWindowParams;
	    if(focusWindow){windowParams.focused = true;}
        qmChrome.reminderInboxPopupWindowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusChromePopupWindow(qmChrome.reminderInboxPopupWindowParams);
	} else {
        windowParams = qmChrome.reminderInboxPopupWindowParams;
        if(focusWindow){windowParams.focused = true;}
        openOrFocusChromePopupWindow(qmChrome.reminderInboxPopupWindowParams);
		console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
	}
	if(notificationId){chrome.notifications.clear(notificationId);}
}
if(isChromeExtension()){
    // Called when the notification is clicked
    chrome.notifications.onClicked.addListener(function(notificationId) {
        window.qmLog.debug(null, 'onClicked: notificationId:', null, notificationId);
        var focusWindow = true;
        openChromePopup(notificationId, focusWindow);
    });
    // Handles extension-specific requests that come in, such as a request to upload a new measurement
    /** @namespace chrome.extension.onMessage */
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        window.qmLog.debug(null, 'Received request: ' + request.message, null);
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
    xhr.open("POST",  window.apiHelper.getRequestUrl(path), true);
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
    if(!isChromeExtension()){return;}
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, qmChrome.signInNotificationParams, function (id) {});
}
window.apiHelper.getRequestUrl = function(path) {
    var url = addGlobalQueryParameters(getAppHostName() + "/api/" + path);
    console.log("Making API request to " + url);
    return url;
};
qmStorage.setTrackingReminderNotifications = function(notifications){
    qmStorage.setLastNotificationsRefreshTime();
    qm.trackingReminderNotifications = notifications;
    qmChrome.updateChromeBadge(notifications.length);
    qmStorage.setItem(qmStorage.items.trackingReminderNotifications, notifications);
};
qmChrome.createSmallNotificationAndOpenInboxInBackground = function(alarm){
    var notificationId = "inbox";
    if(alarm){notificationId = alarm.name;}
    chrome.notifications.create(notificationId, qmChrome.inboxNotificationParams, function (id) {});
    var windowParams = qmChrome.reminderInboxPopupWindowParams;
    windowParams.focused = false;
    openOrFocusChromePopupWindow(windowParams);
};
notificationsHelper.refreshAndShowPopupIfNecessary = function(notificationParams, alarm) {
    var type = "GET";
    var route = apiPaths.trackingReminderNotificationsPast;
    if(!canWeMakeRequestYet(type, route, {blockRequests: true, minimumSecondsBetweenRequests: 300})){return;}
    var xhr = new XMLHttpRequest();
    xhr.open(type, window.apiHelper.getRequestUrl(route), false);
    xhr.onreadystatechange = function () {
        var notificationId;
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var responseObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(responseObject.data);
            qmStorage.setTrackingReminderNotifications(responseObject.data);
            var ratingNotification = window.qmStorage.getMostRecentRatingNotification();
            if(ratingNotification){
                openOrFocusChromePopupWindow(getChromeRatingNotificationParams(ratingNotification));
                notificationsHelper.updateChromeBadge(0);
            } else if (numberOfWaitingNotifications > 0) {
                qmChrome.createSmallNotificationAndOpenInboxInBackground(alarm);
            }
        }
    };
    xhr.send();
    return notificationParams;
};
userHelper.getUser = function(){
    if(window.qmUser){return window.qmUser;}
    window.qmUser = qmStorage.getAsObject('user');
    return window.qmUser;
};
userHelper.withinAllowedNotificationTimes = function(){
    if(userHelper.getUser()){
        var now = new Date();
        var hours = now.getHours();
        var currentTime = hours + ':00:00';
        if(currentTime > qmUser.latestReminderTime || currentTime < qmUser.earliestReminderTime ){
            window.qmLog.info('Not showing notification because outside allowed time range');
            return false;
        }
    }
    return true;
};
function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm) {
    if(!isChromeExtension()){return;}
	window.qmLog.debug('showNotificationOrPopupForAlarm alarm: ', null, alarm);
    if(!userHelper.withinAllowedNotificationTimes()){return false;}
	if (IsJsonString(alarm.name)) {
        var notificationParams = qmChrome.inboxNotificationParams;
		window.qmLog.debug('alarm.name IsJsonString', null, alarm);
		var trackingReminder = JSON.parse(alarm.name);
		notificationParams.title = 'Time to track ' + trackingReminder.variableName + '!';
		notificationParams.message = 'Click to add measurement';
        notificationsHelper.refreshAndShowPopupIfNecessary(notificationParams, alarm);
	} else {
		window.qmLog.debug('alarm.name is not a json object', null, alarm);
		if(!notificationsHelper.getNumberInGlobalsOrLocalStorage()){
            notificationsHelper.refreshAndShowPopupIfNecessary(qmChrome.inboxNotificationParams, alarm);
        } else {
            openOrFocusChromePopupWindow(qmChrome.inboxNotificationParams);
        }
	}
}
/**
 * @return {boolean}
 */
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
        return false;
    }
    return true;
}
window.qmStorage.deleteByProperty = function (localStorageItemName, propertyName, propertyValue){
    var elementsToKeep = [];
    var localStorageItemArray = JSON.parse(qmStorage.getItem(localStorageItemName));
    if(!localStorageItemArray){
        window.qmLog.error(null, 'Local storage item ' + localStorageItemName + ' not found! Local storage items: ' + JSON.stringify(qmStorage.getLocalStorageList()));
    } else {
        for(var i = 0; i < localStorageItemArray.length; i++){
            if(localStorageItemArray[i][propertyName] !== propertyValue){elementsToKeep.push(localStorageItemArray[i]);}
        }
        qmStorage.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
    }
};
function addQueryParameter(url, name, value){
    if(url.indexOf('?') === -1){return url + "?" + name + "=" + value;}
    return url + "&" + name + "=" + value;
}
window.qmStorage.getLocalStorageList = function(summary){
    var localStorageItemsArray = [];
    for (var i = 0; i < localStorage.length; i++){
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        if(summary){value = value.substring(0, 20) + '...';}
        localStorageItemsArray.push({
            name: key,
            value: value,
            kB: Math.round(qmStorage.getItem(key).length*16/(8*1024))
        });
    }
    return localStorageItemsArray.sort( function ( a, b ) { return b.kB - a.kB; } );
};
window.qmStorage.getWithFilters = function(localStorageItemName, filterPropertyName, filterPropertyValue,
                                                                 lessThanPropertyName, lessThanPropertyValue,
                                                                 greaterThanPropertyName, greaterThanPropertyValue) {
    var unfilteredElementArray = [];
    var i;
    var matchingElements = qmStorage.getAsObject(localStorageItemName);
    if(!matchingElements){return null;}
    if(matchingElements.length){
        if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined") {
            window.qmLog.error(null, greaterThanPropertyName + ' greaterThanPropertyName does not exist for ' + localStorageItemName);
        }
        if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
            window.qmLog.error(null, filterPropertyName + ' filterPropertyName does not exist for ' + localStorageItemName);
        }
        if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
            window.qmLog.error(null, lessThanPropertyName + ' lessThanPropertyName does not exist for ' + localStorageItemName);
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
window.qmStorage.getTrackingReminderNotifications = function(variableCategoryName) {
    var trackingReminderNotifications = window.qmStorage.getWithFilters('trackingReminderNotifications', 'variableCategoryName', variableCategoryName);
    if(!trackingReminderNotifications){ trackingReminderNotifications = []; }
    if(trackingReminderNotifications.length){
        if (isChromeExtension()) {
            //noinspection JSUnresolvedFunction
            notificationsHelper.updateChromeBadge(trackingReminderNotifications.length);
        }
    }
    return trackingReminderNotifications;
};
window.qmStorage.getAsString = function(key) {
    var item = qmStorage.getItem(key);
    if(item === "null" || item === "undefined"){
        qmStorage.removeItem(key);
        return null;
    }
    return item;
};
window.qmStorage.deleteById = function(localStorageItemName, elementId){
    window.qmStorage.deleteByProperty(localStorageItemName, 'id', elementId);
};
window.qmStorage.removeItem = function(key){
    qmLog.debug("Removing " + key + " from local storage");
    return localStorage.removeItem(key);
};
window.qmStorage.getElementOfLocalStorageItemById = function(localStorageItemName, elementId){
    var localStorageItemAsString = qmStorage.getAsString(localStorageItemName);
    var localStorageItemArray = JSON.parse(localStorageItemAsString);
    if(!localStorageItemArray){
        console.warn("Local storage item " + localStorageItemName + " not found");
    } else {
        for(var i = 0; i < localStorageItemArray.length; i++){
            if(localStorageItemArray[i].id === elementId){return localStorageItemArray[i];}
        }
    }
};
window.qmStorage.addToOrReplaceByIdAndMoveToFront = function(localStorageItemName, replacementElementArray){
    qmLog.info(null, 'qmStorage.addToOrReplaceByIdAndMoveToFront in ' + localStorageItemName + ': ' + JSON.stringify(replacementElementArray), null);
    if(!replacementElementArray instanceof Array){ replacementElementArray = [replacementElementArray]; }
    // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
    var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
    var localStorageItemArray = JSON.parse(qmStorage.getAsString(localStorageItemName));
    var found = false;
    if(localStorageItemArray){
        for(var i = 0; i < localStorageItemArray.length; i++){
            found = false;
            for (var j = 0; j < replacementElementArray.length; j++){
                if(replacementElementArray[j].id &&
                    localStorageItemArray[i].id === replacementElementArray[j].id){
                    found = true;
                }
            }
            if(!found){elementsToKeep.push(localStorageItemArray[i]);}
        }
    }
    qmStorage.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
    return elementsToKeep;
};
window.qmStorage.setItem = function(key, value){
    qm[key] = value;
    if(typeof value !== "string"){value = JSON.stringify(value);}
    window.qmLog.debug(null, 'Setting localStorage.' + key + ' to ' + value.substring(0, 18) + '...', null, null);
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        function deleteLargeLocalStorageItems(localStorageItemsArray){
            for (var i = 0; i < localStorageItemsArray.length; i++){
                if(localStorageItemsArray[i].kB > 2000){ qmStorage.removeItem(localStorageItemsArray[i].name); }
            }
        }
        var metaData = { localStorageItems: qmStorage.getLocalStorageList() };
        var name = 'Error saving ' + key + ' to local storage';
        window.qmLog.error(name, null, metaData);
        deleteLargeLocalStorageItems(metaData.localStorageItems);
        qmStorage.setItem(key, value);
    }
};
window.qmStorage.clearOAuthTokens = function(){
    window.qmStorage.setItem('accessToken', null);
    window.qmStorage.setItem('refreshToken', null);
    window.qmStorage.setItem('expiresAtMilliseconds', null);
};
var convertToObjectIfJsonString = function(stringOrObject) {
    try {stringOrObject = JSON.parse(stringOrObject);} catch (e) {return stringOrObject;}
    return stringOrObject;
};
qmStorage.getAsObject = function(key) {
    var item = qmStorage.getItem(key);
    item = convertToObjectIfJsonString(item);
    qm[key] = item;
    return item;
};
window.qmStorage.appendToArray = function(localStorageItemName, elementToAdd){
    function removeArrayElementsWithSameId(localStorageItem, elementToAdd) {
        if(elementToAdd.id){
            localStorageItem = localStorageItem.filter(function( obj ) {
                return obj.id !== elementToAdd.id;
            });
        }
        return localStorageItem;
    }
    var array = [];
    var string = window.qmStorage.getItem(localStorageItemName);
    if(string){array = JSON.parse(string);}
    array = removeArrayElementsWithSameId(array, elementToAdd);
    array.push(elementToAdd);
    window.qmStorage.setItem(localStorageItemName, array);
};
window.qmStorage.saveAccessToken = function (accessResponse) {
    var accessToken;
    if(typeof accessResponse === "string"){accessToken = accessResponse;} else {accessToken = accessResponse.accessToken || accessResponse.access_token;}
    if (accessToken) {
        window.qmStorage.setItem('accessToken', accessToken);
    } else {
        qmLog.error('No access token provided to qmStorage.saveAccessToken');
        return;
    }
    var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;
    if (refreshToken) {localStorage.refreshToken = refreshToken;}
    /** @namespace accessResponse.expiresAt */
    var expiresAt = accessResponse.expires || accessResponse.expiresAt || accessResponse.accessTokenExpires;
    var expiresAtMilliseconds;
    var bufferInMilliseconds = 86400 * 1000;  // Refresh a day in advance
    if(accessResponse.accessTokenExpiresAtMilliseconds){
        expiresAtMilliseconds = accessResponse.accessTokenExpiresAtMilliseconds;
    } else if (typeof expiresAt === 'string' || expiresAt instanceof String){
        expiresAtMilliseconds = window.getUnixTimestampInMilliseconds(expiresAt);
    } else if (expiresAt === parseInt(expiresAt, 10) && expiresAt < window.getUnixTimestampInMilliseconds()) {
        expiresAtMilliseconds = expiresAt * 1000;
    } else if(expiresAt === parseInt(expiresAt, 10) && expiresAt > window.getUnixTimestampInMilliseconds()){
        expiresAtMilliseconds = expiresAt;
    } else {
        // calculate expires at
        /** @namespace accessResponse.expiresIn */
        var expiresInSeconds = accessResponse.expiresIn || accessResponse.expires_in;
        expiresAtMilliseconds = window.getUnixTimestampInMilliseconds() + expiresInSeconds * 1000;
        qmLog.authDebug("Expires in is " + expiresInSeconds + ' seconds. This results in expiresAtMilliseconds being: ' + expiresAtMilliseconds);
    }
    if(expiresAtMilliseconds){
        localStorage.expiresAtMilliseconds = expiresAtMilliseconds - bufferInMilliseconds;
        return accessToken;
    } else {
        qmLog.error('No expiresAtMilliseconds!');
        Bugsnag.notify('No expiresAtMilliseconds!',
            'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qmStorage.getAsString('user'),
            {groupingHash: 'No expiresAtMilliseconds!'},
            "error");
    }
    var groupingHash = 'Access token expiresAt not provided in recognizable form!';
    qmLog.error(groupingHash);
    Bugsnag.notify(groupingHash,
        'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qmStorage.getAsString('user'),
        {groupingHash: groupingHash}, "error");
};
window.qmStorage.getMostRecentRatingNotification = function (){
    var ratingNotifications = window.qmStorage.getWithFilters('trackingReminderNotifications', 'unitAbbreviatedName', '/5');
    ratingNotifications = window.sortByProperty(ratingNotifications, 'trackingReminderNotificationTime');
    if(ratingNotifications.length) {
        var notification = ratingNotifications[ratingNotifications.length - 1];
        if(notification.trackingReminderNotificationTimeEpoch < timeHelper.getUnixTimestampInSeconds() - 86400){
            window.qmLog.info('Got this notification but it\'s from yesterday: ' + JSON.stringify(notification).substring(0, 140) + '...');
            //return;
        }
        window.qmLog.info(null, 'Got this notification: ' + JSON.stringify(notification).substring(0, 140) + '...', null);
        //window.qmStorage.deleteTrackingReminderNotification(notification.trackingReminderNotificationId);
        qmStorage.deleteByProperty(qmStorage.items.notifications, 'variableName', notification.variableName);
        return notification;
    } else {
        console.info('No rating notifications for popup');
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
window.notificationsHelper.refreshIfEmpty = function(){
    if(!notificationsHelper.getNumberInGlobalsOrLocalStorage()){
        window.qmLog.info('No notifications in local storage');
        notificationsHelper.refreshAndShowPopupIfNecessary();
    } else {
        window.qmLog.info(count + ' notifications in local storage');
    }
};
window.qmStorage.deleteTrackingReminderNotification = function(body){
    var trackingReminderNotificationId = body;
    if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotification){trackingReminderNotificationId = body.trackingReminderNotification.id;}
    if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotificationId){trackingReminderNotificationId = body.trackingReminderNotificationId;}
    if(window.qmStorage.getTrackingReminderNotifications().length){
        window.qmLog.info(null, 'Deleting notification with id ' + trackingReminderNotificationId, null);
        window.qmStorage.deleteById('trackingReminderNotifications', trackingReminderNotificationId);
    } else {
        window.notificationsHelper.refreshIfEmpty();
    }
};
window.qmNotifications.drawOverAppsEnabled = function(){
    var drawOverAppsEnabled =  qmStorage.getItem(qmStorage.items.drawOverAppsEnabled);
    return drawOverAppsEnabled == 'true';
};
window.showAndroidPopupForMostRecentNotification = function(){
    if(!qmNotifications.drawOverAppsEnabled()){window.qmLog.info(null, 'Can only show popups on Android', null); return;}
    var ratingNotification = window.qmStorage.getMostRecentRatingNotification();
    if(ratingNotification) {
        //window.qmLog.info("No notifications for popup");
        window.drawOverAppsRatingNotification(ratingNotification);
    // } else if (window.qmStorage.getTrackingReminderNotifications().length) {
    //     window.drawOverAppsCompactInboxNotification();  // TODO: Fix me
    } else {
        window.qmLog.info('No notifications for popup! Refreshing if empty...');
        window.notificationsHelper.refreshIfEmpty();
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
    window.drawOverAppsPopup(qmChrome.compactInboxPopupWindowParams.url);
};
window.drawOverAppsPopup = function(path){
    if(typeof window.overApps === "undefined"){
        window.qmLog.error(null, 'window.overApps is undefined!');
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
    window.qmLog.info(null, 'drawOverAppsRatingNotification options: ' + JSON.stringify(options), null);
    /** @namespace window.overApps */
    window.overApps.startOverApp(options, function (success){
        window.qmLog.info(null, 'startOverApp success: ' + success, null);
    },function (err){
        window.qmLog.error(null, 'startOverApp error: ' + err);
    });
};
window.timeHelper.getUnixTimestampInSeconds = function(dateTimeString) {
    if(!dateTimeString){dateTimeString = new Date().getTime();}
    return Math.round(window.getUnixTimestampInMilliseconds(dateTimeString)/1000);
};
function getLocalStorageNameForRequest(type, route) {
    return 'last_' + type + '_' + route.replace('/', '_') + '_request_at';
}
window.qmStorage.setLastNotificationsRefreshTime = function(){
    window.qmStorage.setLastRequestTime("GET", apiPaths.trackingReminderNotificationsPast);
};
window.qmStorage.setLastRequestTime = function(type, route){
    window.qmStorage.setItem(getLocalStorageNameForRequest(type, route), timeHelper.getUnixTimestampInSeconds());
};
window.canWeMakeRequestYet = function(type, route, options){
    function getSecondsSinceLastRequest(type, route){
        var secondsSinceLastRequest = 99999999;
        if(qmStorage.getItem(getLocalStorageNameForRequest(type, route))){
            secondsSinceLastRequest = window.timeHelper.getUnixTimestampInSeconds() - qmStorage.getItem(getLocalStorageNameForRequest(type, route));
        }
        return secondsSinceLastRequest;
    }
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
        window.qmLog.error(name, message, options);
        if(blockRequests){
            window.qmLog.error('BLOCKING REQUEST: ' + name, 'BLOCKING REQUEST because ' + message, options);
            return false;
        }
    }
    window.qmStorage.setItem(getLocalStorageNameForRequest(type, route), timeHelper.getUnixTimestampInSeconds());
    return true;
};
window.getUnixTimestampInMilliseconds = function(dateTimeString) {
    if(!dateTimeString){return new Date().getTime();}
    return new Date(dateTimeString).getTime();
};
window.getUserFromApi = function(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", window.apiHelper.getRequestUrl("user/me"), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            window.qmUser = JSON.parse(xhr.responseText);
            qmStorage.setItem('user', window.qmUser);
            if (typeof window.qmUser.displayName !== "undefined") {
                window.qmLog.debug(null, window.qmUser.displayName + ' is logged in.  ', null);
            } else {
                if(isChromeExtension()){
                    var url = window.apiHelper.getRequestUrl("v2/auth/login");
                    chrome.tabs.create({"url": url, "selected": true});
                }
            }
        }
    };
    xhr.send();
};
window.isTestUser = function(){return window.qmUser && window.qmUser.displayName.indexOf('test') !== -1 && window.qmUser.id !== 230;};
window.qmPush.getLastPushTimeStampInSeconds = function(){return qmStorage.getItem(qmStorage.items.lastPushTimestamp);};
window.qmPush.getHoursSinceLastPush = function(){
    return (window.timeHelper.getUnixTimestampInSeconds() - qmPush.getLastPushTimeStampInSeconds())/3600;
};
if(isChromeExtension()) {
    if (!localStorage.introSeen) {
        window.qmLog.info(null, 'introSeen false on chrome extension so opening intro window popup', null);
        window.qmStorage.setItem('introSeen', true);
        openOrFocusChromePopupWindow(qmChrome.introWindowParams);
    }
    chrome.runtime.onInstalled.addListener(function () { // Called when the extension is installed
        var notificationInterval = parseInt(localStorage.notificationInterval || "60");
        if (notificationInterval === -1) {
            chrome.alarms.clear("moodReportAlarm");
            window.qmLog.debug(null, 'Alarm cancelled', null);
        } else {
            var alarmInfo = {periodInMinutes: notificationInterval};
            chrome.alarms.create("moodReportAlarm", alarmInfo);
            window.qmLog.debug(null, 'Alarm set, every ' + notificationInterval + ' minutes', null);
        }
    });
    window.qmChrome.showRatingOrInboxPopup = function (alarm) {
        var ratingNotification = window.qmStorage.getMostRecentRatingNotification();
        if(ratingNotification){
            openOrFocusChromePopupWindow(getChromeRatingNotificationParams(ratingNotification));
            notificationsHelper.updateChromeBadge(0);
        } else if (localStorage.useSmallInbox && localStorage.useSmallInbox === "true") {
            openOrFocusChromePopupWindow(qmChrome.compactInboxPopupWindowParams);
        } else if (alarm) {
            checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
        } else if (notificationsHelper.getNumberInGlobalsOrLocalStorage()) {
            qmChrome.createSmallNotificationAndOpenInboxInBackground();
        } else {
            notificationsHelper.refreshIfEmpty();
        }
    };
    chrome.alarms.onAlarm.addListener(function (alarm) { // Called when an alarm goes off (we only have one)
        window.qmLog.debug(null, 'onAlarm Listener heard this alarm ', null, alarm);
        qmChrome.showRatingOrInboxPopup(alarm);
    });
}