angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackPrimaryOutcomeCtrl', function($scope, $state, $timeout, $rootScope, $ionicLoading, measurementService,
                                                    chartService, localStorageService, ratingService, $stateParams) {
        $scope.controller_name = "TrackPrimaryOutcomeCtrl";
        $scope.state = {};

        //$scope.showCharts = false;
        $scope.showRatingFaces = true;
        // flags
        $scope.timeRemaining = false;
        $scope.averagePrimaryOutcomeVariableImage = false;
        $scope.averagePrimaryOutcomeVariableValue = false;
        $scope.showRatingFaces = true;
        $scope.syncDisplayText = 'Syncing ' + config.appSettings.primaryOutcomeVariableDetails.name + ' measurements...';

        var windowResize = function() {
            $(window).resize();

            // Not sure what this does
            $timeout(function() {
                $scope.$broadcast('highchartsng.reflow');
            }, 10);
            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');
        };

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
            updateCharts();

            if(!$rootScope.isSyncing && $rootScope.user){
                $scope.showLoader($scope.syncDisplayText);
                measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                    updateCharts();
                    $ionicLoading.hide();
                });
            }
           
        };

        var updateAveragePrimaryOutcomeRatingView = function(){
            var sum = 0;
            for (var j = 0; j <  $scope.state.primaryOutcomeMeasurements.length; j++) {
                sum += $scope.state.primaryOutcomeMeasurements[j].value;
            }
            $scope.averagePrimaryOutcomeVariableValue = Math.round(sum / $scope.state.primaryOutcomeMeasurements.length);

            $scope.averagePrimaryOutcomeVariableText =
                config.appSettings.ratingValueToTextConversionDataSet[$scope.averagePrimaryOutcomeVariableValue ];
            if($scope.averagePrimaryOutcomeVariableText){
                $scope.averagePrimaryOutcomeVariableImage = ratingService.getRatingFaceImageByText($scope.averagePrimaryOutcomeVariableText);
            }
            windowResize();
        };

        var updateCharts = function(){
            $scope.state.primaryOutcomeMeasurements = localStorageService.getItemAsObject('allMeasurements');
            var measurementsQueue = localStorageService.getItemAsObject('measurementsQueue');
            if(!$scope.state.primaryOutcomeMeasurements){
                $scope.state.primaryOutcomeMeasurements = [];
            }
            if(measurementsQueue){
                $scope.state.primaryOutcomeMeasurements =  $scope.state.primaryOutcomeMeasurements.concat(measurementsQueue);
            }
            if( $scope.state.primaryOutcomeMeasurements) {
                $scope.lineChartConfig =
                    chartService.processDataAndConfigureLineChart( $scope.state.primaryOutcomeMeasurements,
                        config.appSettings.primaryOutcomeVariableDetails);
                $scope.hourlyChartConfig =
                    chartService.processDataAndConfigureHourlyChart( $scope.state.primaryOutcomeMeasurements,
                        config.appSettings.primaryOutcomeVariableDetails);
                $scope.weekdayChartConfig =
                    chartService.processDataAndConfigureWeekdayChart( $scope.state.primaryOutcomeMeasurements,
                        config.appSettings.primaryOutcomeVariableDetails);
                $scope.distributionChartConfig =
                    chartService.processDataAndConfigureDistributionChart( $scope.state.primaryOutcomeMeasurements,
                        config.appSettings.primaryOutcomeVariableDetails);
                updateAveragePrimaryOutcomeRatingView();
            }
            windowResize();
        };


        $scope.init = function(){
            $ionicLoading.hide();
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

            updateCharts();
            $scope.showRatingFaces = true;
            $scope.timeRemaining = false;
            if($rootScope.user || $rootScope.accessToken){
                $scope.showLoader($scope.syncDisplayText);
                console.debug($state.current.name + ' going to syncPrimaryOutcomeVariableMeasurements');
                measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                    updateCharts();
                    $ionicLoading.hide();
                });
            } else {
                console.debug($state.current.name + ' has no user or access token so we cannot syncPrimaryOutcomeVariableMeasurements');
            }
        };

        $scope.$on('updateCharts', function(){
            console.debug('updateCharts broadcast received..');
            updateCharts();
        });

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            console.debug('$ionicView.enter. Updating charts and syncing..');
            $scope.init();
        });
    });