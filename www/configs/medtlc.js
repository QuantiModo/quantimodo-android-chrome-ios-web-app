
var getPlatform = function(){
    if(typeof ionic !== "undefined" &&
        typeof ionic.Platform !== "undefined" &&
        typeof ionic.Platform.isIOS !== "undefined" &&
        typeof ionic.Platform.isAndroid !== "undefined" )
    {
        return ionic.Platform.isIOS()? "iOS" : ionic.Platform.isAndroid()? "Android" : "Web";
    }
    else {
        return "Ionic";
    }
};

window.config = {
    bugsnag:{
        notifyReleaseStages:['Production','Staging']
    },
    clientSourceName : "MedTLC " + getPlatform(),
    domain : 'app.quantimo.do',
    environment: "Development",
    permissions : ['readmeasurements', 'writemeasurements'],
    port : '4417',
    protocol : 'https',
    shoppingCartEnabled : true
};

config.appSettings  = {
    appName : 'MedTLC',
    allowOffline : false,

    primaryOutcomeVariable : 'Mood',

    appStorageIdentifier: 'MedTLCData*',

    defaultState : 'app.remindersInbox',

    welcomeState : 'app.remindersInbox',

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

    primaryOutcomeVariableDetails : {
        id : 1398,
        name : "Overall Mood",
        category : "Mood",
        abbreviatedUnitName : "/5",
        unitId : 10,
        combinationOperation: "MEAN",
        description: 'positive'
    },

    primaryOutcomeVariableRatingOptionLabels : [
        'Depressed',
        'Sad',
        'OK',
        'Happy',
        'Ecstatic'
    ],

    welcomeText:"Let's start off by adding your first medication!",
    primaryOutcomeVariableTrackingQuestion:"How are you",
    primaryOutcomeVariableAverageText:"Your average mood is ",
    mobileNotificationImage : "file://img/icons/icon_128.png",
    mobileNotificationText : "Time to Track",
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

    intro : [
        // screen 1
        {
            img : {
                width : '150',
                height : '150',
                url : 'img/icons/icon.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Welcome to MedTLC',
                    classes : 'intro-header positive'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP : {
                    visible : true,
                    content : 'Medication - Track. Learn. Connect.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true   
                }
            }
        },
        {
            img : {
                width : '180',
                height : '180',
                url : 'img/pill_icon.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Medications',
                    classes : 'intro-header positive'
                },
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Add medications on the Add Medications page.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        {
            // Add icons instead of screen-shot
            img : {
                width : '180',
                height : '180',
                url : 'img/symptoms_icon.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Record How You Feel',
                    classes : 'intro-header positive'
                },

                logoDiv : {
                    visible : true,
                    id : 'logo'
                },

                finalP: {
                    visible : true,
                    content : ' Record "How I Feel" responses to provide critical feedback to your doctor. This feedback is one of the strongest features of MedTLC. It gives your doctor the data needed to change medications and adjust dosages when necessary, due to adverse reaction to a single drug, multiple drug interactions, and dosages that cause unwanted effects.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        {
            img : {
                width : '180',
                height : '180',
                url : 'img/doctor_icon.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Connect with Your Physician',
                    classes : 'intro-header positive'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Print or send reports of your responses to your doctors.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                }
            }
        }
    ],

    helpPopupMessages : {
        "#/app/reminders-inbox/Treatments": 'Be sure to add your "How I feel" responses throughout the day so you can monitor the effects of your medications and dosages.',
        "#/app/reminders-inbox/Symptoms": 'If you\'ve already added some side effect or response tracking reminders, here\'s where your medication notifications should appear when it\'s time to take them.  Once you have some notifications, you can use those to record how you feel.',
        "#/app/reminders-manage/Treatments": 'Here, you can set up or delete existing medications.',
        "#/app/reminders-manage/Symptoms": 'Here, you can set up or delete existing side effect tracking or response tracking reminders.',
        "#/app/reminders-manage": 'Here, you can create, modify or delete existing medications.',
        "#/app/reminders-inbox": 'Be sure to add your "How I feel" responses throughout the day so you can monitor the effects of your medications and dosages.',
        "#/app/history": 'You can see and edit your past data and add notes by tapping on any item in the list.',
        "#/app/track_factors_category/Foods": 'Record your diet on this page. <span class="positive">Add a new Food Variable</span> if you do not find the meal you looked for in the search results.',
        "#/app/track_factors_category/Symptoms": 'You can immediately record any response or side effect on this page.',
        "#/app/track_factors_category/Treatments": 'You can immediately record any as-need treatment on this page. You can also <span class="positive">Add a new Treatment</span> if you don\'t find the treatment you looked for in the search results.',
    },
    
    wordAliases : {
        "Treatments" : "Medications",
        "treatments" : "medications",
        "Treatment" : "Medication",
        "treatment" : "medication",
        "Treatment Reminder" : "Medication",
        "treatment reminder" : "medication",
        "Reminder Inbox" : "Reminders",
        "Track" : "Record",
        "Symptom" : "Response",
        "Symptoms" : "Responses",
        "symptom" : "response",
        "symptoms" : "responses"
    },
    
    remindersInbox : {
        showAddNewMedicationButton : true,
        hideAddNewReminderButton : true,
        showAddHowIFeelResponseButton : true,
        showAddVitalSignButton : true,
        title : 'Reminders'
    },

    remindersManage : {
        hideAddNewReminderButton : true
    },

    floatingMaterialButton : {
        button1 : {
            icon: 'ion-happy-outline',
            label: 'How are you?',
            stateAndParameters: "'app.track'"
        },
        button2 : {
            icon: 'ion-ios-medkit-outline',
            label: 'Add a medication',
            stateAndParameters: "'app.reminderAddCategory', {variableCategoryName : 'Treatments'}"
        },
        button3 : {
            icon: 'ion-ios-pulse',
            label: 'Add Vital Sign',
            stateAndParameters: "'app.track_factors_category', {variableCategoryName : 'Vital Signs'}"
        },
        button4 : {
            icon: 'ion-heart-broken',
            label: 'Record a Symptom',
            stateAndParameters: "'app.track_factors_category', {variableCategoryName : 'Symptoms'}"
        }
    },

    menu : [
        {
            title : 'Add How I Feel Response',
            href : '#/app/track_factors_category/Symptoms',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Add Vitals Measurement',
            href : '#/app/track_factors_category/Vital Signs',
            icon : 'ion-ios-pulse'
        },
        {
            title : "Today's Meds",
            href : '#/app/reminders-inbox-today/Treatments',
            icon : 'ion-android-sunny'
        },
        {
            title : 'Show Reminders',
            href : '#/app/reminders-inbox',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Add Medications',
            href : '#/app/reminder_add/Treatments',
            icon : 'ion-ios-alarm-outline'
        },
        {
            title : 'Manage Medications',
            href : '#/app/reminders-manage/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'History',
            href : '#/app/history-all',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Getting Started',
            href : '#/app/intro',
            icon : 'ion-information-circled'
        },
        {
            title : 'Reminders',
            click : 'toggleReminderSubMenu',
            showSubMenuVariable : 'showReminderSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-chevron-right',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Inbox',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-inbox',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Manage',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage',
            icon : 'ion-ios-gear-outline'
        },
        {
            title : 'Emotions',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Responses',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Symptoms',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Treatments',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Foods',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Import Data',
            href : '#/app/import',
            icon : 'ion-ios-cloud-download-outline'
        },
        {
            title : 'Settings',
            href : '#/app/settings',
            icon : 'ion-ios-gear-outline'
        }
    ]

};

config.getEnv = function(){

    var env = "";

    if(window.location.origin.indexOf('local')> -1){
        //On localhost
        env = "Development";
    }
    else if(window.location.origin.indexOf('file://')){
        env = this.environment;
    }
    else if(window.location.origin.indexOf('staging.quantimo.do') > -1){
        env = "Staging";
    }
    else if(window.location.origin.indexOf('app.quantimo.do')){
        env = "Production";
    }

    return env;
};

config.getClientId = function(){
    //if chrome app
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.client_ids.Chrome;
    } else {
        var platform = getPlatform();
        return platform === "Ionic"? window.private_keys.client_ids.Web : platform === "Web"? window.private_keys.client_ids.Web : platform === "iOS"? window.private_keys.client_ids.iOS : window.private_keys.client_ids.Android;
    }
};

