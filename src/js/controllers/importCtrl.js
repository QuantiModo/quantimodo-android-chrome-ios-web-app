angular.module('starter').controller('ImportCtrl', ["$scope", "$ionicLoading", "$state", "$rootScope", "qmService", "qmLogService", "$cordovaOauth", "$ionicActionSheet", "Upload", "$timeout", "$ionicPopup", function($scope, $ionicLoading, $state, $rootScope, qmService, qmLogService, $cordovaOauth,
                                                            $ionicActionSheet, Upload, $timeout, $ionicPopup) {
	$scope.controller_name = "ImportCtrl";
	qmService.navBar.setFilterBarSearchIcon(false);
    function userCanConnect() {
        if(qmService.premiumModeDisabledForTesting){return false;}
        if($rootScope.user.stripeActive){return true;}
        return !qm.getAppSettings().additionalSettings.monetizationSettings.subscriptionsEnabled;
	}
	$scope.$on('$ionicView.beforeEnter', function(e) {
		qmLogService.debug(null, 'ImportCtrl beforeEnter', null);
        if(typeof $rootScope.hideNavigationMenu === "undefined") {
            qmService.unHideNavigationMenu();
        }
        if(qmService.sendToLoginIfNecessaryAndComeBack()){ return; }
        loadNativeConnectorPage();
        if(!userCanConnect()){
            qmService.refreshUser(); // Check if user upgrade via web since last user refresh
        }
	});
	$scope.hideImportHelpCard = function () {
		$scope.showImportHelpCard = false;
        window.qm.storage.setItem(qm.items.hideImportHelpCard, true);
	};
	var goToWebImportDataPage = function() {
		qmLogService.debug(null, 'importCtrl.init: Going to qmService.getAccessTokenFromAnySource', null);
		qmService.goToDefaultState();
		qmService.getAccessTokenFromAnySource().then(function(accessToken){
			qmService.hideLoader();
			if(ionic.Platform.platforms[0] === "browser"){
				qmLogService.debug(null, 'Browser Detected', null);
				var url = qmService.getQuantiModoUrl("api/v2/account/connectors", true);
				if(accessToken){ url += "access_token=" + accessToken; }
				var newTab = window.open(url,'_blank');
				if(!newTab){ alert("Please unblock popups and refresh to access the Import Data page."); }
                qmService.unHideNavigationMenu();
				//noinspection JSCheckFunctionSignatures
				qmService.goToDefaultState();
			} else {
				var targetUrl = qmService.getQuantiModoUrl("api/v1/connect/mobile", true);
				if(accessToken){ targetUrl += "access_token=" + accessToken; }
				var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
				ref.addEventListener('exit', function(){
                    qmService.unHideNavigationMenu();
					//noinspection JSCheckFunctionSignatures
					qmService.goToDefaultState();
				});
			}
		}, function(){
			qmService.hideLoader();
			qmLogService.debug(null, 'importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...', null);
            qmService.sendToLoginIfNecessaryAndComeBack();
		});
	};
	var loadNativeConnectorPage = function(){
		$scope.showImportHelpCard = !qm.storage.getItem(qm.items.hideImportHelpCard);
		qmService.showBlackRingLoader();
		qmService.getConnectorsDeferred()
			.then(function(connectors){
                $scope.connectors = connectors;
				if(connectors) {
					$scope.$broadcast('scroll.refreshComplete');
					$ionicLoading.hide().then(function(){qmLogService.debug(null, 'The loading indicator is now hidden', null);});
				}
				$scope.refreshConnectors();
			});
	};
    $scope.showActionSheetForConnector = function(connector) {
        var buttons = [
            {text: '<i class="icon ' + qmService.ionIcons.history + '"></i>' + connector.displayName + ' History'}
        ];
        var hideSheetForNotification = $ionicActionSheet.show({
            buttons: buttons,
            //destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {qmLogService.debug(null, 'CANCELLED', null);},
            buttonClicked: function(index) {
                if(index === 0){qmService.goToState(qmStates.historyAll, {connectorName: connector.name});}
                return true;
            },
            destructiveButtonClicked: function() {}
        });
    };
    $scope.uploadSpreadsheet = function(file, errFiles, connector, button) {
        if(!userCanConnect()){
            qmService.goToState('app.upgrade');
            return;
        }
        if(!file){
            qmLogService.debug('No file provided to uploadAppFile', null);
            return;
        }
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            button.text = "Uploading...";
            qmService.showBasicLoader();
            var body = {file: file, "connectorName": connector.name};
            file.upload = Upload.upload({url: qm.api.getBaseUrl() + '/api/v2/spreadsheetUpload?clientId=' +
                $rootScope.appSettings.clientId + "&access_token=" + $rootScope.user.accessToken, data: body});
            file.upload.then(function (response) {
                button.text = "Import Scheduled";
                connector.message = "You should start seeing your data within the next hour or so";
                qmLogService.debug('File upload response: ', null, response);
                $timeout(function () {file.result = response.data;});
                qmService.hideLoader();
            }, function (response) {
                qmService.hideLoader();
                button.text = "Upload Complete";
                qmService.showMaterialAlert("Upload complete!",  "You should see the data on your history page within an hour or so");
                if (response.status > 0){
                    button.text = "Upload Failed";
                    qmLog.error("Upload failed!");
                    qmService.showMaterialAlert("Upload failed!",  "Please contact mike@quantimo.do and he'll fix it. ");
                    $scope.errorMsg = response.status + ': ' + response.data;
                }
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        }
    };
    var connectConnector = function(connector, button){
        if(!userCanConnect()){
            qmService.goToState('app.upgrade');
            return;
        }
        var scopes;
        var myPopup;
        var options;
        //connector.loadingText = 'Connecting...'; // TODO: Show Connecting... text again once we figure out how to update after connection is completed
        connector.loadingText = null;
        connector.connecting = true;
        button.text = "Import Scheduled";
        connector.message = 'You should begin seeing any new data within an hour or so.';
        connector.updateStatus = "CONNECTING"; // Need to make error message hidden
        var connectWithToken = function(response) {
            qmLogService.debug('Response Object -> ' + JSON.stringify(response), null);
            var body = { connectorCredentials: {token: response}, connector: connector };
            qmService.connectConnectorWithTokenDeferred(body).then(function(result){
                qmLogService.debug(JSON.stringify(result), null);
                $scope.refreshConnectors();
            }, function (error) {
                connectorErrorHandler(error);
                $scope.refreshConnectors();
            });
        };
        var connectWithAuthCode = function(authorizationCode, connector){
            qmLogService.debug(connector.name + ' connect result is ' + JSON.stringify(authorizationCode), null);
            qmService.connectConnectorWithAuthCodeDeferred(authorizationCode, connector.name).then(function (){
                $scope.refreshConnectors();
            }, function() {
                qmLogService.error("error on connectWithAuthCode for " + connector.name);
                $scope.refreshConnectors();
            });
        };
        function connectGoogle(connector, scopes) {
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                window.plugins.googleplus.login({
                    'scopes': scopes, // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                    'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                    'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                }, function (response) {
                    qmLogService.debug('window.plugins.googleplus.login response:' + JSON.stringify(response), null);
                    connectWithAuthCode(response.serverAuthCode, connector);
                }, function (errorMessage) {
                    qmLogService.error("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                });
            }
        }
        if(connector.name === 'slack') {
            webConnect(connector);
            return;
        }
        if(connector.name === 'netatmo') {
            webConnect(connector);
            return;
        }
        if(connector.name === 'github') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['user', 'repo'];
            $cordovaOauth.github(qm.privateConfig.GITHUB_CLIENT_ID, qm.privateConfig.GITHUB_CLIENT_SECRET,
                scopes).then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'strava') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['public'];
            $cordovaOauth.strava(qm.privateConfig.STRAVA_CLIENT_ID, qm.privateConfig.STRAVA_CLIENT_SECRET,
                scopes).then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'withings') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.withings(qm.privateConfig.WITHINGS_CLIENT_ID, qm.privateConfig.WITHINGS_CLIENT_SECRET)
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
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(qm.privateConfig.FITBIT_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'runkeeper') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = [];
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(qm.privateConfig.RUNKEEPER_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'rescuetime') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['time_data', 'category_data', 'productivity_data'];
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.rescuetime(qm.privateConfig.RESCUETIME_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'slice') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = [];
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.slice(qm.privateConfig.SLICE_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'facebook') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['user_likes', 'user_posts'];
            $cordovaOauth.facebook(qm.privateConfig.FACEBOOK_APP_ID, scopes)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
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
        if(connector.name === 'gmail') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes =  "https://www.googleapis.com/auth/gmail.readonly";
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
            $cordovaOauth.jawbone(qm.privateConfig.JAWBONE_CLIENT_ID, qm.privateConfig.JAWBONE_CLIENT_SECRET, scopes)
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
    var disconnectConnector = function (connector, button){
        button.text = 'Disconnected';
        qmService.disconnectConnectorDeferred(connector.name).then(function (){
            $scope.refreshConnectors();
        }, function(error) {
            qmLogService.error("error disconnecting " + error);
        });
    };
    var updateConnector = function (connector, button){
        button.text = 'Update Scheduled';
        connector.message = "If you have new data, you should begin to see it in a hour or so.";
        qmService.updateConnector(connector.name);
        $scope.safeApply();
    };
    var getItHere = function (connector){ window.open(connector.getItUrl, '_blank'); };
    $scope.connectorAction = function(connector, button){
        if(button.text.toLowerCase().indexOf('disconnect') !== -1){
            disconnectConnector(connector, button);
        } else if(button.text.toLowerCase().indexOf('connect') !== -1){
            connectConnector(connector, button);
        } else if(button.text.toLowerCase().indexOf('get it') !== -1){
            getItHere(connector, button);
        } else if(button.text.toLowerCase().indexOf('update') !== -1){
            updateConnector(connector, button);
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
                qmLogService.error(response);
                $scope.$broadcast('scroll.refreshComplete');
                qmService.hideLoader();
            });
    };
    function connectorErrorHandler(error){
        qmLogService.error(error);
    }
    var webConnect = function (connector) {
        /** @namespace connector.connectInstructions */
        var url = connector.connectInstructions.url;
        qmLogService.debug('targetUrl is ' + url);
        var ref = window.open(url,'', "width=600,height=800");
        qmLogService.debug('Opened ' + url);
    };
    function connectWithParams(params, lowercaseConnectorName) {
        qmService.connectConnectorWithParamsDeferred(params, lowercaseConnectorName)
            .then(function(result){
                qmLogService.debug(JSON.stringify(result), null);
                $scope.refreshConnectors();
            }, function (error) {
                connectorErrorHandler(error);
                $scope.refreshConnectors();
            });
    }
}]);
