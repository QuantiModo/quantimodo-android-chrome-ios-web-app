/***
****	EVENT HANDLERS
***/

/*
**	Returns true in the result listener if the user is logged in, false if not
*/
function isUserLoggedIn(resultListener)
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://app.quantimo.do/api/user/me", true);
	xhr.onreadystatechange = function()
		{
			if (xhr.readyState === 4)
			{
				var userObject = JSON.parse(xhr.responseText);
				/*
				 * it should hide and show sign in button based upon the cookie set or not
				 */
				if(typeof userObject.displayName !== "undefined")
				{
						console.log(userObject.displayName + " is logged in.  ");
				} else {
					var url = "https://app.quantimo.do/api/v2/auth/login";
					chrome.tabs.create({"url":url, "selected":true});
				}
			}
		};
	xhr.send();
}

/*
**	Called when the extension is installed
*/
chrome.runtime.onInstalled.addListener(function()
{
	var notificationInterval = parseInt(localStorage.notificationInterval || "60");

	if(notificationInterval === -1)
	{
		chrome.alarms.clear("moodReportAlarm");
		console.log("Alarm cancelled");
	}
	else
	{
		var alarmInfo = {periodInMinutes: notificationInterval};
		chrome.alarms.create("moodReportAlarm", alarmInfo);
		console.log("Alarm set, every " + notificationInterval + " minutes");
	}
});

/*
**	Called when an alarm goes off (we only have one)
*/
chrome.alarms.onAlarm.addListener(function(alarm)
{
	console.log('onAlarm Listener heard this alarm ', alarm);
	var showNotification = (localStorage.showNotification || "true") === "true";

    if(showNotification){
		showTrackingInboxNotification(alarm);
        //checkForNotifications();
    }
});

/*
**	Called when the "report your mood" notification is clicked
*/
chrome.notifications.onClicked.addListener(function(notificationId)
{
    console.log('onClicked: notificationId:', notificationId);
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);

    var windowParams = {
        url: "/www/index.html#/app/reminders-inbox",
        type: 'panel',
        top: 0.2 * screen.height,
        left: 0.4 * screen.width,
        width: 450,
        height: 750
    };

	if(notificationId === "moodReportNotification")
	{
		windowParams = {url: "rating_popup.html",
							type: 'panel',
							top: 0.6 * screen.height,
							left: screen.width - 371,
							width: 371,
							height: 70
						   };
	} else if (IsJsonString(notificationId)) {
		windowParams.url = "/www/index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
	} else {
        console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
    }

    chrome.windows.create(windowParams);
	chrome.notifications.clear(notificationId);

	// chrome.notifications.getAll(function (notifications){
	// 	console.log('Got all notifications ', notifications);
	// 	for(var i = 0; i < notifications.length; i++){
	// 		chrome.notifications.clear(notifications[i].id);
	// 	}
	// });
});

/*
**	Handles extension-specific requests that come in, such as a
** 	request to upload a new measurement
*/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log("Received request: " + request.message);
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
	xhr.open("POST", "https://app.quantimo.do/api/measurements/v2", true);
	xhr.onreadystatechange = function()
		{
			// If the request is completed
			if (xhr.readyState === 4)
			{
				console.log("QuantiModo responds:");
				console.log(xhr.responseText);

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

function showGenericTrackingNotification(alarm)
{

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://app.quantimo.do:443/api/v1/trackingReminderNotifications", false);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            if(numberOfWaitingNotifications > 0) {
				var notificationParams = {
					type: "basic",
					title: numberOfWaitingNotifications + " new tracking reminder notifications!",
					message: "Click to open reminder inbox",
					iconUrl: "www/img/icons/icon_700.png",
					priority: 2
				};
				var notificationId = alarm.name;
				
				chrome.browserAction.setBadgeText({text: String(numberOfWaitingNotifications)});
				chrome.notifications.create(notificationId, notificationParams, function(id){});
            } else {
				chrome.browserAction.setBadgeText({text: ""});
			}
        }
    };

    xhr.send();
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function showTrackingInboxNotification(alarm){

	console.log('showTrackingInboxNotification alarm: ', alarm);

	var notificationParams = {
		type: "basic",
		title: "How are you?",
		message: "Click to open reminder inbox",
		iconUrl: "www/img/icons/icon_700.png",
		priority: 2
	};

    var notificationId = "trackingInboxNotification";

	if(alarm.name === "genericTrackingReminderNotificationAlarm"){
		showGenericTrackingNotification(alarm);
	} else if (IsJsonString(alarm.name)) {
		console.log('alarm.name IsJsonString', alarm);
		var trackingReminder = JSON.parse(alarm.name);
		notificationParams.title = 'Time to track ' + trackingReminder.variableName + '!';
		notificationParams.message = 'Click to add measurement';
        notificationId = alarm.name;
	} else {
		console.log('alarm.name is not a json object', alarm);
	}

	console.log('notificationParams: ', notificationParams);
    chrome.notifications.create(notificationId, notificationParams, function(id){});
}