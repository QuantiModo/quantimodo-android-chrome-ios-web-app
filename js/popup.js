/** @namespace window.qmLog */
var ratingPopupHeight, ratingPopupWidth;
var qmPopup = {
    trackingReminderNotification: null
};
function setFaceButtonListeners() {
    qmLog.pushDebug("popup: Setting face button onclick listeners");
    document.getElementById('buttonMoodDepressed').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodSad').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodOk').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodHappy').onclick = onFaceButtonClicked;
    document.getElementById('buttonMoodEcstatic').onclick = onFaceButtonClicked;
    //document.getElementById('buttonInbox').onclick = inboxButtonClicked;
    document.getElementById('question').onclick = inboxButtonClicked;
}
function setLastValueButtonListeners() {
    qmLog.pushDebug("popup: Setting face button listeners");
    document.getElementById('lastValueButton').onclick = onLastValueButtonClicked;
    document.getElementById('secondToLastValueButton').onclick = onLastValueButtonClicked;
    document.getElementById('thirdToLastValueButton').onclick = onLastValueButtonClicked;
    document.getElementById('snoozeButton').onclick = onLastValueButtonClicked;
    document.getElementById('skipButton').onclick = onLastValueButtonClicked;
    document.getElementById('buttonInbox').onclick = inboxButtonClicked;
}
function getVariableName() {
    var variableName = window.qm.urlHelper.getParam('variableName');
    if(variableName){
        qmLog.debug("Got variableName " + variableName + " from url");
        return variableName;
    }
}
function valenceNegative() {
    if(!qmPopup.trackingReminderNotification){
        qmLog.error("qmPopup.trackingReminderNotification not set!");
        qm.notifications.closePopup();
    }
    if(qmPopup.trackingReminderNotification.valence === "negative"){
        return true;
    }
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
        window.qmLog.info('OverApps not defined');
        qm.chrome.windowParams.fullInboxWindowParams.focused = true;
        qm.chrome.createPopup(qm.chrome.windowParams.fullInboxWindowParams);
        hidePopupPostNotificationsDeleteLocalAndClosePopup();
    }
};
function hidePopupPostNotificationsDeleteLocalAndClosePopup() {
    qmLog.pushDebug('popup: hidePopupPostNotificationsDeleteLocalAndClosePopup...');
    hidePopup();
    //showLoader();
    if(window.notificationsSyncQueue){
        qm.storage.deleteByPropertyInArray(qm.items.trackingReminderNotifications, 'variableName', window.notificationsSyncQueue);
        qm.notifications.postTrackingReminderNotifications(window.notificationsSyncQueue, qm.notifications.closePopup,
            1000); // 300 is too fast
    } else {
        qm.notifications.closePopup();
    }
}
var onFaceButtonClicked = function() {
    var buttonId = this.id;
    qmLog.pushDebug('popup onFaceButtonClicked: onFaceButtonClicked buttonId ' + buttonId);
    var ratingValue; // Figure out what rating was selected
    if (buttonId === "buttonMoodDepressed") {if(valenceNegative()){ ratingValue = 5; } else { ratingValue = 1;}
    } else if (buttonId === "buttonMoodSad") {if(valenceNegative()){ ratingValue = 4; } else { ratingValue = 2;}
    } else if (buttonId === "buttonMoodOk") {ratingValue = 3;
    } else if (buttonId === "buttonMoodHappy") {if(valenceNegative()){ ratingValue = 2; } else { ratingValue = 4;}
    } else if (buttonId === "buttonMoodEcstatic") {if(valenceNegative()){ ratingValue = 1; } else { ratingValue = 5;}}
    if(!qmPopup.trackingReminderNotification){
        qmLog.error("No qmPopup.trackingReminderNotification to post or add to queue!");
    } else {
        qmLog.pushDebug('popup onFaceButtonClicked: qmPopup.trackingReminderNotification exists. Calling addToSyncQueueAndCloseOrUpdateQuestion..');
        qmPopup.trackingReminderNotification.modifiedValue = ratingValue;
    }
    return addToSyncQueueAndCloseOrUpdateQuestion();
    // TODO: Figure out how to send in background with chrome.extension.sendMessage(request);
    //if(typeof chrome !== "undefined"){chrome.extension.sendMessage(request); } // Request our background script to upload it for us
};
function addToSyncQueueAndCloseOrUpdateQuestion() {
    qmLog.pushDebug('popup: addToSyncQueueAndCloseOrUpdateQuestion...');
    if(!window.notificationsSyncQueue){window.notificationsSyncQueue = [];}
    if(qmPopup.trackingReminderNotification){
        window.notificationsSyncQueue.push(qmPopup.trackingReminderNotification);
        if(qmPopup.trackingReminderNotification.id){
            qm.notifications.deleteById(qmPopup.trackingReminderNotification.id);
        } else {
            qm.notifications.deleteByVariableName(qmPopup.trackingReminderNotification.variableName); // TODO: Why was this commented?
        }
    }
    qmPopup.trackingReminderNotification = qm.notifications.getMostRecentUniqueNotificationNotInSyncQueue();
    if(!qmPopup.trackingReminderNotification){
        qmLog.pushDebug('popup addToSyncQueueAndCloseOrUpdateQuestion: getMostRecentUniqueNotificationNotInSyncQueue returned nothing...');
    }
    if(window.notificationsSyncQueue.length > 10){
        qmLog.pushDebug('popup addToSyncQueueAndCloseOrUpdateQuestion: notificationsSyncQueue.length > 10 so posting and closing popup...');
    }
    if(qmPopup.trackingReminderNotification && window.notificationsSyncQueue.length < 10){
        qmLog.pushDebug('popup addToSyncQueueAndCloseOrUpdateQuestion: Calling updateQuestion for ' +
            qmPopup.trackingReminderNotification.variableName + '..');
        updateQuestion(qmPopup.trackingReminderNotification.variableName);
    } else {
        qmLog.pushDebug('popup addToSyncQueueAndCloseOrUpdateQuestion: Calling hidePopupPostNotificationsDeleteLocalAndClosePopup...');
        hidePopupPostNotificationsDeleteLocalAndClosePopup();
    }
}
var onLastValueButtonClicked = function() {
    var buttonId = this.id;
    qmLog.pushDebug('onLastValueButtonClicked buttonId ' + buttonId);
    if (buttonId === "lastValueButton") {
        qmPopup.trackingReminderNotification.action = 'track';
        qmPopup.trackingReminderNotification.modifiedValue = qmPopup.trackingReminderNotification.actionArray[0].modifiedValue;
    } else if (buttonId === "secondToLastValueButton") {
        qmPopup.trackingReminderNotification.action = 'track';
        qmPopup.trackingReminderNotification.modifiedValue = qmPopup.trackingReminderNotification.actionArray[1].modifiedValue;
    } else if (buttonId === "thirdToLastValueButton") {
        qmPopup.trackingReminderNotification.action = 'track';
        qmPopup.trackingReminderNotification.modifiedValue = qmPopup.trackingReminderNotification.actionArray[2].modifiedValue;
    } else if (buttonId === "snoozeButton") {
        qmPopup.trackingReminderNotification.action = 'snooze';
    } else if (buttonId === "skipButton") {
        qmPopup.trackingReminderNotification.action = 'skip';
    }
    addToSyncQueueAndCloseOrUpdateQuestion();
};
function hidePopup() {
    window.qmLog.info('hidePopup: resizing to ' + ratingPopupWidth + " x 0 ");
    window.resizeTo(ratingPopupWidth, 0);
}
function showLoader(){
    var sectionRate = getRatingSectionElement();
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
//     var sectionRate = getRatingSectionElement();
//     var loader = document.getElementById("loader");
//     loader.className = "invisible";
//     loader.style.display = "none";
//     sectionRate.style.display = "block";
//     sectionRate.className = "visible";
// }
function updateQuestion(variableName) {
    qmLog.pushDebug("popup: updateQuestion...");
    if(!variableName || typeof variableName !== "string"){
        qmLog.pushDebug("popup: variableName is ..." + JSON.stringify(variableName));
        if(!qmPopup.trackingReminderNotification){
            qmLog.pushDebug("popup: no qmPopup.trackingReminderNotification present. Calling  getMostRecentUniqueNotificationNotInSyncQueue...");
            qmPopup.trackingReminderNotification = qm.notifications.getMostRecentUniqueNotificationNotInSyncQueue();
            if(!qmPopup.trackingReminderNotification){
                qmLog.pushDebug("popup: getMostRecentUniqueNotificationNotInSyncQueue returned nothing...");
                qm.notifications.closePopup();
                return;
            }
        }
        variableName = qmPopup.trackingReminderNotification.variableName;
        qmLog.pushDebug("popup: qmPopup.trackingReminderNotification.variableName is " + variableName);
    }
    var questionText;
    variableName = qmPopup.trackingReminderNotification.displayName || variableName;
    if(qmPopup.trackingReminderNotification.unitAbbreviatedName === '/5'){
        questionText = "How is your " + variableName.toLowerCase() + "?";
        if(variableName.toLowerCase() === 'meditation'){
            qmLog.error("Asking "+questionText+"!",  "qmPopup.trackingReminderNotification is: " + JSON.stringify(qmPopup.trackingReminderNotification),
                {trackingReminderNotification: qmPopup.trackingReminderNotification});
        }
        getRatingSectionElement().style.display = "block";
        getLastValueSectionElement().style.display = "none";
    } else {
        function setLastValueButtonProperties(textElement, buttonElement, notificationAction) {
            if(notificationAction.modifiedValue !== null){
                buttonElement.style.display = "none";
                var size = 30 - notificationAction.shortTitle.length * 12/3;
                buttonElement.style.fontSize = size + "px";
                textElement.innerHTML = notificationAction.shortTitle;
                buttonElement.style.display = "inline-block";
            } else {
                buttonElement.style.display = "none";
            }
        }
        setLastValueButtonProperties(getLastValueElement(), getLastValueButtonElement(), qmPopup.trackingReminderNotification.actionArray[0]);
        setLastValueButtonProperties(getSecondToLastValueElement(), getSecondToLastValueButtonElement(), qmPopup.trackingReminderNotification.actionArray[1]);
        setLastValueButtonProperties(getThirdToLastValueElement(), getThirdToLastValueButtonElement(), qmPopup.trackingReminderNotification.actionArray[2]);
        getRatingSectionElement().style.display = "none";
        getLastValueSectionElement().style.display = "block";
        questionText = "Record " + variableName + " (" + qmPopup.trackingReminderNotification.unitAbbreviatedName + ")";
        if(qmPopup.trackingReminderNotification.unitAbbreviatedName === 'count'){questionText = "Record " + variableName;}
    }
    if(qmPopup.trackingReminderNotification.question){questionText = qmPopup.trackingReminderNotification.question;}
    window.qmLog.pushDebug('popup: Updating question to ' + questionText);
    getQuestionElement().innerHTML = questionText;
    document.title = questionText;
    if(qm.platform.isChromeExtension()){
        qmLog.pushDebug('popup: Setting question display to none ');
        getQuestionElement().style.display = "none";
    } else {
        getInboxButtonElement().style.display = "none";
        qmLog.pushDebug('NOT setting question display to none because not on Chrome');
    }
    unHidePopup();
}
function getQuestionElement() {
    return document.getElementById("question");
}
function getInboxButtonElement() {
    return document.getElementById("buttonInbox");
}
function getLastValueElement() {return document.getElementById("lastValue");}
function getSecondToLastValueElement() {
    return document.getElementById("secondToLastValue");
}
function getThirdToLastValueElement() {
    return document.getElementById("thirdToLastValue");
}
function getLastValueButtonElement() {return document.getElementById("lastValueButton");}
function getSecondToLastValueButtonElement() {return document.getElementById("secondToLastValueButton");}
function getThirdToLastValueButtonElement() {return document.getElementById("thirdToLastValueButton");}
function getLastValueSectionElement() {
    return document.getElementById("lastValueSection");
}
function getRatingSectionElement() {
    return document.getElementById("sectionRate");
}
document.addEventListener('DOMContentLoaded', function() {
    qmLog.pushDebug("popup addEventListener: popup.js DOMContentLoaded");
    var wDiff = (380 - window.innerWidth);
    var hDiff = (70 - window.innerHeight);
    window.resizeBy(wDiff, hDiff);
    ratingPopupHeight = window.innerHeight;
    ratingPopupWidth = window.innerWidth;
    if(window.qm.urlHelper.getParam("trackingReminderNotificationId")){
        qmPopup.trackingReminderNotification = {action: 'track', trackingReminderNotificationId: window.qm.urlHelper.getParam('trackingReminderNotificationId'),
            variableName: window.qm.urlHelper.getParam("variableName"), valence: window.qm.urlHelper.getParam("valence"), unitAbbreviatedName: '/5'};
    } else {
        qmLog.pushDebug("popup addEventListener: calling getMostRecentUniqueNotificationNotInSyncQueue...");
        qmPopup.trackingReminderNotification = qm.notifications.getMostRecentUniqueNotificationNotInSyncQueue();
    }
    if (qmPopup.trackingReminderNotification){
        qmLog.pushDebug("popup addEventListener: calling updateQuestion...");
        updateQuestion(qmPopup.trackingReminderNotification.variableName);
    } else {
        qmLog.pushDebug("popup addEventListener: Calling hidePopup...");
        hidePopup();
        qm.notifications.refreshNotifications(updateQuestion, qm.notifications.closePopup);
    }
    qmLog.pushDebug("popup addEventListener: calling setFaceButtonListeners...");
    setFaceButtonListeners();
    qmLog.pushDebug("popup addEventListener: calling setLastValueButtonListeners...");
    setLastValueButtonListeners();
    qmLog.pushDebug("popup addEventListener: " + qm.notifications.getNumberInGlobalsOrLocalStorage() +
        " notifications in InGlobalsOrLocalStorage on popup DOMContentLoaded");
    qmLog.pushDebug("popup addEventListener: calling qm.notifications.refreshIfEmptyOrStale...");
    qm.notifications.refreshIfEmptyOrStale();
    qmLog.pushDebug("popup addEventListener: calling getUserFromLocalStorage...");
    qm.userHelper.getUserFromLocalStorageOrApi();
});
qmLog.pushDebug("popup addEventListener: calling setupBugsnag...");
qmLog.setupBugsnag();
