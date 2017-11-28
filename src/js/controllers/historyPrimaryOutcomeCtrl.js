angular.module('starter').controller('HistoryPrimaryOutcomeCtrl', ["$scope", "$ionicLoading", "$ionicActionSheet", "$state", "$timeout", "$rootScope", "qmService", "qmLogService", function($scope, $ionicLoading, $ionicActionSheet, $state, $timeout,
													  $rootScope, qmService, qmLogService) {
	$scope.controller_name = "HistoryPrimaryOutcomeCtrl";
	$scope.state = {history : []};
	$scope.syncDisplayText = 'Syncing ' + qm.getPrimaryOutcomeVariable().name + ' measurements...';
	$scope.editMeasurement = function(measurement){
		measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
		qmService.goToState('app.measurementAdd', {measurement: measurement, fromState: $state.current.name, fromUrl: window.location.href});
	};
	$rootScope.showFilterBarSearchIcon = false;
	$scope.refreshMeasurementHistory = function () {
		$scope.history = qmService.getLocalPrimaryOutcomeMeasurements();
        qmService.showInfoToast($scope.syncDisplayText);
        qmService.syncPrimaryOutcomeVariableMeasurements().then(function(){
            $scope.history = qmService.getLocalPrimaryOutcomeMeasurements();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
	};
	$scope.$on('$ionicView.beforeEnter', function(){
        qmService.unHideNavigationMenu();
		qmLogService.debug(null, 'HistoryPrimaryOutcomeCtrl beforeEnter...', null);
		$scope.refreshMeasurementHistory();
	});
	$scope.$on('updatePrimaryOutcomeHistory', function(){
		qmLogService.debug(null, $state.current.name + ': ' + 'updatePrimaryOutcomeHistory broadcast received..', null);
		$scope.history = qmService.getLocalPrimaryOutcomeMeasurements();
	});
	$scope.showActionSheet = function(measurement) {
		$scope.state.measurement = measurement;
		$rootScope.variableObject = measurement;
		$rootScope.variableObject.id = measurement.variableId;
		$rootScope.variableObject.name = measurement.variableName;
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
				if(index === 0){$scope.editMeasurement($rootScope.variableObject);}
				if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name, fromUrl: window.location.href});}
				if(index === 2) {qmService.goToState('app.track');}
				if(index === 3){qmService.goToVariableSettingsByName($scope.state.measurement.variableName);}
				return true;
			},
		});
		$timeout(function() {hideSheet();}, 20000);
	};
}]);
