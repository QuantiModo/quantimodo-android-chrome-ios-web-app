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
    //document.getElementById('buttonInbox').onclick = inboxButtonClicked;
    document.getElementById('question').onclick = inboxButtonClicked;
}
function getVariableName() {
    if(window.getUrlParameter('variableName')){return window.getUrlParameter('variableName');}
}
function valenceNegative() {
    if(window.trackingReminderNotification.valence === "negative"){return true;}
}
var inboxButtonClicked = function() {
    window.logInfo("inboxButtonClicked");
    if(typeof OverApps !== "undefined"){
        window.logInfo("Calling  OverApps.openApp");
        //OverApps.openApp();
        //OverApps.closeWebView();
        OverApps.closeWebView();
        OverApps.openApp();
    } else {
        window.logInfo("OverApps not defined");
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
    if(window.trackingReminderNotification){
        window.trackingReminderNotification.action = 'track';
        window.trackingReminderNotification.modifiedValue = ratingValue;
        if(!window.notificationsSyncQueue){window.notificationsSyncQueue = [];}
        window.notificationsSyncQueue.push(window.trackingReminderNotification);
        window.trackingReminderNotification = window.getMostRecentRatingNotificationFromLocalStorage();
        if(window.trackingReminderNotification && window.notificationsSyncQueue.length < 10){
            updateQuestion(window.trackingReminderNotification.variableName);
        } else {
            showLoader();
            window.postTrackingReminderNotifications(window.notificationsSyncQueue, closePopup);
            //closePopup();
        }
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
function showLoader() {
    var sectionRate = document.getElementById("sectionRate");
    var loader = document.getElementById("loader");
    var question = document.getElementById("question");
    var body = document.getElementById("body");
    body.style.width = "0px";
    body.style.height = "0px";
    sectionRate.className = "invisible";
    sectionRate.style.display = "none";
    question.className = "invisible";
    question.style.display = "none";
    loader.style.display = "block";
    loader.className = "visible";
}
function hideLoader() {
    var sectionRate = document.getElementById("sectionRate");
    var loader = document.getElementById("loader");
    loader.className = "invisible";
    loader.style.display = "none";
    sectionRate.style.display = "block";
    sectionRate.className = "visible";
}
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
function updateQuestion(variableName) {
    var questionText = "How is your " + variableName.toLowerCase() + "?";
    window.logInfo("Updating question to " + questionText);
    document.getElementById("question").innerHTML = questionText;
    document.title = questionText;
    if(isChromeExtension()){document.getElementById("question").display = "none";}
}
document.addEventListener('DOMContentLoaded', function() {
    if(window.getUrlParameter("trackingReminderNotificationId")){
        window.trackingReminderNotification = {action: 'track', trackingReminderNotificationId: window.getUrlParameter('trackingReminderNotificationId'),
            variableName: window.getUrlParameter("variableName"), valence: window.getUrlParameter("valence")};
        updateQuestion(window.getUrlParameter("variableName"));
    }
    var wDiff = (380 - window.innerWidth);
    var hDiff = (70 - window.innerHeight);
    window.resizeBy(wDiff, hDiff);
    if(!window.getUser()){window.getUserFromApi();}
    setFaceButtonListeners();
    window.refreshNotificationsIfEmpty();
});
