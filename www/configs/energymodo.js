var config = {};

config.appSettings  = {
    appDisplayName : 'EnergyModo',
    lowercaseAppName : 'energymodo',
    appDescription : "Track and find out what affects your energy levels",
    appleId: null,
    "appIdentifier": "com.quantimodo.energymodo",
    ionicAppId: 'f837bb35',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/ncfgnobloleophhanefmkmpclbakoakh",
    allowOffline : true,
    loaderImagePath : 'img/loaders/pop_tart_cat.gif',
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.welcome',
    shoppingCartEnabled : true,
    qmApiHostName: 'app.quantimo.do',
    appStorageIdentifier: 'EnergyModoData*',
    settingsPageOptions : {showReminderFrequencySelector : true},
    headline : 'Sync and Analyze Your Data',
    primaryOutcomeVariableName : "Energy Rating",
    welcomeText:"Let's start off by reporting your energy below",
    primaryOutcomeVariableTrackingQuestion:"How is your energy level right now?",
    primaryOutcomeVariableAverageText:"Your average energy level is ",
    mobileNotificationImage : "file://img/icons/icon_128.png",
    mobileNotificationText : "Time to track!",
    "intro" : null,
    helpPopupMessages : {
        "#/app/example": 'You can see and edit your past energy ratings and notes by tapping on any item in the list.  <br/> <br/>You can also add a note by tapping on a Energy rating in the list.',
    },
    remindersInbox : {},
    wordAliases : {},
    menuType : 'extended'
};

if(!module){
    var module = {};
}

module.exports = config.appSettings;
