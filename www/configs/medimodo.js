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

    primaryOutcomeVariableDetails : {
        id : 1398,
        name : "Overall Mood",
        variableName: "Overall Mood",
        variableCategoryName : "Mood",
        abbreviatedUnitName : "/5",
        unitId : 10,
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

    positiveRatingImages : [
        'img/rating/ic_face_depressed.png',
        'img/rating/ic_face_sad.png',
        'img/rating/ic_face_ok.png',
        'img/rating/ic_face_happy.png',
        'img/rating/ic_face_ecstatic.png'
    ],

    negativeRatingImages : [
        'img/rating/ic_face_ecstatic.png',
        'img/rating/ic_face_happy.png',
        'img/rating/ic_face_ok.png',
        'img/rating/ic_face_sad.png',
        'img/rating/ic_face_depressed.png'
    ],

    numericRatingImages : [
        'img/rating/ic_1.png',
        'img/rating/ic_2.png',
        'img/rating/ic_3.png',
        'img/rating/ic_4.png',
        'img/rating/ic_5.png'
    ],

    welcomeText:"Let's start off by adding your first medication!",
    primaryOutcomeVariableTrackingQuestion:"How are you",
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
    backgroundColor: "white",

    introOld : [
        {
            img : {
                "width" : "250",
                "height" : "250",
                "url" : "img/intro/intro_import.png"
            },
            "textColor": "white",
            "backgroundColor": "#3467d6",
            "content" : {
                "firstParagraph" : {
                    "visible" : true,
                    "content" : "Welcome to MediModo",
                    "classes" : "intro-header"
                },
                "logoDiv" : {
                    "visible" : true,
                    "id" : "logo"
                },
                "finalParagraph" : {
                    "visible" : true,
                    "content" : "Better health through data.",
                    "classes" : "intro-paragraph",
                    "buttonBarVisible" : true
                }
            }
        },
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/intro/pill_icon.png'
            },
            textColor: 'white',
            backgroundColor: '#0f9d58',
            content : {
                firstParagraph : {
                    visible : true,
                    content : 'Medications',
                    classes : 'intro-header positive'
                },
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalParagraph: {
                    visible : true,
                    content : 'Add medications reminders and record your intake.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        {
            // Add icons instead of screen-shot
            img : {
                width : '250',
                height : '250',
                url : 'img/intro/symptoms_icon.png'
            },
            textColor: 'white',
            backgroundColor: '#f09402',
            content : {

                firstParagraph : {
                    visible : true,
                    content : 'Record How You Feel',
                    classes : 'intro-header positive'
                },

                logoDiv : {
                    visible : true,
                    id : 'logo'
                },

                finalParagraph: {
                    visible : true,
                    content : 'Record "How I Feel" responses to provide critical feedback to your doctor. This gives your doctor the data needed to change medications and adjust dosages when necessary.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/intro/doctor_icon.png'
            },
            textColor: 'white',
            backgroundColor: '#3467d6',
            content : {
                firstParagraph : {
                    visible : true,
                    content : 'Connect with Your Physician',
                    classes : 'intro-header positive'
                },
                textColor: 'black',
                backgroundColor: 'white',
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalParagraph: {
                    visible : true,
                    content : 'Print or send reports of your treatments and responses to your doctors.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                }
            }
        }
    ],

    helpPopupMessages : {
        "#/app/example": 'If you\'ve already added some side effect or response tracking reminders, here\'s where your medication notifications should appear when it\'s time to take them.  Once you have some notifications, you can use those to record how you feel.',
    },

    wordAliases : {
        //"Treatments" : "Medications",
        //"treatments" : "medications",
        //"Treatment" : "Medication",
        //"treatment" : "medication",
        //"Treatment Reminder" : "Medication",
        //"treatment reminder" : "medication",
        //"Reminder Inbox" : "Reminders",
        //"Track" : "Record",
        //"Symptom" : "Response",
        //"Symptoms" : "Responses",
        //"symptom" : "response",
        //"symptoms" : "responses"
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
            abbreviatedUnitName: 'bpm',
            reminderFrequency : 0,
            icon: 'ion-heart',
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Blood Pressure',
            icon: 'ion-heart',
            abbreviatedUnitName: 'mmHg',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Core Body Temperature',
            icon: null,
            abbreviatedUnitName: 'C',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Oxygen Saturation',
            icon: null,
            abbreviatedUnitName: '%',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Respiratory Rate (Ventilation/Breath/RR/Respiration)',
            icon: null,
            abbreviatedUnitName: '/minute',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        },
        {
            variableName: 'Weight',
            icon: null,
            abbreviatedUnitName: 'lb',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Physique'
        },
        {
            variableName: 'Height',
            icon: null,
            abbreviatedUnitName: 'cm',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Physique'
        },
        {
            variableName: 'Body Mass Index or BMI',
            icon: null,
            abbreviatedUnitName: 'index',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Physique'
        },
        {
            variableName: 'Blood Glucose Sugar',
            icon: null,
            abbreviatedUnitName: 'mg/dL',
            reminderFrequency : 0,
            defaultValue :  null,
            variableCategoryName : 'Vital Signs'
        }
    ],

    menu : [
        {
            title : 'Your Medications',
            href : '#/app/reminders-manage/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Reminder Inbox',
            href : '#/app/reminders-inbox',
            icon : 'ion-archive'
        },
        {
            title : 'Overdue',
            href : '#/app/reminders-inbox/Treatments',
            icon : 'ion-clock'
        },
        {
            title : "Today's Schedule",
            href : '#/app/reminders-inbox-today/Treatments',
            icon : 'ion-android-sunny'
        },
        {
            title : 'As-Needed Meds',
            href : '#/app/as-needed-meds',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Record a Dose',
            href : '#/app/measurement-add-search-category/Treatments',
            icon : 'ion-edit'
        },
        {
            title : 'Med History',
            href : '#/app/history-all/Treatments',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Symptoms',
            click : 'toggleSymptomsSubMenu',
            icon : 'ion-ios-pulse',
            isSubMenuParent : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            collapsedIcon : 'ion-sad-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/reminders-manage/Symptoms',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Rate Symptom',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/measurement-add-search-category/Symptoms',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/history-all/Symptoms',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Favorites',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/favorites-category/Symptoms',
            icon : 'ion-ios-star'
        },
        {
            title : 'Charts',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/chart-search-category/Symptoms',
            icon : 'ion-arrow-graph-up-right'
        },
        {
            title : 'Vital Signs',
            click : 'toggleVitalSignsSubMenu',
            showSubMenuVariable : 'showVitalSignsSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-pulse',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showVitalSignsSubMenu',
            href : '#/app/reminders-manage/Vital Signs',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Now',
            isSubMenuChild : true,
            showSubMenuVariable : 'showVitalSignsSubMenu',
            href : '#/app/measurement-add-search-category/Vital Signs',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showVitalSignsSubMenu',
            href : '#/app/history-all/Vital Signs',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Favorites',
            isSubMenuChild : true,
            showSubMenuVariable : 'showVitalSignsSubMenu',
            href : '#/app/favorites-category/Vital Signs',
            icon : 'ion-ios-star'
        },
        {
            title : 'Charts',
            isSubMenuChild : true,
            showSubMenuVariable : 'showVitalSignsSubMenu',
            href : '#/app/chart-search-category/Vital Signs',
            icon : 'ion-arrow-graph-up-right'
        },
        {
            title : 'Physical Activity',
            click : 'togglePhysicalActivitySubMenu',
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-body-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/reminders-manage/Physical Activity',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Activity',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/measurement-add-search-category/Physical Activity',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/history-all/Physical Activity',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Favorites',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/favorites-category/Physical Activity',
            icon : 'ion-ios-star'
        },
        {
            title : 'Charts',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/chart-search-category/Physical Activity',
            icon : 'ion-arrow-graph-up-right'
        },
        {
            title : 'Emotions',
            click : 'toggleEmotionsSubMenu',
            showSubMenuVariable : 'showEmotionsSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-happy-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/reminders-manage/Emotions',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Rating',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/measurement-add-search-category/Emotions',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/history-all/Emotions',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Favorites',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/favorites-category/Emotions',
            icon : 'ion-ios-star'
        },
        {
            title : 'Charts',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/chart-search-category/Emotions',
            icon : 'ion-arrow-graph-up-right'
        },
        {
            title : 'Diet',
            click : 'toggleDietSubMenu',
            showSubMenuVariable : 'showDietSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-nutrition-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/reminders-manage/Foods',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Meal',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/measurement-add-search-category/Foods',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/history-all/Foods',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Favorites',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/favorites-category/Foods',
            icon : 'ion-ios-star'
        },
        {
            title : 'Charts',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/chart-search-category/Foods',
            icon : 'ion-arrow-graph-up-right'
        },
        {
            title : 'Favorites',
            href : '#/app/favorites',
            icon : 'ion-ios-star'
        },
        {
            title : 'Manage Reminders',
            click : 'toggleReminderSubMenu',
            showSubMenuVariable : 'showReminderSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-android-notifications-none',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'All Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Anything',
            icon : 'ion-android-globe'
        },
        {
            title : 'Emotions',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Foods',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Physical Activity',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Physical Activity',
            icon : 'ion-ios-body-outline'
        },
        {
            title : 'Symptoms',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Symptoms',
            icon : 'ion-sad-outline'
        },
        {
            title : 'Treatments',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Vital Signs',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Vital Signs',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Record Measurement',
            click : 'toggleTrackingSubMenu',
            showSubMenuVariable : 'showTrackingSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-compose',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Track Anything',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search',
            icon : 'ion-android-globe'
        },
        {
            title : 'Record a Meal',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search-category/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Rate an Emotion',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search-category/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Rate a Symptom',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search-category/Symptoms',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Record a Treatment',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search-category/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Record Activity',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search-category/Physical Activity',
            icon : 'ion-ios-body-outline'
        },
        {
            title : 'Record Vital Sign',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTrackingSubMenu',
            href : '#/app/measurement-add-search-category/Vital Signs',
            icon : 'ion-ios-pulse'
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
            title : 'Charts',
            click : 'toggleChartSearchSubMenu',
            showSubMenuVariable : 'showChartSearchSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-arrow-graph-up-right',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'All Variables',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Anything',
            icon : 'ion-android-globe'
        },
        {
            title : 'Emotions',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Foods',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Physical Activity',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Physical Activity',
            icon : 'ion-ios-body-outline'
        },
        {
            title : 'Symptoms',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Symptoms',
            icon : 'ion-sad-outline'
        },
        {
            title : 'Treatments',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Vital Signs',
            isSubMenuChild : true,
            showSubMenuVariable : 'showChartSearchSubMenu',
            href : '#/app/chart-search-category/Vital Signs',
            icon : 'ion-ios-pulse'
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
        /*        {
         title : 'For Everyone',
         isSubMenuChild : true,
         showSubMenuVariable : 'showPredictorSearchSubMenu',
         href : '#/app/search-common-relationships',
         icon : 'ion-ios-people'
         },
         {
         title : 'For You',
         isSubMenuChild : true,
         showSubMenuVariable : 'showPredictorSearchSubMenu',
         href : '#/app/search-user-relationships',
         icon : 'ion-person'
         },*/
        {
            title : 'Settings',
            href : '#/app/settings',
            icon : 'ion-ios-gear-outline'
        },
        {
            title : 'Help & Feedback',
            href : "#/app/feedback",
            icon : 'ion-ios-help-outline'
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
    ],

    edsMenu : [
        {
            title : 'Reminder Inbox',
            href : '#/app/reminders-inbox',
            icon : 'ion-archive'
        },
        {
            title : 'Add How I Feel Response',
            href : '#/app/measurement-add-search-category/Symptoms',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Add Vitals Measurement',
            href : '#/app/measurement-add-search-category/Vital Signs',
            icon : 'ion-ios-pulse'
        },
        {
            title : "Today's Meds",
            href : '#/app/reminders-inbox-today/Treatments',
            icon : 'ion-android-sunny'
        },
        {
            title : 'Add Medications',
            href : '#/app/reminder-search-category/Treatments',
            icon : 'ion-ios-alarm-outline'
        },
        {
            title : 'Manage Medications',
            href : '#/app/reminders-manage/Treatments',
            icon : 'ion-ios-medkit-outline'
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
            href : '#/app/reminders-manage/Anything',
            icon : 'ion-ios-gear-outline'
        },
        {
            title : 'Emotions',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Responses',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Symptoms',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Treatments',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Foods',
            isSubMenuChild : true,
            showSubMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Settings',
            href : '#/app/settings',
            icon : 'ion-ios-gear-outline'
        }
    ]

};

config.appSettings.menu = config.appSettings.minimalMenu;

if(!module){
    var module = {};
}

module.exports = config.appSettings;
