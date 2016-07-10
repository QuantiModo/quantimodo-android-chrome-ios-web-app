angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, 
											   reminderService, $ionicLoading, measurementService, utilsService, 
											   $stateParams, $location, $filter, $ionicPlatform, $rootScope, $q, QuantiModo){

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
	    	filteredReminders : [
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
				$scope.state.title = 'Upcoming Reminders';
			}
		};

	    var filterViaDates = function(trackingReminderNotifications) {

			var result = [];
			var reference = moment().local();
			var today = reference.clone().startOf('day');
			var yesterday = reference.clone().subtract(1, 'days').startOf('day');
			var weekold = reference.clone().subtract(7, 'days').startOf('day');
			var monthold = reference.clone().subtract(30, 'days').startOf('day');

			var todayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
				return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
			});

			if (todayResult.length) {
				result.push({name: "Today", reminders: todayResult});
			}

	    	var yesterdayResult = trackingReminderNotifications.filter(function(trackingReminderNotification){
	    		return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
	    	});

	    	if(yesterdayResult.length) {
				result.push({ name : "Yesterday", reminders : yesterdayResult });
			}

	    	var last7DayResult = trackingReminderNotifications.filter(function(trackingReminderNotification){
	    		var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

	    		return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true && 
					date.isSame(today, 'd') !== true;
	    	});

	    	if(last7DayResult.length) {
				result.push({ name : "Last 7 Days", reminders : last7DayResult });
			}

	    	var last30DayResult = trackingReminderNotifications.filter(function(trackingReminderNotification){

	    		var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

	    		return date.isAfter(monthold) === true && date.isBefore(weekold) === true &&
					date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
	    	});

	    	if(last30DayResult.length) {
				result.push({ name : "Last 30 Days", reminders : last30DayResult });
			}

	    	var olderResult = trackingReminderNotifications.filter(function(trackingReminderNotification){
	    		return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isBefore(monthold) === true;
	    	});

	    	if(olderResult.length) {
				result.push({ name : "Older", reminders : olderResult });
			}

	    	return result;
	    };

		var refreshAllReminderNotificationsAndUpdateView = function(){
			var defer = $q.defer();
			var responseArray = [];
			var allReminderNotifications = [];
			var params = {
				offset: 0,
				limit: 200
			};

			var errorHandler = function(response){
				defer.resolve(response);
			};

			var successHandler =  function(response){
				responseArray.success = response.success;
				allReminderNotifications = allReminderNotifications.concat(response.data);
				localStorageService.setItem('trackingReminderNotifications', JSON.stringify(allReminderNotifications));
                if(allReminderNotifications < 300){
                    var trackingReminderNotificationsToDisplay =
                        reminderService.getTrackingReminderNotificationsFromLocalStorage($stateParams.variableCategoryName, $stateParams.today);
                    $scope.state.filteredReminders = filterViaDates(trackingReminderNotificationsToDisplay);
                }
				if(response.data.length < 200 || typeof response.data === "string" || params.offset >= 500){
					responseArray.data = allReminderNotifications;
					defer.resolve(responseArray);
				} else {
					params.offset += 200;
					defer.notify(response);
					QuantiModo.get('api/v1/trackingReminderNotifications',
						['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'],
						params,
						successHandler,
						errorHandler);
				}
			};

			QuantiModo.get('api/v1/trackingReminderNotifications',
				['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'],
				params,
				successHandler,
				errorHandler);

			return defer.promise;
		};

		var getTrackingReminderNotificationsFromLocalStorageAndRefresh = function(){
	    	//$scope.showLoader('Fetching reminders...');
			var trackingReminderNotifications =
				reminderService.getTrackingReminderNotificationsFromLocalStorage($stateParams.variableCategoryName, $stateParams.today);
			$scope.state.filteredReminders = filterViaDates(trackingReminderNotifications);

			if($scope.state.filteredReminders.length < 1) {
				$scope.showLoader('Syncing reminder notifications...');
			}

			refreshAllReminderNotificationsAndUpdateView();

			if($scope.state.filteredReminders > 3){
				$scope.state.showButtons = false;
			}
			if(trackingReminderNotifications.length < 4){
				$scope.state.showButtons = true;
			}
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

			$scope.state.filteredReminders[dividerIndex].reminders[reminderNotificationIndex].hide = true;
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

	    $scope.skip = function(trackingReminderNotification, $event, dividerIndex, reminderNotificationIndex){
			

			if(isGhostClick($event)){
				return;
			}

			$scope.state.filteredReminders[dividerIndex].reminders[reminderNotificationIndex].hide = true;

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

			$scope.state.filteredReminders[dividerIndex].reminders[reminderNotificationIndex].hide = true;

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
			if(isAuthorized){
				$scope.showHelpInfoPopupIfNecessary();
				getTrackingReminderNotificationsFromLocalStorageAndRefresh();
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
			$scope.state.filteredReminders[dividerIndex].reminders[reminderNotificationIndex].hide = true;
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
