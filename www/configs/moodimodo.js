var config = {};

config.appSettings  = {
    "appDisplayName" : "MoodiModo",
    "lowercaseAppName" : "moodimodo",
    "appDescription" : "Perfect your life!",
    "appleId": "1046797567",
    "appIdentifier": "com.quantimodo.moodimodoapp",
    upgradeDisabled: true,
    "ionicAppId": "470c1f1b",
    "cordovaLocalNotificationsEnabled" : false,
    "linkToChromeExtension" : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/lncgjbhijecjdbdgeigfodmiimpmlelg",
    "defaultState" : "app.remindersInbox",
    "welcomeState" : "app.welcome",
    "appStorageIdentifier": "MoodiModoData*",
    "headline" : "Sync and Analyze Your Data",
    "features": [
        " - Automatically backup and sync your data across devices",
        " - Track diet, treatments, symptoms, and anything else",
        " - Analyze your data to see the strongest predictors of your mood"
    ],
    "welcomeText" : "Let's start off by reporting your first mood below",
    "mobileNotificationText" : "Time to track!",
    "backgroundColor": "#3467d6",
    "intro" : null,
    "remindersInbox" : {},
    "wordAliases" : {},
    "menuType" : 'extended'
};

if(!module){
    var module = {};
}

module.exports = config.appSettings;
