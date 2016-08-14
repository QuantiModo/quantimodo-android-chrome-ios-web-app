angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackPrimaryOutcomeCtrl', function($scope, $timeout, $rootScope, $ionicLoading, measurementService, 
                                                    chartService, localStorageService, ratingService) {
        $scope.controller_name = "TrackPrimaryOutcomeCtrl";

        //$scope.showCharts = false;
        $scope.showRatingFaces = true;
        // flags
        $scope.timeRemaining = false;
        $scope.averagePrimaryOutcomeVariableImage = false;
        $scope.averagePrimaryOutcomeVariableValue = false;
        $scope.showRatingFaces = true;
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
                measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                    updateCharts();
                    $ionicLoading.hide();
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
        var updateCharts = function(){
            measurementService.getAllLocalMeasurements(false, function(primaryOutcomeMeasurements) {
                primaryOutcomeMeasurements = JSON.parse(primaryOutcomeMeasurements);
                if (primaryOutcomeMeasurements) {
                    $scope.lineChartConfig =
                        chartService.processDataAndConfigureLineChart(primaryOutcomeMeasurements,
                            config.appSettings.primaryOutcomeVariableDetails);
                    $scope.hourlyChartConfig =
                        chartService.processDataAndConfigureHourlyChart(primaryOutcomeMeasurements,
                            config.appSettings.primaryOutcomeVariableDetails);
                    $scope.weekdayChartConfig =
                        chartService.processDataAndConfigureWeekdayChart(primaryOutcomeMeasurements,
                            config.appSettings.primaryOutcomeVariableDetails);
                    $scope.distributionChartConfig =
                        chartService.processDataAndConfigureDistributionChart(primaryOutcomeMeasurements,
                            config.appSettings.primaryOutcomeVariableDetails);
                }
            });
        };


        $scope.init = function(){
            $ionicLoading.hide();
            Bugsnag.context = "trackPrimary";
            updateCharts();
            console.log('Track state brought in focus. Updating charts and syncing..');
            $scope.showRatingFaces = true;
            $scope.timeRemaining = false;
            $scope.showLoader($scope.syncDisplayText);
            measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                updateCharts();
                $ionicLoading.hide();
            });
            if (typeof analytics !== 'undefined')  { analytics.trackView("Track Primary Outcome Controller"); }
        };

        $scope.$on('updateCharts', function(){
            $scope.init();
        });

        $scope.$on('$ionicView.enter', function(e) {
            $scope.init();
        });
    });