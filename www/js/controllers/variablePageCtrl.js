angular.module('starter')

    // Controls the Track Page of the App
    .controller('VariablePageCtrl', function($scope, $q, $ionicModal, $state, $timeout, utilsService, authService,
                                                    measurementService, chartService, $ionicPopup, localStorageService,
                                                    $rootScope, $ionicLoading, ratingService, $stateParams, QuantiModo) {
        $scope.controller_name = "VariablePageCtrl";
        $scope.showBarChart = $rootScope.showBarChart || false;
        $scope.showLineChart = $rootScope.showLineChart || false;
        $scope.addReminderButtonText = "Add Reminder";
        $scope.recordMeasurementButtonText = "Record Measurement";
        $scope.editSettingsButtonText = "Edit Variable Settings";
        $scope.lineChartConfig = false;
        $scope.barChartConfig = false;
        $scope.variableName = $stateParams.variableName;

        $scope.addNewReminderButtonClick = function() {
            console.log("addNewReminderButtonClick");
            $state.go('app.reminderAdd', {
                variableObject: $rootScope.variablePage.variableObject,
                fromState: $state.current.name,
            });
        };

        $scope.recordMeasurementButtonClick = function() {
            $state.go('app.measurementAdd', {
                variableObject: $rootScope.variablePage.variableObject,
                fromState: $state.current.name,
            });
        };

        $scope.editSettingsButtonClick = function() {

        };

        var updateBarChart = function(barChartData){
            $scope.redrawBarChart = false;
            console.log("Configuring bar chart...");
            $scope.barChartConfig = chartService.configureBarChart(barChartData, $stateParams.variableName);
            $scope.redrawBarChart = true;
            showBarChart(true);
        };

        var updateLineChart = function(lineChartData){
            $scope.redrawLineChart = false;
            console.log("Configuring line chart...");
            $scope.lineChartConfig = chartService.configureLineChart(lineChartData, $stateParams.variableName);
            $scope.redrawLineChart = true;
            showLineChart(true);
        };

        var showLineChart = function(show) {
            $rootScope.variablePage.showLineChart = show;
            $scope.showLineChart = show;
        };

        var showBarChart = function(show) {
            $rootScope.variablePage.showBarChart = show;
            $scope.showBarChart = show;
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
            if ($rootScope.variablePage.history[0].abbreviatedUnitName === config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName) {
                $rootScope.variablePage.isOutOf5 = true;
                barArr = [0, 0, 0, 0, 0];
            }

            if ($rootScope.variablePage.history.length > 0) {
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

                for (var i = 0; i < $rootScope.variablePage.history.length; i++) {
                    var currentValue = Math.ceil($rootScope.variablePage.history[i].value); // Math.ceil was used before -- why?
                    var startTimeMilliseconds = $rootScope.variablePage.history[i].startTimeEpoch * 1000;
                    if (startTimeMilliseconds >= fromDate && startTimeMilliseconds <= toDate) {
                        var lineChartItem = [startTimeMilliseconds, currentValue];
                        lineArr.push(lineChartItem);
                        if ($rootScope.variablePage.isOutOf5) {
                            barArr[currentValue - 1]++;
                        }
                        $rootScope.variablePage.sum+= currentValue;
                        $rootScope.variablePage.rangeLength++;
                    }
                }
                $rootScope.variablePage.averageValue = Math.round($rootScope.variablePage.sum/($rootScope.variablePage.rangeLength));
                console.log("variablePageCtrl: update charts, logging lineArr");
                console.log(lineArr);
                
                if (!$scope.lineChartConfig) {
                    $rootScope.variablePage.lineChartData = lineArr;
                    if ($rootScope.variablePage.lineChartData.length > 0) {
                        updateLineChart($rootScope.variablePage.lineChartData);
                        if($rootScope.variablePage.isOutOf5 && (!$scope.barChartConfig || barArr !== $scope.barChartConfig.series[0].data)) {
                            $rootScope.variablePage.barChartData = barArr;
                            if ($rootScope.variablePage.barChartData.length === 5) {
                                updateBarChart($rootScope.variablePage.barChartData);
                                // only show if length > 0 - we don't want an empty bar chart
                            }
                        }
                        else {
                            showBarChart(false);
                        }
                        if (!$scope.$$phase) {
                            $scope.safeApply();
                        }
                    }
                    else {
                        showLineChart(false);
                    }
                }
                windowResize();
            }
        };

        var addDataPointAndUpdateCharts = function() {
            $rootScope.variablePage.history = $rootScope.variablePage.history.concat($stateParams.measurementInfo);

            var startTimeMilliseconds = $stateParams.measurementInfo.startTimeEpoch*1000;
            //if (startTimeMilliseconds >= fromDate && startTimeMilliseconds <= toDate) {
                var currentValue = Math.ceil($stateParams.measurementInfo.value);
                var lineChartItem = [startTimeMilliseconds, currentValue];
                $rootScope.variablePage.lineChartData.push(lineChartItem);
            //}
            updateLineChart($rootScope.variablePage.lineChartData);
            if ($rootScope.variablePage.isOutOf5) {
                $rootScope.variablePage.barChartData[currentValue - 1]++;
                updateBarChart($rootScope.variablePage.barChartData);
            }
            $rootScope.variablePage.sum+= currentValue;
            $rootScope.variablePage.rangeLength++;
            $rootScope.variablePage.averageValue = Math.round($rootScope.variablePage.sum/($rootScope.variablePage.rangeLength));

            updateLineChart($rootScope.variablePage.lineChartData);
            if ($rootScope.variablePage.isOutOf5) {
                updateBarChart($rootScope.variablePage.barChartData);
            }
        };
        

        var getHistoryForVariable = function(){
            console.log("variablePageCtrl: getHistoryforVariable " + $stateParams.variableName);
            var deferred = $q.defer();
            $scope.showLoader();
            QuantiModo.getMeasurements({
                offset: 0,
                sort: "startTimeEpoch",
                variableName: $stateParams.variableName
            }).then(function(history){
                $rootScope.variablePage.history = $rootScope.variablePage.history.concat(history);
                $scope.hideLoader();
                deferred.resolve();
            }, function(error){
                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                console.log('error getting measurements', error);
                $scope.hideLoader();
                deferred.reject(error);
            }, function(history) {
                $rootScope.variablePage.history = $rootScope.variablePage.history.concat(history);
            });
            return deferred.promise;
        };


        $scope.init();

        $scope.init = function(){
            console.log("variablePageCtrl: init");
            var variableObject;
            if ($stateParams.variableObject) {
                variableObject = $stateParams.variableObject;
            }
            else {
                variableObject = {
                    variableName: $stateParams.variableName,
                    variableCategoryName: null,
                    abbreviatedUnitName: null
                };
            }
            $rootScope.variablePage = {
                history : [],
                isOutOf5 : false,
                sum : 0,
                rangeLength : 0,
                averageValue : 0,
                variableObject: variableObject,
                //offset: 0,
                showBarChart: false,
                showLineChart: false,
                barChartData: null,
                lineChartData: null
            };

            $ionicLoading.hide();

            getHistoryForVariable().then((function() {
                if ($rootScope.variablePage.history.length > 0) {
                    $rootScope.variablePage.variableObject.variableCategoryName = $rootScope.variablePage.history[0].variableCategoryName;
                    $rootScope.variablePage.variableObject.abbreviatedUnitName = $rootScope.variablePage.history[0].abbreviatedUnitName;
                    console.log("variablePageCtrl: history log");
                    console.log($rootScope.variablePage.history);
                    updateCharts();
                }
            }));
        };

        $scope.$on('updateCharts', function(){
            $rootScope.isSyncing = false;
            console.log('track state redrawing event triggered through sibling controllers. Updating charts and syncing..');
            updateCharts();
        });

        $scope.$on('$ionicView.enter', function(e) {
            $scope.redrawLineChart = true;
            $scope.redrawBarChart = true;
            console.log("variablePageCtrl: ionicView.enter");
            if (!$rootScope.variablePage) {
                console.log("about to call init from enter: no $rootScope.variablePage");
                $scope.init();
            }
            else if ($rootScope.variablePage.history.length === 0) {
                console.log("about to call init from enter: no history");
                $scope.init();
            }
            else if ($rootScope.variablePage.variableObject.variableName !== $stateParams.variableName &&
            $rootScope.variablePage.variableObject.name !== $stateParams.variableName) {
                console.log("about to call init from enter: new variableName");
                $scope.init();
            }
            else if ($stateParams.measurementInfo) {
                console.log("about to call addDataPointAndUpdateCharts from enter");
                addDataPointAndUpdateCharts($stateParams.measurementInfo);
                windowResize();
            }
            else if ($stateParams.noReload) {
                // lineChartData getting cleared out upon cancel - not reproducible
                updateLineChart($rootScope.variablePage.lineChartData);
                if ($rootScope.variablePage.isOutOf5) {
                    updateBarChart($rootScope.variablePage.barChartData);
                }
                windowResize();
            }
            else {
                console.log("about to call init from enter: else");
                $scope.init();
            }

        });
    });