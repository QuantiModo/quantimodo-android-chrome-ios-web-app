angular.module('starter').controller('RemindersManageCtrl', function($scope, $state, $stateParams, $ionicPopup, $rootScope, $timeout, $ionicLoading, $filter, $ionicActionSheet,  qmService) {
	$scope.controller_name = "RemindersManageCtrl";
	console.debug('Loading ' + $scope.controller_name);
	$rootScope.showFilterBarSearchIcon = false;
    qmService.sendToLoginIfNecessaryAndComeBack();
	$scope.state = {
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
	$scope.$on('$ionicView.beforeEnter', function(e) { console.debug("beforeEnter RemindersManageCtrl");
		if(qmService.getUrlParameter('variableCategoryName')){$stateParams.variableCategoryName = qmService.getUrlParameter('variableCategoryName');}
		qmService.showBasicLoader();
		$rootScope.hideNavigationMenu = false;
		$scope.stateParams = $stateParams;
		var actionButtons = [
			{ text: '<i class="icon ion-arrow-down-c"></i>Sort by Name'},
			{ text: '<i class="icon ion-clock"></i>Sort by Time' }
		];
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
		if (!$stateParams.variableCategoryName || $stateParams.variableCategoryName === "Anything") {
			if(!$scope.stateParams.title) { $scope.stateParams.title = "Manage Reminders"; }
			if(!$scope.stateParams.addButtonText) { $scope.stateParams.addButtonText = "Add a Variable"; }
            if(!$scope.stateParams.addMeasurementButtonText) { $scope.stateParams.addMeasurementButtonText = "Record Measurement"; }
			actionButtons[2] = qmService.actionSheetButtons.history;
            actionButtons[3] = qmService.actionSheetButtons.addReminder;
		} else {
			$scope.state.noRemindersTitle = "Add " + $stateParams.variableCategoryName;
			$scope.state.noRemindersText = "You haven't saved any " + $stateParams.variableCategoryName.toLowerCase() + " favorites or reminders here, yet.";
			$scope.state.noRemindersIcon = qmService.getVariableCategoryInfo($stateParams.variableCategoryName).ionIcon;
			if(!$scope.stateParams.title){ $scope.stateParams.title = $stateParams.variableCategoryName; }
			if(!$scope.stateParams.addButtonText) {
				$scope.stateParams.addButtonText = 'Add New ' + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1);
			}
			$scope.stateParams.addMeasurementButtonText = "Add  " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1) + " Measurement";
            actionButtons[2] = { text: '<i class="icon ' + qmService.ionIcons.history + '"></i>' + $stateParams.variableCategoryName + ' History'};
            actionButtons[3] = { text: '<i class="icon ' + qmService.ionIcons.reminder + '"></i>' + $scope.stateParams.addButtonText};
		}
        actionButtons[4] = qmService.actionSheetButtons.recordMeasurement;
        actionButtons[5] = qmService.actionSheetButtons.charts;
		$scope.state.showButtons = true;
		getTrackingReminders();
		$rootScope.showActionSheetMenu = function() {
			var hideSheet = $ionicActionSheet.show({
				buttons: actionButtons,
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {console.debug('CANCELLED');},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
					if(index === 0){$rootScope.reminderOrderParameter = 'variableName';}
					if(index === 1){$rootScope.reminderOrderParameter = 'reminderStartTimeLocal';}
					if(index === 2){$state.go('app.historyAll', {variableCategoryName: $stateParams.variableCategoryName});}
                    if(index === 3){$state.go('app.reminderSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 4){$state.go('app.measurementAddSearch', {variableCategoryName : $stateParams.variableCategoryName});}
                    if(index === 5){$state.go('app.chartSearch', {variableCategoryName : $stateParams.variableCategoryName});}
					return true;
				}
			});
			$timeout(function() { hideSheet(); }, 20000);
		};
	});
	if(!$rootScope.reminderOrderParameter){ $rootScope.reminderOrderParameter = 'variableName'; }
	function showAppropriateHelpInfoCards(){
		$scope.state.showTreatmentInfoCard = ($scope.state.trackingReminders.length === 0) && (window.location.href.indexOf('Treatments') > -1 || $stateParams.variableCategoryName === 'Anything');
		$scope.state.showSymptomInfoCard = ($scope.state.trackingReminders.length === 0) && (window.location.href.indexOf('Symptom') > -1 || $stateParams.variableCategoryName === 'Anything');
	}
	function addRemindersToScope(allTrackingReminderTypes) {
		$scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
		qmService.hideLoader();
		if(!allTrackingReminderTypes.allTrackingReminders || !allTrackingReminderTypes.allTrackingReminders.length){
			$scope.state.showNoRemindersCard = true;
			return;
		}
		$scope.state.showNoRemindersCard = false;
		$scope.state.favorites = allTrackingReminderTypes.favorites;
		$scope.state.trackingReminders = allTrackingReminderTypes.trackingReminders;
		$scope.state.archivedTrackingReminders = allTrackingReminderTypes.archivedTrackingReminders;
		showAppropriateHelpInfoCards();
	}
	$scope.refreshReminders = function () {
		qmService.showInfoToast('Syncing...');
		qmService.syncTrackingReminders(true).then(function(){getTrackingReminders();});
	};
	var getTrackingReminders = function(){
		qmService.getAllReminderTypes($stateParams.variableCategoryName).then(function (allTrackingReminderTypes) {addRemindersToScope(allTrackingReminderTypes);});
	};
	$scope.showMoreNotificationInfoPopup = function(){
		var moreNotificationInfoPopup = $ionicPopup.show({
			title: "Individual Notifications Disabled",
			subTitle: 'Currently, you will only get one non-specific repeating device notification at a time.',
			scope: $scope,
			template: "It is possible to instead get a separate device notification for each tracking reminder that " +
				"you create.  You can change this setting or update the notification frequency on the settings page.",
			buttons:[
				{text: 'Settings', type: 'button-positive', onTap: function(e) { $state.go('app.settings'); }},
				{text: 'OK', type: 'button-assertive'}
			]
		});
		moreNotificationInfoPopup.then(function(res) { console.debug('Tapped!', res); });
	};
	$scope.edit = function(trackingReminder){
		trackingReminder.fromState = $state.current.name;
		$state.go('app.reminderAdd', { reminder : trackingReminder, fromUrl: window.location.href });
	};
	$scope.addNewReminderButtonClick = function(){
		if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
			$state.go('app.reminderSearch', {variableCategoryName : $stateParams.variableCategoryName, fromUrl: window.location.href});}
		else {$state.go('app.reminderSearch');}
	};
	$scope.addNewMeasurementButtonClick = function(){
		if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
			$state.go('app.measurementAddSearch', {variableCategoryName : $stateParams.variableCategoryName});}
		else { $state.go('app.measurementAddSearch'); }
	};
	$scope.deleteReminder = function(reminder){
		reminder.hide = true;
		qmService.deleteElementOfLocalStorageItemById('trackingReminders', reminder.trackingReminderId).then(function(){getTrackingReminders();});
		qmService.deleteTrackingReminderDeferred(reminder).then(function(){console.debug("Reminder deleted");}, function(error){
			qmService.logError('Failed to Delete Reminder: ' + error);
		});
	};
	$scope.showActionSheet = function(trackingReminder) {
		var variableObject = qmService.convertTrackingReminderToVariableObject(trackingReminder);
		var hideSheet = $ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-android-notifications-none"></i>Edit'},
				qmService.actionSheetButtons.recordMeasurement,
				qmService.actionSheetButtons.charts,
				qmService.actionSheetButtons.history,
				qmService.actionSheetButtons.analysisSettings
			],
			destructiveText: '<i class="icon ion-trash-a"></i>Delete',
			cancelText: '<i class="icon ion-ios-close"></i>Cancel',
			cancel: function() {console.debug('CANCELLED');},
			buttonClicked: function(index) {
				console.debug('BUTTON CLICKED', index);
				if(index === 0){$scope.edit(trackingReminder);}
				if(index === 1){$state.go('app.measurementAdd', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 2){$state.go('app.charts', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 3){$state.go('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
				if(index === 4){$state.go('app.variableSettings', {variableObject: variableObject, variableName: variableObject.name});}
				return true;
			},
			destructiveButtonClicked: function() {
				$scope.deleteReminder(trackingReminder);
				return true;
			}
		});
		$timeout(function() {hideSheet();}, 20000);
	};
});
