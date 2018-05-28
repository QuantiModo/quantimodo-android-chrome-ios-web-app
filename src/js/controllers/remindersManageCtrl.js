angular.module('starter').controller('RemindersManageCtrl', ["$scope", "$state", "$stateParams", "$ionicPopup", "$rootScope",
    "$timeout", "$ionicLoading", "$filter", "$ionicActionSheet", "qmService", "qmLogService",
    function($scope, $state, $stateParams, $ionicPopup, $rootScope, $timeout, $ionicLoading, $filter, $ionicActionSheet,
             qmService, qmLogService) {
	$scope.controller_name = "RemindersManageCtrl";
	qmLogService.debug('Loading ' + $scope.controller_name, null);
	qmService.navBar.setFilterBarSearchIcon(false);
    qmService.sendToLoginIfNecessaryAndComeBack();
	$scope.state = {
	    searchText: '',
        search: null,
		showButtons : false,
		variableCategory : $stateParams.variableCategoryName,
		showMeasurementBox : false,
		selectedReminder : false,
		reminderDefaultValue : "",
		selected1to5Value : false,
		trackingReminders : [],
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
		showTreatmentInfoCard : false,
		showSymptomInfoCard : false,
		noRemindersTitle: "Add Some Variables",
		noRemindersText: "You don't have any reminders, yet.",
		noRemindersIcon: "ion-android-notifications-none"
	};
	$scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.info('beforeEnter RemindersManageCtrl', null);
		if(qm.urlHelper.getParam('variableCategoryName')){$stateParams.variableCategoryName = qm.urlHelper.getParam('variableCategoryName');}
		qmService.showBasicLoader();
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
		$scope.stateParams = $stateParams;
		var actionButtons = [
			{ text: '<i class="icon ion-arrow-down-c"></i>Sort by Name'},
			{ text: '<i class="icon ion-clock"></i>Sort by Time' }
		];
		if (!$stateParams.variableCategoryName || $stateParams.variableCategoryName === "Anything") {
			if(!$scope.stateParams.title) {
			    if($rootScope.platform.isMobile){
                    $scope.stateParams.title = "Reminders";
                } else {
                    $scope.stateParams.title = "Manage Reminders";
                }
			}
			if(!$scope.stateParams.addButtonText) { $scope.stateParams.addButtonText = "Add a Variable"; }
            if(!$scope.stateParams.addMeasurementButtonText) { $scope.stateParams.addMeasurementButtonText = "Record Measurement"; }
			actionButtons[2] = qmService.actionSheets.actionSheetButtons.historyAllCategory;
            actionButtons[3] = qmService.actionSheets.actionSheetButtons.reminderSearch;
		} else {
			$scope.state.noRemindersTitle = "Add " + $stateParams.variableCategoryName;
			$scope.state.noRemindersText = "You haven't saved any " + $stateParams.variableCategoryName.toLowerCase() + " favorites or reminders here, yet.";
			$scope.state.noRemindersIcon = qmService.getVariableCategoryInfo($stateParams.variableCategoryName).ionIcon;
			if(!$scope.stateParams.title){ $scope.stateParams.title = $stateParams.variableCategoryName; }
			if(!$scope.stateParams.addButtonText) {
				$scope.stateParams.addButtonText = 'Add New ' + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1);
			}
			$scope.stateParams.addMeasurementButtonText = "Add  " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1) + " Measurement";
            actionButtons[2] = { text: '<i class="icon ' + qmService.ionIcons.history + '"></i>' +
                $stateParams.variableCategoryName + ' History'};
            actionButtons[3] = { text: '<i class="icon ' + qmService.ionIcons.reminder + '"></i>' + $scope.stateParams.addButtonText};
		}
        actionButtons[4] = qmService.actionSheets.actionSheetButtons.measurementAddSearch;
        actionButtons[5] = qmService.actionSheets.actionSheetButtons.charts;
        actionButtons[6] = qmService.actionSheets.actionSheetButtons.refresh;
        actionButtons[7] = qmService.actionSheets.actionSheetButtons.settings;
		$scope.state.showButtons = true;
		getTrackingReminders();
		qmService.rootScope.setShowActionSheetMenu(function() {
			var hideSheet = $ionicActionSheet.show({
				buttons: actionButtons,
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {qmLogService.debug('CANCELLED', null);},
				buttonClicked: function(index) {
					qmLogService.debug('BUTTON CLICKED', null, index);
					if(index === 0){$rootScope.reminderOrderParameter = 'variableName';}
					if(index === 1){$rootScope.reminderOrderParameter = 'reminderStartTimeLocal';}
					if(index === 2){qmService.goToState('app.historyAll', {variableCategoryName: $stateParams.variableCategoryName});}
                    if(index === 3){qmService.goToState('app.reminderSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 4){qmService.goToState('app.measurementAddSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 5){qmService.goToState('app.chartSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 6){$scope.refreshReminders();}
                    if(index === 7){qmService.goToState(qmStates.settings);}
					return true;
				}
			});
			$timeout(function() { hideSheet(); }, 20000);
		});
	});
	if(!$rootScope.reminderOrderParameter){ $rootScope.reminderOrderParameter = 'variableName'; }
	function showAppropriateHelpInfoCards(){
		$scope.state.showTreatmentInfoCard = (!$scope.state.trackingReminders || $scope.state.trackingReminders.length === 0) &&
			(window.location.href.indexOf('Treatments') > -1 || $stateParams.variableCategoryName === 'Anything');
		$scope.state.showSymptomInfoCard = ((!$scope.state.trackingReminders || $scope.state.trackingReminders.length === 0) &&
			window.location.href.indexOf('Symptom') > -1 || $stateParams.variableCategoryName === 'Anything');
	}
	function hideLoader() {
        $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
        qmService.hideLoader();
    }
	function addRemindersToScope(allTrackingReminderTypes) {
		hideLoader();
		if(!allTrackingReminderTypes.allTrackingReminders || !allTrackingReminderTypes.allTrackingReminders.length){
			qmLogService.info('No reminders!', null);
			$scope.state.showNoRemindersCard = true;
			return;
		}
        qmLogService.info('Got ' + allTrackingReminderTypes.allTrackingReminders.length + ' ' + $stateParams.variableCategoryName +
            " category allTrackingReminderTypes.allTrackingReminders!", null);
		$scope.state.showNoRemindersCard = false;
		$scope.state.favorites = allTrackingReminderTypes.favorites;
		$scope.state.trackingReminders = allTrackingReminderTypes.trackingReminders;
        var count = 0;
        if(allTrackingReminderTypes.trackingReminders && allTrackingReminderTypes.trackingReminders.length){count = allTrackingReminderTypes.trackingReminders.length;}
        qmLogService.info('Got ' + count + ' ' + $stateParams.variableCategoryName + ' category allTrackingReminderTypes.trackingReminders', null);
		$scope.state.archivedTrackingReminders = allTrackingReminderTypes.archivedTrackingReminders;
		showAppropriateHelpInfoCards();
	}
	$scope.refreshReminders = function () {
		qmService.showInfoToast('Syncing...');
		qmService.syncTrackingReminders(true).then(function(){
            hideLoader();
			getTrackingReminders();
		});
	};
	var getTrackingReminders = function(){
		if(qm.urlHelper.getParam('variableCategoryName')){$stateParams.variableCategoryName = qm.urlHelper.getParam('variableCategoryName');}
		qmLogService.info('Getting ' + $stateParams.variableCategoryName + ' category reminders', null);
		qmService.getAllReminderTypes($stateParams.variableCategoryName).then(function (allTrackingReminderTypes) {
			addRemindersToScope(allTrackingReminderTypes);
		});
	};
	$scope.showMoreNotificationInfoPopup = function(){
		var moreNotificationInfoPopup = $ionicPopup.show({
			title: "Individual Notifications Disabled",
			subTitle: 'Currently, you will only get one non-specific repeating device notification at a time.',
			scope: $scope,
			template: "It is possible to instead get a separate device notification for each tracking reminder that " +
				"you create.  You can change this setting or update the notification frequency on the settings page.",
			buttons:[
				{text: 'Settings', type: 'button-positive', onTap: function(e) { qmService.goToState('app.settings'); }},
				{text: 'OK', type: 'button-assertive'}
			]
		});
		moreNotificationInfoPopup.then(function(res) { qmLogService.debug('Tapped!', null, res); });
	};
	$scope.edit = function(trackingReminder){
		trackingReminder.fromState = $state.current.name;
		qmService.goToState('app.reminderAdd', { reminder : trackingReminder, fromUrl: window.location.href });
	};
	$scope.addNewReminderButtonClick = function(){
		if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
			qmService.goToState('app.reminderSearch', {variableCategoryName : $stateParams.variableCategoryName, fromUrl: window.location.href});}
		else {qmService.goToState('app.reminderSearch');}
	};
	$scope.addNewMeasurementButtonClick = function(){
		if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
			qmService.goToState('app.measurementAddSearch', {variableCategoryName : $stateParams.variableCategoryName});}
		else { qmService.goToState('app.measurementAddSearch'); }
	};
	$scope.addMeasurementForReminder = function (trackingReminder) {
        qmService.goToState('app.measurementAdd', {trackingReminder: trackingReminder, variableName: trackingReminder.variableName});
	};
	$scope.deleteReminder = function(reminder){
		reminder.hide = true;
		qmService.storage.deleteById('trackingReminders', reminder.trackingReminderId);
			//.then(function(){getTrackingReminders();});
		qmService.deleteTrackingReminderDeferred(reminder).then(function(){qmLogService.debug('Reminder deleted', null);}, function(error){
			qmLogService.error('Failed to Delete Reminder: ' + error);
		});
	};
	$scope.showActionSheet = function(trackingReminder) {
		var variableObject = qmService.convertTrackingReminderToVariableObject(trackingReminder);
        var buttons = [
            { text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
            qmService.actionSheets.actionSheetButtons.measurementAdd,
            qmService.actionSheets.actionSheetButtons.charts,
            qmService.actionSheets.actionSheetButtons.historyAllVariable,
            qmService.actionSheets.actionSheetButtons.variableSettings
        ];
        buttons.push(qmService.actionSheets.actionSheetButtons.compare);
        if(variableObject.outcome){buttons.push(qmService.actionSheets.actionSheetButtons.predictors);} else {buttons.push(qmService.actionSheets.actionSheetButtons.outcomes);}
        buttons = qmService.actionSheets.addActionArrayButtonsToActionSheet(trackingReminder.actionArray, buttons);
		var hideSheet = $ionicActionSheet.show({
			buttons: buttons,
			destructiveText: '<i class="icon ion-trash-a"></i>Delete',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {qmLogService.debug('CANCELLED', null);},
			buttonClicked: function(index) {
				qmLogService.debug('BUTTON CLICKED', null, index);
				if(index === 0){$scope.edit(trackingReminder);}
				if(index === 1){qmService.goToState('app.measurementAdd', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 2){qmService.goToState('app.charts', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 3){qmService.goToState('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 4){qmService.goToVariableSettingsByObject(variableObject);}
                if(index === 5){qmService.goToCorrelationsListForVariable(variableObject);}
                if(index === 6 && variableObject){qmService.goToStudyCreationForVariable(variableObject);}
                var buttonIndex = 7;
                for(var i=0; i < trackingReminder.actionArray.length; i++){
                    if(trackingReminder.actionArray[i].action !== "snooze"){
                        if(index === buttonIndex){$scope.trackByFavorite(trackingReminder, trackingReminder.actionArray[i].modifiedValue);}
                        buttonIndex++;
                    }
                }
				return true;
			},
			destructiveButtonClicked: function() {
				$scope.deleteReminder(trackingReminder);
				return true;
			}
		});
		$timeout(function() {hideSheet();}, 20000);
	};
    $rootScope.$on('broadcastGetTrackingReminders', function() {
        qmLogService.info('broadcastGetTrackingReminders broadcast received..');
        getTrackingReminders();
    });
}]);
