angular.module('starter').controller('TrackPrimaryOutcomeCtrl', function($scope, $state, $timeout, $rootScope, $ionicLoading, quantimodoService) {
    $scope.controller_name = "TrackPrimaryOutcomeCtrl";
    $scope.state = {};
    $rootScope.showFilterBarSearchIcon = false;
    $scope.showRatingFaces = true;
    $scope.averagePrimaryOutcomeVariableImage = false;
    $scope.averagePrimaryOutcomeVariableValue = false;
    var syncDisplayText = 'Syncing ' + quantimodoService.getPrimaryOutcomeVariable().name + ' measurements...';
    $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
        console.debug('TrackPrimaryOutcomeCtrl enter. Updating charts and syncing..');
        $rootScope.hideNavigationMenu = false;
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        updateCharts();
        $scope.showRatingFaces = true;
        $scope.timeRemaining = false;
        if($rootScope.user || quantimodoService.getUrlParameter('accessToken')){
            $scope.showLoader(syncDisplayText);
            console.debug($state.current.name + ' going to syncPrimaryOutcomeVariableMeasurements');
            quantimodoService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                $scope.hideLoader();
                updateCharts();
                $ionicLoading.hide();
            });
        } else {console.debug($state.current.name + ' has no user or access token so we cannot syncPrimaryOutcomeVariableMeasurements');}
    });
    $scope.storeRatingLocalAndServerAndUpdateCharts = function (numericRatingValue) {
        $scope.timeRemaining = true;
        $scope.showRatingFaces = false;
        if (window.chrome && window.chrome.browserAction) {chrome.browserAction.setBadgeText({text: ""});}
        var primaryOutcomeMeasurement = quantimodoService.createPrimaryOutcomeMeasurement(numericRatingValue);
        quantimodoService.addToMeasurementsQueue(primaryOutcomeMeasurement);
        updateCharts();
        if(!$rootScope.isSyncing && $rootScope.user){
            $scope.showLoader(syncDisplayText);
            quantimodoService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                $scope.hideLoader();
                updateCharts();
            });
        }
    };
    var updateAveragePrimaryOutcomeRatingView = function(){
        var sum = 0;
        for (var j = 0; j <  $scope.state.primaryOutcomeMeasurements.length; j++) {sum += $scope.state.primaryOutcomeMeasurements[j].value;}
        $scope.averagePrimaryOutcomeVariableValue = Math.round(sum / $scope.state.primaryOutcomeMeasurements.length);
        $scope.averagePrimaryOutcomeVariableText = quantimodoService.getPrimaryOutcomeVariable().ratingValueToTextConversionDataSet[$scope.averagePrimaryOutcomeVariableValue ];
        if($scope.averagePrimaryOutcomeVariableText){$scope.averagePrimaryOutcomeVariableImage = quantimodoService.getRatingFaceImageByText($scope.averagePrimaryOutcomeVariableText);}
        $scope.highchartsReflow();
    };
    var updateCharts = function(){
        $scope.state.primaryOutcomeMeasurements = quantimodoService.getLocalStorageItemAsObject('primaryOutcomeVariableMeasurements');
        var measurementsQueue = quantimodoService.getLocalStorageItemAsObject('measurementsQueue');
        if(!$scope.state.primaryOutcomeMeasurements){$scope.state.primaryOutcomeMeasurements = [];}
        if(measurementsQueue){$scope.state.primaryOutcomeMeasurements =  $scope.state.primaryOutcomeMeasurements.concat(measurementsQueue);}
        if( $scope.state.primaryOutcomeMeasurements) {
            $scope.hourlyChartConfig = quantimodoService.processDataAndConfigureHourlyChart( $scope.state.primaryOutcomeMeasurements, quantimodoService.getPrimaryOutcomeVariable());
            $scope.weekdayChartConfig = quantimodoService.processDataAndConfigureWeekdayChart($scope.state.primaryOutcomeMeasurements, quantimodoService.getPrimaryOutcomeVariable());
            $scope.distributionChartConfig = quantimodoService.processDataAndConfigureDistributionChart( $scope.state.primaryOutcomeMeasurements, quantimodoService.getPrimaryOutcomeVariable());
            updateAveragePrimaryOutcomeRatingView();
            $scope.lineChartConfig = quantimodoService.processDataAndConfigureLineChart( $scope.state.primaryOutcomeMeasurements, quantimodoService.getPrimaryOutcomeVariable());
        }
        $scope.highchartsReflow();
    };
    $scope.$on('updateCharts', function(){
        console.debug('updateCharts broadcast received..');
        updateCharts();
    });
});