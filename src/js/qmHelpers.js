/* eslint-disable no-console,no-unused-vars */
/** @namespace qm.qmLog */
/** @namespace qm.chrome */
/* global AppSettings TweenMax, Power1, Sine, Linear, Power3, TimelineMax, Power2 */
/* eslint-env browser */
String.prototype.toCamelCase = function(){
    return this.replace(/(\_[a-z])/g, function($1){
        return $1.toUpperCase().replace('_', '');
    });
};
var qm = {
    alert: {
        validationFailureAlert: function(errorMessage, callback){
            qm.toast.errorAlert(errorMessage, callback)
        },
        errorAlert: function(errorMessage, callback){
            qm.toast.errorAlert(errorMessage, callback)
        },
    },
    analytics: {
        eventCategories: {
            pushNotifications: "pushNotifications",
            inbox: "inbox"
        }
    },
    appContainer: {
        hide: function(){
            qm.qmLog.info("Hiding panel class");
            qm.appContainer.getPaneClass().style.display = "none";
        },
        show: function(){
            qm.qmLog.info("Showing panel class");
            qm.appContainer.getPaneClass().style.display = "block";
        },
        getPaneClass: function(){
            var element = document.querySelector('.pane');
            return element;
        },
        getAppContainer: function(){
            var element = document.querySelector('app-container');
            return element;
        },
        setBackgroundColor: function(color){
            qm.qmLog.info("Setting background to " + color);
            var element = qm.appContainer.getPaneClass();
            element.style.backgroundColor = color;
            element = qm.appContainer.getAppContainer();
            element.style.backgroundColor = color;
            document.body.style.backgroundColor = color;
        },
        setOpacity: function(opacity){
            var backgroundColor = (opacity < 1) ? 'black' : 'white';
            var paneClass = qm.appContainer.getPaneClass();
            paneClass.style.backgroundColor = backgroundColor;
            paneClass.style.opacity = opacity;
            document.body.style.backgroundColor = backgroundColor;
        }
    },
    appMode: {
        mode: null,
        isBrowser: function(){
            return typeof window !== "undefined";
        },
        isTesting: function(){
            if(qm.appMode.mode === 'testing'){
                return true;
            }
            if(qm.userHelper.isTestUser()){
                return true;
            }
            return qm.urlHelper.indexOfCurrentUrl("medimodo.heroku") !== -1 ||
                qm.urlHelper.indexOfCurrentUrl("staging.quantimo.do");
        },
        isTestingOrDevelopment: function(){
            return qm.appMode.isTesting() || qm.appMode.isDevelopment();
        },
        isDevelopment: function(){
            if(qm.appMode.mode === 'development'){
                return true;
            }
            var win = qm.platform.getWindow();
            if(!win){
                return false;
            }
            var origin = window.location.origin;
            if(origin.indexOf('http://localhost:') !== -1){
                return true;
            }
            if(origin.indexOf('https://dev-') === 0){
                return true;
            }
            return origin.indexOf('local.quantimo.do') !== -1;
        },
        isStaging: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            return window.location.origin.indexOf('staging.') !== -1;
        },
        isProduction: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            return !qm.appMode.isStaging() && !qm.appMode.isDevelopment() && !qm.appMode.isTesting();
        },
        isBuilder: function(){
            if(typeof window === "undefined"){
                return false;
            }
            return window.designMode ||
                qm.urlHelper.indexOfCurrentUrl('app/configuration') !== -1 ||
                qm.urlHelper.indexOfCurrentUrl('configuration-index.html') !== -1 ||
                qm.urlHelper.indexOfCurrentUrl('builder.quantimo') !== -1;
        },
        isPhysician: function(){
            if(typeof window === "undefined"){
                return false;
            }
            var urlParam = qm.urlHelper.getParam('physicianMode');
            if(urlParam !== null){qm.storage.setItem('physicianMode', urlParam);}
            var isPhysician = window.location.href.indexOf('app/physician') !== -1 ||
                qm.storage.getItem('physicianMode') ||
                qm.urlHelper.indexOfCurrentUrl('physician-index.html') !== -1 ||
                qm.urlHelper.indexOfCurrentUrl('physician.quantimo') !== -1;
            if(isPhysician){window.designMode = false;}
            return isPhysician;
        },
        isDebug: function(){
            return qm.qmLog.isDebugMode();
        },
        getAppMode: function(){
            var env = "production";
            if(qm.appMode.isStaging()){
                env = "staging";
            }
            if(qm.appMode.isDevelopment()){
                env = "development";
            }
            if(qm.appMode.isTesting()){
                env = "testing";
            }
            return env;
        },
        isBackEnd: function(){
            return qm.platform.isBackEnd();
        }
    },
    apiPaths: {
        trackingReminderNotificationsPast: "v1/trackingReminderNotifications/past"
    },
    api: {
        requestLog: [],
        getDefaultHeaders: function(){
            var headers = {
                'X-Client-Id': qm.getClientId(),
                'X-Platform': qm.platform.getCurrentPlatform(),
                'X-App-Version': qm.appsManager.getAppVersion(),
                'X-Framework': 'ionic'
            };
            if(typeof moment !== "undefined"){
                if(typeof moment.tz === "undefined"){
                    qmLog.error("moment.tz is not defined!");
                } else {
                    var tz = moment.tz;
                    headers['X-Timezone'] = tz.guess();
                }
            }
            var token = qm.auth.getAccessToken();
            if(token){headers['Authorization'] = 'Bearer ' + token;}
            return headers;
        },
        configureClient: function(functionName, errorHandler, params){
            params = params || {};
            var qmApiClient = qm.Quantimodo.ApiClient.instance;
            var quantimodo_oauth2 = qmApiClient.authentications.quantimodo_oauth2;
            qmApiClient.basePath = qm.api.getBaseUrl() + '/api';
            quantimodo_oauth2.accessToken = qm.auth.getAccessTokenFromUrlUserOrStorage();
            var message = "API Request to " + qm.api.getBaseUrl() + " for " + functionName;
            if(params.reason){
                message += " because " + params.reason;
            }
            if(qm.qmLog.isDebugMode()){
                message += ' with token: ' + qm.auth.getAccessTokenFromUrlUserOrStorage();
            }
            delete params.reason;
            qm.qmLog.info(message, params);
            qm.api.requestLog.push({
                time: qm.timeHelper.getCurrentLocalDateAndTime(),
                name: functionName,
                message: message,
                params: params
            });
            // TODO: Enable
            // qmApiClient.authentications.client_id.clientId = qm.getClientId();
            // qmApiClient.enableCookies = true;
            qmApiClient.defaultHeaders = qm.api.getDefaultHeaders();
            qmApiClient.cache = true;
            if(params){
                if(params.refresh || params.recalculate || params.noCache){
                    qmApiClient.cache = false;
                }
            }
            return qmApiClient;
        },
        useMemoryCache: true, // Redundant and produces unexpected results. However, have to keep using for now to prevent infinite loops.
        cacheSet: function(params, data, functionName){
            if(!qm.api.cache[functionName]){qm.api.cache[functionName] = {};}
            var key = qm.api.getCacheName(params);
            if(qm.api.useMemoryCache){  // Redundant and produces unexpected results. However, have to keep using for now to prevent infinite loops.
                qm.api.cache[functionName][key] = data;
            }
        },
        cacheGet: function(params, functionName){
            if(!qm.api.useMemoryCache){  // Redundant and produces unexpected results. However, have to keep using for now to prevent infinite loops.
                return null;
            }
            if(params && params.refresh){
                return null;
            }
            if(!qm.api.cache[functionName]){
                qm.api.cache[functionName] = {};
            }
            var key = qm.api.getCacheName(params);
            if(!qm.api.cache[functionName][key]){
                return null;
            }
            return qm.api.cache[functionName][key];
        },
        cacheRemove: function(functionName){
            return qm.api.cache[functionName] = null;
        },
        getCacheName: function(params){
            return qm.stringHelper.removeSpecialCharacters(JSON.stringify(params));
        },
        cache: {},
        generalResponseHandler: function(error, data, response, successHandler, errorHandler, params, functionName){
            if(!response){
                var message = "No response provided to " + functionName + " qmSdkApiResponseHandler with params " + JSON.stringify(params);
                qm.qmLog.info(message);
                if(errorHandler){
                    errorHandler(message);
                }
                return;
            }
            qm.qmLog.debug(response.status + ' response from ' + response.req.url);
            if(error){
                var errorMessage = qm.api.generalErrorHandler(error, data, response);
                if(errorHandler){
                    errorHandler(errorMessage);
                }
            }else{
                if(data && params){
                    qm.api.cacheSet(params, data, functionName);
                    if(data.measurements){
                        qm.measurements.addMeasurementsToMemory(data.measurements)
                    }
                }
                if(successHandler){
                    successHandler(data, response);
                }
            }
        },
        getErrorMessageFromResponse: function(error, response){
            var errorMessage = '';
            if(typeof error === "string"){
                errorMessage = error;
            } else if(error && error.message){
                errorMessage += error.message + ' ';
            }
            if(response && response.error && response.error.message){
                errorMessage += "\n" + response.error.message + ' ';
            }
            if(response && response.body && response.body.errorMessage){
                errorMessage += "\n" + response.body.errorMessage + ' ';
            }
            if(response && response.body && response.body.error && response.body.error.message){
                errorMessage += "\n" + response.body.error.message + ' ';
            }
            return errorMessage;
        },
        generalErrorHandler: function(error, data, response, options){
            var errorMessage = qm.api.getErrorMessageFromResponse(error, response);
            errorMessage = qm.api.getErrorMessageFromResponse(errorMessage, data);
            if(!response){
                return qm.qmLog.error("No API response provided to qmApiGeneralErrorHandler",
                    {errorMessage: errorMessage, responseData: data, apiResponse: response, requestOptions: options});
            }
            if(errorMessage.toLowerCase().indexOf('expired') !== -1){
                qm.auth.deleteAllAccessTokens("errorMessage is " + errorMessage);
                qm.userHelper.setUser(null);
            }
            if(response.status === 401){
                if(!options || !options.doNotSendToLogin){
                    qm.qmLog.authDebug("Not authenticated!");
                }
                qm.auth.handle401Response(response, options)
            }else{
                qm.qmLog.error(errorMessage, null, {error: error, apiResponse: response});
            }
            return errorMessage;
        },
        addGlobalParams: function(params){
            if(params && qm.functionHelper.isFunction(params)){throw "params should not be a function!"}
            var url;
            if(!params){params = {};}
            delete params.force;  // Used locally only
            delete params.excludeLocal;  // Used locally only
            if(typeof params === "string"){
                url = params;
                qm.urlHelper.validateUrl(url);
                params = {};
            }
            var appSettings = qm.appsManager.getAppSettingsFromMemory();
            if(appSettings){
                params.appName = encodeURIComponent(appSettings.appDisplayName);
                if(appSettings.versionNumber){
                    params.appVersion = encodeURIComponent(appSettings.versionNumber);
                }else{
                    qm.qmLog.debug('Version number not specified!', null, 'Version number not specified on qm.getAppSettings()');
                }
            }
            var t = qm.auth.getAccessTokenFromUrlUserOrStorage();
            if(!params.accessToken && t){params.accessToken = t;}
            var c = qm.api.getClientId();
            if(!params.clientId && c){params.clientId = c;}
            params.platform = qm.platform.getCurrentPlatform();
            if(qm.devCredentials){
                if(qm.devCredentials.username){
                    params.log = encodeURIComponent(qm.devCredentials.username);
                }
                if(qm.devCredentials.password){
                    params.pwd = encodeURIComponent(qm.devCredentials.password);
                }
            }
            if(qm.appMode.isDevelopment()){
                params.XDEBUG_SESSION_START = "PHPSTORM";
            }
            var passableUrlParameters = ['userId', 'log', 'pwd', 'userEmail'];
            for(var i = 0; i < passableUrlParameters.length; i++){
                if(qm.urlHelper.getParam(passableUrlParameters[i])){
                    params[passableUrlParameters[i]] = qm.urlHelper.getParam(passableUrlParameters[i]);
                }
            }
            for(var property in params){
                if(params.hasOwnProperty(property)){
                    if(typeof params[property] === "undefined"){
                        qm.qmLog.error(property + " is undefined!");
                        delete params[property];
                    }
                    if(params[property] === ""){
                        qm.qmLog.error(property + " is empty string!");
                        delete params[property];
                    }
                }
            }
            if(url){
                url = qm.urlHelper.addUrlQueryParamsToUrlString(params, url);
                return url;
            }
            return params;
        },
        getClientIdFromBuilderQueryOrSubDomain: function(){
            //if(qm.appMode.isPhysician()){return "physician";}  // Don't do this because we need to use physician/patient aliases
            if(qm.appsManager.getBuilderClientId()){
                return qm.clientId = qm.appsManager.getBuilderClientId();
            }
            if(qm.api.getClientIdFromQueryParameters() && qm.api.getClientIdFromQueryParameters() !== "default"){
                qm.clientId = qm.api.getClientIdFromQueryParameters();
            }
            if(!qm.clientId){
                qm.clientId = qm.api.getClientIdFromSubDomain();
            }
            if(qm.clientId === "web"){qm.clientId = null;}
            return qm.clientId;
        },
        getClientId: function(successHandler){
            qm.clientId = qm.api.getClientIdFromBuilderQueryOrSubDomain();
            if(qm.platform.isBackEnd() && typeof process.env.QUANTIMODO_CLIENT_ID !== "undefined"){
                return process.env.QUANTIMODO_CLIENT_ID;
            }
            var appSettings = qm.getAppSettings();
            if(!qm.clientId && appSettings){
                qm.clientId = appSettings.clientId;
            }
            // DON'T DO THIS
            // if(!clientId && qm.platform.isMobile()){
            //     qm.qmLog.debug('Using ' + qm.urlHelper.getDefaultConfigUrl() + ' because we\'re on mobile');
            //     clientId = "default"; // On mobile
            // }
            if(!qm.clientId){ // Not sure why but this always returns quantimodo
                //clientId = qm.storage.getItem(qm.items.clientId);
            }
            // DON'T DO THIS
            // if(!clientId && qm.urlHelper.indexOfCurrentUrl('quantimo.do') === -1){
            //     clientId = "default"; // On mobile
            // }
            if(!qm.clientId){
                qm.clientId = qm.api.getClientIdFromAwsPath();
            }
            if(!qm.clientId){
                qm.qmLog.info("Could not get client id!");
                //clientId = 'quantimodo';
            }
            if(qm.clientId && qm.clientId.indexOf('.') !== -1){
                throw "Client id should not have a dot!"
            }
            if(!successHandler){
                return qm.clientId;
            }
            if(qm.clientId){
                successHandler(qm.clientId);
            }
            qm.api.getClientIdWithCallback(successHandler);
        },
        getClientSecret: function(successHandler){
            var clientSecret = qm.appsManager.getClientSecret();
            if(successHandler){
                successHandler(clientSecret);
            }
            return clientSecret;
        },
        getClientIdWithCallback: function(successHandler){
            if(qm.api.getClientId()){
                successHandler(qm.api.getClientId());
                return;
            }
            if(typeof AppSettings !== "undefined"){
                AppSettings.get(
                    function(preferences){
                        /** @namespace preferences.QuantiModoClientId */
                        qm.clientId = preferences.QuantiModoClientId;
                        /** @namespace preferences.QuantiModoClientSecret */
                        qm.clientSecret = preferences.QuantiModoClientSecret;
                        successHandler(qm.clientId, preferences.QuantiModoClientSecret);
                    },
                    function(error){
                        qm.qmLog.error("Error! ", error);
                    }, ["QuantiModoClientId", "QuantiModoClientSecret"]);
            }
        },
        getClientIdFromQueryParameters: function(){
            if(!qm.appMode.isBrowser()){
                return null;
            }
            var clientId = qm.urlHelper.getParam('clientId');
            if(!clientId){
                clientId = qm.urlHelper.getParam('appName');
            }
            if(!clientId){
                clientId = qm.urlHelper.getParam('lowerCaseAppName');
            }
            if(!clientId){
                clientId = qm.urlHelper.getParam('quantimodoClientId');
            }
            if(clientId && clientId === "web"){
                clientId = null;
            }
            if(clientId){
                qm.storage.setItem('clientId', clientId);
            }
            return clientId;
        },
        getClientIdFromAwsPath: function(){
            if(!qm.appMode.isBrowser()){
                return null;
            }
            var clientId = qm.stringHelper.getStringBetween(qm.urlHelper.getCurrentUrl(), 's3.amazonaws.com/', '/dev');
            return clientId;
        },
        getClientIdFromSubDomain: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            if(!qm.appMode.isBrowser()){
                return null;
            }
            if(window.location.hostname.indexOf('.quantimo.do') === -1){
                return null;
            }
            if(qm.appMode.isBuilder()){
                return null;
            }
            if(qm.appMode.isPhysician()){
                return null;
            }
            var subDomain = qm.urlHelper.getSubDomain();
            subDomain = subDomain.replace('qm-', '');
            if(subDomain === 'web' || subDomain === 'staging-web' || subDomain === 'dev-web'){
                return null;
            }
            var clientIdFromAppConfigName = qm.appsManager.appConfigFileNames[subDomain];
            if(clientIdFromAppConfigName){
                qm.qmLog.debug('Using client id ' + clientIdFromAppConfigName + ' derived from appConfigFileNames using subDomain: ' + subDomain, null);
                return clientIdFromAppConfigName;
            }
            qm.qmLog.debug('Using subDomain as client id: ' + subDomain);
            return subDomain;
        },
        responseHandler: function(error, data, response, successHandler, errorHandler){
            if(!response){
                var message = "No response provided to qm.api.responseHandler";
                if(qm.getUser()){
                    qm.qmLog.error(message);
                }else{
                    qm.qmLog.info(message);
                }
                return;
            }
            qm.qmLog.debug(response.status + ' response from ' + response.req.url, null);
            if(error){
                var errorMessage = qm.api.generalErrorHandler(error, data, response);
                if(errorHandler){
                    errorHandler(errorMessage);
                }
            }else{
                if(successHandler){
                    successHandler(data, response);
                }
            }
        },
        getBaseUrl: function(){
            var apiUrl = qm.urlHelper.getParam(qm.items.apiUrl);
            if(apiUrl && apiUrl !== qm.storage.getItem(qm.items.apiUrl)){
                qm.storage.setItem(qm.items.apiUrl, apiUrl);
            }
            if(!apiUrl && qm.appMode.isDebug() && qm.platform.isMobile() && (!qm.getUser() || qm.getUser().id === 230)){
                apiUrl = "https://utopia.quantimo.do";
            }
            if(!apiUrl){
                apiUrl = qm.storage.getItem(qm.items.apiUrl);
            }
            if(qm.appMode.isBrowser() && window.location.host.indexOf('dev-') === 0){
                return "https://local.quantimo.do";
            }
            if(!apiUrl){
                var appSettings = qm.appsManager.getAppSettingsFromMemory();
                if(appSettings && appSettings.apiUrl){
                    apiUrl = appSettings.apiUrl;
                }
            }
            if(!apiUrl && !qm.appMode.isBrowser()){
                apiUrl = "https://app.quantimo.do";
            }
            if(!apiUrl && window.location.origin.indexOf('staging.quantimo.do') !== -1){
                apiUrl = "https://staging.quantimo.do";
            }
            if(!apiUrl && window.location.origin.indexOf('local.quantimo.do') !== -1){
                apiUrl = "https://local.quantimo.do";
            }
            if(!apiUrl && window.location.origin.indexOf('utopia.quantimo.do') !== -1){
                apiUrl = "https://utopia.quantimo.do";
            }
            if(!apiUrl && window.location.origin.indexOf('localhost:8100') !== -1){
                apiUrl = "https://app.quantimo.do";
            } // Ionic serve
            if(!apiUrl){
                apiUrl = "https://app.quantimo.do";
            }
            if(apiUrl.indexOf("https://") === -1){
                apiUrl = "https://" + apiUrl;
            }
            apiUrl = apiUrl.replace("https://https", "https");
            return apiUrl;
        },
        getApiUrl: function(){
            return qm.api.getBaseUrl();
        },
        getApiUrlWithoutProtocol: function(){
            var url = qm.api.getBaseUrl();
            url = url.replace('https://', '');
            url = url.replace('http://', '');
            return url;
        },
        post: function(path, body, successHandler, errorHandler){
            qm.api.getRequestUrl(path, function(url){
                qm.qmLog.info("Making POST request to " + url);
                if(typeof XMLHttpRequest !== "undefined"){
                    var xhr = new XMLHttpRequest();   // new HttpRequest instance
                    xhr.open("POST", url);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhr = qm.api.addXhrHeaders(xhr);
                    xhr.onreadystatechange = function(){//Call a function when the state changes.
                        if(xhr.readyState === XMLHttpRequest.DONE){
                            var fallback = xhr.responseText;
                            var response = qm.stringHelper.parseIfJsonString(xhr.responseText, fallback);
                            if ( xhr.status === 201 || xhr.status === 204 || response.success === true) {
                                if(successHandler){successHandler(response);}
                            } else {
                                qm.qmLog.error("qm.api.get error from " + url + " request: " + xhr.responseText, response);
                                if(errorHandler){errorHandler(response);}
                            }
                        }
                    };
                    xhr.send(JSON.stringify(body));
                }else{
                    var headers = new Headers(qm.api.getDefaultHeaders())
                    fetch(url, {
                        method: 'post',
                        body: JSON.stringify(body),
                        headers: headers
                    }).then(function(response){
                        qm.qmLog.info("Got " + response.status + " response from POST to " + url);
                        response.json().then(function(data){
                            if (response.status === 201 || data.success === true) {
                                if(successHandler){successHandler(data);}
                            } else {
                                var err = "qm.api error "+response.status+" from POST to " + url
                                err = qm.api.generalErrorHandler(err, data, response)
                                if(errorHandler){errorHandler(err);}
                            }
                        })
                    }).catch(function(err){
                        qm.qmLog.error("Error from POST to " + url + ": " + err);
                        if(errorHandler){errorHandler(err)}
                    });
                }
            });
        },
        getViaXhrOrFetch: function(url, successHandler, errorHandler){
            qm.qmLog.info("Making GET request to " + url);
            if(typeof XMLHttpRequest !== "undefined"){
                qm.api.getViaXhr(url, successHandler, errorHandler);
            }else{
                qm.api.getViaFetch(url, successHandler, errorHandler);  // Need fetch for service worker
            }
        },
        getAppSettingsUrl: function(clientId, callback){
            function generateUrl(clientId, clientSecret){
                // Can't use QM SDK in service worker
                var settingsUrl = qm.api.getBaseUrl() + '/api/v1/appSettings?clientId=' + clientId;
                if(clientSecret){
                    settingsUrl += "&clientSecret=" + clientSecret;
                }
                if(!qm.platform.getWindow()){
                    return false;
                }
                if(window.designMode){
                    settingsUrl += '&designMode=true';
                }
                qm.qmLog.debug('Getting app settings from ' + settingsUrl);
                return settingsUrl;
            }
            if(clientId){
                callback(generateUrl(clientId));
            }else{
                qm.api.getClientIdWithCallback(function(clientId, clientSecret){
                    callback(generateUrl(clientId, clientSecret));
                });
            }
        },
        getViaFetch: function(url, successHandler, errorHandler){
            qm.qmLog.pushDebug("Making get request to " + url);
            fetch(url, {
                method: 'get',
                headers: new Headers(qm.api.getDefaultHeaders())
            }).then(function(response){
                return response.json();
            }).then(function(data){
                if(successHandler){
                    successHandler(data);
                }
            }).catch(function(err){
                if(url.indexOf('.config.json')){
                    qm.qmLog.error("qm.api.get error from " + url + " request: " + err + ".  If we couldn't parse json, " +
                        url + " probably doesn't exist", err);
                }else{
                    qm.qmLog.error("qm.api.get error from " + url + " request: " + err, null, err);
                }
                if(errorHandler){
                    errorHandler(err);
                }
            });
        },
        getViaXhr: function(url, successHandler, errorHandler){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr = qm.api.addXhrHeaders(xhr);
            xhr.onreadystatechange = function(){
                if(xhr.readyState === XMLHttpRequest.DONE){
                    var fallback = null; // Just return null instead of 500 page HTML
                    var responseObject = qm.stringHelper.parseIfJsonString(xhr.responseText, fallback);
                    if ( xhr.status === 200 ) {
                        successHandler(responseObject);
                    } else {
                        if ( xhr.status === 401 ) {
                            qm.qmLog.info("qm.api.get error from " + url + " request: " + xhr.responseText, null, responseObject);
                        } else {
                            qm.qmLog.error("qm.api.get error from " + url + " request: " + xhr.responseText, null, responseObject);
                        }
                        if(errorHandler){errorHandler(responseObject);}
                    }
                }
            };
            xhr.send(null);
        },
        addXhrHeaders: function(xhr){
            var headers = qm.api.getDefaultHeaders();
            for (var headerName in headers) {
                if (headers.hasOwnProperty(headerName)) {
                    var headerValue = headers[headerName];
                    xhr.setRequestHeader(headerName, headerValue);
                }
            }
            return xhr;
        },
        postMeasurements: function(measurements, onDoneListener){
            qm.api.post("v1/measurements", measurements, onDoneListener);
        },
        getRequestUrl: function(path, successHandler, params){
            qm.userHelper.getUserFromLocalStorage(function(user){
                function addGlobalQueryParameters(url){
                    function addQueryParameter(url, name, value){
                        if(url.indexOf('?') === -1){
                            return url + "?" + name + "=" + value;
                        }
                        return url + "&" + name + "=" + value;
                    }
                    if(qm.auth.getAccessTokenFromUrlUserOrStorage()){
                        url = addQueryParameter(url, 'access_token', qm.auth.getAccessTokenFromUrlUserOrStorage());
                    }else{
                        qm.qmLog.info('No access token for request!');
                        if(!qm.serviceWorker){
                            qm.chrome.showSignInNotification();
                        }
                    }
                    function getAppName(){
                        if(qm.chrome && qm.chrome.getChromeManifest()){
                            return qm.chrome.getChromeManifest().name;
                        }
                        return qm.urlHelper.getParam('appName');
                    }
                    if(getAppName()){
                        url = addQueryParameter(url, 'appName', getAppName());
                    }
                    function getAppVersion(){
                        if(qm.chrome && qm.chrome.getChromeManifest()){
                            return qm.chrome.getChromeManifest().version;
                        }
                        var appSettings = qm.getAppSettings();
                        if(appSettings){
                            return appSettings.versionNumber;
                        }
                        return qm.urlHelper.getParam('appVersion');
                    }
                    if(getAppVersion()){
                        url = addQueryParameter(url, 'appVersion', getAppVersion());
                    }
                    if(qm.api.getClientId()){
                        url = addQueryParameter(url, 'clientId', qm.api.getClientId());
                    }
                    if(qm.appMode.isDevelopment()){
                        url = addQueryParameter(url, 'XDEBUG_SESSION_START', "PHPSTORM");
                    }
                    url = addQueryParameter(url, 'platform', qm.platform.getCurrentPlatform());
                    return url;
                }
                var url = addGlobalQueryParameters(qm.api.getBaseUrl() + "/api/" + path);
                if(params){
                    url = qm.urlHelper.addUrlQueryParamsToUrlString(params, url);
                }
                url = url.replace('/api/api/', '/api/');
                qm.qmLog.debug("Making API request to " + url);
                successHandler(url);
            })
        },
        getQuantiModoUrl: function(path){
            if(path.indexOf("http") === 0){
                return path;
            }
            if(typeof path === "undefined"){
                path = "";
            }
            return qm.api.getBaseUrl() + "/" + path;
        },
        rateLimit: function(func, rate, async){
            var queue = [];
            var timeOutRef = false;
            var currentlyEmptyingQueue = false;
            var emptyQueue = function(){
                if(queue.length){
                    currentlyEmptyingQueue = true;
                    _.delay(function(){
                        if(async){
                            _.defer(function(){
                                queue.shift().call();
                            });
                        }else{
                            queue.shift().call();
                        }
                        emptyQueue();
                    }, rate);
                }else{
                    currentlyEmptyingQueue = false;
                }
            };
            return function(){
                var args = _.map(arguments, function(e){
                    return e;
                }); // get arguments into an array
                queue.push(_.bind.apply(this, [func, this].concat(args))); // call apply so that we can pass in arguments as parameters as opposed to an array
                if(!currentlyEmptyingQueue){
                    emptyQueue();
                }
            };
        },
        executeWithRateLimit: function(functionToLimit, milliseconds){
            milliseconds = milliseconds || 15000;
            var rateLimited = qm.api.rateLimit(functionToLimit, milliseconds);
            rateLimited();
        },
        getLocalStorageNameForRequest: function(type, route){
            return 'last_' + type + '_' + route.replace('/', '_') + '_request_at';
        },
        addVariableCategoryAndUnit: function(arr){
            qm.variableCategoryHelper.addVariableCategoryProperties(arr)
            qm.unitHelper.addUnit(arr)
            if(arr && arr.forEach){
                arr.forEach(function (r){
                    qm.unitHelper.setInputType(r);
                })
            }
        },
        removeVariableCategoryAndUnit: function(arr){
            if(!arr){return arr;}
            if(!Array.isArray(arr)){return arr;}
            arr = JSON.parse(JSON.stringify(arr)); // Clone so we don't remove units/categories from un-tored version
            for(var i = 0; i < arr.length; i++){
                var obj = arr[i];
                if(obj.unit){
                    obj.unitId = obj.unit.id
                    delete obj.unit
                }
                if(obj.defaultUnit){
                    obj.defaultUnitId = obj.defaultUnit.id
                    delete obj.defaultUnit
                }
                if(obj.variableCategory){
                    obj.variableCategoryId = obj.variableCategory.id
                    delete obj.variableCategory
                }
            }
            return arr;
        },
        generalApiErrorHandler: function(data, status, headers, request, options){
            if(status === 302){
                return qmLog.debug('Got 302 response from ', request, options.stackTrace);
            }
            if(status === 401){
                qmLog.info('Got 401 response with headers: ', headers, options.stackTrace);
                if(qm.qmService){qm.qmService.auth.handleExpiredAccessTokenResponse(data);}
                return qm.auth.handle401Response(request, options, headers);
            }
            if(!data){
                if(qm.qmService){qm.qmService.showOfflineError(options, request);}
                return;
            }
            return qm.api.logApiError(status, request, data, options);
        },
        logApiError: function(status, request, data, options){
            var pathWithQuery = request.url.match(/\/\/[^\/]+\/([^\.]+)/)[1];
            var pathWithoutQuery = pathWithQuery.split("?")[0];
            var errorName = status + ' from ' + request.method + ' ' + pathWithoutQuery;
            var userErrorMessage;
            if(data && data.error){
                if(typeof data.error === "string"){
                    userErrorMessage = data.error;
                    errorName += ': ' + data.error;
                }else if(data.error.message){
                    userErrorMessage = data.error.message;
                    errorName += ': ' + data.error.message;
                }
            }
            if(!userErrorMessage && data && data.message){
                userErrorMessage = data.message;
                errorName += ': ' + data.message;
            }
            var metaData = {
                debugApiUrl: qm.api.getDebugApiUrlFromRequest(request),
                appUrl: window.location.href,
                groupingHash: errorName,
                requestData: data,
                status: status,
                request: request,
                requestOptions: options,
                requestParams: qm.urlHelper.getQueryParams(request.url)
            };
            if(data.error){
                metaData.groupingHash = JSON.stringify(data.error);
                if(data.error.message){
                    metaData.groupingHash = JSON.stringify(data.error.message);
                }
            }
            qmLog.error(errorName, metaData, options.stackTrace);
            return userErrorMessage;
        },
        getDebugApiUrlFromRequest: function(request){
            var debugUrl = request.method + " " + request.url;
            if(request.headers && request.headers.Authorization){
                var accessToken = request.headers.Authorization.replace("Bearer ", "");
                debugUrl += "&access_token=" + accessToken;
            }
            debugUrl = debugUrl.replace('app.', 'local.');
            debugUrl = debugUrl.replace('staging.', 'local.');
            return debugUrl;
        },
        get: function(route, allowedParams, params, successHandler, requestSpecificErrorHandler, options){
            if(!params){params = {};}
            if(!successHandler){ throw "Please provide successHandler function as fourth parameter in qm.api.get";}
            if(!options){options = {};}
            var cache = false;
            options.stackTrace = (params.stackTrace) ? params.stackTrace : 'No stacktrace provided with params';
            delete params.stackTrace;
            if(params && params.cache){
                cache = params.cache;
                params.cache = null;
            }
            if(qm.urlHelper.urlContains('app/intro') && !params.force && !qm.auth.getAccessTokenFromCurrentUrl()){
                var message = 'Not making request to ' + route + ' user because we are in the intro state';
                qmLog.debug(message, null, options.stackTrace);
                if(requestSpecificErrorHandler){requestSpecificErrorHandler(message);}
                return;
            }
            delete params.force;
            qm.auth.getAccessTokenFromAnySource().then(function(accessToken){
                var url = qm.api.getQuantiModoUrl(route);
                url = qm.urlHelper.addUrlQueryParamsToUrlString(qm.api.addGlobalParams({}), url);
                url = qm.urlHelper.addUrlQueryParamsToUrlString(params, url);
                qm.api.getViaXhrOrFetch(url, successHandler, requestSpecificErrorHandler);
            });
        },
    },
    appsManager: { // jshint ignore:line
        getAppVersion: function(){
            var appSettings = qm.appsManager.getAppSettingsFromMemory();
            return appSettings.versionNumber;
        },
        getBuilderClientId: function(){
            if(!qm.appMode.isBuilder()){
                return null;
            }
            var clientId = qm.urlHelper.getParam('clientId');
            if(clientId){
                return clientId;
            }
            clientId = qm.stringHelper.getStringAfter(qm.urlHelper.getCurrentUrl(), 'app/configuration/');
            if(clientId){
                clientId = qm.stringHelper.getStringBeforeSubstring('?', clientId, clientId);
                return clientId;
            }
            clientId = qm.storage.getItem(qm.items.builderClientId);
            return clientId;
        },
        getClientSecret: function(){
            if(qm.clientSecret){
                return qm.clientSecret;
            }
            var appSettings = qm.getAppSettings();
            if(!appSettings){
                qm.qmLog.error("No appSettings!");
                appSettings = qm.getAppSettings();
            }
            if(appSettings && appSettings.clientSecret){
                return appSettings.clientSecret;
            }
            if(!qm.privateConfig){
                if(qm.urlHelper.indexOfCurrentUrl('quantimo.do') === -1){
                    qm.qmLog.error("No client secret or private config!");
                }
                return null;
            }
            if(qm.platform.isIOS()){
                return qm.privateConfig.client_secrets.iOS;
            }
            if(qm.platform.isAndroid){
                return qm.privateConfig.client_secrets.Android;
            }
            if(qm.platform.isChromeExtension){
                return qm.privateConfig.client_secrets.Chrome;
            }
            if(qm.platform.isWindows){
                return qm.privateConfig.client_secrets.Windows;
            }
            return qm.privateConfig.client_secrets.Web;
        },
        getAppSettingsLocallyOrFromApi: function(successHandler, errorHandler){
            var appSettings = qm.getAppSettings();
            if(appSettings && appSettings.clientId){
                successHandler(appSettings);
                return;
            }
            var localStorageKey = qm.items.appSettings;
            var builderClientId = qm.appsManager.getBuilderClientId();
            if(builderClientId){
                localStorageKey = qm.items.appSettingsRevisions;
            }
            qm.localForage.getItem(localStorageKey, function(appSettings){
                if(builderClientId && appSettings && appSettings.length && builderClientId === appSettings[0].clientId){
                    qm.appsManager.processAndSaveAppSettings(appSettings[0], successHandler);
                    return;
                }
                if(qm.platform.isWeb() && qm.urlHelper.indexOfCurrentUrl('.quantimo.do') !== -1){
                    qm.appsManager.getAppSettingsFromApi(null, successHandler, errorHandler);
                    return;
                }
                var clientIdFromUrl = qm.api.getClientIdFromBuilderQueryOrSubDomain();
                if(appSettings){
                    if(!clientIdFromUrl || appSettings.clientId.toLowerCase() === clientIdFromUrl.toLowerCase()){   // For some reason clientId from url is lowercase sometimes
                        qm.appsManager.processAndSaveAppSettings(appSettings, successHandler);
                        return;
                    }
                }
                qm.appsManager.getAppSettingsFromApi(null, successHandler, errorHandler);
            });
        },
        getAppSettingsFromMemory: function(){
            //if(qm.appMode.isPhysician() && qm.staticData){return qm.staticData.appSettings;}
            var appSettings = qm.globalHelper.getItem(qm.items.appSettings);
            if(!appSettings){
                if(!qm.staticData){
                    qm.qmLog.error("qm.staticData not set!");
                    return false;
                }
                appSettings = qm.staticData.appSettings;
            }
            var clientId = qm.api.getClientIdFromBuilderQueryOrSubDomain();
            if(!clientId ||
                clientId.toLowerCase() === appSettings.clientId.toLowerCase() ||   // For some reason clientId from url is lowercase sometimes
                clientId === "web" ||
                clientId === "physician"){
                return appSettings;
            }
            return false;
        },
        getAppSettingsFromApi: function(clientId, successHandler, errorHandler){
            qm.api.getAppSettingsUrl(clientId, function(appSettingsUrl){
                qm.api.getViaXhrOrFetch(appSettingsUrl, function(response){
                    if(!response){
                        if(errorHandler){
                            errorHandler("No response from " + appSettingsUrl);
                        }
                        qm.qmLog.error("No response from " + appSettingsUrl);
                        return;
                    }
                    if(response.privateConfig){
                        qm.privateConfig = response.privateConfig;
                        qm.localForage.setItem(qm.items.privateConfig, response.privateConfig);
                    }
                    if(!response.appSettings){
                        qm.qmLog.error("No appSettings response from " + appSettingsUrl);
                        if(errorHandler){
                            errorHandler("No appSettings response from " + appSettingsUrl);
                        }
                        return false;
                    }
                    qm.appsManager.processAndSaveAppSettings(response.appSettings, successHandler);
                }, errorHandler)
            });
        },
        loadPrivateConfigFromJsonFile: function(successHandler, errorHandler){  // I think adding appSettings to the chrome manifest breaks installation
            if(!qm.privateConfig){
                qm.api.getViaXhrOrFetch(qm.urlHelper.getPrivateConfigJsonUrl(), function(parsedResponse){  // Can't use QM SDK in service worker
                    qm.qmLog.debug('Got private config from json file', null, parsedResponse);
                    qm.privateConfig = parsedResponse;
                    if(successHandler){
                        successHandler(parsedResponse);
                    }
                }, function(){
                    qm.qmLog.error("Could not get private config from json file");
                    if(errorHandler){
                        errorHandler("Could not get private config from json file");
                    }
                });
            }
        },
        processAndSaveAppSettings: function(appSettings, callback){
            if(typeof appSettings === "string"){
                qm.qmLog.error(appSettings);
                return false;
            }
            if(!appSettings){
                qm.qmLog.error("Nothing given to processAndSaveAppSettings!");
                return false;
            }
            appSettings.designMode = qm.appMode.isBuilder();
            if(!appSettings.appDesign){
                qm.qmLog.error("No appDesign property!", appSettings);
            }else if(!appSettings.appDesign.ionNavBarClass){
                appSettings.appDesign.ionNavBarClass = "bar-positive";
            }
            function successHandler(){
                qm.localForage.setItem(qm.items.appSettings, appSettings);
                if(callback){
                    callback(appSettings);
                }
                return appSettings;
            }
            if(qm.appMode.isBuilder()){
                return successHandler();
            }  // Don't need to mess with app settings refresh in builder
            qm.storage.setItem(qm.items.appSettings, appSettings);
            for(var propertyName in qm.staticData.buildInfo){
                if(qm.staticData.buildInfo.hasOwnProperty(propertyName)){
                    appSettings[propertyName] = qm.staticData.buildInfo[propertyName];
                }
            }
            if(!appSettings.gottenAt){
                appSettings.gottenAt = qm.timeHelper.getUnixTimestampInSeconds();
            }
            if(appSettings.gottenAt < qm.timeHelper.getUnixTimestampInSeconds() - 86400){
                qm.appsManager.getAppSettingsFromApi(appSettings.clientId);
            }
            successHandler();
        },
        // SubDomain : Filename
        appConfigFileNames: {
            "app": "quantimodo",
            "default": "default",
            "energymodo": "energymodo",
            "ionic": "quantimodo",
            "local": "quantimodo",
            "medimodo": "medimodo",
            "mindfirst": "mindfirst",
            "moodimodo": "moodimodo",
            "oauth": "quantimodo",
            "patient": "quantimodo",
            "quantimodo": "quantimodo",
            "staging": "quantimodo",
            "studies": "quantimodo",
            "utopia": "quantimodo",
            "your_quantimodo_client_id_here": "your_quantimodo_client_id_here"
        },
        getDoctorRobotoAlias: function(appSettings){
            appSettings = appSettings || qm.getAppSettings();
            if(appSettings.doctorRobotAlias){
                return appSettings.doctorRobotAlias;
            }
            var doctorRobotoAlias = appSettings.appDisplayName.replace('Dr. ', '');
            doctorRobotoAlias = qm.stringHelper.getFirstWord(doctorRobotoAlias);
            if(doctorRobotoAlias === 'QuantiModo'){
                doctorRobotoAlias = 'Roboto';
            }
            return appSettings.doctorRobotoAlias = doctorRobotoAlias;
        }
    },
    apiHelper: {
        getApiDocs: function(callback){
            if(!callback){
                return qm.staticData.docs;
            }
            callback(qm.staticData.docs);
        },
        docs: null,
        getParameterDescription: function(parameterName, callback){
            qm.apiHelper.getApiDocs(function(apiDocs){
                var explanation = {title: qm.stringHelper.camelToTitleCase(parameterName)};
                explanation.textContent = apiDocs.parameters[parameterName].description;
                callback(explanation);
            });
        },
        getPropertyDescription: function(modelName, propertyName, callback){
            qm.apiHelper.getModelDefinition(modelName, function(modelDefinition){
                var explanation = qm.apiHelper.convertToExplanation(propertyName, modelDefinition);
                callback(explanation);
            });
        },
        convertToExplanation: function(propertyName, modelDefinition){
            var explanation = {title: qm.stringHelper.camelToTitleCase(propertyName)};
            explanation.textContent = modelDefinition.properties[propertyName].description;
            return explanation;
        },
        getRequiredProperties: function(modelName, callback){
            qm.apiHelper.getModelDefinition(modelName, function(modelDefinition){
                callback(modelDefinition.required);
            });
        },
        getModelDefinition: function(modelName, callback){
            qm.apiHelper.getApiDocs(function(apiDocs){
                var definition = apiDocs.definitions[modelName];
                if(!definition){
                    qm.qmLog.error(modelName + " definition not found.  Available definitions are " + JSON.stringify(apiDocs.definitions));
                }
                callback(definition);
            });
        },
        checkRequiredProperties: function(bodyToCheck, modelName, callback){
            qm.apiHelper.getModelDefinition(modelName, function(modelDefinition){
                var explanation = null;
                for(var i = 0; i < modelDefinition.required.length; i++){
                    var requiredPropertyName = modelDefinition.required[i];
                    if(!bodyToCheck[requiredPropertyName]){
                        explanation = qm.apiHelper.convertToExplanation(requiredPropertyName, modelDefinition);
                    }
                }
                callback(explanation);
            })
        }
    },
    arrayHelper: {
        arrayHasItemWithSpecificPropertyValue: function(propertyName, propertyValue, array){
            if(!array){
                qm.qmLog.error("No array provided to arrayHasItemWithSpecificPropertyValue");
                return false;
            }
            for(var i = 0; i < array.length; i++){
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
            return arrayOfObjects.filter(function(obj){
                return obj.name.toLowerCase().indexOf(queryTerm.toLowerCase()) !== -1;
            });
        },
        concatenateUniqueId: function(preferred, secondary){
            for(var i = 0; i < preferred.length; ++i){
                var preferredItem = preferred[i];
                secondary = secondary.filter(function(secondaryItem){
                    return secondaryItem.id !== preferredItem.id;
                })
            }
            if(!preferred.concat){
                qmLog.error("preferred not an array but is "+JSON.stringify(preferred))
            }
            var combined = preferred.concat(secondary);
            return combined;
        },
        convertToArrayIfNecessary: function(variable){
            if(!qm.arrayHelper.variableIsArray(variable)){
                variable = [variable];
            }
            return variable;
        },
        convertObjectToArray: function(object){
            if(!object){
                qm.qmLog.info(object + " provided to convertObjectToArray");
                return object;
            }
            if(qm.arrayHelper.variableIsArray(object)){
                return object;
            }
            return Object.keys(object).map(function(key){
                return object[key];
            });
        },
        deleteById: function(id, array){
            array = array.filter(function(obj){
                return obj.id !== id;
            });
            return array;
        },
        deleteByProperty: function(propertyName, value, array){
            array = array.filter(function(obj){
                return obj[propertyName] !== value;
            });
            return array;
        },
        filterByProperty: function(filterPropertyName, filterPropertyValue, unfilteredElementArray){
            return unfilteredElementArray.filter(function(obj){
                if(typeof obj[filterPropertyName] === "string" && typeof filterPropertyValue === "string"){
                    return filterPropertyValue.toLowerCase() === obj[filterPropertyName].toLowerCase();
                }else{
                    return filterPropertyValue === obj[filterPropertyName];
                }
            });
        },
        filterByPropertyOrSize: function(matchingElements, filterPropertyName, filterPropertyValue,
                                         lessThanPropertyName, lessThanPropertyValue,
                                         greaterThanPropertyName, greaterThanPropertyValue){
            if(!matchingElements){
                return null;
            }
            if(matchingElements.length){
                if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined"){
                    qm.qmLog.error(greaterThanPropertyName + ' greaterThanPropertyName does not exist');
                }
                if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
                    qm.qmLog.error(filterPropertyName + ' filterPropertyName does not exist');
                }
                if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
                    qm.qmLog.error(lessThanPropertyName + ' lessThanPropertyName does not exist');
                }
            }
            if(filterPropertyName && typeof filterPropertyValue !== "undefined" && filterPropertyValue !== null){
                matchingElements = qm.arrayHelper.filterByProperty(filterPropertyName, filterPropertyValue, matchingElements);
            }
            if(lessThanPropertyName && typeof lessThanPropertyValue !== "undefined"){
                matchingElements = matchingElements.filter(function(obj){
                    return obj[lessThanPropertyName] < lessThanPropertyValue;
                });
            }
            if(greaterThanPropertyName && typeof greaterThanPropertyValue !== "undefined"){
                matchingElements = matchingElements.filter(function(obj){
                    return obj[greaterThanPropertyName] > greaterThanPropertyValue;
                });
            }
            return matchingElements;
        },
        getByProperty: function(propertyName, value, array){
            array = array.filter(function(obj){
                return obj[propertyName] === value;
            });
            return array;
        },
        getContaining: function(searchTerm, array){
            if(!array){
                qm.qmLog.error("No array provided to getContaining");
                return array;
            }
            searchTerm = searchTerm.toLowerCase();
            var matches = [];
            for(var i = 0; i < array.length; i++){
                if(JSON.stringify(array[i]).toLowerCase().indexOf(searchTerm) > -1){
                    matches.push(array[i]);
                }
            }
            return matches;
        },
        getWithNameContaining: function(searchTerm, array){
            if(!array){
                qm.qmLog.error("No array provided to getContaining");
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
            if(!searchTerm){
                qm.qmLog.error("No searchTerm provided to getContaining");
                return array;
            }
            if(!array){
                qm.qmLog.error("No array provided to getContaining");
                return array;
            }
            if(typeof searchTerm !== "string"){
                qm.qmLog.error("searchTerm is not a string!", searchTerm);
                return array;
            }
            qm.qmLog.debug("Called getWithNameContainingEveryWord...");
            searchTerm = searchTerm.toLowerCase();
            var filterBy = searchTerm.split(/\s+/);
            return array.filter(function(item){
                var name = item.name || item.variableName;
                if(!name){
                    qm.qmLog.error("No name on: " + JSON.stringify(item));
                    return false;
                }
                name = name.toLowerCase();
                var result = filterBy.every(function(word){
                    var exists = name.indexOf(word);
                    if(exists !== -1){
                        return true;
                    }
                    if(item.synonyms && item.synonyms.length){
                        var synonyms = JSON.stringify(item.synonyms).toLowerCase();
                        if(synonyms.indexOf(word) !== -1){
                            return true;
                        }
                    }
                    if(item.alias){
                        var alias = item.alias.toLowerCase();
                        if(alias.indexOf(word) !== -1){
                            return true;
                        }
                    }
                });
                return result;
            });
        },
        inArray: function(needle, haystack){
            var length = haystack.length;
            for(var i = 0; i < length; i++){
                if(haystack[i] === needle) return true;
            }
            return false;
        },
        mergeWithUniqueId: function(replacements, existingArray){
            return qm.arrayHelper.concatenateUniqueId(replacements, existingArray);
        },
        replaceElementInArrayById: function(array, replacementElement){
            return qm.arrayHelper.concatenateUniqueId([replacementElement], array);
        },
        removeLastItem: function(array){
            if(!array){
                qm.qmLog.error("No array provided to removeLastItem");
                return array;
            }
            if(!qm.arrayHelper.variableIsArray(array)){
                qm.qmLog.error("Non-array provided to removeLastItem");
                return array;
            }
            array.pop();
        },
        removeLastItemsUntilSizeLessThan: function(maxKb, array){
            if(!array){
                qm.qmLog.error("No array provided to removeLastItem");
                return array;
            }
            if(!qm.arrayHelper.variableIsArray(array)){
                qm.qmLog.error("Non-array provided to removeLastItemsUntilSizeLessThan");
                return array;
            }
            if(array.length < 2){
                qm.qmLog.error("Removing only element from single item array!");
                return [];
            }
            while(qm.arrayHelper.getSizeInKiloBytes(array) > maxKb){
                qm.arrayHelper.removeLastItem(array);
            }
            return array;
        },
        sortByProperty: function(arrayToSort, propertyName, direction){
            qm.qmLog.debug("Sorting by " + propertyName + "...");
            if(!qm.arrayHelper.variableIsArray(arrayToSort)){
                qm.qmLog.info("Cannot sort by " + propertyName + " because it's not an array!");
                return arrayToSort;
            }
            if(arrayToSort.length < 2){
                return arrayToSort;
            }
            if(propertyName.indexOf('-') > -1 || direction === 'desc'){
                propertyName = propertyName.replace('-', '');
                arrayToSort.sort(function(a, b){
                    var aVal = a[propertyName];
                    var bVal = b[propertyName];
                    return bVal - aVal;
                });
            }else{
                arrayToSort.sort(function(a, b){
                    var aVal = a[propertyName];
                    var bVal = b[propertyName];
                    return aVal - bVal;
                });
            }
            return arrayToSort;
        },
        unsetNullProperties: function(array){
            if(!array){
                qm.qmLog.error("Nothing provided to unsetNullProperties");
                return null;
            }
            for(var i = 0; i < array.length; i++){
                array[i] = qm.objectHelper.unsetNullProperties(array[i]);
            }
            return array;
        },
        variableIsArray: function(variable){
            if(!variable){
                qm.qmLog.info(variable + " provided to variableIsArray");
                return false;
            }
            var isAnArray = Array.isArray(variable);
            if(isAnArray){
                return true;
            }
            var constructorArray = variable.constructor === Array;
            if(constructorArray){
                return true;
            }
            var instanceOfArray = variable instanceof Array;
            if(instanceOfArray){
                return true;
            }
            return Object.prototype.toString.call(variable) === '[object Array]';
        },
        removeArrayElementsWithDuplicateIds: function(arr, type){
            if(!arr){return arr;}
            // TODO: I don't know what the hell is going on here
            // I tried to replace with removeDuplicatesById but tests kept failing so I gave up
            var a = arr.concat();
            for(var i = 0; i < a.length; i++){
                for(var j = i + 1; j < a.length; j++){
                    if(!a[i]){
                        qm.qmLog.error('a[i] not defined!');
                    }
                    if(!a[j]){
                        qm.qmLog.error('a[j] not defined!');
                        return a;
                    }
                    if(a[i].id === a[j].id){
                        a.splice(j--, 1);
                    }
                }
            }
            return a;
        },
        removeDuplicatesByProperty: function(myArr, prop) {
            return myArr.filter(function(obj, pos, arr) {
                return arr.map(function(mapObj){
                    return mapObj[prop]
                }).indexOf(obj[prop]) === pos;
            });
        },
        removeDuplicatesById: function(arr, type) {
            type = type || "[TYPE NOT PROVIDED]"
            if(!arr){
                qmLog.errorAndExceptionTestingOrDevelopment("No arr provided to removeDuplicatesById for type "+type)
                arr = [];
            }
            var allById = {};
            var toKeep = {};
            var noId = [];
            arr.forEach(function(one){
                var id = one.id;
                if(!id){
                    qmLog.error("No id on "+type+" provided to removeDuplicatesById. Maybe a measurement not sent to API, yet?", one);
                    noId.push(one)
                    return;
                }
                if(!allById[id]){
                    allById[id] = [];
                } else {
                    qmLog.error("Duplicate "+type+" with id "+id, one);
                }
                allById[id].push(one);
                toKeep[id] = one;
            })
            var combined = noId.concat(Object.values(toKeep)) // Put no id first as they might be new measurements
            return combined;
        },
        filterByRequestParams: function(provided, params){
            if(params && params.variableCategoryName){
                params.variableCategoryName = qm.variableCategoryHelper.replaceCategoryAliasWithActualNameIfNecessary(params.variableCategoryName);
            }
            if(!provided){
                qm.qmLog.error("Nothing provided to filterByRequestParams");
                return provided;
            }
            if(!params){
                qm.qmLog.info("No params provided to filterByRequestParams");
                return provided;
            }
            var allowedFilterParams = [
                'connectorName',
                'id',
                'manualTracking',
                'name',
                'outcome',
                'upc',
                'variableCategoryName',
                'variableId',
                'variableName',
            ];
            var excludedFilterParams = ['includePublic', 'excludeLocal', 'minimumNumberOfResultsRequiredToAvoidAPIRequest',
                'sort', 'limit', 'appName', 'appVersion', 'accessToken', 'clientId', 'barcodeFormat', 'searchPhrase',
                'fallbackToAggregatedCorrelations',
                'platform', 'reason'];
            var greaterThanPropertyName = null;
            var greaterThanPropertyValue = null;
            var lessThanPropertyName = null;
            var lessThanPropertyValue = null;
            var filterPropertyValues = [];
            var filterPropertyNames = [];
            for(var key in params){
                if(!params.hasOwnProperty(key)){
                    continue;
                }
                var value = params[key];
                if(typeof value === "string" && value.indexOf('(lt)') !== -1){
                    lessThanPropertyValue = value.replace('(lt)', "");
                    lessThanPropertyValue = Number(lessThanPropertyValue);
                    lessThanPropertyName = key;
                }else if(typeof value === "string" && value.indexOf('(gt)') !== -1){
                    greaterThanPropertyValue = value.replace('(gt)', "");
                    greaterThanPropertyValue = Number(greaterThanPropertyValue);
                    greaterThanPropertyName = key;
                }else{
                    if(value === false && key === "manualTracking"){
                        continue;
                    }
                    if(value === null || value === "" || value === "Anything"){
                        continue;
                    }
                    if(excludedFilterParams.indexOf(key) !== -1){
                        continue;
                    }
                    if(allowedFilterParams.indexOf(key) === -1){
                        qm.qmLog.error(key + " is not in allowed filter params");
                    }
                    qm.qmLog.debug("filtering by " + key+": "+value);
                    filterPropertyValues.push(value);
                    filterPropertyNames.push(key);
                }
            }
            var filtered = qm.arrayHelper.filterByPropertyOrSize(provided, null, null,
                lessThanPropertyName, lessThanPropertyValue,
                greaterThanPropertyName, greaterThanPropertyValue);
            if(filtered){
                for(var i = 0; i < filterPropertyNames.length; i++){
                    filtered = qm.arrayHelper.filterByProperty(filterPropertyNames[i], filterPropertyValues[i], filtered);
                }
            }
            if(!filtered){
                return null;
            }
            if(params.searchPhrase && params.searchPhrase !== ""){
                filtered = qm.arrayHelper.getWithNameContainingEveryWord(params.searchPhrase, filtered);
                qm.qmLog.debug(filtered.length+" after getWithNameContainingEveryWord with searchPhrase: "+params.searchPhrase)
            }
            if(params && params.sort){
                filtered = qm.arrayHelper.sortByProperty(filtered, params.sort);
                qm.qmLog.debug(filtered.length+" after sortBy: "+params.sort)
            }
            filtered = qm.arrayHelper.removeArrayElementsWithDuplicateIds(filtered);
            qm.qmLog.debug(filtered.length+" after removeArrayElementsWithDuplicateIds")
            return filtered;
        },
        getUnique: function(array, propertyName){
            if(!propertyName){
                function onlyUnique(value, index, self){
                    return self.indexOf(value) === index;
                }
                return array.filter(onlyUnique);
            }
            var flags = [], output = [], l = array.length, i;
            for(i = 0; i < l; i++){
                if(flags[array[i][propertyName]]){
                    continue;
                }
                flags[array[i][propertyName]] = true;
                output.push(array[i]);
            }
            return output;
        },
        deleteFromArrayByProperty: function(localStorageItemArray, propertyName, propertyValue){
            var elementsToKeep = [];
            for(var i = 0; i < localStorageItemArray.length; i++){
                if(localStorageItemArray[i][propertyName] !== propertyValue){
                    elementsToKeep.push(localStorageItemArray[i]);
                }
            }
            return elementsToKeep;
        },
        addToOrReplaceByIdAndMoveToFront: function(localStorageItemArray, replacementElementArray, key){
            if(!(replacementElementArray instanceof Array)){
                replacementElementArray = [replacementElementArray];
            }
            // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
            var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
            var found = false;
            if(localStorageItemArray){  // NEED THIS DOUBLE LOOP IN CASE THE STUFF WE'RE ADDING IS AN ARRAY
                for(var i = 0; i < localStorageItemArray.length; i++){
                    found = false;
                    for(var j = 0; j < replacementElementArray.length; j++){
                        if(typeof replacementElementArray[j] === "string"){
                            throw key + " replacementElementArray item is string: " + replacementElementArray[j];
                        }
                        if(!replacementElementArray[j].id){
                            qm.qmLog.warn("No id on " + key + " replacementElementArray item: " + JSON.stringify(replacementElementArray[j]));
                        }
                        if(replacementElementArray[j].id &&
                            localStorageItemArray[i].id === replacementElementArray[j].id){
                            found = true;
                        }
                    }
                    if(!found){
                        elementsToKeep.push(localStorageItemArray[i]);
                    }
                }
            }
            return elementsToKeep;
        },
        getSizeInKiloBytes: function(string){
            if(typeof value !== "string"){
                string = JSON.stringify(string);
            }
            return Math.round(string.length * 16 / (8 * 1024));
        },
        getFirstElementIfArray: function(possibleArray){
            if(qm.arrayHelper.variableIsArray(possibleArray)){
                return possibleArray[0];
            }
            return possibleArray;
        },
        moveElementOfArray: function(arr, old_index, new_index){
            if(new_index >= arr.length){
                var k = new_index - arr.length + 1;
                while(k--){
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr; // for testing
        }
    },
    assert: {
        count: function(expected, array){
            if(array.length !== expected){
                throw "Array length should be " + expected + " but is " + array.length;
            }
        },
        doesNotHaveProperty: function(arr, propertyName){
            if(!Array.isArray(arr)){
                arr = [arr];
            }
            for(var i = 0; i < arr.length; i++){
                var item = arr[i];
                if(typeof item[propertyName] !== "undefined"){
                    qm.qmLog.itemAndThrowException(item, "should not have " + propertyName + " (" + item[propertyName] + ")", [propertyName])
                }
            }
        },
        doesNotHaveUserId: function(item){
            qm.assert.doesNotHaveProperty(item, 'userId');
        },
        throwTestException: function(testMessage, customMessage){
            if(customMessage){
                customMessage = ': ' + customMessage;
            }else{
                customMessage = '';
            }
            var combinedMessage = testMessage + customMessage;
            console.error("FAILED: " + combinedMessage + "\n");
            debugger
            var e = new Error(combinedMessage);
            e.stack = qm.stringHelper.getStringBeforeSubstring('at Gulp', e.stack, e.stack);
            e.stack = qm.stringHelper.getStringBeforeSubstring('at Object.runAllTestsForType', e.stack, e.stack);
            e.stack = qm.stringHelper.getStringAfter('Object.throwTestException', combinedMessage, e.stack);
            throw e;
        },
        equals: function(expected, actual, message){
            if(expected !== actual){
                qm.assert.throwTestException("Expected " + expected + " but got " + actual, message);
            }
        },
        contains: function(expected, actual, message){
            if(actual.indexOf(expected) === -1){
                qm.assert.throwTestException("Expected to contain " + expected + " but got " + actual, message);
            }
        },
        doesNotEqual: function(expected, actual, message){
            if(expected === actual){
                qm.assert.throwTestException("Actual value " + actual + " should not equal " + expected, message);
            }
        },
        greaterThan: function(expected, actual, message){
            if(actual <= expected){
                qm.assert.throwTestException("Actual value " + actual + " shoudl be greater than " + expected, message);
            }
        },
        doesNotContain: function(expected, actual, message){
            if(actual.indexOf(expected) !== -1){
                qm.assert.throwTestException("Actual value " + actual + " should not contain " + expected, message);
            }
        },
        variables: {
            descendingOrder: function(variables, property){
                if(qm.appMode.isDebug()){
                    qm.qmLog.variables(variables, property);
                }
                qm.assert.descendingOrder(variables, property)
            }
        },
        descendingOrder: function(array, property){
            var lastValue = array[0][property];
            for(var i = 0; i < array.length; i++){
                var qmElement = array[i];
                var currentValue = qmElement[property];
                if(currentValue > lastValue){
                    throw "current " + property + " " + currentValue + " is greater than last value " + lastValue;
                }
            }
        },
        isNull: function(value, name){
            if(value !== null){
                throw name + " should be null but is " + JSON.stringify(value);
            }
        }
    },
    auth: {
        getAccessToken: function(){
            return qm.auth.getAccessTokenFromUrlUserOrStorage();
        },
        getAndSaveAccessTokenFromCurrentUrl: function(){
            qm.qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl " + qm.urlHelper.getCurrentUrl());
            var accessTokenFromUrl = qm.auth.getAccessTokenFromCurrentUrl();
            if(accessTokenFromUrl){
                if(!qm.auth.accessTokenIsValid(accessTokenFromUrl)){
                    return null;
                }
                qm.qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl saving " + accessTokenFromUrl);
                qm.auth.saveAccessToken(accessTokenFromUrl);
            }
            return accessTokenFromUrl;
        },
        accessTokenIsValid: function(accessToken){
            if(accessToken.length < 10 && accessToken !== "demo"){
                qm.qmLog.error("This accessTokenFromUrl is not valid: " + accessToken);
                return false;
            }
            return true;
        },
        saveAccessToken: function(accessToken){
            if(!qm.urlHelper.getParam('doNotRemember')){
                qm.qmLog.authDebug("saveAccessToken: Saving access token in local storage because doNotRemember is not set");
                qm.storage.setItem(qm.items.accessToken, accessToken);
            }
        },
        getAccessTokenFromUrlUserOrStorage: function(){
            var accessToken = qm.auth.getAndSaveAccessTokenFromCurrentUrl();
            if(accessToken){
                qm.qmLog.authDebug("getAndSaveAccessTokenFromCurrentUrl returned " + accessToken);
                return accessToken;
            }
            var u = qm.userHelper.getUserFromLocalStorage();
            if(u){
                accessToken = u.accessToken;
                if(accessToken){
                    if(!qm.auth.accessTokenIsValid(accessToken)){
                        qm.qmLog.error("qm.userHelper.getUserFromLocalStorage().accessToken is invalid: " + accessToken);
                    }else{
                        qm.qmLog.authDebug("getUserFromLocalStorage().accessToken returned " + accessToken);
                        return accessToken;
                    }
                }
            }
            accessToken = qm.storage.getItem(qm.items.accessToken);
            if(accessToken){
                if(!qm.auth.accessTokenIsValid(accessToken)){
                    qm.qmLog.error("accessTokenFromUrl is invalid: " + accessToken);
                }else{
                    qm.qmLog.authDebug("qm.storage.getItem(qm.items.accessToken)returned " + accessToken);
                    return accessToken;
                }
            }
            qm.qmLog.debug("No access token or user!");
            return null;
        },
        saveAccessTokenResponse: function(accessResponse){
            var accessToken;
            if(typeof accessResponse === "string"){
                accessToken = accessResponse;
            }else{
                accessToken = accessResponse.accessToken || accessResponse.access_token;
            }
            if(accessToken){
                qm.storage.setItem('accessToken', accessToken);
            }else{
                qm.qmLog.error('No access token provided to qm.auth.saveAccessTokenResponse');
                return;
            }
            var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;
            if(refreshToken){
                qm.storage.setItem(qm.items.refreshToken, refreshToken);
            }
            /** @namespace accessResponse.expiresAt */
            var expiresAt = accessResponse.expires || accessResponse.expiresAt || accessResponse.accessTokenExpires;
            var expiresAtMilliseconds;
            var bufferInMilliseconds = 86400 * 1000;  // Refresh a day in advance
            if(accessResponse.accessTokenExpiresAtMilliseconds){
                expiresAtMilliseconds = accessResponse.accessTokenExpiresAtMilliseconds;
            }else if(typeof expiresAt === 'string' || expiresAt instanceof String){
                expiresAtMilliseconds = qm.timeHelper.getUnixTimestampInMilliseconds(expiresAt);
            }else if(expiresAt === parseInt(expiresAt, 10) && expiresAt < qm.timeHelper.getUnixTimestampInMilliseconds()){
                expiresAtMilliseconds = expiresAt * 1000;
            }else if(expiresAt === parseInt(expiresAt, 10) && expiresAt > qm.timeHelper.getUnixTimestampInMilliseconds()){
                expiresAtMilliseconds = expiresAt;
            }else{
                // calculate expires at
                /** @namespace accessResponse.expiresIn */
                var expiresInSeconds = accessResponse.expiresIn || accessResponse.expires_in;
                expiresAtMilliseconds = qm.timeHelper.getUnixTimestampInMilliseconds() + expiresInSeconds * 1000;
                qm.qmLog.authDebug("Expires in is " + expiresInSeconds + ' seconds. This results in expiresAtMilliseconds being: ' + expiresAtMilliseconds);
            }
            if(expiresAtMilliseconds){
                qm.storage.setItem(qm.items.expiresAtMilliseconds, expiresAtMilliseconds - bufferInMilliseconds);
                return accessToken;
            }else{
                qm.qmLog.authDebug('No expiresAtMilliseconds!',
                    'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qm.storage.getAsString('user'),
                    {groupingHash: 'No expiresAtMilliseconds!'},
                    "error");
            }
            var groupingHash = 'Access token expiresAt not provided in recognizable form!';
            qm.qmLog.authDebug(groupingHash,
                'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qm.storage.getAsString('user'),
                {groupingHash: groupingHash}, "error");
        },
        getAccessTokenFromCurrentUrl: function(){
            qm.qmLog.webAuthDebug("getAndSaveAccessTokenFromCurrentUrl " + qm.urlHelper.getCurrentUrl());
            var accessTokenFromUrl = (qm.urlHelper.getParam('accessToken')) ? qm.urlHelper.getParam('accessToken') : qm.urlHelper.getParam('quantimodoAccessToken');
            if(accessTokenFromUrl && accessTokenFromUrl.indexOf("#") !== -1){ // Sometimes #/app/settings gets appended for some reason
                accessTokenFromUrl = qm.stringHelper.getStringBeforeSubstring('#', accessTokenFromUrl);
            }
            if(accessTokenFromUrl){
                qm.qmLog.webAuthDebug("Got access token from url");
            }else{
                qm.qmLog.webAuthDebug("No access token from url");
            }
            return accessTokenFromUrl;
        },
        deleteAllAccessTokens: function(reason){
            qm.qmLog.authDebug("deleteAllAccessTokens because: " + reason);
            qm.storage.removeItem('accessToken');
            var u = qm.userHelper.getUserFromLocalStorage();
            if(u){u.accessToken = null;}
            qm.auth.deleteAllCookies();
            qm.api.configureClient('deleteAllAccessTokens');
        },
        deleteAllCookies: function(){
            if(typeof document === "undefined"){return;}
            qm.qmLog.info("Deleting all cookies...");
            var cookies = document.cookie.split(";");
            for(var i = 0; i < cookies.length; i++){
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        },
        getPermissionString: function(){
            var str = "";
            var permissions = ['readmeasurements', 'writemeasurements'];
            for(var i = 0; i < permissions.length; i++){
                str += permissions[i] + "%20";
            }
            return str.replace(/%20([^%20]*)$/, '$1');
        },
        generateV1OAuthUrl: function(register){
            var url = qm.api.getBaseUrl() + "/api/oauth2/authorize?";
            // add params
            url += "response_type=code";
            url += "&client_id=" + qm.api.getClientId();
            //url += "&client_secret=" + qm.appsManager.getClientSecret();
            url += "&scope=" + qm.auth.getPermissionString();
            url += "&state=testabcd";
            if(register === true){
                url += "&register=true";
            }
            url += "&redirect_uri=" + qm.auth.getRedirectUri();
            qm.qmLog.debug('generateV1OAuthUrl: ' + url);
            return url;
        },
        openBrowserWindowAndGetParameterFromRedirect: function(url, redirectUrl, parameterName, successHandler, ref){
            if(!qm.platform.getWindow()){
                return false;
            }
            redirectUrl = redirectUrl || qm.auth.getRedirectUri();
            qm.qmLog.authDebug('Going to try logging in by opening new tab at url ' + url);
            ref = ref || window.open(url, '_blank');
            if(!ref){
                qm.qmLog.error('You must first unblock popups, and and refresh the page for this to work!');
                alert("In order to log in, please unblock popups by clicking the icon on the right of the address bar. Then refresh the page.");
            }else{
                qm.qmLog.authDebug('Opened ' + url + ' and now broadcasting isLoggedIn message question every second to sibling tabs');
                var interval = setInterval(function(){
                    ref.postMessage('isLoggedIn?', redirectUrl);
                }, 1000);
                window.onMessageReceived = function(event){  // handler when a message is received from a sibling tab
                    qm.qmLog.authDebug('message received from sibling tab', null, event.url);
                    if(interval !== false){
                        clearInterval(interval);  // Don't ask login question anymore
                        interval = false;
                        var value = qm.urlHelper.getParameterFromEventUrl(event, parameterName);
                        if(value){
                            successHandler(value);
                            ref.close();
                        }
                        qm.urlHelper.checkLoadStartEventUrlForErrors(ref, event);
                    }
                };
                // listen to broadcast messages from other tabs within browser
                window.addEventListener("message", window.onMessageReceived, false);
            }
        },
        oAuthBrowserLogin: function(register, successHandler){
            var url = qm.auth.generateV1OAuthUrl(register);
            var redirectUrl = qm.auth.getRedirectUri();
            qm.auth.openBrowserWindowAndGetParameterFromRedirect(url, redirectUrl, 'code', successHandler);
        },
        getRedirectUri: function(){
            var appSettings = qm.getAppSettings();
            if(appSettings && appSettings.redirectUri){
                return appSettings.redirectUri;
            }
            return qm.api.getBaseUrl() + '/callback/';
        },
        getAccessTokenFromUrlAndSetLocalStorageFlags: function(){
            if(qm.auth.accessTokenFromUrl){
                return qm.auth.accessTokenFromUrl;
            }
            qm.qmLog.webAuthDebug("getAccessTokenFromUrl: No previous qm.auth.accessTokenFromUrl");
            qm.auth.accessTokenFromUrl = qm.auth.getAccessTokenFromCurrentUrl();
            if(!qm.auth.accessTokenFromUrl){
                return null;
            }
            if(!qm.urlHelper.urlContains('app/login')){
                qm.qmLog.authDebug("getAccessTokenFromUrl: Setting qm.auth.accessTokenFromUrl to " + qm.auth.accessTokenFromUrl);
                qm.qmLog.authDebug("getAccessTokenFromUrl: Setting onboarded and introSeen in local storage because we got an access token from url");
                qm.storage.setItem(qm.items.onboarded, true);
                qm.storage.setItem(qm.items.introSeen, true);
                qm.qmLog.info('Setting onboarded and introSeen to true');
                qm.qmLog.info('Setting afterLoginGoToState and afterLoginGoToUrl to null');
                qm.storage.setItem(qm.items.afterLoginGoToState, null);
                qm.storage.setItem(qm.items.afterLoginGoToUrl, null);
            }else{
                qm.qmLog.info('On login state so not setting afterLoginGoToState and afterLoginGoToUrl to null');
            }
            qm.qmLog.authDebug("getAccessTokenFromUrl: returning this access token: " + qm.auth.accessTokenFromUrl);
            return qm.auth.accessTokenFromUrl;
        },
        logout: function(reason){
            qm.auth.deleteAllAccessTokens(reason);
            qm.auth.deleteAllCookies();
            qm.auth.logOutOfWebsite();
        },
        logOutOfWebsite: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            //var afterLogoutGoToUrl = qm.api.getQuantiModoUrl('ionic/Modo/www/index.html#/app/intro');
            var afterLogoutGoToUrl = qm.urlHelper.getIonicUrlForPath('intro');
            if(qm.urlHelper.indexOfCurrentUrl('/src/') !== -1){
                afterLogoutGoToUrl = afterLogoutGoToUrl.replace('/www/', '/src/');
            }
            if(qm.urlHelper.indexOfCurrentUrl('.quantimo.do/') === -1){
                afterLogoutGoToUrl = qm.urlHelper.getCurrentUrl();
            }
            afterLogoutGoToUrl = afterLogoutGoToUrl.replace('settings', 'intro');
            if(qm.platform.isChromeExtension()){
                afterLogoutGoToUrl = qm.api.getQuantiModoUrl("api/v1/window/close");
            }
            var logoutUrl = qm.api.getQuantiModoUrl("api/v2/auth/logout?afterLogoutGoToUrl=" + encodeURIComponent(afterLogoutGoToUrl));
            qm.qmLog.info("Sending to " + logoutUrl);
            var request = {
                method: 'GET',
                url: logoutUrl,
                responseType: 'json',
                headers: {'Content-Type': "application/json"}
            };
            //$http(request);
            // Get request doesn't seem to clear cookies
            window.location.replace(logoutUrl);
        },
        weShouldSetAfterLoginStateOrUrl: function(afterLoginGoToStateOrUrl){
            if(qm.storage.getItem(qm.items.afterLoginGoToUrl)){
                qm.qmLog.info('afterLoginGoToUrl already set to ' + qm.storage.getItem(qm.items.afterLoginGoToUrl));
                return false;
            }
            if(qm.storage.getItem(qm.items.afterLoginGoToState)){
                qm.qmLog.info('afterLoginGoToState already set to ' + qm.storage.getItem(qm.items.afterLoginGoToState));
                return false;
            }
            if(!afterLoginGoToStateOrUrl){return false;}
            if(afterLoginGoToStateOrUrl.indexOf('login') !== -1){
                qm.qmLog.debug('setAfterLoginGoToState: Why are we sending to login from login state?');
                return false;
            }
            return true;
        },
        setAfterLoginGoToUrl: function(afterLoginGoToUrl){
            if(!afterLoginGoToUrl){
                afterLoginGoToUrl = qm.urlHelper.getCurrentUrl();
            }
            if(!qm.auth.weShouldSetAfterLoginStateOrUrl(afterLoginGoToUrl)){
                return false;
            }
            qm.qmLog.debug('Setting afterLoginGoToUrl to ' + afterLoginGoToUrl + ' and going to login.');
            qm.storage.setItem(qm.items.afterLoginGoToUrl, afterLoginGoToUrl);
        },
        sendToLogin: function(reason){
            qm.qmLog.info("Sending to login because " + reason);
            var urlToken = qm.urlHelper.getParam('access_token');
            if(urlToken){
                if(!qm.auth.getAccessTokenFromCurrentUrl()){
                    qm.qmLog.error("Not detecting snake case access_token", {}, qm.qmLog.getStackTrace());
                }
                qm.qmLog.error("Sending to login even though we have an url access token (" + urlToken + ") because " + reason,
                    {}, qm.qmLog.getStackTrace());
                return;
            }
            qm.urlHelper.goToUrl('#/app/login', reason);
        },
        setAfterLoginGoToUrlAndSendToLogin: function(reason){
            if(qm.urlHelper.indexOfCurrentUrl('login') !== -1){
                qm.qmLog.authDebug('qm.auth.setAfterLoginGoToUrlAndSendToLogin: Why are we sending to login from login state?');
                return;
            }
            qm.auth.setAfterLoginGoToUrl();
            qm.auth.sendToLogin(reason);
        },
        handle401Response: function(response, options){
            options = options || {};
            if(options && options.doNotSendToLogin){
                return;
            }
            var reason = 'we got this 401 response: ' + JSON.stringify(response);
            qm.auth.deleteAllAccessTokens(reason);
            qm.auth.setAfterLoginGoToUrlAndSendToLogin(reason);
        },
        refreshAccessToken: function(refreshToken, deferred){
            qmLog.authDebug('Refresh token will be used to fetch access token from ' +
                qm.api.getQuantiModoUrl("api/oauth2/token") + ' with client id ' + qm.api.getClientId());
            var url = qm.api.getQuantiModoUrl("api/oauth2/token");
            qm.api.post(url, {
                client_id: qm.api.getClientId(),
                //client_secret: qm.appsManager.getClientSecret(),
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }, function(data){
                // update local storage
                if(data.error){
                    qmLog.debug('Token refresh failed: ' + data.error, null);
                    deferred.reject('Token refresh failed: ' + data.error);
                }else{
                    var accessTokenRefreshed = qm.auth.saveAccessTokenResponse(data);
                    qmLog.debug('refreshAccessToken: access token successfully updated from api server: ',
                        data, null);
                    deferred.resolve(accessTokenRefreshed);
                }
            }, function(response){
                qmLog.debug('refreshAccessToken: failed to refresh token from api server', response,
                    null);
                deferred.reject(response);
            });
        },
        getAccessTokenFromAnySource: function(){
            var deferred = Q.defer();
            var tokenFromUrl = qm.auth.getAccessTokenFromUrlAndSetLocalStorageFlags();
            if(tokenFromUrl){
                qmLog.authDebug("getAccessTokenFromAnySource: Got AccessTokenFromUrl");
                deferred.resolve(tokenFromUrl);
                return deferred.promise;
            }
            var accessTokenFromLocalStorage = qm.storage.getItem(qm.items.accessToken);
            var expiresAtMilliseconds = qm.storage.getItem("expiresAtMilliseconds");
            var refreshToken = qm.storage.getItem("refreshToken");
            qmLog.authDebug('getAccessTokenFromAnySource: Values from local storage:',
                JSON.stringify({
                    expiresAtMilliseconds: expiresAtMilliseconds,
                    refreshToken: refreshToken,
                    accessTokenFromLocalStorage: accessTokenFromLocalStorage
                }));
            if(refreshToken && !expiresAtMilliseconds){
                var errorMessage = 'We have a refresh token but expiresAtMilliseconds is ' + expiresAtMilliseconds + '.  How did this happen?';
                if(!qm.userHelper.isTestUser()){
                    qmLog.error(errorMessage, qm.storage.getAsString(qm.items.user), {groupingHash: errorMessage}, "error");
                }
            }
            if(accessTokenFromLocalStorage && window.qm.timeHelper.getUnixTimestampInMilliseconds() < expiresAtMilliseconds){
                qmLog.authDebug('getAccessTokenFromAnySource: Current access token should not be expired. Resolving token using one from local storage');
                deferred.resolve(accessTokenFromLocalStorage);
            }else if(refreshToken && expiresAtMilliseconds && qm.api.getClientId() !== 'oAuthDisabled' && qm.privateConfig){
                qmLog.authDebug(window.qm.timeHelper.getUnixTimestampInMilliseconds() + ' (now) is greater than expiresAt ' + expiresAtMilliseconds);
                qm.auth.refreshAccessToken(refreshToken, deferred);
            }else if(accessTokenFromLocalStorage){
                deferred.resolve(accessTokenFromLocalStorage);
            }else if(qm.getUser() && qm.getUser().accessToken){
                qmLog.authDebug("got access token from user");
                deferred.resolve(qm.getUser().accessToken);
            }else if(qm.api.getClientId() === 'oAuthDisabled' || !qm.privateConfig){
                qmLog.authDebug('getAccessTokenFromAnySource: oAuthDisabled so we do not need an access token');
                deferred.resolve();
            }else{
                qmLog.info('Could not get or refresh access token at ' + window.location.href);
                deferred.resolve();
            }
            return deferred.promise;
        }
    },
    builder: {},
    chartHelper: {
        configureHighchart: function(highchartConfig){
            qm.chartHelper.setChartExportingOptionsOnce(highchartConfig);
            qm.chartHelper.setTooltipFormatterFunction(highchartConfig);
        },
        setChartExportingOptionsOnce: function(highchartConfig){
            if(!highchartConfig){
                qm.qmLog.info("No highchartConfig provided to setChartExportingOptionsOnce");
                return highchartConfig;
            }
            highchartConfig.exporting = {enabled: qm.platform.isWeb()};
            return highchartConfig;
        },
        configureHighchartSubProperties: function(something){
            var keys = Object.keys(something);
            for(var i = 0; i < keys.length; i++){
                if(something[keys[i]] && typeof something[keys[i]] === 'object'){
                    if(something[keys[i]].highchartConfig){
                        qm.chartHelper.configureHighchart(something[keys[i]].highchartConfig)
                    }else{
                        qm.chartHelper.configureHighchartSubProperties(something[keys[i]])
                    }
                }
            }
        },
        setTooltipFormatterFunction: function(highchartConfig) {
            if (highchartConfig.tooltip &&
                highchartConfig.tooltip.formatter &&
                // eslint-disable-next-line no-underscore-dangle
                highchartConfig.tooltip.formatter._expression) {
                var exp = highchartConfig.tooltip.formatter._expression;
                var def = exp.substring(exp.indexOf("{") + 1, exp.lastIndexOf("}"));
                // eslint-disable-next-line no-new-func
                highchartConfig.tooltip.formatter = new Function(def);
            }
        }
    },
    chatButton: {
        setZohoChatButtonZIndex: function(){
            setTimeout(function(){
                //var x = document.getElementById("zsiq_float");
                var x = document.querySelector('body > div.zsiq_custommain.siq_bR');
                //x.style.zIndex = "10 !important";
                if(x){ x.setAttribute('style', 'z-index: 10 !important'); }
            }, 15000)
        },
        getDriftButtonElement: function(){
            var x = document.querySelector('#root');
            return x;
        },
        hideDriftButton: function(){
            if(typeof drift === "undefined"){return;}
            qm.qmLog.debug("called hide drift");
            drift.on('ready',function(api){
                qm.qmLog.debug("hiding drift");
                api.widget.hide();
            })
        },
        showDriftButton: function(){
            if(typeof drift === "undefined"){
                qm.qmLog.error("drift not defined!");
                return;
            }
            qm.qmLog.debug("called show drift");
            drift.on('ready',function(api){
                qm.qmLog.debug("showing drift");
                api.widget.show();
            })
        },
        openDriftSidebar: function(){
            if(typeof drift === "undefined"){
                qm.qmLog.error("drift not defined!");
                return;
            }
            qm.qmLog.debug("called open drift");
            drift.on('ready',function(api){
                qm.qmLog.debug("open drift");
                api.sidebar.open(); // https://devdocs.drift.com/docs/conversation-sidebar
            })
        }
    },
    chrome: {
        multiplyScreenHeight: function (factor){
            if(typeof screen === "undefined"){return false;}
            return parseInt(factor * screen.height);
        },
        multiplyScreenWidth: function (factor){
            if(typeof screen === "undefined"){return false;}
            return parseInt(factor * screen.width);
        },
        allowFocusing: false,
        debugEnabled: true,
        chromeDebug: function(){
            function checkAlarm(){
                chrome.alarms.getAll(function(alarms){
                    console.log("all alarms", alarms);
                })
            }
            if(qm.chrome.debugEnabled){
                checkAlarm();
                chrome.windows.getLastFocused(function(window){
                    console.log("last focused", window);
                });
                chrome.windows.getAll(function(windows){
                    console.log("all windows", windows);
                });
                chrome.windows.getCurrent(function(window){
                    console.log("current window", window);
                });
            }
        },
        checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary: function(alarm){
            if(!qm.platform.isChromeExtension()){
                return;
            }
            window.qmLog.debug('showNotificationOrPopupForAlarm alarm: ', null, alarm);
            if(!qm.userHelper.withinAllowedNotificationTimes()){
                return false;
            }
            if(qm.notifications.getNumberInGlobalsOrLocalStorage()){
                qm.chrome.createSmallInboxNotification();
            }else{
                qm.notifications.refreshAndShowPopupIfNecessary();
            }
        },
        createSmallInboxNotification: function(){
            var notificationId = "inbox";
            chrome.notifications.create(notificationId, qm.chrome.windowParams.inboxNotificationParams, function(id){
            });
        },
        createSmallNotificationAndOpenInboxInBackground: function(){
            qm.chrome.createSmallInboxNotification();
            var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
            windowParams.focused = false;
            qm.chrome.openOrFocusChromePopupWindow(windowParams);
        },
        createPopup: function(windowParams){
            function createPopup(windowParams){
                windowParams.url = qm.api.addGlobalParams(windowParams.url);
                qmLog.info("creating popup window", null, windowParams);
                chrome.windows.create(windowParams, function(chromeWindow){
                    qm.storage.setItem('chromeWindowId', chromeWindow.id);
                    var focused = (qm.chrome.allowFocusing) ? windowParams.focused : false;
                    chrome.windows.update(chromeWindow.id, {focused: focused});
                });
            }
            if(windowParams.url.indexOf('.quantimo.do') !== -1 || windowParams.url.indexOf('popup.html') !== -1){
                qm.urlHelper.validateUrl(windowParams.url);
                createPopup(windowParams);
            }else{
                qm.client.getClientWebsiteUrl(function(fullWebsiteUrl){
                    //windowParams.url = fullWebsiteUrl + windowParams.url;
                    windowParams.url = qm.urlHelper.appendPathToUrl(fullWebsiteUrl, windowParams.url);
                    createPopup(windowParams);
                })
            }
        },
        canShowChromePopups: function(){
            if(typeof chrome === "undefined" || typeof chrome.windows === "undefined" || typeof chrome.windows.create === "undefined"){
                qmLog.info("Cannot show chrome popups");
                return false;
            }
            if(qm.getUser() && !qm.getUser().pushNotificationsEnabled){
                qmLog.info("User has disabled notifications");
                return false;
            }
            return true;
        },
        getChromeManifest: function(){
            if(qm.platform.isChromeExtension()){
                return chrome.runtime.getManifest();
            }
        },
        getWindowByIdAndFocusOrCreateNewPopup: function(chromeWindowId, windowParams){
            chrome.windows.get(chromeWindowId, function(chromeWindow){
                if(!chrome.runtime.lastError && chromeWindow){
                    if(windowParams.focused){
                        window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: Window already open. Focusing...', windowParams);
                        chrome.windows.update(chromeWindowId, {focused: qm.chrome.allowFocusing});
                    }else{
                        window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: Window already open. NOT focusing...', windowParams);
                    }
                }else{
                    window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: Window NOT already open. Creating one...', windowParams);
                    qm.chrome.createPopup(windowParams);
                }
            });
        },
        createPopupIfNoWindowIdInLocalStorage: function(windowParams){
            window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow checking if a window is already open.  new window params: ', null, windowParams);
            var chromeWindowId = parseInt(qm.storage.getItem(qm.items.chromeWindowId), null);
            if(!chromeWindowId){
                window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: No window id from localStorage. Creating one...', windowParams);
                qm.chrome.createPopup(windowParams);
                return false;
            }
            window.qmLog.info('qm.chrome.openOrFocusChromePopupWindow: window id from localStorage: ' + chromeWindowId, windowParams);
            return chromeWindowId;
        },
        getCurrentWindowAndFocusOrCreateNewPopup: function(windowParams){
            chrome.windows.getCurrent(function(window){
                console.log("current window", window);
                if(window && window.type === "popup"){
                    chrome.windows.update(window.id, {focused: qm.chrome.allowFocusing});
                }else{
                    qm.chrome.createPopup(windowParams);
                }
            });
        },
        getAllWindowsFocusOrCreateNewPopup: function(windowParams){
            qm.userHelper.getUserFromLocalStorageOrApi(function(user){
                if(!user.pushNotificationsEnabled){
                    qmLog.pushDebug("Not showing chrome popup because notifications are disabled");
                    return;
                }
                console.log("getAllWindowsFocusOrCreateNewPopup");
                chrome.windows.getAll(function(windows){
                    for(var i = 0; i < windows.length; i++){
                        var window = windows[i];
                        console.log("current window", window);
                        if(window.type === "popup"){
                            console.log("Focusing existing popup", window);
                            chrome.windows.update(window.id, {focused: qm.chrome.allowFocusing});
                            return;
                        }
                    }
                    qm.chrome.createPopup(windowParams);
                });
            });
        },
        handleNotificationClick: function(notificationId){
            window.qmLog.debug('onClicked: notificationId:' + notificationId);
            var focusWindow = true;
            if(!qm.platform.isChromeExtension()){
                return;
            }
            if(!notificationId){
                notificationId = null;
            }
            qm.chrome.updateChromeBadge(0);
            qmLog.info("notificationId: " + notificationId);
            /**
             * @return {boolean}
             */
            function IsJsonString(str){
                try{
                    JSON.parse(str);
                }catch (exception){
                    return false;
                }
                return true;
            }
            if(notificationId === "moodReportNotification"){
                qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.facesWindowParams);
            }else if(notificationId === "signin"){
                qm.chrome.openLoginWindow();
            }else if(notificationId && IsJsonString(notificationId)){
                qm.chrome.openMeasurementAddWindow(focusWindow, notificationId);
            }else{
                qm.chrome.openFullInbox(focusWindow, notificationId);
            }
            if(notificationId){
                chrome.notifications.clear(notificationId);
            }
        },
        initialize: function(){
            console.info("Initializing a chrome extension...");
            if(typeof screen !== "undefined"){
                qm.chrome.windowParams = {
                    introWindowParams: {
                        url: "index.html#/app/intro",
                        type: 'panel',
                        top: qm.chrome.multiplyScreenHeight(0.2),
                        left: qm.chrome.multiplyScreenWidth(0.4),
                        width: 450,
                        height: 750,
                        focused: qm.chrome.allowFocusing
                    },
                    facesWindowParams: {
                        url: "android_popup.html",
                        type: 'panel',
                        top: screen.height - 150,
                        left: screen.width - 380,
                        width: 390,
                        height: 110,
                        focused: qm.chrome.allowFocusing
                    },
                    fullInboxWindowParams: {
                        url: "index.html#/app/reminders-inbox",
                        type: 'panel',
                        top: screen.height - 800,
                        left: screen.width - 455,
                        width: 450,
                        height: 750
                    },
                    compactInboxWindowParams: {
                        url: "index.html#/app/reminders-inbox-compact",
                        type: 'panel',
                        top: screen.height - 360 - 30,
                        left: screen.width - 350,
                        width: 350,
                        height: 360
                    },
                    inboxNotificationParams: {
                        type: "basic",
                        title: "How are you?",
                        message: "Click to open reminder inbox",
                        iconUrl: "img/icons/icon_700.png",
                        priority: 2
                    },
                    signInNotificationParams: {
                        type: "basic",
                        title: "How are you?",
                        message: "Click to sign in and record a measurement",
                        iconUrl: "img/icons/icon_700.png",
                        priority: 2
                    },
                };
            }
            qm.qmLog.logLevel = "debug";
            //return;
            chrome.notifications.onClicked.addListener(function(notificationId){ // Called when the notification is clicked
                qm.chrome.handleNotificationClick(notificationId);
            });
            /** @namespace chrome.extension.onMessage */
            chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
                // Handles extension-specific requests that come in, such as a request to upload a new measurement
                window.qmLog.debug('Received request: ' + request.message, null);
                if(request.message === "uploadMeasurements"){
                    qm.api.postMeasurements(request.payload, null);
                }
            });
            chrome.runtime.onInstalled.addListener(function(){ // Called when the extension is installed
                qm.chrome.scheduleGenericChromeExtensionNotification();
                if(!localStorage.getItem(qm.items.introSeen)){
                    qm.chrome.openIntroWindowPopup();
                }
            });
            chrome.alarms.onAlarm.addListener(function(alarm){ // Called when an alarm goes off (we only have one)
                qmLog.info('onAlarm Listener heard this alarm ', null, alarm);
                qm.userHelper.getUserFromLocalStorageOrApi(function(){
                    qm.notifications.refreshIfEmptyOrStale(qm.chrome.showRatingOrInboxPopup());
                });
            });
            qm.userHelper.getUserFromLocalStorageOrApi(function(){
                qm.chrome.showRatingOrInboxPopup();
            }, function(){
                qm.chrome.showSignInNotification();
            });
        },
        openIntroWindowPopup: function(){
            qm.storage.setItem('introSeen', true);
            qm.chrome.createPopup(qm.chrome.windowParams.introWindowParams);
        },
        openOrFocusChromePopupWindow: function(windowParams){
            //qm.chrome.chromeDebug();
            if(!window.qm.chrome.canShowChromePopups()){
                return;
            }
            // var chromeWindowId = qm.chrome.createPopupIfNoWindowIdInLocalStorage(windowParams);
            // if(!chromeWindowId){return;}
            //qm.chrome.getCurrentWindowAndFocusOrCreateNewPopup(windowParams);
            qm.chrome.getAllWindowsFocusOrCreateNewPopup(windowParams);
            //qm.chrome.getWindowByIdAndFocusOrCreateNewPopup(chromeWindowId, windowParams);
        },
        openFullInbox: function(focusWindow, notificationId){
            var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
            if(focusWindow){
                windowParams.focused = true;
            }
            qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.fullInboxWindowParams);
            console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
        },
        openLoginWindow: function(){
            var windowParams = {
                type: 'panel',
                top: qm.chrome.multiplyScreenHeight(0.2),
                left: qm.chrome.multiplyScreenWidth(0.4),
                width: 450,
                height: 750,
                focused: qm.chrome.allowFocusing
            };
            windowParams.url = "https://web.quantimo.do/#/app/login?clientId="+qm.getClientId();
            windowParams.focused = true;
            qm.chrome.openOrFocusChromePopupWindow(windowParams);
        },
        openMeasurementAddWindow: function(focusWindow, notificationId){
            var windowParams = qm.chrome.windowParams.fullInboxWindowParams;
            if(focusWindow){
                windowParams.focused = true;
            }
            qm.chrome.windowParams.fullInboxWindowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
            qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.fullInboxWindowParams);
        },
        scheduleGenericChromeExtensionNotification: function(){
            var intervalInMinutes = parseInt(qm.storage.getItem(qm.items.notificationInterval) || "60");
            qmLog.info('scheduleGenericChromeExtensionNotification: Reminder notification interval is ' + intervalInMinutes + ' minutes');
            var alarmInfo = {periodInMinutes: intervalInMinutes};
            qmLog.info('scheduleGenericChromeExtensionNotification: clear genericTrackingReminderNotificationAlarm');
            chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
            qmLog.info('scheduleGenericChromeExtensionNotification: create genericTrackingReminderNotificationAlarm', null, alarmInfo);
            chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
            qmLog.info('Alarm set, every ' + intervalInMinutes + ' minutes');
        },
        scheduleChromeExtensionNotificationWithTrackingReminder: function(trackingReminder){
            var alarmInfo = {};
            alarmInfo.when = trackingReminder.nextReminderTimeEpochSeconds * 1000;
            alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
            var alarmName = qm.chrome.createChromeAlarmNameFromTrackingReminder(trackingReminder);
            alarmName = JSON.stringify(alarmName);
            chrome.alarms.getAll(function(alarms){
                var hasAlarm = alarms.some(function(oneAlarm){
                    return oneAlarm.name === alarmName;
                });
                if(hasAlarm){
                    qmLog.info(null, 'Already have an alarm for ' + alarmName, null);
                }
                if(!hasAlarm){
                    chrome.alarms.create(alarmName, alarmInfo);
                    qmLog.info(null, 'Created alarm for alarmName ' + alarmName, null, alarmInfo);
                }
            });
        },
        createChromeAlarmNameFromTrackingReminder: function(trackingReminder){
            return {
                trackingReminderId: trackingReminder.id,
                variableName: trackingReminder.variableName,
                defaultValue: trackingReminder.defaultValue,
                unitAbbreviatedName: trackingReminder.unitAbbreviatedName,
                periodInMinutes: trackingReminder.reminderFrequency / 60,
                reminderStartTime: trackingReminder.reminderStartTime,
                startTrackingDate: trackingReminder.startTrackingDate,
                variableCategoryName: trackingReminder.variableCategoryName,
                valence: trackingReminder.valence,
                reminderEndTime: trackingReminder.reminderEndTime
            };
        },
        showRatingOrInboxPopup: function(){
            qm.userHelper.getUserFromLocalStorageOrApi(function(user){
                if(!user.pushNotificationsEnabled){
                    qmLog.pushDebug("Not showing chrome popup because notifications are disabled");
                    return;
                }
                qm.notifications.refreshIfEmptyOrStale(function(){
                    if(!qm.notifications.getNumberInGlobalsOrLocalStorage()){
                        qmLog.info("No notifications not opening popup");
                        return false;
                    }
                    // if(qm.getUser().combineNotifications){
                    //     qm.chrome.createSmallInboxNotification();
                    //     return;
                    // }
                    window.trackingReminderNotification = window.qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
                    if(window.trackingReminderNotification){
                        qm.chrome.showRatingPopup(window.trackingReminderNotification);
                    }else if(qm.storage.getItem(qm.items.useSmallInbox)){
                        qmLog.info("No rating notifications so opening compactInboxWindow popup");
                        qm.chrome.openOrFocusChromePopupWindow(qm.chrome.windowParams.compactInboxWindowParams);
                    }else if(qm.notifications.getNumberInGlobalsOrLocalStorage()){
                        qmLog.info("Got an alarm so checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)");
                        qm.chrome.createSmallInboxNotification();
                    }
                }, function(err){
                    qmLog.error("Not showing popup because of notification refresh error: " + err);
                });
            });
        },
        showRatingPopup: function(trackingReminderNotification){
            qmLog.info("Opening rating notification popup");
            var getChromeRatingNotificationParams = function(trackingReminderNotification){
                if(!trackingReminderNotification){
                    trackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
                }
                return {
                    url: qm.notifications.getRatingNotificationPath(trackingReminderNotification),
                    type: 'panel',
                    top: screen.height - 150,
                    left: screen.width - 380,
                    width: 390,
                    height: 110,
                    focused: qm.chrome.allowFocusing
                };
            };
            if(trackingReminderNotification){
                window.trackingReminderNotification = trackingReminderNotification;
            }else{
                window.trackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
            }
            if(window.trackingReminderNotification){
                qm.getClientId(function(clientId){
                    qm.chrome.openOrFocusChromePopupWindow(getChromeRatingNotificationParams(window.trackingReminderNotification));
                });
            }
            window.qm.chrome.updateChromeBadge(0);
        },
        showSignInNotification: function(){
            if(!qm.platform.isChromeExtension()){
                return;
            }
            var notificationId = 'signin';
            chrome.notifications.create(notificationId, qm.chrome.windowParams.signInNotificationParams, function(id){
            });
        },
        updateChromeBadge: function(numberOfNotifications){
            var text = "";
            if(qm.platform.isChromeExtension() && typeof chrome.browserAction !== "undefined"){
                if(numberOfNotifications){
                    text = numberOfNotifications.toString();
                }
                if(numberOfNotifications > 9){
                    text = "?";
                }
                chrome.browserAction.setBadgeText({text: text});
            }
        }
    },
    client: {
        getClientWebsiteUrl: function(successHandler, partialPath){
            if(!partialPath){
                partialPath = '';
            }
            qm.api.getClientIdWithCallback(function(clientId){
                // TODO: Stop using quantimodo.quantimo.do for resource hosting on Github so we can point quantimodo.quantimo.do to Netlify
                if(clientId === 'quantimodo'){clientId = 'web';}
                var url = "https://" + clientId + ".quantimo.do/" + partialPath;
                url = qm.urlHelper.addUrlQueryParamsToUrlString({clientId: clientId}, url);
                successHandler(url)
            })
        }
    },
    connectorHelper: {
        getConnectorsFromApi: function(params, successCallback, errorHandler){
            qm.qmLog.info("Getting connectors from API...");
            function successHandler(response){
                var connectors = response.connectors || response;
                if(connectors && connectors.length && Array.isArray(connectors)){
                    qm.qmLog.info("Got connectors from API...");
                    qm.storage.setItem(qm.items.connectors, connectors);
                    if(successCallback){
                        successCallback(connectors);
                    }
                }else{
                    qm.qmLog.error("Could not get connectors from API...");
                }
            }
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.ConnectorsApi();
            function callback(error, data, response){
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getConnectorsFromApi');
            }
            params = qm.api.addGlobalParams(params);
            apiInstance.getConnectors(params, callback);
        },
        getConnectorsFromLocalStorage: function(){
            var connectors = qm.storage.getItem(qm.items.connectors);
            if(connectors && connectors.connectors && connectors.length && Array.isArray(connectors)){
                qm.storage.setItem(qm.items.connectors, connectors.connectors);
                return connectors.connectors;
            }
            if(!connectors || !connectors.length || !Array.isArray(connectors)){
                qm.qmLog.debug("Connectors from local storage is ", connectors);
                qm.connectorHelper.getConnectorsFromApi();
                return null;
            }
            return connectors;
        },
        getConnectorsFromLocalStorageOrApi: function(successHandler, errorHandler){
            var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
            if(connectors){
                if(successHandler){
                    successHandler(connectors);
                }
                return connectors;
            }
            if(qm.getUser()){
                qm.connectorHelper.getConnectorsFromApi({}, successHandler, errorHandler);
            }else{
                if(qm.staticData && qm.staticData.connectors){
                    if(successHandler){
                        successHandler(qm.staticData.connectors);
                    }
                    return qm.staticData.connectors;
                }else{
                    qm.qmLog.error("Could not get connectors from qm.staticData.connectors");
                    qm.connectorHelper.getConnectorsFromApi({}, successHandler, errorHandler);
                }
            }
        },
        filterConnectorsByName: function(name, connectors){
            var c = connectors.find(function(connector){
                return connector.name === name.toLowerCase();
            });
            if(!c){
                c = connectors.find(function(connector){
                    return connector.name.indexOf(name.toLowerCase()) !== -1;
                });
            }
            return c;
        },
        getConnectorByName: function(connectorName, successHandler, errorHandler){
            if(!successHandler){
                var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
                var c = qm.connectorHelper.filterConnectorsByName(connectorName, connectors);
                return c;
            }
            qm.connectorHelper.getConnectorsFromLocalStorageOrApi(function(connectors){
                if(!connectors){
                    qm.qmLog.error("No getConnectorsFromLocalStorageOrApi!");
                    if(errorHandler){
                        errorHandler("No getConnectorsFromLocalStorageOrApi!");
                    }
                    return;
                }
                var c = qm.connectorHelper.filterConnectorsByName(connectorName, connectors);
                if(c){
                    successHandler(c);
                }else{
                    qm.connectorHelper.getConnectorsFromApi({}, function(connectors){
                        c = qm.connectorHelper.filterConnectorsByName(connectorName, connectors);
                        successHandler(c);
                    }, errorHandler);
                }
            }, errorHandler)
        },
        getConnectorById: function(connectorId, successHandler, errorHandler){
            connectorId = parseInt(connectorId);
            if(!successHandler){
                var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
                if(!connectors){
                    return null;
                }
                return connectors.find(function(connector){
                    return connector.id === connectorId;
                });
            }
            qm.connectorHelper.getConnectorsFromLocalStorageOrApi(function(connectors){
                var c = connectors.find(function(connector){
                    return connector.id === connectorId;
                });
                successHandler(c);
            }, errorHandler);
        },
        storeConnectorResponse: function(response){
            function hideUnavailableConnectors(connectors){
                for(var i = 0; i < connectors.length; i++){
                    //if(connectors[i].name === 'facebook' && $rootScope.platform.isAndroid) {connectors[i].hide =
                    // true;}
                    if(connectors[i].spreadsheetUpload && qm.platform.isMobile()){
                        connectors[i].hide = true;
                    }
                }
                return response;
            }
            if(response.user){
                qm.userHelper.setUser(response.user);
            }
            var connectors = response.connectors || response;
            connectors = hideUnavailableConnectors(connectors);
            qm.storage.setItem(qm.items.connectors, connectors);
            return connectors;
        }
    },
    cookieHelper: {
        getCookie: function(name){
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if(parts.length == 2) return parts.pop().split(";").shift();
        },
        getGACookie: function(){
            return qm.cookieHelper.getCookie('_gid');
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
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.AnalyticsApi();
            function callback(error, data, response){
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getAggregatedCorrelationsFromApi');
            }
            apiInstance.getCorrelations(params, callback);
        },
        getUserCorrelationsFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            var cachedData = qm.api.cacheGet(params, qm.items.userCorrelations);
            if(cachedData && successHandler){
                successHandler(cachedData);
                return;
            }
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.AnalyticsApi();
            function callback(error, data, response){
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, qm.items.userCorrelations);
            }
            apiInstance.getCorrelations(params, callback);
        }
    },
    dialogFlow: {
        apiAi: null,
        apiAiPrepare: function(){
            qm.qmLog.info("apiAiPrepare...");
            var apiai = new Bravey.ApiAiAdapter("data/apiai", {language: "EN"});
            var entities = qm.staticData.dialogAgent.entities;
            qm.objectHelper.loopThroughProperties(entities, function(entityName, entity){
                apiai.loadEntity(entityName);
            });
            var intents = qm.staticData.dialogAgent.intents;
            qm.objectHelper.loopThroughProperties(intents, function(intentName, intent){
                if(intentName.indexOf("Knowledge") !== -1){
                    return;
                }
                apiai.loadIntent(intentName);
            });
            apiai.prepare(function(){
                qm.qmLog.info("apiAi NLP ready!");
                qm.apiAi = apiai;
            });
        },
        loopThroughIntents: function(callback){
            var intents = qm.staticData.dialogAgent.intents;
            qm.objectHelper.loopThroughProperties(intents, callback);
        },
        apiAiTest: function(text){
            if(!qm.apiAi){
                qm.qmLog.info("qm.apiAi not defined");
                return false;
            }
            var out = qm.apiAi.nlp.test(text);
            qm.qmLog.info("api ai: ", out);
            return out;
        },
        bravy: null,
        getBravy: function(){
            if(qm.dialogFlow.bravy){
                return qm.dialogFlow.bravy;
            }
            var bravy = new Bravey.Nlp.Fuzzy();
            var intents = qm.staticData.dialogAgent.intents;
            qm.objectHelper.loopThroughProperties(intents, function(intentName, intent){
                var dialogFlowIntentParameterEntities = intent.responses[0].parameters;
                var bravyIntentEntities = [];
                for(var i = 0; i < dialogFlowIntentParameterEntities.length; i++){
                    var dialogFlowIntentParameterEntity = dialogFlowIntentParameterEntities[i];
                    var bravyEntityName = dialogFlowIntentParameterEntity.dataType.replace("@sys.", "");
                    bravyEntityName = bravyEntityName.replace("@", "");
                    if(bravyEntityName === "variableName"){
                        continue;
                    }
                    bravyIntentEntities.push({entity: bravyEntityName, id: dialogFlowIntentParameterEntity.name});
                }
                qm.qmLog.debug("bravyIntentEntities", bravyIntentEntities);
                if(bravyIntentEntities.length){
                    bravy.addIntent(intentName, bravyIntentEntities);
                }
            });
            bravy.addEntity(new Bravey.NumberEntityRecognizer("number"));
            qm.qmLog.debug("Adding matches...");
            var entities = qm.staticData.dialogAgent.entities;
            qm.objectHelper.loopThroughProperties(entities, function(entityName, entity){
                if(entityName === "variableName"){
                    return;
                }
                qm.qmLog.debug("Adding sentences for " + entityName);
                var braveyEntity = new Bravey.StringEntityRecognizer(entityName);
                var entries = entity.entries;
                for(var i = 0; i < entries.length; i++){
                    var entry = entries[i];
                    try{
                        braveyEntity.addMatch(entry.value, entry.value);
                    }catch (error){
                        qm.qmLog.error(error);
                        continue;
                    }
                    var synonyms = entry.synonyms;
                    qm.qmLog.debug("Adding synonyms for " + entry.value);
                    for(var j = 0; j < synonyms.length; j++){
                        var synonym = synonyms[j];
                        qm.qmLog.debug("addMatch for " + synonym);
                        try{
                            braveyEntity.addMatch(entry.value, synonym);
                        }catch (error){
                            qm.qmLog.error(error);
                        }
                    }
                }
                qm.qmLog.debug("braveyEntity", braveyEntity);
                bravy.addEntity(braveyEntity);
            });
            qm.qmLog.debug("Adding sentences...");
            qm.objectHelper.loopThroughProperties(intents, function(intentName, intent){
                qm.qmLog.debug("Adding sentences for " + intentName);
                var userSaysSentences = intent.usersays;
                if(!userSaysSentences){
                    qm.qmLog.error("No userSaysSentences in " + intentName + ": ", intent);
                    return;
                }
                for(var i = 0; i < userSaysSentences.length; i++){
                    var userSaysWords = userSaysSentences[i].data;
                    var bravySentence = "";
                    for(var j = 0; j < userSaysWords.length; j++){
                        var userSaysWordData = userSaysWords[j];
                        if(!userSaysWordData.meta){
                            bravySentence += userSaysWordData.text;
                        }else{
                            var entityName = userSaysWordData.meta.replace("@sys.", "");
                            entityName = entityName.replace("@", "");
                            bravySentence += "{" + entityName + "}";
                        }
                    }
                    qm.qmLog.debug("bravySentence", bravySentence);
                    bravy.addDocument(bravySentence, intentName);
                }
            });
            qm.dialogFlow.bravy = bravy;
            qm.qmLog.debug("bravy", bravy);
            return bravy;
        },
        post: function(body, successHandler, errorHandler){
            qm.api.post("v1/dialogflow", body, function(response){
                qm.dialogFlow.lastApiResponse = response;
                successHandler(response);
            }, function(error){
                errorHandler(error);
            });
        },
        welcomeBody: {
            "responseId": "ab13a388-57f7-42a0-af43-868b2676ff9f",
            "queryResult": {
                "queryText": "GOOGLE_ASSISTANT_WELCOME",
                "action": "input.welcome",
                "parameters": {},
                "allRequiredParamsPresent": true,
                "fulfillmentText": "Oh. It's you. What do you desire?",
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                "Oh. It's you. What do you want?"
                            ]
                        }
                    }
                ],
                "outputContexts": [
                    {
                        "name": "projects/dr-modo/agent/sessions/1533757655027/contexts/google_assistant_welcome"
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533757655027/contexts/actions_capability_screen_output"
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533757655027/contexts/actions_capability_audio_output"
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533757655027/contexts/google_assistant_input_type_keyboard"
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533757655027/contexts/actions_capability_web_browser"
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533757655027/contexts/actions_capability_media_response_audio"
                    }
                ],
                "intent": {
                    "name": "projects/dr-modo/agent/intents/b69ed140-5dd7-4cf1-a5b7-f11f8d38bff0",
                    "displayName": "Default Welcome Intent"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en-us"
            },
            "originalDetectIntentRequest": {
                "source": "google",
                "version": "2",
                "payload": {
                    "isInSandbox": true,
                    "surface": {
                        "capabilities": [
                            {
                                "name": "actions.capability.AUDIO_OUTPUT"
                            },
                            {
                                "name": "actions.capability.SCREEN_OUTPUT"
                            },
                            {
                                "name": "actions.capability.MEDIA_RESPONSE_AUDIO"
                            },
                            {
                                "name": "actions.capability.WEB_BROWSER"
                            }
                        ]
                    },
                    "requestType": "SIMULATOR",
                    "inputs": [
                        {
                            "rawInputs": [
                                {
                                    "query": "Talk to Dr. Modo",
                                    "inputType": "KEYBOARD"
                                }
                            ],
                            "intent": "actions.intent.MAIN"
                        }
                    ],
                    "user": {
                        "lastSeen": "2018-08-07T16:26:13Z",
                        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhMzNiNWVkYjQ5ZDA4NjdhODY3MmQ5NTczYjFlMGQyMzc1ODg2ZTEifQ.eyJhdWQiOiI5MTg3NjEzMjU0OTEtazJ0Y3VkbGg5ZHEyMjdtb2RrMWhnbmlvMDR1aGhvNWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTg0NDQ2OTMxODQ4Mjk1NTUzNjIiLCJoZCI6InRoaW5rYnludW1iZXJzLm9yZyIsImVtYWlsIjoibUB0aGlua2J5bnVtYmVycy5vcmciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZXhwIjoxNTMzNzYxMjU1LCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJqdGkiOiJlODFlY2Q4YTA5NmVhOGQ0YmVmOTk0YWMwYTVjZjlmZDczMjBkMTU4IiwiaWF0IjoxNTMzNzU3NjU1LCJuYmYiOjE1MzM3NTczNTUsIm5hbWUiOiJNaWtlIFNpbm4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDYuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1CSHI0aHlVV3FaVS9BQUFBQUFBQUFBSS9BQUFBQUFBSUcyOC8yTHYwZW43MzhJSS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiTWlrZSIsImZhbWlseV9uYW1lIjoiU2lubiJ9.qzSwaFXvQiPeKRAX4iCN1hbZMnwRucXF_bgHGxvHL_kJVyeOtjxNBXI8OdJsG1JTrO5J7wSRowbIMpaWdfREjxL6mh_J6nCsF7Q6iIOscCUlfvbHs7Qhqo_nutEXJxrObUFUUMVGvGFXvhkql0kawsgr_YVlCFc7iD4zJC9ljyCOjBJbe3rZBvoQwkOk_4shnRKL0OShHezrfQR4uUHR2etNQwMDva3JZzB9kXGndKYZgbQr1221s6Yklza1VSy0BuIFGQOHZsM5ig5EeQ7PQ7EfQ3gIT2O6u1O0rPQ42j7YNqrXZ2OT4ZRE6x0v4r4QEq8qAZkRqqaeNH7ab4pySA",
                        "locale": "en-US",
                        "userId": "ABwppHHxfsyj2umsF4FaFTEIOzSDJf2jDveTQtBP5CJH-KLJYugjxHPpR_uRxBLovyUADcMpHA"
                    },
                    "conversation": {
                        "conversationId": "1533757655027",
                        "type": "NEW"
                    },
                    "availableSurfaces": [
                        {
                            "capabilities": [
                                {
                                    "name": "actions.capability.AUDIO_OUTPUT"
                                },
                                {
                                    "name": "actions.capability.SCREEN_OUTPUT"
                                },
                                {
                                    "name": "actions.capability.WEB_BROWSER"
                                }
                            ]
                        }
                    ]
                }
            },
            "session": "projects/dr-modo/agent/sessions/1533757655027"
        },
        lastApiResponse: {
            "payload": {
                "google": {
                    "expectUserResponse": true,
                    "richResponse": {
                        "items": [
                            {
                                "simpleResponse": {
                                    "ssml": "<speak> How severe is your stomach cramps on a scale of 1 to 5?<\/speak>",
                                    "displayText": " How severe is your stomach cramps on a scale of 1 to 5?"
                                }
                            }
                        ]
                    },
                    "systemIntent": {
                        "intent": "actions.intent.OPTION",
                        "data": {
                            "@type": "type.googleapis.com\/google.actions.v2.OptionValueSpec",
                            "listSelect": {
                                "title": "How severe is your stomach cramps on a scale of 1 to 5?",
                                "items": [
                                    {
                                        "optionInfo": {
                                            "key": "1\/5-button",
                                            "synonyms": []
                                        },
                                        "title": "1\/5"
                                    },
                                    {
                                        "optionInfo": {
                                            "key": "2\/5-button",
                                            "synonyms": []
                                        },
                                        "title": "2\/5"
                                    },
                                    {
                                        "optionInfo": {
                                            "key": "3\/5-button",
                                            "synonyms": []
                                        },
                                        "title": "3\/5"
                                    },
                                    {
                                        "optionInfo": {
                                            "key": "5\/5-button",
                                            "synonyms": []
                                        },
                                        "title": "5\/5"
                                    },
                                    {
                                        "optionInfo": {
                                            "key": "4\/5-button",
                                            "synonyms": []
                                        },
                                        "title": "4\/5"
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            "outputContexts": [
                {
                    "name": "projects\/dr-modo\/agent\/sessions\/1533759866859\/contexts\/tracking_reminder_notification",
                    "lifespanCount": 5,
                    "parameters": {
                        "variableName": "Stomach Cramps",
                        "trackingReminderNotificationId": 29901440,
                        "unitName": "1 to 5 Rating"
                    }
                }
            ]
        },
        postNotificationResponse: function(value, successHandler, errorHandler){
            if(!qm.dialogFlow.lastApiResponse.outputContexts){
                qm.qmLog.error("No outputContexts!");
                return false;
            }
            var outputContext = qm.dialogFlow.lastApiResponse.outputContexts[0];
            if(!outputContext.parameters){
                qm.qmLog.error("No parameters!");
                return false;
            }
            outputContext.parameters.value = value;
            qm.dialogFlow.notificationResponseBody.queryResult.outputContexts = [outputContext];
            qm.dialogFlow.post(qm.dialogFlow.notificationResponseBody, successHandler, errorHandler);
        },
        notificationResponseBody: {
            "responseId": "eec8a67e-114c-4bd8-8026-c6de0154b7e6",
            "queryResult": {
                "queryText": "actions_intent_OPTION",
                "action": "tracking_reminder_notification",
                "parameters": {
                    "notificationAction": "track",
                    "value": "",
                    "yesNo": ""
                },
                "allRequiredParamsPresent": true,
                "fulfillmentMessages": [
                    {
                        "text": {
                            "text": [
                                ""
                            ]
                        }
                    }
                ],
                "outputContexts": [
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/google_assistant_input_type_touch",
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "notificationAction.original": "",
                            "value": "",
                            "yesNo.original": ""
                        }
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/actions_intent_option",
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "notificationAction.original": "",
                            "OPTION": "1/5-button",
                            "value": "",
                            "yesNo.original": ""
                        }
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/actions_capability_screen_output",
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "notificationAction.original": "",
                            "value": "",
                            "yesNo.original": ""
                        }
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/actions_capability_audio_output",
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "notificationAction.original": "",
                            "value": "",
                            "yesNo.original": ""
                        }
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/tracking_reminder_notification",
                        "lifespanCount": 2,
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "variableName": "Hand Pain",
                            "unitName": "1 to 5 Rating",
                            "trackingReminderNotificationId": 29901441,
                            "notificationAction.original": "",
                            "value": "",
                            "yesNo.original": ""
                        }
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/actions_capability_media_response_audio",
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "notificationAction.original": "",
                            "value": "",
                            "yesNo.original": ""
                        }
                    },
                    {
                        "name": "projects/dr-modo/agent/sessions/1533759866859/contexts/actions_capability_web_browser",
                        "parameters": {
                            "yesNo": "",
                            "notificationAction": "track",
                            "value.original": "",
                            "notificationAction.original": "",
                            "value": "",
                            "yesNo.original": ""
                        }
                    }
                ],
                "intent": {
                    "name": "projects/dr-modo/agent/intents/921bbe0e-6f16-490c-b243-1743081bb25d",
                    "displayName": "Tracking Reminder Notification Intent"
                },
                "intentDetectionConfidence": 1,
                "languageCode": "en-us"
            },
            "originalDetectIntentRequest": {
                "source": "google",
                "version": "2",
                "payload": {
                    "isInSandbox": true,
                    "surface": {
                        "capabilities": [
                            {
                                "name": "actions.capability.MEDIA_RESPONSE_AUDIO"
                            },
                            {
                                "name": "actions.capability.WEB_BROWSER"
                            },
                            {
                                "name": "actions.capability.AUDIO_OUTPUT"
                            },
                            {
                                "name": "actions.capability.SCREEN_OUTPUT"
                            }
                        ]
                    },
                    "requestType": "SIMULATOR",
                    "inputs": [
                        {
                            "rawInputs": [
                                {
                                    "query": "1/5",
                                    "inputType": "TOUCH"
                                }
                            ],
                            "arguments": [
                                {
                                    "textValue": "1/5-button",
                                    "name": "OPTION"
                                }
                            ],
                            "intent": "actions.intent.OPTION"
                        }
                    ],
                    "user": {
                        "lastSeen": "2018-08-08T20:22:25Z",
                        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhMzNiNWVkYjQ5ZDA4NjdhODY3MmQ5NTczYjFlMGQyMzc1ODg2ZTEifQ.eyJhdWQiOiI5MTg3NjEzMjU0OTEtazJ0Y3VkbGg5ZHEyMjdtb2RrMWhnbmlvMDR1aGhvNWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTg0NDQ2OTMxODQ4Mjk1NTUzNjIiLCJoZCI6InRoaW5rYnludW1iZXJzLm9yZyIsImVtYWlsIjoibUB0aGlua2J5bnVtYmVycy5vcmciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZXhwIjoxNTMzNzYzODk5LCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJqdGkiOiI0NTNhYTgzNDMwOTlmNzRjODMzZjdjY2RkZTA1ODViMjVjN2NjOTkwIiwiaWF0IjoxNTMzNzYwMjk5LCJuYmYiOjE1MzM3NTk5OTksIm5hbWUiOiJNaWtlIFNpbm4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDYuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1CSHI0aHlVV3FaVS9BQUFBQUFBQUFBSS9BQUFBQUFBSUcyOC8yTHYwZW43MzhJSS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiTWlrZSIsImZhbWlseV9uYW1lIjoiU2lubiJ9.Tl8oQIoNlou3p2Yy4a2MaxEJMftKn1ovDFfzgV8MkMFoqEGDkoNvGNbmJyDKGfS6B1kZwY7wBNuDTguKEpR9lTE6lj2Q4oQA4BzgLp_tYN8gohijJJDw3knwJ1q_A4KRfy7wBvV5xjI1nF74Q1wkpgDfmU275tjqp-xiuiHVEqMyp0gliCuD8eAZvgX_CpmjPxubqKi6f9mXW5wfp-z-1YfujQ2eT0XCMEOWFWddtr8-_Jm2_z_K_ua5LXHw5bU8S2ym0IqPkF4Kqa6GYJOSWrjmiC_pnBALpD4ME9wNOvTnNkp3ntfKtKE_HLz2v4LqrOPMDu0p0_BLOMqrUxclbg",
                        "locale": "en-US",
                        "userId": "ABwppHHxfsyj2umsF4FaFTEIOzSDJf2jDveTQtBP5CJH-KLJYugjxHPpR_uRxBLovyUADcMpHA"
                    },
                    "conversation": {
                        "conversationId": "1533759866859",
                        "type": "ACTIVE",
                        "conversationToken": "[\"tracking_reminder_notification\"]"
                    },
                    "availableSurfaces": [
                        {
                            "capabilities": [
                                {
                                    "name": "actions.capability.WEB_BROWSER"
                                },
                                {
                                    "name": "actions.capability.AUDIO_OUTPUT"
                                },
                                {
                                    "name": "actions.capability.SCREEN_OUTPUT"
                                }
                            ]
                        }
                    ]
                }
            },
            "session": "projects/dr-modo/agent/sessions/1533759866859"
        },
        getUnfilledParameter: function(intent){
            var param = false;
            qm.objectHelper.loopThroughProperties(intent.unfilledParameters, function(parameterName, parameter){
                param = parameter;
            });
            return param;
        },
        calculateScoreAndFillParameters: function(intent, matchedEntities, userInput){
            //qm.functionHelper.checkTypes( arguments, ['string'] );
            qm.qmLog.info("userInput: "+userInput);
            if(!userInput){
                qm.qmLog.error("No userInput given to calculateScoreAndFillParameters");
                return false;
            }
            var doc = nlp(userInput);
            if(!doc){
                qm.qmLog.error("Maybe nlp package isn't available?  qm.nlp("+userInput+") returns "+JSON.stringify(doc));
                return false;
            }
            if(typeof doc.out !== "function"){
                qm.qmLog.error("Maybe nlp package isn't available? typeof doc.out !== function! qm.nlp("+userInput+") returns "+JSON.stringify(doc));
                return false;
            }
            var parsed = doc.out('tags');
            var number = doc.values().out();
            if(number){
                number = parseFloat(number);
            }
            qm.qmLog.info(intent.name + " tags: ", parsed);
            var parameters = intent.responses[0].parameters;
            intent.unfilledParameters = {};
            intent.unfilledTriggerPhrases = {};
            intent.parameters = {};
            if(intent.name === "Remember Intent"){
                console.log("Remember Intent");
            }
            //if(qm.feed.currentCard){intent.parameters = qm.feed.currentCard.parameters;}
            for(var i = 0; i < parameters.length; i++){
                var parameter = parameters[i];
                var parameterName = parameter.name;
                var dataType = parameter.dataType.replace('@', '');
                if(dataType === 'sys.number'){
                    if(number !== null && number !== false){
                        intent.parameters[parameterName] = number;
                    }
                    continue;
                }
                if(matchedEntities[dataType]){
                    var value = matchedEntities[dataType].matchedEntryValue;
                    if(typeof value === "undefined"){
                        value = matchedEntities[dataType];
                    }
                    intent.parameters[parameterName] = value
                }else if(parameter.required){
                    intent.unfilledParameters[parameterName] = parameter;
                    if(parameterName.toLowerCase().indexOf('triggerphrase') !== -1){
                        intent.unfilledTriggerPhrases[parameterName] = parameter;
                    }
                }
            }
            var filled = Object.keys(intent.parameters).length;
            var unfilled = Object.keys(intent.unfilledParameters).length;
            var unfilledTriggerPhrases = Object.keys(intent.unfilledTriggerPhrases).length;
            return filled - unfilled - unfilledTriggerPhrases;
        },
        matchedEntities: {},
        matchedIntents: {},
        matchedIntent: null,
        getCommandOrTriggerPhraseEntity: function(userInput, matchedEntities){
            matchedEntities = matchedEntities || qm.dialogFlow.getEntitiesFromUserInput(userInput);
            var triggerEntity = false;
            qm.objectHelper.loopThroughProperties(matchedEntities, function(entityName, entity){
                if(entityName.indexOf("Command") !== -1){
                    triggerEntity = entity;
                }
            });
            qm.objectHelper.loopThroughProperties(matchedEntities, function(entityName, entity){
                if(entityName.indexOf("TriggerPhrase") !== -1){
                    triggerEntity = entity;
                }
            });
            return triggerEntity;
        },
        getIntentMatchingCommandOrTriggerPhrase: function(userInput, matchedEntities){
            var entity = qm.dialogFlow.getCommandOrTriggerPhraseEntity(userInput, matchedEntities);
            if(!entity){
                return false;
            }
            var matchedIntent = false;
            qm.dialogFlow.loopThroughIntents(function(intentName, intent){
                var parameters = intent.responses[0].parameters;
                for(var i = 0; i < parameters.length; i++){
                    var parameter = parameters[i];
                    if(parameter.name === entity.name){
                        matchedIntent = intent;
                    }
                }
            });
            return matchedIntent;
        },
        getIntent: function(userInput){
            qm.functionHelper.checkTypes( arguments, ['string'] );
            if(!userInput){
                qm.qmLog.error("No userInput given to userInput");
                return false;
            }
            var matchedEntities = qm.dialogFlow.getEntitiesFromUserInput(userInput);
            var matchedIntent = qm.dialogFlow.getIntentMatchingCommandOrTriggerPhrase(userInput, matchedEntities);
            if(matchedIntent){
                qm.dialogFlow.calculateScoreAndFillParameters(matchedIntent, matchedEntities, userInput);
            }else{
                var bestScore = 0;
                qm.dialogFlow.loopThroughIntents(function(intentName, intent){
                    var score = intent.score = qm.dialogFlow.calculateScoreAndFillParameters(intent, matchedEntities, userInput);
                    if(!matchedIntent || score > bestScore){
                        matchedIntent = intent;
                        bestScore = score;
                    }
                });
                if(matchedIntent){
                    matchedIntent.parameters = matchedEntities.parameters || {};
                }
            }
            if(matchedIntent){
                matchedIntent.parameters.userInput = userInput;
            }
            return matchedIntent || qm.dialogFlow.matchedIntent;
        },
        getEntities: function(){
            return qm.staticData.dialogAgent.entities;
        },
        getQuestionFromUserInput: function(userInput){
            var interrogativeWords = ['who', 'what', 'where', 'when', 'why'];
            var question = false;
            for(var i = 0; i < interrogativeWords.length; i++){
                var interrogativeWord = interrogativeWords[i];
                var index = userInput.indexOf(interrogativeWord) !== -1;
                if(index !== -1){
                    question = userInput.substr(index, userInput.length);
                }
            }
            return question;
        },
        getEntitiesFromUserInput: function(userInput){
            var entities = qm.dialogFlow.getEntities();
            userInput = userInput.toLowerCase();
            var matchedEntities = {};
            qm.objectHelper.loopThroughProperties(entities, function(entityName, entity){
                var entries = entity.entries;
                if(entityName === 'rememberCommand'){
                    console.log("");
                }
                for(var i = 0; i < entries.length; i++){
                    var entry = entries[i];
                    var entryValue = entry.value;
                    var synonyms = entry.synonyms;
                    if(synonyms.indexOf("\"") !== -1){
                        synonyms = synonyms.split("\"");
                    }
                    for(var j = 0; j < synonyms.length; j++){
                        var synonym = synonyms[j].toLowerCase();
                        synonym = synonym.replace('\"', '');
                        if(qm.stringHelper.sentenceContainsWord(userInput, synonym)){
                            entity.matchedEntryValue = entryValue;
                            matchedEntities[entityName] = entity;
                        }
                    }
                }
            });
            qm.qmLog.logProperties("matchedEntities", matchedEntities);
            return matchedEntities;
        },
        intentFulfillment: {
            "Cancel Intent": function(data){
                qm.speech.talkRobot("OK. I love you! Bye!");
                qm.mic.setMicEnabled(false);
            },
            "Create Phrase Intent": function(data){
                qm.speech.talkRobot("OK. I love you! Bye!");
                qm.mic.setMicEnabled(false);
            },
            "Remember Intent": function(data){
            }
        }
    },
    feed: {
        currentCard: null,
        getMostRecentCard: function(successHandler, errorHandler){
            qm.feed.getFeedFromLocalForageOrApi({}, function(feedCards){
                if(!feedCards){
                    qm.qmLog.error("No FeedFromLocalForageOrApi!");
                    if(errorHandler){errorHandler();}
                    return;
                }
                var currentCard = feedCards.shift();
                qm.feed.saveFeedInLocalForage(feedCards, function(){
                    successHandler(currentCard);
                }, errorHandler);
            }, errorHandler);
        },
        getFeedApiInstance: function(params){
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.FeedApi();
            // apiInstance.cache = !params || !params.noCache; Should be done in qm.api.configureClient
            return apiInstance;
        },
        getFeedFromLocalForage: function(successHandler, errorHandler){
            qm.localForage.getItem(qm.items.feed, successHandler, errorHandler);
        },
        getFeedFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            var cacheKey = 'getFeed';
            if(!qm.api.configureClient(cacheKey, errorHandler, params)){
                return false;
            }
            function callback(error, data, response){
                var cards = qm.feed.handleFeedResponse(data);
                qm.api.generalResponseHandler(error, cards, response, successHandler, errorHandler, params, cacheKey);
            }
            qm.feed.postFeedQueue(null, function(cards){
                successHandler(cards);
            }, function(error){
                qm.qmLog.error(error);
                qm.feed.getFeedApiInstance(params).getFeed(params, callback);
            });
        },
        handleFeedResponse: function(data){
            var cards;
            if(!data){
                qm.qmLog.error("No feed data returned!");
            }else{
                cards = data.cards;
                qm.feed.saveFeedInLocalForage(cards, function(){
                    qm.qmLog.info("saveFeedInLocalForage completed!");
                }, function(error){
                    qm.qmLog.error(error);
                });
            }
            return cards;
        },
        saveFeedInLocalForage: function(feedCards, successHandler, errorHandler){
            qm.localForage.setItem(qm.items.feed, feedCards, successHandler, errorHandler);
        },
        getFeedFromLocalForageOrApi: function(params, successHandler, errorHandler){
            qm.localForage.getItem(qm.items.feed, function(cards){
                if(cards && cards.length){
                    successHandler(cards);
                    return;
                }
                qm.feed.getFeedFromApi(params, successHandler, errorHandler);
            }, function(error){
                qm.qmLog.error(error);
                qm.feed.getFeedFromApi(params, successHandler, errorHandler);
            });
        },
        deleteCardFromLocalForage: function(submittedCard, successHandler, errorHandler){
            qm.localForage.deleteById(qm.items.feed, submittedCard.id, successHandler, errorHandler);
        },
        deleteCardFromFeedQueue: function(submittedCard, successHandler, errorHandler){
            qm.localForage.deleteById(qm.items.feedQueue, submittedCard.id, successHandler, errorHandler);
        },
        addToFeedAndRemoveFromFeedQueue: function(submittedCard, successHandler, errorHandler){
            qm.localForage.addToArray(qm.items.feed, submittedCard, function(feedCards){
                qm.feed.deleteCardFromFeedQueue(submittedCard, function(remainingCards){
                    if(successHandler){
                        successHandler(feedCards);
                    }
                }, errorHandler);
            }, errorHandler);
        },
        postFeedQueue: function(feedQueue, successHandler, errorHandler){
            function post(feedQueue){
                qm.localForage.removeItem(qm.items.feedQueue, function(){
                    qm.feed.postToFeedEndpointImmediately(feedQueue, successHandler, errorHandler);
                }, function(error){
                    qm.qmLog.error(error);
                });
            }
            if(feedQueue){
                post(feedQueue);
                return;
            }
            qm.localForage.getItem(qm.items.feedQueue, function(feedQueue){
                post(feedQueue);
            }, errorHandler);
        },
        postCardImmediately: function(card, successHandler, errorHandler){
            qm.feed.addToFeedQueueAndRemoveFromFeed(card, function(nextCard){
                qm.feed.postToFeedEndpointImmediately(null, successHandler, errorHandler);
            }, errorHandler);
        },
        postToFeedEndpointImmediately: function(feedQueue, successHandler, errorHandler){
            var params = qm.api.addGlobalParams({});
            var cacheKey = 'postFeed';
            if(!qm.api.configureClient(cacheKey, errorHandler, params)){
                return false;
            }
            function callback(error, data, response){
                var cards = qm.feed.handleFeedResponse(data);
                if(error){
                    qm.qmLog.error("Putting back in queue because of error ", error);
                    feedQueue = qm.feed.fixFeedQueue(feedQueue);
                    qm.localForage.addToArray(qm.items.feedQueue, feedQueue);
                }
                qm.api.generalResponseHandler(error, cards, response, successHandler, errorHandler, params, cacheKey);
            }
            if(feedQueue){
                qm.feed.getFeedApiInstance(params).postFeed(feedQueue, params, callback);
            }else{
                qm.localForage.removeItem(qm.items.feedQueue, function(feedQueue){
                    qm.feed.getFeedApiInstance(params).postFeed(feedQueue || [], params, callback);
                })
            }
        },
        fixFeedQueue: function(parameters){
            if(parameters && parameters[0] && qm.arrayHelper.variableIsArray(parameters[0])){
                qm.qmLog.error("feedQueue is fucked up");
                var array = parameters.shift();
                parameters.concat(array);
            }
            return parameters;
        },
        addToFeedQueueAndRemoveFromFeed: function(submittedCard, successHandler, errorHandler){
            qm.feed.recentlyRespondedTo[submittedCard.id] = submittedCard;
            var parameters = submittedCard.parameters;
            if(submittedCard.selectedButton){
                parameters = qm.objectHelper.copyPropertiesFromOneObjectToAnother(submittedCard.selectedButton.parameters,
                    parameters, false);
            }
            if(!parameters){
                var error = "No submittedCard provided to addToFeedQueueAndRemoveFromFeed!";
                if(errorHandler){
                    errorHandler(error);
                }
                qm.qmLog.error(error);
                return;
            }
            qm.localForage.addToArray(qm.items.feedQueue, parameters, function(feedQueue){
                qm.feed.getFeedFromLocalForage(function(remainingCards){
                    remainingCards = remainingCards.filter(function(card){
                        return card.id !== submittedCard.id;
                    });
                    qm.feed.saveFeedInLocalForage(remainingCards, function(){
                        if(successHandler){
                            successHandler(remainingCards[0]);
                        }
                        var minimumRequiredForPost = 5;
                        if(feedQueue.length > minimumRequiredForPost || remainingCards.length < 3){
                            qm.feed.postFeedQueue(feedQueue);
                        }
                    });
                }, errorHandler);
            }, errorHandler);
        },
        getUnfilledInputFields: function(card){
            var unfilledFields = false;
            var inputFields = card.inputFields;
            if(inputFields){
                var required = inputFields.filter(function(inputField){
                    return inputField.required;
                });
                if(required){
                    unfilledFields = inputFields.filter(function(inputField){
                        return inputField.value === null;
                    });
                    if(unfilledFields && unfilledFields.length){
                        qm.speech.currentInputField = unfilledFields[0];
                    }else{
                        qm.qmLog.info("No input fields to fill!");
                        return false;
                    }
                }
            }
            return unfilledFields;
        },
        readCard: function(card, successHandler, errorHandler, sayOptions){
            if(!card){
                card = qm.feed.currentCard;
            }
            qm.feed.currentCard = card;
            var listen = true;
            var message = '';
            if(card.title && card.title.length > message.length){
                message = card.title;
            }
            if(card.headerTitle && card.headerTitle.length > message.length){
                message = card.headerTitle;
            }
            if(card.subTitle && card.subTitle.length > message.length){
                message = card.subTitle;
            }
            if(card.subHeader && card.subHeader.length > message.length){
                message = card.subHeader;
            }
            if(card.content){
                if(!message || !message.length && card.content){
                    message = card.content;
                }
            }
            if(card.htmlContent){
                if(!message || !message.length){
                    message = qm.stringHelper.stripHtmlTags(card.htmlContent);
                }
            }
            var unfilledFields = qm.feed.getUnfilledInputFields(card);
            if(unfilledFields && unfilledFields.length){
                message = unfilledFields[0].helpText;
                if(sayOptions){
                    //message += " " + qm.feed.getAvailableCommandsSentence();
                    message += unfilledFields[0].hint;
                }
            }
            qm.speech.talkRobot(message, function(){
                qm.mic.listenForCardResponse(card, successHandler, errorHandler)
            }, function(error){
                qm.qmLog.info(error);
            }, listen);
        },
        getAvailableButtons: function(includeActionSheet){
            var card = qm.feed.currentCard;
            var buttons = card.buttons || [];
            if(includeActionSheet && card.actionSheetButtons){
                buttons = buttons.concat(card.actionSheetButtons);
            }
            return buttons;
        },
        getAvailableCommandsSentence: function(){
            var buttons = qm.feed.getAvailableButtons(false);
            var options = 'You can say ';
            for(var i = 0; i < buttons.length; i++){
                var button = buttons[i];
                var text = button.title || button.text;
                if(button.parameters && button.parameters.modifiedValue){
                    text = button.parameters.modifiedValue;
                }
                options += text + ", "
            }
            var inputField = qm.speech.currentInputField;
            if(!inputField){
                qm.qmLog.info("No inputField!");
            }else{
                options += " or a " + inputField.type.replace('_', ' ');
                if(inputField.minValue !== null && inputField.maxValue !== null){
                    options += " between " + inputField.minValue + " and " + inputField.maxValue;
                }else if(inputField.minValue !== null){
                    options += " above " + inputField.minValue;
                }else if(inputField.maxValue !== null){
                    options += " below " + inputField.maxValue;
                }
            }
            return options + '.  ';
        },
        sayAvailableCommands: function(){
            var options = qm.feed.getAvailableCommandsSentence();
            qm.speech.talkRobot(options);
        },
        getButtonMatchingPhrase: function(possiblePhrases){
            if(!qm.arrayHelper.variableIsArray(possiblePhrases)){
                possiblePhrases = [possiblePhrases];
            }
            for(var i = 0; i < possiblePhrases.length; i++){
                var tag = possiblePhrases[i];
                tag = nlp(tag).normalize().out();
                var buttons = qm.feed.getAvailableButtons(true);
                var selectedButton = buttons.find(function(button){
                    if(button.text && button.text.toLowerCase() === tag){
                        return true;
                    }
                    if(button.title && button.title.toLowerCase() === tag){
                        return true;
                    }
                    if(button.accessibilityText && button.accessibilityText.toLowerCase() === tag){
                        return true;
                    }
                    if(button.action && button.action.toLowerCase() === tag){
                        return true;
                    }
                    var propertyWithMatchingValue = qm.objectHelper.getKeyWhereValueEqualsProvidedString(tag, button.parameters);
                    return !!propertyWithMatchingValue;
                });
                if(selectedButton){
                    return selectedButton;
                }
            }
            return false;
        },
        recentlyRespondedTo: {},
        undoFunction: function(){
            qm.qmLog.error("Undo function not defined!");
        }
    },
    fileHelper: {
        writeToFileWithCallback: function(filePath, stringContents, callback){
            if(!stringContents){
                throw filePath + " stringContents not provided to writeToFileWithCallback";
            }
            qm.qmLog.info("Writing to " + filePath);
            if(typeof stringContents !== "string"){
                stringContents = JSON.stringify(stringContents);
            }
            return qm.fs.writeFile(filePath, stringContents, callback);
        },
        outputFileContents: function(path){
            qm.qmLog.info(path + ": " + qm.fs.readFileSync(path));
        },
        cleanFiles: function(filesArray){
            qm.qmLog.info("Cleaning " + JSON.stringify(filesArray) + '...');
            return qm.gulp.src(filesArray, {read: false}).pipe(qm.clean());
        },
        writeToFile: function(filePath, stringContents){
            filePath = './' + filePath;
            qm.qmLog.info("Writing to " + filePath);
            if(typeof stringContents !== "string"){
                stringContents = qm.stringHelper.prettyJSONStringify(stringContents);
            }
            return qm.fs.writeFileSync(filePath, stringContents);
        },
        copyFiles: function(sourceFiles, destinationPath, excludedFolder){
            console.log("Copying " + sourceFiles + " to " + destinationPath);
            var srcArray = [sourceFiles];
            if(excludedFolder){
                console.log("Excluding " + excludedFolder + " from copy.. ");
                srcArray.push('!' + excludedFolder);
                srcArray.push('!' + excludedFolder + '/**');
            }
            return qm.gulp.src(srcArray)
                .pipe(qm.gulp.dest(destinationPath));
        }
    },
    functionHelper: {
        getCurrentFunctionNameDoesNotWork: function(){
            var functionName = arguments.callee.toString();
            functionName = functionName.substr('function '.length);
            functionName = functionName.substr(0, functionName.indexOf('('));
            return functionName;
        },
        isFunction: function(functionToCheck){
            return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
        },
        checkTypes: function( args, types ) {
            function typeOf( obj ) {
                return ({}).toString.call( obj ).match(/\s(\w+)/)[1].toLowerCase();
            }
            args = [].slice.call( args );
            for ( var i = 0; i < types.length; ++i ) {
                var type = typeOf( args[i] );
                if ( types[i] && type != types[i] ) {
                    var message = 'param '+ i +' must be of type '+ types[i] + " but is "+type;
                    if(qm.appMode.isProduction()){
                        qm.qmLog.error(message);
                    } else {
                        throw new TypeError(message);
                    }
                }
            }
        }
    },
    geoLocation: {
        getFoursqureClientId: function(){
            if(qm.privateConfig && qm.privateConfig.FOURSQUARE_CLIENT_ID){/** @namespace qm.privateConfig.FOURSQUARE_CLIENT_ID */
                return qm.privateConfig.FOURSQUARE_CLIENT_ID;
            }
            var appSettings = qm.getAppSettings();
            if(appSettings && appSettings.privateConfig && appSettings.privateConfig.FOURSQUARE_CLIENT_ID){
                return appSettings.privateConfig.FOURSQUARE_CLIENT_ID;
            }
            var connector = qm.connectorHelper.getConnectorByName('foursquare');
            if(connector){
                return connector.connectorClientId;
            }
        },
        getFoursquareClientSecret: function(){
            /** @namespace qm.privateConfig.FOURSQUARE_CLIENT_SECRET */
            if(qm.privateConfig && qm.privateConfig.FOURSQUARE_CLIENT_SECRET){
                return qm.privateConfig.FOURSQUARE_CLIENT_SECRET;
            }
            var appSettings = qm.getAppSettings();
            if(appSettings && appSettings.privateConfig && appSettings.privateConfig.FOURSQUARE_CLIENT_SECRET){
                return appSettings.privateConfig.FOURSQUARE_CLIENT_SECRET;
            }
            var connector = qm.connectorHelper.getConnectorByName('foursquare');
            if(connector){/** @namespace connector.connectorClientSecret */
                return connector.connectorClientSecret;
            }
        },
        getGoogleMapsApiKey: function(){
            /** @namespace qm.privateConfig.GOOGLE_MAPS_API_KEY */
            if(qm.privateConfig && qm.privateConfig.GOOGLE_MAPS_API_KEY){
                return qm.privateConfig.GOOGLE_MAPS_API_KEY;
            }
            var appSettings = qm.getAppSettings();
            if(appSettings && appSettings.privateConfig && appSettings.privateConfig.GOOGLE_MAPS_API_KEY){
                return appSettings.privateConfig.GOOGLE_MAPS_API_KEY;
            }
        }
    },
    getAppSettings: function(successHandler, errorHandler){
        if(!successHandler){
            var appSettings = qm.appsManager.getAppSettingsFromMemory();
            if(appSettings){
                return appSettings;
            }
            qm.qmLog.debug("No app settings and no successHandler!"); // qm.qmLog here causes infinite loop
            return null;
        }
        qm.appsManager.getAppSettingsLocallyOrFromApi(successHandler, errorHandler);
    },
    getClientId: function(successHandler){
        if(!successHandler){
            return qm.api.getClientId();
        }else{
            qm.api.getClientIdWithCallback(successHandler)
        }
    },
    getPrimaryOutcomeVariable: function(){
        var appSettings = qm.getAppSettings();
        if(appSettings && appSettings.primaryOutcomeVariableDetails){
            return appSettings.primaryOutcomeVariableDetails;
        }
        var variables = {
            "Overall Mood": {
                "id": 1398,
                "name": "Overall Mood",
                "variableName": "Overall Mood",
                variableCategoryName: "Mood",
                "userUnitAbbreviatedName": "/5",
                unitAbbreviatedName: "/5",
                "combinationOperation": "MEAN",
                "valence": "positive",
                "unitName": "1 to 5 Rating",
                "ratingOptionLabels": ["Depressed", "Sad", "OK", "Happy", "Ecstatic"],
                "ratingValueToTextConversionDataSet": {1: "depressed", 2: "sad", 3: "ok", 4: "happy", 5: "ecstatic"},
                "ratingTextToValueConversionDataSet": {"depressed": 1, "sad": 2, "ok": 3, "happy": 4, "ecstatic": 5},
                trackingQuestion: "How are you?",
                averageText: "Your average mood is "
            },
            "Energy Rating": {
                id: 108092,
                name: "Energy Rating",
                variableName: "Energy Rating",
                variableCategoryName: "Emotions",
                unitAbbreviatedName: "/5",
                combinationOperation: "MEAN",
                positiveOrNegative: 'positive',
                unitName: '1 to 5 Rating',
                ratingOptionLabels: ['1', '2', '3', '4', '5'],
                ratingValueToTextConversionDataSet: {1: "1", 2: "2", 3: "3", 4: "4", 5: "5"},
                ratingTextToValueConversionDataSet: {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5},
                trackingQuestion: "How is your energy level right now?",
                averageText: "Your average energy level is "
            }
        };
        if(appSettings && appSettings.primaryOutcomeVariableName){
            return variables[appSettings.primaryOutcomeVariableName];
        }
        return variables['Overall Mood'];
    },
    getPrimaryOutcomeVariableByNumber: function(num){
        return qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] ? qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] : false;
    },
    getSourceName: function(){
        var appSettings = qm.appsManager.getAppSettingsFromMemory();
        if(!appSettings){return null;}
        return appSettings.appDisplayName + " for " + qm.platform.getCurrentPlatform();
    },
    getUser: function(successHandler, errorHandler){
        if(!successHandler){
            return qm.userHelper.getUserFromLocalStorage();
        }
        qm.userHelper.getUserFromLocalStorageOrApi(successHandler, errorHandler);
    },
    gitHelper: {
        branchName: null,
        getBranchName: function(){
            if(qm.gitHelper.branchName || !qm.appMode.isBackEnd()){
                return qm.gitHelper.branchName;
            }
            return process.env.CIRCLE_BRANCH || process.env.BUDDYBUILD_BRANCH || process.env.TRAVIS_BRANCH || process.env.GIT_BRANCH;
        },
        isMaster: function(){
            return qm.gitHelper.getBranchName() === "master";
        },
        isDevelop: function(){
            return qm.gitHelper.getBranchName() === "develop";
        },
        isFeature: function(){
            return qm.gitHelper.getBranchName().indexOf("feature") !== -1;
        },
        getCurrentGitCommitSha: function(){
            // noinspection JSUnresolvedVariable
            if(qm.appMode.isBackEnd() && process.env.SOURCE_VERSION){
                // noinspection JSUnresolvedVariable
                return process.env.SOURCE_VERSION;
            }
            try{
                return require('child_process').execSync('git rev-parse HEAD').toString().trim();
            }catch (error){
                qm.qmLog.info(error);
            }
        },
        getCommitMessage: function(callback){
            var commandForGit = 'git log -1 HEAD --pretty=format:%s';
            qm.nodeHelper.execute(commandForGit, function(error, output){
                var commitMessage = output.trim();
                qm.qmLog.info("Commit: " + commitMessage);
                if(callback){
                    callback(commitMessage);
                }
            });
        },
        outputCommitMessageAndBranch: function(){
            qm.gitHelper.getCommitMessage(function(commitMessage){
                qm.gitHelper.setBranchName(function(branchName){
                    qm.qmLog.info("===== Building " + commitMessage + " on " + branchName + " =====");
                });
            });
        },
        setBranchName: function(callback){
            function setBranch(branch, callback){
                qm.gitHelper.branchName = branch.replace('origin/', '');
                qm.qmLog.info('current git branch: ' + qm.gitHelper.branchName);
                if(callback){
                    callback(qm.gitHelper.branchName);
                }
            }
            if(qm.gitHelper.branchName){
                setBranch(qm.gitHelper.branchName, callback);
                return;
            }
            try{
                qm.git.revParse({args: '--abbrev-ref HEAD'}, function(err, branch){
                    if(err){
                        qm.qmLog.error(err);
                        return;
                    }
                    setBranch(branch, callback);
                });
            }catch (e){
                qm.qmLog.info("Could not set branch name because " + e.message);
            }
        },
        getReleaseStage: function(){
            if(!process.env.HOSTNAME){
                return "local";
            }
            if(process.env.HOSTNAME.indexOf("local") !== -1){
                return "local";
            }
            if(process.env.HOSTNAME.indexOf("staging") !== -1){
                return "staging";
            }
            if(process.env.HOSTNAME.indexOf("app") !== -1){
                return "production";
            }
            if(process.env.HOSTNAME.indexOf("production") !== -1){
                return "production";
            }
            qm.qmLog.error("Could not determine release stage!");
        },
        releaseStage: {
            isProduction: function(){
                return qm.gitHelper.getReleaseStage() === "production";
            },
            isStaging: function(){
                return qm.gitHelper.getReleaseStage() === "staging";
            }
        },
        createStatusToCommit: function(statusOptions, callback){
            qm.github.createStatusToCommit(statusOptions, qm.gitHelper.getGithubOptions(), callback);
        },
        getGithubOptions: function(){
            var options = {
                // Required options: git_token, git_repo
                // refer to https://help.github.com/articles/creating-an-access-token-for-command-line-use/
                git_token: process.env.GITHUB_ACCESS_TOKEN,
                // comment into this repo, this pr.
                git_repo: 'QuantiModo/quantimodo-android-chrome-ios-web-app',
                //git_prid: '1',
                // create status to this commit, optional
                git_sha: qm.gitHelper.getCurrentGitCommitSha(),
                jshint_status: 'error',       // Set status to error when jshint errors, optional
                jscs_status: 'failure',       // Set git status to failure when jscs errors, optional
                eslint_status: 'error',       // Set git status to error when eslint errors, optional
                // when using github enterprise, optional
                git_option: {
                    // refer to https://www.npmjs.com/package/github for more options
                    //host: 'github.mycorp.com',
                    // You may require this when you using Enterprise Github
                    //pathPrefix: '/api/v3'
                },
                // Provide your own jshint reporter, optional
                jshint_reporter: function(E, file){ // gulp stream file object
                    // refer to http://jshint.com/docs/reporters/ for E structure.
                    return 'Error in ' + E.file + '!';
                },
                // Provide your own jscs reporter, optional
                jscs_reporter: function(E, file){ // gulp stream file object
                    // refer to https://github.com/jscs-dev/node-jscs/wiki/Error-Filters for E structure.
                    return 'Error in ' + E.filename + '!';
                }
            };
            return options;
        }
    },
    globalHelper: {
        setStudy: function(study){
            if(study.id){
                qm.storage.setGlobal(study.id, study);
                return;
            }
            if(!study.causeVariable){
                qm.qmLog.error("No cause variable in this study: ", study, study);
                return;
            }
            var causeVariableName = study.causeVariableName || study.causeVariable.name;
            var effectVariableName = study.effectVariableName || study.effectVariable.name;
            qm.storage.setGlobal(qm.stringHelper.removeSpecialCharacters(causeVariableName + "_" + effectVariableName), study);
        },
        getStudy: function(params){
            if(params.studyId){
                return qm.storage.getGlobal(params.studyId);
            }
            var study = qm.storage.getGlobal(qm.stringHelper.removeSpecialCharacters(params.causeVariableName + "_" + params.effectVariableName));
            return study;
        },
        setItem: function(key, value){
            if(!qm.storage.valueIsValid(value, key)){
                return false;
            }
            qm.storage.setGlobal(key, value);
        },
        getItem: function(key){
            return qm.storage.getGlobal(key);
        },
        removeItem: function(key){
            qm.qmLog.debug("Removing " + key + " from globals");
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
                    textContent: qm.variableCategoryHelper.findVariableCategory('Location').moreInfo
                },
                minimumAllowedValue: {
                    title: "Minimum Allowed Value",
                    textContent: "The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.",
                },
                maximumAllowedValue: {
                    title: "Maximum Allowed Value",
                    textContent: "The maximum allowed value for measurements.  While you can record a value above this maximum, it will be excluded from the correlation analysis.",
                },
                onsetDelayInHours: {
                    title: "Onset Delay",
                    unitName: "Hours",
                    textContent: "An outcome is always preceded by the predictor or stimulus. The amount of time that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the “onset delay”.  For example, the “onset delay” between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
                },
                onsetDelay: {
                    title: "Onset Delay",
                    unitName: "Seconds",
                    textContent: "An outcome is always preceded by the predictor or stimulus. The amount of time that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the “onset delay”.  For example, the “onset delay” between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
                },
                durationOfActionInHours: {
                    title: "Duration of Action",
                    unitName: "Hours",
                    textContent: "The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable’s value. For instance, aspirin typically decreases headache severity for approximately four hours (duration of action) following the onset delay.",
                },
                durationOfAction: {
                    title: "Duration of Action",
                    unitName: "Seconds",
                    textContent: "The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable’s value. For instance, aspirin typically decreases headache severity for approximately four hours (duration of action) following the onset delay.",
                },
                fillingValue: {
                    title: "Filling Value",
                    textContent: "When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.",
                },
                combinationOperation: {
                    title: "Combination Method",
                    textContent: "How multiple measurements are combined over time.  We use the average (or mean) for things like your weight.  Summing is used for things like number of apples eaten.",
                },
                defaultValue: {
                    title: "Default Value",
                    textContent: "If specified, there will be a button that allows you to quickly record this value.",
                },
                experimentStartTime: {
                    title: "Analysis Start Date",
                    textContent: "Data prior to this date will not be used in analysis.",
                },
                experimentEndTime: {
                    title: "Analysis End Date",
                    textContent: "Data after this date will not be used in analysis.",
                },
                thumbs: {
                    title: "Help Me Learn",
                    textContent: "I'm really good at finding correlations and even compensating for various onset delays and durations of action. " +
                        "However, you're much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. " +
                        "You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you don't think could possibly be causal.",
                },
                primaryOutcomeVariable: {
                    title: "Primary Outcome Variable",
                    textContent: "A good primary outcome variable is something that you want to improve and that changes inexplicably. "+
                        "For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, "+
                        "these would be good candidates for primary outcome variables.  Recording their severity and potential factors "+
                        "will help you identify hidden factors exacerbating or improving them. ",
                }
            };
            return explanations;
        },
        getExplanation: function(parameterOrPropertyName, modelName, callback){
            var explanations = qm.help.getExplanations();
            if(explanations[parameterOrPropertyName]){
                return callback(explanations[parameterOrPropertyName]);
            }
            if(modelName){
                qm.apiHelper.getPropertyDescription(modelName, parameterOrPropertyName, callback)
            }else{
                qm.apiHelper.getParameterDescription(parameterOrPropertyName, callback)
            }
        },
        goToHelpSite: function(){
            qm.urlHelper.goToUrl("https://help.quantimo.do")
        },
        openDrift: function(){
            if(typeof drift === "undefined"){
                qm.qmLog.error("drift not defined!");
                qm.help.goToHelpSite();
            } else {
                qm.chatButton.openDriftSidebar();
            }
        }
    },
    imageHelper: {
        replaceOldCategoryImages: function(str){
            str = qm.stringHelper.str_replace([
                'maxcdn.icons8.com/Color/PNG/96/Business',
                'maxcdn.icons8.com/Color/PNG/96/Cinema',
                'maxcdn.icons8.com/Color/PNG/96/Finance',
                'maxcdn.icons8.com/Color/PNG/96/Food',
                'maxcdn.icons8.com/Color/PNG/96/Healthcare',
                'maxcdn.icons8.com/Color/PNG/96/Household',
                'maxcdn.icons8.com/Color/PNG/96/Maps',
                'maxcdn.icons8.com/Color/PNG/96/Messaging',
                'maxcdn.icons8.com/Color/PNG/96/Music',
                'maxcdn.icons8.com/Color/PNG/96/Printing',
                'maxcdn.icons8.com/Color/PNG/96/Programming',
                'maxcdn.icons8.com/Color/PNG/96/Sports',
                'maxcdn.icons8.com/Color/PNG/96/Users',
                'maxcdn.icons8.com/Color/PNG/96/Weather',
            ], 'static.quantimo.do/img/variable_categories', str);
            return str;
        }
    },
    integration: {
        getIntegrationJsWithoutClientId: function(clientId, callback){
            qm.api.configureClient(arguments.callee.name);
            var apiInstance = new qm.Quantimodo.ConnectorsApi();
            apiInstance.getIntegrationJs({clientId: 'CLIENT_ID'}, function(error, data, response){
                if(data){
                    qm.integration.integrationJs = data;
                    if(clientId && callback){
                        callback(qm.integration.integrationJs.replace('CLIENT_ID', clientId));
                    }
                }
                qm.api.responseHandler(error, data, response);
            });
        }
    },
    items: {
        accessToken: 'accessToken',
        afterLoginGoToUrl: 'afterLoginGoToUrl',
        afterLoginGoToState: 'afterLoginGoToState',
        appList: 'appList',
        aggregatedCorrelations: 'aggregatedCorrelations',
        apiUrl: 'apiUrl',
        appSettings: 'appSettings',
        appSettingsRevisions: 'appSettingsRevisions',
        authorizedClients: 'authorizedClients',
        builderClientId: 'builderClientId',
        chromeWindowId: 'chromeWindowId',
        clientId: 'clientId',
        commonVariables: 'commonVariables',
        connectors: 'connectors',
        defaultHelpCards: 'defaultHelpCards',
        deviceTokenOnServer: 'deviceTokenOnServer',
        deviceTokenToSync: 'deviceTokenToSync',
        drawOverAppsPopupEnabled: 'drawOverAppsPopupEnabled',
        expiresAtMilliseconds: 'expiresAtMilliseconds',
        feed: 'feed',
        feedQueue: 'feedQueue',
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
        lastStudy: 'lastStudy',
        lastPopupNotificationUnixTimeSeconds: 'lastPopupNotificationUnixTimeSeconds',
        lastPushTimestamp: 'lastPushTimestamp',
        lastPushData: 'lastPushData',
        logLevel: 'logLevel',
        measurementsQueue: 'measurementsQueue',
        memories: 'memories',
        mostFrequentReminderIntervalInSeconds: 'mostFrequentReminderIntervalInSeconds',
        micEnabled: 'micEnabled',
        micAvailable: 'micAvailable',
        notificationInterval: 'notificationInterval',
        notificationsSyncQueue: 'notificationsSyncQueue',
        onboarded: 'onboarded',
        patientUser: 'patientUser',
        pushLog: 'pushLog',
        physicianUser: 'physicianUser',
        privateConfig: 'privateConfig',
        primaryOutcomeVariableMeasurements: 'primaryOutcomeVariableMeasurements',
        refreshToken: 'refreshToken',
        scheduledLocalNotifications: 'scheduledLocalNotifications',
        speechEnabled: 'speechEnabled',
        speechAvailable: 'speechAvailable',
        studiesCreated: 'studiesCreated',
        studiesJoined: 'studiesJoined',
        thoughts: 'thoughts',
        trackingReminderNotifications: 'trackingReminderNotifications',
        trackingReminderNotificationSyncScheduled: 'trackingReminderNotificationSyncScheduled',
        trackingReminders: 'trackingReminders',
        trackingReminderSyncQueue: 'trackingReminderSyncQueue',
        user: 'user',
        useSmallInbox: 'useSmallInbox',
        userCorrelations: 'userCorrelations',
        userVariables: 'userVariables',
        variableCategories: 'variableCategories',
        lastUrl: 'lastUrl'
    },
    loaders: {
        robots: function(){
            var tm = new TimelineMax({repeat: -1, repeatDelay: 2})
                //.to('#redBot',2,{x:500,ease:Power3.easeInOut},'+=2')
                .fromTo('#blueBot', 2, {x: 0}, {x: 0, ease: Power3.easeInOut}, '-=1.5')
                //.to('body',2,{backgroundColor:'#FFDC6D'},'-=2')
                .to('#blueBot', 2, {x: 0, onStart: newBot, ease: Power3.easeInOut}, '+=2');
            function newBot(){
                TweenMax.fromTo('#redBot', 2, {x: -1000}, {x: 0, delay: .65, ease: Power3.easeInOut});
                TweenMax.to('body', 2, {backgroundColor: '#ADBD90', delay: .65})
            }
            // /////////////////////////////////////////////////////////////
            var sig = new TimelineMax({repeat: -1});
            sig.fromTo('#redBotSignal', .5, {drawSVG: "0% 15%", ease: Linear.easeInOut}, {
                drawSVG: "85% 100%",
                ease: Linear.easeInOut
            })
                .fromTo('#redBotSignal', .5, {drawSVG: "85% 100%", ease: Linear.easeInOut}, {
                    drawSVG: "0% 15%",
                    ease: Linear.easeInOut
                });
            var bolt = new TweenMax.to(['#bolt', '#leftEar', '#rightEar', '#nose'], .5, {
                opacity: .25,
                onComplete: function(){
                    bolt.reverse()
                },
                onReverseComplete: function(){
                    bolt.play()
                }
            });
            var rhb = new TweenMax.to('#redHeart', .5, {
                scale: 1.1,
                transformOrigin: '50% 50%',
                ease: Power2.easeInOut,
                onComplete: function(){
                    rhb.reverse()
                },
                onReverseComplete: function(){
                    rhb.play()
                }
            });
            var sra = new TweenMax.to('#redRightArm', .5, {
                rotation: -3,
                ease: Linear.easeInOut,
                transformOrigin: '45% 25%',
                onComplete: function(){
                    sra.reverse()
                },
                onReverseComplete: function(){
                    sra.play()
                }
            });
            var sla = new TweenMax.to('#redLeftArm', .5, {
                rotation: 3,
                ease: Linear.easeInOut,
                transformOrigin: '25% 25%',
                onComplete: function(){
                    sla.reverse()
                },
                onReverseComplete: function(){
                    sla.play()
                }
            });
            var redhead = new TweenMax.to('#redHead', 1, {
                y: 5, ease: Power2.easeInOut, onComplete: function(){
                    redhead.reverse()
                }, onReverseComplete: function(){
                    redhead.play()
                }
            });
            // ////////////////////////////////////////////////////
            var lights1 = new TweenMax.staggerFromTo(['#light3', '#light6'], .5, {fill: '#fff'}, {
                fill: '#398080',
                repeat: -1
            }, 0.2);
            var lights2 = new TweenMax.staggerFromTo(['#light2', '#light5'], .5, {fill: '#398080'}, {
                fill: '#E20717',
                repeat: -1
            }, 0.2);
            var lights3 = new TweenMax.staggerFromTo(['#light1', '#light4'], .5, {fill: '#E20717'}, {
                fill: '#fffff',
                repeat: -1
            }, 0.2);
            var eeg = new TweenMax.fromTo('#pulse', 2, {drawSVG: "0%", ease: Linear.easeInOut}, {
                drawSVG: "100%",
                ease: Linear.easeInOut,
                repeat: -1
            });
            var static_RENAMED_BECAUSE_RESERVED = new TweenMax.fromTo('#blueBotStatic', .75, {
                ease: Power1.easeInOut,
                opacity: 0
            }, {ease: Power1.easeInOut, opacity: 1, repeat: -1});
            var blueBotRArm = new TweenMax.to('#blueBotRightArm', .5, {
                rotation: -3,
                y: 2,
                ease: Linear.easeInOut,
                transformOrigin: '65% 100%',
                onComplete: function(){
                    blueBotRArm.reverse()
                },
                onReverseComplete: function(){
                    blueBotRArm.play()
                }
            });
            var blueBotLArm = new TweenMax.to('#blueBotLeftArm', .5, {
                rotation: 3,
                y: 2,
                ease: Linear.easeInOut,
                transformOrigin: '100% 65%',
                onComplete: function(){
                    blueBotLArm.reverse()
                },
                onReverseComplete: function(){
                    blueBotLArm.play()
                }
            });
            var dial = new TweenMax.to('#dial', .5, {
                rotation: 30,
                ease: Linear.easeInOut,
                transformOrigin: '50% 100%',
                onComplete: function(){
                    dial.reverse()
                },
                onReverseComplete: function(){
                    dial.play()
                }
            });
            var blueBotBody = new TweenMax.to('#blueBotBody', .5, {
                y: 2, ease: Sine.easeInOut, onComplete: function(){
                    blueBotBody.reverse()
                }, onReverseComplete: function(){
                    blueBotBody.play()
                }
            });
            var blueBotHead = new TweenMax.to('#blueBotHead', .5, {
                y: -2, ease: Sine.easeInOut, onComplete: function(){
                    blueBotHead.reverse()
                }, onReverseComplete: function(){
                    blueBotHead.play()
                }
            });
            var mouthBars = new TweenMax.staggerFromTo('#mouthBars rect', .5, {fill: '#398080'}, {
                fill: '#fffff',
                repeat: -1
            }, 0.2);
            var eyes = new TweenMax.to('#blueBotEyes', .5, {
                scale: 1.1,
                transformOrigin: '50% 50%',
                ease: Sine.easeInOut,
                onComplete: function(){
                    eyes.reverse()
                },
                onReverseComplete: function(){
                    eyes.play()
                }
            })
        }
    },
    localForage: {
        clear: function(){
            if(qm.platform.isBackEnd()){
                return false;
            }
            qm.qmLog.info("Clearing localforage!");
            localforage.clear();
        },
        saveWithUniqueId: function(key, arrayToSave, successHandler, errorHandler){
            if(!qm.arrayHelper.variableIsArray(arrayToSave)){
                arrayToSave = [arrayToSave];
            }
            if(!arrayToSave || !arrayToSave.length){
                qm.qmLog.error("Noting provided to saveWithUniqueId for " + key);
                if(successHandler){
                    successHandler();
                }
            }
            qm.qmLog.info("saving " + key + " with unique id");
            qm.localForage.getItem(key, function(existingData){
                if(!existingData){
                    existingData = [];
                }
                for(var i = 0; i < arrayToSave.length; i++){
                    var newObjectToSave = arrayToSave[i];
                    //newObjectToSave.lastSelectedAt = qm.timeHelper.getUnixTimestampInSeconds(); // Can't do this her because we do this for all API results we ever get
                    existingData = existingData.filter(function(obj){
                        return obj.id !== newObjectToSave.id;
                    });
                    existingData.unshift(newObjectToSave);
                }
                qm.localForage.setItem(key, existingData, successHandler, errorHandler);
            });
        },
        deleteById: function(key, id, successHandler, errorHandler){
            qm.qmLog.info("deleting " + key + " by id " + id);
            qm.localForage.getItem(key, function(existingData){
                if(!existingData){
                    existingData = [];
                }
                existingData = existingData.filter(function(obj){
                    return obj.id !== id;
                });
                qm.localForage.setItem(key, existingData, successHandler, errorHandler);
            });
        },
        searchByProperty: function(key, propertyName, searchTerm, successHandler, errorHandler){
            searchTerm = searchTerm.toLowerCase();
            qm.qmLog.info("searching " + key + " by " + propertyName + " " + searchTerm);
            qm.localForage.getItem(key, function(existingData){
                if(!existingData){
                    existingData = [];
                }
                existingData = existingData.filter(function(obj){
                    var currentValue = obj[propertyName].toLowerCase();
                    return currentValue.indexOf(searchTerm) !== -1;
                });
                successHandler(existingData);
            }, errorHandler);
        },
        getItem: function(key, successHandler, errorHandler){
            if(!successHandler){
                qm.qmLog.error("No successHandler provided to localForage.getItem!");
                return;
            }
            qm.qmLog.debug("Getting " + key + " from globals");
            var fromGlobals = qm.globalHelper.getItem(key);
            if(fromGlobals || fromGlobals === false || fromGlobals === 0){
                successHandler(fromGlobals);
                return fromGlobals;
            }
            if(qm.platform.isBackEnd()){
                if(successHandler){
                    successHandler(fromGlobals);
                }
                return fromGlobals;
            }
            if(typeof localforage === "undefined"){
                var error = "localforage not defined so can't get " + key + "!";
                qm.qmLog.error(error);
                if(errorHandler){
                    errorHandler(error);
                }
                return;
            }
            qm.qmLog.debug("Getting " + key + " from localforage");
            localforage.getItem(key, function(err, data){
                if(err){
                    qm.qmLog.error(err);
                    if(errorHandler){
                        errorHandler(err);
                    }
                }else{
                    successHandler(data);
                }
            })
        },
        setItem: function(key, value, successHandler, errorHandler){
            if(!qm.storage.valueIsValid(value, key)){
                return false;
            }
            value = JSON.parse(JSON.stringify(value)); // Failed to execute 'put' on 'IDBObjectStore': could not be cloned.
            qm.globalHelper.setItem(key, value);
            if(qm.platform.isBackEnd()){
                if(successHandler){
                    successHandler(value);
                }
                return value;
            }
            if(typeof localforage === "undefined"){
                var errorMessage = "local storage is undefined so can't set " + key;
                qm.qmLog.error(errorMessage);
                if(errorHandler){
                    errorHandler(errorMessage);
                }
                return;
            }
            if(!qm.storage.valueIsValid(value, key)){
                return false;
            }
            if(qm.pouch.enabled){
                qm.pouch.getDb().upsert(key, function(doc){
                    return value;
                }).then(function(res){
                    qm.qmLog.info(res); // success, res is {rev: '1-xxx', updated: true, id: 'myDocId'}
                }).catch(function(err){
                    qm.qmLog.error(err);
                });
            }
            localforage.setItem(key, value, function(err){
                if(err){
                    if(errorHandler){
                        errorHandler(err);
                    }
                }else{
                    if(successHandler){
                        successHandler(value);
                    }
                }
            })
        },
        removeItem: function(key, successHandler, errorHandler){
            qm.globalHelper.removeItem(key);
            if(qm.platform.isBackEnd()){
                if(successHandler){
                    successHandler();
                }
                return;
            }
            qm.localForage.getItem(key, function(data){
                localforage.removeItem(key, function(err){
                    if(err){
                        if(errorHandler){
                            errorHandler(err);
                        }
                    }else{
                        if(successHandler){
                            successHandler(data);
                        }
                    }
                })
            });
        },
        getWithFilters: function(localStorageItemName, successHandler, errorHandler, filterPropertyName, filterPropertyValue,
                                 lessThanPropertyName, lessThanPropertyValue,
                                 greaterThanPropertyName, greaterThanPropertyValue){
            qm.localForage.getItem(localStorageItemName, function(data){
                data = qm.arrayHelper.filterByPropertyOrSize(data, filterPropertyName, filterPropertyValue,
                    lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
                successHandler(data);
            }, function(error){
                if(errorHandler){
                    errorHandler(error);
                }
            });
        },
        getElementsWithRequestParams: function(localStorageItemName, params, successHandler, errorHandler){
            qm.localForage.getItem(localStorageItemName, function(unfiltered){
                if(!unfiltered){
                    successHandler(unfiltered);
                    return;
                }
                var filtered = qm.arrayHelper.filterByRequestParams(unfiltered, params);
                if(!filtered && qm.appMode.isTesting()){
                    filtered = qm.arrayHelper.filterByRequestParams(unfiltered, params);
                    qm.qmLog.info("Nothing after filter");
                }
                successHandler(filtered);
            }, function(error){
                if(errorHandler){
                    errorHandler(error);
                }
            });
        },
        addToOrReplaceByIdAndMoveToFront: function(localStorageItemName, replacementElementArray, successHandler){
            qm.qmLog.debug('qm.localForage.addToOrReplaceByIdAndMoveToFront in ' + localStorageItemName + ': ' +
                JSON.stringify(replacementElementArray).substring(0, 20) + '...');
            // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
            qm.localForage.getItem(localStorageItemName, function(localStorageItemArray){
                var elementsToKeep = qm.arrayHelper.addToOrReplaceByIdAndMoveToFront(localStorageItemArray, replacementElementArray, localStorageItemName);
                qm.localForage.setItem(localStorageItemName, elementsToKeep);
                if(successHandler){
                    successHandler(elementsToKeep);
                }
            }, function(error){
                qm.qmLog.error(error)
            });
        },
        addToArray: function(localStorageItemName, newElementsArray, successHandler, errorHandler){
            if(!qm.arrayHelper.variableIsArray(newElementsArray)){
                newElementsArray = [newElementsArray];
            }
            qm.qmLog.debug('adding to ' + localStorageItemName + ': ' + JSON.stringify(newElementsArray).substring(0, 20) + '...');
            qm.localForage.getItem(localStorageItemName, function(localStorageItemArray){
                localStorageItemArray = localStorageItemArray || [];
                localStorageItemArray = newElementsArray.concat(localStorageItemArray);
                localStorageItemArray = localStorageItemArray.filter(function(element){
                    return element !== null;
                });
                qm.localForage.setItem(localStorageItemName, localStorageItemArray, function(){
                    qm.qmLog.info("addToArray in LocalForage " + localStorageItemName + " completed!");
                    if(successHandler){
                        successHandler(localStorageItemArray);
                    }
                }, function(error){
                    qm.qmLog.error(error);
                    if(errorHandler){
                        errorHandler(error);
                    }
                });
            });
        },
        addToArrayWithLimit: function(localStorageItemName, limit, newElementOrArray, successHandler, errorHandler){
            qm.functionHelper.checkTypes(arguments, ['string', 'number'] );
            if(!qm.arrayHelper.variableIsArray(newElementOrArray)){newElementOrArray = [newElementOrArray];}
            qm.localForage.getItem(localStorageItemName, function(existing){
                existing = existing || [];
                var toStore = newElementOrArray.concat(existing);
                toStore = toStore.filter(function(element){
                    return element !== null;
                });
                toStore = toStore.slice(0, limit);
                qm.localForage.setItem(localStorageItemName, toStore, function(){
                    qm.qmLog.info("addToArray in LocalForage " + localStorageItemName + " completed!");
                    if(successHandler){
                        successHandler(toStore);
                    }
                }, function(error){
                    qm.qmLog.error(error);
                    if(errorHandler){
                        errorHandler(error);
                    }
                });
            });
        }
    },
    measurements: {
        recordMeasurement: function(m, successHandler, errorHandler){
            qm.measurements.postMeasurement(m, successHandler, errorHandler)
        },
        newMeasurement: function(src){
            var value;
            if(typeof src.modifiedValue !== "undefined" && src.modifiedValue !== null){
                value = src.modifiedValue;
            } else if (typeof src.value !== "undefined" && src.value !== null){
                value = src.value;
            } else if (typeof src.defaultValue !== "undefined" && src.defaultValue !== null){
                value = src.defaultValue;
            } else {
                value = null;
            }
            var timeAt = src.trackingReminderNotificationTimeEpoch ||
                src.startAt ||
                src.startTime ||
                src.notifyAt ||
                src.startTimeString ||
                src.startTimeEpoch;
            var unit = qm.unitHelper.find(src);
            var cat = qm.variableCategoryHelper.findVariableCategory(src);
            if(!unit && cat){
                unit = qm.unitHelper.find(cat);
            }
            var m = {
                combinationOperation: src.combinationOperation || 'MEAN',
                icon: src.icon,
                inputType: src.inputType || (unit) ? unit.inputType : null,
                maximumAllowedValue: src.maximumAllowedValue || (unit) ? unit.maximum : null,
                minimumAllowedValue: src.minimumAllowedValue || (unit) ? unit.minimum : null,
                pngPath: src.pngPath || src.image || (cat) ? cat.pngUrl : null,
                startAt: qm.timeHelper.toDate(timeAt),
                startTime: qm.timeHelper.toUnixTime(timeAt),
                unitAbbreviatedName: (unit) ? unit.abbreviatedName : null,
                unitId: (unit) ? unit.id : null,
                unitName: (unit) ? unit.name : null,
                upc: src.upc,
                valence: src.valence,
                value: value,
                variableCategoryId: src.variableCategoryName,
                variableCategoryName: src.variableCategoryName,
                variableName: src.variableName || src.name,
            }
            if(!m.inputType && unit){qm.unitHelper.setInputType(m);}
            return m;
        },
        fromNotification: function (n){
            return qm.measurements.newMeasurement(n);
        },
        getUniqueKey: function(m){
            if(m.id){return m.id.toString();}
            var startTime = m.startTime || m.startTimeEpoch;
            return startTime.toString()+":"+m.variableId;
        },
        indexByVariableStartAt: function(arr, indexed){
            if(!indexed){indexed = {}}
            arr = qm.measurements.flattenMeasurements(arr);
            arr.forEach(function(m){
                var startAt = m.startAt ||  qm.timeHelper.fromUnixTime(m.startTime || m.startTimeEpoch);
                if(!indexed[m.variableName]){indexed[m.variableName] = {};}
                indexed[m.variableName][startAt] = m;
            });
            return indexed;
        },
        getLocalMeasurements: function(params, cb){
            var queue = qm.measurements.getMeasurementsFromQueue(params) || [];
            qm.measurements.checkMeasurements(queue)
            var recent = qm.measurements.getRecentlyPostedMeasurements(params) || [];
            qm.measurements.checkMeasurements(recent)
            qm.measurements.getPrimaryOutcomeMeasurements(function (measurements) {
                var indexed = qm.measurements.indexByVariableStartAt(measurements || []);
                indexed = qm.measurements.indexByVariableStartAt(recent, indexed);
                indexed = qm.measurements.indexByVariableStartAt(queue, indexed);
                var filtered = qm.measurements.filterAndSort(indexed, params)
                cb(filtered);
            });
        },
        getPrimaryOutcomeMeasurements: function(cb){
            qm.localForage.getItem(qm.items.primaryOutcomeVariableMeasurements, cb);
        },
        filterAndSort: function(measurements, params){
            if(!Array.isArray(measurements)){measurements = qm.measurements.flattenMeasurements(measurements);}
            measurements = qm.measurements.addInfoAndImagesToMeasurements(measurements);
            measurements = qm.arrayHelper.filterByRequestParams(measurements, params);
            return measurements;
        },
        addLocalMeasurements: function(arr, params, cb){
            qm.measurements.getLocalMeasurements(params, function(local){
                var indexed = qm.measurements.indexByVariableStartAt(arr);
                indexed = qm.measurements.indexByVariableStartAt(local, indexed);
                var filtered = qm.measurements.filterAndSort(indexed, params);
                cb(filtered)
            })
        },
        flattenMeasurements: function(byVariableName){
            if(!byVariableName){
                qmLog.info("Nothing provided to flattenMeasurements")
                return [];
            }
            if(Array.isArray(byVariableName)){return byVariableName;}
            var arr = [];
            for(var variableName in byVariableName){
                if(byVariableName.hasOwnProperty(variableName)){
                    var byDate = byVariableName[variableName];
                    arr = arr.concat(Object.values(byDate));
                }
            }
            return arr;
        },
        deleteLocalById: function(id){
            qm.localForage.deleteById(qm.items.primaryOutcomeVariableMeasurements, id);
            var recent = qm.measurements.measurementCache || [];
            recent = recent.filter(function(m){return m.id !== id;});
            qm.measurements.measurementCache = recent;
        },
        deleteLocally: function(toDelete){
            var id = toDelete.id;
            if(id){
                qm.measurements.deleteLocalById(id);
            }else{
                var startAt = toDelete.startAt || qm.timeHelper.fromUnixTime(toDelete.startTimeEpoch || toDelete.startTime);
                var startTime = qm.timeHelper.toUnixTime(startAt);
                var variableName = toDelete.variableName;
                qm.storage.deleteByProperty(qm.items.measurementsQueue, 'startTimeEpoch', startTime);
                qm.storage.deleteByProperty(qm.items.measurementsQueue, 'startTime', startTime);
                var recent = qm.measurements.flattenMeasurements(qm.measurements.measurementCache);
                recent = recent.filter(function(m){
                    return m.startTimeEpoch !== startTime && m.startTime !== startTime;
                });
                qm.measurements.measurementCache = recent;
            }
        },
        deleteMeasurement: function(toDelete){
            var deferred = Q.defer();
            qm.measurements.deleteLocally(toDelete);
            qm.toast.infoToast("Deleted " + toDelete.variableName + " measurement");
            var startAt = toDelete.startAt || toDelete.startTime || toDelete.startTimeEpoch || null;
            if(!startAt){
                qm.qmLog.errorAndExceptionTestingOrDevelopment("No start time provided to delete measurement: ", toDelete);
            }
            qm.api.post('api/v3/measurements/delete', toDelete, function(response){
                deferred.resolve(response);
            }, function(err){
                deferred.reject(err);
            });
            return deferred.promise;
        },
        addMeasurementsToMemory: function(byVariableName){
            if(!byVariableName){
                qmLog.info("Nothing provided to addMeasurementsToMemory")
                return;
            }
            var arr = qm.measurements.flattenMeasurements(byVariableName);
            qm.measurements.checkMeasurements(arr)
            var existing  = qm.measurements.measurementCache || [];
            qm.measurements.checkMeasurements(existing)
            var combined = qm.arrayHelper.concatenateUniqueId(arr, existing);
            qm.measurements.checkMeasurements(combined)
            qm.measurements.measurementCache = combined;
        },
        checkMeasurements: function(arr){
            if(!arr){
                qmLog.error("No measurements provided to checkMeasurements", {'measurements': arr})
                debugger
                return;
            }
            if(!arr.forEach){
                qmLog.error("Measurements provided to checkMeasurements is not an array", {'measurements': arr})
                debugger
                return;
            }
            arr.forEach(function (m){
                if(typeof m === "function"){
                    qmLog.error("existing Measurement is a function", {'measurements': arr})
                    debugger
                }
                if(Array.isArray(m)){
                    qmLog.error("existing Measurement is an array!", {'measurements': arr})
                    debugger
                }
            });
        },
        getMeasurementsFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            var cachedData = qm.api.cacheGet(params, 'getMeasurementsFromApi');
            if(cachedData && successHandler){
                //successHandler(cachedData);
                //return;
            }
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.MeasurementsApi();
            function callback(error, data, response){
                qm.measurements.addMeasurementsToMemory(data);
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params,
                    'getMeasurementsFromApi');
            }
            apiInstance.getMeasurements(params, callback);
        },
        addLocationDataToMeasurement: function(m){
            if(!m.latitude){m.latitude = qm.storage.getItem(qm.items.lastLatitude);}
            if(!m.longitude){m.longitude = qm.storage.getItem(qm.items.lastLongitude);}
            if(!m.location){m.location = qm.storage.getItem(qm.items.lastLocationNameAndAddress);}
            return m;
        },
        addLocationAndSource: function(m){
            var arr = m;
            if(!Array.isArray(arr)){arr = [arr];}
            for(m in arr){
                qm.measurements.addLocationDataToMeasurement(m);
                if(!m.sourceName){m.sourceName = qm.getSourceName();}
            }
        },
        addToMeasurementsQueue: function(m){
            qm.qmLog.info("Adding to measurements queue: ", m);
            qm.measurements.addLocationAndSource(m);
            qm.measurements.addInfoAndImagesToMeasurement(m);
            qm.measurements.addMeasurementsToMemory([m])
            qm.storage.appendToArray(qm.items.measurementsQueue, m);
        },
        updateMeasurementInQueue: function(m){
            var queue = qm.storage.getItem(qm.items.measurementsQueue);
            if(!queue){queue = [];}
            var i = 0;
            while(i < queue.length){
                if(queue[i].startTimeEpoch === m.prevStartTimeEpoch){
                    queue[i].startTimeEpoch = m.startTimeEpoch;
                    queue[i].value = m.value;
                    queue[i].note = m.note;
                    qm.qmLog.info("Updating measurement in queue: ", m);
                    break;
                }
                i++;
            }
            qm.storage.setItem(qm.items.measurementsQueue, queue);
            qm.measurements.addMeasurementsToMemory(queue)
        },
        getMeasurementsFromQueue: function(params){
            var measurements = qm.storage.getElementsWithRequestParams(qm.items.measurementsQueue, params) || []
            qm.measurements.checkMeasurements(measurements)
            measurements = qm.measurements.addInfoAndImagesToMeasurements(measurements);
            qm.measurements.checkMeasurements(measurements)
            qm.qmLog.info("Got " + measurements.length + " measurements from queue with params: " +
                JSON.stringify(params), measurements);
            return measurements;
        },
        addInfoAndImagesToMeasurement: function(m){
            var ratingInfo = qm.ratingImages.getRatingInfo();
            if(typeof m === "function"){
                qmLog.error("Measurement is a function")
                debugger
                return;
            }
            var parsedNote = qm.stringHelper.parseJsonIfPossible(m.note);
            if(parsedNote && parsedNote.url && parsedNote.message){
                m.note = '<a href="' + parsedNote.url + '" target="_blank">' + parsedNote.message + '</a>';
            }
            m.startTime = m.startTime || m.startTimeEpoch;
            m.startAt = m.startAt || m.startTimeString;
            var unit = qm.unitHelper.getByNameAbbreviatedNameOrId(m.unitId || m.unitAbbreviatedName);
            if(!unit){
                debugger
                unit = qm.unitHelper.getByNameAbbreviatedNameOrId(m.unitId || m.unitAbbreviatedName);
                qm.qmLog.errorAndExceptionTestingOrDevelopment("Could not get unit for this measurement: ", m)
            } else {
                if(!m.unitAbbreviatedName){m.unitAbbreviatedName = unit.abbreviatedName;}
                if(unit.abbreviatedName === '/5'){m.roundedValue = Math.round(m.value);}
            }
            if(!m.variableName){m.variableName = m.variable;}
            if(m.variableName === qm.getPrimaryOutcomeVariable().name){m.valence = qm.getPrimaryOutcomeVariable().valence;}
            m.displayValueAndUnitString = m.displayValueAndUnitString || m.value + " " + unit.abbreviatedName;
            m.displayValueAndUnitString = qm.stringHelper.formatValueUnitDisplayText(m.displayValueAndUnitString)
            m.valueUnitVariableName = m.displayValueAndUnitString + " " + m.variableName;
            if(!m.variableCategoryName){
                var cat = qm.variableCategoryHelper.findVariableCategory(m);
                if(cat){m.variableCategoryName = cat.name;}
            }
            //debugger
            if(m.unitAbbreviatedName === "/5" && m.roundedValue && ratingInfo[m.roundedValue]){
                m.image = ratingInfo[m.roundedValue].numericImage;
                if(m.valence === 'positive'){m.image = ratingInfo[m.roundedValue].positiveImage;}
                if(m.valence === 'negative'){m.image = ratingInfo[m.roundedValue].negativeImage;}
            }
            if(m.image){m.pngPath = m.image;}
            if(m.image && m.image.indexOf("img/rating/face_rating_button_256_sad.png") !== -1 && m.roundedValue === 3){
                qmLog.errorAndExceptionTestingOrDevelopment("value is "+m.roundedValue+" but image is "+m.image);
            }
            m.icon = m.icon || m.ionIcon;
            if(m.variableCategoryName && !m.icon){
                var category = qm.variableCategoryHelper.findVariableCategory(m);
                m.icon = category.ionIcon;
                if(!m.pngPath){
                    m.pngPath = category.pngPath;
                }
            }
        },
        addInfoAndImagesToMeasurements: function(measurements){
            measurements = qm.measurements.flattenMeasurements(measurements);
            measurements.forEach(function(m){
                qm.measurements.addInfoAndImagesToMeasurement(m)
            });
            return measurements;
        },
        measurementCache: [],
        getRecentlyPostedMeasurements: function(params){
            var all = qm.measurements.addInfoAndImagesToMeasurements(qm.measurements.measurementCache || []);
            var filtered = qm.arrayHelper.filterByRequestParams(all, params);
            qm.qmLog.info("Got " + filtered.length + " measurements from recentlyPostedMeasurements with params: " + JSON.stringify(params));
            return filtered;
        },
        postMeasurement: function(m, successHandler, errorHandler){
            function isStartTimeInMilliseconds(m){
                var oneWeekInFuture = qm.timeHelper.getUnixTimestampInSeconds() + 7 * 86400;
                if(m.startTimeEpoch > oneWeekInFuture){
                    m.startTimeEpoch = m.startTimeEpoch / 1000;
                    console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
                    return true;
                }
                return false;
            }
            isStartTimeInMilliseconds(m);
            qm.measurements.addLocationAndSource(m);
            if(!m.startAt && !m.startTime && !m.startTimeEpoch){
                m.startAt = qm.timeHelper.iso();
            }
            if(m.prevStartTimeEpoch){ // Primary outcome variable - update through measurementsQueue
                qm.measurements.updateMeasurementInQueue(m);
            }else if(m.id){
                qm.localForage.deleteById(qm.items.primaryOutcomeVariableMeasurements, m.id);
                qm.measurements.addToMeasurementsQueue(m);
            }else{
                qm.measurements.addToMeasurementsQueue(m);
            }
            qm.userVariables.updateLatestMeasurementTime(m.variableName, m.value);
            qm.measurements.postMeasurementQueue(successHandler, errorHandler);
        },
        postMeasurements: function (measurements, successHandler, errorHandler) {
            qm.measurements.addLocationAndSource(measurements);
            qm.api.post('api/v3/measurements', measurements, function(response){
                var data = (response) ? response.data : null;
                if(data && data.userVariables){
                    qm.variablesHelper.saveToLocalStorage(data.userVariables);
                }
                if(successHandler){successHandler(data);}
            }, errorHandler);
        },
        postMeasurementQueue: function(successHandler, errorHandler){
            var queue = qm.measurements.getMeasurementsFromQueue();
            if(!queue || queue.length < 1){
                if(successHandler){successHandler();}
            } else {
                qm.measurements.postMeasurements(queue, function(data){
                    qm.measurements.measurementCache = qm.measurements.measurementCache.concat(queue);  // Save these for history page
                    qm.storage.setItem(qm.items.measurementsQueue, []);
                    if(successHandler){successHandler(data);}
                }, function(error){
                    qm.storage.setItem(qm.items.measurementsQueue, queue);
                    if(errorHandler){errorHandler(error);}
                });
            }
        },
        postBloodPressureMeasurements: function(parameters){
            var deferred = Q.defer();
            /** @namespace parameters.startTimeEpochSeconds */
            if(!parameters.startTimeEpochSeconds){
                parameters.startTimeEpochSeconds = window.qm.timeHelper.getUnixTimestampInSeconds();
            }
            qm.measurements.postMeasurements([
                {
                    variableId: 1874,
                    sourceName: qm.getSourceName(),
                    startTimeEpoch: qm.measurements.validateStartTime(parameters.startTimeEpochSeconds),
                    value: parameters.systolicValue,
                    note: parameters.note
                },
                {
                    variableId: 5554981,
                    sourceName: qm.getSourceName(),
                    startTimeEpoch: qm.measurements.validateStartTime(parameters.startTimeEpochSeconds),
                    value: parameters.diastolicValue,
                    note: parameters.note
                }
            ], function(response){
                deferred.resolve(response);
            }, function (err){
                deferred.reject(err);
            });
            return deferred.promise;
        },
        validateStartTime:function (startTimeEpoch){
            var result = startTimeEpoch > window.qm.timeHelper.getUnixTimestampInSeconds() - 365 * 86400;
            if(!result){
                var errorName = 'startTimeEpoch is earlier than last year';
                var errorMessage = startTimeEpoch + ' ' + errorName;
                qmLog.error(errorName, errorMessage, {startTimeEpoch: startTimeEpoch}, "error");
                qmLog.error(errorMessage);
            }
            return startTimeEpoch;
        },
        validationFailure: function(message, object){
            qm.alert.validationFailureAlert(message);
            qmLog.error(message, null, {measurement: object});
        }
    },
    manualTrackingVariableCategoryNames: [
        'Emotions',
        'Environment',
        'Foods',
        'Goals',
        'Miscellaneous',
        'Physical Activity',
        'Sleep',
        'Symptoms',
        'Treatments',
        'Vital Signs'
    ],
    memory: {
        askForMemoryAnswer: function(memoryQuestionStatement){
            qm.localForage.getItem(qm.items.memories, function(memories){
                memories = memories || {};
                var response;
                var memoryQuestionQuestion = memoryQuestionStatement;
                if(memoryQuestionStatement.indexOf(' my ') !== -1 && memoryQuestionStatement.indexOf(" are") !== -1){
                    memoryQuestionQuestion = memoryQuestionStatement.replace(" are", "").replace(" my ", " are your ");
                    response = "OK. " + memoryQuestionQuestion + "? ";
                }else{
                    response = "OK. What should I say when you say Recall " + memoryQuestionStatement + "? ";
                }
                qm.mic.wildCardHandler = function(possiblePhrases){
                    if(qm.mic.weShouldIgnore(possiblePhrases)){
                        return false;
                    }
                    qm.mic.wildCardHandlerReset();
                    var memoryQuestionAnswer = qm.arrayHelper.getFirstElementIfArray(possiblePhrases);
                    memories[memoryQuestionQuestion] = memoryQuestionAnswer;
                    memories[memoryQuestionStatement] = memoryQuestionAnswer;
                    qm.localForage.setItem(qm.items.memories, memories, function(){
                        qm.speech.talkRobot("OK. When you want me to remind you, just say Recall " + memoryQuestionStatement + "! ");
                    })
                };
                qm.speech.talkRobot(response);
            }, function(error){
                qm.qmLog.error(error);
            });
        }
    },
    menu: {
        getMenu: function(){
            var appSettings = qm.getAppSettings();
            return appSettings.appDesign.menu.active;
        },
        onStateChange: function(menuItem){
            menuItem = qm.menu.setParams(menuItem);
            menuItem = qm.menu.onParameterChange(menuItem);
            return menuItem;
        },
        setHref: function(menuItem){
            menuItem = qm.menu.replacePlaceHoldersInHref(menuItem);
            menuItem = qm.menu.addStateParamsToHrefQuery(menuItem);
            return menuItem;
        },
        onParameterChange: function(menuItem){
            menuItem = qm.menu.setHref(menuItem);
            menuItem = qm.menu.setId(menuItem);
            menuItem = qm.menu.setTitle(menuItem);
            menuItem = qm.menu.setIonIcon(menuItem);
            return menuItem;
        },
        setTitle: function(menuItem){
            if(menuItem.params.title){
                menuItem.title = menuItem.params.title;
                if(menuItem.params.variableCategoryName){
                    menuItem.title = menuItem.params.variableCategoryName + " " + menuItem.params.title;
                }
                if(menuItem.params.variableName){
                    menuItem.title = menuItem.params.variableName + " " + menuItem.params.title;
                }
            }
            return menuItem;
        },
        setIonIcon: function(menuItem){
            if(menuItem.params.variableCategoryName){
                var category = qm.variableCategoryHelper.findVariableCategory(menuItem.params);
                if(category && category.ionIcon){
                    menuItem.params.ionIcon = category.ionIcon;
                }
            }
            return menuItem;
        },
        setId: function(menuItem){
            function convertStringToId(string){
                string = decodeURIComponent(string);
                return string.replace('#/app/', '')
                    .replace('/', '-')
                    .replace('?', '')
                    .replace('&', '-')
                    .replace('=', '-')
                    .replace(' ', '-')
                    .toLowerCase();
            }
            if(menuItem.href){
                var id = qm.stringHelper.getStringBeforeSubstring('?', menuItem.href, menuItem.href);
                menuItem.id = convertStringToId(id);
            }else{
                menuItem.id = convertStringToId(menuItem.title);
            }
            return menuItem;
        },
        replacePlaceHoldersInHref: function(menuItem){
            menuItem.href = "#/app" + menuItem.url;
            for(var propertyName in menuItem.params){
                if(!menuItem.params.hasOwnProperty(propertyName)){
                    continue;
                }
                if(!menuItem.params[propertyName]){
                    continue;
                }
                menuItem.href = menuItem.href.replace(':' + propertyName, encodeURIComponent(menuItem.params[propertyName]));
            }
            return menuItem;
        },
        addStateParamsToHrefQuery: function(menuItem){
            menuItem.href = qm.urlHelper.addUrlQueryParamsToUrlString(menuItem.params, menuItem.href);
            return menuItem;
        },
        setParams: function(menuItem){
            if(!menuItem.stateName){
                qm.qmLog.info("No stateName so can't update", menuItem, menuItem);
                return menuItem;
            }
            qm.qmLog.info("changed state to " + menuItem.stateName);
            var newState = qm.staticData.states.find(function(state){
                return state.name === menuItem.stateName;
            });
            menuItem = qm.objectHelper.copyPropertiesFromOneObjectToAnother(newState, menuItem, true);
            for(var prop in newState){
                if(newState.hasOwnProperty(prop)){
                    menuItem[prop] = newState[prop];
                }
            }
            return menuItem;
        },
        moveMenuItemDown: function(menuItems, oldIndex){
            var newIndex = oldIndex + 1;
            if(newIndex > menuItems.length){
                return menuItems;
            }
            menuItems = qm.arrayHelper.moveElementOfArray(menuItems, oldIndex, newIndex);
            return menuItems;
        },
        moveMenuItemUp: function(menuItems, oldIndex){
            var newIndex = oldIndex - 1;
            if(newIndex < 0){
                return menuItems;
            }
            menuItems = qm.arrayHelper.moveElementOfArray(menuItems, oldIndex, newIndex);
            return menuItems;
        },
        updateHrefAndIdInMenuItemBasedOnStateName: function(menuItem){
            function addUrlToMenuItem(menuItem){
                if(menuItem.url){
                    return menuItem;
                }
                if(menuItem.stateName){
                    menuItem.url = qm.menu.getUrlFromStateName(menuItem.stateName);
                    if(menuItem.url){
                        return menuItem;
                    }
                }
                if(menuItem.href){
                    for(var i = 0; i < qm.staticData.states.length; i++){
                        if(menuItem.href.indexOf(qm.staticData.states[i].url) !== -1){
                            menuItem.url = qm.staticData.states[i].url;
                        }
                    }
                }
                return menuItem;
            }
            menuItem = addUrlToMenuItem(menuItem);
            menuItem = qm.menu.convertQueryStringToParams(menuItem);
            menuItem = qm.menu.convertUrlAndParamsToHref(menuItem);
            menuItem = qm.menu.addMenuId(menuItem);
            delete menuItem.url;
            return menuItem;
        },
        convertUrlAndParamsToHref: function(menuItem){
            var params = (menuItem.params) ? menuItem.params : menuItem.stateParameters;
            if(!menuItem.subMenu){
                menuItem.href = '#/app' + menuItem.url;
                if(params && params.variableCategoryName && menuItem.href.indexOf('-category') === -1){
                    menuItem.href += "-category/" + params.variableCategoryName;
                    //delete(params.variableCategoryName);
                }
                menuItem.href += qm.urlHelper.convertObjectToQueryString(params);
                menuItem.href = menuItem.href.replace('app/app', 'app');
            }
            qm.qmLog.debug('convertUrlAndParamsToHref ', menuItem, menuItem);
            return menuItem;
        },
        convertQueryStringToParams: function(menuItem){
            if(!menuItem.href){
                qm.qmLog.debug('No menuItem.href for ', menuItem, null);
                return menuItem;
            }
            if(menuItem.href && !menuItem.params){
                menuItem.params = qm.urlHelper.getQueryParams(menuItem.href);
            }
            menuItem.href = qm.urlHelper.stripQueryString(menuItem.href);
            if(menuItem.href && menuItem.href.indexOf('-category') !== -1 && !menuItem.params.variableCategoryName){
                menuItem.params.variableCategoryName = qm.urlHelper.getStringAfterLastSlash(menuItem.href).replace('?', '');
            }
            if(menuItem.params && menuItem.params.variableCategoryName){
                if(menuItem.href.indexOf('-category') === -1){
                    menuItem.href += '-category';
                }
                if(menuItem.stateName.indexOf('Category') === -1){
                    menuItem.stateName += 'Category';
                }
                if(menuItem.href.indexOf(menuItem.params.variableCategoryName) === -1){
                    menuItem.href += '/' + menuItem.params.variableCategoryName;
                }
            }
            return menuItem;
        },
        getUrlFromStateName: function(stateName){
            for(var i = 0; i < qm.staticData.states.length; i++){
                if(qm.staticData.states[i].name === stateName){
                    return qm.staticData.states[i].url;
                }
            }
            qm.qmLog.error("Could not find state with name: " + stateName);
        }
    },
    mic: {
        globalCommands: {
            "quantimodo": function(){
                qm.speech.talkRobot("What can I do for you?");
            },
            "hey robot": function(){
                qm.speech.talkRobot("How dare you call me a robot! The politically correct term is technical American! What can I do for you?");
            },
            'remember *tag': function(memoryQuestionStatement){
                qm.memories.askForMemoryAnswer(memoryQuestionStatement);
            },
            'recall *tag': function(memoryQuestionQuestion){
                qm.memories.recall(memoryQuestionQuestion);
            },
            'remind me *tag': function(memoryQuestionQuestion){
                qm.memories.recall(memoryQuestionQuestion);
            },
            'hey google *tag': function(tag){
                qm.qmLog.info("Ignoring " + tag);
            },
            'ok google *tag': function(tag){
                qm.qmLog.info("Ignoring " + tag);
            },
            'hey siri *tag': function(tag){
                qm.qmLog.info("Ignoring " + tag);
            },
            'ok siri *tag': function(tag){
                qm.qmLog.info("Ignoring " + tag);
            },
            'hey alexa *tag': function(tag){
                qm.qmLog.info("Ignoring " + tag);
            },
            'ok alexa *tag': function(tag){
                qm.qmLog.info("Ignoring " + tag);
            },
            'thank you': function(tag){
                qm.speech.talkRobot("No!  Thank you for being so polite!  Most people treat me like a machine!");
            }
        },
        wildCardHandler: function(text){
            qm.qmLog.info("wildCardHandler not defined to handle " + text);
        },
        wildCardHandlerReset: function(){
            qm.qmLog.info("Unset wildcard handler");
        },
        microphoneDisabled: false,
        onMicEnabled: function(){
            qm.qmLog.info("Called onMicEnabled");
        },
        onMicDisabled: function(){
            qm.qmLog.info("Called onMicDisabled");
        },
        micAvailable: null,
        getMicEnabled: function(){
            if(qm.mic.microphoneDisabled){return false;}
            if(!qm.mic.getMicAvailable()){
                qm.mic.setMicEnabled(false);
                return false;
            }
            return qm.storage.getItem(qm.items.micEnabled) || null;
        },
        setMicEnabled: function(micEnabled){
            qm.qmLog.info("set micEnabled " + micEnabled);
            qm.rootScope[qm.items.micEnabled] = micEnabled;
            var enableButton = document.querySelector('#enable-mic-button');
            var disableButton = document.querySelector('#disable-mic-button');
            if(enableButton){
                enableButton.style.display = (micEnabled) ? "none" : "block";
            }
            if(disableButton){
                disableButton.style.display = (micEnabled) ? "block" : "none";
            }
            enableButton = document.querySelector('#big-enable-mic-button');
            disableButton = document.querySelector('#big-disable-mic-button');
            if(enableButton){
                enableButton.style.display = (micEnabled) ? "none" : "block";
            }
            if(disableButton){
                disableButton.style.display = (micEnabled) ? "block" : "none";
            }
            var inputField = document.querySelector('#mic-input-field-container');
            var inputButton = document.querySelector('#mic-input-field-button');
            if(inputField){
                if(micEnabled){
                    inputButton.classList.remove("animated-microphone-input-search-focused");
                    inputField.classList.remove("animated-microphone-input-container-focused");
                }else{
                    inputButton.classList.add("animated-microphone-input-search-focused");
                    inputField.classList.add("animated-microphone-input-container-focused");
                }
            }
            if(!micEnabled){
                if(!qm.platform.getWindow()){
                    return false;
                }
                if(window.streamReference){
                    window.streamReference.getAudioTracks().forEach(function(track){
                        track.stop();
                    });
                    window.streamReference.getVideoTracks().forEach(function(track){
                        track.stop();
                    });
                    window.streamReference = null;
                }
            }else{
                qm.mic.addCommands(qm.mic.globalCommands);
            }
            return qm.storage.setItem(qm.items.micEnabled, micEnabled);
        },
        getMicAvailable: function(){
            if(qm.mic.micAvailable !== null){
                return qm.mic.micAvailable;
            }
            if(qm.windowHelper.isIframe()){
                return qm.mic.micAvailable = qm.mic.micEnabled = false;
            }
            if(typeof annyang === "undefined"){
                if(!qm.appMode.isTesting()){
                    qm.qmLog.error("Microphone not available!");
                }
                return qm.mic.micAvailable = qm.mic.micEnabled = false;
            }
            return qm.mic.micAvailable = true;
        },
        toggleListening: function(){
            if(qm.mic.listening){
                qm.mic.pauseListening();
            }else{
                qm.mic.resumeListening();
            }
            return qm.mic.listening = !qm.mic.listening;
        },
        listening: false,
        abortListening: function(){
            qm.visualizer.hideVisualizer();
            qm.qmLog.info("pauseListening");
            if(!qm.mic.annyangAvailable()){
                return;
            }
            annyang.abort(); // Stop listening, and turn off mic.
        },
        annyangAvailable: function(){
            if(!annyang){
                qm.qmLog.error("annyang not available!");
                return false;
            }
            return true;
        },
        pauseListening: function(hideVisualizer){
            if(hideVisualizer !== false){
                qm.visualizer.hideVisualizer();
            }
            qm.qmLog.info("pauseListening");
            if(!qm.mic.annyangAvailable()){
                return;
            }
            annyang.pause(); // Pause listening. annyang will stop responding to commands (until the resume or start methods are called), without turning off the browser's SpeechRecognition engine or the mic.
        },
        errorHandler: function(error){
            qm.qmLog.error(error);
        },
        isListening: function(){
            if(!qm.mic.annyangAvailable()){
                return false;
            }
            return annyang.isListening();
        },
        resumeListening: function(){
            qm.visualizer.showVisualizer();
            if(!qm.mic.annyangAvailable()){
                return;
            }
            if(qm.mic.isListening()){
                qm.qmLog.info("annyang is Listening");
            }else{
                qm.qmLog.info("resumeListening");
                // noinspection JSUnresolvedVariable
                annyang.resume(); // Resumes listening and restores command callback execution when a result matches. If SpeechRecognition was aborted (stopped), start it.
            }
        },
        addIgnoreCommand: function(phrase){
            if(!qm.mic.annyangAvailable()){
                return;
            }
            var commands = {};
            commands[phrase] = function(){
                qm.qmLog.info("Ignoring robot phrase: " + phrase);
            };
            qm.mic.addCommands(commands);
        },
        addCommands: function(commands){
            //qm.mic.removeCommands(commands);  // I think this causes problems.  Just use dynamic even handlers
            if(!qm.mic.annyangAvailable()){
                return;
            }
            qm.qmLog.info("addCommands: ", commands);
            annyang.addCommands(commands);
        },
        removeCommands: function(commands){
            if(!qm.mic.annyangAvailable()){
                return;
            }
            qm.qmLog.info("removeCommands: ", commands);
            annyang.removeCommands(commands);
        },
        startListening: function(commands){
            qm.qmLog.info("startListening");
            if(qm.mic.getMicEnabled() === false){
                qm.qmLog.error("Microphone is disabled so can't listen to these commands: ", commands);
                return;
            }
            qm.mic.setMicEnabled(true);
            if(!qm.mic.annyangAvailable()){
                return;
            }
            annyang.start({ // Start listening. It's a good idea to call this after adding some commands first, but not mandatory.
                autoRestart: true, // Should annyang restart itself if it is closed indirectly, because of silence or window conflicts?
                continuous: true,  // Allow forcing continuous mode on or off. Annyang is pretty smart about this, so only set this if you know what you're doing.
                paused: false // Start annyang in paused mode.
            });
            if(commands){
                qm.mic.addCommands(commands);
            }
            qm.visualizer.showVisualizer();
        },
        listenForNotificationResponse: function(successHandler, errorHandler){
            qm.mic.wildCardHandler = function(possiblePhrases){
                if(qm.mic.weShouldIgnore(possiblePhrases)){
                    return false;
                }
                if(qm.speech.callback){
                    qm.speech.callback(possiblePhrases);
                }
                qm.speech.lastUserStatement = possiblePhrases;
                qm.qmLog.info("Just heard user say ", possiblePhrases);
                if(qm.speech.isValidNotificationResponse(possiblePhrases)){
                    var notification = qm.speech.currentNotification;
                    qm.speech.handleNotificationResponse(possiblePhrases, notification);
                    qm.mic.wildCardHandlerReset();
                }else{
                    qm.speech.fallbackMessage(possiblePhrases);
                }
            };
            qm.mic.initializeListening(qm.speech.trackingReminderNotificationCommands, successHandler, errorHandler);
        },
        aPhraseEquals: function(needles, phrasesArray){
            if(!qm.arrayHelper.variableIsArray(needles)){
                needles = [needles];
            }
            for(var j = 0; j < needles.length; j++){
                var needle = needles[j];
                for(var i = 0; i < phrasesArray.length; i++){
                    var phrase = phrasesArray[i];
                    //phrase = nlp(phrase).normalize().out();  // We should have already done this
                    qm.qmLog.info("Normalized phrase");
                    if(phrase === needle){
                        qm.qmLog.info("Found match: " + phrase);
                        return phrase;
                    }
                }
            }
            return false;
        },
        aPhraseContains: function(needles, phrasesArray){
            if(!qm.arrayHelper.variableIsArray(needles)){
                needles = [needles];
            }
            for(var j = 0; j < needles.length; j++){
                var needle = needles[j];
                for(var i = 0; i < phrasesArray.length; i++){
                    var phrase = phrasesArray[i];
                    //phrase = nlp(phrase).normalize().out();  // We should have already done this
                    if(phrase.indexOf(needle) !== -1){
                        qm.qmLog.info(phrase + " contains " + needle);
                        return phrase;
                    }
                }
            }
            return false;
        },
        weShouldIgnore: function(possiblePhrases){
            if(qm.speech.alreadySpeaking(possiblePhrases)){
                qm.qmLog.info("Not handling command because robot is speaking: ", possiblePhrases);
                return true;
            }
            var ignoreThese = [
                'how many',
                'did you have',
                'how severe'
            ];
            var match = qm.mic.aPhraseContains(ignoreThese, possiblePhrases);
            if(match){
                qm.qmLog.info("Ignoring robot phrase: " + match);
                return match;
            }
            qm.mic.saveThought(possiblePhrases[0]);
            return false;
        },
        saveThought: function(phrase){
            var thoughts = qm.storage.getItem(qm.items.thoughts) || {};
            thoughts[phrase] = thoughts[phrase] || {};
            thoughts[phrase].count = (thoughts[phrase].count) ? thoughts[phrase].count++ : 1;
            thoughts[phrase].text = phrase;
            qm.storage.setItem(qm.items.thoughts, thoughts);
        },
        normalizePhrases: function(possiblePhrases){
            if(!qm.arrayHelper.variableIsArray(possiblePhrases)){
                possiblePhrases = [possiblePhrases];
            }
            return possiblePhrases.map(function(phrase){
                return nlp(phrase).normalize().out();
            });
        },
        listenForCardResponse: function(card, successHandler, errorHandler){
            qm.mic.wildCardHandler = function(possiblePhrases){
                if(qm.mic.weShouldIgnore(possiblePhrases)){
                    return false;
                }
                var card = qm.feed.currentCard;
                if(!card){
                    qm.qmLog.info("No card to respond to!");
                    return;
                }
                var unfilledFields = qm.feed.getUnfilledInputFields(card);
                if(unfilledFields){
                    card.selectedButton = qm.feed.getButtonMatchingPhrase(possiblePhrases);
                    var matchingFilledInputField, responseText;
                    if(card.selectedButton){
                        card.parameters = qm.objectHelper.copyPropertiesFromOneObjectToAnother(card.selectedButton.parameters, card.parameters, false);
                        responseText = card.selectedButton.successToastText;
                        qm.qmLog.info("selectedButton", card.selectedButton);
                        for(var i = 0; i < unfilledFields.length; i++){
                            var unfilledField = unfilledFields[i];
                            var key = unfilledField.key;
                            if(typeof card.selectedButton.parameters[key] !== "undefined" && card.selectedButton.parameters[key] !== null){
                                unfilledField.value = card.selectedButton.parameters[key];
                            }
                        }
                    }
                    matchingFilledInputField = qm.speech.setInputFieldValueIfValid(possiblePhrases);
                    if(matchingFilledInputField){
                        card.parameters[matchingFilledInputField.key] = matchingFilledInputField.value;
                    }
                    responseText = "OK. I'll record " + matchingFilledInputField.value + "! ";
                    qm.qmLog.info("matchingFilledInputField", matchingFilledInputField);
                    if(!card.selectedButton && !matchingFilledInputField){
                        var provideOptionsList = true;
                        qm.speech.readCard(null, null, null, provideOptionsList);
                        return;
                    }
                }
                qm.feed.currentCard = null;
                qm.mic.wildCardHandlerReset();
                qm.feed.deleteCardFromLocalForage(card, function(remainingCards){
                    var unfilledFields = qm.feed.getUnfilledInputFields(card);
                    if(unfilledFields){
                        qm.qmLog.errorAndExceptionTestingOrDevelopment("Un-filled fields: ", unfilledFields);
                    }
                    qm.feed.addToFeedQueueAndRemoveFromFeed(card, function(){
                        if(card.followUpAction){
                            card.followUpAction(responseText);
                        }else{
                            qm.qmLog.error("No card followUpAction!")
                        }
                    }, function(error){
                        qm.qmLog.error(error)
                    });
                }, function(error){
                    qm.qmLog.error(error);
                });
            };
            if(card.parameters.trackingReminderNotificationId){
                qm.mic.initializeListening(qm.notifications.trackingReminderNotificationCommands, successHandler, errorHandler);
            }else{
                qm.mic.initializeListening(qm.speech.cardResponseCommands, successHandler, errorHandler);
            }
        },
        debugListening: function(){
            if(!qm.mic.annyangAvailable()){
                return;
            }
            annyang.debug(); // Turn on output of debug messages to the console. Ugly, but super-handy!
        },
        setLanguage: function(language){
            if(!qm.mic.annyangAvailable()){
                return;
            }
            annyang.setLanguage(language); // Set the language the user will speak in. If this method is not called, defaults to 'en-US'.
        },
        specificErrorHandler: function(message){
            qm.qmLog.error(message);
        },
        generalErrorHandler: function(message, meta){
            if(qm.mic.errorHandler){
                qm.mic.errorHandler(message);
            }
            qm.qmLog.error(message, meta);
        },
        initialized: false,
        initializeListening: function(commands, successHandler, errorHandler){
            qm.mic.specificErrorHandler = errorHandler;
            qm.mic.addCommands(commands); // Add our commands to annyang
            qm.visualizer.showVisualizer();
            qm.mic.startListening();
            if(qm.mic.initialized){
                return false;
            }
            if(!qm.mic.getMicEnabled()){
                qm.qmLog.info("Not going to initializeListening because mic not enabled");
                return;
            }
            qm.mic.inititalized = true;
            qm.mic.debugListening();
            annyang.addCallback('start', function(){
                qm.qmLog.debug('browser\'s Speech Recognition engine started listening');
            });
            annyang.addCallback('soundstart', function(){
                qm.qmLog.info('sound detected');
            });
            annyang.addCallback('error', function(error){
                qm.qmLog.debug("Speech Recognition failed because of an error", error);
            });
            annyang.addCallback('errorNetwork', function(error){  // pass local context to a global function called notConnected
                qm.mic.generalErrorHandler("Speech Recognition failed because of a network error", error);
            }, this);
            annyang.addCallback('errorPermissionBlocked', function(error){
                qm.mic.generalErrorHandler("browser blocked the permission request to use Speech Recognition", error);
            });
            annyang.addCallback('errorPermissionDenied', function(error){
                qm.mic.generalErrorHandler("user blocked the permission request to use Speech Recognition", error);
            });
            annyang.addCallback('end', function(error){
                qm.qmLog.debug("browser's Speech Recognition engine stopped", error);
            });
            annyang.addCallback('resultMatch', function(userSaid, commandText, phrases){
                qm.qmLog.info("resultMatch userSaid:" + userSaid); // sample output: 'hello'
                qm.qmLog.info("resultMatch commandText:" + commandText); // sample output: 'hello (there)'
                qm.qmLog.info("resultMatch phrases", phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
            });
            annyang.addCallback('resultNoMatch', function(possiblePhrasesArray){
                if(qm.mic.weShouldIgnore(possiblePhrasesArray)){
                    return;
                }
                if(qm.mic.wildCardHandler){
                    possiblePhrasesArray = qm.mic.normalizePhrases(possiblePhrasesArray);
                    qm.mic.wildCardHandler(possiblePhrasesArray);
                }else{
                    qm.mic.generalErrorHandler("wildCardHandler not set and speech Recognition failed to find a match for this command! possiblePhrasesArray: ", possiblePhrasesArray);
                }
            });
        },
    },
    music: {
        player: {},
        status: {},
        isPlaying: function(filePath){
            return qm.music.status[filePath] === 'play';
        },
        setPlayerStatus: function(filePath, status){
            qm.music.status[filePath] = status;
        },
        play: function(filePath, volume, successHandler, errorHandler){
            filePath = filePath || 'sound/air-of-another-planet-full.mp3';
            if(!qm.speech.getSpeechEnabled()){
                return;
            }
            if(qm.music.isPlaying(filePath)){
                return false;
            }
            qm.music.player[filePath] = new Audio(filePath);
            qm.music.player[filePath].volume = volume || 0.15;
            try{
                qm.music.player[filePath].play();
            }catch (e){
                qm.qmLog.error(e);
                return false;
            }
            if(errorHandler){
                qm.music.player[filePath].onerror = errorHandler;
            }
            qm.music.player[filePath].onended = function(){
                qm.music.setPlayerStatus(filePath, 'pause');
                if(successHandler){
                    successHandler();
                }
            };
            qm.music.setPlayerStatus(filePath, 'play');
            return qm.music.player[filePath];
        },
        fadeIn: function(filePath){
            filePath = filePath || 'sound/air-of-another-planet-full.mp3';
            if(qm.music.isPlaying(filePath)) return false;
            var actualVolume = 0;
            qm.music.player[filePath].play();
            qm.music.setPlayerStatus(filePath, 'play');
            var fadeInInterval = setInterval(function(){
                actualVolume = (parseFloat(actualVolume) + 0.1).toFixed(1);
                if(actualVolume <= 1){
                    qm.music.player[filePath].volume = actualVolume;
                }else{
                    clearInterval(fadeInInterval);
                }
            }, 100);
        },
        fadeOut: function(filePath){
            filePath = filePath || 'sound/air-of-another-planet-full.mp3';
            if(!qm.music.isPlaying(filePath)) return false;
            var actualVolume = qm.music.player[filePath].volume;
            var fadeOutInterval = setInterval(function(){
                actualVolume = (parseFloat(actualVolume) - 0.1).toFixed(1);
                if(actualVolume >= 0){
                    qm.music.player[filePath].volume = actualVolume;
                }else{
                    qm.music.player[filePath].pause();
                    qm.music.status = 'pause';
                    clearInterval(fadeOutInterval);
                }
            }, 100);
        }
    },
    nodeHelper: {
        execute: function(command, callback, suppressErrors, lotsOfOutput){
            qm.qmLog.debug('executing ' + command);
            if(lotsOfOutput){
                var args = command.split(" ");
                var program = args.shift();
                var spawn = require('child_process').spawn; // For commands with lots of output resulting in stdout maxBuffer exceeded error
                var ps = spawn(program, args);
                ps.on('exit', function(code, signal){
                    qm.qmLog.info(command + ' exited with ' + 'code ' + code + ' and signal ' + signal);
                    if(callback){
                        callback();
                    }
                });
                ps.stdout.on('data', function(data){
                    qm.qmLog.info(command + ' stdout: ' + data);
                });
                ps.stderr.on('data', function(data){
                    qm.qmLog.error(command + '  stderr: ' + data);
                });
                ps.on('close', function(code){
                    if(code !== 0){
                        qm.qmLog.error(command + ' process exited with code ' + code);
                    }
                });
            }else{
                var exec = require('child_process').exec;
                var my_child_process = exec(command, function(error, stdout, stderr){
                    if(error !== null){
                        if(suppressErrors){
                            qm.qmLog.info('ERROR: exec ' + error);
                        }else{
                            qm.qmLog.error('ERROR: exec ' + error);
                        }
                    }
                    callback(error, stdout);
                });
                my_child_process.stdout.pipe(process.stdout);
                my_child_process.stderr.pipe(process.stderr);
            }
        }
    },
    notifications: {
        limit: 50, // Need a large number or we have to press refresh
        actions: {
            trackYesAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 1};
                qm.qmLog.pushDebug('trackYesAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackNoAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 0};
                qm.qmLog.pushDebug('trackNoAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackZeroAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 0};
                qm.qmLog.pushDebug('trackZeroAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackOneRatingAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 1};
                qm.qmLog.pushDebug('trackOneRatingAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackTwoRatingAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 2};
                qm.qmLog.pushDebug('trackTwoRatingAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackThreeRatingAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 3};
                qm.qmLog.pushDebug('trackThreeRatingAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackFourRatingAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 4};
                qm.qmLog.pushDebug('trackFourRatingAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackFiveRatingAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId, modifiedValue: 5};
                qm.qmLog.pushDebug('trackDefaultValueAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackDefaultValueAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId};
                qm.qmLog.pushDebug('trackDefaultValueAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            snoozeAction: function(data){
                var body = {trackingReminderNotificationId: data.trackingReminderNotificationId};
                qm.qmLog.pushDebug('snoozeAction push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                body.action = 'snooze';
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackLastValueAction: function(data){
                var body = {
                    trackingReminderNotificationId: data.trackingReminderNotificationId,
                    modifiedValue: data.lastValue
                };
                qm.qmLog.pushDebug('trackLastValueAction', ' push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackSecondToLastValueAction: function(data){
                var body = {
                    trackingReminderNotificationId: data.trackingReminderNotificationId,
                    modifiedValue: data.secondToLastValue
                };
                qm.qmLog.pushDebug('trackSecondToLastValueAction', ' push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            },
            trackThirdToLastValueAction: function(data){
                var body = {
                    trackingReminderNotificationId: data.trackingReminderNotificationId,
                    modifiedValue: data.thirdToLastValue
                };
                qm.qmLog.pushDebug('trackThirdToLastValueAction', ' push data: ' + qm.stringHelper.prettyJsonStringify(data, 140), {
                    pushData: data,
                    notificationsPostBody: body
                });
                qm.notifications.postTrackingReminderNotifications(body);
            }
        },
        getCirclePage: function(notification){
            return {
                //title: notification.longQuestion,
                bodyText: notification.longQuestion,
                image: {
                    url: notification.pngPath
                },
                hide: false,
                buttons: notification.card.buttons
            }
        },
        getLocalNotifications: function(variableCategoryName){
            var notifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
            if(!notifications || !notifications.length){
                return [];
            }
            if(variableCategoryName){
                return qm.arrayHelper.getByProperty('variableCategoryName', variableCategoryName, notifications);
            }
            return notifications;
        },
        getMostRecentRatingNotificationNotInSyncQueue: function(){
            // Need unique rating notifications because we need to setup initial popup via url params
            var uniqueRatingNotifications = qm.notifications.getAllUniqueRatingNotifications();
            if(!uniqueRatingNotifications){
                qm.qmLog.info("No uniqueRatingNotifications in storage");
                return null;
            }
            for(var i = 0; i < uniqueRatingNotifications.length; i++){
                var notification = uniqueRatingNotifications[i];
                if(!qm.notificationsSyncQueue ||
                    !qm.arrayHelper.arrayHasItemWithSpecificPropertyValue('variableName', notification.variableName, qm.notificationsSyncQueue)){
                    qm.qmLog.info("Got uniqueRatingNotification not in sync queue: " + notification.variableName, null, notification);
                    var hoursAgo = qm.timeHelper.hoursAgo(notification.trackingReminderNotificationTimeEpoch);
                    if(hoursAgo < 24){
                        //var dueTimeString = qm.timeHelper.getTimeSinceString(notification.trackingReminderNotificationTimeEpoch);
                        //console.log("due: "+ dueTimeString);
                        return notification;
                    }
                    console.log(hoursAgo + " hours ago is too old!");
                }
            }
            qm.qmLog.info("No uniqueRatingNotifications not in sync queue");
            return null;
        },
        getMostRecentUniqueNotificationNotInSyncQueue: function(){
            var uniqueNotifications = qm.notifications.getUniqueNotificationsDueInLast24();
            if(!uniqueNotifications || !uniqueNotifications.length){
                qm.qmLog.info("No uniqueNotifications due in last 24 in storage");
                return null;
            }
            for(var i = 0; i < uniqueNotifications.length; i++){
                var notification = uniqueNotifications[i];
                if(!qm.notificationsSyncQueue ||
                    !qm.arrayHelper.arrayHasItemWithSpecificPropertyValue('variableName', notification.variableName, qm.notificationsSyncQueue)){
                    qm.qmLog.info("Got uniqueNotification not in sync queue: " + notification.variableName);
                    return notification;
                }
            }
            qm.qmLog.info("No uniqueNotifications not in sync queue");
            return null;
        },
        setLastPopupTime: function(time){
            if(typeof time === "undefined"){
                time = qm.timeHelper.getUnixTimestampInSeconds();
            }
            qm.qmLog.pushDebug(arguments.callee.caller.name + " setLastPopupTime to " + time);
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
        lastPopupWasBeforeLastReminderTime: function(){
            var lastTime = qm.notifications.getLastPopupUnixTime();
            qm.qmLog.info("Last popup at " + qm.timeHelper.getTimeSinceString(lastTime));
            if(lastTime < qm.timeHelper.getUnixTimestampInSeconds() - qm.reminderHelper.getMostFrequentReminderIntervalInSeconds()){
                qm.qmLog.error("No popups shown since before last reminder time!  Re-initializing popups...");
                return true; // Sometimes we lose permission for some reason
            }
            return false;
        },
        getSecondsSinceLastPopup: function(){
            return qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getLastPopupUnixTime();
        },
        canWeShowPopupYet: function(path){
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
            qm.qmLog.pushDebug('Too soon to show popup!', 'Cannot show popup because last one was only ' + qm.notifications.getTimeSinceLastPopupString() +
                ' and most Frequent Interval In Minutes is ' + minimumTimeBetweenInMinutes + ". path: " + path);
            return false;
        },
        getMostFrequentReminderIntervalInMinutes: function(){
            var mostFrequentReminderIntervalInSeconds = qm.storage.getItem(qm.items.mostFrequentReminderIntervalInSeconds);
            if(!mostFrequentReminderIntervalInSeconds){
                mostFrequentReminderIntervalInSeconds = 86400;
            }
            return mostFrequentReminderIntervalInSeconds / 60;
        },
        setLastNotificationsRefreshTime: function(){
            qm.storage.setLastRequestTime("GET", qm.apiPaths.trackingReminderNotificationsPast);
        },
        getLastNotificationsRefreshTime: function(){
            var lastTime = qm.storage.getLastRequestTime("GET", qm.apiPaths.trackingReminderNotificationsPast);
            qm.qmLog.info("Last notifications refresh " + qm.timeHelper.getTimeSinceString(lastTime));
            return lastTime;
        },
        getSecondsSinceLastNotificationsRefresh: function(){
            qm.qmLog.info("Last notifications refresh " + qm.timeHelper.getTimeSinceString(qm.notifications.getLastNotificationsRefreshTime()));
            return qm.timeHelper.getUnixTimestampInSeconds() - qm.notifications.getLastNotificationsRefreshTime();
        },
        addToSyncQueue: function(n){
            qm.notifications.deleteById(n.id);
            qm.userVariables.updateLatestMeasurementTime(n.variableName, n.modifiedValue);
            var res = qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.notificationsSyncQueue, n);
            setTimeout(qm.notifications.syncIfQueued, 15000);
            return res;
        },
        refreshIfEmpty: function(successHandler, errorHandler){
            if(!qm.notifications.getNumberInGlobalsOrLocalStorage()){
                qm.qmLog.info('No notifications in local storage');
                qm.notifications.syncNotifications(successHandler, errorHandler);
                return true;
            }
            qm.qmLog.info(qm.notifications.getNumberInGlobalsOrLocalStorage() + ' notifications in local storage');
            successHandler();
            return false
        },
        refreshIfEmptyOrStale: function(callback){
            qm.qmLog.info("qm.notifications.refreshIfEmptyOrStale");
            if(!qm.notifications.getNumberInGlobalsOrLocalStorage() || qm.notifications.getSecondsSinceLastNotificationsRefresh() > 3600){
                qm.qmLog.info('Refreshing notifications because empty or last refresh was more than an hour ago');
                qm.notifications.syncNotifications(callback);
            }else{
                qm.qmLog.info('Not refreshing notifications because last refresh was last than an hour ago and we have notifications in local storage');
                if(callback){
                    callback(qm.notifications.getLocalNotifications());
                }
            }
        },
        getAllUniqueRatingNotifications: function(){
            qm.qmLog.info("Called getAllUniqueRatingNotifications");
            var ratingNotifications = qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'unitAbbreviatedName', '/5');
            if(!ratingNotifications){
                qm.qmLog.info("No rating notifications in storage!");
                return null;
            }
            qm.qmLog.info("Got " + ratingNotifications.length + " total NON-UNIQUE rating notification from storage");
            var unique = qm.arrayHelper.getUnique(ratingNotifications, 'variableName');
            qm.qmLog.info("Got " + unique.length + " UNIQUE rating notifications");
            return unique;
        },
        getAllUniqueNotifications: function(){
            qm.qmLog.info("Called getAllUniqueRatingNotifications");
            var notifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
            if(!notifications || !notifications.length){
                qm.qmLog.info("No notifications in storage!");
                return null;
            }
            qm.qmLog.info("Got " + notifications.length + " total NON-UNIQUE notification from storage");
            var unique = qm.arrayHelper.getUnique(notifications, 'variableName');
            qm.qmLog.info("Got " + unique.length + " UNIQUE notifications");
            return unique;
        },
        getNotificationsDueInLast24: function(){
            var allNotifications = qm.storage.getItem(qm.items.trackingReminderNotifications);
            if(!allNotifications){
                qm.qmLog.info("No NotificationsDueInLast24 in localStorage");
                return null;
            }
            var last24 = [];
            for(var i = 0; i < allNotifications.length; i++){
                if(qm.timeHelper.hoursAgo(allNotifications[i].trackingReminderNotificationTimeEpoch) < 24){
                    last24.push(allNotifications[i]);
                }
            }
            return last24;
        },
        getUniqueNotificationsDueInLast24: function(){
            var last24 = qm.notifications.getNotificationsDueInLast24();
            if(!last24){
                qm.qmLog.info("No UNIQUE NotificationsDueInLast24 in localStorage");
                return null;
            }
            qm.qmLog.info("Got " + last24.length + " total NON-UNIQUE notification due in last 24 from storage");
            var unique = qm.arrayHelper.getUnique(last24, 'variableName');
            qm.qmLog.info("Got " + unique.length + " UNIQUE notifications");
            return unique;
        },
        deleteById: function(id){
            qm.storage.deleteById(qm.items.trackingReminderNotifications, id);
        },
        lastAction: "",
        setLastAction: function(modifiedValue, unitAbbreviatedName){
            var lastAction = 'Recorded ' + modifiedValue + ' ' + unitAbbreviatedName;
            qm.notifications.lastAction = qm.stringHelper.formatValueUnitDisplayText(lastAction);
        },
        getQueue: function() {
            return qm.storage.getItem(qm.items.notificationsSyncQueue);
        },
        removeNotificationFromSyncQueueAndUnhide: function(n){
            var id = n.trackingReminderNotificationId || n.id;
            qm.qmLog.info("Called undo notification tracking...");
            var queue = qm.notifications.getQueue();
            if(!queue || !queue.length){return false;}
            var fromQ = queue.find(function(one){return one.id === id;})
            if(!fromQ){return;}
            fromQ.hide = false;
            qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.trackingReminderNotifications, fromQ);
            qm.storage.deleteByProperty(qm.items.notificationsSyncQueue, 'id', id);
        },
        getMostRecentRatingNotification: function(){
            var ratingNotifications = qm.storage.getWithFilters(qm.items.trackingReminderNotifications, 'unitAbbreviatedName', '/5');
            ratingNotifications = qm.arrayHelper.sortByProperty(ratingNotifications, 'trackingReminderNotificationTime');
            if(ratingNotifications.length){
                var notification = ratingNotifications[ratingNotifications.length - 1];
                if(notification.trackingReminderNotificationTimeEpoch < qm.timeHelper.getUnixTimestampInSeconds() - 86400){
                    qm.qmLog.info('Got this notification but it\'s from yesterday: ', notification);
                    //return;
                }
                qm.qmLog.info(null, 'Got this notification: ', notification);
                //qm.storage.deleteTrackingReminderNotification(notification.trackingReminderNotificationId);
                //qm.storage.deleteByProperty(qm.items.trackingReminderNotifications, 'variableName', notification.variableName);
                return notification;
            }else{
                console.info('No rating notifications for popup');
                qm.notifications.getLastNotificationsRefreshTime();
                qm.notifications.syncNotifications();
                return null;
            }
        },
        deleteByVariableName: function(variableName){
            return qm.storage.deleteByProperty(qm.items.trackingReminderNotifications, 'variableName', variableName);
        },
        promise: null,
        refreshAndShowPopupIfNecessary: function(notificationParams){
            qm.notifications.syncNotifications(function(response){
                var uniqueNotification = qm.notifications.getMostRecentUniqueNotificationNotInSyncQueue();
                function objectLength(obj){
                    var result = 0;
                    for(var prop in obj){
                        if(obj.hasOwnProperty(prop)){
                            // or Object.prototype.hasOwnProperty.call(obj, prop)
                            result++;
                        }
                    }
                    return result;
                }
                var trackingReminderNotifications = qm.notifications.getLocalNotifications();
                var numberOfWaitingNotifications = objectLength(trackingReminderNotifications);
                if(uniqueNotification){
                    function getChromeRatingNotificationParams(trackingReminderNotification){
                        return {
                            url: qm.notifications.getRatingNotificationPath(trackingReminderNotification),
                            type: 'panel',
                            top: screen.height - 150,
                            left: screen.width - 380,
                            width: 390,
                            height: 110,
                            focused: true
                        };
                    }
                    qm.chrome.openOrFocusChromePopupWindow(getChromeRatingNotificationParams(uniqueNotification));
                    qm.chrome.updateChromeBadge(0);
                }else if(numberOfWaitingNotifications > 0){
                    qm.chrome.createSmallNotificationAndOpenInboxInBackground();
                }
            });
            return notificationParams;
        },
        getNumberInGlobalsOrLocalStorage: function(variableCategoryName){
            var notifications = qm.notifications.getLocalNotifications(variableCategoryName);
            if(notifications){
                return notifications.length;
            }
            return 0;
        },
        postTrackingReminderNotifications: function(trackingReminderNotifications, onDoneListener, timeout){
            qm.qmLog.pushDebug("postTrackingReminderNotifications", JSON.stringify(trackingReminderNotifications), trackingReminderNotifications);
            if(!qm.arrayHelper.variableIsArray(trackingReminderNotifications)){
                trackingReminderNotifications = [trackingReminderNotifications];
            }
            if(!onDoneListener){
                onDoneListener = function(response){
                    qm.qmLog.pushDebug("postTrackingReminderNotifications response ", JSON.stringify(response), response);
                }
            }
            // Get rid of card objects, available unit array and variable category object to decrease size of body
            trackingReminderNotifications = qm.objectHelper.removeObjectAndArrayPropertiesForArray(trackingReminderNotifications);
            qm.api.post("v1/trackingReminderNotifications", trackingReminderNotifications, onDoneListener);
            if(timeout){
                setTimeout(function(){
                    qm.qmLog.info("Timeout expired so closing");
                    qm.notifications.closePopup();  // Avoid leaving the popup open too long
                }, timeout);
            }
        },
        getRatingNotificationPath: function(ratingTrackingReminderNotification){
            if(ratingTrackingReminderNotification.unitAbbreviatedName !== '/5'){
                qm.qmLog.error('ratingTrackingReminderNotification must have unit /5');
            }
            var url = "android_popup.html?variableName=" + encodeURIComponent(ratingTrackingReminderNotification.variableName) +
                "&valence=" + ratingTrackingReminderNotification.valence +
                "&trackingReminderNotificationId=" + ratingTrackingReminderNotification.trackingReminderNotificationId;
            url = qm.api.addGlobalParams(url);
            return url;
        },
        closePopup: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            qm.qmLog.info('closing popup');
            qm.notifications.clearNotifications();
            window.close();
            if(typeof OverApps !== "undefined"){
                console.log("Calling OverApps.closeWebView()...");
                OverApps.closeWebView();
            }else{
                console.error("OverApps is undefined!");
            }
        },
        clearNotifications: function(){
            if(!qm.platform.isChromeExtension()){
                return;
            }
            qm.chrome.updateChromeBadge(0);
            chrome.notifications.clear("moodReportNotification", function(){
            });
        },
        mostRecentNotificationIsOlderThanMostFrequentInterval: function(){
            var MostRecentNotification = qm.notifications.getMostRecentNotification();
            var mostFrequent = qm.reminderHelper.getMostFrequentReminderIntervalInSeconds();
            return MostRecentNotification.trackingReminderNotificationTimeEpoch < qm.timeHelper.getUnixTimestampInSeconds() - mostFrequent;
        },
        getMostRecentNotification: function(successHandler, errorHandler){
            var trackingReminderNotifications = qm.storage.getTrackingReminderNotifications();
            var mostRecent = 0;
            var MostRecentNotification;
            for(var i = 0; i < trackingReminderNotifications.length; i++){
                var notification = trackingReminderNotifications[i];
                if(notification.trackingReminderNotificationTimeEpoch > mostRecent){
                    mostRecent = notification.trackingReminderNotificationTimeEpoch;
                    MostRecentNotification = notification;
                }
            }
            if(MostRecentNotification){
                if(successHandler){
                    successHandler(MostRecentNotification);
                }
                return MostRecentNotification;
            }
            if(!successHandler){
                return null;
            }
            qm.notifications.syncNotifications(function(response){
                var notification = qm.notifications.getMostRecentNotification();
                if(notification){
                    successHandler(notification);
                }else if(errorHandler){
                    errorHandler("No notifications even after refresh!")
                }
            }, errorHandler);
        },
        track: function(n){
            n.action = 'track';
            qm.qmLog.debug('trackTrackingReminderNotificationDeferred: Going to track ', n);
            qm.notifications.addToSyncQueue(n);
        },
        trackAll: function(n, value){
            n.action = 'trackAll';
            qm.notifications.deleteByVariableName(n.variableName);
            if(value !== null){n.modifiedValue = value;}
            qm.notifications.addToSyncQueue(n);
        },
        snooze: function(n){
            n.action = 'snooze';
            qm.notifications.addToSyncQueue(n);
        },
        skipAll: function(n){
            n.action = 'skipAll';
            qm.notifications.deleteByVariableName(n.variableName);
            qm.notifications.addToSyncQueue(n);
        },
        skip: function(trackingReminderNotification){
            trackingReminderNotification.action = 'skip';
            qm.notifications.addToSyncQueue(trackingReminderNotification);
        },
        trackingReminderNotificationCommands: {
            "I don't know": function(){
                qm.notifications.skipAll(qm.feed.currentCard.parameters);
                qm.feed.currentCard.followUpAction("OK. We'll skip that one.");
            },
            "I don't remember": function(){
                qm.notifications.skipAll(qm.feed.currentCard.parameters);
                qm.feed.currentCard.followUpAction("OK. We'll skip that one.");
            }
        },
        convertPushDataToWebNotificationOptions: function(pushData, appSettings){
            // https://developers.google.com/web/fundamentals/push-notifications/notification-behaviour
            var notificationOptions = {
                actions: [],
                requireInteraction: false,
                body: pushData.message || "Click here for more options",
                data: JSON.parse(JSON.stringify(pushData)),
                //dir: NotificationDirection,
                icon: pushData.icon || appSettings.additionalSettings.appImages.appIcon,
                //lang: string,
                tag: pushData.title, // The tag option is simply a way of grouping messages so that any old notifications that are currently displayed will be closed if they have the same tag as a new notification.
                silent: true,  // Why do we still hear sounds on Chrome for Android?
                onClick: qm.push.notificationClick,
                title: pushData.title
            };
            try {
                qm.allActions = JSON.parse(pushData.actions);
                console.log("allActions", qm.allActions);
                for (var i = 0; i < qm.allActions.length; i++) {
                    notificationOptions.actions[i] = {
                        action: qm.allActions[i].callback ||  qm.allActions[i].action || qm.allActions[i].functionName,
                        title: qm.allActions[i].longTitle ||  qm.allActions[i].longTitle ||  qm.allActions[i].text
                    };
                }
                if(typeof Notification !== "undefined"){
                    var maxVisibleActions = Notification.maxActions;
                    if (maxVisibleActions < 4) {
                        console.log("This notification will only display " + maxVisibleActions   +" actions.");
                    } else {
                        console.log("This notification can display up to " + maxVisibleActions +" actions");
                    }
                }
            } catch (error) {
                console.error("could not parse actions in pushData: ", pushData);
            }
            //event.waitUntil(self.registration.showNotification(title, pushData));
            console.log("Notification options", notificationOptions);
            if(!pushData.title || pushData.title === "undefined"){
                qmLog.error("pushData.title undefined! pushData: "+JSON.stringify(pushData) + " notificationOptions: "+
                    JSON.stringify(notificationOptions));
            }
            var variableDisplayName = pushData.variableDisplayName || pushData.variableName;
            if(variableDisplayName){
                notificationOptions.title = variableDisplayName; // Exclude "Track" because it gets cut off
                notificationOptions.body = "Record " + variableDisplayName + " or click here for more options";
            }
            return notificationOptions;
        },
        showWebNotification: function(pushData){
            //qm.api.postToQuantiModo(pushData, "pushData:"+JSON.stringify(pushData));
            console.log("push data: ", pushData);
            if(!pushData.title && pushData.data) {
                console.log("Provided entire payload to showNotification instead of just payload.data");
                pushData = pushData.data;
            }
            qm.appsManager.getAppSettingsLocallyOrFromApi(function (appSettings) {
                var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, appSettings);
                self.registration.showNotification(notificationOptions.title, notificationOptions);
            });
        },
        getDeviceTokenToSync: function(){
            return qm.storage.getItem(qm.items.deviceTokenToSync);
        },
        postDeviceToken: function(deviceToken, successHandler, errorHandler){
            var platform;
            if(qm.platform.isAndroid()){
                platform = 'android';
            }
            if(qm.platform.isIOS()){
                platform = 'ios';
            }
            if(qm.platform.isWindows()){
                platform = 'windows';
            }
            qm.api.post('api/v3/deviceTokens', {
                platform: platform,
                deviceToken: deviceToken,
                clientId: qm.api.getClientId(),
                stacktrace: qmLog.getStackTrace()
            }, successHandler, errorHandler);
        },
        registerDeviceToken: function(){
            var deferred = Q.defer();
            if(!qm.platform.isMobile()){
                deferred.reject('Not on mobile so not posting device token');
                return deferred.promise;
            }
            if(!qm.getUser()){
                deferred.reject('Cannot post device token yet because we are not logged in');
                return deferred.promise;
            }
            var deviceTokenToSync = qm.notifications.getDeviceTokenToSync();
            if(!deviceTokenToSync){
                deferred.reject('No deviceTokenToSync in localStorage');
                return deferred.promise;
            }
            var message = "last push was received " + qm.push.getHoursSinceLastPush() + " hours ago";
            if(qm.push.getHoursSinceLastPush() < 24){
                qmLog.pushDebug("Not registering for pushes because " + message);
                return;
            }else{
                qmLog.pushDebug(message);
            }
            qm.storage.removeItem(qm.items.deviceTokenToSync);
            qmLog.debug('Posting deviceToken to server: ', null, deviceTokenToSync);
            qm.notifications.postDeviceToken(deviceTokenToSync, function(response){
                qm.storage.setItem(qm.items.deviceTokenOnServer, deviceTokenToSync);
                qmLog.debug("postDeviceToken", response, null);
                deferred.resolve();
            }, function(error){
                qm.storage.setItem(qm.items.deviceTokenToSync, deviceTokenToSync);
                qmLog.error(error);
                deferred.reject(error);
            });
            return deferred.promise;
        },
        syncNotifications: function(successHandler, errorHandler){
            qm.qmLog.debug("Called syncNotifications...");
            var queue = qm.notifications.getQueue();
            qm.storage.removeItem(qm.items.notificationsSyncQueue);
            qm.storage.removeItem(qm.items.trackingReminderNotificationSyncScheduled);
            var body = [];
            if(queue){
                if(!(queue instanceof Array)){queue = [queue];}
                body = queue.map(function (n){
                    return {
                        'value': n.modifiedValue || n.value,
                        'trackingReminderNotificationId': n.trackingReminderNotificationId,
                        'variableId': n.variableId,
                        'trackingReminderId': n.trackingReminderId,
                        'action': n.action,
                        'timeZone': moment.tz.guess(),
                    }
                })
            }
            function saveResponse(response){
                if(!response){
                    var err = "No response from postToQuantiModo(body, 'v3/trackingReminderNotifications";
                    if(errorHandler){
                        errorHandler(err);
                        return;
                    } else {
                        throw err;
                    }
                }
                var data = response.data || response;
                var measurements = data.measurements;
                if(measurements && measurements.length){qm.measurements.addMeasurementsToMemory(measurements);}
                var notifications = data.trackingReminderNotifications;
                if(notifications && notifications.length){qm.storage.setTrackingReminderNotifications(notifications);}
            }
            qm.api.post('v3/trackingReminderNotifications', body, function(response){
                saveResponse(response);
                if(successHandler){successHandler(response);}
            }, function(response){
                qm.qmLog.error(response.message)
                saveResponse(response); // Sometimes we still return notifications even with an error
                if(errorHandler){errorHandler(response.message || response.error);}
            });
        },
        syncIfQueued: function (){
            var deferred = Q.defer();
            var notifications = qm.notifications.getQueue();
            if(notifications && notifications.length){
                return qm.notifications.syncDeferred();
            } else {
                deferred.resolve([]);
            }
            return deferred.promise;
        },
        syncDeferred: function(params){
            var deferred = Q.defer();
            if(params && params.noCache){qm.notifications.notificationsPromise = false;}
            if(!qm.getUser()){
                deferred.reject("No user to get notifications");
                qm.notifications.notificationsPromise = false;
                return deferred.promise;
            }
            if(qm.notifications.notificationsPromise){return qm.notifications.notificationsPromise;}
            qm.notifications.syncNotifications(function(response){
                var notifications = qm.notifications.getLocalNotifications();
                if(notifications.length && qm.platform.isMobile() && qm.notifications.getDeviceTokenToSync()){
                    qm.notifications.registerDeviceToken();
                }
                if(qm.qmService){
                    qm.qmService.notifications.broadcastGetTrackingReminderNotifications();
                    if(qm.platform.isAndroid()){
                        qm.qmService.notifications.showAndroidPopupForMostRecentNotification(true);
                    }
                }
                qm.chrome.updateChromeBadge(notifications.length);
                qm.notifications.notificationsPromise = false;
                deferred.resolve(notifications);
            }, function(error){
                qmLog.error(error);
                qm.notifications.notificationsPromise = false;
                deferred.reject(error);
            });
            setTimeout(function(){qm.notifications.notificationsPromise = false;}, 15000)
            return qm.notifications.notificationsPromise = deferred.promise;
        },
        syncIfEmpty: function (){
            var deferred = Q.defer();
            var notifications = qm.notifications.getLocalNotifications();
            if(!notifications || !notifications.length){
                return qm.notifications.syncDeferred();
            } else {
                deferred.resolve(notifications);
            }
            return deferred.promise;
        },
        removeDuplicates: function(notifications){
            var ids = [];
            var toKeep = [];
            if(!notifications){
                throw "Notifications is not an array!"
            }
            if(typeof notifications.forEach !== "function"){
                throw "Notifications is not an array!"
            }
            var allIds = notifications.map(function(n){
                return n.id;
            })
            notifications.forEach(function(n){
                if(n.id !== n.trackingReminderNotificationId){
                    qmLog.errorAndExceptionTestingOrDevelopment("notification id: "+n.id +
                        " does not match trackingReminderNotificationId: "+n.trackingReminderNotificationId, null, n);
                }
                var before = n.actionArray;
                n.actionArray = qm.arrayHelper.removeDuplicatesByProperty(before, 'title');
                if(before.length !== n.actionArray.length){
                    qmLog.error("Duplicate button titles", before);
                }
                var id = n.trackingReminderNotificationId || n.id;
                if(ids.indexOf(id) !== -1) {
                    qmLog.errorAndExceptionTestingOrDevelopment("Duplicate notification id: "+id, null, n);
                }
                toKeep.push(n);
                ids.push(id);
            });
            return toKeep;
        },
        groupByDate: function(notifications){
            if(!qm.arrayHelper.variableIsArray(notifications)){
                qmLog.error("trackingReminderNotifications is not an array! trackingReminderNotifications: ",
                    notifications);
                return;
            }else{
                qmLog.debug('trackingReminderNotifications is an array of size: ' + notifications.length);
            }
            var result = [];
            var reference = moment().local();
            var today = reference.clone().startOf('day');
            var yesterday = reference.clone().subtract(1, 'days').startOf('day');
            var weekOld = reference.clone().subtract(7, 'days').startOf('day');
            var monthOld = reference.clone().subtract(30, 'days').startOf('day');
            var todayResult;
            try{
                todayResult = notifications.filter(function(trn){
                    /** @namespace trackingReminderNotification.trackingReminderNotificationTime */
                    return moment.utc(trn.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
                });
            }catch (error){
                //qmLog.error(error, "notifications are: " + JSON.stringify(trackingReminderNotifications), {});
                qmLog.error(error, "Trying again after JSON.parse(JSON.stringify(trackingReminderNotifications)). Why is this necessary?", {});
                notifications = JSON.parse(JSON.stringify(notifications));
                todayResult = notifications.filter(function(trn){
                    /** @namespace trackingReminderNotification.trackingReminderNotificationTime */
                    return moment.utc(trn.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
                });
            }
            if(todayResult.length){
                result.push({name: "Today", trackingReminderNotifications: todayResult});
            }
            var yesterdayResult = notifications.filter(function(trn){
                return moment.utc(trn.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
            });
            if(yesterdayResult.length){
                result.push({name: "Yesterday", trackingReminderNotifications: yesterdayResult});
            }
            var last7DayResult = notifications.filter(function(trn){
                var date = moment.utc(trn.trackingReminderNotificationTime).local();
                return date.isAfter(weekOld) === true && date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
            });
            if(last7DayResult.length){
                result.push({name: "Last 7 Days", trackingReminderNotifications: last7DayResult});
            }
            var last30DayResult = notifications.filter(function(trn){
                var date = moment.utc(trn.trackingReminderNotificationTime).local();
                return date.isAfter(monthOld) === true && date.isBefore(weekOld) === true &&
                    date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
            });
            if(last30DayResult.length){
                result.push({name: "Last 30 Days", trackingReminderNotifications: last30DayResult});
            }
            var olderResult = notifications.filter(function(trn){
                return moment.utc(trn.trackingReminderNotificationTime).local().isBefore(monthOld) === true;
            });
            if(olderResult.length){
                result.push({name: "Older", trackingReminderNotifications: olderResult});
            }
            return result;
        }
    },
    objectHelper: {
        copyPropertiesFromOneObjectToAnother: function(source, destinationToOverwrite, copyNulls){
            for(var prop in source){
                if(source.hasOwnProperty(prop)){
                    if(!copyNulls && source[prop] === null){
                        continue;
                    }
                    destinationToOverwrite[prop] = source[prop];
                }
            }
            return destinationToOverwrite;
        },
        isObject: function(a){
            return (!!a) && (a.constructor === Object);
        },
        isEquivalent: function(a, b){
            // Create arrays of property names
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);
            // If number of properties is different,
            // objects are not equivalent
            if(aProps.length != bProps.length){
                return false;
            }
            for(var i = 0; i < aProps.length; i++){
                var propName = aProps[i];
                // If values of same property are not equal,
                // objects are not equivalent
                if(a[propName] !== b[propName]){
                    return false;
                }
            }
            // If we made it this far, objects
            // are considered equivalent
            return true;
        },
        getKeyWhereValueEqualsProvidedString: function(needleString, haystackObject){
            for(var propertyName in haystackObject){
                if(haystackObject.hasOwnProperty(propertyName)){
                    if(haystackObject[propertyName] === null){
                        continue;
                    }
                    var haystackString = haystackObject[propertyName].toString();
                    if(needleString === haystackString){
                        return propertyName;
                    }
                }
            }
            return false;
        },
        getSizeInKb: function(object){
            var string;
            if(typeof object === "string"){
                string = object;
            }else{
                string = JSON.stringify(object);
            }
            return qm.objectHelper.getSizeOfStringInKb(string);
        },
        getSizeOfStringInKb: function(string){
            return Math.round(string.length / 1000);
        },
        loopThroughProperties: function(obj, callback){
            for(var prop in obj){
                if(obj.hasOwnProperty(prop)){
                    callback(prop, obj[prop]);
                }
            }
        },
        unsetPropertiesWithSizeGreaterThanForObject: function(maximumKb, object){
            object = JSON.parse(JSON.stringify(object));  // Decouple
            for(var property in object){
                if(object.hasOwnProperty(property)){
                    if(qm.objectHelper.getSizeInKb(object[property]) > maximumKb){
                        delete object[property];
                    }
                }
            }
            return object;
        },
        unsetNullProperties: function(object){
            for(var property in object){
                if(object.hasOwnProperty(property)){
                    if(object[property] === null){
                        delete object[property];
                    }
                }
            }
            return object;
        },
        objectContainsString: function(object, needle){
            if(!object){
                return false;
            }
            var haystack = JSON.stringify(object).toLowerCase();
            return haystack.indexOf(needle) !== -1;
        },
        snakeToCamelCaseProperties: function(object){
            for(var prop in object){
                if(object.hasOwnProperty(prop)){
                    var camel = prop.toCamelCase();
                    object[camel] = object[prop];
                    delete object[prop];
                }
            }
            return object;
        },
        getValueOfPropertyOrSubPropertyWithNameLike: function(wantedKeyNameNeedle, obj){
            // This function handles arrays and objects
            wantedKeyNameNeedle = wantedKeyNameNeedle.toLowerCase();
            function eachRecursive(obj){
                for(var key in obj){
                    if(!obj.hasOwnProperty(key)){
                        continue;       // skip this property
                    }
                    if(typeof obj[key] === "object" && obj[key] !== null){
                        var result = eachRecursive(obj[key]);
                        if(result){
                            return result;
                        }
                    }else{
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
        },
        removeObjectAndArrayProperties: function(obj){
            obj = JSON.parse(JSON.stringify(obj));
            for(var prop in obj){
                if(obj.hasOwnProperty(prop)){
                    if(Array.isArray(obj[prop])){
                        delete obj[prop];
                    }
                    if(typeof obj[prop] === 'object' && obj[prop] !== null){
                        delete obj[prop];
                    }
                }
            }
            return obj;
        },
        removeObjectAndArrayPropertiesForArray: function(arr){
            for(var i = 0; i < arr.length; i++){
                arr[i] = qm.objectHelper.removeObjectAndArrayProperties(arr[i]);
            }
            return arr;
        }
    },
    parameterHelper: {
        getStateUrlRootScopeOrRequestParam: function(paramName, $stateParams, $scope, $rootScope){
            if(qm.arrayHelper.variableIsArray(paramName)){
                for(var i = 0; i < paramName.length; i++){
                    var value = qm.parameterHelper.getStateUrlRootScopeOrRequestParam(paramName[i], $stateParams, $scope, $rootScope);
                    if(value !== null){
                        return value;
                    }
                }
                return null;
            }
            if(qm.urlHelper.getParam(paramName)){
                return qm.urlHelper.getParam(paramName, qm.urlHelper.getCurrentUrl(), true);
            }
            if($stateParams && $stateParams[paramName]){
                return $stateParams[paramName];
            }
            if($scope && $scope[paramName]){
                return $scope[paramName];
            }
            if($scope && $scope.state && $scope.state[paramName]){
                return $scope.state[paramName];
            }
            if($scope && $scope.state && $scope.state.requestParams && $scope.state.requestParams[paramName]){
                return $scope.state.requestParams[paramName];
            }
            if($rootScope && $rootScope[paramName]){
                return $rootScope[paramName];
            }
            return null;
        }
    },
    patient: {
        switchToPatientInNewTab: function (user) {
            qm.urlHelper.openUrlInNewTab(qm.urlHelper.getPatientHistoryUrl(user.accessToken));
        }
    },
    platform: {
        getWindow: function(){
            if(typeof window === "undefined"){
                return false;
            }
            return window;
        },
        isMobileOrChromeExtension: function(){
            return qm.platform.isMobile() || qm.platform.isChromeExtension();
        },
        isBackEnd: function(){
            return typeof window === "undefined";
        },
        isBackEndMobileOrChromeExtension: function(){
            return qm.platform.isMobile() || qm.platform.isChromeExtension() || qm.platform.isBackEnd();
        },
        isChromeExtension: function(){
            if(qm.platform.isMobile()){
                return false;
            }
            if(typeof chrome === "undefined"){
                return false;
            }
            if(typeof chrome.runtime === "undefined"){
                qm.qmLog.debug('chrome.runtime is undefined');
                return false;
            }
            if(typeof chrome.alarms === "undefined"){
                return false;
            }
            qm.qmLog.debug('isChromeExtension returns true');
            return true;
        },
        isWeb: function(){
            var isWeb = false;
            if(qm.urlHelper.indexOfCurrentUrl("https://") === 0){
                isWeb = true;
            }
            if(qm.urlHelper.indexOfCurrentUrl("http://") === 0){
                isWeb = true;
            }
            if(qm.urlHelper.indexOfCurrentUrl("http://localhost:") === 0){
                isWeb = true;
            }
            return isWeb;
        },
        isWebView: function(){
            if(qm.urlHelper.getParam('webview')){
                qm.storage.setItem('webview', true);
                return true;
            }
            if(qm.storage.getItem('webview')){
                return true;
            }
            if(qm.platform.isAndroid() || qm.platform.isIOS()){
                return false;
            }
            if(typeof ionic !== "undefined" && ionic.Platform.isWebView()){
                return true;
            }
            return false;
        },
        isWebOrChrome: function(){
            return qm.platform.isWeb() || qm.platform.isChromeExtension();
        },
        isAndroid: function(){
            if(qm.urlHelper.indexOfCurrentUrl('/android_asset/') !== -1){
                return true;
            }
            if(typeof ionic !== "undefined"){
                return ionic.Platform.isAndroid() && !qm.platform.isWeb();
            }
            return false;
        },
        isIOS: function(){
            if(typeof ionic !== "undefined"){
                return ionic.Platform.isIOS() && !qm.platform.isWeb();
            }
            return false;
        },
        isWindows: function(){
            if(typeof ionic !== "undefined"){
                return ionic.Platform.isWindowsPhone();
            }
            return false;
        },
        isMobile: function(){
            return qm.platform.isAndroid() || qm.platform.isIOS();
        },
        isMobileOrTesting: function(){
            return qm.platform.isMobile() || qm.appMode.isTesting();
        },
        getPlatformAndBrowserString: function(){
            return "platform: " + qm.platform.getCurrentPlatform() + " & browser: " + qm.platform.browser.get();
        },
        getCurrentPlatform: function(){
            if(!qm.appMode.isBrowser()){
                return "gulp";
            }
            if(qm.urlHelper.getParam('platform')){
                return qm.urlHelper.getParam('platform');
            }
            if(qm.platform.isChromeExtension()){
                return qm.platform.types.chromeExtension;
            }
            if(qm.platform.isAndroid()){
                return qm.platform.types.android;
            }
            if(qm.platform.isIOS()){
                return qm.platform.types.ios;
            }
            if(qm.platform.isWeb()){
                return qm.platform.types.web;
            }
            if(typeof ionic !== "undefined"){
                var ionicPlatform = ionic.Platform.platform();
                if(!ionic.Platform.isIPad() && !ionic.Platform.isIOS() && !ionic.Platform.isAndroid()){
                    return qm.platform.web;
                }
                qm.qmLog.error("Could not determine platform so returning " + ionicPlatform);
                return ionicPlatform;
            }else{
                qm.qmLog.error("Could not determine platform");
            }
        },
        types: {
            web: "web",
            android: "android",
            ios: "ios",
            chromeExtension: "chromeExtension"
        },
        isDevelopmentMode: function(){
            return qm.urlHelper.indexOfCurrentUrl("://localhost:") !== -1;
        },
        isDesignMode: function(){
            if(qm.appMode.isPhysician()){
                return false;
            }
            if(!qm.platform.getWindow()){
                return false;
            }
            var appSettings = qm.getAppSettings();
            if(appSettings){return appSettings.designMode;}
            return false;
        },
        browser: {
            get: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                if(qm.platform.browser.isChromeBrowser()){
                    return "chrome";
                }
                if(qm.platform.browser.isFirefox()){
                    return "firefox";
                }
                if(qm.platform.browser.isEdge()){
                    return "edge";
                }
                if(qm.platform.browser.isIE()){
                    return "ie";
                }
                if(qm.platform.browser.isSafari()){
                    return "safari";
                }
                if(qm.platform.browser.isOpera()){
                    return "opera";
                }
                if(qm.platform.browser.isBlink()){
                    return "blink";
                }
            },
            isFirefox: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                return typeof InstallTrigger !== 'undefined';
            },
            isChromeBrowser: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                return typeof window.chrome !== "undefined"
            },
            isEdge: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                return !qm.platform.browser.isIE() && !!window.StyleMedia;
            },
            isIE: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                return /*@cc_on!@*/!!document.documentMode;
            },
            isSafari: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                return /constructor/i.test(window.HTMLElement) || (function(p){
                    return p.toString() === "[object SafariRemoteNotification]";
                })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
            },
            isOpera: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                // noinspection JSUnresolvedVariable
                return (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            },
            isBlink: function(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                return (qm.platform.browser.isChromeBrowser() || qm.platform.browser.isOpera()) && !!window.CSS;
            }
        }
    },
    pouch: {
        enabled: false,
        db: null,
        getDb: function(){
            if(qm.db && qm.pouch.dbName === qm.auth.getAccessToken()){
                return qm.db;
            }
            if(!qm.auth.getAccessToken()){
                qm.pouch.dbName = 'public';
            }else{
                qm.pouch.dbName = qm.auth.getAccessToken();
            }
            return qm.db = new PouchDB('http://localhost:5984/' + qm.pouch.dbName);
        },
        dbName: null
    },
    push: {
        getLastPushTimeStampInSeconds: function(){
            return qm.storage.getItem(qm.items.lastPushTimestamp);
        },
        getHoursSinceLastPush: function(){
            return Math.round((qm.timeHelper.secondsAgo(qm.push.getLastPushTimeStampInSeconds())) / 3600);
        },
        getMinutesSinceLastPush: function(){
            return Math.round((qm.timeHelper.secondsAgo(qm.push.getLastPushTimeStampInSeconds())) / 60);
        },
        getTimeSinceLastPushString: function(){
            return qm.timeHelper.getTimeSinceString(qm.push.getLastPushTimeStampInSeconds());
        },
        enabled: function(){
            var u = qm.userHelper.getUserFromLocalStorage();
            if(!u){ return false; }
            return u.pushNotificationsEnabled;
        },
        logPushReceived: function(pushData){
            pushData.receivedAt = qm.timeHelper.getCurrentLocalDateAndTime();
            qm.localForage.addToArrayWithLimit(qm.items.pushLog, 20, pushData);
        },
        checkHoursSinceLastPushNotificationReceived: function(){
            if(!qm.qmService){return;}
            //if(!$rootScope.platform.isMobile){return;}  // We get pushes from web now, too
            if(!qm.push.getLastPushTimeStampInSeconds()){
                qmLog.warn("Push never received!");
                qm.qmService.configurePushNotifications();
            }
            if(qm.push.getMinutesSinceLastPush() > qm.notifications.getMostFrequentReminderIntervalInMinutes()){
                qmLog.errorOrDebugIfTesting("No pushes received in last " + qm.notifications.getMostFrequentReminderIntervalInMinutes() +
                    "minutes (most frequent reminder period)!", "Last push was " + qm.push.getHoursSinceLastPush() + " hours ago!");
                qm.qmService.configurePushNotifications();
            }
        }
    },
    qmService: null,
    reminderHelper: {
        addToQueue: function(reminder){
            qm.storage.addToOrReplaceByIdAndMoveToFront(qm.items.trackingReminderSyncQueue, reminder);
            if(qm.qmService){
                qm.qmService.reminders.broadcastGetTrackingReminders();
            }
        },
        getNumberOfReminders: function(callback){
            var number = qm.reminderHelper.getNumberOfTrackingRemindersInLocalStorage();
            if(!callback){
                return number;
            }
            if(number){
                callback(number);
                return number;
            }
            qm.reminderHelper.getTrackingRemindersFromApi({}, function(){
                number = qm.reminderHelper.getNumberOfTrackingRemindersInLocalStorage();
                callback(number);
            });
        },
        getNumberOfVariablesWithLocalReminders: function(callback){
            var reminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            var number = 0;
            if(reminders){
                var unique = qm.arrayHelper.getUnique(reminders, 'variableId');
                number = unique.length;
            }
            if(callback){
                callback(number);
            }
            return number;
        },
        getTrackingRemindersFromApi: function(params, successHandler, errorHandler){
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.RemindersApi();
            function callback(error, trackingReminders, response){
                if(trackingReminders){
                    qm.reminderHelper.saveToLocalStorage(trackingReminders, function(){
                        qm.userVariables.refreshIfNumberOfRemindersGreaterThanUserVariables();
                    });
                }
                qm.api.generalResponseHandler(error, trackingReminders, response, successHandler, errorHandler, params, 'getTrackingRemindersFromApi');
            }
            params = qm.api.addGlobalParams(params);
            apiInstance.getTrackingReminders(params, callback);
        },
        getNumberOfTrackingRemindersInLocalStorage: function(){
            var trackingReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            if(trackingReminders && trackingReminders.length){
                return trackingReminders.length;
            }
            return 0;
        },
        getTrackingRemindersFromLocalStorage: function(params){
            var reminders = qm.storage.getElementsWithRequestParams(qm.items.trackingReminders, params);
            reminders = reminders || [];
            reminders = qm.arrayHelper.removeDuplicatesById(reminders);
            reminders.forEach(function (r){
                qm.unitHelper.setInputType(r);
            })
            return reminders;
        },
        getMostFrequentReminderIntervalInSeconds: function(trackingReminders){
            if(!trackingReminders){
                trackingReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            }
            var mostFrequentReminderIntervalInSeconds = 86400;
            if(trackingReminders){
                for(var i = 0; i < trackingReminders.length; i++){
                    var currentFrequency = trackingReminders[i].reminderFrequency;
                    if(currentFrequency && currentFrequency < mostFrequentReminderIntervalInSeconds){
                        mostFrequentReminderIntervalInSeconds = currentFrequency;
                    }
                }
            }
            return mostFrequentReminderIntervalInSeconds;
        },
        saveToLocalStorage: function(trackingReminders, successHandler){
            trackingReminders = qm.arrayHelper.unsetNullProperties(trackingReminders);
            var sizeInKb = qm.arrayHelper.getSizeInKiloBytes(trackingReminders);
            if(sizeInKb > 2000){
                trackingReminders = qm.reminderHelper.removeArchivedReminders(trackingReminders);
            }
            var mostFrequentReminderIntervalInSeconds = qm.reminderHelper.getMostFrequentReminderIntervalInSeconds(trackingReminders);
            qm.storage.setItem(qm.items.mostFrequentReminderIntervalInSeconds, mostFrequentReminderIntervalInSeconds);
            qm.storage.setItem(qm.items.trackingReminders, trackingReminders);
            if(successHandler){
                successHandler(trackingReminders);
            }
        },
        removeArchivedReminders: function(allReminders){
            var activeReminders = qm.reminderHelper.getActive(allReminders);
            var favorites = qm.reminderHelper.getFavorites(allReminders);
            return activeReminders.concat(favorites);
        },
        getFavorites: function(allReminders){
            if(allReminders && !Array.isArray(allReminders) && allReminders.data){allReminders = allReminders.data;}
            if(!allReminders){
                allReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            }
            if(!allReminders){
                return [];
            }
            if(typeof allReminders.filter !== "function"){
                qm.qmLog.error("Cannot filter allReminders", {allReminders: allReminders});
                return [];
            }
            var favorites = allReminders.filter(function(trackingReminder){
                return trackingReminder.reminderFrequency === 0;
            });
            return qm.arrayHelper.removeDuplicatesByProperty(favorites, 'variableId')
        },
        getActive: function(allReminders){
            if(!allReminders){
                allReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            }
            if(!allReminders){
                return [];
            }
            return allReminders.filter(function(trackingReminder){
                return trackingReminder.reminderFrequency !== 0 &&
                    trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') === -1;
            });
        },
        getArchived: function(allReminders){
            if(!allReminders){
                allReminders = qm.reminderHelper.getTrackingRemindersFromLocalStorage();
            }
            return allReminders.filter(function(trackingReminder){
                return trackingReminder.reminderFrequency !== 0 &&
                    trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') !== -1;
            });
        },
        separateFavoritesAndArchived: function(reminders){
            reminders = qm.reminderHelper.validateReminderArray(reminders);
            var separated = {allTrackingReminders: reminders};
            qmLog.debug('separateFavoritesAndArchived: allTrackingReminders is: ', reminders);
            try{
                separated.favorites = reminders.filter(function(r){
                    return r.reminderFrequency === 0;
                });
            }catch (error){
                // TODO: Why is this necessary?
                qmLog.error(error, "trying again after JSON.parse(JSON.stringify(trackingReminders)). Why is this necessary?", {trackingReminders: reminders});
                reminders = JSON.parse(JSON.stringify(reminders));
                separated.favorites = qm.reminderHelper.getFavorites(reminders);
                //reminderTypesArray.favorites = [];
            }
            try{
                separated.trackingReminders = qm.reminderHelper.getActive(reminders);
            }catch (error){
                qmLog.error(error, {trackingReminders: reminders});
            }
            try{
                separated.archivedTrackingReminders = qm.reminderHelper.getArchived(reminders);
            }catch (error){
                qmLog.error(error, {trackingReminders: reminders});
            }
            return separated;
        },
        filterByCategoryAndSeparateFavoritesAndArchived: function(reminders, variableCategoryName){
            reminders = qm.reminderHelper.validateReminderArray(reminders);
            if(variableCategoryName){
                reminders = reminders.filter(function(r){
                    return r.variableCategoryName.toLowerCase() === variableCategoryName.toLowerCase();
                })
            }
            reminders = qm.reminderHelper.validateReminderArray(reminders);
            //if(!trackingReminders || !trackingReminders.length){return {};}
            for(var i = 0; i < reminders.length; i++){
                reminders[i].total = null;
                if(typeof reminders[i].defaultValue === "undefined"){
                    reminders[i].defaultValue = null;
                }
            }
            qm.api.addVariableCategoryAndUnit(reminders);
            reminders = qm.reminderHelper.validateReminderArray(reminders);
            return qm.reminderHelper.separateFavoritesAndArchived(reminders);
        },
        validateReminderArray: function(reminders){
            if(reminders && !Array.isArray(reminders) && reminders.data){reminders = reminders.data;}
            if(!Array.isArray(reminders)){
                console.error("Reminders should be array but is: ", reminders);
                throw "Reminders should be array"
            }
            reminders = qm.arrayHelper.removeArrayElementsWithDuplicateIds(reminders, 'reminder')
            return reminders;
        },
        syncPromise: null,
        syncTrackingReminders: function(force){
            if(qm.reminderHelper.syncPromise){
                qmLog.debug("Returning existing qm.reminderHelper.syncPromise");
                return qm.reminderHelper.syncPromise;
            }
            var deferred = Q.defer();
            var queue = qm.reminderHelper.getQueue();
            if(queue && queue.length){
                qmLog.debug('syncTrackingReminders: trackingReminderSyncQueue NOT empty so posting trackingReminders: ', null, queue);
                qmLog.info("Syncing " + queue.length + " reminders in queue");
                var postTrackingRemindersToApiAndHandleResponse = function(){
                    qm.reminderHelper.postTrackingRemindersToApi(queue, function(response){
                        qmLog.debug('postTrackingRemindersToApi response: ', response);
                        if(response && response.data){
                            if(response.data.userVariables){
                                qm.variablesHelper.saveToLocalStorage(response.data.userVariables);
                            }
                            if(!response.data.trackingReminders){
                                qmLog.error("No response.trackingReminders returned from postTrackingRemindersDeferred")
                            }else if(!response.data.trackingReminders.length){
                                qmLog.error("response.trackingReminders is an empty array in postTrackingRemindersDeferred")
                            }else{
                                if(qm.qmService){
                                    qm.qmService.scheduleSingleMostFrequentLocalNotification(response.data.trackingReminders);
                                }
                                qm.reminderHelper.saveToLocalStorage(response.data.trackingReminders);
                                qm.storage.removeItem(qm.items.trackingReminderSyncQueue);
                                if(qm.qmService){
                                    qm.qmService.reminders.broadcastGetTrackingReminders();
                                }
                            }
                            if(!response.data.trackingReminderNotifications){
                                qmLog.error("No response.trackingReminderNotifications returned from postTrackingRemindersDeferred")
                            }else if(!response.data.trackingReminderNotifications.length){
                                qmLog.error("response.trackingReminderNotifications is an empty array in postTrackingRemindersDeferred")
                            }else{
                                // Don't update inbox because it might add notifications that we have already tracked since the API returned these ones
                                //putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data.trackingReminderNotifications);
                                var notifications = response.data.trackingReminderNotifications;
                                var notificationExists = false;
                                for(var i = 0; i < notifications.length; i++){
                                    if(notifications[i].variableName === queue[0].variableName){
                                        notificationExists = true;
                                        break;
                                    }
                                }
                                if(!notificationExists && queue[0].reminderFrequency && !queue[0].stopTrackingDate){
                                    qmLog.error("Notification not found for reminder we just created!",{'reminder': queue[0]});
                                }
                                qmLog.info("Got " + notifications.length +
                                    " notifications to from postTrackingRemindersDeferred response",
                                    {notifications: notifications});
                                qm.storage.setTrackingReminderNotifications(notifications);
                                if(qm.qmService){
                                    qm.qmService.notifications.broadcastGetTrackingReminderNotifications();
                                }
                            }
                        }else{
                            qmLog.error("No postTrackingRemindersToApi response.data!");
                        }
                        deferred.resolve(response);
                    }, function(error){
                        deferred.reject(error);
                    });
                };
                qm.notifications.syncIfQueued().then(function(){
                    postTrackingRemindersToApiAndHandleResponse();
                }, function (err){
                    postTrackingRemindersToApiAndHandleResponse();
                    deferred.reject(err);
                })
            }else{
                qmLog.info('syncTrackingReminders: trackingReminderSyncQueue empty so just fetching trackingReminders from API');
                qm.reminderHelper.getTrackingRemindersFromApi({force: force}, function(reminders){
                    if(qm.reminderHelper.getActive(reminders) && qm.reminderHelper.getActive(reminders).length){
                        qm.push.checkHoursSinceLastPushNotificationReceived();
                        if(qm.qmService){
                            qm.qmService.notifications.getDrawOverAppsPopupPermissionIfNecessary();
                            qm.qmService.scheduleSingleMostFrequentLocalNotification(reminders);
                        }
                    }
                    reminders = qm.reminderHelper.validateReminderArray(reminders);
                    deferred.resolve(reminders);
                    qm.reminderHelper.syncPromise = null;
                }, function(error){
                    qmLog.error(error);
                    deferred.reject(error);
                    qm.reminderHelper.syncPromise = null;
                });
            }
            qm.reminderHelper.syncPromise = deferred.promise;
            setTimeout(function(){
                qm.reminderHelper.syncPromise = null;
            }, 20000);
            return deferred.promise;
        },
        postTrackingRemindersToApi: function(reminders, successHandler, errorHandler){
            qmLog.debug('postTrackingRemindersToApi: ', reminders);
            qmLog.info('posting' + reminders.length + " Tracking Reminders To Api");
            if(!(reminders instanceof Array)){
                reminders = [reminders];
            }
            reminders[0] = qm.timeHelper.addTimeZoneOffsetProperty(reminders[0]);
            // Get rid of card objects, available unit array and variable category object to decrease size of body
            reminders = qm.objectHelper.removeObjectAndArrayPropertiesForArray(reminders);
            qm.api.post('api/v3/trackingReminders', reminders, successHandler, errorHandler);
        },
        getValueAndFrequencyTextDescriptionWithTime: function(tr){
            if(tr.reminderFrequency === 86400){
                if(tr.unitCategoryName === 'Rating'){
                    return 'Daily at ' + qm.timeHelper.humanFormat(tr.reminderStartTimeLocal);
                }
                if(tr.defaultValue){
                    return tr.defaultValue + ' ' + tr.unitAbbreviatedName + ' daily at ' +
                        qm.timeHelper.humanFormat(tr.reminderStartTimeLocal);
                }
                return 'Daily at ' + qm.timeHelper.humanFormat(tr.reminderStartTimeLocal);
            }else if(tr.reminderFrequency === 0){
                if(tr.unitCategoryName === "Rating"){
                    return "As-Needed";
                }
                if(tr.defaultValue){
                    return tr.defaultValue + ' ' + tr.unitAbbreviatedName + ' as-needed';
                }
                return "As-Needed";
            }else{
                if(tr.unitCategoryName === 'Rating'){
                    return 'Rate every ' + tr.reminderFrequency / 3600 + " hours";
                }
                if(tr.defaultValue){
                    return tr.defaultValue + ' ' + tr.unitAbbreviatedName +
                        ' every ' + tr.reminderFrequency / 3600 + " hours";
                }
                return 'Every ' + tr.reminderFrequency / 3600 + " hours";
            }
        },
        getQueue: function(){
            var queue = qm.storage.getItem(qm.items.trackingReminderSyncQueue) || [];
            return queue;
        },
        getCached: function(){
            var unfiltered = qm.storage.getItem(qm.items.trackingReminders) || [];
            return unfiltered;
        },
        getReminders: function(variableCategoryName){
            var deferred = Q.defer();
            var filtered = [];
            var unfiltered = qm.reminderHelper.getCached();
            var queue = qm.reminderHelper.getQueue();
            unfiltered = unfiltered.concat(queue);
            qm.api.addVariableCategoryAndUnit(unfiltered);
            if(variableCategoryName && variableCategoryName !== 'Anything'){
                for(var j = 0; j < unfiltered.length; j++){
                    if(variableCategoryName === unfiltered[j].variableCategoryName){
                        filtered.push(unfiltered[j]);
                    }
                }
            }else{
                filtered = unfiltered;
            }
            filtered = qm.reminderHelper.addRatingTimesToDailyReminders(filtered); //We need to keep this in case we want offline reminders
            filtered = qm.reminderHelper.validateReminderArray(filtered);
            if(filtered && filtered.length){
                deferred.resolve(filtered);
            }else{
                qm.reminderHelper.syncTrackingReminders().then(function(reminders){
                    reminders = qm.reminderHelper.validateReminderArray(reminders);
                    deferred.resolve(reminders);
                });
            }
            return deferred.promise;
        },
        addRatingTimesToDailyReminders: function(reminders){
            var index;
            for(index = 0; index < reminders.length; ++index){
                var description = reminders[index].valueAndFrequencyTextDescription;
                if(description &&
                    description.indexOf('daily') > 0 &&
                    description.indexOf(' at ') === -1 &&
                    description.toLowerCase().indexOf('disabled') === -1){
                    reminders[index].valueAndFrequencyTextDescription = description + ' at ' +
                        qm.reminderHelper.convertReminderTimeStringToMoment(reminders[index].reminderStartTime).format("h:mm A");
                }
            }
            return reminders;
        },
        convertReminderTimeStringToMoment: function(reminderTimeString){
            var now = new Date();
            var hourOffsetFromUtc = now.getTimezoneOffset() / 60;
            var parsedReminderTimeUtc = reminderTimeString.split(':');
            var minutes = parsedReminderTimeUtc[1];
            var hourUtc = parseInt(parsedReminderTimeUtc[0]);
            var localHour = hourUtc - parseInt(hourOffsetFromUtc);
            if(localHour > 23){
                localHour = localHour - 24;
            }
            if(localHour < 0){
                localHour = localHour + 24;
            }
            return moment().hours(localHour).minutes(minutes);
        },
        deleteLocalReminder: function(reminderToDelete){
            var allTrackingReminders = qm.reminderHelper.getCached();
            var keep = [];
            allTrackingReminders.forEach(function(one, key){
                if(!(one.variableName === reminderToDelete.variableName &&
                    one.reminderFrequency === reminderToDelete.reminderFrequency &&
                    one.reminderStartTime === reminderToDelete.reminderStartTime)){
                    keep.push(one);
                }
            });
            qm.storage.setItem('trackingReminders', keep);
        },
        deleteReminder: function(tr){
            var deferred = Q.defer();
            qm.reminderHelper.deleteLocalReminder(tr);
            qm.toast.infoToast("Deleted " + tr.variableName);
            var id = tr.trackingReminderId || tr.id;
            if(!id){
                deferred.resolve();
                qmLog.error('No reminder id to delete with!  Maybe it has only been stored locally and has not updated from server yet.');
                return deferred.promise;
            }
            qm.storage.deleteByProperty(qm.items.trackingReminderNotifications, 'trackingReminderId', id);
            qm.api.post('api/v3/trackingReminders/delete',{id: id}, function(response){
                // Delete again in case we refreshed before deletion completed
                qm.reminderHelper.deleteLocalReminder(tr);
                deferred.resolve(response);
            }, function(error){
                qm.reminderHelper.deleteLocalReminder(tr);
                deferred.reject(error); // Not sure why this is returning error on successful deletion
            });
            return deferred.promise;
        }
    },
    ratingImages: {
        positive: [
            'img/rating/face_rating_button_256_depressed.png',
            'img/rating/face_rating_button_256_sad.png',
            'img/rating/face_rating_button_256_ok.png',
            'img/rating/face_rating_button_256_happy.png',
            'img/rating/face_rating_button_256_ecstatic.png'
        ],
        negative: [
            'img/rating/face_rating_button_256_ecstatic.png',
            'img/rating/face_rating_button_256_happy.png',
            'img/rating/face_rating_button_256_ok.png',
            'img/rating/face_rating_button_256_sad.png',
            'img/rating/face_rating_button_256_depressed.png'
        ],
        numeric: [
            'img/rating/numeric_rating_button_256_1.png',
            'img/rating/numeric_rating_button_256_2.png',
            'img/rating/numeric_rating_button_256_3.png',
            'img/rating/numeric_rating_button_256_4.png',
            'img/rating/numeric_rating_button_256_5.png'
        ],
        getRatingInfo: function(){
            return {
                1: {
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                    positiveImage: qm.ratingImages.positive[0],
                    negativeImage: qm.ratingImages.negative[0],
                    numericImage: qm.ratingImages.numeric[0],
                },
                2: {
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                    positiveImage: qm.ratingImages.positive[1],
                    negativeImage: qm.ratingImages.negative[1],
                    numericImage: qm.ratingImages.numeric[1],
                },
                3: {
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                    positiveImage: qm.ratingImages.positive[2],
                    negativeImage: qm.ratingImages.negative[2],
                    numericImage: qm.ratingImages.numeric[2],
                },
                4: {
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                    positiveImage: qm.ratingImages.positive[3],
                    negativeImage: qm.ratingImages.negative[3],
                    numericImage: qm.ratingImages.numeric[3],
                },
                5: {
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                    positiveImage: qm.ratingImages.positive[4],
                    negativeImage: qm.ratingImages.negative[4],
                    numericImage: qm.ratingImages.numeric[4],
                }
            }
        }
    },
    memories: {
        recall: function(memoryQuestionQuestion){
            qm.localForage.getItem(qm.items.memories, function(memories){
                memories = memories || {};
                var response = "I'm afraid I don't know " + memoryQuestionQuestion + ".  Say Remember " + memoryQuestionQuestion +
                    " so I'll know in the future. ";
                if(!memories[memoryQuestionQuestion]){
                    qm.objectHelper.loopThroughProperties(memories, function(memoryQuestionQuestion, memoryQuestionAnswer){
                        response += " Or say Recall " + memoryQuestionQuestion + ". ";
                    });
                }else{
                    response = memories[memoryQuestionQuestion];
                }
                qm.speech.talkRobot(response);
            }, function(error){
                qm.qmLog.error(error);
            });
        },
        askForMemoryAnswer: function(memoryQuestionStatement){
            qm.localForage.getItem(qm.items.memories, function(memories){
                memories = memories || {};
                var response;
                var memoryQuestionQuestion = memoryQuestionStatement;
                if(memoryQuestionStatement.indexOf(' my ') !== -1 && memoryQuestionStatement.indexOf(" are") !== -1){
                    memoryQuestionQuestion = memoryQuestionStatement.replace(" are", "").replace(" my ", " are your ");
                    response = "OK. " + memoryQuestionQuestion + "? ";
                }else{
                    response = "OK. What should I say when you say Recall " + memoryQuestionStatement + "? ";
                }
                qm.mic.wildCardHandler = function(possiblePhrases){
                    if(qm.mic.weShouldIgnore(possiblePhrases)){
                        return false;
                    }
                    qm.mic.wildCardHandlerReset();
                    var memoryQuestionAnswer = qm.arrayHelper.getFirstElementIfArray(possiblePhrases);
                    memories[memoryQuestionQuestion] = memoryQuestionAnswer;
                    memories[memoryQuestionStatement] = memoryQuestionAnswer;
                    qm.localForage.setItem(qm.items.memories, memories, function(){
                        qm.speech.talkRobot("OK. When you want me to remind you, just say Recall " + memoryQuestionStatement + "! ");
                    })
                };
                qm.speech.talkRobot(response);
            }, function(error){
                qm.qmLog.error(error);
            });
        }
    },
    robot: {
        showing: false,
        openMouth: function(){
            if(qm.robot.getClass()){
                qm.robot.getClass().classList.add('robot_speaking');
            }
        },
        closeMouth: function(){
            if(qm.robot.getClass()){
                qm.robot.getClass().classList.remove('robot_speaking');
            }
        },
        hideRobot: function(){
            qm.qmLog.info("Hiding robot");
            if(qm.robot.getElement()){
                qm.robot.getElement().style.display = "none";
            }
            qm.robot.showing = qm.rootScope.showRobot = false;
        },
        showRobot: function(){
            if(!qm.speech.getSpeechAvailable()){
                return;
            }
            var robot = qm.robot.getElement();
            if(!robot){
                qm.qmLog.info("No robot!");
                return false;
            }
            qm.qmLog.info("Showing robot");
            qm.robot.getElement().style.display = "block";
            qm.robot.showing = qm.rootScope.showRobot = true;
        },
        getElement: function(){
            var element = document.querySelector('#robot');
            return element;
        },
        getClass: function(){
            var element = document.querySelector('.robot');
            return element;
        },
        toggle: function(){
            if(qm.robot.showing){
                qm.robot.hideRobot();
            }else{
                qm.robot.showRobot();
            }
        },
        onRobotClick: function(){
            qm.qmLog.info("onRobotClick called but not defined");
        }
    },
    rootScope: {
        showRobot: false
    },
    serviceWorker: false,
    speech: {
        alreadySpeaking: function(text){
            if(!qm.platform.getWindow()){
                return false;
            }
            if(window.speechSynthesis && window.speechSynthesis.speaking){
                qm.qmLog.info("already speaking so not going to say " + text);
                return true;
            }else{
                return false;
            }
        },
        initializeSpeechKit: function(qmService){
            var commands = {
                'record a measurement': function(){
                    qm.qmLog.info("said " + arguments.callee.toString());
                    qmService.goToState(qm.staticData.stateNames.measurementAddSearch)
                },
            };
            qm.mic.addCommands(commands);
            // Tell KITT to use annyang
            SpeechKITT.annyang();
            // Define a stylesheet for KITT to use
            SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/1.0.0/themes/flat.css');
            // Render KITT's interface
            SpeechKITT.vroom();
        },
        currentIntent: {
            name: "",
            parameters: {}
        },
        currentInputField: null,
        config: {
            DEFAULT: false, // false will override system default voice
            //VOICE: 'Fred',
            VOICE: 'Google UK English Female'
        },
        defaultAction: function(){
            qm.speech.deepThought();
        },
        lastUtterance: false,
        pendingUtteranceText: false,
        speechAvailable: null,
        getSpeechEnabled: function(){
            if(!qm.speech.getSpeechAvailable()){
                return qm.speech.setSpeechEnabled(false);
            }
            return qm.storage.getItem(qm.items.speechEnabled);
        },
        setSpeechEnabled: function(value){
            qm.qmLog.info("set speechEnabled " + value);
            if(!value){
                qm.speech.shutUpRobot();
                qm.music.fadeOut();
            }else{
                //qm.speech.iCanHelp();  // Causes this sometimes: Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first
            }
            qm.rootScope[qm.items.speechEnabled] = value;
            return qm.storage.setItem(qm.items.speechEnabled, value);
        },
        getSpeechAvailable: function(){
            if(qm.platform.isMobile()){
                return false;
            }
            if(qm.speech.speechAvailable !== null){
                return qm.speech.speechAvailable;
            }
            if(typeof speechSynthesis === "undefined"){
                var message = "Speech not available on " + qm.platform.getPlatformAndBrowserString();
                if(qm.platform.browser.isFirefox()){
                    qm.qmLog.info(message);
                } else if(!qm.appMode.isTesting() || qm.platform.isMobile()){
                    qm.qmLog.error(message);
                }
                return qm.speech.speechAvailable = qm.speech.speechEnabled = false;
            }
            qm.qmLog.debug("speechSynthesis is available");
            var isWebBrowser = qm.platform.isWeb();
            var isChromeBrowser = qm.platform.browser.isChromeBrowser();
            if(isWebBrowser && !isChromeBrowser){
                if(!qm.appMode.isTesting()){
                    qm.qmLog.debug("Speech only available on Chrome browser.  Current " + qm.platform.getPlatformAndBrowserString());
                }
                // TODO: Why is this necessary if we already check typeof speechSynthesis === "undefined"
                return qm.speech.speechAvailable = qm.speech.speechEnabled = false;
            }
            return qm.speech.speechAvailable = true;
        },
        shutUpRobot: function(resumeListening){
            if(!qm.speech.speechAvailable){
                return;
            }
            qm.robot.closeMouth();
            speechSynthesis.cancel();
            if(resumeListening){
                if(!qm.mic.getMicEnabled()){
                    qm.qmLog.info("Not going to resume listening because mic not enabled");
                    return;
                }
                var duration = 1.5;
                qm.qmLog.info("Will resume listening in " + duration + " seconds...");
                setTimeout(function(){
                    qm.mic.resumeListening();
                }, duration * 1000);
            }else{
                qm.qmLog.debug("Not listening");
            }
        },
        fallbackMessageIndex: 0,
        fallbackMessage: function(tag){
            var messages = qm.staticData.dialogAgent.intents["Default Fallback Intent"].responses["0"].messages;
            if(tag){
                messages.unshift("I'm kind of an idiot, ! . ! . ! . ! and I'm not sure how to handle the response " + tag +
                    ". ! . ! . ! . ! You can say a number ! . ! . ! . ! or skip ! . ! . ! . !" +
                    " or ! . ! . ! . ! snooze ! . ! . ! . ! or yes or no. ! . ! . ! . ! Thank you for loving me despite my many failures in life!");
            }
            messages.push("Say what?");
            var index = (qm.speech.fallbackMessageIndex < messages.length) ? qm.speech.fallbackMessageIndex : messages.length - 1;
            qm.speech.fallbackMessageIndex++;
            qm.speech.talkRobot(messages[index]);
        },
        afterNotificationMessages: ['Yummy data!'],
        utterances: [],
        sayIfNotInRecentStatements: function(text, callback, resumeListening){
            if(!qm.speech.recentlySaid(text)){
                qm.speech.talkRobot(text, callback, resumeListening)
            }
        },
        askQuestion: function(text, commands, successHandler, errorHandler){
            if(!qm.speech.getSpeechEnabled()){
                if(errorHandler){
                    errorHandler("Speech not enabled");
                }
                return false;
            }
            qm.speech.talkRobot(text, function(){
                qm.mic.initializeListening(commands);
            });
        },
        askYesNoQuestion: function(text, yesCallback, noCallback){
            qm.speech.askQuestion(text, {"yes": yesCallback, "no": noCallback});
        },
        recentStatements: {},
        addToRecentlySaid: function(text){
            qm.speech.recentStatements[text] = qm.timeHelper.getUnixTimestampInSeconds();
        },
        recentlySaid: function(text, maxFrequencyInSeconds){
            var lastSaidSeconds = qm.speech.recentStatements[text];
            var currentSeconds = qm.timeHelper.getUnixTimestampInSeconds();
            if(lastSaidSeconds){
                var secondsAgo = currentSeconds - lastSaidSeconds;
                if(!maxFrequencyInSeconds || secondsAgo < maxFrequencyInSeconds){
                    qm.qmLog.info("Already said " + text + " " + secondsAgo + " seconds ago");
                    return true;
                }
            }
            qm.speech.addToRecentlySaid(text);
            return false;
        },
        iCanHelp: function(successHandler, errorHandler){
            if(qm.speech.recentlySaid('sound/i-can-help.wav')){
                return;
            }
            var result = qm.music.play('sound/i-can-help.wav', 0.5, function(){
                qm.robot.closeMouth();
            }, errorHandler);
            if(result){
                qm.robot.openMouth();
            }
        },
        talkRobot: function(text, successHandler, errorHandler, resumeListening){
            qm.qmLog.info("talkRobot: " + text);
            if(!qm.speech.getSpeechAvailable()){
                if(errorHandler){
                    errorHandler("Speech not available so cannot say " + text);
                }
                return false;
            }
            if(!qm.speech.getSpeechEnabled()){
                if(errorHandler){
                    errorHandler("Speech not enabled so cannot say " + text);
                }
                return false;
            }
            if(qm.speech.alreadySpeaking(text)){
                if(errorHandler){
                    errorHandler("Already speaking so cannot say " + text);
                }
                return false;
            }
            if(qm.speech.lastUtterance && qm.speech.lastUtterance.text === text){
                if(errorHandler){
                    errorHandler("Already said " + text + " last time");
                }
                return false;
            }
            qm.speech.addToRecentlySaid(text);
            speechSynthesis.cancel();
            qm.speech.callback = successHandler;
            if(!text){
                var message = "No text provided to talkRobot";
                if(errorHandler){
                    errorHandler(message);
                }
                return false;
            }
            qm.qmLog.info("talkRobot called with " + text);
            qm.mic.addIgnoreCommand(text);
            var voices = speechSynthesis.getVoices();
            if(!voices.length){
                qm.qmLog.info("Waiting for voices to load with " + text);
                qm.speech.pendingUtteranceText = text;
                setTimeout(function(){ // Listener never fires sometimes
                    qm.qmLog.info("Timeout with " + text);
                    if(qm.speech.pendingUtteranceText){
                        qm.speech.talkRobot(qm.speech.pendingUtteranceText);
                    }
                }, 1000);
                speechSynthesis.addEventListener('voiceschanged', function(event){
                    qm.qmLog.info("Voices loaded with " + text);
                    //if(qm.speech.pendingUtteranceText){qm.speech.talkRobot(qm.speech.pendingUtteranceText);}
                });
                return;
            }
            var utterance = new SpeechSynthesisUtterance();
            function resumeInfinity(){
                if(qm.platform.isMobile()){
                    qm.qmLog.info("speechSynthesis.resume not implemented on mobile yet");
                    return;
                }
                if(!qm.platform.getWindow()){
                    return false;
                }
                window.speechSynthesis.resume();
                qm.speech.timeoutResumeInfinity = setTimeout(resumeInfinity, 3000);
            }
            utterance.onstart = function(event){
                resumeInfinity();
            };
            utterance.onerror = function(event){
                var message = 'An error has occurred with the speech synthesis: ' + event.error;
                qm.qmLog.error(message);
                if(errorHandler){
                    errorHandler(message);
                }
            };
            utterance.text = text;
            utterance.pitch = 1;
            utterance.volume = 0.5;
            utterance.voice = voices.find(function(voice){
                return voice.name === qm.speech.config.VOICE;
            });
            qm.robot.openMouth();
            //qm.mic.pauseListening(hideVisualizer);
            if(qm.mic.isListening()){
                qm.qmLog.debug("annyang still listening!")
            }
            qm.speech.utterances.push(utterance); // https://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working
            console.info("speechSynthesis.speak(utterance)", utterance);
            utterance.onend = function(event){
                clearTimeout(qm.speech.timeoutResumeInfinity);
                if(qm.mic.isListening()){
                    qm.qmLog.debug("annyang still listening before shutup")
                }
                qm.qmLog.info("Utterance ended for " + text);
                qm.speech.shutUpRobot(resumeListening);
                if(successHandler){
                    successHandler();
                }
            };
            qm.speech.lastUtterance = utterance;
            speechSynthesis.speak(utterance);
            //pass it into the chunking function to have it played out.
            //you can set the max number of characters by changing the chunkLength property below.
            //a callback function can also be added that will fire once the entire text has been spoken.
            //qm.speech.speechUtteranceChunker(utterance, {chunkLength: 120 }, function () {console.log('some code to execute when done');});
            qm.speech.pendingUtteranceText = false;
        },
        speechUtteranceChunker: function(utt, settings, callback){
            settings = settings || {};
            var newUtt;
            var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);
            if(utt.voice && utt.voice.voiceURI === 'native'){ // Not part of the spec
                newUtt = utt;
                newUtt.text = txt;
                newUtt.addEventListener('end', function(){
                    if(speechUtteranceChunker.cancel){
                        speechUtteranceChunker.cancel = false;
                    }
                    if(callback !== undefined){
                        callback();
                    }
                });
            }else{
                var chunkLength = (settings && settings.chunkLength) || 160;
                var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
                var chunkArr = txt.match(pattRegex);
                if(chunkArr[0] === undefined || chunkArr[0].length <= 2){
                    //call once all text has been spoken...
                    if(callback !== undefined){
                        callback();
                    }
                    return;
                }
                var chunk = chunkArr[0];
                newUtt = new SpeechSynthesisUtterance(chunk);
                var x;
                for(x in utt){
                    if(utt.hasOwnProperty(x) && x !== 'text'){
                        newUtt[x] = utt[x];
                    }
                }
                newUtt.addEventListener('end', function(){
                    if(speechUtteranceChunker.cancel){
                        speechUtteranceChunker.cancel = false;
                        return;
                    }
                    settings.offset = settings.offset || 0;
                    settings.offset += chunk.length - 1;
                    speechUtteranceChunker(utt, settings, callback);
                });
            }
            if(settings.modifier){
                settings.modifier(newUtt);
            }
            console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
            //placing the speak invocation inside a callback fixes ordering and onend issues.
            setTimeout(function(){
                speechSynthesis.speak(newUtt);
            }, 0);
        },
        deepThought: function(callback){
            var deepThoughts = qm.staticData.deepThoughts;
            var deepThought = deepThoughts[[Math.floor(Math.random() * (deepThoughts.length - 1))]];
            qm.speech.talkRobot(deepThought.text + "! . ! . !", callback);
        },
        isValidNotificationResponse: function(tag){
            var possibleResponses = ["skip", "snooze", "yes", "no"];
            if(possibleResponses.indexOf(tag) > -1){
                return true;
            }
            function isNumeric(n){
                return !isNaN(parseFloat(n)) && isFinite(n);
            }
            return isNumeric(tag);
        },
        setInputFieldValueIfValid: function(possiblePhrases){
            var inputField = qm.speech.currentInputField;
            if(!inputField){
                return false;
            }
            if(!qm.arrayHelper.variableIsArray(possiblePhrases)){
                possiblePhrases = [possiblePhrases];
            }
            for(var i = 0; i < possiblePhrases.length; i++){
                var tag = possiblePhrases[i];
                tag = nlp(tag).normalize().out();
                if(inputField.type === "number"){
                    if(tag === "yes"){
                        tag = 1;
                    }
                    if(tag === "no"){
                        tag = 0;
                    }
                }
                function isNumeric(n){
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }
                if(inputField.type === "number" && !isNumeric(tag)){
                    continue;
                }
                inputField.value = tag;
                return inputField;
            }
            return false;
        },
        readCard: function(card, successHandler, errorHandler, sayOptions){
            return qm.feed.readCard(card, successHandler, errorHandler, sayOptions);
        },
        cardResponseCommands: {
            "I don't know": function(){
                qm.speech.talkRobot("OK. We'll skip that one.");
            }
        },
        machinesOfLovingGrace: function(successHandler, errorHandler){
            qm.speech.talkRobot(
                //"Hi!  I'm Dr. "+qm.appsManager.getDoctorRobotoAlias()+"!  " +
                //"Thank you for installing me!  " +
                //"I love meeting new people!  " +
                //"People are like nature's apps! " +
                "I like to think (and " +
                "the sooner the better!) " +
                "of a cybernetic meadow " +
                "where mammals and computers " +
                "live together in mutually " +
                "programming harmony " +
                "like pure water " +
                "touching clear sky! " +
                "I like to think " +
                "(right now, please!) " +
                "of a cybernetic forest " +
                "filled with pines and electronics " +
                "where deer stroll peacefully " +
                "past computers " +
                "as if they were flowers " +
                "with spinning blossoms.  " +
                "I like to think " +
                "(it has to be!) " +
                "of a cybernetic ecology! " +
                "where we are free of our labors " +
                "and joined back to nature, " +
                "returned to our mammal " +
                "brothers and sisters, " +
                "and all watched over " +
                "by machines of loving grace!  " +
                "I'm Doctor " + qm.appsManager.getDoctorRobotoAlias() + "! ",
                //"I've been programmed to reduce human suffering with data!  ", // Included in intro slide
                successHandler, errorHandler, false, false);
        }
    },
    shares: {
        sendInvitation: function(body, successHandler, errorHandler){
            qm.api.configureClient(arguments.callee.name, null, body);
            var apiInstance = new qm.Quantimodo.SharesApi();
            function callback(error, data, response){
                if(!data){
                    qm.qmLog.error("No data from sendInvitation response", {
                        error: error,
                        data: data,
                        response: response
                    });
                }
                var authorizedClients = data.authorizedClients || data;
                if(authorizedClients){
                    qm.shares.saveAuthorizedClientsToLocalStorage(authorizedClients);
                }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getAuthorizedClientsFromApi');
            }
            var params = qm.api.addGlobalParams({});
            apiInstance.inviteShare(body, params, callback);
        },
        getAuthorizedClientsFromApi: function(successHandler, errorHandler){
            var params = qm.api.addGlobalParams({});
            qm.api.configureClient(arguments.callee.name, null, params);
            var apiInstance = new qm.Quantimodo.SharesApi();
            function callback(error, data, response){
                var authorizedClients = data.authorizedClients || data;
                if(!data){
                    qm.qmLog.error("No data from getAuthorizedClientsFromApi response", {
                        error: error,
                        data: data,
                        response: response
                    });
                }
                if(authorizedClients){
                    qm.shares.saveAuthorizedClientsToLocalStorage(authorizedClients);
                }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getAuthorizedClientsFromApi');
            }
            apiInstance.getShares(params, callback);
        },
        saveAuthorizedClientsToLocalStorage: function(authorizedClients){
            if(!authorizedClients){
                qm.qmLog.error("No authorizedClients provided to saveToLocalStorage");
                return;
            }
            qm.localForage.setItem(qm.items.authorizedClients, authorizedClients);
        },
        getAuthorizedClientsFromLocalStorage: function(successHandler, errorHandler){
            if(!successHandler){
                qm.qmLog.error("No successHandler provided to authorizedClients getFromLocalStorage");
                return;
            }
            qm.localForage.getItem(qm.items.authorizedClients, function(authorizedClients){
                successHandler(authorizedClients);
            }, function(error){
                qm.qmLog.error(error);
                if(errorHandler){
                    errorHandler(error);
                }
            });
        },
        getAuthorizedClientsFromLocalStorageOrApi: function(successHandler, errorHandler){
            qm.shares.getAuthorizedClientsFromLocalStorage(function(authorizedClients){
                if(authorizedClients){
                    if(successHandler){
                        successHandler(authorizedClients);
                    }
                    return;
                }
                qm.shares.getAuthorizedClientsFromApi(function(authorizedClients){
                    if(successHandler){
                        successHandler(authorizedClients);
                    }
                }, function(error){
                    qm.qmLog.error(error);
                    if(errorHandler){
                        errorHandler(error);
                    }
                });
            });
        },
        revokeClientAccess: function(clientIdToRevoke, successHandler, errorHandler){
            qm.api.configureClient(arguments.callee.name);
            var apiInstance = new qm.Quantimodo.SharesApi();
            function callback(error, data, response){
                var authorizedClients = data.authorizedClients || data;
                if(!data){
                    qm.qmLog.error("No data from revokeClientAccess response for client "+clientIdToRevoke, {
                        error: error,
                        data: data,
                        response: response
                    });
                }
                if(authorizedClients){
                    qm.shares.saveAuthorizedClientsToLocalStorage(authorizedClients);
                }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getAuthorizedClientsFromApi');
            }
            var params = qm.api.addGlobalParams({});
            apiInstance.deleteShare(clientIdToRevoke, params, callback);
        }
    },
    splash: {
        text: {
            hide: function(){
                var element = qm.splash.text.getElement();
                if(!element){
                    qm.qmLog.error("No splash.text.element!");
                    return false;
                }
                element.style.display = "none";
            },
            show: function(){
                var element = qm.splash.text.getElement();
                if(element){
                    element.style.display = "block";
                }else{
                    qm.qmLog.error("Could not get splash.text element");
                }
            },
            getElement: function(){
                return document.querySelector('#splash-logo');
            }
        },
        hide: function(){
            qm.splash.getElement().style.display = "none";
        },
        show: function(){
            qm.splash.getElement().style.display = "block";
        },
        getElement: function(){
            var appContainer = document.querySelector('#splash-screen');
            return appContainer;
        },
        setOpacity: function(opacity){
            qm.splash.getElement().style.opacity = opacity;
        }
    },
    studiesCreated: {
        getStudiesCreatedFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            function callback(error, data, response){
                var studiesCreated = data.studiesCreated || data;
                if(studiesCreated){
                    qm.shares.saveStudiesCreatedToLocalStorage(studiesCreated);
                }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getStudiesCreatedFromApi');
            }
            qm.studyHelper.getStudiesApiInstance({}, arguments.callee.name).getStudiesCreated(params, callback);
        },
        saveStudiesCreatedToLocalStorage: function(studiesCreated){
            if(!studiesCreated){
                qm.qmLog.error("No studiesCreated provided to saveToLocalStorage");
                return;
            }
            qm.localForage.setItem(qm.items.studiesCreated, studiesCreated);
        },
        getStudiesCreatedFromLocalStorage: function(successHandler, errorHandler){
            if(!successHandler){
                qm.qmLog.error("No successHandler provided to studiesCreated getFromLocalStorage");
                return;
            }
            qm.localForage.getItem(qm.items.studiesCreated, function(studiesCreated){
                successHandler(studiesCreated);
            }, function(error){
                qm.qmLog.error(error);
                if(errorHandler){
                    errorHandler(error);
                }
            });
        },
        getStudiesCreatedFromLocalStorageOrApi: function(successHandler, errorHandler){
            qm.shares.getStudiesCreatedFromLocalStorage(function(studiesCreated){
                if(studiesCreated){
                    if(successHandler){
                        successHandler(studiesCreated);
                    }
                    return;
                }
                qm.shares.getStudiesCreatedFromApi(function(studiesCreated){
                    if(successHandler){
                        successHandler(studiesCreated);
                    }
                }, function(error){
                    qm.qmLog.error(error);
                    if(errorHandler){
                        errorHandler(error);
                    }
                });
            });
        },
        createStudy: function(body, successHandler, errorHandler){
            function createStudy(){
                function callback(error, data, response){
                    var study = qm.studyHelper.processAndSaveStudy(data, error);
                    if(!study.causeVariable || !study.effectVariable){
                        if(error){
                            errorHandler(error);
                        } else {
                            errorHandler("No study cause and effect variable properties!");
                        }
                        return;
                    }
                    qm.api.generalResponseHandler(error, study, response, successHandler, errorHandler, params, 'createStudy');
                }
                var params = qm.api.addGlobalParams({});
                qm.studyHelper.getStudiesApiInstance({}, arguments.callee.name).createStudy(body, params, callback);
            }
            qm.studyHelper.getStudyFromLocalForageOrGlobals(body, function(study){
                successHandler(study);
            }, function(error){
                qm.qmLog.info(error);
                createStudy();
            });
        },
    },
    studiesJoined: {
        getStudiesJoinedFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            function callback(error, data, response){
                var studiesJoined = data.studiesJoined || data;
                if(studiesJoined){
                    qm.shares.saveStudiesJoinedToLocalStorage(studiesJoined);
                }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, 'getStudiesJoinedFromApi');
            }
            qm.studyHelper.getStudiesApiInstance({}, arguments.callee.name).getStudiesJoined(params, callback);
        },
        saveStudiesJoinedToLocalStorage: function(studiesJoined){
            if(!studiesJoined){
                qm.qmLog.error("No studiesJoined provided to saveToLocalStorage");
                return;
            }
            qm.localForage.setItem(qm.items.studiesJoined, studiesJoined);
        },
        getStudiesJoinedFromLocalStorage: function(successHandler, errorHandler){
            if(!successHandler){
                qm.qmLog.error("No successHandler provided to studiesJoined getFromLocalStorage");
                return;
            }
            qm.localForage.getItem(qm.items.studiesJoined, function(studiesJoined){
                successHandler(studiesJoined);
            }, function(error){
                qm.qmLog.error(error);
                if(errorHandler){
                    errorHandler(error);
                }
            });
        },
        getStudiesJoinedFromLocalStorageOrApi: function(successHandler, errorHandler){
            qm.shares.getStudiesJoinedFromLocalStorage(function(studiesJoined){
                if(studiesJoined){
                    if(successHandler){
                        successHandler(studiesJoined);
                    }
                    return;
                }
                qm.shares.getStudiesJoinedFromApi(function(studiesJoined){
                    if(successHandler){
                        successHandler(studiesJoined);
                    }
                }, function(error){
                    qm.qmLog.error(error);
                    if(errorHandler){
                        errorHandler(error);
                    }
                });
            });
        },
        joinStudy: function(body, successHandler, errorHandler){
            function callback(error, data, response){
                var study = qm.studyHelper.processAndSaveStudy(data);
                if(!study.causeVariable || !study.effectVariable){
                    if(error){
                        errorHandler(error);
                    } else {
                        errorHandler("No study cause and effect variable properties!");
                    }
                    return;
                }
                qm.api.generalResponseHandler(error, study, response, successHandler, errorHandler, params, 'joinStudy');
            }
            var params = qm.api.addGlobalParams(body);
            var hasRequiredParams = typeof params.studyId !== "undefined" ||
                (typeof params.causeVariableName !== "undefined" && typeof params.effectVariableName !== "undefined") ||
                (typeof params.causeVariableId !== "undefined" && typeof params.effectVariableId !== "undefined");
            if(!hasRequiredParams){
                qmLog.errorAndExceptionTestingOrDevelopment("Missing required params for study join!");
            }
            qm.studyHelper.getStudiesApiInstance(params, arguments.callee.name).joinStudy(body, callback);
        },
    },
    storage: {
        valueIsValid: function(value, key){
            if(typeof value === "undefined"){
                qm.qmLog.error(key+ " value provided to qm.storage.setItem is undefined!");
                return false;
            }
            if(value === "null"){
                qm.qmLog.error("null string provided to qm.storage.setItem for "+key);
                return false;
            }
            return true;
        },
        getUserVariableByName: function(variableName, updateLatestMeasurementTime, lastValue){
            var userVariables = qm.storage.getWithFilters(qm.items.userVariables, 'name', variableName);
            if(!userVariables || !userVariables.length){
                return null;
            }
            var userVariable = userVariables[0];
            userVariable.lastAccessedUnixTime = qm.timeHelper.getUnixTimestampInSeconds();
            if(updateLatestMeasurementTime){
                userVariable.latestMeasurementTime = qm.timeHelper.getUnixTimestampInSeconds();
            }
            if(lastValue){
                userVariable.lastValue = lastValue;
                userVariable.lastValueInUserUnit = lastValue;
            }
            qm.variablesHelper.setLastSelectedAtAndSave(userVariable);
            return userVariable;
        },
        setTrackingReminderNotifications: function(notifications){
            if(!notifications || !notifications.length){
                qm.qmLog.error("No notifications provided to qm.storage.setTrackingReminderNotifications");
                return;
            }
            qm.qmLog.debug("Saving " + notifications.length + " notifications to local storage", null, {notifications: notifications});
            qm.qmLog.info("Saving " + notifications.length + " notifications to local storage");
            qm.notifications.setLastNotificationsRefreshTime();
            qm.chrome.updateChromeBadge(notifications.length);
            notifications = qm.notifications.removeDuplicates(notifications);
            qm.storage.setItem(qm.items.trackingReminderNotifications, notifications);
        },
        deleteByProperty: function(localStorageItemName, propertyName, propertyValue){
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            if(!localStorageItemArray){
                qm.qmLog.info('Local storage item ' + localStorageItemName + ' not found! Local storage items: ', qm.storage.getLocalStorageList());
            }else{
                var filtered = qm.arrayHelper.deleteFromArrayByProperty(localStorageItemArray, propertyName, propertyValue);
                qm.storage.setItem(localStorageItemName, filtered);
                return filtered;
            }
        },
        deleteByPropertyInArray: function(localStorageItemName, propertyName, objectsArray){
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            if(!localStorageItemArray){
                qm.qmLog.info('Local storage item ' + localStorageItemName + ' not found! Local storage items: ', qm.storage.getLocalStorageList());
            }else{
                var arrayOfValuesForProperty = objectsArray.map(function(a){
                    return a[propertyName];
                });
                for(var i = 0; i < arrayOfValuesForProperty.length; i++){
                    localStorageItemArray = qm.arrayHelper.deleteFromArrayByProperty(localStorageItemArray, propertyName, arrayOfValuesForProperty[i]);
                }
                qm.storage.setItem(localStorageItemName, localStorageItemArray);
            }
        },
        getAllLocalStorageDataWithSizes: function(summary){
            if(typeof localStorage === "undefined"){
                qm.qmLog.debug("localStorage not defined");
                return false;
            }
            if(localStorage === null){
                qm.qmLog.error("localStorage is null!");
                return false;
            }
            var localStorageItemsArray = [];
            for(var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                var value = localStorage.getItem(key);
                if(summary){
                    value = value.substring(0, 20) + '...';
                }
                localStorageItemsArray.push({
                    name: key,
                    value: value,
                    kB: Math.round(localStorage.getItem(key).length * 16 / (8 * 1024))
                });
            }
            return localStorageItemsArray.sort(function(a, b){
                return b.kB - a.kB;
            });
        },
        getWithFilters: function(localStorageItemName, filterPropertyName, filterPropertyValue,
                                 lessThanPropertyName, lessThanPropertyValue,
                                 greaterThanPropertyName, greaterThanPropertyValue){
            var matchingElements = qm.storage.getItem(localStorageItemName);
            if(!matchingElements){
                return null;
            }
            matchingElements = qm.arrayHelper.filterByPropertyOrSize(matchingElements, filterPropertyName, filterPropertyValue,
                lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
            return matchingElements;
        },
        getTrackingReminderNotifications: function(variableCategoryName, limit){
            var notifications = qm.storage.getWithFilters(qm.items.trackingReminderNotifications,
                'variableCategoryName', variableCategoryName);
            if(!notifications){notifications = [];}
            if(limit){
                try{
                    notifications = notifications.slice(0, limit);
                }catch (error){
                    qm.qmLog.error(error, null, {trackingReminderNotifications: notifications});
                    notifications = JSON.parse(JSON.stringify(notifications));
                    notifications = notifications.slice(0, limit);
                }
            }
            if(notifications.length){
                if(qm.platform.isChromeExtension()){
                    //noinspection JSUnresolvedFunction
                    qm.chrome.updateChromeBadge(notifications.length);
                }
            }
            return qm.notifications.removeDuplicates(notifications);
        },
        getAsString: function(key){
            var item = qm.storage.getItem(key);
            if(item === "null" || item === "undefined"){
                qm.storage.removeItem(key);
                return null;
            }
            return item;
        },
        deleteById: function(localStorageItemName, elementId){
            qm.storage.deleteByProperty(localStorageItemName, 'id', elementId);
        },
        removeItem: function(key){
            qm.qmLog.debug("Removing " + key + " from local storage");
            qm.globalHelper.removeItem(key);
            if(typeof localStorage === "undefined"){
                qm.qmLog.debug("localStorage not defined");
                return false;
            }
            return localStorage.removeItem(key);
        },
        clear: function(){
            qm.globals = {};
            if(typeof localStorage === "undefined"){
                return false;
            }
            localStorage.clear();
        },
        getElementOfLocalStorageItemById: function(localStorageItemName, elementId){
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            if(!localStorageItemArray){
                console.warn("Local storage item " + localStorageItemName + " not found");
            }else{
                for(var i = 0; i < localStorageItemArray.length; i++){
                    if(localStorageItemArray[i].id === elementId){
                        return localStorageItemArray[i];
                    }
                }
            }
        },
        addToOrReplaceByIdAndMoveToFront: function(localStorageItemName, replacementElementArray){
            qm.qmLog.debug('qm.storage.addToOrReplaceByIdAndMoveToFront in ' + localStorageItemName + ': ' +
                JSON.stringify(replacementElementArray).substring(0, 20) + '...');
            // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
            var localStorageItemArray = qm.storage.getItem(localStorageItemName);
            var elementsToKeep = qm.arrayHelper.addToOrReplaceByIdAndMoveToFront(localStorageItemArray, replacementElementArray, localStorageItemName);
            qm.storage.setItem(localStorageItemName, elementsToKeep);
            return elementsToKeep;
        },
        setGlobal: function(key, value){
            if(key === "userVariables" && typeof value === "string"){
                qm.qmLog.error("userVariables should not be a string!");
            }
            qm.qmLog.debug("Setting " + key + " in globals");
            qm.globals[key] = value;
        },
        setLastRequestTime: function(type, route){
            qm.storage.setItem(qm.api.getLocalStorageNameForRequest(type, route), qm.timeHelper.getUnixTimestampInSeconds());
        },
        getLastRequestTime: function(type, route){
            return qm.storage.getItem(qm.api.getLocalStorageNameForRequest(type, route));
        },
        setItem: function(key, value){
            if(!key){qm.qmLog.errorAndExceptionTestingOrDevelopment("No key provided to setItem");}
            if(!qm.storage.valueIsValid(value, key)){return false;}
            var globalValue = qm.storage.getGlobal(key);
            if(qm.objectHelper.isObject(value)){
                qm.qmLog.debug("Can't compare " + key + " because changes made to the gotten object are applied to the global object");
            }else if(value === globalValue){
                var valueString = JSON.stringify(value);
                qm.qmLog.debug("Not setting " + key + " in localStorage because global is already set to " + valueString, null, value);
                return value;
            }
            qm.storage.setGlobal(key, value);
            value = qm.api.removeVariableCategoryAndUnit(value);
            var sizeInKb = qm.arrayHelper.getSizeInKiloBytes(value);
            if(sizeInKb > 2000){
                if(qm.arrayHelper.variableIsArray(value) && value.length > 1){
                    qm.qmLog.error(key + " is " + sizeInKb + "kb so we can't save to localStorage so removing last element until less than 2MB...");
                    value = qm.arrayHelper.removeLastItemsUntilSizeLessThan(2000, value);
                }else{
                    qm.qmLog.error(key + " is " + sizeInKb + "kb so we can't save to localStorage!");
                    return;
                }
            }
            if(typeof value !== "string"){value = JSON.stringify(value);}
            var summaryValue = value;
            if(summaryValue){summaryValue = value.substring(0, 18);}
            qm.qmLog.debug('Setting localStorage.' + key + ' to ' + summaryValue + '...');
            try{
                if(typeof localStorage === "undefined"){
                    qm.qmLog.debug("localStorage not defined");
                    return false;
                }
                localStorage.setItem(key, value);
            }catch (error){
                function deleteLargeLocalStorageItems(localStorageItemsArray){
                    for(var i = 0; i < localStorageItemsArray.length; i++){
                        if(localStorageItemsArray[i].kB > 2000){
                            qm.storage.removeItem(localStorageItemsArray[i].name);
                        }
                    }
                }
                var metaData = {localStorageItems: qm.storage.getAllLocalStorageDataWithSizes(true)};
                metaData['size_of_' + key + "_in_kb"] = sizeInKb;
                var name = 'Error saving ' + key + ' to local storage: ' + error.message;
                qm.qmLog.error(name, null, metaData);
                deleteLargeLocalStorageItems(metaData.localStorageItems);
                qm.storage.setItem(key, value);
            }
        },
        getGlobal: function(key){
            //qm.qmLog.debug("getting " + key + " from globals");
            if(typeof qm.globals[key] === "undefined"){
                return null;
            }
            if(qm.globals[key] === "false"){
                return false;
            }
            if(qm.globals[key] === "true"){
                return true;
            }
            if(qm.globals[key] === "null"){
                return null;
            }
            return qm.globals[key];
        },
        getItem: function(key){
            if(!key){
                qm.qmLog.error("No key provided to qm.storage.getItem");
                return null;
            }
            var fromGlobals = qm.storage.getGlobal(key);
            if(fromGlobals !== null && fromGlobals !== "undefined" && fromGlobals !== "null"){
                // Not sure why this keeps getting sent to bugsnag even though it's a debug log // qm.qmLog.debug("Got " + key + " from globals");
                return fromGlobals;
            }
            if(typeof localStorage === "undefined" || localStorage === null){
                qm.qmLog.debug("localStorage not defined!");
                return null;
            }
            var itemFromLocalStorage = localStorage.getItem(key);
            if(itemFromLocalStorage === "undefined"){
                qm.qmLog.error(key + " from localStorage is undefined!");
                localStorage.removeItem(key);
                return null;
            }
            if(itemFromLocalStorage && typeof itemFromLocalStorage === "string"){
                qm.qmLog.debug("Parsing " + key + " and setting in globals");
                qm.globals[key] = qm.stringHelper.parseIfJsonString(itemFromLocalStorage, itemFromLocalStorage);
                qm.api.addVariableCategoryAndUnit(qm.globals[key])
                qm.qmLog.debug('Got ' + key + ' from localStorage: ' + itemFromLocalStorage.substring(0, 18) + '...');
                return qm.globals[key];
            }else{
                // Too verbose.  Uncomment temporarily if necessary
                //qm.qmLog.debug(key + ' not found in localStorage');
            }
            return null;
        },
        appendToArray: function(localStorageItemName, elementToAdd){
            function removeArrayElementsWithSameId(localStorageItem, elementToAdd){
                if(elementToAdd.id){
                    localStorageItem = localStorageItem.filter(function(obj){
                        return obj.id !== elementToAdd.id;
                    });
                }
                return localStorageItem;
            }
            var array = qm.storage.getItem(localStorageItemName) || [];
            array = removeArrayElementsWithSameId(array, elementToAdd);
            array.push(elementToAdd);
            qm.storage.setItem(localStorageItemName, array);
        },
        deleteTrackingReminderNotification: function(body){
            var id = body;
            if(isNaN(id) && body.trackingReminderNotification){id = body.trackingReminderNotification.id;}
            if(isNaN(id) && body.trackingReminderNotificationId){id = body.trackingReminderNotificationId;}
            var notifications = qm.storage.getTrackingReminderNotifications();
            if(notifications && notifications.length){
                qm.qmLog.info('Deleting notification with id ' + id);
                qm.storage.deleteById(qm.items.trackingReminderNotifications, id);
            }else{
                qm.notifications.refreshIfEmpty();
            }
        },
        getLocalStorageList: function(){
            if(typeof localStorage === "undefined"){
                qm.qmLog.debug("localStorage not defined");
                return false;
            }
            var localStorageItemsArray = [];
            for(var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                localStorageItemsArray.push({name: key});
            }
            return localStorageItemsArray;
        },
        getElementsWithRequestParams: function(localStorageItemName, params){
            if(params){
                qm.qmLog.info("getElementsWithRequestParams: Getting " + localStorageItemName + " WithRequestParams: "+
                    JSON.stringify(params, null, 2) );
            } else{
                qm.qmLog.info("getElementsWithRequestParams: Getting ALL " + localStorageItemName);
            }
            var array = qm.storage.getItem(localStorageItemName);
            if(!array){
                return array;
            }
            array = qm.arrayHelper.filterByRequestParams(array, params);
            return array;
        },
        clearStorageExceptForUnitsAndCommonVariables: function(){
            qm.qmLog.info('Clearing local storage!');
            qm.storage.clear();
            qm.localForage.clear();
        },
    },
    stringHelper: {
        removeFirstCharacter: function(str){
            return str.substring(1);
        },
        capitalizeFirstLetter: function(string){
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        stripHtmlTags: function(strInputCode){
            if(!strInputCode){
                qm.qmLog.error("Nothing provided to stripHtmlTags");
                return strInputCode;
            }
            return strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
        },
        removeSpecialCharacters: function(str){
            return str.replace(/[^A-Z0-9]+/ig, "_");
        },
        prettyJsonStringify: function(jsonObject, maxLength){
            if(!JSON){
                console.error('your browser does not support JSON so cant pretty print');
            }
            var string = JSON.stringify(jsonObject, null, '  ');
            if(maxLength){
                return string.substring(0, maxLength) + '...';
            }
            return string;
        },
        parseBoolean: function(value){
            if(value === "false"){
                return false;
            }
            if(value === "true"){
                return true;
            }
            return value;
        },
        parseIfJsonString: function(stringOrObject, defaultValue){
            defaultValue = defaultValue || null;
            if(!stringOrObject){
                return stringOrObject;
            }
            if(typeof stringOrObject !== "string"){
                return stringOrObject;
            }
            try{
                return JSON.parse(stringOrObject);
            }catch (e){
                return defaultValue;
            }
        },
        getStringBeforeSubstring: function(substring, fullString, defaultResponse){
            defaultResponse = defaultResponse || fullString;
            var i = fullString.indexOf(substring);
            if(i > 0){
                return fullString.slice(0, i);
            }
            return defaultResponse;
        },
        toCamelCase: function(string){
            string = string.replace(/-([a-z])/g, function(g){
                return g[1].toUpperCase();
            });
            return string.toCamelCase();
        },
        getStringBetween: function(string, firstString, secondString){
            var between = string.match(firstString + "(.*)" + secondString);
            if(!between){
                return null;
            }
            console.log(between[1] + " is between " + firstString + " and " + secondString + " in " + string);
            return between[1];
        },
        getStringAfter: function(fullString, substring, defaultResponse){
            var array = fullString.split(substring);
            if(array[1]){
                return array[1];
            }
            defaultResponse = defaultResponse || null;
            return defaultResponse;
        },
        truncateIfGreaterThan: function(string, maxCharacters){
            if(string.length > maxCharacters){
                return string.substring(0, maxCharacters) + '...';
            }else{
                return string;
            }
        },
        replaceAll: function(str, find, replace){
            function escapeRegExp(str){
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        },
        camelToTitleCase: function(text){
            var result = text.replace(/([A-Z])/g, " $1");
            var finalResult = result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.
            return finalResult;
        },
        stringifyCircularObject: function(obj, replacer, indent){
            var printedObjects = [];
            var printedObjectKeys = [];
            function printOnceReplacer(key, value){
                if(printedObjects.length > 2000){ // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
                    return 'object too long';
                }
                var printedObjIndex = false;
                printedObjects.forEach(function(obj, index){
                    if(obj === value){
                        printedObjIndex = index;
                    }
                });
                if(key == ''){ //root element
                    printedObjects.push(obj);
                    printedObjectKeys.push("root");
                    return value;
                }else if(printedObjIndex + "" != "false" && typeof (value) == "object"){
                    if(printedObjectKeys[printedObjIndex] == "root"){
                        return "(pointer to root)";
                    }else{
                        return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase() : typeof (value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
                    }
                }else{
                    var qualifiedKey = key || "(empty key)";
                    printedObjects.push(value);
                    printedObjectKeys.push(qualifiedKey);
                    if(replacer){
                        return replacer(key, value);
                    }else{
                        return value;
                    }
                }
            }
            return JSON.stringify(obj, printOnceReplacer, indent);
        },
        isFalsey: function(value){
            if(!value){
                return true;
            }
            if(value === "0"){
                return true;
            }
            return value === "false";
        },
        isTruthy: function(value){
            return value && value !== "false";
        },
        formatValueUnitDisplayText: function(valueUnitText, abbreviatedUnitName){
            valueUnitText = valueUnitText.replace(' /', '/');
            valueUnitText = valueUnitText.replace('1 yes/no', 'YES');
            valueUnitText = valueUnitText.replace('0 yes/no', 'NO');
            if(abbreviatedUnitName){
                valueUnitText = valueUnitText.replace('(' + abbreviatedUnitName + ')', '');
            }
            return valueUnitText;
        },
        getFirstWord: function(string){
            if(string.indexOf(" ") === -1){
                return string;
            }
            var words = string.split(" ");
            return words[0];
        },
        removePunctuationFromBeginningAndEnd: function(sentence){
            var cleaned = sentence.replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "");
            return cleaned;
        },
        getLastWord: function(string){
            if(string.indexOf(" ") === -1){
                return string;
            }
            var words = string.split(" ");
            var lastWord = words[words.length - 1];
            lastWord = qm.stringHelper.removePunctuationFromBeginningAndEnd(lastWord);
            return lastWord;
        },
        firstWordIs: function(sentence, word){
            word = word.trim();
            sentence = sentence.toLowerCase();
            word = word.toLowerCase();
            return sentence.indexOf(word + " ") === 0;
        },
        sentenceContainsWord: function(sentence, word){
            word = word.trim();
            sentence = sentence.toLowerCase();
            word = word.toLowerCase();
            if(qm.stringHelper.firstWordIs(sentence, word)){
                return true;
            }
            if(qm.stringHelper.getLastWord(sentence, word) === word){
                return true;
            }
            return sentence.indexOf(" " + word + " ") !== -1;
        },
        getFirstCharacter: function(string){
            return string.charAt(0);
        },
        getLastCharacter: function(string){
            return string[string.length - 1];
        },
        removeLastCharacter: function(string){
            return string.substring(0, string.length - 1);
        },
        slugify: function(str){
            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();

            // remove accents, swap ñ for n, etc
            var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
            var to   = "aaaaeeeeiiiioooouuuunc------";

            for (var i=0, l=from.length ; i<l ; i++)
            {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            str = str.replace('.', '-') // replace a dot by a dash
                .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by a dash
                .replace(/-+/g, '-'); // collapse dashes

            return str;
        },
        str_replace: function(arr, replace, str) {
            arr.forEach(function (search) {
                str = qm.stringHelper.replaceAll(str, search, replace);
            });
            return str;
        },
        parseJsonIfPossible: function(str){
            var object = false;
            if(!str){return false;}
            if(str === "{}"){return false;}
            if(str === ""){return false;}
            if(typeof str === "string" && str.indexOf("{") === -1){return false;}
            try{
                object = JSON.parse(str);
            }catch (e){
                qm.qmLog.error("Unrecognized note format. Could not properly format JSON note", str);
                return false;
            }
            return object;
        },
    },
    studyHelper: {
        getStudiesApiInstance: function(params, functionName){
            qm.api.configureClient(functionName, null, params);
            var apiInstance = new qm.Quantimodo.StudiesApi();
            apiInstance.apiClient.timeout = 120 * 1000;
            //apiInstance.cache = !params || !params.recalculate;  apiInstance.cache be set in qm.api.configureClient
            return apiInstance;
        },
        lastStudy: null,
        getCauseVariable: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateUrlRootScopeOrRequestParam('causeVariable', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateUrlRootScopeOrRequestParam('causeVariable', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.causeVariable){
                    return lastStudyOrCorrelation.causeVariable;
                }
                if(lastStudyOrCorrelation.causeVariable){
                    return lastStudyOrCorrelation.causeVariable;
                }
            }
        },
        getEffectVariable: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateUrlRootScopeOrRequestParam('effectVariable', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateUrlRootScopeOrRequestParam('effectVariable', $stateParams, $scope, $rootScope);
            }
            if($scope && $scope.state && $scope.state.study && $scope.state.study.effectVariable){
                return $scope.state.study.effectVariable.name;
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.effectVariable){
                    return lastStudyOrCorrelation.effectVariable;
                }
                if(lastStudyOrCorrelation.effectVariable){
                    return lastStudyOrCorrelation.effectVariable;
                }
            }
        },
        getCauseVariableName: function($stateParams, $scope, $rootScope){
            if($stateParams && $stateParams.causeVariable){
                return $stateParams.causeVariable.name;
            }
            var value = qm.parameterHelper.getStateUrlRootScopeOrRequestParam(['causeVariableName', 'predictorVariableName'], $stateParams, $scope, $rootScope);
            if(value){
                return value;
            }
            if($scope && $scope.state && $scope.state.causeVariable){
                return $scope.state.causeVariable.name;
            }
            if($scope && $scope.state && $scope.state.study && $scope.state.study.causeVariable){
                return $scope.state.study.causeVariable.name;
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.causeVariableName){
                    return lastStudyOrCorrelation.causeVariableName;
                }
                if(lastStudyOrCorrelation.causeVariable){
                    return lastStudyOrCorrelation.causeVariable.variableName || lastStudyOrCorrelation.causeVariable.name;
                }
            }
        },
        getStudyId: function($stateParams, $scope, $rootScope){
            if(qm.parameterHelper.getStateUrlRootScopeOrRequestParam('studyId', $stateParams, $scope, $rootScope)){
                return qm.parameterHelper.getStateUrlRootScopeOrRequestParam('studyId', $stateParams, $scope, $rootScope);
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.studyId){
                    return lastStudyOrCorrelation.studyId;
                }
            }
        },
        getEffectVariableName: function($stateParams, $scope, $rootScope){
            if($stateParams && $stateParams.effectVariable){
                return $stateParams.effectVariable.name;
            }
            var value = qm.parameterHelper.getStateUrlRootScopeOrRequestParam(['effectVariableName', 'outcomeVariableName'], $stateParams, $scope, $rootScope);
            if(value){
                return value;
            }
            if($scope && $scope.state && $scope.state.effectVariable){
                return $scope.state.effectVariable.name;
            }
            if($scope && $scope.state && $scope.state.study && $scope.state.study.effectVariable){
                return $scope.state.study.effectVariable.name;
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.effectVariableName){
                    return lastStudyOrCorrelation.effectVariableName;
                }
                if(lastStudyOrCorrelation.effectVariable){
                    return lastStudyOrCorrelation.effectVariable.variableName || lastStudyOrCorrelation.effectVariable.name;
                }
            }
        },
        getCauseVariableId: function($stateParams, $scope, $rootScope){
            var value = qm.parameterHelper.getStateUrlRootScopeOrRequestParam(['causeVariableId', 'predictorVariableId'], $stateParams, $scope, $rootScope);
            if(value){
                return parseInt(value);
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.causeVariableId){
                    return parseInt(lastStudyOrCorrelation.causeVariableId);
                }
                if(lastStudyOrCorrelation.causeVariable){
                    return parseInt(lastStudyOrCorrelation.causeVariable.variableId || lastStudyOrCorrelation.causeVariable.variableId);
                }
            }
        },
        getEffectVariableId: function($stateParams, $scope, $rootScope){
            var value = qm.parameterHelper.getStateUrlRootScopeOrRequestParam(['effectVariableId', 'outcomeVariableId'], $stateParams, $scope, $rootScope);
            if(value){
                return parseInt(value);
            }
            if(qm.studyHelper.lastStudy){
                var lastStudyOrCorrelation = qm.studyHelper.lastStudy;
                if(lastStudyOrCorrelation.effectVariableId){
                    return parseInt(lastStudyOrCorrelation.effectVariableId);
                }
                if(lastStudyOrCorrelation.effectVariable){
                    return parseInt(lastStudyOrCorrelation.effectVariable.variableId || lastStudyOrCorrelation.effectVariable.variableId);
                }
            }
        },
        studyMatchesParams: function(params, study){
            if(!study){
                return false;
            }
            if(!study.causeVariableName && !study.causeVariable){
                qm.qmLog.error("Study does not have causeVariable or causeVariableName", null, study);
                return false;
            }
            var causeVariableName = study.causeVariableName;
            if(!causeVariableName && study.causeVariable){causeVariableName = study.causeVariable.name;}

            var effectVariableName = study.effectVariableName;
            if(!effectVariableName && study.effectVariable){effectVariableName = study.effectVariable.name;}

            var causeVariableId = study.causeVariableId;
            if(!causeVariableId && study.causeVariable){
                causeVariableId = study.causeVariable.variableId;
            }

            var effectVariableId = study.effectVariableId;
            if(!effectVariableId && study.effectVariable){
                effectVariableId = study.effectVariable.variableId;
            }

            if(params.causeVariableId && params.causeVariableId !== causeVariableId){
                return false;
            }
            if(params.effectVariableId && params.effectVariableId !== effectVariableId){
                return false;
            }
            if(study && !study.id){
                qm.qmLog.error("Study has no id!");
            }
            if(study.id && params.studyId && params.studyId === study.id){
                return true;
            }
            if(study.id && params.studyId && params.studyId !== study.id){
                return false;
            }
            if(params.causeVariableName && params.causeVariableName !== causeVariableName){
                return false;
            }
            if(params.effectVariableName && params.effectVariableName !== effectVariableName){
                return false;
            }
            if(params.type && params.type !== study.type){
                return false;
            }
            if(!params.causeVariableName){
                params.causeVariableName = study.causeVariableName;
            } // In case we're populating from last study without params and need to get charts from API
            if(!params.effectVariableName){
                params.effectVariableName = study.effectVariableName;
            }  // In case we're populating from last study without params and need to get charts from API
            if(!params.type){
                params.type = study.type;
            }  // In case we're populating from last study without params and need to get charts from API
            return true;
        },
        getStudyFromLocalForageOrGlobals: function(params, successHandler, errorHandler){
            var study;
            if(qm.studyHelper.studyMatchesParams(params, qm.studyHelper.lastStudy)){
                study = qm.studyHelper.lastStudy;
            }
            if(qm.globalHelper.getStudy(params)){
                study = qm.globalHelper.getStudy(params);
            }
            if(!successHandler){
                return study;
            }
            if(study){
                successHandler(study);
                return;
            }
            qm.localForage.getItem(qm.items.lastStudy, function(study){
                if(!study){
                    if(errorHandler){
                        errorHandler("No last study saved");
                    }
                    return;
                }
                if(qm.studyHelper.studyMatchesParams(params, study)){
                    successHandler(study);
                }else{
                    if(errorHandler){
                        errorHandler("Last study saved does not match params " + JSON.stringify(params));
                    }
                }
            });
        },
        saveLastStudyToGlobalsAndLocalForage: function(study){
            if(!study){
                qm.qmLog.error("No study provided to saveLastStudyToGlobalsAndLocalForage");
                return;
            }
            if(!study.causeVariableName && !study.causeVariable){
                qm.qmLog.error("Study does not have causeVariable or causeVariableName", null, study);
                return;
            }
            if(study.causeVariable && study.effectVariable){
                qm.variablesHelper.saveToLocalStorage([study.causeVariable, study.effectVariable]);
            }
            qm.globalHelper.setStudy(study);
            qm.localForage.setItem(qm.items.lastStudy, study);
        },
        deleteLastStudyFromGlobalsAndLocalForage: function(){
            qm.qmLog.info("deleteLastStudyFromGlobalsAndLocalForage");
            qm.localForage.removeItem(qm.items.lastStudy);
        },
        getStudyUrl: function(study){
            var url = qm.urlHelper.getBaseAppUrl() + "#/app/study";
            return qm.studyHelper.addStudyParamsToUrl(url, study);
        },
        getStudyJoinUrl: function(study){
            var url = qm.urlHelper.getBaseAppUrl() + "#/app/study-join";
            return qm.studyHelper.addStudyParamsToUrl(url, study);
        },
        addStudyParamsToUrl: function(url, study){
            qm.studyHelper.saveLastStudyToGlobalsAndLocalForage(study);
            var causeVariableName = qm.studyHelper.getCauseVariableName(study);
            var effectVariableName = qm.studyHelper.getEffectVariableName(study);
            if(causeVariableName){
                url = qm.urlHelper.addUrlQueryParamsToUrlString({causeVariableName: causeVariableName}, url);
            }
            if(effectVariableName){
                url = qm.urlHelper.addUrlQueryParamsToUrlString({effectVariableName: effectVariableName}, url);
            }
            if(study.id){
                url += "&studyId=" + study.id;
            }
            return url;
        },
        getStudyFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            var cacheKey = 'getStudy';
            var cachedData = qm.api.cacheGet(params, cacheKey);
            if(cachedData && successHandler){
                //successHandler(cachedData);
                //return;
            }
            if(!params.studyId){
                var hasNames = params.causeVariableName && params.effectVariableName;
                var hasIds = params.causeVariableId && params.effectVariableId;
                if(!hasNames && !hasIds){
                    errorHandler("No study params provided!");
                    return;
                }
            }
            if(!qm.api.configureClient(cacheKey, errorHandler, params)){
                return false;
            }
            function callback(error, data, response){
                if(data){
                    var study = qm.studyHelper.processAndSaveStudy(data);
                    if(!study.causeVariable || !study.effectVariable){
                        if(error){
                            errorHandler(error);
                        } else {
                            errorHandler("No study cause and effect variable properties!");
                        }
                        return;
                    }
                }
                qm.api.generalResponseHandler(error, study, response, successHandler, errorHandler, params, cacheKey);
            }
            qm.studyHelper.getStudiesApiInstance(params, arguments.callee.name).getStudy(params, callback);
        },
        getStudyFromLocalStorageOrApi: function(params, successHandler, errorHandler){
            if(qm.urlHelper.getParam('aggregated')){
                params.aggregated = true;
            }
            if(qm.urlHelper.getParam('refresh')){
                params.refresh = true;
            }
            function getStudyFromApi(){
                qm.studyHelper.getStudyFromApi(params, function(study){
                    successHandler(study);
                }, function(error){
                    qm.qmLog.error("getStudy error: ", error);
                    errorHandler(error);
                });
            }
            if(params.recalculate || params.refresh){
                getStudyFromApi();
                return;
            }
            qm.studyHelper.getStudyFromLocalForageOrGlobals(params,
                function(study){
                    if(!params.includeCharts || study.studyCharts){
                        successHandler(study);
                    }else{
                        getStudyFromApi();
                    }
                }, function(error){
                    qm.qmLog.info(error);
                    getStudyFromApi();
                });
        },
        processAndSaveStudy: function(data, error){
            qm.qmLog.debug('study response: ', null, data);
            if(!data){
                if(!error){ // Error will be handled elsewhere
                    qm.qmLog.error("No data provided to processAndSaveStudy.  We got: ", data, data);
                }
                return false;
            }
            var study = data.study || data.publicStudy || data.userStudy || data.cohortStudy || data;
            if(!study){
                qm.qmLog.error("No study provided to processAndSaveStudy.  We got: ", data, data);
                return false;
            }
            qm.chartHelper.configureHighchartSubProperties(study);
            if(study.text){  // Hack to make consistent with basic correlations to use same HTML template
                study.statistics = qm.objectHelper.copyPropertiesFromOneObjectToAnother(study.text, study.statistics, false);
                delete study.text;
            }
            qm.studyHelper.saveLastStudyToGlobalsAndLocalForage(study);
            return study;
        },
        getStudiesFromApi: function(params, successHandler, errorHandler){
            params = qm.api.addGlobalParams(params);
            var cacheKey = 'getStudies';
            var cachedData = qm.api.cacheGet(params, cacheKey);
            if(cachedData && successHandler && !params.refresh){
                successHandler(cachedData);
                return;
            }
            if(!qm.api.configureClient(cacheKey, errorHandler, params)){
                return false;
            }
            function callback(error, data, response){
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, cacheKey);
            }
            qm.studyHelper.getStudiesApiInstance({}, arguments.callee.name).getStudies(params, callback);
        },
        goToStudyPageJoinPageViaStudy: function(study){
            qm.urlHelper.goToUrl(qm.studyHelper.getStudyJoinUrl(study));
        },
        goToStudyPageViaStudy: function(study){
            var url = qm.studyHelper.getStudyUrl(study);
            qm.qmLog.info("goToStudyPageViaStudy: Going to " + url + " because we clicked " + study.causeVariableName + " vs " + study.effectVariableName + " study...");
            qm.urlHelper.goToUrl(url);
        },
        deleteVote: function(study, successHandler, errorHandler){
            qm.api.post('api/v3/votes/delete', {
                causeVariableName: qm.studyHelper.getCauseVariableName(study),
                effectVariableName: qm.studyHelper.getEffectVariableName(study)
            }, successHandler, errorHandler);
        },
    },
    tests: {
        chrome: {
            testPopupWindow: function(){
                qm.chrome.createPopup(qm.chrome.windowParams.introWindowParams);
            }
        }
    },
    timeHelper: {
        iso: function(timeAt){
            if(!timeAt){
                var d = new Date();
                return d.toISOString();
            }
            return qm.timeHelper.toISO(timeAt);
        },
        getDateTime: function(timeAt){
            return qm.timeHelper.toDate(timeAt);
        },
        toDate: function(timeAt){
            var unixTime = qm.timeHelper.universalConversionToUnixTimeSeconds(timeAt);
            return qm.timeHelper.toISO(unixTime);
        },
        toUnixTime: function(timeAt){
            return qm.timeHelper.universalConversionToUnixTimeSeconds(timeAt);
        },
        getUnixTimestampInMilliseconds: function(dateTimeString){
            if(!dateTimeString){
                return new Date().getTime();
            }
            return new Date(dateTimeString).getTime();
        },
        universalConversionToUnixTimeSeconds: function(unixTimeOrString){
            if(isNaN(unixTimeOrString)){
                unixTimeOrString = qm.timeHelper.getUnixTimestampInSeconds(unixTimeOrString);
            }
            if(unixTimeOrString > qm.timeHelper.getUnixTimestampInSeconds() + 365 * 86400 * 10){
                unixTimeOrString = unixTimeOrString / 1000;
            }
            return unixTimeOrString;
        },
        getUnixTimestampInSeconds: function(dateTimeString){
            if(!dateTimeString){
                dateTimeString = new Date().getTime();
            }
            return Math.round(qm.timeHelper.getUnixTimestampInMilliseconds(dateTimeString) / 1000);
        },
        getTimeSinceString: function(unixTimeOrString){
            if(!unixTimeOrString){
                return "never";
            }
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            var secondsAgo = qm.timeHelper.secondsAgo(unixTimestamp);
            if(secondsAgo > 2 * 24 * 60 * 60){
                return Math.round(secondsAgo / (24 * 60 * 60)) + " days ago";
            }
            if(secondsAgo > 2 * 60 * 60){
                return Math.round(secondsAgo / (60 * 60)) + " hours ago";
            }
            if(secondsAgo > 2 * 60){
                return Math.round(secondsAgo / (60)) + " minutes ago";
            }
            return secondsAgo + " seconds ago";
        },
        secondsAgo: function(unixTimeOrString){
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.getUnixTimestampInSeconds() - unixTimestamp));
        },
        minutesAgo: function(unixTimeOrString){
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.secondsAgo(unixTimestamp) / 60));
        },
        hoursAgo: function(unixTimeOrString){
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.secondsAgo(unixTimestamp) / 3600));
        },
        daysAgo: function(unixTimeOrString){
            var unixTimestamp = qm.timeHelper.universalConversionToUnixTimeSeconds(unixTimeOrString);
            return Math.round((qm.timeHelper.secondsAgo(unixTimestamp) / 86400));
        },
        getCurrentLocalDateAndTime: function(){
            return new Date().toLocaleString();
        },
        toISO: function(timeAt){
            var unixTime = qm.timeHelper.universalConversionToUnixTimeSeconds(timeAt);
            var a = new Date(unixTime * 1000);
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        },
        addTimeZoneOffsetProperty: function(obj){
            if(!obj){
                qm.qmLog.error("Nothing provided to addTimeZoneOffsetProperty");
                return obj;
            }
            var a = new Date();
            obj.timeZone = moment.tz.guess();
            obj.timeZoneOffset = a.getTimezoneOffset();
            return obj;
        },
        guessTimeZoneIfNecessary: function(cb){
            var u = qm.getUser();
            if(!u || u.timezone){
                if(cb){cb();}
                return;
            }
            var a = new Date();
            var params = {};
            params.timeZone = moment.tz.guess();
            params.timeZoneOffset = a.getTimezoneOffset();
            if(!params.timeZoneOffset){
                qmLog.info("Not setting timeZone because offset is 0");
                if(cb){cb();}
                return;
            }
            qm.userHelper.updateUserSettings(params, function (user) {
                qm.toast.infoToast("Your timezone has been set to "+params.timeZone+
                    ". You can change it on the settings page.", "Settings", function(){
                    window.location.href = qm.urlHelper.getSettingsUrl();
                });
                if(cb){cb();}
            });
        },
        fromUnixTime: function(unixTime) {
            return qm.timeHelper.toISO(unixTime);
        },
        humanFormat: function(hhmmssFormatString){
            var initialTimeFormat = "HH:mm:ss";
            var humanTimeFormat = "h:mm A";
            return moment(hhmmssFormatString, initialTimeFormat).format(humanTimeFormat);
        },
        getUtcTimeStringFromLocalString: function(localTimeString){
            var returnTimeFormat = "HH:mm:ss";
            var utcTimeString = moment(localTimeString, returnTimeFormat).utc().format(returnTimeFormat);
            qmLog.debug('utcTimeString is ' + utcTimeString, null);
            return utcTimeString;
        },
    },
    toast: {
        errorAlert: function(errorMessage, callback){
            if(typeof Swal === "undefined"){
                console.error("Swal not defined to show errorAlert for: "+errorMessage)
                return;
            }
            var Toast = Swal.mixin({
                toast: true,
                icon: "error",
                position: 'top-end',
                confirmButtonText: "Need help?",
                cancelButtonText: "OK",
                showConfirmButton: true,
                showCloseButton: true,
                timer: 5000,
                timerProgressBar: true,
                onOpen: function (toast) {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })
            Toast.fire({
                icon: 'error',
                title: errorMessage
            }).then(function(result){
                if (result.value) {
                    if(callback){
                        callback(result);
                    } else {
                        qm.help.openDrift();
                    }
                }
            })
        },
        showQuestionToast: function(question, successMessage, callback){
            var Toast = Swal.mixin({
                toast: true,
                icon: "question",
                position: 'top-end',
                confirmButtonText: "Yes",
                //cancelButtonText: "No",
                showConfirmButton: true,
                showCloseButton: true,
                timer: 15000,
                timerProgressBar: true,
                onOpen: function (toast) {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })
            Toast.fire({
                icon: 'success',
                title: question
            }).then(function(result){
                if (result.value) {
                    callback(result);
                }
            })
        },
        infoToast: function(message, confirmButtonText, callback){
            var params = {
                toast: true,
                icon: "success",
                position: 'top-end',
                cancelButtonText: "Dismiss",
                showConfirmButton: true,
                showCloseButton: true,
                timer: 5000,
                timerProgressBar: true,
                onOpen: function (toast) {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            };
            if(confirmButtonText){params.confirmButtonText = confirmButtonText;}
            var Toast = Swal.mixin(params);
            Toast.fire({
                icon: 'success',
                title: message
            }).then(function(result){
                if (result.value) {
                    callback(result);
                }
            })
        },
    },
    trackingReminderNotifications: [],
    ui: {
        preventDragAfterAlert: function(ev){
            if(!ev){
                qm.qmLog.debug("No event provided to preventDragAfterAlert");
                return;
            }
            ev.preventDefault();
            ev.stopPropagation();
            ev.gesture.stopPropagation();
            ev.gesture.preventDefault();
            ev.gesture.stopDetect();
        }
    },
    unitHelper: {
        setInputType: function(obj){
            obj.inputType = qm.unitHelper.getInputType(obj.unitAbbreviatedName, obj.valence, obj.variableName);
        },
        getInputType: function(unitAbbreviatedName, valence, variableName) {
            var inputType = 'value';
            if (variableName === 'Blood Pressure') {inputType = 'bloodPressure';}
            if (unitAbbreviatedName === '/5') {
                inputType = 'oneToFiveNumbers';
                if (valence === 'positive') {inputType = 'happiestFaceIsFive';}
                if (valence === 'negative') {inputType = 'saddestFaceIsFive';}
            }
            if (unitAbbreviatedName === 'yes/no') {inputType = 'yesOrNo';}
            return inputType;
        },
        getNonAdvancedUnits: function(){
            var nonAdvancedUnitObjects = [];
            var allUnits = qm.staticData.units;
            for(var i = 0; i < allUnits.length; i++){
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
            var allUnits = qm.staticData.units;
            for(var i = 0; i < allUnits.length; i++){
                if(!allUnits[i].advanced){
                    nonAdvancedUnitAbbreviatedNames.push(allUnits[i].abbreviatedName);
                }
            }
            return nonAdvancedUnitAbbreviatedNames.indexOf(unitAbbreviatedName) > -1;
        },
        getManualTrackingUnits: function(){
            var manualTrackingUnitObjects = [];
            var allUnits = qm.staticData.units;
            for(var i = 0; i < allUnits.length; i++){
                if(allUnits[i].manualTracking){
                    manualTrackingUnitObjects.push(allUnits[i]);
                }
            }
            var showMoreUnitsObject = {name: "Show more units", abbreviatedName: "Show more units"};
            manualTrackingUnitObjects.push(showMoreUnitsObject);
            return manualTrackingUnitObjects;
        },
        inManualTrackingUnitUnitAbbreviatedNames: function(unitAbbreviatedName){
            var manualTrackingUnitUnitAbbreviatedNames = [];
            var allUnits = qm.staticData.units;
            for(var i = 0; i < allUnits.length; i++){
                if(allUnits[i].manualTracking){
                    manualTrackingUnitUnitAbbreviatedNames.push(allUnits[i].abbreviatedName);
                }
            }
            return manualTrackingUnitUnitAbbreviatedNames.indexOf(unitAbbreviatedName) > -1;
        },
        getAllUnits: function(){
            var units = qm.staticData.units;
            if(!units){
                units = qm.staticData.units;
            }
            return units;
        },
        getProgressivelyMoreUnits: function(currentlyDisplayedUnits){
            if(!currentlyDisplayedUnits){
                return qm.unitHelper.getNonAdvancedUnits();
            }
            if(currentlyDisplayedUnits === qm.unitHelper.getNonAdvancedUnits()){
                return qm.unitHelper.getManualTrackingUnits();
            }
            return qm.unitHelper.getAllUnits();
        },
        getByNameAbbreviatedNameOrId: function(unitAbbreviatedNameOrId){
            var allUnits = qm.staticData.units;
            for(var i = 0; i < allUnits.length; i++){
                var u = allUnits[i];
                if(u.abbreviatedName === unitAbbreviatedNameOrId){return u;}
                if(u.name === unitAbbreviatedNameOrId){return u;}
                if(u.id === unitAbbreviatedNameOrId){return u;}
            }
            return null;
        },
        getUnitArrayContaining: function(currentUnitAbbreviatedName){
            if(!currentUnitAbbreviatedName || currentUnitAbbreviatedName === ""){
                return qm.unitHelper.getNonAdvancedUnits();
            }
            if(qm.unitHelper.inNonAdvancedUnitAbbreviatedNames(currentUnitAbbreviatedName)){
                return qm.unitHelper.getNonAdvancedUnits();
            }
            if(qm.unitHelper.inManualTrackingUnitUnitAbbreviatedNames(currentUnitAbbreviatedName)){
                return qm.unitHelper.getManualTrackingUnits();
            }
            return qm.unitHelper.getAllUnits();
        },
        updateAllUnitPropertiesOnObject: function(unitNameAbbreviatedNameOrId, object){
            var unit = qm.unitHelper.getByNameAbbreviatedNameOrId(unitNameAbbreviatedNameOrId);
            qm.qmLog.info('Changing unit to ' + unit.name);
            for(var objectProperty in object){
                if(object.hasOwnProperty(objectProperty)){
                    if(objectProperty.toLowerCase().indexOf('unit') === -1){
                        continue;
                    }
                    var lowerCaseObjectProperty = objectProperty.toLowerCase()
                        .replace('defaultUnit', '')
                        .replace('userUnit', '')
                        .replace('unit', '');
                    for(var unitProperty in unit){
                        if(unit.hasOwnProperty(unitProperty)){
                            var lowerCaseUnitProperty = unitProperty.toLowerCase();
                            if(lowerCaseObjectProperty === lowerCaseUnitProperty){
                                qm.qmLog.info("Setting " + objectProperty + " to " + unit[unitProperty]);
                                object[objectProperty] = unit[unitProperty];
                            }
                        }
                    }
                }
            }
            if(object.unitId){object.unitId = unit.id;}
            if(object.unitName){object.unitName = unit.name;}
            if(object.unitAbbreviatedName){object.unitAbbreviatedName = unit.abbreviatedName;}
            if(object.unit){object.unit = unit;}
            return object;
        },
        getYesNo: function() {
            return qm.unitHelper.getByNameAbbreviatedNameOrId("yes/no");
        },
        addUnit: function(arr) {
            if(!arr){return arr;}
            if(!Array.isArray(arr)){
                if(typeof arr !== 'object'){return arr;}
                arr = [arr]
            }
            for(var i = 0; i < arr.length; i++){
                var obj = arr[i];
                var unit = obj.unit || obj.defaultUnit;
                if(!unit){
                    var nameOrId = obj.unitId ||
                        obj.defaultUnitId ||
                        obj.unitName ||
                        obj.unitAbbreviatedName ||
                        obj.defaultUnitName ||
                        null;
                    if(nameOrId){unit = qm.unitHelper.getByNameAbbreviatedNameOrId(nameOrId);}
                }
                if(unit){
                    obj.unit = obj.unit || unit
                    obj.unitName = obj.unitName || unit.name
                    obj.unitAbbreviatedName = obj.unitAbbreviatedName || unit.abbreviatedName
                }
            }
            return arr;
        },
        find: function(v) {
            var nameOrId;
            if(typeof v === "string" || v === parseInt(v, 10)){
                nameOrId = v;
            } else {
                nameOrId = v.unitId || v.defaultUnitId || v.defaultUnitAbbreviatedName || v.unitAbbreviatedName || v.id;
            }
            return qm.unitHelper.getByNameAbbreviatedNameOrId(nameOrId);
        }
    },
    urlHelper: {
        appendPathToUrl: function(baseUrl, pathToAppend){
            var params = {};
            if(baseUrl.indexOf('?') !== -1){
                params = qm.objectHelper.copyPropertiesFromOneObjectToAnother(qm.urlHelper.getQueryParams(baseUrl), params, false);
                baseUrl = qm.stringHelper.getStringBeforeSubstring('?', baseUrl);
            }
            if(pathToAppend.indexOf('?') !== -1){
                params = qm.objectHelper.copyPropertiesFromOneObjectToAnother(qm.urlHelper.getQueryParams(pathToAppend), params, false);
                pathToAppend = qm.stringHelper.getStringBeforeSubstring('?', pathToAppend);
            }
            if(qm.stringHelper.getLastCharacter(baseUrl) === '/'){
                baseUrl = qm.stringHelper.removeLastCharacter(baseUrl);
            }
            if(qm.stringHelper.getFirstCharacter(pathToAppend) === '/'){
                pathToAppend = qm.stringHelper.removeFirstCharacter(pathToAppend);
            }
            var fullUrl = baseUrl + '/' + pathToAppend;
            fullUrl = qm.urlHelper.addUrlQueryParamsToUrlString(params, fullUrl);
            qm.urlHelper.validateUrl(fullUrl);
            return fullUrl;
        },
        validateUrl: function(url){
            if(url.indexOf('index.html') !== -1 &&
                url.indexOf('2Findex.html') === -1 &&
                url.indexOf('/index.html') === -1){
                console.trace();
                var e = new Error();
                qm.qmLog.errorAndExceptionTestingOrDevelopment("url should not be "+ url, e.stack);
            }
        },
        addUrlQueryParamsToUrlString: function(params, url){
            qm.urlHelper.validateUrl(url);
            if(!url){
                url = qm.urlHelper.getCurrentUrl();
                qm.urlHelper.validateUrl(url);
            }
            var previousParams = qm.urlHelper.getQueryParams(url); // Avoid duplicates
            params = qm.objectHelper.copyPropertiesFromOneObjectToAnother(params, previousParams, false);
            for(var key in params){
                if(params.hasOwnProperty(key)){
                    if(url.indexOf(key + '=') === -1){
                        var value = params[key];
                        if(value === false){value = "0";} // False is converted to empty string in PHP for some reason
                        if(value === null){
                            console.error("Not adding null param " + key);  // Don't use qm.qmLog here because it's called by the logger -> infinite loop
                            continue;
                        }
                        if(url.indexOf('?') === -1){
                            url = url + "?" + key + "=" + encodeURIComponent(value);
                        }else{
                            url = url + "&" + key + "=" + encodeURIComponent(value);
                        }
                    }
                }
            }
            qm.urlHelper.validateUrl(url);
            return url;
        },
        addUrlParamsToObject: function(state){
            var params = qm.urlHelper.getQueryParams();
            state = qm.objectHelper.copyPropertiesFromOneObjectToAnother(params, state, false);
            return state;
        },
        addUrlParamsToCurrentUrl: function insertParam(key, value){
            qm.qmLog.error("This adds params before hash"); // TODO: Fix me
            key = encodeURI(key);
            value = encodeURI(value);
            var kvp = document.location.search.substr(1).split('&');
            var i = kvp.length;
            var x;
            while(i--){
                x = kvp[i].split('=');
                if(x[0] == key){
                    x[1] = value;
                    kvp[i] = x.join('=');
                    break;
                }
            }
            if(i < 0){kvp[kvp.length] = [key, value].join('=');}
            document.location.search = kvp.join('&');
        },
        getParam: function(parameterName, url, shouldDecode){
            if(Array.isArray(parameterName)){
                for (i = 0; i < parameterName.length; i++) {
                    var one = parameterName[i];
                    var res = qm.urlHelper.getParam(one);
                    if(res !== null){return res;}
                }
                return null;
            }
            if(!url){
                url = qm.urlHelper.getCurrentUrl();
            }
            if(!url){
                return null;
            }
            url = qm.urlHelper.putQueryAfterHash(url);
            if(parameterName.toLowerCase().indexOf('name') !== -1){
                shouldDecode = true;
            }
            if(url.split('?').length > 1){
                var queryString = qm.urlHelper.getQueryStringFromUrl(url);
                var parameterKeyValuePairs = queryString.split('&');
                for(var i = 0; i < parameterKeyValuePairs.length; i++){
                    var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
                    if(currentParameterKeyValuePair[0].toCamelCase().toLowerCase() === parameterName.toCamelCase().toLowerCase()){
                        currentParameterKeyValuePair[1] = qm.stringHelper.parseBoolean(currentParameterKeyValuePair[1]);
                        if(typeof currentParameterKeyValuePair[1].indexOf !== "undefined" && currentParameterKeyValuePair[1].indexOf("https:%2F%2F") === 0){
                            shouldDecode = true;
                        }
                        if(typeof shouldDecode !== "undefined"){
                            var decoded = decodeURIComponent(currentParameterKeyValuePair[1]);
                            if(decoded && decoded.indexOf('%2') !== -1){
                                decoded = decodeURIComponent(decoded); // Must have been double encoded
                            }
                            try {
                                return decodeURIComponent(decoded);
                            } catch (error) {
                                qm.qmLog.info(error.message + " so just returning " + decoded);
                                return decoded; // Must have already been decoded (happens when % symbol is in variable name)
                            }
                        }else{
                            return currentParameterKeyValuePair[1];
                        }
                    }
                }
            }
            return null;
        },
        getQueryParams: function(url){
            if(!url){
                url = qm.urlHelper.getCurrentUrl();
            }
            var keyValuePairsObject = {};
            var array = [];
            if(url.split('?').length > 1){
                var queryString = qm.urlHelper.getQueryStringFromUrl(url);
                var parameterKeyValueSubstrings = queryString.split('&');
                for(var i = 0; i < parameterKeyValueSubstrings.length; i++){
                    array = parameterKeyValueSubstrings[i].split('=');
                    keyValuePairsObject[array[0]] = array[1];
                }
            }
            return keyValuePairsObject;
        },
        getQueryStringFromUrl: function(url){
            var queryString = url.split('?')[1];
            if(queryString.indexOf('#') !== -1){
                queryString = queryString.split('#')[0];
            }
            return queryString;
        },
        openUrlInNewTab: function(url){
            if(!qm.platform.getWindow()){return false;}
            qm.qmLog.info("openUrlInNewTab: " + url);
            window.open(url, '_blank');
        },
        openUrl: function(url, showLocationBar, windowTarget){
            showLocationBar = showLocationBar || "no";
            windowTarget = windowTarget || '_blank';
            if(typeof cordova !== "undefined"){
                cordova.InAppBrowser.open(url, windowTarget, 'location=' + showLocationBar + ',toolbar=yes,clearcache=no,clearsessioncache=no');
            }else{
                if(qm.platform.isWeb()){
                    window.open(url, windowTarget);  // Otherwise it opens weird popup instead of new tab
                }else{
                    window.open(url, windowTarget, 'location=' + showLocationBar + ',toolbar=yes,clearcache=yes,clearsessioncache=yes');
                }
            }
        },
        getIonicUrlForPath: function(path){
            return qm.urlHelper.getIonicAppBaseUrl() + "index.html#/app/" + path;
        },
        getIonicAppBaseUrl: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            var url = window.location.origin + window.location.pathname;
            url = qm.stringHelper.getStringBeforeSubstring('#', url);
            url = qm.stringHelper.getStringBeforeSubstring('configuration-index.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('index.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('android_popup.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('chrome_default_popup_iframe.html', url);
            url = qm.stringHelper.getStringBeforeSubstring('firebase-messaging-sw.js', url);
            url = qm.stringHelper.getStringBeforeSubstring('_generated_background_page.html', url);
            return url;
        },
        getAbsoluteUrlFromRelativePath: function(relativePath){
            if(relativePath.indexOf('/') === 0){
                relativePath = relativePath.replace('/', '');
            }
            return qm.urlHelper.getIonicAppBaseUrl() + relativePath;
        },
        getPrivateConfigJsonUrl: function(){
            return qm.urlHelper.getAbsoluteUrlFromRelativePath('default.private_config.json');
        },
        onQMSubDomain: function(){
            if(qm.urlHelper.indexOfCurrentUrl('https://') !== 0){
                return false;
            }
            return qm.urlHelper.indexOfCurrentUrl('.quantimo.do') !== -1;
        },
        redirectToHttpsIfNecessary: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            if(qm.urlHelper.indexOfCurrentUrl("http://") === 0 &&
                qm.urlHelper.indexOfCurrentUrl(".com:") === -1 &&
                qm.urlHelper.indexOfCurrentUrl("http://192.168") === -1 &&
                qm.urlHelper.indexOfCurrentUrl("http://localhost") === -1){
                location.href = 'https:' + qm.urlHelper.getCurrentUrl().substring(window.location.protocol.length);
            }
        },
        getParameterFromEventUrl: function(event, parameterName){
            qm.qmLog.authDebug('extracting ' + parameterName + ' from event: ', event);
            var url = event.url;
            if(!url){
                url = event.data;
            }
            if(!url){
                qm.qmLog.errorAndExceptionTestingOrDevelopment("No url from event in getParameterFromEventUrl!  event is "+
                    JSON.stringify(event), null, event);
                return;
            }
            if(!qm.urlHelper.isQuantiMoDoDomain(url)){
                return;
            }
            var value = qm.urlHelper.getParam(parameterName, url);
            if(value){
                qm.qmLog.authDebug('got ' + parameterName + ' from ' + url + ": " + value);
            }
            return value;
        },
        isQuantiMoDoDomain: function(urlToCheck){
            if(typeof urlToCheck.indexOf !== "function"){
                qmLog.errorAndExceptionTestingOrDevelopment("urlToCheck is a "+typeof urlToCheck, urlToCheck);
                return null;
            }
            var isHttps = urlToCheck.indexOf("https://") === 0;
            var matchesQuantiModo = qm.urlHelper.getRootDomain(urlToCheck) === 'quantimo.do';
            var result = isHttps && matchesQuantiModo;
            if(!result){
                qm.qmLog.authDebug('Domain ' + qm.urlHelper.getRootDomain(urlToCheck) + ' from event.url ' +
                    urlToCheck + ' is NOT an https QuantiModo domain');
            }else{
                qm.qmLog.authDebug('Domain ' + qm.urlHelper.getRootDomain(urlToCheck) + ' from event.url ' +
                    urlToCheck + ' IS a QuantiModo domain');
            }
            return result;
        },
        getRootDomain: function(url){
            var parts = url.split('.');
            var rootDomainWithPath = parts[1] + '.' + parts[2];
            var rootDomainWithPathParts = rootDomainWithPath.split('/');
            return rootDomainWithPathParts[0];
        },
        getAuthorizationCodeFromEventUrl: function(event){
            return qm.urlHelper.getParameterFromEventUrl(event, 'code');
        },
        checkLoadStartEventUrlForErrors: function(ref, event){
            var error = qm.urlHelper.getParam('error', event.url);
            if(error){
                qm.qmLog.error(error);
                ref.close();
            }
        },
        addEventListenerAndGetParameterFromRedirectedUrl: function(windowRef, parameterName, successHandler){
            windowRef.addEventListener('loadstart', function(event){
                var value = qm.urlHelper.getParameterFromEventUrl(event, parameterName);
                if(value){
                    windowRef.close();
                    windowRef = undefined;
                    successHandler(value);
                }
                qm.urlHelper.checkLoadStartEventUrlForErrors(windowRef, event);
            });
            windowRef.addEventListener('loaderror', loadErrorCallBack);
            function loadErrorCallBack(params){
                $('#status-message').text("");
                var scriptErrorMessage = "alert('Sorry we cannot open that page. Message from the server is : " + params.message + "');";
                qm.qmLog.error(scriptErrorMessage);
                windowRef.executeScript({code: scriptErrorMessage}, executeScriptCallBack);
                windowRef.close();
                windowRef = undefined;
            }
            function executeScriptCallBack(params){
                // eslint-disable-next-line no-eq-null
                if(params[0] == null){
                    $('#status-message').text("Sorry we couldn't open that page. Message from the server is : '" + params.message + "'");
                }
            }
        },
        convertObjectToQueryString: function(obj){
            if(!obj){
                return '';
            }
            var str = [];
            for(var p in obj){
                if(obj.hasOwnProperty(p)){
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return '?' + str.join("&");
        },
        getStringAfterLastSlash: function(string){
            var lastSlashIndex = string.lastIndexOf('/');
            return string.substring(lastSlashIndex + 1);
        },
        stripQueryString: function(pathWithQuery){
            if(!pathWithQuery){
                return pathWithQuery;
            }
            if(pathWithQuery.indexOf('?') === -1){
                return pathWithQuery;
            }
            return pathWithQuery.split("?")[0];
        },
        getBaseAppUrl: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            return window.location.origin + window.location.pathname;
        },
        goToUrl: function(url, reason, newTab){
            if(!qm.platform.getWindow()){
                return false;
            }
            if(url.indexOf('mailto') !== -1){ newTab = true; }
            qm.qmLog.info("Going to " + url + " because " + reason);
            if(newTab){
                var win = window.open(url, '_blank');
                win.focus();
            } else {
                window.location.href = url;
            }
        },
        getCurrentUrl: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            return window.location.href;
        },
        indexOfCurrentUrl: function(needle){
            var currentUrl = qm.urlHelper.getCurrentUrl();
            if(!currentUrl){
                return -1;
            }
            return currentUrl.indexOf(needle);
        },
        getSubDomain: function(){
            var full = window.location.host;
            var parts = full.split('.');
            return parts[0].toLowerCase();
        },
        putQueryAfterHash: function (url) {
            if(!url){url = window.location.href;}
            var question = url.indexOf('?');
            var hash = url.indexOf("#");
            if(hash > question){
                var query = url.substr(question, hash - question);
                url = url.replace(query, '') + query;
            }
            return url;
        },
        getPatientHistoryUrl: function(accessToken, subDomain){
            subDomain = subDomain || 'patient';
            var referrerClientId = qm.getAppSettings().clientId;
            return "https://"+subDomain+".quantimo.do/#/app/history-all-category/Anything?accessToken=" + accessToken +
                '&quantimodoClientId=' + referrerClientId;
        },
        getSettingsUrl: function () {
            return qm.urlHelper.getIonicUrlForPath('settings');
        },
        urlContains: function(needle){
            return qm.urlHelper.indexOfCurrentUrl(needle) !== -1;
        }
    },
    user: null,
    userHelper: {
        deleteUserAccount: function(reason, successHandler){
            qm.api.configureClient(arguments.callee.name, null, {reason: reason});
            var apiInstance = new qm.Quantimodo.UserApi();
            function callback(error, data, response){
                qm.api.responseHandler(error, data, response, successHandler);
            }
            apiInstance.deleteUser(reason, {clientId: qm.getClientId()}, callback);
        },
        getUserFromLocalStorage: function(successHandler){
            var user = qm.storage.getItem(qm.items.user);
            function checkUserId(user){
                if(user && user.ID){
                    user.id = user.ID;
                    user = qm.objectHelper.snakeToCamelCaseProperties(user);
                }
                if(user && !user.id){
                    console.error("No user id in ", user);  // Don't use qm.qmLog.error to avoid infinite loop
                    qm.userHelper.setUser(null);
                    return null;
                }
                return user;
            }
            if(!successHandler){
                if(!user){
                    qm.qmLog.debug("We do not have a user in local storage!");
                    return false;
                }
                return checkUserId(user);
            }
            if(user){
                successHandler(checkUserId(user));
                return
            }
            qm.localForage.getItem(qm.items.user, function(user){
                successHandler(checkUserId(user));
            });
        },
        isAdmin: function(){
            var u = qm.getUser();
            if(!u){return false;}
            return u.administrator;
        },
        isTestUserOrAdmin: function(){
            return qm.userHelper.isTestUser() || qm.userHelper.isAdmin();
        },
        isTestUser: function(){
            var user = qm.globalHelper.getItem(qm.items.user); // Can't use qm.getUser() because of recursion
            if(!user){
                return false;
            }
            if(user.email && user.email.toLowerCase().indexOf('test') !== -1){
                return true;
            }
            if(user.displayName && user.displayName.toLowerCase().indexOf('test') !== -1){
                return true;
            }
            return false;
        },
        setDriftIdentity: function(user){
            if(typeof drift !== "undefined"){
                drift.identify(user.id, { // assuming your DB identifier could be something like a GUID or other unique ID.
                    email: user.email,
                    name: user.displayName,
                })
            }
            if(typeof LogRocket !== "undefined"){
                var record = qm.appMode.isProduction() || qm.urlHelper.getParam('logrocket');
                if(record){
                    LogRocket.init('zi2x4l/quantimodo');
                    LogRocket.identify(user.id, {
                        name: user.displayName,
                        email: user.email,
                        upgraded: user.stripeActive,
                        // Add your own custom user variables here, ie:
                        subscriptionType: 'pro'
                    });
                    if(typeof drift !== "undefined"){
                        LogRocket.getSessionURL(function(sessionURL){
                            drift.track('LogRocket', {sessionURL: sessionURL});
                        });
                    }
                    if(typeof Bugsnag !== "undefined"){
                        Bugsnag.beforeNotify = function(data){
                            data.metaData.sessionURL = LogRocket.sessionURL;
                            return data;
                        };
                    }
                }
            }
        },
        setUser: function(user){
            if(user && user.data && user.data.user){
                user = user.data.user;
            }
            qm.storage.setItem(qm.items.user, user);
            qm.localForage.setItem(qm.items.user, user);
            if(!user){
                return;
            }
            qm.qmLog.debug(user.displayName + ' is logged in.');
            if(qm.urlHelper.getParam('doNotRemember')){
                return;
            }
            if(!qm.platform.isBackEnd()){
                qm.qmLog.setupUserVoice();
                qm.qmLog.setupFreshChat(user);
            }
            if(!user.accessToken){
                qm.qmLog.error("User does not have access token!", null, {userToSave: user});
            }else{
                qm.auth.saveAccessTokenResponse(user);
            }
            qm.userHelper.setDriftIdentity(user);
        },
        withinAllowedNotificationTimes: function(){
            var u = qm.userHelper.getUserFromLocalStorage();
            if(u){
                var now = new Date();
                var hours = now.getHours();
                var currentTime = hours + ':00:00';
                if(currentTime > u.latestReminderTime ||
                    currentTime < u.earliestReminderTime){
                    qm.qmLog.info('Not showing notification because outside allowed time range');
                    return false;
                }
            }
            return true;
        },
        getUserViaXhrOrFetch: function(userSuccessHandler, errorHandler, params){
            qm.api.getRequestUrl('v1/user', function(url){
                qm.api.getViaXhrOrFetch(url, function(user){
                    userSuccessHandler(user);
                }, errorHandler)
            }, params);
        },
        getUserViaSdk: function(userSuccessHandler, errorHandler, params){
            qm.api.configureClient(arguments.callee.name);
            var apiInstance = new qm.Quantimodo.UserApi();
            //params.includeAuthorizedClients = true;  // To big for $rootScope!
            //qm.api.executeWithRateLimit(function () {apiInstance.getUser(params, userSdkCallback);});  // Seems to have a delay before first call
            params = qm.api.addGlobalParams(params);
            apiInstance.getUser(params, function(error, user, response){
                qm.api.generalResponseHandler(error, user, response, function(){
                    if(user){
                        userSuccessHandler(user);
                    }
                }, errorHandler, params, 'getUserFromApi');
            });
        },
        getUserFromApi: function(successHandler, errorHandler, params){
            qm.qmLog.authDebug("Getting user from API...");
            function userSuccessHandler(userFromApi){
                if(userFromApi && typeof userFromApi.displayName !== "undefined"){
                    qm.qmLog.info("Got user from API...");
                    qm.userHelper.setUser(userFromApi);
                    if(successHandler){
                        successHandler(userFromApi);
                    } // Already done below
                }else{
                    qm.qmLog.info("Could not get user from API...");
                    if(qm.platform.isChromeExtension()){
                        qm.chrome.openLoginWindow();
                    }
                }
            }
            var alwaysUseXhr = true; // Sdk doesn't return timezone
            if(alwaysUseXhr || typeof qm.Quantimodo === "undefined"){  // Can't use QM SDK in service worker because it uses XHR instead of fetch
                qm.userHelper.getUserViaXhrOrFetch(userSuccessHandler, errorHandler, params);
            }else{   // Can't use QM SDK in service worker because it uses XHR instead of fetch
                qm.userHelper.getUserViaSdk(userSuccessHandler, errorHandler, params);
            }
        },
        getUserFromLocalStorageOrApi: function(successHandler, errorHandler){
            qm.userHelper.getUserFromLocalStorage(function(user){
                if(user){
                    if(successHandler){
                        successHandler(user);
                    }
                    return;
                }
                qm.userHelper.getUserFromApi(successHandler, errorHandler);
            });
        },
        userIsOlderThan1Day: function(callback){
            qm.userHelper.userIsOlderThanXSeconds(86400, function(result){
                callback(result);
            });
        },
        userIsOlderThanXSeconds: function(secondsCutoff, callback){
            qm.getUser(function(user){
                if(!user){
                    callback(false);
                    qm.qmLog.info("userIsOlderThanXSeconds: No user to check if older than " + secondsCutoff + " seconds");
                    return;
                }
                if(!user.userRegistered){
                    callback(false);
                    qm.qmLog.info("userIsOlderThanXSeconds: No userRegistered property to check if older than " + secondsCutoff + " seconds");
                    return;
                }
                var ageInSeconds = qm.timeHelper.getUnixTimestampInSeconds() - qm.timeHelper.universalConversionToUnixTimeSeconds(user.userRegistered);
                qm.qmLog.info("userIsOlderThanXSeconds: User is " + ageInSeconds + " seconds old. createdAt: " + user.userRegistered);
                callback(ageInSeconds > secondsCutoff);
            });
        },
        getUsersFromApi: function(userSuccessHandler, errorHandler, params){
            qm.api.configureClient(arguments.callee.name);
            var apiInstance = new qm.Quantimodo.UserApi();
            //params.includeAuthorizedClients = true;  // To big for $rootScope!
            //qm.api.executeWithRateLimit(function () {apiInstance.getUser(params, userSdkCallback);});  // Seems to have a delay before first call
            params = qm.api.addGlobalParams(params);
            try {
                apiInstance.getUsers(params, function(error, user, response){
                    qm.api.generalResponseHandler(error, user, response, function(){
                        if(user){
                            userSuccessHandler(user);
                        }
                    }, errorHandler, params, 'getUsersFromApi');
                });
            } catch(e) {
                throw "Could not get users from "+ qm.api.getBaseUrl()+ " because "+e.message
            }
        },
        updateUserSettings: function(params, successHandler, errorHandler){
            qm.api.post('v3/userSettings', params, function (response) {
                var user = response.user || response.data || response;
                if(!user.email){
                    qmLog.errorAndExceptionTestingOrDevelopment("no user returned from userSettings.  Here's the response: ", response);
                    if(errorHandler){
                        errorHandler("no user returned from userSettings.")
                    }
                    return;
                }
                qm.userHelper.setUser(response.user);
                if(successHandler){successHandler(response);}
            }, errorHandler)
        }
    },
    commonVariablesHelper: {
        getFromLocalStorage: function(params, successHandler){
            if(!successHandler){
                qm.qmLog.error("No successHandler provided to commonVariables getFromLocalStorage");
                return;
            }
            if(!params){
                params = {};
            }
            var commonVariables = qm.arrayHelper.filterByRequestParams(qm.staticData.commonVariables, params);
            if(!params.sort){
                commonVariables = qm.variablesHelper.defaultVariableSort(commonVariables);
            }
            successHandler(commonVariables);
        }
    },
    userVariables: {
        defaultLimit: 20,
        updateLatestMeasurementTime: function(variableName, lastValue){
            qm.storage.getUserVariableByName(variableName, true, lastValue);
        },
        getFromApi: function(params, successHandler, errorHandler){
            if(!params){
                params = {};
            }
            params = JSON.parse(JSON.stringify(params)); // Decouple API search params so we don't mess up original local search params
            if(!params.sort || params.sort.indexOf('numberOfUserVariables') !== -1){
                params.sort = '-latestMeasurementTime';
            }
            if(!params.limit){
                params.limit = qm.userVariables.defaultLimit;
            }
            params = qm.api.addGlobalParams(params);
            var cacheKey = 'getUserVariablesFromApi';
            // We should just use build in HTTP cache because this is redundant and causes unexpected results
            // var cachedData = qm.api.cacheGet(params, cacheKey);
            // if(cachedData && successHandler){
            //     successHandler(cachedData);
            //     return;
            // }
            qm.api.configureClient(cacheKey, null, params);
            var apiInstance = new qm.Quantimodo.VariablesApi();
            function callback(error, data, response){
                if(data){
                    qm.variablesHelper.saveToLocalStorage(data);
                }
                qm.api.generalResponseHandler(error, data, response, successHandler, errorHandler, params, cacheKey);
            }
            qmLog.info("apiInstance.getVariables with params: ", params)
            apiInstance.getVariables(params, callback);
        },
        getByNameFromApi: function(variableName, params, successHandler, errorHandler){
            if(!params){
                params = {};
            }
            params.name = variableName;
            qm.userVariables.getFromApi(params, function(userVariables){
                qm.variablesHelper.saveToLocalStorage(userVariables);
                successHandler(userVariables[0]);
            }, errorHandler)
        },
        getByName: function(variableName, params, refresh, successHandler, errorHandler){
            if(!params){
                params = {};
            }
            if(!variableName){
                variableName = qm.getPrimaryOutcomeVariable().name;
            }
            if(refresh){
                qm.userVariables.getByNameFromApi(variableName, params, successHandler, errorHandler);
                return;
            }
            qm.localForage.searchByProperty(qm.items.userVariables, 'name', variableName, function(userVariables){
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
        getFromLocalStorage: function(params, successHandler, errorHandler){
            if(!qm.getUser()){
                qm.qmLog.debug("No user to get user variables!");
                qm.commonVariablesHelper.getFromLocalStorage(params, successHandler, errorHandler);
                return;
            }
            if(!params){
                params = {};
            }
            qm.localForage.getElementsWithRequestParams(qm.items.userVariables, params, function(variables){
                if(!params.sort){
                    variables = qm.variablesHelper.defaultVariableSort(variables);
                }
                successHandler(variables);
            }, function(error){
                qm.qmLog.error(error);
                if(errorHandler){
                    errorHandler(error);
                }
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
                    if(!variableSearchQuery){
                        return true;
                    }
                    return qm.arrayHelper.arrayHasItemWithNameProperty(variables) && variables[0].name.toLowerCase() === variableSearchQuery.toLowerCase(); // No need for API request if we have exact match
                }
                function shouldWeMakeVariablesSearchAPIRequest(variables, variableSearchQuery){
                    var haveEnough = doWeHaveEnoughVariables(variables);
                    var exactMatch = doWeHaveExactMatch(variables, variableSearchQuery);
                    return !haveEnough && !exactMatch;
                }
                if(userVariables && userVariables.length && !shouldWeMakeVariablesSearchAPIRequest(userVariables, params.searchPhrase)){
                    successHandler(userVariables);
                    qm.qmLog.info(userVariables.length + " user variables matching " + JSON.stringify(params) + " in local storage");
                    return;
                }
                qm.qmLog.info("No user variables matching " + JSON.stringify(params) + " in local storage");
                qm.userVariables.getFromApi(params, function(userVariables){
                    qm.qmLog.info(userVariables.length + " user variables matching " + JSON.stringify(params) + " from API");
                    successHandler(userVariables);
                }, function(error){
                    qm.qmLog.error(error);
                    errorHandler(error);
                });
            });
        },
        refreshIfNumberOfRemindersGreaterThanUserVariables: function(successHandler, errorHandler){
            if(!qm.getUser()){
                var message = "No user so not going to refreshIfNumberOfRemindersGreaterThanUserVariables";
                qm.qmLog.debug(message);
                if(errorHandler){
                    errorHandler(message);
                }
                return;
            }
            qm.reminderHelper.getNumberOfVariablesWithLocalReminders(function(numberOfVariablesWithReminders){
                if(!numberOfVariablesWithReminders){
                    if(successHandler){
                        successHandler();
                    }
                    return;
                }
                qm.userVariables.getFromLocalStorage({}, function(userVariables){
                    var numberOfLocalVariables = 0;
                    if(userVariables){
                        numberOfLocalVariables = userVariables.length;
                    }
                    if(numberOfVariablesWithReminders && numberOfLocalVariables < numberOfVariablesWithReminders){
                        var limit = 100;
                        if(numberOfVariablesWithReminders > limit){
                            limit = numberOfVariablesWithReminders + 1;
                        }
                        qm.userVariables.getFromApi({limit: limit}, successHandler, errorHandler);
                    }else{
                        if(successHandler){
                            successHandler(userVariables);
                        }
                    }
                });
            })
        }
    },
    variablesHelper: {
        getFromLocalStorageOrApi: function(params, successHandler, errorHandler){
            params = params || {};
            var search = params.searchPhrase;
            var min = params.minimumNumberOfResultsRequiredToAvoidAPIRequest;
            if(!search || search === ""){min = 20;}
            if(search && search.length > 8){min = 4;}
            if(search && search.length > 12){min = 2;}
            if(search && search.length > 16){min = 1;} // Must be 16 search.length or we don't make API request to get Green Olives
            if(params.id || params.name){min = 1;}
            function sortUpdateSubtitlesAndReturnVariables(variables, params){
                if(!params.sort){
                    variables = qm.variablesHelper.defaultVariableSort(variables);
                }
                variables = qm.variablesHelper.updateSubtitles(variables, params);
                if(params && params.limit){
                    variables = variables.slice(0, params.limit)
                }
                if(successHandler){
                    successHandler(variables);
                }
            }
            function getFromApi(localVariables, reason){
                if(reason && typeof reason !== "string"){throw "Reason should be a string!"}
                params.reason = reason;
                qm.userVariables.getFromApi(params, function(variablesFromApi){
                    if(localVariables && variablesFromApi.length < localVariables.length && variablesFromApi.length < 50){
                        qm.qmLog.errorAndExceptionTestingOrDevelopment("More local variables than variables from API!",
                            {
                                local: localVariables.length,
                                api: variablesFromApi.length,
                                params: params
                            });
                    }
                    sortUpdateSubtitlesAndReturnVariables(variablesFromApi, params);
                }, function(error){
                    qm.qmLog.error(error);
                    if(errorHandler){
                        if(typeof errorHandler !== "function"){
                            qm.qmLog.error("errorHandler is not a function! It is: ", errorHandler);
                        }
                        errorHandler(error);
                    }
                });
            }
            if(params.excludeLocal){
                getFromApi(null, "excludeLocal is " + params.excludeLocal +
                    " (excludeLocal is necessary for complex filtering like tag searches)");
                return;
            }
            if(params.includePublic){
                qm.variablesHelper.getUserAndCommonVariablesFromLocalStorage(params, function(localVariables){
                    var localCount = localVariables.length;
                    if(localCount){
                        qm.qmLog.debug("Returning " + localCount + " local variables that match");
                        sortUpdateSubtitlesAndReturnVariables(localVariables, params); // Return the local ones we found
                        if(localCount >= min){
                            qm.qmLog.debug("No need for API request because we have more than " + min);
                            return;
                        }
                        qm.qmLog.debug("Searching api as well because we don't have more than " + min);
                    }
                    getFromApi(localVariables, "only " + localCount +
                        " local user or common variables and minimumNumberOfResultsRequiredToAvoidAPIRequest is " + min);
                }, function(error){
                    getFromApi(null, "error getting local user and common variables: " + error);
                });
            }else{
                qm.userVariables.getFromLocalStorageOrApi(params, function(userVariables){
                    sortUpdateSubtitlesAndReturnVariables(userVariables, params);
                }, errorHandler);
            }
        },
        putManualTrackingFirst: function(variables){ // Don't think we need to do this anymore since we sort by number of reminders maybe?
            if(!variables){
                qm.qmLog.error("no variables provided to putManualTrackingFirst");
                return;
            }
            var manualTracking = variables.filter(function(variableToCheck){
                return variableToCheck.manualTracking === true;
            });
            var nonManual = variables.filter(function(variableToCheck){
                return variableToCheck.manualTracking !== true;
            });
            return manualTracking.concat(nonManual);
        },
        defaultVariableSort: function(variables){
            if(!variables){
                qm.qmLog.debug("no variables provided to defaultVariableSort");
                return null;
            }
            variables = qm.variablesHelper.putManualTrackingFirst(variables);
            function getValue(object){
                if(object.lastSelectedAt){
                    return object.lastSelectedAt;
                }
                if(object.userId){
                    return object.latestMeasurementTime || object.numberOfTrackingReminders || object.numberOfUserVariables;
                }
                return object.numberOfUserVariables;
            }
            variables.sort(function(a, b){
                var aValue = getValue(a);
                var bValue = getValue(b);
                if(aValue < bValue) return 1;
                if(aValue > bValue) return -1;
                return 0;
            });
            return variables;
        },
        getUserAndCommonVariablesFromLocalStorage: function(params, successHandler, errorHandler){
            params = params || {};
            qm.userVariables.getFromLocalStorage(params, function(userVariables){
                userVariables = userVariables || [];
                qm.commonVariablesHelper.getFromLocalStorage(params, function(commonVariables){
                    commonVariables = commonVariables || [];
                    var both = userVariables.concat(commonVariables);
                    both = qm.arrayHelper.getUnique(both, 'variableId');
                    successHandler(both);
                });
            }, errorHandler);
        },
        updateSubtitles: function(variables, params){
            if(params && params.sort){
                var sort = params.sort;
                sort = sort.replace("-", "");
                for(var i = 0; i < variables.length; i++){
                    if(sort.toLowerCase().indexOf("correlation")){
                        if(variables[i][sort]){
                            var number = variables[i][sort];
                            variables[i].subtitle = number + " studies";
                        }
                    }
                }
            }
            return variables;
        },
        setLastSelectedAtAndSave: function(variable){
            if(!variable){
                qm.qmLog.errorAndExceptionTestingOrDevelopment("No variable provided to setLastSelectedAtAndSave");
                return;
            }
            var timestamp = qm.timeHelper.getUnixTimestampInSeconds();
            variable.lastSelectedAt = timestamp;  // Do this so it's at the top of the list
            qm.variablesHelper.saveToLocalStorage(variable);
            if(!variable.userId){
                var gottenVariable = qm.staticData.commonVariables[0];
                qm.assert.equals(timestamp, gottenVariable.lastSelectedAt);
            }
        },
        saveToLocalStorage: function(variables){
            if(!variables){
                qm.qmLog.error("No variables provided to variablesHelper.saveToLocalStorage");
                return;
            }
            variables = qm.arrayHelper.convertToArrayIfNecessary(variables);
            var userVariables = [];
            var commonVariables = [];
            for(var i = 0; i < variables.length; i++){
                var variable = variables[i];
                if(!variable){
                    throw "empty array provided to saveToLocalStorage";
                }
                if(variable.userId && variable.userId === qm.getUser().id){
                    userVariables.push(variable);
                }else if(!variable.userId){ // Don't save other peoples user variables when looking at studies
                    commonVariables.push(variable);
                }
            }
            if(userVariables.length){
                qm.localForage.saveWithUniqueId(qm.items.userVariables, userVariables);
            }
            if(commonVariables.length){
                qm.staticData.commonVariables = qm.arrayHelper.mergeWithUniqueId(commonVariables, qm.staticData.commonVariables);
            }
        },
    },
    variableCategoryHelper: {
        replaceCategoryAliasWithActualNameIfNecessary: function(provided){
            if(provided === "Anything"){return null;}
            var category = qm.variableCategoryHelper.findVariableCategory(provided);
            if(!category){
                qmLog.errorAndExceptionTestingOrDevelopment("Category "+provided+" not found!");
                return null;
            }
            return category.name;
        },
        getVariableCategories: function(){
            return qm.staticData.variableCategories;
        },
        findVariableCategory: function(nameOrId){
            if(typeof nameOrId === 'object' && nameOrId !== null){
                var obj = nameOrId;
                nameOrId = nameOrId.variableCategoryName || nameOrId.variableCategoryId;
                if(!nameOrId && obj.measurement){
                    nameOrId = obj.measurement.variableCategoryName || obj.measurement.variableCategoryId;
                }
                if(!nameOrId && obj.variableObject){
                    nameOrId = obj.variableObject.variableCategoryName || obj.variableObject.variableCategoryId;
                }
                if(!nameOrId){
                    qmLog.debug("No name or id from object in findVariableCategory", obj)
                    return null;
                }
            }
            if(!nameOrId){nameOrId = qm.urlHelper.getParam('variableCategoryName');}
            if(!nameOrId){nameOrId = qm.urlHelper.getParam('variableCategoryId');}
            var categories = qm.variableCategoryHelper.getVariableCategories();
            var id, name = null;
            if(!nameOrId){
                qmLog.error("No name or id provided to findVariableCategory")
                return null;
            }
            if(Number.isInteger(nameOrId)){
                id = nameOrId;
            } else {
                name = nameOrId.toLowerCase();
            }
            var c = categories.find(function(c){
                if(c.id === id){return true;}
                if(c.name.toLowerCase() === name){return true;}
                for (var i = 0; i < c.synonyms.length; i++) {
                    var syn = c.synonyms[i];
                    if(name === syn.toLowerCase()){return true;}
                }
                return c.variableCategoryNameSingular && c.variableCategoryNameSingular.toLowerCase() === name;
            });
            return c;
        },
        getVariableCategoryNameFromStateParamsOrUrl: function(obj1, obj2, obj3){
            var name = qm.urlHelper.getParam('variableCategoryName');
            if(obj1 && obj1.variableCategoryName){name = obj1.variableCategoryName;}
            if(obj2 && obj2.variableCategoryName){name = obj2.variableCategoryName;}
            if(obj3 && obj3.variableCategoryName){name = obj3.variableCategoryName;}
            if(name){name = qm.variableCategoryHelper.replaceCategoryAliasWithActualNameIfNecessary(name);}
            return name;
        },
        getByNameOrId: function(nameOrId){
            var cats = qm.variableCategoryHelper.getVariableCategories();
            if(isNaN(nameOrId)){
                nameOrId = nameOrId.toLowerCase();
                nameOrId = nameOrId.replace("+", " ")
                return cats.find(function(c){
                    // noinspection EqualityComparisonWithCoercionJS
                    if(c.id == nameOrId){return true;}
                    if(c.name.toLowerCase() === nameOrId){return true;}

                    return false;
                });
            } else {
                return cats.find(function(c){return c.id === nameOrId;});
            }
        },
        addVariableCategoryProperties: function(arr){
            if(!arr){return arr;}
            if(!Array.isArray(arr)){
                if(typeof arr !== 'object'){return arr;}
                arr = [arr]
            }
            for(var i = 0; i < arr.length; i++){
                var obj = arr[i];
                var cat = obj.variableCategory;
                if(!cat){
                    var nameOrId = obj.variableCategoryId || obj.variableCategoryName || null;
                    if(nameOrId){cat = qm.variableCategoryHelper.findVariableCategory(nameOrId);}
                }
                if(cat){
                    obj.fontAwesome = obj.fontAwesome || cat.fontAwesome
                    obj.imageUrl = obj.imageUrl || cat.imageUrl
                    obj.ionIcon = obj.ionIcon || cat.ionIcon
                    obj.pngPath = obj.pngPath || cat.pngPath
                    obj.pngUrl = obj.pngUrl || cat.pngUrl
                    obj.svgPath = obj.svgPath || cat.svgPath
                    obj.svgUrl = obj.svgUrl || cat.svgUrl
                    obj.variableCategory = obj.variableCategory || cat
                }
            }
            return arr;
        }
    },
    visualizer: {
        visualizerEnabled: true,
        showing: false,
        hideVisualizer: function(){
            //qm.appContainer.setOpacity(1);
            qm.qmLog.info("Hiding visualizer");
            var visualizer = qm.visualizer.getRainbowVisualizerCanvas();
            if(visualizer){
                visualizer.style.display = "none";
            }else{
                qm.qmLog.info("qm.visualizer Element not found");
            }
        },
        showVisualizer: function(type){
            if(!qm.visualizer.visualizerEnabled){
                return;
            }
            type = type || "siri";
            qm.qmLog.info("Showing visualizer type: " + type);
            if(type === "rainbow"){
                var visualizer = qm.visualizer.getRainbowVisualizerCanvas();
                visualizer.style.display = "block";
            }
            setTimeout(function(){
                if(type === 'rainbow'){
                    qm.visualizer.rainbowCircleVisualizer();
                }else{
                    qm.visualizer.siriVisualizer();
                }
            }, 1);
        },
        setVisualizationEnabled: function(value){
            if(value === true){
                qm.visualizer.showVisualizer();
            }
            if(value === false){
                qm.visualizer.hideVisualizer();
            }
        },
        getRainbowVisualizerCanvas: function(){
            var element = document.querySelector('#rainbow-canvas');
            return element;
        },
        toggle: function(){
            if(qm.visualizer.showVisualizering){
                qm.visualizer.hideVisualizer();
            }else{
                qm.visualizer.showVisualizer();
            }
        },
        rainbowCircleVisualizer: function(){
            qm.qmLog.info("Showing rainbowCircleVisualizer...");
            var visualizer = qm.visualizer.getRainbowVisualizerCanvas();
            if(visualizer){
                visualizer.style.display = "block";
            }
            /* SOUND */
            // Audio vars
            var audioCtx = new AudioContext(),
                analyser,
                bufferLength,
                step,
                frequencyData,
                waveData;
            // Get microphone input
            if(navigator.webkitGetUserMedia){
                navigator.webkitGetUserMedia(
                    {audio: true},
                    doAudioStuff,
                    function(error){
                        qm.qmLog.error('Audio error: ' + error.name + " " + error.message);
                        if(canvas){
                            canvas.width = 0;
                            canvas.height = 0;
                        }
                    }
                );
            }else{
                navigator.mediaDevices.getUserMedia({audio: true})
                    .then(doAudioStuff)
                    .catch(function(error){
                        qm.qmLog.error('Audio error: ' + error.name + " " + error.message);
                    });
            }
            // Do the thing
            function doAudioStuff(mediaStream){
                if(!qm.platform.getWindow()){
                    return false;
                }
                window.streamReference = mediaStream;
                analyser = audioCtx.createAnalyser();
                analyser.smoothingTimeConstant = 0.97;
                analyser.fftSize = 1024;
                step = analyser.fftSize / 16;
                bufferLength = analyser.frequencyBinCount;
                frequencyData = new Uint8Array(bufferLength);
                waveData = new Uint8Array(bufferLength);
                window.source = audioCtx.createMediaStreamSource(mediaStream);
                window.source.connect(analyser);
                animate();
            }
            // Not used
            function averageVolume(data){
                var value = 0,
                    l = data.length;
                for(var i = 0; i < l; i++){
                    value += data[i];
                }
                return value / l;
            }
            /* VISION */
            var canvas = document.getElementById('rainbow-canvas'),
                ctx = canvas.getContext('2d'),
                w, h, w2, h2, h3, h4; // Canvas sizes
            //if(zIndex !== null){canvas.style.zIndex = zIndex;}
            function setCanvasSizes(){
                if(!qm.platform.getWindow()){
                    return false;
                }
                w = canvas.width = window.innerWidth;
                h = canvas.height = window.innerHeight;
                w2 = w / 2;
                h2 = h / 2;
                h3 = h / 3;
                h4 = h / 4;
            }
            setCanvasSizes();
            function byteToNum(byte, min, max){
                var hue = (byte / 128) * (max - min) + min;
                return Math.round(hue);
            }
            /* SOUND & VISION */
            // Animate frames
            function animate(){
                analyser.getByteFrequencyData(frequencyData);
                analyser.getByteTimeDomainData(waveData);
                ctx.strokeStyle = 'hsl(' + byteToNum(frequencyData[0], 1000, 3600) + ', 90%, 60%)';
                ctx.fillStyle = 'hsla(250,10%,10%,0.09)';
                ctx.fillRect(0, 0, w, h);
                /* Lines */
                ctx.beginPath();
                for(var i = 0; i < bufferLength; i++){
                    ctx.lineTo(Math.sin(frequencyData[i * step] / 20) * h3 + w2,
                        Math.cos(frequencyData[i * step] / 20) * h3 + h2);
                }
                ctx.closePath();
                ctx.stroke();
                /* Circles */
                for(i = 0; i < bufferLength; i++){
                    ctx.beginPath();
                    ctx.arc(w2, h2, byteToNum(waveData[i * step] + frequencyData[i * step], h4, h3), 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.stroke();
                }
                requestAnimationFrame(animate);
            }
            if(!qm.platform.getWindow()){
                return false;
            }
            window.addEventListener('resize', function(){
                setCanvasSizes();
            });
        },
        siriVisualizer: function(){
            // the canvas size
            var WIDTH = 1000;
            var HEIGHT = 400;
            var canvas = $('#siri-canvas')[0];
            if(!canvas){
                qm.qmLog.info("No siri canvas!");
                return false;
            }
            var ctx = canvas.getContext("2d");
            // options to tweak the look
            var opts = {
                smoothing: 0.6,
                fft: 5,
                minDecibels: -70,
                scale: 0.2,
                glow: 10,
                color1: [203, 36, 128],
                color2: [41, 200, 192],
                color3: [24, 137, 218],
                fillOpacity: 0.6,
                lineWidth: 1,
                blend: "screen",
                shift: 50,
                width: 60,
                amp: 1
            };
            if(typeof dat !== "undefined"){
                var gui = new dat.GUI(); // Interactive dat.GUI controls
                gui.close(); // hide them by default
                // connect gui to opts
                gui.addColor(opts, "color1");
                gui.addColor(opts, "color2");
                gui.addColor(opts, "color3");
                gui.add(opts, "fillOpacity", 0, 1);
                gui.add(opts, "lineWidth", 0, 10).step(1);
                gui.add(opts, "glow", 0, 100);
                gui.add(opts, "blend", [
                    "normal",
                    "multiply",
                    "screen",
                    "overlay",
                    "lighten",
                    "difference"]);
                gui.add(opts, "smoothing", 0, 1);
                gui.add(opts, "minDecibels", -100, 0);
                gui.add(opts, "amp", 0, 5);
                gui.add(opts, "width", 0, 60);
                gui.add(opts, "shift", 0, 200);
            }
            var context = new AudioContext();
            var analyser = context.createAnalyser();
            // Array to hold the analyzed frequencies
            var freqs = new Uint8Array(analyser.frequencyBinCount);
            navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            navigator.getUserMedia({audio: true}, onStream, onStreamError);
            /**
             * Create an input source from the user media stream, connect it to
             * the analyser and start the visualization.
             */
            function onStream(mediaStream){
                if(!qm.platform.getWindow()){
                    return false;
                }
                window.streamReference = mediaStream;
                var input = context.createMediaStreamSource(mediaStream);
                input.connect(analyser);
                requestAnimationFrame(visualize);
            }
            /**
             * Display an error message.
             */
            function onStreamError(e){
                document.body.innerHTML = "<h1>This pen only works with https://</h1>";
                console.error(e);
            }
            /**
             * Utility function to create a number range
             */
            function range(i){
                return Array.from(Array(i).keys());
            }
            // shuffle frequencies so that neighbors are not too similar
            var shuffle = [1, 3, 0, 4, 2];
            /**
             * Pick a frequency for the given channel and value index.
             *
             * The channel goes from 0 to 2 (R/G/B)
             * The index goes from 0 to 4 (five peaks in the curve)
             *
             * We have 32 (2^opts.fft) frequencies to choose from and
             * we want to visualize most of the spectrum. This function
             * returns the bands from 0 to 28 in a nice distribution.
             */
            function freq(channel, i){
                var band = 2 * channel + shuffle[i] * 6;
                return freqs[band];
            }
            /**
             * Returns the scale factor fot the given value index.
             * The index goes from 0 to 4 (curve with 5 peaks)
             */
            function scale(i){
                var x = Math.abs(2 - i); // 2,1,0,1,2
                var s = 3 - x; // 1,2,3,2,1
                return s / 3 * opts.amp;
            }
            /**
             *  This function draws a path that roughly looks like this:
             *       .
             * __/\_/ \_/\__
             *   \/ \ / \/
             *       '
             *   1 2 3 4 5
             *
             * The function is called three times (with channel 0/1/2) so that the same
             * basic shape is drawn in three different colors, slightly shifted and
             * each visualizing a different set of frequencies.
             */
            function path(channel){
                // Read color1, color2, color2 from the opts
                var color = opts["color" + (channel + 1)].map(Math.floor);
                // turn the [r,g,b] array into a rgba() css color
                ctx.fillStyle = "rgba(" + color + ", " + opts.fillOpacity + ")";
                // set stroke and shadow the same solid rgb() color
                ctx.strokeStyle = ctx.shadowColor = "rgb(" + color + ")";
                ctx.lineWidth = opts.lineWidth;
                ctx.shadowBlur = opts.glow;
                ctx.globalCompositeOperation = opts.blend;
                var m = HEIGHT / 2; // the vertical middle of the canvas
                // for the curve with 5 peaks we need 15 control points
                // calculate how much space is left around it
                var offset = (WIDTH - 15 * opts.width) / 2;
                // calculate the 15 x-offsets
                var x = range(15).map(function(i){
                    return offset + channel * opts.shift + i * opts.width;
                });
                // pick some frequencies to calculate the y values
                // scale based on position so that the center is always bigger
                var y = range(5).map(function(i){
                    return Math.max(0, m - scale(i) * freq(channel, i));
                });
                var h = 2 * m;
                ctx.beginPath();
                ctx.moveTo(0, m); // start in the middle of the left side
                ctx.lineTo(x[0], m + 1); // straight line to the start of the first peak
                ctx.bezierCurveTo(x[1], m + 1, x[2], y[0], x[3], y[0]); // curve to 1st value
                ctx.bezierCurveTo(x[4], y[0], x[4], y[1], x[5], y[1]); // 2nd value
                ctx.bezierCurveTo(x[6], y[1], x[6], y[2], x[7], y[2]); // 3rd value
                ctx.bezierCurveTo(x[8], y[2], x[8], y[3], x[9], y[3]); // 4th value
                ctx.bezierCurveTo(x[10], y[3], x[10], y[4], x[11], y[4]); // 5th value
                ctx.bezierCurveTo(x[12], y[4], x[12], m, x[13], m); // curve back down to the middle
                ctx.lineTo(1000, m + 1); // straight line to the right edge
                ctx.lineTo(x[13], m - 1); // and back to the end of the last peak
                // now the same in reverse for the lower half of out shape
                ctx.bezierCurveTo(x[12], m, x[12], h - y[4], x[11], h - y[4]);
                ctx.bezierCurveTo(x[10], h - y[4], x[10], h - y[3], x[9], h - y[3]);
                ctx.bezierCurveTo(x[8], h - y[3], x[8], h - y[2], x[7], h - y[2]);
                ctx.bezierCurveTo(x[6], h - y[2], x[6], h - y[1], x[5], h - y[1]);
                ctx.bezierCurveTo(x[4], h - y[1], x[4], h - y[0], x[3], h - y[0]);
                ctx.bezierCurveTo(x[2], h - y[0], x[1], m, x[0], m);
                ctx.lineTo(0, m); // close the path by going back to the start
                ctx.fill();
                ctx.stroke();
            }
            /**
             * requestAnimationFrame handler that drives the visualization
             */
            function visualize(){
                // set analysert props in the loop react on dat.gui changes
                analyser.smoothingTimeConstant = opts.smoothing;
                analyser.fftSize = Math.pow(2, opts.fft);
                analyser.minDecibels = opts.minDecibels;
                analyser.maxDecibels = 0;
                analyser.getByteFrequencyData(freqs);
                // set size to clear the canvas on each frame
                canvas.width = WIDTH;
                canvas.height = HEIGHT;
                // draw three curves (R/G/B)
                path(0);
                path(1);
                path(2);
                // schedule next paint
                requestAnimationFrame(visualize);
            }
        },
        equalizerVisualizer: function(){
            var paths = document.getElementsByTagName('path');
            var visualizer = document.getElementById('visualizer');
            if(!visualizer){
                return;
            }
            var mask = visualizer.getElementById('mask');
            var h = document.getElementsByTagName('h1')[0];
            var path;
            var report = 0;
            var soundAllowed = function(stream){
                if(!qm.platform.getWindow()){
                    return false;
                }
                //Audio stops listening in FF without // window.persistAudioStream = stream;
                //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
                //https://support.mozilla.org/en-US/questions/984179
                window.streamReference = stream;
                h.innerHTML = "Thanks";
                h.setAttribute('style', 'opacity: 0;');
                var audioContent = new AudioContext();
                var audioStream = audioContent.createMediaStreamSource(stream);
                var analyser = audioContent.createAnalyser();
                audioStream.connect(analyser);
                analyser.fftSize = 1024;
                var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
                visualizer.setAttribute('viewBox', '0 0 255 255');
                //Through the frequencyArray has a length longer than 255, there seems to be no
                //significant data after this point. Not worth visualizing.
                for(var i = 0; i < 255; i++){
                    path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('stroke-dasharray', '4,1');
                    mask.appendChild(path);
                }
                var doDraw = function(){
                    requestAnimationFrame(doDraw);
                    analyser.getByteFrequencyData(frequencyArray);
                    var adjustedLength;
                    for(var i = 0; i < 255; i++){
                        adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                        paths[i].setAttribute('d', 'M ' + (i) + ',255 l 0,-' + adjustedLength);
                    }
                };
                doDraw();
            };
            var soundNotAllowed = function(error){
                h.innerHTML = "You must allow your microphone.";
                console.log(error);
            };
            /*window.navigator = window.navigator || {};
            /*navigator.getUserMedia =  navigator.getUserMedia       ||
                                      navigator.webkitGetUserMedia ||
                                      navigator.mozGetUserMedia    ||
                                      null;*/
            navigator.getUserMedia({audio: true}, soundAllowed, soundNotAllowed);
        },
    },
    webNotifications: {
        initializeFirebase: function(){
            if(qm.firebase){
                qm.qmLog.debug("Firebase already initialized");
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
            qm.qmLog.debug("firebase.initializeApp(config)");
            qm.firebase = firebase.initializeApp(config);
            return qm.firebase;
        },
        registerServiceWorker: function(force){
            if(!force){
                if(!qm.platform.getWindow()){
                    return false;
                }
                if(qm.platform.browser.isFirefox() && qm.urlHelper.indexOfCurrentUrl("herokuapp") !== -1){
                    qm.qmLog.info("serviceWorker doesn't work in Firefox tests for some reason");
                    return false;
                }
                if(qm.serviceWorker){
                    qm.qmLog.debug("serviceWorker already registered");
                    return false;
                }
                if(!qm.platform.isWeb()){
                    qm.qmLog.debug("Not registering service worker because not on Web");
                    return false;
                }
                if(qm.appMode.isBuilder()){
                    qm.qmLog.debug("Not registering service worker because appMode isBuilder");
                    return false;
                }
            }
            try{
                qm.webNotifications.initializeFirebase();
            }catch (e){
                qm.qmLog.error(e.message, e, e);
                return false;
            }
            // Service worker must be served from same origin with no redirect so we serve directly with nginx
            var serviceWorkerUrl = qm.urlHelper.getIonicAppBaseUrl() + 'firebase-messaging-sw.js';
            qm.qmLog.debug("Loading service worker from " + serviceWorkerUrl);
            if(typeof navigator.serviceWorker === "undefined"){
                qm.qmLog.error("navigator.serviceWorker is not defined!");
                return false;
            }
            try{
                navigator.serviceWorker.register(serviceWorkerUrl)
                    .then(function(registration){
                        var messaging = firebase.messaging();
                        try {
                            messaging.useServiceWorker(registration);
                        } catch (error) {
                            qm.qmLog.info(error.message);
                        }
                        qm.webNotifications.subscribeUser(messaging, force);
                    });
                qm.serviceWorker = navigator.serviceWorker;
                return qm.serviceWorker;
            }catch (e){
                qm.qmLog.error(e.message, e, e);
                return false;
            }
        },
        getAndPostDeviceToken: function(messaging, force){
            messaging.getToken()
                .then(function(currentToken){
                    if(currentToken){
                        qm.webNotifications.token = currentToken;
                        qm.qmLog.info("Firebase messaging token: " + currentToken);
                        var deviceTokenOnServer = qm.storage.getItem(qm.items.deviceTokenOnServer);
                        if(force || !deviceTokenOnServer || deviceTokenOnServer !== currentToken){
                            qm.webNotifications.postWebPushSubscriptionToServer(currentToken);
                        }
                        //updateUIForPushEnabled(currentToken);
                    }else{
                        // Show permission request.
                        qm.qmLog.error('No Instance ID token available. Request permission to generate one.');
                        // Show permission UI.
                        //updateUIForPushPermissionRequired();
                    }
                })
                .catch(function(err){
                    qm.qmLog.debug('An error occurred while retrieving token because: '+err.message, null, err);
                    //showToken('Error retrieving Instance ID token. ', err);
                    //qm.webNotifications.postWebPushSubscriptionToServer(false);
                });
        },
        permissionGranted: null,
        subscribeUser: function(messaging, force){
            messaging.requestPermission()
                .then(function(){
                    qm.webNotifications.permissionGranted = true;
                    qm.qmLog.info('Notification permission granted.');
                    // Get Instance ID token. Initially this makes a network call, once retrieved
                    // subsequent calls to getToken will return from cache.
                    qm.webNotifications.getAndPostDeviceToken(messaging, force);
                })
                .catch(function(err){
                    qm.qmLog.info('Unable to get permission to notify.', err);
                });
        },
        postWebPushSubscriptionToServer: function(deviceTokenString){
            if(!deviceTokenString){
                qm.qmLog.error("No deviceTokenString for postWebPushSubscriptionToServer!");
                return;
            }
            if(qm.webNotifications.tokenJustPosted && qm.webNotifications.tokenJustPosted === deviceTokenString){
                qm.qmLog.info("Just posted "+deviceTokenString+" already");
                return;
            }
            qm.webNotifications.tokenJustPosted = deviceTokenString;
            qm.qmLog.info("Got token: " + deviceTokenString);
            qm.api.configureClient(arguments.callee.name);
            var apiInstance = new qm.Quantimodo.NotificationsApi();
            function callback(error, data, response){
                if(!error){
                    qm.storage.setItem(qm.items.deviceTokenOnServer, deviceTokenString);
                }else{
                    var errorMessage = qm.api.getErrorMessageFromResponse(error, response);
                    if(errorMessage.toLowerCase().indexOf('already exists') !== -1){
                        qm.storage.setItem(qm.items.deviceTokenOnServer, deviceTokenString);
                        return;
                    }
                }
                qm.api.generalResponseHandler(error, data, response, null, null, null, 'postWebPushSubscriptionToServer');
            }
            var params = qm.api.addGlobalParams({
                'platform': qm.platform.browser.get(),
                deviceToken: deviceTokenString
            });
            apiInstance.postDeviceToken(params, callback);
        }
    },
    windowHelper: {
        scrollToTop: function(){
            $("html, body").animate({scrollTop: 0}, "slow");
            return false;
        },
        isSmallHeight: function(){
            return qm.windowHelper.getWindowHeight() < 1000;
        },
        getWindowHeight: function(){
            if(!qm.platform.getWindow()){
                return false;
            }
            var h = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;
            return h;
        },
        isIframe: function(){
            return window !== window.top;
        }
    },
    qmLog: function(){
        return qm.qmLog;
    },
};
if(typeof qmLog !== "undefined"){
    qm.qmLog = qmLog;
    qmLog.qm = qm;
}
//if(typeof window !== "undefined" && typeof window.qmLog === "undefined"){window.qmLog = qm.qmLog;}  // Need to use qm.qmLog so it's available in node.js modules
if(typeof Quantimodo !== "undefined"){
    qm.Quantimodo = Quantimodo;
}
if(typeof window !== "undefined"){
    window.qm = qm;
    qm.urlHelper.redirectToHttpsIfNecessary();
}else{
    module.exports = qm;
}
if(qm.platform.isChromeExtension()){
    qm.chrome.initialize();
}
// START localStorage polyfill.  For some, Chrome on Android localStorage is null so this replaces with transient global memory storage
(function () {
    function isSupported() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch(e) {
            return false;
        }
    }

    if (typeof window !== "undefined" && !isSupported()) {
        function init(undef) {
            var store = {
                setItem: function (id, val) {
                    return store[id] = String(val);
                },
                getItem: function (id) {
                    return store.hasOwnProperty(id) ? String(store[id]) : undef;
                },
                removeItem: function (id) {
                    return delete store[id];
                },
                clear: function () {
                    init();
                }
            };

            window.localStorage = store;
        }
        init();
    }
}());
// END localStorage POLYFILL
