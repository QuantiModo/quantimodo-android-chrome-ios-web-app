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

                    // mashape headers
                    if(config.get('use_mashape') && config.getMashapeKey()) {
                        request.headers['X-Mashape-Key'] = config.getMashapeKey();
                        console.log('added mashape_key', request.headers);
                    }
                    $http(request).success(successHandler).error(function(data,status,headers,config){
                        Bugsnag.notify("API Request to "+request.url+" Failed",data.error.message,{},"error");
                        errorHandler(data,status,headers,config);
                    });

                }, onRequestFailed);
            };


            // POST method with the added token
            QuantiModo.post = function(baseURL, requiredFields, items, successHandler, errorHandler){
                authService.getAccessToken().then(function(token){
                    
                    console.log("TOKKEN : ", token.accessToken);
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

                    // mashape headers
                    if(config.get('use_mashape') && config.getMashapeKey()){ 
                        request.headers['X-Mashape-Key'] = config.getMashapeKey();
                        console.log('added mashape_key', request.headers);
                    }

                    $http(request).success(successHandler).error(function(data,status,headers,config){
                        Bugsnag.notify("API Request to "+request.url+" Failed",data.error.message,{},"error");
                        errorHandler(data,status,headers,config);
                    });

                }, errorHandler);
            };

            // get Measuremnets for user
            var getMeasurements = function(params, successHandler, errorHandler){
                QuantiModo.get('api/measurements',
                    ['variableName', 'startTime', 'endTime', 'groupingWidth', 'groupingTimezone', 'source', 'unit','limit','offset','lastUpdated'],
                    params,
                    successHandler,
                    errorHandler);
            };

            QuantiModo.getMeasurements = function(params){
                var defer = $q.defer();
                var response_array = [];
                var successCallback =  function(response){
                    if(response.length === 0){
                        defer.resolve(response_array);
                    }else{
                        response_array = response_array.concat(response);
                        params.offset+=200;
                        defer.notify(response);
                        getMeasurements(params,successCallback,function(){});
                    }
                }

                getMeasurements(params,successCallback,function(){});


                return defer.promise;
            }

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
                var tracking_factor = config.appSettings.primary_tracking_factor_details.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+tracking_factor+'/public/causes',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            //get User's causes
            QuantiModo.getUsersCauses = function (successHandler,errorHandler) {
                var tracking_factor = config.appSettings.primary_tracking_factor_details.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+tracking_factor+'/causes',
                    [],
                    {},
                    successHandler,
                    errorHandler

                );
            };

            // get negative list
            QuantiModo.getNegativeList = function(successHandler, errorHandler){
                var tracking_factor = config.appSettings.primary_tracking_factor_details.name.replace(' ','%20');
                QuantiModo.get('api/v1/variables/'+tracking_factor+'/public/effects',
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
            QuantiModo.getPublicVariables = function(query, successHandler, errorHandler){
                QuantiModo.get('api/variables/search/'+query,
                    ['limit'],
                    {'limit' : '5'},
                    successHandler,
                    errorHandler);
            };

            // get public variables
            QuantiModo.getPublicVariablesByCategory = function(query,cateogry, successHandler, errorHandler){
                QuantiModo.get('api/variables/search/'+query,
                    ['limit','categoryName'],
                    {'limit' : '5',categoryName:cateogry},
                    successHandler,
                    errorHandler);
            };

            // get user variables
            QuantiModo.getVariables = function(successHandler, errorHandler){
                QuantiModo.get('api/variables',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            // get user variables
            QuantiModo.getVariablesByCategory = function(category,successHandler, errorHandler){
                QuantiModo.get('api/variables',
                    ['category'],
                    {category:category},
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
            QuantiModo.getUser = function(successHandler,errorHandler){
                QuantiModo.get('/api/user/me',
                    [],
                    {},
                    successHandler,
                    errorHandler);
            };

            return QuantiModo;
        });