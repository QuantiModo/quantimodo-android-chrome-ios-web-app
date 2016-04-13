angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersAddCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											 $stateParams, measurementService, reminderService, $ionicLoading,
											 utilsService, $filter){

	    $scope.controller_name = "RemindersAddCtrl";

		console.log('Loading ' + $scope.controller_name);

	    // state
	    $scope.state = {
	    	resultsHeaderText : '',
	    	showVariableCategory : false,
	    	showSearchBox : false,
	    	showResults : false,
	    	showCustomBox : false,

	    	searchQuery : "",
	    	selectedVariableCategory : 'Anything',
	    	selectedUnit : '',
	    	searching : false,
	    	selectedFrequency : 'Hourly',
	    	selectedReminder : false,
	    	slotsFirst : {
				epochTime: new Date().getTime()/1000,
				format: 24,
				step: 1
			},
	    	slotsSecond : {
				epochTime: new Date().getTime()/1000,
				format: 24,
				step: 1
			},
	    	slotsThird : {
				epochTime: new Date().getTime()/1000,
				format: 24,
				step: 1
			},
			firstSelectedTime : moment.utc().format('HH:mm:ss'),
			secondSelectedTime : moment.utc().format('HH:mm:ss'),
			thirdSelectedTime : moment.utc().format('HH:mm:ss')
	    };


		console.log("$stateParams.category  is " + $stateParams.category);

		if($stateParams.category){
            $scope.state.variableCategorySingular = pluralize($stateParams.category, 1);

			$scope.state.title = "Add a " + $filter('wordAliases')(pluralize($stateParams.category, 1) + " Reminder");
			$scope.state.variablePlaceholderText =
				"Search for a " + $filter('wordAliases')(pluralize($stateParams.category.toLowerCase(), 1)) + " here..";
		} else {
			$scope.state.title = "Add Reminder";
			$scope.state.variablePlaceholderText = "Search for a variable here...";
		}

		if($stateParams.category === "Treatments") {
			$scope.state.defaultValuePlaceholderText = "Enter dosage here...";
		} else {
			$scope.state.defaultValuePlaceholderText = "Enter most common value here...";
		}

	    // data
	    $scope.variables = {
	    	variableCategories : [
	    		{ id : 1, name : 'Anything' },
		    	{ id : 2, name : 'Emotions' },
		    	{ id : 3, name : 'Symptoms' },
		    	{ id : 4, name : 'Treatments' },
		    	{ id : 5, name : 'Foods' },
                { id : 6, name : 'Vital Signs' },
                { id : 7, name : 'Physical Activity' },
                { id : 8, name : 'Sleep' },
                { id : 9, name : 'Misc' }
	    	],
	    	list : [],
	    	frequencyVariables : [
	    		
	    		{ id : 1, name : 'Every 12 hours' , group : 'intervals'},
	    		{ id : 2, name : 'Every 8 hours' , group : 'intervals'},
	    		{ id : 3, name : 'Every 6 hours' , group : 'intervals'},
	    		{ id : 4, name : 'Every 4 hours' , group : 'intervals'},
	    		{ id : 5, name : 'Every 3 hours' , group : 'intervals'},
				{ id : 6, name : 'Every 2 hours' , group : 'intervals'},
				{ id : 7, name : 'Hourly' , group : 'intervals'},
	    		{ id : 8, name : 'Every 30 minutes' , group : 'intervals'},
	    		{ id : 9, name : 'Never' , group : 'intervals'},
	    		{ id : 10, name : 'Once a day' , group : 'frequency'},
	    		{ id : 11, name : 'Twice a day' , group : 'frequency'},
	    		{ id : 12, name : 'Three times a day' , group : 'frequency'}
	    	]
	    };


	    // when time is changed
	    $scope.firstTimePickerCallback = function (val) {
	    	if (typeof (val) === 'undefined') {
	    		console.log('Time not selected');
	    	} else {
	    		var a = new Date();
	    		a.setHours(val.hours);
	    		a.setMinutes(val.minutes);
	    		$scope.state.slotsFirst.epochTime = a.getTime()/1000;
	    		$scope.state.firstSelectedTime = moment.utc(a).format('HH:mm:ss');
	    	}
	    };

	    // when time is changed
	    $scope.secondTimePickerCallback = function (val) {
	    	if (typeof (val) === 'undefined') {
	    		console.log('Time not selected');
	    	} else {
	    		var a = new Date();
	    		a.setHours(val.hours);
	    		a.setMinutes(val.minutes);
	    		$scope.state.slotsSecond.epochTime = a.getTime()/1000;
	    		$scope.state.secondSelectedTime = moment.utc(a).format('HH:mm:ss');
	    	}
	    };

	    // when time is changed
	    $scope.thirdTimePickerCallback = function (val) {
	    	if (typeof (val) === 'undefined') {
	    		console.log('Time not selected');
	    	} else {
	    		var a = new Date();
	    		a.setHours(val.hours);
	    		a.setMinutes(val.minutes);
	    		$scope.state.slotsThird.epochTime = a.getTime()/1000;
	    		$scope.state.thirdSelectedTime = moment.utc(a).format('HH:mm:ss');
	    	}
	    };

		// populate list with recently tracked category variables
    	var populate_recent_tracked = function(category){

    		utils.startLoading();
	    	// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
			   	console.log('$scope.state.selectedVariableCategory.toLowerCase()', $scope.state.selectedVariableCategory.toLowerCase());
				if($scope.state.selectedVariableCategory.toLowerCase() === 'anything'){
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
					measurementService.searchVariablesByCategoryIncludePublic('*', category).then(function(variables){

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
			   
			});
    	};

	    // when category is selected
	    $scope.onVariableCategoryChange = function(){
	    	console.log("Variable category selected: ", $scope.state.selectedVariableCategory);
	    	$scope.category = $scope.state.selectedVariableCategory;
	    	$scope.state.searchQuery = '';
	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = true;
	    };

	    var search = function(query){
	    	// search server for the query

	    	if($scope.state.selectedVariableCategory.toLowerCase() === 'anything'){
	    		console.log('anything');
	    		measurementService.searchVariablesIncludePublic(query)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
	    		});
	    	} else {
	    		console.log('with category');
	    		measurementService.searchVariablesByCategoryIncludePublic(query, $scope.category)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
	    		});
	    	}
	    };

	    // when a query is searched in the search box
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
	    	//$scope.state.selectedDefaultValue = result.mostCommonValue? result.mostCommonValue : result.lastValue;
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
	    };

	    // when frequency is changed
	    $scope.onFrequencyChange = function(){
	    	console.log("onFrequencyChange ran");
	    	
	    	var firstTime = moment.utc($scope.state.slotsFirst.epochTime*1000);
	    	$scope.state.firstSelectedTime = moment.utc(firstTime).format("HH:mm:ss");

	    	if($scope.state.selectedFrequency === 'Twice a day'){
	    		
	    		firstTime.hours(firstTime.hours()+12);
	    		$scope.state.slotsSecond.epochTime = moment.utc(firstTime).local().unix();
	    		$scope.state.secondSelectedTime = moment.utc(firstTime).format("HH:mm:ss");

	    	} else if($scope.state.selectedFrequency === 'Three times a day'){

	    		firstTime.hours(firstTime.hours()+8);
	    		$scope.state.slotsSecond.epochTime = moment.utc(firstTime).local().unix();
	    		$scope.state.secondSelectedTime = moment.utc(firstTime).format("HH:mm:ss");
	    		
	    		firstTime.hours(firstTime.hours()+8);
	    		$scope.state.slotsThird.epochTime = moment.utc(firstTime).local().unix();
	    		$scope.state.thirdSelectedTime = moment.utc(firstTime).format("HH:mm:ss");
	    	}

	    };

	    // when adding/editing is cancelled
	    $scope.cancel = function(){
	    	if($stateParams.reminder && $stateParams.reminder !== null){
	    		if($stateParams.reminder.fromState){
	    			$state.go($stateParams.reminder.fromState);
	    		} else {
					$state.go('app.reminders_manage');
                }
	    		
	    	} else {
				$state.reload();
            }
	    };

	    $scope.edit = function(){

	    	console.log("Editing \n the reminder is ", $scope.state.selectedReminder);
	    	console.log("frequency is ", $scope.state.selectedFrequency);
	    	console.log("default Value is ", $scope.state.selectedDefaultValue);
	    	console.log("default Unit is ", $scope.state.selectedUnit);

	    	console.log($scope.state.selectedReminder.id,
	    		$scope.state.selectedReminder.variableId,
                $scope.state.selectedDefaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.variableName,
                $scope.state.selectedReminder.variableCategoryName,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.firstSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day" || $scope.state.selectedFrequency === "Twice a day")? $scope.state.secondSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day")? $scope.state.thirdSelectedTime : null);

	    	utils.startLoading();

	    	reminderService.editReminder(
	    		$scope.state.selectedReminder.id,
				$scope.state.selectedReminder.variableId,
                $scope.state.selectedDefaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.variableName,
                $scope.state.selectedReminder.variableCategoryName,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.firstSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day" || $scope.state.selectedFrequency === "Twice a day")? $scope.state.secondSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day")? $scope.state.thirdSelectedTime : null)
	    	.then(function(){

	    		utils.stopLoading();
	    		if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
	    			if($stateParams.reminder.fromState){
	    				$state.go($stateParams.reminder.fromState);
	    			} else {
						$state.go('app.reminders_manage');
                    }
	    		} else {
					$state.go('app.reminders_manage');
                }

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };

	    var getFrequencyChart = function(){
	    	return {
	    		"Every 12 hours" : 12*60*60,
	    		"Every 8 hours": 8*60*60,
	    		"Every 6 hours": 6*60*60,
	    		"Every 4 hours": 4*60*60,
	    		"Every 3 hours" : 180*60,
	    		"Every 30 minutes": 30*60,
	    		"Hourly":60*60,
	    		"Never": 0,
	    		"Once a day": 24*60*60,
	    		"Twice a day" : 12*60*60,
	    		"Three times a day": 8*60*60
	    	};
	    };

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

	    	console.log($scope.state.selectedReminder.id,
                $scope.state.selectedDefaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.name,
                $scope.state.selectedReminder.category,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.firstSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day" || $scope.state.selectedFrequency === "Twice a day")? $scope.state.secondSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day")? $scope.state.thirdSelectedTime : null);

	    	utils.startLoading();

	    	reminderService.addNewReminder(
	    		$scope.state.selectedReminder.id,
                $scope.state.selectedDefaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency], 
                $scope.state.selectedReminder.name,
                $scope.state.selectedReminder.category,
                $scope.state.selectedReminder.abbreviatedUnitName,
                $scope.state.selectedReminder.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.firstSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day" || $scope.state.selectedFrequency === "Twice a day")? $scope.state.secondSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day")? $scope.state.thirdSelectedTime : null)
	    	.then(function(){

	    		utils.stopLoading();
	    		if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
	    			if($stateParams.reminder.fromState){
	    				$state.go($stateParams.reminder.fromState);
	    			} else {
						$state.go('app.reminders_manage');
                    }
	    		} else {
					$state.go('app.reminders_manage');
                }

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };

	    var setSelectedTimeInDatePicker = function(){
	    	
	    	var loopData = ['First', 'Second', 'Third'];
	    	loopData.forEach(function(number){
	    		var splitted = $scope.state[number.toLowerCase()+'SelectedTime'].split(':');
	    		
	    		var date= moment.utc($scope.state["slots"+number].epochTime*1000);
	    		
	    		date.hours(splitted[0]);
	    		date.minutes(splitted[1]);
	    		date.seconds(splitted[2]);

	    		$scope.state["slots"+number].epochTime = date.local().unix();
	    	});
	    };

	    // setup editing view
	    var setupEditReminder = function(){
	    	$scope.state.selectedReminder = $stateParams.reminder;
	    	$scope.state.title = "Edit " + $scope.state.selectedReminder.variableName + " Reminder";
	    	
	    	var reverseFrequencyChart = {
	    		43200: "Every 12 hours",
	    		28800: "Every 8 hours",
	    		21600: "Every 6 hours",
	    		14400: "Every 4 hours",
	    		10800: "Every 3 hours",
				7200: "Every 2 hours",
				3600: "Hourly",
				1800: "Every 30 minutes",
				0: "Never"
	    	};

			if(typeof $stateParams.reminder.firstDailyReminderTime !== "undefined" && $stateParams.reminder.firstDailyReminderTime !== null){
				$scope.state.firstSelectedTime = $stateParams.reminder.firstDailyReminderTime;
			}

			if(typeof $stateParams.reminder.secondDailyReminderTime !== "undefined" && $stateParams.reminder.secondDailyReminderTime !== null){
				$scope.state.secondSelectedTime = $stateParams.reminder.secondDailyReminderTime;
			}

			if(typeof $stateParams.reminder.thirdDailyReminderTime !== "undefined" && $stateParams.reminder.thirdDailyReminderTime !== null){
				$scope.state.thirdSelectedTime = $stateParams.reminder.thirdDailyReminderTime;
			}

	    	$scope.state.selectedUnit = $scope.state.selectedReminder.abbreviatedUnitName;
	    	$scope.state.selectedDefaultValue = $scope.state.selectedReminder.defaultValue;
	    	
	    	if($scope.state.selectedReminder.reminderFrequency && $scope.state.selectedReminder.reminderFrequency !== null){	    		
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.selectedReminder.reminderFrequency];
	    	} else if($scope.state.selectedReminder.thirdDailyReminderTime){
	    		$scope.state.selectedFrequency = "Three times a day";
	    	} else if($scope.state.selectedReminder.secondDailyReminderTime){
	    		$scope.state.selectedFrequency = "Twice a day";
	    	} else if($scope.state.selectedReminder.firstDailyReminderTime){
	    		$scope.state.selectedFrequency = "Once a day";
	    	}

	    	
	    	$scope.state.showCustomBox = true;

	    	setSelectedTimeInDatePicker();
	    };

	    // setup category view
	    var setupCategory = function(category){
	    	$scope.state.showSearchBox = true;
	    	$scope.state.showResults = true;
	    	$scope.state.resultsHeaderText = "Your previously tracked "+category;
	    	$scope.state.selectedVariableCategory = category;
	    	populate_recent_tracked(category);
	    };

	    // setup new reminder view
	    var setupNewReminder = function(){
	    	$scope.state.showVariableCategory = true;
	    	$scope.state.showSearchBox = true;
	    };

	    // constructor
	    $scope.init = function(){

			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
				if($stateParams.category){
					$scope.category = $stateParams.category;
					setupCategory($scope.category);
				}
				else if($stateParams.reminder && $stateParams.reminder !== null) {
					setupEditReminder($stateParams.reminder);
                }
				else {
					setupNewReminder();
                }
			}, function(){
				$ionicLoading.hide();
				console.log("need to log in");
				//utilsService.showLoginRequiredAlert($scope.login);
			});
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
	});