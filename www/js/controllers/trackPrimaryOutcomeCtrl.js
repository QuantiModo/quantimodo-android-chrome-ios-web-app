angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackPrimaryOutcomeCtrl', function($scope, $ionicModal, $state, $timeout, utilsService, authService, 
                                                    measurementService, chartService, $ionicPopup, localStorageService,
                                                    $rootScope, $ionicLoading) {
        $scope.controller_name = "TrackPrimaryOutcomeCtrl";

        $scope.showCharts = false;
        $scope.showRatingFaces = true;

        $scope.recordPrimaryOutcomeVariableRating = function (primaryOutcomeRatingValue) {

            // flag for blink effect
            $scope.timeRemaining = true;
            $scope.showRatingFaces = false;

            if (window.chrome && window.chrome.browserAction) {
                chrome.browserAction.setBadgeText({
                    text: ""
                });
            }

            // update local storage
            measurementService.updatePrimaryOutcomeVariableLocally(primaryOutcomeRatingValue).then(function () {

                if(!$rootScope.user){
                    $rootScope.user = localStorageService.getItemAsObject('user');
                }
                if($rootScope.user){
                    // try to send the data to server if we have a user
                    measurementService.updatePrimaryOutcomeVariableOnServer(primaryOutcomeRatingValue);
                }

                // calculate charts data
                measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function () {

                    setTimeout(function () {
                        $scope.timeRemaining = false;
                        $scope.safeApply();
                    }, 500);

                    updateCharts();
                });
            });
        };

        // Update primary outcome variable images via an integer
        var updateAveragePrimaryOutcomeRatingView = function(averagePrimaryOutcomeVariableRating){
            var averageRatingValue = config.appSettings.primaryOutcomeValueConversionDataSet[averagePrimaryOutcomeVariableRating];
            if(averageRatingValue){
                $scope.averagePrimaryOutcomeVariableImage = config.getImageForPrimaryOutcomeVariableByValue(averageRatingValue);
                $scope.averagePrimaryOutcomeVariableValue = averageRatingValue;
                console.log("updated averagePrimaryOutcomeVariableRating view");
            }

            if(!$scope.$$phase) {
                $scope.showRatingFaces = true;
                console.log("Not in the middle of digest cycle, so redrawing everything...");
                $scope.safeApply();
            }
        };


        var updateBarChart = function(arr){
            $scope.redrawBarChart = false;
            console.log("re-drawing bar chart");

            console.log("load config object chartService.configureBarChart");
            $scope.barChartConfig = chartService.configureBarChart(arr);

            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');
            console.log("redraw chart with new data");
            $scope.redrawBarChart = true;
        };

        var updateLineChart = function(lineChartData){
            $scope.redrawLineChart = false;
            console.log("Configuring line chart...");
            $scope.lineChartConfig = chartService.configureLineChart(lineChartData);

            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');

            // redraw chart with new data
            $scope.redrawLineChart = true;

        };

        // updates all the visual elements on the page
        var updateCharts = function(){
            localStorageService.getItem('averagePrimaryOutcomeVariableValue',function(averagePrimaryOutcomeVariableValue){
                if(averagePrimaryOutcomeVariableValue){
                    updateAveragePrimaryOutcomeRatingView(averagePrimaryOutcomeVariableValue);
                }

                generateLineAndBarChartData();

                // update line chart
                if($scope.lineChartData !== "[]" && $scope.lineChartData !== null) {
                    updateLineChart($scope.lineChartData);
                    $scope.showCharts = true;
                }

                // update bar chart
                if($scope.barChartData !== "[0,0,0,0,0]" && $scope.barChartData !== null){
                    updateBarChart($scope.barChartData);
                    $scope.showCharts = true;
                }

                if(!$scope.$$phase) {
                    $scope.safeApply();
                }
            });
        };

        // constructor
        function generateLineAndBarChartData() {
            var __ret = measurementService.getLineAndBarChartData();
            if(__ret){
                $scope.lineChartData = __ret.lineArr;
                $scope.barChartData = __ret.barArr;
            }
        }

        // calculate values for both of the charts
        var calculateChartValues = function(){
            measurementService.calculateBothChart().then($ionicLoading.hide());
        };

        // calculate values for both of the charts
        var syncPrimaryOutcomeVariableMeasurements = function(){

            if(!$rootScope.user){
                var userObject = localStorageService.getItemAsObject('user');
                if(userObject){
                    $rootScope.user = userObject;
                }
            }

            if(!$rootScope.user){
                console.log('Cannot sync because we do not have a user in local storage!');
                return;
            }

            if($rootScope.user){
                $rootScope.isSyncing = true;
                console.log('Syncing primary outcome measurements...');

                measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                    console.log("Measurement sync complete!");
                    $rootScope.isSyncing = false;

                    // update loader text
                    $ionicLoading.hide();
                    utilsService.loadingStart('Calculating stuff', 2000);

                    // calculate primary outcome variable values
                    measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function(){
                        measurementService.getPrimaryOutcomeVariableValue().then(calculateChartValues, calculateChartValues);
                        updateCharts();
                    });


                });
            }
        };

        $scope.init = function(){

            // flags
            $scope.timeRemaining = false;
            $scope.averagePrimaryOutcomeVariableImage = false;
            $scope.averagePrimaryOutcomeVariableValue = false;
            $scope.lineChartData = null;
            $scope.barChartData = null;

            // chart flags
            $scope.lineChartConfig = false; 
            $scope.barChartConfig = false;
            $scope.redrawLineChart = true;
            $scope.redrawBarChart = true;
            $scope.showHelpInfoPopupIfNecessary();
            syncPrimaryOutcomeVariableMeasurements();
            generateLineAndBarChartData();
            $ionicLoading.hide();
        };

        $scope.init();

        $scope.$on('updateChartsAndSyncMeasurements', function(){
            console.log('track state redrawing event triggered through sibling controllers. Updating charts and syncing..');
            updateCharts();
            syncPrimaryOutcomeVariableMeasurements();
        });

        $scope.$on('$ionicView.enter', function(e) {
            console.log('track state brought in focus. Updating charts and syncing..');
            updateCharts();
            syncPrimaryOutcomeVariableMeasurements();
            $timeout(function() {
                $scope.$broadcast('highchartsng.reflow');
            }, 10);
        });
    });