angular.module('starter').controller('RemindersInboxCtrl', ["$scope", "$state", "$stateParams", "$rootScope", "$filter",
    "$ionicPlatform", "$ionicActionSheet", "$timeout", "qmService", "qmLogService", "$ionicLoading", "$mdToast",
    function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform, $ionicActionSheet, $timeout, qmService,
             qmLogService, $ionicLoading, $mdToast) {
    if(!$rootScope.appSettings){qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());}
	$scope.controller_name = "RemindersInboxCtrl";
	qmLogService.debug('Loading ' + $scope.controller_name);
	qmService.navBar.setFilterBarSearchIcon(false);
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
		qmLogService.info('RemindersInboxCtrl beforeEnter: ' + window.location.href);
		$scope.loading = true;
        if(qmService.sendToLoginIfNecessaryAndComeBack()){ return; }
		$rootScope.hideBackButton = true;
		$rootScope.hideHomeButton = true;
        if ($stateParams.hideNavigationMenu !== true){
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        }
		// setPageTitle(); // Setting title beforeEnter doesn't fix cutoff on Android
	});
	$scope.$on('$ionicView.enter', function(e) {
        qmLogService.info('RemindersInboxCtrl enter: ' + window.location.href);
        $scope.defaultHelpCards = qmService.setupHelpCards();
        getTrackingReminderNotifications();
        //getFavorites();  Not sure why we need to do this here?
        qmService.rootScope.setProperty('bloodPressure', {systolicValue: null, diastolicValue: null, displayTotal: "Blood Pressure"});
		$scope.stateParams = $stateParams;
		qmService.rootScope.setShowActionSheetMenu(function() {
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
                    qmService.actionSheets.actionSheetButtons.historyAll,
					qmService.actionSheets.actionSheetButtons.reminderAdd,
                    qmService.actionSheets.actionSheetButtons.measurementAddSearch,
            		qmService.actionSheets.actionSheetButtons.charts,
                    qmService.actionSheets.actionSheetButtons.settings,
                    qmService.actionSheets.actionSheetButtons.help,
                    qmService.actionSheets.actionSheetButtons.refresh
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Clear All Notifications',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {qmLogService.debug('CANCELLED', null);},
				buttonClicked: function(index) {
					qmLogService.debug('BUTTON CLICKED', null, index);
                    if(index === 0){qmService.goToState('app.historyAll', {variableCategoryName: getVariableCategoryName()});}
                    if(index === 1){qmService.goToState('app.reminderSearch', {variableCategoryName : getVariableCategoryName()});}
                    if(index === 2){qmService.goToState('app.measurementAddSearch', {variableCategoryName : getVariableCategoryName()});}
                    if(index === 3){qmService.goToState('app.chartSearch', {variableCategoryName : getVariableCategoryName()});}
                    if(index === 4){qmService.goToState('app.settings');}
                    if(index === 5){qmService.goToState('app.help');}
                    if(index === 6){$scope.refreshTrackingReminderNotifications(3)}
					return true;
				},
				destructiveButtonClicked: function() {
					qmService.showInfoToast('Skipping all reminder notifications...');
					qmService.skipAllTrackingReminderNotificationsDeferred()
						.then(function(){
							$scope.refreshTrackingReminderNotifications();
						}, function(error){
							qmLogService.error(null, error);
							qmService.showMaterialAlert('Failed to skip! ', 'Please let me know by pressing the help button.  Thanks!');
						});
					return true;
				}
			});
			$timeout(function() {hideSheet();}, 20000);
		});
		if(navigator && navigator.splashscreen) {
			qmLogService.debug('ReminderInbox: Hiding splash screen because app is ready', null);
			navigator.splashscreen.hide();
		}
	});
	$scope.$on('$ionicView.afterEnter', function(){
        qmLogService.info('RemindersInboxCtrl afterEnter: ' + window.location.href);
        setPageTitle(); // Setting title afterEnter doesn't fix cutoff on Android
        if(!qm.storage.getItem(qm.items.trackingReminderNotifications) || !qm.storage.getItem(qm.items.trackingReminderNotifications).length){
            $scope.refreshTrackingReminderNotifications();
        }
        if($rootScope.platform.isWeb){qm.webNotifications.registerServiceWorker();}
        autoRefresh();
	});
	function autoRefresh() {
	    $timeout(function () {
            if($state.current.name.toLowerCase().indexOf('inbox') !== -1){
                $scope.refreshTrackingReminderNotifications();
                autoRefresh();
            }
        }, 30 * 60 * 1000)
    }
	$scope.$on('$ionicView.afterLeave', function(){
		qmLogService.debug('RemindersInboxCtrl afterLeave', null);
		$rootScope.hideHomeButton = false;
		$rootScope.hideBackButton = false;
	});
	var setPageTitle = function(){
		if($stateParams.today) {
			if(getVariableCategoryName() === 'Treatments') {
				$scope.state.title = "Today's Scheduled Meds";
				$scope.state.favoritesTitle = "As-Needed Meds";
			} else if (getVariableCategoryName()) {
				$scope.state.title = "Today's Scheduled " + getVariableCategoryName();
			} else {$scope.state.title = "Today's Reminder Notifications";}
		} else {
			if(getVariableCategoryName() === 'Treatments') {
				$scope.state.title = 'Overdue Meds';
				$scope.state.favoritesTitle = "As-Needed Meds";
			} else if (getVariableCategoryName()) {
				$scope.state.title = $filter('wordAliases')(getVariableCategoryName()) + " " + $filter('wordAliases')("Reminder Inbox");
			} else {$scope.state.title = 'Inbox';}
		}
	};
	var isGhostClick = function ($event) {
		if(!$rootScope.platform.isMobile){return false;}
		if($event && $scope.state.lastButtonPressTimeStamp > $event.timeStamp - 3000 && $scope.state.lastClientX === $event.clientX && $scope.state.lastClientY === $event.clientY) {
			qmLogService.debug('This event is probably a ghost click so not registering.', null, $event);
			return true;
		} else {
		    if(!$event){
		        qmLogService.error(null, 'No event provided to isGhostClick!');
		        return false;
            }
			qmLogService.debug('This Track event is not a ghost click so registering.', null, $event);
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
	function refreshIfRunningOutOfNotifications() {
	    if($scope.state.numberOfDisplayedNotifications < 2){
	        if(qm.notifications.getNumberInGlobalsOrLocalStorage(getVariableCategoryName())){
	            getTrackingReminderNotifications()
            } else {
                $scope.refreshTrackingReminderNotifications();
            }
	    }
	}
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
        if(!$scope.state.variableObject || !$scope.state.variableObject.charts){
            qmService.getVariableWithCharts(qm.getPrimaryOutcomeVariable().name, false, function(variableObject){
                $scope.state.variableObject = variableObject;
            });
        }
    }
	function getFavorites() {
		if(!$scope.favoritesArray){
            qmService.storage.getFavorites(getVariableCategoryName())
				.then(function(favorites){
            		$scope.favoritesArray = favorites;
				});
		}
    }
	var getFallbackInboxContent = function () {
		if(!$scope.state.numberOfDisplayedNotifications){
            if(getVariableCategoryName()){
                qmLogService.info('Falling back to getTrackingReminderNotificationsFromApi request for category ' + getVariableCategoryName());
				qmService.refreshTrackingReminderNotifications(3, {variableCategoryName: getVariableCategoryName(), onlyPast: true}, function (response) {
                    qmLogService.info('getTrackingReminderNotificationsFromApi response for ' + getVariableCategoryName() + ': ' + JSON.stringify(response));
                    $scope.filteredTrackingReminderNotifications = qmService.groupTrackingReminderNotificationsByDateRange(response.data);
                });
            }
            getFavorites();
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
	    qmLog.info("Clicked "+ $scope.lastAction + " for " + trackingReminderNotification.variableName);
		trackingReminderNotification.hide = true;
        qmService.numberOfPendingNotifications--;
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
		// I think this slows down inbox
        //qmService.logEventToGA(qm.analytics.eventCategories.inbox, "track", null, modifiedReminderValue);
		qmService.trackTrackingReminderNotificationDeferred(body, trackAll);
        refreshIfRunningOutOfNotifications();
	};
	function trackAll(trackingReminderNotification, modifiedReminderValue, ev) {
		qm.notifications.deleteByVariableName(trackingReminderNotification.variableName);
        $scope.track(trackingReminderNotification, modifiedReminderValue, ev, true);
        qmService.logEventToGA(qm.analytics.eventCategories.inbox, "trackAll");
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
        qmService.logEventToGA(qm.analytics.eventCategories.inbox, "skip");
        refreshIfRunningOutOfNotifications();
	};
	$scope.snooze = function(trackingReminderNotification, $event){
		if(isGhostClick($event)){return;}
		$scope.lastAction = 'Snoozed';
		var params = notificationAction(trackingReminderNotification);
		qmService.snoozeTrackingReminderNotificationDeferred(params);
        qmService.logEventToGA(qm.analytics.eventCategories.inbox, "snooze");
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
		var trackingReminderNotifications = qm.storage.getTrackingReminderNotifications(getVariableCategoryName(), 20);
		for (var i = 0; i < trackingReminderNotifications.length; i++){
			trackingReminderNotifications[i].showZeroButton = shouldWeShowZeroButton(trackingReminderNotifications[i]);
		}
		qmLogService.debug('Just got ' + trackingReminderNotifications.length + ' trackingReminderNotifications from local storage');
		$scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
		//if($scope.state.numberOfDisplayedNotifications){hideInboxLoader();}  // TODO: Why was did we only do this if we had notifications?  It loads forever if category inbox has no notifications
        hideInboxLoader();
		if($state.current.name === "app.remindersInboxCompact"){
			$scope.trackingReminderNotifications = trackingReminderNotifications;
		} else {
			$scope.filteredTrackingReminderNotifications = qmService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
			qmLogService.debug('Just added ' + trackingReminderNotifications.length + ' to $scope.filteredTrackingReminderNotifications');
            if(!$scope.state.numberOfDisplayedNotifications){getFallbackInboxContent();}  // TODO: Why was this commented?
		}
	};
	var hideInboxLoader = function(){
        qmService.hideLoader();
		//Stop the ion-refresher from spinning
		$scope.$broadcast('scroll.refreshComplete');
		$scope.loading = false;
	};
	var getFilteredTodayTrackingReminderNotifications = function(){
		qmService.getTodayTrackingReminderNotificationsDeferred(getVariableCategoryName())
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
	$rootScope.$on('broadcastGetTrackingReminderNotifications', function() {
		qmLogService.info('qm.storage.getTrackingReminderNotifications broadcast received..');
		if(!$stateParams.today) {getFilteredTrackingReminderNotificationsFromLocalStorage();}
	});
	var getTrackingReminderNotifications = function () {
        qmLogService.info('RemindersInboxCtrl called getTrackingReminderNotifications: ' + window.location.href);
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
			if(!qm.notifications.getNumberInGlobalsOrLocalStorage(getVariableCategoryName())){getFallbackInboxContent();}
		}, function (error) {
            if(!qm.notifications.getNumberInGlobalsOrLocalStorage(getVariableCategoryName())){getFallbackInboxContent();}
			qmLog.info('$scope.refreshTrackingReminderNotifications: ' + error);
			hideInboxLoader();
		});
	};
	$scope.editMeasurement = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		qmService.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		qm.notifications.deleteById(trackingReminderNotification.id);
		qmService.goToState('app.measurementAdd', {reminderNotification: trackingReminderNotification, fromUrl: window.location.href});
	};
	$scope.editReminderSettingsByNotification = function(trackingReminderNotification){
		enlargeChromePopupIfNecessary();
		//$scope.filteredTrackingReminderNotifications[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
		trackingReminderNotification.hide = true;
		qmService.numberOfPendingNotifications--;
		$scope.state.numberOfDisplayedNotifications--;
		var trackingReminder = trackingReminderNotification;
		trackingReminder.id = trackingReminderNotification.trackingReminderId;
		qmService.goToState('app.reminderAdd', {reminder: trackingReminder, fromUrl: window.location.href, fromState : $state.current.name});
	};
	function skipAllForVariable(trackingReminderNotification) {
        trackingReminderNotification.hide = true;
        qmLogService.debug('Skipping all notifications for trackingReminder', null, trackingReminderNotification);
        qmService.showInfoToast("Skipping all past notifications for " + trackingReminderNotification.variableName);
        var params = {trackingReminderId : trackingReminderNotification.trackingReminderId};
        //qmService.showInfoToast('Skipping all ' + $scope.state.variableObject.name + ' reminder notifications...');
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
		$scope.state.variableObject = trackingReminderNotification;
		$scope.state.variableObject.id = trackingReminderNotification.variableId;
		$scope.state.variableObject.name = trackingReminderNotification.variableName;
		// Show the action sheet
		var buttons = [
            { text: 'Actions for ' +  trackingReminderNotification.variableName},
            { text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
            qmService.actionSheets.actionSheetButtons.charts,
            qmService.actionSheets.actionSheetButtons.historyAllVariable
        ];
		for(var i=0; i < trackingReminderNotification.trackAllActions.length; i++){
		    buttons.push({ text: '<i class="icon ion-android-done-all"></i>' + trackingReminderNotification.trackAllActions[i].title})
        }
        buttons.push({ text: '<i class="icon ion-trash-a"></i>Skip All '});
        buttons.push(qmService.actionSheets.actionSheetButtons.variableSettings);
		var hideSheetForNotification = $ionicActionSheet.show({
			buttons: buttons,
			//destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {qmLogService.debug('CANCELLED', null);},
			buttonClicked: function(index) {
				qmLogService.debug('BUTTON CLICKED', null, index);
                if(index === 0){qmLogService.debug('clicked variable name', null);}
				if(index === 1){$scope.editReminderSettingsByNotification($scope.state.trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex);}
				if(index === 2){qmService.goToState('app.charts', {variableObject: $scope.state.variableObject, variableName: $scope.state.variableObject.name});}
                if(index === 3){qmService.goToState('app.historyAllVariable', {variableObject: $scope.state.variableObject, variableName: $scope.state.variableObject.name});}
                var buttonIndex = 4;
                for(var i=0; i < trackingReminderNotification.trackAllActions.length; i++){
                    if(index === buttonIndex){trackAll(trackingReminderNotification, trackingReminderNotification.trackAllActions[i].modifiedValue);}
                    buttonIndex++;
                }
                if(index === buttonIndex){skipAllForVariable(trackingReminderNotification);}
                buttonIndex++;
                if(index === buttonIndex){qmService.goToVariableSettingsByName($scope.state.trackingReminderNotification.variableName);}
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
		qmService.storage.deleteById('defaultHelpCards', helpCard.id);
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
    $scope.showUndoToast = function(lastAction) {
        qmService.showToastWithButton(lastAction, 'UNDO', function(){
            qm.notifications.undo();
            getTrackingReminderNotifications();
        });
    };
    function getVariableCategoryName() {
        if($stateParams.variableCategoryName){return $stateParams.variableCategoryName;}
        if(qm.urlHelper.getParam('variableCategoryName')){return qm.urlHelper.getParam('variableCategoryName');}
    }
}]);
