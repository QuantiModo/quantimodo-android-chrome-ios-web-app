angular.module('starter').controller('ImportCtrl', ["$scope", "$ionicLoading", "$state", "$rootScope", "qmService",
    "$cordovaOauth", "$ionicActionSheet", "Upload", "$timeout", "$ionicPopup", "$mdDialog",
    function($scope, $ionicLoading, $state, $rootScope, qmService, $cordovaOauth, $ionicActionSheet,
             Upload, $timeout, $ionicPopup, $mdDialog){
        $scope.controller_name = "ImportCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            connectors: null,
            searchText: '',
            connectorName: null,
            connectWithParams: function(connector){
                var params = connector.connectInstructions.parameters;
                qmService.showBasicLoader();
                qmService.connectors.connectWithParams(params, connector.name, function(){
                    var redirectUrl = qm.urlHelper.getParam('final_callback_url');
                    if(!redirectUrl){
                        redirectUrl = qm.urlHelper.getParam('redirect_uri')
                    }
                    if(redirectUrl){
                        window.location.href = redirectUrl;
                    }
                    $scope.state.connector = null;
                    qmService.hideLoader();
                }, function(error){
                    qmService.showMaterialAlert(error);
                    qmService.hideLoader();
                });
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== "Import") {document.title = "Import";}
            if(!$scope.helpCard || $scope.helpCard.title !== "Import Your Data"){
                $scope.helpCard = {
                    title: "Import Your Data",
                    bodyText: "Scroll down and press Connect for any apps or device you currently use.  Once you're finished, press the Done bar at the bottom.",
                    icon: "ion-ios-cloud-download"
                };
            }
            qmLog.debug('ImportCtrl beforeEnter', null);
            if(typeof $rootScope.hideNavigationMenu === "undefined"){
                qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            }
            $scope.state.searchText = qm.urlHelper.getParam('connectorName');
            if($scope.state.connectorName){
                qm.connectorHelper.getConnectorByName($scope.state.connectorName, function(connector){
                    $scope.state.connector = connector;
                    if(connector){
                        qmService.navBar.hideNavigationMenu();
                    }
                });
            }
            //if(qmService.login.sendToLoginIfNecessaryAndComeBack()){ return; }
            loadNativeConnectorPage();
            if(!userCanConnect()){
                qmService.refreshUser(); // Check if user upgrade via web since last user refresh
            }
        });
        $scope.$on('$ionicView.afterEnter', function(e){
            var message = qm.urlHelper.getParam('message');
            if(message){
                qmService.showMaterialAlert(decodeURIComponent(message), "You should begin seeing your imported data within an hour or so.")
            }
            updateNavigationMenuButton();
        });
        function userCanConnect(connector){
            if(!$rootScope.user){
                qmService.refreshUser();
                return true;
            }
            if(qmService.premiumModeDisabledForTesting){
                return false;
            }
            if($rootScope.user.stripeActive){
                return true;
            }
            if(qm.platform.isChromeExtension()){
                return true;
            }
            if(connector && !connector.premium){
                return true;
            }
            //if(qm.platform.isAndroid()){return true;}
            //if(qm.platform.isWeb()){return true;}
            return !qm.getAppSettings().additionalSettings.monetizationSettings.subscriptionsEnabled;
        }
        $scope.hideImportHelpCard = function(){
            $scope.showImportHelpCard = false;
            window.qm.storage.setItem(qm.items.hideImportHelpCard, true);
        };
        var loadNativeConnectorPage = function(){
            $scope.showImportHelpCard = !qm.storage.getItem(qm.items.hideImportHelpCard);
            qmService.showBlackRingLoader();
            qmService.getConnectorsDeferred()
                .then(function(connectors){
                    $scope.state.connectors = connectors;
                    if(connectors){
                        $scope.$broadcast('scroll.refreshComplete');
                        qmService.hideLoader();
                    }
                    $scope.refreshConnectors();
                });
        };
        $scope.showActionSheetForConnector = function(connector){
            var connectorButtons = JSON.parse(JSON.stringify(connector.buttons));
            connectorButtons.push({
                text: '<i class="icon ' + ionIcons.history + '"></i>' + connector.displayName + ' History',
                id: 'history', state: qm.staticData.stateNames.historyAll, stateParams: {connectorId: connector.id}
            });
            connectorButtons = qmService.actionSheets.addHtmlToActionSheetButtonArray(connectorButtons);
            connectorButtons.map(function(button){
                button.connector = connector;
                return button;
            });
            var hideSheetForNotification = $ionicActionSheet.show({
                buttons: connectorButtons,
                destructiveText: (connector.connected) ? '<i class="icon ion-trash-a"></i>Disconnect ' : null,
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug('CANCELLED');
                },
                buttonClicked: function(index, button){
                    if(connectorButtons[index].state){
                        qmService.actionSheets.handleVariableActionSheetClick(connectorButtons[index]);
                    }else{
                        $scope.connectorAction(connector, connectorButtons[index]);
                    }
                    return true;
                },
                destructiveButtonClicked: function(){
                    disconnectConnector(connector)
                }
            });
        };
        $scope.uploadSpreadsheet = function(file, errFiles, connector, button){
            if(!userCanConnect(connector)){
                qmService.goToState('app.upgrade');
                return;
            }
            if(!file){
                qmLog.debug('No file provided to uploadAppFile', null);
                return;
            }
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
            if(file){
                button.text = "Uploading...";
                qmService.showBasicLoader();
                var body = {file: file, "connectorName": connector.name};
                file.upload = Upload.upload({
                    url: qm.api.getBaseUrl() + '/api/v2/spreadsheetUpload?clientId=' +
                        $rootScope.appSettings.clientId + "&access_token=" + $rootScope.user.accessToken, data: body
                });
                file.upload.then(function(response){
                    button.text = "Import Scheduled";
                    connector.message = "You should start seeing your data within the next hour or so";
                    qmLog.debug('File upload response: ', null, response);
                    $timeout(function(){
                        file.result = response.data;
                    });
                    qmService.hideLoader();
                }, function(response){
                    qmService.hideLoader();
                    button.text = "Upload Complete";
                    qmService.showMaterialAlert("Upload complete!", "You should see the data on your history page within an hour or so");
                    if(response.status > 0){
                        button.text = "Upload Failed";
                        qmLog.error("Upload failed!");
                        qmService.showMaterialAlert("Upload failed!", "Please contact mike@quantimo.do and he'll fix it. ");
                        $scope.errorMsg = response.status + ': ' + response.data;
                    }
                }, function(evt){
                    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });
            }
        };
        var connectConnector = function(connector, button, ev){
            qmLog.info("connectConnector: " + JSON.stringify(connector), null, connector);
            qmService.connector = connector;
            if(!userCanConnect(connector)){
                qmLog.info("connectConnector user cannot connect: " + JSON.stringify(connector), null, connector);
                qmService.goToState('app.upgrade');
                return;
            }
            connector.loadingText = null;
            connector.connecting = true;
            connector.message = 'You should begin seeing any new data within an hour or so.';
            connector.updateStatus = "CONNECTING"; // Need to make error message hidden
            if(qm.arrayHelper.inArray(connector.mobileConnectMethod, ['oauth', 'facebook', 'google'])){
                qmLog.info("connectConnector is inArray('oauth', 'facebook', 'google'): " + JSON.stringify(connector), null, connector);
                qmService.connectors.oAuthConnect(connector, ev, {});
                button.text = "Connecting...";
                return;
            }
            qmLog.info("connectConnector is not inArray('oauth', 'facebook', 'google') no not using qmService.connectors.oAuthConnect: " +
                JSON.stringify(connector), null, connector);
            if(connector.name.indexOf('weather') !== -1){
                button.text = "Import Scheduled";
                qmService.connectors.weatherConnect(connector, $scope);
                return;
            }
            if(connector.connectInstructions.parameters && connector.connectInstructions.parameters.length){
                connectWithInputCredentials(connector, button);
                return;
            }
            qmLog.error("Not sure how to handle this connector: " + JSON.stringify(connector), null, connector);
        };
        function amazonSettings(connector, button, ev){
            qmLog.info("amazonSettings connector " + JSON.stringify(connector), null, connector);
            qmService.connector = connector;
            function DialogController($scope, $mdDialog, qmService){
                var connector = qmService.connector;
                $scope.appSettings = qm.getAppSettings();
                var addAffiliateTag = connector.connectInstructions.parameters.find(function(obj){
                    return obj.key === 'addAffiliateTag';
                });
                $scope.addAffiliateTag = qm.stringHelper.isTruthy(addAffiliateTag.defaultValue);
                var importPurchases = connector.connectInstructions.parameters.find(function(obj){
                    return obj.key === 'importPurchases';
                });
                $scope.importPurchases = qm.stringHelper.isTruthy(importPurchases.defaultValue);
                $scope.onToggle = function(){
                    var params = {
                        importPurchases: $scope.importPurchases || false,
                        addAffiliateTag: $scope.addAffiliateTag || false
                    };
                    qmService.connectors.connectWithParams(params, connector.name);
                };
                var self = this;
                self.title = "Amazon Settings";
                $scope.hide = function(){
                    $mdDialog.hide();
                };
                $scope.cancel = function(){
                    $mdDialog.cancel();
                };
                $scope.getHelp = function(){
                    if(self.helpText && !self.showHelp){
                        return self.showHelp = true;
                    }
                    qmService.goToState(window.qm.staticData.stateNames.help);
                    $mdDialog.cancel();
                };
                $scope.answer = function(answer){
                    $mdDialog.hide(answer);
                };
            }
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/dialogs/amazon-settings.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false // Only for -xs, -sm breakpoints.
            })
                .then(function(answer){
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function(){
                    $scope.status = 'You cancelled the dialog.';
                });
        }
        var disconnectConnector = function(connector, button){
            qmLog.info("disconnectConnector connector " + JSON.stringify(connector), null, connector);
            button.text = 'Reconnect';
            qmService.showInfoToast("Disconnected " + connector.displayName);
            qmService.disconnectConnectorDeferred(connector.name).then(function(){
                $scope.refreshConnectors();
            }, function(error){
                qmLog.error("error disconnecting ", error);
            });
        };
        var updateConnector = function(connector, button){
            qmLog.info("updateConnector connector " + JSON.stringify(connector), null, connector);
            button.text = 'Update Scheduled';
            connector.message = "If you have new data, you should begin to see it in a hour or so.";
            qmService.updateConnector(connector.name);
            $scope.safeApply();
        };
        var getItHere = function(connector){
            qmLog.info("getItHere connector " + JSON.stringify(connector), null, connector);
            $scope.openUrl(connector.getItUrl, 'yes', '_system');
        };
        $scope.connectorAction = function(connector, button, ev){
            qmLog.info("connectorAction button " + JSON.stringify(button), null, button);
            qmLog.info("connectorAction connector " + JSON.stringify(connector), null, connector);
            connector.message = null;
            if(button.text.toLowerCase().indexOf('disconnect') !== -1){
                disconnectConnector(connector, button);
            }else if(button.text.toLowerCase().indexOf('connect') !== -1){
                connectConnector(connector, button, ev);
            }else if(button.text.toLowerCase().indexOf('settings') !== -1){
                amazonSettings(connector, button, ev);
            }else if(button.text.toLowerCase().indexOf('get it') !== -1){
                getItHere(connector, button);
            }else if(button.text.toLowerCase().indexOf('update') !== -1){
                updateConnector(connector, button);
            }else if(button.text.toLowerCase().indexOf('upgrade') !== -1){
                qmService.goToState('app.upgrade');
            }
        };
        $rootScope.$on('broadcastRefreshConnectors', function(){
            qmLog.info('broadcastRefreshConnectors broadcast received..');
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
                    qmLog.error(response);
                    $scope.$broadcast('scroll.refreshComplete');
                    qmService.hideLoader();
                });
        };
        function updateNavigationMenuButton(){
            $timeout(function(){
                qmService.rootScope.setShowActionSheetMenu(function(){
                    // Show the action sheet
                    var hideSheet = $ionicActionSheet.show({
                        buttons: [
                            qmService.actionSheets.actionSheetButtons.refresh,
                            qmService.actionSheets.actionSheetButtons.settings
                        ],
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function(){
                            qmLog.debug('CANCELLED', null);
                        },
                        buttonClicked: function(index, button){
                            if(index === 0){
                                $scope.refreshConnectors();
                            }
                            if(index === 1){
                                qmService.goToState(qm.staticData.stateNames.settings);
                            }
                            return true;
                        }
                    });
                });
            }, 1);
        }
        function connectWithInputCredentials(connector, button){
            function getHtmlForInput(parameters){
                var html ='';
                parameters.forEach(function (param) {
                    var ionIcon = param.ionIcon;
                    if (param.type === "password") {
                        ionIcon = 'ion-locked';
                    }
                    if (param.key.indexOf("user") !== -1) {
                        ionIcon = 'ion-person';
                    }
                    if (param.key.indexOf("mail") !== -1) {
                        ionIcon = 'ion-mail';
                    }
                    html += '<label class="item item-input">' +
                        '<i class="icon ' + ionIcon + 'placeholder-icon"></i>' +
                        '<input type="' + param.type + '" placeholder="' + param.displayName + '" ng-model="data.' + param.key + '">' +
                        '</label>';
                });
                return html;
            }
            var parameters = connector.connectInstructions.parameters;
            $scope.data = {};
            parameters.forEach(function(param){
                $scope.data[param.key] = null;
            });
            function getEmptyProperty(data){
                for (var property in $scope.data) {
                    if ($scope.data.hasOwnProperty(property)) {
                        if(!$scope.data[property]){
                            return property;
                        }
                    }
                }
                return false;
            }
            var myPopup = $ionicPopup.show({
                template: getHtmlForInput(parameters),
                title: connector.displayName,
                subTitle: connector.connectInstructions.text || 'Enter your ' + connector.displayName + ' credentials',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e){
                            if(getEmptyProperty($scope.data)){
                                e.preventDefault();
                                return false;
                            } else{
                                return $scope.data;
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(data){
                if(data){
                    button.text = "Import Scheduled";
                    qmService.connectors.connectWithParams(data, connector.name);
                }
            });
        }
    }]);
