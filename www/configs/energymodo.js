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
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.welcome',
    shoppingCartEnabled : true,
    appStorageIdentifier: 'EnergyModoData*',
    headline : 'Sync and Analyze Your Data',
    primaryOutcomeVariableName : "Energy Rating",
    welcomeText:"Let's start off by reporting your energy below",
    primaryOutcomeVariableTrackingQuestion:"How is your energy level right now?",
    primaryOutcomeVariableAverageText:"Your average energy level is ",
    mobileNotificationImage : "file://img/icons/icon_128.png",
    mobileNotificationText : "Time to track!",
    "intro" : null,
    remindersInbox : {},
    wordAliases : {},
    menuType : 'extended'
};

if(!module){
    var module = {};
}

module.exports = config.appSettings;
