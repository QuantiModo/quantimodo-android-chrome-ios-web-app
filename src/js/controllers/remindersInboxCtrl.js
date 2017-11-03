angular.module('starter').controller('RemindersInboxCtrl', ["$scope", "$state", "$stateParams", "$rootScope", "$filter", "$ionicPlatform", "$ionicActionSheet", "$timeout", "qmService", "qmLogService", "$ionicLoading", "$mdToast", function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform, $ionicActionSheet, $timeout, qmService, qmLogService, $ionicLoading, $mdToast) {
    if(!$rootScope.appSettings){$rootScope.appSettings = window.config.appSettings;}
	$scope.controller_name = "RemindersInboxCtrl";
	qmLogService.debug(null, 'Loading ' + $scope.controller_name, null);
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
		qmLogService.debug(null, 'RemindersInboxCtrl beforeEnter ', null);
        if(urlHelper.getParam('variableCategoryName')){$stateParams.variableCategoryName = urlHelper.getParam('variableCategoryName');}
		$scope.loading = true;
        if(qmService.sendToLoginIfNecessaryAndComeBack()){ return; }
		$rootScope.hideBackButton = true;
		$rootScope.hideHomeButton = true;
        if ($stateParams.hideNavigationMenu !== true){$rootScope.hideNavigationMenu = false;}
		setPageTitle();
	});
	$scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug(null, 'RemindersInboxCtrl enter', null);
        $scope.defaultHelpCards = qmService.setupHelpCards();
        getTrackingReminderNotifications();
        getFavorites();
		$rootScope.bloodPressure = {systolicValue: null, diastolicValue: null, displayTotal: "Blood Pressure"};
		$scope.stateParams = $stateParams;
		$rootScope.showActionSheetMenu = function() {
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
                    qmService.actionSheetButtons.history,
					qmService.actionSheetButtons.addReminder,
                    qmService.actionSheetButtons.recordMeasurement,
            		qmService.actionSheetButtons.charts,
                    qmService.actionSheetButtons.settings,
                    qmService.actionSheetButtons.help
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Clear All Notifications',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {qmLogService.debug(null, 'CANCELLED', null);},
				buttonClicked: function(index) {
					qmLogService.debug(null, 'BUTTON CLICKED', null, index);
                    if(index === 0){qmService.goToState('app.historyAll', {variableCategoryName: $stateParams.variableCategoryName});}
                    if(index === 1){qmService.goToState('app.reminderSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 2){qmService.goToState('app.measurementAddSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 3){qmService.goToState('app.chartSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 4){qmService.goToState('app.settings');}
                    if(index === 5){qmService.goToState('app.help');}
					return true;
				},
				destructiveButtonClicked: function() {
					qmService.showInfoToast('Skipping all reminder notifications...');
					qmService.skipAllTrackingReminderNotificationsDeferred()
						.then(function(){
							if($rootScope.localNotificationsEnabled){qmService.setNotificationBadge(0);}
							$scope.refreshTrackingReminderNotifications();
						}, function(error){
							qmLogService.error(null, error);
							qmService.showMaterialAlert('Failed to skip! ', 'Please let me know by pressing the help button.  Thanks!');
						});
					return true;
				}
			});
			$timeout(function() {hideSheet();}, 20000);
		};
		if(navigator && navigator.splashscreen) {
			qmLogService.debug(null, 'ReminderInbox: Hiding splash screen because app is ready', null);
			navigator.splashscreen.hide();
		}
	});
	$scope.$on('$ionicView.afterEnter', function(){
        qmLogService.debug(null, 'RemindersInboxCtrl afterEnter', null);
        if(!$rootScope.numberOfPendingNotifications){$scope.refreshTrackingReminderNotifications();}
	});
	$scope.$on('$ionicView.afterLeave', function(){
		qmLogService.debug(null, 'RemindersInboxCtrl afterLeave', null);
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
			qmLogService.debug(null, 'This event is probably a ghost click so not registering.', null, $event);
			return true;
		} else {
		    if(!$event){
		        qmLogService.error(null, 'No event provided to isGhostClick!');
		        return false;
            }
			qmLogService.debug(null, 'This Track event is not a ghost click so registering.', null, $event);
			$scope.state.lastButtonPressTimeStamp = $event.timeStamp;
			$scope.state.lastClientX = $event.clientX;
			$scope.state.lastClientY = $event.clientY;
			return false;
		}
	};
	var setLastAction = function(modifiedValue, unitAbbreviatedName){
		var lastAction = 'Recorded ' + modifiedValue + ' ' + unitAbbreviatedName;
		$scope.lastAction = qmService.formatValueUnitDisplayText(lastAction);
	};
	function refreshIfRunningOutOfNotifications() {if($scope.state.numberOfDisplayedNotifications < 2){$scope.refreshTrackingReminderNotifications();}}
	$scope.trackByValueField = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){return;}
        if(!qmService.valueIsValid(trackingReminderNotification, trackingReminderNotification.modifiedValue)){return false;}
		trackingReminderNotification.modifiedValue = trackingReminderNotification.total;
		setLastAction(trackingReminderNotification.modifiedValue, trackingReminderNotification.unitAbbreviatedName);
        notificationAction(trackingReminderNotification);
		qmService.trackTrackingReminderNotificationDeferred(trackingReminderNotification);
        refreshIfRunningOutOfNotifications();
	};
    function getWeekdayCharts() {
        if(false && !$scope.weekdayChartConfig){
            qmService.syncPrimaryOutcomeVariableMeasurements(60 * 60);
            qmService.getWeekdayChartConfigForPrimaryOutcome($scope.state.primaryOutcomeMeasurements, qm.getPrimaryOutcomeVariable())
                .then(function (chartConfig) {$scope.weekdayChartConfig = chartConfig;});
        }
        if(!$rootScope.variableObject || !$rootScope.variableObject.charts){
            qmService.setRootScopeVariableWithCharts();
        }
    }
	function getFavorites() {
		if(!$scope.favoritesArray){
            qmService.qmStorage.getFavorites($stateParams.variableCategoryName)
				.then(function(favorites){
            		$scope.favoritesArray = favorites;
				});
		}
    }
	var getFallbackInboxContent = function () {
		if(!$scope.state.numberOfDisplayedNotifications){
            if($stateParams.variableCategoryName){
                qmLogService.info(null, 'Falling back to getTrackingReminderNotificationsFromApi request for category ' + $stateParams.variableCategoryName, null);
				qmService.getTrackingReminderNotificationsFromApi({variableCategoryName: $stateParams.variableCategoryName, onlyPast: true}, function (response) {
                    qmLogService.info(null, 'getTrackingReminderNotificationsFromApi response for ' + $stateParams.variableCategoryName + ': ' + JSON.stringify(response), null);
                    $scope.filteredTrackingReminderNotifications = qmService.groupTrackingReminderNotificationsByDateRange(response.data);
                });
            }
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
	var enlargeChromePopupIfNecessary = function () {
		if($rootScope.alreadyEnlargedWindow){return;}
		var largeInboxWindowParams = {top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
		if($state.current.name === "app.remindersInboxCompact"){
			qmService.goToState("app.remindersInbox");
			chrome.windows.getCurrent({}, function (chromeWindow) {
				$rootScope.alreadyEnlargedWindow = true;
				var vid = chromeWindow.id;
				chrome.windows.update(vid, largeInboxWindowParams);
			});
		}
	};
	var notificationAction = function(trackingReminderNotification){
		trackingReminderNotification.hide = true;
        $rootScope.numberOfPendingNotifications--;
        $scope.state.numberOfDisplayedNotifications--;
        if($state.current.name === "app.remindersInboxCompact"){
            if(!$scope.state.numberOfDisplayedNotifications){window.close();}
			$scope.trackingReminderNotifications.shift();
        }
        closeWindowIfNecessary();
        getFallbackInboxContent();
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
        qmService.logEventToGA(qmAnalytics.eventCategories.inbox, "track", null, modifiedReminderValue);
		qmService.trackTrackingReminderNotificationDeferred(body, trackAll);
        refreshIfRunningOutOfNotifications();
	};
	function trackAll(trackingReminderNotification, modifiedReminderValue, ev) {
		qmNotifications.deleteByVariableName(trackingReminderNotification.variableName);
        $scope.track(trackingReminderNotification, modifiedReminderValue, ev, true);
        qmService.logEventToGA(qmAnalytics.eventCategories.inbox, "trackAll");
        getTrackingReminderNotifications();
    }
    function preventDragAfterAlert(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.gesture.stopPropagation();
        ev.gesture.preventDefault();
        ev.gesture.stopDetect();
    }
    $scope.trackAllWithConfirmation = function(trackingReminderNotification, modifiedReminderValue, ev){
        preventDragAfterAlert(ev);
        var title = "Record " + qmService.formatValueUnitDisplayText(modifiedReminderValue + " " + trackingReminderNotification.unitAbbreviatedName) + " for all?";
        var textContent = "Do you want to record " + qmService.formatValueUnitDisplayText(modifiedReminderValue + " " + trackingReminderNotification.unitAbbreviatedName) +
			" for all remaining past " + trackingReminderNotification.variableName + " reminder notifications?";
        function yesCallback(ev) {
            trackAll(trackingReminderNotification, modifiedReminderValue, ev);
        }
        function noCallback() {}
        qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
	$scope.skip = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){ return; }
		$scope.lastAction = 'Skipped';
		var params = notificationAction(trackingReminderNotification);
		qmService.skipTrackingReminderNotificationDeferred(params);
        qmService.logEventToGA(qmAnalytics.eventCategories.inbox, "skip");
        refreshIfRunningOutOfNotifications();
	};
	$scope.snooze = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){return;}
		$scope.lastAction = 'Snoozed';
		var params = notificationAction(trackingReminderNotification);
		qmService.snoozeTrackingReminderNotificationDeferred(params);
        qmService.logEventToGA(qmAnalytics.eventCategories.inbox, "snooze");
        refreshIfRunningOutOfNotifications();
	};
	function wordClicked(word){
		alert(word.text + " appears " + word.count + " times and the average " + qm.getPrimaryOutcomeVariable().name +
			" value when it is written is " + word.average + qm.getPrimaryOutcomeVariable().unitAbbreviatedName + '.' );
	}
	function createWordCloudFromNotes() {
		$scope.height = window.innerHeight * 0.5;
		$scope.width = window.innerWidth; //element.find('word-cloud')[0].offsetWidth;
		$scope.wordClicked = wordClicked;
		qmService.getNotesDeferred(qm.getPrimaryOutcomeVariable().name).then(function (response) {
			$scope.words = response;
		});
	}
	var getFilteredTrackingReminderNotificationsFromLocalStorage = function(){
		if(urlHelper.getParam('variableCategoryName')){$stateParams.variableCategoryName = urlHelper.getParam('variableCategoryName');}
		var trackingReminderNotifications = qmService.qmStorage.getTrackingReminderNotifications($stateParams.variableCategoryName);
		for (var i = 0; i < trackingReminderNotifications.length; i++){
			trackingReminderNotifications[i].showZeroButton = shouldWeShowZeroButton(trackingReminderNotifications[i]);
		}
		//qmLogService.debug('Just got ' + trackingReminderNotifications.length + ' trackingReminderNotifications from local storage');
		$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
		if($scope.state.numberOfDisplayedNotifications){hideInboxLoader();}
		if($state.current.name === "app.remindersInboxCompact"){
			$scope.trackingReminderNotifications = trackingReminderNotifications;
		} else {
			$scope.filteredTrackingReminderNotifications = qmService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
			//qmLogService.debug('Just added ' + trackingReminderNotifications.length + ' to $scope.filteredTrackingReminderNotifications');
			getFallbackInboxContent();
		}
	};
	var hideInboxLoader = function(){
        qmService.hideLoader();
		//Stop the ion-refresher from spinning
		$scope.$broadcast('scroll.refreshComplete');
		$scope.loading = false;
	};
	var getFilteredTodayTrackingReminderNotifications = function(){
		qmService.getTodayTrackingReminderNotificationsDeferred($stateParams.variableCategoryName)
			.then(function (trackingReminderNotifications) {
				$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
				$scope.filteredTrackingReminderNotifications = qmService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
				getFallbackInboxContent();
				hideInboxLoader();
			}, function(error){
				getFallbackInboxContent();
				qmLogService.error(null, error);
				hideInboxLoader();
				qmLogService.error(null, 'failed to get reminder notifications!');
			});
	};
	$scope.$on('qmStorage.getTrackingReminderNotifications', function(){
		qmLogService.debug(null, 'qmStorage.getTrackingReminderNotifications broadcast received..', null);
		if(!$stateParams.today) {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	});
	var getTrackingReminderNotifications = function () {
		qmLogService.debug(null, 'Getting notifications from local storage', null);
		if($stateParams.today){getFilteredTodayTrackingReminderNotifications();} else {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	};
	function shouldWeShowZeroButton(trackingReminderNotification){
		return trackingReminderNotification.inputType === 'defaultValue' || (trackingReminderNotification.inputType === 'value' && trackingReminderNotification.defaultValue !== null);
	}
	var showLoader = function () {
		$scope.loading = true;
		$timeout(function() {if($scope.loading) {$scope.loading = false;}}, 10000);
	};
	$scope.refreshTrackingReminderNotifications = function (minimumSecondsBetweenRequests) {
		showLoader();
		qmService.refreshTrackingReminderNotifications(minimumSecondsBetweenRequests).then(function(){
            hideInboxLoader();
			getTrackingReminderNotifications();
		}, function (error) {
			qmLogService.error(null, '$scope.refreshTrackingReminderNotifications: ' + error);
			hideInboxLoader();
		});
	};
	$scope.editMeasurement = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		$rootScope.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		qmNotifications.deleteById(trackingReminderNotification.id);
		qmService.goToState('app.measurementAdd', {reminderNotification: trackingReminderNotification, fromUrl: window.location.href});
	};
	$scope.editReminderSettingsByNotification = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		$rootScope.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		var trackingReminder = trackingReminderNotification;
		trackingReminder.id = trackingReminderNotification.trackingReminderId;
		qmService.goToState('app.reminderAdd', {reminder: trackingReminder, fromUrl: window.location.href, fromState : $state.current.name});
	};
	function skipAllForVariable(trackingReminderNotification) {
        trackingReminderNotification.hide = true;
        qmLogService.debug(null, 'Skipping all notifications for trackingReminder', null, trackingReminderNotification);
        var params = {trackingReminderId : trackingReminderNotification.trackingReminderId};
        //qmService.showInfoToast('Skipping all ' + $rootScope.variableObject.name + ' reminder notifications...');
        qmService.skipAllTrackingReminderNotificationsDeferred(params)
            .then(function(){
                hideInboxLoader();
                $scope.refreshTrackingReminderNotifications();
            }, function(error){
                hideInboxLoader();
                qmLogService.error(null, error);
                qmLogService.error(null, error);
                qmService.showMaterialAlert('Failed to skip! ', 'Please let me know by pressing the help button.  Thanks!');
            });
        return true;
    }
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
            qmService.actionSheetButtons.charts,
            qmService.actionSheetButtons.history
        ];
		for(var i=0; i < trackingReminderNotification.trackAllActions.length; i++){
		    buttons.push({ text: '<i class="icon ion-android-done-all"></i>' + trackingReminderNotification.trackAllActions[i].title})
        }
        buttons.push({ text: '<i class="icon ion-trash-a"></i>Skip All '});
        buttons.push(qmService.actionSheetButtons.analysisSettings);
		var hideSheetForNotification = $ionicActionSheet.show({
			buttons: buttons,
			//destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {qmLogService.debug(null, 'CANCELLED', null);},
			buttonClicked: function(index) {
				qmLogService.debug(null, 'BUTTON CLICKED', null, index);
                if(index === 0){qmLogService.debug(null, 'clicked variable name', null);}
				if(index === 1){$scope.editReminderSettingsByNotification($scope.state.trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex);}
				if(index === 2){qmService.goToState('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 3){qmService.goToState('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                var buttonIndex = 4;
                for(var i=0; i < trackingReminderNotification.trackAllActions.length; i++){
                    if(index === buttonIndex){trackAll(trackingReminderNotification, trackingReminderNotification.trackAllActions[i].modifiedValue);}
                    buttonIndex++;
                }
                if(index === buttonIndex){skipAllForVariable(trackingReminderNotification);}
                buttonIndex++;
                if(index === buttonIndex){qmService.goToState('app.variableSettings', {variableName: $scope.state.trackingReminderNotification.variableName});}
				return true;
			},
			destructiveButtonClicked: function() {
				skipAllForVariable(trackingReminderNotification);
				return true;
			}
		});
		//$timeout(function() {hideSheetForNotification();}, 20000);
	};
	$scope.hideHelpCard = function (helpCard, emailType) {
		if(emailType){$scope.sendEmailAfterVerification(emailType);}
		helpCard.hide = true;
		$scope.defaultHelpCards = $scope.defaultHelpCards.filter(function( obj ) {return obj.id !== helpCard.id;});
		qmService.qmStorage.deleteById('defaultHelpCards', helpCard.id);
	};
	function getDiscoveries() {
		if(!$scope.state.correlationObjects){
            qmService.getCorrelationsDeferred({limit: 10, fallbackToAggregateCorrelations: true})
				.then(function (data) {
					$scope.state.correlationsExplanation = data.explanation;
					$scope.state.correlationObjects = data.correlations;
				});
		}
    }
    var undoToastPosition = angular.extend({},{ bottom: true, top: false, left: true, right: false });
    var getUndoToastPosition = function() {return Object.keys(undoToastPosition).filter(function(pos) { return undoToastPosition[pos]; }).join(' ');};
    var undoInboxAction = function(){
        qmNotifications.undo();
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
}]);
