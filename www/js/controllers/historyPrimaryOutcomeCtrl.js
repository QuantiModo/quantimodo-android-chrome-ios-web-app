angular.module('starter')

	// Controls the History Page of the App.
	.controller('HistoryPrimaryOutcomeCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService,
													  $ionicPopover, measurementService, $ionicPopup,
													  localStorageService, utilsService,
													  $state, $rootScope, ratingService){

	    $scope.controller_name = "HistoryPrimaryOutcomeCtrl";
		$scope.state = {
			history : []
		};
		
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
                            $scope.history = ratingService.addImagesToMeasurements(history);
                        }
                    });
                }

		$scope.init = function(){
			console.debug('history page init');
			Bugsnag.context = "historyPrimary";
			updateHistoryView();
			if($scope.state.history.length < 1){
				$scope.showLoader('Syncing measurements...');
			}
			if($rootScope.user){
				measurementService.syncPrimaryOutcomeVariableMeasurements()
					.then(function(){
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
    		$scope.init();
    	});

	});