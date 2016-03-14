function loadAccountDetails()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://app.quantimo.do/api/user/me", true);
	xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4)
			{
				var userObject = JSON.parse(xhr.responseText);
				/*
				 * it should hide and show sign in button if the user is logged in or not
				 */
				if(typeof userObject['displayName'] !== "undefined")
				{
					document.getElementById('accountNameSpanHide').style.display="none";
					document.getElementById('signinStatusText').style.display="block";
					var accountNameSpan = document.getElementById('accountNameSpan');
					accountNameSpan.innerText = userObject['displayName'];
					
				} else {

					document.getElementById('accountNameSpan').style.display="none";
					document.getElementById('signinStatusText').style.display="none";
					document.getElementById('accountNameSpanHide').style.display="block";
					

				}
			}
		};
	xhr.send();
}

var onIntervalChanged = function()
{
	var notificationInterval = parseInt(localStorage["notificationInterval"] || "60");
	var newNotificationInterval = parseInt(this.value);
	console.log("New: " + newNotificationInterval + " old: " + notificationInterval);

	if(newNotificationInterval != notificationInterval)
	{
		notificationInterval = newNotificationInterval;
		localStorage["notificationInterval"] = notificationInterval;

		if(notificationInterval == -1)
		{
			chrome.alarms.clear("moodReportAlarm");
			console.log("Alarm cancelled");
		}
		else
		{
			var alarmInfo = {periodInMinutes: notificationInterval}
			chrome.alarms.create("moodReportAlarm", alarmInfo)
			console.log("Alarm set, every " + notificationInterval + " minutes");
		}
	}
};

var onShowNotificationChanged = function()
{
	localStorage["showNotification"] = this.checked;
};

var showBadgeChanged = function()
{
	localStorage["showBadge"] = this.checked;
};

document.addEventListener('DOMContentLoaded', function () 
{
	loadAccountDetails();
	
	// Set notification interval select
	var notificationIntervalSelect = document.getElementById('notificationIntervalSelect');
	var notificationInterval = localStorage["notificationInterval"] || "180";
	for(var i = 0; notificationIntervalSelect.options.length; i++) 
	{
		var currentOption = notificationIntervalSelect.options[i]
        if(currentOption.value == notificationInterval) 
		{
            notificationIntervalSelect.selectedIndex = i;
            break;
        }
    }
	notificationIntervalSelect.onchange=onIntervalChanged;
	
	// Set notification enabled checkbox
	var showNotificationCheckbox = document.getElementById('showNotificationCheckbox');
	var showNotification = (localStorage["showNotification"] || "true") == "true" ? true : false;
	showNotificationCheckbox.checked = showNotification;
	showNotificationCheckbox.onchange=onShowNotificationChanged;
	
	// Set badge enabled checkbox
	var showBadgeCheckbox = document.getElementById('showBadgeCheckbox');
	var showBadge = (localStorage["showBadge"] || "true") == "true" ? true : false;
	showBadgeCheckbox.checked = showBadge;
	showBadgeCheckbox.onchange=showBadgeChanged;
});