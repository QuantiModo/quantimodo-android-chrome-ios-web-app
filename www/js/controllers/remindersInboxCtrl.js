angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersInboxCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, reminderService, $ionicLoading, measurementService){

	    $scope.controller_name = "RemindersInboxCtrl";

	    // Show alert with a title
	    $scope.showAlert = function(title, template) {
	       var alertPopup = $ionicPopup.alert({
	         cssClass : 'calm',
             okType : 'button-calm',
	         title: title,
	         template: template
	       });
	    };

	    $scope.state = {
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	reminderDefaultValue : "",
	    	allReminders : [
	    	],
	    	trackingRemindersNotifications : [
	    	],
	    	filteredReminders : [
	    	],
	    	measuementDate : new Date(),
	    	slots : {
				epochTime: new Date().getTime()/1000,
				format: 24,
				step: 1
			}
	    };

	    var filterViaDates = function(reminders){

	    	var result = [];
	    	var reference = moment().local();
	    	var today = reference.clone().startOf('day');
	    	var yesterday = reference.clone().subtract(1, 'days').startOf('day');
	    	var weekold = reference.clone().subtract(7, 'days').startOf('day');
	    	var monthold = reference.clone().subtract(30, 'days').startOf('day');

	    	var todayResult = reminders.filter(function(reminder){
	    		return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
	    	});

	    	if(todayResult.length) result.push({ name : "Today", reminders : todayResult });

	    	var yesterdayResult = reminders.filter(function(reminder){
	    		return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
	    	});

	    	if(yesterdayResult.length) result.push({ name : "Yesterday", reminders : yesterdayResult });

	    	var last7DayResult = reminders.filter(function(reminder){
	    		var date = moment.utc(reminder.trackingReminderNotificationTime).local();

	    		return date.isAfter(weekold) === true
	    		&& date.isSame(yesterday, 'd') !== true
	    		&& date.isSame(today, 'd') !== true;
	    	});

	    	if(last7DayResult.length) result.push({ name : "Last 7 Days", reminders : last7DayResult });

	    	var last30DayResult = reminders.filter(function(reminder){

	    		var date = moment.utc(reminder.trackingReminderNotificationTime).local();

	    		return date.isAfter(monthold) === true
	    		&& date.isBefore(weekold) === true
	    		&& date.isSame(yesterday, 'd') !== true
	    		&& date.isSame(today, 'd') !== true;
	    	});

	    	if(last30DayResult.length) result.push({ name : "Last 30 Days", reminders : last30DayResult });

	    	var olderResult = reminders.filter(function(reminder){
	    		return moment.utc(reminder.trackingReminderNotificationTime).local().isBefore(monthold) === true;
	    	});

	    	if(olderResult.length) result.push({ name : "Older", reminders : olderResult });

	    	return result;
	    };

	    var utils = {
    	    startLoading : function(){
    	    	// show spinner
    			$ionicLoading.show({
    				noBackdrop: true,
    				template: '<p class="item-icon-left">Making stuff happen...<ion-spinner icon="lines"/></p>'
    		    });
    	    },

    	    stopLoading : function(){
    	    	// hide spinner
    	    	$ionicLoading.hide();
    	    },

    	    // alert box
	        showAlert : function(title, cssClass) {
	           var alertPopup = $ionicPopup.alert({
	             cssClass : cssClass? cssClass : 'calm',
	             okType : cssClass? 'button-'+cssClass : 'button-calm',
	             title: title
	           });
	        }
	    };

	    var getReminders = function(){
	    	utils.startLoading();
	    	reminderService.getReminders()
	    	.then(function(reminders){
	    		$scope.state.allReminders = reminders;
	    		utils.stopLoading();
	    	}, function(){
	    		utils.stopLoading();
	    		console.log("failed to get reminders");
	    	});
	    };

	    var getTrackingReminders = function(){
	    	utils.startLoading();
	    	reminderService.getTrackingReminderNotifications()
	    	.then(function(reminders){
	    		$scope.state.trackingRemindersNotifications = reminders;
	    		$scope.state.filteredReminders = filterViaDates(reminders);
	    		utils.stopLoading();
	    	}, function(){
	    		utils.stopLoading();
	    		console.log("failed to get reminders");
	    	});
	    };

	    $scope.track = function(reminder){
	    	utils.startLoading();
	    	reminderService.trackReminder(reminder.id)
	    	.then(function(){

	    		utils.stopLoading();
	    		$scope.init();

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to Track Reminder, Try again!', 'assertive');
	    	});
	    };

	    $scope.skip = function(reminder){
	    	utils.startLoading();
	    	reminderService.skipReminder(reminder.id)
	    	.then(function(){

	    		utils.stopLoading();
	    		$scope.init();

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to Skip Reminder, Try again!', 'assertive');
	    	});
	    };

	    // when date is updated
	    $scope.currentDatePickerCallback = function (val) {
	    	if(typeof(val)==='undefined'){
	    		console.log('Date not selected');
	    	} else {
	    		$scope.state.measuementDate = new Date(val);
	    	}
	    };

		// when time is changed
		$scope.currentTimePickerCallback = function (val) {
			if (typeof (val) === 'undefined') {
				console.log('Time not selected');
			} else {
				var a = new Date();
				a.setHours(val.hours);
				a.setMinutes(val.minutes);
				$scope.state.slots.epochTime = a.getTime()/1000;
			}
		};

	    $scope.snooze = function(reminder){
	    	utils.startLoading();
	    	reminderService.snoozeReminder(reminder.id)
	    	.then(function(){

	    		utils.stopLoading();
	    		$scope.init();

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to Snooze Reminder, Try again!', 'assertive');
	    	});
	    };

	    // constructor
	    $scope.init = function(){
	      	if($state.is('app.reminders_manage'))
	      		getReminders();
	      	else getTrackingReminders();
	    };

	    $scope.saveMeasurement = function(){

	    	var dateFromDate = $scope.state.measuementDate;
	    	var timeFromDate = new Date($scope.state.slots.epochTime * 1000);

	    	dateFromDate.setHours(timeFromDate.getHours());
	    	dateFromDate.setMinutes(timeFromDate.getMinutes());

	    	// populate params
	    	var params = {
	    	    variable : $scope.state.selectedReminder.variableName,
	    	    value : $scope.state.reminderDefaultValue,
	    	    epoch : moment.utc(dateFromDate).valueOf(),
	    	    unit : $scope.state.selectedReminder.abbreviatedUnitName,
	    	    category : $scope.state.selectedReminder.variableCategoryName,
	    	    isAvg : $scope.state.selectedReminder.combinationOperation === "MEAN"? false : true
	    	};

	    	utils.startLoading();
    		var usePromise = true;
    	    // post measurement
    	    measurementService.post_tracking_measurement(params.epoch,
    	        params.variable,
    	        params.value,
    	        params.unit,
    	        params.isAvg,
    	        params.category,
    	        usePromise)
    	    .then(function(){
    	    	$scope.state.showMeasurementBox = false;
    	    	$scope.skip($scope.state.selectedReminder);
    	    	$scope.init();
    	    }, function(){
    	    	utils.stopLoading();
    	    	utils.showAlert('Failed to post measuement, Try again!','assertive');
    	    });

	    };

	    $scope.editMeasurement = function(reminder){

	    	$scope.state.showMeasurementBox = true;
	    	$scope.state.selectedReminder = reminder;
	    	$scope.state.reminderDefaultValue = reminder.defaultValue;
	    	$scope.state.slots.epochTime = moment.utc(reminder.trackingReminderNotificationTime).unix();
	    	$scope.state.measuementDate = new Date(reminder.trackingReminderNotificationTime);
	    };

	    $scope.edit = function(reminder){
	    	$state.go('app.reminders', {reminder : reminder})
	    };

	    $scope.deleteReminder = function(reminder){
	    	utils.startLoading();
	    	reminderService.deleteReminder(reminder.id)
	    	.then(function(){

	    		utils.stopLoading();
	    		utils.showAlert('Reminder Deleted.');
	    		$scope.init();

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

	})