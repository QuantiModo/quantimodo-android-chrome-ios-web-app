angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackPrimaryOutcomeCtrl', function($scope, $ionicModal, $state, $timeout, utilsService, authService, 
                                                    measurementService, chartService, $ionicPopup, localStorageService,
                                                    $rootScope, $ionicLoading, ratingService) {
        $scope.controller_name = "TrackPrimaryOutcomeCtrl";

        $scope.showCharts = false;
        $scope.showRatingFaces = true;

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
            measurementService.addToMeasurementsQueue(numericRatingValue);

            if(!$rootScope.isSyncing){
                syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts();
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


        var updateBarChart = function(arr){
            $scope.redrawBarChart = false;
            console.log("re-drawing bar chart");

            console.log("load config object chartService.configureBarChart");
            $scope.barChartConfig = chartService.configureBarChart(arr);
            
            console.log("redraw chart with new data");
            $scope.redrawBarChart = true;
        };

        var updateLineChart = function(lineChartData){
            $scope.redrawLineChart = false;
            console.log("Configuring line chart...");
            $scope.lineChartConfig = chartService.configureLineChart(lineChartData);



            // redraw chart with new data
            $scope.redrawLineChart = true;

        };

        // updates all the visual elements on the page
        var updateCharts = function(){

            measurementService.getAllLocalMeasurements(false, function(allMeasurements) {
                var lineArr = [];
                var barArr = [0, 0, 0, 0, 0];
                var sum = 0;

                if (allMeasurements) {
                    for (var i = 0; i < allMeasurements.length; i++) {
                        var currentValue = Math.ceil(allMeasurements[i].value);
                        if (allMeasurements[i].abbreviatedUnitName === config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName &&
                            (currentValue - 1) <= 4 && (currentValue - 1) >= 0) {
                            var startTimeMilliseconds = moment(allMeasurements[i].startTimeEpoch).unix() * 1000;
                            var percentValue = (currentValue - 1) * 25;
                            var lineChartItem = [startTimeMilliseconds, percentValue];
                            lineArr.push(lineChartItem);
                            barArr[currentValue - 1]++;
                        }
                        sum+= allMeasurements[i].value;
                    }
                    var averagePrimaryOutcomeVariableValue = Math.round(sum/(allMeasurements.length));
                    localStorageService.setItem('averagePrimaryOutcomeVariableValue',averagePrimaryOutcomeVariableValue);

                    if(!$scope.barChartConfig || barArr !== $scope.barChartConfig.series[0].data) {
                        updateAveragePrimaryOutcomeRatingView(averagePrimaryOutcomeVariableValue);
                        $scope.lineChartData = lineArr;
                        $scope.barChartData = barArr;
                        if ($scope.lineChartData.length > 0 && $scope.barChartData.length === 5) {
                            updateLineChart($scope.lineChartData);
                            updateBarChart($scope.barChartData);
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

        // calculate values for both of the charts
        var syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts = function(){

            if($rootScope.user){
                $rootScope.isSyncing = true;
                console.log('Syncing primary outcome measurements...');

                measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                    //console.log("Measurement sync complete!");
                    $rootScope.isSyncing = false;

                    // update loader text
                    $ionicLoading.hide();
                    //$scope.showLoader('Calculating stuff', 2000);

                    // now handled with broadcast
                    //updateCharts();

                });
            }
            else {
                updateCharts();
            }
        };

        $scope.init = function(){

            // flags
            $scope.timeRemaining = false;
            $scope.averagePrimaryOutcomeVariableImage = false;
            $scope.averagePrimaryOutcomeVariableValue = false;
            $scope.lineChartData = null;
            $scope.barChartData = null;
            $scope.showRatingFaces = true;

            // chart flags
            $scope.lineChartConfig = false; 
            $scope.barChartConfig = false;
            $scope.redrawLineChart = true;
            $scope.redrawBarChart = true;
            $scope.showHelpInfoPopupIfNecessary();
            $ionicLoading.hide();
        };

        $scope.init();

        $scope.$on('updateChartsAndSyncMeasurements', function(){
            console.log('track state redrawing event triggered through sibling controllers. Updating charts and syncing..');
            syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts();
        });
        
        $scope.$on('updateCharts', function(){
            $rootScope.isSyncing = false;
            console.log('track state redrawing event triggered through sibling controllers. Updating charts and syncing..');
            
             //if(!$scope.lineChartConfig){
                updateCharts();
             //}
        });

        $scope.$on('$ionicView.enter', function(e) {
            console.log('track state brought in focus. Updating charts and syncing..');
            $scope.showRatingFaces = true;
            syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts();

        });
    });