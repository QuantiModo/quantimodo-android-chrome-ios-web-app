angular.module('starter')

	.controller('RemindersManageCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
												reminderService, $ionicLoading, measurementService, utilsService,
												$stateParams, $filter, $rootScope, $ionicActionSheet, $timeout,
												variableCategoryService){

	    $scope.controller_name = "RemindersManageCtrl";

		console.log('Loading ' + $scope.controller_name);
	    
	    $scope.state = {
			showButtons : false,
			variableCategory : $stateParams.variableCategoryName,
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	reminderDefaultValue : "",
	    	selected1to5Value : false,
	    	allReminders : [],
	    	filteredReminders : [],
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
			showSymptomInfoCard : false
	    };


		if($stateParams.variableCategoryName){
			$scope.state.title = "Manage " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1) + " Reminders";
			$scope.state.addButtonText = 'Add new ' +
				pluralize($filter('wordAliases')($stateParams.variableCategoryName.toLowerCase()), 1) + ' reminder';
		} else {
			$scope.state.title = "Manage Reminders";
			$scope.state.addButtonText = "Add new reminder";
		}

	    $scope.selectPrimaryOutcomeVariableValue = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');

	        jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

	        $scope.state.selected1to5Value = val;

		};

		function showAppropriateHelpInfoCards(){
			$scope.state.showTreatmentInfoCard = (!$scope.state.allReminders.length) && (window.location.href.indexOf('Treatments') > -1);
			$scope.state.showSymptomInfoCard = (!$scope.state.allReminders.length) && (window.location.href.indexOf('Symptom') > -1);
		}

		function getTrackingRemindersFromLocalStorage(){
			$scope.state.allReminders = [];
			var nonFavoriteReminders = [];
			var unfilteredReminders = JSON.parse(localStorageService.getItemSync('trackingReminders'));
			unfilteredReminders =
				variableCategoryService.attachVariableCategoryIcons(unfilteredReminders);
			if(unfilteredReminders) {
				for(var k = 0; k < unfilteredReminders.length; k++){
					if(unfilteredReminders[k].reminderFrequency !== 0){
						nonFavoriteReminders.push(unfilteredReminders[k]);
					}
				}
				if($stateParams.variableCategoryName) {
					for(var j = 0; j < nonFavoriteReminders.length; j++){
						if($stateParams.variableCategoryName === nonFavoriteReminders[j].variableCategoryName){
							$scope.state.allReminders.push(nonFavoriteReminders[j]);
						}
					}
					showAppropriateHelpInfoCards();
				} else {
					$scope.state.allReminders = nonFavoriteReminders;
					showAppropriateHelpInfoCards();
				}
				$scope.state.allReminders = reminderService.addRatingTimesToDailyReminders($scope.state.allReminders);
			} else {
				showAppropriateHelpInfoCards();
			}
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


	    // constructor
	    $scope.init = function(){
			Bugsnag.context = "reminderManage";
			getTrackingRemindersFromLocalStorage();
			var isAuthorized = authService.checkAuthOrSendToLogin();
			if (typeof analytics !== 'undefined')  { analytics.trackView("Manage Reminders Controller"); }
			if(isAuthorized){
				$scope.state.showButtons = true;
				$scope.showHelpInfoPopupIfNecessary();
				if(!$rootScope.syncingReminders) {
					console.debug("ReminderMange init: calling refreshTrackingRemindersAndScheduleAlarms");
					reminderService.refreshTrackingRemindersAndScheduleAlarms().then(function () {
						getTrackingRemindersFromLocalStorage();
						//Stop the ion-refresher from spinning
						$scope.$broadcast('scroll.refreshComplete');
					});
				} else {
					$scope.$broadcast('scroll.refreshComplete');
				}
			} 
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
			if ($stateParams.variableCategoryName) {
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
			localStorageService.deleteElementOfItemById('trackingReminders', reminder.trackingReminderId).then(function(){
					getTrackingRemindersFromLocalStorage();
				});

			reminderService.deleteReminder(reminder.id)
	    	.then(function(){

	    	}, function(err){
				Bugsnag.notify(err, JSON.stringify(err), {}, "error");
	    		$ionicLoading.hide();
				$scope.loading = false;
	    		utilsService.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
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
					{ text: '<i class="icon ion-arrow-graph-up-right"></i>' + $scope.state.variableObject.name + ' Visualized'},
					{ text: '<i class="icon ion-ios-list-outline"></i>' + $scope.state.variableObject.name + ' History'},
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
						$scope.addToFavoritesUsingStateVariableObject($scope.state.variableObject);
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
					if(index === 5){
						$state.go('app.predictors',
							{
								variableObject: $scope.state.variableObject,
								requestParams: {
									effect:  $scope.state.variableObject.name,
									correlationCoefficient: "(gt)0"
								}
							});
					}
					if(index === 6){
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