angular.module('starter')

	.factory('authService', function ($http, $q, localStorageService, utilsService, $state, $ionicLoading, $rootScope) {

		var authSrv = {

			setUserForIntercom :	function(userObject) {
				if(userObject){
					window.intercomSettings = {
						app_id: "uwtx2m33",
						name: userObject.displayName,
						email: userObject.email,
						user_id: userObject.id
					};
				}
				return userObject;
			},

			getOrSetUserInLocalStorage : function() {
				var userObject = localStorageService.getItemSync('user');
				if(!userObject){
					userObject = authSrv.getUserAndSetInLocalStorage();
				}
				authSrv.setUserForIntercom(userObject);
				return userObject;
			},
            
            getUserFromLocalStorage : function () {
                var user = localStorageService.getItemSync('user');
                return user;
            },

			// extract values from token response and saves in localstorage
			updateAccessToken: function (accessResponse) {
				if(accessResponse){
					var accessToken = accessResponse.accessToken || accessResponse.access_token;
					var expiresIn = accessResponse.expiresIn || accessResponse.expires_in;
					var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;

					// save in localStorage
					if(accessToken) {
						localStorageService.setItem('accessToken', accessToken);
                    }
					if(refreshToken) {
						localStorageService.setItem('refreshToken', refreshToken);
                    }

					console.log("expires in: ", JSON.stringify(expiresIn), parseInt(expiresIn, 10));

					// calculate expires at
					var expiresAt = new Date().getTime() + parseInt(expiresIn, 10) * 1000 - 60000;

					// save in localStorage
					if(expiresAt) {
						localStorageService.setItem('expiresAt', expiresAt);
                    }
					authSrv.getUserAndSetInLocalStorage();
					return accessToken;
				} else {
					return "";
                }
			},

			generateV1OAuthUrl: function(register) {
				var url = config.getApiUrl() + "/api/oauth2/authorize?";
				// add params
				url += "response_type=code";
				url += "&client_id="+config.getClientId();
				url += "&client_secret="+config.getClientSecret();
				url += "&scope="+config.getPermissionString();
				url += "&state=testabcd";
				if(register === true){
					url += "&register=true";
				}
				//url += "&redirect_uri=" + config.getRedirectUri();
				return url;
			},

			generateV2OAuthUrl: function(JWTToken) {
				var url = config.getURL("api/v2/bshaffer/oauth/authorize", true);
				url += "response_type=code";
				url += "&client_id=" + config.getClientId();
				url += "&client_secret=" + config.getClientSecret();
				url += "&scope=" + config.getPermissionString();
				url += "&state=testabcd";
				url += "&token=" + JWTToken;
				//url += "&redirect_uri=" + config.getRedirectUri();
				return url;
			},

			getAuthorizationCodeFromUrl: function(event) {
				console.log('extracting authorization code from event: ' + JSON.stringify(event));
                var authorizationUrl = event.url;
                if(!authorizationUrl) {
                    authorizationUrl = event.data;
                }

				var authorizationCode = utilsService.getUrlParameter(authorizationUrl, 'code');

				if(!authorizationCode) {
					authorizationCode = utilsService.getUrlParameter(authorizationUrl, 'token');
				}
				return authorizationCode;
			},

			nonNativeMobileLogin: function(register) {
				console.log("nonNativeMobileLogin: Mobile device detected and ionic platform is " + ionic.Platform.platforms[0]);
				console.log(JSON.stringify(ionic.Platform.platforms));

				var url = authSrv.generateV1OAuthUrl(register);

				console.log('nonNativeMobileLogin: open the auth window via inAppBrowser.');
				var ref = window.open(url,'_blank', 'location=no,toolbar=yes');

				console.log('nonNativeMobileLogin: listen to its event when the page changes');
				ref.addEventListener('loadstart', function(event) {

					console.log(JSON.stringify(event));
					console.log('nonNativeMobileLogin: The event.url is ' + event.url);
					console.log('nonNativeMobileLogin: The redirection url is ' + config.getRedirectUri());

					console.log('nonNativeMobileLogin: Checking if changed url is the same as redirection url.');
					if(utilsService.startsWith(event.url, config.getRedirectUri())) {

						console.log('nonNativeMobileLogin: event.url starts with ' + config.getRedirectUri());
						if(!utilsService.getUrlParameter(event.url,'error')) {

							var authorizationCode = authSrv.getAuthorizationCodeFromUrl(event);
							console.log('nonNativeMobileLogin: Closing inAppBrowser.');
							ref.close();
							console.log('nonNativeMobileLogin: Going to get an access token using authorization code.');
							authSrv.fetchAccessTokenAndUserDetails(authorizationCode);

						} else {

							console.log("nonNativeMobileLogin: error occurred", utilsService.getUrlParameter(event.url, 'error'));

							console.log('nonNativeMobileLogin: close inAppBrowser');
							ref.close();
						}
					}

				});
			},
			
			chromeLogin: function(register) {
				if(chrome.identity){
					console.log("login: Code running in a Chrome extension (content script, background page, etc.");

					var url = authSrv.generateV1OAuthUrl(register);
					
					chrome.identity.launchWebAuthFlow({
						'url': url,
						'interactive': true
					}, function(redirect_url) {
						var authorizationCode = authSrv.getAuthorizationCodeFromUrl(event);
						authSrv.getAccessTokenFromAuthorizationCode(authorizationCode);
					});
				} else {
					console.log("It is an extension, so we use sessions instead of OAuth flow. ");
					chrome.tabs.create({ url: config.getApiUrl() + "/" });
				}
			},

			nonOAuthBrowserLogin : function(register) {
                var user = authSrv.getOrSetUserInLocalStorage();
                if(user){
                    $state.go(config.appSettings.defaultState);
                }
                if(!user){
                    var loginUrl = config.getURL("api/v2/auth/login");
                    if (register === true) {
                        loginUrl = config.getURL("api/v2/auth/register");
                    }
                    console.log("nonOAuthBrowserLogin: Client id is oAuthDisabled - will redirect to regular login.");
                    loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href);
                    console.debug('nonOAuthBrowserLogin: AUTH redirect URL created:', loginUrl);
                    var apiUrl = config.getApiUrl();
                    var apiUrlMatchesHostName = apiUrl.indexOf(window.location.hostname);
                    if(apiUrlMatchesHostName > -1) {
                        window.location.replace(loginUrl);
                    } else {
                        alert("API url doesn't match auth base url.  Please make use the same domain in config file");
                    }
                }
			},

			oAuthBrowserLogin : function (register) {
				var url = authSrv.generateV1OAuthUrl(register);

				var ref = window.open(url, '_blank');

				if (!ref) {
					alert("You must first unblock popups, and and refresh the page for this to work!");
				} else {
					// broadcast message question every second to sibling tabs
					var interval = setInterval(function () {
						ref.postMessage('isLoggedIn?', config.getRedirectUri());
					}, 1000);

					// handler when a message is received from a sibling tab
					window.onMessageReceived = function (event) {
						console.log("message received from sibling tab", event.url);

						if(interval !== false){
							// Don't ask login question anymore
							clearInterval(interval);
							interval = false;

							// the url that QuantiModo redirected us to
							var iframe_url = event.data;

							// validate if the url is same as we wanted it to be
							if (utilsService.startsWith(iframe_url, config.getRedirectUri())) {
								// if there is no error
								if (!utilsService.getUrlParameter(iframe_url, 'error')) {
									var authorizationCode = authSrv.getAuthorizationCodeFromUrl(event);
									// get access token from authorization code
									authSrv.fetchAccessTokenAndUserDetails(authorizationCode);

									// close the sibling tab
									ref.close();

								} else {
									// TODO : display_error
									console.log("Error occurred validating redirect url. Closing the sibling tab.",
										utilsService.getUrlParameter(iframe_url, 'error'));

									// close the sibling tab
									ref.close();
								}
							}
						}
					};

					// listen to broadcast messages from other tabs within browser
					window.addEventListener("message", window.onMessageReceived, false);
				}
			},

			browserLogin: function(register) {
				console.log("Browser Login");
				if (config.getClientId() !== 'oAuthDisabled') {
					authSrv.oAuthBrowserLogin(register);
				} else {
					authSrv.nonOAuthBrowserLogin(register);
				}
			},


			// retrieves access token.
			// if expired, renews it
            getAccessTokenFromUrlParameter: function () {
                var tokenInGetParams = authSrv.utilsService.getUrlParameter(location.href, 'accessToken');

                if (!tokenInGetParams) {
                    tokenInGetParams = authSrv.utilsService.getUrlParameter(location.href, 'access_token');
                }
                return tokenInGetParams;
            },
            // if not logged in, returns rejects
            getAccessTokenFromAnySource: function () {

				var deferred = $q.defer();
                var tokenInGetParams = this.getAccessTokenFromUrlParameter();

				//check if token in get params
				if (tokenInGetParams) {
					localStorageService.setItem('accessToken', tokenInGetParams);
					//resolving promise using token fetched from get params
					console.log('resolving token using token url parameter', tokenInGetParams);
					deferred.resolve({
						accessToken: tokenInGetParams
					});
					return deferred.promise;
				}

				if (localStorageService.getItemSync('accessToken')) {
					console.log('resolving token using value from local storage');
					deferred.resolve({
						accessToken: localStorageService.getItemSync('accessToken')
					});
					return deferred.promise;
				}

				if(config.getClientId() !== 'oAuthDisabled') {
					authSrv._defaultGetAccessToken(deferred);
					return deferred.promise;
				}

				if(config.getClientId() === 'oAuthDisabled') {
					authSrv.getAccessTokenFromUserEndpoint(deferred);
					return deferred.promise;
				}

			},

            getAccessTokenFromUserEndpoint: function (deferred) {
                console.log('trying to fetch user credentials with call to /api/user');
                $http.get(config.getURL("api/user")).then(
                    function (userCredentialsResp) {
                        console.log('direct API call was successful. User credentials fetched:', userCredentialsResp);
                        Bugsnag.metaData = {
                            user: {
                                name: userCredentialsResp.data.displayName,
                                email: userCredentialsResp.data.email
                            }
                        };
                        localStorageService.setItem('user', JSON.stringify(userCredentialsResp));
                        
                        //get token value from response
                        var token = userCredentialsResp.data.token.split("|")[2];
                        //update locally stored token
                        localStorageService.setItem('accessToken', token);

                        //resolve promise
                        deferred.resolve({
                            accessToken: token
                        });

                    },
                    function (errorResp) {

                        console.log('getAccessTokenFromUserEndpoint: failed to fetch user credentials', errorResp);
                        console.log('getAccessTokenFromUserEndpoint: client id is ' + config.getClientId());
                        console.log('getAccessTokenFromUserEndpoint: Platform is browser: ' + ionic.Platform.is('browser'));
                        console.log('getAccessTokenFromUserEndpoint: Platform is ios: ' + ionic.Platform.is('ios'));
                        console.log('getAccessTokenFromUserEndpoint: Platform is android: ' + ionic.Platform.is('android'));

                        //Using OAuth on Staging for tests
                        if(!ionic.Platform.is('ios') && !ionic.Platform.is('android') &&
                            config.getClientId() === 'oAuthDisabled' &&
                            !(window.location.origin.indexOf('staging.quantimo.do') > -1)){
                            console.log("getAccessTokenFromUserEndpoint: Browser Detected and client id is oAuthDisabled.  ");
                            $ionicLoading.hide();
                            $state.go('app.login');
                        } else {
                            authSrv._defaultGetAccessToken(deferred);
                        }
                    }
                );
            },

			// get access token from authorization code
			getAccessTokenFromAuthorizationCode: function (authorizationCode) {
				console.log("Authorization code is " + authorizationCode);

				var deferred = $q.defer();

				var url = config.getURL("api/oauth2/token");

				// make request
				var request = {
					method: 'POST',
					url: url,
					responseType: 'json',
					headers: {
						'Content-Type': "application/json"
					},
					data: {
						client_id: config.getClientId(),
						client_secret: config.getClientSecret(),
						grant_type: 'authorization_code',
						code: authorizationCode,
						redirect_uri: config.getRedirectUri()
					}
				};

				console.log('getAccessTokenFromAuthorizationCode: request is ', request);
				console.log(JSON.stringify(request));

				// post
				$http(request).success(function (response) {
					console.log('getAccessTokenFromAuthorizationCode: Successful response is ', response);
					console.log(JSON.stringify(response));
					deferred.resolve(response);
				}).error(function (response) {
					console.log('getAccessTokenFromAuthorizationCode: Error response is ', response);
					console.log(JSON.stringify(response));
					deferred.reject(response);
				});

				return deferred.promise;
			},

			getJWTToken: function (provider, accessToken) {
				var deferred = $q.defer();

				var url = config.getURL('api/v2/auth/social/authorizeToken');

				url += "provider=" + provider;
				url += "&accessToken=" + accessToken;

				$http({
					method: 'GET',
					url: url,
					headers: {
						'Content-Type': 'application/json'
					}
				}).then(function (response) {
					if (response.data.success && response.data.data && response.data.data.token) {
						deferred.resolve(response.data.data.token);
					} else {
                        deferred.reject(response);
                    }
				}, function (response) {
					deferred.reject(response);
				});

				return deferred.promise;
			},

			_defaultGetAccessToken: function (deferred) {

				console.log('access token resolving flow');

				var now = new Date().getTime();
				var expiresAt = localStorageService.getItemSync('expiresAt');
				var refreshToken = localStorageService.getItemSync('refreshToken');
				var accessToken = localStorageService.getItemSync('accessToken');

				console.log('Values from local storage:', {
					expiresAt: expiresAt,
					refreshToken: refreshToken,
					accessToken: accessToken
				});

				// get expired time
				if (now < expiresAt) {

					console.log('Current token should not be expired');
					// valid token
					console.log('Resolving token using value from local storage');

					deferred.resolve({
						accessToken: accessToken
					});

				} else if (refreshToken) {
                    authSrv.refreshAccessToken(refreshToken, deferred);
				} else {
					localStorage.removeItem('accessToken');
					console.warn('Refresh token is undefined. Not enough data for oauth flow. rejecting token promise. ' +
						'Clearing accessToken from local storage if it exists and sending to login page...');
                    $state.go('app.login');
					deferred.reject();
				}

			},

            refreshAccessToken: function(refreshToken, deferred) {
                console.log('Refresh token will be used to fetch access token from ' +
                    config.getURL("api/oauth2/token") + ' with client id ' + config.getClientId());

                var url = config.getURL("api/oauth2/token");

                //expire token, refresh
                $http.post(url, {

                    client_id: config.getClientId(),
                    client_secret: config.getClientSecret(),
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                }).success(function (data) {
                    // update local storage
                    if (data.error) {
                        console.log('Token refresh failed: ' + data.error);
                        deferred.reject('refresh failed');
                    } else {
                        var accessTokenRefreshed = authSrv.updateAccessToken(data);

                        console.log('access token successfully updated from api server', data);
                        console.log('resolving toke using response value');
                        // respond
                        deferred.resolve({
                            accessToken: accessTokenRefreshed
                        });
                    }

                }).error(function (response) {
                    console.log("failed to refresh token from api server", response);
                    // error refreshing
                    deferred.reject(response);
                });

            },
			
			checkIfLoggedInAndRedirectToLoginIfNecessary : function(){
                utilsService.loadingStart();
                authSrv.getAccessTokenFromAnySource().then(function(data) 
                {
                    $ionicLoading.hide();
                }, function () {
                    $ionicLoading.hide();
                    console.log('need to login again');
                    $state.go('app.login');
                });
			},

			// get Access Token
			fetchAccessTokenAndUserDetails: function(authorization_code, withJWT) {
			authSrv.getAccessTokenFromAuthorizationCode(authorization_code, withJWT)
				.then(function(response) {

					if(response.error){
						console.error("Error generating access token");
						console.log('response', response);
						localStorageService.setItem('user', null);
					} else {
						console.log("Access token received",response);
						if(typeof withJWT !== "undefined" && withJWT === true) {
							authSrv.updateAccessToken(response, withJWT);
						}
						else {
							authSrv.updateAccessToken(response);
						}
                        

						// get user details from server
						authSrv.getUserAndSetInLocalStorage();

						$rootScope.$broadcast('callAppCtrlInit');
					}
				})
				.catch(function(err){

					console.log("error in generating access token", err);
					// set flags
					localStorageService.setItem('user', null);
				});
			},
			getUserAndSetInLocalStorage: function(){
				authSrv.apiGet('api/user/me',
					[],
					{},
					function(userObject){

						// set user data in local storage
						localStorageService.setItem('user', JSON.stringify(userObject));
						authSrv.setUserForIntercom(userObject);
						authSrv.userName = userObject.displayName;
						return userObject;
					},function(err){

						// error
						console.log(err);
					}
				);
			},
			setUserInLocalStorageIfWeHaveAccessToken: function(){
				localStorageService.getItem('accessToken',function(accessToken){
					if(accessToken) {
						authSrv.getUserAndSetInLocalStorage();
					}
				});
			},
			apiGet: function(baseURL, allowedParams, params, successHandler, errorHandler){
				authSrv.getAccessTokenFromAnySource().then(function(token){

					// configure params
					var urlParams = [];
					for (var key in params)
					{
						if (jQuery.inArray(key, allowedParams) === -1)
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
						if (data && data.error && data.error.message) {
                            error = data.error.message;
                        }
						Bugsnag.notify("API Request to "+request.url+" Failed",error,{},"error");
						errorHandler(data,status,headers,config);
					});

				});
			},
			utilsService: utilsService
		};

		return authSrv;
	});
