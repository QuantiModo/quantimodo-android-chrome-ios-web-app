angular.module('starter')

	.controller('FavoritesCtrl', function($scope, $state, $ionicActionSheet, $timeout, reminderService, authService, 
										  localStorageService, measurementService, variableCategoryService) {

	    $scope.controller_name = "FavoritesCtrl";

		console.log('Loading ' + $scope.controller_name);
		
	    $scope.state = {
	    	selected1to5Value : false,
			title : 'Favorites',
			loading : true,
            trackingReminder : null,
            lastSent: new Date()
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
			if(!modifiedReminderValue){
				modifiedReminderValue = trackingReminder.defaultValue;
			}
			console.debug('Tracking reminder', trackingReminder);
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
			for(var i = 0; i < $scope.state.favorites.length; i++){
				if($scope.state.favorites[i].id === trackingReminder.id){
					if($scope.state.favorites[i].abbreviatedUnitName !== '/5') {
						$scope.state.favorites[i].total = $scope.state.favorites[i].total + modifiedReminderValue;
						$scope.state.favorites[i].displayTotal = $scope.state.favorites[i].total + " " + $scope.state.favorites[i].abbreviatedUnitName;
					} else {
						$scope.state.favorites[i].displayTotal = modifiedReminderValue + '/5';
					}

				}
			}

			if(!$scope.state[trackingReminder.id] || !$scope.state[trackingReminder.id].tally){
                $scope.state[trackingReminder.id] = {
                    tally: 0
                };
            }

			$scope.state[trackingReminder.id].tally += modifiedReminderValue;
			console.debug('modified tally is ' + $scope.state[trackingReminder.id].tally);
			
            $timeout(function() {
                if($scope.state[trackingReminder.id].tally) {
                    measurementService.postMeasurementByReminder(trackingReminder, $scope.state[trackingReminder.id].tally)
                        .then(function () {
                        	console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
                        }, function (err) {
                            Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                            console.error(err);
                            console.error('Failed to Track by favorite, Try again!');
                        });
                    $scope.state[trackingReminder.id].tally = 0;
                }
            }, 2000);

		};

	    $scope.init = function(){
			Bugsnag.context = "Favorites";
			authService.checkAuthOrSendToLogin();
			if (typeof analytics !== 'undefined')  { analytics.trackView("Favorites Controller"); }
			getFavoriteTrackingRemindersFromLocalStorage();
			$scope.showHelpInfoPopupIfNecessary();

	    };

	    $scope.editMeasurement = function(trackingReminder){
			$state.go('app.measurementAdd',
				{
					reminderNotification: trackingReminder,
					fromUrl: window.location.href
				});
	    };

	    $scope.editReminderSettings = function(trackingReminder){
	    	$state.go('app.favoriteAdd',
				{
					reminderNotification: trackingReminder,
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
			$scope.hideLoader();
    		$scope.init();
    	});

		// Triggered on a button click, or some other target
		$scope.showActionSheet = function(favorite, $index) {

		    $scope.state.trackingReminder = favorite;
			$scope.state.variableObject = favorite;
			$scope.state.variableObject.id = favorite.variableId;
			$scope.state.variableObject.name = favorite.variableName;
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-gear-a"></i>Change Default Value' },
					{ text: '<i class="icon ion-edit"></i>Different Value/Time' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
					{ text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
					{ text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
					{ text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
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
						$scope.editMeasurement($scope.state.variableObject);
					}
                    if(index === 2){
						$state.go('app.charts',
							{
								trackingReminder: $scope.state.trackingReminder,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
                    }
					if (index === 3) {
						$scope.goToHistoryForVariableObject($scope.state.variableObject);
					}
					if (index === 4) {
						$state.go('app.variableSettings',
							{variableName: $scope.state.trackingReminder.variableName});
					}
					if(index === 5){
						$state.go('app.reminderAdd',
							{
								variableObject: $scope.state.variableObject,
								fromState: $state.current.name,
								fromUrl: window.location.href
							});
					}
					if(index === 6){
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
				destructiveButtonClicked: function() {
                    reminderService.deleteReminder($scope.state.trackingReminder.trackingReminderId)
                        .then(function(){
                            console.debug('Favorite Deleted');
                        }, function(err){
                            console.error('Failed to Delete Favorite, Try again!', 'assertive');
                        });
                    localStorageService.deleteElementOfItemById('trackingReminders', $scope.state.trackingReminder.trackingReminderId)
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
