angular.module('starter').controller('HistoryPrimaryOutcomeCtrl',
    ["$scope", "$ionicLoading", "$ionicActionSheet", "$state", "$timeout", "$rootScope", "qmService", "qmLogService", "$stateParams",
    function($scope, $ionicLoading, $ionicActionSheet, $state, $timeout, $rootScope, qmService, qmLogService, $stateParams) {
	$scope.controller_name = "HistoryPrimaryOutcomeCtrl";
	$scope.state = {history : []};
	$scope.syncDisplayText = 'Syncing ' + qm.getPrimaryOutcomeVariable().name + ' measurements...';
	$scope.editMeasurement = function(measurement){
		measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
		qmService.goToState('app.measurementAdd', {measurement: measurement, fromState: $state.current.name,
            fromUrl: window.location.href, currentMeasurementHistory: $scope.state.history});
	};
	$rootScope.showFilterBarSearchIcon = false;
	$scope.refreshMeasurementHistory = function () {
		$scope.state.history = qmService.getLocalPrimaryOutcomeMeasurements();
		if($scope.state.history){qmService.hideLoader();}
        qmService.showInfoToast($scope.syncDisplayText);
        qmService.syncPrimaryOutcomeVariableMeasurements().then(function(){
            $scope.state.history = qmService.getLocalPrimaryOutcomeMeasurements();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
        });
	};
	$scope.$on('$ionicView.beforeEnter', function(){
        qmService.unHideNavigationMenu();
		qmLogService.debug(null, 'HistoryPrimaryOutcomeCtrl beforeEnter...', null);
        if($stateParams.updatedMeasurementHistory){
            $scope.state.history = $stateParams.updatedMeasurementHistory;
        } else {
            $scope.refreshMeasurementHistory();
        }
	});
	$scope.$on('updatePrimaryOutcomeHistory', function(){
		qmLogService.debug(null, $state.current.name + ': ' + 'updatePrimaryOutcomeHistory broadcast received..', null);
		$scope.state.history = qmService.getLocalPrimaryOutcomeMeasurements();
	});
	$scope.showActionSheet = function(measurement) {
		$scope.state.measurement = measurement;
		var variableObject = JSON.parse(JSON.stringify(measurement));
        variableObject.id = measurement.variableId;
        variableObject.name = measurement.variableName;
		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-edit"></i>Edit Measurement'},
				//{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
				qmService.actionSheetButtons.reminderAdd,
				qmService.actionSheetButtons.charts,
				qmService.actionSheetButtons.variableSettings
			],
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {qmLogService.debug(null, $state.current.name + ': ' + 'CANCELLED', null);},
			buttonClicked: function(index) {
				qmLogService.debug(null, $state.current.name + ': ' + 'BUTTON CLICKED', null, index);
				if(index === 0){$scope.editMeasurement(variableObject);}
				if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: variableObject, fromState: $state.current.name, fromUrl: window.location.href});}
				if(index === 2) {qmService.goToState('app.track');}
				if(index === 3){qmService.goToVariableSettingsByName($scope.state.measurement.variableName);}
				return true;
			},
		});
		$timeout(function() {hideSheet();}, 20000);
	};
}]);
