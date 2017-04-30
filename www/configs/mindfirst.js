var config = {};

config.appSettings  = {
    appDisplayName : 'Mind First Mood Tracker',
    versionNumber: "IONIC_APP_VERSION_NUMBER_PLACEHOLDER",
    lowercaseAppName : 'mindfirst',
    appDescription : "Empowering a new approach to mind research",
    appleId: "1024924226",
    "appIdentifier": "com.quantimodo.mindfirst",
    ionicAppId: '6d8e312f',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/koghchdnkopobpmmhfelgmfelcjichhh",
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.welcome',
    appStorageIdentifier: 'MindFirstData*',
    headline : 'Sync and Analyze Your Data',
    features: [
        ' - Automatically backup and sync your data across devices',
        ' - Track diet, treatments, symptoms, and anything else',
        ' - Analyze your data to see the strongest predictors of your mood'
    ],
    welcomeText:"Let's start off by reporting your first mood below",
    mobileNotificationText : "Time to track!",
    "intro": null,
    remindersInbox : {},
    wordAliases : {},
    menuType : 'extended'
};

if(!module){
    var module = {};
}

module.exports = config.appSettings;
