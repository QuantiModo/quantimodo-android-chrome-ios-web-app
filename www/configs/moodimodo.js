
var getPlatform = function(){
    if(typeof ionic !== "undefined" &&
        typeof ionic.Platform !== "undefined" &&
        typeof ionic.Platform.isIOS !== "undefined" &&
        typeof ionic.Platform.isAndroid !== "undefined" ) {
        return ionic.Platform.isIOS() ? "iOS" : ionic.Platform.isAndroid() ? "Android" : "Web";
    }
    else {
        return "Ionic";
    }
};

window.config = {
    bugsnag:{
        notifyReleaseStages:['Production','Staging']
    },
    client_source_name : "MoodiModo "+ getPlatform(),
    domain : 'app.quantimo.do',
    environment: "Development",
    permissions : ['readmeasurements', 'writemeasurements'],
    port : '4417',
    protocol : 'https',
    shopping_cart_enabled : true
};

config.appSettings  = {
    app_name : 'MoodiModo',

    defaultState : 'app.track',

    primary_outcome_variable : 'Mood',

    storage_identifier: 'MoodiModoData*',

    headline : 'Sync and Analyze Your Data',
    features: [
        ' - Automatically backup and sync your data across devices',
        ' - Track diet, treatments, symptoms, and anything else',
        ' - Analyze your data to see the top predictors for your Mood'
    ],

    primaryOutcomeVariableDetails : {
        id : 1398,
        name : "Overall Mood",
        category : "Mood",
        unit : "/5",
        combinationOperation: "MEAN"
    },

    primaryOutcomeVariableOptionsLabels : [
        'Depressed',
        'Sad',
        'OK',
        'Happy',
        'Ecstatic'
    ],

    primaryOutcomeVariableRatingOptions : [
        {
            value: 'depressed',
            img: 'img/ic_face_depressed.png'
        },
        {
            value: 'sad',
            img: 'img/ic_face_sad.png'
        },
        {
            value: 'ok',
            img: 'img/ic_face_ok.png'
        },
        {
            value: 'happy',
            img: 'img/ic_face_happy.png'
        },
        {
            value: 'ecstatic',
            img: 'img/ic_face_ecstatic.png'
        }
    ],

    welcome_text : "Let's start off by reporting your first mood on the card below",
    tracking_question : "How are you feeling right now?",
    primaryOutcomeVariableAverageText : "Your average mood is ",
    notification_image : "file://img/icon_128.png",
    notification_text : "Time to Track",
    conversion_dataset: {
        "1": "depressed",
        "2": "sad",
        "3": "ok",
        "4": "happy",
        "5": "ecstatic"
    },
    conversion_dataset_reversed : {
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
                url : 'img/icon.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Welcome to MoodiModo',
                    classes : 'intro_header calm'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP : {
                    visible : true,
                    content : 'MoodiModo allows you track your <span class="calm">Mood</span> and identify the hidden factors which may most influence it.',
                    classes : 'intro_para',
                    buttonBarVisible : true   
                }
            }
        },
        // screen 2
        {
            img : {
                height : '70',
                width : '70'
            },
            content : {

                showOutcomeVariableImages : true,
                showFirstBr : true,   
                finalP: {
                    visible : true,
                    content : 'Go to the <span class="calm">Track Mood</span> page to report your Mood!',
                    classes : 'intro_para',
                    buttonBarVisible : true
                } 
            }
        },
        // screen 3
        {
            img : {
                width : '140',
                height : '220',
                url : 'img/track_moods.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Track Mood',
                    classes : 'intro_header calm'
                },                 
                logoDiv : {
                    visible : true,
                    id : ''
                },
                showSecondBr : true,
                finalP: {
                    visible : true,
                    content : 'On the <span class="calm">Track Mood</span> page, you can view your <span class="calm">average Mood</span> as well as charts illustrating how it changes over time.',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 4
        {
            img : {
                width : '200',
                height : '150',
                url : 'img/history_page.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'History',
                    classes : 'intro_header calm'
                }, 
                showFirstBr : true,
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                showSecondBr : true,
                finalP: {
                    visible : true,
                    content : 'You can see and edit your past Mood ratings and notes by opening the <span class="calm">History</span> page.',
                    classes : 'intro_para',
                    buttonBarVisible : true
                }
            }
        },
        // screen 5
        {
            img : {
                width : '220',
                height : '200',
                url : 'img/mood_note.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Add a Note',
                    classes : 'intro_header calm'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Add a note by tapping on a Mood rating in the <span class="calm">History</span> page. You can also <span class="calm">Edit</span> your Mood there too.',
                    classes : 'intro_para',
                    buttonBarVisible : true
                }
            }
        },
        // screen 6
        {
            img : {
                width : '220',
                height : '190',
                url : 'img/track_foods.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Track Foods',
                    classes : 'intro_header calm'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Track your diet on the <span class="calm">Track Foods</span> page. You can also <span class="calm">Add a new Food Variable</span> if you don\'t find the meal you looked for in the search results.',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 7
        {
            img : {
                width : '190',
                height : '180',
                url : 'img/track_symptoms.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Track Symptoms',
                    classes : 'intro_header calm'
                }, 
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                
                finalP: {
                    visible : true,
                    content : 'Track any symptom on the <span class="calm">Track Symptoms</span> page. You can also <span class="calm">Add a new Symptom</span> if you don\'t find the symptom you looked for in the search results.',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }   
            }
        },
        // screen 8
        {
            img : {
                width : '210',
                height : '180',
                url : 'img/track_treatments.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Track Treatments',
                    classes : 'intro_header calm'
                },                 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Track your treatments on the <span class="calm">Track Treatments</span> page. You can also <span class="calm">Add a new Treatment</span> if you don\'t find the treatment you looked for in the search results.',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 9
        {
            img : {
                width : '220',
                height : '200',
                url : 'img/positive_predictors.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Positive Predictors',
                    classes : 'intro_header calm'
                }, 
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                
                finalP: {
                    visible : true,
                    content : 'Positive Predictors are the factors most predictive of <span class="calm">IMPROVING</span> Mood for the average QuantiModo user.',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 10
        {
            img : {
                width : '220',
                height : '200',
                url : 'img/negative_predictors.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Negative Predictors',
                    classes : 'intro_header calm'
                },
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                
                finalP: {
                    visible : true,
                    content : 'Negative Predictors are the factors most predictive of <span class="calm">DECREASING</span> Mood for the average QuantiModo user.',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }  
            }
        },
        // screen 11
        {
            img : {
                width : '180',
                height : '180',
                url : 'img/ic_face_ecstatic.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'We are feeling ecstatic that you\'re helping us derive a mathematical equation for happiness!',
                    classes : 'intro_para calm'
                }, 
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Now start tracking and optimize your life!',
                    classes : 'intro_para_small',
                    buttonBarVisible : true
                }
            }
        }
    ],

    help_popup_messages : {
        "#/app/track" :'Here, you can view your <span class="calm">average Mood</span> as well as charts illustrating how it changes over time', 
        "#/app/history" :'You can see and edit your past Mood ratings and notes by tapping on any item in the list.  <br/> <br/>You can also Add a note by tapping on a Mood rating in the list.',
        "#/app/track_factors_category/Foods" :'You can track your diet on this page. You can also <span class="calm">Add a new Food Variable</span> if you do not find the meal you looked for in the search results.',
        "#/app/track_factors_category/Symptoms" :'You can track any symptom on this page. You can also <span class="calm">Add a new Symptom</span> if you don\'t find the symptom you looked for in the search results.',
        "#/app/track_factors_category/Treatments" :'You can track any treatment on this page. You can also <span class="calm">Add a new Treatment</span> if you don\'t find the treatment you looked for in the search results.',
        "#/app/positive" :'Positive Predictors are the factors most predictive of <span class="calm">IMPROVING</span> Mood for the average QuantiModo user.',
        "#/app/negative" :'Negative Predictors are the factors most predictive of <span class="calm">DECREASING</span> for the average QuantiModo user.'
    },

    remindersInbox : {

    },

    wordAliases : {
        
    },

    menu : [
        {
            title : 'Track Mood',
            href : '#/app/track',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Track Factors',
            click : 'toggleTrackingSubMenu',
            icon : 'showTrackingSubMenu',
            subMenuPanel : true
        },
        {
            title : 'Track anything',
            isSubMenu : true,
            subMenuVariable : 'showTrackingSubMenu',
            href : '#/app/track_factors',
            icon : 'ion-ios-world-outline'   
        },
        {
            title : 'Track foods',
            isSubMenu : true,
            subMenuVariable : 'showTrackingSubMenu',
            href : '#/app/track_factors_category/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'Track emotions',
            isSubMenu : true,
            subMenuVariable : 'showTrackingSubMenu',
            href : '#/app/track_factors_category/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Track symptoms',
            isSubMenu : true,
            subMenuVariable : 'showTrackingSubMenu',
            href : '#/app/track_factors_category/Symptoms',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Track treatments',
            isSubMenu : true,
            subMenuVariable : 'showTrackingSubMenu',
            href : '#/app/track_factors_category/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Track physical activity',
            isSubMenu : true,
            subMenuVariable : 'showTrackingSubMenu',
            href : '#/app/track_factors_category/Physical Activity',
            icon : 'ion-ios-body-outline'
        },
        {
            title : 'Reminders',
            click : 'toggleReminderSubMenu',
            icon : 'showReminderSubMenu',
            subMenuPanel : true
        },
        {
            title : 'Inbox',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-inbox',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Manage',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders-manage',
            icon : 'ion-ios-gear-outline'
        },
        {
            title : 'Emotions',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Symptoms',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Symptoms',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Treatments',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Foods',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminder_add/Foods',
            icon : 'ion-ios-nutrition-outline'
        },
        {
            title : 'History',
            click : 'toggleHistorySubMenu',
            icon : 'showHistorySubMenu',
            subMenuPanel : true
        },
        {
            title : 'Moods',
            isSubMenu : true,
            subMenuVariable : 'showHistorySubMenu',
            href : '#/app/history',
            icon : 'ion-happy-outline'
        },
        {
            title : 'All Measurements',
            isSubMenu : true,
            subMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Import Data',
            href : '#/app/import',
            icon : 'ion-ios-cloud-download-outline'
        },
        {
            title : 'Variables',
            href : '#app/search-variables',
            icon : 'ion-social-vimeo'
        },
        {
            title : 'Predictor Search',
            click : 'togglePredictorSearchSubMenu',
            icon : 'showPredictorSearchSubMenu',
            subMenuPanel : true
        },
        {
            title : 'Common',
            isSubMenu : true,
            subMenuVariable : 'showPredictorSearchSubMenu',
            href : '#/app/search-common-relationships',
            icon : 'ion-ios-people'
        },
        {
            title : 'Yours',
            isSubMenu : true,
            subMenuVariable : 'showPredictorSearchSubMenu',
            href : '#/app/search-user-relationships',
            icon : 'ion-person'
        },
        {
            title : 'Predictors of Mood',
            click : 'toggleOutcomePredictorSubMenu',
            icon : 'showOutcomePredictorSubMenu',
            subMenuPanel : true
        },
        {
            title : 'Positive Mood',
            isSubMenu : true,
            subMenuVariable : 'showOutcomePredictorSubMenu',
            href : '#/app/positive',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Negative Mood',
            isSubMenu : true,
            subMenuVariable : 'showOutcomePredictorSubMenu',
            href : '#/app/negative',
            icon : 'ion-sad-outline'
        },
        {
            title : 'Settings',
            href : '#/app/settings',
            icon : 'ion-ios-gear-outline'
        },
        {
            title : 'Help & Feedback',
            href : window.chrome ? "mailto:help@quantimo.do" : "#app/feedback",
            icon : 'ion-ios-help-outline'
        },
    ]
};

