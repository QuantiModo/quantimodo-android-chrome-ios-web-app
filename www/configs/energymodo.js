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
    client_source_name : "MoodiModo "+getPlatform(),
    domain : 'app.quantimo.do',
    environment: "Development",
    permissions : ['readmeasurements', 'writemeasurements'],
    port : '4417',
    protocol : 'https',
    shopping_cart_enabled : true
};

config.appSettings  = {
    app_name : 'EnergyModo',

    tracking_factor : 'Energy',

    storage_identifier: 'EnergyModoData*',
      
    primary_tracking_factor_details : {
        name : "Overall Energy",
        category : "Energy",
        unit : "/5",
        combinationOperation: "MEAN"
    },

    tracking_factors_options_labels : [ 
        '1', 
        '2', 
        '3', 
        '4', 
        '5' 
    ],

    tracking_factor_options : [
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
    ],

    welcome_text:"Let's start off by reporting your Energy on the card below",
    tracking_question:"How is your energy level right now?",
    factor_average_text:"Your average energy level is ",
    notification_image : "file://img/logo.png",
    notification_text : "Rate your Energy",
    conversion_dataset: {
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5" 
    },
    conversion_dataset_reversed : {
        "1" : 1,
        "2" : 2,
        "3" : 3,
        "4" : 4,
        "5" : 5 
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
    }
};

config.getTrackingFactorOptionLabels = function(shouldShowNumbers){
    if(shouldShowNumbers || !config.appSettings.tracking_factors_options_labels){
        return ['1',  '2',  '3',  '4', '5'];
    } else return config.appSettings.tracking_factors_options_labels;
};

config.getTrackingFactorOptions = function(shouldShowNumbers){
    if(shouldShowNumbers || !config.appSettings.tracking_factor_options){
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
    } else return config.appSettings.tracking_factor_options;
};

config.getImageForTrackingFactorByValue = function(val){
    var filtered_list = this.appSettings.tracking_factor_options.filter(function(option){
        return option.value === val;
    });

    return filtered_list.length? filtered_list[0].img || false : false;
};

config.getImageForTrackingFactorByNumber = function(num){
    var tracking_factor = this.appSettings.conversion_dataset[num]? this.appSettings.conversion_dataset[num] : false;
    return tracking_factor? config.getImageForTrackingFactorByValue(tracking_factor) : false;
};

config.getTrackingFactorByNumber = function(num){
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
        val = localStorage[key_identifier+'lastReportedTrackingFactorValue']? 
        JSON.parse(localStorage[key_identifier+'lastReportedTrackingFactorValue']) : false;
    } else {
        val = config.appSettings.conversion_dataset_reversed[reported_variable]?
        config.appSettings.conversion_dataset_reversed[reported_variable] : false;
    }
    
    // report
    if(val){
        // update localstorage
        localStorage[key_identifier+'lastReportedTrackingFactorValue'] = val;
        
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
            measurementsQueue.push(allDataObject);
            localStorage[key_identifier+'measurementsQueue'] = JSON.stringify(measurementsQueue);
        }
    }
};