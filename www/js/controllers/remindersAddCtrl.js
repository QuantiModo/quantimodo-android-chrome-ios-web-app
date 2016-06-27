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
            //title : "Add Reminder",
            showAddVariableCard : false,
            showVariableCategorySelector : false,
            showSearchBox : false,
            showResults : false,
            showReminderFrequencyCard : false,
            showAddVariableButton : false,
            showUnits: false,
            searching : false,
            selectedFrequency : 'Daily',
            selectedReminder : false,
            reminderStartTimeEpochTime : currentTime.getTime() / 1000,
            reminderStartTimeStringUtc : timeService.getCurrentTimeInUtcString(),
            measurementSynonymSingularLowercase : 'measurement',
            defaultValueLabel : 'Default Value',
            defaultValuePlaceholderText : 'Enter typical value',
            variableSearchPlaceholderText : 'Search for a variable...'
        };
        
        $scope.state.trackingReminder = {
            variableId : null,
            variableName : null,
            combinationOperation : null
        };

        $scope.loading = true;
		
	    // data
	    $scope.variables = {
	    	variableCategories : [
		    	{ id : 1, name : 'Emotions' },
		    	{ id : 2, name : 'Symptoms' },
		    	{ id : 3, name : 'Treatments' },
		    	{ id : 4, name : 'Foods' },
                { id : 5, name : 'Vital Signs' },
                { id : 6, name : 'Physical Activity' },
                { id : 7, name : 'Sleep' },
                { id : 8, name : 'Miscellaneous' }
	    	],
	    	frequencyVariables : [
                { id : 1, name : 'Daily'},
	    		{ id : 2, name : 'Every 12 hours'},
	    		{ id : 3, name : 'Every 8 hours'},
	    		{ id : 4, name : 'Every 6 hours'},
	    		{ id : 5, name : 'Every 4 hours'},
	    		{ id : 6, name : 'Every 3 hours'},
				{ id : 7, name : 'Every 2 hours'},
				{ id : 8, name : 'Hourly'},
	    		{ id : 9, name : 'Every 30 minutes'},
	    		{ id : 10, name : 'Never'}
                //{ id : 11, name : 'Every minute'},
	    	]
	    };

        // Deprecated

		// when add new variable is tapped
		$scope.addNewVariable = function(){
			console.log("add variable");
            if($scope.state.trackingReminder.variableCategoryName){
                $scope.state.variableCategoryObject =
                    variableCategoryService.getVariableCategoryInfo($scope.state.trackingReminder.variableCategoryName);
                $scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            }
			$scope.state.showSearchBox = false;
			$scope.state.showResults = false;
			$scope.state.showAddVariableCard = true;
            $scope.state.showReminderFrequencyCard = true;
            $scope.state.showVariableCategorySelector = false;
			$scope.state.trackingReminder.variableName = $scope.state.variableSearchQuery;
            $scope.state.trackingReminder.defaultValue = "";
		};

		$scope.openReminderStartTimePicker = function() {
            var today = new Date();
            var secondsSinceMidnightLocal = (today.getHours() * 60 * 60) + (today.getMinutes() * 60);
            console.log(today);
            console.log("today.getHours(): " + today.getHours());
            console.log("today.getMinutes(): " + today.getMinutes());
            console.log("today.getTimezoneOffset(): " + today.getTimezoneOffset() + "; hours = " + today.getTimezoneOffset()/60);

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
                },
                inputTime: secondsSinceMidnightLocal,
                step: 1,
                closeLabel: 'Cancel'
            };

			ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
		};

        // Deprecated
        /*
	    // when variableCategoryName is selected
	    $scope.onVariableCategoryChange = function(){
            window.location.replace(window.location.href + '/' + $scope.state.trackingReminder.variableCategoryName);
	    };
	    */

        $scope.goToAddMeasurement = function(){
            $state.go('app.measurementAdd', {
                variableObject: $scope.variableObject,
                fromState: $state.current.name,
                fromUrl: window.location.href
            });
        };

        // Deprecated
        // when a query is searched in the search box
        $scope.onVariableSearch = function(){
            console.log("Search: ", $scope.state.variableSearchQuery);
            if($scope.state.variableSearchQuery.length > 2){
                $scope.state.showResults = true;
                $scope.state.searching = true;
                variableService.searchVariablesIncludePublic($scope.state.variableSearchQuery, $scope.state.trackingReminder.variableCategoryName)
                    .then(function(variables){
                        // populate list with results
                        $scope.state.showResults = true;
                        $scope.state.variableSearchResults = variables;
                        $scope.state.searching = false;
                        if(variables.length < 1){
                            $scope.state.showAddVariableButton = true;
                            $scope.state.addNewVariableButtonText = '+ Create ' + $scope.state.variableSearchQuery + ' reminder';
                        }
                    });
            }
        };

        var populateUserVariables = function(){
            if($stateParams.variableCategoryName){
                $scope.showLoader('Fetching most recent ' +
                    $filter('wordAliases')($stateParams.variableCategoryName.toLowerCase()) + '...');
            } else {
                $scope.showLoader('Fetching most recent variables...');
            }
            variableService.getUserVariablesByCategory($scope.state.trackingReminder.variableCategoryName)
                .then(function(variables){
                    $scope.state.showResults = true;
                    $scope.state.variableSearchResults = variables;
                    $scope.state.searching = false;
                    if(!$scope.state.trackingReminder.variableCategoryName){
                        $scope.state.showVariableCategorySelector = true;
                    }
                    $ionicLoading.hide();
                    $scope.loading = false;
                    $scope.state.showSearchBox = true;
                });
        };

	    // when a search result is selected
	    $scope.onVariableSelect = function(selectedVariable){
	    	console.log("Variable Selected: ", selectedVariable);

	    	if(!selectedVariable.variableCategoryName){
	    		selectedVariable.variableCategoryName = selectedVariable.category;
	    	}
	    	$scope.variableObject=selectedVariable;

            $scope.setupVariableCategory(selectedVariable.variableCategoryName);
            $scope.state.trackingReminder.abbreviatedUnitName = selectedVariable.abbreviatedUnitName;
            $scope.state.trackingReminder.combinationOperation = selectedVariable.combinationOperation;
            $scope.state.trackingReminder.variableId = selectedVariable.id;
            $scope.state.trackingReminder.variableName = selectedVariable.name;
            $scope.state.trackingReminder.variableDescription = selectedVariable.description;
            $scope.state.showResults = false;
            $scope.state.showSearchBox = false;
            $scope.state.showReminderFrequencyCard = true;

            if ($scope.state.trackingReminder.abbreviatedUnitName === "/5") {
                $scope.state.trackingReminder.defaultValue = 3;
            }
	    };

	    // when frequency is changed
	    $scope.onFrequencyChange = function(){
	    	console.log("onFrequencyChange ran");
            
	    };

	    // when adding/editing is cancelled
	    $scope.cancel = function(){
	    	//if($stateParams.reminder && $stateParams.reminder !== null){
            if($stateParams.fromUrl){
                window.location=$stateParams.fromUrl;
            } else {
                $state.go('app.remindersManage');
            }
	    	/*} else {
				$state.reload();
            }*/
	    };

	    $scope.saveModifiedReminder = function(){

            $scope.showLoader('Saving ' + $scope.state.trackingReminder.variableName + ' reminder...');
            $scope.state.trackingReminder.reminderFrequency = getFrequencyChart()[$scope.state.selectedFrequency];
            $scope.state.trackingReminder.reminderStartTime = $scope.state.reminderStartTimeStringUtc;
	    	reminderService.addNewReminder($scope.state.trackingReminder)
	    	.then(function(){

	    		$ionicLoading.hide();
                $scope.loading = false;
	    		if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
	    				$state.go($stateParams.fromState);
	    			} else {
						$state.go('app.remindersManage');
                    }
	    		} else {
					$state.go('app.remindersManage');
                }

	    	}, function(err){

                $ionicLoading.hide();
                $scope.loading = false;
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
                "Every minute": 60,
	    		"Hourly":60*60,
	    		"Never": 0,
	    		"Daily": 24*60*60,
	    		"Twice a day" : 12*60*60,
	    		"Three times a day": 8*60*60
	    	};
	    };

	    // when the reminder is saved/edited
	    $scope.save = function(){

            if($scope.state.trackingReminder.abbreviatedUnitName === '/5' && !$scope.state.trackingReminder.defaultValue){
                $scope.state.trackingReminder.defaultValue = 3;
            }

	    	if($stateParams.reminder && $stateParams.reminder !== null){
                $scope.showLoader();
	    		$scope.saveModifiedReminder();
	    		return;
	    	}

            if(!$scope.state.trackingReminder.variableCategoryName) {
                utilsService.showAlert('Please select a variable category');
                return;
            }

            if(!$scope.state.trackingReminder.variableName) {
                utilsService.showAlert('Please enter a variable name');
                return;
            }

            if(!$scope.state.trackingReminder.abbreviatedUnitName) {
                utilsService.showAlert('Please select a unit');
                return;
            }

            if(!$scope.state.trackingReminder.defaultValue && $scope.state.trackingReminder.defaultValue !== 0) {
                utilsService.showAlert('Please enter a default value');
                return;
            }

            $scope.showLoader('Saving ' + $scope.state.trackingReminder.variableName + ' reminder...');
            $scope.state.trackingReminder.reminderFrequency = getFrequencyChart()[$scope.state.selectedFrequency];
            $scope.state.trackingReminder.reminderStartTime = $scope.state.reminderStartTimeStringUtc;

	    	reminderService.addNewReminder($scope.state.trackingReminder)
	    	.then(function(){

	    		$ionicLoading.hide();
                $scope.loading = false;
				if($stateParams.fromUrl){
					window.location = $stateParams.fromUrl;
				} else if ($stateParams.reminder && $stateParams.fromState){
					$state.go($stateParams.fromState);
				} else {
					$state.go('app.remindersManage');
				}

	    	}, function(err){
                console.log(err);
	    		$ionicLoading.hide();
                $scope.loading = false;
	    		utilsService.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };


	    // setup editing view
	    var setupEditReminder = function(trackingReminder){
            $scope.state.trackingReminder = trackingReminder;
            $scope.state.trackingReminder.firstDailyReminderTime = null;
            $scope.state.trackingReminder.secondDailyReminderTime = null;
            $scope.state.trackingReminder.thirdDailyReminderTime = null;
	    	$scope.state.title = "Edit " +  trackingReminder.variableName + " Reminder";
            $scope.state.reminderStartTimeStringUtc = trackingReminder.reminderStartTime;
            
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
                60: "Every minute",
				0: "Never"
	    	};

			if(typeof $stateParams.reminder.reminderStartTime !== "undefined" &&
                $stateParams.reminder.reminderStartTime !== null){

				$scope.state.reminderStartTimeStringUtc = $stateParams.reminder.reminderStartTime;
                $scope.state.reminderStartTimeEpochTime =
                    timeService.getEpochTimeFromUtcString($stateParams.reminder.reminderStartTime);
			}

	    	if($scope.state.trackingReminder.reminderFrequency && $scope.state.trackingReminder.reminderFrequency !== null){
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.trackingReminder.reminderFrequency];
	    	}

	    	$scope.state.showReminderFrequencyCard = true;

	    };

	    // setup category view
	    $scope.setupVariableCategory = function(variableCategoryName){
            console.log("variableCategoryName  is " + variableCategoryName);
            $scope.state.showVariableCategorySelector = false;
            if(!variableCategoryName){
                variableCategoryName = '';
            }
            $scope.state.trackingReminder.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            $scope.state.title = "Add " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Reminder";
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            $scope.state.variableSearchPlaceholderText = 'Search for a ' + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + '...';
	    };

        function setupReminderEditingFromVariableId(variableId) {
            if(variableId){
                variableService.getVariableById(variableId)
                    .then(function (variables) {
                        $scope.variableObject = variables[0];
                        console.log($scope.variableObject);
                        $scope.onVariableSelect($scope.variableObject);
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function () {
                        $ionicLoading.hide();
                        $scope.loading = false;
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
                        } else if  ($stateParams.fromState) {
                            $state.go($stateParams.fromState);
                        } else {
                            $state.go('app.remindersManage');
                        }
                    }
                    $stateParams.reminder = $scope.state.allReminders[0];
                    setupEditReminder($stateParams.reminder);
                    $ionicLoading.hide();
                    $scope.loading = false;
                }, function () {
                    $ionicLoading.hide();
                    $scope.loading = false;
                    console.log("failed to get reminders");
                });
        }

        $scope.init = function(){


            var isAuthorized = authService.checkAuthOrSendToLogin();

            if(isAuthorized){
                $scope.getUnits();
                var reminderIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'reminderId');
                var variableIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'variableId');

                if($stateParams.variableCategoryName){
                    $scope.state.trackingReminder.variableCategoryName = $stateParams.variableCategoryName;
                    $scope.setupVariableCategory($scope.state.trackingReminder.variableCategoryName);
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
                    $scope.state.title = $filter('wordAliases')('Add Reminder');
                    populateUserVariables();
                }
            }
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});
        
        $scope.unitSearch = function(){

            var unitSearchQuery = $scope.state.trackingReminder.abbreviatedUnitName;
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
            $scope.showLoader('Deleting ' + $scope.state.trackingReminder.variableName + ' reminder...');
            reminderService.deleteReminder($scope.state.trackingReminder.id)
                .then(function(){

                    $ionicLoading.hide();
                    $scope.loading = false;
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

                    $ionicLoading.hide();
                    $scope.loading = false;
                    utilsService.showAlert('Failed to Delete Reminder, Try again!', 'assertive');
                });
        };

        // when a unit is selected
        $scope.unitSelected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.state.trackingReminder.abbreviatedUnitName = unit.abbreviatedName;
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
			unitService.getUnits().then(function (unitObjects) {
                $scope.state.unitObjects = unitObjects;
            });
        };
	});