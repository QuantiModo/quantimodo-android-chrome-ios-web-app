angular.module('starter').controller('RemindersInboxCtrl', function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform,
											   $ionicActionSheet, $timeout, quantimodoService, $ionicLoading) {
	$scope.controller_name = "RemindersInboxCtrl";
	console.debug('Loading ' + $scope.controller_name);
	$rootScope.showFilterBarSearchIcon = false;
	$scope.state = {
		showMeasurementBox : false,
		selectedReminder : false,
		reminderDefaultValue : "",
		selected1to5Value : false,
		allReminders : [ ],
		trackingReminderNotifications : [ ],
		filteredReminderNotifications : [ ],
		measurementDate : new Date(),
		slots : {
			epochTime: new Date().getTime()/1000,
			format: 12,
			step: 1,
			closeLabel: 'Cancel'
		},
		variable : {},
		isDisabled : false,
		loading : true,
		lastButtonPressTimeStamp : 0,
		lastClientX : 0,
		lastClientY : 0,
		numberOfDisplayedNotifications: 0,
		favoritesTitle: "Your Favorites"
	};
	//createWordCloudFromNotes();
	$scope.$on('$ionicView.beforeEnter', function(e) {
		console.debug("RemindersInboxCtrl beforeEnter ");
		$scope.loading = true;
		if(!quantimodoService.getUrlParameter('accessToken') && !$rootScope.user){
			console.debug('Setting afterLoginGoToState to ' + $state.current.name);
			quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.onboarding');
			$state.go('app.login');
		}
		$rootScope.hideBackButton = true;
		$rootScope.hideHomeButton = true;
		setPageTitle();
	});
	$scope.$on('$ionicView.enter', function(e) {
        $scope.defaultHelpCards = quantimodoService.setupHelpCards();
        getTrackingReminderNotifications();
		console.debug("RemindersInboxCtrl enter");
		if ($stateParams.hideNavigationMenu !== true){$rootScope.hideNavigationMenu = false;}
		$rootScope.bloodPressure = {systolicValue: null, diastolicValue: null, displayTotal: "Blood Pressure"};
		$rootScope.stateParams = $stateParams;
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
		if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){$rootScope.variableCategoryName = $stateParams.variableCategoryName;
		} else {$rootScope.variableCategoryName = null;}
		$rootScope.showActionSheetMenu = function() {
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [],
				destructiveText: '<i class="icon ion-trash-a"></i>Clear All Notifications',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {console.debug('CANCELLED');},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
					if(index === 0){}
					return true;
				},
				destructiveButtonClicked: function() {
					$scope.showLoader('Skipping all reminder notifications...');
					quantimodoService.skipAllTrackingReminderNotificationsDeferred()
						.then(function(){
							if($rootScope.localNotificationsEnabled){quantimodoService.setNotificationBadge(0);}
							$scope.refreshTrackingReminderNotifications();
						}, function(error){
							if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
							console.error(error);
							$scope.showMaterialAlert('Failed to skip all notifications! ', 'Please let me know by pressing the help button.  Thanks!');
						});
					return true;
				}
			});
			$timeout(function() {hideSheet();}, 20000);
		};
		if(navigator && navigator.splashscreen) {
			console.debug('ReminderInbox: Hiding splash screen because app is ready');
			navigator.splashscreen.hide();
		}
	});
	$scope.$on('$ionicView.afterEnter', function(){
        console.debug("RemindersInboxCtrl afterEnter");
        var secondsSinceWeLastGotNotifications = quantimodoService.getSecondsSinceWeLastGotNotifications();
        if(!$rootScope.numberOfPendingNotifications || secondsSinceWeLastGotNotifications > 600){$scope.refreshTrackingReminderNotifications();}
	});
	$scope.$on('$ionicView.afterLeave', function(){
		console.debug("RemindersInboxCtrl afterLeave");
		$rootScope.hideHomeButton = false;
		$rootScope.hideBackButton = false;
	});
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
	var setPageTitle = function(){
		if($stateParams.today) {
			if($stateParams.variableCategoryName === 'Treatments') {
				$scope.state.title = "Today's Scheduled Meds";
				$scope.state.favoritesTitle = "As-Needed Meds";
			} else if ($stateParams.variableCategoryName) {
				$scope.state.title = "Today's Scheduled " + $stateParams.variableCategoryName;
			} else {$scope.state.title = "Today's Reminder Notifications";}
		} else {
			if($stateParams.variableCategoryName === 'Treatments') {
				$scope.state.title = 'Overdue Meds';
				$scope.state.favoritesTitle = "As-Needed Meds";
			} else if ($stateParams.variableCategoryName) {
				$scope.state.title = $filter('wordAliases')($stateParams.variableCategoryName) + " " + $filter('wordAliases')("Reminder Inbox");
			} else {$scope.state.title = 'Inbox';}
		}
	};
	var isGhostClick = function ($event) {
		if(!$rootScope.isMobile){return false;}
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
	};
	var setLastAction = function(modifiedValue, unitAbbreviatedName){
		var lastAction = 'Recorded ' + modifiedValue + ' ' + unitAbbreviatedName;
		lastAction = lastAction.replace('1 yes/no', 'YES');
		lastAction = lastAction.replace('0 yes/no', 'NO');
		$scope.lastAction = lastAction.replace(' /', '/');
	};
	$scope.trackByValueField = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){return;}
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		$rootScope.numberOfPendingNotifications--;
		afterTrackingActions();
		console.debug('modifiedReminderValue is ' + trackingReminderNotification.total);
		trackingReminderNotification.modifiedValue = trackingReminderNotification.total;
		setLastAction(trackingReminderNotification.modifiedValue, trackingReminderNotification.unitAbbreviatedName);
		if(!$rootScope.showUndoButton){ $scope.showUndoToast($scope.lastAction); }
		quantimodoService.trackTrackingReminderNotificationDeferred(trackingReminderNotification)
			.then(function(){
				if($rootScope.localNotificationsEnabled){quantimodoService.decrementNotificationBadges();}
				if($scope.state.numberOfDisplayedNotifications < 2){$scope.refreshTrackingReminderNotifications();}
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
	var getWeekdayChartAndFavoritesIfNecessary = function () {
		if(!$scope.state.numberOfDisplayedNotifications && !$scope.weekdayChartConfig){
            quantimodoService.syncPrimaryOutcomeVariableMeasurements();
			quantimodoService.getFavoriteTrackingRemindersFromLocalStorage($stateParams.variableCategoryName).then(function(favorites){$scope.favoritesArray = favorites;});
			quantimodoService.getWeekdayChartConfigForPrimaryOutcome($scope.state.primaryOutcomeMeasurements,
				quantimodoService.getPrimaryOutcomeVariable()).then(function (chartConfig) {$scope.weekdayChartConfig = chartConfig;});
            getCorrelations();
		}
	};
	var closeWindowIfNecessary = function () {
		if($state.current.name === "app.remindersInboxCompact" && !$scope.state.numberOfDisplayedNotifications){
			$scope.refreshTrackingReminderNotifications();
			window.close();
		}
	};
	var afterTrackingActions = function () {
		$rootScope.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		closeWindowIfNecessary();
		getWeekdayChartAndFavoritesIfNecessary();
	};
	var enlargeChromePopupIfNecessary = function () {
		if($rootScope.alreadyEnlargedWindow){return;}
		var largeInboxWindowParams = {top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
		if($state.current.name === "app.remindersInboxCompact"){
			$state.go("app.remindersInbox");
			chrome.windows.getCurrent({}, function (chromeWindow) {
				$rootScope.alreadyEnlargedWindow = true;
				var vid = chromeWindow.id;
				chrome.windows.update(vid, largeInboxWindowParams);
			});
		}
	};
	var notificationAction = function(trackingReminderNotification){
		trackingReminderNotification.hide = true;
		afterTrackingActions();
		$scope.showUndoToast($scope.lastAction);
		trackingReminderNotification.trackingReminderNotificationId = trackingReminderNotification.id;
		return trackingReminderNotification;
	};
	$scope.track = function(trackingReminderNotification, modifiedReminderValue, $event, dividerIndex, trackingReminderNotificationIndex){
		if(isGhostClick($event)){ return false; }
		if(modifiedReminderValue === null){ modifiedReminderValue = trackingReminderNotification.defaultValue; }
		setLastAction(modifiedReminderValue, trackingReminderNotification.unitAbbreviatedName);
		var body = notificationAction(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex);
		body.modifiedValue = modifiedReminderValue;
		quantimodoService.trackTrackingReminderNotificationDeferred(body)
			.then(function(){
				if($rootScope.localNotificationsEnabled){ quantimodoService.decrementNotificationBadges(); }
				if($scope.state.numberOfDisplayedNotifications < 2){ $scope.refreshTrackingReminderNotifications(); }
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
	$scope.skip = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
		if(isGhostClick($event)){ return; }
		$scope.lastAction = 'Skipped';
		var params = notificationAction(trackingReminderNotification, $event, dividerIndex,
			trackingReminderNotificationIndex);
		quantimodoService.skipTrackingReminderNotificationDeferred(params)
			.then(function(){
				if($rootScope.localNotificationsEnabled){quantimodoService.decrementNotificationBadges();}
				if($scope.state.numberOfDisplayedNotifications < 2){$scope.refreshTrackingReminderNotifications();}
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
	$scope.snooze = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
		if(isGhostClick($event)){return;}
		$scope.lastAction = 'Snoozed';
		var params = notificationAction(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex);
		quantimodoService.snoozeTrackingReminderNotificationDeferred(params)
			.then(function(){
				if($rootScope.localNotificationsEnabled){quantimodoService.decrementNotificationBadges();}
				if($rootScope.numberOfPendingNotifications < 2){$scope.refreshTrackingReminderNotifications();}
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
	function wordClicked(word){
		alert(word.text + " appears " + word.count + " times and the average " + quantimodoService.getPrimaryOutcomeVariable().name +
			" value when it is written is " + word.average + quantimodoService.getPrimaryOutcomeVariable().unitAbbreviatedName + '.' );
	}
	function createWordCloudFromNotes() {
		$scope.height = window.innerHeight * 0.5;
		$scope.width = window.innerWidth; //element.find('word-cloud')[0].offsetWidth;
		$scope.wordClicked = wordClicked;
		quantimodoService.getNotesDeferred(quantimodoService.getPrimaryOutcomeVariable().name).then(function (response) {
			$scope.words = response;
		});
	}
	var getFilteredTrackingReminderNotificationsFromLocalStorage = function(){
		var trackingReminderNotifications = quantimodoService.getTrackingReminderNotificationsFromLocalStorage($stateParams.variableCategoryName);
		console.debug('Just got ' + trackingReminderNotifications.length + ' trackingReminderNotifications from local storage');
		$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
		if($state.current.name === "app.remindersInboxCompact"){
			$scope.trackingReminderNotifications = trackingReminderNotifications;
		} else {
			$scope.filteredTrackingReminderNotifications = quantimodoService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
			console.debug('Just added ' + trackingReminderNotifications.length + ' to $scope.filteredTrackingReminderNotifications');
			getWeekdayChartAndFavoritesIfNecessary();
		}
		hideInboxLoader();
	};
	var hideInboxLoader = function(){
		$ionicLoading.hide();
		//Stop the ion-refresher from spinning
		$scope.$broadcast('scroll.refreshComplete');
		$scope.loading = false;
	};
	var getFilteredTodayTrackingReminderNotifications = function(){
		quantimodoService.getTodayTrackingReminderNotificationsDeferred($stateParams.variableCategoryName)
			.then(function (trackingReminderNotifications) {
				$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
				$scope.filteredTrackingReminderNotifications = quantimodoService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
				getWeekdayChartAndFavoritesIfNecessary();
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
				hideInboxLoader();
				$scope.loading = false;
			}, function(error){
				getWeekdayChartAndFavoritesIfNecessary();
				console.error(error);
				hideInboxLoader();
				console.error("failed to get reminder notifications!");
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
				$scope.loading = false;
			});
	};
	$scope.$on('getTrackingReminderNotificationsFromLocalStorage', function(){
		console.debug('getTrackingReminderNotificationsFromLocalStorage broadcast received..');
		if(!$stateParams.today) {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	});
	var getTrackingReminderNotifications = function () {
		if($stateParams.today){getFilteredTodayTrackingReminderNotifications();} else {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	};
	var showLoader = function () {
		$scope.loading = true;
		$timeout(function() {if($scope.loading) {$scope.loading = false;}}, 10000);
	};
	$scope.refreshTrackingReminderNotifications = function () {
		showLoader();
		if($stateParams.today){getTrackingReminderNotifications();} else {
			quantimodoService.refreshTrackingReminderNotifications().then(function(){
				getTrackingReminderNotifications();
			}, function (error) {
				console.error('$scope.refreshTrackingReminderNotifications: ' + error);
				hideInboxLoader();
			});
		}
	};
	$scope.editMeasurement = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		$rootScope.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications',
			trackingReminderNotification.id);
		$state.go('app.measurementAdd', {reminderNotification: trackingReminderNotification, fromUrl: window.location.href});
	};
	$scope.editReminderSettingsByNotification = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		$rootScope.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		var trackingReminder = trackingReminderNotification;
		trackingReminder.id = trackingReminderNotification.trackingReminderId;
		$state.go('app.reminderAdd', {reminder: trackingReminder, fromUrl: window.location.href, fromState : $state.current.name});
	};
	// Triggered on a button click, or some other target
	$scope.showActionSheetForNotification = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex) {
		if(isGhostClick($event)){return;}
		enlargeChromePopupIfNecessary();
		$scope.state.trackingReminderNotification = trackingReminderNotification;
		$scope.state.trackingReminder = trackingReminderNotification;
		$scope.state.trackingReminder.id = trackingReminderNotification.trackingReminderId;
		$rootScope.variableObject = trackingReminderNotification;
		$rootScope.variableObject.id = trackingReminderNotification.variableId;
		$rootScope.variableObject.name = trackingReminderNotification.variableName;
		// Show the action sheet
		var hideSheetForNotification = $ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
				quantimodoService.actionSheetButtons.recordMeasurement,
				quantimodoService.actionSheetButtons.charts,
				quantimodoService.actionSheetButtons.history,
				quantimodoService.actionSheetButtons.analysisSettings
			],
			destructiveText: '<i class="icon ion-trash-a"></i>Skip All Notifications',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {console.debug('CANCELLED');},
			buttonClicked: function(index) {
				console.debug('BUTTON CLICKED', index);
				if(index === 0){$scope.editReminderSettingsByNotification($scope.state.trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex);}
				if(index === 1){$state.go('app.measurementAdd', {variableObject: $rootScope.variableObject});}
				if(index === 2){$state.go('app.charts', {variableObject: $rootScope.variableObject});}
				if(index === 3){$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject});}
				if(index === 4){$state.go('app.variableSettings', {variableName: $scope.state.trackingReminderNotification.variableName});}
				return true;
			},
			destructiveButtonClicked: function() {
				console.debug("Skipping all notifications for trackingReminder", $scope.state.trackingReminderNotification);
				var params = {trackingReminderId : $scope.state.trackingReminderNotification.trackingReminderId};
				$scope.showLoader('Skipping all ' + $rootScope.variableObject.name + ' reminder notifications...');
				quantimodoService.skipAllTrackingReminderNotificationsDeferred(params)
					.then(function(){
						hideInboxLoader();
						$scope.refreshTrackingReminderNotifications();
					}, function(error){
						hideInboxLoader();
						if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
						console.error(error);
						$scope.showMaterialAlert('Failed to skip all notifications! ', 'Please let me know by pressing the help button.  Thanks!');
					});
				return true;
			}
		});
		$timeout(function() {hideSheetForNotification();}, 20000);
	};
	$scope.hideHelpCard = function (helpCard, emailType) {
		if(emailType){$scope.sendEmailAfterVerification(emailType);}
		helpCard.hide = true;
		$scope.defaultHelpCards = $scope.defaultHelpCards.filter(function( obj ) {return obj.id !== helpCard.id;});
		quantimodoService.deleteElementOfLocalStorageItemById('defaultHelpCards', helpCard.id);
	};
	function getCorrelations() {
        quantimodoService.getUserCorrelationsDeferred({limit: 10}).then(function (correlationObjects) {$scope.state.correlationObjects = correlationObjects;});
    }
});
