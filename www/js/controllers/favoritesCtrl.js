angular.module('starter')

	.controller('FavoritesCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											   reminderService, $ionicLoading, measurementService, utilsService,
											   $stateParams, $location, $filter, $ionicPlatform, $rootScope,
                                               notificationService, variableCategoryService, $ionicActionSheet,
										  $timeout){

	    $scope.controller_name = "FavoritesCtrl";

		console.log('Loading ' + $scope.controller_name);
		
	    $scope.state = {
	    	selected1to5Value : false,
			title : 'Favorites',
			loading : true,
            trackingReminder : null
	    };

	    $scope.selectPrimaryOutcomeVariableValue = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');
	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');
	        jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');
	        $scope.state.selected1to5Value = val;
		};

		function getFavoriteTrackingRemindersFromLocalStorage(){
			$scope.state.favorites =
				localStorageService.getElementsFromItemWithFilters('trackingReminders', 'reminderFrequency', 0);
			$scope.state.favorites = variableCategoryService.attachVariableCategoryIcons($scope.state.favorites);
			for(var i = 0; i < $scope.state.favorites.length; i++){
				$scope.state.favorites[i].total = null;
			}
		}

		$scope.trackByReminder = function(trackingReminder, modifiedReminderValue){
			var value = 0;
			if(modifiedReminderValue){
				value = modifiedReminderValue;
			} else {
				value = trackingReminder.defaultValue;
			}
			console.debug('Tracking reminder', trackingReminder);
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
			for(var i = 0; i < $scope.state.favorites.length; i++){
				if($scope.state.favorites[i].id === trackingReminder.id){
					if($scope.state.favorites[i].abbreviatedUnitName !== '/5') {
						$scope.state.favorites[i].total = $scope.state.favorites[i].total + value;
						$scope.state.favorites[i].displayTotal = $scope.state.favorites[i].total + " " + $scope.state.favorites[i].abbreviatedUnitName;
					} else {
						$scope.state.favorites[i].displayTotal = modifiedReminderValue + '/5';
					}

				}
			}

			measurementService.postMeasurementByReminder(trackingReminder, modifiedReminderValue)
				.then(function(){

				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					console.error(err);
					utilsService.showAlert('Failed to Track Reminder, Try again!', 'assertive');
				});
		};

	    $scope.init = function(){
			Bugsnag.context = "Favorites";
			var isAuthorized = authService.checkAuthOrSendToLogin();
			if (typeof analytics !== 'undefined')  { analytics.trackView("Favorites Controller"); }
			if(isAuthorized){
				getFavoriteTrackingRemindersFromLocalStorage();
				$scope.showHelpInfoPopupIfNecessary();
			}
	    };

	    $scope.editMeasurement = function(trackingReminder){
			$state.go('app.measurementAdd',
				{
					reminder: trackingReminder,
					fromUrl: window.location.href
				});
	    };

	    $scope.editReminderSettings = function(trackingReminder){
	    	$state.go('app.favoriteAdd',
				{
					reminder : trackingReminder,
					fromUrl: window.location.href,
					fromState : $state.current.name
				});
	    };
		
		$scope.goToReminderSearchCategory = function(variableCategoryName) {
			$state.go('app.reminderSearchCategory',
				{
					variableCategoryName : variableCategoryName,
					fromUrl: window.location.href
				});
		};

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

		// Triggered on a button click, or some other target
		$scope.showActionSheet = function(favorite, $index) {

		    $scope.state.trackingReminder = favorite;
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-gear-a"></i>Change Default Value' },
					{ text: '<i class="icon ion-edit"></i>Different Value/Time' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>See Charts'},
					{ text: '<i class="icon ion-android-notifications-none"></i>Add a Reminder'}
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {
					console.log('CANCELLED');
				},
				buttonClicked: function(index) {
					console.log('BUTTON CLICKED', index);
					if(index === 0){
						$scope.editReminderSettings($scope.state.trackingReminder);
					}
					if(index === 1){
						$scope.editMeasurement($scope.state.trackingReminder);
					}
                    if(index === 2){
						$state.go('app.variables',
							{
								variableObject: $scope.state.trackingReminder,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
                    }
					if(index === 3){
						$state.go('app.reminderAdd',
							{
								variableObject: $scope.state.trackingReminder,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
					}
					if(index === 4){
						$state.go('app.predictors',
							{
								variableObject: $scope.state.trackingReminder
							});
					}

					return true;
				},
				destructiveButtonClicked: function() {
                    reminderService.deleteReminder($scope.state.trackingReminder.id)
                        .then(function(){
                            console.debug('Reminder Deleted');
                        }, function(err){
                            console.error('Failed to Delete Reminder, Try again!', 'assertive');
                        });
                    localStorageService.deleteElementOfItemById('trackingReminders', $scope.state.trackingReminder.id)
                        .then(function(){
                            $scope.init();
                        });
					return true;
				}
			});


			$timeout(function() {
				hideSheet();
			}, 20000);

		};
		
	});
