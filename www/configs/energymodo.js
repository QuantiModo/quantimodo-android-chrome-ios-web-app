var config = {};

config.appSettings  = {
    appDisplayName : 'EnergyModo',
    versionNumber: "IONIC_APP_VERSION_NUMBER_PLACEHOLDER",
    lowercaseAppName : 'energymodo',
    appDescription : "Track and find out what affects your energy levels",
    appleId: null,
    "appIdentifier": "com.quantimodo.energymodo",
    ionicAppId: 'f837bb35',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/ncfgnobloleophhanefmkmpclbakoakh",
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.welcome',
    appStorageIdentifier: 'EnergyModoData*',
    headline : 'Sync and Analyze Your Data',
    primaryOutcomeVariableName : "Energy Rating",
    welcomeText:"Let's start off by reporting your energy below",
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
