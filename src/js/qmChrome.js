/** @namespace window.qmLog */
/** @namespace window.qm */
window.qm.chrome = {};
if(typeof screen !== "undefined"){
    window.qm.chrome = {
        introWindowParams: { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
        facesWindowParams: { url: "android_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110, focused: true},
        loginWindowParams: { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
        fullInboxWindowParams: { url: "index.html#/app/reminders-inbox", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750},
        compactInboxWindowParams: { url: "index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360},
        inboxNotificationParams: { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "img/icons/icon_700.png", priority: 2},
        signInNotificationParams: { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2},
        scheduleGenericChromeExtensionNotification: function(intervalInMinutes) {
            qmLog.info('scheduleGenericChromeExtensionNotification: Reminder notification interval is ' + intervalInMinutes + ' minutes');
            var alarmInfo = {periodInMinutes: intervalInMinutes};
            qmLog.info('scheduleGenericChromeExtensionNotification: clear genericTrackingReminderNotificationAlarm');
            chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
            qmLog.info('scheduleGenericChromeExtensionNotification: create genericTrackingReminderNotificationAlarm', null, alarmInfo);
            chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
            qmLog.info('Alarm set, every ' + intervalInMinutes + ' minutes');
        },
        scheduleChromeExtensionNotificationWithTrackingReminder: function(trackingReminder) {
            var alarmInfo = {};
            function createChromeAlarmNameFromTrackingReminder(trackingReminder) {
                return {
                    trackingReminderId: trackingReminder.id,
                    variableName: trackingReminder.variableName,
                    defaultValue: trackingReminder.defaultValue,
                    unitAbbreviatedName: trackingReminder.unitAbbreviatedName,
                    periodInMinutes: trackingReminder.reminderFrequency / 60,
                    reminderStartTime: trackingReminder.reminderStartTime,
                    startTrackingDate: trackingReminder.startTrackingDate,
                    variableCategoryName: trackingReminder.variableCategoryName,
                    valence: trackingReminder.valence,
                    reminderEndTime: trackingReminder.reminderEndTime
                };
            }
            alarmInfo.when =  trackingReminder.nextReminderTimeEpochSeconds * 1000;
            alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
            var alarmName = createChromeAlarmNameFromTrackingReminder(trackingReminder);
            alarmName = JSON.stringify(alarmName);
            chrome.alarms.getAll(function(alarms) {
                var hasAlarm = alarms.some(function(oneAlarm) {return oneAlarm.name === alarmName;});
                if (hasAlarm) {qmLog.info(null, 'Already have an alarm for ' + alarmName, null);}
                if (!hasAlarm) {
                    chrome.alarms.create(alarmName, alarmInfo);
                    qmLog.info(null, 'Created alarm for alarmName ' + alarmName, null, alarmInfo);
                }
            });
        }
    };
}
function showSignInNotification() {
    if(!qm.platform.isChromeExtension()){return;}
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, qm.chrome.signInNotificationParams, function (id) {});
}
function getChromeManifest() {if(qm.platform.isChromeExtension()){return chrome.runtime.getManifest();}}
function getChromeRatingNotificationParams(trackingReminderNotification){
    if(!trackingReminderNotification){trackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();}
    return { url: getRatingNotificationPath(trackingReminderNotification), type: 'panel', top: screen.height - 150,
        left: screen.width - 380, width: 390, height: 110, focused: true};
}
qm.chrome.canShowChromePopups = function(){
    if(typeof chrome === "undefined" || typeof chrome.windows === "undefined" || typeof chrome.windows.create === "undefined"){
        qmLog.info("Cannot show chrome popups");
        return false;
    }
    return true;
};
qm.chrome.showRatingPopup = function(){
    window.trackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
    if(window.trackingReminderNotification){
        openOrFocusChromePopupWindow(getChromeRatingNotificationParams(window.trackingReminderNotification));
    }
};
function openOrFocusChromePopupWindow(windowParams) {
    if(!window.qm.chrome.canShowChromePopups()){return;}
    window.qmLog.info('openOrFocusChromePopupWindow checking if a window is already open', null, windowParams );
    function createWindow(windowParams) {
        qmLog.info("creating popup window", null, windowParams);
        chrome.windows.create(windowParams, function (chromeWindow) {
            qm.storage.setItem('chromeWindowId', chromeWindow.id);
            chrome.windows.update(chromeWindow.id, { focused: windowParams.focused });
        });
    }
    var chromeWindowId = parseInt(qm.storage.getItem(qm.items.chromeWindowId), null);
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
qm.chrome.updateChromeBadge = function(numberOfNotifications){
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
	qm.chrome.updateChromeBadge(0);
	if(notificationId === "moodReportNotification") {
        openOrFocusChromePopupWindow(qm.chrome.facesWindowParams);
	} else if (notificationId === "signin") {
	    windowParams = qm.chrome.loginWindowParams;
	    if(focusWindow){windowParams.focused = true;}
        openOrFocusChromePopupWindow(qm.chrome.loginWindowParams);
	} else if (notificationId && IsJsonString(notificationId)) {
        windowParams = qm.chrome.fullInboxWindowParams;
	    if(focusWindow){windowParams.focused = true;}
        qm.chrome.fullInboxWindowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusChromePopupWindow(qm.chrome.fullInboxWindowParams);
	} else {
        windowParams = qm.chrome.fullInboxWindowParams;
        if(focusWindow){windowParams.focused = true;}
        openOrFocusChromePopupWindow(qm.chrome.fullInboxWindowParams);
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
qm.chrome.createSmallNotificationAndOpenInboxInBackground = function(){
    var notificationId = "inbox";
    chrome.notifications.create(notificationId, qm.chrome.inboxNotificationParams, function (id) {});
    var windowParams = qm.chrome.fullInboxWindowParams;
    windowParams.focused = false;
    openOrFocusChromePopupWindow(windowParams);
};
qm.chrome.checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary = function(alarm) {
    if(!qm.platform.isChromeExtension()){return;}
    window.qmLog.debug('showNotificationOrPopupForAlarm alarm: ', null, alarm);
    if(!qm.userHelper.withinAllowedNotificationTimes()){return false;}
    if(qm.notifications.getNumberInGlobalsOrLocalStorage()){
        qm.chrome.createSmallNotificationAndOpenInboxInBackground();
    } else {
        qm.notifications.refreshAndShowPopupIfNecessary();
    }

};
window.qm.chrome.showRatingOrInboxPopup = function (alarm) {
    qm.notifications.refreshIfEmpty(function () {
        //window.trackingReminderNotification = window.qm.notifications.getMostRecentRatingNotification();
        if(qm.notifications.getMostRecentRatingNotificationNotInSyncQueue()){
            qmLog.info("Opening rating notification popup");
            openOrFocusChromePopupWindow(getChromeRatingNotificationParams(
                qm.notifications.getMostRecentRatingNotificationNotInSyncQueue()));
            window.qm.chrome.updateChromeBadge(0);
        } else if (qm.storage.getItem(qm.items.useSmallInbox)) {
            qmLog.info("No rating notifications so opening compactInboxWindow popup");
            openOrFocusChromePopupWindow(qm.chrome.compactInboxWindowParams);
        } else if (qm.notifications.getNumberInGlobalsOrLocalStorage()) {
            qmLog.info("Got an alarm so checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)");
            window.qm.chrome.createSmallNotificationAndOpenInboxInBackground();
        }
    }, function (err) {
        qmLog.error("Not showing popup because of notification refresh error: "+ err);
    });
};
if(qm.platform.isChromeExtension()) {
    chrome.runtime.onInstalled.addListener(function () { // Called when the extension is installed
        var notificationInterval = parseInt(qm.storage.getItem(qm.items.notificationInterval) || "60");
        qm.chrome.scheduleGenericChromeExtensionNotification(notificationInterval);
    });
    chrome.alarms.onAlarm.addListener(function (alarm) { // Called when an alarm goes off (we only have one)
        window.qmLog.info('onAlarm Listener heard this alarm ', null, alarm);
        qm.getUserFromLocalStorageOrRefreshIfNecessary();
        qm.notifications.refreshIfEmptyOrStale(window.qm.chrome.showRatingOrInboxPopup(alarm));
    });
    if(qm.userHelper.getUserFromLocalStorage()){window.qm.chrome.showRatingOrInboxPopup();}
    if (!qm.storage.getItem(qm.items.introSeen)) {
        window.qmLog.info('introSeen false on chrome extension so opening intro window popup');
        window.qm.storage.setItem('introSeen', true);
        openOrFocusChromePopupWindow(qm.chrome.introWindowParams);
    }
}
