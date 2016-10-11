angular.module('starter')
    // QuantiModo API implementation
    .factory('QuantiModo', function($http, $q, $rootScope, $ionicPopup, $state,
                                    localStorageService, bugsnagService, utilsService) {
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
            if(status === 302){
                console.warn('QuantiModo.errorHandler: Got 302 response from ' + JSON.stringify(request));
                return;
            }

            if(status === 401){
                console.warn('QuantiModo.errorHandler: Sending to login because we got 401 with request ' +
                    JSON.stringify(request));
                $rootScope.sendToLogin();
                return;
            }
            if(!data){
                bugsnagService.reportError('No data returned from this request: ' + JSON.stringify(request));
                if (!$rootScope.connectionErrorShowing) {
                    $rootScope.connectionErrorShowing = true;
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
                return;
            }
            if(data.success){
                return;
            }
            var error = "Unknown error";
            if (data && data.error) {
                error = data.error;
            }
            if (data && data.error && data.error.message) {
                error = data.error.message;
            }
            if(request) {
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify("API Request to " + request.url + " Failed", error, {}, "error");
                }
            }

            console.error(error);
        };

        // Handler when request is failed
        var onRequestFailed = function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            console.error("Request error : " + error);
        };


        // GET method with the added token
        QuantiModo.get = function(baseURL, allowedParams, params, successHandler, errorHandler){
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
                    .success(successHandler)
                    .error(function (data, status, headers, config) {
                        QuantiModo.errorHandler(data, status, headers, config, request);
                        errorHandler(data);
                    }, onRequestFailed);
                });
            };

        // POST method with the added token
        QuantiModo.post = function(baseURL, requiredFields, items, successHandler, errorHandler){
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
                    QuantiModo.errorHandler(data, status, headers, config, request);
                    errorHandler(data);
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

        QuantiModo.getV1MeasurementsDaily = function(params, successHandler, errorHandler){
            QuantiModo.get('api/v1/measurements/daily',
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
        QuantiModo.getUserVariables = function(variableCategoryName, successHandler, errorHandler){
            var params = {'limit' : 200};
            if(variableCategoryName && variableCategoryName !== 'Anything'){
                params.variableCategoryName = variableCategoryName;
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
            } else {
                localStorageService.deleteItem('accessTokenInUrl');
            }

            return $rootScope.accessTokenInUrl;
        };

        // if not logged in, returns rejects
        QuantiModo.getAccessTokenFromAnySource = function () {

            var deferred = $q.defer();

            if(utilsService.getClientId() === 'oAuthDisabled') {
                //console.debug('getAccessTokenFromAnySource: oAuthDisabled so we do not need an access token');
                deferred.resolve();
                return deferred.promise;
            }

            $rootScope.accessTokenInUrl = QuantiModo.getAccessTokenFromUrlParameter();

            if ($rootScope.accessTokenInUrl) {
                var url = utilsService.getURL("api/user") + 'accessToken=' + $rootScope.accessTokenInUrl;
                if(!$rootScope.user){
                    $http.get(url).then(
                        function (userCredentialsResp) {
                            console.debug('QuantiModo.getAccessTokenFromAnySource calling setUserInLocalStorageBugsnagAndRegisterDeviceForPush');
                            $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush(userCredentialsResp.data);
                        },
                        function (errorResp) {
                            console.debug('Could not get user with accessToken.  error response:', errorResp);
                        }
                    );
                }

                deferred.resolve($rootScope.accessTokenInUrl);
                return deferred.promise;
            }

            $rootScope.accessToken = localStorageService.getItemSync('accessToken');

            if ($rootScope.accessToken) {
                if($rootScope.accessToken.indexOf(' ') > -1){
                    localStorageService.deleteItem('accessToken');
                    $rootScope.accessToken = null;
                    deferred.reject();
                } else {
                    deferred.resolve($rootScope.accessToken);
                }
                return deferred.promise;
            }

            if(utilsService.getClientId() !== 'oAuthDisabled') {
                QuantiModo.getOrRefreshAccessTokenOrLogin(deferred);
                return deferred.promise;
            }

        };

        QuantiModo.getOrRefreshAccessTokenOrLogin = function (deferred) {

            var now = new Date().getTime();
            var expiresAt = localStorageService.getItemSync('expiresAt');
            var refreshToken = localStorageService.getItemSync('refreshToken');
            var accessToken = localStorageService.getItemSync('accessToken');

            console.debug('QuantiModo.getOrRefreshAccessTokenOrLogin: Values from local storage:', JSON.stringify({
                expiresAt: expiresAt,
                refreshToken: refreshToken,
                accessToken: accessToken
            }));

            if (now < expiresAt) {
                console.debug('QuantiModo.getOrRefreshAccessTokenOrLogin: Current access token should not be expired. Resolving token using one from local storage');
                deferred.resolve({
                    accessToken: accessToken
                });

            } else if (refreshToken) {
                QuantiModo.refreshAccessToken(refreshToken, deferred);
            } else {
                console.warn('QuantiModo.getOrRefreshAccessTokenOrLogin: Refresh token is undefined. Not enough data for oauth flow. rejecting token promise. ' +
                    'Clearing accessToken from local storage if it exists and sending to login page...');
                $rootScope.sendToLogin();
                deferred.reject();
            }
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
                    deferred.reject('refresh failed');
                } else {
                    var accessTokenRefreshed = QuantiModo.saveAccessTokenInLocalStorage(data);
                    console.debug('QuantiModo.refreshAccessToken: access token successfully updated from api server: ' + JSON.stringify(data));
                    deferred.resolve({
                        accessToken: accessTokenRefreshed
                    });
                }

            }).error(function (response) {
                console.debug("QuantiModo.refreshAccessToken: failed to refresh token from api server" + JSON.stringify(response));
                deferred.reject(response);
            });

        };

        // extract values from token response and saves in local storage
        QuantiModo.saveAccessTokenInLocalStorage = function (accessResponse) {
            if(accessResponse){
                var accessToken = accessResponse.accessToken || accessResponse.access_token;
                if(accessToken) {
                    localStorageService.setItem('accessToken', accessToken);
                } else {
                    console.warn('No access token provided to QuantiModo.saveAccessTokenInLocalStorage');
                    return;
                }

                var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;
                if(refreshToken) {
                    localStorageService.setItem('refreshToken', refreshToken);
                }

                var expiresAt = accessResponse.expires || accessResponse.expiresAt;
                if(expiresAt){
                    localStorageService.setItem('expiresAt', expiresAt);
                    return;
                }

                // calculate expires at
                var expiresIn = accessResponse.expiresIn || accessResponse.expires_in;
                console.debug("expires in: ", JSON.stringify(expiresIn), parseInt(expiresIn, 10));
                expiresAt = new Date().getTime() + parseInt(expiresIn, 10) * 1000 - 60000;

                // save in localStorage
                if(expiresAt) {
                    localStorageService.setItem('expiresAt', expiresAt);
                }
                $rootScope.accessToken = accessToken;
                return accessToken;
            } else {
                return "";
            }
        };



        QuantiModo.convertToObjectIfJsonString = function (stringOrObject) {
            try {
                stringOrObject = JSON.parse(stringOrObject);
            } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
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

        QuantiModo.setUserUsingAccessTokenInUrl= function() {
            $rootScope.user = localStorageService.getItemAsObject('user');
            if($rootScope.user){
                return true;
            }

            var url = utilsService.getURL("api/user");
            if(QuantiModo.getAccessTokenFromUrlParameter()){
                url = url + 'accessToken=' + $rootScope.accessTokenInUrl;
            }

            $http.get(url).then(
                function (userCredentialsResp) {
                    console.debug('QuantiModo.getAccessTokenFromAnySource calling setUserInLocalStorageBugsnagAndRegisterDeviceForPush');
                    $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush(userCredentialsResp.data);
                },
                function (errorResp) {
                    console.error('checkAuthOrSendToLogin: Could not get user with ' + url +
                        '. Going to login page. Error response: ' + errorResp.message);
                    $rootScope.sendToLogin();
                }
            );

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

        // get user
        QuantiModo.getUser = function(){
            var deferred = $q.defer();

            localStorageService.getItem('user',function(user){
                if(user){
                    user = JSON.parse(user);
                    $rootScope.user = user;
                    deferred.resolve(user);
                } else {
                    QuantiModo.refreshUser().then(function(){
                        deferred.resolve(user);
                    });
                }
            });

            return deferred.promise;
        };

        QuantiModo.refreshUser = function(){
            var deferred = $q.defer();
            QuantiModo.getUser(function(user){
                localStorageService.setItem('user', JSON.stringify(user));
                QuantiModo.saveAccessTokenInLocalStorage(user);
                $rootScope.user = user;
                deferred.resolve(user);
            }, function(){
                deferred.reject(false);
            });
            return deferred.promise;
        };

        QuantiModo.updateUserSettings = function(params){
            var deferred = $q.defer();
            QuantiModo.updateUserSettings(params, function(response){
                QuantiModo.refreshUser();
                deferred.resolve(response);
            }, function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };


        return QuantiModo;
    });