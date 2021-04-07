angular.module('starter').controller('TrackPrimaryOutcomeCtrl',
    ["$scope", "$state", "$rootScope", "qmService",
    function($scope, $state, $rootScope, qmService){
    $scope.controller_name = "TrackPrimaryOutcomeCtrl";
    $scope.state = {};
    $scope.primaryOutcomeVariableDetails = qm.getPrimaryOutcomeVariable();
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.showRatingFaces = true;
    $scope.averagePrimaryOutcomeVariableImage = false;
    $scope.averagePrimaryOutcomeVariableValue = false;
    $scope.primaryOutcomeVariable = qm.getPrimaryOutcomeVariable();
    var syncDisplayText = 'Syncing ' + qm.getPrimaryOutcomeVariable().name + ' measurements...';
    $scope.$on('$ionicView.enter', function(e){
        qmLog.debug('Entering state ' + $state.current.name+' Updating charts and syncing..');
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        qmService.showBlackRingLoader();
        updateCharts();
        $scope.showRatingFaces = true;
        $scope.timeRemaining = false;
        qmService.showInfoToast(syncDisplayText);
    });
    $scope.$on('$ionicView.afterEnter', function(e){});
    $scope.storeRatingLocalAndServerAndUpdateCharts = function(numericRatingValue){
        //debugger
        $scope.timeRemaining = true;
        $scope.showRatingFaces = false;
        var measurement = qmService.createPrimaryOutcomeMeasurement(numericRatingValue);
        qm.measurements.postMeasurement(measurement).then(function (){
            updateCharts();
        });
    };
    var updateAveragePrimaryOutcomeRatingView = function(measurements){
        var sum = 0;
        for(var j = 0; j < measurements.length; j++){
            sum += measurements[j].value;
        }
        $scope.averagePrimaryOutcomeVariableValue = Math.round(sum / measurements.length);
        $scope.averagePrimaryOutcomeVariableText = qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[$scope.averagePrimaryOutcomeVariableValue];
        if($scope.averagePrimaryOutcomeVariableText){
            $scope.averagePrimaryOutcomeVariableImage = qmService.getRatingFaceImageByText($scope.averagePrimaryOutcomeVariableText);
        }
    };
    var updateCharts = function(){
        //debugger
        var uv = qm.getPrimaryOutcomeVariable()
        qm.measurements.getMeasurements({limit: 900, variableName: uv.name}).then(function (measurements){
            //debugger
            $scope.state.distributionChartConfig = null; // Necessary to render update for some reason
            $scope.safeApply(function(){
                if(measurements){
                    qmLog.info("Updating charts with " + measurements.length + " measurements");
                }else{
                    qmLog.info("Updating charts with 0 measurements");
                }
                $scope.state.hourlyChartConfig = qmService.processDataAndConfigureHourlyChart(measurements, uv);
                $scope.state.weekdayChartConfig = qmService.processDataAndConfigureWeekdayChart(measurements, uv);
                $scope.state.lineChartConfig = qmService.processDataAndConfigureLineChart(measurements, uv);
                $scope.state.distributionChartConfig = qmService.processDataAndConfigureDistributionChart(measurements, uv);
                updateAveragePrimaryOutcomeRatingView(measurements);
                qmService.hideLoader();
            }, 1);
        }, function (err){
            qmLog.errorAndExceptionTestingOrDevelopment(err);
        });
    };
}]);
