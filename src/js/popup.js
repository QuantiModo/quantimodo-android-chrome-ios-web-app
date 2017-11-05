/** @namespace window.qmLog */
var ratingPopupHeight, ratingPopupWidth;
function clearNotifications() {
    if(!qm.platform.isChromeExtension()){ window.qmLog.debug('Can\'t clearNotifications because chrome is undefined'); return;}
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
function hidePopupPostNotificationsDeleteLocalAndClosePopup() {
    //hidePopup();
    showLoader();
    if(window.notificationsSyncQueue){
        qmStorage.deleteByPropertyInArray(qmItems.trackingReminderNotifications, 'variableName', window.notificationsSyncQueue);
        qmNotifications.postTrackingReminderNotifications(window.notificationsSyncQueue, closePopup);
    } else {
        closePopup();
    }
}
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
    if(window.trackingReminderNotification){
        window.trackingReminderNotification.action = 'track';
        window.trackingReminderNotification.modifiedValue = ratingValue;
        if(!window.notificationsSyncQueue){window.notificationsSyncQueue = [];}
        window.notificationsSyncQueue.push(window.trackingReminderNotification);
        //window.qmNotifications.deleteByVariableName(window.trackingReminderNotification.variableName);
        window.trackingReminderNotification = qmNotifications.getMostRecentRatingNotificationNotInSyncQueue();
        if(window.trackingReminderNotification && window.notificationsSyncQueue.length < 10){
            updateQuestion(window.trackingReminderNotification.variableName);
        } else {
            hidePopupPostNotificationsDeleteLocalAndClosePopup();
        }
        return;
    } else {
        qmLog.error("No window.trackingReminderNotification to post or add to queue!");
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
    window.qmLog.info('hidePopup: resizing to ' + ratingPopupWidth + " x 0 ");
    window.resizeTo(ratingPopupWidth, 0);
}
function showLoader(){
    var sectionRate = getRatingElement();
    var loader = document.getElementById("loader");
    loader.style.display = "block";
    sectionRate.style.display = "none";
    getQuestionElement().style.display = "none";
}
function unHidePopup() {
    window.qmLog.info('unHidePopup: resizing to ' + ratingPopupWidth + " x " + ratingPopupHeight);
    window.resizeTo(ratingPopupWidth, ratingPopupHeight);
}
// function hideLoader() {
//     var sectionRate = getRatingElement();
//     var loader = document.getElementById("loader");
//     loader.className = "invisible";
//     loader.style.display = "none";
//     sectionRate.style.display = "block";
//     sectionRate.className = "visible";
// }
function displaySendingTextAndPostMeasurements() {
    var sectionRate = getRatingElement();
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
    if(!variableName || typeof variableName !== "string"){
        if(!window.trackingReminderNotification){
            window.trackingReminderNotification = qmNotifications.getMostRecentRatingNotificationNotInSyncQueue();
            if(!window.trackingReminderNotification){
                closePopup();
                return;
            }
        }
        variableName = window.trackingReminderNotification.variableName;
    }
    var questionText = "How is your " + variableName.toLowerCase() + "?";
    window.qmLog.info(null, 'Updating question to ' + questionText);
    getQuestionElement().innerHTML = questionText;
    document.title = questionText;
    if(qm.platform.isChromeExtension()){
        window.qmLog.info(null, 'Setting question display to none ');
        getQuestionElement().style.display = "none";
    } else {
        window.qmLog.info(null, 'NOT setting question display to none because not on Chrome', null);
    }
    unHidePopup();
}
function getQuestionElement() {
    return document.getElementById("question");
}
function getRatingElement() {
    return document.getElementById("sectionRate");
}
document.addEventListener('DOMContentLoaded', function() {
    qmLog.info("popup.js DOMContentLoaded");
    var wDiff = (380 - window.innerWidth);
    var hDiff = (70 - window.innerHeight);
    window.resizeBy(wDiff, hDiff);
    ratingPopupHeight = window.innerHeight;
    ratingPopupWidth = window.innerWidth;
    if(window.urlHelper.getParam("trackingReminderNotificationId")){
        window.trackingReminderNotification = {action: 'track', trackingReminderNotificationId: window.urlHelper.getParam('trackingReminderNotificationId'),
            variableName: window.urlHelper.getParam("variableName"), valence: window.urlHelper.getParam("valence")};
    } else {
        window.trackingReminderNotification = qmNotifications.getMostRecentRatingNotificationNotInSyncQueue();
    }
    if (window.trackingReminderNotification){
        updateQuestion(window.trackingReminderNotification.variableName);
    } else {
        hidePopup();
        qmNotifications.refreshNotifications(updateQuestion, closePopup);
    }
    if(!window.qmUser){window.getUserFromApi();}
    setFaceButtonListeners();
    qmLog.info(qmNotifications.getNumberInGlobalsOrLocalStorage() + " notifications in InGlobalsOrLocalStorage on popup DOMContentLoaded");
    window.qmLog.setupBugsnag();
    window.qmNotifications.refreshIfEmptyOrStale();
});
