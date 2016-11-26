angular.module('starter')

    // Controls the Track Page of the App
    .controller('ChartsPageCtrl', function($scope, $q, $state, $timeout, $rootScope, $ionicLoading,  $ionicActionSheet,
                                             $stateParams, chartService, localStorageService, QuantiModo, 
                                             variableService) {
        $scope.controller_name = "ChartsPageCtrl";
        $scope.addReminderButtonText = "Add Reminder";
        $scope.recordMeasurementButtonText = "Record Measurement";
        $scope.lineChartConfig = false;
        $scope.distributionChartConfig = false;
        $scope.state = {
            history : [],
            dailyHistory : [],
            sum : 0,
            rangeLength : 0,
            averageValue : 0,
            offset: 0,
            dailyHistoryOffset: 0
        };

        $scope.addNewReminderButtonClick = function() {
            console.debug("addNewReminderButtonClick");
            $state.go('app.reminderAdd', {
                variableObject: $rootScope.variableObject,
                fromState: $state.current.name
            });
        };

        $scope.recordMeasurementButtonClick = function() {
            $state.go('app.measurementAdd', {
                variableObject: $rootScope.variableObject,
                fromState: $state.current.name
            });
        };

        $scope.editSettingsButtonClick = function() {
            $state.go('app.variableSettings',
                {variableObject: $rootScope.variableObject});
        };

        var windowResize = function() {
            $(window).resize();

            // Not sure what this does
            var seconds = 0.1;
            console.debug('Setting windowResize timeout for ' + seconds + ' seconds');
            $timeout(function() {
                $scope.$broadcast('highchartsng.reflow');
            }, seconds * 1000);
            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');
        };

        var updateDailyCharts = function(){

            if ($scope.state.dailyHistory.length > 0) {
                // FIXME Eventually update fromDate and toDate so calendar can determine domain
                /*var fromDate = parseInt(localStorageService.getItemSync('fromDate'));
                 var toDate = parseInt(localStorageService.getItemSync('toDate'));
                 if (!fromDate) {
                 fromDate = 0;
                 }
                 if (!toDate) {
                 toDate = Date.now();
                 }*/
                if($rootScope.variableObject.fillingValue !== null && $rootScope.variableObject.fillingValue !== -1){
                    chartService.processDataAndConfigureDistributionChart($scope.state.dailyHistory, $rootScope.variableObject).then(function (config) {
                        $scope.distributionChartConfig = config;
                    });
                }

                chartService.processDataAndConfigureLineChart($scope.state.dailyHistory, $rootScope.variableObject).then(function (config) {
                    $scope.lineChartConfig = config;
                });

                chartService.processDataAndConfigureWeekdayChart($scope.state.dailyHistory, $rootScope.variableObject).then(function (config) {
                    $scope.weekdayChartConfig = config;
                });
                windowResize();
            }
        };

        var updateCharts = function(){

            if ($scope.state.history.length > 0) {
                // FIXME Eventually update fromDate and toDate so calendar can determine domain
                /*var fromDate = parseInt(localStorageService.getItemSync('fromDate'));
                var toDate = parseInt(localStorageService.getItemSync('toDate'));
                if (!fromDate) {
                    fromDate = 0;
                }
                if (!toDate) {
                    toDate = Date.now();
                }*/
                if($rootScope.variableObject.fillingValue === null || $rootScope.variableObject.fillingValue === -1){
                    chartService.processDataAndConfigureDistributionChart($scope.state.history, $rootScope.variableObject).then(function (config) {
                        $scope.distributionChartConfig = config;
                    });
                }
                chartService.processDataAndConfigureHourlyChart($scope.state.history, $rootScope.variableObject).then(function (config) {
                    $scope.hourlyChartConfig = config;
                });
                windowResize();
            }
        };

        var getHistoryForVariable = function(params){
            if(!params.variableName){
                console.error("ERROR: params.variableName not provided to getHistoryForVariable");
                console.error($state.current.name + " params: " + JSON.stringify(params));
                console.error($state.current.name + " $rootScope.variableObject: " + JSON.stringify($rootScope.variableObject));
                return;
            }
            //$scope.showLoader('Fetching measurements');
            QuantiModo.getV1Measurements(params, function(history){
                $scope.state.history = $scope.state.history.concat(history);
                
                if(history.length > 0 && $scope.state.history.length < 1000){
                    $scope.state.offset = $scope.state.offset + 200;
                    params = {
                        offset: $scope.state.offset,
                        sort: "-startTimeEpoch",
                        variableName: $rootScope.variableObject.name,
                        limit: 200
                    };
                    updateCharts();
                    getHistoryForVariable(params);
                } else {
                    $scope.state.loading = false;
                    $scope.hideLoader();
                    if ($scope.state.history.length > 0) {
                        updateCharts();
                    }
                }
            }, function(error){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                }
                console.error($state.current.name + ' error getting measurements: ' + JSON.stringify(error));
                $scope.state.loading = false;
                $scope.hideLoader();
            }, function(history) {
                $scope.state.history = $scope.state.history.concat(history);
            });
        };

        var getDailyHistoryForVariable = function(params){
            if(!params.variableName){
                console.error("ERROR: params.variableName not provided to getHistoryForVariable");
                console.error("params: " + JSON.stringify(params));
                console.error("$rootScope.variableObject: " + JSON.stringify($rootScope.variableObject));
                return;
            }
            //$scope.showLoader('Fetching measurements');
            QuantiModo.getV1MeasurementsDaily(params, function(dailyHistory){
                $scope.state.dailyHistory = $scope.state.dailyHistory.concat(dailyHistory);

                if(dailyHistory.length > 0 && $scope.state.dailyHistory.length < 1000){
                    $scope.state.dailyHistoryOffset = $scope.state.dailyHistoryOffset + 200;
                    params = {
                        offset: $scope.state.dailyHistoryOffset,
                        sort: "-startTimeEpoch",
                        variableName: $rootScope.variableObject.name,
                        limit: 200
                    };
                    updateDailyCharts();
                    getDailyHistoryForVariable(params);
                } else {
                    if ($scope.state.dailyHistory.length > 0) {
                        updateDailyCharts();
                    }
                }
            }, function(error){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                }
                console.error($state.current.name + ' error getting dailyHistory measurements: ' + JSON.stringify(error));
                $scope.hideLoader();
            }, function(history) {
                $scope.state.dailyHistory = $scope.state.dailyHistory.concat(history);
            });
        };

        var getStatisticsForVariable = function (variableName) {
            $rootScope.variableObject = {
                name:  variableName
            };
            $rootScope.variableName = variableName;
            variableService.getVariablesByName(variableName).then(function(variableObject){
                $rootScope.variableObject = variableObject;
            });
        };
        
        $scope.init = function(){
            //$scope.showLoader('Fetching measurements');
            $scope.state.loading = true;
            console.debug("variablePageCtrl: init");
            if($stateParams.variableObject){
                $rootScope.variableObject = $stateParams.variableObject;
            } else if ($stateParams.trackingReminder){
                getStatisticsForVariable($stateParams.trackingReminder.variableName);
            } else if ($stateParams.variableName){
                getStatisticsForVariable($stateParams.variableName);
            } else {
                console.error("ERROR: chartsPageCtrl.init No variable name provided!");
                return;
            }

            $ionicLoading.hide();

            if($rootScope.variableObject.name){
                $rootScope.variableName = $rootScope.variableObject.name;
                var params = {
                    sort: "startTimeEpoch",
                    variableName: $rootScope.variableObject.name,
                    limit: 200,
                    offset: 0
                };
                getDailyHistoryForVariable(params);
                getHistoryForVariable(params);
            } else {
                console.error($state.current.name + ' ERROR: $rootScope.variableObject.name not defined! $rootScope.variableObject: ' +
                    JSON.stringify($rootScope.variableObject));
            }
        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.init();

            $rootScope.showActionSheetMenu = function() {

                console.debug("variablePageCtrl.showActionSheetMenu:  $rootScope.variableObject: ", $rootScope.variableObject);
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                        { text: '<i class="icon ion-compose"></i>Record Measurement'},
                        { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                        { text: '<i class="icon ion-ios-list-outline"></i>History'},
                        { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'}
                    ],
                    destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function() {
                        console.debug('CANCELLED');
                    },
                    buttonClicked: function(index) {
                        console.debug('BUTTON CLICKED', index);
                        if(index === 0){
                            $scope.addToFavoritesUsingVariableObject($rootScope.variableObject);
                        }
                        if(index === 1){
                            $scope.goToAddMeasurementForVariableObject($rootScope.variableObject);
                        }
                        if(index === 2){
                            $scope.goToAddReminderForVariableObject($rootScope.variableObject);
                        }
                        if(index === 3) {
                            $scope.goToHistoryForVariableObject($rootScope.variableObject);
                        }
                        if (index === 4) {
                            $state.go('app.variableSettings',
                                {variableObject: $rootScope.variableObject});
                        }

                        return true;
                    },
                    destructiveButtonClicked: function() {
                        $scope.showDeleteAllMeasurementsForVariablePopup();
                        return true;
                    }
                });

                console.debug('Setting hideSheet timeout');
                $timeout(function() {
                    hideSheet();
                }, 20000);

            };
        });


    });