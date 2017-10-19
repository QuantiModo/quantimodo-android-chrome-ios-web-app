angular.module('starter').controller('TrackPrimaryOutcomeCtrl', function($scope, $state, $timeout, $rootScope, $ionicLoading, qmService) {
    $scope.controller_name = "TrackPrimaryOutcomeCtrl";
    $scope.state = {};
    $rootScope.showFilterBarSearchIcon = false;
    $scope.showRatingFaces = true;
    $scope.averagePrimaryOutcomeVariableImage = false;
    $scope.averagePrimaryOutcomeVariableValue = false;
    $scope.primaryOutcomeVariable = qmService.getPrimaryOutcomeVariable();
    var syncDisplayText = 'Syncing ' + qmService.getPrimaryOutcomeVariable().name + ' measurements...';
    $scope.$on('$ionicView.enter', function(e) { qmService.logDebug("Entering state " + $state.current.name);
        qmService.logDebug('TrackPrimaryOutcomeCtrl enter. Updating charts and syncing..');
        $rootScope.hideNavigationMenu = false;
        updateCharts();
        $scope.showRatingFaces = true;
        $scope.timeRemaining = false;
        qmService.showInfoToast(syncDisplayText);
        qmService.logDebug($state.current.name + ' going to syncPrimaryOutcomeVariableMeasurements');
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
        if (window.chrome && window.chrome.browserAction) {chrome.browserAction.setBadgeText({text: ""});}
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
        $scope.averagePrimaryOutcomeVariableText = qmService.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[$scope.averagePrimaryOutcomeVariableValue ];
        if($scope.averagePrimaryOutcomeVariableText){$scope.averagePrimaryOutcomeVariableImage = qmService.getRatingFaceImageByText($scope.averagePrimaryOutcomeVariableText);}
    };
    var updateCharts = function(){
        $scope.state.primaryOutcomeMeasurements = qmService.getLocalStorageItemAsObject('primaryOutcomeVariableMeasurements');
        var measurementsQueue = qmService.getLocalStorageItemAsObject('measurementsQueue');
        if(!$scope.state.primaryOutcomeMeasurements){$scope.state.primaryOutcomeMeasurements = [];}
        if(measurementsQueue){$scope.state.primaryOutcomeMeasurements =  $scope.state.primaryOutcomeMeasurements.concat(measurementsQueue);}
        if( $scope.state.primaryOutcomeMeasurements) {
            $scope.hourlyChartConfig = qmService.processDataAndConfigureHourlyChart( $scope.state.primaryOutcomeMeasurements, qmService.getPrimaryOutcomeVariable());
            $scope.weekdayChartConfig = qmService.processDataAndConfigureWeekdayChart($scope.state.primaryOutcomeMeasurements, qmService.getPrimaryOutcomeVariable());
            $scope.distributionChartConfig = qmService.processDataAndConfigureDistributionChart( $scope.state.primaryOutcomeMeasurements, qmService.getPrimaryOutcomeVariable());
            updateAveragePrimaryOutcomeRatingView();
            $scope.lineChartConfig = qmService.processDataAndConfigureLineChart( $scope.state.primaryOutcomeMeasurements, qmService.getPrimaryOutcomeVariable());
        }
    };
    $scope.$on('updateCharts', function(){
        qmService.logDebug('updateCharts broadcast received..');
        updateCharts();
    });
});
