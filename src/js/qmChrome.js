/** @namespace window.qmLog */
/** @namespace window.qm */
window.qmChrome = {
    introWindowParams: { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
    facesWindowParams: { url: "android_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110, focused: true},
    loginWindowParams: { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
    fullInboxWindowParams: { url: "index.html#/app/reminders-inbox", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750},
    compactInboxWindowParams: { url: "index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360},
    inboxNotificationParams: { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "img/icons/icon_700.png", priority: 2},
    signInNotificationParams: { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2},
};
function showSignInNotification() {
    if(!qm.platform.isChromeExtension()){return;}
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, qmChrome.signInNotificationParams, function (id) {});
}
function getChromeManifest() {if(qm.platform.isChromeExtension()){return chrome.runtime.getManifest();}}
function getChromeRatingNotificationParams(trackingReminderNotification){
    if(!trackingReminderNotification){trackingReminderNotification = qmNotifications.getMostRecentRatingNotificationNotInSyncQueue();}
    return { url: getRatingNotificationPath(trackingReminderNotification), type: 'panel', top: screen.height - 150,
        left: screen.width - 380, width: 390, height: 110, focused: true};
}
qmChrome.canShowChromePopups = function(){
    if(typeof chrome === "undefined" || typeof chrome.windows === "undefined" || typeof chrome.windows.create === "undefined"){
        qmLog.info("Cannot show chrome popups");
        return false;
    }
    return true;
};
qmChrome.showRatingPopup = function(){
    window.trackingReminderNotification = qmNotifications.getMostRecentRatingNotificationNotInSyncQueue();
    if(window.trackingReminderNotification){
        openOrFocusChromePopupWindow(getChromeRatingNotificationParams(window.trackingReminderNotification));
    }
};
function openOrFocusChromePopupWindow(windowParams) {
    if(!window.qmChrome.canShowChromePopups()){return;}
    window.qmLog.info('openOrFocusChromePopupWindow checking if a window is already open', null, windowParams );
    function createWindow(windowParams) {
        qmLog.info("creating popup window", null, windowParams);
        chrome.windows.create(windowParams, function (chromeWindow) {
            qmStorage.setItem('chromeWindowId', chromeWindow.id);
            chrome.windows.update(chromeWindow.id, { focused: windowParams.focused });
        });
    }
    var chromeWindowId = parseInt(qmStorage.getItem(qmItems.chromeWindowId), null);
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
qmChrome.updateChromeBadge = function(numberOfNotifications){
    var text = "";
    if(qm.platform.isChromeExtension() && typeof chrome.browserAction !== "undefined"){
        if(numberOfNotifications){text = numberOfNotifications.toString();}
        if(numberOfNotifications > 9){text = "?";}
        chrome.browserAction.setBadgeText({text: text});
    }
};
function openChromePopup(notificationId, focusWindow) {
    if(!qm.platform.isChromeExtension()){return;}
	if(!notificationId){notificationId = null;}
	var windowParams;
	qmChrome.updateChromeBadge(0);
	if(notificationId === "moodReportNotification") {
        openOrFocusChromePopupWindow(qmChrome.facesWindowParams);
	} else if (notificationId === "signin") {
	    windowParams = qmChrome.loginWindowParams;
	    if(focusWindow){windowParams.focused = true;}
        openOrFocusChromePopupWindow(qmChrome.loginWindowParams);
	} else if (notificationId && IsJsonString(notificationId)) {
        windowParams = qmChrome.fullInboxWindowParams;
	    if(focusWindow){windowParams.focused = true;}
        qmChrome.fullInboxWindowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusChromePopupWindow(qmChrome.fullInboxWindowParams);
	} else {
        windowParams = qmChrome.fullInboxWindowParams;
        if(focusWindow){windowParams.focused = true;}
        openOrFocusChromePopupWindow(qmChrome.fullInboxWindowParams);
		console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
	}
	if(notificationId){chrome.notifications.clear(notificationId);}
}
if(qm.platform.isChromeExtension()){
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
qmChrome.createSmallNotificationAndOpenInboxInBackground = function(){
    var notificationId = "inbox";
    chrome.notifications.create(notificationId, qmChrome.inboxNotificationParams, function (id) {});
    var windowParams = qmChrome.fullInboxWindowParams;
    windowParams.focused = false;
    openOrFocusChromePopupWindow(windowParams);
};
window.qmChrome.showRatingOrInboxPopup = function (alarm) {
    //window.trackingReminderNotification = window.qmNotifications.getMostRecentRatingNotification();
    if(qmNotifications.getMostRecentRatingNotificationNotInSyncQueue()){
        qmLog.info("Opening rating notification popup");
        openOrFocusChromePopupWindow(getChromeRatingNotificationParams(qmNotifications.getMostRecentRatingNotificationNotInSyncQueue()));
        window.qmChrome.updateChromeBadge(0);
    } else if (qmStorage.getItem(qmItems.useSmallInbox)) {
        qmLog.info("No rating notifications so opening compactInboxWindow popup");
        openOrFocusChromePopupWindow(qmChrome.compactInboxWindowParams);
    } else if (alarm) {
        qmLog.info("Got an alarm and no rating notifications so checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)");
        checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
    } else if (qmNotifications.getNumberInGlobalsOrLocalStorage()) {
        qmLog.info("Got an alarm so checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)");
        window.qmChrome.createSmallNotificationAndOpenInboxInBackground();
    } else {
        qmLog.info("No notifications in localStorage so refreshIfEmpty");
        qmNotifications.refreshIfEmpty();
    }
};
if(qm.platform.isChromeExtension()) {
    chrome.runtime.onInstalled.addListener(function () { // Called when the extension is installed
        var notificationInterval = parseInt(qmStorage.getItem(qmItems.notificationInterval) || "60");
        if (notificationInterval === -1) {
            chrome.alarms.clear("moodReportAlarm");
            window.qmLog.debug(null, 'Alarm cancelled', null);
        } else {
            var alarmInfo = {periodInMinutes: notificationInterval};
            chrome.alarms.create("moodReportAlarm", alarmInfo);
            window.qmLog.debug(null, 'Alarm set, every ' + notificationInterval + ' minutes', null);
        }
    });
    chrome.alarms.onAlarm.addListener(function (alarm) { // Called when an alarm goes off (we only have one)
        window.qmLog.info(null, 'onAlarm Listener heard this alarm ', null, alarm);
        window.qmChrome.showRatingOrInboxPopup(alarm);
    });
    if(userHelper.getUser()){window.qmChrome.showRatingOrInboxPopup();}
    if (!qmStorage.getItem(qmItems.introSeen)) {
        window.qmLog.info(null, 'introSeen false on chrome extension so opening intro window popup', null);
        window.qmStorage.setItem('introSeen', true);
        openOrFocusChromePopupWindow(qmChrome.introWindowParams);
    }
}