angular.module('starter')
	
	// controls the Import Data page of the app
	.controller('ImportCtrl', function($scope, $ionicLoading, $state, $rootScope, authService, utilsService, QuantiModo,
									   connectorsService, $cordovaOauth, bugsnagService, $ionicPopup) {
		
		$state.go('app');
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

	    // constructor
	    $scope.init = function(){
			if (typeof Bugsnag !== "undefined") {
				Bugsnag.context = "importData";
			}
			if (typeof analytics !== 'undefined')  { //noinspection JSUnresolvedFunction
				analytics.trackView("Import Data Controller"); }
			$scope.showLoader();

			if($rootScope.isMobile){
				console.log('importCtrl: $rootScope.isMobile so using native connector page');
				connectorsService.getConnectors();
				connectorsService.refreshConnectors();
			} else {
				console.debug('importCtrl.init: Going to authService.getAccessTokenFromAnySource');
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
					$state.go('app.login', {
						fromUrl : window.location.href
					});
				});
			}
	    };

	    // call the constructor
	    // when view is changed
	    $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
			$scope.hideLoader();
			$scope.init();
	    });

		$scope.showAuthWindow = function (connector) {
			var url = connector.connectInstructions.url;
			var authWindow;
			var windowSize = {
				width: Math.floor(window.outerWidth * 0.8),
				height: Math.floor(window.outerHeight * 0.7)
			};
			if (windowSize.height < 500) {
				windowSize.height = Math.min(500, window.outerHeight);
			}
			if (windowSize.width < 800) {
				windowSize.width = Math.min(800, window.outerWidth);
			}
			windowSize.left = window.screenX + (window.outerWidth - windowSize.width) / 2;
			windowSize.top = window.screenY + (window.outerHeight - windowSize.height) / 8;
			var windowOptions = "width=" + windowSize.width + ",height=" + windowSize.height;
			windowOptions += ",toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0";
			windowOptions += ",left=" + windowSize.left + ",top=" + windowSize.top;

			authWindow = window.open(url, "Authorization", windowOptions);
			if (authWindow) {
				//authWindow.focus();
			}
			//return authWindow;
		};

		$scope.connect = function(connector){

			var scopes;
			var myPopup;

			var genericConnection = function(body) {
				connectorsService.connect(body).then(function(result){
					console.log(JSON.stringify(result));
					$scope.init();
				}, function (error) {
                    errorHandler(error);
				});
			};

			var connectWithToken = function(response) {
				console.log("Response Object -> " + JSON.stringify(response));
				var body = {
					connectorCredentials: {token: response},
					connector: connector
				};
				genericConnection(body);
			};

			var errorHandler = function(error){
                bugsnagService.reportError(error);
                alert("Error: " + error);
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

				$cordovaOauth.fitbit(window.private_keys.FITBIT_CLIENT_ID, window.private_keys.FITBIT_CLIENT_SECRET, scopes)
					.then(function(result) {
						connectWithToken(result);
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

				$cordovaOauth.google(window.private_keys.GOOGLE_CLIENT_ID, scopes)
					.then(function(result) {
						connectWithToken(result);
					}, function(error) {
                        errorHandler(error);
					});
			}

			if(connector.name === 'googlecalendar') {
				scopes = [
					"https://www.googleapis.com/auth/calendar",
					"https://www.googleapis.com/auth/calendar.readonly"
				];

				$cordovaOauth.google(window.private_keys.GOOGLE_CLIENT_ID, scopes)
					.then(function(result) {
						connectWithToken(result);
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

				// An elaborate, custom popup
				myPopup = $ionicPopup.show({
					template: '<label class="item item-input">' +
					'<i class="icon ion-location placeholder-icon"></i>' +
					'<input type="number" placeholder="Zip Code" ng-model="data.location"></label>',
					title: connector.displayName,
					subTitle: 'Enter Your Zip Code',
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
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					genericConnection(body);
					console.log('Entered zip code. Result: ', res);
				});
			}

			if(connector.name === 'whatpulse') {
				$scope.data = {};

				// An elaborate, custom popup
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
					genericConnection(body);
				});
			}

			if(connector.name === 'myfitnesspal') {
				$scope.data = {};

				// An elaborate, custom popup
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
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					genericConnection(body);
				});
			}

			if(connector.name === 'myfitnesspal') {
				$scope.data = {};

				// An elaborate, custom popup
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
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					genericConnection(body);
				});
			}

			if(connector.name === 'mynetdiary') {
				$scope.data = {};

				// An elaborate, custom popup
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
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					genericConnection(body);
				});
			}

			if(connector.name === 'moodpanda') {
				$scope.data = {};

				// An elaborate, custom popup
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
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					genericConnection(body);
				});
			}

			if(connector.name === 'moodscope') {
				$scope.data = {};

				// An elaborate, custom popup
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
					var body = {
						connectorCredentials: params,
						connector: connector
					};
					genericConnection(body);
				});
			}
		};

		$scope.disconnect = function (connector){
			connectorsService.disconnect(connector.name).then(function (){
				$scope.init();
			}, function() {
				console.error("error disconnecting " + connector.name);
			});
		};

		$scope.getItHere = function (connector){
			window.open(connector.getItUrl, '_blank');
		};



	});
