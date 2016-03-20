
var getPlatform = function(){
    if(typeof ionic !== "undefined" && 
        typeof ionic.Platform !== "undefined" &&
        typeof ionic.Platform.isIOS !== "undefined" && 
        typeof ionic.Platform.isAndroid !== "undefined" ) 
        return ionic.Platform.isIOS()? "iOS" : ionic.Platform.isAndroid()? "Android" : "Web";
    else return "Ionic";
};

window.config = {
    bugsnag:{
        notifyReleaseStages:['Production','Staging']
    },
    client_source_name : "Mind First "+getPlatform(),
    domain : 'app.quantimo.do',
    environment: "Production",
    permissions : ['readmeasurements', 'writemeasurements'],
    port : '4417',
    protocol : 'https',
    shopping_cart_enabled : true
};

config.appSettings  = {
    app_name : 'Mind First Mood Tracker',

    default_state : 'app.track',

    primary_outcome_variable : 'Mood',

    storage_identifier: 'MindFirstData*',

    headline : 'Sync and Analyze Your Data',
    features: [
        ' - Automatically backup and sync your data across devices',
        ' - Track diet, treatments, symptoms, and anything else',
        ' - Analyze your data to see the top predictors for your Mood'
    ],
      
    primary_outcome_variable_details : {
        id : 1398,
        name : "Overall Mood",
        category : "Mood",
        unit : "/5",
        combinationOperation: "MEAN"
    },

    primary_outcome_variables_options_labels : [
        'Depressed',
        'Sad',
        'OK',
        'Happy',
        'Ecstatic'
    ],

    primary_outcome_variable_options : [
        {
            value: 'depressed',
            img: 'img/ic_mood_depressed.png'
        },
        {
            value: 'sad',
            img: 'img/ic_mood_sad.png'
        },
        {
            value: 'ok',
            img: 'img/ic_mood_ok.png'
        },
        {
            value: 'happy',
            img: 'img/ic_mood_happy.png'
        },
        {
            value: 'ecstatic',
            img: 'img/ic_mood_ecstatic.png'
        }
    ],

    welcome_text:"Let's start off by reporting your first mood on the card below",
    tracking_question:"How are you feeling right now?",
    factor_average_text:"Your average mood is ",
    notification_image : "file://img/logo.png",
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

    intro : {
        "screen1" : {
            img : {
                width : '150',
                height : '150',
                url : 'img/main_icon.png'
            }
        },
        "screen2" : {
            images : {
                height : '70',
                width : '70'
            }
        },
        "screen3" : {
            img : {
                width : '140',
                height : '220',
                url : 'img/track_moods.png'
            }
        },
        "screen4" : {
            img : {
                width : '200',
                height : '150',
                url : 'img/history_page.png'
            }
        },
        "screen5" : {
            img : {
                width : '220',
                height : '200',
                url : 'img/mood_note.png'
            }
        },
        "screen6" : {
            img : {
                width : '220',
                height : '190',
                url : 'img/track_foods.png'
            }
        },
        "screen7" : {
            img : {
                width : '190',
                height : '180',
                url : 'img/track_symptoms.png'
            }
        },
        "screen8" : {
            img : {
                width : '210',
                height : '180',
                url : 'img/track_treatments.png'
            }
        },
        "screen9" : {
            img : {
                width : '220',
                height : '200',
                url : 'img/positive_predictors.png'
            }
        },
        "screen10" : {
            img : {
                width : '220',
                height : '200',
                url : 'img/negative_predictors.png'
            }
        },
        "screen11" : {
            img : {
                width : '180',
                height : '180',
                url : 'img/ic_mood_ecstatic.png'
            }
        }
    },

    popup_messages : {
        "track" : {
            message : 'Here, you can view your <span class="calm">average Mood</span> as well as charts illustrating how it changes over time'
        },
        "history" : {
            message : 'You can see and edit your past Mood ratings and notes by tapping on any item in the list.  <br/> <br/>You can also Add a note by tapping on a Mood rating in the list.'
        },
        "track_foods" : {
            message : 'You can track your diet on this page. You can also <span class="calm">Add a new Food Variable</span> if you do not find the meal you looked for in the search results.'
        },
        "track_symptoms" : {
            message : 'You can track any symptom on this page. You can also <span class="calm">Add a new Symptom</span> if you don\'t find the symptom you looked for in the search results.'
        },
        "track_treatments" : {
            message : 'You can track any treatment on this page. You can also <span class="calm">Add a new Treatment</span> if you don\'t find the treatment you looked for in the search results.'
        },
        "positive_predictors" : {
            message : 'Positive Predictors are the factors most predictive of <span class="calm">IMPROVING</span> Mood for the average QuantiModo user.'
        },
        "negative_predictors" : {
            message : 'Negative Predictors are the factors most predictive of <span class="calm">DECREASING</span> for the average QuantiModo user.'
        }
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
            href : '#/app/reminders/Emotions',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Symptoms',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders/Symptoms',
            icon : 'ion-ios-pulse'
        },
        {
            title : 'Treatments',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders/Treatments',
            icon : 'ion-ios-medkit-outline'
        },
        {
            title : 'Foods',
            isSubMenu : true,
            subMenuVariable : 'showReminderSubMenu',
            href : '#/app/reminders/Foods',
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
    if(shouldShowNumbers || !config.appSettings.primary_outcome_variables_options_labels){
        return ['1',  '2',  '3',  '4', '5'];
    } else return config.appSettings.primary_outcome_variables_options_labels;
};

config.getPrimaryOutcomeVariableOptions = function(shouldShowNumbers){
    if(shouldShowNumbers || !config.appSettings.primary_outcome_variable_options){
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
    } else return config.appSettings.primary_outcome_variable_options;
};

config.getImageForPrimaryOutcomeVariableByValue = function(val){
    var filtered_list = this.appSettings.primary_outcome_variable_options.filter(function(option){
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

config.getPermissionString = function(){

    var str = "";
    for(var i=0; i < config.permissions.length; i++)
        str+= config.permissions[i]+"%20";
    return str.replace(/%20([^%20]*)$/,'$1');

};

config.getURL = function(path){
    if(typeof path === "undefined") path = "";
    else path+= "?";

    var url = "";

    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        url = config.protocol+"://"+config.domain+"/"+path;
    }

    else if(window.location.origin.indexOf('localhost')> -1 || window.location.origin == "file://" ){
        //On localhost or mobile
        url = config.protocol+"://"+config.domain+"/"+path;
    }
    else if(window.location.origin.indexOf("local.") > -1){
         //local.quantimodo
         url = config.protocol+"://"+config.domain;
         
         url+= (config.domain.indexOf('app.') === -1 && config.domain.indexOf('staging.') === -1)? ":"+config.port : "";
         
         url+="/"+path;
    } else {
        url = config.protocol + "://" + config.domain + "/" + path;
        // url = window.location.origin + "/" + path;
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
    if(reported_variable === "repeat_mood"){
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
        
        var allDataObject = {
            storedValue : val,
            value : val,
            timestamp : report_time,
            humanTime : {
                date : new Date().toISOString()
            }
        };

        // update full data
        if(localStorage[key_identifier+'allData']){
            var allData = JSON.parse(localStorage[key_identifier+'allData']);
            allData.push(allDataObject);
            localStorage[key_identifier+'allData'] = JSON.stringify(allData);
        }

        // update Bar chart data
        if(localStorage[key_identifier+'barChartData']){
            if(val>0){
                var barChartData = JSON.parse(localStorage[key_identifier+'barChartData']);
                barChartData[val-1]++;
                localStorage[key_identifier+'barChartData'] = JSON.stringify(barChartData);
            }
        }

        // update Line chart data
        if(localStorage[key_identifier+'lineChartData']){
            if(val>0){
                var lineChartData = JSON.parse(localStorage[key_identifier+'lineChartData']);
                lineChartData.push([report_time, (val-1)*25]);
                localStorage[key_identifier+'lineChartData'] = JSON.stringify(lineChartData);    
            }
            
        }

        //update measurementsQueue
        if(!localStorage[key_identifier+'measurementsQueue']){
            localStorage[key_identifier+'measurementsQueue'] = '[]';
        } else {
            var measurementsQueue = JSON.parse(localStorage[key_identifier+'measurementsQueue']);
            measurementsQueue.push(allDataObject);
            localStorage[key_identifier+'measurementsQueue'] = JSON.stringify(measurementsQueue);
        }
    }
};