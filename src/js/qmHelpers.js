/** @namespace window.qmLog */
/** @namespace window.qm.chrome */
String.prototype.toCamel = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
var appSettings;
window.qm = {
    analytics: {
        eventCategories: {
            pushNotifications: "pushNotifications",
            inbox: "inbox"
        }
    },
    apiPaths: {
        trackingReminderNotificationsPast: "v1/trackingReminderNotifications/past"
    },
    api: {
        configureClient: function () {
            var qmApiClient = Quantimodo.ApiClient.instance;
            var quantimodo_oauth2 = qmApiClient.authentications.quantimodo_oauth2;
            qmApiClient.basePath = qm.api.getBaseUrl() + '/api';
            quantimodo_oauth2.accessToken = qm.auth.getAccessTokenFromUrlUserOrStorage();
            return qmApiClient;
        },
        cacheSet: function(params, data, functionName){
            if(!qm.api.cache[functionName]){qm.api.cache[functionName] = {};}
            var key = qm.api.getCacheName(params);
            qm.api.cache[functionName][key] = data;
        },
        cacheGet: function(params, functionName){
            if(!qm.api.cache[functionName]){qm.api.cache[functionName] = {};}
            var key = qm.api.getCacheName(params);
            if(!qm.api.cache[functionName][key]){return null;}
            return qm.api.cache[functionName][key];
        },
        cacheRemove: function(functionName){
            return qm.api.cache[functionName] = null;
        },
        getCacheName: function(params){
            return qm.stringHelper.removeSpecialCharacters(JSON.stringify(params));
        },
        cache: {},
        generalResponseHandler: function(error, data, response, successHandler, errorHandler, params, functionName) {
            if(!response){
                qmLog.error("No response provided to qmSdkApiResponseHandler");
                return;
            }
            qmLog.debug(response.status + ' response from ' + response.req.url);
            if (error) {
                qm.api.generalErrorHandler(error, data, response);
                if(errorHandler){errorHandler(error);}
            } else {
                if(data && params){
                    qm.api.cacheSet(params, data, functionName);
                }
                if(successHandler){
                    successHandler(data, response);
                }
            }
        },
        generalErrorHandler: function(error, data, response, options){
            if(!response){return qmLog.error("No API response provided to qmApiGeneralErrorHandler",
                {errorMessage: error, responseData: data, apiResponse: response, requestOptions: options});}
            if(response.status === 401){
                if(!options || !options.doNotSendToLogin){
                    qmLog.error("Not authenticated!")
                }
            } else {
                qmLogService.error(response.error.message, null, {apiResponse: response});
            }
        },
        addGlobalParams: function (urlParams) {
            urlParams.appName = encodeURIComponent(config.appSettings.appDisplayName);
            if(config.appSettings.versionNumber){
                urlParams.appVersion = encodeURIComponent(config.appSettings.versionNumber);
            } else {
                qmLog.debug('Version number not specified!', null, 'Version number not specified on config.appSettings');
            }
            urlParams.clientId = encodeURIComponent(qm.api.getClientId());
            if(window.devCredentials){
                if(window.devCredentials.username){urlParams.log = encodeURIComponent(window.devCredentials.username);}
                if(window.devCredentials.password){urlParams.pwd = encodeURIComponent(window.devCredentials.password);}
            } else {
                qmLog.debug(null, 'No dev credentials', null);
            }
            var passableUrlParameters = ['userId', 'log', 'pwd', 'userEmail'];
            for(var i = 0; i < passableUrlParameters.length; i++){
                if(urlHelper.getParam(passableUrlParameters[i])){urlParams[passableUrlParameters[i]] = urlHelper.getParam(passableUrlParameters[i]);}
            }
            return urlParams;
        },
        getClientId: function(){
            if(appSettings){return appSettings.clientId;}
            if(config && config.appSettings){return config.appSettings.clientId;}
            return window.urlHelper.getParam('clientId');
        }
    },
    apiHelper: {},
    arrayHelper: {
        variableIsArray: function(variable){
            if(!variable){
                qmLog.info(variable + " provided to variableIsArray");
                return false;
            }
            var isAnArray = Array.isArray(variable);
            if(isAnArray){return true;}
            var constructorArray = variable.constructor === Array;
            if(constructorArray){return true;}
            var instanceOfArray = variable instanceof Array;
            if(instanceOfArray){return true;}
            var prototypeArray = Object.prototype.toString.call(variable) === '[object Array]';
            if(prototypeArray){return true;}
            return false;
        },
        convertToArrayIfNecessary: function(variable){
            if(!qm.arrayHelper.variableIsArray(variable)){variable = [variable];}
            return variable;
        },
        inArray: function(needle, haystack) {
            var length = haystack.length;
            for(var i = 0; i < length; i++) {
                if(haystack[i] === needle) return true;
            }
            return false;
        },
        convertObjectToArray: function (object) {
            if(!object){
                qmLog.info(object + " provided to convertObjectToArray");
                return object;
            }
            if(qm.arrayHelper.variableIsArray(object)){return object;}
            var result = Object.keys(obj).map(function(key) {
                return obj[key];
            });
            return result;
        },
        getContaining: function(searchTerm, array){
            searchTerm = searchTerm.toLowerCase();
            var matches = [];
            for (var i = 0; i < array.length; i++) {
                if(JSON.stringify(array[i]).toLowerCase().indexOf(searchTerm) > -1){
                    matches.push(array[i]);
                }
            }
            return matches;
        },
        concatenateUniqueId: function (preferred, secondary) {
            var a = preferred.concat(secondary);
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i].id === a[j].id)
                        a.splice(j--, 1);
                }
            }
            return a;
        },
        replaceElementInArrayById: function (array, replacementElement) {
            return qm.arrayHelper.concatenateUniqueId([replacementElement], array);
        },
        removeLastItem: function(array){
            if(!array){
                qmLog.error("No array provided to removeLastItem");
                return array;
            }
            if(!qm.arrayHelper.variableIsArray(array)){
                qmLog.error("Non-array provided to removeLastItem");
                return array;
            }
            return array.splice(-1,1);
        },
        removeLastItemsUntilSizeLessThan: function(maxKb, array){
            if(!array){
                qmLog.error("No array provided to removeLastItem");
                return array;
            }
            if(!qm.arrayHelper.variableIsArray(array)){
                qmLog.error("Non-array provided to removeLastItemsUntilSizeLessThan");
                return array;
            }
            if(array.length < 2){
                qmLog.error("Removing only element from single item array!");
                return [];
            }
            while (getSizeInKiloBytes(array) > maxKb) {
                array = qm.arrayHelper.removeLastItem(array);
            }
            return array;
        }
    },
    auth: {},
    getAppSettings: function () {
        if(typeof config !== "undefined" && typeof config.appSettings !== "undefined"){return config.appSettings;}
        return null;
    },
    globalHelper: {
        setStudy: function(study){
            qm.storage.setGlobal(qm.stringHelper.removeSpecialCharacters(study.causeVariable.name+"_"+study.effectVariable.name), study);
        },
        getStudy: function(causeVariableName, effectVariableName){
            qm.storage.getGlobal(qm.stringHelper.removeSpecialCharacters(causeVariableName+"_"+effectVariableName));
        },
        setItem: function(key, value){
            qm.storage.setGlobal(key, value);
        },
        getItem: function(key){
            return qm.storage.getGlobal(key);
        }
    },
    globals: {},
    integration: {
        getIntegrationJsWithoutClientId: function(clientId, callback){
            qm.api.configureClient();
            var apiInstance = new Quantimodo.ConnectorsApi();
            apiInstance.getIntegrationJs({clientId: 'CLIENT_ID'}, function (error, data, response) {
                if(data){
                    qm.integration.integrationJs = data;
                    if(clientId && callback){
                        callback(qm.integration.integrationJs.replace('CLIENT_ID', clientId));
                    }
                }
                qm.api.responseHandler(error, data, response);
            });
        },
        getIntegrationJsEmbedCodeForClient: function(clientId, callback){
            if(qm.integration.integrationJs){
                return callback(qm.integration.integrationJs.replace('CLIENT_ID', clientId));
            }
            qm.integration.getIntegrationJsWithoutClientId(clientId, callback);
        }
    },
    items: {
        accessToken: 'accessToken',
        apiUrl: 'apiUrl',
        appSettingsRevisions: 'appSettingsRevisions',
        chromeWindowId: 'chromeWindowId',
        clientId: 'clientId',
        commonVariables: 'commonVariables',
        defaultHelpCards: 'defaultHelpCards',
        deviceTokenOnServer: 'deviceTokenOnServer',
        deviceTokenToSync: 'deviceTokenToSync',
        drawOverAppsEnabled: 'drawOverAppsEnabled',
        expiresAtMilliseconds: 'expiresAtMilliseconds',
        hideImportHelpCard: 'hideImportHelpCard',
        introSeen: 'introSeen',
        lastGotNotificationsAtMilliseconds: 'lastGotNotificationsAtMilliseconds',
        lastLatitude: 'lastLatitude',
        lastLocationAddress: 'lastLocationAddress',
        lastLocationName: 'lastLocationName',
        lastLocationNameAndAddress: 'lastLocationNameAndAddress',
        lastLocationPostUnixtime: 'lastLocationPostUnixtime',
        lastLocationResultType: 'lastLocationResultType',
        lastLocationUpdateTimeEpochSeconds: 'lastLocationUpdateTimeEpochSeconds',
        lastLongitude: 'lastLongitude',
        lastReminder: 'lastReminder',
        lastStudy: 'lastStudy',
        lastPopupNotificationUnixtimeSeconds: 'lastPopupNotificationUnixtimeSeconds',
        lastPushTimestamp: 'lastPushTimestamp',
        measurementsQueue: 'measurementsQueue',
        mostFrequentReminderIntervalInSeconds: 'mostFrequentReminderIntervalInSeconds',
        notificationInterval: 'notificationInterval',
        notificationsSyncQueue: 'notificationsSyncQueue',
        onboarded: 'onboarded',
        physicianUser: 'physicianUser',
        refreshToken: 'refreshToken',
        trackingReminderNotifications: 'trackingReminderNotifications',
        trackingReminderNotificationSyncScheduled: 'trackingReminderNotificationSyncScheduled',
        trackingReminders: 'trackingReminders',
        trackingReminderSyncQueue: ' trackingReminderSyncQueue',
        units: 'units',
        user: 'user',
        useSmallInbox: 'useSmallInbox',
        userVariables: 'userVariables'
    },
    manualTrackingVariableCategoryNames: [
        'Emotions',
        'Symptoms',
        'Treatments',
        'Foods',
        'Vital Signs',
        'Physical Activity',
        'Sleep',
        'Miscellaneous',
        'Environment'
    ],
    notifications: {},
    objectHelper: {
        copyPropertiesFromOneObjectToAnother: function(source, destination){
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    destination[prop] = source[prop];
                }
            }
            return destination;
        },
        getSizeInKb: function(object) {
            var string;
            if(typeof object === "string"){
                string = object;
            } else {
                string = JSON.stringify(object);
            }
            return qm.objectHelper.getSizeOfStringInKb(string);
        },
        getSizeOfStringInKb: function(string) {
            return Math.round(string.length / 1000);
        },
        unsetPropertiesWithSizeGreaterThanForObject: function(maximumKb, object) {
            object = JSON.parse(JSON.stringify(object));  // Decouple
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    if(qm.objectHelper.getSizeInKb(object[property]) > maximumKb){
                        delete object[property];
                    }
                }
            }
            return object;
        }

    },
    platform: {
        isChromeExtension: function (){
            if(typeof chrome === "undefined"){
                window.qmLog.debug('chrome is undefined', null, null);
                return false;
            }
            if(typeof chrome.runtime === "undefined"){
                window.qmLog.debug('chrome.runtime is undefined', null, null);
                return false;
            }
            if(typeof chrome.alarms === "undefined"){
                window.qmLog.debug('chrome.alarms is undefined', null, null);
                return false;
            }
            window.qmLog.debug(null, 'isChromeExtension returns true', null, null);
            return true;
        },
        isWeb: function (){return window.location.href.indexOf("https://") > -1;},
        isAndroid: function (){return window.location.href.indexOf("android_asset") > -1;},
        isIOS: function (){return window.location.href.indexOf("var/containers/Bundle") > -1;},
        isMobile: function (){return qm.platform.isAndroid() || qm.platform.isIOS();}
    },
    push: {},
    reminderHelper: {
        getNumberOfTrackingRemindersInLocalStorage: function () {
            var trackingReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            if(trackingReminders && trackingReminders.length){return trackingReminders.length;}
            return 0;
        },
        getTrackingRemindersFromLocalStorage: function(){
            return qm.storage.getItem(qm.items.trackingReminders);
        },
        saveToLocalStorage: function(trackingReminders){
            qm.storage.setItem(qm.items.trackingReminders, trackingReminders);
            qm.userVariableHelper.refreshIfLessThanNumberOfReminders();
        }
    },
    storage: {},
    stringHelper: {
        removeSpecialCharacters: function (str) {
            return str.replace(/[^A-Z0-9]+/ig, "_");
        },
        prettyJsonStringify: function (jsonObject) {
            return JSON ? JSON.stringify(jsonObject, null, '  ') : 'your browser does not support JSON so cant pretty print';
        },
        parseBoolean: function(value){
            if(value === "false"){return false;}
            if(value === "true"){return true;}
            return value;
        }
    },
    studyHelper: {
        getLastStudy: function(){
            return qm.storage.getItem(qm.items.lastStudy);
        },
        getLastStudyIfMatchesVariableNames: function(causeVariableName, effectVariableName) {
            var lastStudy = qm.studyHelper.getLastStudy();
            if(lastStudy.causeVariableName === causeVariableName && lastStudy.effectVariableName === effectVariableName){
                return lastStudy;
            }
        },
        saveLastStudy: function(study){
            qm.storage.setItem(qm.items.lastStudy, study);
        },
        deleteLastStudy: function(){
            qm.storage.removeItem(qm.items.lastStudy);
        }
    },
    timeHelper: {
        getUnixTimestampInMilliseconds: function(dateTimeString) {
            if(!dateTimeString){return new Date().getTime();}
            return new Date(dateTimeString).getTime();
        },
        universalConversionToUnixTimeSeconds: function(unixTimeOrString){
            if(isNaN(unixTimeOrString)){
                unixTimeOrString = qm.timeHelper.getUnixTimestampInSeconds(unixTimeOrString);
            }
            if(unixTimeOrString > qm.timeHelper.getUnixTimestampInSeconds() + 365 * 86400 * 10){
                unixTimeOrString = unixTimeOrString/1000;
            }
            return unixTimeOrString;
        },
        getUnixTimestampInSeconds: function(dateTimeString) {
            if(!dateTimeString){dateTimeString = new Date().getTime();}
            return Math.round(window.qm.timeHelper.getUnixTimestampInMilliseconds(dateTimeString)/1000);
        },
        getTimeSinceString: function(unixTimeOrString) {
            if(!unixTimeOrString){return "never";}
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            var secondsAgo = qm.timeHelper.secondsAgo(unixTimestamp);
            if(secondsAgo > 2 * 24 * 60 * 60){return Math.round(secondsAgo/(24 * 60 * 60)) + " days ago";}
            if(secondsAgo > 2 * 60 * 60){return Math.round(secondsAgo/(60 * 60)) + " hours ago";}
            if(secondsAgo > 2 * 60){return Math.round(secondsAgo/(60)) + " minutes ago";}
            return secondsAgo + " seconds ago";
        },
        secondsAgo: function(unixTimeOrString) {
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.getUnixTimestampInSeconds() - unixTimestamp));
        },
        minutesAgo: function(unixTimeOrString) {
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.secondsAgo(unixTimestamp)/60));
        },
        hoursAgo: function(unixTimeOrString) {
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.secondsAgo(unixTimestamp)/3600));
        },
        daysAgo: function(unixTimeOrString) {
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.secondsAgo(unixTimestamp)/86400));
        },
        getCurrentLocalDateAndTime: function() {return new Date().toLocaleString();},
    },
    trackingReminderNotifications : [],
    unitHelper: {},
    user: null,
    userHelper: {
        deleteUserAccount: function(reason, successHandler){
            qm.api.configureClient();
            var apiInstance = new Quantimodo.UserApi();
            function callback(error, data, response) {
                qm.api.responseHandler(error, data, response, successHandler);
            }
            apiInstance.deleteUser(reason, {clientId: qm.getAppSettings().clientId}, callback);
        },
        getUser: function(){
            if(window.qmUser){return window.qmUser;}
            window.qmUser = qm.storage.getItem('user');
            return window.qmUser;
        },
        setUser: function(user){
            window.qmUser = user;
            qm.storage.setItem(qm.items.user, user);
            if(!user){return;}
            window.qmLog.debug(window.qmUser.displayName + ' is logged in.');
            if(urlHelper.getParam('doNotRemember')){return;}
            qmLog.setupUserVoice();
            if(!user.accessToken){
                qmLog.error("User does not have access token!", null, {userToSave: user});
            } else {
                qm.auth.saveAccessTokenResponse(user);
            }
        },
        withinAllowedNotificationTimes: function(){
            if(qm.userHelper.getUser()){
                var now = new Date();
                var hours = now.getHours();
                var currentTime = hours + ':00:00';
                if(currentTime > qmUser.latestReminderTime || currentTime < qmUser.earliestReminderTime ){
                    window.qmLog.info('Not showing notification because outside allowed time range');
                    return false;
                }
            }
            return true;
        }
    },
    userVariableHelper: {
        saveSingleUserVariableToLocalStorageAndUnsetLargeProperties: function(userVariable){
            userVariable = qm.objectHelper.unsetPropertiesWithSizeGreaterThanForObject(10, userVariable);
            qm.userVariableHelper.saveUserVariablesToLocalStorage([userVariable]);
        },
        saveUserVariablesToLocalStorage: function(userVariables){
            userVariables = qm.arrayHelper.convertToArrayIfNecessary(userVariables);
            var definitelyUserVariables = [];
            for (var i = 0; i < userVariables.length; i++) {
                if(userVariables[i].userId){
                    definitelyUserVariables.push(userVariables[i]);
                }
            }
            qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.userVariables, definitelyUserVariables);
        },
        getNumberOfUserVariablesInLocalStorage: function () {
            var userVariables = qm.userVariableHelper.getUserVariablesFromLocalStorage();
            if(userVariables && userVariables.length){return userVariables.length;}
            return 0;
        },
        getUserVariablesFromLocalStorage: function(){
            return qm.storage.getItem(qm.items.userVariables);
        },
        getUserVariablesFromLocalStorageByName: function(variableName){
            return qm.storage.getUserVariableByName(variableName);
        },
        updateLatestMeasurementTime: function(variableName, lastValue){
            qm.storage.getUserVariableByName(variableName, true, lastValue);
        },
        refreshIfLessThanNumberOfReminders: function(){
            var numberOfReminders = qm.reminderHelper.getNumberOfTrackingRemindersInLocalStorage();
            var numberOfUserVariables = qm.userVariableHelper.getNumberOfUserVariablesInLocalStorage();
            qmLog.info(numberOfReminders + " reminders and " + numberOfUserVariables + " user variables in local storage");
            if(numberOfReminders > numberOfUserVariables){
                qmLog.errorOrInfoIfTesting("Refreshing user variables because we have more tracking reminders");
                qm.userVariableHelper.refreshUserVariables();
            }
        },
        refreshUserVariables: function(){
            function successHandler(data) {
                qm.storage.setItem(qm.items.userVariables, data);
            } // Limit 50 so we don't exceed storage limits
            qm.userVariableHelper.getFromApi({limit: 50, sort: "-latestMeasurementTime"}, successHandler);
        },
        getFromApi: function(params, successHandler, errorHandler){
            qm.api.configureClient();
            var apiInstance = new Quantimodo.VariablesApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'UserVariables');
            }
            params = qm.api.addGlobalParams(params);
            apiInstance.getVariables(params, callback);
        }
    },
};
// SubDomain : Filename
var appConfigFileNames = {
    "app" : "quantimodo",
    "energymodo" : "energymodo",
    "default" : "default",
    "ionic" : "quantimodo",
    "local" : "quantimodo",
    "medimodo" : "medimodo",
    "mindfirst" : "mindfirst",
    "moodimodo" : "moodimodo",
    "oauth" : "quantimodo",
    "quantimodo" : "quantimodo",
    "your_quantimodo_client_id_here": "your_quantimodo_client_id_here"
};
if(!window.qmUser){
    window.qmUser = localStorage.getItem(qm.items.user);
    if(window.qmUser){window.qmUser = JSON.parse(window.qmUser);}
}
qm.getPrimaryOutcomeVariable = function(){
    if(qm.getAppSettings() && qm.getAppSettings().primaryOutcomeVariableDetails){ return qm.getAppSettings().primaryOutcomeVariableDetails;}
    var variables = {
        "Overall Mood" : {
            "id" : 1398,
            "name" : "Overall Mood",
            "variableName": "Overall Mood",
            variableCategoryName : "Mood",
            "userUnitAbbreviatedName" : "/5",
            unitAbbreviatedName : "/5",
            "combinationOperation": "MEAN",
            "valence": "positive",
            "unitName": "1 to 5 Rating",
            "ratingOptionLabels" : ["Depressed", "Sad", "OK", "Happy", "Ecstatic"],
            "ratingValueToTextConversionDataSet": {1: "depressed", 2: "sad", 3: "ok", 4: "happy", 5: "ecstatic"},
            "ratingTextToValueConversionDataSet" : {"depressed" : 1, "sad" : 2, "ok" : 3, "happy" : 4, "ecstatic": 5},
            trackingQuestion: "How are you?",
            averageText:"Your average mood is ",
        },
        "Energy Rating" : {
            id : 108092,
            name : "Energy Rating",
            variableName: "Energy Rating",
            variableCategoryName : "Emotions",
            unitAbbreviatedName : "/5",
            combinationOperation: "MEAN",
            positiveOrNegative: 'positive',
            unitName: '1 to 5 Rating',
            ratingOptionLabels : ['1', '2', '3', '4', '5'],
            ratingValueToTextConversionDataSet: {1: "1", 2: "2", 3: "3", 4: "4", 5: "5"},
            ratingTextToValueConversionDataSet : {"1" : 1, "2" : 2, "3" : 3, "4" : 4, "5" : 5},
            trackingQuestion:"How is your energy level right now?",
            averageText:"Your average energy level is ",
        }
    };
    if(qm.getAppSettings() && qm.getAppSettings().primaryOutcomeVariableName){return variables[qm.getAppSettings().primaryOutcomeVariableName];}
    return variables['Overall Mood'];
};
qm.getPrimaryOutcomeVariableByNumber = function(num){
    return qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] ? qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] : false;
};
qm.ratingImages = {
    positive : [
        'img/rating/face_rating_button_256_depressed.png',
        'img/rating/face_rating_button_256_sad.png',
        'img/rating/face_rating_button_256_ok.png',
        'img/rating/face_rating_button_256_happy.png',
        'img/rating/face_rating_button_256_ecstatic.png'
    ],
    negative : [
        'img/rating/face_rating_button_256_ecstatic.png',
        'img/rating/face_rating_button_256_happy.png',
        'img/rating/face_rating_button_256_ok.png',
        'img/rating/face_rating_button_256_sad.png',
        'img/rating/face_rating_button_256_depressed.png'
    ],
    numeric : [
        'img/rating/numeric_rating_button_256_1.png',
        'img/rating/numeric_rating_button_256_2.png',
        'img/rating/numeric_rating_button_256_3.png',
        'img/rating/numeric_rating_button_256_4.png',
        'img/rating/numeric_rating_button_256_5.png'
    ]
};
qm.notifications.getFromGlobalsOrLocalStorage = function(){
    return qm.storage.getItem(qm.items.trackingReminderNotifications);
};
qm.storage.getUserVariableByName = function (variableName, updateLatestMeasurementTime, lastValue) {
    var userVariables = qm.storage.getWithFilters(qm.items.userVariables, 'name', variableName);
    if(!userVariables || !userVariables.length){return null;}
    var userVariable = userVariables[0];
    userVariable.lastAccessedUnixtime = qm.timeHelper.getUnixTimestampInSeconds();
    if(updateLatestMeasurementTime){userVariable.latestMeasurementTime = qm.timeHelper.getUnixTimestampInSeconds();}
    if(lastValue){
        userVariable.lastValue = lastValue;
        userVariable.lastValueInUserUnit = lastValue;
    }
    qm.userVariableHelper.saveSingleUserVariableToLocalStorageAndUnsetLargeProperties(userVariable);
    return userVariable;
};
// returns bool | string
// if search param is found: returns its value
// returns false if not found
window.urlHelper = {
     getParam: function(parameterName, url, shouldDecode) {
         if(!url){url = window.location.href;}
         if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
         if(url.split('?').length > 1){
             var queryString = url.split('?')[1];
             var parameterKeyValuePairs = queryString.split('&');
             for (var i = 0; i < parameterKeyValuePairs.length; i++) {
                 var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
                 if (currentParameterKeyValuePair[0].toCamel().toLowerCase() === parameterName.toCamel().toLowerCase()) {
                     currentParameterKeyValuePair[1] = qm.stringHelper.parseBoolean(currentParameterKeyValuePair[1]);
                     if(typeof shouldDecode !== "undefined")  {
                         return decodeURIComponent(currentParameterKeyValuePair[1]);
                     } else {
                         return currentParameterKeyValuePair[1];
                     }
                 }
             }
         }
         return null;
     },
     getAllQueryParamsFromUrlString: function(url){
         if(!url){url = window.location.href;}
         var keyValuePairsObject = {};
         var array = [];
         if(url.split('?').length > 1){
             var queryString = url.split('?')[1];
             var parameterKeyValueSubstrings = queryString.split('&');
             for (var i = 0; i < parameterKeyValueSubstrings.length; i++) {
                 array = parameterKeyValueSubstrings[i].split('=');
                 keyValuePairsObject[array[0]] = array[1];
             }
         }
         return keyValuePairsObject;
     }
 };
