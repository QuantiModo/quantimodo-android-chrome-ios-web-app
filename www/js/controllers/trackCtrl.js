angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackCtrl', function($scope, $ionicModal, $state, $timeout, utilsService, authService, measurementService, chartService, $ionicPopup, localStorageService) {
        $scope.controller_name = "TrackCtrl";

        $scope.showCharts = false;

        $scope.recordPrimaryOutcomeVariableRating = function (primaryOutcomeRatingValue) {

            // flag for blink effect
            $scope.timeRemaining = true;

            if (window.chrome && window.chrome.browserAction) {
                chrome.browserAction.setBadgeText({
                    text: ""
                });
            }

            // update localstorage
            measurementService.updatePrimaryOutcomeVariableLocally(primaryOutcomeRatingValue).then(function () {

                // try to send the data to server
                measurementService.updatePrimaryOutcomeVariable(primaryOutcomeRatingValue);

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

        // Update Trackng Factor images via an integer
        var updatePrimaryOutcomeVariableView = function(primaryOutcomeVariable){
            var val = config.appSettings.primaryOutcomeValueConversionDataSet[primaryOutcomeVariable];
            if(val){
                $scope.averagePrimaryOutcomeVariableImage = config.getImageForPrimaryOutcomeVariableByValue(val);
                $scope.averagePrimaryOutcomeVariableValue = val;
            }
            console.log("updated");
            
            // if not in the middle of digest cycle
            if(!$scope.$$phase) {

                // redraw everything
                $scope.$apply();
            }
        };

        // re/draw bar chart
        var updateBarChart = function(arr){
            
            // flag to recreate barchart
            $scope.redrawBarChart = false;
            console.log("updatedBar");

            console.log("load config object chartService.getBarChartStub");
            $scope.barChartConfig = chartService.getBarChartStub(arr);

            console.log("redraw chart with new data");
            $scope.redrawBarChart = true;

        };

        // re/draw line chart
        var updateLineChart = function(arr){

            // flag to recreate linechart
            $scope.redrawLineChart = false;
            console.log("updatedLine");

            // load config object
            $scope.lineChartConfig = chartService.getLineChartStub(arr);

            // redraw chart with new data
            $scope.redrawLineChart = true;

        };

        // updates all the visual elements on the page
        var draw = function(){
            localStorageService.getItem('averagePrimaryOutcomeVariableValue',function(averagePrimaryOutcomeVariableValue){
                if(averagePrimaryOutcomeVariableValue){
                    updatePrimaryOutcomeVariableView(averagePrimaryOutcomeVariableValue);
                }

                // update line chart
                localStorageService.getItem('lineChartData',function(lineChartData){
                    if(lineChartData !== "[]") {
                        updateLineChart(JSON.parse(lineChartData));
                        $scope.showCharts = true;
                    }

                    // update bar chart
                    localStorageService.getItem('barChartData',function(barChartData){
                        if(barChartData !== "[0,0,0,0,0]"){
                            updateBarChart(JSON.parse(barChartData));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                            $scope.showCharts = true;
                        }
                    });
                });
            });
        };

        // show alert box
        $scope.showAlert = function(title, template) {
           var alertPopup = $ionicPopup.alert({
                cssClass : 'positive',
                okType : 'button-positive',
                title: title,
                template: template
           });
        };

        // constructor
        $scope.init = function(){

            // flags
            $scope.timeRemaining = false;
            $scope.averagePrimaryOutcomeVariableImage = false;
            $scope.averagePrimaryOutcomeVariableValue = false;

            // chart flags
            $scope.lineChartConfig = false; 
            $scope.barChartConfig = false;
            $scope.redrawLineChart = true;
            $scope.redrawBarChart = true;

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