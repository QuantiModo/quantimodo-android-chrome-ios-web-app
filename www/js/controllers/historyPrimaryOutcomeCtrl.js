angular.module('starter').controller('HistoryPrimaryOutcomeCtrl', function($scope, $ionicLoading, $ionicActionSheet, $state, $timeout,
													  $rootScope, qmService) {
	$scope.controller_name = "HistoryPrimaryOutcomeCtrl";
	$scope.state = {history : []};
	$scope.syncDisplayText = 'Syncing ' + qmService.getPrimaryOutcomeVariable().name + ' measurements...';
	$scope.editMeasurement = function(measurement){
		measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
		$state.go('app.measurementAdd', {measurement: measurement, fromState: $state.current.name, fromUrl: window.location.href});
	};
	$rootScope.showFilterBarSearchIcon = false;
	$scope.refreshMeasurementHistory = function () {
		$scope.history = qmService.getLocalPrimaryOutcomeMeasurements();
        $scope.showSyncDisplayText($scope.syncDisplayText);
        qmService.syncPrimaryOutcomeVariableMeasurements().then(function(){
            $scope.hideSyncDisplayText();
            $scope.history = qmService.getLocalPrimaryOutcomeMeasurements();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
		$scope.hideSyncDisplayText();
	};
	$scope.$on('$ionicView.beforeEnter', function(){
		$rootScope.hideNavigationMenu = false;
		console.debug('HistoryPrimaryOutcomeCtrl beforeEnter...');
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
		$scope.refreshMeasurementHistory();
	});
	$scope.$on('updatePrimaryOutcomeHistory', function(){
		console.debug($state.current.name + ": " + 'updatePrimaryOutcomeHistory broadcast received..');
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
				qmService.actionSheetButtons.addReminder,
				qmService.actionSheetButtons.charts,
				qmService.actionSheetButtons.analysisSettings
			],
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {console.debug($state.current.name + ": " + 'CANCELLED');},
			buttonClicked: function(index) {
				console.debug($state.current.name + ": " + 'BUTTON CLICKED', index);
				if(index === 0){$scope.editMeasurement($rootScope.variableObject);}
				if(index === 1){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name, fromUrl: window.location.href});}
				if(index === 2) {$state.go('app.track');}
				if(index === 3){$state.go('app.variableSettings', {variableName: $scope.state.measurement.variableName});}
				return true;
			},
		});
		$timeout(function() {hideSheet();}, 20000);
	};
});
