angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersAddCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											 $stateParams, measurementService, reminderService, $ionicLoading,
											 utilsService, $filter, ionicTimePicker, $timeout, 
											 variableCategoryService, variableService, unitService, timeService,
                                             $rootScope){

	    $scope.controller_name = "RemindersAddCtrl";

		console.log('Loading ' + $scope.controller_name);

        var currentTime = new Date();

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
            selectedFrequency : 'Daily',
            selectedReminder : false,
            reminderStartTimeEpochTime : currentTime.getTime() / 1000,
            reminderStartTimeStringUtc : timeService.getCurrentTimeInUtcString(),
            measurementSynonymSingularLowercase : 'measurement',
            defaultValueLabel : 'Default Value',
            defaultValuePlaceholderText : 'Enter most common value here'
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

	    // when variableCategoryName is selected
	    $scope.onVariableCategoryChange = function(){
	    	console.log("Variable category selected: ", $scope.state.variableCategoryName);
	    	$scope.state.variableSearchQuery = '';
	    	$scope.state.showResults = false;
	    	$scope.state.showSearchBox = true;
            setupVariableCategory($scope.state.variableCategoryName);
	    };

        $scope.goToAddMeasurement = function(){
            $state.go('app.measurementAdd', {
                variableObject: $scope.variableObject,
                fromState: $state.current.name,
                fromUrl: window.location.href
            });
        };


        var variableSearch = function(variableSearchQuery){
            variableService.searchVariablesIncludePublic(variableSearchQuery, $scope.state.variableCategoryName)
            .then(function(variables){
                // populate list with results
                $scope.state.showResults = true;
                $scope.variableSearchResults = variables;
                $scope.state.searching = false;
                if(variables.length < 1){
                    $scope.state.showAddVariableButton = true;
                }
            });
	    };

        var populateUserVariables = function(){
            variableService.getUserVariablesByCategory($scope.state.variableCategoryName)
                .then(function(variables){
                    $scope.state.showResults = true;
                    $scope.variableSearchResults = variables;
                    $scope.state.searching = false;
                });
        };

	    // when a query is searched in the search box
	    $scope.onSearch = function(){
	    	console.log("Search: ", $scope.state.variableSearchQuery);
	    	if($scope.state.variableSearchQuery === ""){
                $scope.state.showResults = true;
                $scope.state.searching = true;
                populateUserVariables($scope.state.variableSearchQuery);
            } else {
                $scope.state.showResults = true;
                $scope.state.searching = true;
                variableSearch($scope.state.variableSearchQuery);
	    	}
	    };

	    // when a search result is selected
	    $scope.onVariableSelect = function(selectedVariable){
	    	console.log("Variable Selected: ", selectedVariable);

	    	if(!selectedVariable.variableCategoryName){
	    		selectedVariable.variableCategoryName = selectedVariable.category;
	    	}
	    	$scope.variableObject=selectedVariable;

            setupVariableCategory(selectedVariable.variableCategoryName);
            $scope.state.abbreviatedUnitName = selectedVariable.abbreviatedUnitName;
            $scope.state.combinationOperation = selectedVariable.combinationOperation;
            $scope.state.id = selectedVariable.id;
            $scope.state.variableId = selectedVariable.variableId;
            $scope.state.variableName = selectedVariable.name;
            $scope.state.variableDescription = selectedVariable.description;
            $scope.state.showResults = false;
            $scope.state.showSearchBox = false;
            $scope.state.showReminderFrequencyCard = true;

            if ($scope.state.abbreviatedUnitName == "/5" && $scope.state.variableCategoryName == "Symptoms") {
                $scope.state.defaultValue = 3;
            }

	    	//$scope.state.defaultValue = selectedVariable.mostCommonValue? selectedVariable.mostCommonValue : selectedVariable.lastValue;
	    };

	    // when frequency is changed
	    $scope.onFrequencyChange = function(){
	    	console.log("onFrequencyChange ran");
            
	    };

	    // when adding/editing is cancelled
	    $scope.cancel = function(){
	    	if($stateParams.reminder && $stateParams.reminder !== null){
	    		if($stateParams.fromUrl){
                    window.location=$stateParams.fromUrl;
	    		} else {
					$state.go('app.remindersManage');
                }

	    	} else {
				$state.reload();
            }
	    };

	    $scope.saveModifiedReminder = function(){

	    	utilsService.loadingStart();

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

	    		utilsService.loadingStop();
	    		if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.reminder.fromState){
	    				$state.go($stateParams.reminder.fromState);
	    			} else {
						$state.go('app.remindersManage');
                    }
	    		} else {
					$state.go('app.remindersManage');
                }

	    	}, function(err){

	    		utilsService.loadingStop();
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
	    		$scope.saveModifiedReminder();
	    		return;
	    	}

            if(!$scope.state.variableName) {
                utilsService.showAlert('Variable Name missing!');
                return;
            }

            if(!$scope.state.abbreviatedUnitName) {
                utilsService.showAlert('Unit is missing!');
                return;
            }

            if(!$scope.state.defaultValue) {
                utilsService.showAlert('Default value is missing!');
                return;
            }


	    	utilsService.loadingStart();

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

	    		utilsService.loadingStop();
				if($stateParams.fromUrl){
					window.location = $stateParams.fromUrl;
				} else if ($stateParams.reminder && $stateParams.reminder.fromState){
					$state.go($stateParams.reminder.fromState);
				} else {
					$state.go('app.remindersManage');
				}

	    	}, function(err){
                console.log(err);
	    		utilsService.loadingStop();
	    		utilsService.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };


	    // setup editing view
	    var setupEditReminder = function(reminder){

            $scope.reminder = reminder;
            $scope.state.id = reminder.id;
            $scope.state.variableName = reminder.variableName;
            $scope.state.variableId = reminder.variableId;
	    	$scope.state.selectedReminder = reminder;
	    	$scope.state.title = "Edit " +  reminder.variableName + " Reminder";
	    	$scope.state.abbreviatedUnitName = reminder.abbreviatedUnitName;
            $scope.state.defaultValue = reminder.defaultValue;
            $scope.state.reminderFrequency = reminder.reminderFrequency;
            $scope.state.reminderStartTimeStringUtc = reminder.reminderStartTime;

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
            console.log("variableCategoryName  is " + variableCategoryName);
            if(!variableCategoryName){
                variableCategoryName = '';
            }
            $scope.state.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.title = "Add " + $filter('wordAliases')(pluralize(variableCategoryName, 1) + " Reminder");
            $scope.state.showVariableCategorySelector = false;
            $scope.state.showSearchBox = true;
            $scope.state.showResults = true;
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
	    };

	    // setup new reminder view
	    var setupNewReminderSearch = function(){
	    	$scope.state.showVariableCategorySelector = true;
	    	$scope.state.showSearchBox = true;
	    };

        function setupReminderEditingFromVariableId(variableId) {
            if(variableId){
                variableService.getVariableById(variableId)
                    .then(function (variables) {
                        $scope.variableObject = variables[0];
                        console.log($scope.variableObject);
                        $scope.onVariableSelect($scope.variableObject);
                        utilsService.loadingStop();
                    }, function () {
                        utilsService.loadingStop();
                        console.log("failed to get variable");
                    });

            }
        }

        function setupReminderEditingFromUrlParameter(reminderIdUrlParameter) {
            reminderService.getTrackingReminders(null, reminderIdUrlParameter)
                .then(function (reminders) {
                    $scope.state.allReminders = reminders;
                    if (reminders.length !== 1) {
                        utilsService.showAlert("Reminder id " + reminderIdUrlParameter + " not found!", 'assertive');
                        if($stateParams.fromUrl){
                            window.location = $stateParams.fromUrl;
                        } else if  ($stateParams.reminder.fromState) {
                            $state.go($stateParams.reminder.fromState);
                        } else {
                            $state.go('app.remindersManage');
                        }
                    }
                    $stateParams.reminder = $scope.state.allReminders[0];
                    setupEditReminder($stateParams.reminder);
                    utilsService.loadingStop();
                }, function () {
                    utilsService.loadingStop();
                    console.log("failed to get reminders");
                });
        }

        $scope.init = function(){
            $scope.state.loading = true;
            utilsService.loadingStart();
            var isAuthorized = authService.checkAuthOrSendToLogin();

            if(isAuthorized){
                if($stateParams.variableCategoryName){
                    setupVariableCategory($stateParams.variableCategoryName);
                }
                var reminderIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'reminderId');
                var variableIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'variableId');
                $scope.getUnits();
                if($stateParams.variableCategoryName){
                    $scope.state.variableCategoryName = $stateParams.variableCategoryName;
                    setupVariableCategory($scope.state.variableCategoryName);
                    populateUserVariables($stateParams.variableCategoryName);
                } else if ($stateParams.reminder && $stateParams.reminder !== null) {
                    setupEditReminder($stateParams.reminder);
                }
                else if(reminderIdUrlParameter) {
                    setupReminderEditingFromUrlParameter(reminderIdUrlParameter);
                } else if(variableIdUrlParameter){
                    setupReminderEditingFromVariableId(variableIdUrlParameter);
                } else if ($stateParams.variableObject) {
                    $scope.variableObject = $stateParams.variableObject;
                    $scope.onVariableSelect($stateParams.variableObject);
                }
                else {
                    setupNewReminderSearch();
                }
            }
            $scope.state.loading = false;
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});
        
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

        $scope.deleteReminder = function(){
            utilsService.loadingStart();
            reminderService.deleteReminder($scope.reminder.id)
                .then(function(){

                    utilsService.loadingStop();
                    utilsService.showAlert('Reminder Deleted.');
                    if($stateParams.fromUrl){
                        window.location=$stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideMenu = false;
                        $state.go('app.remindersManage');
                    }

                }, function(err){

                    utilsService.loadingStop();
                    utilsService.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
                });
        };


        $scope.selectPrimaryOutcomeVariableValue = function($event, val){
            // remove any previous primary outcome variables if present
            jQuery('.active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

            // make this primary outcome variable glow visually
            jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');

            jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

            // update view
            $scope.state.defaultValue = val;
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