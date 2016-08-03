angular.module('starter')

    // Controls the Track Page of the App
    .controller('VariablePageCtrl', function($scope, $q, $ionicModal, $state, $timeout, utilsService, authService,
                                                    measurementService, chartService, $ionicPopup, localStorageService,
                                                    $rootScope, $ionicLoading, ratingService, $stateParams, QuantiModo,
                                             $ionicActionSheet, variableService) {
        $scope.controller_name = "VariablePageCtrl";
        $scope.addReminderButtonText = "Add Reminder";
        $scope.recordMeasurementButtonText = "Record Measurement";
        $scope.lineChartConfig = false;
        $scope.barChartConfig = false;
        $scope.state = {
            history : [],
            sum : 0,
            rangeLength : 0,
            averageValue : 0,
            offset: 0,
            showBarChart: false,
            showLineChart: false,
            showHourlyChart: false,
            showWeekdayChart: false,
            barChartData: null,
            lineChartData: null,
            statistics : {
                number_of_measurements: null,
                number_of_correlations: null,
                number_of_unique_daily_values: null,
                mean: null,
                median: null,
                most_common_value: null,
                standard_deviation: null,
                variance: null,
                skewness: null,
                kurtosis: null
            }

        };

        $scope.addNewReminderButtonClick = function() {
            console.log("addNewReminderButtonClick");
            $state.go('app.reminderAdd', {
                variableObject: $scope.state.variableObject,
                fromState: $state.current.name
            });
        };

        $scope.recordMeasurementButtonClick = function() {
            $state.go('app.measurementAdd', {
                variableObject: $scope.state.variableObject,
                fromState: $state.current.name
            });
        };

        $scope.editSettingsButtonClick = function() {
            $scope.goToSettingsForVariableObject($scope.state.variableObject);
        };

        var updateBarChart = function(barChartData){
            console.log("Configuring bar chart...");
            $scope.barChartConfig = chartService.configureBarChart(barChartData, $scope.state.variableObject.variableName);
            $scope.state.showBarChart = true;
        };


        var updateWeekdayChart = function(measurementsToChart){
            console.log("Configuring Weekday chart...");
            $scope.weekdayChartConfig = chartService.processDataAndConfigureWeekdayChart(measurementsToChart, $scope.state.variableObject);
            $scope.state.showWeekdayChart = true;
        };

        var updateHourlyChart = function(measurementsToChart){
            console.log("Configuring Hourly chart...");
            $scope.hourlyChartConfig = chartService.processDataAndConfigureHourlyChart(measurementsToChart, $scope.state.variableObject);
            $scope.state.showHourlyChart = true;
        };


        var updateLineChart = function(lineChartData){
            console.log("Configuring line chart...");
            $scope.lineChartConfig = chartService.configureLineChart(lineChartData, $scope.state.variableObject.variableName);
            $scope.state.showLineChart = true;
        };

        var windowResize = function() {
            $(window).resize();

            // Not sure what this does
            $timeout(function() {
                $scope.$broadcast('highchartsng.reflow');
            }, 10);
            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');
        };

        // updates all the visual elements on the page
        var updateCharts = function(){

            var lineArr = [];
            var barArr = []; // only if /5 unit
            if ($scope.state.history[0].abbreviatedUnitName === '/5') {
                $scope.state.variableObject.abbreviatedUnitName = '/5';
                barArr = [0, 0, 0, 0, 0];
            }

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

                var fromDate = 0;
                var toDate = Date.now();
                var measurementsToChart = [];

                for (var i = 0; i < $scope.state.history.length; i++) {
                    var currentValue = Math.ceil($scope.state.history[i].value); // Math.ceil was used before -- why?
                    var startTimeMilliseconds = $scope.state.history[i].startTimeEpoch * 1000;
                    if (startTimeMilliseconds >= fromDate && startTimeMilliseconds <= toDate) {
                        measurementsToChart.push($scope.state.history[i]);
                        var lineChartItem = [startTimeMilliseconds, currentValue];
                        lineArr.push(lineChartItem);
                        if ($scope.state.variableObject.abbreviatedUnitName === '/5') {
                            barArr[currentValue - 1]++;
                        }
                        $scope.state.sum+= currentValue;
                        $scope.state.rangeLength++;
                    }
                }
                updateHourlyChart(measurementsToChart);
                updateWeekdayChart(measurementsToChart);
                $scope.state.averageValue = Math.round($scope.state.sum/($scope.state.rangeLength));
                console.log("variablePageCtrl: update charts, logging lineArr");
                console.log(lineArr);
                
                if (!$scope.lineChartConfig) {
                    $scope.state.lineChartData = lineArr;
                    if ($scope.state.lineChartData.length > 0) {
                        updateLineChart($scope.state.lineChartData);
                        if($scope.state.variableObject.abbreviatedUnitName === '/5' && (!$scope.barChartConfig || barArr !== $scope.barChartConfig.series[0].data)) {
                            $scope.state.barChartData = barArr;
                            if ($scope.state.barChartData.length === 5) {
                                updateBarChart($scope.state.barChartData);
                                // only show if length > 0 - we don't want an empty bar chart
                            }
                        }
                        else {
                            $scope.state.showBarChart = false;
                        }
                        if (!$scope.$$phase) {
                            $scope.safeApply();
                        }
                    }
                    else {
                        $scope.state.showLineChart = false;
                    }
                }
                windowResize();
            }
        };

        var addDataPointAndUpdateCharts = function() {
            $scope.state.history = $scope.state.history.concat($stateParams.measurementInfo);


            var startTimeMilliseconds = $stateParams.measurementInfo.startTimeEpoch*1000;
            //if (startTimeMilliseconds >= fromDate && startTimeMilliseconds <= toDate) {
                var currentValue = Math.ceil($stateParams.measurementInfo.value);
                var lineChartItem = [startTimeMilliseconds, currentValue];
                $scope.state.lineChartData.push(lineChartItem);
            //}
            updateLineChart($scope.state.lineChartData);
            if ($scope.state.variableObject.abbreviatedUnitName === '/5') {
                $scope.state.barChartData[currentValue - 1]++;
                updateBarChart($scope.state.barChartData);
            }
            $scope.state.sum+= currentValue;
            $scope.state.rangeLength++;
            $scope.state.averageValue = Math.round($scope.state.sum/($scope.state.rangeLength));

            updateLineChart($scope.state.lineChartData);
            if ($scope.state.variableObject.abbreviatedUnitName === '/5') {
                updateBarChart($scope.state.barChartData);
            }
        };
        

        var getHistoryForVariable = function(params){
            console.log("variablePageCtrl: getHistoryForVariable " + $scope.state.variableObject.variableName);
            var deferred = $q.defer();
            $scope.showLoader('Getting ' + $scope.state.variableObject.variableName + ' measurements...');

            QuantiModo.getV1Measurements(params, function(history){
                $scope.state.history = $scope.state.history.concat(history);
                if(!$scope.state.variableObject.abbreviatedUnitName){
                    $scope.state.variableObject.abbreviatedUnitName = history[0].abbreviatedUnitName;
                }
                if(!$scope.state.variableObject.unitName){
                    $scope.state.variableObject.unitName = history[0].unitName;
                }
                if(history.length === 200){
                    $scope.state.offset = $scope.state.offset + 200;
                    params = {
                        offset: $scope.state.offset,
                        sort: "startTimeEpoch",
                        variableName: $scope.state.variableObject.variableName,
                        limit: 200
                    };
                    getHistoryForVariable(params);
                }
                else {
                    $scope.hideLoader();
                }
                deferred.resolve();
            }, function(error){
                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                console.log('error getting measurements', error);
                $scope.hideLoader();
                deferred.reject(error);
            }, function(history) {
                $scope.state.history = $scope.state.history.concat(history);
            });
            return deferred.promise;
        };


        var getStatisticsForVariable = function (variableName) {
            variableService.getVariablesByName(variableName).then(function(variableObject){
                updateStatisticsForVariable(variableObject);
            });
        };

        var updateStatisticsForVariable = function(variableObject) {
            $scope.state.statistics.number_of_measurements = variableObject.numberOfMeasurements;
            $scope.state.statistics.number_of_correlations = variableObject.numberOfCorrelations;
            $scope.state.statistics.number_of_unique_daily_values = variableObject.numberOfUniqueDailyValues;
            $scope.state.statistics.mean = variableObject.mean;
            $scope.state.statistics.median = variableObject.median;
            $scope.state.statistics.most_common_value = variableObject.mostCommonValue;
            $scope.state.statistics.standard_deviation = variableObject.standardDeviation;
            $scope.state.statistics.variance = variableObject.variance;
            $scope.state.statistics.skewness = variableObject.skewness;
            $scope.state.statistics.kurtosis = variableObject.kurtosis;

            console.log($scope.state.statistics);
            console.log("stats logged");
        };
        
        $scope.init = function(){
            console.log("variablePageCtrl: init");
            if($stateParams.variableObject){
                $scope.state.variableObject = $stateParams.variableObject;
                if($stateParams.variableObject.name){
                    $scope.state.variableObject.variableName = $stateParams.variableObject.name;
                }
                getStatisticsForVariable($scope.state.variableObject.variableName);
            } else if ($stateParams.trackingReminder){
                $scope.state.variableObject = $stateParams.trackingReminder;
                getStatisticsForVariable($scope.state.variableObject.variableName);
            } else if ($stateParams.variableName){
                $scope.state.variableObject = {};
                $scope.state.variableObject.variableName = $stateParams.variableName;
                variableService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $scope.state.variableObject = variableObject;
                    $scope.state.variableObject.variableName = variableObject.name;
                    updateStatisticsForVariable(variableObject);
                });

            } else {
                console.error("No variable name provided to variable page controller!");
            }

            $ionicLoading.hide();

            var params = {
                offset: $scope.state.offset,
                sort: "startTimeEpoch",
                variableName: $scope.state.variableObject.variableName,
                limit: 200
            };

            getHistoryForVariable(params).then((function() {
                if ($scope.state.history.length > 0) {
                    console.log("variablePageCtrl: history log");
                    console.log($scope.state.history);
                    updateCharts();
                }
            }));

        };

        $scope.$on('$ionicView.enter', function(e) {
            $scope.hideLoader();
            console.log("variablePageCtrl: ionicView.enter");
            if (!$scope.state) {
                console.log("about to call init from enter: no $scope.state");
                $scope.init();
            }
            else if ($scope.state.history.length === 0) {
                console.log("about to call init from enter: no history");
                $scope.init();
            }
            else if ($stateParams.measurementInfo) {
                console.log("about to call addDataPointAndUpdateCharts from enter");
                addDataPointAndUpdateCharts($stateParams.measurementInfo);
                windowResize();
            }
            else if ($stateParams.noReload) {
                // lineChartData getting cleared out upon cancel - not reproducible
                updateLineChart($scope.state.lineChartData);
                if ($scope.state.variableObject.abbreviatedUnitName === '/5') {
                    updateBarChart($scope.state.barChartData);
                }
                windowResize();
            }
            else {
                console.log("about to call init from enter: else");
                $scope.init();
            }

        });

        $rootScope.showActionSheetMenu = function() {

            console.debug("variablePageCtrl.showActionSheetMenu:  $scope.state.variableObject: ", $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'},
                    { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                    { text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
                    { text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
                ],
                //destructiveText: '<i class="icon ion-trash-a"></i>Delete Favorite',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.log('BUTTON CLICKED', index);
                    if(index === 0){
                        $scope.addToFavoritesUsingStateVariableObject($scope.state.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddMeasurementForVariableObject($scope.state.variableObject);
                    }
                    if(index === 2){
                        $scope.goToAddReminderForVariableObject($scope.state.variableObject);
                    }
                    if(index === 3) {
                        $scope.goToHistoryForVariableObject($scope.state.variableObject);
                    }
                    if (index === 4) {
                        $scope.goToSettingsForVariableObject($scope.state.variableObject);
                    }
                    if(index === 5){
                        $state.go('app.predictors',
                            {
                                variableObject: $scope.state.variableObject,
                                requestParams: {
                                    effect:  $scope.state.variableObject.name,
                                    correlationCoefficient: "(gt)0"
                                }
                            });
                    }
                    if(index === 6){
                        $state.go('app.predictors',
                            {
                                variableObject: $scope.state.variableObject,
                                requestParams: {
                                    effect:  $scope.state.variableObject.name,
                                    correlationCoefficient: "(lt)0"
                                }
                            });
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.deleteReminder();
                    return true;
                }
            });


            $timeout(function() {
                hideSheet();
            }, 20000);

        };
    });