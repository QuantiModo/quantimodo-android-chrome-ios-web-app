angular.module('starter').factory('qmService', function($http, $q, $rootScope, $ionicPopup, $state, $timeout, $ionicPlatform, $mdDialog, $mdToast,
                                           $cordovaGeolocation, CacheFactory, $ionicLoading, Analytics, wikipediaFactory, $ionicHistory, $ionicActionSheet) {
    var qmService = {};
    qmService.ionIcons = {
        history: 'ion-ios-list-outline',
        reminder: 'ion-android-notifications-none',
        recordMeasurement: 'ion-compose',
        charts: 'ion-arrow-graph-up-right',
        settings: 'ion-settings',
        help: 'ion-help',
        refresh: 'ion-android-refresh'
    };
    $rootScope.offlineConnectionErrorShowing = false; // to prevent more than one popup
    function qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler) {
        if(!response){qmService.logError("No response provided to qmSdkApiResponseHandler"); return;}
        console.debug(response.status + " response from " + response.req.url);
        if (error) {
            qmApiGeneralErrorHandler(error, data, response);
            if(errorHandler){errorHandler(error);}
        } else {
            successHandler(data, response);
        }
    }
    // GET method with the added token
    function addGlobalUrlParamsToArray(urlParams) {
        urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent($rootScope.appSettings.appDisplayName));
        if($rootScope.appSettings.versionNumber){
            urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent($rootScope.appSettings.versionNumber));
        } else {
            authDebug("Version number not specified!", "Version number not specified on config.appSettings");
        }
        urlParams.push(encodeURIComponent('clientId') + '=' + encodeURIComponent(qmService.getClientId()));
        if(window.devCredentials){
            if(window.devCredentials.username){urlParams.push(encodeURIComponent('log') + '=' + encodeURIComponent(window.devCredentials.username));}
            if(window.devCredentials.password){urlParams.push(encodeURIComponent('pwd') + '=' + encodeURIComponent(window.devCredentials.password));}
        } else {
            authDebug("No dev credentials");
        }
        var passableUrlParameters = ['userId', 'log', 'pwd', 'userEmail'];
        for(var i = 0; i < passableUrlParameters.length; i++){
            if(qmService.getUrlParameter(passableUrlParameters[i])){urlParams.push(encodeURIComponent(passableUrlParameters[i]) + '=' + qmService.getUrlParameter(passableUrlParameters[i]));}
        }
        //urlParams.push(encodeURIComponent('access_token') + '=' + encodeURIComponent(tokenObject.accessToken));  //We can't append access token to Ionic requests for some reason
        return urlParams;
    }
    function addGlobalUrlParamsToObject(urlParams) {
        urlParams.appName = encodeURIComponent($rootScope.appSettings.appDisplayName);
        if($rootScope.appSettings.versionNumber){
            urlParams.appVersion = encodeURIComponent($rootScope.appSettings.versionNumber);
        } else {
            qmService.logDebug("Version number not specified!", "Version number not specified on config.appSettings");
        }
        urlParams.clientId = encodeURIComponent(qmService.getClientId());
        if(window.devCredentials){
            if(window.devCredentials.username){urlParams.log = encodeURIComponent(window.devCredentials.username);}
            if(window.devCredentials.password){urlParams.pwd = encodeURIComponent(window.devCredentials.password);}
        } else {
            qmService.logDebug("No dev credentials");
        }
        var passableUrlParameters = ['userId', 'log', 'pwd', 'userEmail'];
        for(var i = 0; i < passableUrlParameters.length; i++){
            if(qmService.getUrlParameter(passableUrlParameters[i])){urlParams[passableUrlParameters[i]] = qmService.getUrlParameter(passableUrlParameters[i]);}
        }
        //urlParams.access_token = encodeURIComponent(tokenObject.accessToken);  //We can't append access token to Ionic requests for some reason
        return urlParams;
    }
    function addVariableCategoryInfo(array){
        angular.forEach(array, function(value, key) {
            if(!value){qmService.logError("no value for key " + key + " in array " + JSON.stringify(array));}
            if(value && value.variableCategoryName && qmService.variableCategories[value.variableCategoryName]){
                value.iconClass = 'icon positive ' + qmService.variableCategories[value.variableCategoryName].ionIcon;
                value.ionIcon = qmService.variableCategories[value.variableCategoryName].ionIcon;
                value.moreInfo = qmService.variableCategories[value.variableCategoryName].moreInfo;
                value.image = {
                    url: qmService.variableCategories[value.variableCategoryName].imageUrl,
                    height: "96",
                    width: "96"
                };
            }
        });
        return array;
    }
    function addColors(array){
        angular.forEach(array, function(value, key) {
            if(!value){qmService.logError("no value for key " + key + " in array " + JSON.stringify(array));}
            if(value && value.color && qmService.colors[value.color]){value.color = qmService.colors[value.color];}
        });
        return array;
    }
    function toObject(arr) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i) {
            rv[i] = arr[i];
        }
        return rv;
    }
    function addVariableCategoryStateParam(object){
        if(typeof object !== "object"){
            qmService.logError("not an object", object);
            return object;
        }
        for (var prop in object) {
            // skip loop if the property is from prototype
            if(!object.hasOwnProperty(prop)) continue;
            if(object[prop].stateParameters){
                if(object[prop].stateParameters.constructor === Array){
                    qmService.logError('stateParams should be an object!');
                    object[prop].stateParameters = toObject(object[prop].stateParameters);
                }
                if(!object[prop].stateParameters.variableCategoryName){
                    object[prop].stateParameters.variableCategoryName = "Anything";
                }
            }
        }
        return object;
    }
    function removeDeprecatedProperties(object) {
        if(typeof object !== "object"){
            qmService.logError("not an object", object);
            return object;
        }
        var deprecatedProperties = ['newIntroType'];
        for (var i = 0; i < deprecatedProperties.length; i++){
            delete object[deprecatedProperties[i]];
        }
        return object;
    }
    function addAppDisplayName(array){return JSON.parse(JSON.stringify(array).replace('__APP_DISPLAY_NAME__', $rootScope.appSettings.appDisplayName));}
    function addStateNameToMessage(message) {
        if($state.current.name){message = message + " in state " + $state.current.name;}
        Bugsnag.context = $state.current.name;
        return message;
    }
    qmService.getDebugMode = function() {
        if(getUrlParameter('debug') || getUrlParameter('debugMode') || (typeof appSettings !== "undefined" && isTruthy(appSettings.debugMode))){
            qmService.debugMode = true;
            window.debugMode = true;
        }
        return window.debugMode || qmService.debugMode;
    };
    qmService.logDebug = function(message, stackTrace) {
        message = addStateNameToMessage(message);
        logDebug(message, stackTrace);
    };
    qmService.logInfo = function(message, stackTrace) {
        message = addStateNameToMessage(message);
        logInfo(message, stackTrace);
    };

    function stringify(variable) {
        try {
            variable = JSON.stringify(variable);
        } catch (error) {
            qmService.logError("Could not stringify: " + error, {variable: variable});
            return variable;
        }
        return variable;
    }
    function stringifyIfNecessary(variable){
        if(!variable || typeof message === "string"){return variable;}
        return stringify(variable);
    }
    qmService.logErrorOrInfoIfTesting = function(message, additionalMetaData, stackTrace) {
        if(envIsTesting()){
            qmService.logInfo(message, stackTrace)
        } else {
            qmService.logError(message, additionalMetaData, stackTrace);
        }
    };
    qmService.logError = function(message, additionalMetaData, stackTrace){
        if(message && message.message){message = message.message;}
        message = stringifyIfNecessary(message);
        message = addStateNameToMessage(message);
        window.logError(message, additionalMetaData, stackTrace);
    };
    qmService.addColorsCategoriesAndNames = function(array){
        array = addVariableCategoryInfo(array);
        array = addColors(array);
        array = addAppDisplayName(array);
        array = addVariableCategoryStateParam(array);
        array = removeDeprecatedProperties(array);
        return array;
    };
    qmService.get = function(route, allowedParams, params, successHandler, requestSpecificErrorHandler, options){
        if(!params){params = {};}
        if(!successHandler){
            throw "Please provide successHandler function as fourth parameter in qmService.get";
        }
        if(!options){ options = {}; }
        var cache = false;
        options.stackTrace = (params.stackTrace) ? params.stackTrace : 'No stacktrace provided with params';
        delete params.stackTrace;
        if(params && params.cache){
            cache = params.cache;
            params.cache = null;
        }
        if(!canWeMakeRequestYet('GET', route, options) && !params.force){
            if(requestSpecificErrorHandler){requestSpecificErrorHandler();}
            return;
        }
        if($state.current.name === 'app.intro' && !params.force && !qmService.getAccessTokenFromCurrentUrl()){
            qmService.logDebug('Not making request to ' + route + ' user because we are in the intro state', options.stackTrace);
            return;
        }
        delete params.force;
        qmService.getAccessTokenFromAnySource().then(function(accessToken) {
            allowedParams.push('limit');
            allowedParams.push('offset');
            allowedParams.push('sort');
            allowedParams.push('updatedAt');
            // configure params
            var urlParams = [];
            for (var property in params) {
                if (params.hasOwnProperty(property)) {
                    if (typeof params[property] !== "undefined" && params[property] !== null) {
                        urlParams.push(encodeURIComponent(property) + '=' + encodeURIComponent(params[property]));
                    } else {
                        //console.warn("Not including parameter " + property + " in request because it is null or undefined");
                    }
                }
            }
            urlParams = addGlobalUrlParamsToArray(urlParams);
            var request = {method: 'GET', url: (qmService.getQuantiModoUrl(route) + ((urlParams.length === 0) ? '' : '?' + urlParams.join('&'))), responseType: 'json', headers: {'Content-Type': "application/json"}};
            if(cache){ request.cache = cache; }
            if (accessToken) {request.headers = {"Authorization": "Bearer " + accessToken, 'Content-Type': "application/json"};}
            qmService.logDebug('GET ' + request.url, options.stackTrace);
            $http(request)
                .success(function (data, status, headers) {
                    qmService.logDebug("Got " + route + " " + status + " response: " + ': ' +  JSON.stringify(data).substring(0, 140) + '...', options.stackTrace);
                    if(!data) {
                        if (typeof Bugsnag !== "undefined") {
                            var groupingHash = 'No data returned from this request';
                            Bugsnag.notify(groupingHash, status + " response from url " + request.url, {groupingHash: groupingHash}, "error");
                        }
                    } else {
                        if (data.error) {
                            generalApiErrorHandler(data, status, headers, request, options);
                            requestSpecificErrorHandler(data);
                        }
                        if($rootScope.offlineConnectionErrorShowing){ $rootScope.offlineConnectionErrorShowing = false; }
                        if(data.message){ qmService.logDebug(data.message, options.stackTrace); }
                        successHandler(data);
                    }
                })
                .error(function (data, status, headers) {
                    generalApiErrorHandler(data, status, headers, request, options);
                    requestSpecificErrorHandler(data);
                }, onRequestFailed);
        });
    };
    qmService.post = function(route, requiredFields, body, successHandler, requestSpecificErrorHandler, options){
        if(!body){throw "Please provide body parameter to qmService.post";}
        if(!options){ options = {}; }
        options.stackTrace = (body.stackTrace) ? body.stackTrace : 'No stacktrace provided with params';
        delete body.stackTrace;
        if(!canWeMakeRequestYet('POST', route, options)){
            if(requestSpecificErrorHandler){requestSpecificErrorHandler();}
            return;
        }
        if($rootScope.offlineConnectionErrorShowing){ $rootScope.offlineConnectionErrorShowing = false; }
        var bodyString = JSON.stringify(body);
        if(!qmService.getDebugMode()){bodyString = bodyString.substring(0, 140);}
        qmService.logInfo('qmService.post: About to try to post request to ' + route + ' with body: ' + bodyString, options.stackTrace);
        qmService.getAccessTokenFromAnySource().then(function(accessToken){
            for (var i = 0; i < body.length; i++) {
                var item = body[i];
                for (var j = 0; j < requiredFields.length; j++) {
                    if (!(requiredFields[j] in item)) {
                        qmService.logError('Missing required field', requiredFields[j] + ' in ' + route + ' request!', body);
                        //throw 'missing required field in POST data; required fields: ' + requiredFields.toString();
                    }
                }
            }
            var url = qmService.getQuantiModoUrl(route) + '?' + addGlobalUrlParamsToArray([]).join('&');
            var request = {method : 'POST', url: url, responseType: 'json', headers : {'Content-Type': "application/json", 'Accept': "application/json"}, data : JSON.stringify(body)};
            if(accessToken) {
                authDebug('Using access token for POST ' + route + ": " + accessToken, options.stackTrace);
                request.headers = {"Authorization" : "Bearer " + accessToken, 'Content-Type': "application/json", 'Accept': "application/json"};
            } else {
                authDebug('No access token for POST ' + route + ". User is " + JSON.stringify($rootScope.user), options.stackTrace);
            }
            function generalSuccessHandler(response){
                qmService.logInfo('Response from POST ' + route + ": " + JSON.stringify(response));
                if(successHandler){successHandler(response);}
            }
            $http(request).success(generalSuccessHandler).error(function(data, status, headers){
                generalApiErrorHandler(data, status, headers, request, options);
                if(requestSpecificErrorHandler){requestSpecificErrorHandler(data);}
            });
        }, requestSpecificErrorHandler);
    };
    function setAfterLoginGoToUrlAndSendToLogin(){
        if($state.current.name.indexOf('login') !== -1){
            qmService.logErrorOrInfoIfTesting("Why are we sending to login from login state?");
            return;
        }
        setAfterLoginGoToUrl();
        sendToLogin();
    }
    function showOfflineError(options, request) {
        var pathWithoutQuery = getPathWithoutQuery(request);
        var doNotShowOfflineError = false;
        if (options && options.doNotShowOfflineError) {doNotShowOfflineError = true;}
        if (!$rootScope.offlineConnectionErrorShowing && !doNotShowOfflineError) {
            qmService.logError("Showing offline indicator because no data was returned from this request: " + pathWithoutQuery,
                {debugApiUrl: getDebugApiUrlFromRequest(request), request: request}, options.stackTrace);
            $rootScope.offlineConnectionErrorShowing = true;
            if ($rootScope.isIOS) {
                $ionicPopup.show({
                    title: 'NOT CONNECTED',
                    //subTitle: '',
                    template: 'Either you are not connected to the internet or the QuantiModo server cannot be reached.',
                    buttons: [{
                        text: 'OK', type: 'button-positive', onTap: function () {
                            $rootScope.offlineConnectionErrorShowing = false;
                        }
                    }]
                });
            }
        }
    }
    function logApiError(status, request, data, options) {
        var errorName = status + ' from ' + request.method + ' ' + getPathWithoutQuery(request);
        if (data && data.error && typeof data.error === "string") {errorName = data.error;}
        var metaData = {
            debugApiUrl: getDebugApiUrlFromRequest(request),
            appUrl: window.location.href,
            groupingHash: errorName,
            requestData: data,
            status: status,
            request: request,
            requestOptions: options,
            requestParams: getAllQueryParamsFromUrlString(request.url)
        };
        if (data.error) {
            metaData.groupingHash = JSON.stringify(data.error);
            if (data.error.message) {
                metaData.groupingHash = JSON.stringify(data.error.message);
            }
        }
        qmService.logError(errorName, metaData, options.stackTrace);
    }
    function handle401Response(request, options, headers) {
        if(options && options.doNotSendToLogin){return;}
        qmService.logDebug('qmService.generalApiErrorHandler: Sending to login because we got 401 with request ' + JSON.stringify(request), options.stackTrace);
        qmService.logDebug('HEADERS: ' + JSON.stringify(headers), options.stackTrace);
        setAfterLoginGoToUrlAndSendToLogin();
    }
    function getPathWithoutQuery(request) {
        var pathWithQuery = request.url.match(/\/\/[^\/]+\/([^\.]+)/)[1];
        var pathWithoutQuery = pathWithQuery.split("?")[0];
        return pathWithoutQuery;
    }
    function generalApiErrorHandler(data, status, headers, request, options){
        if(status === 302){return qmService.logDebug('Got 302 response from ' + JSON.stringify(request), options.stackTrace);}
        if(status === 401){return handle401Response(request, options, headers);}
        if(!data){
            showOfflineError(options, request);
            return;
        }
        logApiError(status, request, data, options);
    }
    function getDebugApiUrlFromRequest(request){
        var debugUrl = request.method + " " + request.url;
        if(request.headers && request.headers.Authorization){
            var accessToken = request.headers.Authorization.replace("Bearer ", "");
            debugUrl += "&access_token=" + accessToken;
        }
        debugUrl = debugUrl.replace('app.', 'local.');
        debugUrl = debugUrl.replace('staging.', 'local.');
        return debugUrl;
    }
    // Handler when request is failed
    var onRequestFailed = function(error){
        qmService.logError("Request error : " + error);
    };

    function getCurrentFunctionName() {
        var myName = arguments.callee.toString();
        myName = myName.substr('function '.length);
        myName = myName.substr(0, myName.indexOf('('));
        alert(myName);
    }
    function getCache(cacheName, minutesToLive){
        var cacheOptions = {deleteOnExpire: 'aggressive', recycleFreq: 60000, maxAge: minutesToLive * 60 * 1000};
        if (!CacheFactory.get(cacheName)) {CacheFactory.createCache(cacheName, cacheOptions);}
        return CacheFactory.get(cacheName);
    }
    function deleteCache(cacheName) {
        if (!CacheFactory.get(cacheName)) {return;}
        var dataCache = CacheFactory.get(cacheName);
        dataCache.destroy();
    }
    qmService.getMeasurementsFromApi = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.MeasurementsApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getMeasurements(params, callback);
        //qmService.get('api/v3/measurements', ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'], params, successHandler, errorHandler);
    };
    qmService.getMeasurementsDeferred = function(params, refresh){
        var deferred = $q.defer();
        if(!refresh){
            var cachedMeasurements = qmService.getCachedResponse('getV1Measurements', params);
            if(cachedMeasurements){
                deferred.resolve(cachedMeasurements);
                return deferred.promise;
            }
        }
        if(refresh){
            //deleteCache(getCurrentFunctionName());
        }
        //params.cache = getCache(getCurrentFunctionName(), 15);
        qmService.getMeasurementsFromApi(params, function(response){
            qmService.storeCachedResponse('getMeasurementsFromApi', params, response);
            deferred.resolve(qmService.addInfoAndImagesToMeasurements(response));
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getMeasurementById = function(measurementId){
        var deferred = $q.defer();
        var params = {id : measurementId};
        qmService.getMeasurementsFromApi(params, function(response){
            var measurementArray = response;
            if(!measurementArray[0]){
                qmService.logDebug('Could not get measurement with id: ' + measurementId);
                deferred.reject();
            }
            var measurementObject = measurementArray[0];
            deferred.resolve(measurementObject);
        }, function(error){
            qmService.logError(error);
            qmService.logDebug(error);
            deferred.reject();
        });
        return deferred.promise;
    };
    qmService.getMeasurementsDailyFromApi = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.MeasurementsApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params.groupingWidth = 86400;
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getMeasurements(params, callback);
        //qmService.get('api/v3/measurements/daily', ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'], params, successHandler, errorHandler);
    };
    qmService.getMeasurementsDailyFromApiDeferred = function(params, successHandler, errorHandler){
        var deferred = $q.defer();
        qmService.getMeasurementsDailyFromApi(params, function(dailyHistory){deferred.resolve(dailyHistory);}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.deleteV1Measurements = function(measurements, successHandler, errorHandler){
        qmService.post('api/v3/measurements/delete', ['variableId', 'variableName', 'startTimeEpoch', 'id'], measurements, successHandler, errorHandler);
    };
    qmService.postMeasurementsExport = function(type, successHandler, errorHandler) {
        qmService.post('api/v2/measurements/request_' + type, [], [], successHandler, errorHandler);
    };
    // post new Measurements for user
    qmService.postMeasurementsToApi = function(measurementSet, successHandler, errorHandler){
        qmService.post('api/v3/measurements',
            //['measurements', 'variableName', 'source', 'variableCategoryName', 'unitAbbreviatedName'],
            [], measurementSet, successHandler, errorHandler);
    };
    qmService.logoutOfApi = function(successHandler, errorHandler){
        //TODO: Fix this
        qmService.logDebug('Logging out of api does not work yet.  Fix it!');
        qmService.get('api/v2/auth/logout', [], {}, successHandler, errorHandler);
    };
    qmService.getAggregatedCorrelationsFromApi = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.AnalyticsApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getAggregatedCorrelations(params, callback);
        var options = {};
        //qmService.get('api/v3/aggregatedCorrelations', ['correlationCoefficient', 'causeVariableName', 'effectVariableName'], params, successHandler, errorHandler, options);
    };
    qmService.getCommonVariablesFromApi = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.VariablesApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getCommonVariables(params, callback);
        var options = {};
        //qmService.get('api/v3/aggregatedCorrelations', ['correlationCoefficient', 'causeVariableName', 'effectVariableName'], params, successHandler, errorHandler, options);
    };
    qmService.getNotesFromApi = function(params, successHandler, errorHandler){
        var options = {};
        qmService.get('api/v3/notes', ['variableName'], params, successHandler, errorHandler, options);
    };
    qmService.getUserCorrelationsFromApi = function (params, successHandler, errorHandler) {
        configureQmApiClient();
        var apiInstance = new Quantimodo.AnalyticsApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getUserCorrelations(params, callback);
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        //qmService.get('api/v3/correlations', ['correlationCoefficient', 'causeVariableName', 'effectVariableName'], params, successHandler, errorHandler);
    };
    qmService.postCorrelationToApi = function(correlationSet, successHandler ,errorHandler){
        qmService.post('api/v3/correlations', ['causeVariableName', 'effectVariableName', 'correlation', 'vote'], correlationSet, successHandler, errorHandler);
    };
    qmService.postVoteToApi = function(correlationSet, successHandler ,errorHandler){
        qmService.post('api/v3/votes', ['causeVariableName', 'effectVariableName', 'correlation', 'vote'], correlationSet, successHandler, errorHandler);
    };
    qmService.deleteVoteToApi = function(correlationSet, successHandler ,errorHandler){
        qmService.post('api/v3/votes/delete', ['causeVariableName', 'effectVariableName', 'correlation'], correlationSet, successHandler, errorHandler);
    };
    qmService.searchUserVariablesFromApi = function(query, params, successHandler, errorHandler){
        if(query){params.name = "%" + query + "%";}
        configureQmApiClient();
        var apiInstance = new Quantimodo.VariablesApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getUserVariables(params, callback);
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        //qmService.get('api/v3/variables/search/' + encodeURIComponent(query), ['limit','includePublic', 'manualTracking'], params, successHandler, errorHandler, options);
    };
    qmService.getVariablesByNameFromApi = function(variableName, params, successHandler, errorHandler){
        params.name = variableName;
        configureQmApiClient();
        var apiInstance = new Quantimodo.VariablesApi();
        function callback(error, data, response) {
            if (error || !data[0]) {
                qmApiGeneralErrorHandler(error, data, response);
                if(errorHandler){errorHandler(error);}
            } else {
                successHandler(data[0], response);
            }
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getUserVariables(params, callback);
        //var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        //qmService.get('api/v3/variables/' + encodeURIComponent(variableName), [], params, successHandler, errorHandler, options);
    };
    qmService.getVariableByIdFromApi = function(variableId, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.VariablesApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        var params = {id: variableId};
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getUserVariables(params, callback);
        //qmService.get('api/v3/variables' , ['id'], {id: variableId}, successHandler, errorHandler);
    };
    qmService.getUserVariablesFromApi = function(params, successHandler, errorHandler){
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        if(!params){params = {};}
        if(!params.limit){params.limit = 200;}
        if(params.variableCategoryName && params.variableCategoryName === 'Anything'){params.variableCategoryName = null;}
        qmService.get('api/v3/variables', ['variableCategoryName', 'limit'], params, successHandler, errorHandler);
    };
    qmService.postUserVariableToApi = function(userVariable, successHandler, errorHandler) {
        qmService.post('api/v3/userVariables',
            [
                'user',
                'variableId',
                'durationOfAction',
                'fillingValue',
                'joinWith',
                'maximumAllowedValue',
                'minimumAllowedValue',
                'onsetDelay',
                'experimentStartTime',
                'experimentEndTime'
            ], userVariable, successHandler, errorHandler);
    };
    qmService.resetUserVariable = function(body, successHandler, errorHandler) {
        qmService.post('api/v3/userVariables/reset', ['variableId'], body, successHandler, errorHandler);
    };
    qmService.deleteUserVariableMeasurements = function(variableId, successHandler, errorHandler) {
        qmService.deleteElementsOfLocalStorageItemByProperty('userVariables', 'variableId', variableId);
        qmService.deleteElementOfLocalStorageItemById('commonVariables', variableId);
        qmService.post('api/v3/userVariables/delete', ['variableId'], {variableId: variableId}, successHandler, errorHandler);
    };
    qmService.getConnectorsFromApi = function(params, successHandler, errorHandler){
        qmService.get('api/v3/connectors/list', [], params, successHandler, errorHandler);
    };
    qmService.disconnectConnectorToApi = function(name, successHandler, errorHandler){
        qmService.get('api/v3/connectors/' + name + '/disconnect', [], {}, successHandler, errorHandler);
    };
    qmService.connectConnectorWithParamsToApi = function(params, lowercaseConnectorName, successHandler, errorHandler){
        var allowedParams = ['location', 'username', 'password', 'email'];
        qmService.get('api/v3/connectors/' + lowercaseConnectorName + '/connect', allowedParams, params, successHandler, errorHandler);
    };
    qmService.connectConnectorWithTokenToApi = function(body, lowercaseConnectorName, successHandler, errorHandler){
        var requiredProperties = ['connector', 'connectorCredentials'];
        qmService.post('api/v3/connectors/connect', requiredProperties, body, successHandler, errorHandler);
    };
    qmService.connectWithAuthCodeToApi = function(code, connectorLowercaseName, successHandler, errorHandler){
        var allowedParams = ['code', 'noRedirect'];
        var params = {noRedirect: true, code: code};
        qmService.get('api/v3/connectors/' + connectorLowercaseName + '/connect', allowedParams, params, successHandler, errorHandler);
    };
    qmService.getUserFromApi = function(params, successHandler, errorHandler){
        if($rootScope.user){console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);}
        var options = {};
        options.minimumSecondsBetweenRequests = 3;
        options.doNotSendToLogin = true;
        configureQmApiClient();
        var apiInstance = new Quantimodo.UserApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler)
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getUser(params, callback);
        //qmService.get('api/user/me', [], params, successHandler, errorHandler, options);
    };
    qmService.getUserEmailPreferences = function(params, successHandler, errorHandler){
        if($rootScope.user){console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);}
        var options = {};
        options.minimumSecondsBetweenRequests = 10;
        options.doNotSendToLogin = true;
        qmService.get('api/v3/notificationPreferences', ['userEmail'], params, successHandler, errorHandler, options);
    };
    qmService.getTrackingReminderNotificationsFromApi = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.RemindersApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler)
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getTrackingReminderNotifications(params, callback);
        //qmService.get('api/v3/trackingReminderNotifications', ['variableCategoryName', 'reminderTime', 'sort', 'reminderFrequency'], params, successHandler, errorHandler);
    };
    qmService.postTrackingReminderNotificationsToApi = function(trackingReminderNotificationsArray, successHandler, errorHandler) {
        if(!trackingReminderNotificationsArray){
            successHandler();
            return;
        }
        if(trackingReminderNotificationsArray.constructor !== Array){trackingReminderNotificationsArray = [trackingReminderNotificationsArray];}
        var options = {};
        options.doNotSendToLogin = false;
        options.doNotShowOfflineError = true;
        qmService.post('api/v3/trackingReminderNotifications', [], trackingReminderNotificationsArray, successHandler, errorHandler, options);
    };
    qmService.getTrackingRemindersFromApi = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.RemindersApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getTrackingReminders(params, callback);
        //qmService.get('api/v3/trackingReminders', ['variableCategoryName', 'id'], params, successHandler, errorHandler);
    };
    qmService.getStudy = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.AnalyticsApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getStudy(params, callback);
        //qmService.get('api/v4/study', [], params, successHandler, errorHandler);
    };
    qmService.postUserSettings = function(params, successHandler, errorHandler) {
        qmService.post('api/v3/userSettings', [], params, successHandler, errorHandler);
    };
    qmService.postTrackingRemindersToApi = function(trackingRemindersArray, successHandler, errorHandler) {
        qmService.logInfo("postTrackingRemindersToApi: " + JSON.stringify(trackingRemindersArray));
        if(trackingRemindersArray.constructor !== Array){trackingRemindersArray = [trackingRemindersArray];}
        var d = new Date();
        for(var i = 0; i < trackingRemindersArray.length; i++){trackingRemindersArray[i].timeZoneOffset = d.getTimezoneOffset();}
        qmService.post('api/v3/trackingReminders', [], trackingRemindersArray, successHandler, errorHandler);
    };
    qmService.postStudy = function(body, successHandler, errorHandler){
        qmService.post('api/v3/study', [], body, successHandler, errorHandler);
    };
    qmService.postStudyDeferred = function(body) {
        var deferred = $q.defer();
        qmService.postStudy(body, function(){deferred.resolve();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.joinStudy = function(body, successHandler, errorHandler){
        qmService.post('api/v3/study/join', [], body, successHandler, errorHandler);
    };
    qmService.joinStudyDeferred = function(body) {
        var deferred = $q.defer();
        qmService.joinStudy(body, function(response){
            if(response && response.data){
                if(response.data.trackingReminderNotifications){putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data.trackingReminderNotifications);}
                if(response.data.trackingReminders){qmService.setLocalStorageItem('trackingReminders', JSON.stringify(response.data.trackingReminders));}
                if(response.data.causeUserVariable && response.data.effectUserVariable){
                    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', [response.data.causeUserVariable, response.data.effectUserVariable]);
                }
            }
            deferred.resolve();
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.postUserTagDeferred = function(tagData) {
        var deferred = $q.defer();
        qmService.postUserTag(tagData, function(response){
            qmService.addVariableToLocalStorage(response.data.userTaggedVariable);
            qmService.addVariableToLocalStorage(response.data.userTagVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.postUserTag = function(userTagData, successHandler, errorHandler) {
        if(userTagData.constructor !== Array){userTagData = [userTagData];}
        qmService.post('api/v3/userTags', [], userTagData, successHandler, errorHandler);
    };
    qmService.postVariableJoinDeferred = function(tagData) {
        var deferred = $q.defer();
        qmService.postVariableJoin(tagData, function(response){
            qmService.addVariableToLocalStorage(response.data.parentVariable);
            qmService.addVariableToLocalStorage(response.data.joinedVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.postVariableJoin = function(variableJoinData, successHandler, errorHandler) {
        if(variableJoinData.constructor !== Array){variableJoinData = [variableJoinData];}
        qmService.post('api/v3/variables/join', [], variableJoinData, successHandler, errorHandler);
    };
    qmService.deleteVariableJoinDeferred = function(tagData) {
        var deferred = $q.defer();
        qmService.deleteVariableJoin(tagData, function(response){
            qmService.addVariableToLocalStorage(response.data.parentVariable);
            qmService.addVariableToLocalStorage(response.data.joinedVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.deleteVariableJoin = function(variableJoinData, successHandler, errorHandler) {
        qmService.post('api/v3/variables/join/delete', [], variableJoinData, successHandler, errorHandler);
    };
    qmService.deleteUserTagDeferred = function(tagData) {
        var deferred = $q.defer();
        qmService.deleteUserTag(tagData, function(response){
            qmService.addVariableToLocalStorage(response.data.userTaggedVariable);
            qmService.addVariableToLocalStorage(response.data.userTagVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.deleteUserTag = function(userTagData, successHandler, errorHandler) {
        qmService.post('api/v3/userTags/delete', [], userTagData, successHandler, errorHandler);
    };
    qmService.getUserTagsDeferred = function() {
        var deferred = $q.defer();
        qmService.getUserTags.then(function (userTags) {deferred.resolve(userTags);});
        return deferred.promise;
    };
    qmService.getUserTags = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.VariablesApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getUserTags(params, callback);
        //qmService.get('api/v3/userTags', ['variableCategoryName', 'id'], params, successHandler, errorHandler);
    };
    qmService.updateUserTimeZoneIfNecessary = function () {
        var d = new Date();
        var timeZoneOffsetInMinutes = d.getTimezoneOffset();
        if($rootScope.user && $rootScope.user.timeZoneOffset !== timeZoneOffsetInMinutes ){
            var params = {timeZoneOffset: timeZoneOffsetInMinutes};
            qmService.updateUserSettingsDeferred(params);
        }
    };
    qmService.postDeviceToken = function(deviceToken, successHandler, errorHandler) {
        var platform;
        if($rootScope.isAndroid){platform = 'android';}
        if($rootScope.isIOS){platform = 'ios';}
        if($rootScope.isWindows){platform = 'windows';}
        var params = {platform: platform, deviceToken: deviceToken, clientId: qmService.getClientId(), stacktrace: getStackTrace()};
        qmService.post('api/v3/deviceTokens', ['deviceToken', 'platform'], params, successHandler, errorHandler);
    };
    qmService.deleteDeviceTokenFromServer = function(successHandler, errorHandler) {
        var deferred = $q.defer();
        if(!localStorage.getItem('deviceTokenOnServer')){
            deferred.reject('No deviceToken provided to qmService.deleteDeviceTokenFromServer');
        } else {
            var params = {deviceToken: localStorage.getItem('deviceTokenOnServer')};
            qmService.post('api/v3/deviceTokens/delete', ['deviceToken'], params, successHandler, errorHandler);
            localStorage.removeItem('deviceTokenOnServer');
            deferred.resolve();
        }
        return deferred.promise;
    };
    // delete tracking reminder
    qmService.deleteTrackingReminder = function(trackingReminderId, successHandler, errorHandler){
        if(!trackingReminderId){
            qmService.logError('No reminder id to delete with!  Maybe it has only been stored locally and has not updated from server yet.');
            return;
        }
        qmService.deleteElementsOfLocalStorageItemByProperty('trackingReminderNotifications', 'trackingReminderId', trackingReminderId);
        qmService.post('api/v3/trackingReminders/delete', ['id'], {id: trackingReminderId}, successHandler,
            errorHandler, null, {minimumSecondsBetweenRequests: 0.1});
    };
    // snooze tracking reminder
    qmService.snoozeTrackingReminderNotification = function(params, successHandler, errorHandler){
        qmService.post('api/v3/trackingReminderNotifications/snooze',
            ['id', 'trackingReminderNotificationId', 'trackingReminderId'],
            params,
            successHandler,
            errorHandler);
    };
    // skip tracking reminder
    qmService.skipTrackingReminderNotification = function(params, successHandler, errorHandler){
        qmService.post('api/v3/trackingReminderNotifications/skip',
            ['id', 'trackingReminderNotificationId', 'trackingReminderId'],
            params,
            successHandler,
            errorHandler);
    };
    // skip tracking reminder
    qmService.skipAllTrackingReminderNotifications = function(params, successHandler, errorHandler){
        if(!params){params = [];}
        qmService.post('api/v3/trackingReminderNotifications/skip/all',
            //['trackingReminderId'],
            [],
            params,
            successHandler,
            errorHandler);
    };
    qmService.getAccessTokenFromCurrentUrl = function(){
        authDebug("getAccessTokenFromCurrentUrl " + window.location.href);
        return (qmService.getUrlParameter('accessToken')) ? qmService.getUrlParameter('accessToken') : qmService.getUrlParameter('quantimodoAccessToken');
    };
    function authDebug(message) {
        var tokenDebug = false;
        if(tokenDebug){qmService.logDebug(message);}
    }
    qmService.getAccessTokenFromUrl = function(){
        if(!$rootScope.accessTokenFromUrl){
            authDebug("getAccessTokenFromUrl: No previous $rootScope.accessTokenFromUrl");
            $rootScope.accessTokenFromUrl = qmService.getAccessTokenFromCurrentUrl();
            authDebug("getAccessTokenFromUrl: Setting $rootScope.accessTokenFromUrl to " + $rootScope.accessTokenFromUrl);
            if($rootScope.accessTokenFromUrl){
                authDebug("getAccessTokenFromUrl: Setting onboarded and introSeen in local storage because we got an access token from url");
                qmService.setLocalStorageItem('onboarded', true);
                qmService.setLocalStorageItem('introSeen', true);
                qmService.logInfo("Setting onboarded and introSeen to true");
                if($state.current.name !== 'app.login'){
                    qmService.logInfo("Setting afterLoginGoToState and afterLoginGoToUrl to null");
                    qmService.setLocalStorageItem('afterLoginGoToState', null);
                    qmService.setLocalStorageItem('afterLoginGoToUrl', null);
                } else {
                    qmService.logInfo("On login state so not setting afterLoginGoToState and afterLoginGoToUrl to null");
                }
            }
        }
        authDebug("getAccessTokenFromUrl: returning this access token: " + $rootScope.accessTokenFromUrl);
        return $rootScope.accessTokenFromUrl;
    };
    function weHaveUserOrAccessToken(){
        if($rootScope.user){
            authDebug("weHaveUserOrAccessToken: We already have a $rootScope.user");
            return true;
        }
        if(qmService.getAccessTokenFromUrl()){
            authDebug("weHaveUserOrAccessToken: We already have a AccessTokenFromUrl");
            return true;
        }
    }
    qmService.goToState = function(to, params, options){
        qmService.logDebug("Called goToState: " + to, getStackTrace());
        $state.go(to, params, options);
    };
    qmService.refreshUserUsingAccessTokenInUrlIfNecessary = function(){
        authDebug("Called refreshUserUsingAccessTokenInUrlIfNecessary");
        if($rootScope.user && $rootScope.user.accessToken === qmService.getAccessTokenFromUrl()){
            authDebug("$rootScope.user token matches the one in url");
            return;
        }
        if(qmService.getAccessTokenFromUrl()){
            authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: Got access token from url");
            var accessTokenFromLocalStorage = localStorage.getItem("accessToken");
            if(accessTokenFromLocalStorage && $rootScope.accessTokenFromUrl !== accessTokenFromLocalStorage){
                qmService.clearLocalStorage();
                authDebug("Cleared local storage because accessTokenFromLocalStorage does not match accessTokenFromUrl");
            }
            var user = JSON.parse(localStorage.getItem('user'));
            if(!user){
                user = $rootScope.user;
                authDebug("No user from local storage");
            }
            if(!user && $rootScope.user){
                user = $rootScope.user;
                authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: No user from local storage but we do have a $rootScope user");
            }
            if(user && $rootScope.accessTokenFromUrl !== user.accessToken){
                $rootScope.user = null;
                qmService.clearLocalStorage();
                authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: Cleared local storage because user.accessToken does not match $rootScope.accessTokenFromUrl");
            }
            if(!qmService.getUrlParameter('doNotRemember')){
                authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: Setting access token in local storage because doNotRemember is not set");
                qmService.setLocalStorageItem('accessToken', $rootScope.accessTokenFromUrl);
            }
            if(!$rootScope.user){
                authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: No $rootScope.user so going to refreshUser");
                qmService.refreshUser();
            }
        }
    };
    qmService.getAccessTokenFromAnySource = function () {
        var deferred = $q.defer();
         if(qmService.getAccessTokenFromUrl()){
             authDebug("getAccessTokenFromAnySource: Got AccessTokenFromUrl");
            deferred.resolve($rootScope.accessTokenFromUrl);
            return deferred.promise;
        }
        var accessTokenFromLocalStorage = localStorage.getItem("accessToken");
        var expiresAtMilliseconds = localStorage.getItem("expiresAtMilliseconds");
        var refreshToken = localStorage.getItem("refreshToken");
        authDebug('getAccessTokenFromAnySource: Values from local storage:',
            JSON.stringify({expiresAtMilliseconds: expiresAtMilliseconds, refreshToken: refreshToken, accessTokenFromLocalStorage: accessTokenFromLocalStorage}));
        if(refreshToken && !expiresAtMilliseconds){
            var errorMessage = 'We have a refresh token but expiresAtMilliseconds is ' + expiresAtMilliseconds + '.  How did this happen?';
            if(!window.isTestUser()){Bugsnag.notify(errorMessage, qmService.getLocalStorageItemAsString('user'), {groupingHash: errorMessage}, "error");}
        }
        if (accessTokenFromLocalStorage && window.getUnixTimestampInMilliseconds() < expiresAtMilliseconds) {
            authDebug('getAccessTokenFromAnySource: Current access token should not be expired. Resolving token using one from local storage');
            deferred.resolve(accessTokenFromLocalStorage);
        } else if (refreshToken && expiresAtMilliseconds && qmService.getClientId() !== 'oAuthDisabled' && window.private_keys) {
            authDebug(window.getUnixTimestampInMilliseconds() + ' (now) is greater than expiresAt ' + expiresAtMilliseconds);
            qmService.refreshAccessToken(refreshToken, deferred);
        } else if(accessTokenFromLocalStorage){
            deferred.resolve(accessTokenFromLocalStorage);
        } else if (window.developmentMode) {
            qmService.getDevCredentials().then(function(){
                deferred.resolve();
            });
        } else if(qmService.getClientId() === 'oAuthDisabled' || !window.private_keys) {
            authDebug('getAccessTokenFromAnySource: oAuthDisabled so we do not need an access token');
            deferred.resolve();
            return deferred.promise;
        } else {
            authDebug('Could not get or refresh access token at ' + window.location.href);
            deferred.resolve();
        }
        return deferred.promise;
    };
    qmService.refreshAccessToken = function(refreshToken, deferred) {
        authDebug('Refresh token will be used to fetch access token from ' +
            qmService.getQuantiModoUrl("api/oauth2/token") + ' with client id ' + qmService.getClientId());
        var url = qmService.getQuantiModoUrl("api/oauth2/token");
        $http.post(url, {
            client_id: qmService.getClientId(),
            client_secret: qmService.getClientSecret(),
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        }).success(function (data) {
            // update local storage
            if (data.error) {
                qmService.logDebug('Token refresh failed: ' + data.error);
                deferred.reject('Token refresh failed: ' + data.error);
            } else {
                var accessTokenRefreshed = qmService.saveAccessTokenInLocalStorage(data);
                qmService.logDebug('qmService.refreshAccessToken: access token successfully updated from api server: ' + JSON.stringify(data));
                deferred.resolve(accessTokenRefreshed);
            }
        }).error(function (response) {
            qmService.logDebug("qmService.refreshAccessToken: failed to refresh token from api server" + JSON.stringify(response));
            deferred.reject(response);
        });
    };
    function configureQmApiClient() {
        function getAccessToken(){
            if(qmService.getAccessTokenFromUrl()){
                return qmService.getAccessTokenFromUrl();
            }
            if($rootScope.user && $rootScope.user.accessToken){return $rootScope.user.accessToken;}
            var accessTokenFromLocalStorage = localStorage.getItem("accessToken");
            if(accessTokenFromLocalStorage){return accessTokenFromLocalStorage;}
        }
        var qmApiClient = Quantimodo.ApiClient.instance;
        var quantimodo_oauth2 = qmApiClient.authentications.quantimodo_oauth2;
        qmApiClient.basePath = qmService.getApiUrl() + '/api';
        quantimodo_oauth2.accessToken = getAccessToken();
        return qmApiClient;
    }
    function qmApiGeneralErrorHandler(error, data, response, options) {
        if(!response){return qmService.logError("No API response provided to qmApiGeneralErrorHandler", {errorMessage: error, responseData: data, apiResponse: response, requestOptions: options});}
        if(response.status === 401){
            if(!options || !options.doNotSendToLogin){setAfterLoginGoToUrlAndSendToLogin();}
        } else {
            qmService.logError(error, {apiResponse: response});
        }
    }
    qmService.getMeasurements = function(params, successHandler, errorHandler){
        configureQmApiClient();
        var apiInstance = new Quantimodo.MeasurementsApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getMeasurements(params, callback);
    };
    qmService.saveAccessTokenInLocalStorage = function (accessResponse) {
        var accessToken;
        if(typeof accessResponse === "string"){accessToken = accessResponse;} else {accessToken = accessResponse.accessToken || accessResponse.access_token;}
        if (accessToken) {
            $rootScope.accessToken = accessToken;
            qmService.setLocalStorageItem('accessToken', accessToken);
        } else {
            qmService.logError('No access token provided to qmService.saveAccessTokenInLocalStorage');
            return;
        }
        var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;
        if (refreshToken) {localStorage.refreshToken = refreshToken;}
        var expiresAt = accessResponse.expires || accessResponse.expiresAt || accessResponse.accessTokenExpires;
        var expiresAtMilliseconds;
        var bufferInMilliseconds = 86400 * 1000;  // Refresh a day in advance
        if(accessResponse.accessTokenExpiresAtMilliseconds){
            expiresAtMilliseconds = accessResponse.accessTokenExpiresAtMilliseconds;
        } else if (typeof expiresAt === 'string' || expiresAt instanceof String){
            expiresAtMilliseconds = window.getUnixTimestampInMilliseconds(expiresAt);
        } else if (expiresAt === parseInt(expiresAt, 10) && expiresAt < window.getUnixTimestampInMilliseconds()) {
            expiresAtMilliseconds = expiresAt * 1000;
        } else if(expiresAt === parseInt(expiresAt, 10) && expiresAt > window.getUnixTimestampInMilliseconds()){
            expiresAtMilliseconds = expiresAt;
        } else {
            // calculate expires at
            var expiresInSeconds = accessResponse.expiresIn || accessResponse.expires_in;
            expiresAtMilliseconds = window.getUnixTimestampInMilliseconds() + expiresInSeconds * 1000;
            authDebug("Expires in is " + expiresInSeconds + ' seconds. This results in expiresAtMilliseconds being: ' + expiresAtMilliseconds);
        }
        if(expiresAtMilliseconds){
            localStorage.expiresAtMilliseconds = expiresAtMilliseconds - bufferInMilliseconds;
            return accessToken;
        } else {
            qmService.logError('No expiresAtMilliseconds!');
            Bugsnag.notify('No expiresAtMilliseconds!',
                'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qmService.getLocalStorageItemAsString('user'),
                {groupingHash: 'No expiresAtMilliseconds!'},
                "error");
        }
        var groupingHash = 'Access token expiresAt not provided in recognizable form!';
        qmService.logError(groupingHash);
        Bugsnag.notify(groupingHash,
            'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + qmService.getLocalStorageItemAsString('user'),
            {groupingHash: groupingHash}, "error");
    };
    qmService.convertToObjectIfJsonString = function (stringOrObject) {
        try {stringOrObject = JSON.parse(stringOrObject);} catch (exception) {return stringOrObject;}
        return stringOrObject;
    };
    qmService.generateV1OAuthUrl = function(register) {
        var url = qmService.getApiUrl() + "/api/oauth2/authorize?";
        // add params
        url += "response_type=code";
        url += "&client_id=" + qmService.getClientId();
        url += "&client_secret=" + qmService.getClientSecret();
        url += "&scope=" + qmService.getPermissionString();
        url += "&state=testabcd";
        if(register === true){url += "&register=true";}
        //url += "&redirect_uri=" + qmService.getRedirectUri();
        qmService.logDebug("generateV1OAuthUrl: " + url);
        return url;
    };
    qmService.generateV2OAuthUrl= function(JWTToken) {
        var url = qmService.getQuantiModoUrl("api/v2/bshaffer/oauth/authorize", true);
        url += "response_type=code";
        url += "&client_id=" + qmService.getClientId();
        url += "&client_secret=" + qmService.getClientSecret();
        url += "&scope=" + qmService.getPermissionString();
        url += "&state=testabcd";
        if(JWTToken){url += "&token=" + JWTToken;}
        //url += "&redirect_uri=" + qmService.getRedirectUri();
        qmService.logDebug("generateV2OAuthUrl: " + url);
        return url;
    };
    qmService.getAuthorizationCodeFromEventUrl = function(event) {
        qmService.logDebug('extracting authorization code from event: ' + JSON.stringify(event));
        var authorizationUrl = event.url;
        if(!authorizationUrl) {authorizationUrl = event.data;}
        if(!isQuantiMoDoDomain(authorizationUrl)){return;}
        var authorizationCode = qmService.getUrlParameter('code', authorizationUrl);
        if(authorizationCode){qmService.logDebug('got authorization code from ' + authorizationUrl);}
        //if(!authorizationCode) {authorizationCode = qmService.getUrlParameter('token', authorizationUrl);}
        return authorizationCode;
    };
    qmService.getAccessTokenFromAuthorizationCode = function (authorizationCode) {
        qmService.logDebug("Authorization code is " + authorizationCode);
        var deferred = $q.defer();
        var url = qmService.getQuantiModoUrl("api/oauth2/token");
        var request = {
            method: 'POST',
            url: url,
            responseType: 'json',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                client_id: qmService.getClientId(),
                client_secret: qmService.getClientSecret(),
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: qmService.getRedirectUri()
            }
        };
        qmService.logDebug('getAccessTokenFromAuthorizationCode: request is ', request);
        qmService.logDebug(JSON.stringify(request));
        // post
        $http(request).success(function (response) {
            if(response.error){
                qmService.reportErrorDeferred(response);
                alert(response.error + ": " + response.error_description + ".  Please try again or contact mike@quantimo.do.");
                deferred.reject(response);
            } else {
                qmService.logDebug('getAccessTokenFromAuthorizationCode: Successful response is ', response);
                qmService.logDebug(JSON.stringify(response));
                deferred.resolve(response);
            }
        }).error(function (response) {
            qmService.logDebug('getAccessTokenFromAuthorizationCode: Error response is ', response);
            qmService.logDebug(JSON.stringify(response));
            deferred.reject(response);
        });
        return deferred.promise;
    };
    qmService.getTokensAndUserViaNativeGoogleLogin = function (body) {
        var deferred = $q.defer();
        var path = 'api/v3/googleIdToken';
        qmService.post(path, [], body, function (response) {
            deferred.resolve(response);
        }, function (error) {
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getTokensAndUserViaNativeSocialLogin = function (provider, accessToken) {
        var deferred = $q.defer();
        if(!accessToken || accessToken === "null"){
            qmService.reportErrorDeferred("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
            deferred.reject("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
        }
        var url = qmService.getQuantiModoUrl('api/v2/auth/social/authorizeToken');
        url += "provider=" + encodeURIComponent(provider);
        url += "&accessToken=" + encodeURIComponent(accessToken);
        url += "&client_id=" + encodeURIComponent(qmService.getClientId());
        qmService.logDebug('qmService.getTokensAndUserViaNativeSocialLogin about to make request to ' + url);
        $http({
            method: 'GET',
            url: url,
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            if (response.data.success && response.data.data && response.data.data.token) {
                // This didn't solve the token_invalid issue
                // $timeout(function () {
                //     qmService.logDebug('10 second delay to try to solve token_invalid issue');
                //  deferred.resolve(response.data.data.token);
                // }, 10000);
                deferred.resolve(response.data.data);
            } else {deferred.reject(response);}
        }, function (error) {
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    function getDeviceTokenToSync(){return localStorage.getItem('deviceTokenToSync');}
    qmService.registerDeviceToken = function(){
        var deferred = $q.defer();
        if(!$rootScope.isMobile){
            deferred.reject('Not on mobile so not posting device token');
            return deferred.promise;
        }
        if(!$rootScope.user){
            deferred.reject('Cannot post device token yet because we are not logged in');
            return deferred.promise;
        }
        var deviceTokenToSync = getDeviceTokenToSync();
        if(!deviceTokenToSync){
            deferred.reject('No deviceTokenToSync in localStorage');
            return deferred.promise;
        }
        if(localStorage.getItem('lastPushTimestamp') > window.getUnixTimestampInSeconds() - 86400){
            qmService.logError("Registering for pushes even though we got a notification in the last 24 hours");
        }
        localStorage.removeItem('deviceTokenToSync');
        qmService.logDebug("Posting deviceToken to server: ", deviceTokenToSync);
        qmService.postDeviceToken(deviceTokenToSync, function(response){
            qmService.setLocalStorageItem('deviceTokenOnServer', deviceTokenToSync);
            qmService.logDebug(response);
            deferred.resolve();
        }, function(error){
            qmService.setLocalStorageItem('deviceTokenToSync', deviceTokenToSync);
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    var setupGoogleAnalytics = function(user){
        if(config.appSettings.additionalSettings && config.appSettings.additionalSettings.googleAnalyticsTrackingIds){
            if(typeof Analytics !== "undefined") {
                Analytics.configuration.accounts[0].tracker = config.appSettings.additionalSettings.googleAnalyticsTrackingIds.endUserApps;
            }
        } else {
            qmService.logError("No config.appSettings.additionalSettings.googleAnalyticsTrackingIds.endUserApps!");
        }
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        // you can set any advanced configuration here
        Analytics.set('&uid', user.id);
        Analytics.set('&ds', $rootScope.currentPlatform);
        Analytics.set('&cn', $rootScope.appSettings.appDisplayName);
        Analytics.set('&cs', $rootScope.appSettings.appDisplayName);
        Analytics.set('&cm', $rootScope.currentPlatform);
        Analytics.set('&an', $rootScope.appSettings.appDisplayName);
        if(config.appSettings.additionalSettings && config.appSettings.additionalSettings.appIds && config.appSettings.additionalSettings.appIds.googleReversedClientId){
            Analytics.set('&aid', config.appSettings.additionalSettings.appIds.googleReversedClientId);
        }
        Analytics.set('&av', config.appSettings.versionNumber);
        // Register a custom dimension for the default, unnamed account object
        // e.g., ga('set', 'dimension1', 'Paid');
        Analytics.set('dimension1', 'Paid');
        Analytics.set('dimension2', user.id.toString());
        // Register a custom dimension for a named account object
        // e.g., ga('accountName.set', 'dimension2', 'Paid');
        //Analytics.set('dimension2', 'Paid', 'accountName');
        Analytics.pageView(); // send data to Google Analytics
        //qmService.logDebug('Just set up Google Analytics');
    };
    qmService.getUserAndSetupGoogleAnalytics = function(){
        if(Analytics){
            if($rootScope.user){
                setupGoogleAnalytics($rootScope.user);
                return;
            }
            qmService.getLocalStorageItemAsStringWithCallback('user', function (userString) {
                qmService.logDebug("getLocalStorageItemAsStringWithCallback userString: " + userString);
                if(userString){
                    var user = JSON.parse(userString);
                    setupGoogleAnalytics(user);
                }
            });
        }
    };
    qmService.setUserInLocalStorageBugsnagIntercomPush = function(user){
        qmService.logDebug('setUserInLocalStorageBugsnagIntercomPush:' + JSON.stringify(user));
        $rootScope.user = user;
        if(qmService.getUrlParameter('doNotRemember')){return;}
        if(!user.accessToken){
            qmService.logError("User does not have access token!", {userToSave: user});
        }
        qmService.setLocalStorageItem('user', JSON.stringify(user));
        localStorage.user = JSON.stringify(user); // For Chrome Extension
        qmService.saveAccessTokenInLocalStorage(user);
        qmService.backgroundGeolocationInit();
        qmService.setupBugsnag();
        qmService.getUserAndSetupGoogleAnalytics();
        if (typeof UserVoice !== "undefined") {
            UserVoice.push(['identify', {
                email: user.email, // User’s email address
                name: user.displayName, // User’s real name
                created_at: window.getUnixTimestampInSeconds(user.userRegistered), // Unix timestamp for the date the user signed up
                id: user.id, // Optional: Unique id of the user (if set, this should not change)
                type: getSourceName() + ' User (Subscribed: ' + user.subscribed + ')', // Optional: segment your users by type
                account: {
                    //id: 123, // Optional: associate multiple users with a single account
                    name: getSourceName() + ' v' + config.appSettings.versionNumber, // Account name
                    //created_at: 1364406966, // Unix timestamp for the date the account was created
                    //monthly_rate: 9.99, // Decimal; monthly rate of the account
                    //ltv: 1495.00, // Decimal; lifetime value of the account
                    //plan: 'Subscribed' // Plan name for the account
                }
            }]);
        }
/*            Don't need Intercom
        window.intercomSettings = {
            app_id: "uwtx2m33",
            name: user.displayName,
            email: user.email,
            user_id: user.id,
            app_name: $rootScope.appSettings.appDisplayName,
            app_version: config.appSettings.versionNumber,
            platform: $rootScope.currentPlatform
        };
        */
        if(localStorage.getItem('deviceTokenOnServer')){qmService.logDebug("This token is already on the server: " + localStorage.getItem('deviceTokenOnServer'));}
        qmService.registerDeviceToken();
        if($rootScope.sendReminderNotificationEmails){
            qmService.updateUserSettingsDeferred({sendReminderNotificationEmails: $rootScope.sendReminderNotificationEmails});
            $rootScope.sendReminderNotificationEmails = null;
        }
        qmService.afterLoginGoToUrlOrState();
        qmService.updateUserTimeZoneIfNecessary();
    };
    qmService.goToDefaultStateIfNoAfterLoginGoToUrlOrState = function () {
        if(!qmService.afterLoginGoToUrlOrState()){qmService.goToState(config.appSettings.appDesign.defaultState);}
    };
    function sendToAfterLoginGoToUrlIfNecessary() {
        var afterLoginGoToUrl = qmService.getLocalStorageItemAsString('afterLoginGoToUrl');
        if(afterLoginGoToUrl) {
            qmService.logDebug("afterLoginGoToUrl from localstorage is  " + afterLoginGoToUrl);
            qmService.deleteItemFromLocalStorage('afterLoginGoToUrl');
            window.location.replace(afterLoginGoToUrl);
            return true;
        } else {
            qmService.logDebug("sendToAfterLoginGoToUrlIfNecessary: No afterLoginGoToUrl from localstorage");
        }
    }
    function sendToAfterLoginStateIfNecessary() {
        var afterLoginGoToState = qmService.getLocalStorageItemAsString('afterLoginGoToState');
        qmService.logDebug("afterLoginGoToState from localstorage is  " + afterLoginGoToState);
        if(afterLoginGoToState){
            qmService.deleteItemFromLocalStorage('afterLoginGoToState');
            qmService.goToState(afterLoginGoToState);
            return true;
        }
    }
    function sendToDefaultStateIfNecessary() {
        if($state.current.name === 'app.login'){
            qmService.goToState(config.appSettings.appDesign.defaultState);
            return true;
        }
    }
    qmService.afterLoginGoToUrlOrState = function () {
        if(sendToAfterLoginGoToUrlIfNecessary()) {return true;}
        if(sendToAfterLoginStateIfNecessary()) {return true;}
        if(sendToDefaultStateIfNecessary()) {return true;}
        return false;
    };
    qmService.syncAllUserData = function(){
        qmService.syncTrackingReminders();
        qmService.getUserVariablesFromLocalStorageOrApiDeferred();
    };
    qmService.refreshUser = function(){
        var stackTrace = getStackTrace();
        var deferred = $q.defer();
        if(qmService.getUrlParameter('logout')){
            qmService.logDebug('Not refreshing user because we have a logout parameter');
            deferred.reject('Not refreshing user because we have a logout parameter');
            return deferred.promise;
        }
        qmService.getUserFromApi({stackTrace: stackTrace}, function(user){
            qmService.setUserInLocalStorageBugsnagIntercomPush(user);
            deferred.resolve(user);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.sendToNonOAuthBrowserLoginUrl = function(register) {
        var loginUrl = qmService.getQuantiModoUrl("api/v2/auth/login");
        if (register === true) {loginUrl = qmService.getQuantiModoUrl("api/v2/auth/register");}
        qmService.logDebug('sendToNonOAuthBrowserLoginUrl: AUTH redirect URL created:', loginUrl);
        var apiUrlMatchesHostName = qmService.getApiUrl().indexOf(window.location.hostname);
        if(apiUrlMatchesHostName === -1 || !$rootScope.isChromeExtension) {
            console.warn("sendToNonOAuthBrowserLoginUrl: API url doesn't match auth base url");
        }
        qmService.showBlackRingLoader();
        loginUrl += "?redirect_uri=" + encodeURIComponent(window.location.href + '?loggingIn=true');
        // Have to come back to login page and wait for user request to complete
        window.location.replace(loginUrl);
    };
    qmService.refreshUserEmailPreferencesDeferred = function(params){
        var deferred = $q.defer();
        qmService.getUserEmailPreferences(params, function(user){deferred.resolve(user);}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.completelyResetAppState = function(){
        $rootScope.user = null;
        // Getting token so we can post as the new user if they log in again
        qmService.deleteDeviceTokenFromServer();
        qmService.clearLocalStorage();
        qmService.cancelAllNotifications();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    };
    qmService.clearOAuthTokensFromLocalStorage = function(){
        qmService.setLocalStorageItem('accessToken', null);
        qmService.setLocalStorageItem('refreshToken', null);
        qmService.setLocalStorageItem('expiresAtMilliseconds', null);
    };
    qmService.updateUserSettingsDeferred = function(params){
        var deferred = $q.defer();
        qmService.postUserSettings(params, function(response){
            if(!params.userEmail) {
                qmService.refreshUser().then(function(user){
                    qmService.logDebug('updateUserSettingsDeferred got this user: ' + JSON.stringify(user));
                }, function(error){
                    qmService.logError('qmService.updateUserSettingsDeferred could not refresh user because ' + JSON.stringify(error));
                });
            }
            deferred.resolve(response);
        }, function(response){deferred.reject(response);});
        return deferred.promise;
    };
    qmService.filterByStringProperty = function(arrayToFilter, propertyName, allowedValue){
        if(!allowedValue || allowedValue.toLowerCase() === "anything"){ return arrayToFilter; }
        var filteredArray = [];
        for(var i = 0; i < arrayToFilter.length; i++){
            if(arrayToFilter[i][propertyName].toLowerCase() === allowedValue.toLowerCase()){filteredArray.push(arrayToFilter[i]);}
        }
        return filteredArray;
    };
    qmService.getFavoriteTrackingRemindersFromLocalStorage = function(variableCategoryName){
        var deferred = $q.defer();
        qmService.getAllReminderTypes(variableCategoryName).then(function (allTrackingReminderTypes) {
            deferred.resolve(allTrackingReminderTypes.favorites);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.getTruncatedVariableName = function(variableName) {if(variableName.length > 18){return variableName.substring(0, 18) + '...';} else { return variableName;}};
    qmService.variableObjectActionSheet = function() {
        qmService.logDebug("variablePageCtrl.showActionSheetMenu:  $rootScope.variableObject: ", $rootScope.variableObject);
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                qmService.actionSheetButtons.recordMeasurement,
                qmService.actionSheetButtons.addReminder,
                qmService.actionSheetButtons.history,
                qmService.actionSheetButtons.analysisSettings,
            ],
            destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {qmService.logDebug('CANCELLED');},
            buttonClicked: function(index) {
                qmService.logDebug('BUTTON CLICKED', index);
                if(index === 0){qmService.goToState('app.measurementAddVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});} // Need variable name to populate in url
                if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});} // Need variable name to populate in url
                if(index === 2) {qmService.goToState('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});} // Need variable name to populate in url
                if(index === 3) {qmService.goToState('app.variableSettings', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});} // Need variable name to populate in url
                return true;
            },
            destructiveButtonClicked: function() {
                qmService.showDeleteAllMeasurementsForVariablePopup($rootScope.variableObject);
                return true;
            }
        });
        $timeout(function() {hideSheet();}, 20000);
    };
    qmService.attachVariableCategoryIcons = function(dataArray){
        if(!dataArray){ return;}
        var variableCategoryInfo;
        for(var i = 0; i < dataArray.length; i++){
            variableCategoryInfo = qmService.getVariableCategoryInfo(dataArray[i].variableCategoryName);
            if(variableCategoryInfo.ionIcon){
                if(!dataArray[i].ionIcon){ dataArray[i].ionIcon = variableCategoryInfo.ionIcon;}
            } else {
                console.warn('Could not find icon for variableCategoryName ' + dataArray[i].variableCategoryName);
                return 'ion-speedometer';
            }
        }
        return dataArray;
    };
    qmService.getVariableCategoryInfo = function (variableCategoryName) {
        var selectedVariableCategoryObject = $rootScope.variableCategories.Anything;
        if(variableCategoryName && $rootScope.variableCategories[variableCategoryName]){
            selectedVariableCategoryObject =  $rootScope.variableCategories[variableCategoryName];
        }
        return selectedVariableCategoryObject;
    };
    qmService.getStudyDeferred = function (params){
        var deferred = $q.defer();
        if(qmService.getUrlParameter('aggregated')){params.aggregated = true;}
        qmService.logDebug("qmService.getStudy params: " + prettyJsonStringify(params), getStackTrace());
        qmService.getStudy(params, function (response) {
            qmService.logDebug("qmService.getStudy response: " + prettyJsonStringify(response));
            var study;
            if(response.userStudy){ study = response.userStudy; }
            if(response.publicStudy){ study = response.publicStudy; }
            if(!study){study = response;}
            if(study.charts){
                study.charts = Object.keys(study.charts).map(function (key) { return study.charts[key]; });
                for(var i=0; i < study.charts.length; i++){
                    study.charts[i].chartConfig = setChartExportingOptions(study.charts[i].chartConfig);
                }
            }
            qmService.setLocalStorageItem('lastStudy', JSON.stringify(study));
            deferred.resolve(study);
        }, function (error) {
            qmService.logError("qmService.getStudy error: " + error);
            deferred.reject(error);
            qmService.logError(error);
        });
        return deferred.promise;
    };
    qmService.getLocalPrimaryOutcomeMeasurements = function(){
        var primaryOutcomeVariableMeasurements = qmService.getLocalStorageItemAsObject('primaryOutcomeVariableMeasurements');
        if(!primaryOutcomeVariableMeasurements) {primaryOutcomeVariableMeasurements = [];}
        var measurementsQueue = getPrimaryOutcomeMeasurementsFromQueue();
        if(measurementsQueue){primaryOutcomeVariableMeasurements = primaryOutcomeVariableMeasurements.concat(measurementsQueue);}
        primaryOutcomeVariableMeasurements = primaryOutcomeVariableMeasurements.sort(function(a,b){
            if(a.startTimeEpoch < b.startTimeEpoch){return 1;}
            if(a.startTimeEpoch> b.startTimeEpoch){return -1;}
            return 0;
        });
        return qmService.addInfoAndImagesToMeasurements(primaryOutcomeVariableMeasurements);
    };
    function getPrimaryOutcomeMeasurementsFromQueue() {
        var measurementsQueue = qmService.getLocalStorageItemAsObject('measurementsQueue');
        var primaryOutcomeMeasurements = [];
        if(measurementsQueue){
            for(var i = 0; i < measurementsQueue.length; i++){
                if(measurementsQueue[i].variableName === qmService.getPrimaryOutcomeVariable().name){
                    primaryOutcomeMeasurements.push(measurementsQueue[i]);
                }
            }
        }
        return primaryOutcomeMeasurements;
    }
    function canWeSyncYet(localStorageItemName, minimumSecondsBetweenSyncs){
        if(localStorage.getItem(localStorageItemName) && window.getUnixTimestampInSeconds() - localStorage.getItem(localStorageItemName) < minimumSecondsBetweenSyncs) {
            var errorMessage = 'Cannot sync because already did within the last ' + minimumSecondsBetweenSyncs + ' seconds';
            qmService.logErrorOrInfoIfTesting(errorMessage);
            return false;
        }
        qmService.setLocalStorageItem(localStorageItemName, window.getUnixTimestampInSeconds());
        return true;
    }
    qmService.getAndStorePrimaryOutcomeMeasurements = function(){
        var deferred = $q.defer();
        var errorMessage;
        if(!weHaveUserOrAccessToken()){
            errorMessage = 'Cannot sync because we do not have a user or access token in url';
            qmService.logError(errorMessage);
            deferred.reject(errorMessage);
            return deferred.promise;
        }
        var params = {variableName : qmService.getPrimaryOutcomeVariable().name, sort : '-startTimeEpoch', limit:900};
        qmService.getMeasurementsFromApi(params, function(primaryOutcomeMeasurementsFromApi){
            if (primaryOutcomeMeasurementsFromApi.length > 0) {
                qmService.setLocalStorageItem('primaryOutcomeVariableMeasurements', JSON.stringify(primaryOutcomeMeasurementsFromApi));
                $rootScope.$broadcast('updateCharts');
            }
            deferred.resolve(primaryOutcomeMeasurementsFromApi);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    function checkIfStartTimeEpochIsWithinTheLastYear(startTimeEpoch) {
        var result = startTimeEpoch > window.getUnixTimestampInSeconds() - 365 * 86400;
        if(!result){
            var errorName = 'startTimeEpoch is earlier than last year';
            var errorMessage = startTimeEpoch + ' ' + errorName;
            Bugsnag.notify(errorName, errorMessage, {startTimeEpoch :startTimeEpoch}, "error");
            qmService.logError(errorMessage);
        }
        return startTimeEpoch;
    }
    qmService.postMeasurementQueueToServer = function(successHandler, errorHandler){
        var defer = $q.defer();
        if(!weHaveUserOrAccessToken()){
            var errorMessage = 'Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user or access token in url';
            qmService.logError(errorMessage);
            defer.reject(errorMessage);
            return defer.promise;
        }
        qmService.getLocalStorageItemAsStringWithCallback('measurementsQueue', function(measurementsQueueString) {
            var parsedMeasurementsQueue = JSON.parse(measurementsQueueString);
            if(!parsedMeasurementsQueue || parsedMeasurementsQueue.length < 1){
                if(successHandler){successHandler();}
                return;
            }
            qmService.postMeasurementsToApi(parsedMeasurementsQueue, function (response) {
                if(response && response.data && response.data.userVariables){
                    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                qmService.setLocalStorageItem('measurementsQueue', JSON.stringify([]));
                if(successHandler){successHandler();}
                defer.resolve();
            }, function (error) {
                qmService.setLocalStorageItem('measurementsQueue', measurementsQueueString);
                if(errorHandler){errorHandler();}
                defer.reject(error);
            });
        });
        return defer.promise;
    };
    qmService.syncPrimaryOutcomeVariableMeasurements = function(minimumSecondsBetweenGets){
        var defer = $q.defer();
        if(!weHaveUserOrAccessToken()){
            qmService.logDebug('Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user');
            defer.resolve();
            return defer.promise;
        }
        if(!minimumSecondsBetweenGets){minimumSecondsBetweenGets = 10;}
        if(!canWeSyncYet("lastMeasurementSyncTime", minimumSecondsBetweenGets)){
            defer.reject('Cannot sync because already did within the last ' + minimumSecondsBetweenGets + ' seconds');
            return defer.promise;
        }
        qmService.postMeasurementQueueToServer(function(){
            qmService.getAndStorePrimaryOutcomeMeasurements().then(function(primaryOutcomeMeasurementsFromApi){
                defer.resolve(primaryOutcomeMeasurementsFromApi);
            }, function(error){defer.reject(error);});
        });
        return defer.promise;
    };
    // date setter from - to
    qmService.setDates = function(to, from){
        var oldFromDate = qmService.getLocalStorageItemAsString('fromDate');
        var oldToDate = qmService.getLocalStorageItemAsString('toDate');
        qmService.setLocalStorageItem('fromDate',parseInt(from));
        qmService.setLocalStorageItem('toDate',parseInt(to));
        // if date range changed, update charts
        if (parseInt(oldFromDate) !== parseInt(from) || parseInt(oldToDate) !== parseInt(to)) {
            qmService.logDebug("setDates broadcasting to update charts");
            $rootScope.$broadcast('updateCharts');
            $rootScope.$broadcast('updatePrimaryOutcomeHistory');
        }
    };
    // retrieve date to end on
    qmService.getToDate = function(callback){
        qmService.getLocalStorageItemAsStringWithCallback('toDate',function(toDate){
            if(toDate){callback(parseInt(toDate));} else {callback(parseInt(Date.now()));}
        });
    };
    // retrieve date to start from
    qmService.getFromDate = function(callback){
        qmService.getLocalStorageItemAsStringWithCallback('fromDate',function(fromDate){
            if(fromDate){callback(parseInt(fromDate));
            } else {
                var date = new Date();
                // Threshold 20 Days if not provided
                date.setDate(date.getDate()-20);
                qmService.logDebug("The date returned is ", date.toString());
                callback(parseInt(date.getTime()));
            }
        });
    };
    qmService.createPrimaryOutcomeMeasurement = function(numericRatingValue) {
        // if val is string (needs conversion)
        if(isNaN(parseFloat(numericRatingValue))){
            numericRatingValue = qmService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[numericRatingValue] ?
                qmService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[numericRatingValue] : false;
        }
        var measurementObject = {
            id: null,
            variable: qmService.getPrimaryOutcomeVariable().name,
            variableName: qmService.getPrimaryOutcomeVariable().name,
            variableCategoryName: qmService.getPrimaryOutcomeVariable().variableCategoryName,
            valence: qmService.getPrimaryOutcomeVariable().valence,
            startTimeEpoch: window.getUnixTimestampInSeconds(),
            unitAbbreviatedName: qmService.getPrimaryOutcomeVariable().unitAbbreviatedName,
            value: numericRatingValue,
            note: null
        };
        measurementObject = addLocationAndSourceDataToMeasurement(measurementObject);
        return measurementObject;
    };
    function getSourceName() {return $rootScope.appSettings.appDisplayName + " for " + $rootScope.currentPlatform;}
    var addLocationAndSourceDataToMeasurement = function(measurementObject){
        addLocationDataToMeasurement(measurementObject);
        if(!measurementObject.sourceName){measurementObject.sourceName = getSourceName();}
        return measurementObject;
    };
    function addLocationDataToMeasurement(measurementObject) {
        if(!measurementObject.latitude){measurementObject.latitude = localStorage.getItem('lastLatitude');}
        if(!measurementObject.longitude){measurementObject.latitude = localStorage.getItem('lastLongitude');}
        if(!measurementObject.location){measurementObject.latitude = localStorage.lastLocationNameAndAddress;}
        return measurementObject;
    }
    // used when adding a new measurement from record measurement OR updating a measurement through the queue
    qmService.addToMeasurementsQueue = function(measurementObject){
        measurementObject = addLocationAndSourceDataToMeasurement(measurementObject);
        qmService.addToLocalStorage('measurementsQueue', measurementObject);
    };
    function removeArrayElementsWithSameId(localStorageItem, elementToAdd) {
        if(elementToAdd.id){
            localStorageItem = localStorageItem.filter(function( obj ) {
                return obj.id !== elementToAdd.id;
            });
        }
        return localStorageItem;
    }
    function removeArrayElementsWithVariableNameAndStartTime(localStorageItem, elementToAdd) {
        if(elementToAdd.startTimeEpoch && elementToAdd.variableName){
            localStorageItem = localStorageItem.filter(function( obj ) {
                return !(obj.startTimeEpoch === elementToAdd.startTimeEpoch && obj.variableName === elementToAdd.variableName);
            });
        }
        return localStorageItem;
    }
    qmService.addToLocalStorage = function(localStorageItemName, elementToAdd){
        qmService.getLocalStorageItemAsStringWithCallback(localStorageItemName, function(localStorageItem) {
            localStorageItem = localStorageItem ? JSON.parse(localStorageItem) : [];
            localStorageItem = removeArrayElementsWithSameId(localStorageItem, elementToAdd);
            localStorageItem = removeArrayElementsWithVariableNameAndStartTime(localStorageItem, elementToAdd);
            localStorageItem.push(elementToAdd);
            qmService.setLocalStorageItem(localStorageItemName, JSON.stringify(localStorageItem));
        });
    };
    // post a single measurement
    function updateMeasurementInQueue(measurementInfo) {
        var found = false;
        qmService.getLocalStorageItemAsObject('measurementsQueue', function (measurementsQueue) {
            var i = 0;
            while (!found && i < measurementsQueue.length) {
                if (measurementsQueue[i].startTimeEpoch === measurementInfo.prevStartTimeEpoch) {
                    found = true;
                    measurementsQueue[i].startTimeEpoch = measurementInfo.startTimeEpoch;
                    measurementsQueue[i].value = measurementInfo.value;
                    measurementsQueue[i].note = measurementInfo.note;
                }
            }
            qmService.setLocalStorageItem('measurementsQueue', JSON.stringify(measurementsQueue));
        });
    }
    function isStartTimeInMilliseconds(measurementInfo){
        var oneWeekInFuture = window.getUnixTimestampInSeconds() + 7 * 86400;
        if(measurementInfo.startTimeEpoch > oneWeekInFuture){
            measurementInfo.startTimeEpoch = measurementInfo.startTimeEpoch / 1000;
            console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
            return true;
        }
        return false;
    }
    qmService.postMeasurementDeferred = function(measurementInfo){
        isStartTimeInMilliseconds(measurementInfo);
        measurementInfo = addLocationAndSourceDataToMeasurement(measurementInfo);
        if (measurementInfo.prevStartTimeEpoch) { // Primary outcome variable - update through measurementsQueue
            updateMeasurementInQueue(measurementInfo);
        } else if(measurementInfo.id) {
            qmService.deleteElementOfLocalStorageItemById('primaryOutcomeVariableMeasurements', measurementInfo.id);
            qmService.addToMeasurementsQueue(measurementInfo);
        } else {
            qmService.addToMeasurementsQueue(measurementInfo);
        }
        if(measurementInfo.variableName === qmService.getPrimaryOutcomeVariable().name){qmService.syncPrimaryOutcomeVariableMeasurements();} else {qmService.postMeasurementQueueToServer();}
    };
    qmService.postMeasurementByReminder = function(trackingReminder, modifiedValue) {
        var value = trackingReminder.defaultValue;
        if(typeof modifiedValue !== "undefined" && modifiedValue !== null){value = modifiedValue;}
        var measurementSet = [
            {
                variableName: trackingReminder.variableName,
                sourceName: getSourceName(),
                variableCategoryName: trackingReminder.variableCategoryName,
                unitAbbreviatedName: trackingReminder.unitAbbreviatedName,
                measurements : [
                    {
                        startTimeEpoch:  window.getUnixTimestampInSeconds(),
                        value: value,
                        note : null
                    }
                ]
            }
        ];
        measurementSet[0].measurements[0] = addLocationDataToMeasurement(measurementSet[0].measurements[0]);
        var deferred = $q.defer();
        if(!qmService.valueIsValid(trackingReminder, value)){
            deferred.reject('Value is not valid');
            return deferred.promise;
        }
        qmService.postMeasurementsToApi(measurementSet, function(response){
            if(response.success) {
                qmService.logDebug("qmService.postMeasurementsToApi success: " + JSON.stringify(response));
                if(response && response.data && response.data.userVariables){
                    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                deferred.resolve();
            } else {deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");}
        });
        return deferred.promise;
    };
    qmService.deleteMeasurementFromServer = function(measurement){
        var deferred = $q.defer();
        qmService.deleteElementOfLocalStorageItemById('primaryOutcomeVariableMeasurements', measurement.id);
        qmService.deleteElementsOfLocalStorageItemByProperty('measurementsQueue', 'startTimeEpoch', measurement.startTimeEpoch);
        qmService.deleteV1Measurements(measurement, function(response){
            deferred.resolve(response);
            qmService.logDebug("deleteMeasurementFromServer success " + JSON.stringify(response));
        }, function(response){
            qmService.logDebug("deleteMeasurementFromServer error " + JSON.stringify(response));
            deferred.reject();
        });
        return deferred.promise;
    };
    qmService.postBloodPressureMeasurements = function(parameters){
        var deferred = $q.defer();
        /** @namespace parameters.startTimeEpochSeconds */
        if(!parameters.startTimeEpochSeconds){parameters.startTimeEpochSeconds = window.getUnixTimestampInSeconds();}
        var measurementSets = [
            {
                variableId: 1874,
                sourceName: getSourceName(),
                startTimeEpoch:  checkIfStartTimeEpochIsWithinTheLastYear(parameters.startTimeEpochSeconds),
                value: parameters.systolicValue,
                note: parameters.note
            },
            {
                variableId: 5554981,
                sourceName: getSourceName(),
                startTimeEpoch:  checkIfStartTimeEpochIsWithinTheLastYear(parameters.startTimeEpochSeconds),
                value: parameters.diastolicValue,
                note: parameters.note
            }
        ];
        measurementSets[0] = addLocationDataToMeasurement(measurementSets[0]);
        measurementSets[0] = addLocationDataToMeasurement(measurementSets[0]);
        qmService.postMeasurementsToApi(measurementSets, function(response){
            if(response.success) {
                if(response && response.data && response.data.userVariables){
                    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                qmService.logDebug("qmService.postMeasurementsToApi success: " + JSON.stringify(response));
                deferred.resolve(response);
            } else {deferred.reject(response);}
        });
        return deferred.promise;
    };
    function addUnitsToRootScope(units) {
        $rootScope.unitObjects = units;
        var unitAbbreviatedNames = [];
        var unitsIndexedByAbbreviatedName = [];
        var nonAdvancedUnitsIndexedByAbbreviatedName = [];
        var nonAdvancedUnitObjects = [];
        var manualTrackingUnitsIndexedByAbbreviatedName = [];
        var manualTrackingUnitObjects = [];
        for (var i = 0; i < units.length; i++) {
            unitAbbreviatedNames[i] = units[i].abbreviatedName;
            unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
            if(!units[i].advanced){
                nonAdvancedUnitObjects.push(units[i]);
                nonAdvancedUnitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
            }
            if(units[i].manualTracking){
                manualTrackingUnitObjects.push(units[i]);
                manualTrackingUnitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
            }
        }
        var showMoreUnitsObject = {name: "Show more units", abbreviatedName: "Show more units"};
        nonAdvancedUnitObjects.push(showMoreUnitsObject);
        nonAdvancedUnitsIndexedByAbbreviatedName[showMoreUnitsObject.abbreviatedName] = showMoreUnitsObject;
        $rootScope.unitsIndexedByAbbreviatedName = unitsIndexedByAbbreviatedName;
        $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName = nonAdvancedUnitsIndexedByAbbreviatedName;
        $rootScope.nonAdvancedUnitObjects = nonAdvancedUnitObjects;
        $rootScope.manualTrackingUnitsIndexedByAbbreviatedName = manualTrackingUnitsIndexedByAbbreviatedName;
        $rootScope.manualTrackingUnitObjects = manualTrackingUnitObjects;
    }
    qmService.getUnits = function(){
        var deferred = $q.defer();
        $http.get('data/units.json').success(function(units) {
            addUnitsToRootScope(units);
            deferred.resolve(units);
        });
        return deferred.promise;
    };
    qmService.getUnits();
    qmService.variableCategories = [];
    $rootScope.variableCategories = [];
    $rootScope.variableCategoryNames = []; // Dirty hack for variableCategoryNames because $rootScope.variableCategories is not an array we can ng-repeat through in selectors
    $rootScope.variableCategories.Anything = qmService.variableCategories.Anything = {
        defaultUnitAbbreviatedName: '',
        helpText: "What do you want to record?",
        variableCategoryNameSingular: "Anything",
        defaultValuePlaceholderText : "Enter most common value here...",
        defaultValueLabel : 'Value',
        addNewVariableCardText : 'Add a new variable',
        variableCategoryName : '',
        defaultValue : '',
        measurementSynonymSingularLowercase : "measurement",
        ionIcon: "ion-speedometer"};
    qmService.getVariableCategories = function(){
        var deferred = $q.defer();
        $http.get('data/variableCategories.json').success(function(variableCategories) {
            angular.forEach(variableCategories, function(variableCategory, key) {
                $rootScope.variableCategories[variableCategory.name] = variableCategory;
                $rootScope.variableCategoryNames.push(variableCategory.name);
                qmService.variableCategories[variableCategory.name] = variableCategory;
            });
            setupExplanations();
            deferred.resolve(variableCategories);
        });
        return deferred.promise;
    };
    qmService.getVariableCategories();
    qmService.getVariableCategoryIcon = function(variableCategoryName){
        var variableCategoryInfo = qmService.getVariableCategoryInfo(variableCategoryName);
        if(variableCategoryInfo.ionIcon){
            return variableCategoryInfo.ionIcon;
        } else {
            console.warn('Could not find icon for variableCategoryName ' + variableCategoryName);
            return 'ion-speedometer';
        }
    };
    function getEnv(){
        var env = "production";
        if(window.location.origin.indexOf('local') !== -1){env = "development";}
        if(window.location.origin.indexOf('staging') !== -1){env = "staging";}
        if(window.location.origin.indexOf('ionic.quantimo.do') !== -1){env = "staging";}
        if($rootScope.user){
            if($rootScope.user.email && $rootScope.user.email.toLowerCase().indexOf('test') !== -1){env = "testing";}
            if($rootScope.user.displayName && $rootScope.user.displayName.toLowerCase().indexOf('test') !== -1){env = "testing";}
        }
        if(window.location.href.indexOf("heroku") !== -1){env = "testing";}
        return env;
    }
    function envIsDevelopment() {return getEnv() === 'development';}
    function envIsTesting() {return getEnv() === 'testing';}
    qmService.getEnv = function(){return getEnv();};
    qmService.getClientId = function(){
        if(typeof config !== "undefined" && $rootScope.appSettings.clientId){
            if(getUrlParameter('clientIdDebug')){qmService.logDebug("$rootScope.appSettings.clientId is " + $rootScope.appSettings.clientId);}
            return $rootScope.appSettings.clientId;
        } else {
            qmService.logDebug("$rootScope.appSettings.clientId is not present");
        }
        if(!window.private_keys){return appsManager.getQuantiModoClientId();}
        if (window.chrome && chrome.runtime && chrome.runtime.id) {return window.private_keys.client_ids.Chrome;}
        if ($rootScope.isIOS) { return window.private_keys.client_ids.iOS;}
        if ($rootScope.isAndroid) { return window.private_keys.client_ids.Android;}
        if ($rootScope.isChromeExtension) { return window.private_keys.client_ids.Chrome;}
        if ($rootScope.isWindows) { return window.private_keys.client_ids.Windows;}
        return window.private_keys.client_ids.Web;
    };
    qmService.setPlatformVariables = function () {
        //qmService.logDebug("ionic.Platform.platform() is " + ionic.Platform.platform());
        $rootScope.isWeb = window.location.href.indexOf('https://') !== -1;
        $rootScope.isWebView = ionic.Platform.isWebView();
        $rootScope.isIPad = ionic.Platform.isIPad() && !$rootScope.isWeb;
        $rootScope.isIOS = ionic.Platform.isIOS() && !$rootScope.isWeb;
        $rootScope.isAndroid = ionic.Platform.isAndroid() && !$rootScope.isWeb;
        $rootScope.isWindowsPhone = ionic.Platform.isWindowsPhone() && !$rootScope.isWeb;
        $rootScope.isChrome = window.chrome ? true : false;
        $rootScope.currentPlatform = ionic.Platform.platform();
        $rootScope.currentPlatformVersion = ionic.Platform.version();
        $rootScope.isMobile = ($rootScope.isAndroid || $rootScope.isIOS) && !$rootScope.isWeb;
        $rootScope.isWindows = window.location.href.indexOf('ms-appx') > -1;
        $rootScope.isChromeExtension = window.location.href.indexOf('chrome-extension') !== -1;
        $rootScope.localNotificationsEnabled = $rootScope.isChromeExtension;
    };
    qmService.getPermissionString = function(){
        var str = "";
        var permissions = ['readmeasurements', 'writemeasurements'];
        for(var i=0; i < permissions.length; i++) {str += permissions[i] + "%20";}
        return str.replace(/%20([^%20]*)$/,'$1');
    };
    qmService.getClientSecret = function(){
        if(!window.private_keys){return;}
        if (window.chrome && chrome.runtime && chrome.runtime.id) {return window.private_keys.client_secrets.Chrome;}
        if ($rootScope.isIOS) { return window.private_keys.client_secrets.iOS; }
        if ($rootScope.isAndroid) { return window.private_keys.client_secrets.Android; }
        if ($rootScope.isChromeExtension) { return window.private_keys.client_secrets.Chrome; }
        if ($rootScope.isWindows) { return window.private_keys.client_secrets.Windows; }
        return window.private_keys.client_secrets.Web;
    };
    qmService.getRedirectUri = function () {
        if(config.appSettings.redirectUri){return config.appSettings.redirectUri;}
        return qmService.getApiUrl() +  '/ionic/Modo/www/callback/';
    };
    qmService.getProtocol = function () {
        if (typeof ionic !== "undefined") {
            var currentPlatform = ionic.Platform.platform();
            if(currentPlatform.indexOf('win') > -1){return 'ms-appx-web';}
        }
        return 'https';
    };
    qmService.getApiUrl = function () {
        //if($rootScope.appSettings.clientId !== "ionic"){return "https://" + $rootScope.appSettings.clientId + ".quantimo.do";}
        if(config.appSettings.apiUrl){
            if(config.appSettings.apiUrl.indexOf('https://') === -1){config.appSettings.apiUrl = "https://" + config.appSettings.apiUrl;}
            return config.appSettings.apiUrl;
        }
        return appsManager.getQuantiModoApiUrl();
    };
    qmService.getQuantiModoUrl = function (path) {
        if(typeof path === "undefined") {path = "";}
        return qmService.getApiUrl() + "/" + path;
    };
    qmService.convertToObjectIfJsonString = function (stringOrObject) {
        try {stringOrObject = JSON.parse(stringOrObject);} catch (e) {return stringOrObject;}
        return stringOrObject;
    };
    // returns bool
    // if a string starts with substring
    qmService.startsWith = function (fullString, search) {
        if(!fullString){
            qmService.logError('fullString not provided to qmService.startsWith');
            return false;
        }
        return fullString.slice(0, search.length) === search;
    };
    // returns bool | string
    // if search param is found: returns its value
    // returns false if not found
    function getUrlParameter(parameterName, url, shouldDecode) {
        if(!url){url = window.location.href;}
        if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
        if(url.split('?').length > 1){
            var queryString = url.split('?')[1];
            var parameterKeyValuePairs = queryString.split('&');
            for (var i = 0; i < parameterKeyValuePairs.length; i++) {
                var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
                if (currentParameterKeyValuePair[0].toCamel().toLowerCase() === parameterName.toCamel().toLowerCase()) {
                    if(typeof shouldDecode !== "undefined")  {
                        return decodeURIComponent(currentParameterKeyValuePair[1]);
                    } else {
                        return currentParameterKeyValuePair[1];
                    }
                }
            }
        }
        return null;
    }
    qmService.getUrlParameter = function (parameterName, url, shouldDecode) {
        return getUrlParameter(parameterName, url, shouldDecode);
    };
    function getAllQueryParamsFromUrlString(url){
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
    qmService.getConnectorsDeferred = function(){
        var deferred = $q.defer();
        qmService.getLocalStorageItemAsStringWithCallback('connectors', function(connectors){
            if(connectors){
                connectors = JSON.parse(connectors);
                connectors = hideBrokenConnectors(connectors);
                deferred.resolve(connectors);
            } else {qmService.refreshConnectors().then(function(){deferred.resolve(connectors);});}
        });
        return deferred.promise;
    };
    qmService.refreshConnectors = function(){
        var stackTrace = getStackTrace();
        if(qmService.getDebugMode()){qmService.logDebug("Called refresh connectors: " + stackTrace);}
        var deferred = $q.defer();
        qmService.getConnectorsFromApi({stackTrace: getStackTrace()}, function(response){
            qmService.setLocalStorageItem('connectors', JSON.stringify(response.connectors));
            var connectors = hideBrokenConnectors(response.connectors);
            deferred.resolve(connectors);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.disconnectConnectorDeferred = function(name){
        var deferred = $q.defer();
        qmService.disconnectConnectorToApi(name, function(){deferred.resolve();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.connectConnectorWithParamsDeferred = function(params, lowercaseConnectorName){
        var deferred = $q.defer();
        if(lowercaseConnectorName.indexOf('weather')> -1 && !params.location){
            $http.get('https://freegeoip.net/json/').success(function(data) {
                console.log(JSON.stringify(data, null, 2));
                qmService.connectConnectorWithParamsToApi({location: data.ip}, lowercaseConnectorName, function(){qmService.refreshConnectors();}, function(error){deferred.reject(error);});
            });
        } else {
            qmService.connectConnectorWithParamsToApi(params, lowercaseConnectorName, function(){qmService.refreshConnectors();}, function(error){deferred.reject(error);});
        }
        return deferred.promise;
    };
    qmService.connectConnectorWithTokenDeferred = function(body){
        var deferred = $q.defer();
        qmService.connectConnectorWithTokenToApi(body, function(){qmService.refreshConnectors();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.connectConnectorWithAuthCodeDeferred = function(code, lowercaseConnectorName){
        var deferred = $q.defer();
        qmService.connectWithAuthCodeToApi(code, lowercaseConnectorName, function(){qmService.refreshConnectors();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    function hideBrokenConnectors(connectors){
        for(var i = 0; i < connectors.length; i++){
            //if(connectors[i].name === 'facebook' && $rootScope.isAndroid) {connectors[i].hide = true;}
        }
        return connectors;
    }
    // Name: The error message associated with the error. Usually this will
    // contain some information about this specific instance of the
    // error and is not used to group the errors (optional, default
    // none). (searchable)
    // Message: The error message associated with the error. Usually this will
    // contain some information about this specific instance of the
    // error and is not used to group the errors (optional, default
    // none). (searchable)
    qmService.bugsnagNotify = function(name, message, metaData, severity){
        if(!metaData){ metaData = {}; }
        metaData.groupingHash = name;
        if(!metaData.stackTrace){ metaData.stackTrace = new Error().stack; }
        var deferred = $q.defer();
        if(!severity){ severity = "error"; }
        if(!message){ message = name; }
        qmService.logError('NAME: ' + name + '. MESSAGE: ' + message + '. METADATA: ' + JSON.stringify(metaData));
        qmService.setupBugsnag().then(function () {
            Bugsnag.notify(name, message, metaData, severity);
            deferred.resolve();
        }, function (error) {
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.reportErrorDeferred = function(exceptionOrError){
        var deferred = $q.defer();
        var stringifiedExceptionOrError = 'No error or exception data provided to qmService';
        var stacktrace = 'No stacktrace provided to qmService';
        if(exceptionOrError){
            stringifiedExceptionOrError = JSON.stringify(exceptionOrError);
            if(typeof exceptionOrError.stack !== 'undefined'){stacktrace = exceptionOrError.stack.toLocaleString();} else {stacktrace = stringifiedExceptionOrError;}
        }
        qmService.logError('ERROR: ' + stringifiedExceptionOrError);
        qmService.setupBugsnag().then(function () {
            Bugsnag.notify(stringifiedExceptionOrError, stacktrace, {groupingHash: stringifiedExceptionOrError}, "error");
            deferred.resolve();
        }, function (error) {
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.reportException = function(exception, name, metaData){
        qmService.logError('ERROR: ' + exception.message);
        qmService.setupBugsnag().then(function () {
            Bugsnag.notifyException(exception, name, metaData);
        }, function (error) {qmService.logError(error);});
    };
    qmService.setupBugsnag = function(){
        var deferred = $q.defer();
        if (typeof Bugsnag !== "undefined") {
            //Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
            //Bugsnag.notifyReleaseStages = ['Production','Staging'];
            Bugsnag.releaseStage = qmService.getEnv();
            Bugsnag.metaData = {platform: ionic.Platform.platform(), platformVersion: ionic.Platform.version()};
            if(typeof config !== "undefined"){
                Bugsnag.appVersion = config.appSettings.versionNumber;
                Bugsnag.metaData.appDisplayName = config.appSettings.appDisplayName;
            }
            if($rootScope.user){Bugsnag.metaData.user = {name: $rootScope.user.displayName, email: $rootScope.user.email};}
            deferred.resolve();
        } else {deferred.reject('Bugsnag is not defined');}
        return deferred.promise;
    };
    var geoLocationDebug = false;
    qmService.getLocationInfoFromFoursquareOrGoogleMaps = function (latitude, longitude) {
        if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('getLocationInfoFromFoursquareOrGoogleMaps with longitude ' + longitude + ' and latitude,' + latitude);}
        var deferred = $q.defer();
        qmService.getLocationInfoFromFoursquare($http).whatsAt(latitude, longitude).then(function (geoLookupResult) {
            if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('getLocationInfoFromFoursquare result: ' + JSON.stringify(geoLookupResult));}
            if (geoLookupResult.status === 200 && geoLookupResult.data.response.venues.length >= 1) {
                var bestMatch = geoLookupResult.data.response.venues[0];
                //convert the result to something the caller can use consistently
                geoLookupResult = {type: "foursquare", name: bestMatch.name, address: bestMatch.location.formattedAddress.join(", ")};
                //console.dir(bestMatch);
                deferred.resolve(geoLookupResult);
            } else {
                //ok, time to try google
                qmService.getLocationInfoFromGoogleMaps($http).lookup(latitude, longitude).then(function (googleResponse) {
                    //qmService.logDebug('back from google with ');
                    if (googleResponse.data && googleResponse.data.results && googleResponse.data.results.length >= 1) {
                        //qmService.logDebug('did i come in here?');
                        var bestMatch = googleResponse.data.results[0];
                        //qmService.logDebug(JSON.stringify(bestMatch));
                        var geoLookupResult = {type: "geocode", address: bestMatch.formatted_address};
                        deferred.resolve(geoLookupResult);
                    }
                });
            }
        }, function(error) {
            qmService.reportErrorDeferred('getLocationInfoFromFoursquareOrGoogleMaps error: ' + JSON.stringify(error));
        });
        return deferred.promise;
    };
    qmService.getLocationInfoFromGoogleMaps = function ($http) {
        var GOOGLE_MAPS_API_KEY = window.private_keys.GOOGLE_MAPS_API_KEY;
        if (!GOOGLE_MAPS_API_KEY) {qmService.logError('Please add GOOGLE_MAPS_API_KEY to private config');}
        function lookup(latitude, longitude) {
            return $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + GOOGLE_MAPS_API_KEY);
        }
        return {lookup: lookup};
    };
    qmService.getLocationInfoFromFoursquare = function ($http) {
        var FOURSQUARE_CLIENT_ID = window.private_keys.FOURSQUARE_CLIENT_ID;
        var FOURSQUARE_CLIENT_SECRET = window.private_keys.FOURSQUARE_CLIENT_SECRET;
        if (!FOURSQUARE_CLIENT_ID) {qmService.logError('Please add FOURSQUARE_CLIENT_ID & FOURSQUARE_CLIENT_SECRET to private config');}
        function whatsAt(latitude, longitude) {
            return $http.get('https://api.foursquare.com/v2/venues/search?ll=' + latitude + ',' + longitude +
                '&intent=browse&radius=30&client_id=' + FOURSQUARE_CLIENT_ID + '&client_secret=' + FOURSQUARE_CLIENT_SECRET + '&v=20151201');
        }
        return {whatsAt: whatsAt};
    };
    function getLocationNameFromResult(getLookupResult){
        if (getLookupResult.name && getLookupResult.name !== "undefined") {return getLookupResult.name;}
        if (getLookupResult.address && getLookupResult.address !== "undefined") {return getLookupResult.address;}
        qmService.reportErrorDeferred("No name or address property found in this coordinates result: " + JSON.stringify(getLookupResult));
    }
    qmService.updateLocationInLocalStorage = function (geoLookupResult) {
        if(getLocationNameFromResult(geoLookupResult)) {localStorage.lastLocationName = getLocationNameFromResult(geoLookupResult);}
        if(geoLookupResult.type){localStorage.lastLocationResultType = geoLookupResult.type;} else {qmService.bugsnagNotify('Geolocation error', "No geolocation lookup type", geoLookupResult);}
        if(geoLookupResult.latitude){localStorage.lastLatitude = geoLookupResult.latitude;} else {qmService.bugsnagNotify('Geolocation error', "No latitude!", geoLookupResult);}
        if(geoLookupResult.longitude){localStorage.lastLongitude = geoLookupResult.longitude;} else {qmService.bugsnagNotify('Geolocation error', "No longitude!", geoLookupResult);}
        localStorage.lastLocationUpdateTimeEpochSeconds = window.getUnixTimestampInSeconds();
        if(geoLookupResult.address) {
            localStorage.lastLocationAddress = geoLookupResult.address;
            if(geoLookupResult.address === localStorage.lastLocationName){localStorage.lastLocationNameAndAddress = localStorage.lastLocationAddress;
            } else{localStorage.lastLocationNameAndAddress = localStorage.lastLocationName + " (" + localStorage.lastLocationAddress + ")";}
        } else {qmService.bugsnagNotify('Geolocation error', "No address found!", geoLookupResult);}
    };
    function getLastLocationNameFromLocalStorage(){
        var lastLocationName = localStorage.getItem('lastLocationName');
        if (lastLocationName && lastLocationName !== "undefined") {return lastLocationName;}
    }
    function getHoursAtLocation(){
        var secondsAtLocation = window.getUnixTimestampInSeconds() - localStorage.lastLocationUpdateTimeEpochSeconds;
        return Math.round(secondsAtLocation/3600 * 100) / 100;
    }
    function getGeoLocationSourceName(isBackground) {
        var sourceName = localStorage.lastLocationResultType + ' on ' + getSourceName();
        if(isBackground){sourceName = sourceName + " (Background Geolocation)";}
        return sourceName;
    }
    function weShouldPostLocation() {return $rootScope.isMobile && getLastLocationNameFromLocalStorage() && getHoursAtLocation();}
    qmService.postLocationMeasurementAndSetLocationVariables = function (geoLookupResult, isBackground) {
        if (weShouldPostLocation()) {
            var newMeasurement = {
                variableName:  getLastLocationNameFromLocalStorage(),
                unitAbbreviatedName: 'h',
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(localStorage.lastLocationUpdateTimeEpochSeconds),
                sourceName: getGeoLocationSourceName(isBackground),
                value: getHoursAtLocation(),
                variableCategoryName: 'Location',
                location: localStorage.lastLocationAddress,
                combinationOperation: "SUM"
            };
            qmService.postMeasurementDeferred(newMeasurement);
        } else {
            if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('Not posting location getLastLocationNameFromLocalStorage returns ' + getLastLocationNameFromLocalStorage());}
        }
        qmService.updateLocationInLocalStorage(geoLookupResult);
    };
    function hasLocationNameChanged(geoLookupResult) {
        return getLastLocationNameFromLocalStorage() !== getLocationNameFromResult(geoLookupResult);
    }
    function coordinatesChanged(coordinates){
        return localStorage.getItem('lastLatitude') !== coordinates.latitude && localStorage.getItem('lastLongitude') !== coordinates.longitude;
    }
    function lookupGoogleAndFoursquareLocationAndPostMeasurement(coordinates, isBackground) {
        if(!coordinatesChanged(coordinates)){return;}
        qmService.getLocationInfoFromFoursquareOrGoogleMaps(coordinates.latitude, coordinates.longitude).then(function (geoLookupResult) {
            if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('getLocationInfoFromFoursquareOrGoogleMaps was '+ JSON.stringify(geoLookupResult));}
            if (geoLookupResult.type === 'foursquare') {
                if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('Foursquare location name is ' + geoLookupResult.name + ' located at ' + geoLookupResult.address);}
            } else if (geoLookupResult.type === 'geocode') {
                if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('geocode address is ' + geoLookupResult.address);}
            } else {
                var map = 'https://maps.googleapis.com/maps/api/staticmap?center=' + coordinates.latitude + ',' + coordinates.longitude +
                    'zoom=13&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:X%7C' + coordinates.latitude + ',' + coordinates.longitude;
                qmService.logDebug('Sorry, I\'ve got nothing. But here is a map!');
            }
            geoLookupResult.latitude = coordinates.latitude;
            geoLookupResult.longitude = coordinates.longitude;
            if(hasLocationNameChanged(geoLookupResult)){
                qmService.postLocationMeasurementAndSetLocationVariables(geoLookupResult, isBackground);
            } else {
                if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){qmService.reportErrorDeferred('Location name has not changed!');}
            }
        });
    }
    qmService.updateLocationVariablesAndPostMeasurementIfChanged = function () {
        var deferred = $q.defer();
        var message;
        if(!$rootScope.user){
            message = 'Not logging location because we do not have a user';
            qmService.logDebug(message);
            deferred.reject(message);
            return deferred.promise;
        }
        if(!$rootScope.user.trackLocation){
            message = 'Location tracking disabled for this user';
            qmService.logDebug(message);
            deferred.reject(message);
            return deferred.promise;
        }
        var currentTimestamp = window.getUnixTimestampInSeconds();
        var lastLocationPostUnixtime = parseInt(localStorage.getItem('lastLocationPostUnixtime'));
        var secondsSinceLastPostedLocation = currentTimestamp - lastLocationPostUnixtime;
        if(lastLocationPostUnixtime && secondsSinceLastPostedLocation < 300){
            message = 'Already posted location ' + secondsSinceLastPostedLocation + " seconds ago";
            qmService.logDebug(message);
            deferred.reject(message);
            return deferred.promise;
        }
        $ionicPlatform.ready(function() {
            localStorage.setItem('lastLocationPostUnixtime', currentTimestamp);
            var posOptions = {enableHighAccuracy: true, timeout: 20000, maximumAge: 0};
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                qmService.forecastIoWeather(position.coords);
                lookupGoogleAndFoursquareLocationAndPostMeasurement(position.coords);
                deferred.resolve();
                //qmService.logDebug("My coordinates are: ", position.coords);
            }, function(error) {
                deferred.reject(error);
                qmService.logError(error);
            });
        });
        return deferred.promise;
    };
    qmService.backgroundGeolocationStart = function () {
        if(typeof backgroundGeoLocation === "undefined"){
            //console.warn('Cannot execute backgroundGeolocationStart because backgroundGeoLocation is not defined');
            return;
        }
        qmService.setLocalStorageItem('bgGPS', 1);
        //qmService.logDebug('Starting qmService.backgroundGeolocationStart');
        var callbackFn = function(coordinates) {
            qmService.logDebug("background location is " + JSON.stringify(coordinates));
            var isBackground = true;
            qmService.forecastIoWeather(coordinates);
            lookupGoogleAndFoursquareLocationAndPostMeasurement(coordinates, isBackground);
            backgroundGeoLocation.finish();
        };
        var failureFn = function(error) {
            var errorMessage = 'BackgroundGeoLocation error ' + JSON.stringify(error);
            qmService.logError(errorMessage);
            qmService.reportErrorDeferred(errorMessage);
        };
        backgroundGeoLocation.configure(callbackFn, failureFn, {
            desiredAccuracy: 1000, //Desired accuracy in meters. Possible values [0, 10, 100, 1000]. The lower the number, the more power devoted to GeoLocation resulting in higher accuracy readings. 1000 results in lowest power drain and least accurate readings.
            stationaryRadius: 20,
            distanceFilter: 30,
            locationService: 'ANDROID_DISTANCE_FILTER',  // TODO: Decide on setting https://github.com/mauron85/cordova-plugin-background-geolocation/blob/master/PROVIDERS.md
            debug: false,  // Created notifications with location info
            stopOnTerminate: false,
            notificationTitle: 'Recording Location',
            notificationText: 'Tap to open inbox',
            notificationIconLarge: null,
            notificationIconSmall: 'ic_stat_icon_bw',
            interval: 100 * 60 * 1000,  // These might not work with locationService: 'ANDROID_DISTANCE_FILTER',
            fastestInterval: 500000,  // These might not work with locationService: 'ANDROID_DISTANCE_FILTER',
            activitiesInterval: 15 * 60 * 1000  // These might not work with locationService: 'ANDROID_DISTANCE_FILTER',
        });
        backgroundGeoLocation.start();
    };
    qmService.backgroundGeolocationInit = function () {
        var deferred = $q.defer();
        //qmService.logDebug('Starting qmService.backgroundGeolocationInit');
        if ($rootScope.user && $rootScope.user.trackLocation) {
            $ionicPlatform.ready(function() { qmService.backgroundGeolocationStart(); });
            deferred.resolve();
        } else {
            var error = 'qmService.backgroundGeolocationInit failed because $rootScope.user.trackLocation is not true';
            //qmService.logDebug(error);
            deferred.reject(error);
        }
        return deferred.promise;
    };
    qmService.backgroundGeolocationStop = function () {
        if(typeof backgroundGeoLocation !== "undefined"){
            qmService.setLocalStorageItem('bgGPS', 0);
            backgroundGeoLocation.stop();
        }
    };
    var putTrackingReminderNotificationsInLocalStorageAndUpdateInbox = function (trackingReminderNotifications) {
        qmService.setLocalStorageItem('lastGotNotificationsAtMilliseconds', window.getUnixTimestampInMilliseconds());
        trackingReminderNotifications = qmService.attachVariableCategoryIcons(trackingReminderNotifications);
        qmService.setLocalStorageItem('trackingReminderNotifications',
            JSON.stringify(trackingReminderNotifications)).then(function () {
            $rootScope.$broadcast('getTrackingReminderNotificationsFromLocalStorage');
            //qmService.logDebug('Just put ' + trackingReminderNotifications.length + ' trackingReminderNotifications in local storage');
        });
        $rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
        return trackingReminderNotifications;
    };
    qmService.getSecondsSinceWeLastGotNotifications = function () {
        var lastGotNotificationsAtMilliseconds = localStorage.getItem('lastGotNotificationsAtMilliseconds');
        if(!lastGotNotificationsAtMilliseconds){ lastGotNotificationsAtMilliseconds = 0; }
        return parseInt((window.getUnixTimestampInMilliseconds() - lastGotNotificationsAtMilliseconds)/1000);
    };
    qmService.postTrackingReminderNotificationsDeferred = function(successHandler, errorHandler){
        var deferred = $q.defer();
        var trackingReminderNotificationsArray = qmService.getLocalStorageItemAsObject('notificationsSyncQueue');
        qmService.logInfo("postTrackingReminderNotificationsDeferred trackingReminderNotificationsArray: " + JSON.stringify(trackingReminderNotificationsArray));
        qmService.deleteItemFromLocalStorage('notificationsSyncQueue');
        if(!trackingReminderNotificationsArray || !trackingReminderNotificationsArray.length){
            if(successHandler){successHandler();}
            deferred.resolve();
            return deferred.promise;
        }
        qmService.postTrackingReminderNotificationsToApi(trackingReminderNotificationsArray, function(response){
            if(successHandler){successHandler(response);}
            deferred.resolve(response);
        }, function(error){
            var newNotificationsSyncQueue = qmService.getLocalStorageItemAsObject('notificationsSyncQueue');
            if(newNotificationsSyncQueue){
                trackingReminderNotificationsArray = trackingReminderNotificationsArray.concat(newNotificationsSyncQueue);
            }
            qmService.setLocalStorageItem('notificationsSyncQueue', JSON.stringify(trackingReminderNotificationsArray));
            if(errorHandler){errorHandler();}
            deferred.reject(error);
        });
        return deferred.promise;
    };
    var scheduleNotificationSync = function (delayBeforePostingNotificationsInMilliseconds) {
        if(!delayBeforePostingNotificationsInMilliseconds){
            delayBeforePostingNotificationsInMilliseconds = 3 * 60 * 1000;
        }
        var trackingReminderNotificationSyncScheduled = localStorage.getItem('trackingReminderNotificationSyncScheduled');
        if(!trackingReminderNotificationSyncScheduled ||
            parseInt(trackingReminderNotificationSyncScheduled) < window.getUnixTimestampInMilliseconds() - delayBeforePostingNotificationsInMilliseconds){
            qmService.setLocalStorageItem('trackingReminderNotificationSyncScheduled', window.getUnixTimestampInMilliseconds());
            $timeout(function() {
                localStorage.removeItem('trackingReminderNotificationSyncScheduled');
                // Post notification queue in 5 minutes if it's still there
                qmService.postTrackingReminderNotificationsDeferred();
            }, delayBeforePostingNotificationsInMilliseconds);
        }
    };
    qmService.skipTrackingReminderNotificationDeferred = function(trackingReminderNotification){
        var deferred = $q.defer();
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        qmService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', trackingReminderNotification.id);
        trackingReminderNotification.action = 'skip';
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('notificationsSyncQueue', trackingReminderNotification);
        scheduleNotificationSync();
        return deferred.promise;
    };
    qmService.skipAllTrackingReminderNotificationsDeferred = function(params){
        var deferred = $q.defer();
        qmService.deleteItemFromLocalStorage('trackingReminderNotifications');
        qmService.skipAllTrackingReminderNotifications(params, function(response){
            if(response.success) {deferred.resolve();} else {deferred.reject();}
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.trackTrackingReminderNotificationDeferred = function(trackingReminderNotification, trackAll){
        var deferred = $q.defer();
        qmService.logDebug('qmService.trackTrackingReminderNotificationDeferred: Going to track ' + JSON.stringify(trackingReminderNotification));
        if(!trackingReminderNotification.variableName && trackingReminderNotification.trackingReminderNotificationId){
            var notificationFromLocalStorage = qmService.getElementOfLocalStorageItemById('trackingReminderNotifications',
                trackingReminderNotification.trackingReminderNotificationId);
            if(notificationFromLocalStorage){
                if(typeof trackingReminderNotification.modifiedValue !== "undefined" && trackingReminderNotification.modifiedValue !== null){
                    notificationFromLocalStorage.modifiedValue = trackingReminderNotification.modifiedValue;
                }
                trackingReminderNotification = notificationFromLocalStorage;
            }
        }
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        qmService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', trackingReminderNotification.id);
        trackingReminderNotification.action = 'track';
        if(trackAll){trackingReminderNotification.action = 'trackAll';}
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('notificationsSyncQueue', trackingReminderNotification);
        if(trackAll){scheduleNotificationSync(1);} else {scheduleNotificationSync();}
        return deferred.promise;
    };
    qmService.snoozeTrackingReminderNotificationDeferred = function(body){
        var deferred = $q.defer();
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        qmService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', body.id);
        body.action = 'snooze';
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('notificationsSyncQueue', body);
        scheduleNotificationSync();
        return deferred.promise;
    };
    qmService.getTrackingRemindersDeferred = function(variableCategoryName) {
        var deferred = $q.defer();
        qmService.getTrackingRemindersFromLocalStorage(variableCategoryName).then(function (trackingReminders) {
            if (trackingReminders && trackingReminders.length) {deferred.resolve(trackingReminders);
            } else {qmService.syncTrackingReminders().then(function (trackingReminders) {deferred.resolve(trackingReminders);});}
        });
        return deferred.promise;
    };
    qmService.getTodayTrackingReminderNotificationsDeferred = function(variableCategoryName){
        var params = {
            minimumReminderTimeUtcString : qmService.getLocalMidnightInUtcString(),
            maximumReminderTimeUtcString : qmService.getTomorrowLocalMidnightInUtcString(),
            sort : 'reminderTime'
        };
        if (variableCategoryName) {params.variableCategoryName = variableCategoryName;}
        var deferred = $q.defer();
        qmService.getTrackingReminderNotificationsFromApi(params, function(response){
            if(response.success) {
                var trackingReminderNotifications = putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data);
                if(trackingReminderNotifications.length){
                  checkHoursSinceLastPushNotificationReceived();
                }
                deferred.resolve(trackingReminderNotifications);
            } else {deferred.reject("error");}
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getTrackingReminderNotificationsFromLocalStorage = function (variableCategoryName) {
        var trackingReminderNotifications = window.getTrackingReminderNotificationsFromLocalStorage (variableCategoryName);
        if(trackingReminderNotifications.length){
            $rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
        }
        return trackingReminderNotifications;
    };
    qmService.refreshTrackingReminderNotifications = function(minimumSecondsBetweenRequests){
        var deferred = $q.defer();
        var options = {};
        options.minimumSecondsBetweenRequests = 3;
        if(minimumSecondsBetweenRequests){
            options.minimumSecondsBetweenRequests = minimumSecondsBetweenRequests;
            options.blockRequests = true;
        }
        if(!canWeMakeRequestYet('GET', 'refreshTrackingReminderNotifications', options)){
            deferred.reject('Already called refreshTrackingReminderNotifications within last ' + options.minimumSecondsBetweenRequests + ' seconds!  Rejecting promise!');
            return deferred.promise;
        }
        qmService.postTrackingReminderNotificationsDeferred(function(){
            var currentDateTimeInUtcStringPlus5Min = qmService.getCurrentDateTimeInUtcStringPlusMin(5);
            var params = {};
            params.reminderTime = '(lt)' + currentDateTimeInUtcStringPlus5Min;
            params.sort = '-reminderTime';
            params.limit = 20; // Limit to notifications to 20 to improve inbox performance (Not sure how much it helps though)
            qmService.getTrackingReminderNotificationsFromApi(params, function(response){
                if(response.success) {
                    var trackingReminderNotifications = putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data);
                    if(trackingReminderNotifications.length && $rootScope.isMobile && getDeviceTokenToSync()){qmService.registerDeviceToken();}
                    if($rootScope.isAndroid){qmService.showPopupForMostRecentNotification();}
                    if (window.chrome && window.chrome.browserAction) {
                        chrome.browserAction.setBadgeText({text: "?"});
                        //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
                    }
                    qmService.refreshingTrackingReminderNotifications = false;
                    deferred.resolve(trackingReminderNotifications);
                }
                else {
                    qmService.refreshingTrackingReminderNotifications = false;
                    deferred.reject("error");
                }
            }, function(error){
                qmService.logError(error);
                qmService.refreshingTrackingReminderNotifications = false;
                deferred.reject(error);
            });
        }, function(error){
            qmService.logError(error);
            qmService.refreshingTrackingReminderNotifications = false;
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getTrackingReminderByIdDeferred = function(reminderId){
        var deferred = $q.defer();
        var params = {id : reminderId};
        qmService.getTrackingRemindersFromApi(params, function(remindersResponse){
            var trackingReminders = remindersResponse.data;
            if(remindersResponse.success) {deferred.resolve(trackingReminders);} else {deferred.reject("error");}
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getCurrentTrackingReminderNotificationsFromApi = function(category, today){
        var localMidnightInUtcString = qmService.getLocalMidnightInUtcString();
        var currentDateTimeInUtcString = qmService.getCurrentDateTimeInUtcString();
        var params = {};
        if(today && !category){
            var reminderTime = '(gt)' + localMidnightInUtcString;
            params = {reminderTime : reminderTime, sort : 'reminderTime'};
        }
        if(!today && category){params = {variableCategoryName : category, reminderTime : '(lt)' + currentDateTimeInUtcString};}
        if(today && category){params = {reminderTime : '(gt)' + localMidnightInUtcString, variableCategoryName : category, sort : 'reminderTime'};}
        if(!today && !category){params = {reminderTime : '(lt)' + currentDateTimeInUtcString};}
        var deferred = $q.defer();
        var successHandler = function(trackingReminderNotifications) {
            if (trackingReminderNotifications.success) {deferred.resolve(trackingReminderNotifications.data);}
            else {deferred.reject("error");}
        };
        var errorHandler = function(error){
            qmService.logError(error);
            deferred.reject(error);
        };
        configureQmApiClient();
        var apiInstance = new Quantimodo.RemindersApi();
        function callback(error, data, response) {
            qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler);
        }
        params = addGlobalUrlParamsToObject(params);
        apiInstance.getTrackingReminderNotifications(params, callback);
        //qmService.get('api/v3/trackingReminderNotifications', ['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'], params, successHandler, errorHandler);
        return deferred.promise;
    };
    qmService.deleteTrackingReminderFromLocalStorage = function(reminderToDelete){
        var allTrackingReminders = qmService.getLocalStorageItemAsObject('trackingReminders');
        var trackingRemindersToKeep = [];
        angular.forEach(allTrackingReminders, function(reminderFromLocalStorage, key) {
            if(!(reminderFromLocalStorage.variableName === reminderToDelete.variableName &&
                reminderFromLocalStorage.reminderFrequency === reminderToDelete.reminderFrequency &&
                reminderFromLocalStorage.reminderStartTime === reminderToDelete.reminderStartTime)){
                trackingRemindersToKeep.push(reminderFromLocalStorage);
            }
        });
        qmService.setLocalStorageItem('trackingReminders', trackingRemindersToKeep);
    };
    qmService.deleteTrackingReminderDeferred = function(reminderToDelete){
        var deferred = $q.defer();
        qmService.deleteTrackingReminderFromLocalStorage(reminderToDelete);
        if(!reminderToDelete.id){
            deferred.resolve();
            return deferred.promise;
        }
        qmService.deleteTrackingReminder(reminderToDelete.id, function(response){
            // Delete again in case we refreshed before deletion completed
            qmService.deleteTrackingReminderFromLocalStorage(reminderToDelete);
            deferred.resolve(response);
        }, function(error){
            //qmService.logError(error);
            qmService.deleteTrackingReminderFromLocalStorage(reminderToDelete);
            deferred.reject(error); // Not sure why this is returning error on successful deletion
        });
        return deferred.promise;
    };
    // We need to keep this in case we want offline reminders
    qmService.addRatingTimesToDailyReminders = function(reminders) {
        var index;
        for (index = 0; index < reminders.length; ++index) {
            if (reminders[index].valueAndFrequencyTextDescription &&
                reminders[index].valueAndFrequencyTextDescription.indexOf('daily') > 0 &&
                reminders[index].valueAndFrequencyTextDescription.indexOf(' at ') === -1 &&
                reminders[index].valueAndFrequencyTextDescription.toLowerCase().indexOf('disabled') === -1) {
                reminders[index].valueAndFrequencyTextDescription = reminders[index].valueAndFrequencyTextDescription + ' at ' +
                    qmService.convertReminderTimeStringToMoment(reminders[index].reminderStartTime).format("h:mm A");
            }
        }
        return reminders;
    };
    qmService.getValueAndFrequencyTextDescriptionWithTime = function(trackingReminder){
        if(trackingReminder.reminderFrequency === 86400){
            if(trackingReminder.unitCategoryName === 'Rating'){return 'Daily at ' + qmService.humanFormat(trackingReminder.reminderStartTimeLocal);}
            if(trackingReminder.defaultValue){return trackingReminder.defaultValue + ' ' + trackingReminder.unitAbbreviatedName + ' daily at ' + qmService.humanFormat(trackingReminder.reminderStartTimeLocal);}
            return 'Daily at ' + qmService.humanFormat(trackingReminder.reminderStartTimeLocal);
        } else if (trackingReminder.reminderFrequency === 0){
            if(trackingReminder.unitCategoryName === "Rating"){return "As-Needed";}
            if(trackingReminder.defaultValue){return trackingReminder.defaultValue + ' ' + trackingReminder.unitAbbreviatedName + ' as-needed';}
            return "As-Needed";
        } else {
            if(trackingReminder.unitCategoryName === 'Rating'){return 'Rate every ' + trackingReminder.reminderFrequency/3600 + " hours";}
            if(trackingReminder.defaultValue){return trackingReminder.defaultValue + ' ' + trackingReminder.unitAbbreviatedName + ' every ' + trackingReminder.reminderFrequency/3600 + " hours";}
            return 'Every ' + trackingReminder.reminderFrequency/3600 + " hours";
        }
    };
    qmService.convertReminderTimeStringToMoment = function(reminderTimeString) {
        var now = new Date();
        var hourOffsetFromUtc = now.getTimezoneOffset()/60;
        var parsedReminderTimeUtc = reminderTimeString.split(':');
        var minutes = parsedReminderTimeUtc[1];
        var hourUtc = parseInt(parsedReminderTimeUtc[0]);
        var localHour = hourUtc - parseInt(hourOffsetFromUtc);
        if(localHour > 23){localHour = localHour - 24;}
        if(localHour < 0){localHour = localHour + 24;}
        return moment().hours(localHour).minutes(minutes);
    };
    qmService.addToTrackingReminderSyncQueue = function(trackingReminder) {
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderSyncQueue', trackingReminder);
    };
    qmService.syncTrackingReminders = function(force) {
        var deferred = $q.defer();
        var trackingReminderSyncQueue = qmService.getLocalStorageItemAsObject('trackingReminderSyncQueue');
        if(trackingReminderSyncQueue && trackingReminderSyncQueue.length){
            qmService.logInfo("syncTrackingReminders: Sync queue NOT empty so posting notifications");
            var postTrackingRemindersToApiAndHandleResponse = function(){
                qmService.postTrackingRemindersToApi(trackingReminderSyncQueue, function(response){
                    qmService.logInfo("postTrackingRemindersToApi response: " + JSON.stringify(response));
                    if(response && response.data){
                        qmService.deleteItemFromLocalStorage('trackingReminderSyncQueue');
                        if(response.data.userVariables){qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);}
                        if(!response.data.trackingReminders){
                            qmService.logError("No response.trackingReminders returned from postTrackingRemindersDeferred")
                        } else if(!response.data.trackingReminders.length){
                            qmService.logError("response.trackingReminders is an empty array in postTrackingRemindersDeferred")
                        } else {
                            qmService.scheduleSingleMostFrequentLocalNotification(response.data.trackingReminders);
                            qmService.setLocalStorageItem('trackingReminders', JSON.stringify(response.data.trackingReminders));
                        }
                        if(!response.data.trackingReminderNotifications){
                            qmService.logError("No response.trackingReminderNotifications returned from postTrackingRemindersDeferred")
                        } else if(!response.data.trackingReminderNotifications.length){
                            qmService.logError("response.trackingReminderNotifications is an empty array in postTrackingRemindersDeferred")
                        } else {
                            // Don't update inbox because it might add notifications that we have already tracked since the API returned these ones
                            //putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data.trackingReminderNotifications);
                            qmService.setLocalStorageItem('trackingReminderNotifications',  JSON.stringify(response.data.trackingReminderNotifications));
                        }
                    } else {
                        qmService.logError("No postTrackingRemindersToApi response.data!")
                    }
                    deferred.resolve(response);
                }, function(error){deferred.reject(error);});
            };
            qmService.postTrackingReminderNotificationsDeferred().then(function () {
                postTrackingRemindersToApiAndHandleResponse();
            }, function(error){
                postTrackingRemindersToApiAndHandleResponse();
                deferred.reject(error);
            });
        } else {
            qmService.logInfo("syncTrackingReminders: Sync queue empty so just fetching from API");
            qmService.getTrackingRemindersFromApi({force: force}, function(trackingReminders){
                qmService.scheduleSingleMostFrequentLocalNotification(trackingReminders);
                qmService.setLocalStorageItem('trackingReminders', JSON.stringify(trackingReminders));
                deferred.resolve(trackingReminders);
            }, function(error){
                qmService.logError(error);
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };
    qmService.deleteTrackingReminderNotificationFromLocalStorage = function(body){
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        window.deleteTrackingReminderNotificationFromLocalStorage(body);
    };
    qmService.groupTrackingReminderNotificationsByDateRange = function (trackingReminderNotifications) {
        if(trackingReminderNotifications.constructor !== Array){
            qmService.logError("trackingReminderNotifications is not an array! trackingReminderNotifications: " + JSON.stringify(trackingReminderNotifications));
            return;
        } else {
            qmService.logDebug("trackingReminderNotifications is an array");
        }
        var result = [];
        var reference = moment().local();
        var today = reference.clone().startOf('day');
        var yesterday = reference.clone().subtract(1, 'days').startOf('day');
        var weekold = reference.clone().subtract(7, 'days').startOf('day');
        var monthold = reference.clone().subtract(30, 'days').startOf('day');
        var todayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
            /** @namespace trackingReminderNotification.trackingReminderNotificationTime */
            return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
        });
        if (todayResult.length) {result.push({name: "Today", trackingReminderNotifications: todayResult});}
        var yesterdayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
            return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
        });
        if (yesterdayResult.length) {result.push({name: "Yesterday", trackingReminderNotifications: yesterdayResult});}
        var last7DayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
            var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();
            return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
        });
        if (last7DayResult.length) {result.push({name: "Last 7 Days", trackingReminderNotifications: last7DayResult});}
        var last30DayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
            var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();
            return date.isAfter(monthold) === true && date.isBefore(weekold) === true && date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
        });
        if (last30DayResult.length) {result.push({name: "Last 30 Days", trackingReminderNotifications: last30DayResult});}
        var olderResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
            return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isBefore(monthold) === true;
        });
        if (olderResult.length) {result.push({name: "Older", trackingReminderNotifications: olderResult});}
        return result;
    };
    qmService.getTrackingRemindersFromLocalStorage = function (variableCategoryName){
        var deferred = $q.defer();
        var filteredReminders = [];
        var unfilteredRemindersString = qmService.getLocalStorageItemAsString('trackingReminders');
        if(!unfilteredRemindersString){
            deferred.resolve([]);
            return deferred.promise;
        }
        if(unfilteredRemindersString.indexOf('[object Object]') !== -1){
            qmService.deleteLargeLocalStorageItems(['trackingReminders']);
            unfilteredRemindersString = null;
        }
        var unfilteredReminders = JSON.parse(unfilteredRemindersString);
        if(!unfilteredReminders){unfilteredReminders = [];}
        var syncQueue = JSON.parse(qmService.getLocalStorageItemAsString('trackingReminderSyncQueue'));
        if(syncQueue){unfilteredReminders = unfilteredReminders.concat(syncQueue);}
        unfilteredReminders = qmService.attachVariableCategoryIcons(unfilteredReminders);
        if(unfilteredReminders) {
            if(variableCategoryName && variableCategoryName !== 'Anything') {
                for(var j = 0; j < unfilteredReminders.length; j++){
                    if(variableCategoryName === unfilteredReminders[j].variableCategoryName){
                        filteredReminders.push(unfilteredReminders[j]);
                    }
                }
            } else {
                filteredReminders = unfilteredReminders;
            }
            filteredReminders = qmService.addRatingTimesToDailyReminders(filteredReminders); //We need to keep this in case we want offline reminders
            deferred.resolve(filteredReminders);
        }
        return deferred.promise;
    };
    qmService.createDefaultReminders = function () {
        var deferred = $q.defer();
        qmService.getLocalStorageItemAsStringWithCallback('defaultRemindersCreated', function (defaultRemindersCreated) {
            if(JSON.parse(defaultRemindersCreated) !== true) {
                var defaultReminders = qmService.getDefaultReminders();
                if(defaultReminders && defaultReminders.length){
                    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront(
                        'trackingReminderSyncQueue', defaultReminders).then(function () {
                        qmService.syncTrackingReminders().then(function (trackingReminders){ deferred.resolve(trackingReminders);});
                    });
                    qmService.logDebug('Creating default reminders ' + JSON.stringify(defaultReminders));
                }
            } else {
                deferred.reject('Default reminders already created');
                qmService.logDebug('Default reminders already created');
            }
        });
        return deferred.promise;
    };
    // ChartService
    var useLocalImages = function (correlationObjects) {
        for(var i = 0; i < correlationObjects.length; i++){
            correlationObjects[i].gaugeImage = correlationObjects[i].gaugeImage.substring(correlationObjects[i].gaugeImage.lastIndexOf("/") + 1);
            correlationObjects[i].gaugeImage = 'img/gauges/246-120/' + correlationObjects[i].gaugeImage;
            correlationObjects[i].causeVariableImageUrl = correlationObjects[i].causeVariableImageUrl.substring(correlationObjects[i].causeVariableImageUrl.lastIndexOf("/") + 1);
            correlationObjects[i].causeVariableImageUrl = 'img/variable_categories/' + correlationObjects[i].causeVariableImageUrl;
            correlationObjects[i].effectVariableImageUrl = correlationObjects[i].effectVariableImageUrl.substring(correlationObjects[i].effectVariableImageUrl.lastIndexOf("/") + 1);
            correlationObjects[i].effectVariableImageUrl = 'img/variable_categories/' + correlationObjects[i].effectVariableImageUrl;
        }
        return correlationObjects;
    };
    qmService.clearCorrelationCache = function(){
        qmService.deleteCachedResponse('aggregatedCorrelations');
        qmService.deleteCachedResponse('correlations');
    };
    qmService.getAggregatedCorrelationsDeferred = function(params){
        var deferred = $q.defer();
        var cachedCorrelations = qmService.getCachedResponse('aggregatedCorrelations', params);
        if(cachedCorrelations){
            deferred.resolve(cachedCorrelations);
            return deferred.promise;
        }
        qmService.getAggregatedCorrelationsFromApi(params, function(correlationObjects){
            correlationObjects = useLocalImages(correlationObjects);
            qmService.storeCachedResponse('aggregatedCorrelations', params, correlationObjects);
            deferred.resolve(correlationObjects);
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getNotesDeferred = function(variableName){
        var deferred = $q.defer();
        qmService.getNotesFromApi({variableName: variableName}, function(response){
            deferred.resolve(response.data);
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getCorrelationsDeferred = function (params) {
        var deferred = $q.defer();
        var cachedCorrelationsResponseData = qmService.getCachedResponse('correlations', params);
        if(cachedCorrelationsResponseData){
            deferred.resolve(cachedCorrelationsResponseData);
            return deferred.promise;
        }
        qmService.getUserCorrelationsFromApi(params, function(response){
            response.data.correlations = useLocalImages(response.data.correlations);
            qmService.storeCachedResponse('correlations', params, response.data);
            deferred.resolve(response.data);
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.postVoteDeferred = function(correlationObject){
        var deferred = $q.defer();
        qmService.postVoteToApi(correlationObject, function(response){
            qmService.clearCorrelationCache();
            deferred.resolve(true);
        }, function(error){
            qmService.logError("postVote response", error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.deleteVoteDeferred = function(correlationObject){
        var deferred = $q.defer();
        qmService.deleteVoteToApi(correlationObject, function(response){
            qmService.clearCorrelationCache();
            deferred.resolve(true);
        }, function(error){
            qmService.logError("deleteVote response", error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getRatingInfo = function() {
        var ratingInfo =
            {
                1 : {
                    displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                    positiveImage: qmService.ratingImages.positive[0],
                    negativeImage: qmService.ratingImages.negative[0],
                    numericImage:  qmService.ratingImages.numeric[0],
                },
                2 : {
                    displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                    positiveImage: qmService.ratingImages.positive[1],
                    negativeImage: qmService.ratingImages.negative[1],
                    numericImage:  qmService.ratingImages.numeric[1],
                },
                3 : {
                    displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                    positiveImage: qmService.ratingImages.positive[2],
                    negativeImage: qmService.ratingImages.negative[2],
                    numericImage:  qmService.ratingImages.numeric[2],
                },
                4 : {
                    displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                    positiveImage: qmService.ratingImages.positive[3],
                    negativeImage: qmService.ratingImages.negative[3],
                    numericImage:  qmService.ratingImages.numeric[3],
                },
                5 : {
                    displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                    positiveImage: qmService.ratingImages.positive[4],
                    negativeImage: qmService.ratingImages.negative[4],
                    numericImage:  qmService.ratingImages.numeric[4],
                }
            };
        return ratingInfo;
    };
    qmService.getPrimaryOutcomeVariableOptionLabels = function(shouldShowNumbers){
        if(shouldShowNumbers || !qmService.getPrimaryOutcomeVariable().ratingOptionLabels){return ['1',  '2',  '3',  '4', '5'];
        } else {return qmService.getPrimaryOutcomeVariable().ratingOptionLabels;}
    };
    qmService.getPositiveImageByRatingValue = function(numericValue){
        var positiveRatingOptions = qmService.getPositiveRatingOptions();
        var filteredList = positiveRatingOptions.filter(function(option){return option.numericValue === numericValue;});
        return filteredList.length? filteredList[0].img || false : false;
    };
    qmService.getNegativeImageByRatingValue = function(numericValue){
        var negativeRatingOptions = this.getNegativeRatingOptions();
        var filteredList = negativeRatingOptions.filter(function(option){return option.numericValue === numericValue;});
        return filteredList.length? filteredList[0].img || false : false;
    };
    qmService.getNumericImageByRatingValue = function(numericValue){
        var numericRatingOptions = this.getNumericRatingOptions();
        var filteredList = numericRatingOptions.filter(function(option){return option.numericValue === numericValue;});
        return filteredList.length? filteredList[0].img || false : false;
    };
    qmService.getPrimaryOutcomeVariableByNumber = function(num){
        return qmService.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] ? qmService.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] : false;
    };
    qmService.getRatingFaceImageByText = function(lowerCaseRatingTextDescription){
        var positiveRatingOptions = qmService.getPositiveRatingOptions();
        var filteredList = positiveRatingOptions.filter(
            function(option){return option.lowerCaseTextDescription === lowerCaseRatingTextDescription;});
        return filteredList.length ? filteredList[0].img || false : false;
    };
    qmService.getPositiveRatingOptions = function() {
        return [
            {
                numericValue: 1,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                lowerCaseTextDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[0].toLowerCase(),
                img: qmService.ratingImages.positive[0]
            },
            {
                numericValue: 2,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                lowerCaseTextDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[1].toLowerCase(),
                img: qmService.ratingImages.positive[1]
            },
            {
                numericValue: 3,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                lowerCaseTextDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[2].toLowerCase(),
                img: qmService.ratingImages.positive[2]
            },
            {
                numericValue: 4,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                lowerCaseTextDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[3].toLowerCase(),
                img: qmService.ratingImages.positive[3]
            },
            {
                numericValue: 5,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                lowerCaseTextDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[4].toLowerCase(),
                img: qmService.ratingImages.positive[4]
            }
        ];
    };
    qmService.getNegativeRatingOptions = function() {
        return [
            {
                numericValue: 1,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                value: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[4].toLowerCase(),
                img: qmService.ratingImages.negative[0]
            },
            {
                numericValue: 2,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                value: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[3].toLowerCase(),
                img: qmService.ratingImages.negative[1]
            },
            {
                numericValue: 3,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                value: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[2].toLowerCase(),
                img: qmService.ratingImages.negative[2]
            },
            {
                numericValue: 4,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                value: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[1].toLowerCase(),
                img: qmService.ratingImages.negative[3]
            },
            {
                numericValue: 5,
                displayDescription: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                value: qmService.getPrimaryOutcomeVariable().ratingOptionLabels[0].toLowerCase(),
                img: qmService.ratingImages.negative[4]
            }
        ];
    };
    qmService.getNumericRatingOptions = function() {
        return [
            {numericValue: 1, img: qmService.ratingImages.numeric[0]},
            {numericValue: 2, img: qmService.ratingImages.numeric[1]},
            {numericValue: 3, img: qmService.ratingImages.numeric[2]},
            {numericValue: 4, img: qmService.ratingImages.numeric[3]},
            {numericValue: 5, img: qmService.ratingImages.numeric[4]}
        ];
    };
    function parseJsonIfPossible(str) {
        var object = false;
        try {
            object = JSON.parse(str);
        } catch (e) {
            return false;
        }
        return object;
    }
    qmService.addInfoAndImagesToMeasurements = function (measurements){
        var ratingInfo = qmService.getRatingInfo();
        var index;
        for (index = 0; index < measurements.length; ++index) {
            var parsedNote =  parseJsonIfPossible(measurements[index].note);
            if(parsedNote){
                if(parsedNote.url && parsedNote.message){
                    measurements[index].note = '<a href="' + parsedNote.url + '" target="_blank">' + parsedNote.message + '</a>';
                } else {
                    Bugsnag.notify("Unrecognized note format", "Could not properly format JSON note", {note: measurements[index].note});
                }
            }
            if(!measurements[index].variableName){measurements[index].variableName = measurements[index].variable;}
            if(measurements[index].variableName === qmService.getPrimaryOutcomeVariable().name){
                measurements[index].valence = qmService.getPrimaryOutcomeVariable().valence;
            }
            if (measurements[index].unitAbbreviatedName === '/5') {measurements[index].roundedValue = Math.round(measurements[index].value);}
            measurements[index].valueUnitVariableName = measurements[index].value + " " + measurements[index].unitAbbreviatedName + ' ' + measurements[index].variableName;
            measurements[index].valueUnitVariableName = qmService.formatValueUnitDisplayText(measurements[index].valueUnitVariableName, measurements[index].unitAbbreviatedName);
            //if (measurements[index].unitAbbreviatedName === '%') { measurements[index].roundedValue = Math.round(measurements[index].value / 25 + 1); }
            if (measurements[index].roundedValue && measurements[index].valence === 'positive' && ratingInfo[measurements[index].roundedValue]) {
                measurements[index].image = measurements[index].image = ratingInfo[measurements[index].roundedValue].positiveImage;
            }
            if (measurements[index].roundedValue && measurements[index].valence === 'negative' && ratingInfo[measurements[index].roundedValue]) {
                measurements[index].image = ratingInfo[measurements[index].roundedValue].negativeImage;
            }
            if (!measurements[index].image && measurements[index].roundedValue && ratingInfo[measurements[index].roundedValue]) {
                measurements[index].image = ratingInfo[measurements[index].roundedValue].numericImage;
            }
            if(measurements[index].image){ measurements[index].pngPath = measurements[index].image; }
            if (measurements[index].variableCategoryName){
                measurements[index].icon = qmService.getVariableCategoryIcon(measurements[index].variableCategoryName);
            }
        }
        return measurements;
    };
    qmService.getWeekdayChartConfigForPrimaryOutcome = function () {
        var deferred = $q.defer();
        deferred.resolve(qmService.processDataAndConfigureWeekdayChart(
            qmService.getLocalStorageItemAsObject('primaryOutcomeVariableMeasurements'),
            qmService.getPrimaryOutcomeVariable()));
        return deferred.promise;
    };
    qmService.generateDistributionArray = function(allMeasurements){
        var distributionArray = [];
        var valueLabel;
        for (var i = 0; i < allMeasurements.length; i++) {
            if(!allMeasurements[i]){return distributionArray;}
            valueLabel = String(allMeasurements[i].value);
            if(valueLabel.length > 1) {valueLabel = String(Number(allMeasurements[i].value.toPrecision(1)));}
            if(typeof distributionArray[valueLabel] === "undefined"){distributionArray[valueLabel] = 0;}
            distributionArray[valueLabel] += 1;
        }
        return distributionArray;
    };
    qmService.generateWeekdayMeasurementArray = function(allMeasurements){
        if(!allMeasurements){
            qmService.logInfo('No measurements provided to generateWeekdayMeasurementArray');
            return false;
        }
        var weekdayMeasurementArrays = [];
        var startTimeMilliseconds = null;
        for (var i = 0; i < allMeasurements.length; i++) {
            startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
            if(typeof weekdayMeasurementArrays[moment(startTimeMilliseconds).day()] === "undefined"){
                weekdayMeasurementArrays[moment(startTimeMilliseconds).day()] = [];
            }
            weekdayMeasurementArrays[moment(startTimeMilliseconds).day()].push(allMeasurements[i]);
        }
        return weekdayMeasurementArrays;
    };
    qmService.generateMonthlyMeasurementArray = function(allMeasurements){
        if(!allMeasurements){
            qmService.logInfo('No measurements provided to generateMonthlyMeasurementArray');
            return false;
        }
        var monthlyMeasurementArrays = [];
        var startTimeMilliseconds = null;
        for (var i = 0; i < allMeasurements.length; i++) {
            startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
            if(typeof monthlyMeasurementArrays[moment(startTimeMilliseconds).month()] === "undefined"){
                monthlyMeasurementArrays[moment(startTimeMilliseconds).month()] = [];
            }
            monthlyMeasurementArrays[moment(startTimeMilliseconds).month()].push(allMeasurements[i]);
        }
        return monthlyMeasurementArrays;
    };
    qmService.generateHourlyMeasurementArray = function(allMeasurements){
        var hourlyMeasurementArrays = [];
        for (var i = 0; i < allMeasurements.length; i++) {
            var startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
            if (typeof hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] === "undefined") {
                hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] = [];
            }
            hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()].push(allMeasurements[i]);
        }
        return hourlyMeasurementArrays;
    };
    qmService.calculateAverageValueByHour = function(hourlyMeasurementArrays) {
        var sumByHour = [];
        var averageValueByHourArray = [];
        for (var k = 0; k < 23; k++) {
            if (typeof hourlyMeasurementArrays[k] !== "undefined") {
                for (var j = 0; j < hourlyMeasurementArrays[k].length; j++) {
                    if (typeof sumByHour[k] === "undefined") {sumByHour[k] = 0;}
                    sumByHour[k] = sumByHour[k] + hourlyMeasurementArrays[k][j].value;
                }
                averageValueByHourArray[k] = sumByHour[k] / (hourlyMeasurementArrays[k].length);
            } else {
                averageValueByHourArray[k] = null;
                //qmService.logDebug("No data for hour " + k);
            }
        }
        return averageValueByHourArray;
    };
    qmService.calculateAverageValueByWeekday = function(weekdayMeasurementArrays) {
        var sumByWeekday = [];
        var averageValueByWeekdayArray = [];
        for (var k = 0; k < 7; k++) {
            if (typeof weekdayMeasurementArrays[k] !== "undefined") {
                for (var j = 0; j < weekdayMeasurementArrays[k].length; j++) {
                    if (typeof sumByWeekday[k] === "undefined") {sumByWeekday[k] = 0;}
                    sumByWeekday[k] = sumByWeekday[k] + weekdayMeasurementArrays[k][j].value;
                }
                averageValueByWeekdayArray[k] = sumByWeekday[k] / (weekdayMeasurementArrays[k].length);
            } else {
                averageValueByWeekdayArray[k] = null;
                //qmService.logDebug("No data for day " + k);
            }
        }
        return averageValueByWeekdayArray;
    };
    qmService.calculateAverageValueByMonthly = function(monthlyMeasurementArrays) {
        var sumByMonthly = [];
        var averageValueByMonthlyArray = [];
        for (var k = 0; k < 12; k++) {
            if (typeof monthlyMeasurementArrays[k] !== "undefined") {
                for (var j = 0; j < monthlyMeasurementArrays[k].length; j++) {
                    if (typeof sumByMonthly[k] === "undefined") {sumByMonthly[k] = 0;}
                    sumByMonthly[k] = sumByMonthly[k] + monthlyMeasurementArrays[k][j].value;
                }
                averageValueByMonthlyArray[k] = sumByMonthly[k] / (monthlyMeasurementArrays[k].length);
            } else {
                averageValueByMonthlyArray[k] = null;
                //qmService.logDebug("No data for day " + k);
            }
        }
        return averageValueByMonthlyArray;
    };
    var shouldWeUsePrimaryOutcomeLabels = function (variableObject) {
        return variableObject.userVariableDefaultUnitId === 10 && variableObject.name === qmService.getPrimaryOutcomeVariable().name;
    };
    function setChartExportingOptions(chartConfig){
        chartConfig.exporting = {enabled: $rootScope.isWeb};
        return chartConfig;
    }
    qmService.configureDistributionChart = function(dataAndLabels, variableObject){
        var xAxisLabels = [];
        var xAxisTitle = 'Daily Values (' + variableObject.unitAbbreviatedName + ')';
        var data = [];
        if(shouldWeUsePrimaryOutcomeLabels(variableObject)){ data = [0, 0, 0, 0, 0]; }
        function isInt(n) { return parseFloat(n) % 1 === 0; }
        var dataAndLabels2 = [];
        for(var propertyName in dataAndLabels) {
            // propertyName is what you want
            // you can get the value like this: myObject[propertyName]
            if(dataAndLabels.hasOwnProperty(propertyName)){
                dataAndLabels2.push({label: propertyName, value: dataAndLabels[propertyName]});
                xAxisLabels.push(propertyName);
                if(shouldWeUsePrimaryOutcomeLabels(variableObject)){
                    if(isInt(propertyName)){ data[parseInt(propertyName) - 1] = dataAndLabels[propertyName]; }
                } else { data.push(dataAndLabels[propertyName]); }
            }
        }
        dataAndLabels2.sort(function(a, b) { return a.label - b.label; });
        xAxisLabels = [];
        data = [];
        for(var i = 0; i < dataAndLabels2.length; i++){
            xAxisLabels.push(dataAndLabels2[i].label);
            data.push(dataAndLabels2[i].value);
        }
        if(shouldWeUsePrimaryOutcomeLabels(variableObject)) {
            xAxisLabels = qmService.getPrimaryOutcomeVariableOptionLabels();
            xAxisTitle = '';
        }
        var chartConfig = {
          chart: {
              height : 300,
              type : 'column',
              renderTo : 'BarContainer',
              animation: {
                  duration: 0
              }
          },
          xAxis : {
              title : {
                  text : xAxisTitle
              },
              categories : xAxisLabels
          },
          yAxis : {
              title : {
                  text : 'Number of Measurements'
              },
              min : 0
          },
          lang: {
              loading: ''
          },
          loading: {
              style: {
                  background: 'url(/res/loading3.gif) no-repeat center'
              },
              hideDuration: 10,
              showDuration: 10
          },
          legend : {
              enabled : false
          },
          plotOptions : {
              column : {
                  pointPadding : 0.2,
                  borderWidth : 0,
                  pointWidth : 40 * 5 / xAxisLabels.length,
                  enableMouseTracking : true,
                  colorByPoint : true
              }
          },
          credits: {
              enabled: false
          },
          colors : [ "#000000", "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ],
            title : {
                text : variableObject.name + ' Distribution'
            },
            series: [{
                name : variableObject.name + ' Distribution',
                data: data
            }]
        };
        return setChartExportingOptions(chartConfig);
    };
    qmService.processDataAndConfigureWeekdayChart = function(measurements, variableObject) {
        if(!measurements){
            qmService.logInfo('No measurements provided to processDataAndConfigureWeekdayChart');
            return false;
        }
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to processDataAndConfigureWeekdayChart");
            return;
        }
        var weekdayMeasurementArray = this.generateWeekdayMeasurementArray(measurements);
        var averageValueByWeekdayArray = this.calculateAverageValueByWeekday(weekdayMeasurementArray);
        return this.configureWeekdayChart(averageValueByWeekdayArray, variableObject);
    };
    qmService.processDataAndConfigureMonthlyChart = function(measurements, variableObject) {
        if(!measurements){
            qmService.logInfo('No measurements provided to processDataAndConfigureMonthlyChart');
            return false;
        }
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to processDataAndConfigureMonthlyChart");
            return;
        }
        var monthlyMeasurementArray = this.generateMonthlyMeasurementArray(measurements);
        var averageValueByMonthlyArray = this.calculateAverageValueByMonthly(monthlyMeasurementArray);
        return this.configureMonthlyChart(averageValueByMonthlyArray, variableObject);
    };
    qmService.processDataAndConfigureHourlyChart = function(measurements, variableObject) {
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
            return;
        }
        var hourlyMeasurementArray = this.generateHourlyMeasurementArray(measurements);
        var count = 0;
        for(var i = 0; i < hourlyMeasurementArray.length; ++i){
            if(hourlyMeasurementArray[i]) {count++;}
        }
        if(variableObject.name.toLowerCase().indexOf('daily') !== -1){
            qmService.logDebug('Not showing hourly chart because variable name contains daily');
            return false;
        }
        if(count < 3){
            qmService.logDebug('Not showing hourly chart because we have less than 3 hours with measurements');
            return false;
        }
        var averageValueByHourArray = this.calculateAverageValueByHour(hourlyMeasurementArray);
        return this.configureHourlyChart(averageValueByHourArray, variableObject);
    };
    qmService.processDataAndConfigureDistributionChart = function(measurements, variableObject) {
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
            return;
        }
        var distributionArray = this.generateDistributionArray(measurements);
        return this.configureDistributionChart(distributionArray, variableObject);
    };
    qmService.configureWeekdayChart = function(averageValueByWeekdayArray, variableObject){
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to configureWeekdayChart");
            return;
        }
        var maximum = 0;
        var minimum = 99999999999999999999999999999999;
        var xAxisLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for(var i = 0; i < averageValueByWeekdayArray.length; i++){
            if(averageValueByWeekdayArray[i] > maximum){maximum = averageValueByWeekdayArray[i];}
            if(averageValueByWeekdayArray[i] < minimum){minimum = averageValueByWeekdayArray[i];}
        }
        var chartConfig = {
          chart: {
              height : 300,
              type : 'column',
              renderTo : 'BarContainer',
              animation: {duration: 1000}
          },
          xAxis : {categories : xAxisLabels},
          yAxis : {
              title : {text : 'Average Value (' + variableObject.userVariableDefaultUnitName + ')'},
              min : minimum,
              max : maximum
          },
          lang: {loading: ''},
          loading: {
              style: {background: 'url(/res/loading3.gif) no-repeat center'},
              hideDuration: 10,
              showDuration: 10
          },
          legend : {enabled : false},
          plotOptions : {
              column : {
                  pointPadding : 0.2,
                  borderWidth : 0,
                  pointWidth : 40 * 5 / xAxisLabels.length,
                  enableMouseTracking : true,
                  colorByPoint : true
              }
          },
          credits: {enabled: false},
          title: {text:'Average  ' + variableObject.name + ' by Day of Week'},
          colors : [ "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ],
          series: [{
              name : 'Average  ' + variableObject.name + ' by Day of Week',
              data: averageValueByWeekdayArray
          }]
        };
        return setChartExportingOptions(chartConfig);
    };
    qmService.configureMonthlyChart = function(averageValueByMonthlyArray, variableObject){
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to configureMonthlyChart");
            return;
        }
        var maximum = 0;
        var minimum = 99999999999999999999999999999999;
        var xAxisLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for(var i = 0; i < averageValueByMonthlyArray.length; i++){
            if(averageValueByMonthlyArray[i] > maximum){maximum = averageValueByMonthlyArray[i];}
            if(averageValueByMonthlyArray[i] < minimum){minimum = averageValueByMonthlyArray[i];}
        }
        var chartConfig = {
          chart: {
              height : 300,
              type : 'column',
              renderTo : 'BarContainer',
              animation: {duration: 1000}
          },
          xAxis : {categories : xAxisLabels},
          yAxis : {
              title : {text : 'Average Value (' + variableObject.userVariableDefaultUnitName + ')'},
              min : minimum,
              max : maximum
          },
          lang: {loading: ''},
          loading: {
              style: {background: 'url(/res/loading3.gif) no-repeat center'},
              hideDuration: 10,
              showDuration: 10
          },
          legend : {enabled : false},
          plotOptions : {
              column : {
                  pointPadding : 0.2,
                  borderWidth : 0,
                  pointWidth : 40 * 5 / xAxisLabels.length,
                  enableMouseTracking : true,
                  colorByPoint : true
              }
          },
          credits: {enabled: false},
          colors : [ "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ],
            title : {text : 'Average  ' + variableObject.name + ' by Month'},
            series: [{
                name : 'Average  ' + variableObject.name + ' by Month',
                data: averageValueByMonthlyArray
            }]
        };
        return setChartExportingOptions(chartConfig);
    };
    qmService.configureHourlyChart = function(averageValueByHourArray, variableObject){
        if(!variableObject.name){
            qmService.logError("ERROR: No variable name provided to configureHourlyChart");
            return;
        }
        var maximum = 0;
        var minimum = 99999999999999999999999999999999;
        var xAxisLabels = [
            '12 AM',
            '1 AM',
            '2 AM',
            '3 AM',
            '4 AM',
            '5 AM',
            '6 AM',
            '7 AM',
            '8 AM',
            '9 AM',
            '10 AM',
            '11 AM',
            '12 PM',
            '1 PM',
            '2 PM',
            '3 PM',
            '4 PM',
            '5 PM',
            '6 PM',
            '7 PM',
            '8 PM',
            '9 PM',
            '10 PM',
            '11 PM'
        ];
        for(var i = 0; i < averageValueByHourArray.length; i++){
            if(averageValueByHourArray[i] > maximum){maximum = averageValueByHourArray[i];}
            if(averageValueByHourArray[i] < minimum){minimum = averageValueByHourArray[i];}
        }
        var chartConfig = {
          chart: {
              height : 300,
              type : 'column',
              renderTo : 'BarContainer',
              animation: {
                  duration: 1000
              }
          },
          title : {text : 'Average  ' + variableObject.name + ' by Hour of Day'},
          xAxis : {categories : xAxisLabels},
          yAxis : {
              title : {text : 'Average Value (' + variableObject.userVariableDefaultUnitName + ')'},
              min : minimum,
              max : maximum
          },
          lang: {loading: ''},
          loading: {
              style: {background: 'url(/res/loading3.gif) no-repeat center'},
              hideDuration: 10,
              showDuration: 10
          },
          legend : {enabled : false},
          plotOptions : {
              column : {
                  pointPadding : 0.2,
                  borderWidth : 0,
                  pointWidth : 40 * 5 / xAxisLabels.length,
                  enableMouseTracking : true,
                  colorByPoint : true
              }
          },
          credits: {enabled: false},
          colors : [ "#5D83FF", "#68B107", "#ffbd40", "#CB0000"],
            series: [{
                name : 'Average  ' + variableObject.name + ' by Hour of Day',
                data: averageValueByHourArray
            }]
        };
        return setChartExportingOptions(chartConfig);
    };
    qmService.processDataAndConfigureLineChart = function(measurements, variableObject) {
        if(!measurements || !measurements.length){
            qmService.logInfo('No measurements provided to qmService.processDataAndConfigureLineChart');
            return false;
        }
        var lineChartData = [];
        var lineChartItem, name;
        var numberOfMeasurements = measurements.length;
        if(numberOfMeasurements > 1000){console.warn('Highstock cannot show tooltips because we have more than 100 measurements');}
        for (var i = 0; i < numberOfMeasurements; i++) {
            if(numberOfMeasurements < 1000){
                name = (measurements[i].sourceName) ? "(" + measurements[i].sourceName + ")" : '';
                if(measurements[i].note){name = measurements[i].note + " " + name;}
                lineChartItem = {x: measurements[i].startTimeEpoch * 1000, y: measurements[i].value, name: name};
            } else {
                lineChartItem = [measurements[i].startTimeEpoch * 1000, measurements[i].value];
            }
            lineChartData.push(lineChartItem);
        }
        return qmService.configureLineChart(lineChartData, variableObject);
    };
    function calculateWeightedMovingAverage( array, weightedPeriod ) {
        var weightedArray = [];
        for( var i = 0; i <= array.length - weightedPeriod; i++ ) {
            var sum = 0;
            for( var j = 0; j < weightedPeriod; j++ ) {sum += array[ i + j ] * ( weightedPeriod - j );}
            weightedArray[i] = sum / (( weightedPeriod * ( weightedPeriod + 1 )) / 2 );
        }
        return weightedArray;
    }
    qmService.processDataAndConfigureCorrelationsOverDurationsOfActionChart = function(correlations, weightedPeriod) {
        if(!correlations || !correlations.length){return false;}
        var forwardPearsonCorrelationSeries = {
            name : 'Pearson Correlation Coefficient',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var smoothedPearsonCorrelationSeries = {
            name : 'Smoothed Pearson Correlation Coefficient',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var forwardSpearmanCorrelationSeries = {
            name : 'Spearman Correlation Coefficient',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var qmScoreSeries = {
            name : 'QM Score',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var xAxis = [];
        var excludeSpearman = false;
        var excludeQmScoreSeries = false;
        for (var i = 0; i < correlations.length; i++) {
            xAxis.push('Day ' + correlations[i].durationOfAction/(60 * 60 * 24));
            forwardPearsonCorrelationSeries.data.push(correlations[i].correlationCoefficient);
            forwardSpearmanCorrelationSeries.data.push(correlations[i].forwardSpearmanCorrelationCoefficient);
            if(correlations[i].forwardSpearmanCorrelationCoefficient === null){excludeSpearman = true;}
            qmScoreSeries.data.push(correlations[i].qmScore);
            if(correlations[i].qmScore === null){excludeQmScoreSeries = true;}
        }
        var seriesToChart = [];
        seriesToChart.push(forwardPearsonCorrelationSeries);
        smoothedPearsonCorrelationSeries.data = calculateWeightedMovingAverage(forwardPearsonCorrelationSeries.data, weightedPeriod);
        seriesToChart.push(smoothedPearsonCorrelationSeries);
        if(!excludeSpearman){seriesToChart.push(forwardSpearmanCorrelationSeries);}
        if(!excludeQmScoreSeries){seriesToChart.push(qmScoreSeries);}
        var minimumTimeEpochMilliseconds = correlations[0].durationOfAction * 1000;
        var maximumTimeEpochMilliseconds = correlations[correlations.length - 1].durationOfAction * 1000;
        var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;
        if(millisecondsBetweenLatestAndEarliest < 86400*1000){
            console.warn('Need at least a day worth of data for line chart');
            return;
        }
        var chartConfig = {
            title: {
                text: 'Correlations Over Durations of Action',
                //x: -20 //center
            },
            subtitle: {
                text: '',
                //text: 'Effect of ' + correlations[0].causeVariableName + ' on ' + correlations[0].effectVariableName + ' Over Time',
                //x: -20
            },
            legend : {enabled : false},
            xAxis: {
                title: {text: 'Assumed Duration Of Action'},
                categories: xAxis
            },
            yAxis: {
                title: {text: 'Value'},
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#EA4335'
                }]
            },
            tooltip: {valueSuffix: ''},
            series : seriesToChart
        };
        return chartConfig;
    };
    qmService.processDataAndConfigureCorrelationsOverOnsetDelaysChart = function(correlations, weightedPeriod) {
        if(!correlations){return false;}
        var forwardPearsonCorrelationSeries = {
            name : 'Pearson Correlation Coefficient',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var smoothedPearsonCorrelationSeries = {
            name : 'Smoothed Pearson Correlation Coefficient',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var forwardSpearmanCorrelationSeries = {
            name : 'Spearman Correlation Coefficient',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var qmScoreSeries = {
            name : 'QM Score',
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var xAxis = [];
        var excludeSpearman = false;
        var excludeQmScoreSeries = false;
        for (var i = 0; i < correlations.length; i++) {
            xAxis.push('Day ' + correlations[i].onsetDelay/(60 * 60 * 24));
            forwardPearsonCorrelationSeries.data.push(correlations[i].correlationCoefficient);
            forwardSpearmanCorrelationSeries.data.push(correlations[i].forwardSpearmanCorrelationCoefficient);
            if(correlations[i].forwardSpearmanCorrelationCoefficient === null){excludeSpearman = true;}
            qmScoreSeries.data.push(correlations[i].qmScore);
            if(correlations[i].qmScore === null){excludeQmScoreSeries = true;}
        }
        var seriesToChart = [];
        seriesToChart.push(forwardPearsonCorrelationSeries);
        smoothedPearsonCorrelationSeries.data = calculateWeightedMovingAverage(forwardPearsonCorrelationSeries.data, weightedPeriod);
        seriesToChart.push(smoothedPearsonCorrelationSeries);
        if(!excludeSpearman){seriesToChart.push(forwardSpearmanCorrelationSeries);}
        if(!excludeQmScoreSeries){seriesToChart.push(qmScoreSeries);}
        var minimumTimeEpochMilliseconds = correlations[0].onsetDelay * 1000;
        var maximumTimeEpochMilliseconds = correlations[correlations.length - 1].onsetDelay * 1000;
        var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;
        if(millisecondsBetweenLatestAndEarliest < 86400*1000){
            console.warn('Need at least a day worth of data for line chart');
            return;
        }
        var config = {
            title: {
                text: 'Correlations Over Onset Delays',
                //x: -20 //center
            },
            subtitle: {
                text: '',
                //text: 'Effect of ' + correlations[0].causeVariableName + ' on ' + correlations[0].effectVariableName + ' Over Time',
                //x: -20
            },
            legend : {enabled : false},
            xAxis: {
                title: {text: 'Assumed Onset Delay'},
                categories: xAxis
            },
            yAxis: {
                title: {text: 'Value'},
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#EA4335'
                }]
            },
            tooltip: {valueSuffix: ''},
            series : seriesToChart
        };
        return config;
    };
    qmService.processDataAndConfigurePairsOverTimeChart = function(pairs, correlationObject) {
        if(!pairs){return false;}
        var predictorSeries = {
            name : correlationObject.causeVariableName,
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var outcomeSeries = {
            name : correlationObject.effectVariableName,
            data : [],
            tooltip: {valueDecimals: 2}
        };
        var xAxis = [];
        for (var i = 0; i < pairs.length; i++) {
            xAxis.push(moment(pairs[i].timestamp * 1000).format("ll"));
            predictorSeries.data.push(pairs[i].causeMeasurementValue);
            outcomeSeries.data.push(pairs[i].effectMeasurementValue);
        }
        var seriesToChart = [];
        seriesToChart.push(predictorSeries);
        seriesToChart.push(outcomeSeries);
        var minimumTimeEpochMilliseconds = pairs[0].timestamp * 1000;
        var maximumTimeEpochMilliseconds = pairs[pairs.length - 1].timestamp * 1000;
        var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;
        if(millisecondsBetweenLatestAndEarliest < 86400*1000){
            console.warn('Need at least a day worth of data for line chart');
            return;
        }
        var config = {
            title: {
                text: 'Paired Data Over Time',
                //x: -20 //center
            },
            subtitle: {
                text: '',
                //text: 'Effect of ' + correlations[0].causeVariableName + ' on ' + correlations[0].effectVariableName + ' Over Time',
                //x: -20
            },
            legend : {enabled : false},
            xAxis: {
                title: {text: 'Date'},
                categories: xAxis
            },
            options: {
                yAxis: [{
                    lineWidth: 1,
                    title: {
                        text: correlationObject.causeVariableName + ' (' + correlationObject.causeVariableDefaultUnitAbbreviatedName + ')'
                    }
                }, {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        text: correlationObject.effectVariableName + ' (' + correlationObject.effectVariableDefaultUnitAbbreviatedName + ')'
                    }
                }]
            },
            tooltip: {valueSuffix: ''},
            series: [ {
                name: correlationObject.causeVariableName,
                type: 'spline',
                color: '#00A1F1',
                data: predictorSeries.data,
                marker: {
                    enabled: false
                },
                dashStyle: 'shortdot',
                tooltip: {valueSuffix: '' + correlationObject.causeVariableDefaultUnitAbbreviatedName}
            }, {
                name: correlationObject.effectVariableName,
                color: '#EA4335',
                type: 'spline',
                yAxis: 1,
                data: outcomeSeries.data,
                tooltip: {valueSuffix: '' + correlationObject.effectVariableDefaultUnitAbbreviatedName}
            }]
        };
        return config;
    };
    var calculatePearsonsCorrelation = function(xyValues) {
        var length = xyValues.length;
        var xy = [];
        var x2 = [];
        var y2 = [];
        $.each(xyValues,function(index,value){
            xy.push(value[0] * value[1]);
            x2.push(value[0] * value[0]);
            y2.push(value[1] * value[1]);
        });
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_x2 = 0;
        var sum_y2 = 0;
        var i=0;
        $.each(xyValues,function(index,value){
            sum_x += value[0];
            sum_y += value[1];
            sum_xy += xy[i];
            sum_x2 += x2[i];
            sum_y2 += y2[i];
            i+=1;
        });
        var step1 = (length * sum_xy) - (sum_x * sum_y);
        var step2 = (length * sum_x2) - (sum_x * sum_x);
        var step3 = (length * sum_y2) - (sum_y * sum_y);
        var step4 = Math.sqrt(step2 * step3);
        var answer = step1 / step4;
        // check if answer is NaN, it can occur in the case of very small values
        return isNaN(answer) ? 0 : answer;
    };
    qmService.createScatterPlot = function (correlationObject, pairs, title) {
        if(!pairs){
            console.warn('No pairs provided to qmService.createScatterPlot');
            return false;
        }
        var xyVariableValues = [];
        for(var i = 0; i < pairs.length; i++ ){
            /** @namespace pairs[i].causeMeasurementValue */
            /** @namespace pairs[i].effectMeasurementValue */
            xyVariableValues.push([pairs[i].causeMeasurementValue, pairs[i].effectMeasurementValue]);
        }
        /** @namespace correlationObject.causeVariableDefaultUnitAbbreviatedName */
        /** @namespace correlationObject.effectVariableDefaultUnitAbbreviatedName */
        var chartConfig = {
          chart: {
              type: 'scatter',
              zoomType: 'xy'
          },
          plotOptions: {
              scatter: {
                  marker: {
                      radius: 5,
                      states: {
                          hover: {
                              enabled: true,
                              lineColor: 'rgb(100,100,100)'
                          }
                      }
                  },
                  states: {
                      hover: {
                          marker: {enabled: false}
                      }
                  },
                  tooltip: {
                      //headerFormat: '<b>{series.name}</b><br>',
                      pointFormat: '{point.x}' + correlationObject.causeVariableDefaultUnitAbbreviatedName + ', {point.y}' + correlationObject.effectVariableDefaultUnitAbbreviatedName
                  }
              }
          },
          credits: {enabled: false},
            xAxis: {
                title: {
                    enabled: true,
                    text: correlationObject.causeVariableName + ' (' + correlationObject.causeVariableDefaultUnitAbbreviatedName + ')'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {text: correlationObject.effectVariableName + ' (' + correlationObject.effectVariableDefaultUnitAbbreviatedName + ')'}
            },
            series: [{
                name: correlationObject.effectVariableName + ' by ' + correlationObject.causeVariableName,
                color: 'rgba(223, 83, 83, .5)',
                data: xyVariableValues
            }],
            title: {text: title + ' (R = ' + calculatePearsonsCorrelation(xyVariableValues).toFixed(2) + ')'},
            subtitle: {text: ''},
            loading: false
        };
        return setChartExportingOptions(chartConfig);
    };
    qmService.configureLineChartForCause  = function(correlationObject, pairs) {
        var variableObject = {unitAbbreviatedName: correlationObject.causeVariableDefaultUnitAbbreviatedName, name: correlationObject.causeVariableName};
        var data = [];
        for (var i = 0; i < pairs.length; i++) {data[i] = [pairs[i].timestamp * 1000, pairs[i].causeMeasurementValue];}
        return qmService.configureLineChart(data, variableObject);
    };
    qmService.configureLineChartForEffect  = function(correlationObject, pairs) {
        var variableObject = {unitAbbreviatedName: correlationObject.effectVariableDefaultUnitAbbreviatedName, name: correlationObject.effectVariableName};
        var data = [];
        for (var i = 0; i < pairs.length; i++) {data[i] = [pairs[i].timestamp * 1000, pairs[i].effectMeasurementValue];}
        return qmService.configureLineChart(data, variableObject);
    };
    qmService.configureLineChartForPairs = function(params, pairs) {
        var inputColor = '#26B14C', outputColor = '#3284FF', mixedColor = '#26B14C', linearRegressionColor = '#FFBB00';
        if(!params.causeVariableName){
            qmService.logError("ERROR: No variable name provided to configureLineChart");
            return;
        }
        if(pairs.length < 1){
            qmService.logError("ERROR: No data provided to configureLineChart");
            return;
        }
        var date = new Date();
        var timezoneOffsetHours = (date.getTimezoneOffset())/60;
        var timezoneOffsetMilliseconds = timezoneOffsetHours*60*60*1000; // minutes, seconds, milliseconds
        var causeSeries = [];
        var effectSeries = [];
        for (var i = 0; i < pairs.length; i++) {
            causeSeries[i] = [pairs[i].timestamp * 1000 - timezoneOffsetMilliseconds, pairs[i].causeMeasurementValue];
            effectSeries[i] = [pairs[i].timestamp * 1000 - timezoneOffsetMilliseconds, pairs[i].effectMeasurementValue];
        }
        var minimumTimeEpochMilliseconds = pairs[0].timestamp * 1000 - timezoneOffsetMilliseconds;
        var maximumTimeEpochMilliseconds = pairs[pairs.length-1].timestamp * 1000 - timezoneOffsetMilliseconds;
        var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;
        if(millisecondsBetweenLatestAndEarliest < 86400 * 1000){
            console.warn('Need at least a day worth of data for line chart');
            return;
        }
        var tlSmoothGraph, tlGraphType; // Smoothgraph true = graphType spline
        var tlEnableMarkers;
        var tlEnableHorizontalGuides = 1;
        tlSmoothGraph = true;
        tlGraphType = tlSmoothGraph === true ? 'spline' : 'line'; // spline if smoothGraph = true
        tlEnableMarkers = true; // On by default
        return  {
            chart: {renderTo: 'timeline', zoomType: 'x'},
            title: {
                text: params.causeVariableName + ' & ' + params.effectVariableName + ' Over Time'
            },
            //subtitle: {text: 'Longitudinal Timeline' + resolution, useHTML: true},
            legend: {enabled: false},
            scrollbar: {
                barBackgroundColor: '#eeeeee',
                barBorderRadius: 0,
                barBorderWidth: 0,
                buttonBackgroundColor: '#eeeeee',
                buttonBorderWidth: 0,
                buttonBorderRadius: 0,
                trackBackgroundColor: 'none',
                trackBorderWidth: 0.5,
                trackBorderRadius: 0,
                trackBorderColor: '#CCC'
            },
            navigator: {
                adaptToUpdatedData: true,
                margin: 10,
                height: 50,
                handles: {
                    backgroundColor: '#eeeeee'
                }
            },
            xAxis: {
                type: 'datetime',
                gridLineWidth: false,
                dateTimeLabelFormats: {
                    millisecond: '%H:%M:%S.%L',
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%e. %b',
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                },
                min: minimumTimeEpochMilliseconds,
                max: maximumTimeEpochMilliseconds
            },
            yAxis: [
                {
                    gridLineWidth: tlEnableHorizontalGuides,
                    title: {text: '', style: {color: inputColor}},
                    labels: {
                        formatter: function () {
                            return this.value;
                        }, style: {color: inputColor}
                    }
                },
                {
                    gridLineWidth: tlEnableHorizontalGuides,
                    title: {text: 'Data is coming down the pipes!', style: {color: outputColor}},
                    labels: {
                        formatter: function () {
                            return this.value;
                        }, style: {color: outputColor}
                    },
                    opposite: true
                }
            ],
            plotOptions: {
                series: {
                    lineWidth: 1,
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 1.5
                        }
                    }
                }
            },
            series: [
                {
                    yAxis: 0,
                    name : params.causeVariableName + ' (' + pairs[0].causeVariableDefaultUnitAbbreviatedName + ')',
                    type: tlGraphType,
                    color: inputColor,
                    data: causeSeries,
                    marker: {enabled: tlEnableMarkers, radius: 3}
                },
                {
                    yAxis: 1,
                    name : params.effectVariableName + ' (' + pairs[0].effectVariableDefaultUnitAbbreviatedName + ')',
                    type: tlGraphType,
                    color: outputColor,
                    data: effectSeries,
                    marker: {enabled: tlEnableMarkers, radius: 3}
                }
            ],
            credits: {
                enabled: false
            },
            rangeSelector: {
                inputBoxWidth: 120,
                inputBoxHeight: 18
            }
        };
    };
    qmService.configureLineChart = function(data, variableObject) {
        if(!variableObject.name){
            if(variableObject.variableName){
                variableObject.name = variableObject.variableName;
            } else {
                qmService.logError("ERROR: No variable name provided to configureLineChart");
                return;
            }
        }
        if(data.length < 1){
            qmService.logError("ERROR: No data provided to configureLineChart");
            return;
        }
        var date = new Date();
        var timezoneOffsetHours = (date.getTimezoneOffset())/60;
        var timezoneOffsetMilliseconds = timezoneOffsetHours*60*60*1000; // minutes, seconds, milliseconds
        var minimumTimeEpochMilliseconds, maximumTimeEpochMilliseconds, i;
        var numberOfMeasurements = data.length;
        if(numberOfMeasurements < 1000){
            data = data.sort(function(a, b){return a.x - b.x;});
            for (i = 0; i < numberOfMeasurements; i++) {data[i].x = data[i].x - timezoneOffsetMilliseconds;}
            minimumTimeEpochMilliseconds = data[0].x - timezoneOffsetMilliseconds;
            maximumTimeEpochMilliseconds = data[data.length-1].x - timezoneOffsetMilliseconds;
        } else {
            data = data.sort(function(a, b){return a[0] - b[0];});
            for (i = 0; i < numberOfMeasurements; i++) {data[i][0] = data[i][0] - timezoneOffsetMilliseconds;}
            minimumTimeEpochMilliseconds = data[0][0] - timezoneOffsetMilliseconds;
            maximumTimeEpochMilliseconds = data[data.length-1][0] - timezoneOffsetMilliseconds;
        }
        var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;
        if(millisecondsBetweenLatestAndEarliest < 86400*1000){
            console.warn('Need at least a day worth of data for line chart');
            return;
        }
        var chartConfig = {
            useHighStocks: true,
            //turboThreshold: 0, // DOESN'T SEEM TO WORK -Disables 1000 data point limitation http://api.highcharts.com/highcharts/plotOptions.series.turboThreshold
            tooltip: {
                shared: true,
                formatter: function(){
                    var value = this;
                    var string = '';
                    if(numberOfMeasurements < 1000) {
                        string += '<h3><b>' + moment(value.x).format("h A, dddd, MMM Do YYYY") + '<b></h3><br/>';
                    } else {
                        string += '<h3><b>' + moment(value.x).format("MMM Do YYYY") + '<b></h3><br/>';
                    }
                    angular.forEach(value.points,function(point){
                        //string += '<span>' + point.series.name + ':</span> ';
                        string += '<span>' + (point.point.y + variableObject.unitAbbreviatedName).replace(' /', '/') + '</span>';
                        string += '<br/>';
                        if(value.points["0"].point.name){
                            string += '<span>' + value.points["0"].point.name + '</span>';
                            string += '<br/>';
                        }
                    });
                    return string;
                },
                useHtml: true
            },
            legend : {enabled : false},
            xAxis : {
                type: 'datetime',
                dateTimeLabelFormats : {
                    millisecond : '%I:%M %p',
                    second : '%I:%M %p',
                    minute: '%I:%M %p',
                    hour: '%I %p',
                    day: '%e. %b',
                    week: '%e. %b',
                    month: '%b \'%y',
                    year: '%Y'
                },
                min: minimumTimeEpochMilliseconds,
                max: maximumTimeEpochMilliseconds
            },
            credits: {enabled: false},
            rangeSelector: {enabled: true},
            navigator: {
                enabled: true,
                xAxis: {
                    type : 'datetime',
                    dateTimeLabelFormats : {
                        millisecond : '%I:%M %p',
                        second : '%I:%M %p',
                        minute: '%I:%M %p',
                        hour: '%I %p',
                        day: '%e. %b',
                        week: '%e. %b',
                        month: '%b \'%y',
                        year: '%Y'
                    }
                }
            },
            title: {text: variableObject.name + ' Over Time (' + variableObject.unitAbbreviatedName + ')'},
            series :[{
                name : variableObject.name + ' Over Time',
                data : data,
                tooltip: {valueDecimals: 2}
            }]
        };
        var doNotConnectPoints = variableObject.userVariableDefaultUnitCategoryName !== 'Rating';
        if(doNotConnectPoints){
            chartConfig.series.marker = {enabled: true, radius: 2};
            chartConfig.series.lineWidth = 0;
            chartConfig.series.states = {hover: {lineWidthPlus: 0}};
        }
        return setChartExportingOptions(chartConfig);
    };
    // VARIABLE SERVICE
    // get user variables (without public)
    qmService.searchUserVariablesDeferred = function(variableSearchQuery, params){
        var deferred = $q.defer();
        if(!variableSearchQuery){ variableSearchQuery = '*'; }
        qmService.searchUserVariablesFromApi(variableSearchQuery, params, function(variables){
            deferred.resolve(variables);
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    function doWeHaveEnoughVariables(variables){
        var numberOfMatchingLocalVariablesRequiredToSkipAPIRequest = 2;
        return variables && variables.length > numberOfMatchingLocalVariablesRequiredToSkipAPIRequest;  //Do API search if only 1 local result because I can't get "Remeron" because I have "Remeron Powder" locally
    }
    function doWeHaveExactMatch(variables, variableSearchQuery){
        return qmService.arrayHasItemWithNameProperty(variables) && variables[0].name.toLowerCase() === variableSearchQuery.toLowerCase(); // No need for API request if we have exact match
    }
    function shouldWeMakeVariablesSearchAPIRequest(variables, variableSearchQuery){
        var haveEnough = doWeHaveEnoughVariables(variables);
        var exactMatch = doWeHaveExactMatch(variables, variableSearchQuery);
        return !haveEnough && !exactMatch;
    }
    // get user variables (without public)
    qmService.searchVariablesIncludingLocalDeferred = function(variableSearchQuery, params){
        var deferred = $q.defer();
        var variables = qmService.searchLocalStorage('userVariables', 'name', variableSearchQuery, params);
        if(params.includePublic){
            if(!variables){variables = [];}
            var commonVariables = qmService.searchLocalStorage('commonVariables', 'name', variableSearchQuery, params);
            variables = variables.concat(commonVariables);
        }
        if(!shouldWeMakeVariablesSearchAPIRequest(variables, variableSearchQuery)) {
            deferred.resolve(variables);
            return deferred.promise;
        }
        if(!variableSearchQuery){ variableSearchQuery = '*'; }
        qmService.searchUserVariablesFromApi(variableSearchQuery, params, function(variables){
            deferred.resolve(variables);
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.refreshUserVariableByNameDeferred = function (variableName) {
        var deferred = $q.defer();
        var params = {includeTags : true};
        qmService.getVariablesByNameFromApi(variableName, params, function(variable){
            deferred.resolve(variable);
        }, function(error){ deferred.reject(error); });
        return deferred.promise;
    };
    qmService.getVariablesFromLocalStorage = function(requestParams){
        var variables;
        if(!variables){ variables = JSON.parse(qmService.getLocalStorageItemAsString('userVariables')); }
        if(requestParams.includePublic){
            if(!variables){variables = [];}
            var commonVariables = JSON.parse(qmService.getLocalStorageItemAsString('commonVariables'));
            if(commonVariables && commonVariables.constructor === Array){
                variables = variables.concat(commonVariables);
            } else {
                qmService.reportErrorDeferred("commonVariables from localStorage is not an array!  commonVariables.json didn't load for some reason!");
                //putCommonVariablesInLocalStorageUsingJsonFile();
                putCommonVariablesInLocalStorageUsingApi();
            }
        }
        variables = qmService.removeArrayElementsWithDuplicateIds(variables);
        if(requestParams && requestParams.sort){variables = qmService.sortByProperty(variables, requestParams.sort);}
        //variables = addVariableCategoryInfo(variables);
        return variables;
    };
    qmService.getUserVariableByNameFromLocalStorageOrApiDeferred = function(name, params, refresh){
        var deferred = $q.defer();
        qmService.getLocalStorageItemAsStringWithCallback('userVariables', function (userVariables) {
            if(!refresh && userVariables){
                userVariables = JSON.parse(userVariables);
                for(var i = 0; i < userVariables.length; i++){
                    if(userVariables[i].name === name){
                        deferred.resolve(userVariables[i]);
                        return;
                    }
                }
            }
            qmService.getVariablesByNameFromApi(name, params, function(variable){
                qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', variable);
                deferred.resolve(variable);
            }, function(error){ deferred.reject(error); });
        });
        return deferred.promise;
    };
    qmService.addWikipediaExtractAndThumbnail = function(variableObject){
        qmService.getWikipediaArticle(variableObject.name).then(function (page) {
            if(page){
                variableObject.wikipediaExtract = page.extract;
                if(page.thumbnail){ variableObject.imageUrl = page.thumbnail; }
            }
        });
    };
    // post changes to user variable settings
    qmService.postUserVariableDeferred = function(body) {
        var deferred = $q.defer();
        qmService.postUserVariableToApi(body, function(response) {
            var userVariable;
            if(response.userVariables){userVariable = response.userVariables[0];}
            if(response.userVariable){userVariable = response.userVariable;}
            qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', userVariable);
            qmService.deleteItemFromLocalStorage('lastStudy');
            $rootScope.variableObject = userVariable;
            //qmService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
            qmService.logDebug("qmService.postUserVariableDeferred: success: " + JSON.stringify(userVariable));
            deferred.resolve(userVariable);
        }, function(error){ deferred.reject(error); });
        return deferred.promise;
    };
    qmService.resetUserVariableDeferred = function(variableId) {
        var deferred = $q.defer();
        var body = {variableId: variableId};
        qmService.resetUserVariable(body, function(response) {
            qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariable);
            deferred.resolve(response.data.userVariable);
        }, function(error){  deferred.reject(error); });
        return deferred.promise;
    };
    qmService.getVariableByIdDeferred = function(variableId){
        var deferred = $q.defer();
        // refresh always
        qmService.getVariableByIdFromApi(variableId, function(variable){
            deferred.resolve(variable);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.deleteAllMeasurementsForVariableDeferred = function(variableId) {
        var deferred = $q.defer();
        qmService.deleteUserVariableMeasurements(variableId, function() {
            // Delete user variable from local storage
            qmService.deleteElementOfLocalStorageItemById('userVariables', variableId);
            deferred.resolve();
        }, function(error) {
            qmService.logError(error);
            qmService.logError('Error deleting all measurements for variable: ', error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    qmService.getUserVariablesFromLocalStorageOrApiDeferred = function(params){
        var deferred = $q.defer();
        var userVariables = qmService.getElementsFromLocalStorageItemWithRequestParams('userVariables', params);
        if(userVariables && userVariables.length){
            deferred.resolve(userVariables);
            return deferred.promise;
        }
        if(qmService.getLocalStorageItemAsString('userVariables') === "[]"){
            deferred.resolve([]);
            return deferred.promise;
        }
        userVariables = JSON.parse(qmService.getLocalStorageItemAsString('userVariables'));
        if(userVariables && userVariables.length){
            qmService.logDebug("We already have userVariables that didn't match filters so no need to refresh them");
            deferred.resolve([]);
            return deferred.promise;
        }
        qmService.refreshUserVariables().then(function () {
            userVariables = qmService.getElementsFromLocalStorageItemWithRequestParams('userVariables', params);
            deferred.resolve(userVariables);
        }, function (error) {deferred.reject(error);});
        return deferred.promise;
    };
    qmService.refreshUserVariables = function(){
        var deferred = $q.defer();
        qmService.getUserVariablesFromApi({limit: 200, sort: "-latestMeasurementTime"}, function(userVariables){
            qmService.setLocalStorageItem('userVariables', JSON.stringify(userVariables));
            deferred.resolve(userVariables);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    qmService.getCommonVariablesDeferred = function(params){
        var deferred = $q.defer();
        var commonVariables = qmService.getElementsFromLocalStorageItemWithRequestParams('commonVariables', params);
        if(!commonVariables || !commonVariables.length){
            //putCommonVariablesInLocalStorageUsingJsonFile().then(function (commonVariables) {deferred.resolve(commonVariables);});
            putCommonVariablesInLocalStorageUsingApi().then(function (commonVariables) {deferred.resolve(commonVariables);});
        } else {
            deferred.resolve(commonVariables);
        }
        return deferred.promise;
    };
    function putCommonVariablesInLocalStorageUsingJsonFile(){
        var deferred = $q.defer();
        $http.get('data/commonVariables.json').success(function(commonVariables) { // Generated in `gulp configureAppAfterNpmInstall` with `gulp getCommonVariables`
            if(commonVariables.constructor !== Array){
                qmService.reportErrorDeferred('commonVariables.json is not present!');
                deferred.reject('commonVariables.json is not present!');
            } else {
                qmService.setLocalStorageItem('commonVariables', JSON.stringify(commonVariables));
                deferred.resolve(commonVariables);
            }
        });
        return deferred.promise;
    }
    function putCommonVariablesInLocalStorageUsingApi(){
        var deferred = $q.defer();
        qmService.getCommonVariablesFromApi({}, function(commonVariables){
            qmService.setLocalStorageItem('commonVariables', JSON.stringify(commonVariables));
            deferred.resolve(commonVariables);
        }, function(error){
            qmService.logError(error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
    // NOTIFICATION SERVICE
    function createChromeAlarmNameFromTrackingReminder(trackingReminder) {
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
    }
    function localNotificationsPluginInstalled() {
        var installed = true;
        if(typeof cordova === "undefined"){
            qmService.logInfo("cordova undefined");
            installed = false;
        } else if (typeof cordova.plugins === "undefined"){
            qmService.logInfo("cordova.plugins undefined");
            installed = false;
        } else if (typeof cordova.plugins.notification === "undefined"){
            qmService.logInfo("cordova.plugins.notification undefined");
            installed = false;
        }
        qmService.logInfo("localNotificationsPluginInstalled: " + installed);
        return installed;
    }
    qmService.shouldWeUseIonicLocalNotifications = function(){
        return $rootScope.isAndroid;
        return localNotificationsPluginInstalled();
        $ionicPlatform.ready(function () {
            qmService.logInfo('$ionicPlatform.ready');
            if($rootScope.isAndroid){config.appSettings.appDesign.cordovaLocalNotificationsEnabled = true;}
            qmService.logInfo('config.appSettings.appDesign.cordovaLocalNotificationsEnabled is ' + config.appSettings.appDesign.cordovaLocalNotificationsEnabled);
            if (!config.appSettings.appDesign.cordovaLocalNotificationsEnabled){
                if(localNotificationsPluginInstalled()){
                    cordova.plugins.notification.local.cancelAll(function () {
                        qmService.logInfo('cancelAllNotifications: notifications have been cancelled');
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            qmService.logInfo("cancelAllNotifications: All notifications after cancelling", notifications);
                        });
                    })
                }
                qmService.logInfo('cordova.plugins.notification disabled');
                return false;
            }
            qmService.logInfo('cordova.plugins.notification enabled');
            return true;
        });
    };
    qmService.setOnUpdateActionForLocalNotifications = function(){
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        cordova.plugins.notification.local.on("update", function(notification) {
            qmService.logDebug("onUpdate: Just updated this notification: ", notification);
            cordova.plugins.notification.local.getAll(function (notifications) {
                qmService.logDebug("onUpdate: All notifications after update: ", notifications);
            });
        });
        deferred.resolve();
        return deferred.promise;
    };
    qmService.setOnClickActionForLocalNotifications = function(qmService) {
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        var params = {};
        var locationTrackingNotificationId = 666;
        cordova.plugins.notification.local.on("click", function (notification) {
            qmService.logDebug("onClick: notification: ", notification);
            var notificationData = null;
            if(notification && notification.data){
                notificationData = JSON.parse(notification.data);
                qmService.logDebug("onClick: notification.data : ", notificationData);
            } else {qmService.logDebug("onClick: No notification.data provided");}
            if(notification.id !== locationTrackingNotificationId){
                /** @namespace cordova.plugins.notification */
                cordova.plugins.notification.local.clearAll(function () {qmService.logDebug("onClick: clearAll active notifications");}, this);
            }
            if(notificationData && notificationData.trackingReminderNotificationId){
                qmService.logDebug("onClick: Notification was a reminder notification not reminder.  " +
                    "Skipping notification with id: " + notificationData.trackingReminderNotificationId);
                params = {trackingReminderNotificationId: notificationData.trackingReminderNotificationId};
            } else if (notificationData && notificationData.id) {
                qmService.logDebug("onClick: Notification was a reminder not a reminder notification.  " +
                    "Skipping next notification for reminder id: " + notificationData.id);
                params = {trackingReminderId: notificationData.id};
            } else {
                qmService.logDebug("onClick: No notification data provided. Going to remindersInbox page.");
                qmService.goToState('app.remindersInbox');
            }
            if(params.trackingReminderId || params.trackingReminderNotificationId ){
                qmService.skipTrackingReminderNotification(params, function(response){
                    qmService.logDebug(response);
                }, function(error){
                    qmService.logError(error);
                });
                qmService.logDebug("onClick: Notification data provided. Going to addMeasurement page. Data: ", notificationData);
                //qmService.decrementNotificationBadges();
                qmService.goToState('app.measurementAdd', {reminderNotification: notificationData, fromState: 'app.remindersInbox'});
            } else {
                qmService.logDebug("onClick: No params.trackingReminderId || params.trackingReminderNotificationId. " +
                    "Should have already gone to remindersInbox page.");
            }
        });
        deferred.resolve();
        return deferred.promise;
    };
    qmService.updateBadgesAndTextOnAllNotifications = function () {
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isIOS){
            console.warn("updateBadgesAndTextOnAllNotifications: updating notifications on iOS might make duplicates");
            //return;
        }
        $ionicPlatform.ready(function () {
            if(!$rootScope.numberOfPendingNotifications){$rootScope.numberOfPendingNotifications = 0;}
            cordova.plugins.notification.local.getAll(function (notifications) {
                qmService.logDebug("onTrigger.updateBadgesAndTextOnAllNotifications: " + "All notifications ", notifications);
                for (var i = 0; i < notifications.length; i++) {
                    if(notifications[i].badge === $rootScope.numberOfPendingNotifications){
                        console.warn("updateBadgesAndTextOnAllNotifications: Not updating notification because $rootScope.numberOfPendingNotifications" +
                            " === notifications[i].badge", notifications[i]);
                        continue;
                    }
                    qmService.logDebug('onTrigger.updateBadgesAndTextOnAllNotifications' + ':Updating notification', notifications[i]);
                    var notificationSettings = {
                        id: notifications[i].id,
                        badge: $rootScope.numberOfPendingNotifications,
                        title: "Time to track!",
                        text: "Add a tracking reminder!"
                    };
                    if($rootScope.numberOfPendingNotifications > 0){
                        notificationSettings.text = $rootScope.numberOfPendingNotifications + " tracking reminder notifications";
                    }
                    cordova.plugins.notification.local.update(notificationSettings);
                }
                deferred.resolve();
            });
        });
        return deferred.promise;
    };
    qmService.setOnTriggerActionForLocalNotifications = function() {
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        function getNotificationsFromApiAndClearOrUpdateLocalNotifications() {
            var currentDateTimeInUtcStringPlus5Min = qmService.getCurrentDateTimeInUtcStringPlusMin(5);
            var params = {reminderTime: '(lt)' + currentDateTimeInUtcStringPlus5Min};
            qmService.getTrackingReminderNotificationsFromApi(params, function (response) {
                if (response.success) {
                    if(response.data.length > 1){
                        var trackingReminderNotifications = putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data);
                    }
                    /** @namespace window.chrome */
                    /** @namespace window.chrome.browserAction */
                    if (window.chrome && window.chrome.browserAction) {
                        chrome.browserAction.setBadgeText({text: "?"});
                        //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
                    }
                    if (!$rootScope.numberOfPendingNotifications) {
                        if(!qmService.shouldWeUseIonicLocalNotifications()) {return;}
                        qmService.logDebug("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: No notifications from API so clearAll active notifications");
                        cordova.plugins.notification.local.clearAll(function () {
                            qmService.logDebug("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: cleared all active notifications");
                        }, this);
                    } else {$rootScope.updateOrRecreateNotifications();}
                }
            }, function(error) {
                qmService.logError(error);
            });
        }
        function clearOtherLocalNotifications(currentNotification) {
            qmService.logDebug("onTrigger.clearOtherLocalNotifications: Clearing notifications except the one " +
                "that just triggered...");
            $ionicPlatform.ready(function () {
                cordova.plugins.notification.local.getTriggeredIds(function (triggeredNotifications) {
                    qmService.logDebug("onTrigger.clearOtherLocalNotifications: found triggered notifications " +
                        "before removing current one: " + JSON.stringify(triggeredNotifications));
                    if (triggeredNotifications.length < 1) {
                        console.warn("onTrigger.clearOtherLocalNotifications: Triggered notifications is " +
                            "empty so maybe it's not working.");
                    } else {
                        triggeredNotifications.splice(triggeredNotifications.indexOf(currentNotification.id), 1);
                        qmService.logDebug("onTrigger.clearOtherLocalNotifications: found triggered notifications " +
                            "after removing current one: " + JSON.stringify(triggeredNotifications));
                        cordova.plugins.notification.local.clear(triggeredNotifications);
                    }
                });
            });
        }
        function clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification) {
            qmService.logDebug("onTrigger.clearNotificationIfOutsideAllowedTimes: Checking notification time limits",
                currentNotification);
            if (notificationData.reminderFrequency < 86400) {
                var currentTimeInLocalString = qmService.getCurrentTimeInLocalString();
                var reminderStartTimeInLocalString = qmService.getLocalTimeStringFromUtcString(notificationData.reminderStartTime);
                var reminderEndTimeInLocalString = qmService.getLocalTimeStringFromUtcString(notificationData.reminderEndTime);
                if (currentTimeInLocalString < reminderStartTimeInLocalString) {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.clear(currentNotification.id, function (currentNotification) {
                            qmService.logDebug("onTrigger: Cleared notification because current time " +
                                currentTimeInLocalString + " is before reminder start time" + reminderStartTimeInLocalString, currentNotification);
                        });
                    });
                }
                if (currentTimeInLocalString > reminderEndTimeInLocalString) {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.clear(currentNotification.id, function (currentNotification) {
                            qmService.logDebug("onTrigger: Cleared notification because current time " +
                                currentTimeInLocalString + " is before reminder start time" + reminderStartTimeInLocalString, currentNotification);
                        });
                    });
                }
            }
        }
        cordova.plugins.notification.local.on("trigger", function (currentNotification) {
            qmService.logInfo("onTrigger: just triggered this notification: " + JSON.stringify(currentNotification));
            /*                   I don't think this is necessary because we're going to check the API anyway
             if(currentNotification.badge < 1){
             $ionicPlatform.ready(function () {
             cordova.plugins.notification.local.clearAll(function () {
             console.warn("onTrigger: Cleared all notifications because badge is less than 1");
             });
             });
             return;
             }
             */
            try {
                qmService.updateLocationVariablesAndPostMeasurementIfChanged();
                var notificationData = null;
                if(currentNotification && currentNotification.data){
                    notificationData = JSON.parse(currentNotification.data);
                    qmService.logDebug("onTrigger: notification.data : ", notificationData);
                    clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification);
                } else {qmService.logDebug("onTrigger: No notification.data provided");}
                if(!notificationData){
                    qmService.logDebug("onTrigger: This is a generic notification that sends to inbox, so we'll check the API for pending notifications.");
                    getNotificationsFromApiAndClearOrUpdateLocalNotifications();
                }
                clearOtherLocalNotifications(currentNotification);
            } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                qmService.logError('onTrigger error');
                if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
            }
        });
        deferred.resolve();
        return deferred.promise;
    };
    qmService.decrementNotificationBadges = function(){
        if($rootScope.numberOfPendingNotifications > 0){
            if (window.chrome && window.chrome.browserAction) {
                //noinspection JSUnresolvedFunction
                chrome.browserAction.setBadgeText({text: "?"});
                //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
            }
            this.updateOrRecreateNotifications();
        }
    };
    qmService.setNotificationBadge = function(numberOfPendingNotifications){
        qmService.logDebug("setNotificationBadge: numberOfPendingNotifications is " + numberOfPendingNotifications);
        $rootScope.numberOfPendingNotifications = numberOfPendingNotifications;
        if (window.chrome && window.chrome.browserAction) {
            chrome.browserAction.setBadgeText({text: "?"});
            //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
        }
        this.updateOrRecreateNotifications();
    };
    qmService.updateOrRecreateNotifications = function() {
        qmService.logInfo("updateOrRecreateNotifications");
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isAndroid){
            qmService.logDebug("updateOrRecreateNotifications: Updating notifications for Android because Samsung limits number of notifications " +
                "that can be scheduled in a day.");
            this.updateBadgesAndTextOnAllNotifications();
            deferred.resolve();
        }
        if($rootScope.isIOS){
            console.warn('updateOrRecreateNotifications: Updating local notifications on iOS might ' +
                'make duplicates and we cannot recreate here because we will lose the previously set interval');
            this.updateBadgesAndTextOnAllNotifications();
            deferred.resolve();
            //qmService.logDebug("updateOrRecreateNotifications: iOS makes duplicates when updating for some reason so we just cancel all and schedule again");
            //this.scheduleGenericNotification(notificationSettings);
        }
        return deferred.promise;
    };
    function getMostFrequentReminderIntervalInMinutes(trackingRemindersFromApi){
        if(!trackingRemindersFromApi){
            trackingRemindersFromApi = JSON.parse(localStorage.getItem('trackingReminders'));
        }
        var shortestInterval = 86400;
        if(trackingRemindersFromApi){
            for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                if(trackingRemindersFromApi[i].reminderFrequency < shortestInterval){
                    shortestInterval = trackingRemindersFromApi[i].reminderFrequency;
                }
            }
        }
        return shortestInterval/60;
    }

    qmService.scheduleSingleMostFrequentLocalNotification = function(trackingRemindersFromApi) {
        if(!$rootScope.user){
            qmService.logDebug("No user for scheduleSingleMostFrequentLocalNotification");
            return;
        }
        if(!$rootScope.isMobile && !$rootScope.isChromeExtension){
            qmService.logDebug("Can only schedule notification on mobile or Chrome extension");
            return;
        }
        qmService.logInfo("scheduleSingleMostFrequentLocalNotification");
        if($rootScope.user.combineNotifications === false){
            qmService.logDebug("scheduleSingleMostFrequentLocalNotification: $rootScope.user.combineNotifications === false so we shouldn't be calling this function");
            //return;
        }
        var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
        if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
            var mostFrequentIntervalInMinutes = getMostFrequentReminderIntervalInMinutes(trackingRemindersFromApi);
            if(trackingRemindersFromApi){
                for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                    if(trackingRemindersFromApi[i].reminderFrequency === mostFrequentIntervalInMinutes * 60){
                        at.setUTCSeconds(trackingRemindersFromApi[i].nextReminderTimeEpochSeconds);
                    }
                }
            }
            var notificationSettings = {every: mostFrequentIntervalInMinutes, at: at};
            var previousSettings = qmService.getLocalStorageItemAsObject('previousSingleNotificationSettings');
            if(previousSettings && notificationSettings === previousSettings){
                qmService.logInfo("scheduleSingleMostFrequentLocalNotification: Notification settings haven't changed so no need to scheduleGenericNotification", notificationSettings);
                return;
            }
            qmService.logInfo("scheduleSingleMostFrequentLocalNotification: Going to schedule generic notification", notificationSettings);
            qmService.setLocalStorageItem('previousSingleNotificationSettings', notificationSettings);
            this.scheduleGenericNotification(notificationSettings);
        }
    };
    qmService.scheduleAllNotificationsByTrackingReminders = function(trackingRemindersFromApi) {
        qmService.logInfo("scheduleAllNotificationsByTrackingReminders");
        if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
            for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                if($rootScope.user.combineNotifications === false){
                    try {this.scheduleNotificationByReminder(trackingRemindersFromApi[i]);
                    } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                        qmService.logError('scheduleAllNotificationsByTrackingReminders error');
                    }
                }
            }
            this.cancelNotificationsForDeletedReminders(trackingRemindersFromApi);
        }
    };
    qmService.cancelNotificationsForDeletedReminders = function(trackingRemindersFromApi) {
        var deferred = $q.defer();
        function cancelChromeExtensionNotificationsForDeletedReminders(trackingRemindersFromApi) {
            /** @namespace chrome.alarms */
            chrome.alarms.getAll(function(scheduledTrackingReminders) {
                for (var i = 0; i < scheduledTrackingReminders.length; i++) {
                    var existingReminderFoundInApiResponse = false;
                    for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                        var alarmName = createChromeAlarmNameFromTrackingReminder(trackingRemindersFromApi[j]);
                        if (JSON.stringify(alarmName) === scheduledTrackingReminders[i].name) {
                            qmService.logDebug('Server has a reminder matching alarm ' + JSON.stringify(scheduledTrackingReminders[i]));
                            existingReminderFoundInApiResponse = true;
                        }
                    }
                    if(!existingReminderFoundInApiResponse) {
                        qmService.logDebug('No api reminder found matching so cancelling this alarm ', JSON.stringify(scheduledTrackingReminders[i]));
                        chrome.alarms.clear(scheduledTrackingReminders[i].name);
                    }
                }
            });
        }
        function cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi) {
            if(!qmService.shouldWeUseIonicLocalNotifications()) {return;}
            cordova.plugins.notification.local.getAll(function (scheduledNotifications) {
                qmService.logDebug("cancelIonicNotificationsForDeletedReminders: notification.local.getAll " +
                    "scheduledNotifications: ",
                    scheduledNotifications);
                for (var i = 0; i < scheduledNotifications.length; i++) {
                    var existingReminderFoundInApiResponse = false;
                    for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                        /** @namespace scheduledNotifications[i].id */
                        if (trackingRemindersFromApi[j].id === scheduledNotifications[i].id) {
                            qmService.logDebug('Server returned a reminder matching' + trackingRemindersFromApi[j]);
                            existingReminderFoundInApiResponse = true;
                        }
                    }
                    if(!existingReminderFoundInApiResponse) {
                        qmService.logDebug('Matching API reminder not found. Cancelling scheduled notification ' + JSON.stringify(scheduledNotifications[i]));
                        cordova.plugins.notification.local.cancel(scheduledNotifications[i].id, function (cancelledNotification) {
                            qmService.logDebug("Canceled notification ", cancelledNotification);
                        });
                    }
                }
            });
        }
        if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
            cancelChromeExtensionNotificationsForDeletedReminders(trackingRemindersFromApi);
        }
        $ionicPlatform.ready(function () {
            if (typeof cordova !== "undefined") {
                qmService.logDebug('cancelIonicNotificationsForDeletedReminders');
                cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi);
            }
            deferred.resolve();
        });
        return deferred.promise;
    };
    qmService.scheduleNotificationByReminder = function(trackingReminder){
        if($rootScope.user.combineNotifications === true){
            console.warn("Not going to scheduleNotificationByReminder because $rootScope.user.combineNotifications === true");
            return;
        }
        if(!$rootScope.user.earliestReminderTime){
            qmService.logError("Cannot schedule notifications because $rootScope.user.earliestReminderTime not set",
                $rootScope.user);
            return;
        }
        if(!$rootScope.user.latestReminderTime){
            qmService.logError("Cannot schedule notifications because $rootScope.user.latestReminderTime not set",
                $rootScope.user);
            return;
        }
        function createOrUpdateIonicNotificationForTrackingReminder(notificationSettings) {
            var deferred = $q.defer();
            if(!qmService.shouldWeUseIonicLocalNotifications()) {
                deferred.resolve();
                return deferred.promise;
            }
            cordova.plugins.notification.local.isPresent(notificationSettings.id, function (present) {
                if (!present) {
                    qmService.logDebug("createOrUpdateIonicNotificationForTrackingReminder: Creating notification " +
                        "because not already set for " + JSON.stringify(notificationSettings));
                    cordova.plugins.notification.local.schedule(notificationSettings,
                        function () {
                            qmService.logDebug('createOrUpdateIonicNotificationForTrackingReminder: notification ' + 'scheduled', notificationSettings);
                        });
                }
                if (present) {
                    qmService.logDebug('createOrUpdateIonicNotificationForTrackingReminder: Updating notification', notificationSettings);
                    cordova.plugins.notification.local.update(notificationSettings,
                        function () {
                            qmService.logDebug('createOrUpdateIonicNotificationForTrackingReminder: ' + 'notification updated', notificationSettings);
                        });
                }
                deferred.resolve();
            });
            return deferred.promise;
        }
        function scheduleAndroidNotificationByTrackingReminder(trackingReminder) {
            var notificationSettings = {
                autoClear: true,
                color: undefined,
                data: trackingReminder,
                led: undefined,
                sound: "file://sound/silent.ogg",
                ongoing: false,
                title: "Track " + trackingReminder.variableName,
                text: "Tap to record measurement",
                icon: 'ic_stat_icon_bw',
                id: trackingReminder.id
            };
            if($rootScope.numberOfPendingNotifications){
                notificationSettings.badge = 1; // Less stressful
                //notificationSettings.badge = $rootScope.numberOfPendingNotifications;
            }
            var dayInMinutes = 24 * 60;
            notificationSettings.every = dayInMinutes;
            qmService.logDebug("Trying to create Android notification for " + JSON.stringify(notificationSettings));
            //notificationSettings.sound = "res://platform_default";
            //notificationSettings.smallIcon = 'ic_stat_icon_bw';
            var totalSeconds = 0;
            var at;
            while (totalSeconds < 86400) {
                at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                at.setUTCSeconds(trackingReminder.nextReminderTimeEpochSeconds + totalSeconds);
                notificationSettings.at = at;
                notificationSettings.id = parseInt(trackingReminder.id + "000" +  moment(at).format("HHMMSS"));
                totalSeconds = totalSeconds + trackingReminder.reminderFrequency;
                if(moment(at).format("HH:MM:SS") < $rootScope.user.latestReminderTime &&
                    moment(at).format("HH:MM:SS") > $rootScope.user.earliestReminderTime ){
                    qmService.logDebug("Scheduling notification because it is within time limits: " +
                        $rootScope.user.earliestReminderTime + " to " + $rootScope.user.latestReminderTime,
                        notificationSettings);
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                } else {
                    qmService.logDebug("NOT scheduling notification because it is outside time limits: " +
                        $rootScope.user.earliestReminderTime + " to " + $rootScope.user.latestReminderTime, notificationSettings);
                }
            }
        }
        function scheduleIosNotificationByTrackingReminder(trackingReminder) {
            // Using milliseconds might cause app to crash with this error:
            // NSInvalidArgumentException·unable to serialize userInfo: Error Domain=NSCocoaErrorDomain Code=3851 "Property list invalid for format: 200 (property lists cannot contain objects of type 'CFNull')" UserInfo={NSDeb
            var intervalInMinutes  = trackingReminder.reminderFrequency / 60;
            var everyString = 'day';
            if (intervalInMinutes === 1) {everyString = 'minute';}
            var numberOfPendingNotifications = 0;
            if($rootScope.numberOfPendingNotifications){
                numberOfPendingNotifications = $rootScope.numberOfPendingNotifications;
            }
            var notificationSettings = {
                //autoClear: true,  iOS doesn't recognize this property
                badge: 1, // Reduces user stress
                //badge: numberOfPendingNotifications,
                //color: undefined,  iOS doesn't recognize this property
                data: trackingReminder,
                //led: undefined,  iOS doesn't recognize this property
                //ongoing: false,  iOS doesn't recognize this property
                sound: "file://sound/silent.ogg",
                title: "Track " + trackingReminder.variableName,
                text: "Record a measurement",
                //ionIcon: config.appSettings.mobileNotificationImage,  iOS doesn't recognize this property
                id: trackingReminder.id
            };
            notificationSettings.every = everyString;
            //notificationSettings.sound = "res://platform_default";
            //notificationSettings.smallIcon = 'ic_stat_icon_bw';
            var totalSeconds = 0;
            var at;
            while (totalSeconds < 86400) {
                qmService.logDebug("iOS requires second, minute, hour, day, week, month, year so converting " +
                    intervalInMinutes + " minutes to string: " + everyString);
                at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                at.setUTCSeconds(trackingReminder.nextReminderTimeEpochSeconds + totalSeconds);
                notificationSettings.at = at;
                notificationSettings.id = parseInt(trackingReminder.id + "000" +  moment(at).format("HHMMSS"));
                totalSeconds = totalSeconds + trackingReminder.reminderFrequency;
                if(moment(at).format("HH:MM:SS") < $rootScope.user.latestReminderTime &&
                    moment(at).format("HH:MM:SS") > $rootScope.user.earliestReminderTime ){
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                } else {
                    qmService.logDebug("Not scheduling notification because it's outside time limits", notificationSettings);
                }
            }
        }
        function scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder) {
            var alarmInfo = {};
            alarmInfo.when =  trackingReminder.nextReminderTimeEpochSeconds * 1000;
            alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
            var alarmName = createChromeAlarmNameFromTrackingReminder(trackingReminder);
            alarmName = JSON.stringify(alarmName);
            chrome.alarms.getAll(function(alarms) {
                var hasAlarm = alarms.some(function(oneAlarm) {return oneAlarm.name === alarmName;});
                if (hasAlarm) {qmService.logDebug('Already have an alarm for ' + alarmName);}
                if (!hasAlarm) {
                    chrome.alarms.create(alarmName, alarmInfo);
                    qmService.logDebug('Created alarm for alarmName ' + alarmName, alarmInfo);
                }
            });
        }
        if(trackingReminder.reminderFrequency > 0){
            $ionicPlatform.ready(function () {
                //qmService.logDebug('Ionic is ready to schedule notifications');
                if (typeof cordova !== "undefined") {
                    cordova.plugins.notification.local.getAll(function (notifications) {
                        qmService.logDebug("scheduleNotificationByReminder: All notifications before scheduling", notifications);
                        for(var i = 0; i < notifications.length; i++){
                            if(notifications[i].every * 60 === trackingReminder.reminderFrequency &&
                                notifications[i].id === trackingReminder.id){
                                console.warn("already have a local notification with this trackingReminder's id " +
                                    "and frequency.  Might be" +
                                    " pointlessly rescheduling", trackingReminder);
                            }
                        }
                        if (ionic.Platform.isAndroid()) {scheduleAndroidNotificationByTrackingReminder(trackingReminder);
                        } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {scheduleIosNotificationByTrackingReminder(trackingReminder);}
                    });
                }
            });
            if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder);}
        }
    };
    qmService.scheduleGenericNotification = function(notificationSettings){
        var deferred = $q.defer();
        if(!notificationSettings.every){
            qmService.logError("scheduleGenericNotification: Called scheduleGenericNotification without providing notificationSettings.every " +
                notificationSettings.every + ". Not going to scheduleGenericNotification.");
            deferred.reject();
            return deferred.promise;
        }
        if(!notificationSettings.at){
            var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
            var epochSecondsPlus15Minutes = new Date() / 1000 + 15 * 60;
            at.setUTCSeconds(epochSecondsPlus15Minutes);
            notificationSettings.at = at;
        }
        if(!notificationSettings.id){notificationSettings.id = qmService.getPrimaryOutcomeVariable().id;}
        notificationSettings.title = "How are you?";
        notificationSettings.text = "Open reminder inbox";
        if($rootScope.isIOS){notificationSettings.sound = "file://sound/silent.ogg";}
        if($rootScope.isAndroid){notificationSettings.sound = null;}
        notificationSettings.badge = 0;
        if($rootScope.numberOfPendingNotifications > 0) {
            //notificationSettings.text = $rootScope.numberOfPendingNotifications + " tracking reminder notifications";
            notificationSettings.badge = 1; // Less stressful
            //notificationSettings.badge = $rootScope.numberOfPendingNotifications;
        }
        if($rootScope.isAndroid){notificationSettings.icon = 'ic_stat_icon_bw';}
        if($rootScope.isIOS){
            var everyString = 'minute';
            if (notificationSettings.every > 1) {everyString = 'hour';}
            if (notificationSettings.every > 60) {everyString = 'day';}
            console.warn("scheduleGenericIosNotification: iOS requires second, minute, hour, day, week, " +
                "month, year so converting " +
                notificationSettings.every + " minutes to string: " + everyString);
            // Don't include notificationSettings.icon for iOS. I keep seeing "Unknown property: icon" in Safari console
            notificationSettings.every = everyString;
        }
        function scheduleGenericChromeExtensionNotification(intervalInMinutes) {
            qmService.logDebug('scheduleGenericChromeExtensionNotification: Reminder notification interval is ' + intervalInMinutes + ' minutes');
            var alarmInfo = {periodInMinutes: intervalInMinutes};
            qmService.logDebug("scheduleGenericChromeExtensionNotification: clear genericTrackingReminderNotificationAlarm");
            chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
            qmService.logDebug("scheduleGenericChromeExtensionNotification: create genericTrackingReminderNotificationAlarm", alarmInfo);
            chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
            qmService.logDebug("Alarm set, every " + intervalInMinutes + " minutes");
        }
        $ionicPlatform.ready(function () {
            if (localNotificationsPluginInstalled()) {
                cordova.plugins.notification.local.getAll(function (notifications) {
                    qmService.logInfo("scheduleGenericNotification: Local notifications before scheduling: " + JSON.stringify(notifications));
                    if(notifications[0] && notifications[0].length === 1 &&
                        notifications[0].every === notificationSettings.every) {
                        qmService.logInfo("Not scheduling generic notification because we already have one with the same frequency.");
                        return;
                    }
                    cordova.plugins.notification.local.cancelAll(function () {
                        qmService.logInfo('cancelAllNotifications: notifications have been cancelled');
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            qmService.logInfo("cancelAllNotifications: All notifications after cancelling: " + JSON.stringify(notifications));
                            initializeLocalPopupNotifications(notificationSettings);
                        });
                    });
                });
            }
        });
        if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
            scheduleGenericChromeExtensionNotification(notificationSettings.every);
            deferred.resolve();
        }
        return deferred.promise;
    };
    qmService.cancelIonicNotificationById = function(notificationId){
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        $ionicPlatform.ready(function () {
            if (typeof cordova !== "undefined") {
                qmService.logDebug('cancelIonicNotificationById ' + notificationId);
                cordova.plugins.notification.local.cancel(notificationId, function (cancelledNotification) {
                    qmService.logDebug("Canceled notification ", cancelledNotification);
                });
            }
            deferred.resolve();
        });
        return deferred.promise;
    };
    qmService.scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes = function(trackingReminders){
        var deferred = $q.defer();
        if(!qmService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        if(!$rootScope.isMobile && !$rootScope.isChromeExtension){
            qmService.logDebug('Not scheduling notifications because we are not mobile or Chrome extension');
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isAndroid){
            this.cancelAllNotifications();
            qmService.logDebug('Not scheduling local notifications because Android uses push notifications');
            deferred.resolve();
            return deferred.promise;
        }
        if(!trackingReminders || !trackingReminders[0]){
            qmService.logDebug('Not scheduling notifications because we do not have any reminders');
            deferred.resolve();
            return deferred.promise;
        }
        /** @namespace trackingReminders[0].localDailyReminderNotificationTimesForAllReminders */
        var localDailyReminderNotificationTimesFromApi = trackingReminders[0].localDailyReminderNotificationTimesForAllReminders;
        qmService.logDebug('localDailyReminderNotificationTimesFromApi: ' + JSON.stringify(localDailyReminderNotificationTimesFromApi));
        if(localDailyReminderNotificationTimesFromApi.length < 1){
            console.warn('Cannot schedule notifications because ' + 'trackingReminders[0].localDailyReminderNotificationTimes is empty.');
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isMobile){
            if(!qmService.shouldWeUseIonicLocalNotifications()) {
                deferred.resolve();
                return deferred.promise;
            }
            $ionicPlatform.ready(function () {
                cordova.plugins.notification.local.getAll(function (existingLocalNotifications) {
                    var notificationSettings = {
                        every: 60 * 24,
                        title: "How are you?",
                        text: "Time to track!",
                        sound: "file://sound/silent.ogg"
                    };
                    qmService.logDebug("scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: All " +
                        "existing notifications before scheduling", existingLocalNotifications);
                    for (var i = 0; i < existingLocalNotifications.length; i++) {
                        var existingReminderNotificationTimeFoundInApiResponse = false;
                        for (var j = 0; j < localDailyReminderNotificationTimesFromApi.length; j++) {
                            if (parseInt(localDailyReminderNotificationTimesFromApi[j].replace(":", "")) ===
                                existingLocalNotifications[i].id &&
                                existingLocalNotifications[i].text === notificationSettings.text
                            ) {
                                qmService.logDebug('Server has a reminder notification matching local notification ' +
                                    JSON.stringify(existingLocalNotifications[i]));
                                existingReminderNotificationTimeFoundInApiResponse = true;
                            }
                        }
                        if(!existingReminderNotificationTimeFoundInApiResponse) {
                            qmService.logDebug('No matching notification time found so cancelling this local notification ',
                                JSON.stringify(existingLocalNotifications[i]));
                            cordova.plugins.notification.local.cancel(existingLocalNotifications[i].id);
                        }
                    }
                    for (var k = 0; k < localDailyReminderNotificationTimesFromApi.length; k++) {
                        qmService.logDebug('localDailyReminderNotificationTimesFromApi[k] is ', localDailyReminderNotificationTimesFromApi[k]);
                        var existingLocalNotificationScheduled = false;
                        for (var l = 0; l < existingLocalNotifications.length; l++) {
                            if(!localDailyReminderNotificationTimesFromApi[k]){
                                qmService.logError('localDailyReminderNotificationTimesFromApi[' + k + '] is not defined! ' +
                                    'localDailyReminderNotificationTimesFromApi: ', localDailyReminderNotificationTimesFromApi);
                            }
                            if (parseInt(localDailyReminderNotificationTimesFromApi[k].replace(":", "")) ===
                                existingLocalNotifications[l].id &&
                                existingLocalNotifications[l].text === notificationSettings.text) {
                                qmService.logDebug('Server has a reminder notification matching local notification ' + JSON.stringify(existingLocalNotifications[l]));
                                existingLocalNotificationScheduled = true;
                            }
                        }
                        if(!existingLocalNotificationScheduled) {
                            if(!localDailyReminderNotificationTimesFromApi[k]){
                                qmService.logError("Did not get localDailyReminderNotificationTimesFromApi", trackingReminders);
                            }
                            var at = new Date();
                            var splitUpLocalDailyReminderNotificationTimesFromApi = localDailyReminderNotificationTimesFromApi[k].split(":");
                            at.setHours(splitUpLocalDailyReminderNotificationTimesFromApi[0]);
                            at.setMinutes(splitUpLocalDailyReminderNotificationTimesFromApi[1]);
                            var now = new Date();
                            if(at < now){at = new Date(at.getTime() + 60 * 60 * 24 * 1000);}
                            qmService.logDebug('No existing local notification so scheduling ', JSON.stringify(localDailyReminderNotificationTimesFromApi[k]));
                            notificationSettings.at = at;
                            notificationSettings.id = parseInt(localDailyReminderNotificationTimesFromApi[k].replace(":", ""));
                            if($rootScope.numberOfPendingNotifications > 0) {
                                notificationSettings.badge = 1; // Less stressful
                                //notificationSettings.badge = $rootScope.numberOfPendingNotifications;
                            }
                            if($rootScope.isAndroid){notificationSettings.icon = 'ic_stat_icon_bw';}
                            if($rootScope.isIOS){notificationSettings.every = 'day';}
                            if(!(notificationSettings.at instanceof Date)){
                                var errorMessage = 'Skipping notification creation because notificationSettings.at is not an instance of Date: ' + JSON.stringify(notificationSettings);
                                qmService.reportErrorDeferred(errorMessage);
                                return;
                            }
                            if(!isNaN(notificationSettings.at) &&
                                parseInt(Number(notificationSettings.at)) === notificationSettings.at &&
                                !isNaN(parseInt(notificationSettings.at, 10))){
                                var intErrorMessage = 'Skipping notification creation because notificationSettings.at is not an instance of Date: ' + JSON.stringify(notificationSettings);
                                qmService.reportErrorDeferred(intErrorMessage);
                                return;
                            }
                            try{
                                qmService.logDebug('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: ' +
                                    'About to schedule this notification: ',
                                    JSON.stringify(notificationSettings));
                                cordova.plugins.notification.local.schedule(notificationSettings, function (notification) {
                                    qmService.logDebug('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes:' +
                                        ' notification scheduled: ' + JSON.stringify(notification));
                                });
                            } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                                qmService.logError('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes' +
                                    ' notificationSettings: ' + JSON.stringify(notificationSettings));
                            }
                        }
                    }
                });
                deferred.resolve();
            });
        }
        if($rootScope.isChromeExtension){
            chrome.alarms.getAll(function(existingLocalAlarms) {
                qmService.logDebug('Existing Chrome alarms before scheduling: ', existingLocalAlarms);
                for (var i = 0; i < existingLocalAlarms.length; i++) {
                    var existingAlarmTimeFoundInApiResponse = false;
                    for (var j = 0; j < localDailyReminderNotificationTimesFromApi.length; j++) {
                        if (existingLocalAlarms[i].name === localDailyReminderNotificationTimesFromApi[j]) {
                            qmService.logDebug('Server has a reminder notification time matching time ' + existingLocalAlarms[i].name);
                            existingAlarmTimeFoundInApiResponse = true;
                        }
                    }
                    if(!existingAlarmTimeFoundInApiResponse) {
                        qmService.logDebug('No api reminder found matching so cancelling this alarm ', JSON.stringify(existingLocalAlarms[i]));
                        chrome.alarms.clear(existingLocalAlarms[i].name);
                    }
                }
                for (var k = 0; k < localDailyReminderNotificationTimesFromApi.length; k++) {
                    var existingAlarmScheduled = false;
                    for (var l = 0; l < existingLocalAlarms.length; l++) {
                        if (existingLocalAlarms[l].name === localDailyReminderNotificationTimesFromApi[k]) {
                            qmService.logDebug('Server has a reminder notification matching local notification ' +
                                JSON.stringify(existingLocalAlarms[i]));
                            existingAlarmScheduled = true;
                        }
                    }
                    if(!existingAlarmScheduled) {
                        if(!localDailyReminderNotificationTimesFromApi[k]){
                            qmService.logError('localDailyReminderNotificationTimesFromApi[' + k + '] is not defined! ' +
                                'localDailyReminderNotificationTimesFromApi: ', localDailyReminderNotificationTimesFromApi);
                        }
                        var alarmInfo = {};
                        var at = new Date(); // The 0 there is the key, which sets the date to the epoch
                        var splitUpLocalDailyReminderNotificationTimesFromApi =
                            localDailyReminderNotificationTimesFromApi[k].split(":");
                        at.setHours(splitUpLocalDailyReminderNotificationTimesFromApi[0]);
                        at.setMinutes(splitUpLocalDailyReminderNotificationTimesFromApi[1]);
                        alarmInfo.when =  at.getTime();
                        alarmInfo.periodInMinutes = 24 * 60;
                        qmService.logDebug('No existing local notification so scheduling ', alarmInfo);
                        chrome.alarms.create(localDailyReminderNotificationTimesFromApi[k], alarmInfo);
                    }
                }
            });
            deferred.resolve();
        }
        return deferred.promise;
    };
    // cancel all existing notifications
    qmService.cancelAllNotifications = function(){
        var deferred = $q.defer();
        if(typeof cordova !== "undefined" && typeof cordova.plugins.notification !== "undefined"){
            $ionicPlatform.ready(function () {
                cordova.plugins.notification.local.cancelAll(function () {
                    qmService.logDebug('cancelAllNotifications: notifications have been cancelled');
                    cordova.plugins.notification.local.getAll(function (notifications) {
                        qmService.logDebug("cancelAllNotifications: All notifications after cancelling", notifications);
                    });
                    deferred.resolve();
                });
            });
        } else if (typeof chrome !== "undefined" && typeof chrome.alarms !== "undefined"){
            chrome.alarms.clearAll(function (){
                qmService.logDebug('Cleared all Chrome alarms!');
                deferred.resolve();
            });
        } else {
            qmService.logDebug('cancelAllNotifications: Chrome and cordova are not defined.');
            deferred.resolve();
        }
        return deferred.promise;
    };
    // TIME SERVICE
    qmService.getSecondsSinceMidnightLocalFromLocalString = function (localTimeString) {
        var timeFormat = "HH:mm:ss";
        var hours = parseInt(moment(localTimeString, timeFormat).format("HH"));
        var minutes = parseInt(moment(localTimeString, timeFormat).format("mm"));
        var seconds = parseInt(moment(localTimeString, timeFormat).format("ss"));
        var secondsSinceMidnightLocal = hours * 60 *60 + minutes * 60 + seconds;
        return secondsSinceMidnightLocal;
    };
    qmService.getEpochTimeFromLocalString = function (localTimeString) {
        var timeFormat = "HH:mm:ss";
        var epochTime = moment(localTimeString, timeFormat).unix();
        return epochTime;
    };
    qmService.getEpochTimeFromLocalStringRoundedToHour = function (localTimeString) {
        var timeFormat = "HH";
        var partsOfString = localTimeString.split(':');
        var epochTime = moment(partsOfString[0], timeFormat).unix();
        return epochTime;
    };
    qmService.getLocalTimeStringFromUtcString = function (utcTimeString) {
        var timeFormat = "HH:mm:ss Z";
        var utcTimeStringFull = moment().format(timeFormat);
        if(utcTimeString){utcTimeStringFull = utcTimeString + " +0000";}
        var returnTimeFormat = "HH:mm:ss";
        var localTimeString = moment(utcTimeStringFull, timeFormat).format(returnTimeFormat);
        //qmService.logDebug("localTimeString is " + localTimeString);
        return localTimeString;
    };
    qmService.humanFormat = function(hhmmssFormatString){
        var initialTimeFormat = "HH:mm:ss";
        var humanTimeFormat = "h:mm A";
        return moment(hhmmssFormatString, initialTimeFormat).format(humanTimeFormat);
    };
    qmService.getUtcTimeStringFromLocalString = function (localTimeString) {
        var returnTimeFormat = "HH:mm:ss";
        var utcTimeString = moment(localTimeString, returnTimeFormat).utc().format(returnTimeFormat);
        qmService.logDebug("utcTimeString is " + utcTimeString);
        return utcTimeString;
    };
    qmService.getLocalMidnightInUtcString = function () {
        var localMidnightMoment = moment(0, "HH");
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        var localMidnightInUtcString = localMidnightMoment.utc().format(timeFormat);
        return localMidnightInUtcString;
    };
    qmService.getTomorrowLocalMidnightInUtcString = function () {
        var tomorrowLocalMidnightMoment = moment(0, "HH");
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        tomorrowLocalMidnightMoment.add(1, 'days');
        var tomorrowLocalMidnightInUtcString = tomorrowLocalMidnightMoment.utc().format(timeFormat);
        return tomorrowLocalMidnightInUtcString;
    };
    qmService.getCurrentTimeInLocalString = function () {
        var currentMoment = moment();
        var timeFormat = 'HH:mm:ss';
        var currentTimeInLocalString = currentMoment.format(timeFormat);
        return currentTimeInLocalString;
    };
    qmService.getCurrentDateTimeInUtcString = function () {
        var currentMoment = moment();
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        var currentDateTimeInUtcString = currentMoment.utc().format(timeFormat);
        return currentDateTimeInUtcString;
    };
    qmService.getCurrentDateString = function () {
        var currentMoment = moment();
        var timeFormat = 'YYYY-MM-DD';
        var currentDateString = currentMoment.utc().format(timeFormat);
        return currentDateString;
    };
    qmService.getCurrentDateTimeInUtcStringPlusMin = function (minutes) {
        var currentMoment = moment().add(minutes, 'minutes');
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        var currentDateTimeInUtcStringPlus15Min = currentMoment.utc().format(timeFormat);
        return currentDateTimeInUtcStringPlus15Min;
    };
    qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteen = function (defaultStartTimeInSecondsSinceMidnightLocal) {
        // Round minutes
        var defaultStartTime = new Date(defaultStartTimeInSecondsSinceMidnightLocal * 1000);
        var defaultStartTimeHours = defaultStartTime.getUTCHours();
        var defaultStartTimeMinutes = defaultStartTime.getUTCMinutes();
        if (defaultStartTimeMinutes % 15 !== 0) {
            if ((defaultStartTimeMinutes > 0 && defaultStartTimeMinutes <= 7)) {defaultStartTimeMinutes = 0;}
            else if (defaultStartTimeMinutes > 7 && defaultStartTimeMinutes <= 22) {defaultStartTimeMinutes = 15;}
            else if (defaultStartTimeMinutes > 22 && defaultStartTimeMinutes <= 37) {defaultStartTimeMinutes = 30;}
            else if (defaultStartTimeMinutes > 37 && defaultStartTimeMinutes <= 52) {defaultStartTimeMinutes = 45;}
            else if (defaultStartTimeMinutes > 52) {
                defaultStartTimeMinutes = 0;
                if (defaultStartTimeHours === 23) {defaultStartTimeHours = 0;} else {defaultStartTimeHours += 1;}
            }
        }
        defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString("" +
            defaultStartTimeHours + ":" + defaultStartTimeMinutes + ":00");
        return defaultStartTimeInSecondsSinceMidnightLocal;
    };
    qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString = function (localString) {
        var secondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString(localString);
        return qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteen(secondsSinceMidnightLocal);
    };
    // Local Storage Services
    qmService.deleteItemFromLocalStorage  = function(key){
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.remove(key);
        } else {localStorage.removeItem(key);}
    };
    qmService.deleteElementOfLocalStorageItemById = function(localStorageItemName, elementId){
        var deferred = $q.defer();
        deferred.resolve(window.deleteElementOfLocalStorageItemById(localStorageItemName, elementId));
        return deferred.promise;
    };
    qmService.getElementOfLocalStorageItemById = function(localStorageItemName, elementId){
        var localStorageItemAsString = qmService.getLocalStorageItemAsString(localStorageItemName);
        var localStorageItemArray = JSON.parse(localStorageItemAsString);
        if(!localStorageItemArray){
            console.warn("Local storage item " + localStorageItemName + " not found");
        } else {
            for(var i = 0; i < localStorageItemArray.length; i++){
                if(localStorageItemArray[i].id === elementId){return localStorageItemArray[i];}
            }
        }
    };
    qmService.deleteElementsOfLocalStorageItemByProperty = function(localStorageItemName, propertyName, propertyValue){
        var deferred = $q.defer();
        window.deleteElementsOfLocalStorageItemByProperty(localStorageItemName, propertyName, propertyValue);
        deferred.resolve();
        return deferred.promise;
    };
    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront = function(localStorageItemName, replacementElementArray){
        qmService.logInfo("addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront in " + localStorageItemName + ": " + JSON.stringify(replacementElementArray));
        var deferred = $q.defer();
        if(replacementElementArray.constructor !== Array){ replacementElementArray = [replacementElementArray]; }
        // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
        var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
        var localStorageItemArray = JSON.parse(qmService.getLocalStorageItemAsString(localStorageItemName));
        var found = false;
        if(localStorageItemArray){
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
        qmService.setLocalStorageItem(localStorageItemName, JSON.stringify(elementsToKeep));
        deferred.resolve();
        return deferred.promise;
    };
    qmService.setLocalStorageItem = function(key, value){
        var deferred = $q.defer();
        if(typeof value !== "string"){value = JSON.stringify(value);}
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            var obj = {};
            obj[key] = value;
            chrome.storage.local.set(obj);
            deferred.resolve();
        } else {
            window.setLocalStorageItem(key, value);
            deferred.resolve();
        }
        return deferred.promise;
    };
    qmService.getLocalStorageItemAsStringWithCallback = function(key, callback){
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(key,function(val){
                callback(val[key]);
            });
        } else {
            var val = localStorage.getItem(key);
            callback(val);
        }
    };
    qmService.getLocalStorageItemAsString = function(key) {
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(key,function(val){
                return val[key];
            });
        } else {
            return window.getLocalStorageItemAsString(key);
        }
    };
    qmService.getElementsFromLocalStorageItemWithFilters = function (localStorageItemName, filterPropertyName, filterPropertyValue,
                                                                             lessThanPropertyName, lessThanPropertyValue,
                                                                             greaterThanPropertyName, greaterThanPropertyValue) {
        return window.getElementsFromLocalStorageItemWithFilters(localStorageItemName, filterPropertyName, filterPropertyValue,
            lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
    };
    qmService.searchLocalStorage = function (localStorageItemName, filterPropertyName, searchQuery, requestParams) {
        var matchingElements = [];
        var unfilteredElementArray = qmService.getElementsFromLocalStorageItemWithRequestParams(localStorageItemName, requestParams);
        if(!unfilteredElementArray || !unfilteredElementArray.length){return null;}
        if(filterPropertyName && typeof unfilteredElementArray[0][filterPropertyName] === "undefined"){
            qmService.logError(filterPropertyName + " filterPropertyName does not exist for " + localStorageItemName);
            return null;
        }
        for(var i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][filterPropertyName].toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
        if(requestParams && requestParams.sort){matchingElements = qmService.sortByProperty(matchingElements, requestParams.sort);}
        return matchingElements;
    };
    qmService.sortByProperty = function(arrayToSort, propertyName){
        return window.sortByProperty(arrayToSort, propertyName);
    };
    qmService.getLocalStorageItemAsObject = function(key) {
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(key,function(val){
                var item = val[key];
                item = convertToObjectIfJsonString(item);
                return item;
            });
        } else {
            var item = localStorage.getItem(key);
            item = convertToObjectIfJsonString(item);
            return item;
        }
    };
    qmService.clearLocalStorage = function(){
        qmService.logDebug('Clearing local storage!');
        if ($rootScope.isChromeApp) {chrome.storage.local.clear();} else {localStorage.clear();}
        //putCommonVariablesInLocalStorageUsingJsonFile();
        putCommonVariablesInLocalStorageUsingApi();
    };
    var convertToObjectIfJsonString = function(stringOrObject) {
        try {stringOrObject = JSON.parse(stringOrObject);} catch (e) {return stringOrObject;}
        return stringOrObject;
    };
    qmService.getCachedResponse = function(requestName, params, ignoreExpiration){
        if(!params){
            qmService.logError('No params provided to getCachedResponse');
            return false;
        }
        var cachedResponse = JSON.parse(qmService.getLocalStorageItemAsString(requestName));
        if(!cachedResponse || !cachedResponse.expirationTimeMilliseconds){return false;}
        var paramsMatch = JSON.stringify(cachedResponse.requestParams) === JSON.stringify(params);
        if(!paramsMatch){return false;}
        var cacheNotExpired = Date.now() < cachedResponse.expirationTimeMilliseconds;
        if(ignoreExpiration){cacheNotExpired = true;}
        if(!cacheNotExpired){return false;}
        //if(!cachedResponse.response.length){return false;} // Doesn't work if response is an object instead of array
        return cachedResponse.response;
    };
    qmService.storeCachedResponse = function(requestName, params, response){
        var cachedResponse = {requestParams: params, response: response, expirationTimeMilliseconds: Date.now() + 86400 * 1000};
        qmService.setLocalStorageItem(requestName, JSON.stringify(cachedResponse));
    };
    qmService.deleteCachedResponse = function(requestName){qmService.deleteItemFromLocalStorage(requestName);};
    qmService.getElementsFromLocalStorageItemWithRequestParams = function(localStorageItemName, requestParams) {
        var greaterThanPropertyName = null;
        var greaterThanPropertyValue = null;
        var lessThanPropertyName = null;
        var lessThanPropertyValue = null;
        var filterPropertyValue = null;
        var log = [];
        var filterPropertyValues = [];
        var filterPropertyNames = [];
        angular.forEach(requestParams, function(value, key) {
            if(typeof value === "string" && value.indexOf('(lt)') !== -1){
                lessThanPropertyValue = value.replace('(lt)', "");
                if(!isNaN(lessThanPropertyValue)){lessThanPropertyValue = Number(lessThanPropertyValue);}
                lessThanPropertyName = key;
            } else if (typeof value === "string" && value.indexOf('(gt)') !== -1){
                greaterThanPropertyValue = value.replace('(gt)', "");
                if(!isNaN(greaterThanPropertyValue)){greaterThanPropertyValue = Number(greaterThanPropertyValue);}
                greaterThanPropertyName = key;
            } else if (typeof value === "string" && value !== "Anything" && key !== "sort"){
                if(!isNaN(value)){filterPropertyValues = Number(filterPropertyValue);} else {filterPropertyValues.push(value);}
                filterPropertyNames.push(key);
            } else if (typeof value === "boolean" && (key === "outcome" || (key === 'manualTracking' && value === true))){
                filterPropertyValues.push(value);
                filterPropertyNames.push(key);
            }
        }, log);
        var results =  qmService.getElementsFromLocalStorageItemWithFilters(localStorageItemName, null,
            null, lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
        if(results){
            for(var i = 0; i < filterPropertyNames.length; i++){
                results = results.filter(function( obj ) {return obj[filterPropertyNames[i]] === filterPropertyValues[i];});
            }
        }
        return results;
    };
    qmService.removeItemsWithDifferentName = function(arrayOfObjects, queryTerm){
        return arrayOfObjects.filter(function( obj ) {return obj.name.toLowerCase().indexOf(queryTerm.toLowerCase()) !== -1;});
    };
    qmService.arrayHasItemWithNameProperty = function(arrayOfObjects){
        return arrayOfObjects && arrayOfObjects.length && arrayOfObjects[0] && arrayOfObjects[0].name;
    };
    // LOGIN SERVICES
    qmService.fetchAccessTokenAndUserDetails = function(authorization_code, withJWT) {
        qmService.getAccessTokenFromAuthorizationCode(authorization_code, withJWT)
            .then(function(response) {
                qmService.hideLoader();
                if(response.error){
                    qmService.reportErrorDeferred(response.error);
                    qmService.logError("Error generating access token");
                    qmService.setLocalStorageItem('user', null);
                } else {
                    qmService.logDebug("Access token received",response);
                    qmService.saveAccessTokenInLocalStorage(response);
                    qmService.logDebug('get user details from server and going to defaultState...');
                    qmService.showBlackRingLoader();
                    qmService.refreshUser().then(function(user){
                        qmService.hideLoader();
                        qmService.syncAllUserData();
                        qmService.logDebug($state.current.name + ' qmService.fetchAccessTokenAndUserDetails got this user ' + JSON.stringify(user));
                    }, function(error){
                        qmService.hideLoader();
                        qmService.reportErrorDeferred($state.current.name + ' could not refresh user because ' + JSON.stringify(error));
                    });
                }
            }).catch(function(exception){ if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                qmService.hideLoader();
                qmService.setLocalStorageItem('user', null);
            });
    };
    function getRootDomain(url){
        var parts = url.split('.');
        var rootDomainWithPath = parts[1] + '.' + parts[2];
        var rootDomainWithPathParts = rootDomainWithPath.split('/');
        return rootDomainWithPathParts[0];
    }
    function isQuantiMoDoDomain(urlToCheck) {
        var isHttps = urlToCheck.indexOf("https://") === 0;
        var matchesQuantiModo = getRootDomain(urlToCheck) === 'quantimo.do';
        var result = isHttps && matchesQuantiModo;
        if(!result){
            qmService.logDebug("Domain " + getRootDomain(urlToCheck) + " from event.url " + urlToCheck + " is not a QuantiModo domain");
        } else {
            qmService.logDebug("Domain " + getRootDomain(urlToCheck) + " from event.url " + urlToCheck + " is a QuantiModo domain");
        }
        return isHttps && matchesQuantiModo;
    }
    qmService.checkLoadStartEventUrlForErrors = function(ref, event){
        if(qmService.getUrlParameter('error', event.url)) {
            var errorMessage = "nonNativeMobileLogin: error occurred:" + qmService.getUrlParameter('error', event.url);
            qmService.logError(errorMessage);
            ref.close();
        }
    };
    qmService.nonNativeMobileLogin = function(register) {
        qmService.logDebug('qmService.nonNativeMobileLogin: open the auth window via inAppBrowser.');
        // Set location=yes instead of location=no temporarily to try to diagnose intermittent white screen on iOS
        //var ref = window.open(url,'_blank', 'location=no,toolbar=yes');
        // Try clearing inAppBrowser cache to avoid intermittent connectors page redirection problem
        // Note:  Clearing cache didn't solve the problem, but I'll leave it because I don't think it hurts anything
        var ref = window.open(qmService.generateV1OAuthUrl(register),'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');
        // Commented because I think it's causing "$apply already in progress" error
        // $timeout(function () {
        //     qmService.logDebug('qmService.nonNativeMobileLogin: Automatically closing inAppBrowser auth window after 60 seconds.');
        //     ref.close();
        // }, 60000);
        qmService.logDebug('qmService.nonNativeMobileLogin: listen to its event when the page changes');
        ref.addEventListener('loadstart', function(event) {
            qmService.logDebug('qmService.nonNativeMobileLogin: Checking if changed url ' + event.url + ' is the same as redirection url ' + qmService.getRedirectUri());
            if(qmService.getAuthorizationCodeFromEventUrl(event)) {
                var authorizationCode = qmService.getAuthorizationCodeFromEventUrl(event);
                ref.close();
                qmService.logDebug('qmService.nonNativeMobileLogin: Going to get an access token using authorization code.');
                qmService.fetchAccessTokenAndUserDetails(authorizationCode);
            }
            qmService.checkLoadStartEventUrlForErrors(ref, event);
        });
    };
    qmService.chromeAppLogin = function(register){
        qmService.logDebug("login: Use Chrome app (content script, background page, etc.");
        var url = qmService.generateV1OAuthUrl(register);
        chrome.identity.launchWebAuthFlow({'url': url, 'interactive': true
        }, function() {
            var authorizationCode = qmService.getAuthorizationCodeFromEventUrl(event);
            qmService.getAccessTokenFromAuthorizationCode(authorizationCode);
        });
    };
    qmService.chromeExtensionLogin = function(register) {
        function getAfterLoginRedirectUrl() {
            return encodeURIComponent("https://" + $rootScope.appSettings.clientId + ".quantimo.do");
        }
        function getLoginUrl() {
            var loginUrl = qmService.getQuantiModoUrl("api/v2/auth/login");
            if (register === true) {loginUrl = qmService.getQuantiModoUrl("api/v2/auth/register");}
            loginUrl += "?afterLoginGoTo=" + getAfterLoginRedirectUrl(); // We can't redirect back to Chrome extension page itself.  Results in white screen
            qmService.logDebug("chromeExtensionLogin loginUrl is " + loginUrl);
            return loginUrl;
        }
        function createLoginTabAndClose() {
            qmService.logDebug("chrome.tabs.create " + getLoginUrl());
            chrome.tabs.create({ url: getLoginUrl() });
            window.close();
        }
        createLoginTabAndClose(); // Try this if window.location.replace has problems
        // window.location.replace(getLoginUrl());  Doesn't work!
    };

    function createWeatherIconMeasurementSet(data) {
        return {
            variableCategoryName: "Environment",
            variableName: data.daily.data[0].icon.replace('-', ' '),
            combinationOperation: "MEAN",
            sourceName: $rootScope.appSettings.appDisplayName,
            unitAbbreviatedName: "count",
            fillingValue: 0,
            measurements: [{
                value: 1,
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(getYesterdayNoonTimestamp()),
                //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
            }]
        };
    }

    function createOutdoorWeatherMeasurementSet(data) {
        return {
            variableCategoryName: "Environment",
            variableName: "Outdoor Temperature",
            combinationOperation: "MEAN",
            sourceName: $rootScope.appSettings.appDisplayName,
            unitAbbreviatedName: "F",
            measurements: [{
                value: (data.daily.data[0].temperatureMax + data.daily.data[0].temperatureMin) / 2,
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(getYesterdayNoonTimestamp())
                //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
            }]
        };
    }

    function getYesterdayNoonTimestamp() {
        var localMidnightMoment = moment(0, "HH");
        var localMidnightTimestamp = localMidnightMoment.unix();
        var yesterdayNoonTimestamp = localMidnightTimestamp - 86400 / 2;
        return yesterdayNoonTimestamp;
    }

    function createBarometricPressureMeasurement(data) {
        return {
            variableCategoryName: "Environment",
            variableName: "Barometric Pressure",
            combinationOperation: "MEAN",
            sourceName: $rootScope.appSettings.appDisplayName,
            unitAbbreviatedName: "Pa",
            measurements: [{
                value: data.daily.data[0].pressure * 100,
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(getYesterdayNoonTimestamp())
                //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
            }]
        };
    }

    function createOutdorrHumidityMeasurement(data) {
        return {
            variableCategoryName: "Environment",
            variableName: "Outdoor Humidity",
            combinationOperation: "MEAN",
            sourceName: $rootScope.appSettings.appDisplayName,
            unitAbbreviatedName: "%",
            measurements: [{
                value: data.daily.data[0].humidity * 100,
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(getYesterdayNoonTimestamp())
                //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
            }]
        };
    }

    function createOutdoorVisibilityMeasurement(data) {
        return {
            variableCategoryName: "Environment",
            variableName: "Outdoor Visibility",
            combinationOperation: "MEAN",
            sourceName: $rootScope.appSettings.appDisplayName,
            unitAbbreviatedName: "miles",
            measurements: [{
                value: data.daily.data[0].visibility,
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(getYesterdayNoonTimestamp())
                //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
            }]
        };
    }

    function createCloudCoverMeasurement(data) {
        return {
            variableCategoryName: "Environment",
            variableName: "Cloud Cover",
            combinationOperation: "MEAN",
            sourceName: $rootScope.appSettings.appDisplayName,
            unitAbbreviatedName: "%",
            measurements: [{
                value: data.daily.data[0].cloudCover * 100,
                startTimeEpoch: checkIfStartTimeEpochIsWithinTheLastYear(getYesterdayNoonTimestamp())
                //note: data.daily.data[0].icon  // We shouldn't add icon as note because it messes up the note analysis
            }]
        };
    }

    function getLastPostedWeatherAtTimeUnixtime() {
        return Number(qmService.getLocalStorageItemAsString('lastPostedWeatherAt'));
    }

    function alreadyPostedWeatherSinceNoonYesterday(){
        var lastPostedWeatherAt = getLastPostedWeatherAtTimeUnixtime();
        if(!lastPostedWeatherAt){return false;}
        if(lastPostedWeatherAt && lastPostedWeatherAt > getYesterdayNoonTimestamp()){
            qmService.logDebug("recently posted weather already");
            return true;
        }
        return false;
    }

    function getWeatherMeasurementSets(data) {
        qmService.logDebug(data);
        var measurementSets = [];
        measurementSets.push(createWeatherIconMeasurementSet(data));
        measurementSets.push(createOutdoorWeatherMeasurementSet(data));
        measurementSets.push(createBarometricPressureMeasurement(data));
        measurementSets.push(createOutdorrHumidityMeasurement(data));
        if (data.daily.data[0].visibility) {
            measurementSets.push(createOutdoorVisibilityMeasurement(data));
        }
        measurementSets.push(createCloudCoverMeasurement(data));
        return measurementSets;
    }

    qmService.forecastIoWeather = function(coordinates) {
        if(!$rootScope.user){qmService.logDebug("No recording weather because we're not logged in");return;}
        if(alreadyPostedWeatherSinceNoonYesterday()){return;}
        var FORECASTIO_KEY = '81b54a0d1bd6e3ccdd52e777be2b14cb';
        var url = 'https://api.forecast.io/forecast/' + FORECASTIO_KEY + '/';
        url = url + coordinates.latitude + ',' + coordinates.longitude + ',' + getYesterdayNoonTimestamp() + '?callback=JSON_CALLBACK';
        qmService.logDebug('Checking weather forecast at ' + url);
        $http.jsonp(url).success(function(data) {
            var measurementSets = getWeatherMeasurementSets(data);
            qmService.postMeasurementsToApi(measurementSets, function (response) {
                qmService.logDebug("posted weather measurements");
                if(response && response.data && response.data.userVariables){
                    qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                qmService.setLocalStorageItem('lastPostedWeatherAt', window.getUnixTimestampInSeconds());
            }, function (error) {qmService.logDebug("could not post weather measurements: " + error);});
        }).error(function (error) {
            logError("forecast.io request failed!  error: " + error,  {error_response: error, request_url: url});
        });
    };
    qmService.setupHelpCards = function () {
        var locallyStoredHelpCards = localStorage.getItem('defaultHelpCards');
        if(locallyStoredHelpCards && locallyStoredHelpCards !== "undefined"){
            locallyStoredHelpCards = JSON.parse(locallyStoredHelpCards);
            return locallyStoredHelpCards;
        }
        qmService.setLocalStorageItem('defaultHelpCards', JSON.stringify(config.appSettings.appDesign.helpCard.active));
        return config.appSettings.appDesign.helpCard.active;
    };
    qmService.colors = {
        green: {backgroundColor: "#0f9d58", circleColor: "#03c466"},
        blue: {backgroundColor: "#3467d6", circleColor: "#5b95f9"},
        yellow: {backgroundColor: "#f09402", circleColor: "#fab952"}
    };
    qmService.setupOnboardingPages = function (onboardingPages) {
        var onboardingPagesFromLocalStorage = qmService.getLocalStorageItemAsObject('onboardingPages');
        var activeOnboardingPages = $rootScope.appSettings.appDesign.onboarding.active;
        if(onboardingPagesFromLocalStorage && onboardingPagesFromLocalStorage.length && onboardingPagesFromLocalStorage !== "undefined"){
            if(!$rootScope.appSettings.designMode){activeOnboardingPages = onboardingPagesFromLocalStorage;}
        }
        $rootScope.appSettings.appDesign.onboarding.active = qmService.addColorsCategoriesAndNames(activeOnboardingPages);
    };
    $rootScope.signUpQuestions = [
        {
            question: "What do you do with my data?",
            answer: "Your data belongs entirely to you. We do not sell or otherwise do anything with your data to " +
                "put your privacy at risk.  "
        },
        {
            question: "Can I pause my account?",
            answer: "You can pause or quit at any time. You have complete control."
        },
        {
            question: "Data Security",
            answer: "Our customers have demanding security and privacy requirements. Our platform was designed using " +
                "the most rigorous security standards, using the same technology used by online banks."
        },
    ];
    qmService.setupUpgradePages = function () {
        var upgradePages = [
            {
                id: "upgradePage",
                title: 'QuantiModo Plus',
                "backgroundColor": "#3467d6",
                circleColor: "#fefdfc",
                iconClass: "icon positive ion-ios-medkit-outline",
                image: {
                    url: "img/robots/quantimodo-robot-waving.svg"
                },
                bodyText: "I need to eat electricity to live and I am very hungry.  Please help me by subscribing or I will die."
            },
            {
                id: "addTreatmentRemindersCard",
                title: 'Any Treatments?',
                "backgroundColor": "#f09402",
                circleColor: "#fab952",
                variableCategoryName: "Treatments",
                bodyText: 'Are you taking any medications, treatments, supplements, or other interventions ' +
                'like meditation or psychotherapy? ',
                buttons: [
                    {
                        id: "hideAddTreatmentRemindersCardButton",
                        buttonText: 'Nope',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "addSymptomRemindersCard",
                title: 'Recurring Symptoms?',
                "backgroundColor": "#3467d6",
                circleColor: "#5b95f9",
                variableCategoryName: "Symptoms",
                bodyText: 'Got any recurring symptoms that vary in their severity?',
                buttons: [
                    {
                        id: "hideAddSymptomRemindersCardButton",
                        buttonText: 'Nope',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "addEmotionRemindersCard",
                title: 'Varying Emotions?',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                variableCategoryName: "Emotions",
                bodyText: "Do you have any emotions that fluctuate regularly?<br><br>If so, add them so I can try to " +
                    "determine which factors are influencing them.",
                buttons: [
                    {
                        id: "hideAddEmotionRemindersCardButton",
                        buttonText: 'Nope',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "addFoodRemindersCard",
                title: 'Common Foods or Drinks?',
                "backgroundColor": "#3467d6",
                circleColor: "#5b95f9",
                variableCategoryName: "Foods",
                bodyText: "Add any foods or drinks that you consume more than a few times a week",
                buttons: [
                    {
                        id: "hideAddFoodRemindersCardButton",
                        buttonText: 'Nope',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "locationTrackingInfoCard",
                title: 'Location Tracking',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                bodyText: "Would you like to automatically log location? ",
                moreInfo: $rootScope.variableCategories.Location.moreInfo,
                buttons: [
                    {
                        id: "hideLocationTrackingInfoCardButton",
                        buttonText: 'NO',
                        buttonIconClass: "ion-flash-off",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "weatherTrackingInfoCard",
                title: 'Weather Tracking',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                variableCategoryName: "Environment",
                bodyText: "Would you like to automatically log the weather to see how it might be affecting you? ",
                buttons: [
                    {
                        id: "hideLocationTrackingInfoCardButton",
                        buttonText: 'NO',
                        buttonIconClass: "ion-flash-off",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "importDataCard",
                title: 'Import Your Data',
                "backgroundColor": "#f09402",
                circleColor: "#fab952",
                iconClass: "icon positive ion-ios-cloud-download-outline",
                image: {
                    url: "img/intro/download_2-96.png",
                    height: "96",
                    width: "96"
                },
                bodyText: "Let's go to the Import Data page and see if you're using any of the dozens of apps and " +
                    "devices that I can automatically pull data from!",
                buttons: [
                    {
                        id: "hideImportDataCardButton",
                        buttonText: 'Done connecting data sources',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.hideUpgradePage();}
                    }
                ]
            },
            {
                id: "allDoneCard",
                title: 'Great job!',
                "backgroundColor": "#3467d6",
                circleColor: "#fefdfc",
                iconClass: "icon positive ion-ios-cloud-download-outline",
                image: {
                    url: "img/robots/quantimodo-robot-waving.svg"
                },
                bodyText: "You're all set up!  Let's take a minute to record your first measurements and then " +
                "you're done for the day! ",
                buttons: [
                    {
                        id: "goToInboxButton",
                        buttonText: 'GO TO INBOX',
                        buttonIconClass: "ion-ios-filing-outline",
                        buttonClass: "button button-clear button-assertive",
                        clickFunctionCall: function(){$rootScope.doneUpgrade();}
                    }
                ]
            }
        ];
        var upgradePagesFromLocalStorage = qmService.getLocalStorageItemAsObject('upgradePages');
        if(upgradePagesFromLocalStorage && upgradePagesFromLocalStorage.length &&
            upgradePagesFromLocalStorage !== "undefined"){
            upgradePages = upgradePagesFromLocalStorage;
        }
        $rootScope.upgradePages = upgradePages;
    };
    qmService.postCreditCard = function(body, successHandler, errorHandler) {
        qmService.post('api/v2/account/subscribe', [], body, successHandler, errorHandler);
    };
    qmService.postCreditCardDeferred = function(body){
        var deferred = $q.defer();
        qmService.postCreditCard(body, function(response){
            $rootScope.user = response.user;
            qmService.setLocalStorageItem('user', JSON.stringify($rootScope.user));
            localStorage.user = JSON.stringify($rootScope.user); // For Chrome Extension
            deferred.resolve(response);
        }, function(response){
            deferred.reject(response);
        });
        return deferred.promise;
    };
    qmService.postDowngradeSubscription = function(body, successHandler, errorHandler) {
        qmService.post('api/v2/account/unsubscribe', [], body, successHandler, errorHandler);
    };
    qmService.postDowngradeSubscriptionDeferred = function(){
        var deferred = $q.defer();
        $rootScope.user.stripeActive = false;
        qmService.reportErrorDeferred('User downgraded subscription: ' + JSON.stringify($rootScope.user));
        qmService.postDowngradeSubscription({}, function(user){
            $rootScope.user = user;
            qmService.setLocalStorageItem('user', JSON.stringify($rootScope.user));
            localStorage.user = JSON.stringify($rootScope.user); // For Chrome Extension
            deferred.resolve(user);
        }, function(response){deferred.reject(response);});
        return deferred.promise;
    };
    qmService.sendWithEmailComposer = function(subjectLine, emailBody, emailAddress, fallbackUrl){
        if(!cordova || !cordova.plugins.email){
            qmService.reportErrorDeferred('Trying to send with cordova.plugins.email even though it is not installed. ' +
                ' Using qmService.sendWithMailTo instead.');
            qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
            return;
        }
        if(!emailAddress){emailAddress = null;}
        document.addEventListener('deviceready', function () {
            qmService.logDebug('deviceready');
            cordova.plugins.email.isAvailable(
                function (isAvailable) {
                    if(isAvailable){
                        if(window.plugins && window.plugins.emailComposer) {
                            qmService.logDebug('Generating email with cordova-plugin-email-composer');
                            window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                                    qmService.logDebug("Response -> " + result);
                                },
                                subjectLine, // Subject
                                emailBody,                      // Body
                                emailAddress,    // To
                                'info@quantimo.do',                    // CC
                                null,                    // BCC
                                true,                   // isHTML
                                null,                    // Attachments
                                null);                   // Attachment Data
                        } else {
                            qmService.logError('window.plugins.emailComposer not available!');
                            qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                        }
                    } else {
                        qmService.logError('Email has not been configured for this device!');
                        qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                    }
                }
            );
        }, false);
    };
    qmService.sendWithMailTo = function(subjectLine, emailBody, emailAddress){
        var emailUrl = 'mailto:';
        if(emailAddress){emailUrl = emailUrl + emailAddress;}
        emailUrl = emailUrl + '?subject=' + subjectLine + '&body=' + emailBody;
        qmService.openSharingUrl(emailUrl);
    };
    qmService.openSharingUrl = function(sharingUrl){
        var newTab = window.open(sharingUrl,'_system');
        if(!newTab){ alert("Please unblock popups and press the share button again!"); }
    };
    qmService.addVariableToLocalStorage = function(variable){
        if(variable.userId){qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', variable);}
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('commonVariables', variable);
    };
    qmService.sendEmailViaAPI = function(body, successHandler, errorHandler){
        qmService.post('api/v2/email', [], body, successHandler, errorHandler);
    };
    qmService.sendEmailViaAPIDeferred = function(emailType) {
        var deferred = $q.defer();
        qmService.sendEmailViaAPI({emailType: emailType}, function(){
            deferred.resolve();
        }, function(error){
            deferred.reject(error);
        });
        return deferred.promise;
    };
    var upgradeSubscriptionProducts = {
        monthly7: {
            baseProductId: 'monthly7',
            name: 'QuantiModo Plus Monthly Subscription',
            category: 'Subscription/End-User',  //The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
            variant: 'monthly', // The variant of the product (e.g. Black).
            position: 1, // The product's position in a list or collection (e.g. 2)
            price: 6.95
        },
        yearly60: {
            baseProductId: 'yearly60',
            name: 'QuantiModo Plus Yearly Subscription',
            category: 'Subscription/End-User',  //The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
            variant: 'yearly', // The variant of the product (e.g. Black).
            position: 2, // The product's position in a list or collection (e.g. 2)
            price: 59.95
        }
    };
    qmService.recordUpgradeProductImpression = function () {
        // id	text	Yes*	The product ID or SKU (e.g. P67890). *Either this field or name must be set.
        // name	text	Yes*	The name of the product (e.g. Android T-Shirt). *Either this field or id must be set.
        // list	text	No	The list or collection to which the product belongs (e.g. Search Results)
        // brand	text	No	The brand associated with the product (e.g. Google).
        // category	text	No	The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
        // variant	text	No	The variant of the product (e.g. Black).
        // position	integer	No	The product's position in a list or collection (e.g. 2).
        // price	currency	No	The price of a product (e.g. 29.20).
        // example: Analytics.addImpression(baseProductId, name, list, brand, category, variant, position, price);
        Analytics.addImpression(upgradeSubscriptionProducts.monthly7.baseProductId,
            upgradeSubscriptionProducts.monthly7.name, $rootScope.currentPlatform + ' Upgrade Options',
            $rootScope.appSettings.appDisplayName, upgradeSubscriptionProducts.monthly7.category,
            upgradeSubscriptionProducts.monthly7.variant, upgradeSubscriptionProducts.monthly7.position,
            upgradeSubscriptionProducts.monthly7.price);
        Analytics.addImpression(upgradeSubscriptionProducts.yearly60.baseProductId,
            upgradeSubscriptionProducts.yearly60.name, $rootScope.currentPlatform + ' Upgrade Options',
            $rootScope.appSettings.appDisplayName, upgradeSubscriptionProducts.yearly60.category,
            upgradeSubscriptionProducts.yearly60.variant, upgradeSubscriptionProducts.yearly60.position,
            upgradeSubscriptionProducts.yearly60.price);
        Analytics.pageView();
    };
    qmService.recordUpgradeProductPurchase = function (baseProductId, transactionId, step, coupon) {
        //Analytics.addProduct(baseProductId, name, category, brand, variant, price, quantity, coupon, position);
        Analytics.addProduct(baseProductId, upgradeSubscriptionProducts[baseProductId].name,
            upgradeSubscriptionProducts[baseProductId].category, $rootScope.appSettings.appDisplayName,
            upgradeSubscriptionProducts[baseProductId].variant, upgradeSubscriptionProducts[baseProductId].price,
            1, coupon, upgradeSubscriptionProducts[baseProductId].position);
        // id	text	Yes*	The transaction ID (e.g. T1234). *Required if the action type is purchase or refund.
        // affiliation	text	No	The store or affiliation from which this transaction occurred (e.g. Google Store).
        // revenue	currency	No	Specifies the total revenue or grand total associated with the transaction (e.g. 11.99). This value may include shipping, tax costs, or other adjustments to total revenue that you want to include as part of your revenue calculations. Note: if revenue is not set, its value will be automatically calculated using the product quantity and price fields of all products in the same hit.
        // tax	currency	No	The total tax associated with the transaction.
        // shipping	currency	No	The shipping cost associated with the transaction.
        // coupon	text	No	The transaction coupon redeemed with the transaction.
        // list	text	No	The list that the associated products belong to. Optional.
        // step	integer	No	A number representing a step in the checkout process. Optional on checkout actions.
        // option	text	No	Additional field for checkout and checkout_option actions that can describe option information on the checkout page, like selected payment method.
        var revenue = upgradeSubscriptionProducts[baseProductId].price;
        var affiliation = $rootScope.appSettings.appDisplayName;
        var tax = 0;
        var shipping = 0;
        var list = $rootScope.appSettings.appDisplayName;
        var option = '';
        Analytics.trackTransaction(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option);
    };
    qmService.getStudyLinks = function(predictorVariableName, outcomeVariableName){
        var subjectLine = "Help us discover the effect of " + predictorVariableName + " on " + outcomeVariableName;
        var studyLinkStatic = qmService.getApiUrl() + "/api/v2/study?causeVariableName=" +
            encodeURIComponent(predictorVariableName) + '&effectVariableName=' + encodeURIComponent(outcomeVariableName);
        var bodyText = "Please join my study at " + studyLinkStatic + " .  Have a great day!";
        return {
            studyLinkFacebook : "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(studyLinkStatic),
            studyLinkTwitter : "https://twitter.com/home?status=" + encodeURIComponent(subjectLine + ' ' + studyLinkStatic + ' @quantimodo'),
            studyLinkGoogle : "https://plus.google.com/share?url=" + encodeURIComponent(studyLinkStatic),
            studyLinkEmail: "mailto:?subject=" + encodeURIComponent(subjectLine) + "&body=" + encodeURIComponent(bodyText)
        };
    };
    qmService.getStudyLinkByVariableNames = function (causeVariableName, effectVariableName) {
        return qmService.getApiUrl() + '/api/v2/study?causeVariableName=' + encodeURIComponent(causeVariableName) + '&effectVariableName=' + encodeURIComponent(effectVariableName);
    };
    qmService.getWikipediaArticle = function(title){
        var deferred = $q.defer();
        wikipediaFactory.getArticle({
            term: title, // Searchterm
            //lang: '<LANGUAGE>', // (optional) default: 'en'
            //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
            pithumbsize: '200', // (optional) default: 400
            //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
            exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
            //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            redirects: ''
        }).then(function (repsonse) {
            if(repsonse.data.query) {
                deferred.resolve(repsonse.data.query.pages[0]);
            } else {
                var error = 'Wiki not found for ' + title;
                qmService.logError(error);
                qmService.logError(error);
                deferred.reject(error);
            }
        }).catch(function (error) {
            qmService.logError(error);
            deferred.reject(error);
            //on error
        });
        return deferred.promise;
    };
    function setAfterLoginGoToState(afterLoginGoToState){
        if(afterLoginGoToState.indexOf('login') !== -1){
            qmService.logErrorOrInfoIfTesting("Why are we sending to login from login state?");
            return;
        }
        qmService.logDebug('Setting afterLoginGoToState to ' + afterLoginGoToState + ' and going to login. ');
        qmService.setLocalStorageItem('afterLoginGoToState', afterLoginGoToState);
    }
    function setAfterLoginGoToUrl(afterLoginGoToUrl){
        if(!afterLoginGoToUrl){afterLoginGoToUrl = window.location.href;}
        if(afterLoginGoToUrl.indexOf('login') !== -1){
            qmService.logErrorOrInfoIfTesting("Why are we sending to login from login state?");
            return;
        }
        qmService.logDebug('Setting afterLoginGoToUrl to ' + afterLoginGoToUrl + ' and going to login.');
        qmService.setLocalStorageItem('afterLoginGoToUrl', afterLoginGoToUrl);
    }
    qmService.sendToLoginIfNecessaryAndComeBack = function(afterLoginGoToState, afterLoginGoToUrl){
        qmService.logDebug("Called qmService.sendToLoginIfNecessaryAndComeBack");
        qmService.refreshUserUsingAccessTokenInUrlIfNecessary();
        if(!weHaveUserOrAccessToken()){
            if(afterLoginGoToState){
                setAfterLoginGoToState(afterLoginGoToState);
            } else {
                setAfterLoginGoToUrl(afterLoginGoToUrl);
            }
            sendToLogin();
            return true;
        }
        return false;
    };
    qmService.getPrimaryOutcomeVariable = function(){
        if(config.appSettings.primaryOutcomeVariableDetails){ return config.appSettings.primaryOutcomeVariableDetails;}
        var variables = {
            "Overall Mood" : {
                "id" : 1398,
                "name" : "Overall Mood",
                "variableName": "Overall Mood",
                variableCategoryName : "Mood",
                "userVariableDefaultUnitAbbreviatedName" : "/5",
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
        if(config.appSettings.primaryOutcomeVariableName){return variables[config.appSettings.primaryOutcomeVariableName];}
        return variables['Overall Mood'];
    };
    qmService.ratingImages = {
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
    qmService.addToFavoritesUsingVariableObject = function (variableObject) {
        var trackingReminder = {};
        trackingReminder.variableId = variableObject.id;
        trackingReminder.variableName = variableObject.name;
        trackingReminder.unitAbbreviatedName = variableObject.userVariableDefaultUnitAbbreviatedName;
        trackingReminder.valence = variableObject.valence;
        trackingReminder.variableCategoryName = variableObject.variableCategoryName;
        trackingReminder.reminderFrequency = 0;
        if($rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise){
            var message = 'Got deletion request before last reminder refresh completed';
            qmService.logDebug(message);
            $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise.reject();
            $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise = null;
        }
        if ((trackingReminder.unitAbbreviatedName !== '/5' && trackingReminder.variableName !== "Blood Pressure")) {
            qmService.logDebug("Going to favoriteAdd state")
            qmService.goToState('app.favoriteAdd', {variableObject: variableObject, fromState: $state.current.name, fromUrl: window.location.href, doneState: 'app.favorites'});
            return;
        }
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminders', trackingReminder)
            .then(function() {
                // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                qmService.goToState('app.favorites', {trackingReminder: trackingReminder, fromState: $state.current.name, fromUrl: window.location.href});
                qmService.syncTrackingReminders();
            });
    };
    qmService.addToRemindersUsingVariableObject = function (variableObject, options) {
        var doneState = config.appSettings.appDesign.defaultState;
        if(options.doneState){doneState = options.doneState;}
        if($rootScope.appSettings.appDesign.onboarding.active && $rootScope.appSettings.appDesign.onboarding.active[0] &&
            $rootScope.appSettings.appDesign.onboarding.active[0].id.toLowerCase().indexOf('reminder') !== -1){
            $rootScope.appSettings.appDesign.onboarding.active[0].title = $rootScope.appSettings.appDesign.onboarding.active[0].title.replace('Any', 'More');
            $rootScope.appSettings.appDesign.onboarding.active[0].addButtonText = "Add Another";
            $rootScope.appSettings.appDesign.onboarding.active[0].nextPageButtonText = "All Done";
            $rootScope.appSettings.appDesign.onboarding.active[0].bodyText = "Great job!  Now you'll be able to instantly record " +
                variableObject.name + " in the Reminder Inbox. <br><br>   Want to add any more " +
                variableObject.variableCategoryName.toLowerCase() + '?';
            qmService.setLocalStorageItem('onboardingPages', JSON.stringify($rootScope.appSettings.appDesign.onboarding.active));
        }
        var trackingReminder = {};
        trackingReminder.variableId = variableObject.id;
        trackingReminder.variableName = variableObject.name;
        trackingReminder.unitAbbreviatedName = variableObject.userVariableDefaultUnitAbbreviatedName;
        trackingReminder.valence = variableObject.valence;
        trackingReminder.variableCategoryName = variableObject.variableCategoryName;
        trackingReminder.reminderFrequency = 86400;
        trackingReminder.reminderStartTime = qmService.getUtcTimeStringFromLocalString("19:00:00");
        var skipReminderSettings = false;
        if(variableObject.variableName === "Blood Pressure"){skipReminderSettings = true;}
        if(options.skipReminderSettingsIfPossible){
            if(variableObject.userVariableDefaultUnitAbbreviatedName === '/5'){skipReminderSettings = true;}
            if(variableObject.userVariableDefaultUnitAbbreviatedName === 'serving'){
                skipReminderSettings = true;
                trackingReminder.defaultValue = 1;
            }
        }
        if (!skipReminderSettings) {
            qmService.goToState('app.reminderAdd', {variableObject: variableObject, doneState: doneState});
            return;
        }
        qmService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderSyncQueue', trackingReminder)
            .then(function() {
                // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                qmService.goToState(doneState, {trackingReminder: trackingReminder});
                qmService.syncTrackingReminders();
            });
    };
    qmService.getDefaultReminders = function(){
        if(config.appSettings.defaultReminders){return config.appSettings.defaultReminders;}
        if(config.appSettings.defaultRemindersType === 'medication'){
            return [
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
            ];
        }
        return null;
    };
    function processTrackingReminders(trackingReminders, variableCategoryName) {
        trackingReminders = qmService.filterByStringProperty(trackingReminders, 'variableCategoryName', variableCategoryName);
        if(!trackingReminders || !trackingReminders.length){return {};}
        for(var i = 0; i < trackingReminders.length; i++){
            trackingReminders[i].total = null;
            if(typeof trackingReminders[i].defaultValue === "undefined"){trackingReminders[i].defaultValue = null;}
        }
        trackingReminders = qmService.attachVariableCategoryIcons(trackingReminders);
        return separateFavoritesAndArchived(trackingReminders);
    }
    function separateFavoritesAndArchived(trackingReminders){
        var reminderTypesArray = {allTrackingReminders: trackingReminders};
        qmService.logDebug("separateFavoritesAndArchived: allTrackingReminders is: " + JSON.stringify(trackingReminders));
        if(trackingReminders.constructor !== Array){
            qmService.logDebug("trackingReminders is not an array! trackingReminders:", trackingReminders);
        } else {
            qmService.logDebug("trackingReminders is an array");
        }
        try {
            reminderTypesArray.favorites = trackingReminders.filter(function( trackingReminder ) {
                return trackingReminder.reminderFrequency === 0;
            });
        } catch (error){
            reminderTypesArray.favorites = [];
            qmService.logError(error, {trackingReminders: trackingReminders});
        }
        try {
            reminderTypesArray.trackingReminders = trackingReminders.filter(function( trackingReminder ) {
                return trackingReminder.reminderFrequency !== 0 &&
                    trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') === -1;
            });
        } catch (error){
            qmService.logError(error, {trackingReminders: trackingReminders});
        }
        try {
            reminderTypesArray.archivedTrackingReminders = trackingReminders.filter(function( trackingReminder ) {
                return trackingReminder.reminderFrequency !== 0 && trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') !== -1;
            });
        } catch (error){
            qmService.logError(error, {trackingReminders: trackingReminders});
        }
        return reminderTypesArray;
    }
    qmService.getAllReminderTypes = function(variableCategoryName, type){
        var deferred = $q.defer();
        qmService.getTrackingRemindersDeferred(variableCategoryName).then(function (trackingReminders) {
            var count = 0;
            if(trackingReminders && trackingReminders.length){count = trackingReminders.length;}
            qmService.logInfo("Got " + count + " unprocessed " + variableCategoryName +  " category trackingReminders");
            var reminderTypesArray = processTrackingReminders(trackingReminders, variableCategoryName);
            if(type){
                count = 0;
                if(reminderTypesArray[type] && reminderTypesArray[type].length){count = reminderTypesArray[type].length;}
                qmService.logInfo("Got " + count + " " + variableCategoryName +  " category " + type + "s");
                deferred.resolve(reminderTypesArray[type]);
            } else {
                qmService.logInfo("Returning reminderTypesArray from getTrackingRemindersDeferred");
                deferred.resolve(reminderTypesArray);
            }
        });
        return deferred.promise;
    };
    qmService.convertTrackingReminderToVariableObject = function(trackingReminder){
        var variableObject = JSON.parse(JSON.stringify(trackingReminder));
        variableObject.id = trackingReminder.variableId;
        variableObject.name = trackingReminder.variableName;
        return variableObject;
    };
    qmService.actionSheetButtons = {
        history: { text: '<i class="icon ' + qmService.ionIcons.history + '"></i>History'},
        analysisSettings: { text: '<i class="icon ' + qmService.ionIcons.settings + '"></i>' + 'Analysis Settings'},
        recordMeasurement: { text: '<i class="icon ' + qmService.ionIcons.recordMeasurement + '"></i>Record Measurement'},
        addReminder: { text: '<i class="icon ' + qmService.ionIcons.reminder + '"></i>Add Reminder'},
        charts: { text: '<i class="icon ' + qmService.ionIcons.charts + '"></i>Charts'},
        settings: { text: '<i class="icon ' + qmService.ionIcons.settings + '"></i>Settings'},
        help: { text: '<i class="icon ' + qmService.ionIcons.help + '"></i>Help'},
        refresh: { text: '<i class="icon ' + qmService.ionIcons.refresh + '"></i>Refresh'}
    };
    qmService.getHistoryActionSheetButton = function(variableName){
        if(!variableName){variableName = '';}
        return { text: '<i class="icon ' + qmService.ionIcons.history + '"></i>' + variableName + ' History'};
    };
    qmService.addImagePaths = function(object){
        if(object.variableCategoryName){
            var pathPrefix = 'img/variable_categories/' + object.variableCategoryName.toLowerCase().replace(' ', '-');
            if(!object.pngPath){object.pngPath = pathPrefix + '.png';}
            if(!object.svgPath){object.svgPath = pathPrefix + '.svg';}
        }
        return object;
    };
    function setupExplanations(){
        qmService.explanations = {
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
                textContent: qmService.variableCategories.Location.moreInfo
            },
            minimumAllowedValue: {
                title: "Minimum Allowed Value",
                explanation: "The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.",
            },
            maximumAllowedValue: {
                title: "Maximum Allowed Value",
                explanation: "The maximum allowed value for measurements.  While you can record a value above this maximum, it will be excluded from the correlation analysis.",
            },
            onsetDelayInHours: {
                title: "Onset Delay",
                unitName: "Hours",
                explanation: "An outcome is always preceded by the predictor or stimulus. The amount of time that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the “onset delay”.  For example, the “onset delay” between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
            },
            onsetDelay: {
                title: "Onset Delay",
                unitName: "Seconds",
                explanation: "An outcome is always preceded by the predictor or stimulus. The amount of time that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the “onset delay”.  For example, the “onset delay” between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
            },
            durationOfActionInHours: {
                title: "Duration of Action",
                unitName: "Hours",
                explanation: "The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable’s value. For instance, aspirin typically decreases headache severity for approximately four hours (duration of action) following the onset delay.",
            },
            durationOfAction: {
                title: "Duration of Action",
                unitName: "Seconds",
                explanation: "The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable’s value. For instance, aspirin typically decreases headache severity for approximately four hours (duration of action) following the onset delay.",
            },
            fillingValue: {
                title: "Filling Value",
                explanation: "When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.",
            },
            combinationOperation: {
                title: "Combination Method",
                explanation: "How multiple measurements are combined over time.  We use the average (or mean) for things like your weight.  Summing is used for things like number of apples eaten.",
            },
            defaultValue: {
                title: "Default Value",
                explanation: "If specified, there will be a button that allows you to quickly record this value.",
            },
            experimentStartTime: {
                title: "Analysis Start Date",
                explanation: "Data prior to this date will not be used in analysis.",
            },
            experimentEndTime: {
                title: "Analysis End Date",
                explanation: "Data after this date will not be used in analysis.",
            },
            thumbs: {
                title: "Help Me Learn",
                explanation: "I'm really good at finding correlations and even compensating for various onset delays and durations of action. " +
                "However, you're much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. " +
                "You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you don't think could possibly be causal.",
            }
        };
    }
    qmService.showMaterialAlert = function(title, textContent, ev){
        function AlertDialogController($scope, $mdDialog, dataToPass) {
            var self = this;
            self.title = dataToPass.title;
            self.textContent = dataToPass.textContent;
            $scope.hide = function() {$mdDialog.hide();};
            $scope.cancel = function() {$mdDialog.cancel();};
            $scope.answer = function(answer) {$mdDialog.hide(answer);};
        }
        $mdDialog.show({
            controller: AlertDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/dialogs/robot-alert.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {dataToPass: {title: title, textContent: textContent}}
        })
        .then(function(answer) {
            if(answer === "help"){qmService.goToState('app.help');}
            //$scope.status = 'You said the information was "' + answer + '".';
        }, function() {
            //$scope.status = 'You cancelled the dialog.';
        });
    };
    qmService.showMaterialConfirmationDialog = function(title, textContent, yesCallbackFunction, noCallbackFunction, ev){
        function ConfirmationDialogController($scope, $mdDialog, dataToPass) {
            var self = this;
            self.title = dataToPass.title;
            self.textContent = dataToPass.textContent;
            $scope.hide = function() {$mdDialog.hide();};
            $scope.cancel = function() {$mdDialog.cancel();};
            $scope.answer = function(answer) {$mdDialog.hide(answer);};
        }
        $mdDialog.show({
            controller: ConfirmationDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/dialogs/robot-confirmation.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {dataToPass: {title: title, textContent: textContent}}
        }).then(function(answer) {
            if(answer === "help"){qmService.goToState('app.help');}
            if(answer === 'yes'){yesCallbackFunction(ev);}
            if(answer === 'no' && noCallbackFunction){noCallbackFunction(ev);}
        }, function() {
            if(noCallbackFunction){noCallbackFunction(ev);}
        });
    };
    qmService.validationFailure = function (message, object) {
        qmService.showMaterialAlert(message);
        qmService.logError(message, null, {measurement: object});
    };
    qmService.valueIsValid = function(object, value){
        var message;
        if($rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName] && typeof $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue !== "undefined" && $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue !== null) {
            if(value < $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue){
                message = $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue + ' is the smallest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].name + ".  Please select another unit or value.";
                qmService.validationFailure(message);
                return false;
            }
        }
        if($rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName] && typeof $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue !== "undefined" && $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue !== null) {
            if(value > $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue){
                message = $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue + ' is the largest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].name + ".  Please select another unit or value.";
                qmService.validationFailure(message);
                return false;
            }
        }
        return true;
    };
    qmService.getInputType = function(unitAbbreviatedName, valence, variableName) {
        var inputType = 'value';
        if (variableName === 'Blood Pressure') {inputType = 'bloodPressure';}
        if (unitAbbreviatedName === '/5') {
            inputType = 'oneToFiveNumbers';
            if (valence === 'positive') {inputType = 'happiestFaceIsFive';}
            if (valence === 'negative') {inputType = 'saddestFaceIsFive';}
        }
        if (unitAbbreviatedName === 'yes/no') {inputType = 'yesOrNo';}
        return inputType;
    };
    qmService.formatValueUnitDisplayText = function(valueUnitText, abbreviatedUnitName){
        valueUnitText = valueUnitText.replace(' /', '/');
        valueUnitText = valueUnitText.replace('1 yes/no', 'YES');
        valueUnitText = valueUnitText.replace('0 yes/no', 'NO');
        if(abbreviatedUnitName){
            valueUnitText = valueUnitText.replace('(' + abbreviatedUnitName + ')', '');
        }
        return valueUnitText;
    };
    qmService.removeArrayElementsWithDuplicateIds = function(array) {
        var a = array.concat();
        for(var i = 0; i < a.length; i++) {
            for(var j = i + 1; j < a.length; j++) {
                if(!a[i]){qmService.logError('a[i] not defined!');}
                if(!a[j]){
                    qmService.logError('a[j] not defined!');
                    return a;
                }
                if(a[i].id === a[j].id) {
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    };
    var deleteAllMeasurementsForVariable = function(variableObject) {
        qmService.showBlackRingLoader();
        // Delete all measurements for a variable
        qmService.deleteAllMeasurementsForVariableDeferred(variableObject.id).then(function() {
            // If primaryOutcomeVariableName, delete local storage measurements
            if ($rootScope.variableName === qmService.getPrimaryOutcomeVariable().name) {
                qmService.setLocalStorageItem('primaryOutcomeVariableMeasurements',[]);
                qmService.setLocalStorageItem('measurementsQueue',[]);
                qmService.setLocalStorageItem('averagePrimaryOutcomeVariableValue',0);
                qmService.setLocalStorageItem('lastMeasurementSyncTime', 0);
            }
            qmService.hideLoader();
            qmService.goToState(config.appSettings.appDesign.defaultState);
            qmService.logDebug("All measurements for " + variableObject.name + " deleted!");
        }, function(error) {
            qmService.hideLoader();
            qmService.logDebug('Error deleting measurements: '+ JSON.stringify(error));
        });
    };
    qmService.showDeleteAllMeasurementsForVariablePopup = function(variableObject, ev){
        var title = 'Delete all ' + variableObject.name + " measurements?";
        var textContent = 'This cannot be undone!';
        function yesCallback() {deleteAllMeasurementsForVariable(variableObject);}
        function noCallback() {}
        qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    qmService.completelyResetAppStateAndSendToLogin = function(comeBackAfterLogin){
        qmService.logDebug("called qmService.completelyResetAppStateAndSendToLogin");
        if(comeBackAfterLogin){setAfterLoginGoToUrl();}
        qmService.completelyResetAppState();
        sendToLogin();
    };
    function sendToLogin() {
        if(getUrlParameter('access_token')){
            if(!qmService.getAccessTokenFromCurrentUrl()){
                qmService.logError("Not detecting snake case access_token", {}, getStackTrace());
            }
            qmService.logError("Why are we sending to login if we have an access token?", {}, getStackTrace());
            return;
        }
        qmService.logDebug("Sending to app.login");
        qmService.goToState("app.login");
    }
    qmService.sendToLogin = function() {
        qmService.logDebug("called qmService.sendToLogin");
        sendToLogin();
    };
    // Doesn't work yet
    function generateMovingAverageTimeSeries(rawMeasurements) {
        var smoothedMeasurements = [];
        var weightedPeriod = 10;
        var sum = 0;
        var j;
        var numberOfMeasurements = rawMeasurements.length;
        for (var i = 1; i <= numberOfMeasurements - weightedPeriod; i++) {
            if(numberOfMeasurements < 1000){
                for(j = 0; j < weightedPeriod; j++ ) {
                    sum += rawMeasurements[ i + j ].y * ( weightedPeriod - j );
                }
                rawMeasurements[i].y = sum / (( weightedPeriod * ( weightedPeriod + 1 )) / 2 );
            } else {
                for(j = 0; j < weightedPeriod; j++ ) {
                    sum += rawMeasurements[ i + j ][1] * ( weightedPeriod - j );
                }
                rawMeasurements[i][1] = sum / (( weightedPeriod * ( weightedPeriod + 1 )) / 2 );
            }
            smoothedMeasurements.push(rawMeasurements[i]);
        }
        return smoothedMeasurements;
    }
    qmService.goToStudyPageViaCorrelationObject = function(correlationObject){
        $rootScope.correlationObject = correlationObject;
        qmService.setLocalStorageItem('lastStudy', JSON.stringify(correlationObject));
        //qmService.goToState('app.study', {correlationObject: correlationObject});
        qmService.goToStudyPage(correlationObject.causeVariableName, correlationObject.effectVariableName);
    };
    qmService.goToStudyPage = function(causeVariableName, effectVariableName) {
        window.location.href = getStudyUrl(causeVariableName, effectVariableName);
    };
    function getStudyUrl(causeVariableName, effectVariableName) {
        return getBaseAppUrl() + "#/app/study?causeVariableName=" + causeVariableName + "&effectVariableName=" + effectVariableName;
    }
    function getBaseAppUrl(){
        return window.location.origin + window.location.pathname;
    }
    qmService.getPlanFeatureCards = function () {
        var planFeatureCards = [
            {
                title: 'QuantiModo Lite',
                headerColor: "#f2f9ff",
                backgroundColor: "#f2f9ff",
                subtitle: 'Improve your life!',
                featuresBasicList: [
                    {
                        title: '3 month data history',
                    },
                ],
                featuresAvatarList: [
                    {
                        title: 'Emotion Tracking',
                        subtitle: 'Turn data into happiness!',
                        moreInfo: $rootScope.variableCategories.Emotions.moreInfo,
                        image: $rootScope.variableCategories.Emotions.imageUrl,
                    },
                    {
                        title: 'Track Symptoms',
                        subtitle: 'in just seconds a day',
                        moreInfo: $rootScope.variableCategories.Symptoms.moreInfo,
                        image: $rootScope.variableCategories.Symptoms.imageUrl,
                    },
                    {
                        title: 'Track Diet',
                        subtitle: 'Identify dietary triggers',
                        moreInfo: $rootScope.variableCategories.Foods.moreInfo,
                        image: $rootScope.variableCategories.Foods.imageUrl,
                    },
                    {
                        title: 'Treatment Tracking',
                        subtitle: 'with reminders',
                        moreInfo: $rootScope.variableCategories.Treatments.moreInfo,
                        image: $rootScope.variableCategories.Treatments.imageUrl,
                    },
                ],
                priceHtml: "Price: Free forever",
                buttonText: "Sign Up Now",
                buttonClass: "button button-balanced"
            },
            {
                title: 'QuantiModo Plus',
                headerColor: "#f0df9a",
                backgroundColor: "#ffeda5",
                subtitle: 'Perfect your life!',
                featuresAvatarList: [
                    {
                        title: 'Import from Apps',
                        subtitle: 'Facebook, Google Calendar, Runkeeper, Github, Sleep as Android, MoodiModo, and even ' +
                        'the weather!',
                        moreInfo: "Automatically import your data from Google Calendar, Facebook, Runkeeper, " +
                        "QuantiModo, Sleep as Android, MoodiModo, Github, and even the weather!",
                        image: 'img/features/smartphone.svg'
                    },
                    {
                        title: 'Import from Devices',
                        subtitle: 'Fitbit, Jawbone Up, Withings...',
                        moreInfo: "Automatically import your data from Fitbit, Withings, Jawbone.",
                        image: 'img/features/smartwatch.svg'
                    },
                    {
                        title: 'Sync Across Devices',
                        subtitle: 'Web, Chrome, Android, and iOS',
                        moreInfo: "Any of your QuantiModo-supported apps will automatically sync with any other app " +
                        "on the web, Chrome, Android, and iOS.",
                        image: 'img/features/devices.svg'
                    },
                    {
                        title: 'Unlimited History',
                        subtitle: 'Lite gets 3 months',
                        moreInfo: "Premium accounts can see unlimited historical data (Free accounts can see only " +
                        "the most recent three months). This is great for seeing long-term trends in your " +
                        "productivity or getting totals for the entire year.",
                        image: 'img/features/calendar.svg'
                    },
                    {
                        title: 'Location Tracking',
                        subtitle: 'Automatically log places',
                        moreInfo: $rootScope.variableCategories.Location.moreInfo,
                        image: $rootScope.variableCategories.Location.imageUrl,
                    },
                    {
                        title: 'Purchase Tracking',
                        subtitle: 'Automatically log purchases',
                        moreInfo: $rootScope.variableCategories.Payments.moreInfo,
                        image: $rootScope.variableCategories.Payments.imageUrl,
                    },
                    {
                        title: 'Weather Tracking',
                        subtitle: 'Automatically log weather',
                        moreInfo: $rootScope.variableCategories.Environment.moreInfo,
                        image: $rootScope.variableCategories.Environment.imageUrl,
                    },
                    {
                        title: 'Productivity Tracking',
                        subtitle: 'Passively track app usage',
                        moreInfo: "You can do this by installing and connecting Rescuetime on the Import Data page.  Rescuetime is a program" +
                        " that runs on your computer & passively tracks of productivity and app usage.",
                        image: 'img/features/rescuetime.png',
                    },
                    {
                        title: 'Sleep Tracking',
                        subtitle: 'Automatically track sleep duration and quality',
                        moreInfo: $rootScope.variableCategories.Sleep.moreInfo,
                        image: $rootScope.variableCategories.Sleep.imageUrl,
                    },
                    {
                        title: 'Vital Signs',
                        subtitle: 'Keep your heart healthy',
                        moreInfo: "I can get your heart rate data from the Fitbit Charge HR, Fitbit Surge.  " +
                        "Resting heart rate is a good measure of general fitness, and heart rate during " +
                        "workouts show intensity.  I can also talk to Withing's bluetooth blood pressure monitor. ",
                        image: 'img/features/heart-like.png',
                    },
                    {
                        title: 'Physique',
                        subtitle: 'Monitor weight and body fat',
                        moreInfo: $rootScope.variableCategories.Physique.moreInfo,
                        image: $rootScope.variableCategories.Physique.imageUrl
                    },
                    {
                        title: 'Fitness Tracking',
                        subtitle: 'Steps and physical activity',
                        moreInfo: $rootScope.variableCategories['Physical Activity'].moreInfo,
                        image: $rootScope.variableCategories['Physical Activity'].imageUrl
                    },
                    {
                        title: 'Advanced Analytics',
                        subtitle: 'See Top Predictors',
                        moreInfo: "See a list of the strongest predictors for any outcome.  See the values for each " +
                        "predictor that typically precede optimal outcomes.  Dive deeper by checking " +
                        "out the full study on any predictor and outcome combination.",
                        image: 'img/features/calendar.svg'
                    },
                ],
                priceHtml: "14 day free trial <br> Monthly: $6.99/month <br> Annual: $4.99/month (4 months free!)",
                buttonText: "Start My 14 Day Free Trial",
                buttonClass: "button button-large button-assertive"
            },
        ];
        if($rootScope.isIOS){
            planFeatureCards = JSON.parse(JSON.stringify(planFeatureCards).replace('Android, and iOS', 'any mobile device').replace(', Sleep as Android', ''));
        }
        return planFeatureCards;
    };
    qmService.showBasicLoader = function(){
        qmService.logDebug("Called showBasicLoader in " + $state.current.name, getStackTrace());
        $ionicLoading.show({duration: 10000});
    };
    qmService.showBlackRingLoader = function(){
        if($rootScope.isIOS){
            qmService.showBasicLoader();  // Centering is messed up on iOS for some reason
        } else {
            $ionicLoading.show({templateUrl: "templates/loaders/ring-loader.html", duration: 10000});
        }
        qmService.logDebug("Called showBlackRingLoader in " + $state.current.name, getStackTrace());
    };
    qmService.hideLoader = function(delay){
        if(getUrlParameter('loaderDebug')){
            qmService.logDebug("Called hideLoader in " + $state.current.name, getStackTrace());
        }
        if(delay){
            $timeout(function() { $ionicLoading.hide(); }, delay * 1000);
        } else{
            $ionicLoading.hide();
        }
    };
    qmService.weShouldUseOAuthLogin = function(){
        return window.location.href.indexOf('.quantimo.do') === -1;
    };
    qmService.getUserFromLocalStorageOrRefreshIfNecessary = function(){
        qmService.logDebug("getUserFromLocalStorageOrRefreshIfNecessary");
        if(qmService.getUrlParameter('refreshUser')){
            qmService.clearLocalStorage();
            qmService.setLocalStorageItem('onboarded', true);
            qmService.setLocalStorageItem('introSeen', true);
            $rootScope.user = null;
            $rootScope.refreshUser = false;
        }
        if(!$rootScope.user){
            $rootScope.user = JSON.parse(qmService.getLocalStorageItemAsString('user'));
            if($rootScope.user){qmService.logDebug("Got user from local storage");}
        }
        qmService.refreshUserUsingAccessTokenInUrlIfNecessary();
        if($rootScope.user){
            qmService.registerDeviceToken(); // Try again in case it was accidentally deleted from server TODO: remove after 8/1 or so
            if(!$rootScope.user.trackLocation){ $rootScope.user.trackLocation = false; }
            if(!$rootScope.user.getPreviewBuilds){ $rootScope.user.getPreviewBuilds = false; }
            //qmSetupInPopup();
            //qmService.humanConnect();
        }
    };
    qmService.getPrivateConfigs = function(){
        $http.get('private_configs/default.private_config.json').success(function(response) {
            if(typeof response === "string"){qmService.logError('private_configs/default.response.json not found');} else {window.private_keys = response;}
        });
    };
    qmService.getDevCredentials = function(){
        return $http.get('private_configs/dev-credentials.json').success(function(response) {
            if(typeof response !== "string"){
                if(response.accessToken && !$rootScope.user){
                    qmService.logInfo("Using access token from dev-credentials.json");
                    qmService.saveAccessTokenInLocalStorage(response.accessToken);
                    qmService.refreshUser().then(function () {qmService.goToState(config.appSettings.appDesign.defaultState);});
                }
            } else {
                qmService.logDebug("dev-credentials.json response is a string");
            }
        });
    };
    qmService.humanConnect = function(){
        var options = {
            clientUserId: encodeURIComponent($rootScope.user.id),
            clientId: 'e043bd14114cb0fb5f0b358f3a8910545ca9525e',
            publicToken: ($rootScope.user.humanApiPublicToken) ? $rootScope.user.humanApiPublicToken : '',
            finish: function(err, sessionTokenObject) {
                /* Called after user finishes connecting their health data */
                //POST sessionTokenObject as-is to your server for step 2.
                qmService.post('api/v3/human/connect/finish', [], sessionTokenObject).then(function (response) {
                    console.log(response);
                    $rootScope.user = response.data.user;
                });
                // Include code here to refresh the page.
            },
            close: function() {
                /* (optional) Called when a user closes the popup
                 without connecting any data sources */
            },
            error: function(err) {
                /* (optional) Called if an error occurs when loading
                 the popup. */
            }
        };
        HumanConnect.open(options);
    };
    qmService.quantimodoConnectPopup = function(){
        window.QuantiModoIntegration.options = {
            clientUserId: encodeURIComponent($rootScope.user.id),
            clientId: $rootScope.appSettings.clientId,
            publicToken: ($rootScope.user.quantimodoPublicToken) ? $rootScope.user.quantimodoPublicToken : '',
            finish: function(err, sessionTokenObject) {
                /* Called after user finishes connecting their health data */
                //POST sessionTokenObject as-is to your server for step 2.
                qmService.post('api/v3/quantimodo/connect/finish', [], sessionTokenObject, function (response) {
                    console.log(response);
                    $rootScope.user = response.data.user;
                });
                // Include code here to refresh the page.
            },
            close: function() {
                /* (optional) Called when a user closes the popup
                 without connecting any data sources */
            },
            error: function(err) {
                /* (optional) Called if an error occurs when loading
                 the popup. */
            }
        };
        window.QuantiModoIntegration.openConnectorsListPopup();
    };
    function getStringAfterLastSlash(string) {
        var lastSlashIndex = string.lastIndexOf('/');
        return string.substring(lastSlashIndex  + 1);
    }
    function convertObjectToQueryString(obj){
        if(!obj){return '';}
        var str = [];
        for(var p in obj){
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        }
        return '?' + str.join("&");
    }
    function convertUrlAndParamsToHref(menuItem) {
        var params = (menuItem.params) ? menuItem.params : menuItem.stateParameters;
        if(!menuItem.subMenu){
            menuItem.href = '#/app' + menuItem.url;
            if(params && params.variableCategoryName){
                menuItem.href += "-category/" + params.variableCategoryName;
                delete(params.variableCategoryName);
            }
            menuItem.href += convertObjectToQueryString(params);
            menuItem.href = menuItem.href.replace('app/app', 'app');
        }
        if(qmService.getDebugMode()){ qmService.logDebug("convertUrlAndParamsToHref ", menuItem); }
        return menuItem;
    }
    function convertStateNameAndParamsToHref(menuItem) {
        menuItem.url = getUrlFromStateName(menuItem.stateName);
        return convertUrlAndParamsToHref(menuItem);
    }
    var allStates = $state.get();
    function prettyJsonStringify(json) {
        return JSON.stringify(json, null, '  ');
    }
    //qmService.logDebug(prettyJsonStringify(allStates));
    function stripQueryString(pathWithQuery) {
        if(!pathWithQuery){ return pathWithQuery; }
        if(pathWithQuery.indexOf('?') === -1){ return pathWithQuery; }
        return pathWithQuery.split("?")[0];
    }
    function convertUrlToLowerCaseStateName(menuItem){
        if(!menuItem.url){
            qmService.logDebug("no url to convert in " + JSON.stringify(menuItem));
            return menuItem;
        }
        return stripQueryString(menuItem.url).replace('/app/', 'app.').toLowerCase().replace('-', '');
    }
    function convertQueryStringToParams(menuItem){
        if(!menuItem.href){
            qmService.logDebug("No menuItem.href for " + JSON.stringify(menuItem));
            return menuItem;
        }
        if(menuItem.href && !menuItem.params){
            menuItem.params = getAllQueryParamsFromUrlString(menuItem.href);
        }
        menuItem.href = stripQueryString(menuItem.href);
        if(menuItem.href && menuItem.href.indexOf('-category') !== -1 && !menuItem.params.variableCategoryName){
            menuItem.params.variableCategoryName = getStringAfterLastSlash(menuItem.href).replace('?', '');
        }
        if(menuItem.params && menuItem.params.variableCategoryName){
            if(menuItem.href.indexOf('-category') === -1){menuItem.href += '-category';}
            if(menuItem.stateName.indexOf('Category') === -1){menuItem.stateName += 'Category';}
            if(menuItem.href.indexOf(menuItem.params.variableCategoryName) === -1){menuItem.href += '/' + menuItem.params.variableCategoryName;}
        }
        return menuItem;
    }
    function getUrlFromStateName(stateName){
        for(var i = 0; i < allStates.length; i++){
            if(allStates[i].name === stateName){ return allStates[i].url; }
        }
        qmService.logError("Could not find state with name: " + stateName);
    }
    qmService.convertHrefInSingleMenuType = function (menu){
        function convertStringToId(string) {
            return string.replace('#/app/', '').replace('/', '-').replace('?', '').replace('&', '-').replace('=', '-').toLowerCase();
        }
        function processMenuItem(menuItem) {
            function addMenuId(menuItem) {
                if(menuItem.href){menuItem.id = convertStringToId(menuItem.href);} else {menuItem.id = convertStringToId(menuItem.title);}
                return menuItem;
            }
            function addUrlToMenuItem(menuItem){
                if(menuItem.url){return menuItem;}
                if(menuItem.stateName){
                    menuItem.url = getUrlFromStateName(menuItem.stateName);
                    if(menuItem.url){return menuItem;}
                }
                if(menuItem.href){
                    for(var i = 0; i < allStates.length; i++){
                        if(menuItem.href.indexOf(allStates[i].url) !== -1){
                            menuItem.url = allStates[i].url;
                        }
                    }
                }
                return menuItem;
            }
            function addStateNameToMenuItem(menuItem){
                if(menuItem.stateName){return menuItem;}
                if(menuItem.url){
                    for(var i = 0; i < allStates.length; i++){
                        if(allStates[i].url === menuItem.url){
                            menuItem.stateName = allStates[i].name;
                            break;
                        }
                        var convertedLowerCaseStateName = convertUrlToLowerCaseStateName(menuItem);
                        if(allStates[i].name.toLowerCase() === convertedLowerCaseStateName){
                            menuItem.stateName = allStates[i].name;
                            break;
                        }
                    }
                }
                if(!menuItem.stateName){ qmService.logDebug("no state name for " + JSON.stringify(menuItem)); }
                return menuItem;
            }
            menuItem = addUrlToMenuItem(menuItem);
            menuItem = addStateNameToMenuItem(menuItem);
            menuItem = convertQueryStringToParams(menuItem);
            menuItem = convertUrlAndParamsToHref(menuItem);
            menuItem = addMenuId(menuItem);
            delete menuItem.url;
            return menuItem;
        }
        if(!menu){
            qmService.logDebug("No menu given to convertHrefInSingleMenuType");
            return;
        }
        for(var i =0; i < menu.length; i++){
            menu[i] = processMenuItem(menu[i]);
            if(menu[i].subMenu){
                for(var j =0; j < menu[i].subMenu.length; j++){
                    menu[i].subMenu[j] = processMenuItem(menu[i].subMenu[j]);
                }
            }
        }
        return menu;
    };
    qmService.convertHrefInFab = function(floatingActionButton) {
        qmService.logDebug("convertHrefInFab");
        for(var i = 1; i < 5; i++){
            floatingActionButton.active["button" + i] = convertStateNameAndParamsToHref(floatingActionButton.active["button" + i]);
            floatingActionButton.custom["button" + i] = convertStateNameAndParamsToHref(floatingActionButton.custom["button" + i]);
        }
        return floatingActionButton;
    };
    var toastPosition = angular.extend({},{ bottom: true, top: false, left: true, right: false });
    var getToastPosition = function() {return Object.keys(toastPosition).filter(function(pos) { return toastPosition[pos]; }).join(' ');};
    qmService.showInfoToast = function(text) {$mdToast.show($mdToast.simple().textContent(text).position(getToastPosition()).hideDelay(3000));};
    qmService.configureAppSettings = function(appSettings){
        function changeFavicon(){
            if(!$rootScope.appSettings.additionalSettings.appImages.favicon){return;}
            //noinspection JSAnnotator
            document.head || (document.head = document.getElementsByTagName('head')[0]);
            var link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
            link.id = 'dynamic-favicon';
            link.rel = 'shortcut icon';
            link.href = $rootScope.appSettings.additionalSettings.appImages.favicon;
            if (oldLink) {document.head.removeChild(oldLink);}
            document.head.appendChild(link);
        }
        if(!window.config){window.config = {};}
        window.config.appSettings = appSettings;
        window.config.appSettings.designMode = window.location.href.indexOf('configuration-index.html') !== -1;
        window.config.appSettings.appDesign.menu = convertStateNameAndParamsToHrefInActiveAndCustomMenus(window.config.appSettings.appDesign.menu);
        //window.config.appSettings.appDesign.menu = qmService.convertHrefInAllMenus(window.config.appSettings.appDesign.menu);  // Should be done on server
        //window.config.appSettings.appDesign.floatingActionButton = qmService.convertHrefInFab(window.config.appSettings.appDesign.floatingActionButton);
        $rootScope.appSettings = window.config.appSettings;
        qmService.logDebug("appSettings.clientId is " + $rootScope.appSettings.clientId);
        if(qmService.getDebugMode()){qmService.logDebug('$rootScope.appSettings: ' + JSON.stringify($rootScope.appSettings));}
        if(!$rootScope.appSettings.appDesign.ionNavBarClass){ $rootScope.appSettings.appDesign.ionNavBarClass = "bar-positive"; }
        changeFavicon();
    };
    function initializeLocalPopupNotifications(notificationSettings){
        //notificationSettings.every = "minute";
        if(!notificationSettings.sound){notificationSettings.sound = null;}
        $ionicPlatform.ready(function () {
            cordova.plugins.notification.local.schedule(notificationSettings, function(data){
                qmService.logInfo('scheduleGenericNotification: notification scheduled.  Settings: ' + JSON.stringify(notificationSettings));
                qmService.logInfo("cordova.plugins.notification.local callback. data: " + JSON.stringify(data));
                qmService.showPopupForMostRecentNotification();
            });
            cordova.plugins.notification.local.on("trigger", function (currentNotification) {
                qmService.logInfo("onTrigger: just triggered this notification: " + JSON.stringify(currentNotification));
                qmService.showPopupForMostRecentNotification();
            });
        });
    }
    function initializeLocalNotifications(){
        qmService.logInfo("initializeLocalNotifications: shouldWeUseIonicLocalNotifications returns: " + qmService.shouldWeUseIonicLocalNotifications());
        if (qmService.shouldWeUseIonicLocalNotifications()) {
            qmService.logInfo("Going to try setting on trigger and on click actions for notifications when device is ready");
            $ionicPlatform.ready(function () {
                qmService.scheduleAllNotificationsByTrackingReminders();
                qmService.logInfo("Setting on trigger and on click actions for notifications");
                qmService.setOnTriggerActionForLocalNotifications();
                qmService.setOnClickActionForLocalNotifications(qmService);
                qmService.setOnUpdateActionForLocalNotifications();
            });
        } else {
            qmService.logInfo("shouldWeUseIonicLocalNotifications is false");
        }
    }
    qmService.initializeApplication = function(appSettingsResponse){

        if(window.config){return;}
        var appSettings = (appSettingsResponse.data.appSettings) ? appSettingsResponse.data.appSettings : appSettingsResponse.data;
        qmService.configureAppSettings(appSettings);
        qmService.getUserFromLocalStorageOrRefreshIfNecessary();
        //putCommonVariablesInLocalStorageUsingJsonFile();
        putCommonVariablesInLocalStorageUsingApi();
        qmService.backgroundGeolocationInit();
        qmService.setupBugsnag();
        qmService.getUserAndSetupGoogleAnalytics();
        if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) { $rootScope.hideNavigationMenu = true; }
        //initializeLocalNotifications();
        qmService.scheduleSingleMostFrequentLocalNotification();
        if(getUrlParameter('finish_url')){$rootScope.finishUrl = getUrlParameter('finish_url', null, true);}
        if($rootScope.isAndroid && localStorage.getItem('drawOverAppsEnabled') === null){qmService.toggleDrawOverApps();}
    };
    function convertStateNameAndParamsToHrefInActiveAndCustomMenus(menu) {
        function convertStateNameAndParamsToHrefInAllMenuItems(menu){
            function convertStateNameAndParamsToHrefInSingleMenuItem(menuItem){
                if(!menuItem.stateName){
                    qmService.logDebug("No stateName on menu item", menuItem);
                    return menuItem;
                }
                if(menuItem.subMenu && menuItem.subMenu.length){
                    qmService.logDebug("menuItem is a parent", menuItem);
                    return menuItem;
                }
                for(var i = 0; i < allStates.length; i++){
                    if(menuItem.stateName === allStates[i].name){
                        menuItem.href = "#/app" + allStates[i].url;
                        if(menuItem.href.indexOf(":") !== -1){
                            var pieces = menuItem.href.split(":");
                            var paramName = pieces[pieces.length-1];
                            if(menuItem.params && menuItem.params[paramName]){
                                menuItem.href = menuItem.href.replace(":" + paramName, menuItem.params[paramName]);
                            } else {
                                menuItem.href = menuItem.href.replace(":" + paramName, "Anything");
                            }
                        }
                        return menuItem;
                    }
                }
            }
            for(var i =0; i < menu.length; i++){
                if(menu[i].subMenu){
                    for(var j =0; j < menu[i].subMenu.length; j++){
                        menu[i].subMenu[j] = convertStateNameAndParamsToHrefInSingleMenuItem(menu[i].subMenu[j]);
                    }
                } else {
                    menu[i] = convertStateNameAndParamsToHrefInSingleMenuItem(menu[i]);
                }
            }
            return menu;
        }
        menu.active = convertStateNameAndParamsToHrefInAllMenuItems(menu.active);
        if(menu.custom){menu.custom = convertStateNameAndParamsToHrefInAllMenuItems(menu.custom);}
        return menu;
    }
    function convertUnixTimeStampToISOString(UNIX_timestamp){
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }
    function checkHoursSinceLastPushNotificationReceived() {
      if(!$rootScope.isMobile){return;}
      var lastPushTimestamp =  localStorage.getItem('lastPushTimestamp');
      if(!lastPushTimestamp){
        qmService.logError("Push never received!");
        reconfigurePushNotificationsIfNoTokenOnServerOrToSync();
      }
      var hoursSinceLastPushRecieved = (window.getUnixTimestampInSeconds - localStorage.getItem('lastPushTimestamp'))/3600;
      if(hoursSinceLastPushRecieved > 24){
        qmService.logError("No pushes received in last 24 hours!");
        reconfigurePushNotificationsIfNoTokenOnServerOrToSync();
      }
    }
    function reconfigurePushNotificationsIfNoTokenOnServerOrToSync() {
      if($rootScope.isMobile && !localStorage.getItem('deviceTokenOnServer') && !localStorage.getItem('deviceTokenToSync')){
          qmService.logError("No device token on deviceTokenOnServer or deviceTokenToSync! Going to reconfigure push notifications");
          qmService.configurePushNotifications();
      }
    }
    qmService.sendBugReport = function() {
        qmService.registerDeviceToken(); // Try again in case it was accidentally deleted from server
        function addAppInformationToTemplate(template){
            function addSnapShotList(template) {
                if(typeof $ionicDeploy !== "undefined"){
                    $ionicPlatform.ready(function () {
                        var snapshotList;
                        $ionicDeploy.getSnapshots().then(function (snapshots) {
                            for (var i = 0; i < snapshots.length; i++) {
                                snapshotList = snapshotList + '\r\n' + snapshots[i];
                            }
                            template = template + '\r\n' + "Snapshots: " + snapshotList;
                        });
                    });
                }
                return template;
            }
            if(localStorage.getItem('deviceTokenOnServer')){template = template + '\r\n' + "deviceTokenOnServer: " + localStorage.getItem('deviceTokenOnServer') + '\r\n' + '\r\n';}
            if(localStorage.getItem('deviceTokenToSync')){template = template + '\r\n' + "deviceTokenToSync: " + localStorage.getItem('deviceTokenToSync') + '\r\n' + '\r\n';}
            reconfigurePushNotificationsIfNoTokenOnServerOrToSync();
            if(localStorage.getItem('lastPushTimestamp')){
                template = template + '\r\n' + "lastPushReceived: " + convertUnixTimeStampToISOString(localStorage.getItem('lastPushTimestamp')) + '\r\n' + '\r\n';
            } else {
                template + '\r\n' + "lastPushReceived: NEVER " + '\r\n' + '\r\n';
            }
            template = template + "QuantiModo Client ID: " + qmService.getClientId() + '\r\n';
            template = template + "Platform: " + $rootScope.currentPlatform + '\r\n';
            template = template + "User ID: " + $rootScope.user.id + '\r\n';
            template = template + "User Email: " + $rootScope.user.email + '\r\n';
            //template = template + "App Settings: " + prettyJsonStringify(config.appSettings) + '\r\n';
            template = template + "inAppPurchase installed: " + (typeof window.inAppPurchase !== "undefined") + '\r\n';
            template = template + "PushNotification installed: " + (typeof PushNotification !== "undefined") + '\r\n';
            template = template + "Splashscreen plugin installed: " + (navigator && navigator.splashscreen) + '\r\n';
            template = addSnapShotList(template);
            qmService.logError("Bug Report");
            return template;
        }
        var subjectLine = encodeURIComponent( $rootScope.appSettings.appDisplayName + ' ' + config.appSettings.versionNumber + ' Bug Report');
        var template = "Please describe the issue here:  " + '\r\n' + '\r\n' + '\r\n' + '\r\n' +
            "Additional Information: " + '\r\n';
        template = addAppInformationToTemplate(template);
        var emailBody = encodeURIComponent(template);
        var emailAddress = 'mike@quantimo.do';
        var fallbackUrl = 'http://help.quantimo.do';
        if($rootScope.isMobile){qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
        } else {qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);}
    };
    qmService.logEventToGA = function(category, action, label, value, noninteraction, customDimension, customMetric){
        if(!label){label = $rootScope.user.id.toString();}
        if(typeof noninteraction === "undefined"){noninteraction = true;}
        Analytics.trackEvent(category, action, label, value, noninteraction, { dimension15: 'My Custom Dimension', metric18: 8000 });
    };
    qmService.configurePushNotifications = function(){
        if($rootScope.isMobile){if(typeof PushNotification === "undefined"){qmService.reportErrorDeferred('PushNotification is undefined on mobile!');}}
        if (typeof PushNotification !== "undefined") {
            var pushConfig = {
                android: {senderID: "1052648855194", badge: true, sound: false, vibrate: false, icon: 'ic_stat_icon_bw', clearBadge: true},
                browser: {pushServiceURL: 'http://push.api.phonegap.com/v1/push'},
                ios: {alert: "false", badge: "true", sound: "false", clearBadge: true},
                windows: {}
            };
            qmService.logDebug("Going to try to register push with " + JSON.stringify(pushConfig));
            var push = PushNotification.init(pushConfig);
            push.on('registration', function(registerResponse) {
                qmService.logInfo('Registered device for push notifications.  registerResponse: ' + JSON.stringify(registerResponse));
                if(!registerResponse.registrationId){qmService.bugsnagNotify('No registerResponse.registrationId from push registration');}
                qmService.logInfo("Got device token for push notifications: " + registerResponse.registrationId);
                var deviceTokenOnServer = localStorage.getItem('deviceTokenOnServer');
                if(!deviceTokenOnServer || registerResponse.registrationId !== deviceTokenOnServer){
                    qmService.setLocalStorageItem('deviceTokenToSync', registerResponse.registrationId);
                }
            });
            var finishPushes = true;  // Setting to false didn't solve notification dismissal problem
            push.on('notification', function(data) {
                qmService.logDebug('Received push notification: ' + JSON.stringify(data));
                qmService.updateLocationVariablesAndPostMeasurementIfChanged();
                if(typeof window.overApps !== "undefined" && data.additionalData.unitAbbreviatedName === '/5'){
                    qmService.drawOverAppsNotification(data.additionalData);
                } else {
                    qmService.refreshTrackingReminderNotifications(300).then(function(){
                        qmService.logDebug('push.on.notification: successfully refreshed notifications');
                    }, function (error) {
                        console.error('push.on.notification: ' + error);
                    });
                }

                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
                if(!finishPushes) {
                    qmService.logDebug('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                    return;
                }
                push.finish(function () {qmService.logDebug("processing of push data is finished: " + JSON.stringify(data));});
                data.deviceToken = localStorage.getItem('deviceTokenOnServer');
                qmService.logEventToGA('pushNotification', 'received');
                if(data.additionalData.acknowledge){
                    $http.post("https://utopia.quantimo.do/api/v1/trackingReminderNotification/received", data)
                        .success(function (response) {
                            qmService.logDebug("notification received success response: " + JSON.stringify(response));
                        }).error(function (response) {
                        qmService.logError("notification received error response: "  + JSON.stringify(response));
                    });
                }
            });
            push.on('error', function(e) {qmService.reportException(e, e.message, pushConfig);});
            var finishPush = function (data) {
                qmService.setLocalStorageItem('lastPushTimestamp', window.getUnixTimestampInSeconds());
                $rootScope.$broadcast('getTrackingReminderNotificationsFromLocalStorage');  // Refresh Reminders Inbox
                if(!finishPushes){
                    qmService.logDebug('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                    return;
                }
                push.finish(function() {
                    qmService.logDebug('accept callback finished for data.additionalData.notId: ' + data.additionalData.notId);
                }, function() {
                    qmService.logDebug('accept callback failed for data.additionalData.notId: ' + data.additionalData.notId);
                }, data.additionalData.notId);
            };
            window.trackYesAction = function (data){
                qmService.logDebug("trackYesAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 1};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackNoAction = function (data){
                qmService.logDebug("trackNoAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 0};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackZeroAction = function (data){
                qmService.logDebug("trackZeroAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 0};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackOneRatingAction = function (data){
                qmService.logDebug("trackOneRatingAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 1};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackTwoRatingAction = function (data){
                qmService.logDebug("trackTwoRatingAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 2};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackThreeRatingAction = function (data){
                qmService.logDebug("trackThreeRatingAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 3};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackFourRatingAction = function (data){
                qmService.logDebug("trackFourRatingAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 4};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackFiveRatingAction = function (data){
                qmService.logDebug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 5};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackDefaultValueAction = function (data){
                qmService.logDebug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.snoozeAction = function (data){
                qmService.logDebug("snoozeAction push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId};
                qmService.snoozeTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackLastValueAction = function (data){
                qmService.logDebug("trackLastValueAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: data.additionalData.lastValue};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackSecondToLastValueAction = function (data){
                qmService.logDebug("trackSecondToLastValueAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: data.additionalData.secondToLastValue};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
            window.trackThirdToLastValueAction = function (data){
                qmService.logDebug("trackThirdToLastValueAction Push data: " + JSON.stringify(data));
                var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: data.additionalData.thirdToLastValue};
                qmService.trackTrackingReminderNotificationDeferred(body);
                finishPush(data);
            };
        }
        window.notification_callback = function(reportedVariable, reportingTime){
            var startTime  = Math.floor(reportingTime/1000) || Math.floor(new Date().getTime()/1000);
            var val = false;
            if(reportedVariable === "repeat_rating"){
                val = localStorage['lastReportedPrimaryOutcomeVariableValue']? JSON.parse(localStorage['lastReportedPrimaryOutcomeVariableValue']) : false;
            } else {
                val = qmService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[reportedVariable]? qmService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[reportedVariable] : false;
            }
            if(val){
                localStorage['lastReportedPrimaryOutcomeVariableValue'] = val;
                var allMeasurementsObject = {storedValue : val, value : val, startTime : startTime};
                if(localStorage['primaryOutcomeVariableMeasurements']){
                    var allMeasurements = JSON.parse(localStorage['primaryOutcomeVariableMeasurements']);
                    allMeasurements.push(allMeasurementsObject);
                    localStorage['primaryOutcomeVariableMeasurements'] = JSON.stringify(allMeasurements);
                }
                if(localStorage['measurementsQueue']){
                    var measurementsQueue = JSON.parse(localStorage['measurementsQueue']);
                    measurementsQueue.push(allMeasurementsObject);
                    localStorage['measurementsQueue'] = JSON.stringify(measurementsQueue);
                }
            }
        };
        qmService.registerDeviceToken();
    };
    qmService.setupVariableByVariableObject = function(variableObject) {
        $rootScope.variableName = variableObject.name;
        $rootScope.variableObject = variableObject;
    };
    // qmService.autoUpdateApp = function () {
    //     var appUpdatesDisabled = true;
    //     if(appUpdatesDisabled){
    //         qmService.logDebug("App updates disabled until more testing is done");
    //         return;
    //     }
    //     if(!$rootScope.isMobile){
    //         qmService.logDebug("Cannot update app because platform is not mobile");
    //         return;
    //     }
    //     qmService.updateApp();
    // };
    // qmService.updateApp = function () {
    //     var message;
    //     var releaseTrack;
    //     $ionicPlatform.ready(function () {
    //         if(typeof $ionicCloudProvider == "undefined"){
    //             console.warn('$ionicCloudProvider is not defined so we cannot use ionic deploy');
    //             return;
    //         }
    //         // We might need to move this back to app.js if it doesn't work
    //         if(config.appSettings.additionalSettings.ionicAppId){
    //             $ionicCloudProvider.init({
    //                     "core": {
    //                         "app_id": config.appSettings.additionalSettings.ionicAppId
    //                     }
    //             });
    //         } else {
    //             console.warn('Cannot initialize $ionicCloudProvider because appSettings.additionalSettings.ionicAppId is not set');
    //             return;
    //         }
    //         if($rootScope.user && $rootScope.user.getPreviewBuilds){
    //             $ionicDeploy.channel = 'staging';
    //             releaseTrack = "beta";
    //         } else {
    //             $ionicDeploy.channel = 'production';
    //             releaseTrack = "production";
    //             message = 'Not updating because user is not signed up for preview builds';
    //             qmService.logDebug(message);
    //             qmService.logError(message);
    //             return;
    //         }
    //         message = 'Checking for ' + releaseTrack + ' updates...';
    //         qmService.showInfoToast(message);
    //         $ionicDeploy.check().then(function(snapshotAvailable) {
    //             if (snapshotAvailable) {
    //                 message = 'Downloading ' + releaseTrack + ' update...';
    //                 qmService.logDebug(message);
    //                 if($rootScope.isAndroid){
    //                     qmService.showInfoToast(message);
    //                 }
    //                 qmService.logError(message);
    //                 // When snapshotAvailable is true, you can apply the snapshot
    //                 $ionicDeploy.download().then(function() {
    //                     message = 'Downloaded new version.  Extracting...';
    //                     qmService.logDebug(message);
    //                     if($rootScope.isAndroid){
    //                         qmService.showInfoToast(message);
    //                     }
    //                     qmService.logError(message);
    //                     $ionicDeploy.extract().then(function() {
    //                         if($rootScope.isAndroid){
    //                             $ionicPopup.show({
    //                                 title: 'Update available',
    //                                 //subTitle: '',
    //                                 template: 'An update was just downloaded. Would you like to restart your app to use the latest features?',
    //                                 buttons: [
    //                                     { text: 'Not now' },
    //                                     {
    //                                         text: 'Restart',
    //                                         onTap: function(e) {
    //                                             $ionicDeploy.load();
    //                                         }
    //                                     }
    //                                 ]
    //                             });
    //                         }
    //                     });
    //                 });
    //             } else {
    //                 message = 'No updates available';
    //                 if($rootScope.isAndroid){
    //                     qmService.showInfoToast(message);
    //                 }
    //                 qmService.logDebug(message);
    //                 qmService.logError(message);
    //             }
    //         });
    //     });
    // };
    function isFalsey(value) {if(value === false || value === "false"){return true;}}
    qmService.drawOverAppsNotification = function(trackingReminderNotification) {
        if(!$rootScope.isAndroid){
            qmService.logDebug("Can only show popups on android");
            return;
        }
        if(isFalsey(localStorage.getItem('drawOverAppsEnabled'))){
            window.logDebug("drawOverApps is disabled");
            return;
        }
        $ionicPlatform.ready(function() {window.drawOverAppsNotification(trackingReminderNotification);});
    };
    qmService.toggleDrawOverApps = function(ev){
        function disablePopups() {
            qmService.showInfoToast("Rating popups disabled");
            qmService.setLocalStorageItem('drawOverAppsEnabled', false);
        }
        function showEnablePopupsConfirmation(){
            var title = 'Enable Rating Popups';
            var textContent = 'Would you like to receive subtle popups allowing you to rating symptoms or emotions in a fraction of a second?';
            function yesCallback() {
                qmService.scheduleSingleMostFrequentLocalNotification();
                window.overApps.checkPermission(function(msg){console.log(msg);});
                qmService.setLocalStorageItem('drawOverAppsEnabled', true);
                qmService.showPopupForMostRecentNotification();
            }
            function noCallback() {disablePopups();}
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        }
        if(drawOverAppsEnabled()){disablePopups();} else {showEnablePopupsConfirmation();}
    };
    function drawOverAppsEnabled(){return localStorage.getItem('drawOverAppsEnabled') === 'true';}
    qmService.showPopupForMostRecentNotification = function(){
        if(!drawOverAppsEnabled()){qmService.logInfo("Can only show popups on Android"); return;}
        window.showPopupForMostRecentNotification();
    };
    return qmService;
});
