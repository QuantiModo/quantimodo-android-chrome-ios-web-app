angular.module('starter')
    // QuantiModo API implementation
    .factory('QuantiModo', function($http, $q, $rootScope, $ionicPopup, $state,
                                    localStorageService, bugsnagService, utilsService) {
        var QuantiModo = {};
        $rootScope.connectionErrorShowing = false; // to prevent more than one popup

        QuantiModo.successHandler = function(data, baseURL, status){
            var maxLength = 140;
            console.debug(status + ' response from ' + baseURL + ': ' +  JSON.stringify(data).substring(0, maxLength) + '...');
            if($rootScope.connectionErrorShowing){
                $rootScope.connectionErrorShowing = false;
            }
            if(!data.success){
                console.warn('No data.success in data response from ' + baseURL + ': ' +  JSON.stringify(data).substring(0, maxLength) + '...');
            }
            if(data.message){
                console.warn(data.message);
            }
            if(!$rootScope.user && baseURL.indexOf('user') === -1){
                QuantiModo.refreshUser();
            }
        };

        QuantiModo.errorHandler = function(data, status, headers, config, request, doNotSendToLogin){

            if(status === 302){
                console.warn('QuantiModo.errorHandler: Got 302 response from ' + JSON.stringify(request));
                return;
            }

            if(status === 401){
                if(doNotSendToLogin){
                    return;
                } else {
                    console.warn('QuantiModo.errorHandler: Sending to login because we got 401 with request ' +
                        JSON.stringify(request));
                    localStorageService.setItem('afterLoginGoTo', window.location.href);
                    console.debug("set afterLoginGoTo to " + window.location.href);
                    if (utilsService.getClientId() !== 'oAuthDisabled') {
                        $rootScope.sendToLogin();
                    } else {
                        var register = true;
                        QuantiModo.sendToNonOAuthBrowserLoginUrl(register);
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
                if (!$rootScope.connectionErrorShowing) {
                    $rootScope.connectionErrorShowing = true;
                    if($rootScope.isIOS){
                        $ionicPopup.show({
                            title: 'NOT CONNECTED',
                            subTitle: 'Either you are not connected to the internet or the QuantiModo server cannot be reached.',
                            buttons:[
                                {text: 'OK',
                                    type: 'button-positive',
                                    onTap: function(){
                                        $rootScope.connectionErrorShowing = false;
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
                console.debug('QuantiModo.get: Cannot make ' + type + ' request to ' + baseURL + " because " +
                    "we made the same request within the last " + minimumSecondsBetweenRequests + ' seconds');
                return false;
            }
            $rootScope[requestVariableName] = Math.floor(Date.now() / 1000);
            return true;
        };

        // GET method with the added token
        QuantiModo.get = function(baseURL, allowedParams, params, successHandler, errorHandler,
                                  minimumSecondsBetweenRequests, doNotSendToLogin){

            if(!canWeMakeRequestYet('GET', baseURL, minimumSecondsBetweenRequests)){
                return;
            }

            console.debug('QuantiModo.get: Going to try to make request to ' + baseURL + " with params: " + JSON.stringify(params));
            QuantiModo.getAccessTokenFromAnySource().then(function(accessToken) {

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
                urlParams.push(encodeURIComponent('client_id') + '=' + encodeURIComponent(utilsService.getClientId()));
                //We can't append access token to Ionic requests for some reason
                //urlParams.push(encodeURIComponent('access_token') + '=' + encodeURIComponent(tokenObject.accessToken));

                // configure request
                var url = utilsService.getURL(baseURL);
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
                console.debug('QuantiModo.get: ' + request.url);

                $http(request)
                    .success(function (data, status, headers, config) {
                        if (data.error) {
                            QuantiModo.errorHandler(data, status, headers, config, request, doNotSendToLogin);
                            errorHandler(data);
                        } else {
                            QuantiModo.successHandler(data, baseURL, status);
                            successHandler(data);
                        }
                    })
                    .error(function (data, status, headers, config) {
                        QuantiModo.errorHandler(data, status, headers, config, request, doNotSendToLogin);
                        errorHandler(data);
                    }, onRequestFailed);
                });
            };

        // POST method with the added token
        QuantiModo.post = function(baseURL, requiredFields, items, successHandler, errorHandler,
                                   minimumSecondsBetweenRequests, doNotSendToLogin){

            if(!canWeMakeRequestYet('POST', baseURL, minimumSecondsBetweenRequests)){
                return;
            }

            console.debug('QuantiModo.post: About to try to post request to ' + baseURL + ' with body: ' + JSON.stringify(items));
            QuantiModo.getAccessTokenFromAnySource().then(function(accessToken){

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
                items.clientId = utilsService.getClientId();

                var url = utilsService.getURL(baseURL) + ((urlParams.length === 0) ? '' : urlParams.join('&'));

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

                if(utilsService.getClientId() !== 'oAuthDisabled' || $rootScope.accessTokenInUrl) {
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
                    QuantiModo.errorHandler(data, status, headers, config, request, doNotSendToLogin);
                    errorHandler(data);
                });

            }, errorHandler);
        };

        // get Measurements for user
        var getMeasurements = function(params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            QuantiModo.get('api/measurements',
                ['variableName', 'sort', 'startTimeEpoch', 'endTime', 'groupingWidth', 'groupingTimezone', 'source', 'unit','limit','offset','lastUpdated'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        QuantiModo.getMeasurementsLooping = function(params){
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

        QuantiModo.getV1Measurements = function(params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            QuantiModo.get('api/v1/measurements',
                ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        QuantiModo.getV1MeasurementsDaily = function(params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            QuantiModo.get('api/v1/measurements/daily',
                ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        QuantiModo.deleteV1Measurements = function(measurements, successHandler, errorHandler){
            QuantiModo.post('api/v1/measurements/delete',
                ['variableId', 'variableName', 'startTimeEpoch', 'id'],
                measurements,
                successHandler,
                errorHandler);
        };

        // Request measurements to be emailed as a csv
        QuantiModo.postMeasurementsCsvExport = function() {
            QuantiModo.post('api/v2/measurements/request_csv',
                [],
                [],
                QuantiModo.successHandler,
                QuantiModo.errorHandler);
        };

        // Request measurements to be emailed as a xls
        QuantiModo.postMeasurementsXlsExport = function() {
            QuantiModo.post('api/v2/measurements/request_xls',
                [],
                [],
                QuantiModo.successHandler,
                QuantiModo.errorHandler);
        };

        // Request measurements to be emailed as a pdf
        QuantiModo.postMeasurementsPdfExport = function() {
            QuantiModo.post('api/v2/measurements/request_pdf',
                [],
                [],
                QuantiModo.successHandler,
                QuantiModo.errorHandler);
        };

        // post new Measurements for user
        QuantiModo.postMeasurementsV2 = function(measurementSet, successHandler, errorHandler){
            if(!measurementSet[0].measurements && !measurementSet[0].value){
                console.error("No measurementSet.measurements provided to QuantiModo.postMeasurementsV2");
            } else {
                QuantiModo.post('api/measurements/v2',
                    //['measurements', 'variableName', 'source', 'variableCategoryName', 'abbreviatedUnitName'],
                    [],
                    measurementSet,
                    successHandler,
                    errorHandler);
            }
        };

        QuantiModo.logoutOfApi = function(successHandler, errorHandler){
            //TODO: Fix this
            console.debug('Logging out of api does not work yet.  Fix it!');
            QuantiModo.get('api/v2/auth/logout',
                [],
                {},
                successHandler,
                errorHandler);
        };


        QuantiModo.getAggregatedCorrelations = function(params, successHandler, errorHandler){
            QuantiModo.get('api/v1/aggregatedCorrelations',
                ['correlationCoefficient', 'causeVariableName', 'effectVariableName'],
                params,
                successHandler,
                errorHandler);
        };


        QuantiModo.getUserCorrelations = function (params, successHandler, errorHandler) {
            QuantiModo.get('api/v1/correlations',
                ['correlationCoefficient', 'causeVariableName', 'effectVariableName'],
                params,
                successHandler,
                errorHandler
            );
        };

        // post new correlation for user
        QuantiModo.postCorrelation = function(correlationSet, successHandler ,errorHandler){
            QuantiModo.post('api/v1/correlations',
                ['causeVariableName', 'effectVariableName', 'correlation', 'vote'],
                correlationSet,
                successHandler,
                errorHandler);
        };

        // post a vote
        QuantiModo.postVote = function(correlationSet, successHandler ,errorHandler){
            QuantiModo.post('api/v1/votes',
                ['causeVariableName', 'effectVariableName', 'correlation', 'vote'],
                correlationSet,
                successHandler,
                errorHandler);
        };

        // delete a vote
        QuantiModo.deleteVote = function(correlationSet, successHandler ,errorHandler){
            QuantiModo.post('api/v1/votes/delete',
                ['causeVariableName', 'effectVariableName', 'correlation'],
                correlationSet,
                successHandler,
                errorHandler);
        };

        // search for user variables
        QuantiModo.searchUserVariables = function(query, params, successHandler, errorHandler){
            QuantiModo.get('api/v1/variables/search/' + encodeURIComponent(query),
                ['limit','includePublic', 'manualTracking'],
                params,
                successHandler,
                errorHandler);
        };

        QuantiModo.getVariablesByName = function(variableName, successHandler, errorHandler){
            QuantiModo.get('api/v1/variables/' + encodeURIComponent(variableName),
                [],
                {},
                successHandler,
                errorHandler);
        };

        QuantiModo.getPublicVariablesByName = function(variableName, successHandler, errorHandler){
            QuantiModo.get('api/v1/public/variables',
                ['name'],
                {name: variableName},
                successHandler,
                errorHandler);
        };

        QuantiModo.getVariableById = function(variableId, successHandler, errorHandler){
            QuantiModo.get('api/v1/variables' ,
                ['id'],
                {id: variableId},
                successHandler,
                errorHandler);
        };


        // get user variables
        QuantiModo.getUserVariables = function(params, successHandler, errorHandler){

            if(!params){
                params = {};
            }

            if(!params.limit){
                params.limit = 200;
            }

            if(params.variableCategoryName && params.variableCategoryName === 'Anything'){
                params.variableCategoryName = null;
            }

            QuantiModo.get('api/v1/variables',
                ['variableCategoryName', 'limit'],
                params,
                successHandler,
                errorHandler);
        };

        // post changes to user variable
        QuantiModo.postUserVariable = function(userVariable, successHandler, errorHandler) {
            QuantiModo.post('api/v1/userVariables',
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

        QuantiModo.resetUserVariable = function(body, successHandler, errorHandler) {
            QuantiModo.post('api/v1/userVariables/reset',
                [
                    'variableId'
                ],
                body,
                successHandler,
                errorHandler);
        };

        // deletes all of a user's measurements for a variable
        QuantiModo.deleteUserVariableMeasurements = function(variableId, successHandler, errorHandler) {
            localStorageService.deleteElementOfItemByProperty('userVariables', 'variableId', variableId);
            localStorageService.deleteElementOfItemById('commonVariables', variableId);
            QuantiModo.post('api/v1/userVariables/delete',
            [
                'variableId'
            ],
            {variableId: variableId},
            successHandler,
            errorHandler);
        };

        // get variable categories
        QuantiModo.getVariableCategories = function(successHandler, errorHandler){
            QuantiModo.get('api/variableCategories',
                [],
                {},
                successHandler,
                errorHandler);
        };

        // get units
        QuantiModo.getUnits = function(successHandler, errorHandler){
            QuantiModo.get('api/units',
                [],
                {},
                successHandler,
                errorHandler);
        };

        // get units
        QuantiModo.getConnectors = function(successHandler, errorHandler){
            QuantiModo.get('api/connectors/list',
                [],
                {},
                successHandler,
                errorHandler);
        };

        // get units
        QuantiModo.disconnectConnector = function(name, successHandler, errorHandler){
            QuantiModo.get('api/v1/connectors/' + name + '/disconnect',
                [],
                {},
                successHandler,
                errorHandler);
        };


        QuantiModo.connectConnectorWithParams = function(params, lowercaseConnectorName, successHandler, errorHandler){
            var allowedParams = [
                'location',
                'username',
                'password',
                'email'
            ];

            QuantiModo.get('api/v1/connectors/' + lowercaseConnectorName + '/connect',
                allowedParams,
                params,
                successHandler,
                errorHandler);
        };


        QuantiModo.connectConnectorWithToken = function(body, lowercaseConnectorName, successHandler, errorHandler){
            var requiredProperties = [
                'connector',
                'connectorCredentials'
            ];

            QuantiModo.post('api/v1/connectors/connect',
                requiredProperties,
                body,
                successHandler,
                errorHandler);
        };

        QuantiModo.connectWithAuthCode = function(code, connectorLowercaseName, successHandler, errorHandler){
            var allowedParams = [
                'code',
                'noRedirect'
            ];
            var params = {
                noRedirect: true,
                code: code
            };

            QuantiModo.get('api/v1/connectors/' + connectorLowercaseName + '/connect',
                allowedParams,
                params,
                successHandler,
                errorHandler);
        };

        // get user data
        QuantiModo.getUser = function(successHandler, errorHandler){
            if($rootScope.user){
                console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);
            }
            var minimumSecondsBetweenRequests = 10;
            var doNotSendToLogin = true;
            QuantiModo.get('api/user/me',
                [],
                {},
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests,
                doNotSendToLogin
            );
        };

        // get user data
        QuantiModo.getUserEmailPreferences = function(params, successHandler, errorHandler){
            if($rootScope.user){
                console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);
            }
            var minimumSecondsBetweenRequests = 10;
            var doNotSendToLogin = true;
            QuantiModo.get('api/v1/notificationPreferences',
                ['userEmail'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests,
                doNotSendToLogin
            );
        };

        // get pending reminders
        QuantiModo.getTrackingReminderNotifications = function(params, successHandler, errorHandler){
            QuantiModo.get('api/v1/trackingReminderNotifications',
                ['variableCategoryName', 'reminderTime', 'sort', 'reminderFrequency'],
                params,
                successHandler,
                errorHandler);
        };

        QuantiModo.postTrackingReminderNotifications = function(trackingReminderNotificationsArray, successHandler, errorHandler) {
            if(!trackingReminderNotificationsArray){
                successHandler();
                return;
            }
            if(trackingReminderNotificationsArray.constructor !== Array){
                trackingReminderNotificationsArray = [trackingReminderNotificationsArray];
            }

            QuantiModo.post('api/v1/trackingReminderNotifications',
                [],
                trackingReminderNotificationsArray,
                successHandler,
                errorHandler);
        };

        // get reminders
        QuantiModo.getTrackingReminders = function(params, successHandler, errorHandler){
            QuantiModo.get('api/v1/trackingReminders',
                ['variableCategoryName', 'id'],
                params,
                successHandler,
                errorHandler);
        };

        QuantiModo.postUserSettings = function(params, successHandler, errorHandler) {
            QuantiModo.post('api/v1/userSettings',
                [],
                params,
                successHandler,
                errorHandler);
        };

        // post tracking reminder
        QuantiModo.postTrackingReminders = function(trackingRemindersArray, successHandler, errorHandler) {
            if(trackingRemindersArray.constructor !== Array){
                trackingRemindersArray = [trackingRemindersArray];
            }
            var d = new Date();
            for(var i = 0; i < trackingRemindersArray.length; i++){
                trackingRemindersArray[i].timeZoneOffset = d.getTimezoneOffset();
            }

            QuantiModo.post('api/v1/trackingReminders',
                [],
                trackingRemindersArray,
                successHandler,
                errorHandler);
        };

        QuantiModo.updateUserTimeZoneIfNecessary = function () {
            var d = new Date();
            var timeZoneOffsetInMinutes = d.getTimezoneOffset();
            if($rootScope.user && $rootScope.user.timeZoneOffset !== timeZoneOffsetInMinutes ){
                var params = {
                    timeZoneOffset: timeZoneOffsetInMinutes
                };
                QuantiModo.updateUserSettingsDeferred(params);
            }
        };

        QuantiModo.postDeviceToken = function(deviceToken, successHandler, errorHandler) {
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
            QuantiModo.post('api/v1/deviceTokens',
                [
                    'deviceToken',
                    'platform'
                ],
                params,
                successHandler,
                errorHandler);
        };

        QuantiModo.deleteDeviceToken = function(deviceToken, successHandler, errorHandler) {
            var deferred = $q.defer();
            if(!deviceToken){
                deferred.reject('No deviceToken provided to QuantiModo.deleteDeviceToken');
            } else {
                var params = {
                    deviceToken: deviceToken
                };
                QuantiModo.post('api/v1/deviceTokens/delete',
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
        QuantiModo.deleteTrackingReminder = function(reminderId, successHandler, errorHandler){
            if(!reminderId){
                console.error('No reminder id to delete with!  Maybe it has only been stored locally and has not updated from server yet.');
                return;
            }
            QuantiModo.post('api/v1/trackingReminders/delete',
                ['id'],
                {id: reminderId},
                successHandler,
                errorHandler);
        };

        // snooze tracking reminder
        QuantiModo.snoozeTrackingReminderNotification = function(params, successHandler, errorHandler){
            QuantiModo.post('api/v1/trackingReminderNotifications/snooze',
                ['id', 'trackingReminderNotificationId', 'trackingReminderId'],
                params,
                successHandler,
                errorHandler);
        };

        // skip tracking reminder
        QuantiModo.skipTrackingReminderNotification = function(params, successHandler, errorHandler){
            QuantiModo.post('api/v1/trackingReminderNotifications/skip',
                ['id', 'trackingReminderNotificationId', 'trackingReminderId'],
                params,
                successHandler,
                errorHandler);
        };

        // skip tracking reminder
        QuantiModo.skipAllTrackingReminderNotifications = function(params, successHandler, errorHandler){
            if(!params){
                params = [];
            }
            QuantiModo.post('api/v1/trackingReminderNotifications/skip/all',
                //['trackingReminderId'],
                [],
                params,
                successHandler,
                errorHandler);
        };

        // track tracking reminder with default value
        QuantiModo.trackTrackingReminderNotification = function(params, successHandler, errorHandler){
            var requiredProperties = ['id', 'trackingReminderNotificationId', 'trackingReminderId', 'modifiedValue'];
            QuantiModo.post('api/v1/trackingReminderNotifications/track',
                requiredProperties,
                params,
                successHandler,
                errorHandler);
        };

        QuantiModo.getAccessTokenFromUrlParameter = function () {
            $rootScope.accessTokenInUrl = utilsService.getUrlParameter(location.href, 'accessToken');
            if (!$rootScope.accessTokenInUrl) {
                $rootScope.accessTokenInUrl = utilsService.getUrlParameter(location.href, 'access_token');
            }
            if($rootScope.accessTokenInUrl){
                localStorageService.setItem('accessTokenInUrl', $rootScope.accessTokenInUrl);
                localStorageService.setItem('accessToken', $rootScope.accessTokenInUrl);
                $rootScope.accessToken = $rootScope.accessTokenInUrl;
            } else {
                localStorageService.deleteItem('accessTokenInUrl');
            }

            return $rootScope.accessTokenInUrl;
        };

        // if not logged in, returns rejects
        QuantiModo.getAccessTokenFromAnySource = function () {

            var deferred = $q.defer();

            if(!$rootScope.accessTokenInUrl){
                $rootScope.accessTokenInUrl = QuantiModo.getAccessTokenFromUrlParameter();
            }

            if($rootScope.accessTokenInUrl){
                deferred.resolve($rootScope.accessTokenInUrl);
                return deferred.promise;
            }

            var now = new Date().getTime();
            var expiresAtMilliseconds = localStorageService.getItemSync('expiresAtMilliseconds');
            var refreshToken = localStorageService.getItemSync('refreshToken');
            var accessToken = localStorageService.getItemSync('accessToken');

            console.debug('QuantiModo.getOrRefreshAccessTokenOrLogin: Values from local storage:', JSON.stringify({
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
                console.debug('QuantiModo.getOrRefreshAccessTokenOrLogin: Current access token should not be expired. Resolving token using one from local storage');
                deferred.resolve(accessToken);
            } else if (refreshToken && expiresAtMilliseconds && utilsService.getClientId() !== 'oAuthDisabled') {
                console.debug(now + ' (now) is greater than expiresAt ' + expiresAtMilliseconds);
                QuantiModo.refreshAccessToken(refreshToken, deferred);
            } else if(utilsService.getClientId() === 'oAuthDisabled') {
                    //console.debug('getAccessTokenFromAnySource: oAuthDisabled so we do not need an access token');
                    deferred.resolve();
                    return deferred.promise;
            } else {
                console.warn('Could not get or refresh access token');
                deferred.resolve();
            }

            return deferred.promise;
        };

        QuantiModo.refreshAccessToken = function(refreshToken, deferred) {
            console.debug('Refresh token will be used to fetch access token from ' +
                utilsService.getURL("api/oauth2/token") + ' with client id ' + utilsService.getClientId());
            var url = utilsService.getURL("api/oauth2/token");
            $http.post(url, {
                client_id: utilsService.getClientId(),
                client_secret: utilsService.getClientSecret(),
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }).success(function (data) {
                // update local storage
                if (data.error) {
                    console.debug('Token refresh failed: ' + data.error);
                    deferred.reject('Token refresh failed: ' + data.error);
                } else {
                    var accessTokenRefreshed = QuantiModo.saveAccessTokenInLocalStorage(data);
                    console.debug('QuantiModo.refreshAccessToken: access token successfully updated from api server: ' + JSON.stringify(data));
                    deferred.resolve(accessTokenRefreshed);
                }
            }).error(function (response) {
                console.debug("QuantiModo.refreshAccessToken: failed to refresh token from api server" + JSON.stringify(response));
                deferred.reject(response);
            });

        };
        
        QuantiModo.saveAccessTokenInLocalStorage = function (accessResponse) {
            var accessToken = accessResponse.accessToken || accessResponse.access_token;
            if (accessToken) {
                $rootScope.accessToken = accessToken;
                localStorageService.setItem('accessToken', accessToken);
            } else {
                console.error('No access token provided to QuantiModo.saveAccessTokenInLocalStorage');
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

        QuantiModo.convertToObjectIfJsonString = function (stringOrObject) {
            try {
                stringOrObject = JSON.parse(stringOrObject);
            } catch (exception) {
                return stringOrObject;
            }
            return stringOrObject;
        };

        QuantiModo.generateV1OAuthUrl= function(register) {
            var url = $rootScope.qmApiUrl + "/api/oauth2/authorize?";
            // add params
            url += "response_type=code";
            url += "&client_id=" + utilsService.getClientId();
            url += "&client_secret=" + utilsService.getClientSecret();
            url += "&scope=" + utilsService.getPermissionString();
            url += "&state=testabcd";
            if(register === true){
                url += "&register=true";
            }
            //url += "&redirect_uri=" + utilsService.getRedirectUri();
            return url;
        };

        QuantiModo.generateV2OAuthUrl= function(JWTToken) {
            var url = utilsService.getURL("api/v2/bshaffer/oauth/authorize", true);
            url += "response_type=code";
            url += "&client_id=" + utilsService.getClientId();
            url += "&client_secret=" + utilsService.getClientSecret();
            url += "&scope=" + utilsService.getPermissionString();
            url += "&state=testabcd";
            url += "&token=" + JWTToken;
            //url += "&redirect_uri=" + utilsService.getRedirectUri();
            return url;
        };

        QuantiModo.getAuthorizationCodeFromUrl = function(event) {
            console.debug('extracting authorization code from event: ' + JSON.stringify(event));
            var authorizationUrl = event.url;
            if(!authorizationUrl) {
                authorizationUrl = event.data;
            }

            var authorizationCode = utilsService.getUrlParameter(authorizationUrl, 'code');

            if(!authorizationCode) {
                authorizationCode = utilsService.getUrlParameter(authorizationUrl, 'token');
            }
            return authorizationCode;
        };

        // get access token from authorization code
        QuantiModo.getAccessTokenFromAuthorizationCode= function (authorizationCode) {
            console.debug("Authorization code is " + authorizationCode);

            var deferred = $q.defer();

            var url = utilsService.getURL("api/oauth2/token");

            // make request
            var request = {
                method: 'POST',
                url: url,
                responseType: 'json',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    client_id: utilsService.getClientId(),
                    client_secret: utilsService.getClientSecret(),
                    grant_type: 'authorization_code',
                    code: authorizationCode,
                    redirect_uri: utilsService.getRedirectUri()
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

        QuantiModo.getTokensAndUserViaNativeSocialLogin = function (provider, accessToken) {
            var deferred = $q.defer();

            if(!accessToken || accessToken === "null"){
                bugsnagService.reportError("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
                deferred.reject("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
            }
            var url = utilsService.getURL('api/v2/auth/social/authorizeToken');

            url += "provider=" + encodeURIComponent(provider);
            url += "&accessToken=" + encodeURIComponent(accessToken);
            url += "&client_id=" + encodeURIComponent(utilsService.getClientId());

            console.debug('QuantiModo.getTokensAndUserViaNativeSocialLogin about to make request to ' + url);

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

        QuantiModo.registerDeviceToken = function(deviceToken){
            var deferred = $q.defer();

            if(!$rootScope.isMobile){
                deferred.reject('Not on mobile so not posting device token');
                return deferred.promise;
            }

            console.debug("Posting deviceToken to server: ", deviceToken);
            QuantiModo.postDeviceToken(deviceToken, function(response){
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

        QuantiModo.setUserInLocalStorageBugsnagIntercomPush = function(user){
            localStorageService.setItem('user', JSON.stringify(user));
            QuantiModo.saveAccessTokenInLocalStorage(user);
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
                QuantiModo.registerDeviceToken(deviceTokenToSync);
            }
            if($rootScope.sendReminderNotificationEmails){
                QuantiModo.updateUserSettingsDeferred({sendReminderNotificationEmails: $rootScope.sendReminderNotificationEmails});
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

        QuantiModo.refreshUser = function(){
            var deferred = $q.defer();
            QuantiModo.getUser(function(user){
                QuantiModo.setUserInLocalStorageBugsnagIntercomPush(user);
                deferred.resolve(user);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        QuantiModo.sendToNonOAuthBrowserLoginUrl = function(register) {
            var loginUrl = utilsService.getURL("api/v2/auth/login");
            if (register === true) {
                loginUrl = utilsService.getURL("api/v2/auth/register");
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

        QuantiModo.refreshUserEmailPreferences = function(params){
            var deferred = $q.defer();
            QuantiModo.getUserEmailPreferences(params, function(user){
                QuantiModo.setUserInLocalStorageBugsnagIntercomPush(user);
                deferred.resolve(user);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        QuantiModo.clearTokensFromLocalStorage = function(){
            localStorageService.deleteItem('accessToken');
            localStorageService.deleteItem('refreshToken');
            localStorageService.deleteItem('expiresAtMilliseconds');
        };

        QuantiModo.updateUserSettingsDeferred = function(params){
            var deferred = $q.defer();
            QuantiModo.postUserSettings(params, function(response){
                if(!params.userEmail) {
                    QuantiModo.refreshUser().then(function(user){
                        console.debug('updateUserSettingsDeferred got this user: ' + JSON.stringify(user));
                    }, function(error){
                        console.error('QuantiModo.updateUserSettingsDeferred could not refresh user because ' + JSON.stringify(error));
                    });
                }
                deferred.resolve(response);
            }, function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        QuantiModo.getFavoriteTrackingRemindersFromLocalStorage = function(variableCategoryName){
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
            $rootScope.favoritesArray = QuantiModo.attachVariableCategoryIcons($rootScope.favoritesArray);
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
        };

        QuantiModo.attachVariableCategoryIcons = function(dataArray){
            if(!dataArray){
                return;
            }
            var variableCategoryInfo;
            for(var i = 0; i < dataArray.length; i++){
                variableCategoryInfo = QuantiModo.getVariableCategoryInfo(dataArray[i].variableCategoryName);
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

        QuantiModo.getVariableCategoryInfo = function (variableCategoryName) {

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

        QuantiModo.getPairs = function (params, successHandler, errorHandler){
            var minimumSecondsBetweenRequests = 0;
            QuantiModo.get('api/v1/pairs',
                ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'causeVariableName', 'effectVariableName'],
                params,
                successHandler,
                errorHandler,
                minimumSecondsBetweenRequests
            );
        };

        QuantiModo.getPairsDeferred = function (params, successHandler, errorHandler){
            var deferred = $q.defer();
            QuantiModo.getPairs(params, function (pairs) {
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

        return QuantiModo;
    });