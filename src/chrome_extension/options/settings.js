function loadAccountDetails() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://app.quantimo.do/api/user/me", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var userObject = JSON.parse(xhr.responseText);
			/*
			 * it should hide and show sign in button if the user is logged in or not
			 */
			if(typeof userObject['displayName'] !== "undefined") {
				document.getElementById('accountNameSpanHide').style.display="none";
				document.getElementById('signinStatusText').style.display="block";
				document.getElementById('signInAsAnotherUserText').style.display="block";
				var accountNameSpan = document.getElementById('accountNameSpan');
				accountNameSpan.innerText = userObject['displayName'];
			} else {
				document.getElementById('accountNameSpan').style.display="none";
				document.getElementById('signinStatusText').style.display="none";
				document.getElementById('signInAsAnotherUserText').style.display="none";
				document.getElementById('accountNameSpanHide').style.display="block";
			}
		}
	};
	xhr.send();
}
var onIntervalChanged = function() {
	var notificationInterval = parseInt(localStorage["notificationInterval"] || "60");
	var newNotificationInterval = parseInt(this.value);
	console.log("New: " + newNotificationInterval + " old: " + notificationInterval);
	if(newNotificationInterval != notificationInterval) {
		notificationInterval = newNotificationInterval;
		localStorage["notificationInterval"] = notificationInterval;
		if(notificationInterval == -1) {
			chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
			console.log("Alarm cancelled");
		} else {
			var alarmInfo = {periodInMinutes: notificationInterval};
			chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
			console.log("Alarm set, every " + notificationInterval + " minutes");
		}
        qm.chrome.showRatingOrInboxPopup();
	}
};
var onShowSmallNotificationChanged = function() {
	localStorage["showSmallNotification"] = this.checked;
};
var onUseSmallInboxChanged = function() {
	localStorage.useSmallInbox = this.checked;
};
var showBadgeChanged = function() {localStorage["showBadge"] = this.checked;};
document.addEventListener('DOMContentLoaded', function () {
	loadAccountDetails();
	// Set notification interval select
	var notificationIntervalSelect = document.getElementById('notificationIntervalSelect');
	var notificationInterval = localStorage["notificationInterval"] || "60";
	for(var i = 0; notificationIntervalSelect.options.length; i++) {
		var currentOption = notificationIntervalSelect.options[i];
        if(currentOption.value === notificationInterval) {
            notificationIntervalSelect.selectedIndex = i;
            break;
        }
    }
	notificationIntervalSelect.onchange=onIntervalChanged;
	var showSmallNotificationCheckbox = document.getElementById('showSmallNotificationCheckbox');
	showSmallNotificationCheckbox.checked = localStorage["showSmallNotification"] == "true" ? true : false;
	showSmallNotificationCheckbox.onchange=onShowSmallNotificationChanged;
    var useSmallInboxCheckbox = document.getElementById('useSmallInboxCheckbox');
    useSmallInboxCheckbox.checked = localStorage.useSmallInbox === "true";
    useSmallInboxCheckbox.onchange=onUseSmallInboxChanged;
	var showBadgeCheckbox = document.getElementById('showBadgeCheckbox');
	showBadgeCheckbox.checked = (localStorage["showBadge"] || "true") == "true" ? true : false;
	showBadgeCheckbox.onchange=showBadgeChanged;
});
