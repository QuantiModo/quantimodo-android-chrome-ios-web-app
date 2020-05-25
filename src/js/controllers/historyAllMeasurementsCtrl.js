angular.module('starter').controller('historyAllMeasurementsCtrl', ["$scope", "$state", "$stateParams", "$rootScope",
    "$timeout", "$ionicActionSheet", "qmService", "qmLogService", function($scope, $state, $stateParams, $rootScope, $timeout,
                                                                           $ionicActionSheet, qmService, qmLogService){
        $scope.controller_name = "historyAllMeasurementsCtrl";
        $scope.state = {
            helpCardTitle: "Past Measurements",
            history: [],
            limit: 50,
            loadingText: "Fetching measurements...",
            moreDataCanBeLoaded: true,
            noHistory: false,
            showLocationToggle: false,
            sort: "-startTime",
            title: "History",
            units: [],
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            if(!$scope.helpCard || $scope.helpCard.title !== "Past Measurements"){
                $scope.helpCard = {
                    title: "Past Measurements",
                    bodyText: "Edit or add notes by tapping on any measurement below. Drag down to refresh and get your most recent measurements.",
                    icon: "ion-calendar"
                };
            }
            if($stateParams.refresh){$scope.state.history = [];}
            qm.measurements.addLocalMeasurements($scope.state.history, getRequestParams(), function(combined){
                $scope.safeApply(function () {
                    $scope.state.history = combined;
                })
            })
            $scope.state.moreDataCanBeLoaded = true;
            // Need to use rootScope here for some reason
            qmService.rootScope.setProperty('hideHistoryPageInstructionsCard',
                qm.storage.getItem('hideHistoryPageInstructionsCard'));
        });
        $scope.$on('$ionicView.enter', function(e){
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            var cat = getVariableCategoryName();
            if(cat && cat !== 'Anything'){
                document.title = $scope.state.title = cat + ' History';
                $scope.state.showLocationToggle = cat === "Location";
            }
            if(cat){setupVariableCategoryActionSheet();}
            getScopedVariableObject();
            if(getVariableName()){$scope.state.title = getVariableName() + ' History';}
            updateNavigationMenuButton();
            if(!$scope.state.history || !$scope.state.history.length){ // Otherwise it keeps add more measurements whenever we edit one
                $scope.getHistory();
            }
        });
        function updateNavigationMenuButton(){
            $timeout(function(){
                qmService.rootScope.setShowActionSheetMenu(function(){
                    // Show the action sheet
                    var hideSheet = $ionicActionSheet.show({
                        buttons: [
                            qmService.actionSheets.actionSheetButtons.refresh,
                            qmService.actionSheets.actionSheetButtons.settings,
                            qmService.actionSheets.actionSheetButtons.sortDescendingValue,
                            qmService.actionSheets.actionSheetButtons.sortAscendingValue,
                            qmService.actionSheets.actionSheetButtons.sortDescendingTime,
                            qmService.actionSheets.actionSheetButtons.sortAscendingTime
                        ],
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function(){
                            qmLogService.debug('CANCELLED', null);
                        },
                        buttonClicked: function(index, button){
                            if(index === 0){
                                $scope.refreshHistory();
                            }
                            if(index === 1){
                                qmService.goToState(qm.stateNames.settings);
                            }
                            if(button.text === qmService.actionSheets.actionSheetButtons.sortDescendingValue.text){
                                changeSortAndGetHistory('-value');
                            }
                            if(button.text === qmService.actionSheets.actionSheetButtons.sortAscendingValue.text){
                                changeSortAndGetHistory('value');
                            }
                            if(button.text === qmService.actionSheets.actionSheetButtons.sortDescendingTime.text){
                                changeSortAndGetHistory('-startTime');
                            }
                            if(button.text === qmService.actionSheets.actionSheetButtons.sortAscendingTime.text){
                                changeSortAndGetHistory('startTime');
                            }
                            return true;
                        }
                    });
                });
            }, 1);
        }
        function changeSortAndGetHistory(sort){
            $scope.state.history = qm.arrayHelper.sortByProperty($scope.state.history, sort)
            $scope.state.sort = sort;
            $scope.getHistory();
        }
        function hideLoader(){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $scope.state.loading = false;
            qmService.hideLoader();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        function getScopedVariableObject(){
            if($scope.state.variableObject && $scope.state.variableObject.name === getVariableName()){
                return $scope.state.variableObject;
            }
            if($stateParams.variableObject){
                return $scope.state.variableObject = $stateParams.variableObject;
            }
            return null;
        }
        function getVariableName(){
            if($stateParams.variableName){
                return $stateParams.variableName;
            }
            if($stateParams.variableObject){
                return $stateParams.variableObject.name;
            }
            if(qm.urlHelper.getParam('variableName')){
                return qm.urlHelper.getParam('variableName');
            }
            qmLog.info("Could not get variableName")
        }
        function getVariableCategoryName(){
            return qm.variableCategoryHelper.getVariableCategoryNameFromStateParamsOrUrl($stateParams);
        }
        function getConnectorName(){
            if($stateParams.connectorName){
                return $stateParams.connectorName;
            }
            if(qm.urlHelper.getParam('connectorName')){
                return qm.urlHelper.getParam('connectorName');
            }
            if(getConnectorId()){
                var connectorId = getConnectorId();
                var connector = qm.connectorHelper.getConnectorById(connectorId);
                if(!connector){
                    qm.qmLog.error(
                        "Cannot filter by connector id because we could not find a matching connector locally");
                    return null;
                }
                return connector.name;
            }
            qmLog.debug("Could not get connectorName")
        }
        function getConnectorId(){
            if($stateParams.connectorId){
                return $stateParams.connectorId;
            }
            if(qm.urlHelper.getParam('connector_id')){
                return qm.urlHelper.getParam('connector_id');
            }
            qmLog.debug("Could not get connector_id")
        }
        $scope.editMeasurement = function(measurement){
            //measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
            qmService.goToState('app.measurementAdd', {
                measurement: measurement, fromState: $state.current.name,
                fromUrl: window.location.href
            });
        };
        $scope.refreshHistory = function(){
            $scope.state.history = [];
            $scope.getHistory();
        };
        function getRequestParams(params){
            params = params || {};
            if(getVariableName()){
                params.variableName = getVariableName();
            }
            if(getConnectorName()){
                params.connectorName = getConnectorName();
            }
            if(getVariableCategoryName()){
                params.variableCategoryName = getVariableCategoryName();
            }
            params.sort = $scope.state.sort;
            return params;
        }
        $scope.getHistory = function(){
            if($scope.state.loading){
                return qmLog.info("Already getting measurements!");
            }
            if(!$scope.state.moreDataCanBeLoaded){
                hideLoader();
                return qmLog.info("No more measurements!");
            }
            $scope.state.loading = true;
            if(!$scope.state.history){
                $scope.state.history = [];
            }
            var params = {
                offset: $scope.state.history.length,
                limit: $scope.state.limit,
                sort: $scope.state.sort,
                doNotProcess: true
            };
            params = getRequestParams(params);
            if(getVariableName()){
                if(!$scope.state.variableObject){
                    qmService.searchUserVariablesDeferred('*', {variableName: getVariableName()}).then(function(variables){
                        $scope.state.variableObject = variables[0];
                    }, function(error){
                        qmLogService.error(error);
                    });
                }
            }
            function successHandler(measurements){
                if(!measurements || measurements.length < params.limit){
                    $scope.state.moreDataCanBeLoaded = false;
                }
                if(measurements.length < $scope.state.limit){
                    $scope.state.noHistory = measurements.length === 0;
                }
                qm.measurements.addLocalMeasurements(measurements, getRequestParams(),function (combined) {
                    $scope.state.history = combined;
                    hideLoader();
                })
            }
            function errorHandler(error){
                qmLogService.error("History update error: ", error);
                $scope.state.noHistory = true;
                hideLoader();
            }
            //qmService.showBasicLoader();
            qm.measurements.getMeasurementsFromApi(params, successHandler, errorHandler);
        };
        function setupVariableCategoryActionSheet(){
            qmService.rootScope.setShowActionSheetMenu(function(){
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        //{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                        {text: '<i class="icon ion-happy-outline"></i>Emotions'},
                        {text: '<i class="icon ion-ios-nutrition-outline"></i>Foods'},
                        {text: '<i class="icon ion-sad-outline"></i>Symptoms'},
                        {text: '<i class="icon ion-ios-medkit-outline"></i>Treatments'},
                        {text: '<i class="icon ion-ios-body-outline"></i>Physical Activity'},
                        {text: '<i class="icon ion-ios-pulse"></i>Vital Signs'},
                        {text: '<i class="icon ion-ios-location-outline"></i>Locations'}
                    ],
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLogService.debug('CANCELLED', null);
                    },
                    buttonClicked: function(index, button){
                        if(index === 0){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Emotions'});
                        }
                        if(index === 1){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Foods'});
                        }
                        if(index === 2){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Symptoms'});
                        }
                        if(index === 3){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Treatments'});
                        }
                        if(index === 4){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Physical Activity'});
                        }
                        if(index === 5){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Vital Signs'});
                        }
                        if(index === 6){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Locations'});
                        }
                        return true;
                    },
                    destructiveButtonClicked: function(){
                    }
                });
                $timeout(function(){
                    hideSheet();
                }, 20000);
            });
        }
        $scope.deleteMeasurement = function(measurement){
            measurement.hide = true;
            qmService.deleteMeasurementFromServer(measurement);
        };
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.showActionSheetForMeasurement = function(measurement){
            $scope.state.measurement = measurement;
            var variableObject = JSON.parse(JSON.stringify(measurement));
            variableObject.variableId = measurement.variableId;
            variableObject.name = measurement.variableName;
            var buttons = [
                {text: '<i class="icon ion-edit"></i>Edit Measurement'},
                qmService.actionSheets.actionSheetButtons.reminderAdd,
                qmService.actionSheets.actionSheetButtons.charts,
                qmService.actionSheets.actionSheetButtons.historyAllVariable,
                qmService.actionSheets.actionSheetButtons.variableSettings,
                qmService.actionSheets.actionSheetButtons.relationships
            ];
            if(measurement.url){
                buttons.push(qmService.actionSheets.actionSheetButtons.openUrl);
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLogService.debug(null, $state.current.name + ': ' + 'CANCELLED', null);
                },
                buttonClicked: function(index, button){
                    qmLogService.debug(null, $state.current.name + ': ' + 'BUTTON CLICKED', null, index);
                    if(index === 0){
                        $scope.editMeasurement($scope.state.measurement);
                    }
                    if(index === 1){
                        qmService.goToState('app.reminderAdd', {
                            variableObject: variableObject,
                            variableName: variableObject.name
                        });
                    }
                    if(index === 2){
                        qmService.goToState('app.charts', {
                            variableObject: variableObject,
                            variableName: variableObject.name
                        });
                    }
                    if(index === 3){
                        qmService.goToState('app.historyAllVariable', {
                            variableObject: variableObject,
                            variableName: variableObject.name
                        });
                    }
                    if(index === 4){
                        qmService.goToVariableSettingsByName($scope.state.measurement.variableName);
                    }
                    if(index === 5){
                        qmService.showBlackRingLoader();
                        qmService.goToCorrelationsListForVariable($scope.state.measurement.variableName);
                    }
                    if(index === 6){
                        qm.urlHelper.openUrlInNewTab(measurement.url);
                    }
                    return true;
                },
                destructiveButtonClicked: function(){
                    $scope.deleteMeasurement(measurement);
                    return true;
                }
            });
            $timeout(function(){
                hideSheet();
            }, 20000);
        };
    }]);
