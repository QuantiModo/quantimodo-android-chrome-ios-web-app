angular.module('starter')

	.controller('RemindersManageCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
												reminderService, $ionicLoading, measurementService, utilsService,
												$stateParams, $filter, variableService){

	    $scope.controller_name = "RemindersManageCtrl";

		console.log('Loading ' + $scope.controller_name);
	    
	    $scope.state = {
			showButtons : false,
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
	        jQuery('.primary-outcome-variable .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');

	        jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

	        $scope.state.selected1to5Value = val;

		};

	    var getTrackingReminders = function(){
			if($stateParams.variableCategoryName) {
				$scope.showLoader('Fetching ' + $stateParams.variableCategoryName.toLowerCase() + '...');
			} else {
				$scope.showLoader('Fetching reminders...');
			}

	    	reminderService.getTrackingReminders($stateParams.variableCategoryName)
	    	.then(function(reminders){
	    		$scope.state.allReminders = reminders;
	    		$ionicLoading.hide();
				$scope.loading = false;
	    	}, function(){
				$ionicLoading.hide();
				$scope.loading = false;
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
			var isAuthorized = authService.checkAuthOrSendToLogin();
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

	    $scope.addNewReminder = function(){
	    	$state.go('app.reminderAdd', 
	    	{
	    		variableCategoryName : $stateParams.variableCategoryName,
	    		fromUrl: window.location.href
	    	});
	    };


	    $scope.deleteReminder = function(reminder){
			$scope.showLoader('Deleting ' + reminder.variableName.toLowerCase() + ' reminder...');
			reminderService.deleteReminder(reminder.id)
	    	.then(function(){
				$ionicLoading.hide();
				$scope.loading = false;
	    		utilsService.showAlert(reminder.variableName + ' reminder deleted');
	    		$scope.init();
	    	}, function(err){
	    		$ionicLoading.hide();
				$scope.loading = false;
	    		utilsService.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
	    	});
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});
		
		$scope.showLoader = function (loadingText) {
			if(!loadingText){
				loadingText = '';
			}
			$scope.loading = true;
			$ionicLoading.show({
				template: loadingText + '<br><br><img src={{loaderImagePath}}>',
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: false,
				maxWidth: 1000,
				showDelay: 0
			});
		};
	});