angular.module('starter').controller('RemindersInboxCtrl', function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform, $ionicActionSheet, $timeout, quantimodoService, $ionicLoading, $mdToast) {
    if(!$rootScope.appSettings){$rootScope.appSettings = window.config.appSettings;}
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
        if(quantimodoService.getUrlParameter('variableCategoryName')){$stateParams.variableCategoryName = quantimodoService.getUrlParameter('variableCategoryName');}
		$scope.loading = true;
        if(quantimodoService.goToLoginIfNecessary()){ return; }
		$rootScope.hideBackButton = true;
		$rootScope.hideHomeButton = true;
        if ($stateParams.hideNavigationMenu !== true){$rootScope.hideNavigationMenu = false;}
		setPageTitle();
	});
	$scope.$on('$ionicView.enter', function(e) {
        console.debug("RemindersInboxCtrl enter");
        $scope.defaultHelpCards = quantimodoService.setupHelpCards();
        getTrackingReminderNotifications();
        getFavorites();
		$rootScope.bloodPressure = {systolicValue: null, diastolicValue: null, displayTotal: "Blood Pressure"};
		$scope.stateParams = $stateParams;
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
		if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){$scope.variableCategoryName = $stateParams.variableCategoryName;
		} else {$scope.variableCategoryName = null;}
		$rootScope.showActionSheetMenu = function() {
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
                    quantimodoService.actionSheetButtons.history,
					quantimodoService.actionSheetButtons.addReminder,
                    quantimodoService.actionSheetButtons.recordMeasurement,
            		quantimodoService.actionSheetButtons.charts,
                    quantimodoService.actionSheetButtons.settings,
                    quantimodoService.actionSheetButtons.help
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Clear All Notifications',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {console.debug('CANCELLED');},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
                    if(index === 0){$state.go('app.historyAll', {variableCategoryName: $stateParams.variableCategoryName});}
                    if(index === 1){$state.go('app.reminderSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 2){$state.go('app.measurementAddSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 3){$state.go('app.chartSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 4){$state.go('app.settings');}
                    if(index === 5){$state.go('app.help');}
					return true;
				},
				destructiveButtonClicked: function() {
					$scope.showSyncDisplayText('Skipping all reminder notifications...');
					quantimodoService.skipAllTrackingReminderNotificationsDeferred()
						.then(function(){
                            $scope.hideSyncDisplayText();
							if($rootScope.localNotificationsEnabled){quantimodoService.setNotificationBadge(0);}
							$scope.refreshTrackingReminderNotifications();
						}, function(error){
                            $scope.hideSyncDisplayText();
							if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
							console.error(error);
							quantimodoService.showMaterialAlert('Failed to skip! ', 'Please let me know by pressing the help button.  Thanks!');
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
		if($event && $scope.state.lastButtonPressTimeStamp > $event.timeStamp - 3000 && $scope.state.lastClientX === $event.clientX && $scope.state.lastClientY === $event.clientY) {
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
	function refreshIfRunningOutOfNotifications() {if($scope.state.numberOfDisplayedNotifications < 2){$scope.refreshTrackingReminderNotifications();}}
	$scope.trackByValueField = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){return;}
        if(!quantimodoService.valueIsValid(trackingReminderNotification, trackingReminderNotification.modifiedValue)){return false;}
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
                refreshIfRunningOutOfNotifications();
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
	function getWeekdayCharts() {
        if(!$scope.weekdayChartConfig){
            quantimodoService.syncPrimaryOutcomeVariableMeasurements();
            quantimodoService.getWeekdayChartConfigForPrimaryOutcome($scope.state.primaryOutcomeMeasurements, quantimodoService.getPrimaryOutcomeVariable()).then(function (chartConfig) {$scope.weekdayChartConfig = chartConfig;});
        }
    }
	function getFavorites() {
		if(!$scope.favoritesArray){
            quantimodoService.getFavoriteTrackingRemindersFromLocalStorage($stateParams.variableCategoryName)
				.then(function(favorites){
            		$scope.favoritesArray = favorites;
				});
		}
    }
	var getFallbackInboxContent = function () {
		if(!$scope.state.numberOfDisplayedNotifications){
			getWeekdayCharts();
            getDiscoveries();
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
		getFallbackInboxContent();
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
	$scope.track = function(trackingReminderNotification, modifiedReminderValue, $event, trackAll){
		if(isGhostClick($event)){ return false; }
		if(modifiedReminderValue === null){ modifiedReminderValue = trackingReminderNotification.defaultValue; }
		setLastAction(modifiedReminderValue, trackingReminderNotification.unitAbbreviatedName);
		var body = notificationAction(trackingReminderNotification);
		body.modifiedValue = modifiedReminderValue;
		quantimodoService.trackTrackingReminderNotificationDeferred(body, trackAll)
			.then(function(){
				if($rootScope.localNotificationsEnabled){ quantimodoService.decrementNotificationBadges(); }
				refreshIfRunningOutOfNotifications();
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
    function trackAll(trackingReminderNotification, modifiedReminderValue){
        quantimodoService.deleteElementsOfLocalStorageItemByProperty('trackingReminderNotifications', 'variableName', trackingReminderNotification.variableName);
		$scope.track(trackingReminderNotification, modifiedReminderValue, null, true);
        getTrackingReminderNotifications();
    }
	$scope.skip = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){ return; }
		$scope.lastAction = 'Skipped';
		var params = notificationAction(trackingReminderNotification);
		quantimodoService.skipTrackingReminderNotificationDeferred(params)
			.then(function(){
				if($rootScope.localNotificationsEnabled){quantimodoService.decrementNotificationBadges();}
                refreshIfRunningOutOfNotifications();
			}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				hideInboxLoader();
			});
	};
	$scope.snooze = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){return;}
		$scope.lastAction = 'Snoozed';
		var params = notificationAction(trackingReminderNotification);
		quantimodoService.snoozeTrackingReminderNotificationDeferred(params)
			.then(function(){
				if($rootScope.localNotificationsEnabled){quantimodoService.decrementNotificationBadges();}
                refreshIfRunningOutOfNotifications();
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
		for (var i = 0; i < trackingReminderNotifications.length; i++){
			trackingReminderNotifications[i].showZeroButton = shouldWeShowZeroButton(trackingReminderNotifications[i]);
		}
		//console.debug('Just got ' + trackingReminderNotifications.length + ' trackingReminderNotifications from local storage');
		$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
		if($scope.state.numberOfDisplayedNotifications){hideInboxLoader();}
		if($state.current.name === "app.remindersInboxCompact"){
			$scope.trackingReminderNotifications = trackingReminderNotifications;
		} else {
			$scope.filteredTrackingReminderNotifications = quantimodoService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
			//console.debug('Just added ' + trackingReminderNotifications.length + ' to $scope.filteredTrackingReminderNotifications');
			getFallbackInboxContent();
		}
	};
	var hideInboxLoader = function(){
        quantimodoService.hideLoader();
		//Stop the ion-refresher from spinning
		$scope.$broadcast('scroll.refreshComplete');
		$scope.loading = false;
	};
	var getFilteredTodayTrackingReminderNotifications = function(){
		quantimodoService.getTodayTrackingReminderNotificationsDeferred($stateParams.variableCategoryName)
			.then(function (trackingReminderNotifications) {
				$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
				$scope.filteredTrackingReminderNotifications = quantimodoService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
				getFallbackInboxContent();
				hideInboxLoader();
			}, function(error){
				getFallbackInboxContent();
				console.error(error);
				hideInboxLoader();
				console.error("failed to get reminder notifications!");
			});
	};
	$scope.$on('getTrackingReminderNotificationsFromLocalStorage', function(){
		console.debug('getTrackingReminderNotificationsFromLocalStorage broadcast received..');
		if(!$stateParams.today) {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	});
	var getTrackingReminderNotifications = function () {
		if($stateParams.today){getFilteredTodayTrackingReminderNotifications();} else {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	};
	function shouldWeShowZeroButton(trackingReminderNotification){
		return trackingReminderNotification.inputType === 'defaultValue' || (trackingReminderNotification.inputType === 'value' && trackingReminderNotification.defaultValue !== null);
	}
	var showLoader = function () {
		$scope.loading = true;
		$timeout(function() {if($scope.loading) {$scope.loading = false;}}, 10000);
	};
	$scope.refreshTrackingReminderNotifications = function () {
		showLoader();
		quantimodoService.refreshTrackingReminderNotifications().then(function(){
            hideInboxLoader();
			getTrackingReminderNotifications();
		}, function (error) {
			console.error('$scope.refreshTrackingReminderNotifications: ' + error);
			hideInboxLoader();
		});
	};
	$scope.editMeasurement = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		$rootScope.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications', trackingReminderNotification.id);
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
		var buttons = [
            { text: 'Actions for ' +  trackingReminderNotification.variableName},
            { text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
            quantimodoService.actionSheetButtons.charts,
            quantimodoService.actionSheetButtons.history,
            quantimodoService.actionSheetButtons.analysisSettings,
            { text: '<i class="icon ion-android-done-all"></i>Record ' + trackingReminderNotification.lastValueInUserVariableDefaultUnit + ' for all '}
        ];
		if(!trackingReminderNotification.secondToLastValueInUserVariableDefaultUnit && trackingReminderNotification.unitCategoryName !== "Rating"){
            trackingReminderNotification.secondToLastValueInUserVariableDefaultUnit = 0;
		}
		if(trackingReminderNotification.secondToLastValueInUserVariableDefaultUnit !== null){
            buttons[6] = { text: '<i class="icon ion-android-done-all"></i>Record ' + trackingReminderNotification.secondToLastValueInUserVariableDefaultUnit + ' for all'};
		}
		if(trackingReminderNotification.inputType.toLowerCase() === 'yesorno'){
            trackingReminderNotification.lastValueInUserVariableDefaultUnit = 1;
			buttons[5] = { text: '<i class="icon ion-android-done-all"></i>Record YES for all'};
            trackingReminderNotification.secondToLastValueInUserVariableDefaultUnit = 0;
            buttons[6] = { text: '<i class="icon ion-android-done-all"></i>Record NO for all'};
		}
		var hideSheetForNotification = $ionicActionSheet.show({
			buttons: buttons,
			destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {console.debug('CANCELLED');},
			buttonClicked: function(index) {
				console.debug('BUTTON CLICKED', index);
                if(index === 0){console.debug("clicked variable name");}
				if(index === 1){$scope.editReminderSettingsByNotification($scope.state.trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex);}
				if(index === 2){$state.go('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 3){$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 4){$state.go('app.variableSettings', {variableName: $scope.state.trackingReminderNotification.variableName});}
                if(index === 5){trackAll(trackingReminderNotification, trackingReminderNotification.lastValueInUserVariableDefaultUnit);}
                if(index === 6){trackAll(trackingReminderNotification, trackingReminderNotification.secondToLastValueInUserVariableDefaultUnit);}
				return true;
			},
			destructiveButtonClicked: function() {
				console.debug("Skipping all notifications for trackingReminder", $scope.state.trackingReminderNotification);
				var params = {trackingReminderId : $scope.state.trackingReminderNotification.trackingReminderId};
				$scope.showSyncDisplayText('Skipping all ' + $rootScope.variableObject.name + ' reminder notifications...');
				quantimodoService.skipAllTrackingReminderNotificationsDeferred(params)
					.then(function(){
						$scope.hideSyncDisplayText();
						hideInboxLoader();
						$scope.refreshTrackingReminderNotifications();
					}, function(error){
                        $scope.hideSyncDisplayText();
						hideInboxLoader();
						if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
						console.error(error);
						quantimodoService.showMaterialAlert('Failed to skip! ', 'Please let me know by pressing the help button.  Thanks!');
					});
				return true;
			}
		});
		//$timeout(function() {hideSheetForNotification();}, 20000);
	};
	$scope.hideHelpCard = function (helpCard, emailType) {
		if(emailType){$scope.sendEmailAfterVerification(emailType);}
		helpCard.hide = true;
		$scope.defaultHelpCards = $scope.defaultHelpCards.filter(function( obj ) {return obj.id !== helpCard.id;});
		quantimodoService.deleteElementOfLocalStorageItemById('defaultHelpCards', helpCard.id);
	};
	function getDiscoveries() {
		if(!$scope.state.correlationObjects){
            quantimodoService.getCorrelationsDeferred({limit: 10, fallbackToAggregateCorrelations: true})
				.then(function (data) {
					$scope.state.correlationsExplanation = data.explanation;
					$scope.state.correlationObjects = data.correlations;
				});
		}
    }
    var undoToastPosition = angular.extend({},{ bottom: true, top: false, left: true, right: false });
    var getUndoToastPosition = function() {return Object.keys(undoToastPosition).filter(function(pos) { return undoToastPosition[pos]; }).join(' ');};
    var undoInboxAction = function(){
        var notificationsSyncQueue = quantimodoService.getLocalStorageItemAsObject('notificationsSyncQueue');
        if(!notificationsSyncQueue){ return false; }
        notificationsSyncQueue[0].hide = false;
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderNotifications', notificationsSyncQueue[0]);
        quantimodoService.deleteElementsOfLocalStorageItemByProperty('notificationsSyncQueue', 'trackingReminderNotificationId', notificationsSyncQueue[0].trackingReminderNotificationId);
        getTrackingReminderNotifications();
    };
    $scope.showUndoToast = function(lastAction) {
        var toast = $mdToast.simple()
            .textContent(lastAction)
            .action('UNDO')
            .highlightAction(true)
            .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
            .hideDelay(10000)
            .position(getUndoToastPosition());
        $mdToast.show(toast).then(function(response) {  if ( response === 'ok' ) { undoInboxAction(); } });
    };
});
