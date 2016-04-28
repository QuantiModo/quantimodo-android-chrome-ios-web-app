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

	    $scope.select_primary_outcome_variable = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active_primary_outcome_variable');

	        jQuery($event.target).parent().removeClass('primary_outcome_variable_history').addClass('primary_outcome_variable_history');

	        $scope.state.selected1to5Value = val;

		};

	    var utils = {
    	    startLoading : function(){
    	    	// show spinner
    			$ionicLoading.show({
    				noBackdrop: true,
    				template: '<p class="item-icon-left">Fetching your reminders...<ion-spinner icon="lines"/></p>'
    		    });
    	    },

    	    stopLoading : function(){
    	    	// hide spinner
    	    	$ionicLoading.hide();
    	    },

    	    // alert box
	        showAlert : function(title, cssClass) {
				return $ionicPopup.alert({
					cssClass : cssClass? cssClass : 'calm',
					okType : cssClass? 'button-'+cssClass : 'button-calm',
					title: title
				});
	        }
	    };

	    var getVariable = function(variableName){
			variableService.getVariablesByName(variableName)
	    	.then(function(variable){
	    		$scope.state.variable = variable;
	    	}, function(){
	    		utils.showAlert('Can\'t find variable. Try again!', 'assertive').then(function(){
	    			$state.go('app.historyAll');
	    		});
	    	});
	    };

	    var getTrackingReminders = function(){
	    	utils.startLoading();
	    	reminderService.getTrackingReminders($stateParams.variableCategoryName)
	    	.then(function(reminders){
	    		$scope.state.allReminders = reminders;
	    		utils.stopLoading();
	    	}, function(){
	    		utils.stopLoading();
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
	    	utils.startLoading();
	    	reminderService.deleteReminder(reminder.id)
	    	.then(function(){

	    		utils.stopLoading();
	    		utils.showAlert('Reminder Deleted.');
	    		$scope.init();

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

	});