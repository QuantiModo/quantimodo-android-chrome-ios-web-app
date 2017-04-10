angular.module('starter').factory('quantimodoService', function($http, $q, $rootScope, $ionicPopup, $state, $timeout, $ionicPlatform, $mdDialog,
                                           $cordovaGeolocation, CacheFactory, $ionicLoading, Analytics, wikipediaFactory, $ionicHistory) {
    var quantimodoService = {};
    $rootScope.offlineConnectionErrorShowing = false; // to prevent more than one popup
    // GET method with the added token
    quantimodoService.get = function(route, allowedParams, params, successHandler, errorHandler, options){
        if(!options){ options = {}; }
        var cache = false;
        if(params && params.cache){
            cache = params.cache;
            params.cache = null;
        }
        if(!canWeMakeRequestYet('GET', route, options)){ return; }
        if($state.current.name === 'app.intro'){
            console.warn('Not making request to ' + route + ' user because we are in the intro state');
            return;
        }
        console.debug('quantimodoService.get: Going to try to make request to ' + route + " with params: " + JSON.stringify(params));
        quantimodoService.getAccessTokenFromAnySource().then(function(accessToken) {
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
                    } else {console.warn("Not including parameter " + property + " in request because it is null or undefined");}
                }
            }
            urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent(config.appSettings.appDisplayName));
            urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent(config.appSettings.versionNumber));
            urlParams.push(encodeURIComponent('client_id') + '=' + encodeURIComponent(quantimodoService.getClientId()));
            if(window.private_keys.username){urlParams.push(encodeURIComponent('log') + '=' + encodeURIComponent(window.private_keys.username));}
            if(window.private_keys.password){urlParams.push(encodeURIComponent('pwd') + '=' + encodeURIComponent(window.private_keys.password));}
            if(quantimodoService.getUrlParameter('userId')){urlParams.push(encodeURIComponent('userId') + '=' + quantimodoService.getUrlParameter('userId'));}
            //We can't append access token to Ionic requests for some reason
            //urlParams.push(encodeURIComponent('access_token') + '=' + encodeURIComponent(tokenObject.accessToken));
            // configure request
            var request = {
                method: 'GET',
                url: (quantimodoService.getQuantiModoUrl(route) + ((urlParams.length === 0) ? '' : urlParams.join('&'))),
                responseType: 'json',
                headers: {
                    'Content-Type': "application/json"
                },
            };
            if(cache){ request.cache = cache; }
            if (accessToken) {
                request.headers = {
                    "Authorization": "Bearer " + accessToken,
                    'Content-Type': "application/json"
                };
            }
            //console.debug("Making this request: " + JSON.stringify(request));
            console.debug('quantimodoService.get: ' + request.url);
            $http(request)
                .success(function (data, status, headers) {
                    console.debug("success response from " + request.url);
                    if(!data) {
                        if (typeof Bugsnag !== "undefined") {
                            var groupingHash = 'No data returned from this request';
                            Bugsnag.notify(groupingHash, status + " response from url " + request.url, {groupingHash: groupingHash}, "error");
                        }
                    } else if (data.error) {
                        quantimodoService.errorHandler(data, status, headers, request, options);
                        errorHandler(data);
                    } else {
                        quantimodoService.successHandler(data, route, status);
                        successHandler(data);
                    }
                })
                .error(function (data, status, headers) {
                    console.error("error response from " + request.url);
                    quantimodoService.errorHandler(data, status, headers, request, options);
                    errorHandler(data);
                }, onRequestFailed);
        });
    };
    // POST method with the added token
    quantimodoService.post = function(baseURL, requiredFields, body, successHandler, errorHandler, options){
        if($rootScope.offlineConnectionErrorShowing){ $rootScope.offlineConnectionErrorShowing = false; }
        console.debug('quantimodoService.post: About to try to post request to ' + baseURL + ' with body: ' +
            JSON.stringify(body).substring(0, 140));
        quantimodoService.getAccessTokenFromAnySource().then(function(accessToken){
            //console.debug("Token : ", token.accessToken);
            // configure params
            for (var i = 0; i < body.length; i++)
            {
                var item = body[i];
                for (var j = 0; j < requiredFields.length; j++) {
                    if (!(requiredFields[j] in item)) {
                        quantimodoService.reportError('Missing required field ' + requiredFields[j] + ' in ' + baseURL + ' request!');
                        //throw 'missing required field in POST data; required fields: ' + requiredFields.toString();
                    }
                }
            }
            var urlParams = [];
            urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent(config.appSettings.appDisplayName));
            urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent(config.appSettings.versionNumber));
            urlParams.push(encodeURIComponent('client_id') + '=' + encodeURIComponent(quantimodoService.getClientId()));
            var url = quantimodoService.getQuantiModoUrl(baseURL) + ((urlParams.length === 0) ? '' : urlParams.join('&'));
            // configure request
            var request = {
                method : 'POST',
                url: url,
                responseType: 'json',
                headers : {
                    'Content-Type': "application/json",
                    'Accept': "application/json"
                },
                data : JSON.stringify(body)
            };
            if(accessToken) {
                request.headers = {
                    "Authorization" : "Bearer " + accessToken,
                    'Content-Type': "application/json",
                    'Accept': "application/json"
                };
            }
            $http(request).success(successHandler).error(function(data, status, headers){
                quantimodoService.errorHandler(data, status, headers, request, options);
                if(errorHandler){errorHandler(data);}
            });
        }, errorHandler);
    };
    quantimodoService.successHandler = function(data, baseURL, status){
        var maxLength = 140;
        console.debug(status + ' response from ' + baseURL + ': ' +  JSON.stringify(data).substring(0, maxLength) + '...');
        if($rootScope.offlineConnectionErrorShowing){ $rootScope.offlineConnectionErrorShowing = false; }
        if(data.message){ console.warn(data.message); }
    };
    quantimodoService.errorHandler = function(data, status, headers, request, options){
        if(status === 302){
            console.warn('quantimodoService.errorHandler: Got 302 response from ' + JSON.stringify(request));
            return;
        }
        if(status === 401){
            if(options && options.doNotSendToLogin){
                return;
            } else {
                console.warn('quantimodoService.errorHandler: Sending to login because we got 401 with request ' +
                    JSON.stringify(request));
                quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
                console.debug("set afterLoginGoTo to " + window.location.href);
                if (quantimodoService.getClientId() !== 'oAuthDisabled') {
                    $rootScope.sendToLogin();
                } else {
                    var register = true;
                    quantimodoService.sendToNonOAuthBrowserLoginUrl(register);
                }
                return;
            }
        }
        if(status === 502){quantimodoService.reportError('502 from ' + request.method + ' ' + request.url);}
        if(status === 400){quantimodoService.reportError('400 from ' + request.method + ' ' + request.url);}
        if(status === 404){quantimodoService.reportError('404 from ' + request.method + ' ' + request.url);}
        var groupingHash;
        if(!data){
            if (typeof Bugsnag !== "undefined") {
                groupingHash = 'No data returned from this request';
                Bugsnag.notify(groupingHash, status + " response from url " + request.url, {groupingHash: groupingHash}, "error");
            }
            var doNotShowOfflineError = false;
            if(options && options.doNotShowOfflineError){doNotShowOfflineError = true;}
            if (!$rootScope.offlineConnectionErrorShowing && !doNotShowOfflineError) {
                console.error("Showing offline indicator because no data was returned from this request: "  + JSON.stringify(request));
                $rootScope.offlineConnectionErrorShowing = true;
                if($rootScope.isIOS){
                    $ionicPopup.show({
                        title: 'NOT CONNECTED',
                        //subTitle: '',
                        template: 'Either you are not connected to the internet or the QuantiModo server cannot be reached.',
                        buttons:[
                            {text: 'OK', type: 'button-positive', onTap: function(){$rootScope.offlineConnectionErrorShowing = false;}}
                        ]
                    });
                }
            }
            return;
        }
        if (typeof Bugsnag !== "undefined") {
            groupingHash = "There was an error and the request object was not provided to the quantimodoService.errorHandler";
            if(request){groupingHash = request.url + ' error';}
            if(data.error){
                groupingHash = JSON.stringify(data.error);
                if(data.error.message){groupingHash = JSON.stringify(data.error.message);}
            }
            Bugsnag.notify(groupingHash, status + " response from " + request.url + '. DATA: ' + JSON.stringify(data), {groupingHash: groupingHash}, "error");
        }
        console.error(status + " response from " + request.url + '. DATA: ' + JSON.stringify(data));
        if(data.success){console.error('Called error handler even though we have data.success');}
    };
    // Handler when request is failed
    var onRequestFailed = function(error){
        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
        console.error("Request error : " + error);
    };
    var canWeMakeRequestYet = function(type, baseURL, options){
        if(!options || !options.minimumSecondsBetweenRequests){return true;}
        var requestVariableName = 'last_' + type + '_' + baseURL.replace('/', '_') + '_request_at';
        if(localStorage.getItem(requestVariableName) && localStorage.getItem(requestVariableName) > Math.floor(Date.now() / 1000) - options.minimumSecondsBetweenRequests){
            console.debug('quantimodoService.get: Cannot make ' + type + ' request to ' + baseURL + " because " + "we made the same request within the last " + options.minimumSecondsBetweenRequests + ' seconds');
            return false;
        }
        localStorage.setItem(requestVariableName, Math.floor(Date.now() / 1000));
        return true;
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
    quantimodoService.getMeasurementsFromApi = function(params, successHandler, errorHandler){
        quantimodoService.get('api/v1/measurements', ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'],
            params, successHandler, errorHandler);
    };
    quantimodoService.getMeasurementsDeferred = function(params, refresh){
        var deferred = $q.defer();
        if(!refresh){
            var cachedMeasurements = quantimodoService.getCachedResponse('getV1Measurements', params);
            if(cachedMeasurements){
                deferred.resolve(cachedMeasurements);
                return deferred.promise;
            }
        }
        if(refresh){
            //deleteCache(getCurrentFunctionName());
        }
        //params.cache = getCache(getCurrentFunctionName(), 15);
        quantimodoService.getMeasurementsFromApi(params, function(response){
            quantimodoService.storeCachedResponse('getMeasurementsFromApi', params, response);
            deferred.resolve(quantimodoService.addInfoAndImagesToMeasurements(response));
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getMeasurementById = function(measurementId){
        var deferred = $q.defer();
        var params = {id : measurementId};
        quantimodoService.getMeasurementsFromApi(params, function(response){
            var measurementArray = response;
            if(!measurementArray[0]){
                console.debug('Could not get measurement with id: ' + measurementId);
                deferred.reject();
            }
            var measurementObject = measurementArray[0];
            deferred.resolve(measurementObject);
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            console.debug(error);
            deferred.reject();
        });
        return deferred.promise;
    };
    quantimodoService.getMeasurementsDailyFromApi = function(params, successHandler, errorHandler){
        quantimodoService.get('api/v1/measurements/daily',
            ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'], params, successHandler, errorHandler);
    };
    quantimodoService.getMeasurementsDailyFromApiDeferred = function(params, successHandler, errorHandler){
        var deferred = $q.defer();
        quantimodoService.getMeasurementsDailyFromApi(params, function(dailyHistory){deferred.resolve(dailyHistory);}, function(error){deferred.reject(error);});
        return deferred.promise;
    };

    quantimodoService.deleteV1Measurements = function(measurements, successHandler, errorHandler){
        quantimodoService.post('api/v1/measurements/delete', ['variableId', 'variableName', 'startTimeEpoch', 'id'], measurements, successHandler, errorHandler);
    };
    quantimodoService.postMeasurementsExport = function(type) {
        quantimodoService.post('api/v2/measurements/request_' . type, [], [], quantimodoService.successHandler, quantimodoService.errorHandler);
    };
    // post new Measurements for user
    quantimodoService.postMeasurementsToApi = function(measurementSet, successHandler, errorHandler){
        quantimodoService.post('api/v1/measurements',
            //['measurements', 'variableName', 'source', 'variableCategoryName', 'unitAbbreviatedName'],
            [], measurementSet, successHandler, errorHandler);

    };
    quantimodoService.logoutOfApi = function(successHandler, errorHandler){
        //TODO: Fix this
        console.debug('Logging out of api does not work yet.  Fix it!');
        quantimodoService.get('api/v2/auth/logout', [], {}, successHandler, errorHandler);
    };
    quantimodoService.getAggregatedCorrelationsFromApi = function(params, successHandler, errorHandler){
        var options = {};
        quantimodoService.get('api/v1/aggregatedCorrelations', ['correlationCoefficient', 'causeVariableName', 'effectVariableName'], params, successHandler, errorHandler, options);
    };
    quantimodoService.getNotesFromApi = function(params, successHandler, errorHandler){
        var options = {};
        quantimodoService.get('api/v1/notes', ['variableName'], params, successHandler, errorHandler, options);
    };
    quantimodoService.getUserCorrelationsFromApi = function (params, successHandler, errorHandler) {
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        quantimodoService.get('api/v3/correlations', ['correlationCoefficient', 'causeVariableName', 'effectVariableName'], params, successHandler, errorHandler);
    };
    quantimodoService.postCorrelationToApi = function(correlationSet, successHandler ,errorHandler){
        quantimodoService.post('api/v1/correlations', ['causeVariableName', 'effectVariableName', 'correlation', 'vote'], correlationSet, successHandler, errorHandler);
    };
    quantimodoService.postVoteToApi = function(correlationSet, successHandler ,errorHandler){
        quantimodoService.post('api/v1/votes', ['causeVariableName', 'effectVariableName', 'correlation', 'vote'], correlationSet, successHandler, errorHandler);
    };
    quantimodoService.deleteVoteToApi = function(correlationSet, successHandler ,errorHandler){
        quantimodoService.post('api/v1/votes/delete', ['causeVariableName', 'effectVariableName', 'correlation'], correlationSet, successHandler, errorHandler);
    };
    quantimodoService.searchUserVariablesFromApi = function(query, params, successHandler, errorHandler){
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        quantimodoService.get('api/v1/variables/search/' + encodeURIComponent(query), ['limit','includePublic', 'manualTracking'], params, successHandler, errorHandler, options);
    };
    quantimodoService.getVariablesByNameFromApi = function(variableName, params, successHandler, errorHandler){
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        quantimodoService.get('api/v1/variables/' + encodeURIComponent(variableName), [], params, successHandler, errorHandler, options);
    };
    quantimodoService.getPublicVariablesByNameFromApi = function(variableName, successHandler, errorHandler){
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        quantimodoService.get('api/v1/public/variables', ['name'], {name: variableName}, successHandler, errorHandler);
    };
    quantimodoService.getVariableByIdFromApi = function(variableId, successHandler, errorHandler){
        quantimodoService.get('api/v1/variables' , ['id'], {id: variableId}, successHandler, errorHandler);
    };
    quantimodoService.getUserVariablesFromApi = function(params, successHandler, errorHandler){
        var options = {};
        //options.cache = getCache(getCurrentFunctionName(), 15);
        if(!params){params = {};}
        if(!params.limit){params.limit = 200;}
        if(params.variableCategoryName && params.variableCategoryName === 'Anything'){params.variableCategoryName = null;}
        quantimodoService.get('api/v1/variables', ['variableCategoryName', 'limit'], params, successHandler, errorHandler);
    };
    quantimodoService.postUserVariableToApi = function(userVariable, successHandler, errorHandler) {
        quantimodoService.post('api/v1/userVariables',
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
    quantimodoService.resetUserVariable = function(body, successHandler, errorHandler) {
        quantimodoService.post('api/v1/userVariables/reset', ['variableId'], body, successHandler, errorHandler);
    };
    quantimodoService.deleteUserVariableMeasurements = function(variableId, successHandler, errorHandler) {
        quantimodoService.deleteElementsOfLocalStorageItemByProperty('userVariables', 'variableId', variableId);
        quantimodoService.deleteElementOfLocalStorageItemById('commonVariables', variableId);
        quantimodoService.post('api/v1/userVariables/delete', ['variableId'], {variableId: variableId}, successHandler, errorHandler);
    };
    quantimodoService.getVariableCategoriesFromApi = function(successHandler, errorHandler){
        quantimodoService.get('api/variableCategories', [], {}, successHandler, errorHandler);
    };
    quantimodoService.getUnitsFromApi = function(successHandler, errorHandler){
        quantimodoService.get('api/units', [], {}, successHandler, errorHandler);
    };
    quantimodoService.getConnectorsFromApi = function(successHandler, errorHandler){
        quantimodoService.get('api/v1/connectors/list', [], {}, successHandler, errorHandler);
    };
    quantimodoService.disconnectConnectorToApi = function(name, successHandler, errorHandler){
        quantimodoService.get('api/v1/connectors/' + name + '/disconnect', [], {}, successHandler, errorHandler);
    };
    quantimodoService.connectConnectorWithParamsToApi = function(params, lowercaseConnectorName, successHandler, errorHandler){
        var allowedParams = ['location', 'username', 'password', 'email'];
        quantimodoService.get('api/v1/connectors/' + lowercaseConnectorName + '/connect', allowedParams, params, successHandler, errorHandler);
    };
    quantimodoService.connectConnectorWithTokenToApi = function(body, lowercaseConnectorName, successHandler, errorHandler){
        var requiredProperties = ['connector', 'connectorCredentials'];
        quantimodoService.post('api/v1/connectors/connect', requiredProperties, body, successHandler, errorHandler);
    };
    quantimodoService.connectWithAuthCodeToApi = function(code, connectorLowercaseName, successHandler, errorHandler){
        var allowedParams = ['code', 'noRedirect'];
        var params = {noRedirect: true, code: code};
        quantimodoService.get('api/v1/connectors/' + connectorLowercaseName + '/connect', allowedParams, params, successHandler, errorHandler);
    };
    quantimodoService.getUserFromApi = function(successHandler, errorHandler){
        if($rootScope.user){console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);}
        var options = {};
        options.minimumSecondsBetweenRequests = 10;
        options.doNotSendToLogin = true;
        quantimodoService.get('api/user/me', [], {}, successHandler, errorHandler, options);
    };
    quantimodoService.getUserEmailPreferences = function(params, successHandler, errorHandler){
        if($rootScope.user){console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);}
        var options = {};
        options.minimumSecondsBetweenRequests = 10;
        options.doNotSendToLogin = true;
        quantimodoService.get('api/v1/notificationPreferences', ['userEmail'], params, successHandler, errorHandler, options);
    };
    quantimodoService.getTrackingReminderNotificationsFromApi = function(params, successHandler, errorHandler){
        quantimodoService.get('api/v1/trackingReminderNotifications', ['variableCategoryName', 'reminderTime', 'sort', 'reminderFrequency'], params, successHandler, errorHandler);
    };
    quantimodoService.postTrackingReminderNotificationsToApi = function(trackingReminderNotificationsArray, successHandler, errorHandler) {
        if(!trackingReminderNotificationsArray){
            successHandler();
            return;
        }
        if(trackingReminderNotificationsArray.constructor !== Array){trackingReminderNotificationsArray = [trackingReminderNotificationsArray];}
        var options = {};
        options.doNotSendToLogin = false;
        options.doNotShowOfflineError = true;
        quantimodoService.post('api/v1/trackingReminderNotifications', [], trackingReminderNotificationsArray, successHandler, errorHandler, options);
    };
    quantimodoService.getTrackingRemindersFromApi = function(params, successHandler, errorHandler){
        quantimodoService.get('api/v1/trackingReminders', ['variableCategoryName', 'id'], params, successHandler, errorHandler);
    };
    quantimodoService.getStudy = function(params, successHandler, errorHandler){
        quantimodoService.get('api/v1/study', [], params, successHandler, errorHandler);
    };
    quantimodoService.getStudyDeferred = function(params) {
        var deferred = $q.defer();
        quantimodoService.postStudy(params, function(){deferred.resolve();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.postUserSettings = function(params, successHandler, errorHandler) {
        quantimodoService.post('api/v1/userSettings', [], params, successHandler, errorHandler);
    };
    quantimodoService.postTrackingRemindersToApi = function(trackingRemindersArray, successHandler, errorHandler) {
        if(trackingRemindersArray.constructor !== Array){trackingRemindersArray = [trackingRemindersArray];}
        var d = new Date();
        for(var i = 0; i < trackingRemindersArray.length; i++){trackingRemindersArray[i].timeZoneOffset = d.getTimezoneOffset();}
        quantimodoService.post('api/v1/trackingReminders', [], trackingRemindersArray, successHandler, errorHandler);
    };
    quantimodoService.postStudy = function(body, successHandler, errorHandler){
        quantimodoService.post('api/v1/study', [], body, successHandler, errorHandler);
    };
    quantimodoService.postStudyDeferred = function(body) {
        var deferred = $q.defer();
        quantimodoService.postStudy(body, function(){deferred.resolve();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.joinStudy = function(body, successHandler, errorHandler){
        quantimodoService.post('api/v1/study/join', [], body, successHandler, errorHandler);
    };
    quantimodoService.joinStudyDeferred = function(body) {
        var deferred = $q.defer();
        quantimodoService.joinStudy(body, function(response){
            if(response && response.data){
                if(response.data.trackingReminderNotifications){putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data.trackingReminderNotifications);}
                if(response.data.trackingReminders){quantimodoService.setLocalStorageItem('trackingReminders', JSON.stringify(response.data.trackingReminders));}
                if(response.data.causeUserVariable && response.data.effectUserVariable){
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', [response.data.causeUserVariable, response.data.effectUserVariable]);
                }
            }
            deferred.resolve();
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.postUserTagDeferred = function(tagData) {
        var deferred = $q.defer();
        quantimodoService.postUserTag(tagData, function(response){
            quantimodoService.addVariableToLocalStorage(response.data.userTaggedVariable);
            quantimodoService.addVariableToLocalStorage(response.data.userTagVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.postUserTag = function(userTagData, successHandler, errorHandler) {
        if(userTagData.constructor !== Array){userTagData = [userTagData];}
        quantimodoService.post('api/v1/userTags', [], userTagData, successHandler, errorHandler);
    };
    quantimodoService.postVariableJoinDeferred = function(tagData) {
        var deferred = $q.defer();
        quantimodoService.postVariableJoin(tagData, function(response){
            quantimodoService.addVariableToLocalStorage(response.data.parentVariable);
            quantimodoService.addVariableToLocalStorage(response.data.joinedVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.postVariableJoin = function(variableJoinData, successHandler, errorHandler) {
        if(variableJoinData.constructor !== Array){variableJoinData = [variableJoinData];}
        quantimodoService.post('api/v1/variables/join', [], variableJoinData, successHandler, errorHandler);
    };
    quantimodoService.deleteVariableJoinDeferred = function(tagData) {
        var deferred = $q.defer();
        quantimodoService.deleteVariableJoin(tagData, function(response){
            quantimodoService.addVariableToLocalStorage(response.data.parentVariable);
            quantimodoService.addVariableToLocalStorage(response.data.joinedVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.deleteVariableJoin = function(variableJoinData, successHandler, errorHandler) {
        quantimodoService.post('api/v1/variables/join/delete', [], variableJoinData, successHandler, errorHandler);
    };
    quantimodoService.deleteUserTagDeferred = function(tagData) {
        var deferred = $q.defer();
        quantimodoService.deleteUserTag(tagData, function(response){
            quantimodoService.addVariableToLocalStorage(response.data.userTaggedVariable);
            quantimodoService.addVariableToLocalStorage(response.data.userTagVariable);
            deferred.resolve(response);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.deleteUserTag = function(userTagData, successHandler, errorHandler) {
        quantimodoService.post('api/v1/userTags/delete', [], userTagData, successHandler, errorHandler);
    };
    quantimodoService.getUserTagsDeferred = function() {
        var deferred = $q.defer();
        quantimodoService.getUserTags.then(function (userTags) {deferred.resolve(userTags);});
        return deferred.promise;
    };
    quantimodoService.getUserTags = function(params, successHandler, errorHandler){
        quantimodoService.get('api/v1/userTags', ['variableCategoryName', 'id'], params, successHandler, errorHandler);
    };
    quantimodoService.updateUserTimeZoneIfNecessary = function () {
        var d = new Date();
        var timeZoneOffsetInMinutes = d.getTimezoneOffset();
        if($rootScope.user && $rootScope.user.timeZoneOffset !== timeZoneOffsetInMinutes ){
            var params = {timeZoneOffset: timeZoneOffsetInMinutes};
            quantimodoService.updateUserSettingsDeferred(params);
        }
    };
    quantimodoService.postDeviceToken = function(deviceToken, successHandler, errorHandler) {
        var platform;
        if($rootScope.isAndroid){platform = 'android';}
        if($rootScope.isIOS){platform = 'ios';}
        if($rootScope.isWindows){platform = 'windows';}
        var params = {platform: platform, deviceToken: deviceToken, clientId: quantimodoService.getClientId()};
        quantimodoService.post('api/v1/deviceTokens', ['deviceToken', 'platform'], params, successHandler, errorHandler);
    };
    quantimodoService.deleteDeviceTokenFromServer = function(successHandler, errorHandler) {
        var deferred = $q.defer();
        if(!localStorage.getItem('deviceTokenOnServer')){
            deferred.reject('No deviceToken provided to quantimodoService.deleteDeviceTokenFromServer');
        } else {
            var params = {deviceToken: localStorage.getItem('deviceTokenOnServer')};
            quantimodoService.post('api/v1/deviceTokens/delete',
                ['deviceToken'],
                params,
                successHandler,
                errorHandler);
            localStorage.clear('deviceTokenOnServer');
            deferred.resolve();
        }
        return deferred.promise;
    };
    // delete tracking reminder
    quantimodoService.deleteTrackingReminder = function(reminderId, successHandler, errorHandler){
        if(!reminderId){
            console.error('No reminder id to delete with!  Maybe it has only been stored locally and has not updated from server yet.');
            return;
        }
        quantimodoService.post('api/v1/trackingReminders/delete',
            ['id'],
            {id: reminderId},
            successHandler,
            errorHandler);
    };
    // snooze tracking reminder
    quantimodoService.snoozeTrackingReminderNotification = function(params, successHandler, errorHandler){
        quantimodoService.post('api/v1/trackingReminderNotifications/snooze',
            ['id', 'trackingReminderNotificationId', 'trackingReminderId'],
            params,
            successHandler,
            errorHandler);
    };
    // skip tracking reminder
    quantimodoService.skipTrackingReminderNotification = function(params, successHandler, errorHandler){
        quantimodoService.post('api/v1/trackingReminderNotifications/skip',
            ['id', 'trackingReminderNotificationId', 'trackingReminderId'],
            params,
            successHandler,
            errorHandler);
    };
    // skip tracking reminder
    quantimodoService.skipAllTrackingReminderNotifications = function(params, successHandler, errorHandler){
        if(!params){params = [];}
        quantimodoService.post('api/v1/trackingReminderNotifications/skip/all',
            //['trackingReminderId'],
            [],
            params,
            successHandler,
            errorHandler);
    };
    // track tracking reminder with default value
    quantimodoService.trackTrackingReminderNotification = function(params, successHandler, errorHandler){
        var requiredProperties = ['id', 'trackingReminderNotificationId', 'trackingReminderId', 'modifiedValue'];
        quantimodoService.post('api/v1/trackingReminderNotifications/track',
            requiredProperties,
            params,
            successHandler,
            errorHandler);
    };
    function isTestUser(){return $rootScope.user && $rootScope.user.displayName.indexOf('test') !== -1;}
    // if not logged in, returns rejects
    quantimodoService.getAccessTokenFromAnySource = function () {
        var deferred = $q.defer();
        var accessToken = quantimodoService.getUrlParameter('accessToken');
        if(accessToken){
            if(accessToken !== localStorage.getItem('accessToken')){
                localStorage.clear();
                localStorage.setItem('accessToken', accessToken);
            }
            var user = JSON.parse(localStorage.getItem('user'));
            if(!user && $rootScope.user){user = $rootScope.user;}
            if(user && accessToken !== user.accessToken){
                $rootScope.user = null;
                localStorage.clear();
                localStorage.setItem('accessToken', accessToken);
                quantimodoService.refreshUser();
            }
            deferred.resolve(accessToken);
            return deferred.promise;
        }
        var now = new Date().getTime();
        var expiresAtMilliseconds = localStorage.getItem("expiresAtMilliseconds");
        var refreshToken = localStorage.getItem("refreshToken");
        accessToken = localStorage.getItem("accessToken");
        console.debug('quantimodoService.getOrRefreshAccessTokenOrLogin: Values from local storage:', JSON.stringify({
            expiresAtMilliseconds: expiresAtMilliseconds,
            refreshToken: refreshToken,
            accessToken: accessToken
        }));
        if(refreshToken && !expiresAtMilliseconds){
            var errorMessage = 'We have a refresh token but expiresAtMilliseconds is ' + expiresAtMilliseconds + '.  How did this happen?';
            if(!isTestUser()){Bugsnag.notify(errorMessage, quantimodoService.getLocalStorageItemAsString('user'), {groupingHash: errorMessage}, "error");}
        }
        if (accessToken && now < expiresAtMilliseconds) {
            console.debug('quantimodoService.getOrRefreshAccessTokenOrLogin: Current access token should not be expired. Resolving token using one from local storage');
            deferred.resolve(accessToken);
        } else if (refreshToken && expiresAtMilliseconds && quantimodoService.getClientId() !== 'oAuthDisabled') {
            console.debug(now + ' (now) is greater than expiresAt ' + expiresAtMilliseconds);
            quantimodoService.refreshAccessToken(refreshToken, deferred);
        } else if(accessToken){
            deferred.resolve(accessToken);
        } else if(quantimodoService.getClientId() === 'oAuthDisabled') {
                //console.debug('getAccessTokenFromAnySource: oAuthDisabled so we do not need an access token');
                deferred.resolve();
                return deferred.promise;
        } else {
            console.warn('Could not get or refresh access token at ' + window.location.href);
            deferred.resolve();
        }
        return deferred.promise;
    };
    quantimodoService.refreshAccessToken = function(refreshToken, deferred) {
        console.debug('Refresh token will be used to fetch access token from ' +
            quantimodoService.getQuantiModoUrl("api/oauth2/token") + ' with client id ' + quantimodoService.getClientId());
        var url = quantimodoService.getQuantiModoUrl("api/oauth2/token");
        $http.post(url, {
            client_id: quantimodoService.getClientId(),
            client_secret: quantimodoService.getClientSecret(),
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        }).success(function (data) {
            // update local storage
            if (data.error) {
                console.debug('Token refresh failed: ' + data.error);
                deferred.reject('Token refresh failed: ' + data.error);
            } else {
                var accessTokenRefreshed = quantimodoService.saveAccessTokenInLocalStorage(data);
                console.debug('quantimodoService.refreshAccessToken: access token successfully updated from api server: ' + JSON.stringify(data));
                deferred.resolve(accessTokenRefreshed);
            }
        }).error(function (response) {
            console.debug("quantimodoService.refreshAccessToken: failed to refresh token from api server" + JSON.stringify(response));
            deferred.reject(response);
        });

    };
    quantimodoService.saveAccessTokenInLocalStorage = function (accessResponse) {
        var accessToken = accessResponse.accessToken || accessResponse.access_token;
        if (accessToken) {
            $rootScope.accessToken = accessToken;
            localStorage.setItem('accessToken', accessToken);
        } else {
            console.error('No access token provided to quantimodoService.saveAccessTokenInLocalStorage');
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
            expiresAtMilliseconds = new Date(expiresAt).getTime();
        } else if (expiresAt === parseInt(expiresAt, 10) && expiresAt < new Date().getTime()) {
            expiresAtMilliseconds = expiresAt * 1000;
        } else if(expiresAt === parseInt(expiresAt, 10) && expiresAt > new Date().getTime()){
            expiresAtMilliseconds = expiresAt;
        } else {
            // calculate expires at
            var expiresInSeconds = accessResponse.expiresIn || accessResponse.expires_in;
            expiresAtMilliseconds = new Date().getTime() + expiresInSeconds * 1000;
            console.debug("Expires in is " + expiresInSeconds + ' seconds. This results in expiresAtMilliseconds being: ' + expiresAtMilliseconds);
        }
        if(expiresAtMilliseconds){
            localStorage.expiresAtMilliseconds = expiresAtMilliseconds - bufferInMilliseconds;
            return accessToken;
        } else {
            console.error('No expiresAtMilliseconds!');
            Bugsnag.notify('No expiresAtMilliseconds!',
                'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + quantimodoService.getLocalStorageItemAsString('user'),
                {groupingHash: 'No expiresAtMilliseconds!'},
                "error");
        }
        var groupingHash = 'Access token expiresAt not provided in recognizable form!';
        console.error(groupingHash);
        Bugsnag.notify(groupingHash,
            'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + quantimodoService.getLocalStorageItemAsString('user'),
            {groupingHash: groupingHash},
            "error");
    };
    quantimodoService.convertToObjectIfJsonString = function (stringOrObject) {
        try {stringOrObject = JSON.parse(stringOrObject);} catch (exception) {return stringOrObject;}
        return stringOrObject;
    };
    quantimodoService.generateV1OAuthUrl = function(register) {
        var url = quantimodoService.getApiUrl() + "/api/oauth2/authorize?";
        // add params
        url += "response_type=code";
        url += "&client_id=" + quantimodoService.getClientId();
        url += "&client_secret=" + quantimodoService.getClientSecret();
        url += "&scope=" + quantimodoService.getPermissionString();
        url += "&state=testabcd";
        if(register === true){url += "&register=true";}
        //url += "&redirect_uri=" + quantimodoService.getRedirectUri();
        return url;
    };
    quantimodoService.generateV2OAuthUrl= function(JWTToken) {
        var url = quantimodoService.getQuantiModoUrl("api/v2/bshaffer/oauth/authorize", true);
        url += "response_type=code";
        url += "&client_id=" + quantimodoService.getClientId();
        url += "&client_secret=" + quantimodoService.getClientSecret();
        url += "&scope=" + quantimodoService.getPermissionString();
        url += "&state=testabcd";
        if(JWTToken){url += "&token=" + JWTToken;}
        //url += "&redirect_uri=" + quantimodoService.getRedirectUri();
        return url;
    };
    quantimodoService.getAuthorizationCodeFromUrl = function(event) {
        console.debug('extracting authorization code from event: ' + JSON.stringify(event));
        var authorizationUrl = event.url;
        if(!authorizationUrl) {authorizationUrl = event.data;}
        var authorizationCode = quantimodoService.getUrlParameter('code', authorizationUrl);
        if(!authorizationCode) {authorizationCode = quantimodoService.getUrlParameter('token', authorizationUrl);}
        return authorizationCode;
    };
    quantimodoService.getAccessTokenFromAuthorizationCode = function (authorizationCode) {
        console.debug("Authorization code is " + authorizationCode);
        var deferred = $q.defer();
        var url = quantimodoService.getQuantiModoUrl("api/oauth2/token");
        var request = {
            method: 'POST',
            url: url,
            responseType: 'json',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                client_id: quantimodoService.getClientId(),
                client_secret: quantimodoService.getClientSecret(),
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: quantimodoService.getRedirectUri()
            }
        };
        console.debug('getAccessTokenFromAuthorizationCode: request is ', request);
        console.debug(JSON.stringify(request));
        // post
        $http(request).success(function (response) {
            if(response.error){
                quantimodoService.reportError(response);
                alert(response.error + ": " + response.error_description + ".  Please try again or contact mike@quantimo.do.");
                deferred.reject(response);
            } else {
                console.debug('getAccessTokenFromAuthorizationCode: Successful response is ', response);
                console.debug(JSON.stringify(response));
                deferred.resolve(response);
            }
        }).error(function (response) {
            console.debug('getAccessTokenFromAuthorizationCode: Error response is ', response);
            console.debug(JSON.stringify(response));
            deferred.reject(response);
        });
        return deferred.promise;
    };
    quantimodoService.getTokensAndUserViaNativeGoogleLogin = function (body) {
        var deferred = $q.defer();
        var path = 'api/v1/googleIdToken';
        quantimodoService.post(path, [], body, function (response) {
            deferred.resolve(response);
        }, function (error) {
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getTokensAndUserViaNativeSocialLogin = function (provider, accessToken) {
        var deferred = $q.defer();
        if(!accessToken || accessToken === "null"){
            quantimodoService.reportError("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
            deferred.reject("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
        }
        var url = quantimodoService.getQuantiModoUrl('api/v2/auth/social/authorizeToken');
        url += "provider=" + encodeURIComponent(provider);
        url += "&accessToken=" + encodeURIComponent(accessToken);
        url += "&client_id=" + encodeURIComponent(quantimodoService.getClientId());
        console.debug('quantimodoService.getTokensAndUserViaNativeSocialLogin about to make request to ' + url);
        $http({
            method: 'GET',
            url: url,
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            if (response.data.success && response.data.data && response.data.data.token) {
                // This didn't solve the token_invalid issue
                // $timeout(function () {
                //     console.debug('10 second delay to try to solve token_invalid issue');
                //  deferred.resolve(response.data.data.token);
                // }, 10000);
                deferred.resolve(response.data.data);
            } else {deferred.reject(response);}
        }, function (error) {
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.registerDeviceToken = function(deviceToken){
        var deferred = $q.defer();
        if(!$rootScope.isMobile){
            deferred.reject('Not on mobile so not posting device token');
            return deferred.promise;
        }
        console.debug("Posting deviceToken to server: ", deviceToken);
        quantimodoService.postDeviceToken(deviceToken, function(response){
            localStorage.clear('deviceTokenToSync');
            localStorage.setItem('deviceTokenOnServer', deviceToken);
            console.debug(response);
            deferred.resolve();
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var setupGoogleAnalytics = function(user){
        Analytics.registerScriptTags();
        Analytics.registerTrackers();
        // you can set any advanced configuration here
        Analytics.set('&uid', user.id);
        Analytics.set('&ds', $rootScope.currentPlatform);
        Analytics.set('&cn', config.appSettings.appDisplayName);
        Analytics.set('&cs', config.appSettings.appDisplayName);
        Analytics.set('&cm', $rootScope.currentPlatform);
        Analytics.set('&an', config.appSettings.appDisplayName);
        Analytics.set('&aid', config.appSettings.appIdentifier);
        Analytics.set('&av', config.appSettings.versionNumber);
        // Register a custom dimension for the default, unnamed account object
        // e.g., ga('set', 'dimension1', 'Paid');
        Analytics.set('dimension1', 'Paid');
        Analytics.set('dimension2', user.id.toString());
        // Register a custom dimension for a named account object
        // e.g., ga('accountName.set', 'dimension2', 'Paid');
        //Analytics.set('dimension2', 'Paid', 'accountName');
        Analytics.pageView(); // send data to Google Analytics
        console.debug('Just set up Google Analytics');
    };
    quantimodoService.getUserAndSetupGoogleAnalytics = function(){
        if(Analytics){
            if($rootScope.user){
                setupGoogleAnalytics($rootScope.user);
                return;
            }
            quantimodoService.getLocalStorageItemAsStringWithCallback('user', function (userString) {
                if(userString){
                    var user = JSON.parse(userString);
                    setupGoogleAnalytics(user);
                }
            });
        }
    };
    quantimodoService.setUserInLocalStorageBugsnagIntercomPush = function(user){
        quantimodoService.setLocalStorageItem('user', JSON.stringify(user));
        localStorage.user = JSON.stringify(user); // For Chrome Extension
        quantimodoService.saveAccessTokenInLocalStorage(user);
        $rootScope.user = user;
        quantimodoService.setupBugsnag();
        quantimodoService.getUserAndSetupGoogleAnalytics();
        var date = new Date(user.userRegistered);
        var userRegistered = date.getTime()/1000;
        if (typeof UserVoice !== "undefined") {
            UserVoice.push(['identify', {
                email: user.email, // User’s email address
                name: user.displayName, // User’s real name
                created_at: userRegistered, // Unix timestamp for the date the user signed up
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
            app_name: config.appSettings.appDisplayName,
            app_version: config.appSettings.versionNumber,
            platform: $rootScope.currentPlatform
        };
        */

        if(localStorage.getItem('deviceTokenOnServer')){console.debug("This token is already on the server: " + localStorage.getItem('deviceTokenOnServer'));}
        if (localStorage.getItem('deviceTokenToSync')){quantimodoService.registerDeviceToken(localStorage.getItem('deviceTokenToSync'));}
        if($rootScope.sendReminderNotificationEmails){
            quantimodoService.updateUserSettingsDeferred({sendReminderNotificationEmails: $rootScope.sendReminderNotificationEmails});
            $rootScope.sendReminderNotificationEmails = null;
        }
        quantimodoService.afterLoginGoToUrlOrState();
        quantimodoService.updateUserTimeZoneIfNecessary();
    };
    quantimodoService.goToDefaultStateIfNoAfterLoginUrlOrState = function () {
        if(!quantimodoService.afterLoginGoToUrlOrState()){$state.go(config.appSettings.defaultState);}
    };
    quantimodoService.afterLoginGoToUrlOrState = function () {
        var afterLoginGoTo = quantimodoService.getLocalStorageItemAsString('afterLoginGoTo');
        console.debug("afterLoginGoTo from localstorage is  " + afterLoginGoTo);
        if(afterLoginGoTo) {
            quantimodoService.deleteItemFromLocalStorage('afterLoginGoTo');
            window.location.replace(afterLoginGoTo);
            return true;
        }
        var afterLoginGoToState = quantimodoService.getLocalStorageItemAsString('afterLoginGoToState');
        console.debug("afterLoginGoToState from localstorage is  " + afterLoginGoToState);
        if(afterLoginGoToState){
            quantimodoService.deleteItemFromLocalStorage('afterLoginGoToState');
            $state.go(afterLoginGoToState);
            return true;
        }
        return false;
    };
    quantimodoService.syncAllUserData = function(){
        quantimodoService.syncTrackingReminders();
        quantimodoService.getUserVariablesDeferred();
        quantimodoService.getUnits();
        quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();
    };
    quantimodoService.refreshUser = function(){
        var deferred = $q.defer();
        quantimodoService.getUserFromApi(function(user){
            quantimodoService.setUserInLocalStorageBugsnagIntercomPush(user);
            deferred.resolve(user);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.sendToNonOAuthBrowserLoginUrl = function(register) {
        var loginUrl = quantimodoService.getQuantiModoUrl("api/v2/auth/login");
        if (register === true) {loginUrl = quantimodoService.getQuantiModoUrl("api/v2/auth/register");}
        console.debug('sendToNonOAuthBrowserLoginUrl: AUTH redirect URL created:', loginUrl);
        var apiUrlMatchesHostName = quantimodoService.getApiUrl().indexOf(window.location.hostname);
        if(apiUrlMatchesHostName > -1 || $rootScope.isChromeExtension) {
            $ionicLoading.show();
            loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href + '?loggingIn=true');
            // Have to come back to login page and wait for user request to complete
            window.location.replace(loginUrl);
        } else {
            alert("API url doesn't match auth base url.  Please make use the same domain in config file");
        }
    };
    quantimodoService.refreshUserEmailPreferencesDeferred = function(params){
        var deferred = $q.defer();
        quantimodoService.getUserEmailPreferences(params, function(user){deferred.resolve(user);}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.completelyResetAppState = function(){
        $rootScope.user = null;
        // Getting token so we can post as the new user if they log in again
        quantimodoService.deleteDeviceTokenFromServer();
        quantimodoService.clearLocalStorage();
        quantimodoService.cancelAllNotifications();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    };
    quantimodoService.clearOAuthTokensFromLocalStorage = function(){
        localStorage.setItem('accessToken', null);
        localStorage.setItem('refreshToken', null);
        localStorage.setItem('expiresAtMilliseconds', null);
    };
    quantimodoService.updateUserSettingsDeferred = function(params){
        var deferred = $q.defer();
        quantimodoService.postUserSettings(params, function(response){
            if(!params.userEmail) {
                quantimodoService.refreshUser().then(function(user){
                    console.debug('updateUserSettingsDeferred got this user: ' + JSON.stringify(user));
                }, function(error){
                    console.error('quantimodoService.updateUserSettingsDeferred could not refresh user because ' + JSON.stringify(error));
                });
            }
            deferred.resolve(response);
        }, function(response){deferred.reject(response);});
        return deferred.promise;
    };
    quantimodoService.filterByStringProperty = function(arrayToFilter, propertyName, allowedValue){
        if(!allowedValue || allowedValue.toLowerCase() === "anything"){ return arrayToFilter; }
        var filteredArray = [];
        for(var i = 0; i < arrayToFilter.length; i++){
            if(arrayToFilter[i][propertyName].toLowerCase() === allowedValue.toLowerCase()){filteredArray.push(arrayToFilter[i]);}
        }
        return filteredArray;
    };
    quantimodoService.getFavoriteTrackingRemindersFromLocalStorage = function(variableCategoryName){
        var deferred = $q.defer();
        quantimodoService.getAllReminderTypes(variableCategoryName).then(function (allTrackingReminderTypes) {
            deferred.resolve(allTrackingReminderTypes.favorites);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.attachVariableCategoryIcons = function(dataArray){
        if(!dataArray){ return;}
        var variableCategoryInfo;
        for(var i = 0; i < dataArray.length; i++){
            variableCategoryInfo = quantimodoService.getVariableCategoryInfo(dataArray[i].variableCategoryName);
            if(variableCategoryInfo.ionIcon){
                if(!dataArray[i].ionIcon){ dataArray[i].ionIcon = variableCategoryInfo.ionIcon;}
            } else {
                console.warn('Could not find icon for variableCategoryName ' + dataArray[i].variableCategoryName);
                return 'ion-speedometer';
            }
        }
        return dataArray;
    };
    $rootScope.variableCategories = {
        "Anything": {
            defaultUnitAbbreviatedName: '',
            helpText: "What do you want to record?",
            variableCategoryNameSingular: "Anything",
            defaultValuePlaceholderText : "Enter most common value here...",
            defaultValueLabel : 'Value',
            addNewVariableCardText : 'Add a new variable',
            variableCategoryName : '',
            defaultValue : '',
            measurementSynonymSingularLowercase : "measurement",
            ionIcon: "ion-speedometer"
        },
        "Activity": {
            defaultUnitAbbreviatedName: 'min',
            helpText: "What activity do you want to record?",
            variableCategoryName: "Activity",
            variableCategoryNameSingular: "Activity",
            measurementSynonymSingularLowercase : "activity",
            ionIcon: "ion-ios-body"
        },
        "Emotions": {
            defaultUnitAbbreviatedName: "/5",
            helpText: "What emotion do you want to rate?",
            variableCategoryName: "Emotions",
            variableCategoryNameSingular: "Emotion",
            measurementSynonymSingularLowercase : "rating",
            ionIcon: "ion-happy-outline",
            moreInfo: "Do you have any emotions that fluctuate regularly? <br> <br> If so, add them so I can try to " +
            "determine which factors are influencing them.",
            imageUrl: "img/variable_categories/theatre_mask-96.png"
        },
        "Environment": {
            defaultUnitAbbreviatedName: '',
            helpText: "What environmental variable do you want to record?",
            variableCategoryName: "Environment",
            variableCategoryNameSingular: "Environment",
            measurementSynonymSingularLowercase : "environmental measurement",
            ionIcon: "ion-ios-partlysunny-outline",
            moreInfo: "By recording your local weather conditions, I might be able to figure out how the " +
            "amount of sunlight or temperature is affecting you.",
            imageUrl: "img/variable_categories/chance_of_storm-96.png"
        },
        "Foods" : {
            defaultUnitAbbreviatedName: "serving",
            helpText: "What did you eat?",
            variableCategoryName: "Foods",
            variableCategoryNameSingular: "Food",
            measurementSynonymSingularLowercase : "meal",
            ionIcon: "ion-fork",
            moreInfo: "Diet can have a significant impact on your health. It's important to enter any foods that " +
            "you regularly eat to see how they might be affecting you.",
            imageUrl: "img/variable_categories/vegetarian_food-96.png"
        },
        "Location" : {
            defaultUnitAbbreviatedName: "min",
            helpText: "What location do you want to record?",
            variableCategoryName: "Location",
            variableCategoryNameSingular: "Location",
            measurementSynonymSingularLowercase : "location",
            ionIcon: "ion-ios-location",
            moreInfo: "By automatically recording your location in the background using GPS, we might be able to figure out how the " +
            "amount of time spent at the gym, restaurants, doctors, offices, home and work locations may be affecting you.  " +
            "Another benefit of enabling " +
            "this option is that allows the app to run in the background and open instantly instead " +
            "of taking a few seconds to load.  You can view your location history by going to Menu -> History -> Locations.",
            imageUrl: "img/variable_categories/location.svg"
        },
        "Music" : {
            defaultUnitAbbreviatedName: "count",
            helpText: "What music did you listen to?",
            variableCategoryName: "Music",
            variableCategoryNameSingular: "Music",
            measurementSynonymSingularLowercase : "music",
            ionIcon: "ion-music-note"
        },
        "Nutrients" : {
            defaultUnitAbbreviatedName: "g",
            helpText: "What nutrient do you want to track?",
            variableCategoryName: "Nutrients",
            variableCategoryNameSingular: "Nutrient",
            measurementSynonymSingularLowercase : "nutrient",
            ionIcon: "ion-fork"
        },
        "Payments" : {
            defaultUnitAbbreviatedName: "$",
            helpText: "What did you pay for?",
            variableCategoryName: "Payments",
            variableCategoryNameSingular: "Payment",
            measurementSynonymSingularLowercase : "payment",
            ionIcon: "ion-cash",
            imageUrl: 'img/features/spending-receipt.jpg',
            moreInfo: "Effortlessly see how supplements from Amazon might be influencing you, for example, by " +
            "automatically logging spending by connecting the Slice app"
        },
        "Physical Activity": {
            defaultUnitAbbreviatedName: '',
            helpText: "What physical activity do you want to record?",
            variableCategoryName: "Physical Activity",
            variableCategoryNameSingular: "Physical Activity",
            measurementSynonymSingularLowercase : "activity",
            ionIcon: "ion-ios-body",
            imageUrl: 'img/features/runner.png',
            moreInfo: "I get steps from a variety of sources like Fitbit & Jawbone. Even if you " +
            "don't have any fitness trackers, you can manually record any physical activity, like running, " +
            "cycling, or going to the gym.",
        },
        "Physique": {
            defaultUnitAbbreviatedName: '',
            helpText: "What aspect of your physique do you want to record?",
            variableCategoryName: "Physique",
            variableCategoryNameSingular: "Physique",
            measurementSynonymSingularLowercase : "physique measurement",
            ionIcon: "ion-ios-body",
            imageUrl: 'img/features/slim-down.png',
            moreInfo: "I can give you easy access to your weight and other vitals. You can manually " +
            "enter weight, but I recommend using a Fitbit or Withings wifi scale for the most detailed data. I can " +
            "create a beautiful graph of your weight changes, so you can easily keep track of " +
            "whether you're hitting your goals. Body weight doesn't tell the whole story, so I also " +
            "support body fat percent. ",
        },
        "Sleep": {
            defaultUnitAbbreviatedName: "",
            helpText: "What aspect of sleep do you want to record?",
            variableCategoryName: "Sleep",
            variableCategoryNameSingular: "Sleep",
            measurementSynonymSingularLowercase : "Sleep Measurement",
            ionIcon: "ion-ios-moon-outline",
            moreInfo: "I can talk to many of the most popular sleep trackers like Fitbit, Jawbone, Withings, and Sleep as Android",
            imageUrl: "img/features/half-moon.png"
        },
        "Symptoms": {
            defaultUnitAbbreviatedName: "/5",
            helpText: "What symptom do you want to record?",
            variableCategoryName: "Symptoms",
            variableCategoryNameSingular: "Symptom",
            measurementSynonymSingularLowercase : "rating",
            ionIcon: "ion-sad-outline",
            moreInfo: "Symptom severity can be influence by hundreds of factors in daily life. " +
            "The human mind can only hold 7 numbers in working memory at a time.  I can hold a billion in my mind! " +
            "If you regularly record your symptoms, add them so I can use this data " +
            "to determine which hidden and imperceptible factors might be worsening or improving them.",
            imageUrl: "img/variable_categories/dizzy_person_2-96.png",
        },
        "Treatments": {
            defaultUnitAbbreviatedName : "mg",
            helpText : "What treatment do you want to record?",
            variableCategoryName : "Treatments",
            variableCategoryNameSingular : "Treatment",
            defaultValueLabel : "Dosage",
            defaultValuePlaceholderText : "Enter dose value here...",
            measurementSynonymSingularLowercase : "dose",
            ionIcon: "ion-ios-medkit-outline",
            moreInfo: "Often the effects of medications and treatments aren't intuitively perceptible.  " +
            "That's where I come in!  If you regularly recording your treatments,  I can analyze the data so" +
            "we can get a better idea which ones are helping you, " +
            "which one may be harming you, and which ones are merely a waste of money.",
            imageUrl: "img/variable_categories/pill-96.png",
        },
        "Vital Signs": {
            defaultUnitAbbreviatedName: '',
            helpText: "What vital sign do you want to record?",
            variableCategoryName: "Vital Signs",
            variableCategoryNameSingular: "Vital Sign",
            measurementSynonymSingularLowercase : "measurement",
            ionIcon: "ion-ios-pulse"
        }
    };
    var variableCategoryNames = [];
    for (var n in $rootScope.variableCategories) {
        if(n !== "Anything"){ variableCategoryNames.push(n); }
    }
    $rootScope.variableCategoryNames = variableCategoryNames;
    quantimodoService.getVariableCategoryInfo = function (variableCategoryName) {
        var variableCategoryInfo = $rootScope.variableCategories;
        var selectedVariableCategoryObject = variableCategoryInfo.Anything;
        if(variableCategoryName && variableCategoryInfo[variableCategoryName]){
            selectedVariableCategoryObject =  variableCategoryInfo[variableCategoryName];
        }
        return selectedVariableCategoryObject;
    };
    quantimodoService.getPairs = function (params, successHandler, errorHandler){
        var options = {};
        options.minimumSecondsBetweenRequests = 0;
        quantimodoService.get('api/v1/pairs',
            ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'causeVariableName', 'effectVariableName'],
            params,
            successHandler,
            errorHandler,
            options
        );
    };
    quantimodoService.getPairsDeferred = function (params, successHandler, errorHandler){
        var deferred = $q.defer();
        quantimodoService.getPairs(params, function (pairs) {
            if(successHandler){successHandler();}
            deferred.resolve(pairs);
        }, function (error) {
            if(errorHandler){errorHandler();}
            deferred.reject(error);
            console.error(error);
        });
        return deferred.promise;
    };
    quantimodoService.getStudyDeferred = function (params, successHandler, errorHandler){
        var deferred = $q.defer();
        quantimodoService.getStudy(params, function (pairs) {
            if(successHandler){successHandler();}
            deferred.resolve(pairs);
        }, function (error) {
            if(errorHandler){errorHandler();}
            deferred.reject(error);
            console.error(error);
        });
        return deferred.promise;
    };
    quantimodoService.getLocalPrimaryOutcomeMeasurements = function(){
        var primaryOutcomeVariableMeasurements = quantimodoService.getLocalStorageItemAsObject('primaryOutcomeVariableMeasurements');
        if(!primaryOutcomeVariableMeasurements) {primaryOutcomeVariableMeasurements = [];}
        var measurementsQueue = getPrimaryOutcomeMeasurementsFromQueue();
        if(measurementsQueue){primaryOutcomeVariableMeasurements = primaryOutcomeVariableMeasurements.concat(measurementsQueue);}
        primaryOutcomeVariableMeasurements = primaryOutcomeVariableMeasurements.sort(function(a,b){
            if(a.startTimeEpoch < b.startTimeEpoch){return 1;}
            if(a.startTimeEpoch> b.startTimeEpoch){return -1;}
            return 0;
        });
        return quantimodoService.addInfoAndImagesToMeasurements(primaryOutcomeVariableMeasurements);
    };
    function getPrimaryOutcomeMeasurementsFromQueue() {
        var measurementsQueue = quantimodoService.getLocalStorageItemAsObject('measurementsQueue');
        var primaryOutcomeMeasurements = [];
        if(measurementsQueue){
            for(var i = 0; i < measurementsQueue.length; i++){
                if(measurementsQueue[i].variableName === quantimodoService.getPrimaryOutcomeVariable().name){
                    primaryOutcomeMeasurements.push(measurementsQueue[i]);
                }
            }
        }
        return primaryOutcomeMeasurements;
    }
    quantimodoService.getAndStorePrimaryOutcomeMeasurements = function(){
        var deferred = $q.defer();
        if(!$rootScope.user && !quantimodoService.getUrlParameter('accessToken')){
            var errorMessage = 'Cannot sync because we do not have a user or access token in url';
            console.error(errorMessage)
            deferred.reject(errorMessage);
            return deferred.promise;
        }
        var params = {variableName : quantimodoService.getPrimaryOutcomeVariable().name, sort : '-startTimeEpoch', limit:900};
        quantimodoService.getMeasurementsFromApi(params, function(primaryOutcomeMeasurementsFromApi){
            if (primaryOutcomeMeasurementsFromApi.length > 0) {
                quantimodoService.setLocalStorageItem('primaryOutcomeVariableMeasurements', JSON.stringify(primaryOutcomeMeasurementsFromApi));
                $rootScope.$broadcast('updateCharts');
            }
            quantimodoService.setLocalStorageItem('lastSyncTime', moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
            deferred.resolve(primaryOutcomeMeasurementsFromApi);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.postMeasurementQueueToServer = function(successHandler, errorHandler){
        var defer = $q.defer();
        if(!$rootScope.user && !quantimodoService.getUrlParameter('accessToken')){
            var errorMessage = 'Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user or access token in url';
            console.error(errorMessage);
            defer.reject(errorMessage);
            return defer.promise;
        }
        quantimodoService.getLocalStorageItemAsStringWithCallback('measurementsQueue', function(measurementsQueueString) {
            var parsedMeasurementsQueue = JSON.parse(measurementsQueueString);
            if(!parsedMeasurementsQueue || parsedMeasurementsQueue.length < 1){
                if(successHandler){successHandler();}
                return;
            }
            quantimodoService.postMeasurementsToApi(parsedMeasurementsQueue, function (response) {
                if(response && response.data && response.data.userVariables){
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                quantimodoService.setLocalStorageItem('measurementsQueue', JSON.stringify([]));
                if(successHandler){successHandler();}
                defer.resolve();
            }, function (error) {
                quantimodoService.setLocalStorageItem('measurementsQueue', measurementsQueueString);
                if(errorHandler){errorHandler();}
                defer.reject(error);
            });
        });
        return defer.promise;
    };
    quantimodoService.syncPrimaryOutcomeVariableMeasurements = function(){
        var defer = $q.defer();
        if(!$rootScope.user && !quantimodoService.getUrlParameter('accessToken')){
            console.debug('Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user');
            defer.resolve();
            return defer.promise;
        }
        quantimodoService.postMeasurementQueueToServer(function(){
            quantimodoService.getAndStorePrimaryOutcomeMeasurements().then(function(primaryOutcomeMeasurementsFromApi){
                defer.resolve(primaryOutcomeMeasurementsFromApi);
            }, function(error){defer.reject(error);});
        });
        return defer.promise;
    };

    // date setter from - to
    quantimodoService.setDates = function(to, from){
        var oldFromDate = quantimodoService.getLocalStorageItemAsString('fromDate');
        var oldToDate = quantimodoService.getLocalStorageItemAsString('toDate');
        quantimodoService.setLocalStorageItem('fromDate',parseInt(from));
        quantimodoService.setLocalStorageItem('toDate',parseInt(to));
        // if date range changed, update charts
        if (parseInt(oldFromDate) !== parseInt(from) || parseInt(oldToDate) !== parseInt(to)) {
            console.debug("setDates broadcasting to update charts");
            $rootScope.$broadcast('updateCharts');
            $rootScope.$broadcast('updatePrimaryOutcomeHistory');
        }
    };
    // retrieve date to end on
    quantimodoService.getToDate = function(callback){
        quantimodoService.getLocalStorageItemAsStringWithCallback('toDate',function(toDate){
            if(toDate){callback(parseInt(toDate));} else {callback(parseInt(Date.now()));}
        });
    };
    // retrieve date to start from
    quantimodoService.getFromDate = function(callback){
        quantimodoService.getLocalStorageItemAsStringWithCallback('fromDate',function(fromDate){
            if(fromDate){callback(parseInt(fromDate));
            } else {
                var date = new Date();
                // Threshold 20 Days if not provided
                date.setDate(date.getDate()-20);
                console.debug("The date returned is ", date.toString());
                callback(parseInt(date.getTime()));
            }
        });
    };
    quantimodoService.createPrimaryOutcomeMeasurement = function(numericRatingValue) {
        // if val is string (needs conversion)
        if(isNaN(parseFloat(numericRatingValue))){
            numericRatingValue = quantimodoService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[numericRatingValue] ?
                quantimodoService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[numericRatingValue] : false;
        }
        var startTimeEpoch  = new Date().getTime();
        var measurementObject = {
            id: null,
            variable: quantimodoService.getPrimaryOutcomeVariable().name,
            variableName: quantimodoService.getPrimaryOutcomeVariable().name,
            variableCategoryName: quantimodoService.getPrimaryOutcomeVariable().variableCategoryName,
            variableDescription: quantimodoService.getPrimaryOutcomeVariable().description,
            startTimeEpoch: Math.floor(startTimeEpoch / 1000),
            unitAbbreviatedName: quantimodoService.getPrimaryOutcomeVariable().unitAbbreviatedName,
            value: numericRatingValue,
            note: null
        };
        measurementObject = addLocationAndSourceDataToMeasurement(measurementObject);
        return measurementObject;
    };
    function getSourceName() {return config.appSettings.appDisplayName + " for " + $rootScope.currentPlatform;}
    var addLocationAndSourceDataToMeasurement = function(measurementObject){
        addLocationDataToMeasurement(measurementObject);
        if(!measurementObject.sourceName){measurementObject.sourceName = getSourceName();}
        return measurementObject;
    };
    function addLocationDataToMeasurement(measurementObject) {
        if(!measurementObject.latitude){measurementObject.latitude = localStorage.lastLatitude;}
        if(!measurementObject.longitude){measurementObject.latitude = localStorage.lastLongitude;}
        if(!measurementObject.location){measurementObject.latitude = localStorage.lastLocationNameAndAddress;}
        return measurementObject;
    }
    // used when adding a new measurement from record measurement OR updating a measurement through the queue
    quantimodoService.addToMeasurementsQueue = function(measurementObject){
        measurementObject = addLocationAndSourceDataToMeasurement(measurementObject);
        quantimodoService.addToLocalStorage('measurementsQueue', measurementObject);
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
    quantimodoService.addToLocalStorage = function(localStorageItemName, elementToAdd){
        quantimodoService.getLocalStorageItemAsStringWithCallback(localStorageItemName, function(localStorageItem) {
            localStorageItem = localStorageItem ? JSON.parse(localStorageItem) : [];
            localStorageItem = removeArrayElementsWithSameId(localStorageItem, elementToAdd);
            localStorageItem = removeArrayElementsWithVariableNameAndStartTime(localStorageItem, elementToAdd);
            localStorageItem.push(elementToAdd);
            quantimodoService.setLocalStorageItem(localStorageItemName, JSON.stringify(localStorageItem));
        });
    };
    // post a single measurement
    function updateMeasurementInQueue(measurementInfo) {
        var found = false;
        quantimodoService.getLocalStorageItemAsObject('measurementsQueue', function (measurementsQueue) {
            var i = 0;
            while (!found && i < measurementsQueue.length) {
                if (measurementsQueue[i].startTimeEpoch === measurementInfo.prevStartTimeEpoch) {
                    found = true;
                    measurementsQueue[i].startTimeEpoch = measurementInfo.startTimeEpoch;
                    measurementsQueue[i].value = measurementInfo.value;
                    measurementsQueue[i].note = measurementInfo.note;
                }
            }
            quantimodoService.setLocalStorageItem('measurementsQueue', JSON.stringify(measurementsQueue));
        });
    }
    function isStartTimeInMilliseconds(measurementInfo){
        var nowMilliseconds = new Date();
        var oneWeekInFuture = nowMilliseconds.getTime()/1000 + 7 * 86400;
        if(measurementInfo.startTimeEpoch > oneWeekInFuture){
            measurementInfo.startTimeEpoch = measurementInfo.startTimeEpoch / 1000;
            console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
            return true;
        }
        return false;
    }
    quantimodoService.postMeasurementDeferred = function(measurementInfo){
        isStartTimeInMilliseconds(measurementInfo);
        measurementInfo = addLocationAndSourceDataToMeasurement(measurementInfo);
        if (measurementInfo.prevStartTimeEpoch) { // Primary outcome variable - update through measurementsQueue
            updateMeasurementInQueue(measurementInfo);
        } else if(measurementInfo.id) {
            quantimodoService.deleteElementOfLocalStorageItemById('primaryOutcomeVariableMeasurements', measurementInfo.id);
            quantimodoService.addToMeasurementsQueue(measurementInfo);
        } else {
            quantimodoService.addToMeasurementsQueue(measurementInfo);
        }
        if (measurementInfo.variableName === quantimodoService.getPrimaryOutcomeVariable().name) {
            //quantimodoService.addToLocalStorage('primaryOutcomeVariableMeasurements', measurementInfo);
            quantimodoService.syncPrimaryOutcomeVariableMeasurements();
        } else {
            quantimodoService.postMeasurementQueueToServer();
        }
    };
    quantimodoService.postMeasurementByReminder = function(trackingReminder, modifiedValue) {
        var value = trackingReminder.defaultValue;
        if(typeof modifiedValue !== "undefined" && modifiedValue !== null){value = modifiedValue;}
        var startTimeEpochMilliseconds = new Date();
        var startTimeEpochSeconds = startTimeEpochMilliseconds/1000;
        var measurementSet = [
            {
                variableName: trackingReminder.variableName,
                sourceName: getSourceName(),
                variableCategoryName: trackingReminder.variableCategoryName,
                unitAbbreviatedName: trackingReminder.unitAbbreviatedName,
                measurements : [
                    {
                        startTimeEpoch:  startTimeEpochSeconds,
                        value: value,
                        note : null,
                    }
                ]
            }
        ];
        measurementSet[0].measurements[0] = addLocationDataToMeasurement(measurementSet[0].measurements[0]);
        var deferred = $q.defer();
        if(!quantimodoService.valueIsValid(trackingReminder, value)){
            deferred.reject('Value is not valid');
            return deferred.promise;
        }
        quantimodoService.postMeasurementsToApi(measurementSet, function(response){
            if(response.success) {
                console.debug("quantimodoService.postMeasurementsToApi success: " + JSON.stringify(response));
                if(response && response.data && response.data.userVariables){
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                deferred.resolve();
            } else {deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");}
        });
        return deferred.promise;
    };
    quantimodoService.deleteMeasurementFromServer = function(measurement){
        var deferred = $q.defer();
        quantimodoService.deleteElementOfLocalStorageItemById('primaryOutcomeVariableMeasurements', measurement.id);
        quantimodoService.deleteElementsOfLocalStorageItemByProperty('measurementsQueue', 'startTimeEpoch', measurement.startTimeEpoch);
        quantimodoService.deleteV1Measurements(measurement, function(response){
            deferred.resolve(response);
            console.debug("deleteMeasurementFromServer success " + JSON.stringify(response));
        }, function(response){
            console.debug("deleteMeasurementFromServer error " + JSON.stringify(response));
            deferred.reject();
        });
        return deferred.promise;
    };
    quantimodoService.postBloodPressureMeasurements = function(parameters){
        var deferred = $q.defer();
        /** @namespace parameters.startTimeEpochSeconds */
        if(!parameters.startTimeEpochSeconds){parameters.startTimeEpochSeconds = new Date()/1000;}
        var measurementSets = [
            {
                variableId: 1874,
                sourceName: getSourceName(),
                startTimeEpoch:  parameters.startTimeEpochSeconds,
                value: parameters.systolicValue,
                note: parameters.note
            },
            {
                variableId: 5554981,
                sourceName: getSourceName(),
                startTimeEpoch:  parameters.startTimeEpochSeconds,
                value: parameters.diastolicValue,
                note: parameters.note
            }
        ];
        measurementSets[0] = addLocationDataToMeasurement(measurementSets[0]);
        measurementSets[0] = addLocationDataToMeasurement(measurementSets[0]);
        quantimodoService.postMeasurementsToApi(measurementSets, function(response){
            if(response.success) {
                if(response && response.data && response.data.userVariables){
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                console.debug("quantimodoService.postMeasurementsToApi success: " + JSON.stringify(response));
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
        for (var i = 0; i < units.length; i++) {
            unitAbbreviatedNames[i] = units[i].abbreviatedName;
            unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
            if(!units[i].advanced){
                nonAdvancedUnitObjects.push(units[i]);
                nonAdvancedUnitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
            }
        }
        var showMoreUnitsObject = {name: "Show more units", abbreviatedName: "Show more units"};
        nonAdvancedUnitObjects.push(showMoreUnitsObject);
        nonAdvancedUnitsIndexedByAbbreviatedName[showMoreUnitsObject.abbreviatedName] = showMoreUnitsObject;
        $rootScope.unitsIndexedByAbbreviatedName = unitsIndexedByAbbreviatedName;
        $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName = nonAdvancedUnitsIndexedByAbbreviatedName;
        $rootScope.nonAdvancedUnitObjects = nonAdvancedUnitObjects;
    }
    quantimodoService.getUnits = function(ignoreExpiration){
        var deferred = $q.defer();
        var params = {};
        var cachedUnits = quantimodoService.getCachedResponse('units', params, ignoreExpiration);
        if(cachedUnits){
            addUnitsToRootScope(cachedUnits);
            deferred.resolve(cachedUnits);
            return deferred.promise;
        }
        quantimodoService.refreshUnits().then(function(unitObjects){
            quantimodoService.storeCachedResponse('units', params, unitObjects);
            deferred.resolve(unitObjects);
        }, function (error) {
            console.error("Could not refresh units.  Falling back to stale ones in local storage. Error: " + error);
            var ignoreExpiration = true;
            var cachedUnits = quantimodoService.getCachedResponse('units', params, ignoreExpiration);
            if(cachedUnits){
                addUnitsToRootScope(cachedUnits);
                deferred.resolve(cachedUnits);
                return deferred.promise;
            }
        });
        return deferred.promise;
    };
    quantimodoService.refreshUnits = function(){
        var deferred = $q.defer();
        quantimodoService.getUnitsFromApi(function(unitObjects){
            if(typeof $rootScope.unitAbbreviatedNames === "undefined"){$rootScope.unitAbbreviatedNames = [];}
            quantimodoService.setLocalStorageItem('units', JSON.stringify(unitObjects));
            addUnitsToRootScope(unitObjects);
            deferred.resolve(unitObjects);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    // refresh local variable categories with quantimodoService API
    quantimodoService.refreshVariableCategories = function(){
        var deferred = $q.defer();
        quantimodoService.getVariableCategoriesFromApi(function(vars){
            quantimodoService.setLocalStorageItem('variableCategories',JSON.stringify(vars));
            deferred.resolve(vars);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    // get variable categories
    quantimodoService.getVariableCategories = function(){
        var deferred = $q.defer();
        quantimodoService.getLocalStorageItemAsStringWithCallback('variableCategories',function(variableCategories){
            if(variableCategories){deferred.resolve(JSON.parse(variableCategories));
            } else {
                quantimodoService.getVariableCategoriesFromApi(function(variableCategories){
                    quantimodoService.setLocalStorageItem('variableCategories', JSON.stringify(variableCategories));
                    deferred.resolve(variableCategories);
                }, function(error){deferred.reject(error);});
            }
        });
        return deferred.promise;
    };
    quantimodoService.getVariableCategoryIcon = function(variableCategoryName){
        var variableCategoryInfo = quantimodoService.getVariableCategoryInfo(variableCategoryName);
        if(variableCategoryInfo.ionIcon){
            return variableCategoryInfo.ionIcon;
        } else {
            console.warn('Could not find icon for variableCategoryName ' + variableCategoryName);
            return 'ion-speedometer';
        }
    };
    quantimodoService.getEnv = function(){
        var env = "production";
        if(window.location.origin.indexOf('local') !== -1){env = "development";}
        if(window.location.origin.indexOf('staging') !== -1){env = "staging";}
        if(window.location.origin.indexOf('ionic.quantimo.do') !== -1){env = "staging";}
        return env;
    };
    quantimodoService.getClientId = function(){
        if (window.chrome && chrome.runtime && chrome.runtime.id) {
            $rootScope.clientId = window.private_keys.client_ids.Chrome; //if chrome app
        } else if ($rootScope.isIOS) { $rootScope.clientId = window.private_keys.client_ids.iOS;
        } else if ($rootScope.isAndroid) { $rootScope.clientId = window.private_keys.client_ids.Android;
        } else if ($rootScope.isChromeExtension) { $rootScope.clientId = window.private_keys.client_ids.Chrome;
        } else if ($rootScope.isWindows) { $rootScope.clientId = window.private_keys.client_ids.Windows;
        } else { $rootScope.clientId = window.private_keys.client_ids.Web; }
        if(!$rootScope.clientId || $rootScope.clientId === "undefined"){ quantimodoService.reportError('clientId is undefined!'); }
        return $rootScope.clientId;
    };
    quantimodoService.setPlatformVariables = function () {
        console.debug("ionic.Platform.platform() is " + ionic.Platform.platform());
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
    quantimodoService.getPermissionString = function(){
        var str = "";
        var permissions = ['readmeasurements', 'writemeasurements'];
        for(var i=0; i < permissions.length; i++) {str += permissions[i] + "%20";}
        return str.replace(/%20([^%20]*)$/,'$1');
    };
    quantimodoService.getClientSecret = function(){
        if (window.chrome && chrome.runtime && chrome.runtime.id) {return window.private_keys.client_secrets.Chrome;}
        if ($rootScope.isIOS) { return window.private_keys.client_secrets.iOS; }
        if ($rootScope.isAndroid) { return window.private_keys.client_secrets.Android; }
        if ($rootScope.isChromeExtension) { return window.private_keys.client_secrets.Chrome; }
        if ($rootScope.isWindows) { return window.private_keys.client_secrets.Windows; }
        return window.private_keys.client_secrets.Web;
    };
    quantimodoService.getRedirectUri = function () {
        return quantimodoService.getApiUrl() +  '/ionic/Modo/www/callback/';
    };
    quantimodoService.getProtocol = function () {
        if (typeof ionic !== "undefined") {
            var currentPlatform = ionic.Platform.platform();
            if(currentPlatform.indexOf('win') > -1){return 'ms-appx-web';}
        }
        return 'https';
    };
    quantimodoService.getApiUrl = function () {
        if(!window.private_keys){
            console.error("Cannot find www/private_configs/" +  appsManager.defaultApp + ".config.js or it does " +
                "not contain window.private_keys");
            return "https://app.quantimo.do";
        }
        if(window.private_keys.apiUrl){return window.private_keys.apiUrl;}
        if ($rootScope.isWeb && window.private_keys.client_ids.Web === 'oAuthDisabled' && window.location.origin) {return window.location.origin;}
        return "https://app.quantimo.do";
    };
    quantimodoService.getQuantiModoUrl = function (path) {
        if(typeof path === "undefined") {path = "";} else {path += "?";}
        return quantimodoService.getApiUrl() + "/" + path;
    };
    quantimodoService.convertToObjectIfJsonString = function (stringOrObject) {
        try {stringOrObject = JSON.parse(stringOrObject);} catch (e) {return stringOrObject;}
        return stringOrObject;
    };
    quantimodoService.showAlert = function(title, template, subTitle) {
        var alertPopup = $ionicPopup.alert({
            cssClass : 'positive',
            okType : 'button-positive',
            title: title,
            subTitle: subTitle,
            template: template
        });
    };
    // returns bool
    // if a string starts with substring
    quantimodoService.startsWith = function (fullString, search) {
        if(!fullString){
            console.error('fullString not provided to quantimodoService.startsWith');
            return false;
        }
        return fullString.slice(0, search.length) === search;
    };
    // returns bool | string
    // if search param is found: returns its value
    // returns false if not found
    quantimodoService.getUrlParameter = function (parameterName, url, shouldDecode) {
        if(!url){url = window.location.href;}
        if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
        if(url.split('?').length > 1){
            var queryString = url.split('?')[1];
            var parameterKeyValuePairs = queryString.split('&');
            for (var i = 0; i < parameterKeyValuePairs.length; i++) {
                var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
                if (currentParameterKeyValuePair[0] === parameterName || currentParameterKeyValuePair[0].toCamel() === parameterName) {
                    if(typeof shouldDecode !== "undefined")  {
                        return decodeURIComponent(currentParameterKeyValuePair[1]);
                    } else {
                        return currentParameterKeyValuePair[1];
                    }
                }
            }
        }
        return null;
    };
    quantimodoService.getConnectorsDeferred = function(){
        var deferred = $q.defer();
        quantimodoService.getLocalStorageItemAsStringWithCallback('connectors', function(connectors){
            if(connectors){
                connectors = JSON.parse(connectors);
                connectors = quantimodoService.hideBrokenConnectors(connectors);
                deferred.resolve(connectors);
            } else {quantimodoService.refreshConnectors().then(function(){deferred.resolve(connectors);});}
        });
        return deferred.promise;
    };
    quantimodoService.refreshConnectors = function(){
        var deferred = $q.defer();
        quantimodoService.getConnectorsFromApi(function(connectors){
            quantimodoService.setLocalStorageItem('connectors', JSON.stringify(connectors));
            connectors = quantimodoService.hideBrokenConnectors(connectors);
            deferred.resolve(connectors);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.disconnectConnectorDeferred = function(name){
        var deferred = $q.defer();
        quantimodoService.disconnectConnectorToApi(name, function(){deferred.resolve();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.connectConnectorWithParamsDeferred = function(params, lowercaseConnectorName){
        var deferred = $q.defer();
        quantimodoService.connectConnectorWithParamsToApi(params, lowercaseConnectorName, function(){quantimodoService.refreshConnectors();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.connectConnectorWithTokenDeferred = function(body){
        var deferred = $q.defer();
        quantimodoService.connectConnectorWithTokenToApi(body, function(){quantimodoService.refreshConnectors();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.connectConnectorWithAuthCodeDeferred = function(code, lowercaseConnectorName){
        var deferred = $q.defer();
        quantimodoService.connectWithAuthCodeToApi(code, lowercaseConnectorName, function(){quantimodoService.refreshConnectors();}, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.hideBrokenConnectors = function(connectors){
        for(var i = 0; i < connectors.length; i++){
            if(connectors[i].name === 'facebook' && $rootScope.isAndroid) {connectors[i].hide = true;}
        }
        return connectors;
    };
    // Name: The error message associated with the error. Usually this will
    // contain some information about this specific instance of the
    // error and is not used to group the errors (optional, default
    // none). (searchable)
    // Message: The error message associated with the error. Usually this will
    // contain some information about this specific instance of the
    // error and is not used to group the errors (optional, default
    // none). (searchable)
    quantimodoService.bugsnagNotify = function(name, message, metaData, severity){
        if(!metaData){ metaData = {}; }
        metaData.groupingHash = name;
        if(!metaData.stackTrace){ metaData.stackTrace = new Error().stack; }
        var deferred = $q.defer();
        if(!severity){ severity = "error"; }
        if(!message){ message = name; }
        console.error('NAME: ' + name + '. MESSAGE: ' + message + '. METADATA: ' + JSON.stringify(metaData));
        quantimodoService.setupBugsnag().then(function () {
            Bugsnag.notify(name, message, metaData, severity);
            deferred.resolve();
        }, function (error) {
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.reportError = function(exceptionOrError, metaDataObject, errorLevel){
        var deferred = $q.defer();
        var stringifiedExceptionOrError = 'No error or exception data provided to quantimodoService';
        var stacktrace = 'No stacktrace provided to quantimodoService';
        if(exceptionOrError){
            stringifiedExceptionOrError = JSON.stringify(exceptionOrError);
            if(typeof exceptionOrError.stack !== 'undefined'){stacktrace = exceptionOrError.stack.toLocaleString();} else {stacktrace = stringifiedExceptionOrError;}
        }
        console.error('ERROR: ' + stringifiedExceptionOrError);
        quantimodoService.setupBugsnag().then(function () {
            Bugsnag.notify(stringifiedExceptionOrError, stacktrace, {groupingHash: stringifiedExceptionOrError}, "error");
            deferred.resolve();
        }, function (error) {
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.reportException = function(exception, name, metaData){
        console.error('ERROR: ' + exception.message);
        quantimodoService.setupBugsnag().then(function () {
            Bugsnag.notifyException(exception, name, metaData);
        }, function (error) {console.error(error);});
    };
    quantimodoService.setupBugsnag = function(){
        var deferred = $q.defer();
        if (typeof Bugsnag !== "undefined") {
            //Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
            //Bugsnag.notifyReleaseStages = ['Production','Staging'];
            Bugsnag.releaseStage = quantimodoService.getEnv();
            Bugsnag.appVersion = config.appSettings.versionNumber;
            if($rootScope.user){
                Bugsnag.metaData = {
                    platform: ionic.Platform.platform(),
                    platformVersion: ionic.Platform.version(),
                    user: {name: $rootScope.user.displayName, email: $rootScope.user.email}
                };
            } else {Bugsnag.metaData = {platform: ionic.Platform.platform(), platformVersion: ionic.Platform.version()};}
            if(config){Bugsnag.metaData.appDisplayName = config.appSettings.appDisplayName;}
            deferred.resolve();
        } else {deferred.reject('Bugsnag is not defined');}
        return deferred.promise;
    };
    quantimodoService.getLocationInfoFromFoursquareOrGoogleMaps = function (long, lat) {
        //console.debug('ok, in getInfo with ' + long + ',' + lat);
        var deferred = $q.defer();
        quantimodoService.getLocationInfoFromFoursquare($http).whatsAt(long, lat).then(function (result) {
            //console.debug('back from fq with '+JSON.stringify(result));
            if (result.status === 200 && result.data.response.venues.length >= 1) {
                var bestMatch = result.data.response.venues[0];
                //convert the result to something the caller can use consistently
                result = {type: "foursquare", name: bestMatch.name, address: bestMatch.location.formattedAddress.join(", ")};
                //console.dir(bestMatch);
                deferred.resolve(result);
            } else {
                //ok, time to try google
                quantimodoService.getLocationInfoFromGoogleMaps($http).lookup(long, lat).then(function (result) {
                    //console.debug('back from google with ');
                    if (result.data && result.data.results && result.data.results.length >= 1) {
                        //console.debug('did i come in here?');
                        var bestMatch = result.data.results[0];
                        //console.debug(JSON.stringify(bestMatch));
                        result = {type: "geocode", address: bestMatch.formatted_address};
                        deferred.resolve(result);
                    }
                });
            }
        });
        return deferred.promise;
    };
    quantimodoService.getLocationInfoFromGoogleMaps = function ($http) {
        var GOOGLE_MAPS_API_KEY = window.private_keys.GOOGLE_MAPS_API_KEY;
        if (!GOOGLE_MAPS_API_KEY) {console.error('Please add GOOGLE_MAPS_API_KEY to private config');}
        function lookup(long, lat) {
            return $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&key=' + GOOGLE_MAPS_API_KEY);
        }
        return {lookup: lookup};
    };
    quantimodoService.getLocationInfoFromFoursquare = function ($http) {
        var FOURSQUARE_CLIENT_ID = window.private_keys.FOURSQUARE_CLIENT_ID;
        var FOURSQUARE_CLIENT_SECRET = window.private_keys.FOURSQUARE_CLIENT_SECRET;
        if (!FOURSQUARE_CLIENT_ID) {console.error('Please add FOURSQUARE_CLIENT_ID & FOURSQUARE_CLIENT_SECRET to private config');}
        function whatsAt(long, lat) {
            return $http.get('https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + long +
                '&intent=browse&radius=30&client_id=' + FOURSQUARE_CLIENT_ID + '&client_secret=' +
                FOURSQUARE_CLIENT_SECRET + '&v=20151201');
        }
        return {whatsAt: whatsAt};
    };
    quantimodoService.setLocationVariables = function (result, currentTimeEpochSeconds) {
        if (result.name && result.name !== "undefined") {
            localStorage.lastLocationName = result.name;
        } else if (result.address && result.address !== "undefined") {
            localStorage.lastLocationName = result.address;
        } else {
            console.error("Where's the damn location info?");
        }
        if (result.address) {
            localStorage.lastLocationAddress = result.address;
            localStorage.lastLocationResultType = result.type;
            localStorage.lastLocationUpdateTimeEpochSeconds = currentTimeEpochSeconds;
            if(result.address === localStorage.lastLocationName){
                localStorage.lastLocationNameAndAddress = localStorage.lastLocationAddress;
            } else{
                localStorage.lastLocationNameAndAddress = localStorage.lastLocationName + " (" + localStorage.lastLocationAddress + ")";
            }
        }
    };
    quantimodoService.postLocationMeasurementAndSetLocationVariables = function (currentTimeEpochSeconds, result, isBackground) {
        var variableName = false;
        if (localStorage.lastLocationName && localStorage.lastLocationName !== "undefined") {
            variableName = localStorage.lastLocationName;
        } else if (localStorage.lastLocationAddress && localStorage.lastLocationAddress !== "undefined") {
            variableName = localStorage.lastLocationAddress;
        } else {console.error("Where's the damn location info?");}
        var secondsAtLocation = currentTimeEpochSeconds - localStorage.lastLocationUpdateTimeEpochSeconds;
        var hoursAtLocation = Math.round(secondsAtLocation/3600 * 100) / 100;
        var sourceName = localStorage.lastLocationResultType + ' on ' + getSourceName();
        if(isBackground){sourceName = sourceName + " (Background Geolocation)";}
        if (variableName && variableName !== "undefined" && secondsAtLocation > 60) {
            var newMeasurement = {
                variableName: variableName,
                unitAbbreviatedName: 'h',
                startTimeEpoch: localStorage.lastLocationUpdateTimeEpochSeconds,
                sourceName: sourceName,
                value: hoursAtLocation,
                variableCategoryName: 'Location',
                location: localStorage.lastLocationAddress,
                combinationOperation: "SUM"
            };
            quantimodoService.postMeasurementDeferred(newMeasurement);
            quantimodoService.setLocationVariables(result, currentTimeEpochSeconds);
        }
    };
    quantimodoService.getLocationVariablesFromLocalStorage = function () {
        if($rootScope.user && $rootScope.user.trackLocation){
            localStorage.lastLocationName = quantimodoService.getLocalStorageItemAsString('lastLocationName');
            localStorage.lastLocationAddress = quantimodoService.getLocalStorageItemAsString('lastLocationAddress');
            localStorage.lastLocationResultType = quantimodoService.getLocalStorageItemAsString('lastLocationResultType');
            localStorage.lastLocationUpdateTimeEpochSeconds = quantimodoService.getLocalStorageItemAsString('lastLocationUpdateTimeEpochSeconds');
            localStorage.lastLocationNameAndAddress = quantimodoService.getLocalStorageItemAsString('lastLocationNameAndAddress');
        }
    };
    function lookupGoogleAndFoursquareLocationAndPostMeasurement(deferred, isBackground) {
        quantimodoService.forecastioWeather();
        quantimodoService.getLocationInfoFromFoursquareOrGoogleMaps(localStorage.lastLongitude,
            localStorage.lastLatitude).then(function (result) {
            //console.debug('Result was '+JSON.stringify(result));
            if (result.type === 'foursquare') {
                //console.debug('Foursquare location name is ' + result.name + ' located at ' + result.address);
            } else if (result.type === 'geocode') {
                //console.debug('geocode address is ' + result.address);
            } else {
                var map = 'https://maps.googleapis.com/maps/api/staticmap?center=' +
                    localStorage.lastLatitude + ',' + localStorage.lastLongitude +
                    'zoom=13&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:X%7C' +
                    localStorage.lastLatitude + ',' + localStorage.lastLongitude;
                console.debug('Sorry, I\'ve got nothing. But here is a map!');
            }
            var currentTimeEpochMilliseconds = new Date().getTime();
            var currentTimeEpochSeconds = Math.round(currentTimeEpochMilliseconds / 1000);
            if (!localStorage.lastLocationUpdateTimeEpochSeconds && result.address && result.address !== "undefined") {
                quantimodoService.setLocationVariables(result, currentTimeEpochSeconds);
            } else {
                if (result.address && result.address !== "undefined" &&
                    (localStorage.lastLocationAddress !== result.address || localStorage.lastLocationName !== result.name)) {
                    quantimodoService.postLocationMeasurementAndSetLocationVariables(currentTimeEpochSeconds, result, isBackground);
                }
            }
            if(deferred){deferred.resolve(result);}

        });
    }
    quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged = function () {
        var deferred = $q.defer();
        var usingBackgroundLocationTracking = true;
        if(usingBackgroundLocationTracking){
            console.debug("Not logging location with $cordovaGeolocation because we're using background location tracker instead");
            deferred.reject();
            return deferred.promise;
        }
        quantimodoService.getLocationVariablesFromLocalStorage();
        if(!$rootScope.user){
            deferred.reject();
            return deferred.promise;
        }
        if(!$rootScope.user.trackLocation){
            deferred.reject();
            return deferred.promise;
        }
        $ionicPlatform.ready(function() {
            var posOptions = {enableHighAccuracy: true, timeout: 20000, maximumAge: 0};
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                localStorage.lastLatitude = position.coords.latitude;
                quantimodoService.setLocalStorageItem('lastLatitude', position.coords.latitude);
                localStorage.lastLongitude = position.coords.longitude;
                quantimodoService.setLocalStorageItem('lastLongitude', position.coords.longitude);
                lookupGoogleAndFoursquareLocationAndPostMeasurement(deferred);
                //console.debug("My coordinates are: ", position.coords);
            }, function(error) {
                deferred.reject(error);
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            });

        });
        return deferred.promise;
    };
    quantimodoService.backgroundGeolocationStart = function () {
        if(typeof backgroundGeoLocation === "undefined"){
            console.warn('Cannot execute backgroundGeolocationStart because backgroundGeoLocation is not defined');
            return;
        }
        console.debug('Starting quantimodoService.backgroundGeolocationStart');
        var callbackFn = function(location) {
            console.debug("background location is " + JSON.stringify(location));
            var isBackground = true;
            localStorage.lastLatitude = location.latitude;
            quantimodoService.setLocalStorageItem('lastLatitude', location.latitude);
            localStorage.lastLongitude = location.longitude;
            quantimodoService.setLocalStorageItem('lastLongitude', location.longitude);
            lookupGoogleAndFoursquareLocationAndPostMeasurement(null, isBackground);
            backgroundGeoLocation.finish();
        };
        var failureFn = function(error) {
            var errorMessage = 'BackgroundGeoLocation error ' + JSON.stringify(error);
            console.error(errorMessage);
            quantimodoService.reportError(errorMessage);
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
    quantimodoService.backgroundGeolocationInit = function () {
        var deferred = $q.defer();
        console.debug('Starting quantimodoService.backgroundGeolocationInit');
        if ($rootScope.user && $rootScope.user.trackLocation) {
            $ionicPlatform.ready(function() { quantimodoService.backgroundGeolocationStart(); });
            deferred.resolve();
        } else {
            var error = 'quantimodoService.backgroundGeolocationInit failed because $rootScope.user.trackLocation is not true';
            console.debug(error);
            deferred.reject(error);
        }
        return deferred.promise;
    };
    quantimodoService.backgroundGeolocationStop = function () {
        if(typeof backgroundGeoLocation !== "undefined"){
            window.localStorage.setItem('bgGPS', 0);
            backgroundGeoLocation.stop();
        }
    };
    var delayBeforePostingNotifications = 3 * 60 * 1000;
    var putTrackingReminderNotificationsInLocalStorageAndUpdateInbox = function (trackingReminderNotifications) {
        localStorage.setItem('lastGotNotificationsAt', new Date().getTime());
        trackingReminderNotifications = quantimodoService.attachVariableCategoryIcons(trackingReminderNotifications);
        quantimodoService.setLocalStorageItem('trackingReminderNotifications',
            JSON.stringify(trackingReminderNotifications)).then(function () {
            $rootScope.$broadcast('getTrackingReminderNotificationsFromLocalStorage');
            console.debug('Just put ' + trackingReminderNotifications.length + ' trackingReminderNotifications in local storage');
        });
        $rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
        return trackingReminderNotifications;
    };
    quantimodoService.getSecondsSinceWeLastGotNotifications = function () {
        var lastGotNotificationsAt = localStorage.getItem('lastGotNotificationsAt');
        if(!lastGotNotificationsAt){ lastGotNotificationsAt = 0; }
        return parseInt((new Date().getTime() - lastGotNotificationsAt)/1000);
    };
    quantimodoService.postTrackingRemindersDeferred = function(trackingRemindersArray){
        var deferred = $q.defer();
        var postTrackingRemindersToApiAndHandleResponse = function(){
            quantimodoService.postTrackingRemindersToApi(trackingRemindersArray, function(response){
                if(response && response.data){
                    if(response.data.trackingReminderNotifications){putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data.trackingReminderNotifications);}
                    quantimodoService.deleteItemFromLocalStorage('trackingReminderSyncQueue');
                    if(response.data.trackingReminders){quantimodoService.setLocalStorageItem('trackingReminders', JSON.stringify(response.data.trackingReminders));}
                    if(response.data.userVariables){quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);}
                }
                deferred.resolve(response);
            }, function(error){deferred.reject(error);});
        };
        quantimodoService.postTrackingReminderNotificationsDeferred().then(function () {
            postTrackingRemindersToApiAndHandleResponse();
        }, function(error){
            postTrackingRemindersToApiAndHandleResponse();
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.postTrackingReminderNotificationsDeferred = function(successHandler, errorHandler){
        var deferred = $q.defer();
        var trackingReminderNotificationsArray = quantimodoService.getLocalStorageItemAsObject('notificationsSyncQueue');
        quantimodoService.deleteItemFromLocalStorage('notificationsSyncQueue');
        if(!trackingReminderNotificationsArray){
            if(successHandler){successHandler();}
            deferred.resolve();
            return deferred.promise;
        }
        quantimodoService.postTrackingReminderNotificationsToApi(trackingReminderNotificationsArray, function(response){
            if(successHandler){successHandler();}
            deferred.resolve();
        }, function(error){
            var newNotificationsSyncQueue = quantimodoService.getLocalStorageItemAsObject('notificationsSyncQueue');
            if(newNotificationsSyncQueue){
                trackingReminderNotificationsArray = trackingReminderNotificationsArray.concat(newNotificationsSyncQueue);
            }
            quantimodoService.setLocalStorageItem('notificationsSyncQueue', JSON.stringify(trackingReminderNotificationsArray));
            if(errorHandler){errorHandler();}
            deferred.reject(error);
        });
        return deferred.promise;
    };
    var scheduleNotificationSync = function () {
        var trackingReminderNotificationSyncScheduled = localStorage.getItem('trackingReminderNotificationSyncScheduled');
        if(!trackingReminderNotificationSyncScheduled ||
            parseInt(trackingReminderNotificationSyncScheduled) < new Date().getTime() - delayBeforePostingNotifications){
            localStorage.setItem('trackingReminderNotificationSyncScheduled', new Date().getTime());
            $timeout(function() {
                localStorage.removeItem('trackingReminderNotificationSyncScheduled');
                // Post notification queue in 5 minutes if it's still there
                quantimodoService.postTrackingReminderNotificationsDeferred();
            }, delayBeforePostingNotifications);
        }
    };
    quantimodoService.skipTrackingReminderNotificationDeferred = function(trackingReminderNotification){
        var deferred = $q.defer();
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', trackingReminderNotification.id);
        trackingReminderNotification.action = 'skip';
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('notificationsSyncQueue', trackingReminderNotification);
        scheduleNotificationSync();
        return deferred.promise;
    };
    quantimodoService.skipAllTrackingReminderNotificationsDeferred = function(params){
        var deferred = $q.defer();
        quantimodoService.deleteItemFromLocalStorage('trackingReminderNotifications');
        quantimodoService.skipAllTrackingReminderNotifications(params, function(response){
            if(response.success) {deferred.resolve();} else {deferred.reject();}
        }, function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.trackTrackingReminderNotificationDeferred = function(trackingReminderNotification){
        var deferred = $q.defer();
        console.debug('quantimodoService.trackTrackingReminderNotificationDeferred: Going to track ' + JSON.stringify(trackingReminderNotification));
        if(!trackingReminderNotification.variableName && trackingReminderNotification.trackingReminderNotificationId){
            var notificationFromLocalStorage =
                quantimodoService.getElementOfLocalStorageItemById('trackingReminderNotifications',
                    trackingReminderNotification.trackingReminderNotificationId);
            if(notificationFromLocalStorage){
                if(typeof trackingReminderNotification.modifiedValue !== "undefined" && trackingReminderNotification.modifiedValue !== null){
                    notificationFromLocalStorage.modifiedValue = trackingReminderNotification.modifiedValue;
                }
                trackingReminderNotification = notificationFromLocalStorage;
            }
        }
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', trackingReminderNotification.id);
        trackingReminderNotification.action = 'track';
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('notificationsSyncQueue', trackingReminderNotification);
        scheduleNotificationSync();
        return deferred.promise;
    };
    quantimodoService.snoozeTrackingReminderNotificationDeferred = function(body){
        var deferred = $q.defer();
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', body.id);
        body.action = 'snooze';
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('notificationsSyncQueue', body);
        scheduleNotificationSync();
        return deferred.promise;
    };
    quantimodoService.getTrackingRemindersDeferred = function(variableCategoryName) {
        var deferred = $q.defer();
        quantimodoService.getTrackingRemindersFromLocalStorage(variableCategoryName).then(function (trackingReminders) {
            if (trackingReminders && trackingReminders.length) {deferred.resolve(trackingReminders);
            } else {quantimodoService.syncTrackingReminders().then(function (trackingReminders) {deferred.resolve(trackingReminders);});}
        });
        return deferred.promise;
    };
    quantimodoService.getTodayTrackingReminderNotificationsDeferred = function(variableCategoryName){
        var params = {
            minimumReminderTimeUtcString : quantimodoService.getLocalMidnightInUtcString(),
            maximumReminderTimeUtcString : quantimodoService.getTomorrowLocalMidnightInUtcString(),
            sort : 'reminderTime'
        };
        if (variableCategoryName) {params.variableCategoryName = variableCategoryName;}
        var deferred = $q.defer();
        quantimodoService.getTrackingReminderNotificationsFromApi(params, function(response){
            if(response.success) {
                var trackingReminderNotifications = putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data);
                deferred.resolve(trackingReminderNotifications);
            } else {deferred.reject("error");}
        }, function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getTrackingReminderNotificationsFromLocalStorage = function (variableCategoryName) {
        var trackingReminderNotifications = quantimodoService.getElementsFromLocalStorageItemWithFilters(
            'trackingReminderNotifications', 'variableCategoryName', variableCategoryName);
        if(!trackingReminderNotifications){ trackingReminderNotifications = []; }
        if(trackingReminderNotifications.length){
            $rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
            if (window.chrome && window.chrome.browserAction && !variableCategoryName) {
                //noinspection JSUnresolvedFunction
                chrome.browserAction.setBadgeText({text: "?"});
                //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
            }
        }
        return trackingReminderNotifications;
    };
    quantimodoService.getTrackingReminderNotificationsDeferred = function(variableCategoryName){
        var deferred = $q.defer();
        var trackingReminderNotifications =
            quantimodoService.getTrackingReminderNotificationsFromLocalStorage(variableCategoryName);
        if(trackingReminderNotifications && trackingReminderNotifications.length){
            deferred.resolve(trackingReminderNotifications);
            return deferred.promise;
        }
        $rootScope.numberOfPendingNotifications = 0;
        quantimodoService.refreshTrackingReminderNotifications().then(function () {
            trackingReminderNotifications = quantimodoService.getElementsFromLocalStorageItemWithFilters(
                'trackingReminderNotifications', 'variableCategoryName', variableCategoryName);
            deferred.resolve(trackingReminderNotifications);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.refreshTrackingReminderNotifications = function(){
        var deferred = $q.defer();
        var options = {};
        options.minimumSecondsBetweenRequests = 3;
        if(!canWeMakeRequestYet('GET', 'refreshTrackingReminderNotifications', options)){
            deferred.reject('Already called refreshTrackingReminderNotifications within last ' + options.minimumSecondsBetweenRequests + ' seconds!  Rejecting promise!');
            return deferred.promise;
        }
        quantimodoService.postTrackingReminderNotificationsDeferred(function(){
            var currentDateTimeInUtcStringPlus5Min = quantimodoService.getCurrentDateTimeInUtcStringPlusMin(5);
            var params = {};
            params.reminderTime = '(lt)' + currentDateTimeInUtcStringPlus5Min;
            params.sort = '-reminderTime';
            quantimodoService.getTrackingReminderNotificationsFromApi(params, function(response){
                if(response.success) {
                    var trackingReminderNotifications = putTrackingReminderNotificationsInLocalStorageAndUpdateInbox(response.data);
                    if (window.chrome && window.chrome.browserAction) {
                        chrome.browserAction.setBadgeText({text: "?"});
                        //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
                    }
                    $rootScope.refreshingTrackingReminderNotifications = false;
                    deferred.resolve(trackingReminderNotifications);
                }
                else {
                    $rootScope.refreshingTrackingReminderNotifications = false;
                    deferred.reject("error");
                }
            }, function(error){
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                $rootScope.refreshingTrackingReminderNotifications = false;
                deferred.reject(error);
            });
        }, function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            $rootScope.refreshingTrackingReminderNotifications = false;
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getTrackingReminderByIdDeferred = function(reminderId){
        var deferred = $q.defer();
        var params = {id : reminderId};
        quantimodoService.getTrackingRemindersFromApi(params, function(remindersResponse){
            var trackingReminders = remindersResponse.data;
            if(remindersResponse.success) {deferred.resolve(trackingReminders);} else {deferred.reject("error");}
        }, function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getCurrentTrackingReminderNotificationsFromApi = function(category, today){
        var localMidnightInUtcString = quantimodoService.getLocalMidnightInUtcString();
        var currentDateTimeInUtcString = quantimodoService.getCurrentDateTimeInUtcString();
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
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        };
        quantimodoService.get('api/v1/trackingReminderNotifications',
            ['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'],
            params, successHandler, errorHandler);
        return deferred.promise;
    };
    quantimodoService.getTrackingReminderNotificationsDeferredFromLocalStorage = function(category, today){
        var localMidnightInUtcString = quantimodoService.getLocalMidnightInUtcString();
        var currentDateTimeInUtcString = quantimodoService.getCurrentDateTimeInUtcString();
        var trackingReminderNotifications = [];
        if(today && !category){
            trackingReminderNotifications = quantimodoService.getElementsFromLocalStorageItemWithFilters(
                'trackingReminderNotifications', null, null, null, null, 'reminderTime', localMidnightInUtcString);
            var reminderTime = '(gt)' + localMidnightInUtcString;
        }
        if(!today && category){
            trackingReminderNotifications = quantimodoService.getElementsFromLocalStorageItemWithFilters(
                'trackingReminderNotifications', 'variableCategoryName', category, 'reminderTime', currentDateTimeInUtcString, null, null);
        }
        if(today && category){
            trackingReminderNotifications = quantimodoService.getElementsFromLocalStorageItemWithFilters(
                'trackingReminderNotifications', 'variableCategoryName', category, null, null, 'reminderTime', localMidnightInUtcString);
        }
        if(!today && !category){
            trackingReminderNotifications = quantimodoService.getElementsFromLocalStorageItemWithFilters(
                'trackingReminderNotifications', null, null, 'reminderTime', currentDateTimeInUtcString, null, null);
        }
        return trackingReminderNotifications;
    };
    quantimodoService.deleteTrackingReminderDeferred = function(reminderId){
        var deferred = $q.defer();
        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminders', reminderId);
        quantimodoService.deleteElementsOfLocalStorageItemByProperty('trackingReminderNotifications', 'trackingReminderId', reminderId);
        quantimodoService.deleteTrackingReminder(reminderId, function(response){
            if(response.success) {
                // Delete again in case we refreshed before deletion completed
                quantimodoService.deleteElementOfLocalStorageItemById('trackingReminders', reminderId);
                quantimodoService.deleteElementsOfLocalStorageItemByProperty('trackingReminderNotifications', 'trackingReminderId', reminderId);
                deferred.resolve();
            }
            else {deferred.reject();}
        }, function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    // We need to keep this in case we want offline reminders
    quantimodoService.addRatingTimesToDailyReminders = function(reminders) {
        var index;
        for (index = 0; index < reminders.length; ++index) {
            if (reminders[index].valueAndFrequencyTextDescription &&
                reminders[index].valueAndFrequencyTextDescription.indexOf('daily') > 0 &&
                reminders[index].valueAndFrequencyTextDescription.indexOf(' at ') === -1 &&
                reminders[index].valueAndFrequencyTextDescription.toLowerCase().indexOf('disabled') === -1) {
                reminders[index].valueAndFrequencyTextDescription = reminders[index].valueAndFrequencyTextDescription + ' at ' +
                    quantimodoService.convertReminderTimeStringToMoment(reminders[index].reminderStartTime).format("h:mm A");
            }
        }
        return reminders;
    };
    quantimodoService.getValueAndFrequencyTextDescriptionWithTime = function(trackingReminder){
        if(trackingReminder.reminderFrequency === 86400){
            if(trackingReminder.unitCategoryName === 'Rating'){return 'Daily at ' + quantimodoService.humanFormat(trackingReminder.reminderStartTimeLocal);}
            return trackingReminder.defaultValue + ' ' + trackingReminder.unitAbbreviatedName + ' daily at ' + quantimodoService.humanFormat(trackingReminder.reminderStartTimeLocal);
        } else if (trackingReminder.reminderFrequency === 0){
            if(trackingReminder.unitCategoryName === "Rating"){return "As-Needed";}
            if(trackingReminder.defaultValue){return trackingReminder.defaultValue + ' ' + trackingReminder.unitAbbreviatedName + ' as-needed';}
            return "As-Needed";
        } else {
            if(trackingReminder.unitCategoryName === 'Rating'){return 'Rate every ' + trackingReminder.reminderFrequency/3600 + " hours";}
            return trackingReminder.defaultValue + ' ' + trackingReminder.unitAbbreviatedName + ' every ' + trackingReminder.reminderFrequency/3600 + " hours";
        }
    };
    quantimodoService.convertReminderTimeStringToMoment = function(reminderTimeString) {
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
    quantimodoService.addToTrackingReminderSyncQueue = function(trackingReminder) {
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderSyncQueue', trackingReminder);
    };
    quantimodoService.syncTrackingReminders = function() {
        var deferred = $q.defer();
        var trackingReminderSyncQueue = quantimodoService.getLocalStorageItemAsObject('trackingReminderSyncQueue');
        if(trackingReminderSyncQueue && trackingReminderSyncQueue.length){
            quantimodoService.postTrackingRemindersDeferred(trackingReminderSyncQueue).then(function (response) {
                deferred.resolve(response);
            }, function(error) { if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error); });
        } else {
            quantimodoService.getTrackingRemindersFromApi({}, function(remindersResponse){
                if(remindersResponse && remindersResponse.data) {
                    quantimodoService.setLocalStorageItem('trackingReminders', JSON.stringify(remindersResponse.data));
                    deferred.resolve(remindersResponse.data);
                } else { deferred.reject("error in getTrackingRemindersFromApi"); }
            }, function(error){
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); }
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };
    quantimodoService.deleteTrackingReminderNotificationFromLocalStorage = function(body){
        var trackingReminderNotificationId = body;
        if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotification){trackingReminderNotificationId = body.trackingReminderNotification.id;}
        if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotificationId){trackingReminderNotificationId = body.trackingReminderNotificationId;}
        $rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications',
            trackingReminderNotificationId);
        /* We don't have separate items for categories
         if(body.trackingReminderNotification && typeof body.trackingReminderNotification.variableCategoryName !== "undefined"){
         quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications' +
         body.trackingReminderNotification.variableCategoryName,
         trackingReminderNotificationId);
         }*/
    };
    quantimodoService.groupTrackingReminderNotificationsByDateRange = function (trackingReminderNotifications) {
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
    quantimodoService.getTrackingRemindersFromLocalStorage = function (variableCategoryName){
        var deferred = $q.defer();
        var filteredReminders = [];
        var unfilteredReminders = JSON.parse(quantimodoService.getLocalStorageItemAsString('trackingReminders'));
        if(!unfilteredReminders){unfilteredReminders = [];}
        var syncQueue = JSON.parse(quantimodoService.getLocalStorageItemAsString('trackingReminderSyncQueue'));
        if(syncQueue){unfilteredReminders = unfilteredReminders.concat(syncQueue);}
        unfilteredReminders = quantimodoService.attachVariableCategoryIcons(unfilteredReminders);
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
            filteredReminders = quantimodoService.addRatingTimesToDailyReminders(filteredReminders); //We need to keep this in case we want offline reminders
            deferred.resolve(filteredReminders);
        }
        return deferred.promise;
    };
    quantimodoService.createDefaultReminders = function () {
        var deferred = $q.defer();
        quantimodoService.getLocalStorageItemAsStringWithCallback('defaultRemindersCreated', function (defaultRemindersCreated) {
            if(JSON.parse(defaultRemindersCreated) !== true) {
                var defaultReminders = quantimodoService.getDefaultReminders();
                if(defaultReminders && defaultReminders.length){
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront(
                        'trackingReminderSyncQueue', defaultReminders).then(function () {
                        quantimodoService.syncTrackingReminders().then(function (trackingReminders){ deferred.resolve(trackingReminders);});
                    });
                    console.debug('Creating default reminders ' + JSON.stringify(defaultReminders));
                }
            } else {
                deferred.reject('Default reminders already created');
                console.debug('Default reminders already created');
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
    quantimodoService.clearCorrelationCache = function(){
        quantimodoService.deleteCachedResponse('aggregatedCorrelations');
        quantimodoService.deleteCachedResponse('correlations');
    };
    quantimodoService.getAggregatedCorrelationsDeferred = function(params){
        var deferred = $q.defer();
        var cachedCorrelations = quantimodoService.getCachedResponse('aggregatedCorrelations', params);
        if(cachedCorrelations){
            deferred.resolve(cachedCorrelations);
            return deferred.promise;
        }
        quantimodoService.getAggregatedCorrelationsFromApi(params, function(correlationObjects){
            correlationObjects = useLocalImages(correlationObjects);
            quantimodoService.storeCachedResponse('aggregatedCorrelations', params, correlationObjects);
            deferred.resolve(correlationObjects);
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getNotesDeferred = function(variableName){
        var deferred = $q.defer();
        quantimodoService.getNotesFromApi({variableName: variableName}, function(response){
            deferred.resolve(response.data);
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getCorrelationsDeferred = function (params) {
        var deferred = $q.defer();
        var cachedCorrelationsResponseData = quantimodoService.getCachedResponse('correlations', params);
        if(cachedCorrelationsResponseData){
            deferred.resolve(cachedCorrelationsResponseData);
            return deferred.promise;
        }
        quantimodoService.getUserCorrelationsFromApi(params, function(response){
            response.data.correlations = useLocalImages(response.data.correlations);
            quantimodoService.storeCachedResponse('correlations', params, response.data);
            deferred.resolve(response.data);
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.postVoteDeferred = function(correlationObject){
        var deferred = $q.defer();
        quantimodoService.postVoteToApi(correlationObject, function(response){
            quantimodoService.clearCorrelationCache();
            deferred.resolve(true);
        }, function(error){
            console.error("postVote response", error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.deleteVoteDeferred = function(correlationObject){
        var deferred = $q.defer();
        quantimodoService.deleteVoteToApi(correlationObject, function(response){
            quantimodoService.clearCorrelationCache();
            deferred.resolve(true);
        }, function(error){
            console.error("deleteVote response", error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getRatingInfo = function() {
        var ratingInfo =
            {
                1 : {
                    displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                    positiveImage: quantimodoService.ratingImages.positive[0],
                    negativeImage: quantimodoService.ratingImages.negative[0],
                    numericImage:  quantimodoService.ratingImages.numeric[0],
                },
                2 : {
                    displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                    positiveImage: quantimodoService.ratingImages.positive[1],
                    negativeImage: quantimodoService.ratingImages.negative[1],
                    numericImage:  quantimodoService.ratingImages.numeric[1],
                },
                3 : {
                    displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                    positiveImage: quantimodoService.ratingImages.positive[2],
                    negativeImage: quantimodoService.ratingImages.negative[2],
                    numericImage:  quantimodoService.ratingImages.numeric[2],
                },
                4 : {
                    displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                    positiveImage: quantimodoService.ratingImages.positive[3],
                    negativeImage: quantimodoService.ratingImages.negative[3],
                    numericImage:  quantimodoService.ratingImages.numeric[3],
                },
                5 : {
                    displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                    positiveImage: quantimodoService.ratingImages.positive[4],
                    negativeImage: quantimodoService.ratingImages.negative[4],
                    numericImage:  quantimodoService.ratingImages.numeric[4],
                }
            };
        return ratingInfo;
    };
    quantimodoService.getPrimaryOutcomeVariableOptionLabels = function(shouldShowNumbers){
        if(shouldShowNumbers || !quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels){return ['1',  '2',  '3',  '4', '5'];
        } else {return quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels;}
    };
    quantimodoService.getPositiveImageByRatingValue = function(numericValue){
        var positiveRatingOptions = quantimodoService.getPositiveRatingOptions();
        var filteredList = positiveRatingOptions.filter(function(option){return option.numericValue === numericValue;});
        return filteredList.length? filteredList[0].img || false : false;
    };
    quantimodoService.getNegativeImageByRatingValue = function(numericValue){
        var negativeRatingOptions = this.getNegativeRatingOptions();
        var filteredList = negativeRatingOptions.filter(function(option){return option.numericValue === numericValue;});
        return filteredList.length? filteredList[0].img || false : false;
    };
    quantimodoService.getNumericImageByRatingValue = function(numericValue){
        var numericRatingOptions = this.getNumericRatingOptions();
        var filteredList = numericRatingOptions.filter(function(option){return option.numericValue === numericValue;});
        return filteredList.length? filteredList[0].img || false : false;
    };
    quantimodoService.getPrimaryOutcomeVariableByNumber = function(num){
        return quantimodoService.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] ? quantimodoService.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[num] : false;
    };
    quantimodoService.getRatingFaceImageByText = function(lowerCaseRatingTextDescription){
        var positiveRatingOptions = quantimodoService.getPositiveRatingOptions();
        var filteredList = positiveRatingOptions.filter(
            function(option){return option.lowerCaseTextDescription === lowerCaseRatingTextDescription;});
        return filteredList.length ? filteredList[0].img || false : false;
    };
    quantimodoService.getPositiveRatingOptions = function() {
        return [
            {
                numericValue: 1,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                lowerCaseTextDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[0].toLowerCase(),
                img: quantimodoService.ratingImages.positive[0]
            },
            {
                numericValue: 2,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                lowerCaseTextDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[1].toLowerCase(),
                img: quantimodoService.ratingImages.positive[1]
            },
            {
                numericValue: 3,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                lowerCaseTextDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[2].toLowerCase(),
                img: quantimodoService.ratingImages.positive[2]
            },
            {
                numericValue: 4,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                lowerCaseTextDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[3].toLowerCase(),
                img: quantimodoService.ratingImages.positive[3]
            },
            {
                numericValue: 5,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                lowerCaseTextDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[4].toLowerCase(),
                img: quantimodoService.ratingImages.positive[4]
            }
        ];
    };
    quantimodoService.getNegativeRatingOptions = function() {
        return [
            {
                numericValue: 1,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                value: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[4].toLowerCase(),
                img: quantimodoService.ratingImages.negative[0]
            },
            {
                numericValue: 2,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                value: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[3].toLowerCase(),
                img: quantimodoService.ratingImages.negative[1]
            },
            {
                numericValue: 3,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                value: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[2].toLowerCase(),
                img: quantimodoService.ratingImages.negative[2]
            },
            {
                numericValue: 4,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                value: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[1].toLowerCase(),
                img: quantimodoService.ratingImages.negative[3]
            },
            {
                numericValue: 5,
                displayDescription: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                value: quantimodoService.getPrimaryOutcomeVariable().ratingOptionLabels[0].toLowerCase(),
                img: quantimodoService.ratingImages.negative[4]
            }
        ];
    };
    quantimodoService.getNumericRatingOptions = function() {
        return [
            {numericValue: 1, img: quantimodoService.ratingImages.numeric[0]},
            {numericValue: 2, img: quantimodoService.ratingImages.numeric[1]},
            {numericValue: 3, img: quantimodoService.ratingImages.numeric[2]},
            {numericValue: 4, img: quantimodoService.ratingImages.numeric[3]},
            {numericValue: 5, img: quantimodoService.ratingImages.numeric[4]}
        ];
    };
    quantimodoService.addInfoAndImagesToMeasurements = function (measurements){
        var ratingInfo = quantimodoService.getRatingInfo();
        var index;
        for (index = 0; index < measurements.length; ++index) {
            if(!measurements[index].variableName){measurements[index].variableName = measurements[index].variable;}
            if(measurements[index].variableName === quantimodoService.getPrimaryOutcomeVariable().name){
                measurements[index].variableDescription = quantimodoService.getPrimaryOutcomeVariable().description;
            }
            if (measurements[index].unitAbbreviatedName === '/5') {measurements[index].roundedValue = Math.round(measurements[index].value);}
            if (measurements[index].unitAbbreviatedName.charAt(0) === '/') {
                // don't add space between value and unit
                measurements[index].valueUnitVariableName = measurements[index].value + measurements[index].unitAbbreviatedName + ' ' + measurements[index].variableName;
            }
            else {
                // add space between value and unit
                measurements[index].valueUnitVariableName = measurements[index].value + " " + measurements[index].unitAbbreviatedName + ' ' + measurements[index].variableName;
            }
            if (measurements[index].unitAbbreviatedName === '%') {
                measurements[index].roundedValue = Math.round(measurements[index].value / 25 + 1);
            }
            if (measurements[index].roundedValue && measurements[index].variableDescription === 'positive' && ratingInfo[measurements[index].roundedValue]) {
                measurements[index].image = measurements[index].image = ratingInfo[measurements[index].roundedValue].positiveImage;
            }
            if (measurements[index].roundedValue && measurements[index].variableDescription === 'negative' && ratingInfo[measurements[index].roundedValue]) {
                measurements[index].image = ratingInfo[measurements[index].roundedValue].negativeImage;
            }
            if (!measurements[index].image && measurements[index].roundedValue && ratingInfo[measurements[index].roundedValue]) {
                measurements[index].image = ratingInfo[measurements[index].roundedValue].numericImage;
            }
            if(measurements[index].image){ measurements[index].pngPath = measurements[index].image; }
            if (measurements[index].variableCategoryName){
                measurements[index].icon = quantimodoService.getVariableCategoryIcon(measurements[index].variableCategoryName);
            }
        }
        return measurements;
    };
    quantimodoService.getWeekdayChartConfigForPrimaryOutcome = function () {
        var deferred = $q.defer();
        deferred.resolve(quantimodoService.processDataAndConfigureWeekdayChart(
            quantimodoService.getLocalStorageItemAsObject('primaryOutcomeVariableMeasurements'),
            quantimodoService.getPrimaryOutcomeVariable()));
        return deferred.promise;
    };
    quantimodoService.generateDistributionArray = function(allMeasurements){
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
    quantimodoService.generateWeekdayMeasurementArray = function(allMeasurements){
        if(!allMeasurements){
            console.error('No measurements provided to generateWeekdayMeasurementArray');
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
    quantimodoService.generateMonthlyMeasurementArray = function(allMeasurements){
        if(!allMeasurements){
            console.error('No measurements provided to generateMonthlyMeasurementArray');
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
    quantimodoService.generateHourlyMeasurementArray = function(allMeasurements){
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
    quantimodoService.calculateAverageValueByHour = function(hourlyMeasurementArrays) {
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
                //console.debug("No data for hour " + k);
            }
        }
        return averageValueByHourArray;
    };
    quantimodoService.calculateAverageValueByWeekday = function(weekdayMeasurementArrays) {
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
                //console.debug("No data for day " + k);
            }
        }
        return averageValueByWeekdayArray;
    };
    quantimodoService.calculateAverageValueByMonthly = function(monthlyMeasurementArrays) {
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
                //console.debug("No data for day " + k);
            }
        }
        return averageValueByMonthlyArray;
    };
    var shouldWeUsePrimaryOutcomeLabels = function (variableObject) {
        return variableObject.userVariableDefaultUnitId === 10 && variableObject.name === quantimodoService.getPrimaryOutcomeVariable().name;
    };
    quantimodoService.configureDistributionChart = function(dataAndLabels, variableObject){
        var xAxisLabels = [];
        var xAxisTitle = 'Daily Values (' + variableObject.userVariableDefaultUnitAbbreviatedName + ')';
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
            xAxisLabels = quantimodoService.getPrimaryOutcomeVariableOptionLabels();
            xAxisTitle = '';
        }
        return {
            options: {
                chart: {
                    height : 300,
                    type : 'column',
                    renderTo : 'BarContainer',
                    animation: {
                        duration: 0
                    }
                },
                title : {
                    text : variableObject.name + ' Distribution'
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
                exporting: {
                    enabled: $rootScope.isWeb
                }
            },
            series: [{
                name : variableObject.name + ' Distribution',
                data: data
            }]
        };
    };
    quantimodoService.processDataAndConfigureWeekdayChart = function(measurements, variableObject) {
        if(!measurements){
            console.error('No measurements provided to processDataAndConfigureWeekdayChart');
            return false;
        }
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to processDataAndConfigureWeekdayChart");
            return;
        }
        var weekdayMeasurementArray = this.generateWeekdayMeasurementArray(measurements);
        var averageValueByWeekdayArray = this.calculateAverageValueByWeekday(weekdayMeasurementArray);
        return this.configureWeekdayChart(averageValueByWeekdayArray, variableObject);
    };
    quantimodoService.processDataAndConfigureMonthlyChart = function(measurements, variableObject) {
        if(!measurements){
            console.error('No measurements provided to processDataAndConfigureMonthlyChart');
            return false;
        }
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to processDataAndConfigureMonthlyChart");
            return;
        }
        var monthlyMeasurementArray = this.generateMonthlyMeasurementArray(measurements);
        var averageValueByMonthlyArray = this.calculateAverageValueByMonthly(monthlyMeasurementArray);
        return this.configureMonthlyChart(averageValueByMonthlyArray, variableObject);
    };
    quantimodoService.processDataAndConfigureHourlyChart = function(measurements, variableObject) {
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
            return;
        }
        var hourlyMeasurementArray = this.generateHourlyMeasurementArray(measurements);
        var count = 0;
        for(var i = 0; i < hourlyMeasurementArray.length; ++i){
            if(hourlyMeasurementArray[i]) {count++;}
        }
        if(variableObject.name.toLowerCase().indexOf('daily') !== -1){
            console.debug('Not showing hourly chart because variable name contains daily');
            return false;
        }
        if(count < 3){
            console.debug('Not showing hourly chart because we have less than 3 hours with measurements');
            return false;
        }
        var averageValueByHourArray = this.calculateAverageValueByHour(hourlyMeasurementArray);
        return this.configureHourlyChart(averageValueByHourArray, variableObject);
    };
    quantimodoService.processDataAndConfigureDistributionChart = function(measurements, variableObject) {
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
            return;
        }
        var distributionArray = this.generateDistributionArray(measurements);
        return this.configureDistributionChart(distributionArray, variableObject);
    };
    quantimodoService.configureWeekdayChart = function(averageValueByWeekdayArray, variableObject){
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to configureWeekdayChart");
            return;
        }
        var maximum = 0;
        var minimum = 99999999999999999999999999999999;
        var xAxisLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for(var i = 0; i < averageValueByWeekdayArray.length; i++){
            if(averageValueByWeekdayArray[i] > maximum){maximum = averageValueByWeekdayArray[i];}
            if(averageValueByWeekdayArray[i] < minimum){minimum = averageValueByWeekdayArray[i];}
        }
        return {
            options: {
                chart: {
                    height : 300,
                    type : 'column',
                    renderTo : 'BarContainer',
                    animation: {duration: 1000}
                },
                title : {text : 'Average  ' + variableObject.name + ' by Day of Week'},
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
                exporting: {
                    enabled: $rootScope.isWeb
                }
            },
            series: [{
                name : 'Average  ' + variableObject.name + ' by Day of Week',
                data: averageValueByWeekdayArray
            }]
        };
    };
    quantimodoService.configureMonthlyChart = function(averageValueByMonthlyArray, variableObject){
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to configureMonthlyChart");
            return;
        }
        var maximum = 0;
        var minimum = 99999999999999999999999999999999;
        var xAxisLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for(var i = 0; i < averageValueByMonthlyArray.length; i++){
            if(averageValueByMonthlyArray[i] > maximum){maximum = averageValueByMonthlyArray[i];}
            if(averageValueByMonthlyArray[i] < minimum){minimum = averageValueByMonthlyArray[i];}
        }
        return {
            options: {
                chart: {
                    height : 300,
                    type : 'column',
                    renderTo : 'BarContainer',
                    animation: {duration: 1000}
                },
                title : {text : 'Average  ' + variableObject.name + ' by Month'},
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
                exporting: {
                    enabled: $rootScope.isWeb
                }
            },
            series: [{
                name : 'Average  ' + variableObject.name + ' by Month',
                data: averageValueByMonthlyArray
            }]
        };
    };
    quantimodoService.configureHourlyChart = function(averageValueByHourArray, variableObject){
        if(!variableObject.name){
            console.error("ERROR: No variable name provided to configureHourlyChart");
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
        return {
            options: {
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
                exporting: {
                    enabled: $rootScope.isWeb
                }
            },
            series: [{
                name : 'Average  ' + variableObject.name + ' by Hour of Day',
                data: averageValueByHourArray
            }]
        };
    };
    quantimodoService.processDataAndConfigureLineChart = function(measurements, variableObject) {
        if(!measurements || !measurements.length){
            console.warn('No measurements provided to quantimodoService.processDataAndConfigureLineChart');
            return false;
        }
        var lineChartData = [];
        var lineChartItem;
        var numberOfMeasurements = measurements.length;
        if(numberOfMeasurements > 1000){console.warn('Highstock cannot show tooltips because we have more than 100 measurements');}
        for (var i = 0; i < numberOfMeasurements; i++) {
            if(numberOfMeasurements < 1000){
                lineChartItem = {x: measurements[i].startTimeEpoch * 1000, y: measurements[i].value, name: "(" + measurements[i].sourceName + ")"};
                if(measurements[i].note){lineChartItem.name = measurements[i].note + " " + lineChartItem.name;}
            } else {
                lineChartItem = [measurements[i].startTimeEpoch * 1000, measurements[i].value];
            }
            lineChartData.push(lineChartItem);
        }
        return quantimodoService.configureLineChart(lineChartData, variableObject);
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
    quantimodoService.processDataAndConfigureCorrelationsOverDurationsOfActionChart = function(correlations, weightedPeriod) {
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
        var config = {
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
        return config;
    };
    quantimodoService.processDataAndConfigureCorrelationsOverOnsetDelaysChart = function(correlations, weightedPeriod) {
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
    quantimodoService.processDataAndConfigurePairsOverTimeChart = function(pairs, correlationObject) {
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
                        text: correlationObject.causeVariableName + ' (' + correlationObject.causeunitAbbreviatedName + ')'
                    }
                }, {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        text: correlationObject.effectVariableName + ' (' + correlationObject.effectunitAbbreviatedName + ')'
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
                tooltip: {valueSuffix: '' + correlationObject.causeunitAbbreviatedName}
            }, {
                name: correlationObject.effectVariableName,
                color: '#EA4335',
                type: 'spline',
                yAxis: 1,
                data: outcomeSeries.data,
                tooltip: {valueSuffix: '' + correlationObject.effectunitAbbreviatedName}
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
    quantimodoService.createScatterPlot = function (correlationObject, pairs, title) {
        if(!pairs){
            console.warn('No pairs provided to quantimodoService.createScatterPlot');
            return false;
        }
        var xyVariableValues = [];
        for(var i = 0; i < pairs.length; i++ ){
            /** @namespace pairs[i].causeMeasurementValue */
            /** @namespace pairs[i].effectMeasurementValue */
            xyVariableValues.push([pairs[i].causeMeasurementValue, pairs[i].effectMeasurementValue]);
        }
        /** @namespace correlationObject.causeunitAbbreviatedName */
        /** @namespace correlationObject.effectunitAbbreviatedName */
        var scatterplotOptions = {
            options: {
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
                            pointFormat: '{point.x}' + correlationObject.causeunitAbbreviatedName + ', {point.y}' + correlationObject.effectunitAbbreviatedName
                        }
                    }
                },
                credits: {enabled: false},
                exporting: {
                    enabled: $rootScope.isWeb
                }
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: correlationObject.causeVariableName + ' (' + correlationObject.causeunitAbbreviatedName + ')'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {text: correlationObject.effectVariableName + ' (' + correlationObject.effectunitAbbreviatedName + ')'}
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
        return scatterplotOptions;
    };
    quantimodoService.configureLineChartForCause  = function(correlationObject, pairs) {
        var variableObject = {unitAbbreviatedName: correlationObject.causeunitAbbreviatedName, name: correlationObject.causeVariableName};
        var data = [];
        for (var i = 0; i < pairs.length; i++) {data[i] = [pairs[i].timestamp * 1000, pairs[i].causeMeasurementValue];}
        return quantimodoService.configureLineChart(data, variableObject);
    };
    quantimodoService.configureLineChartForEffect  = function(correlationObject, pairs) {
        var variableObject = {unitAbbreviatedName: correlationObject.effectunitAbbreviatedName, name: correlationObject.effectVariableName};
        var data = [];
        for (var i = 0; i < pairs.length; i++) {data[i] = [pairs[i].timestamp * 1000, pairs[i].effectMeasurementValue];}
        return quantimodoService.configureLineChart(data, variableObject);
    };
    quantimodoService.configureLineChartForPairs = function(params, pairs) {
        var inputColor = '#26B14C', outputColor = '#3284FF', mixedColor = '#26B14C', linearRegressionColor = '#FFBB00';
        if(!params.causeVariableName){
            console.error("ERROR: No variable name provided to configureLineChart");
            return;
        }
        if(pairs.length < 1){
            console.error("ERROR: No data provided to configureLineChart");
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
                    name : params.causeVariableName + ' (' + pairs[0].causeunitAbbreviatedName + ')',
                    type: tlGraphType,
                    color: inputColor,
                    data: causeSeries,
                    marker: {enabled: tlEnableMarkers, radius: 3}
                },
                {
                    yAxis: 1,
                    name : params.effectVariableName + ' (' + pairs[0].effectunitAbbreviatedName + ')',
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
    quantimodoService.configureLineChart = function(data, variableObject) {
        if(!variableObject.name){
            if(variableObject.variableName){
                variableObject.name = variableObject.variableName;
            } else {
                console.error("ERROR: No variable name provided to configureLineChart");
                return;
            }
        }
        if(data.length < 1){
            console.error("ERROR: No data provided to configureLineChart");
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
        return {
            useHighStocks: true,
            options : {
                //turboThreshold: 0, // DOESN'T SEEM TO WORK -Disables 1000 data point limitation http://api.highcharts.com/highcharts/plotOptions.series.turboThreshold
                tooltip: {
                    shared: true,
                    formatter: function(){
                        var value = this;
                        var string = '';
                        string += '<h3><b>' + moment(value.x).format("MMM Do YYYY") + '<b></h3><br/>';
                        angular.forEach(value.points,function(point){
                            //string += '<span>' + point.series.name + ':</span> ';
                            string += '<span>' + point.point.y + variableObject.userVariableDefaultUnitAbbreviatedName + '</span>';
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
                title: {text: variableObject.name + ' Over Time (' + variableObject.userVariableDefaultUnitAbbreviatedName + ')'},
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
                exporting: {enabled: $rootScope.isWeb}
            },
            series :[{
                name : variableObject.name + ' Over Time',
                data : data,
                marker: {
                    enabled: true,
                    radius: 2
                },
                tooltip: {valueDecimals: 2},
                lineWidth: 0,
                states: {
                    hover: {lineWidthPlus: 0}
                }
            }]
        };
    };

    // VARIABLE SERVICE
    // DOES NOT WORK PROPERLY
    quantimodoService.searchUserVariablesDeferredFancy = function(variableSearchQuery, params){
        if($rootScope.lastsearchUserVariablesDeferredPromise){
            var message = 'Got new search request before last one completed';
            console.debug(message);
            $rootScope.lastsearchUserVariablesDeferredPromise.reject();
            $rootScope.lastsearchUserVariablesDeferredPromise = null;
        }
        $rootScope.lastsearchUserVariablesDeferredPromise = $q.defer();
        if(!variableSearchQuery){variableSearchQuery = '*';}
        quantimodoService.searchUserVariablesFromApi(variableSearchQuery, params, function(variables){
            if($rootScope.lastsearchUserVariablesDeferredPromise){
                $rootScope.lastsearchUserVariablesDeferredPromise.resolve(variables);
                $rootScope.lastsearchUserVariablesDeferredPromise = null;
            } else {
                console.warn('Not resolving variables because no $rootScope.lastsearchUserVariablesDeferredPromise: ' +
                    JSON.stringify(variables));
            }
        }, function(error){
            console.error(JSON.stringify(error));
            $rootScope.lastsearchUserVariablesDeferredPromise.reject(error);
            $rootScope.lastsearchUserVariablesDeferredPromise = null;
        });
        return $rootScope.lastsearchUserVariablesDeferredPromise.promise;
    };
    // get user variables (without public)
    quantimodoService.searchUserVariablesDeferred = function(variableSearchQuery, params){
        var deferred = $q.defer();
        if(!variableSearchQuery){ variableSearchQuery = '*'; }
        quantimodoService.searchUserVariablesFromApi(variableSearchQuery, params, function(variables){
            deferred.resolve(variables);
        }, function(error){
            console.error(JSON.stringify(error));
            deferred.reject(error);
        });
        return deferred.promise;
    };
    function doWeHaveEnoughVariables(variables){
        return variables && variables.length > 1;  //Do API search if only 1 local result because I can't get "Remeron" because I have "Remeron Powder" locally
    }
    function doWeHaveExactMatch(variables, variableSearchQuery){
        return variables && variables.length && variables[0].name.toLowerCase() === variableSearchQuery.toLowerCase(); // No need for API request if we have exact match
    }
    function shouldWeMakeVariablesSearchAPIRequest(variables, variableSearchQuery){
        var haveEnough = doWeHaveEnoughVariables(variables);
        var exactMatch = doWeHaveExactMatch(variables, variableSearchQuery);
        return !haveEnough && !exactMatch;
    }
    // get user variables (without public)
    quantimodoService.searchVariablesIncludingLocalDeferred = function(variableSearchQuery, params){
        var deferred = $q.defer();
        var variables = quantimodoService.searchLocalStorage('userVariables', 'name', variableSearchQuery, params);
        if(params.includePublic){
            if(!variables){variables = [];}
            var commonVariables = quantimodoService.searchLocalStorage('commonVariables', 'name', variableSearchQuery, params);
            variables = variables.concat(commonVariables);
        }
        if(!shouldWeMakeVariablesSearchAPIRequest(variables, variableSearchQuery)) {
            deferred.resolve(variables);
            return deferred.promise;
        }
        if(!variableSearchQuery){ variableSearchQuery = '*'; }
        quantimodoService.searchUserVariablesFromApi(variableSearchQuery, params, function(variables){
            deferred.resolve(variables);
        }, function(error){
            console.error(JSON.stringify(error));
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.refreshUserVariableDeferred = function (variableName) {
        var deferred = $q.defer();
        quantimodoService.getVariablesByNameFromApi(variableName, {}, function(variable){
            deferred.resolve(variable);
        }, function(error){ deferred.reject(error); });
        return deferred.promise;
    };
    quantimodoService.getVariablesFromLocalStorage = function(requestParams){
        var variables;
        if(!variables){ variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables')); }
        if(requestParams.includePublic){
            if(!variables){variables = [];}
            var commonVariables = JSON.parse(quantimodoService.getLocalStorageItemAsString('commonVariables'));
            variables = variables.concat(commonVariables);
        }
        if(requestParams && requestParams.sort){variables = quantimodoService.sortByProperty(variables, requestParams.sort);}
        return variables;
    };
    quantimodoService.getUserVariableByNameDeferred = function(name, params, refresh){
        var deferred = $q.defer();
        quantimodoService.getLocalStorageItemAsStringWithCallback('userVariables', function (userVariables) {
            if(!refresh && userVariables){
                userVariables = JSON.parse(userVariables);
                for(var i = 0; i < userVariables.length; i++){
                    if(userVariables[i].name === name){
                        deferred.resolve(userVariables[i]);
                        return;
                    }
                }
            }
            quantimodoService.getVariablesByNameFromApi(name, params, function(variable){
                quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', variable);
                deferred.resolve(variable);
            }, function(error){ deferred.reject(error); });
        });
        return deferred.promise;
    };
    quantimodoService.getPublicVariablesByNameDeferred = function(name) {
        var deferred = $q.defer();
        quantimodoService.getPublicVariablesByNameFromApi(name, function(variable){
            deferred.resolve(variable);
        }, function(error){ deferred.reject(error); });
        return deferred.promise;
    };
    quantimodoService.addWikipediaExtractAndThumbnail = function(variableObject){
        quantimodoService.getWikipediaArticle(variableObject.name).then(function (page) {
            if(page){
                variableObject.wikipediaExtract = page.extract;
                if(page.thumbnail){ variableObject.imageUrl = page.thumbnail; }
            }
        });
    };
    // post changes to user variable settings
    quantimodoService.postUserVariableDeferred = function(body) {
        var deferred = $q.defer();
        quantimodoService.postUserVariableToApi(body, function(response) {
            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.userVariable);
            quantimodoService.deleteItemFromLocalStorage('lastStudy');
            $rootScope.variableObject = response.userVariable;
            //quantimodoService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
            console.debug("quantimodoService.postUserVariableDeferred: success: " + JSON.stringify(response.userVariable));
            deferred.resolve(response.userVariable);
        }, function(error){ deferred.reject(error); });
        return deferred.promise;
    };
    quantimodoService.resetUserVariableDeferred = function(variableId) {
        var deferred = $q.defer();
        var body = {variableId: variableId};
        quantimodoService.resetUserVariable(body, function(response) {
            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariable);
            deferred.resolve(response.data.userVariable);
        }, function(error){  deferred.reject(error); });
        return deferred.promise;
    };
    quantimodoService.getVariableByIdDeferred = function(variableId){
        var deferred = $q.defer();
        // refresh always
        quantimodoService.getVariableByIdFromApi(variableId, function(variable){
            deferred.resolve(variable);
        }, function(error){deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.deleteAllMeasurementsForVariableDeferred = function(variableId) {
        var deferred = $q.defer();
        quantimodoService.deleteUserVariableMeasurements(variableId, function() {
            // Delete user variable from local storage
            quantimodoService.deleteElementOfLocalStorageItemById('userVariables', variableId);
            deferred.resolve();
        }, function(error) {
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); }
            console.error('Error deleting all measurements for variable: ', error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    quantimodoService.getUserVariablesDeferred = function(params){
        var deferred = $q.defer();
        var userVariables = quantimodoService.getElementsFromLocalStorageItemWithRequestParams('userVariables', params);
        if(userVariables && userVariables.length > 0 && userVariables[0].chartsLinkFacebook){
            deferred.resolve(userVariables);
            return deferred.promise;
        }
        if(quantimodoService.getLocalStorageItemAsString('userVariables') === "[]"){
            deferred.resolve([]);
            return deferred.promise;
        }
        userVariables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables'));
        if(userVariables && userVariables.length && typeof userVariables[0].chartsLinkFacebsharook !== "undefined"){
            console.debug("We already have userVariables that didn't match filters so no need to refresh them");
            deferred.resolve([]);
            return deferred.promise;
        }
        quantimodoService.refreshUserVariables().then(function () {
            userVariables = quantimodoService.getElementsFromLocalStorageItemWithRequestParams(
                'userVariables', params);
            deferred.resolve(userVariables);
        }, function (error) {deferred.reject(error);});
        return deferred.promise;
    };
    quantimodoService.refreshUserVariables = function(){
        var deferred = $q.defer();
        if($rootScope.syncingUserVariables){
            console.warn('Already called refreshUserVariables within last 10 seconds!  Rejecting promise!');
            deferred.reject('Already called refreshUserVariables within last 10 seconds!  Rejecting promise!');
            return deferred.promise;
        }
        if(!$rootScope.syncingUserVariables){
            $rootScope.syncingUserVariables = true;
            console.debug('Setting refreshUserVariables timeout');
            $timeout(function() {
                // Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
                $rootScope.syncingUserVariables = false;
            }, 10000);
            var parameters = {limit: 200, sort: "-latestMeasurementTime"};
            quantimodoService.getUserVariablesFromApi(parameters, function(userVariables){
                quantimodoService.setLocalStorageItem('userVariables', JSON.stringify(userVariables))
                    .then(function () {
                        $rootScope.$broadcast('populateUserVariables');
                        $rootScope.syncingUserVariables = false;
                    });
                deferred.resolve(userVariables);
            }, function(error){
                $rootScope.syncingUserVariables = false;
                deferred.reject(error);
            });
            return deferred.promise;
        }
    };
    quantimodoService.getCommonVariablesDeferred = function(params){
        var deferred = $q.defer();
        var commonVariables = quantimodoService.getElementsFromLocalStorageItemWithRequestParams('commonVariables', params);
        if(commonVariables && commonVariables.length && typeof commonVariables[0].manualTracking !== "undefined"){
            deferred.resolve(commonVariables);
            return deferred.promise;
        }
        commonVariables = JSON.parse(quantimodoService.getLocalStorageItemAsString('commonVariables'));
        if(commonVariables && commonVariables.length && typeof commonVariables[0].manualTracking !== "undefined"){
            console.debug("We already have commonVariables that didn't match filters so no need to refresh them");
            deferred.resolve([]);
            return deferred.promise;
        }
        quantimodoService.refreshCommonVariables().then(function () {
            commonVariables = quantimodoService.getElementsFromLocalStorageItemWithRequestParams('commonVariables', params);
            deferred.resolve(commonVariables);
        }, function (error) {deferred.reject(error);});
        return deferred.promise;
    };

    quantimodoService.refreshCommonVariables = function(){
        var deferred = $q.defer();
        if($rootScope.syncingCommonVariables){
            console.warn('Already called refreshCommonVariables within last 10 seconds!  Rejecting promise!');
            deferred.reject('Already called refreshCommonVariables within last 10 seconds!  Rejecting promise!');
            return deferred.promise;
        }
        if(!$rootScope.syncingCommonVariables){
            $rootScope.syncingCommonVariables = true;
            console.debug('Setting refreshCommonVariables timeout');
            $timeout(function() {
                // Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
                $rootScope.syncingCommonVariables = false;
            }, 10000);
            var successHandler = function(commonVariables) {
                quantimodoService.setLocalStorageItem('commonVariables', JSON.stringify(commonVariables)).then(function () {
                    $rootScope.$broadcast('populateCommonVariables');
                });
                $rootScope.syncingCommonVariables = false;
                deferred.resolve(commonVariables);
            };
            var errorHandler = function(error) {
                $rootScope.syncingCommonVariables = false;
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify("ERROR: " + JSON.stringify(error), JSON.stringify(error), {}, "error"); } console.error(error);
                deferred.reject(error);
            };
            var parameters = {limit: 200, sort: "-numberOfUserVariables", numberOfUserVariables: "(gt)3"};
            quantimodoService.get('api/v1/public/variables', ['category', 'includePublic', 'numberOfUserVariables'], parameters, successHandler, errorHandler);
            return deferred.promise;
        }
    };

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
            variableDescription: trackingReminder.variableDescription,
            reminderEndTime: trackingReminder.reminderEndTime
        };
    }
    quantimodoService.shouldWeUseIonicLocalNotifications = function(){
        $ionicPlatform.ready(function () {
            if (!config.appSettings.cordovaLocalNotificationsEnabled || typeof cordova === "undefined" ||
                typeof cordova.plugins.notification === "undefined") {
                if (typeof cordova !== "undefined") {
                    if(typeof cordova.plugins !== "undefined" && typeof cordova.plugins.notification !== "undefined") {
                        cordova.plugins.notification.local.cancelAll(function () {
                            console.debug('cancelAllNotifications: notifications have been cancelled');
                            cordova.plugins.notification.local.getAll(function (notifications) {
                                console.debug("cancelAllNotifications: All notifications after cancelling", notifications);
                            });
                        });
                    }
                }
                console.debug('cordova.plugins.notification is not defined');
                return false;
            }
            return true;
        });
    };
    quantimodoService.setOnUpdateActionForLocalNotifications = function(){
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        cordova.plugins.notification.local.on("update", function(notification) {
            console.debug("onUpdate: Just updated this notification: ", notification);
            cordova.plugins.notification.local.getAll(function (notifications) {
                console.debug("onUpdate: All notifications after update: ", notifications);
            });
        });
        deferred.resolve();
        return deferred.promise;
    };
    quantimodoService.setOnClickActionForLocalNotifications = function(quantimodoService) {
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        var params = {};
        var locationTrackingNotificationId = 666;
        cordova.plugins.notification.local.on("click", function (notification) {
            console.debug("onClick: notification: ", notification);
            var notificationData = null;
            if(notification && notification.data){
                notificationData = JSON.parse(notification.data);
                console.debug("onClick: notification.data : ", notificationData);
            } else {console.debug("onClick: No notification.data provided");}
            if(notification.id !== locationTrackingNotificationId){
                /** @namespace cordova.plugins.notification */
                cordova.plugins.notification.local.clearAll(function () {console.debug("onClick: clearAll active notifications");}, this);
            }
            if(notificationData && notificationData.trackingReminderNotificationId){
                console.debug("onClick: Notification was a reminder notification not reminder.  " +
                    "Skipping notification with id: " + notificationData.trackingReminderNotificationId);
                params = {trackingReminderNotificationId: notificationData.trackingReminderNotificationId};
            } else if (notificationData && notificationData.id) {
                console.debug("onClick: Notification was a reminder not a reminder notification.  " +
                    "Skipping next notification for reminder id: " + notificationData.id);
                params = {trackingReminderId: notificationData.id};
            } else {
                console.debug("onClick: No notification data provided. Going to remindersInbox page.");
                $state.go('app.remindersInbox');
            }
            if(params.trackingReminderId || params.trackingReminderNotificationId ){
                quantimodoService.skipTrackingReminderNotification(params, function(response){
                    console.debug(response);
                }, function(error){
                    console.error(JSON.stringify(error));
                    if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
                });
                console.debug("onClick: Notification data provided. Going to addMeasurement page. Data: ", notificationData);
                //quantimodoService.decrementNotificationBadges();
                $state.go('app.measurementAdd', {reminderNotification: notificationData, fromState: 'app.remindersInbox'});
            } else {
                console.debug("onClick: No params.trackingReminderId || params.trackingReminderNotificationId. " +
                    "Should have already gone to remindersInbox page.");
            }
        });
        deferred.resolve();
        return deferred.promise;
    };
    quantimodoService.updateBadgesAndTextOnAllNotifications = function () {
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
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
                console.debug("onTrigger.updateBadgesAndTextOnAllNotifications: " + "All notifications ", notifications);
                for (var i = 0; i < notifications.length; i++) {
                    if(notifications[i].badge === $rootScope.numberOfPendingNotifications){
                        console.warn("updateBadgesAndTextOnAllNotifications: Not updating notification because $rootScope.numberOfPendingNotifications" +
                            " === notifications[i].badge", notifications[i]);
                        continue;
                    }
                    console.debug('onTrigger.updateBadgesAndTextOnAllNotifications' + ':Updating notification', notifications[i]);
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
    quantimodoService.setOnTriggerActionForLocalNotifications = function() {
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        function getNotificationsFromApiAndClearOrUpdateLocalNotifications() {
            var currentDateTimeInUtcStringPlus5Min = quantimodoService.getCurrentDateTimeInUtcStringPlusMin(5);
            var params = {reminderTime: '(lt)' + currentDateTimeInUtcStringPlus5Min};
            quantimodoService.getTrackingReminderNotificationsFromApi(params, function (response) {
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
                        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {return;}
                        console.debug("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: No notifications from API so clearAll active notifications");
                        cordova.plugins.notification.local.clearAll(function () {
                            console.debug("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: cleared all active notifications");
                        }, this);
                    } else {$rootScope.updateOrRecreateNotifications();}
                }
            }, function(error) {
                if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            });
        }
        function clearOtherLocalNotifications(currentNotification) {
            console.debug("onTrigger.clearOtherLocalNotifications: Clearing notifications except the one " +
                "that just triggered...");
            $ionicPlatform.ready(function () {
                cordova.plugins.notification.local.getTriggeredIds(function (triggeredNotifications) {
                    console.debug("onTrigger.clearOtherLocalNotifications: found triggered notifications " +
                        "before removing current one: " + JSON.stringify(triggeredNotifications));
                    if (triggeredNotifications.length < 1) {
                        console.warn("onTrigger.clearOtherLocalNotifications: Triggered notifications is " +
                            "empty so maybe it's not working.");
                    } else {
                        triggeredNotifications.splice(triggeredNotifications.indexOf(currentNotification.id), 1);
                        console.debug("onTrigger.clearOtherLocalNotifications: found triggered notifications " +
                            "after removing current one: " + JSON.stringify(triggeredNotifications));
                        cordova.plugins.notification.local.clear(triggeredNotifications);
                    }
                });
            });
        }
        function clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification) {
            console.debug("onTrigger.clearNotificationIfOutsideAllowedTimes: Checking notification time limits",
                currentNotification);
            if (notificationData.reminderFrequency < 86400) {
                var currentTimeInLocalString = quantimodoService.getCurrentTimeInLocalString();
                var reminderStartTimeInLocalString = quantimodoService.getLocalTimeStringFromUtcString(notificationData.reminderStartTime);
                var reminderEndTimeInLocalString = quantimodoService.getLocalTimeStringFromUtcString(notificationData.reminderEndTime);
                if (currentTimeInLocalString < reminderStartTimeInLocalString) {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.clear(currentNotification.id, function (currentNotification) {
                            console.debug("onTrigger: Cleared notification because current time " +
                                currentTimeInLocalString + " is before reminder start time" + reminderStartTimeInLocalString, currentNotification);
                        });
                    });
                }
                if (currentTimeInLocalString > reminderEndTimeInLocalString) {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.clear(currentNotification.id, function (currentNotification) {
                            console.debug("onTrigger: Cleared notification because current time " +
                                currentTimeInLocalString + " is before reminder start time" + reminderStartTimeInLocalString, currentNotification);
                        });
                    });
                }
            }
        }
        cordova.plugins.notification.local.on("trigger", function (currentNotification) {

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
                quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();
                console.debug("onTrigger: just triggered this notification: ",  currentNotification);
                var notificationData = null;
                if(currentNotification && currentNotification.data){
                    notificationData = JSON.parse(currentNotification.data);
                    console.debug("onTrigger: notification.data : ", notificationData);
                    clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification);
                } else {console.debug("onTrigger: No notification.data provided");}
                if(!notificationData){
                    console.debug("onTrigger: This is a generic notification that sends to inbox, so we'll check the API for pending notifications.");
                    getNotificationsFromApiAndClearOrUpdateLocalNotifications();
                }
                clearOtherLocalNotifications(currentNotification);
            } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                console.error('onTrigger error');
                if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
            }
        });
        deferred.resolve();
        return deferred.promise;
    };
    quantimodoService.decrementNotificationBadges = function(){
        if($rootScope.numberOfPendingNotifications > 0){
            if (window.chrome && window.chrome.browserAction) {
                //noinspection JSUnresolvedFunction
                chrome.browserAction.setBadgeText({text: "?"});
                //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
            }
            this.updateOrRecreateNotifications();
        }
    };
    quantimodoService.setNotificationBadge = function(numberOfPendingNotifications){
        console.debug("setNotificationBadge: numberOfPendingNotifications is " + numberOfPendingNotifications);
        $rootScope.numberOfPendingNotifications = numberOfPendingNotifications;
        if (window.chrome && window.chrome.browserAction) {
            chrome.browserAction.setBadgeText({text: "?"});
            //chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
        }
        this.updateOrRecreateNotifications();
    };
    quantimodoService.updateOrRecreateNotifications = function() {
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isAndroid){
            console.debug("updateOrRecreateNotifications: Updating notifications for Android because Samsung limits number of notifications " +
                "that can be scheduled in a day.");
            this.updateBadgesAndTextOnAllNotifications();
            deferred.resolve();
        }
        if($rootScope.isIOS){
            console.warn('updateOrRecreateNotifications: Updating local notifications on iOS might ' +
                'make duplicates and we cannot recreate here because we will lose the previously set interval');
            this.updateBadgesAndTextOnAllNotifications();
            deferred.resolve();
            //console.debug("updateOrRecreateNotifications: iOS makes duplicates when updating for some reason so we just cancel all and schedule again");
            //this.scheduleGenericNotification(notificationSettings);
        }
        return deferred.promise;
    };
    quantimodoService.scheduleSingleMostFrequentNotification = function(trackingRemindersFromApi) {
        if($rootScope.user.combineNotifications === false){
            console.warn("scheduleSingleMostFrequentNotification: $rootScope.user.combineNotifications === false" +
                " so we shouldn't be calling this function");
            return;
        }
        var shortestInterval = 86400;
        var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
        if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
            for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                if(trackingRemindersFromApi[i].reminderFrequency < shortestInterval){
                    shortestInterval = trackingRemindersFromApi[i].reminderFrequency;
                    at.setUTCSeconds(trackingRemindersFromApi[i].nextReminderTimeEpochSeconds);
                }
            }
            var notificationSettings = {every: shortestInterval/60, at: at};
            if($rootScope.previousSingleNotificationSettings && notificationSettings === $rootScope.previousSingleNotificationSettings){
                console.debug("scheduleSingleMostFrequentNotification: Notification settings haven't changed so" +
                    " no need to scheduleGenericNotification", notificationSettings);
                return;
            }
            console.debug("scheduleSingleMostFrequentNotification: Going to schedule generic notification", notificationSettings);
            $rootScope.previousSingleNotificationSettings = notificationSettings;
            this.scheduleGenericNotification(notificationSettings);
        }
    };
    quantimodoService.scheduleAllNotificationsByTrackingReminders = function(trackingRemindersFromApi) {
        if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
            for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                if($rootScope.user.combineNotifications === false){
                    try {this.scheduleNotificationByReminder(trackingRemindersFromApi[i]);
                    } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                        console.error('scheduleAllNotificationsByTrackingReminders error');
                    }
                }
            }
            this.cancelNotificationsForDeletedReminders(trackingRemindersFromApi);
        }
    };
    quantimodoService.cancelNotificationsForDeletedReminders = function(trackingRemindersFromApi) {
        var deferred = $q.defer();
        function cancelChromeExtensionNotificationsForDeletedReminders(trackingRemindersFromApi) {
            /** @namespace chrome.alarms */
            chrome.alarms.getAll(function(scheduledTrackingReminders) {
                for (var i = 0; i < scheduledTrackingReminders.length; i++) {
                    var existingReminderFoundInApiResponse = false;
                    for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                        var alarmName = createChromeAlarmNameFromTrackingReminder(trackingRemindersFromApi[j]);
                        if (JSON.stringify(alarmName) === scheduledTrackingReminders[i].name) {
                            console.debug('Server has a reminder matching alarm ' + JSON.stringify(scheduledTrackingReminders[i]));
                            existingReminderFoundInApiResponse = true;
                        }
                    }
                    if(!existingReminderFoundInApiResponse) {
                        console.debug('No api reminder found matching so cancelling this alarm ', JSON.stringify(scheduledTrackingReminders[i]));
                        chrome.alarms.clear(scheduledTrackingReminders[i].name);
                    }
                }
            });
        }
        function cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi) {
            if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {return;}
            cordova.plugins.notification.local.getAll(function (scheduledNotifications) {
                console.debug("cancelIonicNotificationsForDeletedReminders: notification.local.getAll " +
                    "scheduledNotifications: ",
                    scheduledNotifications);
                for (var i = 0; i < scheduledNotifications.length; i++) {
                    var existingReminderFoundInApiResponse = false;
                    for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                        /** @namespace scheduledNotifications[i].id */
                        if (trackingRemindersFromApi[j].id === scheduledNotifications[i].id) {
                            console.debug('Server returned a reminder matching' + trackingRemindersFromApi[j]);
                            existingReminderFoundInApiResponse = true;
                        }
                    }
                    if(!existingReminderFoundInApiResponse) {
                        console.debug('Matching API reminder not found. Cancelling scheduled notification ' + JSON.stringify(scheduledNotifications[i]));
                        cordova.plugins.notification.local.cancel(scheduledNotifications[i].id, function (cancelledNotification) {
                            console.debug("Canceled notification ", cancelledNotification);
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
                console.debug('cancelIonicNotificationsForDeletedReminders');
                cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi);
            }
            deferred.resolve();
        });
        return deferred.promise;
    };
    quantimodoService.scheduleNotificationByReminder = function(trackingReminder){
        if($rootScope.user.combineNotifications === true){
            console.warn("Not going to scheduleNotificationByReminder because $rootScope.user.combineNotifications === true");
            return;
        }
        if(!$rootScope.user.earliestReminderTime){
            console.error("Cannot schedule notifications because $rootScope.user.earliestReminderTime not set",
                $rootScope.user);
            return;
        }
        if(!$rootScope.user.latestReminderTime){
            console.error("Cannot schedule notifications because $rootScope.user.latestReminderTime not set",
                $rootScope.user);
            return;
        }
        function createOrUpdateIonicNotificationForTrackingReminder(notificationSettings) {
            var deferred = $q.defer();
            if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
                deferred.resolve();
                return deferred.promise;
            }
            cordova.plugins.notification.local.isPresent(notificationSettings.id, function (present) {
                if (!present) {
                    console.debug("createOrUpdateIonicNotificationForTrackingReminder: Creating notification " +
                        "because not already set for " + JSON.stringify(notificationSettings));
                    cordova.plugins.notification.local.schedule(notificationSettings,
                        function () {
                            console.debug('createOrUpdateIonicNotificationForTrackingReminder: notification ' + 'scheduled', notificationSettings);
                        });
                }
                if (present) {
                    console.debug('createOrUpdateIonicNotificationForTrackingReminder: Updating notification', notificationSettings);
                    cordova.plugins.notification.local.update(notificationSettings,
                        function () {
                            console.debug('createOrUpdateIonicNotificationForTrackingReminder: ' + 'notification updated', notificationSettings);
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
                ionIcon: 'ic_stat_icon_bw',
                id: trackingReminder.id
            };
            if($rootScope.numberOfPendingNotifications){
                notificationSettings.badge = 1; // Less stressful
                //notificationSettings.badge = $rootScope.numberOfPendingNotifications;
            }
            var dayInMinutes = 24 * 60;
            notificationSettings.every = dayInMinutes;
            console.debug("Trying to create Android notification for " + JSON.stringify(notificationSettings));
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
                    console.debug("Scheduling notification because it is within time limits: " +
                        $rootScope.user.earliestReminderTime + " to " + $rootScope.user.latestReminderTime,
                        notificationSettings);
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                } else {
                    console.debug("NOT scheduling notification because it is outside time limits: " +
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
                console.debug("iOS requires second, minute, hour, day, week, month, year so converting " +
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
                    console.debug("Not scheduling notification because it's outside time limits", notificationSettings);
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
                if (hasAlarm) {console.debug('Already have an alarm for ' + alarmName);}
                if (!hasAlarm) {
                    chrome.alarms.create(alarmName, alarmInfo);
                    console.debug('Created alarm for alarmName ' + alarmName, alarmInfo);
                }
            });
        }
        if(trackingReminder.reminderFrequency > 0){
            $ionicPlatform.ready(function () {
                //console.debug('Ionic is ready to schedule notifications');
                if (typeof cordova !== "undefined") {
                    cordova.plugins.notification.local.getAll(function (notifications) {
                        console.debug("scheduleNotificationByReminder: All notifications before scheduling", notifications);
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
    quantimodoService.scheduleGenericNotification = function(notificationSettings){
        var deferred = $q.defer();
        if(!notificationSettings.every){
            console.error("scheduleGenericNotification: Called scheduleGenericNotification without providing " +
                "notificationSettings.every " +
                notificationSettings.every + ". Not going to scheduleGenericNotification.");
            deferred.resolve();
            return deferred.promise;
        }
        if(!notificationSettings.at){
            var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
            var epochSecondsPlus15Minutes = new Date() / 1000 + 15 * 60;
            at.setUTCSeconds(epochSecondsPlus15Minutes);
            notificationSettings.at = at;
        }
        if(!notificationSettings.id){notificationSettings.id = quantimodoService.getPrimaryOutcomeVariable().id;}
        notificationSettings.title = "Time to track!";
        notificationSettings.text = "Open reminder inbox";
        notificationSettings.sound = "file://sound/silent.ogg";
        notificationSettings.badge = 0;
        if($rootScope.numberOfPendingNotifications > 0) {
            notificationSettings.text = $rootScope.numberOfPendingNotifications + " tracking reminder notifications";
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
            console.debug('scheduleGenericChromeExtensionNotification: Reminder notification interval is ' + intervalInMinutes + ' minutes');
            var alarmInfo = {periodInMinutes: intervalInMinutes};
            console.debug("scheduleGenericChromeExtensionNotification: clear genericTrackingReminderNotificationAlarm");
            chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
            console.debug("scheduleGenericChromeExtensionNotification: create genericTrackingReminderNotificationAlarm", alarmInfo);
            chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
            console.debug("Alarm set, every " + intervalInMinutes + " minutes");
        }
        $ionicPlatform.ready(function () {
            if (typeof cordova !== "undefined") {
                if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
                    deferred.resolve();
                    return deferred.promise;
                }
                cordova.plugins.notification.local.getAll(function (notifications) {
                    console.debug("scheduleGenericNotification: All notifications before scheduling", notifications);
                    if(notifications[0] && notifications[0].length === 1 &&
                        notifications[0].every === notificationSettings.every) {
                        console.warn("Not scheduling generic notification because we already have one with " +
                            "the same frequency.");
                        return;
                    }
                    cordova.plugins.notification.local.cancelAll(function () {
                        console.debug('cancelAllNotifications: notifications have been cancelled');
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            console.debug("cancelAllNotifications: All notifications after cancelling", notifications);
                            cordova.plugins.notification.local.schedule(notificationSettings, function () {
                                console.debug('scheduleGenericNotification: notification scheduled' + JSON.stringify(notificationSettings));
                            });
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
    quantimodoService.cancelIonicNotificationById = function(notificationId){
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        $ionicPlatform.ready(function () {
            if (typeof cordova !== "undefined") {
                console.debug('cancelIonicNotificationById ' + notificationId);
                cordova.plugins.notification.local.cancel(notificationId, function (cancelledNotification) {
                    console.debug("Canceled notification ", cancelledNotification);
                });
            }
            deferred.resolve();
        });
        return deferred.promise;
    };
    quantimodoService.scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes = function(trackingReminders){
        var deferred = $q.defer();
        if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
            deferred.resolve();
            return deferred.promise;
        }
        if(!$rootScope.isMobile && !$rootScope.isChromeExtension){
            console.debug('Not scheduling notifications because we are not mobile or Chrome extension');
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isAndroid){
            this.cancelAllNotifications();
            console.debug('Not scheduling local notifications because Android uses push notifications');
            deferred.resolve();
            return deferred.promise;
        }
        if(!trackingReminders || !trackingReminders[0]){
            console.debug('Not scheduling notifications because we do not have any reminders');
            deferred.resolve();
            return deferred.promise;
        }
        /** @namespace trackingReminders[0].localDailyReminderNotificationTimesForAllReminders */
        var localDailyReminderNotificationTimesFromApi = trackingReminders[0].localDailyReminderNotificationTimesForAllReminders;
        console.debug('localDailyReminderNotificationTimesFromApi: ' + JSON.stringify(localDailyReminderNotificationTimesFromApi));
        if(localDailyReminderNotificationTimesFromApi.length < 1){
            console.warn('Cannot schedule notifications because ' + 'trackingReminders[0].localDailyReminderNotificationTimes is empty.');
            deferred.resolve();
            return deferred.promise;
        }
        if($rootScope.isMobile){
            if(!quantimodoService.shouldWeUseIonicLocalNotifications()) {
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
                    console.debug("scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: All " +
                        "existing notifications before scheduling", existingLocalNotifications);
                    for (var i = 0; i < existingLocalNotifications.length; i++) {
                        var existingReminderNotificationTimeFoundInApiResponse = false;
                        for (var j = 0; j < localDailyReminderNotificationTimesFromApi.length; j++) {
                            if (parseInt(localDailyReminderNotificationTimesFromApi[j].replace(":", "")) ===
                                existingLocalNotifications[i].id &&
                                existingLocalNotifications[i].text === notificationSettings.text
                            ) {
                                console.debug('Server has a reminder notification matching local notification ' +
                                    JSON.stringify(existingLocalNotifications[i]));
                                existingReminderNotificationTimeFoundInApiResponse = true;
                            }
                        }
                        if(!existingReminderNotificationTimeFoundInApiResponse) {
                            console.debug('No matching notification time found so cancelling this local notification ',
                                JSON.stringify(existingLocalNotifications[i]));
                            cordova.plugins.notification.local.cancel(existingLocalNotifications[i].id);
                        }
                    }
                    for (var k = 0; k < localDailyReminderNotificationTimesFromApi.length; k++) {
                        console.debug('localDailyReminderNotificationTimesFromApi[k] is ', localDailyReminderNotificationTimesFromApi[k]);
                        var existingLocalNotificationScheduled = false;
                        for (var l = 0; l < existingLocalNotifications.length; l++) {
                            if(!localDailyReminderNotificationTimesFromApi[k]){
                                console.error('localDailyReminderNotificationTimesFromApi[' + k + '] is not defined! ' +
                                    'localDailyReminderNotificationTimesFromApi: ', localDailyReminderNotificationTimesFromApi);
                            }
                            if (parseInt(localDailyReminderNotificationTimesFromApi[k].replace(":", "")) ===
                                existingLocalNotifications[l].id &&
                                existingLocalNotifications[l].text === notificationSettings.text) {
                                console.debug('Server has a reminder notification matching local notification ' + JSON.stringify(existingLocalNotifications[l]));
                                existingLocalNotificationScheduled = true;
                            }
                        }
                        if(!existingLocalNotificationScheduled) {
                            if(!localDailyReminderNotificationTimesFromApi[k]){
                                console.error("Did not get localDailyReminderNotificationTimesFromApi", trackingReminders);
                            }
                            var at = new Date();
                            var splitUpLocalDailyReminderNotificationTimesFromApi = localDailyReminderNotificationTimesFromApi[k].split(":");
                            at.setHours(splitUpLocalDailyReminderNotificationTimesFromApi[0]);
                            at.setMinutes(splitUpLocalDailyReminderNotificationTimesFromApi[1]);
                            var now = new Date();
                            if(at < now){at = new Date(at.getTime() + 60 * 60 * 24 * 1000);}
                            console.debug('No existing local notification so scheduling ', JSON.stringify(localDailyReminderNotificationTimesFromApi[k]));
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
                                quantimodoService.reportError(errorMessage);
                                return;
                            }
                            if(!isNaN(notificationSettings.at) &&
                                parseInt(Number(notificationSettings.at)) === notificationSettings.at &&
                                !isNaN(parseInt(notificationSettings.at, 10))){
                                var intErrorMessage = 'Skipping notification creation because notificationSettings.at is not an instance of Date: ' + JSON.stringify(notificationSettings);
                                quantimodoService.reportError(intErrorMessage);
                                return;
                            }
                            try{
                                console.debug('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: ' +
                                    'About to schedule this notification: ',
                                    JSON.stringify(notificationSettings));
                                cordova.plugins.notification.local.schedule(notificationSettings, function (notification) {
                                    console.debug('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes:' +
                                        ' notification scheduled: ' + JSON.stringify(notification));
                                });
                            } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                                console.error('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes' +
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
                console.debug('Existing Chrome alarms before scheduling: ', existingLocalAlarms);
                for (var i = 0; i < existingLocalAlarms.length; i++) {
                    var existingAlarmTimeFoundInApiResponse = false;
                    for (var j = 0; j < localDailyReminderNotificationTimesFromApi.length; j++) {
                        if (existingLocalAlarms[i].name === localDailyReminderNotificationTimesFromApi[j]) {
                            console.debug('Server has a reminder notification time matching time ' + existingLocalAlarms[i].name);
                            existingAlarmTimeFoundInApiResponse = true;
                        }
                    }
                    if(!existingAlarmTimeFoundInApiResponse) {
                        console.debug('No api reminder found matching so cancelling this alarm ', JSON.stringify(existingLocalAlarms[i]));
                        chrome.alarms.clear(existingLocalAlarms[i].name);
                    }
                }
                for (var k = 0; k < localDailyReminderNotificationTimesFromApi.length; k++) {
                    var existingAlarmScheduled = false;
                    for (var l = 0; l < existingLocalAlarms.length; l++) {
                        if (existingLocalAlarms[l].name === localDailyReminderNotificationTimesFromApi[k]) {
                            console.debug('Server has a reminder notification matching local notification ' +
                                JSON.stringify(existingLocalAlarms[i]));
                            existingAlarmScheduled = true;
                        }
                    }
                    if(!existingAlarmScheduled) {
                        if(!localDailyReminderNotificationTimesFromApi[k]){
                            console.error('localDailyReminderNotificationTimesFromApi[' + k + '] is not defined! ' +
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
                        console.debug('No existing local notification so scheduling ', alarmInfo);
                        chrome.alarms.create(localDailyReminderNotificationTimesFromApi[k], alarmInfo);
                    }
                }
            });
            deferred.resolve();
        }
        return deferred.promise;
    };

    // cancel all existing notifications
    quantimodoService.cancelAllNotifications = function(){
        var deferred = $q.defer();
        if(typeof cordova !== "undefined" && typeof cordova.plugins.notification !== "undefined"){
            $ionicPlatform.ready(function () {
                cordova.plugins.notification.local.cancelAll(function () {
                    console.debug('cancelAllNotifications: notifications have been cancelled');
                    cordova.plugins.notification.local.getAll(function (notifications) {
                        console.debug("cancelAllNotifications: All notifications after cancelling", notifications);
                    });
                    deferred.resolve();
                });
            });
        } else if (typeof chrome !== "undefined" && typeof chrome.alarms !== "undefined"){
            chrome.alarms.clearAll(function (){
                console.debug('Cleared all Chrome alarms!');
                deferred.resolve();
            });
        } else {
            console.debug('cancelAllNotifications: Chrome and cordova are not defined.');
            deferred.resolve();
        }
        return deferred.promise;
    };

    // TIME SERVICE
    quantimodoService.getSecondsSinceMidnightLocalFromLocalString = function (localTimeString) {
        var timeFormat = "HH:mm:ss";
        var hours = parseInt(moment(localTimeString, timeFormat).format("HH"));
        var minutes = parseInt(moment(localTimeString, timeFormat).format("mm"));
        var seconds = parseInt(moment(localTimeString, timeFormat).format("ss"));
        var secondsSinceMidnightLocal = hours * 60 *60 + minutes * 60 + seconds;
        return secondsSinceMidnightLocal;
    };
    quantimodoService.getEpochTimeFromLocalString = function (localTimeString) {
        var timeFormat = "HH:mm:ss";
        var epochTime = moment(localTimeString, timeFormat).unix();
        return epochTime;
    };
    quantimodoService.getEpochTimeFromLocalStringRoundedToHour = function (localTimeString) {
        var timeFormat = "HH";
        var partsOfString = localTimeString.split(':');
        var epochTime = moment(partsOfString[0], timeFormat).unix();
        return epochTime;
    };
    quantimodoService.getLocalTimeStringFromUtcString = function (utcTimeString) {
        var timeFormat = "HH:mm:ss Z";
        var utcTimeStringFull = moment().format(timeFormat);
        if(utcTimeString){utcTimeStringFull = utcTimeString + " +0000";}
        var returnTimeFormat = "HH:mm:ss";
        var localTimeString = moment(utcTimeStringFull, timeFormat).format(returnTimeFormat);
        //console.debug("localTimeString is " + localTimeString);
        return localTimeString;
    };
    quantimodoService.humanFormat = function(hhmmssFormatString){
        var intitialTimeFormat = "HH:mm:ss";
        var humanTimeFormat = "h:mm A";
        return moment(hhmmssFormatString, intitialTimeFormat).format(humanTimeFormat);
    };
    quantimodoService.getUtcTimeStringFromLocalString = function (localTimeString) {
        var returnTimeFormat = "HH:mm:ss";
        var utcTimeString = moment(localTimeString, returnTimeFormat).utc().format(returnTimeFormat);
        console.debug("utcTimeString is " + utcTimeString);
        return utcTimeString;
    };
    quantimodoService.getLocalMidnightInUtcString = function () {
        var localMidnightMoment = moment(0, "HH");
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        var localMidnightInUtcString = localMidnightMoment.utc().format(timeFormat);
        return localMidnightInUtcString;
    };
    quantimodoService.getTomorrowLocalMidnightInUtcString = function () {
        var tomorrowLocalMidnightMoment = moment(0, "HH");
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        tomorrowLocalMidnightMoment.add(1, 'days');
        var tomorrowLocalMidnightInUtcString = tomorrowLocalMidnightMoment.utc().format(timeFormat);
        return tomorrowLocalMidnightInUtcString;
    };
    quantimodoService.getCurrentTimeInLocalString = function () {
        var currentMoment = moment();
        var timeFormat = 'HH:mm:ss';
        var currentTimeInLocalString = currentMoment.format(timeFormat);
        return currentTimeInLocalString;
    };
    quantimodoService.getCurrentDateTimeInUtcString = function () {
        var currentMoment = moment();
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        var currentDateTimeInUtcString = currentMoment.utc().format(timeFormat);
        return currentDateTimeInUtcString;
    };
    quantimodoService.getCurrentDateTimeInUtcStringPlusMin = function (minutes) {
        var currentMoment = moment().add(minutes, 'minutes');
        var timeFormat = 'YYYY-MM-DD HH:mm:ss';
        var currentDateTimeInUtcStringPlus15Min = currentMoment.utc().format(timeFormat);
        return currentDateTimeInUtcStringPlus15Min;
    };
    quantimodoService.getSecondsSinceMidnightLocalRoundedToNearestFifteen = function (defaultStartTimeInSecondsSinceMidnightLocal) {
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
        defaultStartTimeInSecondsSinceMidnightLocal = quantimodoService.getSecondsSinceMidnightLocalFromLocalString("" +
            defaultStartTimeHours + ":" + defaultStartTimeMinutes + ":00");
        return defaultStartTimeInSecondsSinceMidnightLocal;
    };
    quantimodoService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString = function (localString) {
        var secondsSinceMidnightLocal = quantimodoService.getSecondsSinceMidnightLocalFromLocalString(localString);
        return quantimodoService.getSecondsSinceMidnightLocalRoundedToNearestFifteen(secondsSinceMidnightLocal);
    };
    // Local Storage Services
    quantimodoService.deleteItemFromLocalStorage  = function(key){
        var keyIdentifier = config.appSettings.appStorageIdentifier;
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.remove(keyIdentifier+key);
        } else {localStorage.removeItem(keyIdentifier+key);}
    };
    quantimodoService.deleteElementOfLocalStorageItemById = function(localStorageItemName, elementId){
        var deferred = $q.defer();
        var elementsToKeep = [];
        var localStorageItemAsString = quantimodoService.getLocalStorageItemAsString(localStorageItemName);
        var localStorageItemArray = JSON.parse(localStorageItemAsString);
        if(!localStorageItemArray){
            console.warn("Local storage item " + localStorageItemName + " not found");
        } else {
            for(var i = 0; i < localStorageItemArray.length; i++){
                if(localStorageItemArray[i].id !== elementId){elementsToKeep.push(localStorageItemArray[i]);}
            }
            this.setLocalStorageItem(localStorageItemName, JSON.stringify(elementsToKeep));
        }
        deferred.resolve(elementsToKeep);
        return deferred.promise;
    };
    quantimodoService.getElementOfLocalStorageItemById = function(localStorageItemName, elementId){
        var localStorageItemAsString = quantimodoService.getLocalStorageItemAsString(localStorageItemName);
        var localStorageItemArray = JSON.parse(localStorageItemAsString);
        if(!localStorageItemArray){
            console.warn("Local storage item " + localStorageItemName + " not found");
        } else {
            for(var i = 0; i < localStorageItemArray.length; i++){
                if(localStorageItemArray[i].id === elementId){return localStorageItemArray[i];}
            }
        }
    };
    quantimodoService.deleteElementsOfLocalStorageItemByProperty = function(localStorageItemName, propertyName, propertyValue){
        var deferred = $q.defer();
        var elementsToKeep = [];
        var localStorageItemArray = JSON.parse(quantimodoService.getLocalStorageItemAsString(localStorageItemName));
        if(!localStorageItemArray){
            console.error("Local storage item " + localStorageItemName + " not found");
        } else {
            for(var i = 0; i < localStorageItemArray.length; i++){
                if(localStorageItemArray[i][propertyName] !== propertyValue){elementsToKeep.push(localStorageItemArray[i]);}
            }
            quantimodoService.setLocalStorageItem(localStorageItemName, JSON.stringify(elementsToKeep));
        }
        deferred.resolve();
        return deferred.promise;
    };
    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront = function(localStorageItemName, replacementElementArray){
        var deferred = $q.defer();
        if(replacementElementArray.constructor !== Array){ replacementElementArray = [replacementElementArray]; }
        // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
        var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
        var localStorageItemArray = JSON.parse(quantimodoService.getLocalStorageItemAsString(localStorageItemName));
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
        quantimodoService.setLocalStorageItem(localStorageItemName, JSON.stringify(elementsToKeep));
        deferred.resolve();
        return deferred.promise;
    };
    quantimodoService.setLocalStorageItem = function(key, value){
        var deferred = $q.defer();
        var keyIdentifier = config.appSettings.appStorageIdentifier;
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            var obj = {};
            obj[keyIdentifier+key] = value;
            chrome.storage.local.set(obj);
            deferred.resolve();
        } else {
            try {
                localStorage.setItem(keyIdentifier+key, value);
                deferred.resolve();
            } catch(error) {
                var metaData = { localStorageItems: quantimodoService.getLocalStorageList() };
                var name = error;
                var message = 'Error saving ' + key + ' to local storage';
                var severity = 'error';
                quantimodoService.bugsnagNotify(name, message, metaData, severity);
                quantimodoService.deleteLargeLocalStorageItems(metaData.localStorageItems);
            }
        }
        return deferred.promise;
    };
    quantimodoService.deleteLargeLocalStorageItems = function(localStorageItemsArray){
        for (var i = 0; i < localStorageItemsArray.length; i++){
            if(localStorageItemsArray[i].kB > 2000){ localStorage.removeItem(localStorageItemsArray[i].name); }
        }
    };
    quantimodoService.getLocalStorageList = function(){
        var localStorageItemsArray = [];
        for (var i = 0; i < localStorage.length; i++){
            localStorage.getItem(localStorage.key(i));
            localStorageItemsArray.push({
                name: localStorage.key(i),
                kB: Math.round(localStorage.getItem(localStorage.key(i)).length*16/(8*1024))
            });
        }
        return localStorageItemsArray.sort( function ( a, b ) { return b.kB - a.kB; } );
    };
    quantimodoService.getLocalStorageItemAsStringWithCallback = function(key, callback){
        var keyIdentifier = config.appSettings.appStorageIdentifier;
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(keyIdentifier+key,function(val){
                callback(val[keyIdentifier+key]);
            });
        } else {
            var val = localStorage.getItem(keyIdentifier+key);
            callback(val);
        }
    };
    quantimodoService.getLocalStorageItemAsString = function(key) {
        var keyIdentifier = config.appSettings.appStorageIdentifier;
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(keyIdentifier+key,function(val){
                return val[keyIdentifier+key];
            });
        } else {return localStorage.getItem(keyIdentifier+key);}
    };
    quantimodoService.getElementsFromLocalStorageItemWithFilters = function (localStorageItemName, filterPropertyName, filterPropertyValue,
                                                                             lessThanPropertyName, lessThanPropertyValue,
                                                                             greaterThanPropertyName, greaterThanPropertyValue) {
        var keyIdentifier = config.appSettings.appStorageIdentifier;
        var unfilteredElementArray = [];
        var itemAsString;
        var i;
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(keyIdentifier+localStorageItemName,function(localStorageItems){
                itemAsString = localStorageItems[keyIdentifier + localStorageItemName];
            });
        } else {
            //console.debug(localStorage.getItem(keyIdentifier + localStorageItemName));
            itemAsString = localStorage.getItem(keyIdentifier + localStorageItemName);
        }
        if(!itemAsString){return null;}
        if(itemAsString === "undefined"){
            quantimodoService.reportError(localStorageItemName  + " local storage item is undefined!");
            return null;
        }
        var matchingElements = JSON.parse(itemAsString);
        if(matchingElements.length){
            if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined") {
                console.error(greaterThanPropertyName + " greaterThanPropertyName does not exist for " + localStorageItemName);
            }
            if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
                console.error(filterPropertyName + " filterPropertyName does not exist for " + localStorageItemName);
            }
            if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
                console.error(lessThanPropertyName + " lessThanPropertyName does not exist for " + localStorageItemName);
            }
        }
        if(filterPropertyName && typeof filterPropertyValue !== "undefined" && filterPropertyValue !== null){
            if(matchingElements){unfilteredElementArray = matchingElements;}
            matchingElements = [];
            for(i = 0; i < unfilteredElementArray.length; i++){
                if(unfilteredElementArray[i][filterPropertyName] === filterPropertyValue){
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
    quantimodoService.searchLocalStorage = function (localStorageItemName, filterPropertyName, searchQuery, requestParams) {
        var matchingElements = [];
        var unfilteredElementArray = quantimodoService.getElementsFromLocalStorageItemWithRequestParams(localStorageItemName, requestParams);
        if(!unfilteredElementArray || !unfilteredElementArray.length){return null;}
        if(filterPropertyName && typeof unfilteredElementArray[0][filterPropertyName] === "undefined"){
            console.error(filterPropertyName + " filterPropertyName does not exist for " + localStorageItemName);
            return null;
        }
        for(var i = 0; i < unfilteredElementArray.length; i++){
            if(unfilteredElementArray[i][filterPropertyName].toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1){
                matchingElements.push(unfilteredElementArray[i]);
            }
        }
        if(requestParams && requestParams.sort){matchingElements = quantimodoService.sortByProperty(matchingElements, requestParams.sort);}
        return matchingElements;
    };
    quantimodoService.sortByProperty = function(arrayToSort, propertyName){
        if(propertyName.indexOf('-') > -1){
            arrayToSort.sort(function(a, b){return b[propertyName.replace('-', '')] - a[propertyName.replace('-', '')];});
        } else {
            arrayToSort.sort(function(a, b){return a[propertyName] - b[propertyName];});
        }
        return arrayToSort;
    };
    quantimodoService.getLocalStorageItemAsObject = function(key) {
        var keyIdentifier = config.appSettings.appStorageIdentifier;
        if ($rootScope.isChromeApp) {
            // Code running in a Chrome extension (content script, background page, etc.)
            chrome.storage.local.get(keyIdentifier+key,function(val){
                var item = val[keyIdentifier+key];
                item = convertToObjectIfJsonString(item);
                return item;
            });
        } else {
            var item = localStorage.getItem(keyIdentifier+key);
            item = convertToObjectIfJsonString(item);
            return item;
        }
    };
    quantimodoService.clearLocalStorage = function(){
        if ($rootScope.isChromeApp) {chrome.storage.local.clear();} else {localStorage.clear();}
    };
    var convertToObjectIfJsonString = function(stringOrObject) {
        try {stringOrObject = JSON.parse(stringOrObject);} catch (e) {return stringOrObject;}
        return stringOrObject;
    };
    quantimodoService.getCachedResponse = function(requestName, params, ignoreExpiration){
        if(!params){
            console.error('No params provided to getCachedResponse');
            return false;
        }
        var cachedResponse = JSON.parse(quantimodoService.getLocalStorageItemAsString(requestName));
        if(!cachedResponse || !cachedResponse.expirationTimeMilliseconds){return false;}
        var paramsMatch = JSON.stringify(cachedResponse.requestParams) === JSON.stringify(params);
        if(!paramsMatch){return false;}
        var cacheNotExpired = Date.now() < cachedResponse.expirationTimeMilliseconds;
        if(ignoreExpiration){cacheNotExpired = true;}
        if(!cacheNotExpired){return false;}
        //if(!cachedResponse.response.length){return false;} // Doesn't work if response is an object instead of array
        return cachedResponse.response;
    };
    quantimodoService.storeCachedResponse = function(requestName, params, response){
        var cachedResponse = {requestParams: params, response: response, expirationTimeMilliseconds: Date.now() + 86400 * 1000};
        quantimodoService.setLocalStorageItem(requestName, JSON.stringify(cachedResponse));
    };
    quantimodoService.deleteCachedResponse = function(requestName){quantimodoService.deleteItemFromLocalStorage(requestName);};
    quantimodoService.getElementsFromLocalStorageItemWithRequestParams = function(localStorageItemName, requestParams) {
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
            } else if (typeof value === "string" && value !== "Anything"){
                if(!isNaN(value)){filterPropertyValues = Number(filterPropertyValue);} else {filterPropertyValues.push(value);}
                filterPropertyNames.push(key);
            } else if (typeof value === "boolean" && (key === "outcome" || (key === 'manualTracking' && value === true))){
                filterPropertyValues.push(value);
                filterPropertyNames.push(key);
            }
        }, log);
        var results =  quantimodoService.getElementsFromLocalStorageItemWithFilters(localStorageItemName, null,
            null, lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName, greaterThanPropertyValue);
        if(results){
            for(var i = 0; i < filterPropertyNames.length; i++){
                results = results.filter(function( obj ) {return obj[filterPropertyNames[i]] === filterPropertyValues[i];});
            }
        }
        return results;
    };

    // LOGIN SERVICES
    quantimodoService.fetchAccessTokenAndUserDetails = function(authorization_code, withJWT) {
        quantimodoService.getAccessTokenFromAuthorizationCode(authorization_code, withJWT)
            .then(function(response) {
                $ionicLoading.hide();
                if(response.error){
                    quantimodoService.reportError(response.error);
                    console.error("Error generating access token");
                    quantimodoService.setLocalStorageItem('user', null);
                } else {
                    console.debug("Access token received",response);
                    quantimodoService.saveAccessTokenInLocalStorage(response);
                    console.debug('get user details from server and going to defaultState...');
                    $ionicLoading.show();
                    quantimodoService.refreshUser().then(function(user){
                        $ionicLoading.hide();
                        quantimodoService.syncAllUserData();
                        console.debug($state.current.name + ' quantimodoService.fetchAccessTokenAndUserDetails got this user ' + JSON.stringify(user));
                    }, function(error){
                        $ionicLoading.hide();
                        quantimodoService.reportError($state.current.name + ' could not refresh user because ' + JSON.stringify(error));
                    });
                }
            }).catch(function(exception){ if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                $ionicLoading.hide();
                quantimodoService.setLocalStorageItem('user', null);
            });
    };
    quantimodoService.nonNativeMobileLogin = function(register) {
        console.debug('quantimodoService.nonNativeMobileLogin: open the auth window via inAppBrowser.');
        // Set location=yes instead of location=no temporarily to try to diagnose intermittent white screen on iOS
        //var ref = window.open(url,'_blank', 'location=no,toolbar=yes');
        // Try clearing inAppBrowser cache to avoid intermittent connectors page redirection problem
        // Note:  Clearing cache didn't solve the problem, but I'll leave it because I don't think it hurts anything
        var ref = window.open(quantimodoService.generateV1OAuthUrl(register),'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');
        // Commented because I think it's causing "$apply already in progress" error
        // $timeout(function () {
        //     console.debug('quantimodoService.nonNativeMobileLogin: Automatically closing inAppBrowser auth window after 60 seconds.');
        //     ref.close();
        // }, 60000);
        console.debug('quantimodoService.nonNativeMobileLogin: listen to its event when the page changes');
        ref.addEventListener('loadstart', function(event) {
            console.debug('quantimodoService.nonNativeMobileLogin: Checking if changed url ' + event.url + ' is the same as redirection url ' + quantimodoService.getRedirectUri());
            if(quantimodoService.startsWith(event.url, quantimodoService.getRedirectUri())) {
                console.debug('quantimodoService.nonNativeMobileLogin: event.url starts with ' + quantimodoService.getRedirectUri());
                if(!quantimodoService.getUrlParameter('error', event.url)) {
                    var authorizationCode = quantimodoService.getAuthorizationCodeFromUrl(event);
                    ref.close();
                    console.debug('quantimodoService.nonNativeMobileLogin: Going to get an access token using authorization code.');
                    quantimodoService.fetchAccessTokenAndUserDetails(authorizationCode);
                } else {
                    var errorMessage = "quantimodoService.nonNativeMobileLogin: error occurred:" + quantimodoService.getUrlParameter('error', event.url);
                    quantimodoService.reportError(errorMessage);
                    ref.close();
                }
            }
        });
    };
    quantimodoService.chromeAppLogin = function(register){
        console.debug("login: Use Chrome app (content script, background page, etc.");
        var url = quantimodoService.generateV1OAuthUrl(register);
        chrome.identity.launchWebAuthFlow({'url': url, 'interactive': true
        }, function() {
            var authorizationCode = quantimodoService.getAuthorizationCodeFromUrl(event);
            quantimodoService.getAccessTokenFromAuthorizationCode(authorizationCode);
        });
    };
    quantimodoService.chromeExtensionLogin = function(register) {
        var loginUrl = quantimodoService.getQuantiModoUrl("api/v2/auth/login");
        if (register === true) {loginUrl = quantimodoService.getQuantiModoUrl("api/v2/auth/register");}
        console.debug("Using Chrome extension, so we use sessions instead of OAuth flow. ");
        chrome.tabs.create({ url: loginUrl });
        window.close();
    };
    quantimodoService.oAuthBrowserLogin = function (register) {
        var url = quantimodoService.generateV1OAuthUrl(register);
        console.debug("Going to try logging in by opening new tab at url " + url);
        $ionicLoading.show();
        var ref = window.open(url, '_blank');
        if (!ref) {
            alert("You must first unblock popups, and and refresh the page for this to work!");
        } else {
            console.debug('Opened ' + url + ' and now broadcasting isLoggedIn message question every second to sibling tabs');
            var interval = setInterval(function () {ref.postMessage('isLoggedIn?', quantimodoService.getRedirectUri());}, 1000);
            // handler when a message is received from a sibling tab
            window.onMessageReceived = function (event) {
                console.debug("message received from sibling tab", event.url);
                if(interval !== false){
                    // Don't ask login question anymore
                    clearInterval(interval);
                    interval = false;
                    // the url that quantimodoService redirected us to
                    var iframe_url = event.data;
                    // validate if the url is same as we wanted it to be
                    if (quantimodoService.startsWith(iframe_url, quantimodoService.getRedirectUri())) {
                        // if there is no error
                        if (!quantimodoService.getUrlParameter('error', iframe_url)) {
                            var authorizationCode = quantimodoService.getAuthorizationCodeFromUrl(event);
                            // get access token from authorization code
                            quantimodoService.fetchAccessTokenAndUserDetails(authorizationCode);
                            // close the sibling tab
                            ref.close();
                        } else {
                            // TODO : display_error
                            alert('Could not login.  Please contact mike@quantimo.do');
                            quantimodoService.reportError("Error occurred validating redirect " + iframe_url +
                                ". Closing the sibling tab." + quantimodoService.getUrlParameter('error', iframe_url));
                            console.error("Error occurred validating redirect url. Closing the sibling tab.",
                                quantimodoService.getUrlParameter('error', iframe_url));
                            // close the sibling tab
                            ref.close();
                        }
                    }
                }
            };
            // listen to broadcast messages from other tabs within browser
            window.addEventListener("message", window.onMessageReceived, false);
        }
    };
    quantimodoService.forecastioWeather = function() {
        if(!$rootScope.user){
            console.debug("No recording weather because we're not logged in");
            return;
        }
        var nowTimestamp = Math.floor(Date.now() / 1000);
        var lastPostedWeatherAt = Number(quantimodoService.getLocalStorageItemAsString('lastPostedWeatherAt'));
        var localMidnightMoment = moment(0, "HH");
        var localMidnightTimestamp = localMidnightMoment.unix();
        var yesterdayNoonTimestamp = localMidnightTimestamp - 86400/2;
        if(lastPostedWeatherAt && lastPostedWeatherAt > yesterdayNoonTimestamp){
            console.debug("recently posted weather already");
            return;
        }
        var FORECASTIO_KEY = '81b54a0d1bd6e3ccdd52e777be2b14cb';
        var url = 'https://api.forecast.io/forecast/' + FORECASTIO_KEY + '/';
        url = url + localStorage.lastLatitude + ',' + localStorage.lastLongitude + ',' + yesterdayNoonTimestamp + '?callback=JSON_CALLBACK';
        console.debug('Checking weather forecast at ' + url);
        var measurementSets = [];
        $http.jsonp(url).
        success(function(data) {
            console.log(data);
            measurementSets.push({
                variableCategoryName: "Environment",
                variableName: data.daily.data[0].icon.replace('-', ' '),
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "count",
                fillingValue: 0,
                measurements: [{
                    value: 1,
                    startTimeEpoch: yesterdayNoonTimestamp,
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]}
            );
            measurementSets.push({
                variableCategoryName: "Environment",
                variableName: "Outdoor Temperature",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "F",
                measurements: [{
                    value: (data.daily.data[0].temperatureMax +  data.daily.data[0].temperatureMin)/2,
                    startTimeEpoch: yesterdayNoonTimestamp,
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]}
            );
            measurementSets.push({
                variableCategoryName: "Environment",
                variableName: "Barometric Pressure",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "Pa",
                measurements: [{
                    value: data.daily.data[0].pressure * 100,
                    startTimeEpoch: yesterdayNoonTimestamp,
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]}
            );
            measurementSets.push({
                variableCategoryName: "Environment",
                variableName: "Outdoor Humidity",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "%",
                measurements: [{
                    value: data.daily.data[0].humidity * 100,
                    startTimeEpoch: yesterdayNoonTimestamp,
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]}
            );
            if(data.daily.data[0].visibility){
                measurementSets.push({
                    variableCategoryName: "Environment",
                    variableName: "Outdoor Visibility",
                    combinationOperation: "MEAN",
                    sourceName: $rootScope.appSettings.appDisplayName,
                    unitAbbreviatedName: "miles",
                    measurements: [{
                        value: data.daily.data[0].visibility,
                        startTimeEpoch: yesterdayNoonTimestamp,
                        //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                    }]}
                );
            }
            measurementSets.push({
                variableCategoryName: "Environment",
                variableName: "Cloud Cover",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "%",
                measurements: [{
                    value: data.daily.data[0].cloudCover * 100,
                    startTimeEpoch: yesterdayNoonTimestamp,
                    //note: data.daily.data[0].icon  // We shouldn't add icon as note because it messes up the note analysis
                }]}
            );
            quantimodoService.postMeasurementsToApi(measurementSets, function (response) {
                console.debug("posted weather measurements");
                if(response && response.data && response.data.userVariables){
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', response.data.userVariables);
                }
                if(!lastPostedWeatherAt){quantimodoService.setLocalStorageItem('lastPostedWeatherAt', nowTimestamp);}
            }, function (error) {console.debug("could not post weather measurements: " + error);});
        }).error(function (data) {console.debug("Request failed");});
    };
    quantimodoService.setupHelpCards = function (force) {
        if(window.localStorage.getItem('helpCardsSetup') && !force){
            console.debug('Help cards already set up');
            return quantimodoService.getLocalStorageItemAsObject('defaultHelpCards');
        }
        window.localStorage.setItem('helpCardsSetup', true);
        var defaultHelpCards = [
            {
                id: "getStartedHelpCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideGetStartedHelpCard",
                title: 'Reminder Inbox',
                "backgroundColor": "#f09402",
                circleColor: "#fab952",
                iconClass: "icon positive ion-archive",
                image: {
                    url: "img/variable_categories/vegetarian_food-96.png",
                    height: "96",
                    width: "96"
                },
                bodyText: "Scroll through the Inbox and press the appropriate button on each reminder notification. " +
                "Each one only takes a few seconds. You'll be " +
                "shocked at how much valuable data you can collect with just a few minutes in the Reminder Inbox each day!",
                hideHelpCardText: "Got it!",
                hideHelpCardIonIcon: "ion-checkmark"
            },
            {
                id: "recordMeasurementInfoCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideRecordMeasurementInfoCard",
                title: 'Record Measurements',
                "backgroundColor": "#f09402",
                circleColor: "#fab952",
                iconClass: "icon positive ion-edit",
                image: {
                    url: $rootScope.variableCategories.Foods.imageUrl,
                    height: "96",
                    width: "96"
                },
                bodyText: "Want to just record a medication, food or symptom immediately instead of creating a reminder? " +
                "Just go to the Record Measurement menu item and select the appropriate variable category. " +
                "Alternatively, you can just press the little red button at the bottom of the screen.",
                hideHelpCardText: "Got it!",
                hideHelpCardIonIcon: "ion-checkmark"
            },
            {
                id: "chromeExtensionInfoCard",
                ngIfLogic: "stateParams.showHelpCards === true && isMobile && !hideChromeExtensionInfoCard",
                title: 'Track on the Computer',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                iconClass: "icon positive ion-social-chrome",
                image: {
                    url: "img/chrome.ico",
                    height: "96",
                    width: "96"
                },
                bodyText: "Did you know that you can easily track everything on your laptop and desktop with our " +
                "Google Chrome browser extension?  Your data is synced between devices so you'll never have to " +
                "track twice!",
                hideHelpCardText: "Dismiss",
                hideHelpCardIonIcon: "ion-close-circled",
                chromeExtensionEmailButton: true
            },
            {
                id: "getHelpInfoCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideGetHelpInfoCard",
                title: 'Need Help?',
                iconClass: "icon positive ion-help-circled",
                bodyText: "If you need help or have any suggestions, please click the question mark in the upper right corner.",
                hideHelpCardText: "Got it!",
                hideHelpCardIonIcon: "ion-checkmark"
            },
            {
                id: "getFitbitHelpInfoCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideGetFitbitHelpInfoCard",
                title: 'Automated Tracking',
                iconClass: "icon positive ion-wand",
                bodyText: "Want to automatically record your sleep, exercise, and heart rate?",
                hideHelpCardText: "No Thanks",
                hideHelpCardIonIcon: "ion-android-cancel",
                emailButton: {
                    type: "fitbit",
                    text: "Get Fitbit",
                    ionIcon: "ion-checkmark"
                }
            }
        ];
        var debugMode = false;
        var helpCards;
        if(debugMode){
            $rootScope.hideNavigationMenu = true;
            helpCards = defaultHelpCards;
        }
        if(!helpCards){
            quantimodoService.getLocalStorageItemAsStringWithCallback('defaultHelpCards', function (defaultHelpCardsFromLocalStorage) {
                if(defaultHelpCardsFromLocalStorage === null){
                    helpCards = defaultHelpCards;
                    quantimodoService.setLocalStorageItem('defaultHelpCards', JSON.stringify(defaultHelpCards));
                } else {helpCards = JSON.parse(defaultHelpCardsFromLocalStorage);}
            });
        }
        return helpCards;
    };
    quantimodoService.green = {backgroundColor: "#0f9d58", circleColor: "#03c466"};
    quantimodoService.blue = {backgroundColor: "#3467d6", circleColor: "#5b95f9"};
    quantimodoService.yellow = {backgroundColor: "#f09402", circleColor: "#fab952"};
    quantimodoService.setupOnboardingPages = function () {
        var onboardingPages = [
            {
                id: "addEmotionRemindersCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideAddEmotionRemindersCard",
                title: 'Varying Emotions?',
                color: quantimodoService.green,
                iconClass: "icon positive " + $rootScope.variableCategories.Emotions.ionIcon,
                image: {
                    url: $rootScope.variableCategories.Emotions.imageUrl,
                    height: "96",
                    width: "96"
                },
                variableCategoryName: "Emotions",
                addButtonText: 'Add Emotion',
                nextPageButtonText: 'Maybe Later',
                bodyText: "Do you have any emotions that fluctuate regularly? <br> <br> If so, add them so I can try to " +
                    "determine which factors are influencing them.",
            },
            {
                id: "addSymptomRemindersCard",
                title: 'Recurring Symptoms?',
                color: quantimodoService.blue,
                iconClass: "icon positive " + $rootScope.variableCategories.Symptoms.ionIcon,
                image: {
                    url: $rootScope.variableCategories.Symptoms.imageUrl,
                    height: "96",
                    width: "96"
                },
                variableCategoryName: "Symptoms",
                addButtonText: 'Add Symptom',
                nextPageButtonText: 'Maybe Later',
                bodyText: 'Got any recurring symptoms that vary in their severity?',
                moreInfo: $rootScope.variableCategories.Symptoms.moreInfo,
            },
            {
                id: "addFoodRemindersCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideAddFoodRemindersCard",
                title: 'Common Foods or Drinks?',
                color: quantimodoService.blue,
                iconClass: "icon positive " + $rootScope.variableCategories.Foods.ionIcon,
                image: {
                    url: $rootScope.variableCategories.Foods.imageUrl,
                    height: "96",
                    width: "96"
                },
                variableCategoryName: "Foods",
                addButtonText: 'Add Food or Drink',
                nextPageButtonText: 'Maybe Later',
                bodyText: "Add any foods or drinks that you consume more than a few times a week",
            },
            {
                id: "addTreatmentRemindersCard",
                title: 'Any Treatments?',
                color: quantimodoService.yellow,
                iconClass: "icon positive " + $rootScope.variableCategories.Treatments.ionIcon,
                image: {
                    url: $rootScope.variableCategories.Treatments.imageUrl,
                    height: "96",
                    width: "96"
                },
                variableCategoryName: "Treatments",
                addButtonText: 'Add Treatment',
                nextPageButtonText: 'Maybe Later',
                bodyText: 'Are you taking any medications, treatments, supplements, or other interventions ' +
                    'like meditation or psychotherapy? ',
                moreInfo: $rootScope.variableCategories.Treatments.moreInfo,
            },
            {
                id: "locationTrackingPage",
                title: 'Location Tracking',
                color: quantimodoService.green,
                iconClass: "icon positive " + $rootScope.variableCategories.Location.ionIcon,
                image: {
                    url: $rootScope.variableCategories.Location.imageUrl,
                    height: "96",
                    width: "96"
                },
                premiumFeature: true,
                nextPageButtonText: 'Maybe Later',
                bodyText: "Would you like to automatically log location to see how time spent at restaurants, " +
                    "the gym, work or doctors offices might be affecting you? ",
                moreInfo: $rootScope.variableCategories.Location.moreInfo,
            },
            {
                id: "weatherTrackingPage",
                title: 'Weather Tracking',
                color: quantimodoService.green,
                iconClass: "icon positive " + $rootScope.variableCategories.Environment.ionIcon,
                image: {
                    url: $rootScope.variableCategories.Environment.imageUrl,
                    height: "96",
                    width: "96"
                },
                premiumFeature: true,
                nextPageButtonText: 'Maybe Later',
                bodyText: "Would you like to automatically record the weather to see how temperature or sunlight " +
                    "exposure might be affecting you? ",
                moreInfo: $rootScope.variableCategories.Environment.moreInfo,
            },
            {
                id: "importDataPage",
                title: 'Import Your Data',
                color: quantimodoService.yellow,
                iconClass: "icon positive ion-ios-cloud-download-outline",
                image: {
                    url: "img/intro/download_2-96.png",
                    height: "96",
                    width: "96"
                },
                premiumFeature: true,
                bodyText: "Let's go to the Import Data page and see if you're using any of the dozens of apps and " +
                    "devices that I can automatically pull data from!",
                nextPageButtonText: "Maybe Later",
            },
            {
                id: "allDoneCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideImportDataCard",
                title: 'Great job!',
                color: quantimodoService.green,
                iconClass: "icon positive ion-ios-cloud-download-outline",
                image: {
                    url: "img/robots/quantimodo-robot-waving.svg",
                    height: "120",
                    width: "120"
                },
                bodyText: "You're all set up!  Let's take a minute to record your first measurements and then " +
                    "you're done for the day! "
            }
        ];
        var onboardingPagesFromLocalStorage = quantimodoService.getLocalStorageItemAsObject('onboardingPages');
        if(onboardingPagesFromLocalStorage && onboardingPagesFromLocalStorage.length &&
            onboardingPagesFromLocalStorage !== "undefined"){
            onboardingPages = onboardingPagesFromLocalStorage;
        }
        $rootScope.onboardingPages = onboardingPages;
    };
    quantimodoService.getIntroSlidesOld = function () {
        var introSlides = [
            {
                "img" : {
                    "width" : "250",
                    "height" : "250",
                    "url" : "img/intro/intro_import.png"
                },
                "textColor": "white",
                "backgroundColor": "#3467d6",
                "content" : {
                    "firstParagraph" : {
                        "visible" : true,
                        "content" : "Import Data",
                        "classes" : "intro-header"
                    },
                    "logoDiv" : {
                        "visible" : true,
                        "id" : "logo"
                    },
                    "finalParagraph" : {
                        "visible" : true,
                        "content" : "Import data from all your apps and devices",
                        "classes" : "intro-paragraph",
                        "buttonBarVisible" : true
                    }
                }
            },
            {
                "img" : {
                    "width" : "250",
                    "height" : "250",
                    "url" : "img/intro/intro_track_anything.png"
                },
                "textColor": "white",
                "backgroundColor": "#f09402",
                "content" : {
                    "firstParagraph" : {
                        "visible" : true,
                        "content" : "Track Anything",
                        "classes" : "intro-header"
                    },
                    "logoDiv" : {
                        "visible" : true,
                        "id" : "logo"
                    },
                    "finalParagraph" : {
                        "visible" : true,
                        "content" : "Log treatments, diet, symptoms, emotions, and anything else",
                        "classes" : "intro-paragraph",
                        "buttonBarVisible" : true
                    }
                }
            },
            {
                "img" : {
                    "width" : "250",
                    "height" : "250",
                    "url" : "img/intro/intro_make_discoveries.png"
                },
                "textColor": "white",
                "backgroundColor": "#0f9d58",
                "content" : {
                    "firstParagraph" : {
                        "visible" : true,
                        "content" : "Make Discoveries",
                        "classes" : "intro-header"
                    },
                    "logoDiv" : {
                        "visible" : true,
                        "id" : "logo"
                    },
                    "finalParagraph": {
                        "visible" : true,
                        "content" : "After I have about a month of data, I analyze it to discover the hidden factors " +
                        "linked to your well-being",
                        "classes" : "intro-paragraph",
                        "buttonBarVisible" : true
                    }
                }
            }
        ];
        if(config.appSettings.intro){return config.appSettings.intro;}
        return introSlides;
    };
    quantimodoService.getIntroSlidesNew = function () {
        var introSlides = [
            {
                newIntroStyle: true,
                title: "Hi! I'm " + config.appSettings.appDisplayName + "!",
                color: quantimodoService.green,
                image: {
                    url: "img/robots/quantimodo-robot-waving.svg",
                    height: "120",
                    width: "120"
                },
                bodyText: "I've been programmed to reduce human suffering with data.",
            },
            {
                newIntroStyle: true,
                title: "Hidden Influences",
                color: quantimodoService.blue,
                image: {
                    url: "img/intro/patient-frown-factors.png",
                    height: "120",
                    width: "120"
                },
                bodyText: "Your symptoms can be worsened or improved by medical treatments, your sleep, exercise, " +
                "the hundreds of chemicals you consume through your diet, and even the weather!",
            },
            {
                newIntroStyle: true,
                title: "Only Human",
                color: quantimodoService.yellow,
                image: {
                    url: "img/brains/brain-pink.svg",
                    height: "120",
                    width: "120"
                },
                bodyText: "Human brains can only hold 7 numbers in working-memory at a time.  " +
                "So they're not able to determine which factors are most significant. ",
            },
            {
                newIntroStyle: true,
                title: "Treatment Determination",
                color: quantimodoService.green,
                image: {
                    url: "img/intro/doctor-frown-factors.png",
                    height: "120",
                    width: "120"
                },
                bodyText: "Indeed, your doctor has access to less than 1% of the relevant information when they use " +
                "intuition to determine the best ways to treat your symptoms!",
            },
            {
                newIntroStyle: true,
                title: "Machine Learning",
                color: quantimodoService.blue,
                image: {
                    url: "img/robots/quantimodo-robot-brain.svg",
                    height: "120",
                    width: "120"
                },
                bodyText: "My brain can hold trillions of numbers!  I can also analyze it to determine which hidden " +
                "factors are most likely to improve or exacerbate your condition! "
            },
            {
                newIntroStyle: true,
                title: "Automated Tracking",
                color: quantimodoService.green,
                image: {
                    url: "img/intro/download_2-96.png",
                    height: "100",
                    width: "100"
                },
                bodyText: "Weight, blood pressure, heart rate, physical activity data can be collected automatically " +
                "and imported from dozens of devices.  Weather and the amount of time spent at the gym, restaurants, " +
                "work, or doctors offices can be collected via your phone's GPS.",
            },
            {
                newIntroStyle: true,
                title: "Effortless Tracking",
                color: quantimodoService.yellow,
                image: {
                    url: "img/intro/inbox.svg",
                    height: "90",
                    width: "90"
                },
                bodyText: "By taking just a few minutes each day, you can easily record your symptoms," +
                " treatments, and diet in the Reminder Inbox.  The more data you give me, the smarter I get!  Your" +
                " data doesn't have to be perfect to be valuable, but it's important to track regularly. ",
            },
            {
                newIntroStyle: true,
                title: "Data Security",
                color: quantimodoService.blue,
                image: {
                    url: "img/intro/lock.svg",
                    height: "90",
                    width: "90"
                },
                bodyText: "I use bank-level encryption to keep your data secure.  Human eyes will never see your " +
                "data unless you intentionally share it. ",
            },
        ];
        if(config.appSettings.introNew){return config.appSettings.introNew;}
        return introSlides;
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
    $rootScope.planFeaturesCards = [
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
    quantimodoService.setupUpgradePages = function () {
        var upgradePages = [
            {
                id: "upgradePage",
                title: 'QuantiModo Plus',
                "backgroundColor": "#3467d6",
                circleColor: "#fefdfc",
                iconClass: "icon positive ion-ios-medkit-outline",
                image: {
                    url: "img/robots/quantimodo-robot-waving.svg",
                    height: "120",
                    width: "120"
                },
                bodyText: "I need to eat electricity to live and I am very hungry.  Please help me by subscribing or I will die."
            },
            {
                id: "addTreatmentRemindersCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideAddTreatmentRemindersCard",
                title: 'Any Treatments?',
                "backgroundColor": "#f09402",
                circleColor: "#fab952",
                iconClass: "icon positive ion-ios-medkit-outline",
                image: {
                    url: $rootScope.variableCategories.Treatments.imageUrl,
                    height: "96",
                    width: "96"
                },
                bodyText: 'Are you taking any medications, treatments, supplements, or other interventions ' +
                'like meditation or psychotherapy? ',
                moreInfo: $rootScope.variableCategories.Treatments.moreInfo,
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
                ngIfLogic: "stateParams.showHelpCards === true && !hideAddSymptomRemindersCard",
                title: 'Recurring Symptoms?',
                "backgroundColor": "#3467d6",
                circleColor: "#5b95f9",
                iconClass: "icon positive ion-sad-outline",
                image: {
                    url: $rootScope.variableCategories.Symptoms.imageUrl,
                    height: "96",
                    width: "96"
                },
                bodyText: 'Got any recurring symptoms that vary in their severity?',
                moreInfo: $rootScope.variableCategories.Symptoms.moreInfo,
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
                ngIfLogic: "stateParams.showHelpCards === true && !hideAddEmotionRemindersCard",
                title: 'Varying Emotions?',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                iconClass: "icon positive ion-happy-outline",
                image: {
                    url: $rootScope.variableCategories.Emotions.imageUrl,
                    height: "96",
                    width: "96"
                },
                bodyText: "Do you have any emotions that fluctuate regularly?<br><br>If so, add them so I can try to " +
                    "determine which factors are influencing them.",
                moreInfo: $rootScope.variableCategories.Emotions.moreInfo,
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
                ngIfLogic: "stateParams.showHelpCards === true && !hideAddFoodRemindersCard",
                title: 'Common Foods or Drinks?',
                "backgroundColor": "#3467d6",
                circleColor: "#5b95f9",
                iconClass: "icon positive ion-ios-nutrition-outline",
                image: {
                    url: $rootScope.variableCategories.Foods.imageUrl,
                    height: "96",
                    width: "96"
                },
                bodyText: "Add any foods or drinks that you consume more than a few times a week",
                moreInfo: $rootScope.variableCategories.Foods.moreInfo,
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
                ngIfLogic: "stateParams.showHelpCards === true && !hideLocationTrackingInfoCard && !user.trackLocation",
                title: 'Location Tracking',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                iconClass: "icon positive ion-ios-location",
                image: {
                    url: $rootScope.variableCategories.Environment.imageUrl,
                    height: "96",
                    width: "96"
                },
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
                ngIfLogic: "stateParams.showHelpCards === true",
                title: 'Weather Tracking',
                "backgroundColor": "#0f9d58",
                circleColor: "#03c466",
                iconClass: "icon positive ion-ios-thunderstorm",
                image: {
                    url: $rootScope.variableCategories.Environment.imageUrl,
                    height: "96",
                    width: "96"
                },
                bodyText: "Would you like to automatically log the weather to see how it might be affecting you? ",
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
                id: "importDataCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideImportDataCard",
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
                ngIfLogic: "stateParams.showHelpCards === true && !hideImportDataCard",
                title: 'Great job!',
                "backgroundColor": "#3467d6",
                circleColor: "#fefdfc",
                iconClass: "icon positive ion-ios-cloud-download-outline",
                image: {
                    url: "img/robots/quantimodo-robot-waving.svg",
                    height: "120",
                    width: "120"
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
        var upgradePagesFromLocalStorage = quantimodoService.getLocalStorageItemAsObject('upgradePages');
        if(upgradePagesFromLocalStorage && upgradePagesFromLocalStorage.length &&
            upgradePagesFromLocalStorage !== "undefined"){
            upgradePages = upgradePagesFromLocalStorage;
        }
        $rootScope.upgradePages = upgradePages;
    };
    quantimodoService.postCreditCard = function(body, successHandler, errorHandler) {
        quantimodoService.post('api/v2/account/subscribe', [], body, successHandler, errorHandler);
    };
    quantimodoService.postCreditCardDeferred = function(body){
        var deferred = $q.defer();
        quantimodoService.postCreditCard(body, function(response){
            $rootScope.user = response.user;
            quantimodoService.setLocalStorageItem('user', JSON.stringify($rootScope.user));
            localStorage.user = JSON.stringify($rootScope.user); // For Chrome Extension
            deferred.resolve(response);
        }, function(response){
            deferred.reject(response);
        });
        return deferred.promise;
    };
    quantimodoService.postDowngradeSubscription = function(body, successHandler, errorHandler) {
        quantimodoService.post('api/v2/account/unsubscribe', [], body, successHandler, errorHandler);
    };
    quantimodoService.postDowngradeSubscriptionDeferred = function(){
        var deferred = $q.defer();
        $rootScope.user.stripeActive = false;
        quantimodoService.reportError('User downgraded subscription: ' + JSON.stringify($rootScope.user));
        quantimodoService.postDowngradeSubscription({}, function(response){
            $rootScope.user = response.user;
            quantimodoService.setLocalStorageItem('user', JSON.stringify($rootScope.user));
            localStorage.user = JSON.stringify($rootScope.user); // For Chrome Extension
            deferred.resolve(response);
        }, function(response){deferred.reject(response);});
        return deferred.promise;
    };
    quantimodoService.helpInfo = {
        locationAndWeatherTracking: {title: "Location and Weather Tracking", textContent: $rootScope.variableCategories.Location.moreInfo}
    };
    quantimodoService.helpText = {
        predictorSearch: "Search for a predictor like a food or treatment that you want to know the effects of...",
        outcomeSearch: "Select an outcome variable to be optimized like overall mood or sleep quality..."
    };
    quantimodoService.sendWithEmailComposer = function(subjectLine, emailBody, emailAddress, fallbackUrl){
        if(!cordova || !cordova.plugins.email){
            quantimodoService.reportError('Trying to send with cordova.plugins.email even though it is not installed. ' +
                ' Using quantimodoService.sendWithMailTo instead.');
            quantimodoService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
            return;
        }
        if(!emailAddress){emailAddress = null;}
        document.addEventListener('deviceready', function () {
            console.debug('deviceready');
            cordova.plugins.email.isAvailable(
                function (isAvailable) {
                    if(isAvailable){
                        if(window.plugins && window.plugins.emailComposer) {
                            console.debug('Generating email with cordova-plugin-email-composer');
                            window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                                    console.debug("Response -> " + result);
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
                            console.error('window.plugins.emailComposer not available!');
                            quantimodoService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                        }
                    } else {
                        console.error('Email has not been configured for this device!');
                        quantimodoService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                    }
                }
            );
        }, false);
    };
    quantimodoService.sendWithMailTo = function(subjectLine, emailBody, emailAddress){
        var emailUrl = 'mailto:';
        if(emailAddress){emailUrl = emailUrl + emailAddress;}
        emailUrl = emailUrl + '?subject=' + subjectLine + '&body=' + emailBody;
        quantimodoService.openSharingUrl(emailUrl);
    };
    quantimodoService.openSharingUrl = function(sharingUrl){
        var newTab = window.open(sharingUrl,'_system');
        if(!newTab){ alert("Please unblock popups and press the share button again!"); }
    };
    quantimodoService.addVariableToLocalStorage = function(variable){
        if(variable.userId){quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', variable);}
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('commonVariables', variable);
    };
    quantimodoService.sendEmailViaAPI = function(body, successHandler, errorHandler){
        quantimodoService.post('api/v2/email', [], body, successHandler, errorHandler);
    };
    quantimodoService.sendEmailViaAPIDeferred = function(emailType) {
        var deferred = $q.defer();
        quantimodoService.sendEmailViaAPI({emailType: emailType}, function(){
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
    quantimodoService.recordUpgradeProductImpression = function () {
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
            config.appSettings.appDisplayName, upgradeSubscriptionProducts.monthly7.category,
            upgradeSubscriptionProducts.monthly7.variant, upgradeSubscriptionProducts.monthly7.position,
            upgradeSubscriptionProducts.monthly7.price);
        Analytics.addImpression(upgradeSubscriptionProducts.yearly60.baseProductId,
            upgradeSubscriptionProducts.yearly60.name, $rootScope.currentPlatform + ' Upgrade Options',
            config.appSettings.appDisplayName, upgradeSubscriptionProducts.yearly60.category,
            upgradeSubscriptionProducts.yearly60.variant, upgradeSubscriptionProducts.yearly60.position,
            upgradeSubscriptionProducts.yearly60.price);
        Analytics.pageView();
    };
    quantimodoService.recordUpgradeProductPurchase = function (baseProductId, transactionId, step, coupon) {
        //Analytics.addProduct(baseProductId, name, category, brand, variant, price, quantity, coupon, position);
        Analytics.addProduct(baseProductId, upgradeSubscriptionProducts[baseProductId].name,
            upgradeSubscriptionProducts[baseProductId].category, config.appSettings.appDisplayName,
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
        var affiliation = config.appSettings.appDisplayName;
        var tax = 0;
        var shipping = 0;
        var list = config.appSettings.appDisplayName;
        var option = '';
        Analytics.trackTransaction(transactionId, affiliation, revenue, tax, shipping, coupon, list, step, option);
    };
    quantimodoService.getStudyLinks = function(predictorVariableName, outcomeVariableName){
        var subjectLine = "Help us discover the effect of " + predictorVariableName + " on " + outcomeVariableName;
        var studyLinkStatic = "https://app.quantimo.do/api/v2/study?causeVariableName=" +
            encodeURIComponent(predictorVariableName) + '&effectVariableName=' + encodeURIComponent(outcomeVariableName);
        var bodyText = "Please join my study at " + studyLinkStatic + " .  Have a great day!";
        return {
            studyLinkFacebook : "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(studyLinkStatic),
            studyLinkTwitter : "https://twitter.com/home?status=" + encodeURIComponent(subjectLine + ' ' + studyLinkStatic + ' @quantimodo'),
            studyLinkGoogle : "https://plus.google.com/share?url=" + encodeURIComponent(studyLinkStatic),
            studyLinkEmail: "mailto:?subject=" + encodeURIComponent(subjectLine) + "&body=" + encodeURIComponent(bodyText)
        };
    };
    quantimodoService.getWikipediaArticle = function(title){
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
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                console.error(error);
                deferred.reject(error);
            }
        }).catch(function (error) {
            console.error(error);
            deferred.reject(error);
            //on error
        });
        return deferred.promise;
    };
    quantimodoService.getMenu = function(menuType){
        if(config.appSettings.menu){return config.appSettings.menu;}
        var menuItems = {
            inbox: {
                "title" : "Reminder Inbox",
                "href" : "#/app/reminders-inbox",
                "icon" : "ion-archive"
            },
            favorites: {
                "title" : "Favorites",
                "href" : "#/app/favorites",
                "icon" : "ion-ios-star"
            },
            settings: {
                    "title" : "Settings",
                    "href" : "#/app/settings",
                    "icon" : "ion-ios-gear-outline"
                },
            helpAndFeedback: {
                "title" : "Help & Feedback",
                "href" : "#/app/feedback",
                "icon" : "ion-ios-help-outline"
            },
            treatments: {
                title : 'Treatments',
                href : '#/app/reminders-list/Treatments',
                icon : 'ion-ios-medkit-outline'
            },
            symptoms: {
                    title : 'Symptoms',
                    href : '#/app/reminders-list/Symptoms',
                    icon : 'ion-sad-outline'
                },
            vitalSigns: {
                title : 'Vital Signs',
                href : '#/app/reminders-list/Vital Signs',
                icon : 'ion-ios-pulse'
            },
            emotions: {
                title : 'Emotions',
                href : '#/app/reminders-list/Emotions',
                icon : 'ion-happy-outline'
            },
            foods: {
                title : 'Foods',
                href : '#/app/reminders-list/Foods',
                icon : 'ion-ios-nutrition-outline'
            },
            physicalActivity: {
                title : 'Physical Activity',
                href : '#/app/reminders-list/Physical Activity',
                icon : 'ion-ios-body-outline'
            },
            importData: {
                "title" : "Import Data",
                "href" : "#/app/import",
                "icon" : "ion-ios-cloud-download-outline"
            },
        };
        var menus = {
            extended: [
                menuItems.inbox,
                menuItems.favorites,
                {
                    "title" : "Overall Mood",
                    "click": "togglePrimaryOutcomeSubMenu",
                    "showSubMenuVariable" : "showPrimaryOutcomeSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-happy-outline",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Charts",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPrimaryOutcomeSubMenu",
                    "href" : "#/app/track",
                    "icon" : "ion-arrow-graph-up-right"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPrimaryOutcomeSubMenu",
                    "href" : "#/app/history",
                    "icon" : quantimodoService.ionIcons.history
                },
                {
                    "title" : "Positive Predictors",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPrimaryOutcomeSubMenu",
                    "href" : "#/app/predictors-positive",
                    "icon" : "ion-happy-outline"
                },
                {
                    "title" : "Negative Predictors",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPrimaryOutcomeSubMenu",
                    "href" : "#/app/predictors-negative",
                    "icon" : "ion-sad-outline"
                },
                {
                    "title" : "Manage Reminders",
                    "click" : "toggleReminderSubMenu",
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-android-notifications-none",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "All Reminders",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href" : "#/app/reminders-manage/Anything",
                    "icon" : "ion-android-globe"
                },
                {
                    "title" : "Emotions",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href" : "#/app/reminders-manage/Emotions",
                    "icon" : "ion-happy-outline"
                },
                {
                    "title" : "Foods",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href": "#/app/reminders-manage/Foods",
                    "icon" : "ion-ios-nutrition-outline"
                },
                {
                    "title" : "Physical Activity",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href" : "#/app/reminders-manage/Physical Activity",
                    "icon" : "ion-ios-body-outline"
                },
                {
                    "title" : "Symptoms",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href" : "#/app/reminders-manage/Symptoms",
                    "icon" : "ion-sad-outline"
                },
                {
                    "title" : "Treatments",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href" : "#/app/reminders-manage/Treatments",
                    "icon" : "ion-ios-medkit-outline"
                },
                {
                    "title" : "Vital Signs",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showReminderSubMenu",
                    "href" : "#/app/reminders-manage/Vital Signs",
                    "icon" : "ion-ios-pulse"
                },
                {
                    "title" : "Record Measurement",
                    "click" : "toggleTrackingSubMenu",
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-compose",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Track Anything",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href": "#/app/measurement-add-search",
                    "icon" : "ion-android-globe"
                },
                {
                    "title" : "Record a Meal",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href" : "#/app/measurement-add-search-category/Foods",
                    "icon" : "ion-ios-nutrition-outline"
                },
                {
                    "title" : "Rate an Emotion",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href" : "#/app/measurement-add-search-category/Emotions",
                    "icon" : "ion-happy-outline"
                },
                {
                    "title" : "Rate a Symptom",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href" : "#/app/measurement-add-search-category/Symptoms",
                    "icon" : "ion-ios-pulse"
                },
                {
                    "title" : "Record a Treatment",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href" : "#/app/measurement-add-search-category/Treatments",
                    "icon" : "ion-ios-medkit-outline"
                },
                {
                    "title" : "Record Activity",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href" : "#/app/measurement-add-search-category/Physical Activity",
                    "icon" : "ion-ios-body-outline"
                },
                {
                    "title" : "Record Vital Sign",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTrackingSubMenu",
                    "href" : "#/app/measurement-add-search-category/Vital Signs",
                    "icon" : "ion-ios-pulse"
                },
                {
                    "title" : "History",
                    "click" : "toggleHistorySubMenu",
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : quantimodoService.ionIcons.history,
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "All Measurements",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Anything",
                    "icon" : "ion-android-globe"
                },
                {
                    "title" : "Emotions",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Emotions",
                    "icon" : "ion-happy-outline"
                },
                {
                    "title" : "Foods",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Foods",
                    "icon" : "ion-ios-nutrition-outline"
                },
                {
                    "title" : "Symptoms",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Symptoms",
                    "icon" : "ion-sad-outline"
                },
                {
                    "title" : "Treatments",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href": "#/app/history-all/Treatments",
                    "icon" : "ion-ios-medkit-outline"
                },
                {
                    "title" : "Physical Activity",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Physical Activity",
                    "icon" : "ion-ios-body-outline"
                },
                {
                    "title" : "Vital Signs",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Vital Signs",
                    "icon" : "ion-ios-pulse"
                },
                {
                    "title" : "Locations",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showHistorySubMenu",
                    "href" : "#/app/history-all/Location",
                    "icon" : "ion-ios-location-outline"
                },
                menuItems.importData,
                {
                    "title" : "Charts",
                    "href" : "#/app/chart-search",
                    "icon" : "ion-arrow-graph-up-right"
                },
                {
                    "title" : "Relationships",
                    "click": "togglePredictorSearchSubMenu",
                    "showSubMenuVariable" : "showPredictorSearchSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-ios-analytics",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Predictor Search",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPredictorSearchSubMenu",
                    "href" : "#/app/predictor-search",
                    "icon" : "ion-log-in"
                },
                {
                    "title" : "Outcome Search",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPredictorSearchSubMenu",
                    "href" : "#/app/outcome-search",
                    "icon" : "ion-log-out"
                },
                {
                    "title" : "Positive Mood",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPredictorSearchSubMenu",
                    "href" : "#/app/predictors-positive",
                    "icon" : "ion-happy-outline"
                },
                {
                    "title" : "Negative Mood",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showPredictorSearchSubMenu",
                    "href" : "#/app/predictors-negative",
                    "icon" : "ion-sad-outline"
                },
                menuItems.settings,
                menuItems.helpAndFeedback
            ],
            minimal: [
                menuItems.inbox,
                menuItems.treatments,
                menuItems.symptoms,
                menuItems.vitalSigns,
                menuItems.emotions,
                menuItems.foods,
                menuItems.physicalActivity,
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
                menuItems.importData,
                {
                    title : 'Relationships',
                    click : 'togglePredictorSearchSubMenu',
                    showSubMenuVariable : 'showPredictorSearchSubMenu',
                    isSubMenuParent : true,
                    collapsedIcon : 'ion-ios-analytics',
                    expandedIcon : 'ion-chevron-down'
                },
                {
                    title : 'Predictor Search',
                    isSubMenuChild : true,
                    showSubMenuVariable : 'showPredictorSearchSubMenu',
                    href : '#/app/predictor-search',
                    icon : 'ion-log-in'
                },
                {
                    title : 'Outcome Search',
                    isSubMenuChild : true,
                    showSubMenuVariable : 'showPredictorSearchSubMenu',
                    href : '#/app/outcome-search',
                    icon : 'ion-log-out'
                },
                menuItems.settings,
            ],
            medication: [
                {
                    "title" : "Medications",
                    "click" : "toggleTreatmentsSubMenu",
                    "icon" : "ion-ios-pulse",
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-ios-medkit-outline",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Overdue",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "href" : "#/app/reminders-inbox/Treatments",
                    "icon" : "ion-clock"
                },
                {
                    "title" : "Today's Schedule",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "href" : "#/app/reminders-inbox-today/Treatments",
                    "icon" : "ion-android-sunny"
                },
                {
                    "title" : "Manage Scheduled",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "href": "#/app/manage-scheduled-meds",
                    "icon" : "ion-android-notifications-none"
                },
                {
                    "title" : "As-Needed Meds",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "href" : "#/app/as-needed-meds",
                    "icon" : "ion-ios-medkit-outline"
                },
                {
                    "title" : "Record a Dose",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "href" : "#/app/measurement-add-search-category/Treatments",
                    "icon" : "ion-edit"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showTreatmentsSubMenu",
                    "href": "#/app/history-all/Treatments",
                    "icon" : "ion-ios-paper-outline"
                },
                {
                    "title" : "Symptoms",
                    "click" : "toggleSymptomsSubMenu",
                    "icon" : "ion-ios-pulse",
                    "isSubMenuParent" : true,
                    "showSubMenuVariable" : "showSymptomsSubMenu",
                    "collapsedIcon" : "ion-sad-outline",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Manage Reminders",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showSymptomsSubMenu",
                    "href" : "#/app/reminders-manage/Symptoms",
                    "icon" : "ion-android-notifications-none"
                },
                {
                    "title" : "Rate Symptom",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showSymptomsSubMenu",
                    "href" : "#/app/measurement-add-search-category/Symptoms",
                    "icon" : "ion-edit"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showSymptomsSubMenu",
                    "href" : "#/app/history-all/Symptoms",
                    "icon" : "ion-ios-paper-outline"
                },
                {
                    "title" : "Vital Signs",
                    "click" : "toggleVitalSignsSubMenu",
                    "showSubMenuVariable" : "showVitalSignsSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-ios-pulse",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Manage Reminders",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showVitalSignsSubMenu",
                    "href" : "#/app/reminders-manage/Vital Signs",
                    "icon" : "ion-android-notifications-none"
                },
                {
                    "title" : "Record Now",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showVitalSignsSubMenu",
                    "href" : "#/app/measurement-add-search-category/Vital Signs",
                    "icon" : "ion-edit"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showVitalSignsSubMenu",
                    "href" : "#/app/history-all/Vital Signs",
                    "icon" : "ion-ios-paper-outline"
                },
                {
                    "title" : "Physical Activity",
                    "click" : "togglePhysicalActivitySubMenu",
                    "showSubMenuVariable": "showPhysicalActivitySubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-ios-body-outline",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Manage Reminders",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable": "showPhysicalActivitySubMenu",
                    "href" : "#/app/reminders-manage/Physical Activity",
                    "icon" : "ion-android-notifications-none"
                },
                {
                    "title" : "Record Activity",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable": "showPhysicalActivitySubMenu",
                    "href" : "#/app/measurement-add-search-category/Physical Activity",
                    "icon" : "ion-edit"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable": "showPhysicalActivitySubMenu",
                    "href" : "#/app/history-all/Physical Activity",
                    "icon" : "ion-ios-paper-outline"
                },
                {
                    "title" : "Emotions",
                    "click" : "toggleEmotionsSubMenu",
                    "showSubMenuVariable" : "showEmotionsSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-happy-outline",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Manage Reminders",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showEmotionsSubMenu",
                    "href" : "#/app/reminders-manage/Emotions",
                    "icon" : "ion-android-notifications-none"
                },
                {
                    "title" : "Record Rating",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showEmotionsSubMenu",
                    "href" : "#/app/measurement-add-search-category/Emotions",
                    "icon" : "ion-edit"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showEmotionsSubMenu",
                    "href" : "#/app/history-all/Emotions",
                    "icon" : "ion-ios-paper-outline"
                },
                {
                    "title" : "Diet",
                    "click" : "toggleDietSubMenu",
                    "showSubMenuVariable" : "showDietSubMenu",
                    "isSubMenuParent" : true,
                    "collapsedIcon" : "ion-ios-nutrition-outline",
                    "expandedIcon" : "ion-chevron-down"
                },
                {
                    "title" : "Manage Reminders",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showDietSubMenu",
                    "href": "#/app/reminders-manage/Foods",
                    "icon" : "ion-android-notifications-none"
                },
                {
                    "title" : "Record Meal",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showDietSubMenu",
                    "href" : "#/app/measurement-add-search-category/Foods",
                    "icon" : "ion-edit"
                },
                {
                    "title" : "History",
                    "isSubMenuChild" : true,
                    "showSubMenuVariable" : "showDietSubMenu",
                    "href" : "#/app/history-all/Foods",
                    "icon" : "ion-ios-paper-outline"
                },
                menuItems.favorites,
            ],
        };
        if(!menuType){menuType = 'extended';}
        return menus[menuType];
    };
    quantimodoService.getFloatingMaterialButton = function(){
        if(config.appSettings.floatingMaterialButton){return config.appSettings.floatingMaterialButton;}
        if(config.appSettings.appType === 'medication'){
            return {
                button1 : {
                    icon: quantimodoService.ionIcons.reminder,
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
            };
        }
        return {
            "button1" : {
                "icon": "ion-android-notifications-none",
                "label": "Add a Reminder",
                "stateAndParameters": "'app.reminderSearch'"
            },
            "button2" : {
                "icon": "ion-compose",
                "label": "Record a Measurement",
                "stateAndParameters": "'app.measurementAddSearch'"
            },
            "button3" : {
                "icon": "ion-ios-cloud-download-outline",
                "label": "Import Data",
                "stateAndParameters": "'app.import'"
            },
            "button4" : {
                "icon": "ion-ios-star",
                "label": "Go to your favorites",
                "stateAndParameters": "'app.favorites'"
            }
        };
    };
    quantimodoService.goToLoginIfNecessary = function(){
        if(!$rootScope.user){
            console.debug('Setting afterLoginGoToState to ' + $state.current.name);
            quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.onboarding');
            $state.go('app.login');
            return true;
        }
        return false;
    };
    quantimodoService.getPrimaryOutcomeVariable = function(){
        if(config.appSettings.primaryOutcomeVariableDetails){ return config.appSettings.primaryOutcomeVariableDetails;}
        var variables = {
            "Overall Mood" : {
                "id" : 1398,
                "name" : "Overall Mood",
                "variableName": "Overall Mood",
                variableCategoryName : "Mood",
                "unitAbbreviatedName" : "/5",
                "combinationOperation": "MEAN",
                "description": "positive",
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
    quantimodoService.ratingImages = {
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
    quantimodoService.addToFavoritesUsingVariableObject = function (variableObject) {
        var trackingReminder = {};
        trackingReminder.variableId = variableObject.id;
        trackingReminder.variableName = variableObject.name;
        trackingReminder.unitAbbreviatedName = variableObject.userVariableDefaultUnitAbbreviatedName;
        trackingReminder.variableDescription = variableObject.description;
        trackingReminder.variableCategoryName = variableObject.variableCategoryName;
        trackingReminder.reminderFrequency = 0;
        if($rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise){
            var message = 'Got deletion request before last reminder refresh completed';
            console.debug(message);
            $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise.reject();
            $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise = null;
        }
        if ((trackingReminder.unitAbbreviatedName !== '/5' && trackingReminder.variableName !== "Blood Pressure")) {
            $state.go('app.favoriteAdd', {variableObject: variableObject, fromState: $state.current.name, fromUrl: window.location.href, doneState: 'app.favorites'});
            return;
        }
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminders', trackingReminder)
            .then(function() {
                // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                $state.go('app.favorites', {trackingReminder: trackingReminder, fromState: $state.current.name, fromUrl: window.location.href});
                quantimodoService.syncTrackingReminders();
            });
    };
    quantimodoService.addToRemindersUsingVariableObject = function (variableObject, options) {
        var doneState = config.appSettings.defaultState;
        if(options.doneState){doneState = options.doneState;}
        if($rootScope.onboardingPages && $rootScope.onboardingPages[0] &&
            $rootScope.onboardingPages[0].id.toLowerCase().indexOf('reminder') !== -1){
            $rootScope.onboardingPages[0].title = $rootScope.onboardingPages[0].title.replace('Any', 'More');
            $rootScope.onboardingPages[0].addButtonText = "Add Another";
            $rootScope.onboardingPages[0].nextPageButtonText = "All Done";
            $rootScope.onboardingPages[0].bodyText = "Great job!  Now you'll be able to instantly record " +
                variableObject.name + " in the Reminder Inbox. <br><br>   Want to add any more " +
                variableObject.variableCategoryName.toLowerCase() + '?';
            quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify($rootScope.onboardingPages));
        }
        var trackingReminder = {};
        trackingReminder.variableId = variableObject.id;
        trackingReminder.variableName = variableObject.name;
        trackingReminder.unitAbbreviatedName = variableObject.userVariableDefaultUnitAbbreviatedName;
        trackingReminder.variableDescription = variableObject.description;
        trackingReminder.variableCategoryName = variableObject.variableCategoryName;
        trackingReminder.reminderFrequency = 86400;
        trackingReminder.reminderStartTime = quantimodoService.getUtcTimeStringFromLocalString("19:00:00");
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
            $state.go('app.reminderAdd', {variableObject: variableObject, doneState: doneState});
            return;
        }
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderSyncQueue', trackingReminder)
            .then(function() {
                // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                $state.go(doneState, {trackingReminder: trackingReminder, fromState: $state.current.name, fromUrl: window.location.href});
                quantimodoService.syncTrackingReminders();
            });
    };
    quantimodoService.getDefaultReminders = function(){
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
        trackingReminders = quantimodoService.filterByStringProperty(trackingReminders, 'variableCategoryName', variableCategoryName);
        if(!trackingReminders || !trackingReminders.length){return {};}
        for(var i = 0; i < trackingReminders.length; i++){
            trackingReminders[i].total = null;
            if(typeof trackingReminders[i].defaultValue === "undefined"){trackingReminders[i].defaultValue = null;}
        }
        trackingReminders = quantimodoService.attachVariableCategoryIcons(trackingReminders);
        var reminderTypesArray = {allTrackingReminders: trackingReminders};
        reminderTypesArray.favorites = trackingReminders.filter(function( trackingReminder ) {return trackingReminder.reminderFrequency === 0;});
        reminderTypesArray.trackingReminders = trackingReminders.filter(function( trackingReminder ) {
            return trackingReminder.reminderFrequency !== 0 && trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') === -1;
        });
        reminderTypesArray.archivedTrackingReminders = trackingReminders.filter(function( trackingReminder ) {
            return trackingReminder.reminderFrequency !== 0 && trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') !== -1;
        });
        return reminderTypesArray;
    }
    quantimodoService.getAllReminderTypes = function(variableCategoryName, type){
        var deferred = $q.defer();
        quantimodoService.getTrackingRemindersDeferred(variableCategoryName).then(function (trackingReminders) {
            var reminderTypesArray = processTrackingReminders(trackingReminders, variableCategoryName);
            if(type){deferred.resolve(reminderTypesArray[type]);} else {deferred.resolve(reminderTypesArray);}
        });
        return deferred.promise;
    };
    quantimodoService.convertTrackingReminderToVariableObject = function(trackingReminder){
        var variableObject = JSON.parse(JSON.stringify(trackingReminder));
        variableObject.id = trackingReminder.variableId;
        variableObject.name = trackingReminder.variableName;
        return variableObject;
    };
    quantimodoService.ionIcons = {
        history: 'ion-ios-list-outline',
        reminder: 'ion-android-notifications-none',
        recordMeasurement: 'ion-compose',
        charts: 'ion-arrow-graph-up-right',
        settings: 'ion-settings'
    };
    quantimodoService.actionSheetButtons = {
        history: { text: '<i class="icon ' + quantimodoService.ionIcons.history + '"></i>History'},
        analysisSettings: { text: '<i class="icon ' + quantimodoService.ionIcons.settings + '"></i>' + 'Analysis Settings'},
        recordMeasurement: { text: '<i class="icon ' + quantimodoService.ionIcons.recordMeasurement + '"></i>Record Measurement'},
        addReminder: { text: '<i class="icon ' + quantimodoService.ionIcons.reminder + '"></i>Add Reminder'},
        charts: { text: '<i class="icon ' + quantimodoService.ionIcons.charts + '"></i>Charts'}
    };
    quantimodoService.addImagePaths = function(object){
        if(object.variableCategoryName){
            var pathPrefix = 'img/variable_categories/' + object.variableCategoryName.toLowerCase().replace(' ', '-');
            if(!object.pngPath){object.pngPath = pathPrefix + '.png';}
            if(!object.svgPath){object.svgPath = pathPrefix + '.svg';}
        }
        return object;
    };
    quantimodoService.explanations = {
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
    quantimodoService.showMaterialAlert = function(title, textContent, ev){
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(title)
                .textContent(textContent)
                .ariaLabel(title)
                .ok('OK')
                .targetEvent(ev)
        );
    };
    quantimodoService.validationFailure = function (message, object) {
        quantimodoService.showMaterialAlert(message);
        console.error(message);
        if (typeof Bugsnag !== "undefined") {Bugsnag.notify(message, "measurement is " + JSON.stringify(object), {}, "error");}
    };
    quantimodoService.valueIsValid = function(object, value){
        var message;
        if($rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName] && typeof $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue !== "undefined" && $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue !== null) {
            if(value < $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue){
                message = $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].minimumValue + ' is the smallest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].name + ".  Please select another unit or value.";
                quantimodoService.validationFailure(message);
                return false;
            }
        }
        if($rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName] && typeof $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue !== "undefined" && $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue !== null) {
            if(value > $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue){
                message = $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].maximumValue + ' is the largest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[object.unitAbbreviatedName].name + ".  Please select another unit or value.";
                quantimodoService.validationFailure(message);
                return false;
            }
        }
        return true;
    };
    quantimodoService.getInputType = function(unitAbbreviatedName, variableDescription, variableName) {
        var inputType = 'value';
        if (variableName === 'Blood Pressure') {inputType = 'bloodPressure';}
        if (unitAbbreviatedName === '/5') {
            inputType = 'oneToFiveNumbers';
            variableDescription = (variableDescription ? variableDescription : null);
            if (variableDescription === 'positive') {inputType = 'happiestFaceIsFive';}
            if (variableDescription === 'negative') {inputType = 'saddestFaceIsFive';}
        }
        if (unitAbbreviatedName === 'yes/no') {inputType = 'yesOrNo';}
        return inputType;
    };
    return quantimodoService;
});
