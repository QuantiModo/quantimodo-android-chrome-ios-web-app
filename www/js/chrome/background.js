/***
****	EVENT HANDLERS
***/
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
var manifest, appSettings;
if(typeof chrome !== "undefined"){manifest = chrome.runtime.getManifest();}
function getAppName() {
    if(manifest){return manifest.name;}
    return getUrlParameter('appName');
}
function getClientId() {
    if(appSettings){return appSettings.clientId;}
    return getUrlParameter('clientId');
}
function getAppVersion() {
    if(manifest){return manifest.version;}
    if(appSettings){return appSettings.versionNumber;}
    return getUrlParameter('appVersion');
}
function getAccessToken() {
    if(localStorage.accessToken){return localStorage.accessToken;}
    return getUrlParameter('accessToken');
}
var v = null;
var vid = null;
function multiplyScreenHeight(factor) {return parseInt(factor * screen.height);}
function multiplyScreenWidth(factor) {return parseInt(factor * screen.height);}
var introWindowParams = { url: "/www/index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750};
var facesRatingPopupWindowParams = { url: "www/templates/chrome/faces_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110};
var loginPopupWindowParams = { url: "/www/index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750};
var reminderInboxPopupWindowParams = { url: "/www/index.html", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
var compactInboxPopupWindowParams = { url: "/www/index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360};
var inboxNotificationParams = { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "www/img/icons/icon_700.png", priority: 2};
var signInNotificationParams = { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "www/img/icons/icon_700.png", priority: 2};
if (!localStorage.introSeen) {
    window.localStorage.setItem('introSeen', true);
    var focusWindow = true;
    openOrFocusPopupWindow(introWindowParams, focusWindow);
}
function getQueryParameterString() {
    var queryParameterString =  "?appName=" + encodeURIComponent(getAppName()) + "&appVersion=" + encodeURIComponent(getAppVersion()) +  "&clientId=" + encodeURIComponent(getClientId());
    if (getAccessToken()) {
        queryParameterString += '&access_token=' + getAccessToken();
    } else {
        showSignInNotification();
        return;
    }
    return queryParameterString;
}
function loadAppSettings() {  // I think adding appSettings to the chrome manifest breaks installation
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', '/www/configs/default.config.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4) {
            var json = xobj.responseText;
            console.log("AppSettings:" + json);
            appSettings = JSON.parse(json);
        }
    };
    xobj.send(null);
}
loadAppSettings();
function getAppHostName() {
    if(appSettings && appSettings.apiUrl){
        return "https://" + appSettings.apiUrl;
    }
    return "https://app.quantimo.do";
}
if(typeof chrome !== "undefined") {
    /*
    **	Called when the extension is installed
    */
    chrome.runtime.onInstalled.addListener(function () {
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
    /*
    **	Called when an alarm goes off (we only have one)
    */
    chrome.alarms.onAlarm.addListener(function (alarm) {
        console.debug('onAlarm Listener heard this alarm ', alarm);
        if (localStorage.useSmallInbox && localStorage.useSmallInbox === "true") {
            openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
        } else {
            checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
        }
    });
}
function openOrFocusPopupWindow(windowParams, focusWindow) {
    if(typeof chrome === "undefined"){
        console.log("Can't open popup because chrome is undefined");
        return;
    }
    windowParams.focused = true;
    console.log('openOrFocusPopupWindow', windowParams );
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
function openPopup(notificationId, focusWindow) {
    if(typeof chrome === "undefined"){
        console.log("Can't open popup because chrome is undefined");
        return;
    }
	if(!notificationId){notificationId = null;}
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);
	if(notificationId === "moodReportNotification") {
        openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
	} else if (notificationId === "signin") {
        openOrFocusPopupWindow(loginPopupWindowParams, focusWindow);
	} else if (notificationId && IsJsonString(notificationId)) {
        var windowParams = reminderInboxPopupWindowParams;
		windowParams.url = "/www/index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusPopupWindow(windowParams, focusWindow);
	} else {
        openOrFocusPopupWindow(reminderInboxPopupWindowParams, focusWindow);
		console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
	}
	//chrome.windows.create(windowParams);
	if(notificationId){chrome.notifications.clear(notificationId);}
}
if(typeof chrome !== "undefined"){
    /*
     **	Called when the notification is clicked
     */
    chrome.notifications.onClicked.addListener(function(notificationId) {
        console.debug('onClicked: notificationId:', notificationId);
        var focusWindow = true;
        openPopup(notificationId, focusWindow);
    });
    /*
    **	Handles extension-specific requests that come in, such as a
    ** 	request to upload a new measurement
    */
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        console.debug("Received request: " + request.message);
        if(request.message === "uploadMeasurements") {pushMeasurements(request.payload, null);}
    });
}

/***
****	HELPER FUNCTIONS
***/
function pushMeasurements(measurements, onDoneListener) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST",  getRequestUrl("v1/measurements"), true);
	xhr.onreadystatechange = function() {
        // If the request is completed
        if (xhr.readyState === 4) {
            console.log("qmService responds:");
            console.log(xhr.responseText);
            if(onDoneListener !== null) {onDoneListener(xhr.responseText);}
        }
    };
	xhr.send(JSON.stringify(measurements));
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
    if(typeof chrome === "undefined"){
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
function updateBadgeText(string) {
    if(typeof chrome !== "undefined"){
        chrome.browserAction.setBadgeText({text: string});
    }
}
function checkForNotificationsAndShowPopupIfSo(notificationParams, alarm) {
    if(typeof chrome === "undefined"){
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
                openPopup(notificationId);
            } else {
                openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
                updateBadgeText("");
            }
        }
    };
    xhr.send();
    return notificationParams;
}
function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm) {
    if(typeof chrome === "undefined"){
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