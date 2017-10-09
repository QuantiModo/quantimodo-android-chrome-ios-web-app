function getApiUrl() {
    try {
        if(typeof chrome !== "undefined"){
            var manifest = chrome.runtime.getManifest();
            if(manifest.apiUrl){return manifest.apiUrl;}
        }
    } catch (error){
        console.log(error);
    }
    return "https://app.quantimo.do";
}
function clearNotifications() {
    if(typeof chrome === "undefined"){
        console.log("Can't clearNotifications because chrome is undefined");
        return;
    }
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
}
var onFaceButtonClicked = function() {
    // Figure out what rating was selected
    var buttonId = this.id;
    var ratingValue;
    if (buttonId === "buttonMoodDepressed") {
        ratingValue = 1;
    } else if (buttonId === "buttonMoodSad") {
        ratingValue = 2;
    } else if (buttonId === "buttonMoodOk") {
        ratingValue = 3;
    } else if (buttonId === "buttonMoodHappy") {
        ratingValue = 4;
    } else if (buttonId === "buttonMoodEcstatic") {
        ratingValue = 5;
    } else {
        console.debug("How did I get here...");
        return;
    }
    // Create an array of measurements
    var measurements = [{
        startTimeEpoch: Math.floor(Date.now() / 1000),
        value: ratingValue
    }];
    // Add it to a request, payload is what we'll send to qmService
    var request = {
        message: "uploadMeasurements",
        payload: [{
            measurements: measurements,
            variableName: "Overall Mood",
            sourceName: "MoodiModo Chrome",
            category: "Mood",
            combinationOperation: "MEAN",
            unit: "/5"
        }]
    };
    pushMeasurements(request.payload, null);
    if(typeof chrome !== "undefined"){
        // Request our background script to upload it for us
        chrome.extension.sendMessage(request);
    }
    clearNotifications();
    window.close();
    /*var sectionRate = document.getElementById("sectionRate");
    var sectionSendingMood = document.getElementById("sectionSendingMood");
    sectionRate.className = "invisible";
    setTimeout(function()
    {
    		sectionRate.style.display = "none";
    		sectionSendingMood.innerText = "Sending mood";
    		sectionSendingMood.style.display = "block";
    		sectionSendingMood.className = "visible";
    		pushMeasurement(measurement, function(response)
    			{
    				sectionSendingMood.className = "invisible";
    				setTimeout(function()
    				{
    					window.close();
    				}, 300);
    			});
    		clearNotifications();
    	}, 400 );*/
};
document.addEventListener('DOMContentLoaded', function() {
    var wDiff = (380 - window.innerWidth);
    var hDiff = (70 - window.innerHeight);
    window.resizeBy(wDiff, hDiff);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", getApiUrl() + "/api/user/me", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var userObject = JSON.parse(xhr.responseText);
            /*
             * it should hide and show sign in button based upon if the user is logged in or not
             */
            if (typeof userObject.displayName !== "undefined") {
                console.debug(userObject.displayName + " is logged in.  ");
            } else {
                var url = getApiUrl() + "/api/v2/auth/login";
                chrome.tabs.create({"url": url, "selected": true});
            }
        }
    };
    xhr.send();
    setFaceButtonListeners();
});