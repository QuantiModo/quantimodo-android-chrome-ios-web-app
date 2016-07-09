angular.module('starter')    
    // QuantiModo API implementation
    .factory('QuantiModo', function($http, $q, authService, localStorageService, $state, $ionicLoading,
                                    $rootScope, $ionicPopup){
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
                    localStorageService.deleteItem('user');
                    $rootScope.user = null;
                    console.warn('QuantiModo.errorHandler: Sending to login because we got 401 with request ' +
                        JSON.stringify(request));
                    console.debug('data: ' + JSON.stringify(data));
                    console.debug('headers: ' + JSON.stringify(headers));
                    console.debug('config: ' + JSON.stringify(config));
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
                authService.getAccessTokenFromAnySource().then(function(tokenObject){
                    
                    // configure params
                    var urlParams = [];
                    for (var key in params) 
                    {
                        if (jQuery.inArray(key, allowedParams) === -1)
                        { 
                            throw 'invalid parameter; allowed parameters: ' + allowedParams.toString(); 
                        }
                        if(params[key]){
                            urlParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                        }
                    }
                    //We can't append access token to Ionic requests for some reason
                    //urlParams.push(encodeURIComponent('access_token') + '=' + encodeURIComponent(tokenObject.accessToken));

                    // configure request
                    var url = config.getURL(baseURL);
                    var request = {   
                        method : 'GET', 
                        url: (url + ((urlParams.length === 0) ? '' : urlParams.join('&'))),
                        responseType: 'json', 
                        headers : {
                            "Authorization" : "Bearer " + tokenObject.accessToken,
                            'Content-Type': "application/json"
                        }
                    };

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
                authService.getAccessTokenFromAnySource().then(function(token){
                    
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

                    // configure request
                    var request = {   
                        method : 'POST', 
                        url: config.getURL(baseURL),
                        responseType: 'json', 
                        headers : {
                            "Authorization" : "Bearer " + token.accessToken,
                            'Content-Type': "application/json"
                        },
                        data : JSON.stringify(items)
                    };

                    $http(request).success(successHandler).error(function(data,status,headers,config){
                        QuantiModo.errorHandler(data,status,headers,config);
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

            QuantiModo.getMeasurements = function(params){
                var defer = $q.defer();
                var response_array = [];
                var errorCallback = function(){
                    defer.resolve(response_array);
                };

                var successCallback =  function(response){
                    if(response.length < 200 || typeof response === "string" || params.offset >= 3000){
                        defer.resolve(response_array);
                    }else{
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
            QuantiModo.postMeasurementsV2 = function(measurementset, successHandler ,errorHandler){
                QuantiModo.post('api/measurements/v2', 
                    ['measurements', 'variableName', 'source', 'variableCategoryName', 'combinationOperation', 'abbreviatedUnitName'],
                    measurementset, 
                    successHandler,
                    errorHandler);
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

            // get positive list
            QuantiModo.getCauses = function(successHandler, errorHandler){
                var primaryOutcomeVariable = config.appSettings.primaryOutcomeVariableDetails.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+primaryOutcomeVariable+'/public/causes',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            //get User's causes
            QuantiModo.getUsersCauses = function (successHandler,errorHandler) {
                var primaryOutcomeVariable = config.appSettings.primaryOutcomeVariableDetails.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+primaryOutcomeVariable+'/causes',
                    [],
                    {},
                    successHandler,
                    errorHandler

                );
            };

            // get negative list
            QuantiModo.getNegativeList = function(successHandler, errorHandler){
                var primaryOutcomeVariable = config.appSettings.primaryOutcomeVariableDetails.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+primaryOutcomeVariable+'/public/effects',
                    [],
                    {},
                    successHandler,
                    errorHandler);
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
                    {'limit' : 5, 'includePublic' : true},
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
                    {'limit' : 5, 'categoryName': category, 'includePublic': true},
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
                    { limit:5 },
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
                QuantiModo.get('api/user/me',
                    [],
                    {},
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


            var getTrackingReminderNotifications = function(params, successHandler, errorHandler){
                 QuantiModo.get('api/v1/trackingReminderNotifications',
                     ['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'],
                     params,
                     successHandler,
                     errorHandler);
            };

            QuantiModo.getAllTrackingReminderNotifications = function(params){
                var defer = $q.defer();
                var responseArray = [];
                var allReminderNotifications = [];
                var errorCallback = function(response){
                    defer.resolve(response);
                };

                var successCallback =  function(response){
                    responseArray.success = response.success;
                    allReminderNotifications = allReminderNotifications.concat(response.data);
                    if(response.data.length < 200 || typeof response.data === "string" || params.offset >= 3000){
                        responseArray.data = allReminderNotifications;
                        defer.resolve(responseArray);
                    }else{
                        localStorageService.getItem('user', function(user){
                            if(!user){
                                defer.reject(false);
                            } else {
                                params.offset+=200;
                                params.limit = 200;
                                defer.notify(response);
                                getTrackingReminderNotifications(params,successCallback,errorCallback);
                            }
                        });
                    }
                };

                getTrackingReminderNotifications(params,successCallback,errorCallback);

                return defer.promise;
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

            // delete tracking reminder
            QuantiModo.deleteTrackingReminder = function(reminderId, successHandler, errorHandler){
                if(!reminderId){
                    alert('Could not delete this reminder.  Please contact info@quantimo.do.');
                }
                QuantiModo.post('api/v1/trackingReminders/delete',
                    ['id'],
                    {id: reminderId},
                    successHandler,
                    errorHandler);
            };

            // snooze tracking reminder
            QuantiModo.snoozeTrackingReminder = function(reminderId, successHandler, errorHandler){
                QuantiModo.post('api/v1/trackingReminderNotifications/snooze',
                    ['id'],
                    {id: reminderId},
                    successHandler,
                    errorHandler);
            };

            // skip tracking reminder
            QuantiModo.skipTrackingReminder = function(reminderId, successHandler, errorHandler){
                QuantiModo.post('api/v1/trackingReminderNotifications/skip',
                    ['id'],
                    {id: reminderId},
                    successHandler,
                    errorHandler);
            };

            // track tracking reminder with default value
            QuantiModo.trackTrackingReminder = function(reminderId, modifiedValue, successHandler, errorHandler){
                QuantiModo.post('api/v1/trackingReminderNotifications/track',
                    ['id'],
                    {id: reminderId, modifiedValue: modifiedValue},
                    successHandler,
                    errorHandler);
            };

            return QuantiModo;
        });