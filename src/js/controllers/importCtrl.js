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
        //if(qmService.sendToLoginIfNecessaryAndComeBack()){ return; }
        loadNativeConnectorPage();
        if(!userCanConnect()){
            qmService.refreshUser(); // Check if user upgrade via web since last user refresh
        }
	});
	$scope.hideImportHelpCard = function () {
		$scope.showImportHelpCard = false;
        window.qm.storage.setItem(qm.items.hideImportHelpCard, true);
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
        if(!qm.appMode.isDebug()){button.text = "Import Scheduled";}
        connector.message = 'You should begin seeing any new data within an hour or so.';
        connector.updateStatus = "CONNECTING"; // Need to make error message hidden
        if(connector.name === 'quantimodo') {qmService.connectors.quantimodo.connectConnector(connector, ev);}
        if(connector.name === 'slack') {
            if(qmService.connectors.webConnect(connector)){return;}
            $cordovaOauth.slack(connector.connectorClientId, connector.connectorClientSecret, connector.scopes)
                .then(function(result) {qmService.connectors.connectWithToken(result);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'netatmo') {
            if(qmService.connectors.webConnect(connector)){return;}
            $cordovaOauth.netatmo({clientId: connector.connectorClientId, clientSecret: connector.connectorClientSecret, appScope: connector.scopes})
                .then(function(result) {qmService.connectors.connectWithToken(result);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'foursquare') {
            if(qmService.connectors.webConnect(connector)){return;}
            $cordovaOauth.foursquare(connector.connectorClientId)
                .then(function(result) {qmService.connectors.connectWithToken(result);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'github') {qmService.connectors.github.connectConnector(connector, ev);}
        if(connector.name === 'linkedin') {qmService.connectors.linkedin.connectConnector(connector, ev);}
        if(connector.name === 'twitter') {qmService.connectors.twitter.connectConnector(connector, ev);}
        if(connector.name === 'strava') {
            if(qmService.connectors.webConnect(connector)){return;}
            $cordovaOauth.strava(connector.connectorClientId, connector.connectorClientSecret, connector.scopes).then(function(result) {qmService.connectors.connectWithToken(result);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'withings') {
            if(qmService.connectors.webConnect(connector)){return;}
            $cordovaOauth.withings(connector.connectorClientId, connector.connectorClientSecret)
                .then(function(result) {qmService.connectors.connectWithToken(result);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'fitbit') {
            if(qmService.connectors.webConnect(connector)){return;}
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {qmService.connectors.connectWithAuthCode(authorizationCode, connector);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'runkeeper') {
            if(qmService.connectors.webConnect(connector)){return;}
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {qmService.connectors.connectWithAuthCode(authorizationCode, connector);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'rescuetime') {
            if(qmService.connectors.webConnect(connector)){return;}
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.rescuetime(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {qmService.connectors.connectWithAuthCode(authorizationCode, connector);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'slice') {
            if(qmService.connectors.webConnect(connector)){return;}
            options = {redirect_uri: qm.api.getBaseUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.slice(connector.connectorClientId, connector.scopes, options)
                .then(function(authorizationCode) {qmService.connectors.connectWithAuthCode(authorizationCode, connector);}, function(error) {qmService.connectors.connectorErrorHandler(error);});
        }
        if(connector.name === 'facebook') {qmService.connectors.facebook.connectConnector(connector, ev);}
        if(connector.mobileConnectMethod === 'google') {qmService.connectors.google.connectConnector(connector, ev);}
        if(connector.name === 'up') {
            if(qmService.connectors.webConnect(connector)){return;}
            $cordovaOauth.jawbone(connector.connectorClientId, connector.connectorClientSecret, connector.scopes)
                .then(function(result) { qmService.connectors.connectWithToken(result);
                }, function(error) { qmService.connectors.connectorErrorHandler(error); });
        }
        if(connector.name === 'worldweatheronline') {qmService.connectors.connectWithParams({}, 'worldweatheronline');}
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
                qmService.connectors.connectWithParams(params, connector.name);
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
                qmService.connectors.connectWithParams(params, connector.name);
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
                qmService.connectors.connectWithParams(params, connector.name);
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
                qmService.connectors.connectWithParams(params, connector.name);
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
                qmService.connectors.connectWithParams(params, connector.name);
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
                qmService.connectors.connectWithParams(params, connector.name);
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
                qmService.connectors.connectWithParams(params, connector.name);
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
    $rootScope.$on('broadcastRefreshConnectors', function() {
        qmLogService.info('broadcastRefreshConnectors broadcast received..');
        $scope.refreshConnectors();
    });
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
}]);
