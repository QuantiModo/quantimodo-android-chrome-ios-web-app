var config = {};

config.appSettings  = {
    appDisplayName : 'Epharmix',
    lowercaseAppName : 'epharmix',
    appDescription : "Medication. Track. Learn. Connect.",
    appleId: null,
    "appIdentifier": "com.quantimodo.epharmix",
    ionicAppId: 'f837bb35',
    apiUrl : 'https://app.quantimo.do',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/nojnjdgmjaejpnpehgioddbimopnblga",
    allowOffline : false,
    shoppingCartEnabled : false,
    qmApiHostName: 'app.quantimo.do',
    appStorageIdentifier: 'EpharmixData*',
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.login',
    settingsPageOptions : {showReminderFrequencySelector : false},
    headline : 'Improving Health Outcomes',
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
    intro : [
        // screen 1
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/intro/intro_import.png'
            },
            textColor: 'white',
            backgroundColor: '#3467d6',
            content : {
                firstParagraph : {
                    visible : true,
                    content : 'Import Data',
                    classes : 'intro-header'
                },
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalParagraph : {
                    visible : true,
                    content : 'Import data from all your apps and devices',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                }
            }
        },
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/intro/intro_track_anything.png'
            },
            textColor: 'white',
            backgroundColor: '#f09402',
            content : {
                firstParagraph : {
                    visible : true,
                    content : 'Track Anything',
                    classes : 'intro-header'
                },
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalParagraph : {
                    visible : true,
                    content : 'Log treatments, diet, symptoms, emotions, and anything else',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                }
            }
        },
        {
            img : {
                width : '250',
                height : '250',
                url : 'img/intro/intro_make_discoveries.png'
            },
            textColor: 'white',
            backgroundColor: '#0f9d58',
            content : {

                firstParagraph : {
                    visible : true,
                    content : 'Make Discoveries',
                    classes : 'intro-header'
                },

                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalParagraph: {
                    visible : true,
                    content : 'Identify hidden factors most strongly linked to your well-being',
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
    menuType : 'medication',
};
if(!module){var module = {};}
module.exports = config.appSettings;