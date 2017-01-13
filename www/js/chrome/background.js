/***
****	EVENT HANDLERS
***/

var v = null;
var vid = null;

var introWindowParams = {
    url: "/www/index.html#/app/intro",
    type: 'panel',
    top: 0.2 * screen.height,
    left: 0.4 * screen.width,
    width: 450,
    height: 750
};

var facesRatingPopupWindowParams = {
    url: "www/templates/chrome/faces_popup.html",
    type: 'panel',
    top: screen.height - 150,
    left: screen.width - 380,
    width: 390,
    height: 110
};

var loginPopupWindowParams = {
    url: "/www/index.html#/app/login",
    type: 'panel',
    top: 0.2 * screen.height,
    left: 0.4 * screen.width,
    width: 450,
    height: 750
};

var reminderInboxPopupWindowParams = {
    url: "/www/index.html#/app/reminders-inbox",
    type: 'panel',
    top: screen.height - 800,
    left: screen.width - 455,
    width: 450,
    height: 750
};

var compactInboxPopupWindowParams = {
    url: "/www/index.html#/app/reminders-inbox-compact",
    type: 'panel',
    top: screen.height - 360 - 30,
    left: screen.width - 350,
    width: 350,
    height: 360
};

var inboxNotificationParams = {
    type: "basic",
    title: "How are you?",
    message: "Click to open reminder inbox",
    iconUrl: "www/img/icons/icon_700.png",
    priority: 2
};

var signInNotificationParams = {
    type: "basic",
    title: "How are you?",
    message: "Click to sign in and record a measurement",
    iconUrl: "www/img/icons/icon_700.png",
    priority: 2
};

if (!localStorage.introSeen) {
    window.localStorage.setItem('introSeen', true);
    var focusWindow = true;
    openOrFocusPopupWindow(introWindowParams, focusWindow);
}

/*
**	Called when the extension is installed
*/
chrome.runtime.onInstalled.addListener(function()
{
	var notificationInterval = parseInt(localStorage.notificationInterval || "60");

	if(notificationInterval === -1) {
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
chrome.alarms.onAlarm.addListener(function(alarm) {
    console.debug('onAlarm Listener heard this alarm ', alarm);
    if(localStorage.useSmallInbox && localStorage.useSmallInbox === "true"){
        openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
    } else {
        checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
    }
});

function openOrFocusPopupWindow(windowParams, focusWindow) {
    windowParams.focused = true;
    console.log('openOrFocusPopupWindow', windowParams );
    if (vid) {
        chrome.windows.get(vid, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow) {
                // Commenting existing window focus so we don't irritate users
				if(focusWindow){
                    chrome.windows.update(vid, {focused: true});
				}
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

	if(!notificationId){
		notificationId = null;
	}
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
	if(notificationId){
		chrome.notifications.clear(notificationId);
	}
}

/*
**	Called when the notification is clicked
*/
chrome.notifications.onClicked.addListener(function(notificationId)
{
    console.debug('onClicked: notificationId:', notificationId);
    var focusWindow = true;
	openPopup(notificationId, focusWindow);
});

/*
**	Handles extension-specific requests that come in, such as a
** 	request to upload a new measurement
*/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{
	console.debug("Received request: " + request.message);
	if(request.message === "uploadMeasurements")
	{
		pushMeasurements(request.payload, null);
	}
});



/***
****	HELPER FUNCTIONS
***/

function pushMeasurements(measurements, onDoneListener)
{
	var xhr = new XMLHttpRequest();
	var url = "https://app.quantimo.do/api/measurements/v2";
	if(localStorage.accessToken){
		url = url + '?access_token=' + localStorage.accessToken;
	}
	xhr.open("POST", url, true);
	xhr.onreadystatechange = function()
		{
			// If the request is completed
			if (xhr.readyState === 4)
			{
				console.debug("quantimodoService responds:");
				console.debug(xhr.responseText);

				if(onDoneListener !== null)
				{
					onDoneListener(xhr.responseText);
				}
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
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, signInNotificationParams, function (id) {});
}

function checkForNotificationsAndShowPopupIfSo(notificationParams, alarm) {
    var xhr = new XMLHttpRequest();
    var url = "https://app.quantimo.do:443/api/v1/trackingReminderNotifications/past";
    if (localStorage.accessToken) {
        url = url + '?access_token=' + localStorage.accessToken;
    } else {
        showSignInNotification();
        return;
	}

    xhr.open("GET", url, false);

    xhr.onreadystatechange = function () {
        var notificationId;
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            if (numberOfWaitingNotifications > 0) {
                notificationId = alarm.name;
                chrome.browserAction.setBadgeText({text: "?"});
                //chrome.browserAction.setBadgeText({text: String(numberOfWaitingNotifications)});
                chrome.notifications.create(notificationId, inboxNotificationParams, function (id) {});
                openPopup(notificationId);

            } else {
                openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
                chrome.browserAction.setBadgeText({text: ""});
            }
        }
    };

    xhr.send();
    return notificationParams;
}

function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)
{
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
