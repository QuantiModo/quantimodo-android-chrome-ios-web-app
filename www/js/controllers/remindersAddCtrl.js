angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersAddCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											 $stateParams, measurementService, reminderService, $ionicLoading,
											 utilsService, $filter, ionicTimePicker, $timeout){

	    $scope.controller_name = "RemindersAddCtrl";

		console.log('Loading ' + $scope.controller_name);

        var variableCategoryConfig = {
            "Vital Signs":{
                default_unit: false,
                help_text:"What vital sign do you want to record?",
                variable_category_name: "Vital Signs",
                variable_category_name_singular_lowercase : "vital sign"
            },
            Foods:{
                default_unit:"serving",
                help_text:"What did you eat?",
                variable_category_name: "Foods",
                variable_category_name_singular_lowercase : "food"
            },
            Emotions:{
                default_unit: "/5",
                help_text: "What emotion do you want to rate?",
                variable_category_name: "Emotions",
                variable_category_name_singular_lowercase : "emotion"
            },
            Symptoms:{
                default_unit: "/5",
                help_text: "What symptom do you want to record?",
                variable_category_name: "Symptoms",
                variable_category_name_singular_lowercase : "symptom"
            },
            Treatments:{
                default_unit: "mg",
                help_text:"What treatment do you want to record?",
                variable_category_name: "Treatments",
                variable_category_name_singular_lowercase : "treatment"
            },
            "Physical Activity": {
                default_unit: false,
                help_text:"What physical activity do you want to record?",
                variable_category_name: "Physical Activity",
                variable_category_name_singular_lowercase : "physical activity"
            }
        };


        // state
	    $scope.state = {
            // category object,
            title : "Add Reminder",
            variablePlaceholderText : "Search for a variable here...",
            defaultValuePlaceholderText : "Enter most common value here...",
            showAddVariable : false,
            addNewVariableButtonText : '+ Add a new variable',
            addNewVariableCardText : 'Add a new variable',
            variableId : null,
            variableName : null,
            combinationOperation : null,
            unitCategories : {},
            resultsHeaderText : '',
	    	showVariableCategory : false,
	    	showSearchBox : false,
	    	showResults : false,
	    	showReminderFrequencyCard : false,
            showAddVariableButton : false,
            show_units: false,
            variableSearchQuery : "",
	    	variableCategoryName : 'Anything',
	    	abbreviatedUnitName : '',
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
			thirdSelectedTime : moment.utc().format('HH:mm:ss'),
            defaultValue : ""
            
	    };

        // lists
        $scope.lists = {
            list : [],
            userVariables : [],
            searchVariables : [],
            unitCategories : []
        };


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

		var firstTimePicker = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					console.log('Time not selected');
				} else {
					var a = new Date();
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());

					$scope.state.slotsFirst.epochTime = a.getTime() / 1000;
					$scope.state.firstSelectedTime = moment.utc(a).format('HH:mm:ss');
				}
			}
		};

		// when add new variable is tapped
		$scope.add_variable = function(){
			console.log("add variable");


			$scope.state.showSearchBox = false;
			$scope.state.showResults = false;
			$scope.state.showAddVariable = true;
            $scope.state.showReminderFrequencyCard = true;
			$scope.state.variableName = $scope.state.variableSearchQuery;

            $scope.state.defaultValue = "";
            $scope.getUnits();

		};


		$scope.firstTimePicker = function() {
			ionicTimePicker.openTimePicker(firstTimePicker);
		};

		var secondTimePicker = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					console.log('Time not selected');
				} else {
					var a = new Date();
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());

					$scope.state.slotsSecond.epochTime = a.getTime() / 1000;
					$scope.state.secondSelectedTime = moment.utc(a).format('HH:mm:ss');
				}
			}
		};

		$scope.secondTimePicker = function() {
			ionicTimePicker.openTimePicker(secondTimePicker);
		};

		var thirdTimePicker = {
			callback: function (val) {
				if (typeof (val) === 'undefined') {
					console.log('Time not selected');
				} else {
					var a = new Date();
					var selectedTime = new Date(val * 1000);
					a.setHours(selectedTime.getUTCHours());
					a.setMinutes(selectedTime.getUTCMinutes());

					$scope.state.slotsThird.epochTime = a.getTime() / 1000;
					$scope.state.thirdSelectedTime = moment.utc(a).format('HH:mm:ss');
				}
			}
		};

		$scope.thirdTimePicker = function() {
			ionicTimePicker.openTimePicker(thirdTimePicker);
		};

		// populate list with recently tracked category variables
    	var populate_recent_tracked = function(category){

    		utils.startLoading();
	    	// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
			   	console.log('$scope.state.variableCategoryName.toLowerCase()', $scope.state.variableCategoryName.toLowerCase());
				if($scope.state.variableCategoryName.toLowerCase() === 'anything'){
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
	    	console.log("Variable category selected: ", $scope.state.variableCategoryName);
	    	$scope.state.variableSearchQuery = '';
	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = true;
            setupVariableCategory($scope.state.variableCategoryName);
	    };

	    var search = function(query){
	    	// search server for the query

	    	if($scope.state.variableCategoryName.toLowerCase() === 'anything'){
	    		console.log('anything');
	    		measurementService.searchVariablesIncludePublic(query)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
                    if(variables.length < 5){
                        $scope.state.showAddVariableButton = true;
                    }
	    		});
	    	} else {
	    		console.log('with category');
	    		measurementService.searchVariablesByCategoryIncludePublic(query, $scope.variableCategoryName)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
                    if(variables.length < 1){
                        $scope.state.showAddVariableButton = true;
						$scope.state.addNewVariableButtonText = '+ Add new ' + $scope.state.variableSearchQuery + ' variable';
						$scope.state.addNewVariableCardText = 'Add new ' + $scope.state.variableSearchQuery + ' variable';
                    }
	    		});
	    	}
	    };

	    // when a query is searched in the search box
	    $scope.onSearch = function(){
	    	console.log("Search: ", $scope.state.variableSearchQuery);
	    	if($scope.state.variableSearchQuery === ""){
	    		$scope.state = 
                    {
                        resultsHeaderText : "Your previously tracked " + $scope.variableCategoryName,
                        showResults : $stateParams.variableCategoryName? true : false,
                        searching : false
                    }
            } else {
                $scope.state =
                {
                    resultsHeaderText : "Search Results",
                    showResults : true,
                    searching : true,
                    addNewVariableButtonText : 'Add a new "' + $scope.state.variableSearchQuery + '"'
                        + pluralize($stateParams.variableCategoryName.toLocaleLowerCase(), 1) + ' variable'
                };
                search($scope.state.variableSearchQuery);

	    	}
	    };

	    // when a search result is selected
	    $scope.onReminderSelect = function(result){
	    	console.log("Reminder Selected: ", result);
            $scope.state = {
                variableCategoryName : result.variableCategoryName,
                variableCategoryId : result.variableCategoryId,
                abbreviatedUnitName : result.abbreviatedUnitName,
                combinationOperation : result.combinationOperation,
                id : result.id,
                variableId : result.variableId,
                variableName : result.variableName,
                showResults : false,
                showSearchBox : false,
                showReminderFrequencyCard : true
            };
	    	//$scope.state.defaultValue = result.mostCommonValue? result.mostCommonValue : result.lastValue;
	    };

	    var utils = {
    	    startLoading : function(){
    	    	// show spinner
    			$ionicLoading.show({
    				noBackdrop: true,
    				template: '<p class="item-icon-left">Thank you for your patience.  Your call is very important to us...<ion-spinner icon="lines"/></p>'
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
	    	console.log("default Value is ", $scope.state.defaultValue);
	    	console.log("default Unit is ", $scope.state.abbreviatedUnitName);

	    	console.log($scope.state.id,
	    		$scope.state.variableId,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency],
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.firstSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day" || $scope.state.selectedFrequency === "Twice a day")? $scope.state.secondSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day")? $scope.state.thirdSelectedTime : null);

	    	utils.startLoading();

	    	reminderService.postTrackingReminder(
	    		$scope.state.id,
				$scope.state.variableId,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency],
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
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
	    	console.log("default Value is ", $scope.state.defaultValue);
	    	console.log("default Unit is ", $scope.state.abbreviatedUnitName);

	    	console.log($scope.state.id,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency], 
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.firstSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day" || $scope.state.selectedFrequency === "Twice a day")? $scope.state.secondSelectedTime : null,
                ($scope.state.selectedFrequency === "Three times a day")? $scope.state.thirdSelectedTime : null);

	    	utils.startLoading();

	    	reminderService.addNewReminder(
	    		$scope.state.id,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency], 
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
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
	    	$scope.state.title = "Edit " + $scope.state.variableName + " Reminder";
	    	
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
	    	
	    	if($scope.state.reminderFrequency && $scope.state.reminderFrequency !== null){	    		
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.reminderFrequency];
	    	} else if($scope.state.thirdDailyReminderTime){
	    		$scope.state.selectedFrequency = "Three times a day";
	    	} else if($scope.state.secondDailyReminderTime){
	    		$scope.state.selectedFrequency = "Twice a day";
	    	} else if($scope.state.firstDailyReminderTime){
	    		$scope.state.selectedFrequency = "Once a day";
	    	}

	    	
	    	$scope.state.showReminderFrequencyCard = true;

	    	setSelectedTimeInDatePicker();
	    };

	    // setup category view
	    var setupVariableCategory = function(variableCategoryName){
            $scope.state = 
            {
                variableCategorySingular : pluralize(variableCategoryName, 1),
                title : "Add a " + $filter('wordAliases')(pluralize(variableCategoryName, 1) + " Reminder"),
                addNewVariableButtonText : "+ Add a new " + $filter('wordAliases')(pluralize(variableCategoryName.toLowerCase(), 1)),
                addNewVariableCardText : "Add a new " + $filter('wordAliases')(pluralize(variableCategoryName.toLowerCase(), 1)),
                variablePlaceholderText :
                    "Search for a " + $filter('wordAliases')(pluralize(variableCategoryName.toLowerCase(), 1)) + " here..",
                showVariableCategorySelector : false,
                showSearchBox : true,
                showResults : true,
                resultsHeaderText : "Your previously tracked "+ variableCategoryName,
                variableCategoryNameSingularLowercase : $filter('wordAliases')(pluralize(variableCategoryName.toLowerCase()), 1),
            };
            
            if(variableCategoryName === "Treatments") {
                $scope.state =
                    {
                        defaultValuePlaceholderText : "Enter dosage here...",
                        defaultValueLabel : "Dosage",
                        
                    };
            }
			populate_recent_tracked(variableCategoryName);
	    };

	    // setup new reminder view
	    var setupNewReminder = function(){
	    	$scope.state.showVariableCategorySelector = true;
	    	$scope.state.showSearchBox = true;
	    };

	    // constructor
	    $scope.init = function(){
            
            if($stateParams.variableCategoryName){
                console.log("$stateParams.variableCategoryName  is " + $stateParams.variableCategoryName);
                setupVariableCategory($stateParams.variableCategoryName);
            }

            $scope.state.defaultValue = "";
			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
				if($stateParams.variableCategoryName){
					$scope.variableCategoryName = $stateParams.variableCategoryName;
					setupVariableCategory($scope.variableCategoryName);
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

        $scope.unit_search = function(){

            var unitSearchQuery = $scope.state.unit_text;
            if(unitSearchQuery !== ""){
                $scope.state.show_units = true;
                var unitMatches = $scope.state.units.filter(function(unit) {
                    return unit.abbreviatedName.toLowerCase().indexOf(unitSearchQuery.toLowerCase()) !== -1;
                });

                if(unitMatches.length < 1){
                    unitMatches = $scope.state.units.filter(function(unit) {
                        return unit.name.toLowerCase().indexOf(unitSearchQuery.toLowerCase()) !== -1;
                    });
                }

                $timeout(function() {
                    $scope.state.searchedUnits = unitMatches;
                }, 100);

            } else {
                $scope.state.show_units = false;
            }
        };

        // when a unit is selected
        $scope.unit_selected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.state.abbreviatedUnitName = unit.abbreviatedName;
            $scope.state.unit_text = unit.abbreviatedName;
            $scope.state.show_units = false;
            $scope.state.selected_sub = unit.abbreviatedName;
        };

        $scope.toggleShowUnits = function(){
            $scope.state.show_units=!$scope.state.show_units;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        $scope.getUnits = function () {
            // get units
            measurementService.refreshUnits();
            measurementService.getUnits().then(function (units) {

                $scope.state.units = units;

                // populate unitCategories
                for (var i in units) {
                    if ($scope.lists.unitCategories.indexOf(units[i].category) === -1) {
                        $scope.lists.unitCategories.push(units[i].category);
                        $scope.state.unitCategories[units[i].category] = [{
                            name: units[i].name,
                            abbreviatedName: units[i].abbreviatedName
                        }];
                    } else {
                        $scope.state.unitCategories[units[i].category].push({
                            name: units[i].name,
                            abbreviatedName: units[i].abbreviatedName
                        });
                    }
                }

                // set default unit category
                $scope.selected_unit_category = 'Duration';

                // set first sub unit of selected category
                $scope.state.selected_sub = $scope.state.unitCategories[$scope.selected_unit_category][0].abbreviatedName;

                console.log("got units", units);

                // if (variableCategoryConfig[category].default_unit) {
                //     set_unit(variableCategoryConfig[category].default_unit);
                // }

                // hide spinner
                $ionicLoading.hide();

            });


        };
	});