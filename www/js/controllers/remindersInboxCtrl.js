angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, 
											   reminderService, $ionicLoading, measurementService, utilsService, 
											   $stateParams, $location, $filter, $ionicPlatform, $rootScope,
                                               notificationService, variableCategoryService){

	    $scope.controller_name = "RemindersInboxCtrl";

		console.log('Loading ' + $scope.controller_name);
		
	    $scope.state = {
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
			lastClientY : 0,
            hideLoadMoreButton : true,
            showAllCaughtUp : false
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
				$scope.state.title = 'Today';
			}

		};

	    var filterViaDates = function(trackingReminderNotifications) {

            $scope.state.numberOfNotificationsInInbox = 0;
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


        $scope.getTrackingReminderNotifications = function(){
			$scope.showLoader('Syncing reminder notifications...');
            reminderService.getTrackingReminderNotifications($stateParams.variableCategoryName, $stateParams.today)
                .then(function(trackingReminderNotifications){
                	$rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
					notificationService.updateNotificationBadges(trackingReminderNotifications.length);
                    $scope.state.trackingRemindersNotifications =
                        variableCategoryService.attachVariableCategoryIcons(trackingReminderNotifications);
                    $scope.state.filteredTrackingReminderNotifications = filterViaDates(trackingReminderNotifications);
                    if(trackingReminderNotifications.length > 0){
                        $scope.state.showAllCaughtUp = false;
                    } else {
                        $scope.state.showAllCaughtUp = true;
                    }
                    $scope.state.hideLoadMoreButton = false;
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                }, function(){
                    $scope.state.hideLoadMoreButton = false;
                    $scope.hideLoader();
                    console.error("failed to get reminder notifications!");
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
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

		$scope.sendChromeEmailLink = function(){
			var subjectLine = "Install%20the%20" + config.appSettings.appName + "%20Chrome%20Browser%20Extension";
			var linkToChromeExtension = config.appSettings.linkToChromeExtension;
			var emailBody = "Did%20you%20know%20that%20you%20can%20easily%20track%20everything%20on%20your%20laptop%20and%20desktop%20with%20our%20Google%20Chrome%20browser%20extension%3F%20%20Your%20data%20is%20synced%20between%20devices%20so%20you%27ll%20never%20have%20to%20track%20twice!%0A%0ADownload%20it%20here!%0A%0A" + encodeURIComponent(linkToChromeExtension)  + "%0A%0ALove%2C%20%0AYou";

			if($rootScope.isMobile){
				$scope.sendWithEmailComposer(subjectLine, emailBody);
			} else {
				$scope.sendWithMailTo(subjectLine, emailBody);
			}
		};


		$scope.track = function(trackingReminderNotification, modifiedReminderValue, $event, dividerIndex, reminderNotificationIndex){

			if(isGhostClick($event)){
				return;
			}

			$scope.state.filteredTrackingReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;
			console.debug('Tracking notification', trackingReminderNotification);
			console.log('modifiedReminderValue is ' + modifiedReminderValue);
			var params = {
				trackingReminderNotificationId: trackingReminderNotification.id,
				modifiedValue: modifiedReminderValue
			};
	    	reminderService.trackReminderNotification(params)
	    	.then(function(){
                notificationService.decrementNotificationBadges();
                if($rootScope.numberOfPendingNotifications < 2){
                    $scope.init();
                }
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

			$scope.state.filteredTrackingReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;

			console.debug('Skipping notification', trackingReminderNotification);
			var params = {
				trackingReminderNotificationId: trackingReminderNotification.id
			};
	    	reminderService.skipReminderNotification(params)
	    	.then(function(){
	    		$scope.hideLoader();
                notificationService.decrementNotificationBadges();
                if($rootScope.numberOfPendingNotifications < 2){
                    $scope.init();
                }
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

			$scope.state.filteredTrackingReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;

			console.debug('Snoozing notification', trackingReminderNotification);
			var params = {
				trackingReminderNotificationId: trackingReminderNotification.id
			};
	    	reminderService.snoozeReminderNotification(params)
	    	.then(function(){
                notificationService.decrementNotificationBadges();
                if($rootScope.numberOfPendingNotifications < 2){
                    $scope.init();
                }
	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				console.error(err);
	    		utilsService.showAlert('Failed to Snooze Reminder, Try again!', 'assertive');
	    	});
	    };

	    $scope.init = function(){
            $scope.state.hideLoadMoreButton = true;
			Bugsnag.context = "reminderInbox";
			setPageTitle();
			var isAuthorized = authService.checkAuthOrSendToLogin();
			if (typeof analytics !== 'undefined')  { analytics.trackView("Reminders Inbox Controller"); }
			if(isAuthorized){
				$scope.showHelpInfoPopupIfNecessary();
                $scope.getTrackingReminderNotifications();
				//update alarms and local notifications
				console.debug("reminderInbox init: calling refreshTrackingRemindersAndScheduleAlarms");
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
			$scope.state.filteredTrackingReminderNotifications[dividerIndex].reminders[reminderNotificationIndex].hide = true;
			// FIXME this shouldn't skip unless the change is made - user could cancel
			var params = {
				trackingReminderNotificationId: trackingReminderNotification.id
			};
			reminderService.skipReminderNotification(params);
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
