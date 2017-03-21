angular.module('starter').controller('historyAllMeasurementsCtrl', function($scope, $state, $stateParams, $rootScope, $timeout, $ionicActionSheet, quantimodoService) {
	    $scope.controller_name = "historyAllMeasurementsCtrl";
	    $scope.state = {
	    	offset : 0,
	    	limit : 50,
	    	history : [],
			units : [],
			variableCategories : [],
			hideLoadMoreButton : true,
			showLocationToggle: false,
			noHistory: false,
			helpCardTitle: "Past Measurements",
			title: "History",
			loadingText: "Fetching measurements..."
	    };
	    $scope.editMeasurement = function(measurement){
	    	$state.go('app.measurementAdd', {measurement: measurement, fromState: $state.current.name, fromUrl: window.location.href});
	    };
	    $scope.getVariableCategoryByUnit = function(unit){
	    	if(!unit) { return false;}
	    	var variableCategory = $scope.state.variableCategories.filter(function(vc){return vc.name === unit.category;})[0];
	    	return variableCategory? variableCategory : false;
	    };
        $scope.refreshHistory = function(){
        	var concat = false;
        	var refresh = true;
            $scope.getHistory(concat, refresh);
		};
	    $scope.getHistory = function(concat, refresh){
			var params = {offset: $scope.state.offset, limit: $scope.state.limit, sort: "-startTimeEpoch"};
			if($stateParams.variableCategoryName){params.variableCategoryName = $stateParams.variableCategoryName;}
			if($stateParams.variableObject){params.variableName = $stateParams.variableObject.name;}
            if($stateParams.variableName){params.variableName = $stateParams.variableName;}
            if(params.variableName){
                $rootScope.showMoreMenuButton = true;
                if(!$rootScope.variableObject){
                    quantimodoService.searchUserVariablesDeferred('*', {variableName: params.variableName}).then(function (variables) {
						$rootScope.variableObject = variables[0];
                    }, function (error) {console.error(error);});
                }
			}
	    	quantimodoService.getMeasurementsDeferred(params, refresh).then(function(history){
	    		if (concat) {$scope.state.history = $scope.state.history.concat(history);} else {$scope.state.history = history;}
				$scope.hideLoader();
				if(history.length < $scope.state.limit){
					$scope.state.hideLoadMoreButton = true;
					$scope.state.noHistory = history.length === 0;
				} else {$scope.state.hideLoadMoreButton = false;}
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
				$scope.hideLoader();
	    	});
	    };
	    function setupVariableActionSheet() {
            $rootScope.showActionSheetMenu = function() {
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        //{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                        { text: '<i class="icon ion-compose"></i>Record Measurement'},
                        { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                        { text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
                        { text: '<i class="icon ion-ios-list-outline"></i>History'},
                        { text: '<i class="icon ion-pricetag"></i>Tag ' + $rootScope.variableObject.name},
                        { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}
                    ],
                    destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function() {console.debug('CANCELLED');},
                    buttonClicked: function(index) {
                        console.debug('variableSettingsCtrl BUTTON CLICKED: ' + index);
                        //if(index === 0){$scope.addToFavoritesUsingVariableObject($rootScope.variableObject);}
                        if(index === 0) {$scope.goToAddMeasurementForVariableObject($rootScope.variableObject);}
                        if(index === 1) {$scope.goToAddReminderForVariableObject($rootScope.variableObject);}
                        if(index === 2) {$scope.goToChartsPageForVariableObject($rootScope.variableObject);}
                        if(index === 3) {$scope.goToHistoryForVariableObject($rootScope.variableObject);}
                        if(index === 4) {$scope.addTag($rootScope.variableObject);}
                        if(index === 5) {$scope.tagAnotherVariable($rootScope.variableObject);}
                        return true;
                    },
                    destructiveButtonClicked: function() {$scope.showDeleteAllMeasurementsForVariablePopup(); return true;}
                });
                $timeout(function() {hideSheet();}, 20000);
            };
        }
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
                        if(index === 5) {$state.go('app.historyAll', {variableCategoryName: 'Locations'});}
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
                setupVariableActionSheet();
            }
            quantimodoService.getVariableCategories()
                .then(function(variableCategories){ $scope.state.variableCategories = variableCategories;
                }, function(error){
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    console.debug($state.current.name + ": " + "error getting variable categories "+ JSON.stringify(error));
                });
            $scope.getHistory();
    	});
		$scope.$on('$ionicView.beforeEnter', function(e) {
			$rootScope.hideHistoryPageInstructionsCard = quantimodoService.getLocalStorageItemAsString('hideHistoryPageInstructionsCard');
		});
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
					//{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
					{ text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'}
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {console.debug($state.current.name + ": " + 'CANCELLED');},
				buttonClicked: function(index) {
					console.debug($state.current.name + ": " + 'BUTTON CLICKED', index);
					if(index === 0){$scope.editMeasurement($rootScope.variableObject);}
					//if(index === 1){$scope.addToFavoritesUsingVariableObject($rootScope.variableObject);}
					if(index === 1){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name, fromUrl: window.location.href});}
					if(index === 2) {$scope.goToChartsPageForVariableObject($rootScope.variableObject);}
					if(index === 3) {$scope.goToHistoryForVariableObject($rootScope.variableObject);}
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
