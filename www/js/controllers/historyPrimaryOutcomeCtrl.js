angular.module('starter')

	// Controls the History Page of the App.
	.controller('HistoryPrimaryOutcomeCtrl', function($scope, $ionicLoading, $ionicActionSheet, $state, $timeout,
													  $rootScope, measurementService, ratingService) {

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


		function updateHistoryView(){
                    measurementService.getAllLocalMeasurements(true,function(history){
                        if(history.length < 1){
                            console.log('No measurements for history!  Going to default state. ');
                            $rootScope.hideNavigationMenu = false;
                            $state.go(config.appSettings.defaultState);
                        }
                        if(history.length > 0){
                            $scope.showHelpInfoPopupIfNecessary();
                            history = history.sort(function(a,b){
                                if(a.startTimeEpoch < b.startTimeEpoch){
                                    return 1;}
                                if(a.startTimeEpoch> b.startTimeEpoch)
                                {return -1;}
                                return 0;
                            });
                            $scope.history = ratingService.addInfoAndImagesToMeasurements(history);
                        }
						//Stop the ion-refresher from spinning
						$scope.$broadcast('scroll.refreshComplete');
                    });
                }

		$scope.init = function(){
			console.debug('history page init');
			Bugsnag.context = "historyPrimary";
			updateHistoryView();
			if($rootScope.user){
				$scope.showLoader($scope.syncDisplayText);
				measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
					$scope.hideLoader();
					updateHistoryView();
				});
			}
			else {
				updateHistoryView();
			}


			$ionicLoading.hide();
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
			$scope.hideLoader();
    		$scope.init();
    	});

		$scope.showActionSheet = function(measurement, $index) {

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
					console.log('CANCELLED');
				},
				buttonClicked: function(index) {
					console.log('BUTTON CLICKED', index);
					if(index === 0){
						$scope.editMeasurement($scope.state.variableObject);
					}
					if(index === 1){
						$scope.addToFavoritesUsingStateVariableObject($scope.state.variableObject);
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
						$scope.goToSettingsForVariableObject($scope.state.variableObject);
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