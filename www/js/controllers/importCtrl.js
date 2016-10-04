angular.module('starter')
	
	// controls the Import Data page of the app
	.controller('ImportCtrl', function($scope, $ionicLoading, $state, $rootScope, utilsService, QuantiModo,
									   connectorsService, $cordovaOauth, bugsnagService, $ionicPopup, $stateParams) {

		$scope.controller_name = "ImportCtrl";
		
		/*// redirect if not logged in
	    if(!$rootScope.user){

	        $state.go(config.appSettings.welcomeState);
	        // app wide signal to sibling controllers that the state has changed
	        $rootScope.$broadcast('transition');
	    }*/

	    // close the loader
	    window.closeLoading = function(){
	        $ionicLoading.hide();
	    };

	    $scope.refreshConnectors = function(){
			connectorsService.refreshConnectors()
				.then(function(connectors){
					$scope.connectors = connectors;
					$ionicLoading.hide().then(function(){
						console.log("The loading indicator is now hidden");
					});
				});
		};

		var goToWebImportDataPage = function() {
			console.debug('importCtrl.init: Going to QuantiModo.getAccessTokenFromAnySource');
			$state.go(config.appSettings.defaultState);
			QuantiModo.getAccessTokenFromAnySource().then(function(accessToken){
				$ionicLoading.hide();
				if(ionic.Platform.platforms[0] === "browser"){
					console.log("Browser Detected");

					var url = utilsService.getURL("api/v2/account/connectors", true);
					if(accessToken){
						url += "access_token=" + accessToken;
					}
					var newTab = window.open(url,'_blank');

					if(!newTab){
						alert("Please unblock popups and refresh to access the Import Data page.");
					}
					$rootScope.hideNavigationMenu = false;
					//noinspection JSCheckFunctionSignatures
					$state.go(config.appSettings.defaultState);
				} else {
					var targetUrl = utilsService.getURL("api/v1/connect/mobile", true);
					if(accessToken){
						targetUrl += "access_token=" + accessToken;
					}
					var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
					ref.addEventListener('exit', function(){
						$rootScope.hideNavigationMenu = false;
						//noinspection JSCheckFunctionSignatures
						$state.go(config.appSettings.defaultState);
					});
				}
			}, function(){
				$ionicLoading.hide();
				console.log('importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...');
				$rootScope.sendToLogin();
			});
		};

		var loadNativeConnectorPage = function(){
			console.log('importCtrl: $rootScope.isMobile so using native connector page');
			connectorsService.getConnectors()
				.then(function(connectors){
					$scope.connectors = connectors;
                    if(connectors) {
                        $ionicLoading.hide().then(function(){
                            console.log("The loading indicator is now hidden");
                        });
                    }
					$scope.refreshConnectors();
				});
		};

	    // constructor
	    var init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner>'
			});

			if($rootScope.isMobile){
				loadNativeConnectorPage();
			} else {
				goToWebImportDataPage();
			}
	    };

	    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
			init();
	    });

		$scope.connect = function(connector){

			var scopes;
			var myPopup;
			var options;
			connector.loadingText = 'Connecting...';

			var connectWithParams = function(params, lowercaseConnectorName) {
				connectorsService.connectWithParams(params, lowercaseConnectorName)
					.then(function(result){
						console.log(JSON.stringify(result));
						$scope.refreshConnectors();
					}, function (error) {
						errorHandler(error);
						$scope.refreshConnectors();
					});
			};

			var connectWithToken = function(response) {
				console.log("Response Object -> " + JSON.stringify(response));
				var body = {
					connectorCredentials: {token: response},
					connector: connector
				};
				connectorsService.connectWithToken(body).then(function(result){
					console.log(JSON.stringify(result));
					$scope.refreshConnectors();
				}, function (error) {
					errorHandler(error);
					$scope.refreshConnectors();
				});
			};

			var connectWithAuthCode = function(authorizationCode, connector){
				console.log(connector.name + " connect result is " + JSON.stringify(authorizationCode));
				connectorsService.connectWithAuthCode(authorizationCode, connector.name).then(function (){
					$scope.refreshConnectors();
				}, function() {
					console.error("error on connectWithAuthCode for " + connector.name);
					$scope.refreshConnectors();
				});
			};

			var errorHandler = function(error){
                bugsnagService.reportError(error);
            };

			if(connector.name === 'github') {
				scopes = ['user', 'repo'];
				$cordovaOauth.github(window.private_keys.GITHUB_CLIENT_ID, window.private_keys.GITHUB_CLIENT_SECRET,
					scopes).then(function(result) {
					connectWithToken(result);
				}, function(error) {
					errorHandler(error);
				});
			}

			if(connector.name === 'withings') {
				$cordovaOauth.withings(window.private_keys.WITHINGS_CLIENT_ID, window.private_keys.WITHINGS_CLIENT_SECRET)
					.then(function(result) {
						connectWithToken(result);
					}, function(error) {
                        errorHandler(error);
					});
			}

			if(connector.name === 'fitbit') {
				scopes = [
					'activity',
					'heartrate',
					'location',
					'nutrition',
					'profile',
					'settings',
					'sleep',
					'social',
					'weight'
				];

				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.fitbit(window.private_keys.FITBIT_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
                        errorHandler(error);
					});
			}

			if(connector.name === 'runkeeper') {
				scopes = [];
				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.fitbit(window.private_keys.RUNKEEPER_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
						errorHandler(error);
					});
			}

			if(connector.name === 'rescuetime') {
				scopes = ['time_data', 'category_data', 'productivity_data'];
				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.rescuetime(window.private_keys.RESCUETIME_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
						errorHandler(error);
					});
			}

			if(connector.name === 'slice') {
				scopes = [];
				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.slice(window.private_keys.SLICE_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
						errorHandler(error);
					});
			}


			if(connector.name === 'facebook') {
				scopes = ['user_likes', 'user_posts'];
				$cordovaOauth.facebook(window.private_keys.FACEBOOK_APP_ID, scopes)
					.then(function(result) {
						connectWithToken(result);
					}, function(error) {
                        errorHandler(error);
					});
			}

			if(connector.name === 'googlefit') {
				scopes = [
					"https://www.googleapis.com/auth/fitness.activity.read",
					"https://www.googleapis.com/auth/fitness.body.read",
					"https://www.googleapis.com/auth/fitness.location.read"
				];

				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.googleOffline(window.private_keys.GOOGLE_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
						errorHandler(error);
					});
			}

			if(connector.name === 'googlecalendar') {
				scopes = [
					"https://www.googleapis.com/auth/calendar",
					"https://www.googleapis.com/auth/calendar.readonly"
				];
				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.googleOffline(window.private_keys.GOOGLE_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
						errorHandler(error);
					});
			}

			if(connector.name === 'sleepcloud') {
				scopes = [
					'https://www.googleapis.com/auth/userinfo.email'
				];
				options = {redirect_uri: utilsService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
				$cordovaOauth.googleOffline(window.private_keys.GOOGLE_CLIENT_ID, scopes, options)
					.then(function(authorizationCode) {
						connectWithAuthCode(authorizationCode, connector);
					}, function(error) {
						errorHandler(error);
					});
			}

			if(connector.name === 'up') {
				scopes = [
					'basic_read',
					'extended_read',
					'location_read',
					'friends_read',
					'mood_read',
					'move_read',
					'sleep_read',
					'meal_read',
					'weight_read',
					'heartrate_read',
					'generic_event_read'
				];

				$cordovaOauth.jawbone(window.private_keys.JAWBONE_CLIENT_ID, window.private_keys.JAWBONE_CLIENT_SECRET, scopes)
					.then(function(result) {
						connectWithToken(result);
					}, function(error) {
                        errorHandler(error);
					});
			}

			if(connector.name === 'worldweatheronline') {
				$scope.data = {};

				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-location placeholder-icon"></i>' +
					'<input type="text" placeholder="Zip Code or City, Country" ng-model="data.location"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your Zip Code or City, Country/State',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Save</b>',
							type: 'button-positive',
							onTap: function(e) {
								if (!$scope.data.location) {
									//don't allow the user to close unless he enters wifi password
									e.preventDefault();
								} else {
									return $scope.data.location;
								}
							}
						}
					]
				});

				myPopup.then(function(res) {
					var params = {
						location: String($scope.data.location)
					};
					connectWithParams(params, connector.name);
					console.log('Entered zip code. Result: ', res);
				});
			}

			if(connector.name === 'whatpulse') {
				$scope.data = {};

				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-person placeholder-icon"></i>' +
					'<input type="text" placeholder="Username" ng-model="data.username"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your ' + connector.displayName + ' Username',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Save</b>',
							type: 'button-positive',
							onTap: function(e) {
								if (!$scope.data.username) {
									//don't allow the user to close unless he enters wifi password
									e.preventDefault();
								} else {
									return $scope.data.username;
								}
							}
						}
					]
				});

				myPopup.then(function(res) {
					var params = {
						username: $scope.data.username
					};
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					connectWithParams(params, connector.name);
				});
			}

			if(connector.name === 'myfitnesspal') {
				$scope.data = {};

				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-person placeholder-icon"></i>' +
					'<input type="text" placeholder="Username" ng-model="data.username"></label>' +
					'<br> <label class="item item-input">' +
					'<i class="icon ion-locked placeholder-icon"></i>' +
					'<input type="password" placeholder="Password" ng-model="data.password"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your ' + connector.displayName + ' Credentials',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Save</b>',
							type: 'button-positive',
							onTap: function(e) {
								if (!$scope.data.username || !$scope.data.password) {
									//don't allow the user to close unless he enters wifi password
									e.preventDefault();
								} else {
									return $scope.data;
								}
							}
						}
					]
				});

				myPopup.then(function(res) {
					var params = {
						username: $scope.data.username,
						password: $scope.data.password
					};
					connectWithParams(params, connector.name);
				});
			}

			if(connector.name === 'mynetdiary') {
				$scope.data = {};

				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-person placeholder-icon"></i>' +
					'<input type="text" placeholder="Username" ng-model="data.username"></label>' +
					'<br> <label class="item item-input">' +
					'<i class="icon ion-locked placeholder-icon"></i>' +
					'<input type="password" placeholder="Password" ng-model="data.password"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your ' + connector.displayName + ' Credentials',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Save</b>',
							type: 'button-positive',
							onTap: function(e) {
								if (!$scope.data.password || !$scope.data.username) {
									//don't allow the user to close unless he enters wifi password
									e.preventDefault();
								} else {
									return $scope.data;
								}
							}
						}
					]
				});

				myPopup.then(function(res) {
					var params = {
						username: $scope.data.username,
						password: $scope.data.password
					};
					connectWithParams(params, connector.name);
				});
			}

			if(connector.name === 'moodpanda') {
				$scope.data = {};

				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-email placeholder-icon"></i>' +
					'<input type="email" placeholder="Email" ng-model="data.email"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your ' + connector.displayName + ' Email',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Save</b>',
							type: 'button-positive',
							onTap: function(e) {
								if (!$scope.data.email) {
									//don't allow the user to close unless he enters wifi password
									e.preventDefault();
								} else {
									return $scope.data;
								}
							}
						}
					]
				});

				myPopup.then(function(res) {
					var params = {
						email: $scope.data.email
					};
					connectWithParams(params, connector.name);
				});
			}

			if(connector.name === 'moodscope') {
				$scope.data = {};

				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-person placeholder-icon"></i>' +
					'<input type="text" placeholder="Username" ng-model="data.username"></label>' +
					'<br> <label class="item item-input">' +
					'<i class="icon ion-locked placeholder-icon"></i>' +
					'<input type="password" placeholder="Password" ng-model="data.password"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your ' + connector.displayName + ' Credentials',
					scope: $scope,
					buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Save</b>',
							type: 'button-positive',
							onTap: function(e) {
								if (!$scope.data.password || !$scope.data.username) {
									//don't allow the user to close unless he enters wifi password
									e.preventDefault();
								} else {
									return $scope.data;
								}
							}
						}
					]
				});

				myPopup.then(function(res) {
					var params = {
						username: $scope.data.username,
						password: $scope.data.password
					};
					connectWithParams(params, connector.name);
				});
			}
		};

		$scope.disconnect = function (connector){
			connector.loadingText = 'Disconnecting...';
			connectorsService.disconnect(connector.name).then(function (){
				$scope.refreshConnectors();
			}, function() {
				console.error("error disconnecting " + connector.name);
			});
		};

		$scope.getItHere = function (connector){
			window.open(connector.getItUrl, '_blank');
		};



	});
