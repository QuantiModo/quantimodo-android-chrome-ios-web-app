angular.module('starter')

	// Controls the History Page of the App.
	.controller('HistoryPrimaryOutcomeCtrl', function($scope, $ionicLoading, $ionicActionSheet, $state, $timeout,
													  $rootScope, measurementService, $stateParams) {

	    $scope.controller_name = "HistoryPrimaryOutcomeCtrl";
		$scope.state = {
			history : []
		};
		$scope.syncDisplayText = 'Syncing ' + config.appSettings.primaryOutcomeVariableDetails.name + ' measurements...';
		
		$scope.editMeasurement = function(measurement){
			$state.go('app.measurementAdd', {
				measurement: measurement,
				fromState: $state.current.name,
				fromUrl: window.location.href
			});
		};

		$scope.init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			$scope.history = measurementService.getAllLocalMeasurements();
			if($rootScope.user){
				$scope.showLoader($scope.syncDisplayText);
				measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
					$scope.hideLoader();
					$scope.history = measurementService.getAllLocalMeasurements();
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
				});
			}
			$scope.hideLoader();
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
    		//$scope.init();
    	});

		$scope.$on('$ionicView.beforeEnter', function(){
			$scope.init();
		});

		$scope.$on('updatePrimaryOutcomeHistory', function(){
			console.debug($state.current.name + ": " + 'updatePrimaryOutcomeHistory broadcast received..');
			$scope.history = measurementService.getAllLocalMeasurements();
		});

		$scope.showActionSheet = function(measurement) {

			$scope.state.measurement = measurement;
			$scope.state.variableObject = measurement;
			$scope.state.variableObject.id = measurement.variableId;
			$scope.state.variableObject.name = measurement.variableName;
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-edit"></i>Edit Measurement'},
					{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
					{ text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
					{ text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
					{ text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
				],
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {
					console.debug($state.current.name + ": " + 'CANCELLED');
				},
				buttonClicked: function(index) {
					console.debug($state.current.name + ": " + 'BUTTON CLICKED', index);
					if(index === 0){
						$scope.editMeasurement($scope.state.variableObject);
					}
					if(index === 1){
						$scope.addToFavoritesUsingVariableObject($scope.state.variableObject);
					}
					if(index === 2){
						$state.go('app.reminderAdd',
							{
								variableObject: $scope.state.variableObject,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
					}
					if (index === 3) {
						$state.go('app.track');
					}
					if(index === 4){
						$state.go('app.variableSettings',
							{variableName: $scope.state.measurement.variableName});
					}
					if(index === 5){
						$state.go('app.predictors',
							{
								variableObject: $scope.state.variableObject,
								requestParams: {
									effect:  $scope.state.variableObject.name,
									correlationCoefficient: "(gt)0"
								}
							});
					}
					if(index === 6){
						$state.go('app.predictors',
							{
								variableObject: $scope.state.variableObject,
								requestParams: {
									effect:  $scope.state.variableObject.name,
									correlationCoefficient: "(lt)0"
								}
							});
					}

					return true;
				},
			});

			$timeout(function() {
				hideSheet();
			}, 20000);

		};

	});