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
	    if(!$rootScope.reminderOrderParameter){ $rootScope.reminderOrderParameter = 'variableName'; }
		function showAppropriateHelpInfoCards(){
			$scope.state.showTreatmentInfoCard = ($scope.state.trackingReminders.length === 0) &&
				(window.location.href.indexOf('Treatments') > -1 || $stateParams.variableCategoryName === 'Anything');
			$scope.state.showSymptomInfoCard = ($scope.state.trackingReminders.length === 0) &&
				(window.location.href.indexOf('Symptom') > -1 || $stateParams.variableCategoryName === 'Anything');
		}
		$scope.refreshReminders = function () {
			$scope.showLoader('Syncing...');
			quantimodoService.syncTrackingReminders().then(function (trackingReminders) {
                $scope.state.trackingReminders = quantimodoService.filterByStringProperty(trackingReminders, 'variableCategoryName', $stateParams.variableCategoryName);
                if(!$scope.state.trackingReminders || !$scope.state.trackingReminders.length){$scope.state.showNoRemindersCard = true;}else{$scope.state.showNoRemindersCard = false;}
				$scope.hideLoader();
                $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
			});
		};
		var getTrackingReminders = function(){
			quantimodoService.getTrackingRemindersDeferred($stateParams.variableCategoryName)
				.then(function (trackingReminders) {
					$scope.state.trackingReminders = trackingReminders;
                    if(!$scope.state.trackingReminders || !$scope.state.trackingReminders.length){$scope.state.showNoRemindersCard = true;}else{$scope.state.showNoRemindersCard = false;}
					showAppropriateHelpInfoCards();
					$scope.hideLoader();
					$scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
				});
		};
	    var init = function(){
            $rootScope.hideNavigationMenu = false;
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			if (!$stateParams.variableCategoryName || $stateParams.variableCategoryName === "Anything") {
				if(!$rootScope.stateParams.title) { $rootScope.stateParams.title = "Manage Reminders"; }
				if(!$rootScope.stateParams.addButtonText) { $rootScope.stateParams.addButtonText = "Add new reminder"; }
			} else {
                $scope.state.noRemindersTitle = "No " + $stateParams.variableCategoryName.toLowerCase() + "!";
				$scope.state.noRemindersText = "You don't have any " + $stateParams.variableCategoryName.toLowerCase() + ", yet.";
                $scope.state.noRemindersIcon = quantimodoService.getVariableCategoryInfo($stateParams.variableCategoryName).ionIcon;
				if(!$rootScope.stateParams.title){ $rootScope.stateParams.title = $stateParams.variableCategoryName; }
				if(!$rootScope.stateParams.addButtonText) {
					$rootScope.stateParams.addButtonText = 'Add new ' + pluralize($filter('wordAliases')($stateParams.variableCategoryName.toLowerCase()), 1);
				}
			}
			$scope.state.showButtons = true;
			getTrackingReminders();
			$scope.refreshReminders();
			// Triggered on a button click, or some other target
			$rootScope.showActionSheetMenu = function() {
				// Show the action sheet
				var hideSheet = $ionicActionSheet.show({
					buttons: [
						{ text: '<i class="icon ion-arrow-down-c"></i>Sort by Name'},
						{ text: '<i class="icon ion-clock"></i>Sort by Time' }
					],
					cancelText: '<i class="icon ion-ios-close"></i>Cancel',
					cancel: function() {console.debug('CANCELLED');},
					buttonClicked: function(index) {
						console.debug('BUTTON CLICKED', index);
						if(index === 0){
							console.debug("Sort by name");
							$rootScope.reminderOrderParameter = 'variableName';
							init();
						}
						if(index === 1){
							console.debug("Sort by time");
							$rootScope.reminderOrderParameter = 'reminderStartTimeLocal';
							init();
						}
						return true;
					}
				});
				$timeout(function() { hideSheet(); }, 20000);
			};
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
	    $scope.edit = function(reminder){
	    	reminder.fromState = $state.current.name;
	    	$state.go('app.reminderAdd', { reminder : reminder, fromUrl: window.location.href });
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
				quantimodoService.getTrackingRemindersFromLocalStorage($stateParams.variableCategoryName).then(function (trackingReminders) {
					$scope.state.trackingReminders = trackingReminders;
				});
			});
			quantimodoService.deleteTrackingReminderDeferred(reminder.trackingReminderId).then(function(){console.debug("Reminder deleted");}, function(error){
				if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
				console.error('Failed to Delete Reminder!');
			});
	    };
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
    		init();
    	});
		$scope.showActionSheet = function(trackingReminder) {
			var variableObject = {id : trackingReminder.variableId, name : trackingReminder.variableName};
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
					{ text: '<i class="icon ion-ios-star"></i>Add ' + ' to Favorites' },
					{ text: '<i class="icon ion-edit"></i>Record ' + ' Measurement' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'}
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Delete Reminder',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {console.debug('CANCELLED');},
				buttonClicked: function(index) {
					console.debug('BUTTON CLICKED', index);
					if(index === 0){$scope.edit(trackingReminder);}
					if(index === 1){$scope.addToFavoritesUsingVariableObject(variableObject);}
					if(index === 2){$scope.goToAddMeasurementForVariableObject(variableObject);}
					if(index === 3){$scope.goToChartsPageForVariableObject(variableObject);}
					if(index === 4){$scope.goToHistoryForVariableObject(variableObject);}
					if (index === 5) {$state.go('app.variableSettings', {variableName: trackingReminder.variableName});}
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
