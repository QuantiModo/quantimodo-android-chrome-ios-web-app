angular.module('starter').controller('ImportCtrl', function($scope, $ionicLoading, $state, $rootScope, qmService, $cordovaOauth,
                                                            $ionicActionSheet, Upload, $timeout, $ionicPopup) {
	$scope.controller_name = "ImportCtrl";
	$rootScope.showFilterBarSearchIcon = false;
	function weCanEnterPage() {
        var doNotRequireUpgradeToEnterPage = true;
        return $rootScope.user.stripeActive || config.appSettings.upgradeDisabled || doNotRequireUpgradeToEnterPage;
    }
    function userCanConnect() {
	    return $rootScope.user.stripeActive || config.appSettings.upgradeDisabled;
	}
	$scope.$on('$ionicView.beforeEnter', function(e) {
		console.debug("ImportCtrl beforeEnter");
        if(typeof $rootScope.hideNavigationMenu === "undefined") {$rootScope.hideNavigationMenu = false;}
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        if(qmService.sendToLoginIfNecessaryAndComeBack()){ return; }
		if(weCanEnterPage()){
			loadNativeConnectorPage();
			return;
		}
		// Check if user upgrade via web since last user refresh
		qmService.showBlackRingLoader();
		qmService.refreshUser().then(function (user) {
			qmService.hideLoader();
			if(weCanEnterPage()){
				loadNativeConnectorPage();
				return;
			}
			$state.go('app.upgrade', {litePlanState: config.appSettings.appDesign.defaultState});
		}, function (error) {
			qmService.hideLoader();
			$state.go('app.login');
		});
	});
	$scope.hideImportHelpCard = function () {
		$scope.showImportHelpCard = false;
		window.localStorage.hideImportHelpCard = true;
	};
	var goToWebImportDataPage = function() {
		console.debug('importCtrl.init: Going to qmService.getAccessTokenFromAnySource');
		$state.go(config.appSettings.appDesign.defaultState);
		qmService.getAccessTokenFromAnySource().then(function(accessToken){
			qmService.hideLoader();
			if(ionic.Platform.platforms[0] === "browser"){
				console.debug("Browser Detected");
				var url = qmService.getQuantiModoUrl("api/v2/account/connectors", true);
				if(accessToken){ url += "access_token=" + accessToken; }
				var newTab = window.open(url,'_blank');
				if(!newTab){ alert("Please unblock popups and refresh to access the Import Data page."); }
				$rootScope.hideNavigationMenu = false;
				//noinspection JSCheckFunctionSignatures
				$state.go(config.appSettings.appDesign.defaultState);
			} else {
				var targetUrl = qmService.getQuantiModoUrl("api/v1/connect/mobile", true);
				if(accessToken){ targetUrl += "access_token=" + accessToken; }
				var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
				ref.addEventListener('exit', function(){
					$rootScope.hideNavigationMenu = false;
					//noinspection JSCheckFunctionSignatures
					$state.go(config.appSettings.appDesign.defaultState);
				});
			}
		}, function(){
			qmService.hideLoader();
			console.debug('importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...');
            qmService.sendToLoginIfNecessaryAndComeBack();
		});
	};
	var loadNativeConnectorPage = function(){
		$scope.showImportHelpCard = (window.localStorage.hideImportHelpCard !== "true");
		console.debug('importCtrl: $rootScope.isMobile so using native connector page');
		qmService.showBlackRingLoader();
		qmService.getConnectorsDeferred()
			.then(function(connectors){
                $scope.connectors = connectors;
				if(connectors) {
					$scope.$broadcast('scroll.refreshComplete');
					$ionicLoading.hide().then(function(){console.debug("The loading indicator is now hidden");});
				}
				$scope.refreshConnectors();
			});
	};
    $scope.showActionSheetForConnector = function(connector) {
        var buttons = [
            qmService.getHistoryActionSheetButton(connector.displayName)
        ];
        var hideSheetForNotification = $ionicActionSheet.show({
            buttons: buttons,
            //destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {console.debug('CANCELLED');},
            buttonClicked: function(index) {
                if(index === 0){$state.go('app.historyAll', {connectorName: connector.name});}
                return true;
            },
            destructiveButtonClicked: function() {}
        });
    };
    $scope.uploadSpreadsheet = function(file, errFiles, connector, button) {
        if(!userCanConnect()){
            $state.go('app.upgrade');
            return;
        }
        if(!file){
            console.debug('No file provided to uploadAppFile');
            return;
        }
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            button.text = "Uploading...";
            qmService.showBasicLoader();
            var body = {file: file, "connectorName": connector.name};
            file.upload = Upload.upload({url: qmService.getApiUrl() + '/api/v2/spreadsheetUpload?clientId=' + $rootScope.appSettings.clientId +
                "&access_token=" + $rootScope.user.accessToken, data: body});
            file.upload.then(function (response) {
                button.text = "Import Scheduled";
                connector.message = "You should start seeing your data within the next hour or so";
                console.debug("File upload response: ", response);
                $timeout(function () {file.result = response.data;});
                qmService.hideLoader();
            }, function (response) {
                qmService.hideLoader();
                if (response.status > 0){$scope.errorMsg = response.status + ': ' + response.data;}
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };
    var connectConnector = function(connector){
        if(!userCanConnect()){
            $state.go('app.upgrade');
            return;
        }
        var scopes;
        var myPopup;
        var options;
        //connector.loadingText = 'Connecting...'; // TODO: Show Connecting... text again once we figure out how to update after connection is completed
        connector.loadingText = null;
        connector.connecting = true;
        connector.updateStatus = "CONNECTING"; // Need to make error message hidden
        var connectWithToken = function(response) {
            console.debug("Response Object -> " + JSON.stringify(response));
            var body = { connectorCredentials: {token: response}, connector: connector };
            qmService.connectConnectorWithTokenDeferred(body).then(function(result){
                console.debug(JSON.stringify(result));
                $scope.refreshConnectors();
            }, function (error) {
                connectorErrorHandler(error);
                $scope.refreshConnectors();
            });
        };
        var connectWithAuthCode = function(authorizationCode, connector){
            console.debug(connector.name + " connect result is " + JSON.stringify(authorizationCode));
            qmService.connectConnectorWithAuthCodeDeferred(authorizationCode, connector.name).then(function (){
                $scope.refreshConnectors();
            }, function() {
                console.error("error on connectWithAuthCode for " + connector.name);
                $scope.refreshConnectors();
            });
        };
        if(connector.name === 'github') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['user', 'repo'];
            $cordovaOauth.github(window.private_keys.GITHUB_CLIENT_ID, window.private_keys.GITHUB_CLIENT_SECRET,
                scopes).then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'withings') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.withings(window.private_keys.WITHINGS_CLIENT_ID, window.private_keys.WITHINGS_CLIENT_SECRET)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'fitbit') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
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
            options = {redirect_uri: qmService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(window.private_keys.FITBIT_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'runkeeper') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = [];
            options = {redirect_uri: qmService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(window.private_keys.RUNKEEPER_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'rescuetime') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['time_data', 'category_data', 'productivity_data'];
            options = {redirect_uri: qmService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.rescuetime(window.private_keys.RESCUETIME_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'slice') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = [];
            options = {redirect_uri: qmService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.slice(window.private_keys.SLICE_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'facebook') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['user_likes', 'user_posts'];
            $cordovaOauth.facebook(window.private_keys.FACEBOOK_APP_ID, scopes)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        function connectGoogle(connector, scopes) {
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                window.plugins.googleplus.login({
                    'scopes': scopes, // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                    'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                    'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                }, function (response) {
                    console.debug('window.plugins.googleplus.login response:' + JSON.stringify(response));
                    connectWithAuthCode(response.serverAuthCode, connector);
                }, function (errorMessage) {
                    qmService.reportErrorDeferred("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                });
            }
        }
        if(connector.name === 'googlefit') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.location.read';
            connectGoogle(connector, scopes);
        }
        if(connector.name === 'googlecalendar') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes =  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";
            connectGoogle(connector, scopes);
        }
        if(connector.name === 'sleepcloud') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes =  "https://www.googleapis.com/auth/userinfo.email";
            connectGoogle(connector, scopes);
        }
        if(connector.name === 'up') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
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
                .then(function(result) { connectWithToken(result);
                }, function(error) { connectorErrorHandler(error); });
        }
        if(connector.name === 'worldweatheronline') {
            connectWithParams({}, 'worldweatheronline');
        }
        if(connector.name === 'whatpulse') {
            $scope.data = {};
            myPopup = $ionicPopup.show({
                template: '<label class="item item-input">' +
                '<i class="icon ion-person placeholder-icon"></i>' +
                '<input type="text" placeholder="Username" ng-model="data.username"></label>',
                title: connector.displayName,
                subTitle: 'Enter your ' + connector.displayName + ' username found next to your avatar on the WhatPulse My Stats page',
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
                            } else {return $scope.data.username;}
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                var params = { username: $scope.data.username };
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
                            } else {return $scope.data;}
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                var params = { username: $scope.data.username, password: $scope.data.password };
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
                            } else {return $scope.data;}
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                var params = { username: $scope.data.username, password: $scope.data.password };
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
                            } else {return $scope.data;}
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                var params = { email: $scope.data.email };
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
                            } else {return $scope.data;}
                        }
                    }
                ]
            });
            myPopup.then(function(res) {
                var params = { username: $scope.data.username, password: $scope.data.password };
                connectWithParams(params, connector.name);
            });
        }
    };
    var disconnectConnector = function (connector){
        connector.loadingText = 'Disconnected';
        qmService.disconnectConnectorDeferred(connector.name).then(function (){ $scope.refreshConnectors();
        }, function() { console.error("error disconnecting " + connector.name); });
    };
    var getItHere = function (connector){ window.open(connector.getItUrl, '_blank'); };
    $scope.connectorAction = function(connector, button){
        if(button.text.toLowerCase().indexOf('disconnect') !== -1){
            disconnectConnector(connector);
        } else if(button.text.toLowerCase().indexOf('connect') !== -1){
            connectConnector(connector);
        } else if(button.text.toLowerCase().indexOf('get it') !== -1){
            getItHere(connector);
        }
    };
    $scope.refreshConnectors = function(){
        qmService.refreshConnectors()
            .then(function(connectors){
                $scope.connectors = connectors;
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                qmService.hideLoader();
            }, function(response){
                console.error(response);
                $scope.$broadcast('scroll.refreshComplete');
                qmService.hideLoader();
            });
    };
    function connectorErrorHandler(error){
        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
    }
    var webConnect = function (connector) {
        /** @namespace connector.connectInstructions */
        var url = connector.connectInstructions.url;
        console.debug('targetUrl is ',  url);
        var ref = window.open(url,'', "width=600,height=800");
        console.debug('Opened ' + url);
    };
    function connectWithParams(params, lowercaseConnectorName) {
        qmService.connectConnectorWithParamsDeferred(params, lowercaseConnectorName)
            .then(function(result){
                console.debug(JSON.stringify(result));
                $scope.refreshConnectors();
            }, function (error) {
                errorHandler(error);
                $scope.refreshConnectors();
            });
    }
});
