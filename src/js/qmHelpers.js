/* eslint-disable no-console,no-unused-vars */
/** @namespace window.qmLog */
/** @namespace window.qm.chrome */
/* global AppSettings TweenMax, Power1, Sine, Linear, Power3, TimelineMax, Power2 */
/* eslint-env browser */
String.prototype.toCamelCase = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
window.qm = {
    analytics: {
        eventCategories: {
            pushNotifications: "pushNotifications",
            inbox: "inbox"
        }
    },
    appMode: {
        isTesting: function(){
            if(qm.getUser()){
                if(qm.getUser().email && qm.getUser().email.toLowerCase().indexOf('test') !== -1){return true;}
                if(qm.getUser().displayName && qm.getUser().displayName.toLowerCase().indexOf('test') !== -1){return true;}
            }
            return window.location.href.indexOf("medimodo.heroku") !== -1;

        },
        isDevelopment: function(){
            if(window.location.origin.indexOf('http://localhost:') !== -1){return true;}
            return window.location.origin.indexOf('local.quantimo.do') !== -1;
        },
        isStaging: function(){
            return window.location.origin.indexOf('staging.') !== -1;
        },
        isBuilder: function(){
            return window.location.href.indexOf('configuration-index.html') !== -1;
        },
        getAppMode: function(){
            var env = "production";
            if(qm.appMode.isStaging()){env = "staging";}
            if(qm.appMode.isDevelopment()){env = "development";}
            if(qm.appMode.isTesting()){env = "testing";}
            return env;
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
            if(params && params.refresh){return null;}
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
                qmLog.info("No response provided to " + functionName + " qmSdkApiResponseHandler with params " +  JSON.stringify(params));
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
                    qmLog.info("Not authenticated!")
                }
            } else {
                qmLog.error(response.error.message, null, {apiResponse: response});
            }
        },
        addGlobalParams: function (urlParams) {
            var url;
            if(!urlParams){urlParams = {};}
            delete urlParams.force;  // Used locally only
            delete urlParams.excludeLocal;  // Used locally only
            if(typeof urlParams === "string"){
                url = urlParams;
                urlParams = {};
            }
            if(qm.appsManager.getAppSettingsFromMemory()){
                urlParams.appName = encodeURIComponent(qm.appsManager.getAppSettingsFromMemory().appDisplayName);
                if(qm.getAppSettings().versionNumber){
                    urlParams.appVersion = encodeURIComponent(qm.appsManager.getAppSettingsFromMemory().versionNumber);
                } else {
                    qmLog.debug('Version number not specified!', null, 'Version number not specified on qm.getAppSettings()');
                }
            }
            if(!urlParams.accessToken && qm.auth.getAccessTokenFromUrlUserOrStorage()){urlParams.accessToken = qm.auth.getAccessTokenFromUrlUserOrStorage();}
            if(!urlParams.clientId && qm.api.getClientId()){urlParams.clientId = qm.api.getClientId();}
            urlParams.platform = qm.platform.getCurrentPlatform();
            if(window.devCredentials){
                if(window.devCredentials.username){urlParams.log = encodeURIComponent(window.devCredentials.username);}
                if(window.devCredentials.password){urlParams.pwd = encodeURIComponent(window.devCredentials.password);}
            } else {
                qmLog.debug('No dev credentials', null);
            }
            var passableUrlParameters = ['userId', 'log', 'pwd', 'userEmail'];
            for(var i = 0; i < passableUrlParameters.length; i++){
                if(qm.urlHelper.getParam(passableUrlParameters[i])){urlParams[passableUrlParameters[i]] = qm.urlHelper.getParam(passableUrlParameters[i]);}
            }
            for (var property in urlParams) {
                if (urlParams.hasOwnProperty(property)) {
                    if(typeof urlParams[property] === "undefined"){
                        qmLog.error(property + " is undefined!");
                        delete urlParams[property];
                    }
                    if(typeof urlParams[property] === ""){
                        qmLog.error(property + " is empty string!");
                        delete urlParams[property];
                    }
                }
            }
            if(url){
                url = qm.urlHelper.addUrlQueryParamsToUrl(urlParams, url);
                return url;
            }
            return urlParams;
        },
        getClientId: function(successHandler){
            if(qm.api.getClientIdFromQueryParameters() && qm.api.getClientIdFromQueryParameters() !== "default"){
                qm.clientId = qm.api.getClientIdFromQueryParameters();
            }
            if(!qm.clientId){
                qm.clientId = qm.api.getClientIdFromSubDomain();
            }
            if(!qm.clientId && qm.appSettings){
                qm.clientId =  qm.appSettings.clientId;
            }
            if(!qm.clientId && qm.appsManager.getAppSettingsFromMemory() && qm.appsManager.getAppSettingsFromMemory().clientId){
                qm.clientId = qm.appsManager.getAppSettingsFromMemory().clientId;
            }
            // DON'T DO THIS
            // if(!clientId && qm.platform.isMobile()){
            //     window.qmLog.debug('Using ' + qm.urlHelper.getDefaultConfigUrl() + ' because we\'re on mobile');
            //     clientId = "default"; // On mobile
            // }
            if(!qm.clientId){ // Not sure why but this always returns quantimodo
                //clientId = qm.storage.getItem(qm.items.clientId);
            }
            // DON'T DO THIS
            // if(!clientId && window.location.href.indexOf('quantimo.do') === -1){
            //     clientId = "default"; // On mobile
            // }
            if(!qm.clientId){
                qm.clientId = qm.api.getClientIdFromAwsPath();
            }
            if(!qm.clientId){
                qmLog.info("Could not get client id!");
                //clientId = 'quantimodo';
            }
            if (!successHandler) {return qm.clientId;}
            if(qm.clientId){successHandler(qm.clientId);}
            qm.api.getClientIdWithCallback(successHandler);
        },
        getClientIdWithCallback: function(successHandler){
            if(qm.api.getClientId()){
                successHandler(qm.api.getClientId());
                return;
            }
            if(typeof AppSettings !== "undefined"){
                AppSettings.get(
                    function(preferences) {
                        /** @namespace preferences.QuantiModoClientId */
                        qm.clientId = preferences.QuantiModoClientId;
                        /** @namespace preferences.QuantiModoClientSecret */
                        qm.clientSecret = preferences.QuantiModoClientSecret;
                        successHandler(qm.clientId,  preferences.QuantiModoClientSecret);
                    },
                    function(error) {
                        qmLog.error("Error! " + JSON.stringify(error));
                    }, ["QuantiModoClientId", "QuantiModoClientSecret"]);
            }
            qm.appsManager.getAppSettingsFromDefaultConfigJson(function (appSettings) {
                if(appSettings){
                    qm.clientId = appSettings.clientId;
                    successHandler(qm.clientId);
                }
            });
        },
        getClientIdFromQueryParameters: function() {
            var clientId = window.qm.urlHelper.getParam('clientId');
            if(!clientId){clientId = window.qm.urlHelper.getParam('appName');}
            if(!clientId){clientId = window.qm.urlHelper.getParam('lowerCaseAppName');}
            if(!clientId){clientId = window.qm.urlHelper.getParam('quantimodoClientId');}
            if(clientId){qm.storage.setItem('clientId', clientId);}
            return clientId;
        },
        getClientIdFromAwsPath: function() {
            var clientId = qm.stringHelper.getStringBetween(window.location.href, 's3.amazonaws.com/', '/dev');
            return clientId;
        },
        getClientIdFromSubDomain: function(){
            if(window.location.href.indexOf('.quantimo.do') === -1){return null;}
            if(qm.appMode.isBuilder()){return null;}
            function getSubDomain(){
                var full = window.location.host;
                var parts = full.split('.');
                return parts[0].toLowerCase();
            }
            var subDomain = getSubDomain();
            var clientIdFromAppConfigName = qm.appsManager.appConfigFileNames[getSubDomain()];
            if(clientIdFromAppConfigName){
                window.qmLog.debug('Using client id ' + clientIdFromAppConfigName +
                    ' derived from appConfigFileNames using subDomain: ' + subDomain, null);
                return clientIdFromAppConfigName;
            }
            window.qmLog.debug('Using subDomain as client id: ' + subDomain);
            return subDomain;
        },
        canWeMakeRequestYet: function(type, route, options){
            if(!route || route === ''){
                qmLog.error("No route provided to canWeMakeRequestYet!");
                return true;
            }
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
                    qmLog.info('BLOCKING REQUEST: ' + name, 'BLOCKING REQUEST because ' + message, options);
                    return false;
                } else {
                    qmLog.info(name, message, options);
                }
            }
            window.qm.storage.setItem(getLocalStorageNameForRequest(type, route), qm.timeHelper.getUnixTimestampInSeconds());
            return true;
        },
        responseHandler: function(error, data, response, successHandler, errorHandler) {
            if(!response){
                qmLog.error("No response provided to qm.api.responseHandler");
                return;
            }
            qmLog.debug(response.status + ' response from ' + response.req.url, null);
            if (error) {
                qm.api.generalErrorHandler(error, data, response);
                if(errorHandler){errorHandler(error);}
            } else {
                if(successHandler){successHandler(data, response);}
            }
        },
        getBaseUrl: function () {
            //if($rootScope.appSettings.clientId !== "ionic"){return "https://" + $rootScope.appSettings.clientId + ".quantimo.do";}
            if(qm.appsManager.getAppSettingsFromMemory() && qm.appsManager.getAppSettingsFromMemory().apiUrl){
                if(qm.appsManager.getAppSettingsFromMemory().apiUrl.indexOf('https://') === -1){
                    qm.appsManager.getAppSettingsFromMemory().apiUrl = "https://" + qm.appsManager.getAppSettingsFromMemory().apiUrl;
                }
                return qm.appsManager.getAppSettingsFromMemory().apiUrl;
            }
            return qm.appsManager.getQuantiModoApiUrl();
        },
        postToQuantiModo: function (body, path, successHandler, errorHandler) {
            qm.api.getRequestUrl(path, function(url){
                qmLog.info("Making POST request to " + url);
                if(typeof XMLHttpRequest !== "undefined"){
                    qm.api.postViaXhr(body, url, successHandler);
                } else {
                    qm.api.postViaFetch(body, url, successHandler, errorHandler);  // Need fetch for service worker
                }
            });
        },
        getViaXhrOrFetch: function(url, successHandler, errorHandler){
            qmLog.info("Making GET request to " + url);
            if(typeof XMLHttpRequest !== "undefined"){
                qm.api.getViaXhr(url, successHandler, errorHandler);
            } else {
                qm.api.getViaFetch(url, successHandler, errorHandler);  // Need fetch for service worker
            }
        },
        getAppSettingsUrl: function (callback) {
            qm.api.getClientIdWithCallback(function(clientId, clientSecret){
                // Can't use QM SDK in service worker
                var settingsUrl = qm.appsManager.getQuantiModoApiUrl() + '/api/v1/appSettings?clientId=' + clientId;
                if(clientSecret){
                    settingsUrl += "&clientSecret=" + clientSecret;
                }
                if(window.designMode){settingsUrl += '&designMode=true';}
                window.qmLog.debug('Getting app settings from ' + settingsUrl);
                callback(settingsUrl);
            });
        },
        getViaFetch: function(url, successHandler, errorHandler){
            qmLog.pushDebug("Making get request to " + url);
            fetch(url, {method: 'get'})
                .then(function(response) {
                    return response.json();
                }).then(function(data) {
                    if(successHandler){
                        successHandler(data);
                    }
                }).catch(function(err) {
                    if(url.indexOf('.config.json')){
                        qmLog.error("qm.api.get error from " + url + " request: " + err + ".  If we couldn't parse json, " +
                            url + " probably doesn't exist", err);
                    } else {
                        qmLog.error("qm.api.get error from " + url + " request: " + err, null, err);
                    }
                    if(errorHandler){errorHandler(err);}
                });
        },
        getViaXhr: function (url, successHandler) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    var fallback = null; // Just return null instead of 500 page HTML
                    var responseObject = qm.stringHelper.parseIfJsonString(xhr.responseText, fallback);
                    successHandler(responseObject);
                }
            };
            xhr.open('GET', url, true);
            xhr.send(null);
        },
        postViaFetch: function (body, url, successHandler) {
            fetch( url, {
                method: 'post',
                body: JSON.stringify(body)
            }).then(function(response) {
                qmLog.info("Got " + response.status + " response from POST to " + url);
                if(successHandler){
                    successHandler(response);
                }
            }).catch(function(err) {
                qmLog.error("Error from POST to " + url + ": " +err);
            });
        },
        postViaXhr: function (body, url, successHandler) {
            var xhr = new XMLHttpRequest();   // new HttpRequest instance
            xhr.open("POST", url);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onreadystatechange = function() {//Call a function when the state changes.
                if(xhr.readyState === XMLHttpRequest.DONE) {
                    var fallback = xhr.responseText;
                    var responseObject = qm.stringHelper.parseIfJsonString(xhr.responseText, fallback);
                    successHandler(responseObject);
                }
            };
            xhr.send(JSON.stringify(body));
        },
        postMeasurements: function(measurements, onDoneListener) {
            qm.api.postToQuantiModo(measurements,"v1/measurements", onDoneListener);
        },
        getRequestUrl: function(path, successHandler) {
            qm.userHelper.getUserFromLocalStorageOrApi(function(user){
                function addGlobalQueryParameters(url) {
                    function addQueryParameter(url, name, value){
                        if(url.indexOf('?') === -1){return url + "?" + name + "=" + value;}
                        return url + "&" + name + "=" + value;
                    }
                    if (qm.auth.getAccessTokenFromUrlUserOrStorage(user)) {
                        url = addQueryParameter(url, 'access_token', qm.auth.getAccessTokenFromUrlUserOrStorage());
                    } else {
                        window.qmLog.error('No access token!');
                        if(!qm.serviceWorker){
                            qm.chrome.showSignInNotification();
                        }
                    }
                    function getAppName() {
                        if(qm.chrome.getChromeManifest()){return qm.chrome.getChromeManifest().name;}
                        return window.qm.urlHelper.getParam('appName');
                    }
                    if(getAppName()){url = addQueryParameter(url, 'appName', getAppName());}
                    function getAppVersion() {
                        if(qm.chrome.getChromeManifest()){return qm.chrome.getChromeManifest().version;}
                        if(qm.appSettings){return qm.appSettings.versionNumber;}
                        return window.qm.urlHelper.getParam('appVersion');
                    }
                    if(getAppVersion()){url = addQueryParameter(url, 'appVersion', getAppVersion());}
                    if(qm.api.getClientId()){url = addQueryParameter(url, 'clientId', qm.api.getClientId());}
                    url = addQueryParameter(url, 'platform', qm.platform.getCurrentPlatform());
                    return url;
                }
                function getAppHostName() {
                    if(qm.appSettings && qm.appSettings.apiUrl){return "https://" + qm.appSettings.apiUrl;}
                    return "https://app.quantimo.do";
                }
                var url = addGlobalQueryParameters(getAppHostName() + "/api/" + path);
                qmLog.debug("Making API request to " + url);
                successHandler(url);
            })
        }
    },
    appsManager: { // jshint ignore:line
        getQuantiModoApiUrl: function () {
            var apiUrl = window.qm.urlHelper.getParam(qm.items.apiUrl);
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
        getClientSecret: function(){
            if(qm.clientSecret){return qm.clientSecret;}
            if(qm.appSettings.clientSecret){return qm.appSettings.clientSecret;}
            if(!qm.privateConfig){
                qmLog.error("No client secret or private config!");
                return null;
            }
            if (qm.platform.isIOS()) { return qm.privateConfig.client_secrets.iOS; }
            if (qm.platform.isAndroid) { return qm.privateConfig.client_secrets.Android; }
            if (qm.platform.isChromeExtension) { return qm.privateConfig.client_secrets.Chrome; }
            if (qm.platform.isWindows) { return qm.privateConfig.client_secrets.Windows; }
            return qm.privateConfig.client_secrets.Web;},
        getAppSettingsLocallyOrFromApi: function (successHandler) {
            if(qm.appSettings && qm.appSettings.clientId){
                successHandler(qm.appSettings);
                return;
            }
            qm.localForage.getItem(qm.items.appSettings, function(appSettings){
                if(appSettings){
                    // qm.appsManager.setAppSettings(appSettings, successHandler);
                    // return;
                }
                if(qm.platform.isWeb() && window.location.href.indexOf('.quantimo.do') !== -1){
                    qm.appsManager.getAppSettingsFromApi(successHandler);
                    return;
                }
                qm.appsManager.getAppSettingsFromDefaultConfigJson(function (appSettings) {
                    if(appSettings){
                        qm.appsManager.setAppSettings(appSettings, successHandler);
                        return;
                    }
                    qm.appsManager.getAppSettingsFromApi(successHandler);
                })
            });
        },
        getAppSettingsFromMemory: function(){
            if(typeof qm.appSettings !== "undefined"){
                return qm.appSettings;
            }
            return false;
        },
        getAppSettingsFromApi: function (successHandler) {
            qm.api.getAppSettingsUrl(function(appSettingsUrl){
                qm.api.getViaXhrOrFetch(appSettingsUrl, function (response) {
                    if(!response){
                        qmLog.error("No response from " + appSettingsUrl);
                        return;
                    }
                    if(response.privateConfig){
                        qm.privateConfig = response.privateConfig;
                        qm.localForage.setItem(qm.items.privateConfig, response.privateConfig);
                    }
                    if(!response.appSettings){
                        qmLog.error("No appSettings response from "+ appSettingsUrl);
                        return false;
                    }
                    qm.appsManager.setAppSettings(response.appSettings, successHandler);
                })
            });
        },
        getAppSettingsFromDefaultConfigJson: function(callback) {  // I think adding appSettings to the chrome manifest breaks installation
            qm.api.getViaXhrOrFetch(qm.urlHelper.getAbsoluteUrlFromRelativePath('default.config.json'), function (parsedResponse) {  // Can't use QM SDK in service worker
                if(parsedResponse){
                    window.qmLog.debug('Got appSettings from default.config.json', null, parsedResponse);
                    qm.appSettings = parsedResponse;
                    qm.localForage.setItem(qm.items.appSettings, qm.appSettings);
                }
                callback(parsedResponse);
            }, function () {
                qmLog.error("Could not get appSettings from default.config.json");
            });
        },
        loadBuildInfoFromDefaultConfigJson: function(callback) {  // I think adding appSettings to the chrome manifest breaks installation
            if(qm.buildInfo){callback(qm.buildInfo);}
            qm.api.getViaXhrOrFetch(qm.urlHelper.getAbsoluteUrlFromRelativePath('build-info.json'), function (parsedResponse) {  // Can't use QM SDK in service worker
                if(parsedResponse){
                    qm.buildInfo = parsedResponse;
                }
                callback(parsedResponse);
            }, function () {
                qmLog.error("Could not get appSettings from build-info.json");
            });
        },
        loadPrivateConfigFromJsonFile: function() {  // I think adding appSettings to the chrome manifest breaks installation
            if(!qm.privateConfig){
                qm.api.getViaXhrOrFetch(qm.urlHelper.getPrivateConfigJsonUrl(), function (parsedResponse) {  // Can't use QM SDK in service worker
                    window.qmLog.debug('Got private config from json file', null, parsedResponse);
                    qm.privateConfig = parsedResponse;
                }, function () {
                    qmLog.error("Could not get private config from json file");
                });
            }
        },
        setAppSettings: function(appSettings, callback){
            if(!appSettings){
                qmLog.error("Nothing given to setAppSettings!");
                return false;
            }
            qm.appsManager.loadBuildInfoFromDefaultConfigJson(function (buildInfo) {
                for (var propertyName in buildInfo) {
                    if( buildInfo.hasOwnProperty(propertyName) ) {
                        appSettings[propertyName] = buildInfo[propertyName];
                    }
                }
                if(!appSettings.gottenAt){appSettings.gottenAt = qm.timeHelper.getUnixTimestampInSeconds();}
                qm.appSettings = appSettings;
                qm.localForage.setItem(qm.items.appSettings, qm.appSettings);
                if(appSettings.gottenAt < qm.timeHelper.getUnixTimestampInSeconds() - 86400){
                    qm.appsManager.getAppSettingsFromApi();
                }
                if(callback){callback(appSettings);}
            })
        },
        // SubDomain : Filename
        appConfigFileNames: {
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
            "staging" : "quantimodo",
            "your_quantimodo_client_id_here": "your_quantimodo_client_id_here"
        }
    },
    apiHelper: {
        getApiDocs: function (callback){
            if(qm.apiHelper.docs){callback(qm.apiHelper.docs);}
            var path = 'data/swagger.json';
            qm.api.getViaXhrOrFetch(qm.urlHelper.getAbsoluteUrlFromRelativePath(path), function (parsedResponse) {  // Can't use QM SDK in service worker
                if(parsedResponse){
                    qmLog.debug('Got '+path, null, parsedResponse);
                    qm.apiHelper.docs = parsedResponse;
                }
                callback(parsedResponse);
            }, function () {
                qmLog.error("Could not get "+path);
            });
        },
        docs: null,
        getParameterDescription: function (parameterName, callback) {
            qm.apiHelper.getApiDocs(function (apiDocs) {
                var explanation = {title: qm.stringHelper.camelToTitleCase(parameterName)};
                explanation.textContent = apiDocs.parameters[parameterName].description;
                callback(explanation);
            });
        },
        getPropertyDescription: function (modelName, propertyName, callback){
            qm.apiHelper.getApiDocs(function (apiDocs) {
                var explanation = {title: qm.stringHelper.camelToTitleCase(propertyName)};
                explanation.textContent = apiDocs.definitions[modelName].properties[propertyName].description;
                callback(explanation);
            });
        }
    },
    arrayHelper: {

        arrayHasItemWithSpecificPropertyValue: function(propertyName, propertyValue, array){
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
        },
        arrayHasItemWithNameProperty: function(arrayOfObjects){
            return arrayOfObjects && arrayOfObjects.length && arrayOfObjects[0] && arrayOfObjects[0].name;
        },
        removeItemsWithDifferentName: function(arrayOfObjects, queryTerm){
            return arrayOfObjects.filter(function( obj ) {return obj.name.toLowerCase().indexOf(queryTerm.toLowerCase()) !== -1;});
        },
        concatenateUniqueId: function (preferred, secondary) {
            var a = preferred.concat(secondary);
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i].id === a[j].id)
                        a.splice(j--, 1);
                }
            }
        },
        convertToArrayIfNecessary: function(variable){
            if(!qm.arrayHelper.variableIsArray(variable)){variable = [variable];}
            return variable;
        },
        convertObjectToArray: function (object) {
            if(!object){
                qmLog.info(object + " provided to convertObjectToArray");
                return object;
            }
            if(qm.arrayHelper.variableIsArray(object)){return object;}
            return Object.keys(object).map(function(key) {
                return object[key];
            });
        },
        deleteById: function(id, array){
            array = array.filter(function( obj ) {
                return obj.id !== id;
            });
            return array;
        },
        deleteByProperty: function(propertyName, value, array){
            array = array.filter(function( obj ) {
                return obj[propertyName] !== value;
            });
            return array;
        },
        filterByProperty: function(filterPropertyName, filterPropertyValue, unfilteredElementArray){
            return unfilteredElementArray.filter(function( obj ) {
                if(typeof obj[filterPropertyName] === "string" && typeof filterPropertyValue === "string"){
                    return filterPropertyValue.toLowerCase() === obj[filterPropertyName].toLowerCase();
                } else {
                    return filterPropertyValue === obj[filterPropertyName];
                }
            });
        },
        filterByPropertyOrSize: function(matchingElements, filterPropertyName, filterPropertyValue,
                                         lessThanPropertyName, lessThanPropertyValue,
                                         greaterThanPropertyName, greaterThanPropertyValue) {
            if(!matchingElements){return null;}
            if(matchingElements.length){
                if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined") {
                    window.qmLog.error(greaterThanPropertyName + ' greaterThanPropertyName does not exist');
                }
                if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
                    window.qmLog.error(filterPropertyName + ' filterPropertyName does not exist');
                }
                if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
                    window.qmLog.error(lessThanPropertyName + ' lessThanPropertyName does not exist');
                }
            }
            if(filterPropertyName && typeof filterPropertyValue !== "undefined" && filterPropertyValue !== null){
                matchingElements = qm.arrayHelper.filterByProperty(filterPropertyName, filterPropertyValue, matchingElements);
            }
            if(lessThanPropertyName && typeof lessThanPropertyValue !== "undefined"){
                matchingElements = matchingElements.filter(function( obj ) {
                    return obj[lessThanPropertyName] < lessThanPropertyValue;
                });
            }
            if(greaterThanPropertyName && typeof greaterThanPropertyValue !== "undefined"){
                matchingElements = matchingElements.filter(function( obj ) {
                    return obj[greaterThanPropertyName] > greaterThanPropertyValue;
                });
            }
            return matchingElements;
        },
        getByProperty: function(propertyName, value, array){
            array = array.filter(function( obj ) {
                return obj[propertyName] === value;
            });
            return array;
        },
        getContaining: function(searchTerm, array){
            if(!array){
                qmLog.error("No array provided to getContaining");
                return array;
            }
            searchTerm = searchTerm.toLowerCase();
            var matches = [];
            for (var i = 0; i < array.length; i++) {
                if(JSON.stringify(array[i]).toLowerCase().indexOf(searchTerm) > -1){
                    matches.push(array[i]);
                }
            }
            return matches;
        },
        getWithNameContaining: function(searchTerm, array){
            if(!array){
                qmLog.error("No array provided to getContaining");
                return array;
            }
            searchTerm = searchTerm.toLowerCase();
            return array.filter(function(item){
               var name = item.name || item.variableName;
               name = name.toLowerCase();
               return name.indexOf(searchTerm) !== -1;
            });
        },
        getWithNameContainingEveryWord: function(searchTerm, array){
            if(!array){
                qmLog.error("No array provided to getContaining");
                return array;
            }
            qmLog.info("Called getWithNameContainingEveryWord...");
            searchTerm = searchTerm.toLowerCase();
            var filterBy = searchTerm.split(/\s+/);
            return array.filter(function(item){
                var name = item.name || item.variableName;
                name = name.toLowerCase();
                var result = filterBy.every(function (word){
                    var exists = name.indexOf(word);
                    if(exists !== -1){return true;}
                    if(item.synonyms && item.synonyms.length){
                        var synonyms = JSON.stringify(item.synonyms).toLowerCase();
                        if(synonyms.indexOf(word) !== -1){return true;}
                    }
                    if(item.alias){
                        var alias = item.alias.toLowerCase();
                        if(alias.indexOf(word) !== -1){return true;}
                    }
                });
                return result;
            });
        },
        inArray: function(needle, haystack) {
            var length = haystack.length;
            for(var i = 0; i < length; i++) {
                if(haystack[i] === needle) return true;
            }
            return false;
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
            array.pop();
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
                qm.arrayHelper.removeLastItem(array);
            }
            return array;
        },
        sortByProperty: function(arrayToSort, propertyName){
            qmLog.info("Sorting by "+propertyName+"...");
            if(!qm.arrayHelper.variableIsArray(arrayToSort)){
                qmLog.info("Cannot sort by " + propertyName + " because it's not an array!");
                return arrayToSort;
            }
            if(arrayToSort.length < 2){return arrayToSort;}
            if(propertyName.indexOf('-') > -1){
                arrayToSort.sort(function(a, b){return b[propertyName.replace('-', '')] - a[propertyName.replace('-', '')];});
            } else {
                arrayToSort.sort(function(a, b){return a[propertyName] - b[propertyName];});
            }
            return arrayToSort;
        },
        unsetNullProperties: function (array) {
            if(!array){
                qmLog.error("Nothing provided to unsetNullProperties");
                return null;
            }
            for (var i = 0; i < array.length; i++) {
                array[i] = qm.objectHelper.unsetNullProperties(array[i]);
            }
            return array;
        },
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
            return Object.prototype.toString.call(variable) === '[object Array]';
        },
        removeArrayElementsWithDuplicateIds: function(array) {
            if(!array){return array;}
            var a = array.concat();
            for(var i = 0; i < a.length; i++) {
                for(var j = i + 1; j < a.length; j++) {
                    if(!a[i]){qmLog.error('a[i] not defined!');}
                    if(!a[j]){
                        qmLog.error('a[j] not defined!');
                        return a;
                    }
                    if(a[i].id === a[j].id) {
                        a.splice(j--, 1);
                    }
                }
            }
            return a;
        },
        filterByRequestParams: function(array, requestParams) {
            if(!requestParams){
                qmLog.info("No requestParams provided to filterByRequestParams");
                return array;
            }
            var allowedFilterParams = ['variableCategoryName', 'id', 'name', 'manualTracking', 'outcome', 'upc'];
            var excludedFilterParams = ['includePublic', 'excludeLocal', 'minimumNumberOfResultsRequiredToAvoidAPIRequest',
                'sort', 'limit', 'appName', 'appVersion', 'accessToken', 'clientId', 'barcodeFormat', 'searchPhrase', 'platform'];
            var greaterThanPropertyName = null;
            var greaterThanPropertyValue = null;
            var lessThanPropertyName = null;
            var lessThanPropertyValue = null;
            var log = [];
            var filterPropertyValues = [];
            var filterPropertyNames = [];
            angular.forEach(requestParams, function(value, key) {
                if(typeof value === "string" && value.indexOf('(lt)') !== -1){
                    lessThanPropertyValue = value.replace('(lt)', "");
                    lessThanPropertyValue = Number(lessThanPropertyValue);
                    lessThanPropertyName = key;
                } else if (typeof value === "string" && value.indexOf('(gt)') !== -1){
                    greaterThanPropertyValue = value.replace('(gt)', "");
                    greaterThanPropertyValue = Number(greaterThanPropertyValue);
                    greaterThanPropertyName = key;
                } else {
                    if (value === false && key === "manualTracking") { return; }
                    if (value === null || value === "" || value === "Anything") { return; }
                    if (excludedFilterParams.indexOf(key) !== -1) {
                        return;
                    } else if (allowedFilterParams.indexOf(key) === -1) {
                        qmLog.error(key + " is not in allowed filter params");
                    } else {
                        qmLog.info("filtering by " + key);
                    }
                    filterPropertyValues.push(value);
                    filterPropertyNames.push(key);
                }
            }, log);
            var results = qm.arrayHelper.filterByPropertyOrSize(array, null, null, lessThanPropertyName, lessThanPropertyValue,
                greaterThanPropertyName, greaterThanPropertyValue);
            if(results){
                for(var i = 0; i < filterPropertyNames.length; i++){
                    results = qm.arrayHelper.filterByProperty(filterPropertyNames[i], filterPropertyValues[i], results);
                }
            }
            if(!results){return null;}
            if(requestParams.searchPhrase && requestParams.searchPhrase !== ""){
                results = qm.arrayHelper.getWithNameContainingEveryWord(requestParams.searchPhrase, results);
            }
            if(requestParams && requestParams.sort){results = qm.arrayHelper.sortByProperty(results, requestParams.sort);}
            results = qm.arrayHelper.removeArrayElementsWithDuplicateIds(results);
            return results;
        },
        getUnique: function(array, propertyName) {
            var flags = [], output = [], l = array.length, i;
            for( i=0; i<l; i++) {
                if(flags[array[i][propertyName]]) {continue;}
                flags[array[i][propertyName]] = true;
                output.push(array[i]);
            }
            return output;
        },
        deleteFromArrayByProperty: function(localStorageItemArray, propertyName, propertyValue) {
            var elementsToKeep = [];
            for(var i = 0; i < localStorageItemArray.length; i++){
                if(localStorageItemArray[i][propertyName] !== propertyValue){elementsToKeep.push(localStorageItemArray[i]);}
            }
            return elementsToKeep;
        },
        addToOrReplaceByIdAndMoveToFront: function(localStorageItemArray, replacementElementArray){
            if(!(replacementElementArray instanceof Array)){replacementElementArray = [replacementElementArray];}
            // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
            var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
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
            return elementsToKeep;
        },
    },
    auth: {
        getAndSaveAccessTokenFromCurrentUrl: function(){
            qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl " + window.location.href);
            var accessTokenFromUrl = qm.auth.getAccessTokenFromCurrentUrl();
            if(accessTokenFromUrl){
                if(accessTokenFromUrl.length < 10){
                    qmLog.error("accessTokenFromUrl is "+ accessTokenFromUrl);
                    return null;
                }
                qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl saving " + accessTokenFromUrl);
                qm.auth.saveAccessToken(accessTokenFromUrl);
            }
            return accessTokenFromUrl;
        },
        saveAccessToken: function(accessToken){
            if(!qm.urlHelper.getParam('doNotRemember')){
                qmLog.authDebug("saveAccessToken: Saving access token in local storage because doNotRemember is not set");
                qm.storage.setItem(qm.items.accessToken, accessToken);
            }
        },
        getAccessTokenFromUrlUserOrStorage: function(user) {
            if(user){window.qmUser = user;}
            if(qm.auth.getAndSaveAccessTokenFromCurrentUrl()){
                return qm.auth.getAndSaveAccessTokenFromCurrentUrl();
            }
            if(qm.userHelper.getUserFromLocalStorage() && qm.userHelper.getUserFromLocalStorage().accessToken){
                if(qm.userHelper.getUserFromLocalStorage().accessToken.length < 10){
                    qmLog.error("qm.userHelper.getUserFromLocalStorage().accessToken is "+ qm.userHelper.getUserFromLocalStorage().accessToken);
                } else {
                    return qm.userHelper.getUserFromLocalStorage().accessToken;
                }
            }
            if(qm.storage.getItem(qm.items.accessToken)){
                if(qm.storage.getItem(qm.items.accessToken).length < 10){
                    qmLog.error("accessTokenFromUrl is "+ qm.storage.getItem(qm.items.accessToken));
                } else {
                    return qm.storage.getItem(qm.items.accessToken);
                }
            }
            qmLog.checkUrlAndStorageForDebugMode();
            qmLog.info("No access token or user!");
            return null;
        },
        saveAccessTokenResponse: function(accessResponse) {
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
                qmLog.error('No expiresAtMilliseconds!',
                    'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qm.storage.getAsString('user'),
                    {groupingHash: 'No expiresAtMilliseconds!'},
                    "error");
            }
            var groupingHash = 'Access token expiresAt not provided in recognizable form!';
            qmLog.error(groupingHash);
            qmLog.error(groupingHash,
                'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qm.storage.getAsString('user'),
                {groupingHash: groupingHash}, "error");
        },
        getAccessTokenFromCurrentUrl: function(){
            qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl " + window.location.href);
            var accessTokenFromUrl =  (qm.urlHelper.getParam('accessToken')) ? qm.urlHelper.getParam('accessToken') : qm.urlHelper.getParam('quantimodoAccessToken');
            if(accessTokenFromUrl){
                qmLog.authDebug("Got access token from url");
            } else {
                qmLog.authDebug("No access token from url");
            }
            return accessTokenFromUrl;
        },
        deleteAllAccessTokens: function(){
            qmLog.info("deleteAllAccessTokens...");
            if(qm.userHelper.getUserFromLocalStorage()){
                qm.userHelper.getUserFromLocalStorage().accessToken = null;
            }
            qm.auth.deleteAllCookies();
        },
        deleteAllCookies: function(){
            qmLog.info("Deleting all cookies...");
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        }
    },
    buildInfo: {},
    client: {
        getClientWebsiteUrl: function (successHandler, partialPath){
            if(!partialPath){partialPath = '';}
            qm.api.getClientIdWithCallback(function (clientId) {
                var url = "https://"+clientId+".quantimo.do/ionic/Modo/www/" + partialPath;
                successHandler(url)
            })
        }
    },
    connectorHelper: {
        getConnectorsFromApi: function(params, successCallback, errorHandler){
            qmLog.info("Getting connectors from API...");
            function successHandler(connectors){
                if (connectors) {
                    qmLog.info("Got connectors from API...");
                    if(successCallback){successCallback(connectors);}
                } else {
                    qmLog.error("Could not get connectors from API...");
                }
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.ConnectorsApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getUserFromApi');
            }
            params = qm.api.addGlobalParams(params);
            apiInstance.getConnectors(params, callback);
        },
        getConnectorsFromLocalStorage: function(){
            var connectors = qm.storage.getItem(qm.items.connectors);
            if(connectors && connectors.connectors){
                qm.storage.setItem(qm.items.connectors, connectors.connectors);
                return connectors.connectors;
            }
            return connectors;
        },
        getConnectorsFromLocalStorageOrApi: function(successHandler, errorHandler){
            var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
            if(connectors){successHandler(connectors); return;}
            qm.connectorHelper.getConnectorsFromApi({}, successHandler, errorHandler);
        },
        getConnectorByName: function (connectorName, successHandler) {
            if(!successHandler){
                var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
                return connectors.find(function(connector){
                    return connector.name === connectorName.toLowerCase();
                });
            }
            qm.connectorHelper.getConnectorsFromLocalStorageOrApi(function (connectors) {
                var match = connectors.find(function(connector){
                    return connector.name === connectorName.toLowerCase();
                });
                successHandler(match);
            })
        }
    },
    correlations: {
        getAggregatedCorrelationsFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            params.commonOnly = true;
            var cachedData = qm.api.cacheGet(params, qm.items.aggregatedCorrelations);
            if(cachedData && successHandler){
                successHandler(cachedData);
                return;
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.AnalyticsApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getAggregatedCorrelationsFromApi');
            }
            apiInstance.getCorrelations(params, callback);
        },
        getUserCorrelationsFromApi: function (params, successHandler, errorHandler) {
            params = qm.api.addGlobalParams(params);
            var cachedData = qm.api.cacheGet(params, qm.items.userCorrelations);
            if(cachedData && successHandler){
                successHandler(cachedData);
                return;
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.AnalyticsApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, qm.items.userCorrelations);
            }
            apiInstance.getCorrelations(params, callback);
        }
    },
    functionHelper: {
        getCurrentFunctionNameDoesNotWork: function () {
            var functionName = arguments.callee.toString();
            functionName = functionName.substr('function '.length);
            functionName = functionName.substr(0, functionName.indexOf('('));
            return functionName;
        }
    },
    geoLocation: {
        getFoursqureClientId: function () {
            if(qm.privateConfig.FOURSQUARE_CLIENT_ID){/** @namespace qm.privateConfig.FOURSQUARE_CLIENT_ID */
                return qm.privateConfig.FOURSQUARE_CLIENT_ID;}
            if(qm.getAppSettings().privateConfig && qm.getAppSettings().privateConfig.FOURSQUARE_CLIENT_ID){return qm.getAppSettings().privateConfig.FOURSQUARE_CLIENT_ID;}
            var connector = qm.connectorHelper.getConnectorByName('foursquare');
            if(connector){return connector.connectorClientId;}
        },
        getFoursquareClientSecret: function () {
            /** @namespace qm.privateConfig.FOURSQUARE_CLIENT_SECRET */
            if(qm.privateConfig.FOURSQUARE_CLIENT_SECRET){return qm.privateConfig.FOURSQUARE_CLIENT_SECRET;}
            if(qm.getAppSettings().privateConfig && qm.getAppSettings().privateConfig.FOURSQUARE_CLIENT_SECRET){return qm.getAppSettings().privateConfig.FOURSQUARE_CLIENT_SECRET;}
            var connector = qm.connectorHelper.getConnectorByName('foursquare');
            if(connector){/** @namespace connector.connectorClientSecret */
                return connector.connectorClientSecret;}
        },
        getGoogleMapsApiKey: function () {
            /** @namespace qm.privateConfig.GOOGLE_MAPS_API_KEY */
            if(qm.privateConfig.GOOGLE_MAPS_API_KEY){return qm.privateConfig.GOOGLE_MAPS_API_KEY;}
            if(qm.getAppSettings().privateConfig && qm.getAppSettings().privateConfig.GOOGLE_MAPS_API_KEY){return qm.getAppSettings().privateConfig.GOOGLE_MAPS_API_KEY;}
        }
    },
    getAppSettings: function (successHandler) {
        if(!successHandler){
            if(qm.appsManager.getAppSettingsFromMemory()){return qm.appsManager.getAppSettingsFromMemory();}
            return null;
        }
        qm.appsManager.getAppSettingsLocallyOrFromApi(successHandler);
    },
    getClientId: function(successHandler){
        if(!successHandler){
            return qm.api.getClientId();
        } else {
            qm.api.getClientIdWithCallback(successHandler)
        }
    },
    getPrimaryOutcomeVariable: function(){
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
                averageText:"Your average mood is "
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
                averageText:"Your average energy level is "
            }
        };
        if(qm.getAppSettings() && qm.getAppSettings().primaryOutcomeVariableName){return variables[qm.getAppSettings().primaryOutcomeVariableName];}
        return variables['Overall Mood'];
    },
    getPrimaryOutcomeVariableByNumber: function(num){
        return qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] ? qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] : false;
    },
    getSourceName: function(){return qm.appsManager.getAppSettingsFromMemory().appDisplayName + " for " + qm.platform.getCurrentPlatform();},
    getUser: function(successHandler, errorHandler){
        if(!successHandler){
            return qm.userHelper.getUserFromLocalStorage();
        }
        qm.userHelper.getUserFromLocalStorageOrApi(successHandler, errorHandler);
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
        },
        removeItem: function(key){
            qmLog.debug("Removing " + key + " from globals");
            delete qm.globals[key];
        }
    },
    globals: {},
    help: {
        getExplanations: function(){
            var explanations = {
                predictorSearch: {
                    title: "Select Predictor",
                    textContent: "Search for a predictor like a food or treatment that you want to know the effects of..."
                },
                outcomeSearch: {
                    title: "Select Outcome",
                    textContent: "Select an outcome variable to be optimized like overall mood or sleep quality..."
                },
                locationAndWeatherTracking: {
                    title: "Location and Weather Tracking",
                    textContent: qm.variableCategoryHelper.getVariableCategory('Location').moreInfo
                },
                minimumAllowedValue: {
                    title: "Minimum Allowed Value",
                    textContent:"The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.",
                },
                maximumAllowedValue: {
                    title: "Maximum Allowed Value",
                    textContent:"The maximum allowed value for measurements.  While you can record a value above this maximum, it will be excluded from the correlation analysis.",
                },
                onsetDelayInHours: {
                    title: "Onset Delay",
                    unitName: "Hours",
                    textContent:"An outcome is always preceded by the predictor or stimulus. The amount of time that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the “onset delay”.  For example, the “onset delay” between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
                },
                onsetDelay: {
                    title: "Onset Delay",
                    unitName: "Seconds",
                    textContent:"An outcome is always preceded by the predictor or stimulus. The amount of time that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the “onset delay”.  For example, the “onset delay” between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
                },
                durationOfActionInHours: {
                    title: "Duration of Action",
                    unitName: "Hours",
                    textContent:"The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable’s value. For instance, aspirin typically decreases headache severity for approximately four hours (duration of action) following the onset delay.",
                },
                durationOfAction: {
                    title: "Duration of Action",
                    unitName: "Seconds",
                    textContent:"The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable’s value. For instance, aspirin typically decreases headache severity for approximately four hours (duration of action) following the onset delay.",
                },
                fillingValue: {
                    title: "Filling Value",
                    textContent:"When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.",
                },
                combinationOperation: {
                    title: "Combination Method",
                    textContent:"How multiple measurements are combined over time.  We use the average (or mean) for things like your weight.  Summing is used for things like number of apples eaten.",
                },
                defaultValue: {
                    title: "Default Value",
                    textContent:"If specified, there will be a button that allows you to quickly record this value.",
                },
                experimentStartTime: {
                    title: "Analysis Start Date",
                    textContent:"Data prior to this date will not be used in analysis.",
                },
                experimentEndTime: {
                    title: "Analysis End Date",
                    textContent:"Data after this date will not be used in analysis.",
                },
                thumbs: {
                    title: "Help Me Learn",
                    textContent:"I'm really good at finding correlations and even compensating for various onset delays and durations of action. " +
                    "However, you're much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. " +
                    "You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you don't think could possibly be causal.",
                }
            };
            return explanations;
        },
        getExplanation : function(parameterOrPropertyName, modelName, callback) {
            var explanations = qm.help.getExplanations();
            if(explanations[parameterOrPropertyName]){
                return callback(explanations[parameterOrPropertyName]);
            }
            if(modelName){
                qm.apiHelper.getPropertyDescription(modelName, parameterOrPropertyName, callback)
            } else {
                qm.apiHelper.getParameterDescription(parameterOrPropertyName, callback)
            }
        }
    },
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
        aggregatedCorrelations: 'aggregatedCorrelations',
        apiUrl: 'apiUrl',
        appSettings: 'appSettings',
        appSettingsRevisions: 'appSettingsRevisions',
        chromeWindowId: 'chromeWindowId',
        clientId: 'clientId',
        commonVariables: 'commonVariables',
        connectors: 'connectors',
        debugMode: 'debugMode',
        defaultHelpCards: 'defaultHelpCards',
        deviceTokenOnServer: 'deviceTokenOnServer',
        deviceTokenToSync: 'deviceTokenToSync',
        drawOverAppsPopupEnabled: 'drawOverAppsPopupEnabled',
        expiresAtMilliseconds: 'expiresAtMilliseconds',
        hideImportHelpCard: 'hideImportHelpCard',
        introSeen: 'introSeen',
        lastGotNotificationsAtMilliseconds: 'lastGotNotificationsAtMilliseconds',
        lastLocalNotificationTime: 'lastLocalNotificationTime',
        lastLatitude: 'lastLatitude',
        lastLocationAddress: 'lastLocationAddress',
        lastLocationName: 'lastLocationName',
        lastLocationNameAndAddress: 'lastLocationNameAndAddress',
        lastLocationPostUnixTime: 'lastLocationPostUnixTime',
        lastLocationResultType: 'lastLocationResultType',
        lastLocationUpdateTimeEpochSeconds: 'lastLocationUpdateTimeEpochSeconds',
        lastLongitude: 'lastLongitude',
        lastReminder: 'lastReminder',
        lastStudyOrCorrelation: 'lastStudyOrCorrelation',
        lastPopupNotificationUnixTimeSeconds: 'lastPopupNotificationUnixTimeSeconds',
        lastPushTimestamp: 'lastPushTimestamp',
        measurementsQueue: 'measurementsQueue',
        mostFrequentReminderIntervalInSeconds: 'mostFrequentReminderIntervalInSeconds',
        notificationInterval: 'notificationInterval',
        notificationsSyncQueue: 'notificationsSyncQueue',
        onboarded: 'onboarded',
        physicianUser: 'physicianUser',
        privateConfig: 'privateConfig',
        primaryOutcomeVariableMeasurements: 'primaryOutcomeVariableMeasurements',
        refreshToken: 'refreshToken',
        scheduledLocalNotifications: 'scheduledLocalNotifications',
        trackingReminderNotifications: 'trackingReminderNotifications',
        trackingReminderNotificationSyncScheduled: 'trackingReminderNotificationSyncScheduled',
        trackingReminders: 'trackingReminders',
        trackingReminderSyncQueue: 'trackingReminderSyncQueue',
        units: 'units',
        user: 'user',
        useSmallInbox: 'useSmallInbox',
        userCorrelations: 'userCorrelations',
        userVariables: 'userVariables',
        variableCategories: 'variableCategories'
    },
    loaders: {
        robots: function(){
            var tm = new TimelineMax({repeat:-1,repeatDelay:2})
            //.to('#redBot',2,{x:500,ease:Power3.easeInOut},'+=2')
                .fromTo('#blueBot',2,{x:0},{x:0,ease:Power3.easeInOut},'-=1.5')
                //.to('body',2,{backgroundColor:'#FFDC6D'},'-=2')
                .to('#blueBot',2,{x:0,onStart:newBot,ease:Power3.easeInOut},'+=2')
            function newBot(){
                TweenMax.fromTo('#redBot',2,{x:-1000},{x:0,delay:.65,ease:Power3.easeInOut})
                TweenMax.to('body',2,{backgroundColor:'#ADBD90',delay:.65})
            }
// /////////////////////////////////////////////////////////////
            var sig = new TimelineMax({repeat:-1})
            sig.fromTo('#redBotSignal', .5,{drawSVG:"0% 15%",ease:Linear.easeInOut},{drawSVG:"85% 100%",ease:Linear.easeInOut})
                .fromTo('#redBotSignal', .5,{drawSVG:"85% 100%",ease:Linear.easeInOut},{drawSVG:"0% 15%",ease:Linear.easeInOut})
            var bolt = new TweenMax.to(['#bolt','#leftEar','#rightEar','#nose'],.5,{opacity:.25,onComplete:function(){bolt.reverse()},onReverseComplete:function(){bolt.play()}})
            var rhb = new TweenMax.to('#redHeart',.5,{scale:1.1,transformOrigin:'50% 50%',ease:Power2.easeInOut,onComplete:function(){rhb.reverse()},onReverseComplete:function(){rhb.play()}})
            var sra= new TweenMax.to('#redRightArm',.5,{rotation:-3,ease:Linear.easeInOut,transformOrigin:'45% 25%',onComplete:function(){sra.reverse()},onReverseComplete:function(){sra.play()}})
            var sla= new TweenMax.to('#redLeftArm',.5,{rotation:3,ease:Linear.easeInOut,transformOrigin:'25% 25%',onComplete:function(){sla.reverse()},onReverseComplete:function(){sla.play()}})
            var redhead = new TweenMax.to('#redHead',1,{y:5,ease:Power2.easeInOut,onComplete:function(){redhead.reverse()},onReverseComplete:function(){redhead.play()}})
// ////////////////////////////////////////////////////
            var lights1 = new TweenMax.staggerFromTo(['#light3','#light6'],.5,{fill:'#fff'},{fill:'#398080',repeat:-1},0.2)
            var lights2 = new TweenMax.staggerFromTo(['#light2','#light5'],.5,{fill:'#398080'},{fill:'#E20717',repeat:-1},0.2)
            var lights3 = new TweenMax.staggerFromTo(['#light1','#light4'],.5,{fill:'#E20717'},{fill:'#fffff',repeat:-1},0.2)
            var eeg = new TweenMax.fromTo('#pulse',2,{drawSVG:"0%",ease:Linear.easeInOut},{drawSVG:"100%",ease:Linear.easeInOut,repeat:-1})
            var static_RENAMED_BECAUSE_RESERVED = new TweenMax.fromTo('#blueBotStatic',.75,{ease:Power1.easeInOut,opacity:0},{ease:Power1.easeInOut,opacity:1,repeat:-1})
            var blueBotRArm= new TweenMax.to('#blueBotRightArm',.5,{rotation:-3,y:2,ease:Linear.easeInOut,transformOrigin:'65% 100%',onComplete:function(){blueBotRArm.reverse()},onReverseComplete:function(){blueBotRArm.play()}})
            var blueBotLArm= new TweenMax.to('#blueBotLeftArm',.5,{rotation:3,y:2,ease:Linear.easeInOut,transformOrigin:'100% 65%',onComplete:function(){blueBotLArm.reverse()},onReverseComplete:function(){blueBotLArm.play()}})
            var dial = new TweenMax.to('#dial',.5,{rotation:30,ease:Linear.easeInOut,transformOrigin:'50% 100%',onComplete:function(){dial.reverse()},onReverseComplete:function(){dial.play()}})
            var blueBotBody = new TweenMax.to('#blueBotBody',.5,{y:2,ease:Sine.easeInOut,onComplete:function(){blueBotBody.reverse()},onReverseComplete:function(){blueBotBody.play()}})
            var blueBotHead = new TweenMax.to('#blueBotHead',.5,{y:-2,ease:Sine.easeInOut,onComplete:function(){blueBotHead.reverse()},onReverseComplete:function(){blueBotHead.play()}})
            var mouthBars = new TweenMax.staggerFromTo('#mouthBars rect',.5,{fill:'#398080'},{fill:'#fffff',repeat:-1},0.2)
            var eyes = new TweenMax.to('#blueBotEyes',.5,{scale:1.1,transformOrigin:'50% 50%',ease:Sine.easeInOut,onComplete:function(){eyes.reverse()},onReverseComplete:function(){eyes.play()}})
        }
    },
    localForage: {
        clear: function () {
            qmLog.info("Clearing localforage!");
            localforage.clear();
        },
        saveWithUniqueId: function(key, arrayToSave) {
            if(!qm.arrayHelper.variableIsArray(arrayToSave)){
                arrayToSave = [arrayToSave];
            }
            qmLog.info("saving " + key + " with unique id");
            qm.localForage.getItem(key, function(existingData) {
                if(!existingData){existingData = [];}
                for (var i = 0; i < arrayToSave.length; i++) {
                    var newObjectToSave = arrayToSave[i];
                    var existingObjectToReplace = existingData.find(function( obj ) {
                        return obj.id === newObjectToSave.id;
                    });
                    if(existingObjectToReplace && existingObjectToReplace.lastSelectedAt){
                        newObjectToSave.lastSelectedAt = existingObjectToReplace.lastSelectedAt;
                    }
                    existingData = existingData.filter(function( obj ) {
                        return obj.id !== newObjectToSave.id;
                    });
                    existingData.unshift(newObjectToSave);
                }
                qm.localForage.setItem(key, existingData);
            });
        },
        deleteById: function(key, id) {
            qmLog.info("deleting " + key + " by id " + id);
            qm.localForage.getItem(key, function(existingData) {
                if(!existingData){existingData = [];}
                existingData = existingData.filter(function( obj ) {
                    return obj.id !== id;
                });
                qm.localForage.setItem(key, existingData);
            });
        },
        searchByProperty: function (key, propertyName, searchTerm, successHandler, errorHandler) {
            searchTerm = searchTerm.toLowerCase();
            qmLog.info("searching " + key + " by " + propertyName + " " + searchTerm);
            qm.localForage.getItem(key, function(existingData) {
                if(!existingData){existingData = [];}
                existingData = existingData.filter(function( obj ) {
                    var currentValue = obj[propertyName].toLowerCase();
                    return currentValue.indexOf(searchTerm) !== -1;
                });
                successHandler(existingData);
            }, errorHandler);
        },
        getItem: function(key, successHandler, errorHandler){
            if(!successHandler){
                qmLog.error("No successHandler provided to localForage.getItem!");
                return;
            }
            qmLog.debug("Getting " + key + " from globals");
            var fromGlobals = qm.globalHelper.getItem(key);
            if(fromGlobals || fromGlobals === false || fromGlobals === 0){
                successHandler(fromGlobals);
                return
            }
            if(typeof localforage === "undefined"){
                var error = "localforage not defined so can't get " + key + "!";
                qmLog.error(error);
                if(errorHandler){errorHandler(error);}
                return;
            }
            qmLog.info("Getting " + key + " from localforage");
            localforage.getItem(key, function (err, data) {
                if(err){
                    if(errorHandler){errorHandler(err);}
                } else {
                    successHandler(data);
                }
            })
        },
        setItem: function(key, value, successHandler, errorHandler){
            value = JSON.parse(JSON.stringify(value)); // Failed to execute 'put' on 'IDBObjectStore': could not be cloned.
            qm.globalHelper.setItem(key, value);
            if(typeof localforage === "undefined"){
                var errorMessage = "local storage is undefined so can't set " + key;
                qmLog.error(errorMessage);
                if(errorHandler){errorHandler(errorMessage)};
                return;
            }
            localforage.setItem(key, value, function (err) {
                if(err){
                    if(errorHandler){errorHandler(err);}
                } else {
                    if(successHandler){successHandler();}
                }
            })
        },
        removeItem: function(key, value, successHandler, errorHandler){
            qm.globalHelper.removeItem(key);
            localforage.removeItem(key, function (err) {
                if(err){
                    if(errorHandler){errorHandler(err);}
                } else {
                    if(successHandler){successHandler();}
                }
            })
        },
        getWithFilters: function(localStorageItemName, successHandler, errorHandler, filterPropertyName, filterPropertyValue,
                                 lessThanPropertyName, lessThanPropertyValue,
                                 greaterThanPropertyName, greaterThanPropertyValue) {
            qm.localForage.getItem(localStorageItemName, function(data){
                data = qm.arrayHelper.filterByPropertyOrSize(data, filterPropertyName, filterPropertyValue,
                    lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
                successHandler(data);
            }, function (error) {
                if(errorHandler){errorHandler(error);}
            });
        },
        getElementsWithRequestParams: function(localStorageItemName, requestParams, successHandler, errorHandler) {
            qm.localForage.getItem(localStorageItemName, function (data) {
                data = qm.arrayHelper.filterByRequestParams(data, requestParams);
                successHandler(data);
            }, function (error) {
                if(errorHandler){errorHandler(error);}
            });
        },
        addToOrReplaceByIdAndMoveToFront: function(localStorageItemName, replacementElementArray, successHandler){
            qmLog.debug('qm.localForage.addToOrReplaceByIdAndMoveToFront in ' + localStorageItemName + ': ' +
                JSON.stringify(replacementElementArray).substring(0,20)+'...');
            // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
            qm.localForage.getItem(localStorageItemName, function(localStorageItemArray){
                var elementsToKeep = qm.arrayHelper.addToOrReplaceByIdAndMoveToFront(localStorageItemArray, replacementElementArray);
                qm.localForage.setItem(localStorageItemName, elementsToKeep);
                if(successHandler){successHandler(elementsToKeep);}
            });
        }
    },
    measurements: {
        getMeasurementsFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            var cachedData = qm.api.cacheGet(params, 'getMeasurementsFromApi');
            if(cachedData && successHandler){
                //successHandler(cachedData);
                //return;
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.MeasurementsApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getMeasurementsFromApi');
            }
            apiInstance.getMeasurements(params, callback);
        }
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
    notifications: {
        actions: {
            trackYesAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 1};
                console.log('trackYesAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackNoAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 0};
                console.log('trackNoAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackZeroAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 0};
                console.log('trackZeroAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackOneRatingAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 1};
                console.log('trackOneRatingAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackTwoRatingAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 2};
                console.log('trackTwoRatingAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackThreeRatingAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 3};
                console.log('trackThreeRatingAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackFourRatingAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 4};
                console.log('trackFourRatingAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackFiveRatingAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 5};
                console.log('trackDefaultValueAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackDefaultValueAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId};
                console.log('trackDefaultValueAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            snoozeAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId};
                console.log('snoozeAction push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                body.action = 'snooze';
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackLastValueAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: data.lastValue};
                qmLog.pushDebug('trackLastValueAction', ' Push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackSecondToLastValueAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: data.secondToLastValue};
                console.log('trackSecondToLastValueAction', ' Push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackThirdToLastValueAction: function (data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: data.thirdToLastValue};
                console.log('trackThirdToLastValueAction', ' Push data: ' + JSON.stringify(data), {pushData: data, notificationsPostBody: body});
                qm.notifications.postTrackingReminderNotifications(body);
            }
        },
        getFromGlobalsOrLocalStorage : function(variableCategoryName){
            var notifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
            if(!notifications || !notifications.length){return [];}
            if(variableCategoryName){
                return qm.arrayHelper.getByProperty('variableCategoryName', variableCategoryName, notifications);
            }
            return notifications;
        },
        getMostRecentRatingNotificationNotInSyncQueue: function(){
            // Need unique rating notifications because we need to setup initial popup via url params
            var uniqueRatingNotifications = qm.notifications.getAllUniqueRatingNotifications();
            if(!uniqueRatingNotifications){
                qmLog.info("No uniqueRatingNotifications in storage");
                return null;
            }
            for (var i = 0; i < uniqueRatingNotifications.length; i++) {
                var notification = uniqueRatingNotifications[i];
                if(!window.notificationsSyncQueue ||
                    !qm.arrayHelper.arrayHasItemWithSpecificPropertyValue('variableName', notification.variableName, window.notificationsSyncQueue)){
                    qmLog.info("Got uniqueRatingNotification not in sync queue: " + notification.variableName, null, notification);
                    var hoursAgo = qm.timeHelper.hoursAgo(notification.trackingReminderNotificationTimeEpoch);
                    if(hoursAgo < 24) {
                        //var dueTimeString = qm.timeHelper.getTimeSinceString(notification.trackingReminderNotificationTimeEpoch);
                        //console.log("due: "+ dueTimeString);
                        return notification;
                    }
                    console.log(hoursAgo + " hours ago is too old!");
                }
            }
            qmLog.info("No uniqueRatingNotifications not in sync queue");
            return null;
        },
        getMostRecentUniqueNotificationNotInSyncQueue: function(){
            var uniqueNotifications = qm.notifications.getUniqueNotificationsDueInLast24();
            if(!uniqueNotifications || !uniqueNotifications.length){
                qmLog.info("No uniqueNotifications due in last 24 in storage");
                return null;
            }
            for (var i = 0; i < uniqueNotifications.length; i++) {
                var notification = uniqueNotifications[i];
                if(!window.notificationsSyncQueue ||
                    !qm.arrayHelper.arrayHasItemWithSpecificPropertyValue('variableName', notification.variableName, window.notificationsSyncQueue)){
                    qmLog.info("Got uniqueNotification not in sync queue: " + notification.variableName);
                    return notification;
                }
            }
            qmLog.info("No uniqueNotifications not in sync queue");
            return null;
        },
        setLastPopupTime: function(time){
            if(typeof time === "undefined"){time = qm.timeHelper.getUnixTimestampInSeconds();}
            qmLog.pushDebug(arguments.callee.caller.name + " setLastPopupTime to "+ time);
            qm.storage.setItem(qm.items.lastPopupNotificationUnixTimeSeconds, time);
            return true;
        },
        getTimeSinceLastPopupString: function(){
            return qm.timeHelper.getTimeSinceString(qm.notifications.getLastPopupUnixTime());
        },
        getTimeSinceLastLocalNotification: function(){
            return qm.timeHelper.getTimeSinceString(qm.storage.getItem(qm.items.lastLocalNotificationTime));
        },
        getLastPopupUnixTime: function(){
            return qm.storage.getItem(qm.items.lastPopupNotificationUnixTimeSeconds);
        },
        lastPopupWasBeforeLastReminderTime: function () {
            var lastTime =  qm.notifications.getLastPopupUnixTime();
            qmLog.info("Last popup at " + qm.timeHelper.getTimeSinceString(lastTime));
            if(lastTime < qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getMostFrequentReminderIntervalInSeconds()){
                qmLog.error("No popups shown since before last reminder time!  Re-initializing popups...");
                return true; // Sometimes we lose permission for some reason
            }
            return false;
        },
        getSecondsSinceLastPopup: function(){
            return qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getLastPopupUnixTime();
        },
        getMostFrequentReminderIntervalInSeconds: function(){
            return qm.storage.getItem(qm.items.mostFrequentReminderIntervalInSeconds);
        },
        canWeShowPopupYet: function(path) {
            if(!qm.notifications.getLastPopupUnixTime()){
                qm.notifications.setLastPopupTime();
                return true;
            }
            var minimumTimeBetweenInMinutes = 30;
            if(qm.notifications.getMostFrequentReminderIntervalInMinutes() < 30){
                minimumTimeBetweenInMinutes = qm.notifications.getMostFrequentReminderIntervalInMinutes();
            }
            if(qm.notifications.getSecondsSinceLastPopup() > minimumTimeBetweenInMinutes * 60){
                qm.notifications.setLastPopupTime();
                return true;
            }
            qmLog.pushDebug('Too soon to show popup!', 'Cannot show popup because last one was only ' + qm.notifications.getTimeSinceLastPopupString() +
                ' and most Frequent Interval In Minutes is ' + minimumTimeBetweenInMinutes + ". path: " + path);
            return false;
        },
        getMostFrequentReminderIntervalInMinutes: function(){
            var mostFrequentReminderIntervalInSeconds = qm.storage.getItem(qm.items.mostFrequentReminderIntervalInSeconds);
            if(!mostFrequentReminderIntervalInSeconds){mostFrequentReminderIntervalInSeconds = 86400;}
            return mostFrequentReminderIntervalInSeconds/60;
        },
        setLastNotificationsRefreshTime: function(){
            window.qm.storage.setLastRequestTime("GET", qm.apiPaths.trackingReminderNotificationsPast);
        },
        getLastNotificationsRefreshTime: function(){
            var lastTime = window.qm.storage.getLastRequestTime("GET", qm.apiPaths.trackingReminderNotificationsPast);
            qmLog.info("Last notifications refresh " + qm.timeHelper.getTimeSinceString(lastTime));
            return lastTime;
        },
        getSecondsSinceLastNotificationsRefresh: function(){
            qmLog.info("Last notifications refresh " + qm.timeHelper.getTimeSinceString(qm.notifications.getLastNotificationsRefreshTime()));
            return qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getLastNotificationsRefreshTime();
        },
        addToSyncQueue: function(trackingReminderNotification){
            qm.notifications.deleteById(trackingReminderNotification.id);
            qm.userVariables.updateLatestMeasurementTime(trackingReminderNotification.variableName, trackingReminderNotification.modifiedValue);
            return qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.notificationsSyncQueue, trackingReminderNotification);
        },
        refreshIfEmpty: function(successHandler, errorHandler){
            if(!qm.notifications.getNumberInGlobalsOrLocalStorage()){
                window.qmLog.info('No notifications in local storage');
                qm.notifications.refreshNotifications(successHandler, errorHandler);
                return true;
            }
            qmLog.info(qm.notifications.getNumberInGlobalsOrLocalStorage() + ' notifications in local storage');
            successHandler();
            return false
        },
        refreshIfEmptyOrStale: function(callback){
            qmLog.info("qm.notifications.refreshIfEmptyOrStale");
            if (!qm.notifications.getNumberInGlobalsOrLocalStorage() || qm.notifications.getSecondsSinceLastNotificationsRefresh() > 3600){
                window.qmLog.info('Refreshing notifications because empty or last refresh was more than an hour ago');
                qm.notifications.refreshNotifications(callback);
            } else {
                window.qmLog.info('Not refreshing notifications because last refresh was last than an hour ago and we have notifications in local storage');
                if(callback){callback(qm.notifications.getFromGlobalsOrLocalStorage());}
            }
        },
        getAllUniqueRatingNotifications: function() {
            qmLog.info("Called getAllUniqueRatingNotifications");
            var ratingNotifications = qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'unitAbbreviatedName', '/5');
            if(!ratingNotifications){
                qmLog.info("No rating notifications in storage!");
                return null;
            }
            qmLog.info("Got " + ratingNotifications.length + " total NON-UNIQUE rating notification from storage");
            var unique = qm.arrayHelper.getUnique(ratingNotifications, 'variableName');
            qmLog.info("Got " + unique.length + " UNIQUE rating notifications");
            return unique;
        },
        getAllUniqueNotifications: function() {
            qmLog.info("Called getAllUniqueRatingNotifications");
            var notifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
            if(!notifications){
                qmLog.info("No notifications in storage!");
                return null;
            }
            qmLog.info("Got " + notifications.length + " total NON-UNIQUE notification from storage");
            var unique = qm.arrayHelper.getUnique(notifications, 'variableName');
            qmLog.info("Got " + unique.length + " UNIQUE notifications");
            return unique;
        },
        getNotificationsDueInLast24: function() {
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
        },
        getUniqueNotificationsDueInLast24: function() {
            var last24 = qm.notifications.getNotificationsDueInLast24();
            if(!last24){
                qmLog.info("No UNIQUE NotificationsDueInLast24 in localStorage");
                return null;
            }
            qmLog.info("Got " + last24.length + " total NON-UNIQUE notification due in last 24 from storage");
            var unique = qm.arrayHelper.getUnique(last24, 'variableName');
            qmLog.info("Got " + unique.length + " UNIQUE notifications");
            return unique;
        },
        deleteById: function(id){qm.storage.deleteById(qm.items.trackingReminderNotifications, id);},
        undo: function(){
            qmLog.info("Called undo notifcation tracking...");
            var notificationsSyncQueue = qm.storage.getItem(qm.items.notificationsSyncQueue);
            if(!notificationsSyncQueue){ return false; }
            notificationsSyncQueue[0].hide = false;
            qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.trackingReminderNotifications, notificationsSyncQueue[0]);
            qm.storage.deleteByProperty(qm.items.notificationsSyncQueue, 'trackingReminderNotificationId', notificationsSyncQueue[0].trackingReminderNotificationId);
        },
        getMostRecentRatingNotification: function (){
            var ratingNotifications = window.qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'unitAbbreviatedName', '/5');
            ratingNotifications = window.qm.arrayHelper.sortByProperty(ratingNotifications, 'trackingReminderNotificationTime');
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
        },
        deleteByVariableName: function(variableName){
            qm.storage.deleteByProperty(qm.items.trackingReminderNotifications, 'variableName', variableName);
        },
        refreshNotifications: function(successHandler, errorHandler) {
            var type = "GET";
            var route = qm.apiPaths.trackingReminderNotificationsPast;
            if(!qm.api.canWeMakeRequestYet(type, route, {blockRequests: true, minimumSecondsBetweenRequests: 300})){
                if(errorHandler){errorHandler();}
                return;
            }
            qm.api.getRequestUrl(route, function(url){
                // Can't use QM SDK in service worker
                qm.api.getViaXhrOrFetch(url, function (response) {
                    if(response.status === 401){
                        qm.chrome.showSignInNotification();
                    } else {
                        qm.storage.setTrackingReminderNotifications(response.data);
                        if(successHandler){successHandler(response.data);}
                    }
                })
            });

        },
        refreshAndShowPopupIfNecessary: function(notificationParams) {
            qm.notifications.refreshNotifications(notificationParams, function(trackingReminderNotifications){
                var uniqueNotification = window.qm.notifications.getMostRecentUniqueNotificationNotInSyncQueue();
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
                var numberOfWaitingNotifications = objectLength(trackingReminderNotifications);
                if(uniqueNotification){
                    function getChromeRatingNotificationParams(trackingReminderNotification){
                        return { url: qm.notifications.getRatingNotificationPath(trackingReminderNotification),
                            type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110, focused: true};
                    }
                    qm.chrome.openOrFocusChromePopupWindow(getChromeRatingNotificationParams(uniqueNotification));
                    qm.chrome.updateChromeBadge(0);
                } else if (numberOfWaitingNotifications > 0) {
                    qm.chrome.createSmallNotificationAndOpenInboxInBackground();
                }
            });
            return notificationParams;
        },
        getNumberInGlobalsOrLocalStorage: function(variableCategoryName){
            var notifications = qm.notifications.getFromGlobalsOrLocalStorage(variableCategoryName);
            if(notifications){return notifications.length;}
            return 0;
        },
        postTrackingReminderNotifications: function(trackingReminderNotifications, onDoneListener, timeout) {
            qmLog.pushDebug("postTrackingReminderNotifications", JSON.stringify(trackingReminderNotifications), trackingReminderNotifications);
            if(!qm.arrayHelper.variableIsArray(trackingReminderNotifications)){trackingReminderNotifications = [trackingReminderNotifications];}
            if(!onDoneListener){
                onDoneListener = function (response) {
                    qmLog.pushDebug("postTrackingReminderNotifications response ", JSON.stringify(response), response);
                }
            }
            qm.api.postToQuantiModo(trackingReminderNotifications, "v1/trackingReminderNotifications", onDoneListener);
            if(timeout){
                setTimeout(function () {
                    qmLog.info("Timeout expired so closing");
                    qm.notifications.closePopup();  // Avoid leaving the popup open too long
                }, timeout);
            }
        },
        getRatingNotificationPath: function(ratingTrackingReminderNotification){
            if(ratingTrackingReminderNotification.unitAbbreviatedName !== '/5'){
                qmLog.error('ratingTrackingReminderNotification must have unit /5');
            }
            var url = "android_popup.html?variableName=" + encodeURIComponent(ratingTrackingReminderNotification.variableName) +
                "&valence=" + ratingTrackingReminderNotification.valence +
                "&trackingReminderNotificationId=" + ratingTrackingReminderNotification.trackingReminderNotificationId;
            url = qm.api.addGlobalParams(url);
            return url;
        },
        closePopup: function() {
            window.qmLog.info('closing popup');
            qm.notifications.clearNotifications();
            window.close();
            if(typeof OverApps !== "undefined"){
                console.log("Calling OverApps.closeWebView()...");
                OverApps.closeWebView();
            } else {
                console.error("OverApps is undefined!");
            }
        },
        clearNotifications: function() {
            if(!qm.platform.isChromeExtension()){ window.qmLog.debug('Can\'t clearNotifications because chrome is undefined'); return;}
            qm.chrome.updateChromeBadge(0);
            chrome.notifications.clear("moodReportNotification", function() {});
        }
    },
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
        },
        unsetNullProperties: function(object){
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    if(object[property] === null){
                        delete object[property];
                    }
                }
            }
            return object;
        },
        objectContainsString: function(object, needle){
            if(!object){return false;}
            var haystack = JSON.stringify(object).toLowerCase();
            return haystack.indexOf(needle) !== -1;
        },
        snakeToCamelCaseProperties: function(object){
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    var camel = prop.toCamelCase();
                    object[camel] = object[prop];
                    delete object[prop];
                }
            }
            return object;
        },
        getValueOfPropertyOrSubPropertyWithNameLike: function (wantedKeyNameNeedle, obj) {
            // This function handles arrays and objects
            wantedKeyNameNeedle = wantedKeyNameNeedle.toLowerCase();
            function eachRecursive(obj) {
                for (var key in obj) {
                    if (!obj.hasOwnProperty(key)) {
                        continue;       // skip this property
                    }
                    if (typeof obj[key] === "object" && obj[key] !== null) {
                        var result = eachRecursive(obj[key]);
                        if(result){
                            return result;
                        }
                    } else {
                        var lowerCase = key.toLowerCase();
                        if(lowerCase.indexOf(wantedKeyNameNeedle) !== -1){
                            return obj[key];
                        }
                    }
                }
                return null;
            }
            var value = eachRecursive(obj);
            return value;
        }

    },
    parameterHelper: {
        getStateOrUrlOrRootScopeCorrelationOrRequestParam: function(paramName, $stateParams, $scope, $rootScope){
            if(qm.urlHelper.getParam(paramName)){return qm.urlHelper.getParam(paramName, window.location.href, true);}
            if($stateParams && $stateParams[paramName]){ return $stateParams[paramName]; }
            if($scope && $scope.state && $scope.state.requestParams && $scope.state.requestParams[paramName]){return $scope.state.requestParams[paramName];}
            if($rootScope && $rootScope[paramName]){return $rootScope[paramName];}
        }
    },
    platform: {
        isChromeExtension: function (){
            if(qm.platform.isMobile()){return false;}
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
            window.qmLog.debug('isChromeExtension returns true', null, null);
            return true;
        },
        isWeb: function (){
            var isWeb = false;
            if(window.location.href.indexOf("https://") === 0){isWeb = true;}
            if(window.location.href.indexOf("http://") === 0){isWeb = true;}
            if(window.location.href.indexOf("http://localhost:") === 0){isWeb = true;}
            return isWeb;
        },
        isWebOrChrome: function () {
            return qm.platform.isWeb() || qm.platform.isChromeExtension();
        },
        isAndroid: function (){
            if(window.location.href.indexOf('/android_asset/') !== -1){return true;}
            if(typeof ionic !== "undefined"){
                return ionic.Platform.isAndroid() && !qm.platform.isWeb();
            }
            return false;
        },
        isIOS: function (){
            if(typeof ionic !== "undefined"){
                return ionic.Platform.isIOS() && !qm.platform.isWeb();
            }
            return false;
        },
        isMobile: function (){return qm.platform.isAndroid() || qm.platform.isIOS();},
        getCurrentPlatform: function(){
            if(qm.urlHelper.getParam('platform')){return qm.urlHelper.getParam('platform');}
            if(qm.platform.isChromeExtension()){return qm.platform.types.chromeExtension;}
            if(qm.platform.isAndroid()){return qm.platform.types.android;}
            if(qm.platform.isIOS()){return qm.platform.types.ios;}
            if(qm.platform.isWeb()){return qm.platform.types.web;}
            if(typeof ionic !== "undefined"){
                var ionicPlatform = ionic.Platform.platform();
                if(!ionic.Platform.isIPad() && !ionic.Platform.isIOS() && !ionic.Platform.isAndroid()){return qm.platform.web;}
                qmLog.error("Could not determine platform so returning " + ionicPlatform);
                return ionicPlatform;
            } else {
                qmLog.error("Could not determine platform");
            }
        },
        types: {
            web: "web",
            android: "android",
            ios: "ios",
            chromeExtension: "chromeExtension"
        },
        isDevelopmentMode: function(){
            return window.location.href.indexOf("://localhost:") !== -1;
        },
        isDesignMode: function () {
            return qm.getAppSettings().designMode;
        },
        browser: {
            get: function(){
                if(qm.platform.browser.isChrome()){return "chrome";}
                if(qm.platform.browser.isFirefox()){return "firefox";}
                if(qm.platform.browser.isEdge()){return "edge";}
                if(qm.platform.browser.isIE()){return "ie";}
                if(qm.platform.browser.isSafari()){return "safari";}
                if(qm.platform.browser.isOpera()){return "opera";}
                if(qm.platform.browser.isBlink()){return "blink";}
            },
            isFirefox: function(){
                return typeof InstallTrigger !== 'undefined';
            },
            isChrome: function () {
                return !!window.chrome && !!window.chrome.webstore;
            },
            isEdge: function () {
                return !isIE && !!window.StyleMedia;
            },
            isIE: function () {
                return /*@cc_on!@*/false || !!document.documentMode;
            },
            isSafari: function () {
                return /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
            },
            isOpera: function () {
                return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            },
            isBlink: function () {
                return (qm.platform.browser.isChrome() || qm.platform.browser.isOpera()) && !!window.CSS;
            }
        }
    },
    push: {
        getLastPushTimeStampInSeconds: function(){return qm.storage.getItem(qm.items.lastPushTimestamp);},
        getHoursSinceLastPush: function(){
            return Math.round((window.qm.timeHelper.secondsAgo(qm.push.getLastPushTimeStampInSeconds()))/3600);
        },
        getMinutesSinceLastPush: function(){
            return Math.round((window.qm.timeHelper.secondsAgo(qm.push.getLastPushTimeStampInSeconds()))/60);
        },
        getTimeSinceLastPushString: function(){
            return qm.timeHelper.getTimeSinceString(qm.push.getLastPushTimeStampInSeconds());
        },
        enabled: function () {
            if(!qm.userHelper.getUserFromLocalStorage()){return false;}
            return qm.userHelper.getUserFromLocalStorage().pushNotificationsEnabled;
        }
    },
    reminderHelper: {
        getNumberOfReminders: function(callback){
            var number = qm.reminderHelper.getNumberOfTrackingRemindersInLocalStorage();
            if(number){
                callback(number);
                return;
            }
            qm.reminderHelper.getTrackingRemindersFromApi({}, function () {
                number = qm.reminderHelper.getNumberOfTrackingRemindersInLocalStorage();
                callback(number);
            });
        },
        getTrackingRemindersFromApi: function(params, successHandler, errorHandler){
            qm.api.configureClient();
            var apiInstance = new Quantimodo.RemindersApi();
            function callback(error, data, response) {
                if (data) { qm.reminderHelper.saveToLocalStorage(data); }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getTrackingRemindersFromApi');
            }
            params = qm.api.addGlobalParams(params);
            apiInstance.getTrackingReminders(params, callback);
        },
        getNumberOfTrackingRemindersInLocalStorage: function () {
            var trackingReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            if(trackingReminders && trackingReminders.length){return trackingReminders.length;}
            return 0;
        },
        getTrackingRemindersFromLocalStorage: function(requestParams){
            return qm.storage.getElementsWithRequestParams(qm.items.trackingReminders, requestParams);
        },
        saveToLocalStorage: function(trackingReminders){
            trackingReminders = qm.arrayHelper.unsetNullProperties(trackingReminders);
            var sizeInKb = getSizeInKiloBytes(trackingReminders);
            if(sizeInKb > 2000){
                trackingReminders = qm.reminderHelper.removeArchivedReminders(trackingReminders);
            }
            var mostFrequentReminderIntervalInSeconds = 86400;
            if(trackingReminders){
                for (var i = 0; i < trackingReminders.length; i++) {
                    var currentFrequency = trackingReminders[i].reminderFrequency;
                    if(currentFrequency && currentFrequency < mostFrequentReminderIntervalInSeconds){
                        mostFrequentReminderIntervalInSeconds = currentFrequency;
                    }
                }
            }
            qm.storage.setItem(qm.items.mostFrequentReminderIntervalInSeconds, mostFrequentReminderIntervalInSeconds);
            qm.storage.setItem(qm.items.trackingReminders, trackingReminders);
        },
        removeArchivedReminders: function(allReminders){
            var activeReminders = qm.reminderHelper.getActive(allReminders);
            var favorites = qm.reminderHelper.getFavorites(allReminders);
            return activeReminders.concat(favorites);
        },
        getFavorites: function(allReminders){
            if(!allReminders){allReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();}
            if(!allReminders){return [];}
            return allReminders.filter(function( trackingReminder ) {
                return trackingReminder.reminderFrequency === 0;
            });
        },
        getActive: function(allReminders){
            if(!allReminders){
                allReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            }
            if(!allReminders){return [];}
            return allReminders.filter(function( trackingReminder ) {
                return trackingReminder.reminderFrequency !== 0 &&
                    trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') === -1;
            });
        },
        getArchived: function(allReminders) {
            if(!allReminders){allReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();}
            return allReminders.filter(function (trackingReminder) {
                return trackingReminder.reminderFrequency !== 0 &&
                    trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') !== -1;
            });
        },
    },
    ratingImages: {
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
    },
    serviceWorker: false,
    storage: {
        getUserVariableByName: function (variableName, updateLatestMeasurementTime, lastValue) {
            var userVariables = qm.storage.getWithFilters(qm.items.userVariables, 'name', variableName);
            if(!userVariables || !userVariables.length){return null;}
            var userVariable = userVariables[0];
            userVariable.lastAccessedUnixTime = qm.timeHelper.getUnixTimestampInSeconds();
            if(updateLatestMeasurementTime){userVariable.latestMeasurementTime = qm.timeHelper.getUnixTimestampInSeconds();}
            if(lastValue){
                userVariable.lastValue = lastValue;
                userVariable.lastValueInUserUnit = lastValue;
            }
            qm.userVariables.saveToLocalStorage(userVariable);
            return userVariable;
        },
        setTrackingReminderNotifications: function(notifications){
            if(!notifications){
                qmLog.error("No notifications provided to qm.storage.setTrackingReminderNotifications");
                return;
            }
            qmLog.debug("Saving " + notifications.length + " notifications to local storage", null, {notifications: notifications});
            qmLog.info("Saving " + notifications.length + " notifications to local storage");
            qm.notifications.setLastNotificationsRefreshTime();
            window.qm.chrome.updateChromeBadge(notifications.length);
            qm.storage.setItem(qm.items.trackingReminderNotifications, notifications);
        },
        deleteByProperty: function (localStorageItemName, propertyName, propertyValue){
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            if(!localStorageItemArray){
                window.qmLog.info('Local storage item ' + localStorageItemName + ' not found! Local storage items: ' + JSON.stringify(qm.storage.getLocalStorageList()));
            } else {
                qm.storage.setItem(localStorageItemName, qm.arrayHelper.deleteFromArrayByProperty(localStorageItemArray, propertyName, propertyValue));
            }
        },
        deleteByPropertyInArray: function (localStorageItemName, propertyName, objectsArray){
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            if(!localStorageItemArray){
                window.qmLog.info('Local storage item ' + localStorageItemName + ' not found! Local storage items: ' + JSON.stringify(qm.storage.getLocalStorageList()));
            } else {
                var arrayOfValuesForProperty = objectsArray.map(function(a) {return a[propertyName];});
                for (var i=0; i < arrayOfValuesForProperty.length; i++) {
                    localStorageItemArray = qm.arrayHelper.deleteFromArrayByProperty(localStorageItemArray, propertyName, arrayOfValuesForProperty[i]);
                }
                qm.storage.setItem(localStorageItemName, localStorageItemArray);
            }
        },
        getAllLocalStorageDataWithSizes: function(summary){
            if(typeof localStorage === "undefined"){
                qmLog.debug("localStorage not defined");
                return false;
            }
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
        },
        getWithFilters: function(localStorageItemName, filterPropertyName, filterPropertyValue,
                                 lessThanPropertyName, lessThanPropertyValue,
                                 greaterThanPropertyName, greaterThanPropertyValue) {
            var matchingElements = qm.storage.getItem(localStorageItemName);
            if(!matchingElements){return null;}
            matchingElements = qm.arrayHelper.filterByPropertyOrSize(matchingElements, filterPropertyName, filterPropertyValue,
                lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
            return matchingElements;
        },
        getTrackingReminderNotifications: function(variableCategoryName, limit) {
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
        },
        getAsString: function(key) {
            var item = qm.storage.getItem(key);
            if(item === "null" || item === "undefined"){
                qm.storage.removeItem(key);
                return null;
            }
            return item;
        },
        deleteById: function(localStorageItemName, elementId){
            window.qm.storage.deleteByProperty(localStorageItemName, 'id', elementId);
        },
        removeItem: function(key){
            qmLog.debug("Removing " + key + " from local storage");
            qm.globalHelper.removeItem(key);
            if(typeof localStorage === "undefined"){
                qmLog.debug("localStorage not defined");
                return false;
            }
            return localStorage.removeItem(key);
        },
        clear: function(){
            qm.globals = {};
            if(typeof localStorage === "undefined"){return false;}
            localStorage.clear();
        },
        getElementOfLocalStorageItemById: function(localStorageItemName, elementId){
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            if(!localStorageItemArray){
                console.warn("Local storage item " + localStorageItemName + " not found");
            } else {
                for(var i = 0; i < localStorageItemArray.length; i++){
                    if(localStorageItemArray[i].id === elementId){return localStorageItemArray[i];}
                }
            }
        },
        addToOrReplaceByIdAndMoveToFront: function(localStorageItemName, replacementElementArray){
            qmLog.debug('qm.storage.addToOrReplaceByIdAndMoveToFront in ' + localStorageItemName + ': ' +
                JSON.stringify(replacementElementArray).substring(0,20)+'...');
            // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            var elementsToKeep = qm.arrayHelper.addToOrReplaceByIdAndMoveToFront(localStorageItemArray, replacementElementArray);
            qm.storage.setItem(localStorageItemName, elementsToKeep);
            return elementsToKeep;
        },
        setGlobal: function(key, value){
            if(key === "userVariables" && typeof value === "string"){
                qmLog.error("userVariables should not be a string!");
            }
            qmLog.debug("Setting " + key + " in globals");
            qm.globals[key] = value;
        },
        setLastRequestTime: function(type, route){
            window.qm.storage.setItem(getLocalStorageNameForRequest(type, route), qm.timeHelper.getUnixTimestampInSeconds());
        },
        getLastRequestTime: function(type, route){
            return window.qm.storage.getItem(getLocalStorageNameForRequest(type, route));
        },
        setItem: function(key, value){
            if(typeof value === "undefined"){
                qmLog.error("value provided to qm.storage.setItem is undefined!");
                return;
            }
            if(value === "null"){
                qmLog.error("null string provided to qm.storage.setItem!");
                return;
            }
            if(value === qm.storage.getGlobal(key)){
                var valueString = JSON.stringify(value);
                qmLog.debug("Not setting " + key + " in localStorage because global is already set to " + valueString, null, value);
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
                if(typeof localStorage === "undefined"){
                    qmLog.debug("localStorage not defined");
                    return false;
                }
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
        },
        getGlobal: function(key){
            qmLog.debug("getting " + key + " from globals");
            if(typeof qm.globals[key] === "undefined"){return null;}
            if(qm.globals[key] === "false"){return false;}
            if(qm.globals[key] === "true"){return true;}
            if(qm.globals[key] === "null"){return null;}
            return qm.globals[key];
        },
        getItem: function(key){
            if(!key){
                qmLog.error("No key provided to qm.storage.getItem");
                return null;
            }
            var fromGlobals = qm.storage.getGlobal(key);
            if(fromGlobals){
                qmLog.debug("Got " + key + " from globals");
                return fromGlobals;
            }
            if(typeof localStorage === "undefined"){
                qmLog.debug("localStorage not defined");
                return false;
            }
            var item = localStorage.getItem(key);
            if(item === "undefined"){
                qmLog.error(key + " from localStorage is undefined!");
                localStorage.removeItem(key);
                return null;
            }
            if (item && typeof item === "string"){
                qmLog.debug("Parsing " + key + " and setting in globals");
                qm.globals[key] = qm.stringHelper.parseIfJsonString(item, item);
                window.qmLog.debug('Got ' + key + ' from localStorage: ' + item.substring(0, 18) + '...');
                return qm.globals[key];
            } else {
                window.qmLog.debug(key + ' not found in localStorage');
            }
            return null;
        },
        clearOAuthTokens: function(){
            qm.auth.saveAccessToken(null);
            window.qm.storage.setItem('refreshToken', null);
            window.qm.storage.setItem('expiresAtMilliseconds', null);
        },
        appendToArray: function(localStorageItemName, elementToAdd){
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
        },
        deleteTrackingReminderNotification: function(body){
            var trackingReminderNotificationId = body;
            if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotification){trackingReminderNotificationId = body.trackingReminderNotification.id;}
            if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotificationId){trackingReminderNotificationId = body.trackingReminderNotificationId;}
            if(qm.storage.getTrackingReminderNotifications() && qm.storage.getTrackingReminderNotifications().length){
                window.qmLog.info(null, 'Deleting notification with id ' + trackingReminderNotificationId, null);
                window.qm.storage.deleteById(qm.items.trackingReminderNotifications, trackingReminderNotificationId);
            } else {
                window.qm.notifications.refreshIfEmpty();
            }
        },
        getLocalStorageList: function(){
            if(typeof localStorage === "undefined"){
                qmLog.debug("localStorage not defined");
                return false;
            }
            var localStorageItemsArray = [];
            for (var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                localStorageItemsArray.push({name: key});
            }
            return localStorageItemsArray;
        },
        getElementsWithRequestParams: function(localStorageItemName, requestParams) {
            qmLog.info("Getting " + localStorageItemName + " WithRequestParams");
            var array = qm.storage.getItem(localStorageItemName);
            array = qm.arrayHelper.filterByRequestParams(array, requestParams);
            return array;
        },
        clearStorageExceptForUnitsAndCommonVariables: function(){
            qmLog.info('Clearing local storage!');
            var commonVariables = qm.storage.getItem(qm.items.commonVariables);
            var units = qm.storage.getItem(qm.items.units);
            qm.storage.clear();
            qm.storage.setItem(qm.items.commonVariables, commonVariables);
            qm.storage.setItem(qm.items.units, units);
            qm.localForage.clear();
        }
    },
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
        },
        parseIfJsonString: function(stringOrObject, defaultValue) {
            defaultValue = defaultValue || null;
            if(!stringOrObject){return stringOrObject;}
            if(typeof stringOrObject !== "string"){return stringOrObject;}
            try {
                return JSON.parse(stringOrObject);
            } catch (e) {
                return defaultValue;
            }
        },
        getStringBeforeSubstring: function(needle, haystack){
            var i = haystack.indexOf(needle);
            if(i > 0)
                return  haystack.slice(0, i);
            else
                return haystack;
        },
        toCamelCaseCase: function(string) {
            return string.toCamelCase();
        },
        getStringBetween: function(string, firstString, secondString){
            var between = string.match(firstString+"(.*)"+secondString);
            if(!between){return null;}
            console.log(between[1] + " is between " + firstString + " and " + secondString + " in " +  string);
            return between[1];
        },
        getStringAfter: function(fullString, substring){
            return fullString.split(substring)[1];
        },
        truncateIfGreaterThan: function (string, maxCharacters) {
            if(string.length > maxCharacters){
                return string.substring(0, maxCharacters) + '...';
            } else {
                return string;
            }
        },
        replaceAll: function(str, find, replace){
            function escapeRegExp(str) {
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        },
        camelToTitleCase: function(text){
            var result = text.replace( /([A-Z])/g, " $1" );
            var finalResult = result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.
            return finalResult;
        }
    },
    studyHelper: {
        lastStudyOrCorrelation: null,
        getCauseVariable: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('causeVariable', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('causeVariable', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudyOrCorrelation){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudyOrCorrelation;
                if(lastStudyOrCorrelation.causeVariable){return lastStudyOrCorrelation.causeVariable;}
                if(lastStudyOrCorrelation.causeVariable){
                    return lastStudyOrCorrelation.causeVariable;
                }
            }
        },
        getEffectVariable: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('effectVariable', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('effectVariable', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudyOrCorrelation){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudyOrCorrelation;
                if(lastStudyOrCorrelation.effectVariable){return lastStudyOrCorrelation.effectVariable;}
                if(lastStudyOrCorrelation.effectVariable){
                    return lastStudyOrCorrelation.effectVariable;
                }
            }
        },
        getCauseVariableName: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('causeVariableName', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('causeVariableName', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudyOrCorrelation){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudyOrCorrelation;
                if(lastStudyOrCorrelation.causeVariableName){return lastStudyOrCorrelation.causeVariableName;}
                if(lastStudyOrCorrelation.causeVariable){
                    return lastStudyOrCorrelation.causeVariable.variableName || lastStudyOrCorrelation.causeVariable.name;
                }
            }
        },
        getEffectVariableName: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('effectVariableName', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('effectVariableName', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudyOrCorrelation){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudyOrCorrelation;
                if(lastStudyOrCorrelation.effectVariableName){return lastStudyOrCorrelation.effectVariableName;}
                if(lastStudyOrCorrelation.effectVariable){
                    return lastStudyOrCorrelation.effectVariable.variableName || lastStudyOrCorrelation.effectVariable.name;
                }
            }
        },
        getCauseVariableId: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('causeVariableId', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('causeVariableId', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudyOrCorrelation){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudyOrCorrelation;
                if(lastStudyOrCorrelation.causeVariableId){return lastStudyOrCorrelation.causeVariableId;}
                if(lastStudyOrCorrelation.causeVariable){
                    return lastStudyOrCorrelation.causeVariable.variableId || lastStudyOrCorrelation.causeVariable.id;
                }
            }
        },
        getEffectVariableId: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('effectVariableId', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateOrUrlOrRootScopeCorrelationOrRequestParam('effectVariableId', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudyOrCorrelation){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudyOrCorrelation;
                if(lastStudyOrCorrelation.effectVariableId){return lastStudyOrCorrelation.effectVariableId;}
                if(lastStudyOrCorrelation.effectVariable){
                    return lastStudyOrCorrelation.effectVariable.variableId || lastStudyOrCorrelation.effectVariable.id;
                }
            }
        },
        getLastStudy: function(callback){
            if(qm.studyHelper.lastStudyOrCorrelation){callback(qm.studyHelper.lastStudyOrCorrelation);}
            qm.localForage.getItem(qm.items.lastStudyOrCorrelation, callback);
        },
        getLastStudyIfMatchesVariableNames: function(causeVariableName, effectVariableName, callback) {
            if(!callback){
                if(qm.studyHelper.lastStudyOrCorrelation && qm.studyHelper.lastStudyOrCorrelation.causeVariableName === causeVariableName && qm.studyHelper.lastStudyOrCorrelation.effectVariableName === effectVariableName){
                    return qm.studyHelper.lastStudyOrCorrelation;
                }
            }
            qm.studyHelper.getLastStudy(function (lastStudyOrCorrelation) {
                if(lastStudyOrCorrelation.causeVariableName === causeVariableName && lastStudyOrCorrelation.effectVariableName === effectVariableName){
                    callback(lastStudyOrCorrelation);
                }
            });
        },
        saveLastStudy: function(study){
            if(!study){
                qmLog.error("No study provided to saveLastStudy");
                return;
            }
            qm.localForage.setItem(qm.items.lastStudyOrCorrelation, study);
        },
        deleteLastStudy: function(){
            qmLog.info("deleteLastStudy");
            qm.localForage.removeItem(qm.items.lastStudyOrCorrelation);
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
        convertUnixTimeStampToISOString: function (UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        },
        addTimeZoneOffsetProperty: function(obj){
            var a = new Date();
            obj.timeZoneOffset = a.getTimezoneOffset();
            return obj;
        }
    },
    trackingReminderNotifications : [],
    unitHelper: {
        getNonAdvancedUnits: function(){
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
        },
        inNonAdvancedUnitAbbreviatedNames: function(unitAbbreviatedName){
            var nonAdvancedUnitAbbreviatedNames = [];
            var allUnits = qm.storage.getItem(qm.items.units);
            for (var i = 0; i < allUnits.length; i++) {
                if(!allUnits[i].advanced){nonAdvancedUnitAbbreviatedNames.push(allUnits[i].abbreviatedName);}
            }
            return nonAdvancedUnitAbbreviatedNames.indexOf(unitAbbreviatedName) > -1;
        },
        getManualTrackingUnits: function(){
            var manualTrackingUnitObjects = [];
            var allUnits = qm.storage.getItem(qm.items.units);
            for (var i = 0; i < allUnits.length; i++) {
                if(allUnits[i].manualTracking){manualTrackingUnitObjects.push(allUnits[i]);}
            }
            var showMoreUnitsObject = {name: "Show more units", abbreviatedName: "Show more units"};
            manualTrackingUnitObjects.push(showMoreUnitsObject);
            return manualTrackingUnitObjects;
        },
        inManualTrackingUnitUnitAbbreviatedNames: function(unitAbbreviatedName){
            var manualTrackingUnitUnitAbbreviatedNames = [];
            var allUnits = qm.storage.getItem(qm.items.units);
            for (var i = 0; i < allUnits.length; i++) {
                if(allUnits[i].manualTracking){manualTrackingUnitUnitAbbreviatedNames.push(allUnits[i].abbreviatedName);}
            }
            return manualTrackingUnitUnitAbbreviatedNames.indexOf(unitAbbreviatedName) > -1;
        },
        getAllUnits: function(){
            return qm.storage.getItem(qm.items.units);
        },
        getProgressivelyMoreUnits: function(currentlyDisplayedUnits){
            if(!currentlyDisplayedUnits){return qm.unitHelper.getNonAdvancedUnits();}
            if(currentlyDisplayedUnits === qm.unitHelper.getNonAdvancedUnits()){return qm.unitHelper.getManualTrackingUnits();}
            return qm.unitHelper.getAllUnits();
        },
        getByAbbreviatedName: function(unitAbbreviatedName){
            var allUnits = qm.storage.getItem(qm.items.units);
            for (var i = 0; i < allUnits.length; i++) {
                if(allUnits[i].abbreviatedName === unitAbbreviatedName){return allUnits[i];}
            }
            return null;
        },
        indexByAbbreviatedName: function(){
            var allUnits = qm.storage.getItem(qm.items.units);
            qm.unitsIndexedByAbbreviatedName = [];
            for (var i = 0; i < allUnits.length; i++) {
                qm.unitsIndexedByAbbreviatedName[allUnits[i].abbreviatedName] = allUnits[i];
            }
            return qm.unitsIndexedByAbbreviatedName;
        },
        getUnitArrayContaining: function(currentUnitAbbreviatedName){
            if(!currentUnitAbbreviatedName || currentUnitAbbreviatedName === ""){return qm.unitHelper.getNonAdvancedUnits();}
            if(qm.unitHelper.inNonAdvancedUnitAbbreviatedNames(currentUnitAbbreviatedName)){return qm.unitHelper.getNonAdvancedUnits();}
            if(qm.unitHelper.inManualTrackingUnitUnitAbbreviatedNames(currentUnitAbbreviatedName)){return qm.unitHelper.getManualTrackingUnits();}
            return qm.unitHelper.getAllUnits();
        },
        getUnitsFromApiAndIndexByAbbreviatedNames: function(successHandler, errorHandler){
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
        }
    },
    urlHelper: {
        getParam: function(parameterName, url, shouldDecode) {
            if(!url){url = window.location.href;}
            if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
            if(url.split('?').length > 1){
                var queryString = url.split('?')[1];
                var parameterKeyValuePairs = queryString.split('&');
                for (var i = 0; i < parameterKeyValuePairs.length; i++) {
                    var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
                    if (currentParameterKeyValuePair[0].toCamelCase().toLowerCase() === parameterName.toCamelCase().toLowerCase()) {
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
        },
        openUrlInNewTab: function (url, showLocation) {
            showLocation = showLocation || 'yes';
            //window.open(url, '_blank', 'location='+showLocation);
            window.open(url, '_blank');
        },
        getIonicUrlForPath: function(path) {
            return qm.urlHelper.getIonicAppBaseUrl() + "index.html#/app/" + path;
        },
        getIonicAppBaseUrl: function (){
            var url = window.location.origin + window.location.pathname;
            url = qm.stringHelper.getStringBeforeSubstring('configuration-index.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('index.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('android_popup.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('firebase-messaging-sw.js', url);
            url = qm.stringHelper.getStringBeforeSubstring('_generated_background_page.html', url);
            return url;
        },
        getAbsoluteUrlFromRelativePath: function (relativePath){
            if(relativePath.indexOf('/') === 0){
                relativePath = relativePath.replace('/', '');
            }
            return qm.urlHelper.getIonicAppBaseUrl() + relativePath;
        },
        getPrivateConfigJsonUrl: function(){
            return qm.urlHelper.getAbsoluteUrlFromRelativePath('default.private_config.json');
        },
        addUrlQueryParamsToUrl: function (params, url){
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    if(url.indexOf(key + '=') === -1){
                        if(url.indexOf('?') === -1){
                            url = url + "?" + key + "=" + encodeURIComponent(params[key]);
                        } else {
                            url = url + "&" + key + "=" + encodeURIComponent(params[key]);
                        }
                    }
                }
            }
            return url;
        },
        onQMSubDomain: function () {
            if(window.location.href.indexOf('https://') !== 0){return false;}
            return window.location.href.indexOf('.quantimo.do') !== -1;
        },
        redirectToHttpsIfNecessary: function (){
            if(window.location.href.indexOf("http://") === 0 && window.location.href.indexOf("http://localhost") === -1){
                location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
            }
        }
    },
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
        getUserFromLocalStorage: function(successHandler){
            if(!window.qmUser) {window.qmUser = qm.storage.getItem(qm.items.user);}
            function checkUserId(user) {
                if(user && user.ID){
                    user.id = user.ID;
                    user = qm.objectHelper.snakeToCamelCaseProperties(user);
                }
                if(user && !user.id){
                    console.error("No user id in "+ JSON.stringify(qmUser));  // Don't use qmLog.error to avoid infinite loop
                    qm.userHelper.setUser(null);
                    return null;
                }
                return user;
            }
            if(!successHandler) {
                if(!window.qmUser){qmLog.debug("We do not have a user in local storage!");}
                return checkUserId(window.qmUser);
            }
            if(window.qmUser){
                successHandler(checkUserId(window.qmUser));
                return
            }
            qm.localForage.getItem(qm.items.user, function(user){
                window.qmUser = user;
                successHandler(checkUserId(user));
            });
        },
        isTestUser: function(){return window.qmUser && window.qmUser.displayName.indexOf('test') !== -1 && window.qmUser.id !== 230;},
        setUser: function(user){
            if(user && user.data && user.data.user){user = user.data.user;}
            window.qmUser = user;
            qm.storage.setItem(qm.items.user, user);
            qm.localForage.setItem(qm.items.user, user);
            if(!user){return;}
            window.qmLog.debug(window.qmUser.displayName + ' is logged in.');
            if(qm.urlHelper.getParam('doNotRemember')){return;}
            qmLog.setupUserVoice();
            if(!user.accessToken){
                qmLog.error("User does not have access token!", null, {userToSave: user});
            } else {
                qm.auth.saveAccessTokenResponse(user);
            }
        },
        withinAllowedNotificationTimes: function(){
            if(qm.userHelper.getUserFromLocalStorage()){
                var now = new Date();
                var hours = now.getHours();
                var currentTime = hours + ':00:00';
                if(currentTime > qm.userHelper.getUserFromLocalStorage().latestReminderTime ||
                    currentTime < qm.userHelper.getUserFromLocalStorage().earliestReminderTime ){
                    window.qmLog.info('Not showing notification because outside allowed time range');
                    return false;
                }
            }
            return true;
        },
        getUserFromApi: function(successCallback, errorHandler){
            qmLog.info("Getting user from API...");
            function successHandler(userFromApi){
                if (userFromApi && typeof userFromApi.displayName !== "undefined") {
                    qmLog.info("Got user from API...");
                    qm.userHelper.setUser(userFromApi);
                    if(successCallback){successCallback(userFromApi);}
                } else {
                    qmLog.info("Could not get user from API...");
                    if(qm.platform.isChromeExtension()){
                        qm.api.getRequestUrl("v2/auth/login", function(url){
                            chrome.tabs.create({"url": url, "selected": true});
                        });
                    }
                }
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.UserApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getUserFromApi');
            }
            var params = qm.api.addGlobalParams({});
            apiInstance.getUser(params, callback);
        },
        getUserFromLocalStorageOrApi: function (successHandler, errorHandler) {
            qm.userHelper.getUserFromLocalStorage(function(user) {
                if(user) {
                    if(successHandler){successHandler(user);}
                    return;
                }
                qm.userHelper.getUserFromApi(successHandler, errorHandler);
            });
        }
    },
    commonVariablesHelper: {
        getCommonVariablesFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            if(!params.sort || params.sort.indexOf('latestMeasurementTime') !== -1){params.sort = '-numberOfUserVariables';}
            params.commonOnly = true;
            if(!params.limit){params.limit = 50;}
            var cacheKey = 'getCommonVariablesFromApi';
            var cachedData = qm.api.cacheGet(params, cacheKey);
            if(cachedData && successHandler){
                //successHandler(cachedData);
                //return;
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.VariablesApi();
            function callback(error, data, response) {
                if (data) { qm.commonVariablesHelper.saveToLocalStorage(data); }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, cacheKey);
            }
            apiInstance.getVariables(params, callback);
        },
        putCommonVariablesInLocalStorageUsingApi: function(successHandler){
            qm.commonVariablesHelper.getCommonVariablesFromApi({limit: 50}, function(commonVariables){
                if(successHandler){successHandler(commonVariables);}
            }, function(error){
                qmLog.error(error);
            });
        },
        saveToLocalStorage: function(commonVariables){
            if(!commonVariables){
                qmLog.error("No commonVariables provided to saveToLocalStorage");
                return;
            }
            commonVariables = qm.arrayHelper.convertToArrayIfNecessary(commonVariables);
            var definitelyCommonVariables = [];
            for (var i = 0; i < commonVariables.length; i++) {
                if(!commonVariables[i].userId){
                    definitelyCommonVariables.push(commonVariables[i]);
                }
            }
            qm.localForage.saveWithUniqueId(qm.items.commonVariables, definitelyCommonVariables);
        },
        getFromLocalStorage: function(requestParams, successHandler, errorHandler){
            if(!successHandler){
                qmLog.error("No successHandler provided to commonVariables getFromLocalStorage");
                return;
            }
            if(!requestParams){requestParams = {};}
            qm.localForage.getElementsWithRequestParams(qm.items.commonVariables, requestParams, function (data) {
                if(!requestParams.sort){data = qm.variablesHelper.defaultVariableSort(data);}
                successHandler(data);
            }, function (error) {
                qmLog.error(error);
                if(errorHandler){errorHandler(error);}
            });
        },
        getFromLocalStorageOrApi: function(params, successHandler, errorHandler){
            qm.commonVariablesHelper.getFromLocalStorage(params, function(variables){
                if(variables && variables.length){
                    if(successHandler){successHandler(variables);}
                    return;
                }
                qm.commonVariablesHelper.getCommonVariablesFromApi(params, function (variables) {
                    if(successHandler){successHandler(variables);}
                }, function (error) {
                    qmLog.error(error);
                    if(errorHandler){errorHandler(error);}
                });
            });
        },
        refreshIfNecessary: function(){
            //putCommonVariablesInLocalStorageUsingJsonFile();
            qm.commonVariablesHelper.getFromLocalStorage({}, function (commonVariables) {
                if(!commonVariables || !commonVariables.length){
                    qm.commonVariablesHelper.putCommonVariablesInLocalStorageUsingApi();
                }
            });
        }
    },
    userVariables: {
        saveToLocalStorage: function(variables){
            if(!variables){
                qmLog.error("No variables provided to userVariables.saveToLocalStorage");
                return;
            }
            variables = qm.arrayHelper.convertToArrayIfNecessary(variables);
            var definitelyUserVariables = [];
            var commonVariables = [];
            for (var i = 0; i < variables.length; i++) {
                if(variables[i].userId){
                    definitelyUserVariables.push(variables[i]);
                } else {
                    commonVariables.push(variables[i]);
                }
            }
            qm.localForage.saveWithUniqueId(qm.items.userVariables, definitelyUserVariables);
            if(commonVariables.length){qm.localForage.saveWithUniqueId(qm.items.commonVariables, commonVariables);}
        },
        updateLatestMeasurementTime: function(variableName, lastValue){
            qm.storage.getUserVariableByName(variableName, true, lastValue);
        },
        getFromApi: function(params, successHandler, errorHandler){
            if(!params){params = {};}
            params = JSON.parse(JSON.stringify(params)); // Decouple API search params so we don't mess up original local search params
            if(!params.sort || params.sort.indexOf('numberOfUserVariables') !== -1){params.sort = '-latestMeasurementTime';}
            if(!params.limit){params.limit = 50;}
            params = qm.api.addGlobalParams(params);
            var cacheKey = 'getUserVariablesFromApi';
            var cachedData = qm.api.cacheGet(params, cacheKey);
            if(cachedData && successHandler){
                successHandler(cachedData);
                return;
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.VariablesApi();
            function callback(error, data, response) {
                if (data) { qm.userVariables.saveToLocalStorage(data); }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, cacheKey);
            }
            apiInstance.getVariables(params, callback);
        },
        getByNameFromApi: function(variableName, params, successHandler, errorHandler){
            if(!params){params = {};}
            params.name = variableName;
            qm.userVariables.getFromApi(params, function (userVariables) {
                qm.userVariables.saveToLocalStorage(userVariables);
                successHandler(userVariables[0]);
            }, errorHandler)
        },
        getByName: function(variableName, params, refresh, successHandler, errorHandler){
            if(!params){params = {};}
            if(!variableName){variableName = qm.getPrimaryOutcomeVariable().name;}
            if(refresh){
                qm.userVariables.getByNameFromApi(variableName, params, successHandler, errorHandler);
                return;
            }
            qm.localForage.searchByProperty(qm.items.userVariables, 'name', variableName, function (userVariables) {
                if(userVariables && userVariables.length){
                    var userVariable = userVariables[0];
                    /** @namespace userVariable.charts.lineChartWithoutSmoothing */
                    if(typeof params.includeCharts === "undefined" ||
                        (userVariable.charts && userVariable.charts.lineChartWithoutSmoothing && userVariable.charts.lineChartWithoutSmoothing.highchartConfig)){
                        successHandler(userVariable);
                        return;
                    }
                }
                qm.userVariables.getByNameFromApi(variableName, params, successHandler, errorHandler);
            });
        },
        getFromLocalStorage: function(requestParams, successHandler, errorHandler){
            if(!requestParams){requestParams = {};}
            qm.localForage.getElementsWithRequestParams(qm.items.userVariables, requestParams, function (data) {
                if(!requestParams.sort){data = qm.variablesHelper.defaultVariableSort(data);}
                successHandler(data);
            }, function (error) {
                qmLog.error(error);
                if(errorHandler){errorHandler(error);}
            });
        },
        getFromLocalStorageOrApi: function(params, successHandler, errorHandler){
            params = params || {};
            qm.userVariables.getFromLocalStorage(params, function(userVariables){
                function doWeHaveEnoughVariables(variables){
                    var numberOfMatchingLocalVariablesRequiredToSkipAPIRequest = 2;
                    return variables && variables.length > numberOfMatchingLocalVariablesRequiredToSkipAPIRequest;  //Do API search if only 1 local result because I can't get "Remeron" because I have "Remeron Powder" locally
                }
                function doWeHaveExactMatch(variables, variableSearchQuery){
                    if(!variableSearchQuery){return true;}
                    return qm.arrayHelper.arrayHasItemWithNameProperty(variables) && variables[0].name.toLowerCase() === variableSearchQuery.toLowerCase(); // No need for API request if we have exact match
                }
                function shouldWeMakeVariablesSearchAPIRequest(variables, variableSearchQuery){
                    var haveEnough = doWeHaveEnoughVariables(variables);
                    var exactMatch = doWeHaveExactMatch(variables, variableSearchQuery);
                    return !haveEnough && !exactMatch;
                }
                if(userVariables && userVariables.length && !shouldWeMakeVariablesSearchAPIRequest(userVariables, params.searchPhrase)){
                    successHandler(userVariables);
                    qmLog.info(userVariables.length + " user variables matching " + JSON.stringify(params) + " in local storage");
                    return;
                }
                qmLog.info("No user variables matching " + JSON.stringify(params) + " in local storage");
                qm.userVariables.getFromApi(params, function (userVariables) {
                    qmLog.info(userVariables.length + " user variables matching " + JSON.stringify(params) + " from API");
                    successHandler(userVariables);
                }, function (error) {
                    qmLog.error(error);
                    errorHandler(error);
                });
            });
        },
        refreshIfNumberOfRemindersGreaterThanUserVariables: function(){
            qm.reminderHelper.getNumberOfReminders(function (number) {
                if(number){
                    qm.userVariables.getFromLocalStorage({}, function (userVariables) {
                        if(!userVariables || userVariables.length < number){
                            qm.userVariables.getFromApi();
                        }
                    });
                }
            })
        }
    },
    variablesHelper: {
        getFromLocalStorageOrApi: function (requestParams, successHandler, errorHandler){
            requestParams = requestParams || {};
            if(!requestParams.searchPhrase || requestParams.searchPhrase === ""){requestParams.minimumNumberOfResultsRequiredToAvoidAPIRequest = 20;}
            if(requestParams.searchPhrase && requestParams.searchPhrase.length > 2){requestParams.minimumNumberOfResultsRequiredToAvoidAPIRequest = 3;}
            if(requestParams.searchPhrase && requestParams.searchPhrase.length > 3){requestParams.minimumNumberOfResultsRequiredToAvoidAPIRequest = 1;}
            if(requestParams.searchPhrase && requestParams.searchPhrase.length > 4){requestParams.minimumNumberOfResultsRequiredToAvoidAPIRequest = 0;}
            function sortUpdateSubtitlesAndReturnVariables(variables) {
                if(!requestParams.sort){variables = qm.variablesHelper.defaultVariableSort(variables);}
                variables = qm.variablesHelper.updateSubtitles(variables, requestParams);
                if(successHandler){successHandler(variables);}
            }
            function getFromApi() {
                qm.userVariables.getFromApi(requestParams, function (variables) {
                    sortUpdateSubtitlesAndReturnVariables(variables);
                }, function (error) {
                    qmLog.error(error);
                    if(errorHandler){errorHandler(error);}
                })
            }
            if(requestParams.excludeLocal){ // excludeLocal is necessary for complex filtering like tag searches
                getFromApi();
                return;
            }
            qm.variablesHelper.getUserAndCommonVariablesFromLocalStorage(requestParams, function(variables){
                if(variables && variables.length > requestParams.minimumNumberOfResultsRequiredToAvoidAPIRequest){
                    sortUpdateSubtitlesAndReturnVariables(variables);
                    return;
                }
                // Using reminders in variable searches creates duplicates and lots of problems
                // var reminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage(requestParams);
                // if(reminders && reminders.length  > requestParams.minimumNumberOfResultsRequiredToAvoidAPIRequest) {
                //     sortAndReturnVariables(reminders);
                //     return;
                // }
                getFromApi();
            });
        },
        putManualTrackingFirst: function (variables) { // Don't think we need to do this anymore since we sort by number of reminders maybe?
            if(!variables){
                qmLog.error("no variables provided to putManualTrackingFirst");
                return;
            }
            var manualTracking = variables.filter(function (variableToCheck) {
                return variableToCheck.manualTracking === true;
            });
            var nonManual = variables.filter(function (variableToCheck) {
                return variableToCheck.manualTracking !== true;
            });
            var merged = manualTracking.concat(nonManual);
            return merged;
        },
        defaultVariableSort: function (variables) {
            if(!variables){
                qmLog.info("no variables provided to putManualTrackingFirst");
                return null;
            }
            variables = qm.variablesHelper.putManualTrackingFirst(variables);
            function getValue(object){
                return object.lastSelectedAt || object.latestMeasurementTime || object.numberOfTrackingReminders || object.numberOfUserVariables;
            }
            variables.sort(function(a, b) {
                var aValue = getValue(a);
                var bValue = getValue(b);
                if(aValue < bValue) return 1;
                if(aValue > bValue) return -1;
                return 0;
            });
            return variables;
        },
        getUserAndCommonVariablesFromLocalStorage: function(requestParams, successHandler){
            requestParams = requestParams || {};
            qm.userVariables.getFromLocalStorage(requestParams, function(userVariables){
                userVariables = userVariables || [];
                if(!requestParams.includePublic){
                    successHandler(userVariables);
                    return;
                }
                qm.commonVariablesHelper.getFromLocalStorage(requestParams, function (commonVariables) {
                    commonVariables = commonVariables || [];
                    var both = userVariables.concat(commonVariables);
                    both = qm.arrayHelper.getUnique(both, 'id');
                    successHandler(both);
                });
            });
        },
        updateSubtitles: function (variables, requestParams){
            if(requestParams && requestParams.sort) {
                var sort = requestParams.sort;
                sort = sort.replace("-", "");
                for (var i = 0; i < variables.length; i++) {
                    if (sort.toLowerCase().indexOf("correlation")) {
                        if (variables[i][sort]) {
                            var number = variables[i][sort];
                            variables[i].subtitle = number + " studies";
                        }
                    }
                }
            }
            return variables;
        }
    },
    variableCategoryHelper: {
        getVariableCategoriesFromJsonFile: function (successHandler, errorHandler) {
            qm.api.getViaXhrOrFetch('data/variableCategories.json', function(variableCategories){
                if(!variableCategories){
                    qmLog.error("No variable categories from json file!");
                } else {
                    qm.globalHelper.setItem(qm.items.variableCategories, variableCategories);  // Let's not use storage so user will have updated version
                }
                successHandler(variableCategories);
            }, function (error) {
                if(errorHandler){errorHandler(error);}
            });
        },
        getVariableCategoriesFromApi: function (successHandler, errorHandler) {
            qmLog.info("Getting variable categories from API...");
            function globalSuccessHandler(variableCategories){
                qm.localForage.setItem(qm.items.variableCategories, variableCategories);
                if(successHandler){successHandler(variableCategories);}
            }
            qm.api.configureClient();
            var apiInstance = new Quantimodo.VariablesApi();
            function callback(error, data, response) {
                qm.api.generalResponseHandler(error, data, response, globalSuccessHandler, errorHandler, {}, 'getVariableCategoriesFromApi');
            }
            apiInstance.getVariableCategories(callback);
        },
        getVariableCategoriesFromGlobalsOrApi: function(successHandler, errorHandler){
            if (qm.variableCategoryHelper.getVariableCategoriesFromGlobals()) {
                successHandler(qm.variableCategoryHelper.getVariableCategoriesFromGlobals());
            } else {
                qm.variableCategoryHelper.getVariableCategoriesFromJsonFile(function (variableCategories) {
                    if(!variableCategories){
                        qm.variableCategoryHelper.getVariableCategoriesFromApi(function (variableCategories) {
                            successHandler(variableCategories);
                        }, errorHandler)
                    } else {
                        successHandler(variableCategories);
                    }
                }, errorHandler)
            }
        },
        getVariableCategoriesFromGlobals: function(){
            return qm.globalHelper.getItem(qm.items.variableCategories);
        },
        getVariableCategory: function(variableCategoryName, successHandler){
            if(!successHandler){
                var variableCategories = qm.variableCategoryHelper.getVariableCategoriesFromGlobals();
                if(variableCategories){
                    return variableCategories.find(function(variableCategory){
                        return variableCategory.name.toLowerCase() === variableCategoryName.toLowerCase();
                    });
                }
            }
            qm.variableCategoryHelper.getVariableCategoriesFromGlobalsOrApi(function (variableCategories) {
               var match = variableCategories.find(function (category) {
                    category.name = variableCategoryName;
               });
                successHandler(match);
            });
        }
    },
    webNotifications: {
        initializeFirebase: function(){
            if(qm.firebase){
                qmLog.debug("Firebase already initialized");
                return qm.firebase;
            }
            var config = {
                apiKey: "AIzaSyAro7_WyPa9ymH5znQ6RQRU2CW5K46XaTg",
                authDomain: "quantimo-do.firebaseapp.com",
                databaseURL: "https://quantimo-do.firebaseio.com",
                projectId: "quantimo-do",
                storageBucket: "quantimo-do.appspot.com",
                messagingSenderId: "1052648855194"
            };
            console.log("firebase.initializeApp(config)");
            qm.firebase = firebase.initializeApp(config);
            return qm.firebase;
        },
        registerServiceWorker: function () {
            if(qm.serviceWorker){
                qmLog.debug("serviceWorker already registered");
                return false;
            }
            if(!qm.platform.isWeb()){
                qmLog.debug("Not registering service worker because not on Web");
                return false;
            }
            qm.webNotifications.initializeFirebase();
            var serviceWorkerUrl = qm.urlHelper.getIonicAppBaseUrl()+'firebase-messaging-sw.js';
            qmLog.info("Loading service worker from " + serviceWorkerUrl);
            if(typeof navigator.serviceWorker === "undefined"){
                qmLog.error("navigator.serviceWorker is not defined!");
                return false;
            }
            navigator.serviceWorker.register(serviceWorkerUrl)
                .then(function(registration) {
                    var messaging = firebase.messaging();
                    messaging.useServiceWorker(registration);
                    qm.webNotifications.subscribeUser(messaging);
                });
            qm.serviceWorker = navigator.serviceWorker;
            return qm.serviceWorker;
        },
        subscribeUser: function(messaging) {
            messaging.requestPermission()
                .then(function() {
                    console.log('Notification permission granted.');
                    // Get Instance ID token. Initially this makes a network call, once retrieved
                    // subsequent calls to getToken will return from cache.
                    messaging.getToken()
                        .then(function(currentToken) {
                            if (currentToken) {
                                console.log("FB token: "+ currentToken);
                                var deviceTokenOnServer = qm.storage.getItem(qm.items.deviceTokenOnServer);
                                if(!deviceTokenOnServer || deviceTokenOnServer !== currentToken){
                                    qm.webNotifications.postWebPushSubscriptionToServer(currentToken);
                                }
                                //updateUIForPushEnabled(currentToken);
                            } else {
                                // Show permission request.
                                console.log('No Instance ID token available. Request permission to generate one.');
                                // Show permission UI.
                                //updateUIForPushPermissionRequired();
                                qm.webNotifications.postWebPushSubscriptionToServer(false);
                            }
                        })
                        .catch(function(err) {
                            qmLog.error('An error occurred while retrieving token. ', null, err);
                            //showToken('Error retrieving Instance ID token. ', err);
                            //qm.webNotifications.postWebPushSubscriptionToServer(false);
                        });
                })
                .catch(function(err) {
                    console.log('Unable to get permission to notify.', err);
                });
        },
        postWebPushSubscriptionToServer: function (deviceTokenString) {
            if (deviceTokenString) {
                console.log("Got token: " + deviceTokenString);
                qm.api.configureClient();
                var apiInstance = new Quantimodo.NotificationsApi();
                function callback(error, data, response) {
                    if(!error){
                        qm.storage.setItem(qm.items.deviceTokenOnServer, deviceTokenString);
                    }
                    qm.api.generalResponseHandler(error, data, response, null, null, null, 'postWebPushSubscriptionToServer');
                }
                var params = qm.api.addGlobalParams({'platform': qm.platform.browser.get(), deviceToken: deviceTokenString});
                apiInstance.postDeviceToken(params, callback);
            }
        }
    },
    windowHelper: {
        scrollToTop: function(){
            $("html, body").animate({ scrollTop: 0 }, "slow");
            return false;
        }
    }
};
// returns bool | string
// if search param is found: returns its value
// returns false if not found
window.isTruthy = function(value){return value && value !== "false"; };
window.isFalsey = function(value) {if(value === false || value === "false"){return true;}};
function getSizeInKiloBytes(string) {
    if(typeof value !== "string"){string = JSON.stringify(string);}
    return Math.round(string.length*16/(8*1024));
}
function getLocalStorageNameForRequest(type, route) {
    return 'last_' + type + '_' + route.replace('/', '_') + '_request_at';
}
qm.urlHelper.redirectToHttpsIfNecessary();
