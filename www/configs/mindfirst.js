var config = {};

config.appSettings  = {
    appDisplayName : 'Mind First Mood Tracker',
    lowercaseAppName : 'mindfirst',
    appDescription : "Empowering a new approach to mind research",
    appleId: "1024924226",
    "appIdentifier": "com.quantimodo.mindfirst",
    ionicAppId: '6d8e312f',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/koghchdnkopobpmmhfelgmfelcjichhh",
    allowOffline : true,
    loaderImagePath : 'img/loaders/pop_tart_cat.gif',
    defaultState : 'app.remindersInbox',
    qmApiHostName: 'app.quantimo.do',
    welcomeState : 'app.welcome',
    settingsPageOptions : {
        showReminderFrequencySelector : true
    },
    appStorageIdentifier: 'MindFirstData*',
    headline : 'Sync and Analyze Your Data',
    features: [
        ' - Automatically backup and sync your data across devices',
        ' - Track diet, treatments, symptoms, and anything else',
        ' - Analyze your data to see the strongest predictors of your mood'
    ],
    welcomeText:"Let's start off by reporting your first mood below",
    primaryOutcomeVariableTrackingQuestion:"How are you?",
    primaryOutcomeVariableAverageText:"Your average mood is ",
    mobileNotificationImage : "file://img/icons/icon_128.png",
    mobileNotificationText : "Time to track!",
    "intro" : null,
    helpPopupMessages : {
        "#/app/example" : 'You can see and edit your past mood ratings and notes by tapping on any item in the list.  <br/> <br/>You can also add a note by tapping on a mood rating in the list.',
    },
    remindersInbox : {
    },
    wordAliases : {
    },
    menuType : 'extended'
};

if(!module){
    var module = {};
}

module.exports = config.appSettings;
