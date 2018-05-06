angular.module('starter').controller('TrackPrimaryOutcomeCtrl', ["$scope", "$state", "$timeout", "$rootScope", "$ionicLoading", "qmService", "qmLogService", function($scope, $state, $timeout, $rootScope, $ionicLoading, qmService, qmLogService) {
    $scope.controller_name = "TrackPrimaryOutcomeCtrl";
    $scope.state = {};
    $scope.primaryOutcomeVariableDetails = qm.getPrimaryOutcomeVariable();
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.showRatingFaces = true;
    $scope.averagePrimaryOutcomeVariableImage = false;
    $scope.averagePrimaryOutcomeVariableValue = false;
    $scope.primaryOutcomeVariable = qm.getPrimaryOutcomeVariable();
    var syncDisplayText = 'Syncing ' + qm.getPrimaryOutcomeVariable().name + ' measurements...';
    $scope.$on('$ionicView.enter', function(e) { qmLogService.debug('Entering state ' + $state.current.name, null);
        qmLogService.debug('TrackPrimaryOutcomeCtrl enter. Updating charts and syncing..', null);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        updateCharts();
        $scope.showRatingFaces = true;
        $scope.timeRemaining = false;
        qmService.showInfoToast(syncDisplayText);
        qmLogService.debug($state.current.name + ' going to syncPrimaryOutcomeVariableMeasurements', null);
        qmService.syncPrimaryOutcomeVariableMeasurements().then(function(){
            updateCharts();
            qmService.hideLoader();
        });
    });
    $scope.$on('$ionicView.afterEnter', function(e) {
        qmService.hideLoader();
    });
    $scope.storeRatingLocalAndServerAndUpdateCharts = function (numericRatingValue) {
        $scope.timeRemaining = true;
        $scope.showRatingFaces = false;
        qm.chrome.updateChromeBadge(0);
        var primaryOutcomeMeasurement = qmService.createPrimaryOutcomeMeasurement(numericRatingValue);
        qmService.addToMeasurementsQueue(primaryOutcomeMeasurement);
        updateCharts();
        if(!$rootScope.isSyncing && $rootScope.user){
            qmService.showInfoToast(syncDisplayText);
            qmService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                updateCharts();
            });
        }
    };
    var updateAveragePrimaryOutcomeRatingView = function(){
        var sum = 0;
        for (var j = 0; j <  $scope.state.primaryOutcomeMeasurements.length; j++) {sum += $scope.state.primaryOutcomeMeasurements[j].value;}
        $scope.averagePrimaryOutcomeVariableValue = Math.round(sum / $scope.state.primaryOutcomeMeasurements.length);
        $scope.averagePrimaryOutcomeVariableText = qm.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[$scope.averagePrimaryOutcomeVariableValue ];
        if($scope.averagePrimaryOutcomeVariableText){$scope.averagePrimaryOutcomeVariableImage = qmService.getRatingFaceImageByText($scope.averagePrimaryOutcomeVariableText);}
    };
    var updateCharts = function(){
        qm.localForage.getItem(qm.items.primaryOutcomeVariableMeasurements, function(measurements){
            if(measurements){
                qmLog.info("Got " + measurements.length + " measurements from localforage");
            } else {
                qmLog.info("Got 0 measurements from localforage");
            }
            $scope.state.primaryOutcomeMeasurements = measurements;
            var measurementsQueue = qm.storage.getItem('measurementsQueue');
            if(measurementsQueue){
                qmLog.info("Got " + measurementsQueue.length + " measurements from measurementsQueue");
            } else {
                qmLog.info("Got 0 measurements from measurementsQueue");
            }
            if(!$scope.state.primaryOutcomeMeasurements){$scope.state.primaryOutcomeMeasurements = [];}
            if(measurementsQueue){$scope.state.primaryOutcomeMeasurements =  $scope.state.primaryOutcomeMeasurements.concat(measurementsQueue);}
            if( $scope.state.primaryOutcomeMeasurements) {
                $scope.state.distributionChartConfig = null; // Necessary to render update for some reason
                $timeout(function() {
                    if($scope.state.primaryOutcomeMeasurements){
                        qmLog.info("Updating charts with " + $scope.state.primaryOutcomeMeasurements.length + " measurements");
                    } else {
                        qmLog.info("Updating charts with 0 measurements");
                    }
                    $scope.state.hourlyChartConfig = qmService.processDataAndConfigureHourlyChart( $scope.state.primaryOutcomeMeasurements, qm.getPrimaryOutcomeVariable());
                    $scope.state.weekdayChartConfig = qmService.processDataAndConfigureWeekdayChart($scope.state.primaryOutcomeMeasurements, qm.getPrimaryOutcomeVariable());
                    $scope.state.lineChartConfig = qmService.processDataAndConfigureLineChart( $scope.state.primaryOutcomeMeasurements, qm.getPrimaryOutcomeVariable());
                    $scope.state.distributionChartConfig = qmService.processDataAndConfigureDistributionChart( $scope.state.primaryOutcomeMeasurements, qm.getPrimaryOutcomeVariable());
                    updateAveragePrimaryOutcomeRatingView();
                }, 1);
            }
        });

    };
    $scope.$on('updateCharts', function(){
        qmLogService.debug('updateCharts broadcast received..');
        updateCharts();
    });
}]);
