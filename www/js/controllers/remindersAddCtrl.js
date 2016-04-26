angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersAddCtrl', function($scope, authService, $ionicPopup, localStorageService, $state,
											 $stateParams, measurementService, reminderService, $ionicLoading,
											 utilsService, $filter, ionicTimePicker, $timeout, variableCategoryService){

	    $scope.controller_name = "RemindersAddCtrl";

		console.log('Loading ' + $scope.controller_name);

        // state
	    $scope.state = {
            title : "Add Reminder",
            showAddVariableCard : false,
            variableId : null,
            variableName : null,
            combinationOperation : null,
            unitCategories : {},
	    	showVariableCategorySelector : false,
	    	showSearchBox : false,
	    	showResults : false,
	    	showReminderFrequencyCard : false,
            showAddVariableButton : false,
            show_units: false,
            variableSearchQuery : "",
	    	searching : false,
	    	selectedFrequency : 'Hourly',
	    	selectedReminder : false,
	    	reminderStartTimeObject : {
                epochTime: new Date().getTime()/1000,
                inputTime: 0,
				format: 12,
				step: 1
			},
			reminderStartTimeUtcHourMinuteSecond : moment.utc().format('HH:mm:ss')

	    };

        console.log('Input time is ' + $scope.state.reminderStartTimeObject.inputTime);

        $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo();

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
	    		{ id : 10, name : 'Daily' , group : 'frequency'}
	    	]
	    };

        var configureTimePickerSettingsObject = function (secondsSinceMidnightLocal) {

            if(!secondsSinceMidnightLocal){
                secondsSinceMidnightLocal = 0;
            }
            $scope.state.timePickerConfiguration = {
                callback: function (val) {
                    if (typeof (val) === 'undefined') {
                        console.log('Time not selected');
                    } else {
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());

                        $scope.state.reminderStartTimeObject.epochTime = a.getTime() / 1000;
                        $scope.state.reminderStartTimeUtcHourMinuteSecond = moment.utc(a).format('HH:mm:ss');
                        console.log('Selected epoch is : ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                    }
                },
                inputTime: secondsSinceMidnightLocal
            };
        };

		// when add new variable is tapped
		$scope.add_variable = function(){
			console.log("add variable");
			$scope.state.showSearchBox = false;
			$scope.state.showResults = false;
			$scope.state.showAddVariableCard = true;
            $scope.state.showReminderFrequencyCard = true;
			$scope.state.variableName = $scope.state.variableSearchQuery;
            $scope.state.defaultValue = "";
            $scope.getUnits();

		};

		$scope.reminderStartTimePicker = function() {
			setSelectedTimeInDatePicker();
			ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
		};

		// populate list with recently tracked category variables
    	var populate_recent_tracked = function(variableCategoryName){

    		utils.startLoading();
	    	// get user token
			authService.getAccessTokenFromAnySource().then(function(token){

				if(!variableCategoryName){
					// get all variables
					console.log('Get most recent anything variables');
					measurementService.getVariables().then(function(variables){

					    $scope.userVariables = variables;
					    $scope.variables.list = variables;
					    utils.stopLoading();

					}, function(){
						utils.stopLoading();
					});
				} else {
					console.log('get all variables by category');
					measurementService.searchVariablesIncludePublic('*', $scope.state.variableCategoryName).then(function(variables){

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

	    var variableSearch = function(variableSearchQuery){
	    	// search server for the query

	    	if(!$scope.state.variableCategoryName){
	    		measurementService.searchVariablesIncludePublic(variableSearchQuery)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
	    		    $scope.state.searching = false;
                    if(variables.length < 1){
                        $scope.state.showAddVariableButton = true;
                    }
	    		});
	    	} else {
	    		measurementService.searchVariablesIncludePublic(variableSearchQuery, $scope.variableCategoryName)
	    		.then(function(variables){

	    		    // populate list with results
	    		    $scope.state.showResults = true;
	    		    $scope.searchVariables = variables;
	    		    $scope.variables.list = $scope.searchVariables;
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

	    	var reminderStartTimeMoment = moment.utc($scope.state.reminderStartTimeObject.epochTime*1000);
	    	$scope.state.reminderStartTimeUtcHourMinuteSecond = moment.utc(reminderStartTimeMoment).format("HH:mm:ss");

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
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.reminderStartTimeUtcHourMinuteSecond : null)
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


	    	utils.startLoading();

	    	reminderService.addNewReminder(
	    		$scope.state.id,
                $scope.state.defaultValue,
                getFrequencyChart()[$scope.state.selectedFrequency],
                $scope.state.variableName,
                $scope.state.variableCategoryName,
                $scope.state.abbreviatedUnitName,
                $scope.state.combinationOperation,
                ($scope.state.selectedFrequency.indexOf("a day") !== -1)? $scope.state.reminderStartTimeUtcHourMinuteSecond : null)
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
                console.log(err);
	    		utils.stopLoading();
	    		utils.showAlert('Failed to add Reminder, Try again!', 'assertive');
	    	});
	    };

	    var setSelectedTimeInDatePicker = function(){

			var reminderStartTimeLocal = moment($scope.state.reminderStartTimeObject.epochTime*1000).format('H:m');
			var reminderStartTimeComponentsLocal = reminderStartTimeLocal.split(':');

			var reminderStartTimeComponentsUtc = $scope.state.reminderStartTime.split(':');

			var date = moment.utc($scope.state.reminderStartTimeObject.epochTime*1000);

            date.hours(reminderStartTimeComponentsUtc[0]);
            date.minutes(reminderStartTimeComponentsUtc[1]);
            date.seconds(reminderStartTimeComponentsUtc[2]);

			$scope.state.reminderStartTimeObject.epochTime = date.local().unix();
            $scope.state.reminderStartTimeObject.secondsSinceMidnightLocal = $scope.state.reminderStartTimeObject.epochTime % 86400;

            var localReminderStartTimeHours = reminderStartTimeComponentsLocal[0];
            var localReminderStartTimeMinutes = reminderStartTimeComponentsLocal[1];
            $scope.state.reminderStartTimeObject.secondsSinceMidnightLocal =
                localReminderStartTimeHours * 60 * 60 + localReminderStartTimeMinutes * 60;

            configureTimePickerSettingsObject($scope.state.reminderStartTimeObject.secondsSinceMidnightLocal);

        };

        var getLocalReminderStartTimeSecondsSinceMidnightFromUtcTime = function (reminderStartTimeIsoFormat) {

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
            $scope.state.reminderStartTime = $scope.state.selectedReminder.reminderStartTime;
			
			var midnightUtcEpochTime = Math.floor((new Date()).getTime() / 1000);
			
			$scope.state.reminderStartTimeObject.epochTime = moment($scope.state.selectedReminder.reminderStartTime).unix();

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

			if(typeof $stateParams.reminder.reminderStartTime !== "undefined" && $stateParams.reminder.reminderStartTime !== null){
				$scope.state.reminderStartTimeUtcHourMinuteSecond = $stateParams.reminder.reminderStartTime;
			}

	    	if($scope.state.reminderFrequency && $scope.state.reminderFrequency !== null){
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.reminderFrequency];
	    	} else if($scope.state.reminderStartTime){
	    		$scope.state.selectedFrequency = "Daily";
	    	}

	    	$scope.state.showReminderFrequencyCard = true;

	    	setSelectedTimeInDatePicker();
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
                $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo($stateParams.variableCategoryName);
                $scope.state.showSearchBox = true;
                $scope.state.showResults = true;
                $scope.state.showVariableCategorySelector = false;
                $scope.state.title = "Add a " + $filter('wordAliases')(pluralize($stateParams.variableCategoryName, 1) + " Reminder");
            }

            var reminderIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'reminderId');

			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
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
                            $stateParams.reminder = $scope.state.allReminders[0];
                            setupEditReminder($stateParams.reminder);
                            utils.stopLoading();
                        }, function(){
                            utils.stopLoading();
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
				cssClass : 'calm',
				okType : 'button-calm',
				title: title,
				template: template
			});
	    };

        $scope.unit_search = function(){

            var unitSearchQuery = $scope.state.abbreviatedUnitName;
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

                // if (variableCategoryConfig[category].defaultUnitAbbreviatedName) {
                //     set_unit(variableCategoryConfig[category].defaultUnitAbbreviatedName);
                // }

                // hide spinner
                $ionicLoading.hide();

            });


        };
	});