angular.module('starter')

	.factory('authService', function ($http, $q, localStorageService, utilsService, $state, $ionicLoading) {

		var authSrv = {

			// extract values from token response and saves in localstorage
			updateAccessToken: function (accessResponse) {
				if(accessResponse){
					var accessToken = accessResponse.accessToken || accessResponse.access_token;
					var expiresIn = accessResponse.expiresIn || accessResponse.expires_in;
					var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;

					// save in localStorage
					if(accessToken) localStorageService.setItem('accessToken', accessToken);
					if(refreshToken) localStorageService.setItem('refreshToken', refreshToken);

					console.log("expires in: ", JSON.stringify(expiresIn), parseInt(expiresIn, 10));

					// calculate expires at
					var expiresAt = new Date().getTime() + parseInt(expiresIn, 10) * 1000 - 60000;

					// save in localStorage
					if(expiresAt) localStorageService.setItem('expiresAt', expiresAt);

					return accessToken;
				} else return "";
			},

			// retrieves access token.
			// if expired, renews it
			// if not logged in, returns rejects
			getAccessToken: function () {

				var deferred = $q.defer();

				var tokenInGetParams = authSrv.utilsService.getUrlParameter(location.href, 'accessToken');

				if(!tokenInGetParams)
					tokenInGetParams = authSrv.utilsService.getUrlParameter(location.href, 'access_token');

				//check if token in get params
				if (tokenInGetParams) {

					localStorageService.setItem('accessToken', tokenInGetParams)
					//resolving promise using token fetched from get params
					console.log('resolving token using token fetched from get', tokenInGetParams);
					deferred.resolve({
						accessToken: tokenInGetParams
					});
				} else {

					//check if previously we already tried to get token from user credentials
					//this is possible if user logged in with cookie
					console.log('previously tried to fetch credentials:', authSrv.triedToFetchCredentials);
					if (authSrv.triedToFetchCredentials) {

						console.log('previous credentials fetch result:', authSrv.succesfullyFetchedCredentials);
						if (authSrv.succesfullyFetchedCredentials) {

							console.log('resolving token using value from local storage');

							deferred.resolve({
								accessToken: localStorageService.getItemSync('accessToken')
							});

						} else {

							console.log('starting oauth token fetching flow');

							authSrv._defaultGetAccessToken(deferred);

						}

					} else {
						console.log('trying to fetch user credentials');
						//try to fetch credentials with call to /api/user
						$http.get(config.getURL("api/user")).then(
							function (userCredentialsResp) {
								//if direct API call was successful
								console.log('User credentials fetched:', userCredentialsResp);

								Bugsnag.metaData = {
									user: {
										name: userCredentialsResp.data.displayName,
										email: userCredentialsResp.data.email
									}
								};

								//get token value from response
								var token = userCredentialsResp.data.token.split("|")[2];
								//update locally stored token
								localStorageService.setItem('accessToken', token);

								//set flags
								authSrv.triedToFetchCredentials = true;
								authSrv.succesfullyFetchedCredentials = true;

								//resolve promise
								deferred.resolve({
									accessToken: token
								});

							},
							function (errorResp) {
								//if no luck with getting credentials
								console.log('failed to fetch user credentials', errorResp);

								console.log('client id is ' + config.getClientId());

								console.log('Platform is ' + JSON.stringify(ionic.Platform.platforms[0]));

								//Using OAuth on Staging for tests
								if(ionic.Platform.platforms[0] === "browser"
									&& config.getClientId() == 'oAuthDisabled'
								    && !(window.location.origin.indexOf('staging.quantimo.do') > -1)){
										console.log("Browser Detected and client id is oAuthDisabled.  ");
									    $ionicLoading.hide();
										$state.go('app.login');
										// var loginUrl = config.getURL("api/v2/auth/login");
										// console.log("Client id is oAuthDisabled - will redirect to regular login.");
										// loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href);
										// console.debug('AUTH redirect URL created:', loginUrl);
										// console.debug('GOOD LUCK!');
										// //window.location.replace(loginUrl);
										// var win = window.open(loginUrl, '_blank');
										// win.focus();
								} else {
								//set flags
								authSrv.triedToFetchCredentials = true;
								authSrv.succesfullyFetchedCredentials = false;

								console.log('starting oauth token fetching flow');

								authSrv._defaultGetAccessToken(deferred);
								}
							})

					}

				}
				return deferred.promise;
			},

			// get access token from request token
			getAccessTokenFromRequestToken: function (requestToken, withJWT) {
				console.log("Authorization code is " + requestToken);

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
						code: requestToken,
						redirect_uri: 'https://app.quantimo.do/ionic/Modo/www/callback'
					}
				};

				console.log('getAccessTokenFromRequestToken: request is ', request);
				console.log(JSON.stringify(request));

				// post
				$http(request).success(function (response) {
					console.log('getAccessTokenFromRequestToken: Successful response is ', response);
					console.log(JSON.stringify(response));
					deferred.resolve(response);
				}).error(function (response) {
					console.log('getAccessTokenFromRequestToken: Error response is ', response);
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
					} else deferred.reject(response);
				}, function (response) {
					deferred.reject(response);
				});

				return deferred.promise;
			},

			_defaultGetAccessToken: function (deferred) {

				console.log('oauth token resolving flow');

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

				} else if (typeof refreshToken != "undefined") {

					console.log('Refresh token will be used to fetch access token from server');

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

				} else {
					// nothing in cache
					localStorage.removeItem('accessToken');
					console.warn('Refresh token is undefined. Not enough data for oauth flow. rejecting token promise. ' +
						'Clearing accessToken from local storage.');
					deferred.reject();

				}

			},

			utilsService: utilsService
		};

		return authSrv;
	});
