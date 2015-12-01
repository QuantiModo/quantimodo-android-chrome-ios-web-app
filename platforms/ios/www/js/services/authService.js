angular.module('starter')
    
	.factory('authService', function($http, $q,localStorageService) {

		var authSrv =  {

		   	// extract values from token response and saves in localstorage
			updateAccessToken : function (accessResponse) {
			   var accessToken = accessResponse.accessToken || accessResponse.access_token;
			   var expiresIn = accessResponse.expiresIn || accessResponse.expires_in;
			   var refreshToken = accessResponse.refreshToken || accessResponse.refresh_token;

			   // save in localStorage
			   localStorageService.setItem('accessToken',accessToken)
               localStorageService.setItem('refreshToken',refreshToken)
			   console.log("expires in: " , JSON.stringify(expiresIn), parseInt(expiresIn, 10));
			   
			   // calculate expires at
			   var expiresAt = new Date().getTime() + parseInt(expiresIn, 10) * 1000 - 60000;

			   // save in localStorage
			   localStorageService.setItem('expiresAt',expiresAt);

			   return accessToken;

			},

			// retrieves access token.
			// if expired, renews it 
			// if not logged in, returns rejects
			getAccessToken : function () {
			   var deferred = $q.defer();
			   var now = new Date().getTime();

                localStorageService.getItem('expiresAt',function(expiresAt){
                    localStorageService.getItem('refreshToken',function(refreshToken){

                        // get expired time
                        if (now < expiresAt) {

                            console.log('valid token');

                            // valid token

                            localStorageService.getItem('accessToken',function(accessToken){
                                deferred.resolve({
                                    accessToken: accessToken
                                });
                            });

                        } else if (refreshToken) {

                            var url = config.getURL("api/oauth2/token")
                            console.log('expired token, refreshing!');

                            var mashape_headers = {};
							if(config.get('use_mashape') && config.getMashapeKey()){ 
                        		mashape_headers['X-Mashape-Key'] = config.getMashapeKey();
                        		console.log('added mashape_key', mashape_headers);
                        	}
                            //expire token, refresh
                            $http.post(url, {
                                client_id : config.getClientId(),
                                client_secret : config.getClientSecret(),
                                refresh_token: refreshToken,
                                grant_type: 'refresh_token'
                            }, mashape_headers).success(function(data) {
                                // update local storage
                                if (data.error) {
                                	deferred.reject('refresh failed');
                                } else {
                                	var accessTokenRefreshed = authSrv.updateAccessToken(data);

                                	// respond
                                	deferred.resolve({
                                	    accessToken : accessTokenRefreshed
                                	});
                                }

                            }).error(function(response) {
                                console.log("refresh failed");
                                // error refreshing
                                deferred.reject(response);
                            });

                        } else {
                            // nothing in cache
                            console.log('nothing in cache');
                            deferred.reject();
                        }

                    });
                });

			   return deferred.promise;
			},

			// get access token from request token
			getAccessTokenFromRequestToken : function (requestToken, withJWT) {
				console.log("request token : ",requestToken);

				var deferred = $q.defer();

				var url = config.getURL("api/oauth2/token");			
				
				console.log('expired token, refreshing!');

				// make request
				var request = {   
				   method : 'POST', 
				   url: url,
				   responseType: 'json', 
				   headers : {
				       'Content-Type': "application/json"
				   },
				   data : {
				       client_id : config.getClientId(),
				       client_secret : config.getClientSecret(),
				       grant_type : 'authorization_code',
				       code : requestToken,
				       redirect_uri : 'https://app.quantimo.do/ionic/Modo/www/callback'
				   }
				};

				console.log('request is ',request);

				if(config.get('use_mashape') && config.getMashapeKey()) {
					request.headers['X-Mashape-Key'] = config.getMashapeKey();
					console.log('added mashape_key', request.headers);
				}
				
				// post
				$http(request).success(function(response){
				   deferred.resolve(response);
				}).error(function(response){
				   deferred.reject(response);
				});

				return deferred.promise;
			},


			getJWTToken : function(provider, accessToken){
				var deferred = $q.defer();
				
				var url = config.getURL('api/v2/auth/social/authorizeToken');

				url += "provider="+provider;
				url += "&accessToken="+accessToken;

				$http({
				  method: 'GET',
				  url: url,
				  headers : {
				  	'Content-Type' : 'application/json'
				  }
				}).then(function(response){
					if(response.data.success && response.data.data && response.data.data.token) {
						deferred.resolve(response.data.data.token);
					} else deferred.reject(response);
				}, function(response){
				   deferred.reject(response);
				});

				return deferred.promise;	
			}
		};

		return authSrv;
	});