config.getClientSecret = function(){
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.client_secrets.Chrome;
    } else {
        var platform = getPlatform();
        return platform === "Ionic"? window.private_keys.client_secrets.Web : platform === "Web"? window.private_keys.client_secrets.Web : platform === "iOS"? window.private_keys.client_secrets.iOS : window.private_keys.client_secrets.Android;
    }
};

config.getRedirectUri = function(){
    if(!window.private_keys.redirect_uris){
        return 'https://app.quantimo.do/ionic/Modo/www/callback/';
    }
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.redirect_uris.Chrome;
    } else {
        var platform = getPlatform();
        return platform === "Ionic"? window.private_keys.redirect_uris.Web : platform === "Web"? window.private_keys.redirect_uris.Web : platform === "iOS"? window.private_keys.redirect_uris.iOS : window.private_keys.redirect_uris.Android;
    }
};

config.getApiUrl = function(){
    if(!window.private_keys.api_urls){
        return 'https://app.quantimo.do';
    }
    var platform = getPlatform();
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.api_urls.Chrome;
    } else if (platform === 'Web' && window.private_keys.client_ids.Web === 'oAuthDisabled') {
        return window.location.origin;
    } else {
        return platform === "Ionic"? window.private_keys.api_urls.Web : platform === "Web"? window.private_keys.api_urls.Web : platform === "iOS"? window.private_keys.api_urls.iOS : window.private_keys.api_urls.Android;
    }
};

