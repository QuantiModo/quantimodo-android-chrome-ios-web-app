angular.module('starter')

	.controller('RemindersInboxCtrl', function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform,
											   $ionicActionSheet, $timeout, quantimodoService,
											   $ionicLoading) {

	    $scope.controller_name = "RemindersInboxCtrl";

		console.debug('Loading ' + $scope.controller_name);
        $rootScope.showFilterBarSearchIcon = false;
	    $scope.state = {
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	reminderDefaultValue : "",
	    	selected1to5Value : false,
	    	allReminders : [
	    	],
	    	trackingReminderNotifications : [
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
		
        $scope.$on('$ionicView.beforeEnter', function(e) {

        	console.debug("RemindersInboxCtrl beforeEnter ");
        	$scope.defaultHelpCards = quantimodoService.setupHelpCards();

        	$scope.loading = true;
            if(!$rootScope.accessTokenInUrl && !$rootScope.user){
                quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.onboarding');
                $state.go('app.login');
            }

            $rootScope.hideBackButton = true;
            $rootScope.hideHomeButton = true;
            setPageTitle();
            getTrackingReminderNotifications();
        });

        $scope.$on('$ionicView.enter', function(e) {

            console.debug("RemindersInboxCtrl enter");

            $rootScope.bloodPressure = {
                systolicValue: null,
                diastolicValue: null,
                displayTotal: "Blood Pressure"
            };

            $rootScope.stateParams = $stateParams;
            //if($rootScope.showUndoButton){
            //$rootScope.showUndoButton = false;
            //}
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

            if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){
                $rootScope.variableCategoryName = $stateParams.variableCategoryName;
            } else {
                $rootScope.variableCategoryName = null;
            }
            var secondsSinceWeLastGotNotifications = quantimodoService.getSecondsSinceWeLastGotNotifications();
            if(!$rootScope.numberOfPendingNotifications || secondsSinceWeLastGotNotifications > 600){
                $scope.refreshTrackingReminderNotifications();
			}

            quantimodoService.getFavoriteTrackingRemindersFromLocalStorage($stateParams.variableCategoryName);

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
                        quantimodoService.skipAllTrackingReminderNotificationsDeferred()
                            .then(function(){
                                if($rootScope.localNotificationsEnabled){
                                    quantimodoService.setNotificationBadge(0);
                                }
                                $scope.refreshTrackingReminderNotifications();
                            }, function(error){
                                if (typeof Bugsnag !== "undefined") {
                                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                                }
                                console.error(error);
                                quantimodoService.showAlert('Failed to skip all notifications! ', 'Please let me know by pressing the help button.  Thanks!');
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
        });

        $scope.$on('$ionicView.afterEnter', function(){
            console.debug("RemindersInboxCtrl afterEnter");
            quantimodoService.syncPrimaryOutcomeVariableMeasurements();
            if ($stateParams.hideNavigationMenu !== true){
                $rootScope.hideNavigationMenu = false;
            }
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
					$scope.state.title = 'Inbox';
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

		$scope.trackByValueField = function(trackingReminderNotification, $event){

			if(isGhostClick($event)){
				return;
			}
            //$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
            trackingReminderNotification.hide = true;
			$rootScope.numberOfPendingNotifications--;
            afterTrackingActions();
			console.debug('modifiedReminderValue is ' + trackingReminderNotification.total);

            trackingReminderNotification.modifiedValue = trackingReminderNotification.total;
			var lastAction = 'Recorded ' + trackingReminderNotification.modifiedValue + ' ' +
				trackingReminderNotification.abbreviatedUnitName;
            $scope.lastAction = lastAction.replace(' /', '/');

			if(!$rootScope.showUndoButton){
				//$rootScope.showUndoButton = true;
                $scope.showUndoToast($scope.lastAction);
			}
			quantimodoService.trackTrackingReminderNotificationDeferred(trackingReminderNotification)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						quantimodoService.decrementNotificationBadges();
					}
					if($scope.state.numberOfDisplayedNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    hideInboxLoader();
				});
		};

		var getWeekdayChartIfNecessary = function () {
			if(!$scope.state.numberOfDisplayedNotifications && !$scope.weekdayChartConfig){
				quantimodoService.getWeekdayChartConfigForPrimaryOutcome($scope.state.primaryOutcomeMeasurements,
					config.appSettings.primaryOutcomeVariableDetails).then(function (chartConfig) {
					$scope.weekdayChartConfig = chartConfig;
				});
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
            getWeekdayChartIfNecessary();
        };

        var enlargeChromePopupIfNecessary = function () {
        	if($rootScope.alreadyEnlargedWindow){
        		return;
			}
            var largeInboxWindowParams = {
                top: screen.height - 800,
                left: screen.width - 455,
                width: 450,
                height: 750
            };
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
			//if(!$rootScope.showUndoButton){
				//$rootScope.showUndoButton = true;
			//}
            $scope.showUndoToast($scope.lastAction);
            trackingReminderNotification.trackingReminderNotificationId = trackingReminderNotification.id;
			return trackingReminderNotification;
		};

		$scope.track = function(trackingReminderNotification, modifiedReminderValue, $event, dividerIndex, trackingReminderNotificationIndex){
			if(isGhostClick($event)){
				return false;
			}

			if(modifiedReminderValue === null){
				modifiedReminderValue = trackingReminderNotification.defaultValue;
			}

            var lastAction = 'Recorded ' + modifiedReminderValue + ' ' + trackingReminderNotification.abbreviatedUnitName;
            $scope.lastAction = lastAction.replace(' /', '/');
			var body = notificationAction(trackingReminderNotification, $event, dividerIndex,
				trackingReminderNotificationIndex);
			body.modifiedValue = modifiedReminderValue;

	    	quantimodoService.trackTrackingReminderNotificationDeferred(body)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						quantimodoService.decrementNotificationBadges();
					}
					if($scope.state.numberOfDisplayedNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    hideInboxLoader();
				});
	    };

	    $scope.skip = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
			if(isGhostClick($event)){
				return;
			}
			$scope.lastAction = 'Skipped';
			var params = notificationAction(trackingReminderNotification, $event, dividerIndex,
				trackingReminderNotificationIndex);
	    	quantimodoService.skipTrackingReminderNotificationDeferred(params)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						quantimodoService.decrementNotificationBadges();
					}
					if($scope.state.numberOfDisplayedNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    hideInboxLoader();
				});
	    };

	    $scope.snooze = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
			if(isGhostClick($event)){
				return;
			}
			$scope.lastAction = 'Snoozed';
			var params = notificationAction(trackingReminderNotification, $event, dividerIndex,
				trackingReminderNotificationIndex);
	    	quantimodoService.snoozeTrackingReminderNotificationDeferred(params)
				.then(function(){
					if($rootScope.localNotificationsEnabled){
						quantimodoService.decrementNotificationBadges();
					}
					if($rootScope.numberOfPendingNotifications < 2){
						$scope.refreshTrackingReminderNotifications();
					}
				}, function(error){
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    hideInboxLoader();
				});
	    };

		$rootScope.undoInboxAction = function(){
			//$rootScope.showUndoButton = false;
			var notificationsSyncQueue = quantimodoService.getLocalStorageItemAsObject('notificationsSyncQueue');
			if(!notificationsSyncQueue){
				return false;
			}
			notificationsSyncQueue[0].hide = false;
			quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderNotifications',
				notificationsSyncQueue[0]);
			quantimodoService.deleteElementsOfLocalStorageItemByProperty('notificationsSyncQueue',
				'trackingReminderNotificationId', notificationsSyncQueue[0].trackingReminderNotificationId);
			getTrackingReminderNotifications();
		};

		var getFilteredTrackingReminderNotificationsFromLocalStorage = function(){
            var trackingReminderNotifications =
                quantimodoService.getTrackingReminderNotificationsFromLocalStorage($stateParams.variableCategoryName);
			$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
			if($state.current.name === "app.remindersInboxCompact"){
				$scope.trackingReminderNotifications = trackingReminderNotifications;
			} else {
				$scope.filteredTrackingReminderNotifications =
					quantimodoService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
				getWeekdayChartIfNecessary();
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
					getWeekdayChartIfNecessary();
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
					hideInboxLoader();
					$scope.loading = false;
				}, function(error){
					getWeekdayChartIfNecessary();
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
				getFilteredTrackingReminderNotificationsFromLocalStorage();
			}
		};

		var showLoader = function () {
			$scope.loading = true;
			$timeout(function() {
				if($scope.loading) {
					$scope.loading = false;
				}
			}, 10000);
		};

		$scope.refreshTrackingReminderNotifications = function () {
			showLoader();
			if($stateParams.today){
				getTrackingReminderNotifications();
			} else {
				quantimodoService.refreshTrackingReminderNotifications().then(function(){
					getTrackingReminderNotifications();
				}, function (error) {
					console.error('$scope.refreshTrackingReminderNotifications: ' + error);
                    hideInboxLoader();
				});
			}
		};

	    $scope.init = function(){

		};

	    $scope.editMeasurement = function(trackingReminderNotification){
            enlargeChromePopupIfNecessary();
            //$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
            trackingReminderNotification.hide = true;
			$rootScope.numberOfPendingNotifications--;
			$scope.state.numberOfDisplayedNotifications--;
			quantimodoService.deleteElementOfLocalStorageItemById('trackingReminderNotifications',
				trackingReminderNotification.id);
			$state.go('app.measurementAdd',
				{
					reminderNotification: trackingReminderNotification,
					fromUrl: window.location.href
				});
	    };

	    $scope.editReminderSettingsByNotification = function(trackingReminderNotification){
            enlargeChromePopupIfNecessary();
	    	//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
            trackingReminderNotification.hide = true;
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

		// Triggered on a button click, or some other target
		$scope.showActionSheetForNotification = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex) {

			if(isGhostClick($event)){
				return;
			}

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
					quantimodoService.skipAllTrackingReminderNotificationsDeferred(params)
						.then(function(){
							hideInboxLoader();
                            $scope.refreshTrackingReminderNotifications();
						}, function(error){
							hideInboxLoader();
							if (typeof Bugsnag !== "undefined") {
								Bugsnag.notify(error, JSON.stringify(error), {}, "error");
							}
							console.error(error);
							quantimodoService.showAlert('Failed to skip all notifications! ', 'Please let me know by pressing the help button.  Thanks!');
						});
					return true;
				}
			});

			console.debug('Setting hideSheet timeout');
			$timeout(function() {
				hideSheetForNotification();
			}, 20000);

		};

        $scope.hideHelpCard = function () {
            var card = $scope.defaultHelpCards[0];
            card.hide = true;
            $scope.defaultHelpCards = $scope.defaultHelpCards.filter(function( obj ) {
                return obj.id !== card.id;
            });
            quantimodoService.deleteElementOfLocalStorageItemById('defaultHelpCards', card.id);
        };
	});
