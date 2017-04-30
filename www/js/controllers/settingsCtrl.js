angular.module('starter').controller('SettingsCtrl', function( $state, $scope, $ionicPopover, $ionicPopup, $rootScope,
										  quantimodoService, ionicTimePicker, $stateParams, $ionicHistory, $ionicLoading,
										  //$ionicDeploy,
										  $ionicPlatform) {
	$scope.controller_name = "SettingsCtrl";
	$scope.state = {};
	$scope.userEmail = quantimodoService.getUrlParameter('userEmail');
	$rootScope.showFilterBarSearchIcon = false;
	$scope.$on('$ionicView.beforeEnter', function(e) { console.debug("beforeEnter state " + $state.current.name);
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
		$rootScope.hideNavigationMenu = false;
		if(quantimodoService.getUrlParameter('userEmail')){
			$scope.state.loading = true;
			$ionicLoading.show();
			quantimodoService.refreshUserEmailPreferencesDeferred({userEmail: quantimodoService.getUrlParameter('userEmail')}, function(user){
				$scope.user = user;
				$scope.state.loading = false;
				$ionicLoading.hide();
			}, function(error){
				console.error(error);
				$scope.state.loading = false;
				$ionicLoading.hide();
			});
			return;
		}
		if(!$rootScope.user){
            quantimodoService.sendToLogin(true);
		}
	});
    $scope.sendToLogin = function(){quantimodoService.sendToLogin();};
	quantimodoService.getLocalStorageItemAsStringWithCallback('primaryOutcomeRatingFrequencyDescription', function (primaryOutcomeRatingFrequencyDescription) {
		$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription ? primaryOutcomeRatingFrequencyDescription : "daily";
		if($rootScope.isIOS){
			if($scope.primaryOutcomeRatingFrequencyDescription !== 'hour' &&
				$scope.primaryOutcomeRatingFrequencyDescription !== 'day' &&
				$scope.primaryOutcomeRatingFrequencyDescription !== 'never'
			) {
				$scope.primaryOutcomeRatingFrequencyDescription = 'day';
				quantimodoService.setLocalStorageItem('primaryOutcomeRatingFrequencyDescription', 'day');
			}
		}
	});
	$ionicPopover.fromTemplateUrl('templates/settings/ask-for-a-rating.html', {scope: $scope}).then(function(popover) {$scope.ratingPopover = popover;});
	$scope.saveRatingInterval = function(interval){
		$scope.saveInterval(interval);
		quantimodoService.setLocalStorageItem('primaryOutcomeRatingFrequencyDescription', interval);
		$scope.primaryOutcomeRatingFrequencyDescription = interval;
		$scope.ratingPopover.hide();
	};
	$scope.sendSharingInvitation = function() {
		var subjectLine = "I%27d%20like%20to%20share%20my%20data%20with%20you";
		var emailBody = "Hi!%20%20%0A%0AI%27m%20tracking%20my%20health%20and%20happiness%20with%20an%20app%20and%20I%27d%20like%20to%20share%20my%20data%20with%20you.%20%20%0A%0APlease%20generate%20a%20data%20authorization%20URL%20at%20https%3A%2F%2Fapp.quantimo.do%2Fapi%2Fv2%2Fphysicians%20and%20email%20it%20to%20me.%20%0A%0AThanks!%20%3AD";
		var fallbackUrl = quantimodoService.getQuantiModoUrl("api/v2/account/applications", true);
		var emailAddress = null;
		if($rootScope.isMobile){quantimodoService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
		} else {quantimodoService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);}
	};
	function addAppInformationToTemplate(template){
		if(localStorage.getItem('deviceTokenOnServer')){template = template + '\r\n' + "deviceTokenOnServer: " + localStorage.getItem('deviceTokenOnServer');}
		if(localStorage.getItem('deviceTokenToSync')){template = template + '\r\n' + "deviceTokenToSync: " + localStorage.getItem('deviceTokenToSync');}
		template = template + "QuantiModo Client ID: " + quantimodoService.getClientId() + '\r\n';
		template = template + "Platform: " + $rootScope.currentPlatform + '\r\n';
		template = template + "App Name: " + config.appSettings.appDisplayName + '\r\n';
		return template;
	}
	$scope.sendBugReport = function() {
		var subjectLine = encodeURIComponent( config.appSettings.appDisplayName + ' ' + config.appSettings.versionNumber + ' Bug Report');
		var template = "Please describe the issue here:  " + '\r\n' + '\r\n' + '\r\n' + '\r\n' +
			"Additional Information: " + '\r\n';
		template = addAppInformationToTemplate(template);
		if(typeof $ionicDeploy !== "undefined"){
			$ionicPlatform.ready(function () {
				var snapshotList;
				$ionicDeploy.getSnapshots().then(function (snapshots) {
					for (var i = 0; i < snapshots.length; i++) {
						snapshotList = snapshotList + '\r\n' + snapshots[i];
					}
					template = template + '\r\n' + "Snapshots: " + snapshotList;
				});
			});
		}
		var emailBody = encodeURIComponent(template);
		var emailAddress = 'mike@quantimo.do';
		var fallbackUrl = 'http://help.quantimo.do';
		if($rootScope.isMobile){quantimodoService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
		} else {quantimodoService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);}
	};
	$scope.contactUs = function() {
		$scope.hideLoader();
		if ($rootScope.isChromeApp) {window.location = 'mailto:help@quantimo.do';}
		else {window.location = '#app/feedback';}
	};
	$scope.postIdea = function() {
		$scope.hideLoader();
		if ($rootScope.isChromeApp) {window.location = 'mailto:help@quantimo.do';
		} else {window.open('http://help.quantimo.do/forums/211661-general', '_blank');}
	};
	$scope.combineNotificationChange = function(ev) {
		quantimodoService.updateUserSettingsDeferred({combineNotifications: $rootScope.user.combineNotifications});
		if($rootScope.user.combineNotifications){
			quantimodoService.showMaterialAlert('Disabled Individual Notifications',
				'You will only get a single generic notification instead of a separate notification for each reminder that you create.  All ' +
				'tracking reminder notifications for specific reminders will still show up in your Reminder Inbox.', ev);
			quantimodoService.cancelAllNotifications().then(function() {
				console.debug("SettingsCtrl combineNotificationChange: Disabled Multiple Notifications and now " +
					"refreshTrackingRemindersAndScheduleAlarms will schedule a single notification for highest " +
					"frequency reminder");
				if(!localStorage.getItem('deviceTokenOnServer')){
					console.warn("Could not find device token for push notifications so scheduling combined local notifications");
					quantimodoService.syncTrackingReminders();
				}
			});
		} else {
            quantimodoService.showMaterialAlert('Enabled Multiple Notifications', 'You will get a separate device notification for each reminder that you create.', ev);
			quantimodoService.cancelAllNotifications().then(function() {quantimodoService.syncTrackingReminders();});
		}
	};
	$scope.getPreviewBuildsChange = function() {
		var params = {getPreviewBuilds: $rootScope.user.getPreviewBuilds};
		quantimodoService.updateUserSettingsDeferred(params);
		$scope.autoUpdateApp();
	};
	var sendReminderNotificationEmailsChange = function (ev) {
		var params = {sendReminderNotificationEmails: $rootScope.user.sendReminderNotificationEmails};
		if(quantimodoService.getUrlParameter('userEmail')){params.userEmail = quantimodoService.getUrlParameter('userEmail');}
		quantimodoService.updateUserSettingsDeferred(params);
		if($rootScope.user.sendReminderNotificationEmails){
            quantimodoService.showMaterialAlert('Reminder Emails Enabled', "If you forget to record a measurement for a reminder you've created, I'll send you a daily reminder email.", ev);
		} else {
            quantimodoService.showMaterialAlert('Reminder Emails Disabled', "If you forget to record a measurement for a reminder you've created, I won't send you a daily reminder email.", ev);
		}
	};
	$scope.sendReminderNotificationEmailsChange = function() {verifyEmailAddressAndExecuteCallback(sendReminderNotificationEmailsChange);};
	var sendPredictorEmailsChange = function (ev) {
		var params = {sendPredictorEmails: $rootScope.user.sendPredictorEmails};
		if(quantimodoService.getUrlParameter('userEmail')){params.userEmail = quantimodoService.getUrlParameter('userEmail');}
		quantimodoService.updateUserSettingsDeferred(params);
		if($rootScope.user.sendPredictorEmails){
            quantimodoService.showMaterialAlert('Discovery Emails Enabled', "I'll send you a weekly email with new discoveries from your data.", ev);
		} else {
            quantimodoService.showMaterialAlert('Discovery Emails Disabled', "I won't send you a weekly email with new discoveries from your data.", ev);
		}
	};
	$scope.sendPredictorEmailsChange = function() {verifyEmailAddressAndExecuteCallback(sendPredictorEmailsChange);};
	$scope.openEarliestReminderTimePicker = function(ev) {
		$scope.state.earliestReminderTimePickerConfiguration = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					console.debug('Time not selected');
				} else {
					var a = new Date();
					var params = {timeZoneOffset: a.getTimezoneOffset()};
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());
					console.debug('Selected epoch is : ', val, 'and the time is ',
						selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
					var newEarliestReminderTime = moment(a).format('HH:mm:ss');
					if(newEarliestReminderTime > $rootScope.user.latestReminderTime){
                        quantimodoService.showMaterialAlert('Choose Another Time', 'Earliest reminder time cannot be greater than latest reminder time.  ' +
							'Please change the latest reminder time and try again or select a different earliest reminder time.', ev);
					} else if (newEarliestReminderTime !== $rootScope.user.earliestReminderTime){
						$rootScope.user.earliestReminderTime = newEarliestReminderTime;
						params.earliestReminderTime = $rootScope.user.earliestReminderTime;
						quantimodoService.updateUserSettingsDeferred(params).then(function(){quantimodoService.syncTrackingReminders();});
                        quantimodoService.showMaterialAlert('Earliest Notification Time Updated', 'You should not receive device notifications before ' + moment(a).format('h:mm A') + '.', ev);
					}
				}
			},
			inputTime: quantimodoService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.earliestReminderTime),
			step: 15,
			closeLabel: 'Cancel'
		};
		ionicTimePicker.openTimePicker($scope.state.earliestReminderTimePickerConfiguration);
	};
	$scope.openLatestReminderTimePicker = function(ev) {
		$scope.state.latestReminderTimePickerConfiguration = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					console.debug('Time not selected');
				} else {
					var a = new Date();
					var params = {timeZoneOffset: a.getTimezoneOffset()};
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());
					console.debug('Selected epoch is : ', val, 'and the time is ',
						selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
					var newLatestReminderTime = moment(a).format('HH:mm:ss');
					if(newLatestReminderTime < $rootScope.user.earliestReminderTime){
                        quantimodoService.showMaterialAlert('Choose Another Time', 'Latest reminder time cannot be less than earliest reminder time.  Please ' +
							'change the earliest reminder time and try again or select a different latest reminder time.', ev);
					} else if (newLatestReminderTime !== $rootScope.user.latestReminderTime){
						$rootScope.user.latestReminderTime = newLatestReminderTime;
						params.latestReminderTime = $rootScope.user.latestReminderTime;
						quantimodoService.updateUserSettingsDeferred(params).then(function(){quantimodoService.syncTrackingReminders();});
                        quantimodoService.showMaterialAlert('Latest Notification Time Updated', 'You should not receive device notification after ' + moment(a).format('h:mm A') + '.', ev);
					}
				}
			},
			inputTime: quantimodoService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.latestReminderTime),
			step: 15,
			closeLabel: 'Cancel'
		};
		ionicTimePicker.openTimePicker($scope.state.latestReminderTimePickerConfiguration);
	};
	function saveDeviceTokenToSyncWhenWeLogInAgain(){
		// Getting token so we can post as the new user if they log in again
		if(localStorage.getItem('deviceTokenOnServer')){
			localStorage.setItem('deviceTokenToSync', localStorage.getItem('deviceTokenOnServer'));
			quantimodoService.deleteDeviceTokenFromServer();
		}
	}
	function logOutOfWebsite() {
		if (quantimodoService.getClientId() === 'oAuthDisabled' || $rootScope.isChromeExtension) {
			window.open(quantimodoService.getQuantiModoUrl("api/v2/auth/logout"),'_blank');
		}
	}
	$scope.logout = function(ev) {
		var completelyResetAppStateAndLogout = function(){
			quantimodoService.completelyResetAppState();
			logOutOfWebsite();
			saveDeviceTokenToSyncWhenWeLogInAgain();
			$state.go('app.intro');
		};
		var afterLogoutDoNotDeleteMeasurements = function(){
			$rootScope.user = null;
			saveDeviceTokenToSyncWhenWeLogInAgain();
			quantimodoService.clearOAuthTokensFromLocalStorage();
			logOutOfWebsite();
			window.localStorage.introSeen = false;
			window.localStorage.onboarded = false;
			$state.go('app.intro');
		};
		var showDataClearPopup = function(ev){
            var title = 'Clear local storage?';
            var textContent = 'Do you want do delete all data from local storage?';
            function yesCallback(){completelyResetAppStateAndLogout();}
            function noCallback(){afterLogoutDoNotDeleteMeasurements();}
            quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
		};
		console.debug('Logging out...');
		$scope.hideLoader();
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
        quantimodoService.showMaterialAlert('Export Request Sent!', 'Your data will be emailed to you within the next 24 hours.  Enjoy your life! So do we!', ev);
	};
	function exportMeasurements(type, ev){
		quantimodoService.postMeasurementsExport(type, function(response){
			if(!response.success) {quantimodoService.reportErrorDeferred("Could not export measurements. Response: " + JSON.stringify(response));}
		}, function(error){
			quantimodoService.reportErrorDeferred("Could not export measurements. Response: " + JSON.stringify(error));
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
});
