angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackPrimaryOutcomeCtrl', function($scope, $ionicModal, $state, $timeout, utilsService, authService,
                                                    measurementService, chartService, $ionicPopup, localStorageService,
                                                    $rootScope, $ionicLoading, ratingService) {
        $scope.controller_name = "TrackPrimaryOutcomeCtrl";

        //$scope.showCharts = false;
        $scope.showRatingFaces = true;
        // flags
        $scope.timeRemaining = false;
        $scope.averagePrimaryOutcomeVariableImage = false;
        $scope.averagePrimaryOutcomeVariableValue = false;
        $scope.lineChartData = null;
        $scope.barChartData = null;
        $scope.showRatingFaces = true;

        // chart flags
        $scope.state = {
            showBarChart : false,
            showLineChart : false,
            showWeekdayChart: false,
            showHourlyChart : false
        };
        $scope.lineChartConfig = false;
        $scope.barChartConfig = false;
        $scope.weekdayChartConfig = false;
        $scope.hourlyChartConfig = false;
        $scope.syncDisplayText = 'Syncing ' + config.appSettings.primaryOutcomeVariableDetails.name + ' measurements...';

        $scope.storeRatingLocalAndServerAndUpdateCharts = function (numericRatingValue) {

            // flag for blink effect
            $scope.timeRemaining = true;
            $scope.showRatingFaces = false;

            if (window.chrome && window.chrome.browserAction) {
                chrome.browserAction.setBadgeText({
                    text: ""
                });
            }

            //  add to measurementsQueue
            var primaryOutcomeMeasurement = measurementService.createPrimaryOutcomeMeasurement(numericRatingValue);
            measurementService.addToMeasurementsQueue(primaryOutcomeMeasurement);

            if(!$rootScope.isSyncing){
                $scope.showLoader($scope.syncDisplayText);
                measurementService.syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts().then(function() {
                    $scope.hideLoader();
                });
            }
           
        };

        // Update primary outcome variable images via an integer
        var updateAveragePrimaryOutcomeRatingView = function(numericRatingValue){
            var averageRatingText =
                config.appSettings.ratingValueToTextConversionDataSet[numericRatingValue];
            if(averageRatingText){
                $scope.averagePrimaryOutcomeVariableImage = ratingService.getRatingFaceImageByText(averageRatingText);
                $scope.averagePrimaryOutcomeVariableText = averageRatingText;
                console.log("updated averagePrimaryOutcomeVariableRating view");
            }

            if(!$scope.$$phase) {
                console.log("Not in the middle of digest cycle, so redrawing everything...");
                $scope.safeApply();
            }
        };

        var updateBarChart = function(barChartData){
            console.log("Configuring bar chart...");
            $scope.barChartConfig = chartService.configureBarChart(barChartData);
            $scope.state.showBarChart = true;
        };

        var updateLineChart = function(lineChartData){
            console.log("Configuring line chart...");
            $scope.lineChartConfig = chartService.configureLineChart(lineChartData);
            $scope.state.showLineChart = true;
        };

        var updateWeekdayChart = function(weekdayChartData){
            console.log("Configuring Weekday chart...");
            $scope.weekdayChartConfig = chartService.configureWeekdayChart(weekdayChartData, config.appSettings.primaryOutcomeVariableDetails);
            $scope.state.showWeekdayChart = true;
        };

        var updateHourlyChart = function(hourlyChartData){
            console.log("Configuring Hourly chart...");
            $scope.hourlyChartConfig = chartService.configureHourlyChart(hourlyChartData, config.appSettings.primaryOutcomeVariableDetails);
            $scope.state.showHourlyChart = true;
        };

        var updateCharts = function(){

            measurementService.getAllLocalMeasurements(false, function(allMeasurements) {
                var lineArr = [];
                var barArr = [0, 0, 0, 0, 0];
                var sum = 0;
                var weekdayMeasurementArrays = [];
                var hourlyMeasurementArrays = [];
                $scope.averageValueByWeekday = [];
                $scope.averageValueByHour = [];

                if (allMeasurements) {
                    var fromDate = parseInt(localStorageService.getItemSync('fromDate'));
                    var toDate = parseInt(localStorageService.getItemSync('toDate'));
                    if (!fromDate) {
                        fromDate = 0;
                    }
                    if (!toDate) {
                        toDate = Date.now();
                    }
                    var rangeLength = 0; // number of measurements in date range
                    for (var i = 0; i < allMeasurements.length; i++) {
                        var currentValue = Math.ceil(allMeasurements[i].value);
                        if (allMeasurements[i].abbreviatedUnitName ===
                            config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName &&
                            (currentValue - 1) <= 4 && (currentValue - 1) >= 0) {
                            var startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
                            if (startTimeMilliseconds >= fromDate && startTimeMilliseconds <= toDate) {
                                var percentValue = (currentValue - 1) * 25;
                                var lineChartItem = [startTimeMilliseconds, percentValue];
                                lineArr.push(lineChartItem);
                                barArr[currentValue - 1]++;

                                sum+= allMeasurements[i].value;
                                rangeLength++;
                            }
                            if(typeof weekdayMeasurementArrays[moment(startTimeMilliseconds).day()] === "undefined"){
                                weekdayMeasurementArrays[moment(startTimeMilliseconds).day()] = [];
                            }
                            weekdayMeasurementArrays[moment(startTimeMilliseconds).day()].push(allMeasurements[i]);
                            if(typeof hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] === "undefined"){
                                hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] = [];
                            }
                            hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()].push(allMeasurements[i]);
                        }
                    }

                    $scope.averageValueByWeekday = chartService.calculateAverageValueByWeekday(weekdayMeasurementArrays);
                    $scope.averageValueByHour = chartService.calculateAverageValueByHour(hourlyMeasurementArrays);

                    var averagePrimaryOutcomeVariableValue = Math.round(sum/(rangeLength));
                    localStorageService.setItem('averagePrimaryOutcomeVariableValue',averagePrimaryOutcomeVariableValue);

                    if(!$scope.barChartConfig || barArr !== $scope.barChartConfig.series[0].data) {
                        updateAveragePrimaryOutcomeRatingView(averagePrimaryOutcomeVariableValue);
                        $scope.lineChartData = lineArr;
                        $scope.barChartData = barArr;
                        if ($scope.lineChartData.length > 0 && $scope.barChartData.length === 5) {
                            updateLineChart($scope.lineChartData);
                            updateBarChart($scope.barChartData);
                            updateWeekdayChart($scope.averageValueByWeekday);
                            updateHourlyChart($scope.averageValueByHour);
                            $scope.showCharts = true;
                        }
                        if (!$scope.$$phase) {
                            $scope.safeApply();
                        }
                    }
                    $(window).resize();
                    $timeout(function() {
                        $scope.$broadcast('highchartsng.reflow');
                    }, 10);
                    // Fixes chart width
                    $scope.$broadcast('highchartsng.reflow');
                }
            });

        };


        $scope.init = function(){
            $ionicLoading.hide();
            Bugsnag.context = "trackPrimary";
            updateCharts();

            $scope.showHelpInfoPopupIfNecessary();
            if (typeof analytics !== 'undefined')  { analytics.trackView("Track Primary Outcome Controller"); }
            $ionicLoading.hide();
        };

        $scope.init();
        
        $scope.$on('updateCharts', function(){
            $scope.hideLoader();
            console.log('track state redrawing event triggered through sibling controllers. Updating charts and syncing..');
            updateCharts();
        });

        $scope.$on('$ionicView.enter', function(e) {
            $scope.hideLoader();
            console.log('Track state brought in focus. Updating charts and syncing..');
            $scope.showRatingFaces = true;
            $scope.timeRemaining = false;
            $scope.showLoader($scope.syncDisplayText);
            measurementService.syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts().then(function() {
                $scope.hideLoader();
            });
        });
    });