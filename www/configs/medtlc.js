window.config = {};

config.appSettings  = {
    appName : 'MedTLC',
    apiUrl : 'https://app.quantimo.do',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/nojnjdgmjaejpnpehgioddbimopnblga",
    allowOffline : false,
    shoppingCartEnabled : false,
    primaryOutcomeVariable : 'Mood',
    qmApiHostName: 'app.quantimo.do',
    appStorageIdentifier: 'MedTLCData*',

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
        category : "Mood",
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

    intro : [
        // screen 1
        {
            img : {
                width : '150',
                height : '150',
                url : 'img/icons/icon.png'
            },
            textColor: 'black',
            backgroundColor: 'white',
            content : {

                firstParagraph : {
                    visible : true,
                    content : 'Welcome to MedTLC',
                    classes : 'intro-header positive'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalParagraph : {
                    visible : true,
                    content : 'Medication - Track. Learn. Connect.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true   
                }
            }
        },
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/pill_icon.png'
            },
            textColor: 'black',
            backgroundColor: 'white',
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
                    content : 'Add medications on the Add Medications page.',
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
                url : 'img/symptoms_icon.png'
            },
            textColor: 'black',
            backgroundColor: 'white',
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
                    content : ' Record "How I Feel" responses to provide critical feedback to your doctor. This feedback is one of the strongest features of MedTLC. It gives your doctor the data needed to change medications and adjust dosages when necessary, due to adverse reaction to a single drug, multiple drug interactions, and dosages that cause unwanted effects.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/doctor_icon.png'
            },
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
                    content : 'Print or send reports of your responses to your doctors.',
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
            title : 'Reminder Inbox',
            href : '#/app/reminders-inbox',
            icon : 'ion-archive'
        },
        {
            title : 'Medications',
            click : 'toggleTreatmentsSubMenu',
            icon : 'ion-ios-pulse',
            showSubMenuVariable : 'showTreatmentsSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-medkit-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Overdue',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/reminders-inbox/Treatments',
            icon : 'ion-clock'
        },
        {
            title : "Today's Schedule",
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/reminders-inbox-today/Treatments',
            icon : 'ion-android-sunny'
        },
        {
            title : 'Manage Scheduled',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/manage-scheduled-meds',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'As-Needed Meds',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/as-needed-meds',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Record a Dose',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/measurement-add-search-category/Treatments',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
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
            title : 'Strongest Predictors',
            click : 'togglePredictorSearchSubMenu',
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-analytics',
            expandedIcon : 'ion-chevron-down'
        },
        {
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
        },
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