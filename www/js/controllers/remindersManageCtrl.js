angular.module('starter')

	.controller('RemindersManageCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
												reminderService, $ionicLoading, measurementService, utilsService,
												$stateParams, $filter, $rootScope){

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
			loading : true
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

		function getTrackingRemindersFromLocalStorage(){
			$scope.state.allReminders = [];
			var unfilteredReminders = JSON.parse(localStorageService.getItemSync('trackingReminders'));
			if(unfilteredReminders) {
				if($stateParams.variableCategoryName) {
					for(var j = 0; j < unfilteredReminders.length; j++){
						if($stateParams.variableCategoryName === unfilteredReminders[j].variableCategoryName){
							$scope.state.allReminders.push(unfilteredReminders[j]);
						}
					}
				} else {
					$scope.state.allReminders = unfilteredReminders;
				}
				$scope.state.allReminders = reminderService.addRatingTimesToDailyReminders($scope.state.allReminders);
			}

			if ($stateParams.variableCategoryName) {
				$scope.showLoader('Fetching ' + $stateParams.variableCategoryName.toLowerCase() + '...');
			} else {
				$scope.showLoader('Fetching your variables...');
			}
		}

		var getTrackingReminders = function(){

			reminderService.refreshTrackingRemindersAndScheduleAlarms($stateParams.variableCategoryName)
				.then(function(reminders){
					getTrackingRemindersFromLocalStorage();
					$ionicLoading.hide();
				}, function(){
					$ionicLoading.hide();
					$state.go('app.login');
				});

	    };

	    $scope.cancel = function(){
	    	$scope.state.showMeasurementBox = !$scope.state.showMeasurementBox;
	    };


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
				getTrackingReminders();
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
			localStorageService.deleteElementOfItemById('trackingReminders', reminder.id).then(function(){
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
		
	});