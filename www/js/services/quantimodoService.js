angular.module('starter')
    // quantimodoService API implementation
    .factory('quantimodoService', function($http, $q, $rootScope, $ionicPopup, $state,
                                    localStorageService, bugsnagService, quantimodoService) {
        var quantimodoService = {};
        $rootScope.offlineConnectionErrorShowing = false; // to prevent more than one popup

        quantimodoService.successHandler = function(data, baseURL, status){
            var maxLength = 140;
            console.debug(status + ' response from ' + baseURL + ': ' +  JSON.stringify(data).substring(0, maxLength) + '...');
            if($rootScope.offlineConnectionErrorShowing){
                $rootScope.offlineConnectionErrorShowing = false;
            }
            if(!data.success){
                console.warn('No data.success in data response from ' + baseURL + ': ' +  JSON.stringify(data).substring(0, maxLength) + '...');
            }
            if(data.message){
                console.warn(data.message);
            }
            if(!$rootScope.user && baseURL.indexOf('user') === -1){
                quantimodoService.refreshUser();
            }
        };

        quantimodoService.errorHandler = function(data, status, headers, config, request, doNotSendToLogin){

            if(status === 302){
                console.warn('quantimodoService.errorHandler: Got 302 response from ' + JSON.stringify(request));
                return;
            }

            if(status === 401){
                if(doNotSendToLogin){
                    return;
                } else {
                    console.warn('quantimodoService.errorHandler: Sending to login because we got 401 with request ' +
                        JSON.stringify(request));
                    localStorageService.setItem('afterLoginGoTo', window.location.href);
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
            var groupingHash;
            if(!data){
                if (typeof Bugsnag !== "undefined") {
                    groupingHash = 'No data returned from this request';
                    Bugsnag.notify(groupingHash,
                        status + " response from url " + request.url,
                        {groupingHash: groupingHash},
                        "error");
                }
                if (!$rootScope.offlineConnectionErrorShowing) {
                    $rootScope.offlineConnectionErrorShowing = true;
                    if($rootScope.isIOS){
                        $ionicPopup.show({
                            title: 'NOT CONNECTED',
                            subTitle: 'Either you are not connected to the internet or the quantimodoService server cannot be reached.',
                            buttons:[
                                {text: 'OK',
                                    type: 'button-positive',
                                    onTap: function(){
                                        $rootScope.offlineConnectionErrorShowing = false;
                                    }
                                }
                            ]
                        });
                    }
                }
                return;
            }

            if (typeof Bugsnag !== "undefined") {
                groupingHash = request.url + ' error';
                if(data.error){
                    groupingHash = JSON.stringify(data.error);
                    if(data.error.message){
                        groupingHash = JSON.stringify(data.error.message);
                    }
                }
                Bugsnag.notify(groupingHash,
                    status + " response from " + request.url + '. DATA: ' + JSON.stringify(data),
                    {groupingHash: groupingHash},
                    "error");
            }
            console.error(status + " response from " + request.url + '. DATA: ' + JSON.stringify(data));

            if(data.success){
                console.error('Called error handler even though we have data.success');
            }
        };

        // Handler when request is failed
        var onRequestFailed = function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            console.error("Request error : " + error);
        };

        var canWeMakeRequestYet = function(type, baseURL, minimumSecondsBetweenRequests){
            if(!minimumSecondsBetweenRequests){
               return true;
            }
            var requestVariableName = 'last_' + type + '_' + baseURL.replace('/', '_') + '_request_at';
            if(!$rootScope[requestVariableName]){
                $rootScope[requestVariableName] = Math.floor(Date.now() / 1000);
                return true;
            }
            if($rootScope[requestVariableName] > Math.floor(Date.now() / 1000) - minimumSecondsBetweenRequests){
                console.debug('quantimodoService.get: Cannot make ' + type + ' request to ' + baseURL + " because " +
                    "we made the same request within the last " + minimumSecondsBetweenRequests + ' seconds');
                return false;
            }
            $rootScope[requestVariableName] = Math.floor(Date.now() / 1000);
            return true;
        };

        // GET method with the added token
        quantimodoService.get = function(baseURL, allowedParams, params, successHandler, errorHandler,
                                  minimumSecondsBetweenRequests, doNotSendToLogin){

            if(!canWeMakeRequestYet('GET', baseURL, minimumSecondsBetweenRequests)){
                return;
            }

            console.debug('quantimodoService.get: Going to try to make request to ' + baseURL + " with params: " + JSON.stringify(params));
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
                        } else {
                            console.warn("Not including parameter " + property + " in request because it is null or undefined");
                        }
                    }
                }
                urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent(config.appSettings.appName));
                urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent($rootScope.appVersion));
                urlParams.push(encodeURIComponent('client_id') + '=' + encodeURIComponent(quantimodoService.getClientId()));
                //We can't append access token to Ionic requests for some reason
                //urlParams.push(encodeURIComponent('access_token') + '=' + encodeURIComponent(tokenObject.accessToken));

                // configure request
                var url = quantimodoService.getQuantiModoUrl(baseURL);
                var request = {
                    method: 'GET',
                    url: (url + ((urlParams.length === 0) ? '' : urlParams.join('&'))),
                    responseType: 'json',
                    headers: {
                        'Content-Type': "application/json"
                    }
                };

                if (accessToken) {
                    request.headers = {
                        "Authorization": "Bearer " + accessToken,
                        'Content-Type': "application/json"
                    };
                }

                //console.debug("Making this request: " + JSON.stringify(request));
                console.debug('quantimodoService.get: ' + request.url);

                $http(request)
                    .success(function (data, status, headers, config) {
                        if(!data) {
                            if (typeof Bugsnag !== "undefined") {
                                var groupingHash = 'No data returned from this request';
                                Bugsnag.notify(groupingHash,
                                    status + " response from url " + request.url,
                                    {groupingHash: groupingHash},
                                    "error");
                            }
                        } else if (data.error) {
                            quantimodoService.errorHandler(data, status, headers, config, request, doNotSendToLogin);
                            errorHandler(data);
                        } else {
                            quantimodoService.successHandler(data, baseURL, status);
                            successHandler(data);
                        }
                    })
                    .error(function (data, status, headers, config) {
                        quantimodoService.errorHandler(data, status, headers, config, request, doNotSendToLogin);
                        errorHandler(data);
                    }, onRequestFailed);
                });
            };

        // POST method with the added token
        quantimodoService.post = function(baseURL, requiredFields, items, successHandler, errorHandler,
                                   minimumSecondsBetweenRequests, doNotSendToLogin){

            if(!canWeMakeRequestYet('POST', baseURL, minimumSecondsBetweenRequests)){
                return;
            }

            if($rootScope.offlineConnectionErrorShowing){
                $rootScope.offlineConnectionErrorShowing = false;
            }

            console.debug('quantimodoService.post: About to try to post request to ' + baseURL + ' with body: ' + JSON.stringify(items));
            quantimodoService.getAccessTokenFromAnySource().then(function(accessToken){

                //console.debug("Token : ", token.accessToken);
                // configure params
                for (var i = 0; i < items.length; i++)
                {
                    var item = items[i];
                    for (var j = 0; j < requiredFields.length; j++) {
                        if (!(requiredFields[j] in item)) {
                            bugsnagService.reportError('Missing required field ' + requiredFields[j] + ' in ' +
                                baseURL + ' request!');
                            //throw 'missing required field in POST data; required fields: ' + requiredFields.toString();
                        }
                    }
                }
                var urlParams = [];
                urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent(config.appSettings.appName));
                urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent($rootScope.appVersion));
                items.clientId = quantimodoService.getClientId();

                var url = quantimodoService.getQuantiModoUrl(baseURL) + ((urlParams.length === 0) ? '' : urlParams.join('&'));

                // configure request
                var request = {
                    method : 'POST',
                    url: url,
                    responseType: 'json',
                    headers : {
                        'Content-Type': "application/json"
                    },
                    data : JSON.stringify(items)
                };

                if(quantimodoService.getClientId() !== 'oAuthDisabled' || $rootScope.accessTokenInUrl) {
                    request.headers = {
                        "Authorization" : "Bearer " + accessToken,
                        'Content-Type': "application/json"
                    };
                }

                /*   Commented because of CORS errors
                if($rootScope.user){
                    if($rootScope.user.trackLocation){
                        request.headers.LOCATION = $rootScope.lastLocationNameAndAddress;
                        request.headers.LATITUDE = $rootScope.lastLatitude;
                        request.headers.LONGITUDE = $rootScope.lastLongitude;
                    }
                }
                */

                $http(request).success(successHandler).error(function(data, status, headers, config){
                    quantimodoService.errorHandler(data, status, headers, config, request, doNotSendToLogin);
                    errorHandler(data);
                });

            }, errorHandler);
        };

        // get Measurements for user
        var getMeasurements = function(params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            quantimodoService.get('api/measurements',
                ['variableName', 'sort', 'startTimeEpoch', 'endTime', 'groupingWidth', 'groupingTimezone', 'source', 'unit','limit','offset','lastUpdated'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        quantimodoService.getMeasurementsLooping = function(params){
            var defer = $q.defer();
            var response_array = [];
            var errorCallback = function(){
                defer.resolve(response_array);
            };

            var successCallback =  function(response){
                // Get a maximum of 2000 measurements to avoid exceeding localstorage quota
                if (response.length === 0 || typeof response === "string" || params.offset >= 2000) {
                    defer.resolve(response_array);
                } else {
                    localStorageService.getItem('user', function(user){
                        if(!user){
                            defer.reject('No user in local storage!');
                        } else {
                            response_array = response_array.concat(response);
                            params.offset+=200;
                            params.limit = 200;
                            defer.notify(response);
                            getMeasurements(params,successCallback,errorCallback);
                        }
                    });


                }
            };

            getMeasurements(params,successCallback,errorCallback);

            return defer.promise;
        };

        quantimodoService.getV1Measurements = function(params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            quantimodoService.get('api/v1/measurements',
                ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        quantimodoService.getV1MeasurementsDaily = function(params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            quantimodoService.get('api/v1/measurements/daily',
                ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        quantimodoService.deleteV1Measurements = function(measurements, successHandler, errorHandler){
            quantimodoService.post('api/v1/measurements/delete',
                ['variableId', 'variableName', 'startTimeEpoch', 'id'],
                measurements,
                successHandler,
                errorHandler);
        };

        // Request measurements to be emailed as a csv
        quantimodoService.postMeasurementsCsvExport = function() {
            quantimodoService.post('api/v2/measurements/request_csv',
                [],
                [],
                quantimodoService.successHandler,
                quantimodoService.errorHandler);
        };

        // Request measurements to be emailed as a xls
        quantimodoService.postMeasurementsXlsExport = function() {
            quantimodoService.post('api/v2/measurements/request_xls',
                [],
                [],
                quantimodoService.successHandler,
                quantimodoService.errorHandler);
        };

        // Request measurements to be emailed as a pdf
        quantimodoService.postMeasurementsPdfExport = function() {
            quantimodoService.post('api/v2/measurements/request_pdf',
                [],
                [],
                quantimodoService.successHandler,
                quantimodoService.errorHandler);
        };

        // post new Measurements for user
        quantimodoService.postMeasurementsV2 = function(measurementSet, successHandler, errorHandler){
            if(!measurementSet[0].measurements && !measurementSet[0].value){
                console.error("No measurementSet.measurements provided to quantimodoService.postMeasurementsV2");
            } else {
                quantimodoService.post('api/measurements/v2',
                    //['measurements', 'variableName', 'source', 'variableCategoryName', 'abbreviatedUnitName'],
                    [],
                    measurementSet,
                    successHandler,
                    errorHandler);
            }
        };

        quantimodoService.logoutOfApi = function(successHandler, errorHandler){
            //TODO: Fix this
            console.debug('Logging out of api does not work yet.  Fix it!');
            quantimodoService.get('api/v2/auth/logout',
                [],
                {},
                successHandler,
                errorHandler);
        };


        quantimodoService.getAggregatedCorrelationsFromApi = function(params, successHandler, errorHandler){
            quantimodoService.get('api/v1/aggregatedCorrelations',
                ['correlationCoefficient', 'causeVariableName', 'effectVariableName'],
                params,
                successHandler,
                errorHandler);
        };


        quantimodoService.getUserCorrelationsFromApi = function (params, successHandler, errorHandler) {
            quantimodoService.get('api/v1/correlations',
                ['correlationCoefficient', 'causeVariableName', 'effectVariableName'],
                params,
                successHandler,
                errorHandler
            );
        };

        // post new correlation for user
        quantimodoService.postCorrelation = function(correlationSet, successHandler ,errorHandler){
            quantimodoService.post('api/v1/correlations',
                ['causeVariableName', 'effectVariableName', 'correlation', 'vote'],
                correlationSet,
                successHandler,
                errorHandler);
        };

        // post a vote
        quantimodoService.postVoteToApi = function(correlationSet, successHandler ,errorHandler){
            quantimodoService.post('api/v1/votes',
                ['causeVariableName', 'effectVariableName', 'correlation', 'vote'],
                correlationSet,
                successHandler,
                errorHandler);
        };

        // delete a vote
        quantimodoService.deleteVoteToApi = function(correlationSet, successHandler ,errorHandler){
            quantimodoService.post('api/v1/votes/delete',
                ['causeVariableName', 'effectVariableName', 'correlation'],
                correlationSet,
                successHandler,
                errorHandler);
        };

        // search for user variables
        quantimodoService.searchUserVariables = function(query, params, successHandler, errorHandler){
            quantimodoService.get('api/v1/variables/search/' + encodeURIComponent(query),
                ['limit','includePublic', 'manualTracking'],
                params,
                successHandler,
                errorHandler);
        };

        quantimodoService.getVariablesByName = function(variableName, params, successHandler, errorHandler){
            quantimodoService.get('api/v1/variables/' + encodeURIComponent(variableName),
                [],
                params,
                successHandler,
                errorHandler);
        };

        quantimodoService.getPublicVariablesByName = function(variableName, successHandler, errorHandler){
            quantimodoService.get('api/v1/public/variables',
                ['name'],
                {name: variableName},
                successHandler,
                errorHandler);
        };

        quantimodoService.getVariableById = function(variableId, successHandler, errorHandler){
            quantimodoService.get('api/v1/variables' ,
                ['id'],
                {id: variableId},
                successHandler,
                errorHandler);
        };


        // get user variables
        quantimodoService.getUserVariables = function(params, successHandler, errorHandler){

            if(!params){
                params = {};
            }

            if(!params.limit){
                params.limit = 200;
            }

            if(params.variableCategoryName && params.variableCategoryName === 'Anything'){
                params.variableCategoryName = null;
            }

            quantimodoService.get('api/v1/variables',
                ['variableCategoryName', 'limit'],
                params,
                successHandler,
                errorHandler);
        };

        // post changes to user variable
        quantimodoService.postUserVariable = function(userVariable, successHandler, errorHandler) {
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
                ],
                userVariable,
                successHandler,
                errorHandler);
        };

        quantimodoService.resetUserVariable = function(body, successHandler, errorHandler) {
            quantimodoService.post('api/v1/userVariables/reset',
                [
                    'variableId'
                ],
                body,
                successHandler,
                errorHandler);
        };

        // deletes all of a user's measurements for a variable
        quantimodoService.deleteUserVariableMeasurements = function(variableId, successHandler, errorHandler) {
            localStorageService.deleteElementOfItemByProperty('userVariables', 'variableId', variableId);
            localStorageService.deleteElementOfItemById('commonVariables', variableId);
            quantimodoService.post('api/v1/userVariables/delete',
            [
                'variableId'
            ],
            {variableId: variableId},
            successHandler,
            errorHandler);
        };

        // get variable categories
        quantimodoService.getVariableCategoriesFromApi = function(successHandler, errorHandler){
            quantimodoService.get('api/variableCategories',
                [],
                {},
                successHandler,
                errorHandler);
        };

        // get units
        quantimodoService.getUnitsFromApi = function(successHandler, errorHandler){
            quantimodoService.get('api/units',
                [],
                {},
                successHandler,
                errorHandler);
        };

        // get units
        quantimodoService.getConnectorsFromApi = function(successHandler, errorHandler){
            quantimodoService.get('api/connectors/list',
                [],
                {},
                successHandler,
                errorHandler);
        };

        // get units
        quantimodoService.disconnectConnectorToApi = function(name, successHandler, errorHandler){
            quantimodoService.get('api/v1/connectors/' + name + '/disconnect',
                [],
                {},
                successHandler,
                errorHandler);
        };


        quantimodoService.connectConnectorWithParamsToApi = function(params, lowercaseConnectorName, successHandler, errorHandler){
            var allowedParams = [
                'location',
                'username',
                'password',
                'email'
            ];

            quantimodoService.get('api/v1/connectors/' + lowercaseConnectorName + '/connect',
                allowedParams,
                params,
                successHandler,
                errorHandler);
        };


        quantimodoService.connectConnectorWithTokenToApi = function(body, lowercaseConnectorName, successHandler, errorHandler){
            var requiredProperties = [
                'connector',
                'connectorCredentials'
            ];

            quantimodoService.post('api/v1/connectors/connect',
                requiredProperties,
                body,
                successHandler,
                errorHandler);
        };

        quantimodoService.connectWithAuthCodeToApi = function(code, connectorLowercaseName, successHandler, errorHandler){
            var allowedParams = [
                'code',
                'noRedirect'
            ];
            var params = {
                noRedirect: true,
                code: code
            };

            quantimodoService.get('api/v1/connectors/' + connectorLowercaseName + '/connect',
                allowedParams,
                params,
                successHandler,
                errorHandler);
        };

        // get user data
        quantimodoService.getUserFromApi = function(successHandler, errorHandler){
            if($rootScope.user){
                console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);
            }
            var minimumSecondsBetweenRequests = 10;
            var doNotSendToLogin = true;
            quantimodoService.get('api/user/me',
                [],
                {},
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests,
                doNotSendToLogin
            );
        };

        // get user data
        quantimodoService.getUserEmailPreferences = function(params, successHandler, errorHandler){
            if($rootScope.user){
                console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);
            }
            var minimumSecondsBetweenRequests = 10;
            var doNotSendToLogin = true;
            quantimodoService.get('api/v1/notificationPreferences',
                ['userEmail'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests,
                doNotSendToLogin
            );
        };

        // get pending reminders
        quantimodoService.getTrackingReminderNotifications = function(params, successHandler, errorHandler){
            quantimodoService.get('api/v1/trackingReminderNotifications',
                ['variableCategoryName', 'reminderTime', 'sort', 'reminderFrequency'],
                params,
                successHandler,
                errorHandler);
        };

        quantimodoService.postTrackingReminderNotifications = function(trackingReminderNotificationsArray, successHandler, errorHandler) {
            if(!trackingReminderNotificationsArray){
                successHandler();
                return;
            }
            if(trackingReminderNotificationsArray.constructor !== Array){
                trackingReminderNotificationsArray = [trackingReminderNotificationsArray];
            }

            quantimodoService.post('api/v1/trackingReminderNotifications',
                [],
                trackingReminderNotificationsArray,
                successHandler,
                errorHandler);
        };

        // get reminders
        quantimodoService.getTrackingReminders = function(params, successHandler, errorHandler){
            quantimodoService.get('api/v1/trackingReminders',
                ['variableCategoryName', 'id'],
                params,
                successHandler,
                errorHandler);
        };

        // get reminders
        quantimodoService.getStudy = function(params, successHandler, errorHandler){
            quantimodoService.get('api/v1/study',
                [],
                params,
                successHandler,
                errorHandler);
        };

        quantimodoService.getStudyDeferred = function(params, successHandler, errorHandler) {
            var deferred = $q.defer();
            quantimodoService.postStudy(params, function(){
                deferred.resolve();
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        quantimodoService.postUserSettings = function(params, successHandler, errorHandler) {
            quantimodoService.post('api/v1/userSettings',
                [],
                params,
                successHandler,
                errorHandler);
        };

        // post tracking reminder
        quantimodoService.postTrackingReminders = function(trackingRemindersArray, successHandler, errorHandler) {
            if(trackingRemindersArray.constructor !== Array){
                trackingRemindersArray = [trackingRemindersArray];
            }
            var d = new Date();
            for(var i = 0; i < trackingRemindersArray.length; i++){
                trackingRemindersArray[i].timeZoneOffset = d.getTimezoneOffset();
            }

            quantimodoService.post('api/v1/trackingReminders',
                [],
                trackingRemindersArray,
                successHandler,
                errorHandler);
        };

        quantimodoService.postStudy = function(body, successHandler, errorHandler){
            quantimodoService.post('api/v1/study',
                [],
                body,
                successHandler,
                errorHandler);
        };

        quantimodoService.postStudyDeferred = function(body, successHandler, errorHandler) {
            var deferred = $q.defer();
            quantimodoService.postStudy(body, function(){
                deferred.resolve();
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        quantimodoService.postUserTagDeferred = function(tagData, successHandler, errorHandler) {
            var deferred = $q.defer();
            quantimodoService.postUserTag(tagData, function(){
                deferred.resolve();
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        // post tracking reminder
        quantimodoService.postUserTag = function(userTagData, successHandler, errorHandler) {
            if(userTagData.constructor !== Array){
                userTagData = [userTagData];
            }

            quantimodoService.post('api/v1/userTags',
                [],
                userTagData,
                successHandler,
                errorHandler);
        };

        quantimodoService.deleteUserTagDeferred = function(tagData, successHandler, errorHandler) {
            var deferred = $q.defer();
            quantimodoService.deleteUserTag(tagData, function(){
                deferred.resolve();
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        // delete tracking reminder
        quantimodoService.deleteUserTag = function(userTagData, successHandler, errorHandler) {
            quantimodoService.post('api/v1/userTags/delete',
                [],
                userTagData,
                successHandler,
                errorHandler);
        };

        quantimodoService.getUserTagsDeferred = function(variableCategoryName) {
            var deferred = $q.defer();
            quantimodoService.getUserTags.then(function (userTags) {
                deferred.resolve(userTags);
            });

            return deferred.promise;
        };

        // get reminders
        quantimodoService.getUserTags = function(params, successHandler, errorHandler){
            quantimodoService.get('api/v1/userTags',
                ['variableCategoryName', 'id'],
                params,
                successHandler,
                errorHandler);
        };

        quantimodoService.updateUserTimeZoneIfNecessary = function () {
            var d = new Date();
            var timeZoneOffsetInMinutes = d.getTimezoneOffset();
            if($rootScope.user && $rootScope.user.timeZoneOffset !== timeZoneOffsetInMinutes ){
                var params = {
                    timeZoneOffset: timeZoneOffsetInMinutes
                };
                quantimodoService.updateUserSettingsDeferred(params);
            }
        };

        quantimodoService.postDeviceToken = function(deviceToken, successHandler, errorHandler) {
            var platform;
            if($rootScope.isAndroid){
                platform = 'android';
            }
            if($rootScope.isIOS){
                platform = 'ios';
            }
            if($rootScope.isWindows){
                platform = 'windows';
            }
            var params = {
                platform: platform,
                deviceToken: deviceToken
            };
            quantimodoService.post('api/v1/deviceTokens',
                [
                    'deviceToken',
                    'platform'
                ],
                params,
                successHandler,
                errorHandler);
        };

        quantimodoService.deleteDeviceToken = function(deviceToken, successHandler, errorHandler) {
            var deferred = $q.defer();
            if(!deviceToken){
                deferred.reject('No deviceToken provided to quantimodoService.deleteDeviceToken');
            } else {
                var params = {
                    deviceToken: deviceToken
                };
                quantimodoService.post('api/v1/deviceTokens/delete',
                    [
                        'deviceToken'
                    ],
                    params,
                    successHandler,
                    errorHandler);
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
            if(!params){
                params = [];
            }
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

        quantimodoService.getAccessTokenFromUrlParameter = function () {
            $rootScope.accessTokenInUrl = quantimodoService.getUrlParameter(location.href, 'accessToken');
            if (!$rootScope.accessTokenInUrl) {
                $rootScope.accessTokenInUrl = quantimodoService.getUrlParameter(location.href, 'access_token');
            }
            if($rootScope.accessTokenInUrl){
                localStorageService.setItem('accessTokenInUrl', $rootScope.accessTokenInUrl);
                localStorageService.setItem('accessToken', $rootScope.accessTokenInUrl);
                localStorage.accessToken = $rootScope.accessTokenInUrl;  // This is for Chrome extension
                $rootScope.accessToken = $rootScope.accessTokenInUrl;
            } else {
                localStorageService.deleteItem('accessTokenInUrl');
            }

            return $rootScope.accessTokenInUrl;
        };

        // if not logged in, returns rejects
        quantimodoService.getAccessTokenFromAnySource = function () {

            var deferred = $q.defer();

            if(!$rootScope.accessTokenInUrl){
                $rootScope.accessTokenInUrl = quantimodoService.getAccessTokenFromUrlParameter();
            }

            if($rootScope.accessTokenInUrl){
                deferred.resolve($rootScope.accessTokenInUrl);
                return deferred.promise;
            }

            var now = new Date().getTime();
            var expiresAtMilliseconds = localStorageService.getItemSync('expiresAtMilliseconds');
            var refreshToken = localStorageService.getItemSync('refreshToken');
            var accessToken = localStorageService.getItemSync('accessToken');

            console.debug('quantimodoService.getOrRefreshAccessTokenOrLogin: Values from local storage:', JSON.stringify({
                expiresAtMilliseconds: expiresAtMilliseconds,
                refreshToken: refreshToken,
                accessToken: accessToken
            }));

            if(refreshToken && !expiresAtMilliseconds){
                var errorMessage = 'We have a refresh token but expiresAtMilliseconds is ' + expiresAtMilliseconds +
                    '.  How did this happen?';
                Bugsnag.notify(errorMessage,
                    localStorageService.getItemSync('user'),
                    {groupingHash: errorMessage},
                    "error");
            }

            if (accessToken && now < expiresAtMilliseconds) {
                console.debug('quantimodoService.getOrRefreshAccessTokenOrLogin: Current access token should not be expired. Resolving token using one from local storage');
                deferred.resolve(accessToken);
            } else if (refreshToken && expiresAtMilliseconds && quantimodoService.getClientId() !== 'oAuthDisabled') {
                console.debug(now + ' (now) is greater than expiresAt ' + expiresAtMilliseconds);
                quantimodoService.refreshAccessToken(refreshToken, deferred);
            } else if(quantimodoService.getClientId() === 'oAuthDisabled') {
                    //console.debug('getAccessTokenFromAnySource: oAuthDisabled so we do not need an access token');
                    deferred.resolve();
                    return deferred.promise;
            } else {
                console.warn('Could not get or refresh access token');
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
                localStorageService.setItem('accessToken', accessToken);
                localStorage.accessToken = accessToken;   // This is for Chrome extension
            } else {
                console.error('No access token provided to quantimodoService.saveAccessTokenInLocalStorage');
                return;
            }

            var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;
            if (refreshToken) {
                localStorageService.setItem('refreshToken', refreshToken);
            }

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
                localStorageService.setItem('expiresAtMilliseconds', expiresAtMilliseconds - bufferInMilliseconds);
                return accessToken;
            } else {
                console.error('No expiresAtMilliseconds!');
                Bugsnag.notify('No expiresAtMilliseconds!',
                    'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + localStorageService.getItemSync('user'),
                    {groupingHash: 'No expiresAtMilliseconds!'},
                    "error");
            }

            var groupingHash = 'Access token expiresAt not provided in recognizable form!';
            console.error(groupingHash);
            Bugsnag.notify(groupingHash,
                'expiresAt is ' + expiresAt + ' || accessResponse is ' + JSON.stringify(accessResponse) + ' and user is ' + localStorageService.getItemSync('user'),
                {groupingHash: groupingHash},
                "error");
        };

        quantimodoService.convertToObjectIfJsonString = function (stringOrObject) {
            try {
                stringOrObject = JSON.parse(stringOrObject);
            } catch (exception) {
                return stringOrObject;
            }
            return stringOrObject;
        };

        quantimodoService.generateV1OAuthUrl= function(register) {
            var url = $rootScope.qmApiUrl + "/api/oauth2/authorize?";
            // add params
            url += "response_type=code";
            url += "&client_id=" + quantimodoService.getClientId();
            url += "&client_secret=" + quantimodoService.getClientSecret();
            url += "&scope=" + quantimodoService.getPermissionString();
            url += "&state=testabcd";
            if(register === true){
                url += "&register=true";
            }
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
            url += "&token=" + JWTToken;
            //url += "&redirect_uri=" + quantimodoService.getRedirectUri();
            return url;
        };

        quantimodoService.getAuthorizationCodeFromUrl = function(event) {
            console.debug('extracting authorization code from event: ' + JSON.stringify(event));
            var authorizationUrl = event.url;
            if(!authorizationUrl) {
                authorizationUrl = event.data;
            }

            var authorizationCode = quantimodoService.getUrlParameter(authorizationUrl, 'code');

            if(!authorizationCode) {
                authorizationCode = quantimodoService.getUrlParameter(authorizationUrl, 'token');
            }
            return authorizationCode;
        };

        // get access token from authorization code
        quantimodoService.getAccessTokenFromAuthorizationCode= function (authorizationCode) {
            console.debug("Authorization code is " + authorizationCode);

            var deferred = $q.defer();

            var url = quantimodoService.getQuantiModoUrl("api/oauth2/token");

            // make request
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
                    bugsnagService.reportError(response);
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

        quantimodoService.getTokensAndUserViaNativeSocialLogin = function (provider, accessToken) {
            var deferred = $q.defer();

            if(!accessToken || accessToken === "null"){
                bugsnagService.reportError("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
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
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.data.success && response.data.data && response.data.data.token) {

                    // This didn't solve the token_invalid issue
                    // $timeout(function () {
                    //     console.debug('10 second delay to try to solve token_invalid issue');
                    //  deferred.resolve(response.data.data.token);
                    // }, 10000);

                    deferred.resolve(response.data.data);
                } else {
                    deferred.reject(response);
                }
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
                localStorageService.deleteItem('deviceTokenToSync');
                localStorageService.setItem('deviceTokenOnServer', deviceToken);
                console.debug(response);
                deferred.resolve();
            }, function(error){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                }
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.setUserInLocalStorageBugsnagIntercomPush = function(user){
            localStorageService.setItem('user', JSON.stringify(user));
            localStorage.user = JSON.stringify(user); // For Chrome Extension
            quantimodoService.saveAccessTokenInLocalStorage(user);
            $rootScope.user = user;
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.metaData = {
                    user: {
                        name: user.displayName,
                        email: user.email
                    }
                };
            }

            var date = new Date(user.userRegistered);
            var userRegistered = date.getTime()/1000;

            if (typeof UserVoice !== "undefined") {
                UserVoice.push(['identify', {
                    email: user.email, // User’s email address
                    name: user.displayName, // User’s real name
                    created_at: userRegistered, // Unix timestamp for the date the user signed up
                    id: user.id, // Optional: Unique id of the user (if set, this should not change)
                    type: config.appSettings.appName + ' for ' + $rootScope.currentPlatform + ' User (Subscribed: ' + user.subscribed + ')', // Optional: segment your users by type
                    account: {
                        //id: 123, // Optional: associate multiple users with a single account
                        name: config.appSettings.appName + ' for ' + $rootScope.currentPlatform + ' v' + $rootScope.appVersion, // Account name
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
                app_name: config.appSettings.appName,
                app_version: $rootScope.appVersion,
                platform: $rootScope.currentPlatform,
                platform_version: $rootScope.currentPlatformVersion
            };
            */

            var deviceTokenOnServer = localStorageService.getItemSync('deviceTokenOnServer');
            var deviceTokenToSync = localStorageService.getItemSync('deviceTokenToSync');
            if(deviceTokenOnServer){
                console.debug("This token is already on the server: " + deviceTokenOnServer);
            }
            if (deviceTokenToSync){
                quantimodoService.registerDeviceToken(deviceTokenToSync);
            }
            if($rootScope.sendReminderNotificationEmails){
                quantimodoService.updateUserSettingsDeferred({sendReminderNotificationEmails: $rootScope.sendReminderNotificationEmails});
                $rootScope.sendReminderNotificationEmails = null;
            }
            var afterLoginGoTo = localStorageService.getItemSync('afterLoginGoTo');
            console.debug("afterLoginGoTo from localstorage is  " + afterLoginGoTo);
            if(afterLoginGoTo) {
                localStorageService.deleteItem('afterLoginGoTo');
                window.location.replace(afterLoginGoTo);
            } else {
                //$state.go(config.appSettings.defaultState);
            }
        };

        quantimodoService.refreshUser = function(){
            var deferred = $q.defer();
            quantimodoService.getUserFromApi(function(user){
                quantimodoService.setUserInLocalStorageBugsnagIntercomPush(user);
                deferred.resolve(user);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.sendToNonOAuthBrowserLoginUrl = function(register) {
            var loginUrl = quantimodoService.getQuantiModoUrl("api/v2/auth/login");
            if (register === true) {
                loginUrl = quantimodoService.getQuantiModoUrl("api/v2/auth/register");
            }
            console.debug("sendToNonOAuthBrowserLoginUrl: Client id is oAuthDisabled - will redirect to regular login.");
            var afterLoginGoTo = localStorageService.getItemSync('afterLoginGoTo');
            console.debug("afterLoginGoTo from localstorage is  " + afterLoginGoTo);
            if(afterLoginGoTo) {
                localStorageService.deleteItem('afterLoginGoTo');
                loginUrl += "redirect_uri=" + encodeURIComponent(afterLoginGoTo);
            } else {
                loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href.replace('app/login','app/reminders-inbox'));
            }
            console.debug('sendToNonOAuthBrowserLoginUrl: AUTH redirect URL created:', loginUrl);
            var apiUrlMatchesHostName = $rootScope.qmApiUrl.indexOf(window.location.hostname);
            if(apiUrlMatchesHostName > -1 || $rootScope.isChromeExtension) {
                window.location.replace(loginUrl);
            } else {
                alert("API url doesn't match auth base url.  Please make use the same domain in config file");
            }
        };

        quantimodoService.refreshUserEmailPreferences = function(params){
            var deferred = $q.defer();
            quantimodoService.getUserEmailPreferences(params, function(user){
                quantimodoService.setUserInLocalStorageBugsnagIntercomPush(user);
                deferred.resolve(user);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.clearTokensFromLocalStorage = function(){
            localStorageService.deleteItem('accessToken');
            localStorageService.deleteItem('refreshToken');
            localStorageService.deleteItem('expiresAtMilliseconds');
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
            }, function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        quantimodoService.getFavoriteTrackingRemindersFromLocalStorage = function(variableCategoryName){
            console.debug('Getting favorites from local storage');
            $rootScope.favoritesArray = [];
            var favorites = localStorageService.getElementsFromItemWithFilters('trackingReminders', 'reminderFrequency', 0);
            if(!favorites){
                return false;
            }
            for(i = 0; i < favorites.length; i++){
                if(variableCategoryName && variableCategoryName !== 'Anything'){
                    if(variableCategoryName === favorites[i].variableCategoryName){
                        $rootScope.favoritesArray.push(favorites[i]);
                    }
                } else {
                    $rootScope.favoritesArray.push(favorites[i]);
                }
            }
            $rootScope.favoritesArray = quantimodoService.attachVariableCategoryIcons($rootScope.favoritesArray);
            var i;
            for(i = 0; i < $rootScope.favoritesArray.length; i++){
                $rootScope.favoritesArray[i].total = null;
                if($rootScope.favoritesArray[i].variableName.toLowerCase().indexOf('blood pressure') > -1){
                    $rootScope.bloodPressureReminderId = $rootScope.favoritesArray[i].id;
                    $rootScope.favoritesArray[i].hide = true;
                }
                if(typeof $rootScope.favoritesArray[i].defaultValue === "undefined"){
                    $rootScope.favoritesArray[i].defaultValue = null;
                }
            }

            var difference;
            $rootScope.favoritesArray.sort(function(a, b) {
                difference = b.numberOfRawMeasurements - a.numberOfRawMeasurements;
                //console.debug(difference);
                return difference;
            });
        };

        quantimodoService.attachVariableCategoryIcons = function(dataArray){
            if(!dataArray){
                return;
            }
            var variableCategoryInfo;
            for(var i = 0; i < dataArray.length; i++){
                variableCategoryInfo = quantimodoService.getVariableCategoryInfo(dataArray[i].variableCategoryName);
                if(variableCategoryInfo.icon){
                    if(!dataArray[i].icon){
                        dataArray[i].icon = variableCategoryInfo.icon;
                    }
                } else {
                    console.warn('Could not find icon for variableCategoryName ' + dataArray[i].variableCategoryName);
                    return 'ion-speedometer';
                }
            }
            return dataArray;
        };

        quantimodoService.getVariableCategoryInfo = function (variableCategoryName) {

            var variableCategoryInfo =
            {
                "Anything": {
                    defaultAbbreviatedUnitName: '',
                    helpText: "What do you want to record?",
                    variableCategoryNameSingular: "anything",
                    defaultValuePlaceholderText : "Enter most common value here...",
                    defaultValueLabel : 'Value',
                    addNewVariableCardText : 'Add a new variable',
                    variableCategoryName : '',
                    defaultValue : '',
                    measurementSynonymSingularLowercase : "measurement",
                    icon: "ion-speedometer"
                },
                "Activity": {
                    defaultAbbreviatedUnitName: 'min',
                    helpText: "What activity do you want to record?",
                    variableCategoryName: "Activity",
                    variableCategoryNameSingular: "Activity",
                    measurementSynonymSingularLowercase : "activity",
                    icon: "ion-ios-body"
                },
                "Emotions": {
                    defaultAbbreviatedUnitName: "/5",
                    helpText: "What emotion do you want to rate?",
                    variableCategoryName: "Emotions",
                    variableCategoryNameSingular: "Emotion",
                    measurementSynonymSingularLowercase : "rating",
                    icon: "ion-happy-outline"
                },
                "Environment": {
                    defaultAbbreviatedUnitName: '',
                    helpText: "What environmental variable do you want to record?",
                    variableCategoryName: "Environment",
                    variableCategoryNameSingular: "Environment",
                    measurementSynonymSingularLowercase : "environmental measurement",
                    icon: "ion-ios-partlysunny-outline"
                },
                "Foods" : {
                    defaultAbbreviatedUnitName: "serving",
                    helpText: "What did you eat?",
                    variableCategoryName: "Foods",
                    variableCategoryNameSingular: "Food",
                    measurementSynonymSingularLowercase : "meal",
                    icon: "ion-fork"
                },
                "Location" : {
                    defaultAbbreviatedUnitName: "min",
                    helpText: "What location do you want to record?",
                    variableCategoryName: "Location",
                    variableCategoryNameSingular: "Location",
                    measurementSynonymSingularLowercase : "location",
                    icon: "ion-ios-location"
                },
                "Music" : {
                    defaultAbbreviatedUnitName: "count",
                    helpText: "What music did you listen to?",
                    variableCategoryName: "Music",
                    variableCategoryNameSingular: "Music",
                    measurementSynonymSingularLowercase : "music",
                    icon: "ion-music-note"
                },
                "Nutrients" : {
                    defaultAbbreviatedUnitName: "g",
                    helpText: "What nutrient do you want to track?",
                    variableCategoryName: "Nutrients",
                    variableCategoryNameSingular: "Nutrient",
                    measurementSynonymSingularLowercase : "nutrient",
                    icon: "ion-fork"
                },
                "Payments" : {
                    defaultAbbreviatedUnitName: "$",
                    helpText: "What did you pay for?",
                    variableCategoryName: "Payments",
                    variableCategoryNameSingular: "Payment",
                    measurementSynonymSingularLowercase : "payment",
                    icon: "ion-cash"
                },
                "Physical Activity": {
                    defaultAbbreviatedUnitName: '',
                    helpText: "What physical activity do you want to record?",
                    variableCategoryName: "Physical Activity",
                    variableCategoryNameSingular: "Physical Activity",
                    measurementSynonymSingularLowercase : "activity",
                    icon: "ion-ios-body"
                },
                "Physique": {
                    defaultAbbreviatedUnitName: '',
                    helpText: "What aspect of your physique do you want to record?",
                    variableCategoryName: "Physique",
                    variableCategoryNameSingular: "Physique",
                    measurementSynonymSingularLowercase : "physique measurement",
                    icon: "ion-ios-body"
                },
                "Sleep": {
                    defaultAbbreviatedUnitName: "",
                    helpText: "What aspect of sleep do you want to record?",
                    variableCategoryName: "Sleep",
                    variableCategoryNameSingular: "Sleep",
                    measurementSynonymSingularLowercase : "Sleep Measurement",
                    icon: "ion-ios-moon-outline"
                },
                "Symptoms": {
                    defaultAbbreviatedUnitName: "/5",
                    helpText: "What symptom do you want to record?",
                    variableCategoryName: "Symptoms",
                    variableCategoryNameSingular: "Symptom",
                    measurementSynonymSingularLowercase : "rating",
                    icon: "ion-sad-outline"
                },
                "Treatments": {
                    defaultAbbreviatedUnitName : "mg",
                    helpText : "What treatment do you want to record?",
                    variableCategoryName : "Treatments",
                    variableCategoryNameSingular : "Treatment",
                    defaultValueLabel : "Dosage",
                    defaultValuePlaceholderText : "Enter dose value here...",
                    measurementSynonymSingularLowercase : "dose",
                    icon: "ion-ios-medkit-outline"
                },
                "Vital Signs": {
                    defaultAbbreviatedUnitName: '',
                    helpText: "What vital sign do you want to record?",
                    variableCategoryName: "Vital Signs",
                    variableCategoryNameSingular: "Vital Sign",
                    measurementSynonymSingularLowercase : "measurement",
                    icon: "ion-ios-pulse"
                }
            };

            var selectedVariableCategoryObject = variableCategoryInfo.Anything;
            if(variableCategoryName && variableCategoryInfo[variableCategoryName]){
                selectedVariableCategoryObject =  variableCategoryInfo[variableCategoryName];
            }

            return selectedVariableCategoryObject;
        };

        quantimodoService.getPairs = function (params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            quantimodoService.get('api/v1/pairs',
                ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'causeVariableName', 'effectVariableName'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        quantimodoService.getPairsDeferred = function (params, successHandler, errorHandler){
            var deferred = $q.defer();
            quantimodoService.getPairs(params, function (pairs) {
                if(successHandler){
                    successHandler();
                }
                deferred.resolve(pairs);
            }, function (error) {
                if(errorHandler){
                    errorHandler();
                }
                deferred.reject(error);
                console.error(error);
            });

            return deferred.promise;
        };

        quantimodoService.getStudyDeferred = function (params, successHandler, errorHandler){
            var deferred = $q.defer();
            quantimodoService.getStudy(params, function (pairs) {
                if(successHandler){
                    successHandler();
                }
                deferred.resolve(pairs);
            }, function (error) {
                if(errorHandler){
                    errorHandler();
                }
                deferred.reject(error);
                console.error(error);
            });

            return deferred.promise;
        };

        quantimodoService.getAllLocalMeasurements = function(){
            var primaryOutcomeMeasurements = localStorageService.getItemAsObject('allMeasurements');
            if(!primaryOutcomeMeasurements) {
                primaryOutcomeMeasurements = [];
            }
            var measurementsQueue = localStorageService.getItemAsObject('measurementsQueue');
            if(measurementsQueue){
                primaryOutcomeMeasurements = primaryOutcomeMeasurements.concat(measurementsQueue);
            }
            primaryOutcomeMeasurements = primaryOutcomeMeasurements.sort(function(a,b){
                if(a.startTimeEpoch < b.startTimeEpoch){
                    return 1;}
                if(a.startTimeEpoch> b.startTimeEpoch)
                {return -1;}
                return 0;
            });
            return ratingService.addInfoAndImagesToMeasurements(primaryOutcomeMeasurements);
        };

        // get data from quantimodoService API
        quantimodoService.getMeasurements = function(){
            var deferred = $q.defer();
            isSyncing = true;

            $rootScope.lastSyncTime = localStorageService.getItemSync('lastSyncTime');
            if (!$rootScope.lastSyncTime) {
                $rootScope.lastSyncTime = 0;
            }
            var nowDate = new Date();
            var lastSyncDate = new Date($rootScope.lastSyncTime);
            var milliSecondsSinceLastSync = nowDate - lastSyncDate;
            /*
             if(milliSecondsSinceLastSync < 5 * 60 * 1000){
             $rootScope.$broadcast('updateCharts');
             deferred.resolve();
             return deferred.promise;
             }
             */

            // send request
            var params;
            var lastSyncTimeMinusFifteenMinutes = moment($rootScope.lastSyncTime).subtract(15, 'minutes').format("YYYY-MM-DDTHH:mm:ss");
            params = {
                variableName : config.appSettings.primaryOutcomeVariableDetails.name,
                'updatedAt':'(ge)'+ lastSyncTimeMinusFifteenMinutes ,
                sort : '-startTimeEpoch',
                limit:200,
                offset:0
            };

            localStorageService.getItem('user', function(user){
                if(!user){
                    deferred.resolve();
                }
            });

            var getPrimaryOutcomeVariableMeasurements = function(params) {
                quantimodoService.getV1Measurements(params, function(response){
                    // Do the stuff with adding to allMeasurements
                    if (response.length > 0 && response.length <= 200) {
                        // Update local data
                        var allMeasurements;
                        localStorageService.getItem('allMeasurements',function(allMeasurements){
                            allMeasurements = allMeasurements ? JSON.parse(allMeasurements) : [];

                            var filteredStoredMeasurements = [];
                            allMeasurements.forEach(function(storedMeasurement) {
                                var found = false;
                                var i = 0;
                                while (!found && i < response.length) {
                                    var responseMeasurement = response[i];
                                    if (storedMeasurement.startTimeEpoch === responseMeasurement.startTimeEpoch &&
                                        storedMeasurement.id === responseMeasurement.id) {
                                        found = true;
                                    }
                                    i++;
                                }
                                if (!found) {
                                    filteredStoredMeasurements.push(storedMeasurement);
                                }
                            });
                            allMeasurements = filteredStoredMeasurements.concat(response);

                            var s  = 9999999999999;
                            allMeasurements.forEach(function(x){
                                if(!x.startTimeEpoch){
                                    x.startTimeEpoch = x.timestamp;
                                }
                                if(x.startTimeEpoch <= s){
                                    s = x.startTimeEpoch;
                                }
                            });

                            // FIXME Is this right? Doesn't do what is described
                            // updating last updated time and data in local storage so that we syncing should continue from this point
                            // if user restarts the app or refreshes the page.
                            console.debug("getPrimaryOutcomeVariableMeasurements is calling quantimodoService.setDates");
                            //quantimodoService.setDates(new Date().getTime(),s*1000);
                            //console.debug("getPrimaryOutcomeVariableMeasurements: allMeasurements length is " + allMeasurements.length);
                            //console.debug("getPrimaryOutcomeVariableMeasurements:  Setting allMeasurements to: ", allMeasurements);
                            localStorageService.setItem('allMeasurements', JSON.stringify(allMeasurements));
                            console.debug("getPrimaryOutcomeVariableMeasurements broadcasting to update charts");
                            $rootScope.$broadcast('updateCharts');
                        });
                    }

                    if (response.length < 200 || params.offset > 1000) {
                        $rootScope.lastSyncTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                        localStorageService.setItem('lastSyncTime', $rootScope.lastSyncTime);
                        console.debug("Measurement sync completed and lastSyncTime set to " + $rootScope.lastSyncTime);
                        deferred.resolve(response);
                    } else if (response.length === 200 && params.offset < 1001) {
                        // Keep querying
                        params = {
                            variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                            'updatedAt':'(ge)'+ lastSyncTimeMinusFifteenMinutes ,
                            sort : '-startTimeEpoch',
                            limit: 200,
                            offset: params.offset + 200
                        };
                        console.debug('Keep querying because response.length === 200 && params.offset < 2001');
                        getPrimaryOutcomeVariableMeasurements(params);
                    }
                    else {
                        // More than 200 measurements returned, something is wrong
                        deferred.reject(response);
                    }

                }, function(error){
                    deferred.reject(error);
                });
            };

            getPrimaryOutcomeVariableMeasurements(params);

            return deferred.promise;
        };

        quantimodoService.syncPrimaryOutcomeVariableMeasurements = function(){
            var defer = $q.defer();

            if(!$rootScope.user && !$rootScope.accessToken){
                console.debug('Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user');
                defer.resolve();
                return defer.promise;
            }

            localStorageService.getItem('measurementsQueue',function(measurementsQueue) {

                var measurementObjects = JSON.parse(measurementsQueue);

                if(!measurementObjects || measurementObjects.length < 1){
                    console.debug('No measurements to sync!');
                    quantimodoService.getMeasurements().then(function(){
                        defer.resolve();
                    });
                } else {
                    var measurements = [
                        {
                            variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                            source: config.appSettings.appName + " " + $rootScope.currentPlatform,
                            variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                            combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                            abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                            measurements: measurementObjects
                        }
                    ];

                    console.debug('Syncing measurements to server: ' + JSON.stringify(measurementObjects));

                    quantimodoService.postMeasurementsV2(measurements, function (response) {
                        localStorageService.setItem('measurementsQueue', JSON.stringify([]));
                        quantimodoService.getMeasurements().then(function() {
                            defer.resolve();
                            console.debug("quantimodoService.postMeasurementsV2 success: " + JSON.stringify(response));
                        });
                    }, function (response) {
                        console.debug("error: " + JSON.stringify(response));
                        defer.resolve();
                    });
                }
            });

            return defer.promise;
        };

        // date setter from - to
        quantimodoService.setDates = function(to, from){
            var oldFromDate = localStorageService.getItemSync('fromDate');
            var oldToDate = localStorageService.getItemSync('toDate');
            localStorageService.setItem('fromDate',parseInt(from));
            localStorageService.setItem('toDate',parseInt(to));
            // if date range changed, update charts
            if (parseInt(oldFromDate) !== parseInt(from) || parseInt(oldToDate) !== parseInt(to)) {
                console.debug("setDates broadcasting to update charts");
                $rootScope.$broadcast('updateCharts');
                $rootScope.$broadcast('updatePrimaryOutcomeHistory');
            }

        };

        // retrieve date to end on
        quantimodoService.getToDate = function(callback){
            localStorageService.getItem('toDate',function(toDate){
                if(toDate){
                    callback(parseInt(toDate));
                }else{
                    callback(parseInt(Date.now()));
                }
            });

        };

        // retrieve date to start from
        quantimodoService.getFromDate = function(callback){
            localStorageService.getItem('fromDate',function(fromDate){
                if(fromDate){
                    callback(parseInt(fromDate));
                }else{
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
                numericRatingValue = config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] ?
                    config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] : false;
            }
            var startTimeEpoch  = new Date().getTime();
            var measurementObject = {
                id: null,
                variable: config.appSettings.primaryOutcomeVariableDetails.name,
                variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                startTimeEpoch: Math.floor(startTimeEpoch / 1000),
                abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                value: numericRatingValue,
                note: "",
                latitude: $rootScope.lastLatitude,
                longitude: $rootScope.lastLongitude,
                location: $rootScope.lastLocationNameAndAddress
            };
            return measurementObject;
        };

        // used when adding a new measurement from record measurement OR updating a measurement through the queue
        quantimodoService.addToMeasurementsQueue = function(measurementObject){
            console.debug("added to measurementsQueue: id = " + measurementObject.id);
            var deferred = $q.defer();

            localStorageService.getItem('measurementsQueue',function(measurementsQueue) {
                measurementsQueue = measurementsQueue ? JSON.parse(measurementsQueue) : [];
                // add to queue
                measurementsQueue.push({
                    id: measurementObject.id,
                    variable: config.appSettings.primaryOutcomeVariableDetails.name,
                    variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                    variableCategoryName: measurementObject.variableCategoryName,
                    variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                    startTimeEpoch: measurementObject.startTimeEpoch,
                    abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                    value: measurementObject.value,
                    note: measurementObject.note,
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                });
                //resave queue
                localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
            });
            return deferred.promise;
        };

        // post a single measurement
        quantimodoService.postTrackingMeasurement = function(measurementInfo, usePromise){

            var deferred = $q.defer();

            // make sure startTimeEpoch isn't in milliseconds
            var nowMilliseconds = new Date();
            var oneWeekInFuture = nowMilliseconds.getTime()/1000 + 7 * 86400;
            if(measurementInfo.startTimeEpoch > oneWeekInFuture){
                measurementInfo.startTimeEpoch = measurementInfo.startTimeEpoch / 1000;
                console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
            }

            if (measurementInfo.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                // Primary outcome variable - update through measurementsQueue
                var found = false;
                if (measurementInfo.prevStartTimeEpoch) {
                    localStorageService.getItemAsObject('measurementsQueue',function(measurementsQueue) {
                        var i = 0;
                        while (!found && i < measurementsQueue.length) {
                            if (measurementsQueue[i].startTimeEpoch === measurementInfo.prevStartTimeEpoch) {
                                found = true;
                                measurementsQueue[i].startTimeEpoch = measurementInfo.startTimeEpoch;
                                measurementsQueue[i].value =  measurementInfo.value;
                                measurementsQueue[i].note = measurementInfo.note;
                            }
                        }
                        localStorageService.setItem('measurementsQueue',JSON.stringify(measurementsQueue));
                    });

                } else if(measurementInfo.id) {
                    var newAllMeasurements = [];
                    localStorageService.getItem('allMeasurements',function(oldAllMeasurements) {
                        oldAllMeasurements = oldAllMeasurements ? JSON.parse(oldAllMeasurements) : [];
                        oldAllMeasurements.forEach(function (storedMeasurement) {
                            // look for edited measurement based on IDs
                            if (found || storedMeasurement.id !== measurementInfo.id) {
                                // copy non-edited measurements to newAllMeasurements
                                newAllMeasurements.push(storedMeasurement);
                            }
                            else {
                                console.debug("edited measurement found in allMeasurements");
                                // don't copy
                                found = true;
                            }
                        });
                    });
                    console.debug("postTrackingMeasurement: newAllMeasurements length is " + newAllMeasurements.length);
                    //console.debug("postTrackingMeasurement:  Setting allMeasurements to: ", newAllMeasurements);
                    localStorageService.setItem('allMeasurements', JSON.stringify(newAllMeasurements));
                    var editedMeasurement = {
                        id: measurementInfo.id,
                        variableName: measurementInfo.variableName,
                        source: config.appSettings.appName + $rootScope.currentPlatform,
                        abbreviatedUnitName: measurementInfo.unit,
                        startTimeEpoch:  measurementInfo.startTimeEpoch,
                        value: measurementInfo.value,
                        variableCategoryName : measurementInfo.variableCategoryName,
                        note : measurementInfo.note,
                        combinationOperation : measurementInfo.combinationOperation,
                        latitude: $rootScope.lastLatitude,
                        longitude: $rootScope.lastLongitude,
                        location: $rootScope.lastLocationNameAndAddress
                    };
                    quantimodoService.addToMeasurementsQueue(editedMeasurement);

                } else {
                    // adding primary outcome variable measurement from record measurements page
                    var newMeasurement = {
                        id: null,
                        variableName: measurementInfo.variableName,
                        source: config.appSettings.appName + $rootScope.currentPlatform,
                        abbreviatedUnitName: measurementInfo.unit,
                        startTimeEpoch:  measurementInfo.startTimeEpoch,
                        value: measurementInfo.value,
                        variableCategoryName : measurementInfo.variableCategoryName,
                        note : measurementInfo.note,
                        combinationOperation : measurementInfo.combinationOperation,
                        latitude: $rootScope.lastLatitude,
                        longitude: $rootScope.lastLongitude,
                        location: $rootScope.lastLocationNameAndAddress
                    };
                    quantimodoService.addToMeasurementsQueue(newMeasurement);
                }

                quantimodoService.syncPrimaryOutcomeVariableMeasurements()
                    .then(function() {
                        if(usePromise) {
                            deferred.resolve();
                        }
                    });
            }
            else {
                // Non primary outcome variable, post immediately
                var measurementSourceName = config.appSettings.appName;
                if(measurementInfo.sourceName){
                    measurementSourceName = measurementInfo.sourceName;
                }
                // measurements set
                var measurements = [
                    {
                        variableName: measurementInfo.variableName,
                        source: measurementSourceName,
                        variableCategoryName: measurementInfo.variableCategoryName,
                        abbreviatedUnitName: measurementInfo.abbreviatedUnitName,
                        combinationOperation : measurementInfo.combinationOperation,
                        measurements : [
                            {
                                id: measurementInfo.id,
                                startTimeEpoch:  measurementInfo.startTimeEpoch,
                                value: measurementInfo.value,
                                note : measurementInfo.note,
                                latitude: $rootScope.lastLatitude,
                                longitude: $rootScope.lastLongitude,
                                location: $rootScope.lastLocationNameAndAddress
                            }
                        ]
                    }
                ];

                // for local
                var measurement = {
                    variableName: measurementInfo.variableName,
                    source: config.appSettings.appName + $rootScope.currentPlatform,
                    abbreviatedUnitName: measurementInfo.unit,
                    startTimeEpoch:  measurementInfo.startTimeEpoch,
                    value: measurementInfo.value,
                    variableCategoryName : measurementInfo.variableCategoryName,
                    note : measurementInfo.note,
                    combinationOperation : measurementInfo.combinationOperation,
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                };

                // send request
                quantimodoService.postMeasurementsV2(measurements, function(response){
                    if(response.success) {
                        console.debug("postMeasurementsV2 success " + JSON.stringify(response));
                        if(usePromise) {
                            deferred.resolve();
                        }
                    } else {
                        console.debug("quantimodoService.postMeasurementsV2 error" + JSON.stringify(response));
                        if(usePromise) {
                            deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                        }
                    }
                }, function(response){
                    console.debug("quantimodoService.postMeasurementsV2 error" + JSON.stringify(response));
                    if(usePromise) {
                        deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                    }
                });
            }
            if(usePromise) {
                return deferred.promise;
            }
        };

        quantimodoService.postMeasurementByReminder = function(trackingReminder, modifiedValue) {

            // send request
            var value = trackingReminder.defaultValue;
            if(typeof modifiedValue !== "undefined" && modifiedValue !== null){
                value = modifiedValue;
            }

            var startTimeEpochMilliseconds = new Date();
            var startTimeEpochSeconds = startTimeEpochMilliseconds/1000;
            // measurements set
            var measurementSet = [
                {
                    variableName: trackingReminder.variableName,
                    source: config.appSettings.appName + $rootScope.currentPlatform,
                    variableCategoryName: trackingReminder.variableCategoryName,
                    abbreviatedUnitName: trackingReminder.abbreviatedUnitName,
                    measurements : [
                        {
                            startTimeEpoch:  startTimeEpochSeconds,
                            value: value,
                            note : null,
                            latitude: $rootScope.lastLatitude,
                            longitude: $rootScope.lastLongitude,
                            location: $rootScope.lastLocationNameAndAddress
                        }
                    ]
                }
            ];

            var deferred = $q.defer();

            quantimodoService.postMeasurementsV2(measurementSet, function(response){
                if(response.success) {
                    console.debug("quantimodoService.postMeasurementsV2 success: " + JSON.stringify(response));
                    deferred.resolve();
                } else {
                    deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                }
            });

            return deferred.promise;
        };

        quantimodoService.getHistoryMeasurements = function(params){
            var deferred = $q.defer();

            quantimodoService.getV1Measurements(params, function(response){
                deferred.resolve(response);
            }, function(error){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                }
                deferred.reject(error);
            });

            return deferred.promise;
        };

        quantimodoService.getMeasurementById = function(measurementId){
            var deferred = $q.defer();
            var params = {id : measurementId};
            quantimodoService.getV1Measurements(params, function(response){
                var measurementArray = response;
                if(!measurementArray[0]){
                    console.debug('Could not get measurement with id: ' + measurementId);
                    deferred.reject();
                }
                var measurementObject = measurementArray[0];
                deferred.resolve(measurementObject);
            }, function(error){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                }
                console.debug(error);
                deferred.reject();
            });
            return deferred.promise;

        };

        quantimodoService.deleteMeasurementFromLocalStorage = function(measurement) {
            var deferred = $q.defer();
            localStorageService.deleteElementOfItemById('allMeasurements', measurement.id).then(function(){
                deferred.resolve();
            });
            localStorageService.deleteElementOfItemByProperty('measurementQueue', 'startTimeEpoch',
                measurement.startTimeEpoch).then(function (){
                deferred.resolve();
            });
            return deferred.promise;
        };

        quantimodoService.deleteMeasurementFromServer = function(measurement){
            var deferred = $q.defer();
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
            var startTimeEpochSeconds;
            if(!parameters.startTimeEpochSeconds){
                var startTimeEpochMilliseconds = new Date();
                startTimeEpochSeconds = startTimeEpochMilliseconds/1000;
            } else {
                startTimeEpochSeconds = parameters.startTimeEpochSeconds;
            }

            var measurementSets = [
                {
                    variableId: 1874,
                    source: config.appSettings.appName + $rootScope.currentPlatform,
                    startTimeEpoch:  startTimeEpochSeconds,
                    value: parameters.systolicValue,
                    note: parameters.note,
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                },
                {
                    variableId: 5554981,
                    source: config.appSettings.appName + $rootScope.currentPlatform,
                    startTimeEpoch:  startTimeEpochSeconds,
                    value: parameters.diastolicValue,
                    note: parameters.note,
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                }
            ];

            quantimodoService.postMeasurementsV2(measurementSets, function(response){
                if(response.success) {
                    console.debug("quantimodoService.postMeasurementsV2 success: " + JSON.stringify(response));
                    deferred.resolve(response);
                } else {
                    deferred.reject(response);
                }
            });
            return deferred.promise;
        };

        // service methods
        function addUnitsToRootScope(units) {
            $rootScope.unitObjects = units;
            $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];
            $rootScope.nonAdvancedAbbreviatedUnitNames = [];
            $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName = [];
            $rootScope.nonAdvancedAbbreviatedUnitNamesIndexedByUnitId = [];
            $rootScope.nonAdvancedUnitObjects = [];
            for (var i = 0; i < units.length; i++) {
                $rootScope.abbreviatedUnitNames[i] = units[i].abbreviatedName;
                $rootScope.unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                $rootScope.abbreviatedUnitNamesIndexedByUnitId[units[i].id] = units[i].abbreviatedName;

                if(!units[i].advanced){
                    $rootScope.nonAdvancedAbbreviatedUnitNames.push(units[i].abbreviatedName);
                    $rootScope.nonAdvancedUnitObjects.push(units[i]);
                    $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                    $rootScope.nonAdvancedAbbreviatedUnitNamesIndexedByUnitId[units[i].id] = units[i].abbreviatedName;
                }
            }
            var showMoreUnitsObject = {
                name: "Show more units",
                abbreviatedName: "Show more units"
            };
            $rootScope.nonAdvancedAbbreviatedUnitNames.push(showMoreUnitsObject.abbreviatedName);
            $rootScope.nonAdvancedUnitObjects.push(showMoreUnitsObject);
            $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName["Show more units"] = showMoreUnitsObject;
        }

        quantimodoService.getUnits = function(){
            var deferred = $q.defer();

            localStorageService.getItem('units', function(unitsString){
                if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                    $rootScope.abbreviatedUnitNames = [];
                }
                var unitObjects = JSON.parse(unitsString);

                if(unitObjects && typeof(unitObjects[0].advanced) !== "undefined"){
                    addUnitsToRootScope(unitObjects);
                    deferred.resolve(unitObjects);
                } else {
                    quantimodoService.refreshUnits().then(function(unitObjects){
                        deferred.resolve(unitObjects);
                    });
                }
            });

            return deferred.promise;
        };

        quantimodoService.refreshUnits = function(){
            var deferred = $q.defer();
            quantimodoService.getUnitsFromApi(function(unitObjects){
                if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                    $rootScope.abbreviatedUnitNames = [];
                }
                localStorageService.setItem('units', JSON.stringify(unitObjects));
                addUnitsToRootScope(unitObjects);
                deferred.resolve(unitObjects);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        // refresh local variable categories with quantimodoService API
        quantimodoService.refreshVariableCategories = function(){
            var deferred = $q.defer();

            quantimodoService.getVariableCategoriesFromApi(function(vars){
                localStorageService.setItem('variableCategories',JSON.stringify(vars));
                deferred.resolve(vars);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        // get variable categories
        quantimodoService.getVariableCategories = function(){
            var deferred = $q.defer();

            localStorageService.getItem('variableCategories',function(variableCategories){
                if(variableCategories){
                    deferred.resolve(JSON.parse(variableCategories));
                } else {
                    quantimodoService.getVariableCategoriesFromApi(function(variableCategories){
                        localStorageService.setItem('variableCategories', JSON.stringify(variableCategories));
                        deferred.resolve(variableCategories);
                    }, function(error){
                        deferred.reject(error);
                    });
                }
            });

            return deferred.promise;
        },

        quantimodoService.getVariableCategoryIcon = function(variableCategoryName){
                var variableCategoryInfo = quantimodoService.getVariableCategoryInfo(variableCategoryName);
                if(variableCategoryInfo.icon){
                    return variableCategoryInfo.icon;
                } else {
                    console.warn('Could not find icon for variableCategoryName ' + variableCategoryName);
                    return 'ion-speedometer';
                }

            };

        quantimodoService.getEnv = function(){
            var env = "production";

            if(window.location.origin.indexOf('local') !== -1){
                env = "development"; //On localhost
            }

            if(window.location.origin.indexOf('staging') !== -1){
                env = "staging";
            }

            if(window.location.origin.indexOf('ionic.quantimo.do') !== -1){
                env = "staging";
            }

            return env;
        };

        quantimodoService.getClientId = function(){
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                $rootScope.clientId = window.private_keys.client_ids.Chrome; //if chrome app
            } else if ($rootScope.isIOS) {
                $rootScope.clientId = window.private_keys.client_ids.iOS;
            } else if ($rootScope.isAndroid) {
                $rootScope.clientId = window.private_keys.client_ids.Android;
            } else if ($rootScope.isChromeExtension) {
                $rootScope.clientId = window.private_keys.client_ids.Chrome;
            } else if ($rootScope.isWindows) {
                $rootScope.clientId = window.private_keys.client_ids.Windows;
            } else {
                $rootScope.clientId = window.private_keys.client_ids.Web;
            }
            return $rootScope.clientId;
        };

        quantimodoService.setPlatformVariables = function () {
            if (window.cordova) {
                $rootScope.currentPlatformVersion = ionic.Platform.version();
                if (ionic.Platform.isIOS()){
                    $rootScope.isIOS = true;
                    $rootScope.isMobile = true;
                    $rootScope.currentPlatform = "iOS";
                }
                if (ionic.Platform.isAndroid()){
                    $rootScope.isAndroid = true;
                    $rootScope.isMobile = true;
                    $rootScope.currentPlatform = "Android";
                }
            } else if (window.location.href.indexOf('ms-appx') > -1) {
                $rootScope.isWindows = true;
                $rootScope.currentPlatform = "Windows";
            } else {
                $rootScope.isChrome = window.chrome ? true : false;
                $rootScope.currentPlatformVersion = null;
                var currentUrl =  window.location.href;
                if (currentUrl.indexOf('chrome-extension') !== -1) {
                    $rootScope.isChromeExtension = true;
                    $rootScope.isChromeApp = false;
                    $rootScope.currentPlatform = "ChromeExtension";
                } else if ($rootScope.isChrome && chrome.identity) {
                    $rootScope.isChromeExtension = false;
                    $rootScope.isChromeApp = true;
                    $rootScope.currentPlatform = "ChromeApp";
                } else {
                    $rootScope.isWeb = true;
                    $rootScope.currentPlatform = "Web";
                }
            }
            if($rootScope.isChromeExtension){
                $rootScope.localNotificationsEnabled = true;
            }
            $rootScope.qmApiUrl = quantimodoService.getApiUrl();
        };

        quantimodoService.getPermissionString = function(){
            var str = "";
            var permissions = ['readmeasurements', 'writemeasurements'];
            for(var i=0; i < permissions.length; i++) {
                str += permissions[i] + "%20";
            }
            return str.replace(/%20([^%20]*)$/,'$1');
        };

        quantimodoService.getClientSecret = function(){
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                return window.private_keys.client_secrets.Chrome;
            }
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
                if(currentPlatform.indexOf('win') > -1){
                    return 'ms-appx-web';
                }
            }
            return 'https';
        };

        quantimodoService.getApiUrl = function () {

            if(!window.private_keys){
                console.error("Cannot find www/private_configs/" +  appsManager.defaultApp + ".config.js or it does " +
                    "not contain window.private_keys");
                return "https://app.quantimo.do";
            }
            if ($rootScope.isWeb && window.private_keys.client_ids.Web === 'oAuthDisabled') {
                return window.location.origin;
            }
            if(window.private_keys.apiUrl){
                return window.private_keys.apiUrl;
            }
            return "https://app.quantimo.do";
        };

        quantimodoService.getQuantiModoUrl = function (path) {
            if(typeof path === "undefined") {
                path = "";
            } else {
                path += "?";
            }

            return $rootScope.qmApiUrl + "/" + path;
        };

        quantimodoService.convertToObjectIfJsonString = function (stringOrObject) {
            try {
                stringOrObject = JSON.parse(stringOrObject);
            } catch (e) {
                return stringOrObject;
            }
            return stringOrObject;
        };

        quantimodoService.showAlert = function(title, template) {
            var alertPopup = $ionicPopup.alert({
                cssClass : 'positive',
                okType : 'button-positive',
                title: title,
                template: template
            });
        };

        // returns bool
        // if a string starts with substring
        quantimodoService.startsWith = function (fullString, search) {
            return fullString.slice(0, search.length) === search;
        };

        // returns bool | string
        // if search param is found: returns its value
        // returns false if not found
        quantimodoService.getUrlParameter = function (url, sParam, shouldDecode) {
            if(url.split('?').length > 1){
                var sPageURL = url.split('?')[1];
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++)
                {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] === sParam)
                    {
                        if(typeof shouldDecode !== "undefined")  {
                            return decodeURIComponent(sParameterName[1]);
                        }
                        else {
                            return sParameterName[1];
                        }
                    }
                }
                return false;
            } else {
                return false;
            }
        };



        quantimodoService.getConnectorsDeferred = function(){
            var deferred = $q.defer();
            localStorageService.getItem('connectors', function(connectors){
                if(connectors){
                    connectors = JSON.parse(connectors);
                    connectors = quantimodoService.hideBrokenConnectors(connectors);
                    deferred.resolve(connectors);
                } else {
                    quantimodoService.refreshConnectors().then(function(){
                        deferred.resolve(connectors);
                    });
                }
            });
            return deferred.promise;

        };

        quantimodoService.refreshConnectors = function(){
            var deferred = $q.defer();
            quantimodoService.getConnectorsFromApi(function(connectors){
                localStorageService.setItem('connectors', JSON.stringify(connectors));
                connectors = quantimodoService.hideBrokenConnectors(connectors);
                deferred.resolve(connectors);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.disconnectConnectorDeferred = function(name){
            var deferred = $q.defer();
            quantimodoService.disconnectConnectorToApi(name, function(){
                quantimodoService.refreshConnectors();
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.connectConnectorWithParamsDeferred = function(params, lowercaseConnectorName){
            var deferred = $q.defer();
            quantimodoService.connectConnectorWithParamsToApi(params, lowercaseConnectorName, function(){
                quantimodoService.refreshConnectors();
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.connectConnectorWithTokenDeferred = function(body){
            var deferred = $q.defer();
            quantimodoService.connectConnectorWithTokenToApi(body, function(){
                quantimodoService.refreshConnectors();
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.connectConnectorWithAuthCodeDeferred = function(code, lowercaseConnectorName){
            var deferred = $q.defer();
            quantimodoService.connectWithAuthCodeToApi(code, lowercaseConnectorName, function(){
                quantimodoService.refreshConnectors();
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        quantimodoService.hideBrokenConnectors = function(connectors){
            for(var i = 0; i < connectors.length; i++){
                if(connectors[i].name === 'facebook' && $rootScope.isAndroid) {
                    connectors[i].hide = true;
                }
            }
            return connectors;
        };

        return quantimodoService;
    });