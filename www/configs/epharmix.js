var config = {};

config.appSettings  = {
    appDisplayName : 'Epharmix',
    versionNumber: "IONIC_APP_VERSION_NUMBER_PLACEHOLDER",
    lowercaseAppName : 'epharmix',
    appDescription : "Medication. Track. Learn. Connect.",
    appleId: null,
    "appIdentifier": "com.quantimodo.epharmix",
    ionicAppId: 'f837bb35',
    apiUrl : 'https://app.quantimo.do',
    cordovaLocalNotificationsEnabled : false,
    linkToChromeExtension : "https://chrome.google.com/webstore/detail/quantimodo-life-tracking/nojnjdgmjaejpnpehgioddbimopnblga",
    appStorageIdentifier: 'EpharmixData*',
    defaultState : 'app.remindersInbox',
    welcomeState : 'app.login',
    headline : 'Improving Health Outcomes',
    features: [
        ' Follow These Quick Steps to Improve Your Health',
        ' 1. Enter Your Medications',
        ' 2. Record "How I Feel" Responses',
        ' 3. Create Reports of Your Responses and Choose to Connect With Your Doctors'
    ],
    welcomeText:"Let's start off by adding your first medication!",
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
    wordAliases : {
    },
    remindersInbox : {
        title : 'Reminder Inbox'
    },
    remindersManage : {},
    appType: 'medication',
    defaultRemindersType : 'medication',
    menuType : 'medication',
};
if(!module){var module = {};}
module.exports = config.appSettings;