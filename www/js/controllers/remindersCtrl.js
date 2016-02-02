angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, $stateParams, measurementService, reminderService, $ionicLoading){

	    $scope.controller_name = "RemindersCtrl";

	    // state
	    $scope.state = {
	    	title : 'Reminders',
	    	resultsHeaderText : '',

	    	showType : false,
	    	showSearchBox : false,
	    	showResults : false,
	    	showCustomBox : false,

	    	searchQuery : "",
	    	selectedType : 'Anything',
	    	selectedUnit : '',
	    	searching : false,
	    	selectedFrequency : 'Hourly',
	    	selectedReminder : false
	    };

	    // data
	    $scope.variables = {
	    	types : [
	    		{ id : 1, name : 'Anything' },
		    	{ id : 2, name : 'Emotions' },
		    	{ id : 3, name : 'Symptoms' },
		    	{ id : 4, name : 'Treatments' },
		    	{ id : 5, name : 'Foods' }, 
		    	{ id : 6, name : 'Misc' }
	    	],
	    	list : [],
	    	frequencyVariables : [
	    		{ id : 1, name : 'Never'},
	    		{ id : 2, name : 'Hourly'},
	    		{ id : 3, name : 'Every three hours'},
	    		{ id : 4, name : 'Twice daily'},
	    		{ id : 5, name : 'Daily'}
	    	]
	    };

		// populate list with recently tracked category variables
    	var populate_recent_tracked = function(category){

    		utils.startLoading();
	    	// get user token
			authService.getAccessToken().then(function(token){
			   	console.log('$scope.state.selectedType.toLowerCase()', $scope.state.selectedType.toLowerCase());
				if($scope.state.selectedType.toLowerCase() == 'anything'){
					// get all variables
					console.log('anything');
					measurementService.getVariables().then(function(variables){

					    $scope.userVariables = variables;
					    $scope.variables.list = variables;
					    utils.stopLoading();
					    
					}, function(){
						utils.stopLoading();
					});
				} else {
					console.log('category');
					// get all variables by category
					measurementService.getVariablesByCategory(category).then(function(variables){

					    $scope.userVariables = variables;
					    $scope.variables.list = variables;

					    utils.stopLoading();
					    
					}, function(){
						utils.stopLoading();
					});
				}

			}, function(){
			   utilsService.showLoginRequiredAlert($scope.login);
			   utils.stopLoading();
			   return;
			});
    	};

	    // when category is selected
	    $scope.onVariableChange = function(){
	    	console.log("Type Selected: ", $scope.state.selectedType);
	    	$scope.category = $scope.state.selectedType;
	    	$scope.state.searchQuery = '';
	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = true;
	    };

	    var search = function(query){
	    	// search server for the query

	    	if($scope.state.selectedType.toLowerCase() == 'anything'){
	    		console.log('anything');
	    		measurementService.getPublicVariables(query)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
	    		});
	    	} else {
	    		console.log('with category');
	    		measurementService.getPublicVariablesByCategory(query, $scope.category)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
	    		});
	    	}
	    };

	    // when a query is searched in the searchbox
	    $scope.onSearch = function(){
	    	console.log("Search: ", $scope.state.searchQuery);
	    	if($scope.state.searchQuery == ""){
	    		$scope.state.resultsHeaderText = "Your previously tracked "+$scope.category;
	    		$scope.state.showResults = $stateParams.category? true : false;
	    		$scope.state.searching = false;	    		
	    	} else {
	    		$scope.state.resultsHeaderText = "Search Results";
	    		$scope.state.showResults = true;
	    		$scope.state.searching = true;
	    		search($scope.state.searchQuery);
	    	}
	    };

	    // when a search result is selected
	    $scope.onReminderSelect = function(result){
	    	console.log("Reminder Selected: ", result);
	    	$scope.state.selectedReminder = result;

	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = false;
	    	$scope.state.showCustomBox = true;

	    	$scope.state.selectedUnit = result.abbreviatedUnitName? result.abbreviatedUnitName : result.lastUnit;
	    	$scope.state.selectedDefaultValue = result.mostCommonValue? result.mostCommonValue : result.lastValue;
	    };

	    var utils = {
    	    startLoading : function(){
    	    	// show spinner
    			$ionicLoading.show({
    				noBackdrop: true,
    				template: '<p class="item-icon-left">Making stuff happen...<ion-spinner icon="lines"/></p>'
    		    });
    	    },

    	    stopLoading : function(){
    	    	// hide spinner
    	    	$ionicLoading.hide();
    	    },

    	    // alert box
	        showAlert : function(title, cssClass) {
	           var alertPopup = $ionicPopup.alert({
	             cssClass : cssClass? cssClass : 'calm',
	             okType : cssClass? 'button-'+cssClass : 'button-calm',
	             title: title
	           });
	        }
	    }

	    // when adding/editing is cancelled
	    $scope.cancel = function(){
	    	if($stateParams.reminder && $stateParams.reminder !== null){
	    		$state.go('app.reminders_manage');
	    		return;
	    	} else $state.reload();
	    };

	    $scope.edit = function(){

	    	console.log("Editing \n the reminder is ", $scope.state.selectedReminder);
	    	console.log("frequency is ", $scope.state.selectedFrequency);
	    	console.log("default Value is ", $scope.state.selectedDefaultValue);
	    	console.log("default Unit is ", $scope.state.selectedUnit);

	    	var frequencyChart = {
	    		"Never" : 0,
	    		"Hourly" : 60*60,
	    		"Every three hours" : 3*60*60,
	    		"Twice daily": 12*60*60,
	    		"Daily" : 24*60*60
	    	};

	    	console.log($scope.state.selectedReminder.id,
	    		$scope.state.selectedReminder.variableId,
                $scope.state.selectedDefaultValue,
                frequencyChart[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.variableName,
                $scope.state.selectedReminder.variableCategoryName,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation);

	    	utils.startLoading();

	    	reminderService.editReminder(
	    		$scope.state.selectedReminder.id,
				$scope.state.selectedReminder.variableId,
                $scope.state.selectedDefaultValue,
                frequencyChart[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.variableName,
                $scope.state.selectedReminder.variableCategoryName,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation)
	    	.then(function(){

	    		utils.stopLoading();
	    		$state.go('app.reminders_manage');

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    }

	    // when the reminder is saved/edited
	    $scope.save = function(){

	    	if($stateParams.reminder && $stateParams.reminder !== null){
	    		$scope.edit();
	    		return;
	    	}

	    	console.log("Saving \n the reminder is ", $scope.state.selectedReminder);
	    	console.log("frequency is ", $scope.state.selectedFrequency);
	    	console.log("default Value is ", $scope.state.selectedDefaultValue);
	    	console.log("default Unit is ", $scope.state.selectedUnit);
	    	var frequencyChart = {
	    		"Never" : 0,
	    		"Hourly" : 60*60,
	    		"Every three hours" : 3*60*60,
	    		"Twice daily": 12*60*60,
	    		"Daily" : 24*60*60
	    	};

	    	console.log($scope.state.selectedReminder.id,
                $scope.state.selectedDefaultValue,
                frequencyChart[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.name,
                $scope.state.selectedReminder.category,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation);

	    	utils.startLoading();

	    	reminderService.addNewReminder(
	    		$scope.state.selectedReminder.id,
                $scope.state.selectedDefaultValue,
                frequencyChart[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.name,
                $scope.state.selectedReminder.category,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation)
	    	.then(function(){

	    		utils.stopLoading();
	    		$state.go('app.reminders_manage');

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };

	    // setup editing view
	    var setupEditReminder = function(){
	    	$scope.state.selectedReminder = $stateParams.reminder;
	    	$scope.state.title = "Edit Reminder";
	    	
	    	var reverseFrequencyChart = {
	    		0: "Never", 
	    		3600: "Hourly", 
	    		10800: "Every three hours", 
	    		43200: "Twice daily",
	    		86400: "Daily" 
	    	};


	    	$scope.state.selectedUnit = $scope.state.selectedReminder.abbreviatedUnitName;
	    	$scope.state.selectedDefaultValue = $scope.state.selectedReminder.defaultValue;
	    	$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.selectedReminder.reminderFrequency];
	    	
	    	$scope.state.showCustomBox = true;
	    };

	    // setup category view
	    var setupCategory = function(category){
	    	$scope.state.title = category;
	    	$scope.state.showSearchBox = true;
	    	$scope.state.showResults = true;
	    	$scope.state.resultsHeaderText = "Your previously tracked "+category;
	    	$scope.state.selectedType = category;
	    	populate_recent_tracked(category);
	    };

	    // setup new reminder view
	    var setupNewReminder = function(){
	    	$scope.state.title = "Add New Reminder";
	    	$scope.state.showType = true;
	    	$scope.state.showSearchBox = true;
	    };

	    // constuctor
	    $scope.init = function(){	 
			if($stateParams.category){
				$scope.category = $stateParams.category;
				setupCategory($scope.category);
			}
			else if($stateParams.reminder && $stateParams.reminder !== null) 
				setupEditReminder($stateParams.reminder);
			else 
				setupNewReminder();
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

	    // Show alert with a title
	    $scope.showAlert = function(title, template){
			var alertPopup = $ionicPopup.alert({
				cssClass : 'calm',
				okType : 'button-calm',
				title: title,
				template: template
			});
	    };
	})