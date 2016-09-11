angular.module('starter')

	.factory('authService', function ($http, $q, $state, $ionicLoading, $rootScope, localStorageService, utilsService,
									  bugsnagService, $timeout) {

		var authService = {

            convertToObjectIfJsonString : function (stringOrObject) {
                try {
                    stringOrObject = JSON.parse(stringOrObject);
                } catch (e) {
                    return stringOrObject;
                }
                return stringOrObject;
            },

			generateV1OAuthUrl: function(register) {
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
			},

			generateV2OAuthUrl: function(JWTToken) {
				var url = utilsService.getURL("api/v2/bshaffer/oauth/authorize", true);
				url += "response_type=code";
				url += "&client_id=" + utilsService.getClientId();
				url += "&client_secret=" + utilsService.getClientSecret();
				url += "&scope=" + utilsService.getPermissionString();
				url += "&state=testabcd";
				url += "&token=" + JWTToken;
				//url += "&redirect_uri=" + utilsService.getRedirectUri();
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

			// get access token from authorization code
			getAccessTokenFromAuthorizationCode: function (authorizationCode) {
				console.log("Authorization code is " + authorizationCode);

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

				console.log('getAccessTokenFromAuthorizationCode: request is ', request);
				console.log(JSON.stringify(request));

				// post
				$http(request).success(function (response) {
					if(response.error){
						bugsnagService.reportError(response);
						alert(response.error + ": " + response.error_description + ".  Please try again or contact mike@quantimo.do.");
						deferred.reject(response);
					} else {
						console.log('getAccessTokenFromAuthorizationCode: Successful response is ', response);
						console.log(JSON.stringify(response));
						deferred.resolve(response);
					}
				}).error(function (response) {
					console.log('getAccessTokenFromAuthorizationCode: Error response is ', response);
					console.log(JSON.stringify(response));
					deferred.reject(response);
				});

				return deferred.promise;
			},

        checkAuthOrSendToLogin: function() {
            $rootScope.user = localStorageService.getItemAsObject('user');
            if($rootScope.user){
				return true;
			}
			$rootScope.accessTokenInUrl = $rootScope.getAccessTokenFromUrlParameter();
			var url = utilsService.getURL("api/user");
            if($rootScope.accessTokenInUrl){
				url = url + 'accessToken=' + $rootScope.accessTokenInUrl;
			}

			$http.get(url).then(
				function (userCredentialsResp) {
					console.log('authService.getAccessTokenFromAnySource calling setUserInLocalStorageBugsnagAndRegisterDeviceForPush');
					$rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush(userCredentialsResp.data);
				},
				function (errorResp) {
					$ionicLoading.hide();
					console.error('checkAuthOrSendToLogin: Could not get user with ' + url +
						'. Going to login page. Error response: ' + errorResp.message);
					$rootScope.sendToLogin();
				}
			);

        },

        getJWTToken: function (provider, accessToken) {
				var deferred = $q.defer();

				if(!accessToken || accessToken === "null" || accessToken === null){
					if (typeof Bugsnag !== "undefined") {
						Bugsnag.notify("No accessToken", "accessToken not provided to getJWTToken function", {}, "error");
					}
					deferred.reject();
				}
				var url = utilsService.getURL('api/v2/auth/social/authorizeToken');

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

						 $timeout(function () {
						     console.log('10 second delay to try to solve token_invalid issue');
							 deferred.resolve(response.data.data.token);
						 }, 10000);

						//deferred.resolve(response.data.data.token);
					} else {
                        deferred.reject(response);
                    }
				}, function (response) {
					deferred.reject(response);
				});

				return deferred.promise;
			}
		};

		return authService;
	});
