angular.module('starter')
	
	// Controls the settings page
	.controller('SettingsCtrl', function( $state, $scope, $ionicPopover, $ionicPopup, localStorageService, $rootScope, 
										  notificationService, QuantiModo, reminderService, qmLocationService, 
										  ionicTimePicker, timeService, utilsService, $stateParams, $ionicHistory, bugsnagService) {
		$scope.controller_name = "SettingsCtrl";
		$scope.state = {};
		$scope.showReminderFrequencySelector = config.appSettings.settingsPageOptions.showReminderFrequencySelector;
		$rootScope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
		$rootScope.isAndroid = ionic.Platform.isAndroid();
        $rootScope.isChrome = window.chrome ? true : false;
		if($rootScope.user){
			$scope.state.trackLocation = $rootScope.user.trackLocation;
			console.debug('trackLocation is '+ $scope.state.trackLocation);
		}

		var d = new Date();
		var timeZoneOffsetInMinutes = d.getTimezoneOffset();
		if($rootScope.user && $rootScope.user.timeZoneOffset !== timeZoneOffsetInMinutes ){
			var params = {
				timeZoneOffset: timeZoneOffsetInMinutes
			};
			QuantiModo.updateUserSettingsDeferred(params);
		}

		// populate ratings interval
		localStorageService.getItem('primaryOutcomeRatingFrequencyDescription', function (primaryOutcomeRatingFrequencyDescription) {
			$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription ? primaryOutcomeRatingFrequencyDescription : "daily";
			if($rootScope.isIOS){
				if($scope.primaryOutcomeRatingFrequencyDescription !== 'hour' &&
					$scope.primaryOutcomeRatingFrequencyDescription !== 'day' &&
					$scope.primaryOutcomeRatingFrequencyDescription !== 'never'
				) {
					$scope.primaryOutcomeRatingFrequencyDescription = 'day';
					localStorageService.setItem('primaryOutcomeRatingFrequencyDescription', 'day');
				}
			}
		});
		// load rating popover
		$ionicPopover.fromTemplateUrl('templates/settings/ask-for-a-rating.html', {
			scope: $scope
		}).then(function(popover) {
			$scope.ratingPopover = popover;
		});
		// when interval is updated
		$scope.saveRatingInterval = function(interval){
			//schedule notification
			//TODO we can pass callback function to check the status of scheduling
			$scope.saveInterval(interval);
			localStorageService.setItem('primaryOutcomeRatingFrequencyDescription', interval);
			$scope.primaryOutcomeRatingFrequencyDescription = interval;
			// hide popover
			$scope.ratingPopover.hide();
		};

		$scope.refreshUser = function () {
			QuantiModo.refreshUser();
		};

		$scope.sendSharingInvitation= function() {
			var subjectLine = "I%27d%20like%20to%20share%20my%20data%20with%20you";
			var emailBody = "Hi!%20%20%0A%0AI%27m%20tracking%20my%20health%20and%20happiness%20with%20an%20app%20and%20I%27d%20like%20to%20share%20my%20data%20with%20you.%20%20%0A%0APlease%20generate%20a%20data%20authorization%20URL%20at%20https%3A%2F%2Fapp.quantimo.do%2Fapi%2Fv2%2Fphysicians%20and%20email%20it%20to%20me.%20%0A%0AThanks!%20%3AD";

			if($rootScope.isMobile){
				$scope.sendWithEmailComposer(subjectLine, emailBody);
			} else {
				$scope.sendWithMailTo(subjectLine, emailBody);
			}
		};

		$scope.init = function() {
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			qmLocationService.getLocationVariablesFromLocalStorage();
	    };

		$scope.contactUs = function() {
			$scope.hideLoader();
			if ($rootScope.isChromeApp) {
				window.location = 'mailto:help@quantimo.do';
			}
			else {
				window.location = '#app/feedback';
			}
		};
		
		$scope.postIdea = function() {
			$scope.hideLoader();
			if ($rootScope.isChromeApp) {
				window.location = 'mailto:help@quantimo.do';
			}
			else {
				window.open('http://help.quantimo.do/forums/211661-general', '_blank');
			}
		};

		$scope.combineNotificationChange = function() {
			QuantiModo.updateUserSettingsDeferred({combineNotifications: $rootScope.user.combineNotifications});
			if($rootScope.user.combineNotifications){
				$ionicPopup.alert({
					title: 'Disabled Individual Notifications',
					template: 'You will only get a single generic notification ' +
					'instead of a separate notification for each reminder that you create.  All ' +
					'tracking reminder notifications for specific reminders will still show up in your Reminder Inbox.'
				});
				notificationService.cancelAllNotifications().then(function() {
					console.debug("SettingsCtrl combineNotificationChange: Disabled Multiple Notifications and now " +
						"refreshTrackingRemindersAndScheduleAlarms will schedule a single notification for highest " +
						"frequency reminder");
                    if(!$rootScope.deviceToken){
                        console.warning("Could not find device token for push notifications so scheduling combined local notifications");
                        reminderService.refreshTrackingRemindersAndScheduleAlarms();
                    }
				});

			} else {
				$ionicPopup.alert({
					title: 'Enabled Multiple Notifications',
					template: 'You will get a separate device notification for each reminder that you create.'
				});
				notificationService.cancelAllNotifications().then(function() {
					console.debug("SettingsCtrl combineNotificationChange: Cancelled combined notification and now " +
						"refreshTrackingRemindersAndScheduleAlarms");
					reminderService.refreshTrackingRemindersAndScheduleAlarms();
				});
			}
			
		};

		$scope.sendReminderNotificationEmailsChange = function() {
			QuantiModo.updateUserSettingsDeferred({sendReminderNotificationEmails: $rootScope.user.sendReminderNotificationEmails});
		};

        $scope.sendPredictorEmailsChange = function() {
            QuantiModo.updateUserSettingsDeferred({sendPredictorEmails: $rootScope.user.sendPredictorEmails});
        };

		$scope.openEarliestReminderTimePicker = function() {
			$scope.state.earliestReminderTimePickerConfiguration = {
				callback: function (val) {
					if (typeof (val) === 'undefined') {
						console.debug('Time not selected');
					} else {
						var a = new Date();
						var params = {
							timeZoneOffset: a.getTimezoneOffset()
						};
						var selectedTime = new Date(val * 1000);
						a.setHours(selectedTime.getUTCHours());
						a.setMinutes(selectedTime.getUTCMinutes());
						console.debug('Selected epoch is : ', val, 'and the time is ',
							selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
						var newEarliestReminderTime = moment(a).format('HH:mm:ss');
						if(newEarliestReminderTime > $rootScope.user.latestReminderTime){
							$ionicPopup.alert({
								title: 'Choose Another Time',
								template: 'Earliest reminder time cannot be greater than latest reminder time.  Please change the latest reminder time and try again or select a different earliest reminder time.'
							});
						}
						if(newEarliestReminderTime !== $rootScope.user.earliestReminderTime){
							$rootScope.user.earliestReminderTime = newEarliestReminderTime;
							params.earliestReminderTime = $rootScope.user.earliestReminderTime;
							QuantiModo.updateUserSettingsDeferred(params).then(function(){
								reminderService.refreshTrackingRemindersAndScheduleAlarms();
							});
							$ionicPopup.alert({
								title: 'Earliest Notification Time Updated',
								template: 'You should not receive device notifications before ' + moment(a).format('h:mm A') + '.'
							});
						}
					}
				},
				inputTime: timeService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.earliestReminderTime),
				step: 15,
				closeLabel: 'Cancel'
			};

			ionicTimePicker.openTimePicker($scope.state.earliestReminderTimePickerConfiguration);
		};

		$scope.openLatestReminderTimePicker = function() {
			$scope.state.latestReminderTimePickerConfiguration = {
				callback: function (val) {
					if (typeof (val) === 'undefined') {
						console.debug('Time not selected');
					} else {
						var a = new Date();
						var params = {
							timeZoneOffset: a.getTimezoneOffset()
						};
						var selectedTime = new Date(val * 1000);
						a.setHours(selectedTime.getUTCHours());
						a.setMinutes(selectedTime.getUTCMinutes());
						console.debug('Selected epoch is : ', val, 'and the time is ',
							selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
						var newLatestReminderTime = moment(a).format('HH:mm:ss');
						if(newLatestReminderTime < $rootScope.user.earliestReminderTime){
							$ionicPopup.alert({
								title: 'Choose Another Time',
								template: 'Latest reminder time cannot be less than earliest reminder time.  Please change the earliest reminder time and try again or select a different latest reminder time.'
							});
						}
						if(newLatestReminderTime !== $rootScope.user.latestReminderTime){
							$rootScope.user.latestReminderTime = newLatestReminderTime;
							params.latestReminderTime = $rootScope.user.latestReminderTime;
							QuantiModo.updateUserSettingsDeferred(params).then(function(){
								reminderService.refreshTrackingRemindersAndScheduleAlarms();
							});
							$ionicPopup.alert({
								title: 'Latest Notification Time Updated',
								template: 'You should not receive device notification after ' + moment(a).format('h:mm A') + '.'
							});
						}
					}
				},
				inputTime: timeService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.latestReminderTime),
				step: 15,
				closeLabel: 'Cancel'
			};

			ionicTimePicker.openTimePicker($scope.state.latestReminderTimePickerConfiguration);
		};

		$scope.trackLocationChange = function() {
			console.debug('trackLocation', $scope.state.trackLocation);
			$rootScope.user.trackLocation = $scope.state.trackLocation;
			QuantiModo.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
			if($scope.state.trackLocation){
				$ionicPopup.alert({
					title: 'Location Tracking Enabled',
					template: 'Location tracking is an experimental feature.  Your location is automatically logged ' +
					'when you open the app. Your location is not logged when the ' +
					'app is closed so you should create reminder notifications and open the app regularly to ' +
					'keep your location up to date.'
				});
				qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
			} else {
				console.debug("Do not track location");
			}

		};

        $scope.logout = function() {

			var completelyResetAppState = function(){
				// Getting token so we can post as the new user if they log in again
				$rootScope.deviceTokenToSync = localStorageService.getItemSync('deviceTokenOnServer');
				QuantiModo.deleteDeviceToken($rootScope.deviceTokenToSync);
				localStorageService.clear();
				notificationService.cancelAllNotifications();
				$ionicHistory.clearHistory();
				$ionicHistory.clearCache();
				if (utilsService.getClientId() === 'oAuthDisabled' || $rootScope.isChromeExtension) {
					window.open(utilsService.getURL("api/v2/auth/logout"),'_blank');
				}
				localStorageService.setItem('deviceTokenToSync', $rootScope.deviceTokenToSync);
				$state.go(config.appSettings.welcomeState, {}, {
					reload: true
				});
			};

			var afterLogoutDoNotDeleteMeasurements = function(){
				// Getting token so we can post as the new user if they log in again
				$rootScope.deviceTokenToSync = localStorageService.getItemSync('deviceTokenOnServer');
				QuantiModo.deleteDeviceToken($rootScope.deviceTokenToSync);
				QuantiModo.clearTokensFromLocalStorage();
				if (utilsService.getClientId() === 'oAuthDisabled' || $rootScope.isChromeExtension) {
					window.open(utilsService.getURL("api/v2/auth/logout"),'_blank');
				}
				localStorageService.setItem('isWelcomed', false);
				localStorageService.setItem('deviceTokenToSync', $rootScope.deviceTokenToSync);
				//hard reload
				$state.go(config.appSettings.welcomeState, {}, {
					reload: true
				});
			};

            $scope.showDataClearPopup = function(){
                $ionicPopup.show({
                    title:'Clear local storage?',
                    subTitle: 'Do you want do delete all data from local storage?',
                    scope: $scope,
                    buttons:[
                        {
                            text: 'No',
                            type: 'button-assertive',
                            onTap : afterLogoutDoNotDeleteMeasurements
                        },
                        {
                            text: 'Yes',
                            type: 'button-positive',
                            onTap: completelyResetAppState
                        }
                    ]

                });
            };

			console.debug('Logging out...');
			$scope.hideLoader();
			$rootScope.user = null;
			$scope.showDataClearPopup();
        };

	    // Convert all data Array to a CSV object
	    var convertToCSV = function(objArray) {
	        var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
	        var str = '';
	        for (var i = 0; i < array.length; i++) {
	            var line = '';
	            for (var index in array[i]) {
	                if (line !== '') {
						line += ',';
					}
	                line += array[i][index];
	            }
	            str += line + '\r\n';
	        }
	        return str;
	    };

		// When Export is tapped
		$scope.exportCsv = function() {
			$ionicPopup.alert({
				title: 'Export Request Sent!',
				template: 'Your data will be emailed to you.  Enjoy your life! So do we!'
			});

			QuantiModo.postMeasurementsCsvExport(function(response){
				if(!response.success) {
					bugsnagService.reportError("Could not export measurements. Response: " + JSON.stringify(response));
				}
			}, function(error){
				bugsnagService.reportError("Could not export measurements. Response: " + JSON.stringify(error));
			});
		};

		// When Export is tapped
		$scope.exportPdf = function() {
			$ionicPopup.alert({
				title: 'Export Request Sent!',
				template: 'Your data will be emailed to you.  Enjoy your life! So do we!'
			});

			QuantiModo.postMeasurementsPdfExport(function(response){
				if(!response.success) {
					bugsnagService.reportError("Could not export measurements. Response: " + JSON.stringify(response));
				}
			}, function(error){
				bugsnagService.reportError("Could not export measurements. Response: " + JSON.stringify(error));
			});
		};

		// When Export is tapped
		$scope.exportXls = function(){
			$ionicPopup.alert({
				title: 'Export Request Sent!',
				template: 'Your data will be emailed to you.  Enjoy your life! So do we!'
			});
			
			QuantiModo.postMeasurementsXlsExport(function(response){
				if(!response.success) {
					bugsnagService.reportError("Could not export measurements.");
				}
			}, function(error){
				bugsnagService.reportError("Could not export measurements. Response: " + JSON.stringify(error));
			});
		};

		// when view is changed
		$scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
			$scope.init();
            if($rootScope.user){
                $scope.state.trackLocation = $rootScope.user.trackLocation;
            }
		});

	});