angular.module('starter')

    // Controls the Track Page of the App
    .controller('TrackCtrl', function($scope, $ionicModal, $state, $timeout, utilsService, authService, measurementService, chartService, $ionicPopup,localStorageService) {
        $scope.controller_name = "TrackCtrl";
        
        // when a tracking_factor is reported
        $scope.report_tracking_factor = function(tracking_factor){
            
            // flag for blink effect
            $scope.timeRemaining = true;

            // update localstorage
            measurementService.updateTrackingFactorLocally(tracking_factor).then(function () {
                
                // try to send the data to server
                measurementService.updateTrackingFactor(tracking_factor);

                // calculate charts data
                measurementService.calculateAverageTrackingFactorValue().then(function(){
                    
                    setTimeout(function(){
                        $scope.timeRemaining = false;
                        $scope.$apply();
                    },500);
                    
                    draw();
                });

            });
            
        };

        // Update Trackng Factor images via an integer
        var updateTrackingFactorView = function(tracking_factor){
            var val = config.appSettings.conversion_dataset[tracking_factor];
            if(val){
                $scope.averageTrackingFactorImage = config.getImageForTrackingFactorByValue(val);
                $scope.averageTrackingFactorValue = val;
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
            
            // load config object
            $scope.barChartConfig = chartService.getBarChartStub(arr);
            
            // redraw chart with new data
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
            localStorageService.getItem('averageTrackingFactorValue',function(averageTrackingFactorValue){
                if(averageTrackingFactorValue){
                    updateTrackingFactorView(averageTrackingFactorValue);
                }

                // update line chart
                localStorageService.getItem('lineChartData',function(lineChartData){
                    if(lineChartData)
                        updateLineChart(JSON.parse(lineChartData));

                    // update bar chart
                    localStorageService.getItem('barChartData',function(barChartData){
                        if(barChartData){
                            updateBarChart(JSON.parse(barChartData));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    });
                });
            });
        };

        // show alert box
        $scope.showAlert = function(title, template) {
           var alertPopup = $ionicPopup.alert({
                cssClass : 'calm',
                okType : 'button-calm',
                title: title,
                template: template
           });
        };

        // constructor
        $scope.init = function(){

            // flags
            $scope.timeRemaining = false;
            $scope.averageTrackingFactorImage = false;
            $scope.averageTrackingFactorValue = false;

            // chart flags
            $scope.lineChartConfig = false; 
            $scope.barChartConfig = false
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