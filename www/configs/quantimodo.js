var config = {};

config.appSettings = {
    "appDisplayName" : "QuantiModo",
    "lowercaseAppName" : "quantimodo",
    "appDescription" : "Perfect your life!",
    "appleId": "1115037060",
    "appIdentifier": "com.quantimodo.quantimodo",
    "ionicAppId": "42fe48d4",
    "ionNavBarClass" : "bar-positive",
    "cordovaLocalNotificationsEnabled" : false,
    "linkToChromeExtension" : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/jioloifallegdkgjklafkkbniianjbgi",
    "defaultState" : "app.remindersInbox",
    "welcomeState" : "app.welcome",
    "appStorageIdentifier": "QuantiModoData*",
    "headline" : "Sync and Analyze Your Data",
    "features": [
        " - Automatically backup and sync your data across devices",
        " - Track diet, treatments, symptoms, and anything else",
        " - Analyze your data to see the strongest predictors of your mood"
    ],
    "welcomeText" : "Let's start off by reporting your first mood below",
    "primaryOutcomeVariableTrackingQuestion" : "How are you?",
    "primaryOutcomeVariableAverageText" : "Your average mood is ",
    "mobileNotificationImage" : "file://img/icons/icon_128.png",
    "mobileNotificationText" : "Time to track!",
    "backgroundColor": "#3467d6",
    "intro" : null,
    "remindersInbox" : {},
    "wordAliases" : {},
    "menuType" : 'extended'
};

if(!module){var module = {};}
module.exports = config.appSettings;