config.getPrimaryOutcomeVariableOptionLabels = function(shouldShowNumbers){
    if(shouldShowNumbers || !config.appSettings.primaryOutcomeVariableOptionsLabels){
        return ['1',  '2',  '3',  '4', '5'];
    } else {
        return config.appSettings.primaryOutcomeVariableOptionsLabels;
    }
};

config.getPrimaryOutcomeVariableOptions = function(shouldShowNumbers){
    if(shouldShowNumbers || !config.appSettings.primaryOutcomeVariableRatingOptions){
        return [
            {
                value: '1',
                img: 'img/ic_1.png'
            },
            {
                value: '2',
                img: 'img/ic_2.png'
            },
            {
                value: '3',
                img: 'img/ic_3.png'
            },
            {
                value: '4',
                img: 'img/ic_4.png'
            },
            {
                value: '5',
                img: 'img/ic_5.png'
            }
        ];
    } else {
        return config.appSettings.primaryOutcomeVariableRatingOptions;
    }
};

config.getImageForPrimaryOutcomeVariableByValue = function(val){
    var filtered_list = this.appSettings.primaryOutcomeVariableRatingOptions.filter(function(option){
        return option.value === val;
    });

    return filtered_list.length? filtered_list[0].img || false : false;
};

config.getImageForPrimaryOutcomeVariableByNumber = function(num){
    var primary_outcome_variable = this.appSettings.conversion_dataset[num]? this.appSettings.conversion_dataset[num] : false;
    return primary_outcome_variable? config.getImageForPrimaryOutcomeVariableByValue(primary_outcome_variable) : false;
};