window.isTruthy = function(value){return value && value !== "false"; };
window.isFalsey = function(value) {if(value === false || value === "false"){return true;}};
qm.getSourceName = function(){return config.appSettings.appDisplayName + " for " + qm.getPlatform();};
qm.push.enabled = function () {
    if(!qm.userHelper.getUser()){return false;}
    return qm.userHelper.getUser().pushNotificationsEnabled;
};
qm.getPlatform = function(){
    if(qm.platform.isChromeExtension()){return "chromeExtension";}
    if(window.location.href.indexOf('https://') !== -1){return "web";}
    return 'mobile';
};
function getSubDomain(){
    var full = window.location.host;
    var parts = full.split('.');
    return parts[0].toLowerCase();
}
function getClientIdFromQueryParameters() {
    var clientId = window.urlHelper.getParam('clientId');
    if(!clientId){clientId = window.urlHelper.getParam('appName');}
    if(!clientId){clientId = window.urlHelper.getParam('lowerCaseAppName');}
    if(!clientId){clientId = window.urlHelper.getParam('quantimodoClientId');}
    if(clientId){qm.storage.setItem('clientId', clientId);}
    return clientId;
}
function getQuantiModoClientId() {
    if(qm.platform.isMobile()){
        window.qmLog.debug(null, 'Using default.config.js because we\'re on mobile', null);
        return "default"; // On mobile
    }
    var clientId = getClientIdFromQueryParameters();
    if(clientId){
        window.qmLog.debug(null, 'Using clientIdFromQueryParams: ' + clientId, null);
        return clientId;
    }
    if(!clientId){clientId = qm.storage.getItem(qm.items.clientId);}
    if(clientId){
        window.qmLog.debug(null, 'Using clientId From localStorage: ' + clientId, null);
        return clientId;
    }
    if(window.location.href.indexOf('quantimo.do') === -1){
        window.qmLog.debug(null, 'Using default.config.js because we\'re not on a quantimo.do domain', null);
        return "default"; // On mobile
    }
    var subdomain = getSubDomain();
    var clientIdFromAppConfigName = appConfigFileNames[getSubDomain()];
    if(clientIdFromAppConfigName){
        window.qmLog.debug(null, 'Using client id ' + clientIdFromAppConfigName + ' derived from appConfigFileNames using subdomain: ' + subdomain, null);
        return clientIdFromAppConfigName;
    }
    window.qmLog.debug(null, 'Using subdomain as client id: ' + subdomain);
    return subdomain;
}
var appsManager = { // jshint ignore:line
    defaultApp : "default",
    getAppConfig : function(){
        window.qmLog.debug(null, 'getQuantiModoClientId returns ' + getQuantiModoClientId(), null);
        if(getQuantiModoClientId()){
            return 'configs/' + getQuantiModoClientId() + '.js';
        } else {
            return 'configs/' + appsManager.defaultApp + '.js';
        }
    },
    getPrivateConfig : function(){
        if(getQuantiModoClientId()){
            return './private_configs/'+ getQuantiModoClientId() + '.config.js';
        } else {
            return './private_configs/'+ appsManager.defaultApp + '.config.js';
        }
    },
    getQuantiModoClientId: function () {
        return getQuantiModoClientId();
    },
    getQuantiModoApiUrl: function () {
        var apiUrl = window.urlHelper.getParam(qm.items.apiUrl);
        if(!apiUrl){apiUrl = qm.storage.getItem(qm.items.apiUrl);}
        if(!apiUrl && window.location.origin.indexOf('staging.quantimo.do') !== -1){apiUrl = "https://staging.quantimo.do";}
        if(!apiUrl && window.location.origin.indexOf('local.quantimo.do') !== -1){apiUrl = "https://local.quantimo.do";}
        if(!apiUrl && window.location.origin.indexOf('utopia.quantimo.do') !== -1){apiUrl = "https://utopia.quantimo.do";}
        if(!apiUrl && window.location.origin.indexOf('localhost:8100') !== -1){return "https://app.quantimo.do";} // Ionic serve
        if(!apiUrl){apiUrl = "https://app.quantimo.do";}
        if(apiUrl.indexOf("https://") === -1){apiUrl = "https://" + apiUrl;}
        apiUrl = apiUrl.replace("https://https", "https");
        if(window.location.port && window.location.port !== "443"){apiUrl += ":" + window.location.port;}
        return apiUrl;
    },
    shouldWeUseLocalConfig: function (clientId) {
        if(clientId === "default"){return true;}
        if(qm.platform.isMobile()){return true;}
        var designMode = window.location.href.indexOf('configuration-index.html') !== -1;
        if(designMode){return false;}
        if(getClientIdFromQueryParameters() === 'app'){return true;}
    }
};
function getAppName() {
    if(getChromeManifest()){return getChromeManifest().name;}
    return window.urlHelper.getParam('appName');
}
function getClientId() {
    if(appSettings){return appSettings.clientId;}
    return window.urlHelper.getParam('clientId');
}
function getAppVersion() {
    if(getChromeManifest()){return getChromeManifest().version;}
    if(appSettings){return appSettings.versionNumber;}
    return window.urlHelper.getParam('appVersion');
}
qm.auth.getAndSaveAccessTokenFromCurrentUrl = function(){
    qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl " + window.location.href);
    var accessTokenFromUrl = qm.auth.getAccessTokenFromCurrentUrl();
    if(accessTokenFromUrl){
        qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl saving " + accessTokenFromUrl);
        qm.auth.saveAccessToken(accessTokenFromUrl);
    }
    return accessTokenFromUrl;
};
qm.auth.saveAccessToken = function(accessToken){
    if(!urlHelper.getParam('doNotRemember')){
        qmLog.authDebug("saveAccessToken: Saving access token in local storage because doNotRemember is not set");
        qm.storage.setItem(qm.items.accessToken, accessToken);
    }
};
qm.auth.getAccessTokenFromUrlUserOrStorage = function() {
    if(qm.auth.getAndSaveAccessTokenFromCurrentUrl()){return qm.auth.getAndSaveAccessTokenFromCurrentUrl();}
    if(qm.userHelper.getUser() && qm.userHelper.getUser().accessToken){return qm.userHelper.getUser().accessToken;}
    if(qm.storage.getItem(qm.items.accessToken)){return qm.storage.getItem(qm.items.accessToken);}
    qmLog.info("No access token or user!");
    return null;
};
function multiplyScreenHeight(factor) {return parseInt(factor * screen.height);}
function multiplyScreenWidth(factor) {return parseInt(factor * screen.height);}
function getChromeRatingNotificationParams(trackingReminderNotification){
    return { url: getRatingNotificationPath(trackingReminderNotification), type: 'panel', top: screen.height - 150,
        left: screen.width - 380, width: 390, height: 110, focused: true};
}
function addGlobalQueryParameters(url) {
    if (qm.auth.getAccessTokenFromUrlUserOrStorage()) {
        url = addQueryParameter(url, 'access_token', qm.auth.getAccessTokenFromUrlUserOrStorage());
    } else {
        window.qmLog.error(null, 'No access token!');
        showSignInNotification();
    }
    if(getAppName()){url = addQueryParameter(url, 'appName', getAppName());}
    if(getAppVersion()){url = addQueryParameter(url, 'appVersion', getAppVersion());}
    if(getClientId()){url = addQueryParameter(url, 'clientId', getClientId());}
    return url;
}
qm.notifications.getNumberInGlobalsOrLocalStorage = function(){
    var notifications = qm.notifications.getFromGlobalsOrLocalStorage();
    if(notifications){return notifications.length;}
    return 0;
};
qm.api.get = function(url, successHandler, errorHandler){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4) {
            var json = xobj.responseText;
            if(json.indexOf('DOCTYPE html') > -1){
                qmLog.error("Could not get " + url);
                if(errorHandler){errorHandler(json);}
            } else {
                window.qmLog.debug('Got appSettings from configs/default.config.json', null, json);
                try {
                    var parsedResponse = JSON.parse(json);
                } catch (error) {
                    if(url !== "configs/default.config.json"){
                        qmLog.error(url + " error: " + error, "Could not parse json from " + url + "!  json: " + json, {});
                    }
                    if(errorHandler){errorHandler(json);}
                    return;
                }
                if(successHandler){successHandler(parsedResponse);}
            }
        } else {
            window.qmLog.debug('Could not get appSettings from configs/default.config.json! xobj.readyState:' + xobj.readyState);
        }
    };
    xobj.send(null);
};
function loadAppSettings() {  // I think adding appSettings to the chrome manifest breaks installation
    qm.api.get('configs/default.config.json', function (parsedResponse) {
        window.qmLog.debug('Got appSettings from configs/default.config.json', null, parsedResponse);
        appSettings = parsedResponse;
    }, function () {
        qmLog.error("Could not get appSettings from configs/default.config.json");
    });
}
qm.api.getAppSettingsUrl = function () {
    var settingsUrl = 'configs/default.config.json';
    var clientId = appsManager.getQuantiModoClientId();
    if(!appsManager.shouldWeUseLocalConfig(clientId)){
        settingsUrl = appsManager.getQuantiModoApiUrl() + '/api/v1/appSettings?clientId=' + clientId;
        if(window.designMode){settingsUrl += '&designMode=true';}
    }
    window.qmLog.debug(null, 'Getting app settings from ' + settingsUrl, null);
    return settingsUrl;
};
if(!window.urlHelper.getParam('clientId')){loadAppSettings();}
function getAppHostName() {
    if(appSettings && appSettings.apiUrl){return "https://" + appSettings.apiUrl;}
    return "https://app.quantimo.do";
}
window.pushMeasurements = function(measurements, onDoneListener) {
	postToQuantiModo(measurements,"v1/measurements", onDoneListener);
};
qm.notifications.postTrackingReminderNotifications = function(trackingReminderNotifications, onDoneListener) {
    qmLog.pushDebug("postTrackingReminderNotifications", JSON.stringify(trackingReminderNotifications), trackingReminderNotifications);
    if(!qm.arrayHelper.variableIsArray(trackingReminderNotifications)){trackingReminderNotifications = [trackingReminderNotifications];}
    if(!onDoneListener){
        onDoneListener = function (response) {
            qmLog.pushDebug("postTrackingReminderNotifications response ", JSON.stringify(response), response);
        }
    }
    postToQuantiModo(trackingReminderNotifications, "v1/trackingReminderNotifications", onDoneListener);
};
function postToQuantiModo(body, path, onDoneListener) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST",  window.qm.apiHelper.getRequestUrl(path), true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {  // If the request is completed
            console.log("POST " + path + " response:" + xhr.responseText);
            if(onDoneListener) {onDoneListener(xhr.responseText);}
        }
    };
    xhr.send(JSON.stringify(body));
}
function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // or Object.prototype.hasOwnProperty.call(obj, prop)
            result++;
        }
    }
    return result;
}
window.qm.apiHelper.getRequestUrl = function(path) {
    var url = addGlobalQueryParameters(getAppHostName() + "/api/" + path);
    console.log("Making API request to " + url);
    return url;
};
qm.storage.setTrackingReminderNotifications = function(notifications){
    if(!notifications){
        qmLog.error("No notifications provided to qm.storage.setTrackingReminderNotifications");
        return;
    }
    qmLog.info("Saving " + notifications.length + " notifications to local storage", null, {notifications: notifications});
    qm.notifications.setLastNotificationsRefreshTime();
    window.qm.chrome.updateChromeBadge(notifications.length);
    qm.storage.setItem(qm.items.trackingReminderNotifications, notifications);
};
qm.notifications.refreshNotifications = function(successHandler, errorHandler) {
    var type = "GET";
    var route = qm.apiPaths.trackingReminderNotificationsPast;
    if(!canWeMakeRequestYet(type, route, {blockRequests: true, minimumSecondsBetweenRequests: 300})){
        if(errorHandler){errorHandler();}
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open(type, window.qm.apiHelper.getRequestUrl(route), false);
    xhr.onreadystatechange = function () {
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var responseObject = JSON.parse(xhr.responseText);
            qm.storage.setTrackingReminderNotifications(responseObject.data);
            if(successHandler){successHandler(responseObject.data);}
        }
    };
    xhr.send();
};
qm.notifications.refreshAndShowPopupIfNecessary = function(notificationParams) {
    qm.notifications.refreshNotifications(notificationParams, function(trackingReminderNotifications){
        var ratingNotification = window.qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
        var numberOfWaitingNotifications = objectLength(trackingReminderNotifications);
        if(ratingNotification){
            openOrFocusChromePopupWindow(getChromeRatingNotificationParams(ratingNotification));
            qm.chrome.updateChromeBadge(0);
        } else if (numberOfWaitingNotifications > 0) {
            qm.chrome.createSmallNotificationAndOpenInboxInBackground();
        }
    });
    return notificationParams;
};
function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm) {
    if(!qm.platform.isChromeExtension()){return;}
	window.qmLog.debug('showNotificationOrPopupForAlarm alarm: ', null, alarm);
    if(!qm.userHelper.withinAllowedNotificationTimes()){return false;}
    if(qm.notifications.getNumberInGlobalsOrLocalStorage()){
        qm.chrome.createSmallNotificationAndOpenInboxInBackground();
    } else {
        qm.notifications.refreshAndShowPopupIfNecessary();
    }

}
/**
 * @return {boolean}
 */
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (exception) {
        return false;
    }
    return true;
}
function deleteFromArrayByProperty(localStorageItemArray, propertyName, propertyValue) {
    var elementsToKeep = [];
    for(var i = 0; i < localStorageItemArray.length; i++){
        if(localStorageItemArray[i][propertyName] !== propertyValue){elementsToKeep.push(localStorageItemArray[i]);}
    }
    return elementsToKeep;
}
window.qm.storage.deleteByProperty = function (localStorageItemName, propertyName, propertyValue){
    var localStorageItemArray = qm.storage.getItem(localStorageItemName);
    if(!localStorageItemArray){
        window.qmLog.info('Local storage item ' + localStorageItemName + ' not found! Local storage items: ' + JSON.stringify(qm.storage.getLocalStorageList()));
    } else {
        qm.storage.setItem(localStorageItemName, deleteFromArrayByProperty(localStorageItemArray, propertyName, propertyValue));
    }
};
window.qm.storage.deleteByPropertyInArray = function (localStorageItemName, propertyName, objectsArray){
    var localStorageItemArray = qm.storage.getItem(localStorageItemName);
    if(!localStorageItemArray){
        window.qmLog.info('Local storage item ' + localStorageItemName + ' not found! Local storage items: ' + JSON.stringify(qm.storage.getLocalStorageList()));
    } else {
        var arrayOfValuesForProperty = objectsArray.map(function(a) {return a[propertyName];});
        for (var i=0; i < arrayOfValuesForProperty.length; i++) {
            localStorageItemArray = deleteFromArrayByProperty(localStorageItemArray, propertyName, arrayOfValuesForProperty[i]);
        }
        qm.storage.setItem(localStorageItemName, localStorageItemArray);
    }
};
function addQueryParameter(url, name, value){
    if(url.indexOf('?') === -1){return url + "?" + name + "=" + value;}
    return url + "&" + name + "=" + value;
}
window.qm.storage.getLocalStorageList = function(){
    var localStorageItemsArray = [];
    for (var i = 0; i < localStorage.length; i++){
        var key = localStorage.key(i);
        localStorageItemsArray.push({name: key});
    }
    return localStorageItemsArray;
};
window.qm.storage.getAllLocalStorageDataWithSizes = function(summary){
    var localStorageItemsArray = [];
    for (var i = 0; i < localStorage.length; i++){
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        if(summary){value = value.substring(0, 20) + '...';}
        localStorageItemsArray.push({
            name: key,
            value: value,
            kB: Math.round(localStorage.getItem(key).length*16/(8*1024))
        });
    }
    return localStorageItemsArray.sort( function ( a, b ) { return b.kB - a.kB; } );
};
window.qm.storage.getWithFilters = function(localStorageItemName, filterPropertyName, filterPropertyValue,
                                                                 lessThanPropertyName, lessThanPropertyValue,
                                                                 greaterThanPropertyName, greaterThanPropertyValue) {
    var unfilteredElementArray = [];
    var i;
    var matchingElements = qm.storage.getItem(localStorageItemName);
    if(!matchingElements){return null;}
    if(matchingElements.length){
        if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined") {
            window.qmLog.error(greaterThanPropertyName + ' greaterThanPropertyName does not exist for ' + localStorageItemName);
        }
        if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
            window.qmLog.error(filterPropertyName + ' filterPropertyName does not exist for ' + localStorageItemName);
        }
        if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
            window.qmLog.error(lessThanPropertyName + ' lessThanPropertyName does not exist for ' + localStorageItemName);
        }
    }
    if(filterPropertyName && typeof filterPropertyValue !== "undefined" && filterPropertyValue !== null){
        if(matchingElements){unfilteredElementArray = matchingElements;}
        matchingElements = [];
        if(typeof filterPropertyValue === "string"){filterPropertyValue = filterPropertyValue.toLowerCase();}
        for(i = 0; i < unfilteredElementArray.length; i++){
            var currentPropertyValue = unfilteredElementArray[i][filterPropertyName];
            if(typeof currentPropertyValue === "string"){currentPropertyValue = currentPropertyValue.toLowerCase();}
            if(currentPropertyValue === filterPropertyValue){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
    }
    if(lessThanPropertyName && lessThanPropertyValue){
        if(matchingElements){unfilteredElementArray = matchingElements;}
        matchingElements = [];
        for(i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][lessThanPropertyName] < lessThanPropertyValue){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
    }
    if(greaterThanPropertyName && greaterThanPropertyValue){
        if(matchingElements){unfilteredElementArray = matchingElements;}
        matchingElements = [];
        for(i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][greaterThanPropertyName] > greaterThanPropertyValue){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
    }
    return matchingElements;
};
window.qm.storage.getTrackingReminderNotifications = function(variableCategoryName, limit) {
    var trackingReminderNotifications = window.qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'variableCategoryName', variableCategoryName);
    if(!trackingReminderNotifications){ trackingReminderNotifications = []; }
    if(limit){
        try {
            trackingReminderNotifications = trackingReminderNotifications.slice(0, limit);
        } catch (error) {
            qmLog.error(error, null, {trackingReminderNotifications: trackingReminderNotifications});
            trackingReminderNotifications = JSON.parse(JSON.stringify(trackingReminderNotifications));
            trackingReminderNotifications = trackingReminderNotifications.slice(0, limit);
        }
    }
    if(trackingReminderNotifications.length){
        if (qm.platform.isChromeExtension()) {
            //noinspection JSUnresolvedFunction
            qm.chrome.updateChromeBadge(trackingReminderNotifications.length);
        }
    }
    return trackingReminderNotifications;
};
window.qm.storage.getAsString = function(key) {
    var item = qm.storage.getItem(key);
    if(item === "null" || item === "undefined"){
        qm.storage.removeItem(key);
        return null;
    }
    return item;
};
window.qm.storage.deleteById = function(localStorageItemName, elementId){
    window.qm.storage.deleteByProperty(localStorageItemName, 'id', elementId);
};
window.qm.storage.removeItem = function(key){
    qmLog.debug("Removing " + key + " from local storage");
    delete qm.globals[key];
    return localStorage.removeItem(key);
};
window.qm.storage.clear = function(){
    localStorage.clear();
    qm.globals = {};
};
window.qm.storage.getElementOfLocalStorageItemById = function(localStorageItemName, elementId){
    var localStorageItemArray = qm.storage.getItem(localStorageItemName);
    if(!localStorageItemArray){
        console.warn("Local storage item " + localStorageItemName + " not found");
    } else {
        for(var i = 0; i < localStorageItemArray.length; i++){
            if(localStorageItemArray[i].id === elementId){return localStorageItemArray[i];}
        }
    }
};
window.qm.storage.addToOrReplaceByIdAndMoveToFront = function(localStorageItemName, replacementElementArray){
    qmLog.debug('qm.storage.addToOrReplaceByIdAndMoveToFront in ' + localStorageItemName + ': ' +
        JSON.stringify(replacementElementArray).substring(0,20)+'...');
    if(!(replacementElementArray instanceof Array)){
        replacementElementArray = [replacementElementArray];
    }
    // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
    var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
    var localStorageItemArray = qm.storage.getItem(localStorageItemName);
    var found = false;
    if(localStorageItemArray){  // NEED THIS DOUBLE LOOP IN CASE THE STUFF WE'RE ADDING IS AN ARRAY
        for(var i = 0; i < localStorageItemArray.length; i++){
            found = false;
            for (var j = 0; j < replacementElementArray.length; j++){
                if(replacementElementArray[j].id &&
                    localStorageItemArray[i].id === replacementElementArray[j].id){
                    found = true;
                }
            }
            if(!found){elementsToKeep.push(localStorageItemArray[i]);}
        }
    }
    qm.storage.setItem(localStorageItemName, elementsToKeep);
    return elementsToKeep;
};
window.qm.storage.setGlobal = function(key, value){
    if(key === "userVariables" && typeof value === "string"){
        qmLog.error("userVariables should not be a string!");
    }
    qm.globals[key] = value;
};
function getSizeInKiloBytes(string) {
    if(typeof value !== "string"){string = JSON.stringify(string);}
    return Math.round(string.length*16/(8*1024));
}
window.qm.storage.setItem = function(key, value){
    if(typeof value === "undefined"){
        qmLog.error("value provided to qm.storage.setItem is undefined!");
        return;
    }
    if(value === qm.storage.getGlobal(key)){
        qmLog.debug("Not setting " + key + " in localStorage because global is already set to " + JSON.stringify(value));
        return;
    }
    qm.storage.setGlobal(key, value);
    var sizeInKb = getSizeInKiloBytes(value);
    if(sizeInKb > 2000){
        if(qm.arrayHelper.variableIsArray(value) && value.length > 1){
            qmLog.error(key + " is " + sizeInKb + "kb so we can't save to localStorage so removing last element until less than 2MB...");
            value = qm.arrayHelper.removeLastItemsUntilSizeLessThan(2000, value);
        } else {
            qmLog.error(key + " is " + sizeInKb + "kb so we can't save to localStorage!");
            return;
        }
    }
    if(typeof value !== "string"){value = JSON.stringify(value);}
    var summaryValue = value;
    if(summaryValue){summaryValue = value.substring(0, 18);}
    window.qmLog.debug('Setting localStorage.' + key + ' to ' + summaryValue + '...');
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        function deleteLargeLocalStorageItems(localStorageItemsArray){
            for (var i = 0; i < localStorageItemsArray.length; i++){
                if(localStorageItemsArray[i].kB > 2000){ qm.storage.removeItem(localStorageItemsArray[i].name); }
            }
        }
        var metaData = { localStorageItems: qm.storage.getAllLocalStorageDataWithSizes(true) };
        metaData['size_of_'+key+"_in_kb"] = sizeInKb;
        var name = 'Error saving ' + key + ' to local storage: ' + error.message;
        window.qmLog.error(name, null, metaData);
        deleteLargeLocalStorageItems(metaData.localStorageItems);
        qm.storage.setItem(key, value);
    }
};
window.qm.storage.getGlobal = function(key){
    if(typeof qm.globals[key] === "undefined"){return null;}
    if(qm.globals[key] === "false"){return false;}
    if(qm.globals[key] === "true"){return true;}
    if(qm.globals[key] === "null"){return null;}
    return qm.globals[key];
};
window.qm.storage.getItem = function(key){
    if(!key){
        qmLog.error("No key provided to qm.storage.getItem");
        return null;
    }
    var fromGlobals = qm.storage.getGlobal(key);
    if(fromGlobals){
        qmLog.debug("Got " + key + " from globals");
        return fromGlobals;
    }
    var item = localStorage.getItem(key);
    if(item === "undefined"){
        qmLog.error(key + " from localStorage is undefined!");
        localStorage.removeItem(key);
        return null;
    }
    if (item && typeof item === "string"){
        qm.globals[key] = parseIfJsonString(item);
        window.qmLog.debug('Got ' + key + ' from localStorage: ' + item.substring(0, 18) + '...');
        return qm.globals[key];
    } else {
        window.qmLog.debug(key + ' not found in localStorage');
    }
    return null;
};
var parseIfJsonString = function(stringOrObject) {
    if(!stringOrObject){return stringOrObject;}
    if(typeof stringOrObject !== "string"){return stringOrObject;}
    try {
        return JSON.parse(stringOrObject);
    } catch (e) {
        return stringOrObject;
    }
};
window.qm.storage.clearOAuthTokens = function(){
    qm.auth.saveAccessToken(null);
    window.qm.storage.setItem('refreshToken', null);
    window.qm.storage.setItem('expiresAtMilliseconds', null);
};
window.qm.storage.appendToArray = function(localStorageItemName, elementToAdd){
    function removeArrayElementsWithSameId(localStorageItem, elementToAdd) {
        if(elementToAdd.id){
            localStorageItem = localStorageItem.filter(function( obj ) {
                return obj.id !== elementToAdd.id;
            });
        }
        return localStorageItem;
    }
    var array = window.qm.storage.getItem(localStorageItemName) || [];
    array = removeArrayElementsWithSameId(array, elementToAdd);
    array.push(elementToAdd);
    window.qm.storage.setItem(localStorageItemName, array);
};
window.qm.auth.saveAccessTokenResponse = function (accessResponse) {
    var accessToken;
    if(typeof accessResponse === "string"){accessToken = accessResponse;} else {accessToken = accessResponse.accessToken || accessResponse.access_token;}
    if (accessToken) {
        window.qm.storage.setItem('accessToken', accessToken);
    } else {
        qmLog.error('No access token provided to qm.auth.saveAccessTokenResponse');
        return;
    }
    var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;
    if (refreshToken) {qm.storage.setItem(qm.items.refreshToken, refreshToken);}
    /** @namespace accessResponse.expiresAt */
    var expiresAt = accessResponse.expires || accessResponse.expiresAt || accessResponse.accessTokenExpires;
    var expiresAtMilliseconds;
    var bufferInMilliseconds = 86400 * 1000;  // Refresh a day in advance
    if(accessResponse.accessTokenExpiresAtMilliseconds){
        expiresAtMilliseconds = accessResponse.accessTokenExpiresAtMilliseconds;
    } else if (typeof expiresAt === 'string' || expiresAt instanceof String){
        expiresAtMilliseconds = window.qm.timeHelper.getUnixTimestampInMilliseconds(expiresAt);
    } else if (expiresAt === parseInt(expiresAt, 10) && expiresAt < window.qm.timeHelper.getUnixTimestampInMilliseconds()) {
        expiresAtMilliseconds = expiresAt * 1000;
    } else if(expiresAt === parseInt(expiresAt, 10) && expiresAt > window.qm.timeHelper.getUnixTimestampInMilliseconds()){
        expiresAtMilliseconds = expiresAt;
    } else {
        // calculate expires at
        /** @namespace accessResponse.expiresIn */
        var expiresInSeconds = accessResponse.expiresIn || accessResponse.expires_in;
        expiresAtMilliseconds = window.qm.timeHelper.getUnixTimestampInMilliseconds() + expiresInSeconds * 1000;
        qmLog.authDebug("Expires in is " + expiresInSeconds + ' seconds. This results in expiresAtMilliseconds being: ' + expiresAtMilliseconds);
    }
    if(expiresAtMilliseconds){
        qm.storage.setItem(qm.items.expiresAtMilliseconds, expiresAtMilliseconds - bufferInMilliseconds);
        return accessToken;
    } else {
        qmLog.error('No expiresAtMilliseconds!');
        Bugsnag.notify('No expiresAtMilliseconds!',
            'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qm.storage.getAsString('user'),
            {groupingHash: 'No expiresAtMilliseconds!'},
            "error");
    }
    var groupingHash = 'Access token expiresAt not provided in recognizable form!';
    qmLog.error(groupingHash);
    Bugsnag.notify(groupingHash,
        'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qm.storage.getAsString('user'),
        {groupingHash: groupingHash}, "error");
};
qm.notifications.deleteByVariableName = function(variableName){
    qm.storage.deleteByProperty(qm.items.trackingReminderNotifications, 'variableName', variableName);
};
function getUnique(array, propertyName) {
    var flags = [], output = [], l = array.length, i;
    for( i=0; i<l; i++) {
        if(flags[array[i][propertyName]]) {continue;}
        flags[array[i][propertyName]] = true;
        output.push(array[i]);
    }
    return output;
}
qm.notifications.getAllUniqueRatingNotifications = function() {
    qmLog.info("Called getAllUniqueRatingNotifications");
    var ratingNotifications = qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'unitAbbreviatedName', '/5');
    if(!ratingNotifications){
        qmLog.info("No rating notifications in storage!");
        return null;
    }
    qmLog.info("Got " + ratingNotifications.length + " total NON-UNIQUE rating notification from storage");
    var unique = getUnique(ratingNotifications, 'variableName');
    qmLog.info("Got " + unique.length + " UNIQUE rating notifications");
    return unique;
};
qm.notifications.getAllUniqueNotifications = function() {
    qmLog.info("Called getAllUniqueRatingNotifications");
    var notifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
    if(!notifications){
        qmLog.info("No notifications in storage!");
        return null;
    }
    qmLog.info("Got " + notifications.length + " total NON-UNIQUE notification from storage");
    var unique = getUnique(notifications, 'variableName');
    qmLog.info("Got " + unique.length + " UNIQUE notifications");
    return unique;
};
qm.notifications.getNotificationsDueInLast24 = function() {
    var allNotifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
    if(!allNotifications){
        qmLog.info("No NotificationsDueInLast24 in localStorage");
        return null;
    }
    var last24 = [];
    for (var i = 0; i < allNotifications.length; i++) {
        if(qm.timeHelper.hoursAgo(allNotifications[i].trackingReminderNotificationTimeEpoch) < 24){
            last24.push(allNotifications[i]);
        }
    }
    return last24;
};
qm.notifications.getUniqueNotificationsDueInLast24 = function() {
    var last24 = qm.notifications.getNotificationsDueInLast24();
    if(!last24){
        qmLog.info("No UNIQUE NotificationsDueInLast24 in localStorage");
        return null;
    }
    qmLog.info("Got " + last24.length + " total NON-UNIQUE notification due in last 24 from storage");
    var unique = getUnique(last24, 'variableName');
    qmLog.info("Got " + unique.length + " UNIQUE notifications");
    return unique;
};
qm.notifications.deleteById = function(id){qm.storage.deleteById(qm.items.trackingReminderNotifications, id);};
qm.notifications.undo = function(){
    var notificationsSyncQueue = qm.storage.getItem(qm.items.notificationsSyncQueue);
    if(!notificationsSyncQueue){ return false; }
    notificationsSyncQueue[0].hide = false;
    qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.trackingReminderNotifications, notificationsSyncQueue[0]);
    qm.storage.deleteByProperty(qm.items.notificationsSyncQueue, 'trackingReminderNotificationId', notificationsSyncQueue[0].trackingReminderNotificationId);
};
window.qm.notifications.getMostRecentRatingNotification = function (){
    var ratingNotifications = window.qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'unitAbbreviatedName', '/5');
    ratingNotifications = window.sortByProperty(ratingNotifications, 'trackingReminderNotificationTime');
    if(ratingNotifications.length) {
        var notification = ratingNotifications[ratingNotifications.length - 1];
        if(notification.trackingReminderNotificationTimeEpoch < qm.timeHelper.getUnixTimestampInSeconds() - 86400){
            window.qmLog.info('Got this notification but it\'s from yesterday: ' + JSON.stringify(notification).substring(0, 140) + '...');
            //return;
        }
        window.qmLog.info(null, 'Got this notification: ' + JSON.stringify(notification).substring(0, 140) + '...', null);
        //window.qm.storage.deleteTrackingReminderNotification(notification.trackingReminderNotificationId);
        //qm.storage.deleteByProperty(qm.items.trackingReminderNotifications, 'variableName', notification.variableName);
        return notification;
    } else {
        console.info('No rating notifications for popup');
        qm.notifications.getLastNotificationsRefreshTime();
        qm.notifications.refreshNotifications();
        return null;
    }
};

