/** @namespace window.qmLog */
/** @namespace window.qm */
window.qm.chrome = {
    debugEnabled: true,
    chromeDebug: function () {
        function checkAlarm() {
            chrome.alarms.getAll(function(alarms) {
                console.log("all alarms", alarms);
            })
        }
        if (qm.chrome.debugEnabled) {
            checkAlarm();
            chrome.windows.getLastFocused(function (window) {
                console.log("last focused", window);
            });
            chrome.windows.getAll(function (windows) {
                console.log("all windows", windows);
            });
            chrome.windows.getCurrent(function (window) {
                console.log("current window", window);
            });
        }
    },
    checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary: function(alarm) {
        if(!qm.platform.isChromeExtension()){return;}
        window.qmLog.debug('showNotificationOrPopupForAlarm alarm: ', null, alarm);
        if(!qm.userHelper.withinAllowedNotificationTimes()){return false;}
        if(qm.notifications.getNumberInGlobalsOrLocalStorage()){
            qm.chrome.createSmallInboxNotification();
        } else {
            qm.notifications.refreshAndShowPopupIfNecessary();
        }

    },
    createSmallInboxNotification: function (){
        var notificationId = "inbox";
        chrome.notifications.create(notificationId, qm.chrome.windowParams.inboxNotificationParams, function (id) {});
    },
    createSmallNotificationAndOpenInboxInBackground: function(){
       qm.chrome.createSmallInboxNotification();
        var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
        windowParams.focused = false;
        qm.chrome.openOrFocusChromePopupWindow(windowParams);
    },
    createPopup: function(windowParams){
        function createPopup(windowParams) {
            windowParams.url = qm.api.addGlobalParams(windowParams.url);
            qmLog.info("creating popup window", null, windowParams);
            chrome.windows.create(windowParams, function (chromeWindow) {
                qm.storage.setItem('chromeWindowId', chromeWindow.id);
                chrome.windows.update(chromeWindow.id, { focused: windowParams.focused });
            });
        }
        if(windowParams.url.indexOf('.quantimo.do') !== -1 || windowParams.url.indexOf('popup.html') !== -1){
            createPopup(windowParams);
        } else {
            qm.client.getClientWebsiteUrl(function (fullWebsiteUrl) {
                windowParams.url = fullWebsiteUrl + windowParams.url;
                createPopup(windowParams);
            })
        }
    },
    canShowChromePopups: function(){
        if(typeof chrome === "undefined" || typeof chrome.windows === "undefined" || typeof chrome.windows.create === "undefined"){
            qmLog.info("Cannot show chrome popups");
            return false;
        }
        if(qm.getUser() && !qm.getUser().pushNotificationsEnabled){
            qmLog.info("User has disabled notifications");
            return false;
        }
        return true;
    },
    getChromeManifest: function() {if(qm.platform.isChromeExtension()){return chrome.runtime.getManifest();}},
    getWindowByIdAndFocusOrCreateNewPopup: function(chromeWindowId, windowParams){
        chrome.windows.get(chromeWindowId, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow){
                if(windowParams.focused){
                    window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: Window already open. Focusing...', windowParams );
                    chrome.windows.update(chromeWindowId, {focused: true});
                } else {
                    window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: Window already open. NOT focusing...', windowParams );
                }
            } else {
                window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: Window NOT already open. Creating one...', windowParams );
                qm.chrome.createPopup(windowParams);
            }
        });
    },
    createPopupIfNoWindowIdInLocalStorage: function(windowParams){
        window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow checking if a window is already open.  new window params: ', null, windowParams );
        var chromeWindowId = parseInt(qm.storage.getItem(qm.items.chromeWindowId), null);
        if(!chromeWindowId){
            window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: No window id from localStorage. Creating one...', windowParams );
            qm.chrome.createPopup(windowParams);
            return false;
        }
        window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: window id from localStorage: ' + chromeWindowId, windowParams );
        return chromeWindowId;
    },
    getCurrentWindowAndFocusOrCreateNewPopup: function (windowParams) {
        chrome.windows.getCurrent(function (window) {
            console.log("current window", window);
            if(window && window.type === "popup"){
                chrome.windows.update(window.id, {focused: true});
            } else {
                qm.chrome.createPopup(windowParams);
            }
        });
    },
    getAllWindowsFocusOrCreateNewPopup: function (windowParams) {
        qm.userHelper.getUserFromLocalStorageOrApi(function (user) {
            if(!user.pushNotificationsEnabled){
                qmLog.pushDebug("Not showing chrome popup because notifications are disabled");
                return;
            }
            console.log("getAllWindowsFocusOrCreateNewPopup");
            chrome.windows.getAll(function (windows) {
                for (var i = 0; i < windows.length; i++) {
                    var window = windows[i];
                    console.log("current window", window);
                    if(window.type === "popup"){
                        console.log("Focusing existing popup", window);
                        chrome.windows.update(window.id, {focused: true});
                        return;
                    }
                }
                qm.chrome.createPopup(windowParams);
            });
        })
    },
    handleNotificationClick: function(notificationId) {
        window.qmLog.debug('onClicked: notificationId:' + notificationId);
        var focusWindow = true;
        if(!qm.platform.isChromeExtension()){return;}
        if(!notificationId){notificationId = null;}
        qm.chrome.updateChromeBadge(0);
        qmLog.info("notificationId: "+ notificationId);
        /**
         * @return {boolean}
         */
        function IsJsonString(str) {
            try {
                JSON.parse(str);
            } catch (exception) {
                return false;
            }
            return true;
        }
        if(notificationId === "moodReportNotification") {
            qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.facesWindowParams);
        } else if (notificationId === "signin") {
            qm.chrome.openLoginWindow();
        } else if (notificationId && IsJsonString(notificationId)) {
            qm.chrome.openMeasurementAddWindow(focusWindow, notificationId);
        } else {
            qm.chrome.openFullInbox(focusWindow, notificationId);
        }
        if(notificationId){chrome.notifications.clear(notificationId);}
    },
    initialize: function () {
        //return;
        chrome.notifications.onClicked.addListener(function(notificationId) { // Called when the notification is clicked
            qm.chrome.handleNotificationClick(notificationId);
        });
        /** @namespace chrome.extension.onMessage */
        chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
            // Handles extension-specific requests that come in, such as a request to upload a new measurement
            window.qmLog.debug('Received request: ' + request.message, null);
            if(request.message === "uploadMeasurements") {qm.api.postMeasurements(request.payload, null);}
        });
        chrome.runtime.onInstalled.addListener(function () { // Called when the extension is installed
            qm.chrome.scheduleGenericChromeExtensionNotification();
            if(!localStorage.getItem(qm.items.introSeen)){qm.chrome.openIntroWindowPopup();}
        });
        chrome.alarms.onAlarm.addListener(function (alarm) { // Called when an alarm goes off (we only have one)
            qmLog.info('onAlarm Listener heard this alarm ', null, alarm);
            qm.userHelper.getUserFromLocalStorageOrApi(function () {
                qm.notifications.refreshIfEmptyOrStale(qm.chrome.showRatingOrInboxPopup());
            });
        });
        qm.userHelper.getUserFromLocalStorageOrApi(function () {
            qm.chrome.showRatingOrInboxPopup();
        }, function () {
            qm.chrome.showSignInNotification();
        });
    },
    openIntroWindowPopup: function(){
        qm.storage.setItem('introSeen', true);
        qm.chrome.createPopup(qm.chrome.windowParams.introWindowParams);
    },
    openOrFocusChromePopupWindow: function (windowParams) {
        //qm.chrome.chromeDebug();
        if(!window.qm.chrome.canShowChromePopups()){return;}
        // var chromeWindowId = qm.chrome.createPopupIfNoWindowIdInLocalStorage(windowParams);
        // if(!chromeWindowId){return;}
        //qm.chrome.getCurrentWindowAndFocusOrCreateNewPopup(windowParams);
        qm.chrome.getAllWindowsFocusOrCreateNewPopup(windowParams);
        //qm.chrome.getWindowByIdAndFocusOrCreateNewPopup(chromeWindowId, windowParams);
    },
    openFullInbox: function (focusWindow, notificationId) {
        var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
        if(focusWindow){windowParams.focused = true;}
        qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.fullInboxWindowParams);
        console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
    },
    openLoginWindow: function(){
        var windowParams = qm.chrome.windowParams.loginWindowParams;
        windowParams.focused = true;
        qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.loginWindowParams);
    },
    openMeasurementAddWindow: function (focusWindow, notificationId) {
        var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
        if(focusWindow){windowParams.focused = true;}
        qm.chrome.windowParams.fullInboxWindowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.fullInboxWindowParams);
    },
    scheduleGenericChromeExtensionNotification: function() {
        var intervalInMinutes = parseInt(qm.storage.getItem(qm.items.notificationInterval) || "60");
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
        alarmInfo.when =  trackingReminder.nextReminderTimeEpochSeconds * 1000;
        alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
        var alarmName = qm.chrome.createChromeAlarmNameFromTrackingReminder(trackingReminder);
        alarmName = JSON.stringify(alarmName);
        chrome.alarms.getAll(function(alarms) {
            var hasAlarm = alarms.some(function(oneAlarm) {return oneAlarm.name === alarmName;});
            if (hasAlarm) {qmLog.info(null, 'Already have an alarm for ' + alarmName, null);}
            if (!hasAlarm) {
                chrome.alarms.create(alarmName, alarmInfo);
                qmLog.info(null, 'Created alarm for alarmName ' + alarmName, null, alarmInfo);
            }
        });
    },
    createChromeAlarmNameFromTrackingReminder: function (trackingReminder) {
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
    },
    showRatingOrInboxPopup: function () {
        qm.userHelper.getUserFromLocalStorageOrApi(function (user) {
            if(!user.pushNotificationsEnabled){
                qmLog.pushDebug("Not showing chrome popup because notifications are disabled");
                return;
            }
            qm.notifications.refreshIfEmptyOrStale(function () {
                if(!qm.notifications.getNumberInGlobalsOrLocalStorage()){
                    qmLog.info("No notifications not opening popup");
                    return false;
                }
                if(qm.getUser().combineNotifications){
                    qm.chrome.createSmallInboxNotification();
                    return;
                }
                window.trackingReminderNotification = window.qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
                if(window.trackingReminderNotification){
                    qm.chrome.showRatingPopup(window.trackingReminderNotification);
                } else if (qm.storage.getItem(qm.items.useSmallInbox)) {
                    qmLog.info("No rating notifications so opening compactInboxWindow popup");
                    qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.compactInboxWindowParams);
                } else if (qm.notifications.getNumberInGlobalsOrLocalStorage()) {
                    qmLog.info("Got an alarm so checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)");
                    qm.chrome.createSmallInboxNotification();
                }
            }, function (err) {
                qmLog.error("Not showing popup because of notification refresh error: "+ err);
            });
        });
    },
    showRatingPopup: function(trackingReminderNotification){
        qmLog.info("Opening rating notification popup");
        var getChromeRatingNotificationParams = function(trackingReminderNotification){
            if(!trackingReminderNotification){trackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();}
            return { url: qm.notifications.getRatingNotificationPath(trackingReminderNotification), type: 'panel', top: screen.height - 150,
                left: screen.width - 380, width: 390, height: 110, focused: true};
        };
        if(trackingReminderNotification){
            window.trackingReminderNotification = trackingReminderNotification;
        } else {
            window.trackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
        }
        if(window.trackingReminderNotification){
            qm.getClientId(function (clientId) {
                qm.chrome.openOrFocusChromePopupWindow(getChromeRatingNotificationParams(window.trackingReminderNotification));
            });
        }
        window.qm.chrome.updateChromeBadge(0);
    },
    showSignInNotification: function() {
        if(!qm.platform.isChromeExtension()){return;}
        var notificationId = 'signin';
        chrome.notifications.create(notificationId, qm.chrome.windowParams.signInNotificationParams, function (id) {});
    },
    updateChromeBadge: function(numberOfNotifications){
        var text = "";
        if(qm.platform.isChromeExtension() && typeof chrome.browserAction !== "undefined"){
            if(numberOfNotifications){text = numberOfNotifications.toString();}
            if(numberOfNotifications > 9){text = "?";}
            chrome.browserAction.setBadgeText({text: text});
        }
    }
};
if(typeof screen !== "undefined"){
    function multiplyScreenHeight(factor) {
        if(typeof screen === "undefined"){return false;}
        return parseInt(factor * screen.height);
    }
    function multiplyScreenWidth(factor) {
        if(typeof screen === "undefined"){return false;}
        return parseInt(factor * screen.height);
    }
    qm.chrome.windowParams = {
        introWindowParams: { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
        facesWindowParams: { url: "android_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110, focused: true},
        loginWindowParams: { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750, focused: true},
        fullInboxWindowParams: { url: "index.html#/app/reminders-inbox", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750},
        compactInboxWindowParams: { url: "index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360},
        inboxNotificationParams: { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "img/icons/icon_700.png", priority: 2},
        signInNotificationParams: { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2},
    };
}
if(qm.platform.isChromeExtension()){
    qm.chrome.initialize();
}
