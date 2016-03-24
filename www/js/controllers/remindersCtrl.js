angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, $stateParams, measurementService, reminderService, $ionicLoading, utilsService){

	    $scope.controller_name = "RemindersCtrl";

	    // state
	    $scope.state = {
	    	title : 'Reminders',
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

	    // data
	    $scope.variables = {
	    	variableCategories : [
	    		{ id : 1, name : 'Anything' },
		    	{ id : 2, name : 'Emotions' },
		    	{ id : 3, name : 'Symptoms' },
		    	{ id : 4, name : 'Treatments' },
		    	{ id : 5, name : 'Foods' }, 
		    	{ id : 6, name : 'Misc' }
	    	],
	    	list : [],
	    	frequencyVariables : [
	    		{ id : 1, name : 'Once a day'},
	    		{ id : 2, name : 'Twice a day'},
	    		{ id : 3, name : 'Three times a day'},
	    		{ id : 4, name : 'Hourly'},
	    		{ id : 5, name : 'Every three hours'},
	    		{ id : 6, name : 'Every 30 minutes'},
	    		{ id : 7, name : 'Never'}
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
			authService.getAccessToken().then(function(token){
			   	console.log('$scope.state.selectedVariableCategory.toLowerCase()', $scope.state.selectedVariableCategory.toLowerCase());
				if($scope.state.selectedVariableCategory.toLowerCase() == 'anything'){
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
	    	console.log("Variable category selected: ", $scope.state.selectedVariableCategory);
	    	$scope.category = $scope.state.selectedVariableCategory;
	    	$scope.state.searchQuery = '';
	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = true;
	    };

	    var search = function(query){
	    	// search server for the query

	    	if($scope.state.selectedVariableCategory.toLowerCase() == 'anything'){
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
	    		} else $state.go('app.reminders_manage');
	    		return;
	    	} else $state.reload();
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
	    			} else $state.go('app.reminders_manage');
	    		} else $state.go('app.reminders_manage');

	    	}, function(err){

	    		utils.stopLoading();
	    		utils.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    }

	    var getFrequencyChart = function(){
	    	return {
	    		"Once a day": 24*60*60,
	    		"Twice a day" : 12*60*60,
	    		"Three times a day": 8*60*60,	
	    		"Hourly":60*60,
	    		"Every three hours" : 180*60,
	    		"Every 30 minutes": 30*60,
	    		"Never": 0
	    	};
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
	    			} else $state.go('app.reminders_manage');
	    		} else $state.go('app.reminders_manage');

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
	    	$scope.state.title = "Edit Reminder";
	    	
	    	console.log("setupEditReminder ran");
	    	var reverseFrequencyChart = {
	    		86400: "Once a day",
	    		43200: "Twice a day",
	    		28800: "Three times a day",	
	    		3600: "Hourly",
	    		10800: "Every three hours",
	    		1800: "Every 30 minutes",
	    		0: "Never", 
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
	    	$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.selectedReminder.reminderFrequency];
	    	
	    	$scope.state.showCustomBox = true;

	    	setSelectedTimeInDatePicker();
	    };

	    // setup category view
	    var setupCategory = function(category){
	    	$scope.state.title = 'Add ' + category + ' Reminder';
	    	$scope.state.showSearchBox = true;
	    	$scope.state.showResults = true;
	    	$scope.state.resultsHeaderText = "Your previously tracked "+category;
	    	$scope.state.selectedVariableCategory = category;
	    	populate_recent_tracked(category);
	    };

	    // setup new reminder view
	    var setupNewReminder = function(){
	    	$scope.state.title = "Add New Reminder";
	    	$scope.state.showVariableCategory = true;
	    	$scope.state.showSearchBox = true;
	    };

	    // constuctor
	    $scope.init = function(){

			// get user token
			authService.getAccessToken().then(function(token){
				if($stateParams.category){
					$scope.category = $stateParams.category;
					setupCategory($scope.category);
				}
				else if($stateParams.reminder && $stateParams.reminder !== null)
					setupEditReminder($stateParams.reminder);
				else
					setupNewReminder();
			}, function(){
				console.log("need to log in");
				utilsService.showLoginRequiredAlert($scope.login);
				$ionicLoading.hide();
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
	})