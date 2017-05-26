angular.module('starter').controller('historyAllMeasurementsCtrl', function($scope, $state, $stateParams, $rootScope, $timeout,
																			$ionicActionSheet, quantimodoService, $ionicLoading) {
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
    $scope.$on('$ionicView.beforeEnter', function(e) {
        $rootScope.hideHistoryPageInstructionsCard = quantimodoService.getLocalStorageItemAsString('hideHistoryPageInstructionsCard');
    });
    $scope.$on('$ionicView.enter', function(e) {
        console.debug($state.current.name + ": " + "Entering state " + $state.current.name);
        $rootScope.hideNavigationMenu = false;
        $scope.state.loading = true;
        $scope.state.offset = 0;
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
            $scope.state.title = $stateParams.variableCategoryName + ' History';
            $scope.state.showLocationToggle = $stateParams.variableCategoryName === "Location";
        }
        if ($stateParams.variableCategoryName) {setupVariableCategoryActionSheet();}
        if ($stateParams.variableObject) {
            $scope.state.title = $stateParams.variableObject.name + ' History';
            $rootScope.variableObject = $stateParams.variableObject;
        }
        if ($stateParams.variableName || $stateParams.variableObject) {$rootScope.showActionSheetMenu = quantimodoService.variableObjectActionSheet;}
        $scope.getHistory();
    });
	$scope.editMeasurement = function(measurement){
		measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
		$state.go('app.measurementAdd', {measurement: measurement, fromState: $state.current.name, fromUrl: window.location.href});
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
		if(params.variableName){
			if(!$rootScope.variableObject){
				quantimodoService.searchUserVariablesDeferred('*', {variableName: params.variableName}).then(function (variables) {
					$rootScope.variableObject = variables[0];
				}, function (error) {console.error(error);});
			}
		}
        //quantimodoService.showLoader();  //Let's not lock the user during history loading.  We have a card to tell them that it's loading
		quantimodoService.getMeasurementsDeferred(params, refresh).then(function(history){
			if(!history ||!history.length){$scope.state.showLoadMoreButton = false;} else {$scope.state.showLoadMoreButton = true;}
			if (concat) {$scope.state.history = $scope.state.history.concat(history);} else {$scope.state.history = history;}
			if(history.length < $scope.state.limit){$scope.state.noHistory = history.length === 0;}
			//Stop the ion-refresher from spinning
			$scope.$broadcast('scroll.refreshComplete');
			$scope.state.loading = false;
		}, function(error){
			$scope.state.noHistory = true;
			Bugsnag.notify(error, JSON.stringify(error), {}, "error");
			console.error('error getting measurements' + JSON.stringify(error));
			//Stop the ion-refresher from spinning
			$scope.$broadcast('scroll.refreshComplete');
			$scope.state.loading = false;
		});
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
				cancel: function() {console.debug('CANCELLED');},
				buttonClicked: function(index) {
					if(index === 0) {$state.go('app.historyAll', {variableCategoryName: 'Emotions'});}
					if(index === 1) {$state.go('app.historyAll', {variableCategoryName: 'Foods'});}
					if(index === 2) {$state.go('app.historyAll', {variableCategoryName: 'Symptoms'});}
					if(index === 3) {$state.go('app.historyAll', {variableCategoryName: 'Treatments'});}
					if(index === 4) {$state.go('app.historyAll', {variableCategoryName: 'Physical Activity'});}
					if(index === 5) {$state.go('app.historyAll', {variableCategoryName: 'Vital Signs'});}
					if(index === 6) {$state.go('app.historyAll', {variableCategoryName: 'Locations'});}
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
		quantimodoService.deleteMeasurementFromServer(measurement);
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
				quantimodoService.actionSheetButtons.addReminder,
				quantimodoService.actionSheetButtons.charts,
				quantimodoService.actionSheetButtons.history,
				quantimodoService.actionSheetButtons.analysisSettings
			],
			destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {console.debug($state.current.name + ": " + 'CANCELLED');},
			buttonClicked: function(index) {
				console.debug($state.current.name + ": " + 'BUTTON CLICKED', index);
				if(index === 0){$scope.editMeasurement($rootScope.variableObject);}
				if(index === 1){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name, fromUrl: window.location.href});}
				if(index === 2) {$state.go('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
				if(index === 3) {$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
				if(index === 4){$state.go('app.variableSettings', {variableName: $scope.state.measurement.variableName});}
				return true;
			},
			destructiveButtonClicked: function() {
				$scope.deleteMeasurement(measurement);
				return true;
			}
		});
		$timeout(function() {hideSheet();}, 20000);
	};
});
