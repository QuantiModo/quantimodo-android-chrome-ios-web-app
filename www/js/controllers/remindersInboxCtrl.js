angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, 
											   reminderService, $ionicLoading, measurementService, utilsService, 
											   $stateParams, $location, $filter, $ionicPlatform){

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
			loading : true
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

	    var getTrackingReminderNotifications = function(){
	    	//$scope.showLoader('Fetching reminders...');
			$scope.showLoader();

	    	reminderService.getTrackingReminderNotifications($stateParams.variableCategoryName, $stateParams.today)
	    	.then(function(trackingReminderNotifications){
				if(trackingReminderNotifications.length > 1){
					$scope.state.showButtons = false;
				}
				if(trackingReminderNotifications.length < 2){
					$scope.state.showButtons = true;
				}

	    		$scope.state.trackingRemindersNotifications = trackingReminderNotifications;
	    		$scope.state.filteredReminders = filterViaDates(trackingReminderNotifications);
				$ionicLoading.hide();
				$scope.loading = false;
	    	}, function(){
				$ionicLoading.hide();
				$scope.loading = false;
	    		console.error("failed to get reminders");

	    	});
	    };

		var removeNotificationFromDisplay = function(trackingReminderNotificationId){
			var notificationsToKeep = [];
			for(var i = 0; i < $scope.state.trackingRemindersNotifications.length; i++){
				if($scope.state.trackingRemindersNotifications[i].id !== trackingReminderNotificationId){
					notificationsToKeep.push($scope.state.trackingRemindersNotifications[i]);
				}
			}
			$scope.state.trackingRemindersNotifications = notificationsToKeep;
			$scope.state.filteredReminders = filterViaDates(notificationsToKeep);
			$ionicLoading.hide();
			$scope.loading = false;
		};

	    $scope.track = function(trackingReminderNotification, modifiedReminderValue){
			//$scope.showLoader();
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
			removeNotificationFromDisplay(trackingReminderNotification.id);
	    	reminderService.trackReminderNotification(trackingReminderNotification.id, modifiedReminderValue)
	    	.then(function(){
	    		//$scope.init();

	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				console.error(err);
	    		utilsService.showAlert('Failed to Track Reminder, Try again!', 'assertive');
	    	});
	    };

	    $scope.skip = function(trackingReminderNotification){
			//$scope.showLoader();
			removeNotificationFromDisplay(trackingReminderNotification.id);
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

	    $scope.snooze = function(trackingReminderNotification){
			//$scope.showLoader();
			removeNotificationFromDisplay(trackingReminderNotification.id);
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
			setPageTitle();
			var isAuthorized = authService.checkAuthOrSendToLogin();
			if(isAuthorized){
				$scope.showHelpInfoPopupIfNecessary();
				getTrackingReminderNotifications();
				//update alarms and local notifications
				reminderService.getTrackingReminders();
			}
			if (typeof cordova != "undefined") {
				$ionicPlatform.ready(function () {
					cordova.plugins.notification.local.clearAll(function () {
						console.debug("clearAll active notifications");
					}, this);
				});
			}
	    };

	    $scope.editMeasurement = function(trackingReminderNotification){
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

	    $scope.deleteReminder = function(trackingReminderNotification){
			$scope.showLoader();
	    	reminderService.deleteReminder(trackingReminderNotification.id)
	    	.then(function(){

				$ionicLoading.hide();
				$scope.loading = false;
	    		utilsService.showAlert('Reminder Deleted.');
	    		$scope.init();

	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				$ionicLoading.hide();
				$scope.loading = false;
				console.error(err);
	    		utilsService.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});
		
	});