config.getPrimaryOutcomeVariableByNumber = function(num){
    return this.appSettings.conversion_dataset[num]? this.appSettings.conversion_dataset[num] : false;
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
        return 'https://app.quantimo.do/ionic/Modo/www/callback/'
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
    if(platform === 'Web' && window.private_keys.client_ids.Web === 'oAuthDisabled'){
        return window.location.origin;
    }
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.api_urls.Chrome;
    } else {
        return platform === "Ionic"? window.private_keys.api_urls.Web : platform === "Web"? window.private_keys.api_urls.Web : platform === "iOS"? window.private_keys.api_urls.iOS : window.private_keys.api_urls.Android;
    }
};

config.getAllowOffline = function(){
    return true;
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


window.notification_callback = function(reported_variable, reporting_time){
    var report_time  = Math.floor(reporting_time/1000) || Math.floor(new Date().getTime()/1000);
    var key_identifier = config.appSettings.storage_identifier;
    var val = false;

    // convert values
    if(reported_variable === "repeat_rating"){
        val = localStorage[key_identifier+'lastReportedPrimaryOutcomeVariableValue']?
        JSON.parse(localStorage[key_identifier+'lastReportedPrimaryOutcomeVariableValue']) : false;
    } else {
        val = config.appSettings.conversion_dataset_reversed[reported_variable]?
        config.appSettings.conversion_dataset_reversed[reported_variable] : false;
    }

    // report
    if(val){
        // update localstorage
        localStorage[key_identifier+'lastReportedPrimaryOutcomeVariableValue'] = val;

        var allLocalMeasurementsObject = {
            storedValue : val,
            value : val,
            timestamp : report_time,
            humanTime : {
                date : new Date().toISOString()
            }
        };

        // update full data
        if(localStorage[key_identifier+'allLocalMeasurements']){
            var allLocalMeasurements = JSON.parse(localStorage[key_identifier+'allLocalMeasurements']);
            allLocalMeasurements.push(allLocalMeasurementsObject);
            localStorage[key_identifier+'allLocalMeasurements'] = JSON.stringify(allLocalMeasurements);
        }

        // update Bar chart data
        if(localStorage[key_identifier+'barChartData']){
            var barChartData = JSON.parse(localStorage[key_identifier+'barChartData']);
            barChartData[val-1]++;
            localStorage[key_identifier+'barChartData'] = JSON.stringify(barChartData);
        }

        // update Line chart data
        if(localStorage[key_identifier+'lineChartData']){
            var lineChartData = JSON.parse(localStorage[key_identifier+'lineChartData']);
            lineChartData.push([report_time, val]);
            localStorage[key_identifier+'lineChartData'] = JSON.stringify(lineChartData);
        }

        //update measurementsQueue
        if(!localStorage[key_identifier+'measurementsQueue']){
            localStorage[key_identifier+'measurementsQueue'] = '[]';
        } else {
            var measurementsQueue = JSON.parse(localStorage[key_identifier+'measurementsQueue']);
            measurementsQueue.push(allLocalMeasurementsObject);
            localStorage[key_identifier+'measurementsQueue'] = JSON.stringify(measurementsQueue);
        }
    }
};