window.sortByProperty = function(arrayToSort, propertyName){
    if(!qm.arrayHelper.variableIsArray(arrayToSort)){
        qmLog.error("Cannot sort by " + propertyName + " because it's not an array!")
        return arrayToSort;
    }
    if(arrayToSort.length < 2){return arrayToSort;}
    if(propertyName.indexOf('-') > -1){
        arrayToSort.sort(function(a, b){return b[propertyName.replace('-', '')] - a[propertyName.replace('-', '')];});
    } else {
        arrayToSort.sort(function(a, b){return a[propertyName] - b[propertyName];});
    }
    return arrayToSort;
};
window.qm.notifications.refreshIfEmpty = function(callback){
    if(!qm.notifications.getNumberInGlobalsOrLocalStorage()){
        window.qmLog.info('No notifications in local storage');
        qm.notifications.refreshNotifications(callback);
        return true;
    }
    window.qmLog.info(qm.notifications.getNumberInGlobalsOrLocalStorage() + ' notifications in local storage');
    return false
};
window.qm.notifications.refreshIfEmptyOrStale = function(callback){
    qmLog.info("qm.notifications.refreshIfEmptyOrStale");
    if (!qm.notifications.getNumberInGlobalsOrLocalStorage() || qm.notifications.getSecondsSinceLastNotificationsRefresh() > 3600){
        window.qmLog.info('Refreshing notifications because empty or last refresh was more than an hour ago');
        qm.notifications.refreshNotifications(callback);
    } else {
        window.qmLog.info('Not refreshing notifications because last refresh was last than an hour ago and we have notifications in local storage');
    }
};
window.qm.storage.deleteTrackingReminderNotification = function(body){
    var trackingReminderNotificationId = body;
    if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotification){trackingReminderNotificationId = body.trackingReminderNotification.id;}
    if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotificationId){trackingReminderNotificationId = body.trackingReminderNotificationId;}
    if(qm.storage.getTrackingReminderNotifications() && qm.storage.getTrackingReminderNotifications().length){
        window.qmLog.info(null, 'Deleting notification with id ' + trackingReminderNotificationId, null);
        window.qm.storage.deleteById(qm.items.trackingReminderNotifications, trackingReminderNotificationId);
    } else {
        window.qm.notifications.refreshIfEmpty();
    }
};
window.qm.notifications.drawOverAppsEnabled = function(){
    return qm.storage.getItem(qm.items.drawOverAppsEnabled);
};
window.qm.notifications.addToSyncQueue = function(trackingReminderNotification){
    qm.notifications.deleteById(trackingReminderNotification.id);
    qm.userVariableHelper.updateLatestMeasurementTime(trackingReminderNotification.variableName, trackingReminderNotification.modifiedValue);
    qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.notificationsSyncQueue, trackingReminderNotification);
};
window.showAndroidPopupForMostRecentNotification = function(){
    if(!qm.notifications.drawOverAppsEnabled()){window.qmLog.info(null, 'Can only show popups on Android', null); return;}
    if(qm.notifications.getMostRecentRatingNotificationNotInSyncQueue()) {
        window.drawOverAppsRatingNotification(qm.notifications.getMostRecentRatingNotificationNotInSyncQueue());
    // } else if (window.qm.storage.getTrackingReminderNotifications().length) {
    //     window.drawOverAppsCompactInboxNotification();  // TODO: Fix me
    } else {
        window.qmLog.info('No notifications for popup! Refreshing if empty...');
        window.qm.notifications.refreshIfEmpty();
    }
};
function getRatingNotificationPath(trackingReminderNotification){
    return "android_popup.html?variableName=" + trackingReminderNotification.variableName +
    "&valence=" + trackingReminderNotification.valence +
    "&trackingReminderNotificationId=" + trackingReminderNotification.trackingReminderNotificationId +
    "&clientId=" + window.getClientId() +
    "&accessToken=" + qm.auth.getAccessTokenFromUrlUserOrStorage();
}
window.drawOverAppsRatingNotification = function(trackingReminderNotification, force) {
    window.drawOverAppsPopup(getRatingNotificationPath(trackingReminderNotification), force);
};
window.drawOverAppsCompactInboxNotification = function() {
    window.drawOverAppsPopup(qm.chrome.compactInboxWindowParams.url);
};
window.drawOverAppsPopup = function(path, force){
    if(typeof window.overApps === "undefined"){
        window.qmLog.error(null, 'window.overApps is undefined!');
        return;
    }
    if(!force && !qm.notifications.canWeShowPopupYet(path)){return;}
    //window.overApps.checkPermission(function(msg){console.log("checkPermission: " + msg);});
    var options = {
        path: path,          // file path to display as view content.
        hasHead: false,              // display over app head image which open the view up on click.
        dragToSide: false,          // enable auto move of head to screen side after dragging stop.
        enableBackBtn: true,       // enable hardware back button to close view.
        enableCloseBtn: true,      //  whether to show native close btn or to hide it.
        verticalPosition: "bottom",    // set vertical alignment of view.
        horizontalPosition: "center"  // set horizontal alignment of view.
    };
    window.qmLog.info('drawOverAppsRatingNotification options: ' + JSON.stringify(options));
    /** @namespace window.overApps */
    window.overApps.startOverApp(options, function (success){
        window.qmLog.info('startOverApp success: ' + success, null);
    },function (err){
        window.qmLog.error('startOverApp error: ' + err);
    });
};
qm.notifications.setLastPopupTime = function(time){
    if(typeof time === "undefined"){time = qm.timeHelper.getUnixTimestampInSeconds();}
    qm.storage.setItem(qm.items.lastPopupNotificationUnixtimeSeconds, time);
    return true;
};
qm.notifications.getTimeSinceLastPopupString = function(){
    return qm.timeHelper.getTimeSinceString(qm.notifications.getLastPopupUnixtime());
};
qm.notifications.getLastPopupUnixtime = function(){
    return qm.storage.getItem(qm.items.lastPopupNotificationUnixtimeSeconds);
};
qm.notifications.getSecondsSinceLastPopup = function(){
    return qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getLastPopupUnixtime();
};
qm.notifications.getMostFrequentReminderIntervalInSeconds = function(){
    return qm.notifications.getMostFrequentReminderIntervalInMinutes() * 60;
};
qm.notifications.canWeShowPopupYet = function(path) {
    if(!qm.notifications.getLastPopupUnixtime()){
        qm.notifications.setLastPopupTime();
        return true;
    }
    if(qm.notifications.getSecondsSinceLastPopup() > qm.notifications.getMostFrequentReminderIntervalInSeconds()){
        qm.notifications.setLastPopupTime();
        return true;
    }
    qmLog.error('Too soon to show popup!', 'Cannot show popup because last one was only ' + qm.notifications.getTimeSinceLastPopupString() +
        ' and getMostFrequentReminderIntervalInMinutes is ' + qm.notifications.getMostFrequentReminderIntervalInMinutes() + ". path: " + path);
    return false;
};
qm.notifications.getMostFrequentReminderIntervalInMinutes = function(trackingReminders){
    if(!trackingReminders){trackingReminders = qm.storage.getItem(qm.items.trackingReminders);}
    var shortestInterval = 86400;
    if(trackingReminders){
        for (var i = 0; i < trackingReminders.length; i++) {
            if(trackingReminders[i].reminderFrequency < shortestInterval){
                shortestInterval = trackingReminders[i].reminderFrequency;
            }
        }
    }
    return shortestInterval/60;
};