config.getAllowOffline = function(){
    return false;
};

config.getPermissionString = function(){

    var str = "";
    for(var i=0; i < config.permissions.length; i++) {
        str += config.permissions[i] + "%20";
    }
    return str.replace(/%20([^%20]*)$/,'$1');

};

config.getURL = function(path){
    if(typeof path === "undefined") {
        path = "";
    }
    else {
        path += "?";
    }

    var url = "";

    if(config.getApiUrl() !== "undefined") {
        url = config.getApiUrl() + "/" + path;
    }
    else 
    {
        url = config.protocol + "://" + config.domain + "/" + path;
    }

    return url;
};

config.get = function(key){
	return config[key]? config[key] : false;
};


window.notification_callback = function(reportedVariable, reportingTime){
    var startTime  = Math.floor(reportingTime/1000) || Math.floor(new Date().getTime()/1000);
    var keyIdentifier = config.appSettings.appStorageIdentifier;
    var val = false;

    // convert values
    if(reportedVariable === "repeat_rating"){
        val = localStorage[keyIdentifier+'lastReportedPrimaryOutcomeVariableValue']?
        JSON.parse(localStorage[keyIdentifier+'lastReportedPrimaryOutcomeVariableValue']) : false;
    } else {
        val = config.appSettings.ratingTextToValueConversionDataSet[reportedVariable]?
        config.appSettings.ratingTextToValueConversionDataSet[reportedVariable] : false;
    }

    // report
    if(val){
        // update localstorage
        localStorage[keyIdentifier+'lastReportedPrimaryOutcomeVariableValue'] = val;

        var allMeasurementsObject = {
            storedValue : val,
            value : val,
            startTime : startTime,
            humanTime : {
                date : new Date().toISOString()
            }
        };

        // update full data
        if(localStorage[keyIdentifier+'allMeasurements']){
            var allMeasurements = JSON.parse(localStorage[keyIdentifier+'allMeasurements']);
            allMeasurements.push(allMeasurementsObject);
            localStorage[keyIdentifier+'allMeasurements'] = JSON.stringify(allMeasurements);
        }

        //update measurementsQueue
        if(!localStorage[keyIdentifier+'measurementsQueue']){
            localStorage[keyIdentifier+'measurementsQueue'] = '[]';
        } else {
            var measurementsQueue = JSON.parse(localStorage[keyIdentifier+'measurementsQueue']);
            measurementsQueue.push(allMeasurementsObject);
            localStorage[keyIdentifier+'measurementsQueue'] = JSON.stringify(measurementsQueue);
        }
    }
};