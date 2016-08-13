angular.module('starter')    
    // QuantiModo API implementation
    .factory('QuantiModo', function($http, $q, $rootScope, $ionicPopup, $state, $ionicLoading, authService,
                                    localStorageService) {
            var QuantiModo = {};
            $rootScope.connectionErrorShowing = false; // to prevent more than one popup


            QuantiModo.successHandler = function(data){
                if(!data.success){
                    return;
                }
                if(data.message){
                    alert(data.message);
                }
            };

            QuantiModo.errorHandler = function(data, status, headers, config, request){
                $ionicLoading.hide();
                if(status === 401){
                    localStorageService.deleteItem('accessToken');
                    localStorageService.deleteItem('accessTokenInUrl');
                    $rootScope.accessToken = null;
                    localStorageService.deleteItem('user');
                    $rootScope.user = null;
                    console.warn('QuantiModo.errorHandler: Sending to login because we got 401 with request ' +
                        JSON.stringify(request));
                    $state.go('app.login');
                    return;
                }
                if(!data){
                    console.log('QuantiModo.errorHandler: No data property returned from QM API request');
                    return;
                }
                if(request) {
                    error = data.error.message;
                    Bugsnag.notify("API Request to " + request.url + " Failed", error, {}, "error");
                }
                if(data.success){
                    return;
                }
                var error = "Error";
                if (data && data.error) {
                    error = data.error;
                }
                if (data && data.error && data.error.message) {
                    error = data.error.message;
                }
                console.log(error);
            };

            // Handler when request is failed
            var onRequestFailed = function(error){
                console.log("Not Allowed! error : "+ error);
            };


            // GET method with the added token
            QuantiModo.get = function(baseURL, allowedParams, params, successHandler, errorHandler){
                console.debug('QuantiModo.get: ' + baseURL + '. Going to authService.getAccessTokenFromAnySource');
                authService.getAccessTokenFromAnySource().then(function(accessToken){
                    if(accessToken && accessToken.indexOf(' ') > -1){
                        accessToken = null;
                        localStorageService.deleteItem('accessToken');
                        localStorageService.deleteItem('accessTokenInUrl');
                        $rootScope.accessToken = null;
                        bugsnagService.reportError('ERROR: Access token had white space so probably erroneous! Deleting it now.')
                    }

                    allowedParams.push('limit');
                    allowedParams.push('offset');
                    allowedParams.push('sort');
                    allowedParams.push('updatedAt');
                    // configure params
                    var urlParams = [];
                    for (var key in params) 
                    {
                        if (jQuery.inArray(key, allowedParams) === -1)
                        { 
                            throw 'invalid parameter; allowed parameters: ' + allowedParams.toString(); 
                        }
                        if(typeof params[key] !== "undefined" && params[key] !== null){
                            urlParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                        } else {
                            console.warn("Not including parameter " + key + " in request because it is null or undefined");
                        }
                    }
                    urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent(config.appSettings.appName));
                    urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent($rootScope.appVersion));
                    //We can't append access token to Ionic requests for some reason
                    //urlParams.push(encodeURIComponent('access_token') + '=' + encodeURIComponent(tokenObject.accessToken));

                    // configure request
                    var url = config.getURL(baseURL);
                    var request = {
                        method: 'GET',
                        url: (url + ((urlParams.length === 0) ? '' : urlParams.join('&'))),
                        responseType: 'json',
                        headers: {
                            'Content-Type': "application/json"
                        }
                    };

                    if(accessToken) {
                        request.headers = {
                            "Authorization": "Bearer " + accessToken,
                            'Content-Type': "application/json"
                        };
                    }

                    //console.log("Making this request: " + JSON.stringify(request));

                    $http(request).success(successHandler).error(function(data,status,headers,config){
                        QuantiModo.errorHandler(data, status, headers, config, request);
                        if (!data && !$rootScope.connectionErrorShowing) {
                            $rootScope.connectionErrorShowing = true;
                            $ionicPopup.show({
                                title: 'Not connected:',
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
                        errorHandler(data);
                    });

                }, onRequestFailed);
            };


            // POST method with the added token
            QuantiModo.post = function(baseURL, requiredFields, items, successHandler, errorHandler){
                console.debug('QuantiModo.get: ' + baseURL + '. Going to authService.getAccessTokenFromAnySource');
                authService.getAccessTokenFromAnySource().then(function(accessToken){

                    if(accessToken && accessToken.indexOf(' ') > -1){
                        accessToken = null;
                        localStorageService.deleteItem('accessToken');
                        localStorageService.deleteItem('accessTokenInUrl');
                        $rootScope.accessToken = null;
                        bugsnagService.reportError('ERROR: Access token had white space so probably erroneous! Deleting it now.')
                    }
                    
                    //console.log("Token : ", token.accessToken);
                    // configure params
                    for (var i = 0; i < items.length; i++) 
                    {
                        var item = items[i];
                        for (var j = 0; j < requiredFields.length; j++) { 
                            if (!(requiredFields[j] in item)) { 
                                throw 'missing required field in POST data; required fields: ' + requiredFields.toString(); 
                            } 
                        }
                    }
                    var urlParams = [];
                    urlParams.push(encodeURIComponent('appName') + '=' + encodeURIComponent(config.appSettings.appName));
                    urlParams.push(encodeURIComponent('appVersion') + '=' + encodeURIComponent($rootScope.appVersion));

                    var url = config.getURL(baseURL) + ((urlParams.length === 0) ? '' : urlParams.join('&'));

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

                    if(config.getClientId() !== 'oAuthDisabled' || $rootScope.accessTokenInUrl) {
                        request.headers = {
                            "Authorization" : "Bearer " + accessToken,
                            'Content-Type': "application/json"
                        };
                    }

                    if($rootScope.trackLocation){
                        request.headers.LOCATION = $rootScope.lastLocationNameAndAddress;
                        request.headers.LATITUDE = $rootScope.lastLatitude;
                        request.headers.LONGITUDE = $rootScope.lastLongitude;
                    }

                    $http(request).success(successHandler).error(function(data,status,headers,config){
                        QuantiModo.errorHandler(data,status,headers,config);
                        if (!data && !$rootScope.connectionErrorShowing) {
                            $rootScope.connectionErrorShowing = true;
                            $ionicPopup.show({
                                title: 'Not connected:',
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
                    });

                }, errorHandler);
            };

            // get Measurements for user
            var getMeasurements = function(params, successHandler, errorHandler){
                QuantiModo.get('api/measurements',
                    ['variableName', 'sort', 'startTimeEpoch', 'endTime', 'groupingWidth', 'groupingTimezone', 'source', 'unit','limit','offset','lastUpdated'],
                    params,
                    successHandler,
                    errorHandler);
            };

            QuantiModo.getMeasurementsLooping = function(params, doNotLoop){
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
                                defer.reject(false);
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
                QuantiModo.get('api/v1/measurements',
                    ['source', 'limit', 'offset', 'sort', 'id', 'variableCategoryName', 'variableName'],
                    params,
                    successHandler,
                    errorHandler);
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
                if(!measurementSet[0].measurements){
                    console.error("No measurementSet.measurements provided to QuantiModo.postMeasurementsV2");
                } else {
                    QuantiModo.post('api/measurements/v2',
                        ['measurements', 'variableName', 'source', 'variableCategoryName', 'abbreviatedUnitName'],
                        measurementSet,
                        successHandler,
                        errorHandler);
                }
            };
        
            QuantiModo.logoutOfApi = function(successHandler, errorHandler){
                //TODO: Fix this
                console.log('Logging out of api does not work yet.  Fix it!');        
                QuantiModo.get('api/v2/auth/logout',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };


            QuantiModo.getAggregatedCorrelations = function(params, successHandler, errorHandler){
                QuantiModo.get('api/v1/aggregatedCorrelations',
                    ['correlationCoefficient', 'cause', 'effect'],
                    params,
                    successHandler,
                    errorHandler);
            };


            QuantiModo.getUserCorrelations = function (params, successHandler, errorHandler) {
                QuantiModo.get('api/v1/correlations',
                    ['correlationCoefficient', 'cause', 'effect'],
                    params,
                    successHandler,
                    errorHandler
                );
            };

            // post new correlation for user
            QuantiModo.postCorrelation = function(correlationSet, successHandler ,errorHandler){
                QuantiModo.post('api/v1/correlations', 
                    ['cause', 'effect', 'correlation', 'vote'], 
                    correlationSet, 
                    successHandler,
                    errorHandler);
            };

            // post a vote
            QuantiModo.postVote = function(correlationSet, successHandler ,errorHandler){
                QuantiModo.post('api/v1/votes',
                    ['cause', 'effect', 'correlation', 'vote'],
                    correlationSet,
                    successHandler,
                    errorHandler);
            };

            // delete a vote
            QuantiModo.deleteVote = function(correlationSet, successHandler ,errorHandler){
                QuantiModo.post('api/v1/votes/delete',
                    ['cause', 'effect', 'correlation'],
                    correlationSet,
                    successHandler,
                    errorHandler);
            };

            // search for public variables
            QuantiModo.searchVariablesIncludePublic = function(query, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/search/' + encodeURIComponent(query),
                    ['limit','includePublic'],
                    {'limit' : 100, 'includePublic' : true},
                    successHandler,
                    errorHandler);
            };

            // search for user variables
            QuantiModo.searchUserVariables = function(query, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/search/' + encodeURIComponent(query),
                    ['limit','includePublic'],
                    {'limit' : 100, 'includePublic' : false},
                    successHandler,
                    errorHandler);
            };

            // search for public variables by category
            QuantiModo.searchVariablesByCategoryIncludePublic = function(query, category, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/search/'+ encodeURIComponent(query),
                    ['limit','categoryName','includePublic'],
                    {'limit' : 100, 'categoryName': category, 'includePublic': true},
                    successHandler,
                    errorHandler);
            };

            // search user variables by category
            QuantiModo.searchUserVariablesByCategory = function(query, category, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/search/'+ encodeURIComponent(query),
                    ['limit','categoryName','includePublic'],
                    {'limit' : 100, 'categoryName': category, 'includePublic': false},
                    successHandler,
                    errorHandler);
            };

            // get user variables
            QuantiModo.getVariables = function(successHandler, errorHandler){
                QuantiModo.get('api/v1/variables',
                    ['limit'],
                    { limit:100 },
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
            QuantiModo.getUserVariables = function(category, successHandler, errorHandler){
                if(category){
                    QuantiModo.get('api/v1/variables',
                        ['category', 'limit'],
                        {limit:200},
                        successHandler,
                        errorHandler);
                }
                if(!category){
                    QuantiModo.get('api/v1/variables',
                        ['category', 'limit'],
                        {limit:200},
                        successHandler,
                        errorHandler);
                }
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

            // deletes all of a user's measurements for a variable
            QuantiModo.deleteUserVariableMeasurements = function(variableId, successHandler, errorHandler) {
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

            // get user data
            QuantiModo.getUser = function(successHandler, errorHandler){
                if($rootScope.user){
                    console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user)
                }
                QuantiModo.get('api/user/me',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            // get pending reminders
            QuantiModo.getTrackingReminderNotifications = function(params, successHandler, errorHandler){
                QuantiModo.get('api/v1/trackingReminderNotifications',
                    ['variableCategoryName', 'reminderTime', 'sort', 'reminderFrequency'],
                    params,
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

            // post tracking reminder
            QuantiModo.updateUserSettings = function(params, successHandler, errorHandler) {
                console.debug("QuantiModo.updateUserSettings", params);
                QuantiModo.post('api/v1/userSettings',
                    [],
                    params,
                    successHandler,
                    errorHandler);
            };

            // post tracking reminder
            QuantiModo.postTrackingReminder = function(reminder, successHandler, errorHandler) { 
                console.log(reminder);
                QuantiModo.post('api/v1/trackingReminders',
                    [
                        'variableId', 
                        'defaultValue',
                        'reminderFrequency',
                        'variableName',
                        'variableCategoryName',
                        'abbreviatedUnitName',
                        'combinationOperation',
                        'reminderStartTime'
                    ],
                    reminder,
                    successHandler,
                    errorHandler);
            };


            QuantiModo.postDeviceToken = function(deviceToken, successHandler, errorHandler) {
                var params = {
                    deviceToken: deviceToken
                };
                QuantiModo.post('api/v1/deviceTokens',
                    [
                        'deviceToken'
                    ],
                    params,
                    successHandler,
                    errorHandler);
            };

            // delete tracking reminder
            QuantiModo.deleteTrackingReminder = function(reminderId, successHandler, errorHandler){
                if(!reminderId){
                    console.warn('No reminder id to delete with!  Maybe it has only been stored locally and has not updated from server yet.');
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
                QuantiModo.post('api/v1/trackingReminderNotifications/track',
                    ['id', 'trackingReminderNotificationId', 'trackingReminderId', 'modifiedValue'],
                    params,
                    successHandler,
                    errorHandler);
            };

            return QuantiModo;
        });