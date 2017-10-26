/** @namespace window.qmLog */
var originalHeight;
function clearNotifications() {
    if(typeof chrome === "undefined"){ window.qmLog.debug(null, 'Can\'t clearNotifications because chrome is undefined', null, null); return;}
    qmChrome.updateChromeBadge(0);
    chrome.notifications.clear("moodReportNotification", function() {});
}
function setFaceButtonListeners() {
    qmLog.debug("Setting face button listeners");
    document.getElementById('buttonMoodDepressed').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodSad').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodOk').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodHappy').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodEcstatic').onclick = onFaceButtonClicked;
    //document.getElementById('buttonInbox').onclick = inboxButtonClicked;
    document.getElementById('question').onclick = inboxButtonClicked;
}
function getVariableName() {
    var variableName = window.urlHelper.getParam('variableName');
    if(variableName){
        qmLog.debug("Got variableName " + variableName + " from url");
        return variableName;
    }
}
function valenceNegative() {
    if(window.trackingReminderNotification.valence === "negative"){return true;}
}
var inboxButtonClicked = function() {
    window.qmLog.info('inboxButtonClicked');
    if(typeof OverApps !== "undefined"){
        window.qmLog.info('Calling OverApps.openApp');
        //OverApps.openApp();
        //OverApps.closeWebView();
        OverApps.closeWebView();
        OverApps.openApp();
    } else {
        window.qmLog.error('OverApps not defined');
        qmChrome.fullInboxWindowParams.focused = true;
        openOrFocusChromePopupWindow(qmChrome.fullInboxWindowParams);
    }
};
var onFaceButtonClicked = function() {
    var buttonId = this.id;
    console.log('onFaceButtonClicked');
    window.qmLog.info('onFaceButtonClicked buttonId ' + buttonId);
    var ratingValue; // Figure out what rating was selected
    if (buttonId === "buttonMoodDepressed") {if(valenceNegative()){ ratingValue = 5; } else { ratingValue = 1;}
    } else if (buttonId === "buttonMoodSad") {if(valenceNegative()){ ratingValue = 4; } else { ratingValue = 2;}
    } else if (buttonId === "buttonMoodOk") {ratingValue = 3;
    } else if (buttonId === "buttonMoodHappy") {if(valenceNegative()){ ratingValue = 2; } else { ratingValue = 4;}
    } else if (buttonId === "buttonMoodEcstatic") {if(valenceNegative()){ ratingValue = 1; } else { ratingValue = 5;}}
    hidePopup();
    if(window.trackingReminderNotification){
        window.trackingReminderNotification.action = 'track';
        window.trackingReminderNotification.modifiedValue = ratingValue;
        if(!window.notificationsSyncQueue){window.notificationsSyncQueue = [];}
        window.notificationsSyncQueue.push(window.trackingReminderNotification);
        window.trackingReminderNotification = window.qmStorage.getMostRecentRatingNotification();
        if(window.trackingReminderNotification && window.notificationsSyncQueue.length < 10){
            updateQuestion(window.trackingReminderNotification.variableName);
        } else {
            //hidePopup();
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
function hidePopup() {
    console.log('hidePopup');
    window.qmLog.info('hidePopup');
    //originalHeight = 56;
    //var sectionRate = document.getElementById("sectionRate");
    //var loader = document.getElementById("loader");
    //var question = document.getElementById("question");
    if (document.getElementsByTagName("body")[0]) {
        originalHeight = document.getElementsByTagName("body")[0].style.height;
        document.getElementsByTagName("body")[0].style.height = "0px";
    } else {
        window.qmLog.error('document.getElementsByTagName(body)[0] does not exist');
    }
    //sectionRate.className = "invisible";
    //sectionRate.style.display = "none";
    //question.className = "invisible";
    //question.style.display = "none";
    //loader.style.display = "block";
    //loader.className = "visible";
}
function unHidePopup() {
    window.qmLog.info('unHidePopup');
    //var sectionRate = document.getElementById("sectionRate");
    //var question = document.getElementById("question");
    if (document.getElementsByTagName("body")[0]) {
        document.getElementsByTagName("body")[0].style.height = originalHeight;
    } else {
        window.qmLog.error('document.getElementsByTagName(body)[0] does not exist');
    }
    //sectionRate.className = "visible";
    //sectionRate.style.display = "block";
    //question.className = "visible";
    //question.style.display = "block";
    //loader.style.display = "block";
    //loader.className = "visible";
}
// function hideLoader() {
//     var sectionRate = document.getElementById("sectionRate");
//     var loader = document.getElementById("loader");
//     loader.className = "invisible";
//     loader.style.display = "none";
//     sectionRate.style.display = "block";
//     sectionRate.className = "visible";
// }
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
    window.qmLog.info('closePopup');
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
    unHidePopup();
    var questionText = "How is your " + variableName.toLowerCase() + "?";
    window.qmLog.info(null, 'Updating question to ' + questionText);
    document.getElementById("question").innerHTML = questionText;
    document.title = questionText;
    if(qm.platform.isChromeExtension()){
        window.qmLog.info(null, 'Setting question display to none ');
        document.getElementById("question").style.display = "none";
    } else {
        window.qmLog.info(null, 'NOT setting question display to none because not on Chrome', null);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    if(window.urlHelper.getParam("trackingReminderNotificationId")){
        window.trackingReminderNotification = {action: 'track', trackingReminderNotificationId: window.urlHelper.getParam('trackingReminderNotificationId'),
            variableName: window.urlHelper.getParam("variableName"), valence: window.urlHelper.getParam("valence")};
        updateQuestion(window.urlHelper.getParam("variableName"));
    }
    var wDiff = (380 - window.innerWidth);
    var hDiff = (70 - window.innerHeight);
    window.resizeBy(wDiff, hDiff);
    if(!window.qmUser){window.getUserFromApi();}
    setFaceButtonListeners();
    window.notificationsHelper.refreshIfEmpty();
});
