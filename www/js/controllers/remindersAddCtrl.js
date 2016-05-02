angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersAddCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											 $stateParams, measurementService, reminderService, $ionicLoading,
											 utilsService, $filter, ionicTimePicker, $timeout, 
											 variableCategoryService, variableService, unitService, timeService){

	    $scope.controller_name = "RemindersAddCtrl";

		console.log('Loading ' + $scope.controller_name);

        var currentTime = new Date();
        var startTimeFormat = "HH:mm:ss";

        // state
	    $scope.state = {
			variableSearchResults : [],
			unitCategories : [],
            title : "Add Reminder",
            showAddVariableCard : false,
            variableId : null,
            variableName : null,
            combinationOperation : null,
            showVariableCategorySelector : false,
            showSearchBox : false,
            showResults : false,
            showReminderFrequencyCard : false,
            showAddVariableButton : false,
            showUnits: false,
            variableSearchQuery : "",
            searching : false,
            selectedFrequency : 'Hourly',
            selectedReminder : false,
            reminderStartTimeEpochTime : currentTime.getTime() / 1000
    };
        
        $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo();
		
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
	    		{ id : 10, name : 'Daily' , group : 'frequency'}
	    	]
	    };

		// when add new variable is tapped
		$scope.addVariable = function(){
			console.log("add variable");
			$scope.state.showSearchBox = false;
			$scope.state.showResults = false;
			$scope.state.showAddVariableCard = true;
            $scope.state.showReminderFrequencyCard = true;
			$scope.state.variableName = $scope.state.variableSearchQuery;
            $scope.state.defaultValue = "";
            $scope.getUnits();

		};

		$scope.openReminderStartTimePicker = function() {

            var secondsSinceMidnightLocal =
                timeService.getSecondsSinceMidnightLocal($scope.state.reminderStartTimeStringUtc);

            $scope.state.timePickerConfiguration = {
                callback: function (val) {
                    if (typeof (val) === 'undefined') {
                        console.log('Time not selected');
                    } else {
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());

                        console.log('Selected epoch is : ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');

                        $scope.state.reminderStartTimeEpochTime = a.getTime() / 1000;
                        $scope.state.reminderStartTimeStringUtc = moment.utc(a).format('HH:mm:ss');
                    }
                }
            };

			ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
		};

		// populate list with recently tracked category variables
    	var populateRecentlyTrackedVariables = function(variableCategoryName){

    		utilsService.startLoading();
	    	// get user token
			authService.getAccessTokenFromAnySource().then(function(token){

				if(!variableCategoryName){
					// get all variables
					console.log('Get most recent anything variables');
					variableService.getVariables().then(function(variables){

					    $scope.variableSearchResults = variables;
					    utilsService.stopLoading();

					}, function(){
						utilsService.stopLoading();
					});
				} else {
					console.log('get all variables by variableCategoryName');
					variableService.searchVariablesIncludePublic('*', $scope.state.variableCategoryName).then(function(variables){

					    $scope.variableSearchResults = variables;

					    utilsService.stopLoading();

					}, function(){
						utilsService.stopLoading();
					});
				}

			}, function(){
			   utilsService.showLoginRequiredAlert($scope.login);
			   utilsService.stopLoading();

			});
    	};

	    // when variableCategoryName is selected
	    $scope.onVariableCategoryChange = function(){
	    	console.log("Variable category selected: ", $scope.state.variableCategoryName);
	    	$scope.state.variableSearchQuery = '';
	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = true;
            setupVariableCategory($scope.state.variableCategoryName);
	    };

	    var variableSearch = function(variableSearchQuery){
	    	// search server for the query

	    	if(!$scope.state.variableCategoryName){
				variableService.searchVariablesIncludePublic(variableSearchQuery)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.variableSearchResults = variables;
	    		    $scope.state.searching = false;
                    if(variables.length < 1){
                        $scope.state.showAddVariableButton = true;
                    }
	    		});
	    	} else {
				variableService.searchVariablesIncludePublic(variableSearchQuery, $scope.variableCategoryName)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.variableSearchResults = variables;
	    		    $scope.state.searching = false;
                    if(variables.length < 1){
                        $scope.state.showAddVariableButton = true;
                    }
	    		});
	    	}
	    };

	    // when a query is searched in the search box
	    $scope.onSearch = function(){
	    	console.log("Search: ", $scope.state.variableSearchQuery);
	    	if($scope.state.variableSearchQuery === ""){
                $scope.state.showResults = true;
                $scope.state.searching = true;
                variableSearch($scope.state.variableSearchQuery);
            } else {

                $scope.state.showResults = true;
                $scope.state.searching = true;
                variableSearch($scope.state.variableSearchQuery);
	    	}
	    };

	    // when a search result is selected
	    $scope.onVariableSelect = function(selectedVariable){
	    	console.log("Variable Selected: ", selectedVariable);

            setupVariableCategory(selectedVariable.variableCategoryName);
            $scope.state.abbreviatedUnitName = selectedVariable.abbreviatedUnitName;
            $scope.state.abbreviatedUnitName = selectedVariable.abbreviatedUnitName;
            $scope.state.combinationOperation = selectedVariable.combinationOperation;
            $scope.state.id = selectedVariable.id;
            $scope.state.variableId = selectedVariable.variableId;
            $scope.state.variableName = selectedVariable.name;
            $scope.state.showResults = false;
            $scope.state.showSearchBox = false;
            $scope.state.showReminderFrequencyCard = true;

	    	//$scope.state.defaultValue = selectedVariable.mostCommonValue? selectedVariable.mostCommonValue : selectedVariable.lastValue;
	    };

	    // when frequency is changed
	    $scope.onFrequencyChange = function(){
	    	console.log("onFrequencyChange ran");
            
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

	    	utilsService.startLoading();

	    	reminderService.postTrackingReminder(
	    		$scope.state.id,
				$scope.state.variableId,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency],
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
                $scope.state.reminderStartTimeStringUtc)
	    	.then(function(){

	    		utilsService.stopLoading();
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

	    		utilsService.stopLoading();
	    		utilsService.showAlert('Failed to add Reminder, Try again!', 'assertive');
				console.log(err);
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
	    		"Daily": 24*60*60,
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

            if(!$scope.state.variableName) {
                $scope.showAlert('Variable Name missing!');
                return;
            }

            if(!$scope.state.abbreviatedUnitName) {
                $scope.showAlert('Unit is missing!');
                return;
            }

            if(!$scope.state.defaultValue) {
                $scope.showAlert('Default value is missing!');
                return;
            }


	    	utilsService.startLoading();

	    	reminderService.addNewReminder(
	    		$scope.state.id,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency],
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
                $scope.state.reminderStartTimeStringUtc)
	    	.then(function(){

	    		utilsService.stopLoading();
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
                console.log(err);
	    		utilsService.stopLoading();
	    		utilsService.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };


	    // setup editing view
	    var setupEditReminder = function(){

            $scope.state.id = $stateParams.reminder.id;
            $scope.state.variableName = $stateParams.reminder.variableName;
            $scope.state.variableId = $stateParams.reminder.variableId;
	    	$scope.state.selectedReminder = $stateParams.reminder;
	    	$scope.state.title = "Edit " +  $stateParams.reminder.variableName + " Reminder";
	    	$scope.state.abbreviatedUnitName = $scope.state.selectedReminder.abbreviatedUnitName;
            $scope.state.defaultValue = $scope.state.selectedReminder.defaultValue;
            $scope.state.reminderFrequency = $scope.state.selectedReminder.reminderFrequency;
            $scope.state.reminderStartTimeStringUtc = $scope.state.selectedReminder.reminderStartTime;

	    	var reverseFrequencyChart = {

	    		86400: "Daily",
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

			if(typeof $stateParams.reminder.reminderStartTime !== "undefined" &&
                $stateParams.reminder.reminderStartTime !== null){

				$scope.state.reminderStartTimeStringUtc = $stateParams.reminder.reminderStartTime;
                $scope.state.reminderStartTimeEpochTime =
                    timeService.getEpochTimeFromUtcString($stateParams.reminder.reminderStartTime);
			}

	    	if($scope.state.reminderFrequency && $scope.state.reminderFrequency !== null){
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.reminderFrequency];
	    	}

	    	$scope.state.showReminderFrequencyCard = true;

	    };

	    // setup category view
	    var setupVariableCategory = function(variableCategoryName){

            if(!variableCategoryName){
                variableCategoryName = '';
            }
            $scope.state.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.title = "Add a " + $filter('wordAliases')(pluralize(variableCategoryName, 1) + " Reminder");
            $scope.state.showVariableCategorySelector = false;
            $scope.state.showSearchBox = true;
            $scope.state.showResults = true;

			populateRecentlyTrackedVariables(variableCategoryName);
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
                $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo($stateParams.variableCategoryName);
                $scope.state.showSearchBox = true;
                $scope.state.showResults = true;
                $scope.state.showVariableCategorySelector = false;
                $scope.state.title = "Add a " + $filter('wordAliases')(pluralize($stateParams.variableCategoryName, 1) + " Reminder");
            }

            var reminderIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'reminderId');

			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
				$scope.getUnits();
				if($stateParams.variableCategoryName){
					$scope.variableCategoryName = $stateParams.variableCategoryName;
					setupVariableCategory($scope.variableCategoryName);
				}
				else if($stateParams.reminder && $stateParams.reminder !== null) {
					setupEditReminder($stateParams.reminder);
                }
                else if(reminderIdUrlParameter) {
                    reminderService.getTrackingReminders(null, reminderIdUrlParameter)
                        .then(function(reminders){
                            $scope.state.allReminders = reminders;
                            if (reminders.length !== 1){
                                utilsService.showAlert("Reminder id " + reminderIdUrlParameter + " not found!", 'assertive');
                                if($stateParams.reminder.fromState){
                                    $state.go($stateParams.reminder.fromState);
                                } else {
                                    $state.go('app.reminders_manage');
                                }
                            }
                            $stateParams.reminder = $scope.state.allReminders[0];
                            setupEditReminder($stateParams.reminder);
                            utilsService.stopLoading();
                        }, function(){
                            utilsService.stopLoading();
                            console.log("failed to get reminders");
                            console.log("need to log in");
                            $ionicLoading.hide();
                            utilsService.showLoginRequiredAlert($scope.login);
                        });
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
				cssClass : 'positive',
				okType : 'button-positive',
				title: title,
				template: template
			});
	    };

        $scope.unitSearch = function(){

            var unitSearchQuery = $scope.state.abbreviatedUnitName;
            if(unitSearchQuery !== ""){
                $scope.state.showUnits = true;
                var unitMatches = $scope.state.unitObjects.filter(function(unit) {
                    return unit.abbreviatedName.toLowerCase().indexOf(unitSearchQuery.toLowerCase()) !== -1;
                });

                if(unitMatches.length < 1){
                    unitMatches = $scope.state.unitObjects.filter(function(unit) {
                        return unit.name.toLowerCase().indexOf(unitSearchQuery.toLowerCase()) !== -1;
                    });
                }

                $timeout(function() {
                    $scope.state.searchedUnits = unitMatches;
                }, 100);

            } else {
                $scope.state.showUnits = false;
            }
        };

        // when a unit is selected
        $scope.unitSelected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.state.abbreviatedUnitName = unit.abbreviatedName;
            $scope.state.showUnits = false;
            $scope.state.selectedUnitAbbreviatedName = unit.abbreviatedName;
        };

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits=!$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        $scope.getUnits = function () {
            // get units
            unitService.refreshUnits();
			unitService.getUnits().then(function (unitObjects) {

                $scope.state.unitObjects = unitObjects;

                // populate unitCategories
                for (var i in unitObjects) {
                    if ($scope.state.unitCategories.indexOf(unitObjects[i].category) === -1) {
                        $scope.state.unitCategories.push(unitObjects[i].category);
                        $scope.state.unitCategories[unitObjects[i].category] = [{
                            name: unitObjects[i].name,
                            abbreviatedName: unitObjects[i].abbreviatedName
                        }];
                    } else {
                        $scope.state.unitCategories[unitObjects[i].category].push({
                            name: unitObjects[i].name,
                            abbreviatedName: unitObjects[i].abbreviatedName
                        });
                    }
                }

                // set default unit category
                $scope.selectedUnitCategoryName = 'Duration';

                // set first sub unit of selected category
                $scope.state.selectedUnitAbbreviatedName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;

                console.log("got units", unitObjects);

                // if (variableCategoryConfig[category].defaultUnitAbbreviatedName) {
                //     setUnit(variableCategoryConfig[category].defaultUnitAbbreviatedName);
                // }

                // hide spinner
                $ionicLoading.hide();

            });


        };
	});