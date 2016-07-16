angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, 
											   reminderService, $ionicLoading, measurementService, utilsService, 
											   $stateParams, $location, $filter, $ionicPlatform, $rootScope, notificationService, variableCategoryService){

	    $scope.controller_name = "RemindersInboxCtrl";

		console.log('Loading ' + $scope.controller_name);
		
	    $scope.state = {
			showButtons : false,
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	reminderDefaultValue : "",
	    	selected1to5Value : false,
	    	allReminders : [
	    	],
	    	trackingRemindersNotifications : [
	    	],
	    	filteredReminderNotifications : [
	    	],
	    	measurementDate : new Date(),
	    	slots : {
				epochTime: new Date().getTime()/1000,
				format: 12,
				step: 1,
				closeLabel: 'Cancel'
			},
			variable : {},
			isDisabled : false,
			title : 'Reminder Inbox',
			loading : true,
			lastButtonPressTimeStamp : 0,
			lastClientX : 0,
			lastClientY : 0
	    };

	    if($stateParams.reminderFrequency === 0){
	    	$scope.state.favorites = true;
		}

		if(typeof config.appSettings.remindersInbox.showAddHowIFeelResponseButton !== 'undefined'){
			$scope.state.showAddHowIFeelResponseButton = config.appSettings.remindersInbox.showAddHowIFeelResponseButton;
		}

		if(typeof(config.appSettings.remindersInbox.hideAddNewReminderButton) !== 'undefined'){
			$scope.state.hideAddNewReminderButton = config.appSettings.remindersInbox.hideAddNewReminderButton;
		}

		if(typeof(config.appSettings.remindersInbox.showAddNewMedicationButton) !== 'undefined'){
			$scope.state.showAddNewMedicationButton = config.appSettings.remindersInbox.showAddNewMedicationButton;
		}

		if(typeof(config.appSettings.remindersInbox.showAddVitalSignButton) !== 'undefined'){
			$scope.state.showAddVitalSignButton = config.appSettings.remindersInbox.showAddVitalSignButton;
		}



	    $scope.selectPrimaryOutcomeVariableValue = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');

	        jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

	        $scope.state.selected1to5Value = val;

		};

		var setPageTitle = function(){
			if(typeof(config.appSettings.remindersInbox.title) !== 'undefined'){
				$scope.state.title = config.appSettings.remindersInbox.title;
			}

			if($stateParams.variableCategoryName){
				$scope.state.title = $filter('wordAliases')($stateParams.variableCategoryName) + " " + $filter('wordAliases')("Reminder Inbox");
			}

			if($stateParams.today) {
				$scope.state.title = 'Today';
			}
			if($state.includes('app.favorites')){
				$scope.state.title = 'Your Favorites';
			}

		};

	    var filterViaDates = function(trackingReminderNotifications) {

            $scope.state.numberOfNotificationsInInbox = 0;
			var result = [];
			if($state.includes('app.favorites')){
				result.push({ name : "Favorites", reminders : trackingReminderNotifications });
				return result;
			}
			var reference = moment().local();
			var today = reference.clone().startOf('day');
			var yesterday = reference.clone().subtract(1, 'days').startOf('day');
			var weekold = reference.clone().subtract(7, 'days').startOf('day');
			var monthold = reference.clone().subtract(30, 'days').startOf('day');

			var todayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
				return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
			});

			if (todayResult.length) {
                $scope.state.numberOfNotificationsInInbox = $scope.state.numberOfNotificationsInInbox + todayResult.length;
				result.push({name: "Today", reminders: todayResult});
			}

	    	var yesterdayResult = trackingReminderNotifications.filter(function(trackingReminderNotification){
	    		return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
	    	});

	    	if(yesterdayResult.length) {
                $scope.state.numberOfNotificationsInInbox = $scope.state.numberOfNotificationsInInbox + yesterdayResult.length;
				result.push({ name : "Yesterday", reminders : yesterdayResult });
			}

	    	var last7DayResult = trackingReminderNotifications.filter(function(trackingReminderNotification){
	    		var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

	    		return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true && 
					date.isSame(today, 'd') !== true;
	    	});

	    	if(last7DayResult.length) {
                $scope.state.numberOfNotificationsInInbox = $scope.state.numberOfNotificationsInInbox + last7DayResult.length;
				result.push({ name : "Last 7 Days", reminders : last7DayResult });
			}

	    	var last30DayResult = trackingReminderNotifications.filter(function(trackingReminderNotification){

	    		var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

	    		return date.isAfter(monthold) === true && date.isBefore(weekold) === true &&
					date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
	    	});

	    	if(last30DayResult.length) {
                $scope.state.numberOfNotificationsInInbox = $scope.state.numberOfNotificationsInInbox + last30DayResult.length;
				result.push({ name : "Last 30 Days", reminders : last30DayResult });
			}

	    	var olderResult = trackingReminderNotifications.filter(function(trackingReminderNotification){
	    		return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isBefore(monthold) === true;
	    	});

	    	if(olderResult.length) {
                $scope.state.numberOfNotificationsInInbox = $scope.state.numberOfNotificationsInInbox + olderResult.length;
				result.push({ name : "Older", reminders : olderResult });
			}

	    	return result;
	    };

		function getFavoriteTrackingRemindersFromLocalStorage(){
			$scope.state.favorites =
				localStorageService.getElementsFromItemWithFilters('trackingReminders', 'reminderFrequency', 0);
			$scope.state.favorites = variableCategoryService.attachVariableCategoryIcons($scope.state.favorites);
			for(var i = 0; i < $scope.state.favorites.length; i++){
				$scope.state.favorites[i].total = null;
			}
		}

        var getTrackingReminderNotifications = function(){
			$scope.showLoader('Syncing reminder notifications...');
            reminderService.getTrackingReminderNotifications($stateParams.variableCategoryName, $stateParams.today)
                .then(function(trackingReminderNotifications){
                	$rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
					notificationService.updateNotificationBadges(trackingReminderNotifications.length);
                    $scope.state.trackingRemindersNotifications = variableCategoryService.attachVariableCategoryIcons(trackingReminderNotifications);
                    $scope.state.filteredReminderNotifications = filterViaDates(trackingReminderNotifications);
                    if($scope.state.numberOfNotificationsInInbox.length > 1){
                        $scope.state.showButtons = false;
                    }
                    if($scope.state.numberOfNotificationsInInbox < 2){
                        $scope.state.showButtons = true;
                    }
                    
                }, function(){
                    $scope.hideLoader();
                    console.error("failed to get reminder notifications!");
                });
        };

		var isGhostClick = function ($event) {
			if($rootScope.isMobile ){
				if($event &&
					$scope.state.lastButtonPressTimeStamp > $event.timeStamp - 3000 &&
					$scope.state.lastClientX === $event.clientX &&
					$scope.state.lastClientY === $event.clientY
				) {
					console.debug('This event is probably a ghost click so not registering.', $event);
					return true;
				} else {
					console.debug('This Track event is not a ghost click so registering.', $event);
					$scope.state.lastButtonPressTimeStamp = $event.timeStamp;
					$scope.state.lastClientX = $event.clientX;
					$scope.state.lastClientY = $event.clientY;
					return false;
				}
			}
		};


		$scope.track = function(trackingReminderNotification, modifiedReminderValue, $event, dividerIndex, reminderNotificationIndex){

			if(isGhostClick($event)){
				return;
			}

			$scope.state.filteredReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;
			console.debug('Tracking notification', trackingReminderNotification);
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
	    	reminderService.trackReminderNotification(trackingReminderNotification.id, modifiedReminderValue)
	    	.then(function(){
	    		//$scope.init();

	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				console.error(err);
	    		utilsService.showAlert('Failed to Track Reminder, Try again!', 'assertive');
	    	});
	    };

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
			//utilsService.showAlert(trackingReminder.variableName + ' measurement saved!');
			measurementService.postMeasurementByReminder(trackingReminder, modifiedReminderValue)
				.then(function(){
					//$scope.init();

				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					console.error(err);
					utilsService.showAlert('Failed to Track Reminder, Try again!', 'assertive');
				});
		};

	    $scope.skip = function(trackingReminderNotification, $event, dividerIndex, reminderNotificationIndex){
			

			if(isGhostClick($event)){
				return;
			}

			$scope.state.filteredReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;

			console.debug('Skipping notification', trackingReminderNotification);
	    	reminderService.skipReminderNotification(trackingReminderNotification.id)
	    	.then(function(){
	    		$scope.hideLoader();
	    		//$scope.init();
	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
	    		$scope.hideLoader();
	    		utilsService.showAlert('Failed to Skip Reminder, Try again!', 'assertive');
				console.error(err);
	    	});
	    };

	    $scope.snooze = function(trackingReminderNotification, $event, dividerIndex, reminderNotificationIndex){

			if(isGhostClick($event)){
				return;
			}

			$scope.state.filteredReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;

			console.debug('Snoozing notification', trackingReminderNotification);
	    	reminderService.snoozeReminderNotification(trackingReminderNotification.id)
	    	.then(function(){
	    		//$scope.init();
	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				console.error(err);
	    		utilsService.showAlert('Failed to Snooze Reminder, Try again!', 'assertive');
	    	});
	    };

	    $scope.init = function(){
			Bugsnag.context = "reminderInbox";
			setPageTitle();
			var isAuthorized = authService.checkAuthOrSendToLogin();
			if (typeof analytics !== 'undefined')  { analytics.trackView("Reminders Inbox Controller"); }
			if(isAuthorized) {
				//if ($state.includes('app.favorites')) {
					getFavoriteTrackingRemindersFromLocalStorage();
				//} else {
					$scope.showHelpInfoPopupIfNecessary();
					getTrackingReminderNotifications();
				//}
				//update alarms and local notifications
				reminderService.refreshTrackingRemindersAndScheduleAlarms();
			}
			if (typeof cordova !== "undefined") {
				$ionicPlatform.ready(function () {
					cordova.plugins.notification.local.clearAll(function () {
						console.debug("clearAll active notifications");
					}, this);
				});
			}
	    };

	    $scope.editMeasurement = function(trackingReminderNotification, dividerIndex, reminderNotificationIndex){
			$scope.state.filteredReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;
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
