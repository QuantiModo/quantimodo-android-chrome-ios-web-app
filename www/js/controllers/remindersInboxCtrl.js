angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform,
											   $ionicActionSheet, $timeout, QuantiModo, reminderService, utilsService,
											   notificationService, localStorageService, $ionicLoading, chartService) {

	    $scope.controller_name = "RemindersInboxCtrl";

		console.debug('Loading ' + $scope.controller_name);
		
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
			loading : true,
			lastButtonPressTimeStamp : 0,
			lastClientX : 0,
			lastClientY : 0,
			numberOfDisplayedNotifications: 0,
			favoritesTitle: "Your Favorites"
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


		var setPageTitle = function(){
			if(typeof(config.appSettings.remindersInbox.title) !== 'undefined'){
				//$scope.state.title = config.appSettings.remindersInbox.title;
			}

			if($stateParams.today) {
				if($stateParams.variableCategoryName === 'Treatments') {
					$scope.state.title = "Today's Scheduled Meds";
					$scope.state.favoritesTitle = "As-Needed Meds";
				} else if ($stateParams.variableCategoryName) {
					$scope.state.title = "Today's Scheduled " + $stateParams.variableCategoryName;
				} else {
					$scope.state.title = "Today's Reminder Notifications";
				}
			} else {
				if($stateParams.variableCategoryName === 'Treatments') {
					$scope.state.title = 'Overdue Meds';
					$scope.state.favoritesTitle = "As-Needed Meds";
				} else if ($stateParams.variableCategoryName) {
					$scope.state.title = $filter('wordAliases')($stateParams.variableCategoryName) + " " + $filter('wordAliases')("Reminder Inbox");
				} else {
					$scope.state.title = 'Reminder Inbox';
				}
			}
		};

		var isGhostClick = function ($event) {

			if(!$rootScope.isMobile){
				return false;
			}

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

		$scope.trackByValueField = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){

			if(isGhostClick($event)){
				return;
			}
			$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
			$rootScope.numberOfPendingNotifications--;
			$scope.state.numberOfDisplayedNotifications--;
			getWeekdayChartIfNecessary();
			console.debug('modifiedReminderValue is ' + $scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].total);

			var value = $scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].total;
			$scope.lastAction = 'Record ' + value + trackingReminderNotification.abbreviatedUnitName;
			var body = {
				trackingReminderNotification: trackingReminderNotification,
				modifiedValue: value
			};
			if(!$rootScope.showUndoButton){
				$rootScope.showUndoButton = true;
			}
			reminderService.trackReminderNotification(body)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						notificationService.decrementNotificationBadges();
					}
					if($scope.state.numberOfDisplayedNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				});
		};

		var getWeekdayChartIfNecessary = function () {
			if(!$state.numberOfDisplayedNotifications && !$scope.weekdayChartConfig){
				chartService.getWeekdayChartConfigForPrimaryOutcome($scope.state.primaryOutcomeMeasurements,
					config.appSettings.primaryOutcomeVariableDetails).then(function (chartConfig) {
					$scope.weekdayChartConfig = chartConfig;
				});
			}
		};


		var notificationAction = function(trackingReminderNotification, $event, dividerIndex,
										  trackingReminderNotificationIndex){
			// Removing instead of hiding reminder notifications seems to cause weird dismissal problems
			//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications.splice(trackingReminderNotificationIndex, 1);
			$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
			$rootScope.numberOfPendingNotifications--;
			$scope.state.numberOfDisplayedNotifications--;
			getWeekdayChartIfNecessary();
			if(!$rootScope.showUndoButton){
				$rootScope.showUndoButton = true;
			}
			return {
				trackingReminderNotification: trackingReminderNotification,
				trackingReminderNotificationId: trackingReminderNotification.id
			};
		};

		$scope.track = function(trackingReminderNotification, modifiedReminderValue, $event, dividerIndex, trackingReminderNotificationIndex){
			if(isGhostClick($event)){
				return false;
			}

			if(modifiedReminderValue === null){
				modifiedReminderValue = trackingReminderNotification.defaultValue;
			}

			var body = notificationAction(trackingReminderNotification, $event, dividerIndex,
				trackingReminderNotificationIndex);
			body.modifiedValue = modifiedReminderValue;
			$scope.lastAction = 'Record ' + modifiedReminderValue + trackingReminderNotification.abbreviatedUnitName;
	    	reminderService.trackReminderNotification(body)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						notificationService.decrementNotificationBadges();
					}
					if($scope.state.numberOfDisplayedNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				});
	    };

	    $scope.skip = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
			if(isGhostClick($event)){
				return;
			}
			$scope.lastAction = 'Skip';
			var params = notificationAction(trackingReminderNotification, $event, dividerIndex,
				trackingReminderNotificationIndex);
	    	reminderService.skipReminderNotification(params)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						notificationService.decrementNotificationBadges();
					}
					if($scope.state.numberOfDisplayedNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				});
	    };

	    $scope.snooze = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
			if(isGhostClick($event)){
				return;
			}
			$scope.lastAction = 'Snooze';
			var params = notificationAction(trackingReminderNotification, $event, dividerIndex,
				trackingReminderNotificationIndex);
	    	reminderService.snoozeReminderNotification(params)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						notificationService.decrementNotificationBadges();
					}
					if($rootScope.numberOfPendingNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				});
	    };

		$scope.undo = function(){
			$rootScope.showUndoButton = false;
			var notificationsSyncQueue = localStorageService.getItemAsObject('notificationsSyncQueue');
			if(!notificationsSyncQueue){
				return false;
			}
			notificationsSyncQueue[0].trackingReminderNotification.hide = false;
			localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminderNotifications',
				notificationsSyncQueue[0].trackingReminderNotification);
			localStorageService.deleteElementOfItemByProperty('notificationsSyncQueue',
				'trackingReminderNotificationId', notificationsSyncQueue[0].trackingReminderNotificationId);
			getTrackingReminderNotifications();
		};

		var getFilteredTrackingReminderNotifications = function(){
			reminderService.getTrackingReminderNotifications($stateParams.variableCategoryName)
				.then(function (trackingReminderNotifications) {
					$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
					$scope.filteredTrackingReminderNotifications =
						reminderService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
					getWeekdayChartIfNecessary();
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
					$scope.hideLoader();
					$scope.state.loading = false;
				}, function(){
					getWeekdayChartIfNecessary();
					$scope.hideLoader();
					console.error("failed to get reminder notifications!");
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
					$scope.state.loading = false;
				});
		};

		var getFilteredTrackingReminderNotificationsFromLocalStorage = function(){
			var trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
				'trackingReminderNotifications', 'variableCategoryName', $stateParams.variableCategoryName);
			$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
			$scope.filteredTrackingReminderNotifications =
				reminderService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
			//Stop the ion-refresher from spinning
			$scope.$broadcast('scroll.refreshComplete');
			$scope.hideLoader();
			$scope.state.loading = false;
		};

		$scope.hideLoader = function(){
			$ionicLoading.hide();
		};

		var getFilteredTodayTrackingReminderNotifications = function(){
			reminderService.getTodayTrackingReminderNotifications($stateParams.variableCategoryName)
				.then(function (trackingReminderNotifications) {
					$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
					$scope.filteredTrackingReminderNotifications = reminderService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
					getWeekdayChartIfNecessary();
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
					$scope.hideLoader();
					$scope.state.loading = false;
				}, function(error){
					getWeekdayChartIfNecessary();
					console.error(error);
					$scope.hideLoader();
					console.error("failed to get reminder notifications!");
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
					$scope.state.loading = false;
				});
		};

		$scope.$on('getTrackingReminderNotificationsFromLocalStorage', function(){
			console.debug('getTrackingReminderNotificationsFromLocalStorage broadcast received..');
			if(!$stateParams.today) {
				getFilteredTrackingReminderNotificationsFromLocalStorage();
			}
		});

	    var getTrackingReminderNotifications = function () {
			if($stateParams.today){
				//$scope.showLoader("Getting today's reminder notifications...");
				getFilteredTodayTrackingReminderNotifications();
			} else {
				//$scope.showLoader("Getting reminder notifications...");
				getFilteredTrackingReminderNotifications();

			}
		};

		var showLoader = function () {
			$scope.state.loading = true;
			$timeout(function() {
				if($scope.state.loading) {
					$scope.state.loading = false;
				}
			}, 10000);
		};

		$scope.refreshTrackingReminderNotifications = function () {
			showLoader();
			if($stateParams.today){
				getTrackingReminderNotifications();
			} else {
				reminderService.refreshTrackingReminderNotifications().then(function(){
					getTrackingReminderNotifications();
				}, function (error) {
					console.error('$scope.refreshTrackingReminderNotifications: ' + error);
				});
			}
		};

	    $scope.init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if($rootScope.showUndoButton){
				$rootScope.showUndoButton = false;
			}
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

			if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){
				$rootScope.variableCategoryName = $stateParams.variableCategoryName;
			} else {
				$rootScope.variableCategoryName = null;
			}
			showLoader();
			QuantiModo.getAccessTokenFromUrlParameter();
			$rootScope.hideNavigationMenuIfSetInUrlParameter();
			$scope.refreshTrackingReminderNotifications();
			//getTrackingReminderNotifications();

			if($rootScope.localNotificationsEnabled){
				console.debug("reminderInbox init: calling refreshTrackingRemindersAndScheduleAlarms");
				reminderService.refreshTrackingRemindersAndScheduleAlarms();
			}

			QuantiModo.getFavoriteTrackingRemindersFromLocalStorage($stateParams.variableCategoryName);

			QuantiModo.updateUserTimeZoneIfNecessary();

			notificationService.shouldWeUseIonicLocalNotifications();

			// Triggered on a button click, or some other target
			$rootScope.showActionSheetMenu = function() {
				// Show the action sheet
				var hideSheet = $ionicActionSheet.show({
					buttons: [

					],
					destructiveText: '<i class="icon ion-trash-a"></i>Clear All Notifications',
					cancelText: '<i class="icon ion-ios-close"></i>Cancel',
					cancel: function() {
						console.debug('CANCELLED');
					},
					buttonClicked: function(index) {
						console.debug('BUTTON CLICKED', index);
						if(index === 0){

						}
						return true;
					},
					destructiveButtonClicked: function() {
						$scope.showLoader('Skipping all reminder notifications...');
						reminderService.skipAllReminderNotifications()
							.then(function(){
								if($rootScope.localNotificationsEnabled){
									notificationService.setNotificationBadge(0);
								}
								$scope.init();
							}, function(error){
								if (typeof Bugsnag !== "undefined") {
									Bugsnag.notify(error, JSON.stringify(error), {}, "error");
								}
								console.error(error);
								utilsService.showAlert('Failed to skip all notifications, Try again!', 'assertive');
							});
						return true;
					}
				});

				console.debug('Setting hideSheet timeout');
				$timeout(function() {
					hideSheet();
				}, 20000);

			};

			if(navigator && navigator.splashscreen) {
				console.debug('ReminderInbox: Hiding splash screen because app is ready');
				navigator.splashscreen.hide();
			}


		};

	    $scope.editMeasurement = function(trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex){
			$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
			$rootScope.numberOfPendingNotifications--;
			$scope.state.numberOfDisplayedNotifications--;
			localStorageService.deleteElementOfItemById('trackingReminderNotifications',
				trackingReminderNotification.id);
			$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
			$state.go('app.measurementAdd',
				{
					reminderNotification: trackingReminderNotification,
					fromUrl: window.location.href
				});
	    };

	    $scope.editReminderSettingsByNotification = function(trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex){
			$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
			$rootScope.numberOfPendingNotifications--;
			$scope.state.numberOfDisplayedNotifications--;
			var trackingReminder = trackingReminderNotification;
			trackingReminder.id = trackingReminderNotification.trackingReminderId;
	    	$state.go('app.reminderAdd',
				{
					reminder: trackingReminder,
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
		
    	$scope.$on('$ionicView.enter', function(e) { console.debug("beforeEnter state " + $state.current.name);
			$scope.hideLoader();
    		$scope.init();
    	});

		$scope.$on('$ionicView.beforeEnter', function(e) { console.debug("beforeEnter state " + $state.current.name);
			setPageTitle();
			$rootScope.hideAddTreatmentRemindersCard = localStorageService.getItemSync('hideAddTreatmentRemindersCard');
			$rootScope.hideAddFoodRemindersCard = localStorageService.getItemSync('hideAddFoodRemindersCard');
			$rootScope.hideAddSymptomRemindersCard = localStorageService.getItemSync('hideAddSymptomRemindersCard');
			$rootScope.hideAddEmotionRemindersCard = localStorageService.getItemSync('hideAddEmotionRemindersCard');
			$rootScope.hideHistoryPageInstructionsCard = localStorageService.getItemSync('hideHistoryPageInstructionsCard');
			$rootScope.hideImportDataCard = localStorageService.getItemSync('hideImportDataCard');
			$rootScope.hideRecordMeasurementInfoCard = localStorageService.getItemSync('hideRecordMeasurementInfoCard');
			$rootScope.hideNotificationSettingsInfoCard = localStorageService.getItemSync('hideNotificationSettingsInfoCard');
			$rootScope.hideLocationTrackingInfoCard = localStorageService.getItemSync('hideLocationTrackingInfoCard');
			$rootScope.hideChromeExtensionInfoCard = localStorageService.getItemSync('hideChromeExtensionInfoCard');
			getTrackingReminderNotifications();
		});

		// Triggered on a button click, or some other target
		$scope.showActionSheetForNotification = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex) {

			if(isGhostClick($event)){
				return;
			}


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
					{ text: '<i class="icon ion-ios-star"></i>Add ' + ' to Favorites' },
					{ text: '<i class="icon ion-edit"></i>Record ' + ' Measurement' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'}
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Skip All Notifications',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {
					console.debug('CANCELLED');
				},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
					if(index === 0){
						$scope.editReminderSettingsByNotification($scope.state.trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex);
					}
					if(index === 1){
						$scope.addToFavoritesUsingVariableObject($rootScope.variableObject);
					}
					if(index === 2){
						$scope.goToAddMeasurementForVariableObject($rootScope.variableObject);
					}
					if(index === 3){
						$scope.goToChartsPageForVariableObject($rootScope.variableObject);
					}
					if(index === 4){
						$scope.goToHistoryForVariableObject($rootScope.variableObject);
					}
					if (index === 5) {
						$state.go('app.variableSettings',
							{variableName: $scope.state.trackingReminderNotification.variableName});
					}

					return true;
				},
				destructiveButtonClicked: function() {
					console.debug("Skipping all notifications for trackingReminder", $scope.state.trackingReminderNotification);
					var params = {
						trackingReminderId : $scope.state.trackingReminderNotification.trackingReminderId
					};
					$scope.showLoader('Skipping all ' + $rootScope.variableObject.name + ' reminder notifications...');
					reminderService.skipAllReminderNotifications(params)
						.then(function(){
							$scope.hideLoader();
							$scope.init();
						}, function(error){
							$scope.hideLoader();
							if (typeof Bugsnag !== "undefined") {
								Bugsnag.notify(error, JSON.stringify(error), {}, "error");
							}
							console.error(error);
							utilsService.showAlert('Failed to skip all notifications for , Try again!', 'assertive');
						});
					return true;
				}
			});

			console.debug('Setting hideSheet timeout');
			$timeout(function() {
				hideSheetForNotification();
			}, 20000);

		};


	});
