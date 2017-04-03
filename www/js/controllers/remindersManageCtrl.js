angular.module('starter').controller('RemindersManageCtrl', function($scope, $state, $stateParams, $ionicPopup, $rootScope, $timeout,
												$ionicLoading, $filter, $ionicActionSheet,  quantimodoService) {
	    $scope.controller_name = "RemindersManageCtrl";
		console.debug('Loading ' + $scope.controller_name);
        $rootScope.showFilterBarSearchIcon = false;
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
            noRemindersTitle: "No reminders!",
			noRemindersText: "You don't have any reminders, yet.",
            noRemindersIcon: "ion-android-notifications-none"
	    };
        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("beforeEnter RemindersManageCtrl");
        	$ionicLoading.show();
            $rootScope.hideNavigationMenu = false;
            $scope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            if (!$stateParams.variableCategoryName || $stateParams.variableCategoryName === "Anything") {
                if(!$scope.stateParams.title) { $scope.stateParams.title = "Manage Reminders"; }
                if(!$scope.stateParams.addButtonText) { $scope.stateParams.addButtonText = "Add new reminder"; }
            } else {
                $scope.state.noRemindersTitle = "No " + $stateParams.variableCategoryName.toLowerCase() + "!";
                $scope.state.noRemindersText = "You don't have any " + $stateParams.variableCategoryName.toLowerCase() + ", yet.";
                $scope.state.noRemindersIcon = quantimodoService.getVariableCategoryInfo($stateParams.variableCategoryName).ionIcon;
                if(!$scope.stateParams.title){ $scope.stateParams.title = $stateParams.variableCategoryName; }
                if(!$scope.stateParams.addButtonText) {
                    $scope.stateParams.addButtonText = 'Add New ' + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1);
                }
                $scope.state.addMeasurementButtonText = "Add  " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1) + " Measurement";
            }
            $scope.state.showButtons = true;
            getTrackingReminders();
            $rootScope.showActionSheetMenu = function() {
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: '<i class="icon ion-arrow-down-c"></i>Sort by Name'},
                        { text: '<i class="icon ion-clock"></i>Sort by Time' }
                    ],
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function() {console.debug('CANCELLED');},
                    buttonClicked: function(index) {
                        console.debug('BUTTON CLICKED', index);
                        if(index === 0){$rootScope.reminderOrderParameter = 'variableName';}
                        if(index === 1){$rootScope.reminderOrderParameter = 'reminderStartTimeLocal';}
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
		function processTrackingReminders(trackingReminders) {
            trackingReminders = quantimodoService.filterByStringProperty(trackingReminders, 'variableCategoryName', $stateParams.variableCategoryName);
            $scope.hideLoader();
            $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
            if(!trackingReminders || !trackingReminders.length){
                $scope.state.showNoRemindersCard = true;
                return;
            }
            $scope.state.showNoRemindersCard = false;
            $scope.state.favorites = trackingReminders.filter(function( trackingReminder ) {return trackingReminder.reminderFrequency === 0;});
            $scope.state.trackingReminders = trackingReminders.filter(function( trackingReminder ) {
            	return trackingReminder.reminderFrequency !== 0 && trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') === -1;
            });
            $scope.state.archivedTrackingReminders = trackingReminders.filter(function( trackingReminder ) {
                return trackingReminder.reminderFrequency !== 0 && trackingReminder.valueAndFrequencyTextDescription.toLowerCase().indexOf('ended') !== -1;
            });
            showAppropriateHelpInfoCards();
        }
		$scope.refreshReminders = function () {
			$scope.showLoader('Syncing...');
			quantimodoService.syncTrackingReminders().then(function (trackingReminders) {processTrackingReminders(trackingReminders);});
		};
		var getTrackingReminders = function(){
			quantimodoService.getTrackingRemindersDeferred($stateParams.variableCategoryName).then(function (trackingReminders) {processTrackingReminders(trackingReminders);});
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
				$state.go('app.reminderSearchCategory', {variableCategoryName : $stateParams.variableCategoryName, fromUrl: window.location.href});}
			else {$state.go('app.reminderSearch');}
	    };
		$scope.addNewMeasurementButtonClick = function(){
			if ($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything') {
				$state.go('app.measurementAddSearchCategory', {variableCategoryName : $stateParams.variableCategoryName});}
			else { $state.go('app.measurementAddSearch'); }
		};
	    $scope.deleteReminder = function(reminder){
			quantimodoService.deleteElementOfLocalStorageItemById('trackingReminders', reminder.trackingReminderId) .then(function(){
				getTrackingReminders();
			});
			quantimodoService.deleteTrackingReminderDeferred(reminder.trackingReminderId).then(function(){console.debug("Reminder deleted");}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				console.error('Failed to Delete Reminder!');
			});
	    };
		$scope.showActionSheet = function(trackingReminder) {
			var variableObject = {id : trackingReminder.variableId, name : trackingReminder.variableName};
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-android-notifications-none"></i>Edit'},
					{ text: '<i class="icon ion-edit"></i>Record Measurement' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>Charts'},
					{ text: '<i class="icon ion-ios-list-outline"></i>History'},
					{ text: '<i class="icon ion-settings"></i>Analysis Settings'}
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Delete',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {console.debug('CANCELLED');},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
					if(index === 0){$scope.edit(trackingReminder);}
					if(index === 1){$state.go('app.measurementAdd', {reminderNotification: trackingReminder});}
					if(index === 2){$state.go('app.charts', {variableObject: $rootScope.variableObject});}
					if(index === 3){$state.go('app.historyAllVariable', {variableObject: variableObject});}
					if(index === 4){$state.go('app.variableSettings', {variableName: trackingReminder.variableName});}
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
