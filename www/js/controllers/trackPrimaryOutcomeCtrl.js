angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackPrimaryOutcomeCtrl', function($scope, $ionicModal, $state, $timeout, utilsService, authService, 
                                                    measurementService, chartService, $ionicPopup, localStorageService) {
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

                var user = authService.getUserFromLocalStorage();
                if(user){
                    // try to send the data to server if we have a user
                    measurementService.updatePrimaryOutcomeVariable(primaryOutcomeRatingValue);
                }

                // calculate charts data
                measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function () {

                    setTimeout(function () {
                        $scope.timeRemaining = false;
                        $scope.$apply();
                    }, 500);

                    draw();
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
                console.log("Not in the middle of digest cycle, so redrawing everything...");
                $scope.$apply();
            }
        };


        var updateBarChart = function(arr){
            $scope.redrawBarChart = false;
            console.log("re-drawing bar chart");

            console.log("load config object chartService.getBarChartStub");
            $scope.barChartConfig = chartService.getBarChartStub(arr);

            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');
            console.log("redraw chart with new data");
            $scope.redrawBarChart = true;

        };

        var updateLineChart = function(lineChartData){

            $scope.redrawLineChart = false;
            console.log("Configuring line chart...");
            $scope.lineChartConfig = chartService.getLineChartStub(lineChartData);

            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');

            // redraw chart with new data
            $scope.redrawLineChart = true;

        };

        // updates all the visual elements on the page
        var draw = function(){
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
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                    $scope.showCharts = true;
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
            generateLineAndBarChartData();
        };

        $scope.init();

        // to handle redrawing event's triggered through sibling controllers.
        $scope.$on('redraw', function(){
            console.log("redrawing");
            
            // update everything
            draw();
        });

        // when this view is brought in focus
        $scope.$on('$ionicView.enter', function(e) {
            
            // update everything
            draw();
        });
    });