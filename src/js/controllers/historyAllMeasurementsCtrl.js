angular.module('starter').controller('historyAllMeasurementsCtrl', ["$scope", "$state", "$stateParams", "$rootScope", "$timeout", "$ionicActionSheet", "qmService", "qmLogService", "$ionicLoading", function($scope, $state, $stateParams, $rootScope, $timeout,
																			$ionicActionSheet, qmService, qmLogService, $ionicLoading) {
	$scope.controller_name = "historyAllMeasurementsCtrl";
	$scope.state = {
		offset : 0,
		limit : 50,
		history : [],
		units : [],
		showLocationToggle: false,
		noHistory: false,
		helpCardTitle: "Past Measurements",
		title: "History",
		loadingText: "Fetching measurements..."
	};
	function hideLoader() {
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        $scope.state.loading = false;
        qmService.hideLoader();
    }
    $scope.$on('$ionicView.beforeEnter', function(e) {
        $rootScope.hideHistoryPageInstructionsCard = qmStorage.getAsString('hideHistoryPageInstructionsCard');
    });
    $scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug(null, $state.current.name + ': ' + 'Entering state ' + $state.current.name, null);
        $rootScope.hideNavigationMenu = false;
        $scope.state.loading = true;
        $scope.state.offset = 0;

        if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
            $scope.state.title = $stateParams.variableCategoryName + ' History';
            $scope.state.showLocationToggle = $stateParams.variableCategoryName === "Location";
        }
        if ($stateParams.variableCategoryName) {setupVariableCategoryActionSheet();}
        if ($stateParams.variableObject) {
            $scope.state.title = $stateParams.variableObject.name + ' History';
            $rootScope.variableObject = $stateParams.variableObject;
        }
        if ($stateParams.variableName || $stateParams.variableObject) {$rootScope.showActionSheetMenu = qmService.variableObjectActionSheet;}
        $scope.getHistory();
    });
	$scope.editMeasurement = function(measurement){
		measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
		qmService.goToState('app.measurementAdd', {measurement: measurement, fromState: $state.current.name, fromUrl: window.location.href});
	};
	$scope.refreshHistory = function(){
		var concat = false;
		var refresh = true;
		$scope.getHistory(concat, refresh);
	};
	$scope.getHistory = function(concat, refresh){
		var params = {offset: $scope.state.offset, limit: $scope.state.limit, sort: "-startTimeEpoch", doNotProcess: true};
		if($stateParams.variableCategoryName){params.variableCategoryName = $stateParams.variableCategoryName;}
		if($stateParams.variableObject){params.variableName = $stateParams.variableObject.name;}
		if($stateParams.variableName){params.variableName = $stateParams.variableName;}
        if($stateParams.connectorName){params.connectorName = $stateParams.connectorName;}
		if(params.variableName){
			if(!$rootScope.variableObject){
				qmService.searchUserVariablesDeferred('*', {variableName: params.variableName}).then(function (variables) {
					$rootScope.variableObject = variables[0];
				}, function (error) {qmLogService.error(error);});
			}
		}
		function successHandler(measurements) {
            measurements = qmService.addInfoAndImagesToMeasurements(measurements);
            if(!measurements || !measurements.length){
            	$scope.state.showLoadMoreButton = false;
            } else {
            	$scope.state.showLoadMoreButton = true;
                if (concat) {
                    if(!($scope.state.history.constructor instanceof Array)){
                        qmLogService.error("$scope.state.history is not an array! $scope.state.history: " + JSON.stringify($scope.state.history));
                        $scope.state.history = measurements;
                    } else {
                        $scope.state.history = $scope.state.history.concat(measurements);
					}
                } else {
                    $scope.state.history = measurements;
                }
            }
            hideLoader();
            if(measurements.length < $scope.state.limit){$scope.state.noHistory = measurements.length === 0;}
        }
        function errorHandler(error) {
			qmLogService.error("History update error: " + error);
            $scope.state.noHistory = true;
            hideLoader();
        }
        qmService.showBasicLoader();
        qmService.getMeasurements(params, successHandler, errorHandler);
	};
	function setupVariableCategoryActionSheet() {
		$rootScope.showActionSheetMenu = function() {
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					//{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
					{ text: '<i class="icon ion-happy-outline"></i>Emotions'},
					{ text: '<i class="icon ion-ios-nutrition-outline"></i>Foods'},
					{ text: '<i class="icon ion-sad-outline"></i>Symptoms'},
					{ text: '<i class="icon ion-ios-medkit-outline"></i>Treatments'},
					{ text: '<i class="icon ion-ios-body-outline"></i>Physical Activity'},
					{ text: '<i class="icon ion-ios-pulse"></i>Vital Signs'},
					{ text: '<i class="icon ion-ios-location-outline"></i>Locations'}
				],
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {qmLogService.debug(null, 'CANCELLED', null);},
				buttonClicked: function(index) {
					if(index === 0) {qmService.goToState('app.historyAll', {variableCategoryName: 'Emotions'});}
					if(index === 1) {qmService.goToState('app.historyAll', {variableCategoryName: 'Foods'});}
					if(index === 2) {qmService.goToState('app.historyAll', {variableCategoryName: 'Symptoms'});}
					if(index === 3) {qmService.goToState('app.historyAll', {variableCategoryName: 'Treatments'});}
					if(index === 4) {qmService.goToState('app.historyAll', {variableCategoryName: 'Physical Activity'});}
					if(index === 5) {qmService.goToState('app.historyAll', {variableCategoryName: 'Vital Signs'});}
					if(index === 6) {qmService.goToState('app.historyAll', {variableCategoryName: 'Locations'});}
					return true;
				},
				destructiveButtonClicked: function() {}
			});
			$timeout(function() {hideSheet();}, 20000);
		};
	}
	$scope.getNext = function(){
		$scope.state.offset += $scope.state.limit;
		$scope.getHistory(true);
	};

	$scope.deleteMeasurement = function(measurement){
		measurement.hide = true;
		qmService.deleteMeasurementFromServer(measurement);
	};
	$rootScope.showFilterBarSearchIcon = false;
	$scope.showActionSheetForMeasurement = function(measurement) {
		$scope.state.measurement = measurement;
		$rootScope.variableObject = measurement;
		$rootScope.variableObject.id = measurement.variableId;
		$rootScope.variableObject.name = measurement.variableName;
		var hideSheet = $ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-edit"></i>Edit Measurement'},
				qmService.actionSheetButtons.addReminder,
				qmService.actionSheetButtons.charts,
				qmService.actionSheetButtons.history,
				qmService.actionSheetButtons.analysisSettings
			],
			destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {qmLogService.debug(null, $state.current.name + ': ' + 'CANCELLED', null);},
			buttonClicked: function(index) {
				qmLogService.debug(null, $state.current.name + ': ' + 'BUTTON CLICKED', null, index);
				if(index === 0){$scope.editMeasurement($rootScope.variableObject);}
				if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name, fromUrl: window.location.href});}
				if(index === 2) {qmService.goToState('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
				if(index === 3) {qmService.goToState('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
				if(index === 4){qmService.goToState('app.variableSettings', {variableName: $scope.state.measurement.variableName});}
				return true;
			},
			destructiveButtonClicked: function() {
				$scope.deleteMeasurement(measurement);
				return true;
			}
		});
		$timeout(function() {hideSheet();}, 20000);
	};
}]);
