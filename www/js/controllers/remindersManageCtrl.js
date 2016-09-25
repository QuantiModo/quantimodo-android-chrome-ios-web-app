angular.module('starter')

	.controller('RemindersManageCtrl', function($scope, $state, $stateParams, $ionicPopup, $rootScope, $timeout, $ionicLoading, $filter,
												 $ionicActionSheet,  authService,
												localStorageService, reminderService) {

	    $scope.controller_name = "RemindersManageCtrl";

		console.log('Loading ' + $scope.controller_name);
	    
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
			orderParameter : 'variableName'
	    };

		function showAppropriateHelpInfoCards(){
			$scope.state.showTreatmentInfoCard = ($scope.state.trackingReminders.length === 0) && (window.location.href.indexOf('Treatments') > -1);
			$scope.state.showSymptomInfoCard = ($scope.state.trackingReminders.length === 0) && (window.location.href.indexOf('Symptom') > -1);
		}

	    // when date is updated
	    $scope.currentDatePickerCallback = function (val) {
	    	if(typeof(val)==='undefined'){
	    		console.log('Date not selected');
	    	} else {
	    		$scope.state.measurementDate = new Date(val);
	    	}
	    };

		// when time is changed
		$scope.currentTimePickerCallback = function (val) {
			if (typeof (val) === 'undefined') {
				console.log('Time not selected');
			} else {
				var a = new Date();
				a.setHours(val.hours);
				a.setMinutes(val.minutes);
				$scope.state.slots.epochTime = a.getTime()/1000;
			}
		};

		$scope.refreshReminders = function () {
			if($rootScope.syncingReminders !== true) {
				console.debug("ReminderMange init: calling refreshTrackingRemindersAndScheduleAlarms");
				$scope.showLoader('Reminders coming down the pipes...');
				reminderService.refreshTrackingRemindersAndScheduleAlarms().then(function () {
					getTrackingReminders();
				});
			} else {
				$scope.$broadcast('scroll.refreshComplete');
			}
		};

		var getTrackingReminders = function(){
			reminderService.getTrackingReminders($stateParams.variableCategoryName)
				.then(function (trackingReminders) {
					$scope.state.trackingReminders = trackingReminders;
					showAppropriateHelpInfoCards();
					$scope.hideLoader();
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
				});
		};
		
	    $scope.init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

			if (!$stateParams.variableCategoryName || $stateParams.variableCategoryName === "Anything") {
				if(!$rootScope.stateParams.title) {
					$rootScope.stateParams.title = "Manage Reminders";
				}
				if(!$rootScope.stateParams.addButtonText) {
					$rootScope.stateParams.addButtonText = "Add new reminder";
				}
			}
			else {
				if(!$rootScope.stateParams.title){
					$rootScope.stateParams.title = "Manage " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1) + " Reminders";
				}
				if(!$rootScope.stateParams.addButtonText) {
					$rootScope.stateParams.addButtonText = 'Add new ' +
						pluralize($filter('wordAliases')($stateParams.variableCategoryName.toLowerCase()), 1) + ' reminder';
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
					cancel: function() {
						console.log('CANCELLED');
					},
					buttonClicked: function(index) {
						console.log('BUTTON CLICKED', index);
						if(index === 0){
							console.debug("Sort by name");
							$scope.state.orderParameter = 'variableName';
							$scope.init();
						}
						if(index === 1){
							console.debug("Sort by time");
							$scope.state.orderParameter = 'reminderStartTimeLocal';
							$scope.init();
						}

						return true;
					}
				});

				$timeout(function() {
					hideSheet();
				}, 20000);

			};
	    };

		$scope.showMoreNotificationInfoPopup = function(){
			var moreNotificationInfoPopup = $ionicPopup.show({
				title: "Individual Notifications Disabled",
				subTitle: 'Currently, you will only get one non-specific repeating device notification at a time.',
				scope: $scope,
				template: "It is possible to instead get a separate device notification for each tracking reminder that you create.  You can change this setting or update the notification frequency on the settings page.",
				buttons:[
					{
						text: 'Settings',
						type: 'button-positive',
						onTap: function(e) {
							$state.go('app.settings');
						}
					},
					{
						text: 'OK',
						type: 'button-assertive'
					}
				]

			});

			moreNotificationInfoPopup.then(function(res) {
				console.log('Tapped!', res);
			});
		};

	    $scope.edit = function(reminder){
	    	reminder.fromState = $state.current.name;
	    	$state.go('app.reminderAdd', 
	    	{
	    		reminder : reminder,
	    		fromUrl: window.location.href
	    	});
	    };

	    $scope.addNewReminderButtonClick = function(){
			if ($stateParams.variableCategoryName !== 'Anything') {
				$state.go('app.reminderSearchCategory',
					{
						variableCategoryName : $stateParams.variableCategoryName,
						fromUrl: window.location.href
					});
			}
			else {
				$state.go('app.reminderSearch',
					{
						variableCategoryName : $stateParams.variableCategoryName,
						fromUrl: window.location.href
					});
			}
	    };

	    $scope.deleteReminder = function(reminder, $index){
	    	if($index !== null){
				$scope.state.trackingReminders.splice($index, 1);
			}

			localStorageService.deleteElementOfItemById('trackingReminders', reminder.trackingReminderId);
			reminderService.deleteReminder(reminder.trackingReminderId)
				.then(function(){
					reminderService.refreshTrackingReminderNotifications();
					console.log("Reminder deleted");
				}, function(err){
					if (typeof Bugsnag !== "undefined") {
						Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					}
					$ionicLoading.hide();
					$scope.loading = false;
					console.error('Failed to Delete Reminder!');
				});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
			$scope.hideLoader();
    		$scope.init();
    	});

		// Triggered on a button click, or some other target
		$scope.showActionSheet = function(trackingReminder, $index) {

			$scope.state.trackingReminder = trackingReminder;
			$scope.state.variableObject = trackingReminder;
			$scope.state.variableObject.id = trackingReminder.variableId;
			$scope.state.variableObject.name = trackingReminder.variableName;
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
					{ text: '<i class="icon ion-ios-star"></i>Add ' + ' to Favorites' },
					{ text: '<i class="icon ion-edit"></i>Record ' + ' Measurement' },
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
					{ text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
					{ text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
					{ text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
				],
				destructiveText: '<i class="icon ion-trash-a"></i>Delete Reminder',
				cancelText: '<i class="icon ion-ios-close"></i>Cancel',
				cancel: function() {
					console.log('CANCELLED');
				},
				buttonClicked: function(index) {
					console.log('BUTTON CLICKED', index);
					if(index === 0){
						$scope.edit($scope.state.trackingReminder);
					}
					if(index === 1){
						$scope.addToFavoritesUsingVariableObject($scope.state.variableObject);
					}
					if(index === 2){
						$scope.goToAddMeasurementForVariableObject($scope.state.variableObject);
					}
					if(index === 3){
						$scope.goToChartsPageForVariableObject($scope.state.variableObject);
					}
					if(index === 4){
						$scope.goToHistoryForVariableObject($scope.state.variableObject);
					}
					if (index === 5) {
						$state.go('app.variableSettings',
							{variableName: $scope.state.trackingReminder.variableName});
					}
					if(index === 6){
						$state.go('app.predictors',
							{
								variableObject: $scope.state.variableObject,
								requestParams: {
									effect:  $scope.state.variableObject.name,
									correlationCoefficient: "(gt)0"
								}
							});
					}
					if(index === 7){
						$state.go('app.predictors',
							{
								variableObject: $scope.state.variableObject,
								requestParams: {
									effect:  $scope.state.variableObject.name,
									correlationCoefficient: "(lt)0"
								}
							});
					}

					return true;
				},
				destructiveButtonClicked: function() {
					$scope.deleteReminder($scope.state.trackingReminder);
					return true;
				}
			});

			$timeout(function() {
				hideSheet();
			}, 20000);
		};
	});