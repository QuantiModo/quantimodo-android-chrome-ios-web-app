var config = {};

config.appSettings  = {
    appDisplayName : 'MediModo',
    lowercaseAppName : 'medimodo',
    appDescription : "Better health through data.",
    appleId: "1115037661",
    "appIdentifier": "com.quantimodo.medimodo",
    ionicAppId: 'e85b92b4',
    apiUrl : 'https://app.quantimo.do',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/nojnjdgmjaejpnpehgioddbimopnblga",
    allowOffline : false,
    shoppingCartEnabled : false,
    qmApiHostName: 'app.quantimo.do',
    appStorageIdentifier: 'MediModoData*',
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.login',
    settingsPageOptions :
        {
            showReminderFrequencySelector : false
        },
    headline : 'Medications - Track, Learn, Connect',
    features: [
        ' Follow These Quick Steps to Improve Your Health',
        ' 1. Enter Your Medications',
        ' 2. Record "How I Feel" Responses',
        ' 3. Create Reports of Your Responses and Choose to Connect With Your Doctors'
    ],
    welcomeText:"Let's start off by adding your first medication!",
    primaryOutcomeVariableTrackingQuestion:"How are you",
    primaryOutcomeVariableAverageText:"Your average mood is ",
    mobileNotificationImage : "file://img/icons/icon_128.png",
    mobileNotificationText : "Time to track!",
    backgroundColor: "white",
    helpPopupMessages : {
        "#/app/example": 'If you\'ve already added some side effect or response tracking reminders, here\'s where your medication notifications should appear when it\'s time to take them.  Once you have some notifications, you can use those to record how you feel.',
    },
    wordAliases : {
    },
    remindersInbox : {
        showAddNewMedicationButton : true,
        hideAddNewReminderButton : true,
        showAddHowIFeelResponseButton : true,
        showAddVitalSignButton : true,
        title : 'Reminder Inbox'
    },
    remindersManage : {
        hideAddNewReminderButton : true
    },
    floatingMaterialButton : {
        button1 : {
            icon: 'ion-android-notifications-none',
            label: 'Add a Reminder',
            stateAndParameters: "'app.reminderSearch'"
        },
        button2 : {
            icon: 'ion-compose',
            label: 'Record a Measurement',
            stateAndParameters: "'app.measurementAddSearch'"
        },
        button3 : {
            icon: 'ion-ios-medkit-outline',
            label: 'Record a Dose',
            stateAndParameters: "'app.measurementAddSearch', {variableCategoryName: 'Treatments'}"
        },
        button4 : {
            icon: 'ion-sad-outline',
            label: 'Rate a Symptom',
            stateAndParameters: "'app.measurementAddSearch', {variableCategoryName: 'Symptoms'}"
        }
    },
    defaultReminders : [
        {
            variableName : 'Heart Rate (Pulse)',
            defaultValue :  null,
            unitAbbreviatedName: 'bpm',
            reminderFrequency : 0,
            icon: 'ion-heart',
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Blood Pressure',
            icon: 'ion-heart',
            unitAbbreviatedName: 'mmHg',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Core Body Temperature',
            icon: null,
            unitAbbreviatedName: 'C',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Oxygen Saturation',
            icon: null,
            unitAbbreviatedName: '%',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Respiratory Rate (Ventilation/Breath/RR/Respiration)',
            icon: null,
            unitAbbreviatedName: '/minute',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Weight',
            icon: null,
            unitAbbreviatedName: 'lb',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Physique'
        },
        {
            variableName: 'Height',
            icon: null,
            unitAbbreviatedName: 'cm',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Physique'
        },
        {
            variableName: 'Body Mass Index or BMI',
            icon: null,
            unitAbbreviatedName: 'index',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Physique'
        },
        {
            variableName: 'Blood Glucose Sugar',
            icon: null,
            unitAbbreviatedName: 'mg/dL',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        }
    ],
    minimalMenu : [
        {
            title : 'Reminder Inbox',
            href : '#/app/reminders-inbox',
            icon : 'ion-archive'
        },
        {
            title : 'Your Medications',
            href : '#/app/reminders-list/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Symptoms',
            href : '#/app/reminders-list/Symptoms',
            icon : 'ion-sad-outline'
        },
        {
            title : 'Vital Signs',
            href : '#/app/reminders-list/Vital Signs',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Emotions',
            href : '#/app/reminders-list/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Foods',
            href : '#/app/reminders-list/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Physical Activity',
            href : '#/app/reminders-list/Physical Activity',
            icon : 'ion-ios-body-outline'
        },
        {
            title : 'History',
            click : 'toggleHistorySubMenu',
            showSubMenuVariable : 'showHistorySubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-list-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'All Measurements',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Anything',
            icon : 'ion-android-globe'
        },
        {
            title : 'Emotions',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Foods',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Symptoms',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Symptoms',
            icon : 'ion-sad-outline'
        },
        {
            title : 'Treatments',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Physical Activity',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Physical Activity',
            icon : 'ion-ios-body-outline'
        },
        {
            title : 'Vital Signs',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Vital Signs',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Locations',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all/Location',
            icon : 'ion-ios-location-outline'
        },
        {
            title : 'Import Data',
            href : '#/app/import',
            icon : 'ion-ios-cloud-download-outline'
        },
        {
            title : 'Relationships',
            click : 'togglePredictorSearchSubMenu',
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-analytics',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Predictor Search',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            href : '#/app/predictor-search',
            icon : 'ion-log-in'
        },
        {
            title : 'Outcome Search',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            href : '#/app/outcome-search',
            icon : 'ion-log-out'
        },
        {
            title : 'Settings',
            href : '#/app/settings',
            icon : 'ion-ios-gear-outline'
        },
    ]
};

if(!module){
    var module = {};
}

module.exports = config.appSettings;