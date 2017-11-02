angular.module('starter').controller('SettingsCtrl', ["$state", "$scope", "$ionicPopover", "$ionicPopup", "$rootScope", "$http", "qmService", "qmLogService", "ionicTimePicker", "$stateParams", "$ionicHistory", "$ionicLoading", "$ionicPlatform", function( $state, $scope, $ionicPopover, $ionicPopup, $rootScope, $http,
										  qmService, qmLogService, ionicTimePicker, $stateParams, $ionicHistory, $ionicLoading,
										  //$ionicDeploy,
										  $ionicPlatform) {
	$scope.controller_name = "SettingsCtrl";
	$scope.state = {};
	$scope.userEmail = urlHelper.getParam('userEmail');
	$rootScope.showFilterBarSearchIcon = false;
	$scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug(null, 'beforeEnter state ' + $state.current.name, null);
        $scope.drawOverAppsEnabled = qmNotifications.drawOverAppsEnabled();
		$rootScope.hideNavigationMenu = false;
		if(urlHelper.getParam('userEmail')){
			$scope.state.loading = true;
			qmService.showBlackRingLoader();
			qmService.refreshUserEmailPreferencesDeferred({userEmail: urlHelper.getParam('userEmail')}, function(user){
				$scope.user = user;
				$scope.state.loading = false;
				qmService.hideLoader();
			}, function(error){
				qmLogService.error(error);
				$scope.state.loading = false;
				qmService.hideLoader();
			});
			return;
		}
		if(!$rootScope.user){
            qmService.sendToLoginIfNecessaryAndComeBack();
		}
	});
    $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();});
    $scope.completelyResetAppStateAndSendToLogin = function(){qmService.completelyResetAppStateAndSendToLogin();};
	qmService.qmStorage.getAsStringWithCallback('primaryOutcomeRatingFrequencyDescription', function (primaryOutcomeRatingFrequencyDescription) {
		$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription ? primaryOutcomeRatingFrequencyDescription : "daily";
		if($rootScope.isIOS){
			if($scope.primaryOutcomeRatingFrequencyDescription !== 'hour' &&
				$scope.primaryOutcomeRatingFrequencyDescription !== 'day' &&
				$scope.primaryOutcomeRatingFrequencyDescription !== 'never'
			) {
				$scope.primaryOutcomeRatingFrequencyDescription = 'day';
				qmService.qmStorage.setItem('primaryOutcomeRatingFrequencyDescription', 'day');
			}
		}
	});
	$scope.sendSharingInvitation = function() {
		var subjectLine = "I%27d%20like%20to%20share%20my%20data%20with%20you";
		var emailBody = "Hi!%20%20%0A%0AI%27m%20tracking%20my%20health%20and%20happiness%20with%20an%20app%20and%20I%27d%20like%20to%20share%20my%20data%20with%20you.%20%20%0A%0APlease%20generate%20a%20data%20authorization%20URL%20at%20" +
			encodeURIComponent(qmService.getApiUrl()) + "%2Fapi%2Fv2%2Fphysicians%20and%20email%20it%20to%20me.%20%0A%0AThanks!%20%3AD";
		var fallbackUrl = qmService.getQuantiModoUrl("api/v2/account/applications", true);
		var emailAddress = null;
		if($rootScope.isMobile){qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
		} else {qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);}
	};
	$scope.sendBugReport = function() {
		qmService.sendBugReport();
	};
	$scope.contactUs = function() {
		if ($rootScope.isChromeApp) {window.location = 'mailto:help@quantimo.do';}
		else {window.location = '#app/feedback';}
	};
	$scope.postIdea = function() {
		if ($rootScope.isChromeApp) {window.location = 'mailto:help@quantimo.do';
		} else {window.open('http://help.quantimo.do/forums/211661-general', '_blank');}
	};
	$scope.combineNotificationChange = function(ev) {
		qmService.updateUserSettingsDeferred({combineNotifications: $rootScope.user.combineNotifications});
		if($rootScope.user.combineNotifications){
			qmService.showMaterialAlert('Disabled Individual Notifications',
				'You will only get a single generic notification instead of a separate notification for each reminder that you create.  All ' +
				'tracking reminder notifications for specific reminders will still show up in your Reminder Inbox.', ev);
			qmService.cancelAllNotifications().then(function() {
				qmLogService.debug(null, 'SettingsCtrl combineNotificationChange: Disabled Multiple Notifications and now ' +
                    'refreshTrackingRemindersAndScheduleAlarms will schedule a single notification for highest ' +
                    "frequency reminder", null);
				if(!qmStorage.getItem(qmItems.deviceTokenOnServer)){
					console.warn("Could not find device token for push notifications so scheduling combined local notifications");
					qmService.syncTrackingReminders();
				}
			});
		} else {
            qmService.showMaterialAlert('Enabled Multiple Notifications', 'You will get a separate device notification for each reminder that you create.', ev);
			qmService.cancelAllNotifications().then(function() {qmService.syncTrackingReminders();});
		}
	};
	$scope.getPreviewBuildsChange = function() {
		var params = {getPreviewBuilds: $rootScope.user.getPreviewBuilds};
		qmService.updateUserSettingsDeferred(params);
		//qmService.autoUpdateApp();
	};
	//$scope.updateApp = function(){qmService.updateApp();};
	var sendReminderNotificationEmailsChange = function (ev) {
		var params = {sendReminderNotificationEmails: $rootScope.user.sendReminderNotificationEmails};
		if(urlHelper.getParam('userEmail')){params.userEmail = urlHelper.getParam('userEmail');}
		qmService.updateUserSettingsDeferred(params);
		if($rootScope.user.sendReminderNotificationEmails){
            qmService.showMaterialAlert('Reminder Emails Enabled', "If you forget to record a measurement for a reminder you've created, I'll send you a daily reminder email.", ev);
		} else {
            qmService.showMaterialAlert('Reminder Emails Disabled', "If you forget to record a measurement for a reminder you've created, I won't send you a daily reminder email.", ev);
		}
	};
	$scope.sendReminderNotificationEmailsChange = function() {verifyEmailAddressAndExecuteCallback(sendReminderNotificationEmailsChange);};
	var sendPredictorEmailsChange = function (ev) {
		var params = {sendPredictorEmails: $rootScope.user.sendPredictorEmails};
		if(urlHelper.getParam('userEmail')){params.userEmail = urlHelper.getParam('userEmail');}
		qmService.updateUserSettingsDeferred(params);
		if($rootScope.user.sendPredictorEmails){
            qmService.showMaterialAlert('Discovery Emails Enabled', "I'll send you a weekly email with new discoveries from your data.", ev);
		} else {
            qmService.showMaterialAlert('Discovery Emails Disabled', "I won't send you a weekly email with new discoveries from your data.", ev);
		}
	};
	$scope.sendPredictorEmailsChange = function() {verifyEmailAddressAndExecuteCallback(sendPredictorEmailsChange);};
	$scope.openEarliestReminderTimePicker = function(ev) {
		$scope.state.earliestReminderTimePickerConfiguration = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					qmLogService.debug(null, 'Time not selected', null);
				} else {
					var a = new Date();
					var params = {timeZoneOffset: a.getTimezoneOffset()};
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());
					qmLogService.debug('Selected epoch is : ', val, 'and the time is ',
						selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
					var newEarliestReminderTime = moment(a).format('HH:mm:ss');
					if(newEarliestReminderTime > $rootScope.user.latestReminderTime){
                        qmService.showMaterialAlert('Choose Another Time', 'Earliest reminder time cannot be greater than latest reminder time.  ' +
							'Please change the latest reminder time and try again or select a different earliest reminder time.', ev);
					} else if (newEarliestReminderTime !== $rootScope.user.earliestReminderTime){
						$rootScope.user.earliestReminderTime = newEarliestReminderTime;
						params.earliestReminderTime = $rootScope.user.earliestReminderTime;
						qmService.updateUserSettingsDeferred(params).then(function(){qmService.syncTrackingReminders();});
                        qmService.showMaterialAlert('Earliest Notification Time Updated', 'You should not receive device notifications before ' + moment(a).format('h:mm A') + '.', ev);
					}
				}
			},
			inputTime: qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.earliestReminderTime),
			step: 15,
			closeLabel: 'Cancel'
		};
		ionicTimePicker.openTimePicker($scope.state.earliestReminderTimePickerConfiguration);
	};
	$scope.openLatestReminderTimePicker = function(ev) {
		$scope.state.latestReminderTimePickerConfiguration = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					qmLogService.debug(null, 'Time not selected', null);
				} else {
					var a = new Date();
					var params = {timeZoneOffset: a.getTimezoneOffset()};
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());
					qmLogService.debug('Selected epoch is : ', val, 'and the time is ',
						selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
					var newLatestReminderTime = moment(a).format('HH:mm:ss');
					if(newLatestReminderTime < $rootScope.user.earliestReminderTime){
                        qmService.showMaterialAlert('Choose Another Time', 'Latest reminder time cannot be less than earliest reminder time.  Please ' +
							'change the earliest reminder time and try again or select a different latest reminder time.', ev);
					} else if (newLatestReminderTime !== $rootScope.user.latestReminderTime){
						$rootScope.user.latestReminderTime = newLatestReminderTime;
						params.latestReminderTime = $rootScope.user.latestReminderTime;
						qmService.updateUserSettingsDeferred(params).then(function(){qmService.syncTrackingReminders();});
                        qmService.showMaterialAlert('Latest Notification Time Updated', 'You should not receive device notification after ' + moment(a).format('h:mm A') + '.', ev);
					}
				}
			},
			inputTime: qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.latestReminderTime),
			step: 15,
			closeLabel: 'Cancel'
		};
		ionicTimePicker.openTimePicker($scope.state.latestReminderTimePickerConfiguration);
	};
	function saveDeviceTokenToSyncWhenWeLogInAgain(){
		// Getting token so we can post as the new user if they log in again
		if(qmStorage.getItem(qmItems.deviceTokenOnServer)){
			qmStorage.setItem(qmItems.deviceTokenToSync, qmStorage.getItem(qmItems.deviceTokenOnServer));
			qmService.deleteDeviceTokenFromServer();
		}
	}
	function logOutOfWebsite() {
		var logoutUrl = qmService.getQuantiModoUrl("api/v2/auth/logout?afterLogoutGoToUrl=" + encodeURIComponent(qmService.getQuantiModoUrl('ionic/Modo/www/index.html#/app/intro')));
        //qmService.get(logoutUrl);
        var request = {method: 'GET', url: logoutUrl, responseType: 'json', headers: {'Content-Type': "application/json"}};
        $http(request);
		//window.location.replace(logoutUrl);
	}
	$scope.logout = function(ev) {
		$rootScope.accessTokenFromUrl = null;
		var completelyResetAppStateAndLogout = function(){
			qmService.showBlackRingLoader();
			qmService.completelyResetAppState();
			logOutOfWebsite();
			saveDeviceTokenToSyncWhenWeLogInAgain();
			qmService.goToState('app.intro');
		};
		var afterLogoutDoNotDeleteMeasurements = function(){
            qmService.showBlackRingLoader();
			$rootScope.user = null;
			saveDeviceTokenToSyncWhenWeLogInAgain();
			window.qmStorage.clearOAuthTokens();
			logOutOfWebsite();
            window.qmStorage.setItem(qmItems.introSeen, false);
            window.qmStorage.setItem(qmItems.onboarded, false);
			qmService.goToState('app.intro');
		};
		var showDataClearPopup = function(ev){
            var title = 'Clear local storage?';
            var textContent = 'Do you want do delete all data from local storage?';
            function yesCallback(){completelyResetAppStateAndLogout();}
            function noCallback(){afterLogoutDoNotDeleteMeasurements();}
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
		};
		qmLogService.debug(null, 'Logging out...', null);
		$rootScope.user = null;
		showDataClearPopup(ev);
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
	var verifyEmailAddressAndExecuteCallback = function (callback) {
		if($rootScope.user.email || $rootScope.user.userEmail){
			callback();
			return;
		}
		$scope.updateEmailAndExecuteCallback(callback);
	};
	var exportRequestAlert = function (ev) {
        qmService.showMaterialAlert('Export Request Sent!', 'Your data will be emailed to you within the next 24 hours.  Enjoy your life! So do we!', ev);
	};
	function exportMeasurements(type, ev){
		qmService.postMeasurementsExport(type, function(response){
			if(!response.success) {qmLogService.error("Could not export measurements. Response: " + JSON.stringify(response));}
		}, function(error){
			qmLogService.error("Could not export measurements. Response: " + JSON.stringify(error));
		});
		exportRequestAlert(ev);
	}
	var exportCsv = function () {exportMeasurements('csv');};
	var exportPdf = function () {exportMeasurements('pdf');};
	var exportXls = function () {exportMeasurements('xls');};
	$scope.exportMeasurements = function(type) {
		if(type === 'csv'){verifyEmailAddressAndExecuteCallback(exportCsv);}
		if(type === 'pdf'){verifyEmailAddressAndExecuteCallback(exportPdf);}
		if(type === 'xls'){verifyEmailAddressAndExecuteCallback(exportXls);}
	};
    var webDowngrade = function() {
        qmService.showBlackRingLoader();
        qmService.postDowngradeSubscriptionDeferred().then(function (user) {
            qmService.hideLoader();
            qmLogService.debug(null, JSON.stringify(user), null);
            qmService.showMaterialAlert('Downgraded', 'Successfully downgraded to QuantiModo Lite');
        }, function (error) {
            qmService.hideLoader();
            qmService.showMaterialAlert('Error', 'An error occurred while downgrading. Please email mike@quantimo.do');
            qmLogService.debug(null, JSON.stringify(error), null);
        });
    };
    var androidDowngrade = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Google Play',
            template: "You subscribed through Google Play so I have to send you to a page that tells you how to " +
            "unsubscribe from Play subscriptions"
        });
        confirmPopup.then(function(res) {
            if(res) {
                qmService.postDowngradeSubscriptionDeferred().then(function (user) {
                    qmLogService.debug(null, JSON.stringify(user), null);
                }, function (error) { qmLogService.error(error); });
                window.open("https://support.google.com/googleplay/answer/7018481", '_blank', 'location=yes');
            } else { console.log('You are not sure'); }
        });
    };
    var appleDowngrade = function () {
        var confirmPopup = $ionicPopup.confirm({title: 'App Store',
            template: "You subscribed through the App Store so I have to send you to a page that tells you how to unsubscribe from App Store subscriptions"});
        confirmPopup.then(function(res) {
            if(res) {
                $rootScope.user.stripeActive = false;
                qmService.postDowngradeSubscriptionDeferred().then(function (user) {
                    qmLogService.debug(null, JSON.stringify(user), null);
                }, function (error) { qmLogService.error(error); });
                window.open("https://support.apple.com/en-us/HT202039", '_blank', 'location=yes');
            } else { console.log('You are not sure'); }
        });
    };
    var googleDowngradeDebug = false;
    $scope.downgrade = function () {
        if ($rootScope.user.subscriptionProvider === 'google' || googleDowngradeDebug) { androidDowngrade();
        } else if ($rootScope.user.subscriptionProvider === 'apple') { appleDowngrade();
        } else { webDowngrade(); }
    };
    if($rootScope.isAndroid){
    	$scope.toggleDrawOverApps = function(ev){
    		qmService.toggleDrawOverApps(ev);
    	};
    	$scope.togglePushNotificationsEnabled = function(){
    		// Toggle is done by the HTML
            //$rootScope.user.pushNotificationsEnabled = !$rootScope.user.pushNotificationsEnabled;
            qmService.updateUserSettingsDeferred({pushNotificationsEnabled: $rootScope.user.pushNotificationsEnabled});
            if($rootScope.user.pushNotificationsEnabled){qmService.showInfoToast('Push notifications enabled');}
            if(!$rootScope.user.pushNotificationsEnabled) {qmService.showInfoToast('Push notifications disabled');}
        }
    }
}]);