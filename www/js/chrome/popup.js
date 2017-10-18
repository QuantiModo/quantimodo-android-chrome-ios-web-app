function clearNotifications() {
    if(typeof chrome === "undefined"){ window.logDebug("Can't clearNotifications because chrome is undefined"); return;}
    var badgeParams = {text: ""};
    chrome.browserAction.setBadgeText(badgeParams);
    chrome.notifications.clear("moodReportNotification", function() {});
}
function setFaceButtonListeners() {
    document.getElementById('buttonMoodDepressed').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodSad').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodOk').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodHappy').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodEcstatic').onclick = onFaceButtonClicked;
    document.getElementById('buttonInbox').onclick = inboxButtonClicked;
}
function getVariableName() {
    if(window.getUrlParameter('variableName')){return window.getUrlParameter('variableName');}
}
function valenceNegative() {
    if(window.getUrlParameter('valence') === "negative"){return true;}
}
var inboxButtonClicked = function() {
    if(typeof OverApps !== "undefined"){
        OverApps.openApp();
        OverApps.closeWebView();
    } else {
        openOrFocusChromePopupWindow(reminderInboxPopupWindowParams, true);
    }
};
var onFaceButtonClicked = function() {
    var buttonId = this.id;
    var ratingValue; // Figure out what rating was selected
    if (buttonId === "buttonMoodDepressed") {if(valenceNegative()){ ratingValue = 5; } else { ratingValue = 1;}
    } else if (buttonId === "buttonMoodSad") {if(valenceNegative()){ ratingValue = 4; } else { ratingValue = 2;}
    } else if (buttonId === "buttonMoodOk") {ratingValue = 3;
    } else if (buttonId === "buttonMoodHappy") {if(valenceNegative()){ ratingValue = 2; } else { ratingValue = 4;}
    } else if (buttonId === "buttonMoodEcstatic") {if(valenceNegative()){ ratingValue = 1; } else { ratingValue = 5;}}
    if(window.getUrlParameter('trackingReminderNotificationId')){
        window.postTrackingReminderNotification({trackingReminderNotificationId: window.getUrlParameter('trackingReminderNotificationId'), modifiedValue: ratingValue});
        closePopup();
        return;
    }
    var request = {
        message: "uploadMeasurements",
        payload: [{
            measurements: [{startTimeEpoch: Math.floor(Date.now() / 1000), value: ratingValue}],
            variableName: getVariableName(),
            sourceName: "MoodiModo Chrome",
            category: "Mood",
            combinationOperation: "MEAN",
            unit: "/5"
        }]
    };
    window.pushMeasurements(request.payload, null);
    if(typeof chrome !== "undefined"){chrome.extension.sendMessage(request); } // Request our background script to upload it for us
    closePopup();
};
function displaySendingTextAndPostMeasurements() {
    var sectionRate = document.getElementById("sectionRate");
    var sectionSendingMood = document.getElementById("sectionSendingMood");
    sectionRate.className = "invisible";
    setTimeout(function() {
        sectionRate.style.display = "none";
        sectionSendingMood.innerText = "Sending mood";
        sectionSendingMood.style.display = "block";
        sectionSendingMood.className = "visible";
        window.pushMeasurements(measurement, function(response) {
            sectionSendingMood.className = "invisible";
            setTimeout(function()
            {
                window.close();
            }, 300);
        });
        clearNotifications();
    }, 400 );
}
function closePopup() {
    clearNotifications();
    window.close();
    if(typeof OverApps !== "undefined"){
        console.log("Calling OverApps.closeWebView()...");
        OverApps.closeWebView();
    } else {
        console.error("OverApps is undefined!");
    }
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("question").innerHTML = "How is your " + window.getUrlParameter("variableName").toLowerCase() + "?";
    var wDiff = (380 - window.innerWidth);
    var hDiff = (70 - window.innerHeight);
    window.resizeBy(wDiff, hDiff);
    function openLoginWindowIfWeCannotGetUser() {
        if(window.getAccessToken()){
            console.log("We already have an access token so no need for user request");
            return;
        }
        if(typeof chrome === "undefined"){
            console.log("Cannot open new tab to login in android. Please include accessToken in url params");
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", window.getRequestUrl("user/me"), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var userObject = JSON.parse(xhr.responseText);
                /*
             * it should hide and show sign in button based upon if the user is logged in or not
             */
                if (typeof userObject.displayName !== "undefined") {
                    console.debug(userObject.displayName + " is logged in.  ");
                } else {
                    var url = window.getRequestUrl("v2/auth/login");
                    chrome.tabs.create({"url": url, "selected": true});
                }
            }
        };
        xhr.send();
    }
    openLoginWindowIfWeCannotGetUser();
    setFaceButtonListeners();
    window.refreshNotificationsIfEmpty();
});