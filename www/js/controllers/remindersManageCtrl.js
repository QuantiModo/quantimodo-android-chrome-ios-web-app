angular.module('starter')

	.controller('RemindersManageCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
												reminderService, $ionicLoading, measurementService, utilsService,
												$stateParams, $filter, variableService){

	    $scope.controller_name = "RemindersManageCtrl";

		console.log('Loading ' + $scope.controller_name);
	    
	    $scope.state = {
			variableCategory : $stateParams.variableCategoryName,
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	reminderDefaultValue : "",
	    	selected1to5Value : false,
	    	allReminders : [
	    	],
	    	filteredReminders : [
	    	],
	    	measurementDate : new Date(),
	    	slots : {
				epochTime: new Date().getTime()/1000,
				format: 12,
				step: 1
			},
			variable : {},
			isDisabled : false
	    };

		if($stateParams.variableCategoryName){
			$scope.state.title = "Manage " + $filter('wordAliases')($stateParams.variableCategoryName);
			$scope.state.addButtonText = "Add New " + pluralize($filter('wordAliases')($stateParams.variableCategoryName), 1);
		} else {
			$scope.state.title = "Manage Reminders";
			$scope.state.addButtonText = "Add new reminder";
		}

	    $scope.selectPrimaryOutcomeVariableValue = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary-outcome-variable .active-primary-outcome-variable').removeClass('active-primary-outcome-variable');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active-primary-outcome-variable');

	        jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

	        $scope.state.selected1to5Value = val;

		};

	    var getVariable = function(variableName){
			variableService.getVariablesByName(variableName)
	    	.then(function(variable){
	    		$scope.state.variable = variable;
	    	}, function(){
	    		utilsService.showAlert('Can\'t find variable. Try again!', 'assertive').then(function(){
	    			$state.go('app.historyAll');
	    		});
	    	});
	    };

	    var getTrackingReminders = function(){
	    	utilsService.startLoading();
	    	reminderService.getTrackingReminders($stateParams.variableCategoryName)
	    	.then(function(reminders){
	    		$scope.state.allReminders = reminders;
	    		//utilsService.stopLoading();
	    	}, function(){
	    		//utilsService.stopLoading();
	    		console.log("failed to get reminders");
				console.log("need to log in");
				$ionicLoading.hide();
				utilsService.showLoginRequiredAlert($scope.login);
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

			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
				getTrackingReminders();
			}, function(){
				$ionicLoading.hide();
				console.log("need to log in");
				//utilsService.showLoginRequiredAlert($scope.login);
			});
			
	    };


	    $scope.edit = function(reminder){
	    	reminder.fromState = $state.current.name;
	    	$state.go('app.reminder_add', {reminder : reminder});
	    };

	    $scope.deleteReminder = function(reminder){
	    	utilsService.startLoading();
	    	reminderService.deleteReminder(reminder.id)
	    	.then(function(){

	    		//utilsService.stopLoading();
	    		utilsService.showAlert('Reminder Deleted.');
	    		$scope.init();

	    	}, function(err){

	    		//utilsService.stopLoading();
	    		utilsService.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

	});