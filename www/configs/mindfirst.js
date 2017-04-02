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
    primaryOutcomeVariableDetails : {
        id : 1398,
        name : "Overall Mood",
        variableName: "Overall Mood",
        variableCategoryName : "Mood",
        unitAbbreviatedName : "/5",
        combinationOperation: "MEAN",
        description: 'positive',
        unitName: '1 to 5 Rating'
    },
    primaryOutcomeVariableRatingOptionLabels : [
        'Depressed',
        'Sad',
        'OK',
        'Happy',
        'Ecstatic'
    ],
    primaryOutcomeVariableRatingOptionLowercaseLabels : [
        'depressed',
        'sad',
        'ok',
        'happy',
        'ecstatic'
    ],
    welcomeText:"Let's start off by reporting your first mood below",
    primaryOutcomeVariableTrackingQuestion:"How are you?",
    primaryOutcomeVariableAverageText:"Your average mood is ",
    mobileNotificationImage : "file://img/icons/icon_128.png",
    mobileNotificationText : "Time to track!",
    ratingValueToTextConversionDataSet: {
        "1": "depressed",
        "2": "sad",
        "3": "ok",
        "4": "happy",
        "5": "ecstatic"
    },
    ratingTextToValueConversionDataSet : {
        "depressed" : 1,
        "sad" : 2,
        "ok" : 3,
        "happy" : 4,
        "ecstatic": 5
    },
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
