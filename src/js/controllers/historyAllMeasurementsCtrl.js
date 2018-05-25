angular.module('starter').controller('historyAllMeasurementsCtrl', ["$scope", "$state", "$stateParams", "$rootScope",
    "$timeout", "$ionicActionSheet", "qmService", "qmLogService", function($scope, $state, $stateParams, $rootScope, $timeout,
																			$ionicActionSheet, qmService, qmLogService) {
	$scope.controller_name = "historyAllMeasurementsCtrl";
	$scope.state = {
		limit : 50,
		history : [],
		units : [],
		showLocationToggle: false,
		noHistory: false,
		helpCardTitle: "Past Measurements",
		title: "History",
		loadingText: "Fetching measurements...",
        moreDataCanBeLoaded: true
	};
    $scope.$on('$ionicView.beforeEnter', function(e) {
        if($stateParams.refresh){$scope.state.history = null;}
        $scope.state.moreDataCanBeLoaded = true;
        $rootScope.hideHistoryPageInstructionsCard = qm.storage.getItem('hideHistoryPageInstructionsCard');
        updateMeasurementIfNecessary();
    });
    $scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug($state.current.name + ': ' + 'Entering state ' + $state.current.name);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
            $scope.state.title = $stateParams.variableCategoryName + ' History';
            $scope.state.showLocationToggle = $stateParams.variableCategoryName === "Location";
        }
        if ($stateParams.variableCategoryName) {setupVariableCategoryActionSheet();}
        getScopedVariableObject();
        if (getVariableName()) {
            $scope.state.title = getVariableName() + ' History';
            qmService.rootScope.setShowActionSheetMenu(function setActionSheet() {
                return qmService.actionSheets.showVariableObjectActionSheet(getVariableName(), getScopedVariableObject());
            });
        } else {
            updateNavigationMenuButton();
        }
        if(!$scope.state.history || !$scope.state.history.length){ // Otherwise it keeps add more measurements whenever we edit one
            $scope.getHistory();
        }
    });
    function updateNavigationMenuButton() {
            $timeout(function() {
                qmService.rootScope.setShowActionSheetMenu(function() {
                    // Show the action sheet
                    var hideSheet = $ionicActionSheet.show({
                        buttons: [
                            qmService.actionSheets.actionSheetButtons.refresh,
                            qmService.actionSheets.actionSheetButtons.settings
                        ],
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function() { qmLogService.debug('CANCELLED', null); },
                        buttonClicked: function(index) {
                            if(index === 0){$scope.refreshHistory();}
                            if(index === 1){qmService.goToState(qmStates.settings);}
                            return true;
                        }
                    });
                });
            }, 1);
        }
    function updateMeasurementIfNecessary(){
        if($stateParams.updatedMeasurementHistory){
            $scope.state.history = $stateParams.updatedMeasurementHistory;
        }
    }
    function hideLoader() {
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
        $scope.state.loading = false;
        qmService.hideLoader();
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    function getScopedVariableObject() {
        if($scope.state.variableObject && $scope.state.variableObject.name === getVariableName()){return $scope.state.variableObject;}
        if($stateParams.variableObject){return $scope.state.variableObject = $stateParams.variableObject;}
        return null;
    }
    function getVariableName() {
        if($stateParams.variableName){return $stateParams.variableName;}
        if($stateParams.variableObject){return $stateParams.variableObject.name;}
        if(qm.urlHelper.getParam('variableName')){return qm.urlHelper.getParam('variableName');}
		qmLog.info("Could not get variableName")
    }
	function getConnectorName() {
		if($stateParams.connectorName){return $stateParams.connectorName;}
		if(qm.urlHelper.getParam('connectorName')){return qm.urlHelper.getParam('connectorName');}
		qmLog.info("Could not get variableName")
	}
	$scope.editMeasurement = function(measurement){
		//measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
		qmService.goToState('app.measurementAdd', {measurement: measurement, fromState: $state.current.name,
            fromUrl: window.location.href, currentMeasurementHistory: $scope.state.history});
	};
	$scope.refreshHistory = function(){
        $scope.state.history = [];
		$scope.getHistory();
	};
	$scope.getHistory = function(){
        if($scope.state.loading){return qmLog.info("Already getting measurements!");}
        if(!$scope.state.moreDataCanBeLoaded){
            hideLoader();
            return qmLog.info("No more measurements!");
        }
        $scope.state.loading = true;
        if(!$scope.state.history){$scope.state.history = [];}
		var params = {offset: $scope.state.history.length, limit: $scope.state.limit, sort: "-startTimeEpoch", doNotProcess: true};
		if($stateParams.variableCategoryName){params.variableCategoryName = $stateParams.variableCategoryName;}
		if(getVariableName()){params.variableName = getVariableName();}
        if(getConnectorName()){params.connectorName = getConnectorName();}
		if(getVariableName()){
			if(!$scope.state.variableObject){
				qmService.searchUserVariablesDeferred('*', {variableName: getVariableName()}).then(function (variables) {
					$scope.state.variableObject = variables[0];
				}, function (error) {qmLogService.error(error);});
			}
		}
		function successHandler(measurements) {
            if(!measurements || measurements.length < params.limit){$scope.state.moreDataCanBeLoaded = false;}
            if(measurements.length < $scope.state.limit){$scope.state.noHistory = measurements.length === 0;}
            measurements = qmService.addInfoAndImagesToMeasurements(measurements);
            if(!qm.arrayHelper.variableIsArray($scope.state.history)){
                qmLogService.error("$scope.state.history is not an array! $scope.state.history: " + JSON.stringify($scope.state.history));
                $scope.state.history = measurements;
            } else {
                if(!$scope.state.history){$scope.state.history = [];}
                try {
                    $scope.state.history = $scope.state.history.concat(measurements);
                } catch (error) {
                    qmLog.error(error);
                    $scope.state.history = JSON.parse(JSON.stringify($scope.state.history));
                    $scope.state.history = $scope.state.history.concat(measurements);
                }
            }
            hideLoader();
        }
        function errorHandler(error) {
			qmLogService.error("History update error: " + error);
            $scope.state.noHistory = true;
            hideLoader();
        }
        //qmService.showBasicLoader();
        qm.measurements.getMeasurementsFromApi(params, successHandler, errorHandler);
	};
	function setupVariableCategoryActionSheet() {
		qmService.rootScope.setShowActionSheetMenu(function() {
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
				cancel: function() {qmLogService.debug('CANCELLED', null);},
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
		});
	}
	$scope.deleteMeasurement = function(measurement){
		measurement.hide = true;
		qmService.deleteMeasurementFromServer(measurement);
	};
	qmService.navBar.setFilterBarSearchIcon(false);
	$scope.showActionSheetForMeasurement = function(measurement) {
		$scope.state.measurement = measurement;
		var variableObject = JSON.parse(JSON.stringify(measurement));
        variableObject.id = measurement.variableId;
        variableObject.name = measurement.variableName;
        var buttons = [
            { text: '<i class="icon ion-edit"></i>Edit Measurement'},
            qmService.actionSheets.actionSheetButtons.reminderAdd,
            qmService.actionSheets.actionSheetButtons.charts,
            qmService.actionSheets.actionSheetButtons.historyAllVariable,
            qmService.actionSheets.actionSheetButtons.variableSettings,
            qmService.actionSheets.actionSheetButtons.relationships
        ];
        if(measurement.url){
            buttons.push(qmService.actionSheets.actionSheetButtons.openUrl);
        }
		var hideSheet = $ionicActionSheet.show({
			buttons: buttons,
			destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {qmLogService.debug(null, $state.current.name + ': ' + 'CANCELLED', null);},
			buttonClicked: function(index) {
				qmLogService.debug(null, $state.current.name + ': ' + 'BUTTON CLICKED', null, index);
				if(index === 0){$scope.editMeasurement($scope.state.measurement);}
				if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 2) {qmService.goToState('app.charts', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 3) {qmService.goToState('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 4){qmService.goToVariableSettingsByName($scope.state.measurement.variableName);}
                if(index === 5){
					qmService.showBlackRingLoader();
					qmService.goToCorrelationsListForVariable($scope.state.measurement.variableName);
				}
                if(index === 6){
                    qm.urlHelper.openUrlInNewTab(measurement.url);
                }
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
