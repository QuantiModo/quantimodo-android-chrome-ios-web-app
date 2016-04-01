angular.module('starter')    
    // QuantiModo API implementation
    .factory('QuantiModo', function($http, $q, authService){
            var QuantiModo = {};


            // Handler when request is failed
            var onRequestFailed = function(error){
                console.log("Not Allowed! error : "+ error);
            };


            // GET method with the added token
            QuantiModo.get = function(baseURL, allowedParams, params, successHandler, errorHandler){
                authService.getAccessToken().then(function(token){
                    
                    // configure params
                    var urlParams = [];
                    for (var key in params) 
                    {
                        if (jQuery.inArray(key, allowedParams) == -1) 
                        { 
                            throw 'invalid parameter; allowed parameters: ' + allowedParams.toString(); 
                        }
                        urlParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                    }

                    // configure request
                    var url = config.getURL(baseURL);
                    var request = {   
                        method : 'GET', 
                        url: (url + ((urlParams.length == 0) ? '' : urlParams.join('&'))), 
                        responseType: 'json', 
                        headers : {
                            "Authorization" : "Bearer " + token.accessToken,
                            'Content-Type': "application/json"
                        }
                    };

                    console.log("Making request with this token " + token.accessToken);

                    $http(request).success(successHandler).error(function(data,status,headers,config){
                        var error = "Error";
                        if (data && data.error && data.error.message) error = data.error.message; 
                        Bugsnag.notify("API Request to "+request.url+" Failed",error,{},"error");
                        errorHandler(data,status,headers,config);
                    });

                }, onRequestFailed);
            };


            // POST method with the added token
            QuantiModo.post = function(baseURL, requiredFields, items, successHandler, errorHandler){
                authService.getAccessToken().then(function(token){
                    
                    console.log("Token : ", token.accessToken);
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
                       var error = "Error";
                       if (data && data.error && data.error.message) error = data.error.message; 
                       Bugsnag.notify("API Request to "+request.url+" Failed",error,{},"error");
                        errorHandler(data,status,headers,config);
                    });

                }, errorHandler);
            };

            // get Measurements for user
            var getMeasurements = function(params, successHandler, errorHandler){
                QuantiModo.get('api/measurements',
                    ['variableName', 'sort', 'startTime', 'endTime', 'groupingWidth', 'groupingTimezone', 'source', 'unit','limit','offset','lastUpdated'],
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
                    if(response.length === 0 || typeof response === "string" || params.offset >= 3000){
                        defer.resolve(response_array);
                    }else{
                        response_array = response_array.concat(response);
                        params.offset+=200;
                        defer.notify(response);
                        getMeasurements(params,successCallback,errorCallback);
                    }
                }

                getMeasurements(params,successCallback,errorCallback);

                return defer.promise;
            }

            QuantiModo.getV1Measurements = function(params, successHandler, errorHandler){
                QuantiModo.get('api/v1/measurements',
                    ['source', 'limit', 'offset', 'sort'],
                    params,
                    successHandler,
                    errorHandler);
            };

            // post measurements old method
            QuantiModo.postMeasurements= function(measurements, successHandler ,errorHandler) { 
                QuantiModo.post('api/measurements',
                    ['source', 'variable', 'combinationOperation', 'timestamp', 'value', 'unit'],
                    measurements,
                    successHandler,
                    errorHandler);
            };

            // post new Measurements for user
            QuantiModo.postMeasurementsV2 = function(measurementset, successHandler ,errorHandler){
                QuantiModo.post('api/measurements/v2', 
                    ['measurements', 'name', 'source', 'category', 'combinationOperation', 'unit'], 
                    measurementset, 
                    successHandler,
                    errorHandler);
            };

            // get positive list
            QuantiModo.getCauses = function(successHandler, errorHandler){
                var primary_outcome_variable = config.appSettings.primary_outcome_variable_details.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+primary_outcome_variable+'/public/causes',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            //get User's causes
            QuantiModo.getUsersCauses = function (successHandler,errorHandler) {
                var primary_outcome_variable = config.appSettings.primary_outcome_variable_details.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+primary_outcome_variable+'/causes',
                    [],
                    {},
                    successHandler,
                    errorHandler

                );
            };

            // get negative list
            QuantiModo.getNegativeList = function(successHandler, errorHandler){
                var primary_outcome_variable = config.appSettings.primary_outcome_variable_details.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+primary_outcome_variable+'/public/effects',
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

            // get public variables
            QuantiModo.getVariablesIncludePublic = function(query, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/search/' + encodeURIComponent(query),
                    ['limit','includePublic'],
                    {'limit' : 5, 'includePublic' : true},
                    successHandler,
                    errorHandler);
            };

            // get public variables
            QuantiModo.getVariablesByCategoryIncludePublic = function(query, category, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/search/'+ encodeURIComponent(query),
                    ['limit','categoryName','includePublic'],
                    {'limit' : 5, 'categoryName': category, 'includePublic': true},
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

            QuantiModo.getVariable = function(variable, successHandler, errorHandler){
                QuantiModo.get('api/v1/variables/' + encodeURIComponent(variable),
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            // get user variables
            QuantiModo.getVariablesByCategory = function(category,successHandler, errorHandler){
                QuantiModo.get('api/v1/variables',
                    ['category', 'limit'],
                    {category:category, limit:5},
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
                QuantiModo.get('api/user/me',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            // get reminders
            QuantiModo.getTrackingReminders = function(params, successHandler, errorHandler){
                QuantiModo.get('api/v1/trackingReminders',
                    ['variableCategoryName'],
                    params,
                    successHandler,
                    errorHandler);
            };

            // get pending reminders 
            QuantiModo.getTrackingReminderNotifications = function(params, successHandler, errorHandler){
                QuantiModo.get('api/v1/trackingReminderNotifications',
                    ['variableCategoryName'],
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
                        'firstDailyReminderTime',
                        'secondDailyReminderTime',
                        'thirdDailyReminderTime'
                    ],
                    reminder,
                    successHandler,
                    errorHandler);
            };

            // delete tracking reminder
            QuantiModo.deleteTrackingReminder = function(reminderId, successHandler, errorHandler){
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