angular.module('starter').controller('ImportCtrl', ["$scope", "$ionicLoading", "$state", "$rootScope", "qmService", "qmLogService", "$cordovaOauth", "$ionicActionSheet", "Upload", "$timeout", "$ionicPopup", "$mdDialog",
    function($scope, $ionicLoading, $state, $rootScope, qmService, qmLogService, $cordovaOauth, $ionicActionSheet, Upload, $timeout, $ionicPopup, $mdDialog) {
	$scope.controller_name = "ImportCtrl";
	qmService.navBar.setFilterBarSearchIcon(false);
	$scope.state = {
	    connectors: null,
        searchText: ''
    };
    function userCanConnect() {
        if(!$rootScope.user){
            qmService.refreshUser();
            return true;
        }
        if(qmService.premiumModeDisabledForTesting){return false;}
        if($rootScope.user.stripeActive){return true;}
        return !qm.getAppSettings().additionalSettings.monetizationSettings.subscriptionsEnabled;
	}
	$scope.$on('$ionicView.beforeEnter', function(e) {
		qmLogService.debug('ImportCtrl beforeEnter', null);
        if(typeof $rootScope.hideNavigationMenu === "undefined") {
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
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
		qmLogService.debug('importCtrl.init: Going to qmService.getAccessTokenFromAnySource', null);
		qmService.goToDefaultState();
		qmService.getAccessTokenFromAnySource().then(function(accessToken){
			qmService.hideLoader();
			if(ionic.Platform.platforms[0] === "browser"){
				qmLogService.debug('Browser Detected', null);
				var url = qmService.getQuantiModoUrl("api/v2/account/connectors", true);
				if(accessToken){ url += "access_token=" + accessToken; }
				var newTab = window.open(url,'_blank');
				if(!newTab){ alert("Please unblock popups and refresh to access the Import Data page."); }
                qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
				//noinspection JSCheckFunctionSignatures
				qmService.goToDefaultState();
			} else {
				var targetUrl = qmService.getQuantiModoUrl("api/v1/connect/mobile", true);
				if(accessToken){ targetUrl += "access_token=" + accessToken; }
				var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
				ref.addEventListener('exit', function(){
                    qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
					//noinspection JSCheckFunctionSignatures
					qmService.goToDefaultState();
				});
			}
		}, function(){
			qmService.hideLoader();
			qmLogService.debug('importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...', null);
            qmService.sendToLoginIfNecessaryAndComeBack();
		});
	};
	var loadNativeConnectorPage = function(){
		$scope.showImportHelpCard = !qm.storage.getItem(qm.items.hideImportHelpCard);
		qmService.showBlackRingLoader();
		qmService.getConnectorsDeferred()
			.then(function(connectors){
                $scope.state.connectors = connectors;
				if(connectors) {
					$scope.$broadcast('scroll.refreshComplete');
					qmService.hideLoader();
				}
				$scope.refreshConnectors();
			});
	};
    $scope.showActionSheetForConnector = function(connector) {
        var connectorButtons = JSON.parse(JSON.stringify(connector.buttons));
        connectorButtons.push({text: '<i class="icon ' + qmService.ionIcons.history + '"></i>' + connector.displayName + ' History',
            id: 'history', state: qmStates.historyAll, stateParams: {connectorName: connector.name}});
        connectorButtons = qmService.actionSheets.addHtmlToActionSheetButtonArray(connectorButtons);
        connectorButtons.map(function (button) {
            button.connector = connector;
            return button;
        });
        var hideSheetForNotification = $ionicActionSheet.show({
            buttons: connectorButtons,
            destructiveText: (connector.connected) ? '<i class="icon ion-trash-a"></i>Disconnect ' : null,
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {qmLogService.debug('CANCELLED');},
            buttonClicked: function(index) {
                if(connectorButtons[index].state){
                    qmService.actionSheets.handleActionSheetButtonClick(connectorButtons[index]);
                } else {
                    $scope.connectorAction(connector, connectorButtons[index]);
                }
                return true;
            },
            destructiveButtonClicked: function() {
                disconnectConnector(connector)
            }
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
    var connectConnector = function(connector, button, ev){
        qmService.connector = connector;
        if(!userCanConnect()){
            qmService.goToState('app.upgrade');
            return;
        }
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
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.slack(connector.connectorClientId, connector.connectorClientSecret, connector.scopes)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'netatmo') {
            webConnect(connector);
            return;
        }
        if(connector.name === 'foursquare') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.foursquare(connector.connectorClientId)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'github') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.github(connector.connectorClientId, connector.connectorClientSecret, connector.scopes)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'strava') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.strava(connector.connectorClientId, connector.connectorClientSecret, connector.scopes).then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'withings') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.withings(connector.connectorClientId, connector.connectorClientSecret)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'fitbit') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'runkeeper') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'rescuetime') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.rescuetime(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'slice') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.slice(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'facebook') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.facebook(connector.connectorClientId, connector.scopes)
                .then(function(result) {connectWithToken(result);}, function(error) {connectorErrorHandler(error);});
        }
        if(connector.name === 'googlefit') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            connectGoogle(connector, connector.scopes);
        }
        if(connector.name === 'googlecalendar') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            connectGoogle(connector, connector.scopes);
        }
        if(connector.name === 'gmail') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            connectGoogle(connector, connector.scopes);
        }
        if(connector.name === 'sleepcloud') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            connectGoogle(connector, connector.scopes);
        }
        if(connector.name === 'up') {
            if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.jawbone(connector.connectorClientId, connector.connectorClientSecret, connector.scopes)
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
        if(connector.name === 'mint') {
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
    function amazonSettings(connector, button, ev) {
        qmService.connector = connector;
        function DialogController($scope, $mdDialog, qmService) {
            var connector = qmService.connector;
            $scope.appSettings = qm.getAppSettings();
            var addAffiliateTag  = connector.connectInstructions.parameters.find(function (obj) {return obj.key === 'addAffiliateTag';});
            $scope.addAffiliateTag = isTruthy(addAffiliateTag.defaultValue);
            var importPurchases  = connector.connectInstructions.parameters.find(function (obj) {return obj.key === 'importPurchases';});
            $scope.importPurchases = isTruthy(importPurchases.defaultValue);
            $scope.onToggle = function(){
                var params = { importPurchases: $scope.importPurchases || false, addAffiliateTag: $scope.addAffiliateTag || false };
                connectWithParams(params, connector.name);
            };
            var self = this;
            self.title = "Amazon Settings";
            $scope.hide = function() {$mdDialog.hide();};
            $scope.cancel = function() {$mdDialog.cancel();};
            $scope.getHelp = function(){
                if(self.helpText && !self.showHelp){return self.showHelp = true;}
                qmService.goToState(window.qmStates.help);
                $mdDialog.cancel();
            };
            $scope.answer = function(answer) {$mdDialog.hide(answer);};
        }
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'templates/dialogs/amazon-settings.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: false // Only for -xs, -sm breakpoints.
        })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
    }
    var disconnectConnector = function (connector, button){
        button.text = 'Reconnect';
        qmService.showInfoToast("Disconnected " + connector.displayName);
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
    var getItHere = function (connector){
        $scope.openUrl(connector.getItUrl, 'yes', '_system');
    };
    $scope.connectorAction = function(connector, button, ev){
        connector.message = null;
        if(button.text.toLowerCase().indexOf('disconnect') !== -1){
            disconnectConnector(connector, button);
        } else if(button.text.toLowerCase().indexOf('connect') !== -1){
            connectConnector(connector, button, ev);
        } else if(button.text.toLowerCase().indexOf('settings') !== -1){
            amazonSettings(connector, button, ev);
        } else if(button.text.toLowerCase().indexOf('get it') !== -1){
            getItHere(connector, button);
        } else if(button.text.toLowerCase().indexOf('update') !== -1){
            updateConnector(connector, button);
        }
    };
    $scope.refreshConnectors = function(){
        qmService.refreshConnectors()
            .then(function(connectors){
                $scope.state.connectors = connectors;
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                qmService.hideLoader();
                $scope.state.text = '';
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
        $scope.state.text = '';
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