function getLocalStorageNameForRequest(type, route) {
    return 'last_' + type + '_' + route.replace('/', '_') + '_request_at';
}
window.qm.notifications.setLastNotificationsRefreshTime = function(){
    window.qm.storage.setLastRequestTime("GET", qm.apiPaths.trackingReminderNotificationsPast);
};
window.qm.notifications.getLastNotificationsRefreshTime = function(){
    var lastTime = window.qm.storage.getLastRequestTime("GET", qm.apiPaths.trackingReminderNotificationsPast);
    qmLog.info("Last notifications refresh " + qm.timeHelper.getTimeSinceString(lastTime));
    return lastTime;
};
window.qm.notifications.getSecondsSinceLastNotificationsRefresh = function(){
    qmLog.info("Last notifications refresh " + qm.timeHelper.getTimeSinceString(qm.notifications.getLastNotificationsRefreshTime()));
    return qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getLastNotificationsRefreshTime();
};
window.qm.storage.setLastRequestTime = function(type, route){
    window.qm.storage.setItem(getLocalStorageNameForRequest(type, route), qm.timeHelper.getUnixTimestampInSeconds());
};
window.qm.storage.getLastRequestTime = function(type, route){
    return window.qm.storage.getItem(getLocalStorageNameForRequest(type, route));
};
window.canWeMakeRequestYet = function(type, route, options){
    function getSecondsSinceLastRequest(type, route){
        var secondsSinceLastRequest = 99999999;
        if(window.qm.storage.getLastRequestTime(type, route)){
            secondsSinceLastRequest = qm.timeHelper.secondsAgo(window.qm.storage.getLastRequestTime(type, route));
        }
        return secondsSinceLastRequest;
    }
    var blockRequests = false;
    if(options && options.blockRequests){blockRequests = options.blockRequests;}
    var minimumSecondsBetweenRequests;
    if(options && options.minimumSecondsBetweenRequests){
        minimumSecondsBetweenRequests = options.minimumSecondsBetweenRequests;
    } else {
        minimumSecondsBetweenRequests = 1;
    }
    if(getSecondsSinceLastRequest(type, route) < minimumSecondsBetweenRequests){
        var name = 'Just made a ' + type + ' request to ' + route;
        var message = name + ". We made the same request within the last " + minimumSecondsBetweenRequests + ' seconds (' +
            getSecondsSinceLastRequest(type, route) + ' ago). stackTrace: ' + options.stackTrace;
        if(blockRequests){
            window.qmLog.error('BLOCKING REQUEST: ' + name, 'BLOCKING REQUEST because ' + message, options);
            return false;
        } else {
            window.qmLog.error(name, message, options);
        }
    }
    window.qm.storage.setItem(getLocalStorageNameForRequest(type, route), qm.timeHelper.getUnixTimestampInSeconds());
    return true;
};

