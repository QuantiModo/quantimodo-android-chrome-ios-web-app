angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, 
											   reminderService, $ionicLoading, measurementService, utilsService, 
											   $stateParams, $location, $filter){

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
				step: 1
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
	        jQuery('.primary-outcome-variable .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

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
				$scope.state.title = 'Upcoming Reminders'
			}
		};

	    var filterViaDates = function(reminders) {

			var result = [];
			var reference = moment().local();
			var today = reference.clone().startOf('day');
			var yesterday = reference.clone().subtract(1, 'days').startOf('day');
			var weekold = reference.clone().subtract(7, 'days').startOf('day');
			var monthold = reference.clone().subtract(30, 'days').startOf('day');

			var todayResult = reminders.filter(function (reminder) {
				return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
			});

			if (todayResult.length) {
				result.push({name: "Today", reminders: todayResult});
			}

	    	var yesterdayResult = reminders.filter(function(reminder){
	    		return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
	    	});

	    	if(yesterdayResult.length) {
				result.push({ name : "Yesterday", reminders : yesterdayResult });
			}

	    	var last7DayResult = reminders.filter(function(reminder){
	    		var date = moment.utc(reminder.trackingReminderNotificationTime).local();

	    		return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true && 
					date.isSame(today, 'd') !== true;
	    	});

	    	if(last7DayResult.length) {
				result.push({ name : "Last 7 Days", reminders : last7DayResult });
			}

	    	var last30DayResult = reminders.filter(function(reminder){

	    		var date = moment.utc(reminder.trackingReminderNotificationTime).local();

	    		return date.isAfter(monthold) === true && date.isBefore(weekold) === true &&
					date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
	    	});

	    	if(last30DayResult.length) result.push({ name : "Last 30 Days", reminders : last30DayResult });

	    	var olderResult = reminders.filter(function(reminder){
	    		return moment.utc(reminder.trackingReminderNotificationTime).local().isBefore(monthold) === true;
	    	});

	    	if(olderResult.length) result.push({ name : "Older", reminders : olderResult });

	    	return result;
	    };

	    var getTrackingReminderNotifications = function(){
	    	$scope.showLoader('Fetching reminders...');

	    	reminderService.getTrackingReminderNotifications($stateParams.variableCategoryName, $stateParams.today)
	    	.then(function(reminders){
				if(reminders.length > 1){
					$scope.state.showButtons = false;
				}
				if(reminders.length < 2){
					$scope.state.showButtons = true;
				}

	    		$scope.state.trackingRemindersNotifications = reminders;
	    		$scope.state.filteredReminders = filterViaDates(reminders);
				$ionicLoading.hide();
				$scope.loading = false;
	    	}, function(){
				$ionicLoading.hide();
				$scope.loading = false;
	    		console.error("failed to get reminders");
				//utilsService.showLoginRequiredAlert($scope.login);

	    	});
	    };

	    $scope.track = function(reminder, modifiedReminderValue){
			$scope.showLoader();
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
	    	reminderService.trackReminder(reminder.id, modifiedReminderValue)
	    	.then(function(){
	    		$scope.init();

	    	}, function(err){
				console.error(err);
	    		utilsService.showAlert('Failed to Track Reminder, Try again!', 'assertive');
	    	});
	    };

	    $scope.skip = function(reminder){
			$scope.showLoader();
	    	reminderService.skipReminder(reminder.id)
	    	.then(function(){
	    		$scope.init();

	    	}, function(err){
	    		utilsService.showAlert('Failed to Skip Reminder, Try again!', 'assertive');
				console.error(err);
	    	});
	    };

	    $scope.snooze = function(reminder){
			$scope.showLoader();
	    	reminderService.snoozeReminder(reminder.id)
	    	.then(function(){
	    		$scope.init();
	    	}, function(err){
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
			}
	    };

	    $scope.editMeasurement = function(reminder){
			$state.go('app.measurementAdd', {reminder: reminder});
	    };

	    $scope.editReminderSettings = function(reminder){
	    	reminder["fromState"] = $state.current.name;
	    	$state.go('app.reminderAdd', {reminder : reminder});
	    };

	    $scope.deleteReminder = function(reminder){
			$scope.showLoader();
	    	reminderService.deleteReminder(reminder.id)
	    	.then(function(){

				$ionicLoading.hide();
				$scope.loading = false;
	    		utilsService.showAlert('Reminder Deleted.');
	    		$scope.init();

	    	}, function(err){
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

		$scope.showLoader = function (loadingText) {
			if(!loadingText){
				loadingText = '';
			}
			$scope.loading = true;
			$ionicLoading.show({
				template: loadingText+ '<br><br><img src={{loaderImagePath}}>',
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: false,
				maxWidth: 1000,
				showDelay: 0
			});
		};


	});
