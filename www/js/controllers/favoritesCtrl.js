angular.module('starter')

	.controller('FavoritesCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											   reminderService, $ionicLoading, measurementService, utilsService,
											   $stateParams, $location, $filter, $ionicPlatform, $rootScope,
                                               notificationService, variableCategoryService){

	    $scope.controller_name = "FavoritesCtrl";

		console.log('Loading ' + $scope.controller_name);
		
	    $scope.state = {
	    	selected1to5Value : false,
	    	measurementDate : new Date(),
	    	slots : {
				epochTime: new Date().getTime()/1000,
				format: 12,
				step: 1,
				closeLabel: 'Cancel'
			},
			title : 'Favorites',
			loading : true
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

	    $scope.editMeasurement = function(trackingReminderNotification, dividerIndex, reminderNotificationIndex){
			$scope.state.filteredReminders[dividerIndex].reminders[reminderNotificationIndex].hide = true;
			// FIXME this shouldn't skip unless the change is made - user could cancel
			reminderService.skipReminderNotification(trackingReminderNotification.id);
			$state.go('app.measurementAdd',
				{
					reminder: trackingReminderNotification,
					fromUrl: window.location.href
				});
	    };

	    $scope.editReminderSettings = function(trackingReminderNotification){
			var trackingReminder = trackingReminderNotification;
			trackingReminder.id = trackingReminderNotification.trackingReminderId;
	    	$state.go('app.reminderAdd',
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
		
	});