window.getUserFromApi = function(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", window.qm.apiHelper.getRequestUrl("user/me"), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var userFromApi = JSON.parse(xhr.responseText);
            if (userFromApi && typeof userFromApi.displayName !== "undefined") {
                qm.userHelper.setUser(userFromApi);
            } else {
                if(qm.platform.isChromeExtension()){
                    var url = window.qm.apiHelper.getRequestUrl("v2/auth/login");
                    chrome.tabs.create({"url": url, "selected": true});
                }
            }
        }
    };
    xhr.send();
};
window.isTestUser = function(){return window.qmUser && window.qmUser.displayName.indexOf('test') !== -1 && window.qmUser.id !== 230;};
window.qm.push.getLastPushTimeStampInSeconds = function(){return qm.storage.getItem(qm.items.lastPushTimestamp);};
window.qm.push.getHoursSinceLastPush = function(){
    return Math.round((window.qm.timeHelper.secondsAgo(qm.push.getLastPushTimeStampInSeconds()))/3600);
};
window.qm.push.getTimeSinceLastPushString = function(){
    return qm.timeHelper.getTimeSinceString(qm.push.getLastPushTimeStampInSeconds());
};
qm.arrayHasItemWithSpecificPropertyValue = function(propertyName, propertyValue, array){
    if(!array){
        qmLog.error("No array provided to arrayHasItemWithSpecificPropertyValue");
        return false;
    }
    for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if(obj[propertyName] && obj[propertyName] === propertyValue){
            return true;
        }
    }
    return false;
};
qm.notifications.getMostRecentRatingNotificationNotInSyncQueue = function(){
    var uniqueRatingNotifications = qm.notifications.getAllUniqueRatingNotifications();
    if(!uniqueRatingNotifications){
        qmLog.info("No uniqueRatingNotifications in storage");
        return null;
    }
    for (var i = 0; i < uniqueRatingNotifications.length; i++) {
        var notification = uniqueRatingNotifications[i];
        if(!qm.arrayHasItemWithSpecificPropertyValue('variableName', notification.variableName, window.notificationsSyncQueue)){
            qmLog.info("Got uniqueRatingNotification not in sync queue: " + notification.variableName);
            return notification;
        }
    }
    qmLog.info("No uniqueRatingNotifications not in sync queue");
    return null;
};
qm.notifications.getMostRecentUniqueNotificationNotInSyncQueue = function(){
    var uniqueNotifications = qm.notifications.getUniqueNotificationsDueInLast24();
    if(!uniqueNotifications || !uniqueNotifications.length){
        qmLog.info("No uniqueRatingNotifications due in last 24 in storage");
        return null;
    }
    for (var i = 0; i < uniqueNotifications.length; i++) {
        var notification = uniqueNotifications[i];
        if(!qm.arrayHasItemWithSpecificPropertyValue('variableName', notification.variableName, window.notificationsSyncQueue)){
            qmLog.info("Got uniqueNotification not in sync queue: " + notification.variableName);
            return notification;
        }
    }
    qmLog.info("No uniqueNotifications not in sync queue");
    return null;
};
qm.api.getBaseUrl = function () {
    //if($rootScope.appSettings.clientId !== "ionic"){return "https://" + $rootScope.appSettings.clientId + ".quantimo.do";}
    if(config.appSettings.apiUrl){
        if(config.appSettings.apiUrl.indexOf('https://') === -1){config.appSettings.apiUrl = "https://" + config.appSettings.apiUrl;}
        return config.appSettings.apiUrl;
    }
    return appsManager.getQuantiModoApiUrl();
};
qm.auth.getAccessTokenFromCurrentUrl = function(){
    qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl " + window.location.href);
    return (urlHelper.getParam('accessToken')) ? urlHelper.getParam('accessToken') : urlHelper.getParam('quantimodoAccessToken');
};
qm.unitHelper.getNonAdvancedUnits = function(){
    var nonAdvancedUnitObjects = [];
    var allUnits = qm.storage.getItem(qm.items.units);
    for (var i = 0; i < allUnits.length; i++) {
        if(!allUnits[i].advanced){
            nonAdvancedUnitObjects.push(allUnits[i]);
        }
    }
    var showMoreUnitsObject = {name: "Show more units", abbreviatedName: "Show more units"};
    nonAdvancedUnitObjects.push(showMoreUnitsObject);
    return nonAdvancedUnitObjects;
};
qm.unitHelper.inNonAdvancedUnitAbbreviatedNames = function(unitAbbreviatedName){
    var nonAdvancedUnitAbbreviatedNames = [];
    var allUnits = qm.storage.getItem(qm.items.units);
    for (var i = 0; i < allUnits.length; i++) {
        if(!allUnits[i].advanced){nonAdvancedUnitAbbreviatedNames.push(allUnits[i].abbreviatedName);}
    }
    return nonAdvancedUnitAbbreviatedNames.indexOf(unitAbbreviatedName) > -1;
};
qm.unitHelper.getManualTrackingUnits = function(){
    var manualTrackingUnitObjects = [];
    var allUnits = qm.storage.getItem(qm.items.units);
    for (var i = 0; i < allUnits.length; i++) {
        if(allUnits[i].manualTracking){manualTrackingUnitObjects.push(allUnits[i]);}
    }
    var showMoreUnitsObject = {name: "Show more units", abbreviatedName: "Show more units"};
    manualTrackingUnitObjects.push(showMoreUnitsObject);
    return manualTrackingUnitObjects;
};
qm.unitHelper.inManualTrackingUnitUnitAbbreviatedNames = function(unitAbbreviatedName){
    var manualTrackingUnitUnitAbbreviatedNames = [];
    var allUnits = qm.storage.getItem(qm.items.units);
    for (var i = 0; i < allUnits.length; i++) {
        if(allUnits[i].manualTracking){manualTrackingUnitUnitAbbreviatedNames.push(allUnits[i].abbreviatedName);}
    }
    return manualTrackingUnitUnitAbbreviatedNames.indexOf(unitAbbreviatedName) > -1;
};
qm.unitHelper.getAllUnits = function(){
    return qm.storage.getItem(qm.items.units);
};
qm.unitHelper.getProgressivelyMoreUnits = function(currentlyDisplayedUnits){
    if(!currentlyDisplayedUnits){return qm.unitHelper.getNonAdvancedUnits();}
    if(currentlyDisplayedUnits === qm.unitHelper.getNonAdvancedUnits()){return qm.unitHelper.getManualTrackingUnits();}
    return qm.unitHelper.getAllUnits();
};
qm.unitHelper.getByAbbreviatedName = function(unitAbbreviatedName){
    var allUnits = qm.storage.getItem(qm.items.units);
    for (var i = 0; i < allUnits.length; i++) {
        if(allUnits[i].abbreviatedName === unitAbbreviatedName){return allUnits[i];}
    }
    return null;
};
qm.unitHelper.indexByAbbreviatedName = function(){
    var allUnits = qm.storage.getItem(qm.items.units);
    qm.unitsIndexedByAbbreviatedName = [];
    for (var i = 0; i < allUnits.length; i++) {
        qm.unitsIndexedByAbbreviatedName[allUnits[i].abbreviatedName] = allUnits[i];
    }
    return qm.unitsIndexedByAbbreviatedName;
};
qm.unitHelper.getUnitArrayContaining = function(currentUnitAbbreviatedName){
    if(!currentUnitAbbreviatedName || currentUnitAbbreviatedName === ""){return qm.unitHelper.getNonAdvancedUnits();}
    if(qm.unitHelper.inNonAdvancedUnitAbbreviatedNames(currentUnitAbbreviatedName)){return qm.unitHelper.getNonAdvancedUnits();}
    if(qm.unitHelper.inManualTrackingUnitUnitAbbreviatedNames(currentUnitAbbreviatedName)){return qm.unitHelper.getManualTrackingUnits();}
    return qm.unitHelper.getAllUnits();
};
qm.unitHelper.getUnitsFromApiAndIndexByAbbreviatedNames = function(successHandler, errorHandler){
    if(qm.storage.getItem(qm.items.units)){
        qm.unitHelper.indexByAbbreviatedName();
        return;
    }
    qm.api.configureClient();
    var apiInstance = new Quantimodo.UnitsApi();
    function callback(error, data, response) {
        if(data){
            qm.storage.setItem(qm.items.units, data);
            qm.unitHelper.indexByAbbreviatedName();
        }
        qm.api.responseHandler(error, data, response, successHandler, errorHandler);
    }
    apiInstance.getUnits(callback);
};
qm.api.generalErrorHandler = function(error, data, response, options) {
    if(!response){return qmLog.error("No API response provided to qmApiGeneralErrorHandler",
        {errorMessage: error, responseData: data, apiResponse: response, requestOptions: options});}
    if(response.status !== 401){
        qmLog.error(response.error.message, null, {apiResponse: response});
    }
};
qm.api.responseHandler = function(error, data, response, successHandler, errorHandler) {
    if(!response){
        qmLog.error("No response provided to qm.api.responseHandler");
        return;
    }
    qmLog.debug(null, response.status + ' response from ' + response.req.url, null);
    if (error) {
        qm.api.generalErrorHandler(error, data, response);
        if(errorHandler){errorHandler(error);}
    } else {
        if(successHandler){successHandler(data, response);}
    }
};
qm.api.configureClient = function() {
    var qmApiClient = Quantimodo.ApiClient.instance;
    var quantimodo_oauth2 = qmApiClient.authentications.quantimodo_oauth2;
    qmApiClient.basePath = qm.api.getBaseUrl() + '/api';
    quantimodo_oauth2.accessToken = qm.auth.getAccessTokenFromUrlUserOrStorage();
    return qmApiClient;
};
