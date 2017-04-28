var config = {};

config.appSettings  = {
    appDisplayName : 'MediModo',
    versionNumber: "IONIC_APP_VERSION_NUMBER_PLACEHOLDER",
    lowercaseAppName : 'medimodo',
    appDescription : "Better health through data.",
    appleId: "1115037661",
    googleAnalyticsId: "UA-39222734-28",
    "appIdentifier": "com.quantimodo.medimodo",
    ionicAppId: 'e85b92b4',
    apiUrl : 'https://app.quantimo.do',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/nojnjdgmjaejpnpehgioddbimopnblga",
    appStorageIdentifier: 'MediModoData*',
    defaultState : 'app.remindersInbox',
    floatingActionButtonColor: null,
    welcomeState : 'app.login',
    headline : 'Medications - Track, Learn, Connect',
    features: [
        ' Follow These Quick Steps to Improve Your Health',
        ' 1. Enter Your Medications',
        ' 2. Record "How I Feel" Responses',
        ' 3. Create Reports of Your Responses and Choose to Connect With Your Doctors'
    ],
    welcomeText:"Let's start off by adding your first medication!",
    mobileNotificationText : "Time to track!",
    backgroundColor: "white",
    wordAliases : {
    },
    remindersInbox : {
        title : 'Reminder Inbox'
    },
    remindersManage : {
    },
    //defaultRemindersType: 'medication',
    appType: 'medication',
    menuType : 'minimal',
    onboardingPages: [
        {
            id: "addEmotionRemindersCard",
            ngIfLogic: "stateParams.showHelpCards === true && !hideAddEmotionRemindersCard",
            title: 'Varying Emotions?',
            color: "green",
            variableCategoryName: "Emotions",
            addButtonText: 'Add Emotion',
            nextPageButtonText: 'Maybe Later',
            bodyText: "Do you have any emotions that fluctuate regularly? <br> <br> If so, add them so I can try to " +
            "determine which factors are influencing them.",
        },
        {
            id: "addSymptomRemindersCard",
            title: 'Recurring Symptoms?',
            color: "blue",
            variableCategoryName: "Symptoms",
            addButtonText: 'Add Symptom',
            nextPageButtonText: 'Maybe Later',
            bodyText: 'Got any recurring symptoms that vary in their severity?'
        },
        {
            id: "addFoodRemindersCard",
            ngIfLogic: "stateParams.showHelpCards === true && !hideAddFoodRemindersCard",
            title: 'Common Foods or Drinks?',
            color: "blue",
            variableCategoryName: "Foods",
            addButtonText: 'Add Food or Drink',
            nextPageButtonText: 'Maybe Later',
            bodyText: "Add any foods or drinks that you consume more than a few times a week"
        },
        {
            id: "addTreatmentRemindersCard",
            title: 'Any Treatments?',
            color: "yellow",
            variableCategoryName: "Treatments",
            addButtonText: 'Add Treatment',
            nextPageButtonText: 'Maybe Later',
            bodyText: 'Are you taking any medications, treatments, supplements, or other interventions ' +
            'like meditation or psychotherapy? '
        },
        {
            id: "locationTrackingPage",
            title: 'Location Tracking',
            color: "green",
            variableCategoryName: "Location",
            premiumFeature: true,
            nextPageButtonText: 'Maybe Later',
            bodyText: "Would you like to automatically log location to see how time spent at restaurants, " +
            "the gym, work or doctors offices might be affecting you? "
        },
        {
            id: "weatherTrackingPage",
            title: 'Weather Tracking',
            color: "green",
            variableCategoryName: "Environment",
            premiumFeature: true,
            nextPageButtonText: 'Maybe Later',
            bodyText: "Would you like to automatically record the weather to see how temperature or sunlight " +
            "exposure might be affecting you? "
        },
        {
            id: "importDataPage",
            title: 'Import Your Data',
            color: "yellow",
            iconClass: "icon positive ion-ios-cloud-download-outline",
            image: {
                url: "img/intro/download_2-96.png",
                height: "96",
                width: "96"
            },
            premiumFeature: true,
            bodyText: "Let's go to the Import Data page and see if you're using any of the dozens of apps and " +
            "devices that I can automatically pull data from!",
            nextPageButtonText: "Maybe Later"
        },
        {
            id: "allDoneCard",
            ngIfLogic: "stateParams.showHelpCards === true && !hideImportDataCard",
            title: 'Great job!',
            color: "green",
            iconClass: "icon positive ion-ios-cloud-download-outline",
            image: {
                url: "img/robots/quantimodo-robot-waving.svg",
                height: "120",
                width: "120"
            },
            bodyText: "You're all set up!  Let's take a minute to record your first measurements and then " +
            "you're done for the day! "
        }
    ]
};

if(!module){var module = {};}
module.exports = config.appSettings;