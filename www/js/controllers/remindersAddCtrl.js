angular.module('starter')

	// Controls the History Page of the App.
	.controller('RemindersAddCtrl', function($scope, $state, $stateParams, $ionicLoading, $filter, $timeout, $rootScope,
                                             $ionicActionSheet, $ionicHistory, authService, localStorageService,
                                             reminderService, utilsService, ionicTimePicker, variableCategoryService,
                                             variableService, unitService, timeService) {

	    $scope.controller_name = "RemindersAddCtrl";
		console.log('Loading ' + $scope.controller_name);

	    $scope.state = {
            showAddVariableCard : false,
            showReminderFrequencyCard : false,
            showUnits: false,
            selectedFrequency : 'Daily',
            selectedReminder : false,
            reminderStartTimeEpochTime : timeService.getEpochTimeFromLocalString($rootScope.user.earliestReminderTime),
            //reminderEndTimeEpochTime : null,
            reminderStartTimeStringLocal : $rootScope.user.earliestReminderTime,
            //reminderEndTimeStringLocal : null,
            measurementSynonymSingularLowercase : 'measurement',
            defaultValueLabel : 'Default Value',
            defaultValuePlaceholderText : 'Enter typical value',
            variableSearchPlaceholderText : 'Search for a variable...',
            showInstructionsField : false
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
	    		{ id : 10, name : 'Never'},
                //{ id : 11, name : 'Minutely'}
	    	]
	    };

		$scope.openReminderStartTimePicker = function() {
            var defaultStartTimeInSecondsSinceMidnightLocal =
                timeService.getSecondsSinceMidnightLocalFromLocalString($rootScope.user.earliestReminderTime);
            if($scope.state.reminderStartTimeStringLocal){
                defaultStartTimeInSecondsSinceMidnightLocal =
                    timeService.getSecondsSinceMidnightLocalFromLocalString($scope.state.reminderStartTimeStringLocal);
            }
            // Round minutes
            var defaultStartTime = new Date(defaultStartTimeInSecondsSinceMidnightLocal * 1000);
            var defaultStartTimeHours = defaultStartTime.getUTCHours();
            var defaultStartTimeMinutes = defaultStartTime.getUTCMinutes();
            if (defaultStartTimeMinutes % 15 !== 0) {
                if ((defaultStartTimeMinutes > 0 && defaultStartTimeMinutes <= 7)) {
                    defaultStartTimeMinutes = 0;
                }
                else if (defaultStartTimeMinutes > 7 && defaultStartTimeMinutes <= 22) {
                    defaultStartTimeMinutes = 15;
                }
                else if (defaultStartTimeMinutes > 22 && defaultStartTimeMinutes <= 37) {
                    defaultStartTimeMinutes = 30;
                }
                else if (defaultStartTimeMinutes > 37 && defaultStartTimeMinutes <= 52) {
                    defaultStartTimeMinutes = 45;
                }
                else if (defaultStartTimeMinutes > 52) {
                    defaultStartTimeMinutes = 0;
                    if (defaultStartTimeHours === 23) {
                        defaultStartTimeHours = 0;
                    }
                    else {
                        defaultStartTimeHours += 1;
                    }
                }
            }
            defaultStartTimeInSecondsSinceMidnightLocal =
                timeService.getSecondsSinceMidnightLocalFromLocalString("" + defaultStartTimeHours + ":" + defaultStartTimeMinutes + ":00");
            
            $scope.state.timePickerConfiguration = {
                callback: function (val) {
                    if (typeof (val) === 'undefined') {
                        console.log('Time not selected');
                    } else {
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());
                        a.setSeconds(0);

                        console.log('Selected epoch is : ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');

                        $scope.state.reminderStartTimeEpochTime = a.getTime() / 1000;
                        $scope.state.reminderStartTimeStringLocal = moment(a).format('HH:mm:ss');
                    }
                },
                inputTime: defaultStartTimeInSecondsSinceMidnightLocal,
                step: 15,
                closeLabel: 'Cancel'
            };

			ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
		};

/*

        $scope.openReminderEndTimePicker = function() {
            var default9pmEndTimeInSecondsSinceMidnightLocal = 21 * 60 * 60;
            $scope.state.reminderEndTimePickerConfiguration = {
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

                        $scope.state.reminderEndTimeEpochTime = a.getTime() / 1000;
                        $scope.state.reminderEndTimeStringLocal = moment(a).format('HH:mm:ss');
                    }
                },
                inputTime: default9pmEndTimeInSecondsSinceMidnightLocal,
                step: 15,
                closeLabel: 'Cancel'
            };

            ionicTimePicker.openTimePicker($scope.state.reminderEndTimePickerConfiguration);
        };

*/

	    // when a search result is selected
	    $scope.onVariableSelect = function(selectedVariable){
            console.log("remindersAdd.onVariableSelect: " + JSON.stringify(selectedVariable));

	    	if(!selectedVariable.variableCategoryName){
	    		selectedVariable.variableCategoryName = selectedVariable.category;
	    	}
	    	if (!selectedVariable.variableCategoryName) {
	    		$scope.state.showAddVariableCard = true;
	    	}
	    	$scope.variableObject=selectedVariable;

            $scope.setupVariableCategory(selectedVariable.variableCategoryName);
            if (selectedVariable.abbreviatedUnitName) {
                $scope.state.trackingReminder.abbreviatedUnitName = selectedVariable.abbreviatedUnitName;
            }
            if (selectedVariable.combinationOperation) {
                $scope.state.trackingReminder.combinationOperation = selectedVariable.combinationOperation;
            }
            if (selectedVariable.id) {
                $scope.state.trackingReminder.variableId = selectedVariable.id;
            }
            if (selectedVariable.name) {
                $scope.state.trackingReminder.variableName = selectedVariable.name;
            }
            if (selectedVariable.variableName) {
                $scope.state.trackingReminder.variableName = selectedVariable.variableName;
            }
            if (selectedVariable.description) {
                $scope.state.trackingReminder.variableDescription = selectedVariable.description;
            }

            if (typeof selectedVariable.lastValue !== "undefined"){
                $scope.state.trackingReminder.defaultValue = Number(selectedVariable.lastValue);
            }

            $scope.state.showReminderFrequencyCard = true;

            // Set default value
            if ($scope.state.trackingReminder.abbreviatedUnitName === "/5") {
                $scope.state.trackingReminder.defaultValue = 3; // Default to 3 ("ok") if variable unit is /5
            }
	    };

	    // when adding/editing is cancelled
	    $scope.cancel = function(){
            $ionicHistory.goBack();
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
	    		"Three times a day": 8*60*60,
                "Minutely": 60
	    	};
	    };

        $scope.addToFavorites = function(){
            $scope.state.trackingReminder.reminderFrequency = 0;
            $scope.state.selectedFrequency = 'Never';
            $stateParams.fromUrl = null;
            $stateParams.fromState = 'app.favorites';
            $scope.save();
        };

	    // when the reminder is saved/edited
	    $scope.save = function(){

            if($scope.state.trackingReminder.abbreviatedUnitName === '/5' && !$scope.state.trackingReminder.defaultValue){
                $scope.state.trackingReminder.defaultValue = 3;
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
            else {
                $scope.state.trackingReminder.unitId =
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].id;
            }

            if(!$scope.state.trackingReminder.defaultValue && $scope.state.trackingReminder.defaultValue !== 0) {
                utilsService.showAlert('Please enter a default value');
                return;
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue !== null)
            {
                if($scope.state.trackingReminder.defaultValue <
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue){
                    utilsService.showAlert($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue +
                        ' is the smallest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return;
                }
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue !== null)
            {
                if($scope.state.trackingReminder.defaultValue >
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue){
                    utilsService.showAlert($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue +
                        ' is the largest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return;
                }
            }

            $scope.showLoader('Saving ' + $scope.state.trackingReminder.variableName + ' reminder...');
            $scope.state.trackingReminder.reminderFrequency = getFrequencyChart()[$scope.state.selectedFrequency];
            $scope.state.trackingReminder.valueAndFrequencyTextDescription = $scope.state.selectedFrequency;
            if($scope.state.trackingReminder.reminderFrequency === 86400){
                if($scope.state.trackingReminder.abbreviatedUnitName === '/5'){
                    $scope.state.trackingReminder.valueAndFrequencyTextDescription = 'Daily at ' +
                        timeService.humanFormat($scope.state.reminderStartTimeStringLocal);
                } else {
                    $scope.state.trackingReminder.valueAndFrequencyTextDescription = $scope.state.trackingReminder.defaultValue +
                        ' ' + $scope.state.trackingReminder.abbreviatedUnitName + ' daily at ' +
                        timeService.humanFormat($scope.state.reminderStartTimeStringLocal);
                }
            }
            $scope.state.trackingReminder.reminderStartTime =
                timeService.getUtcTimeStringFromLocalString($scope.state.reminderStartTimeStringLocal);
            //End time not reminder specific anymore
            //$scope.state.trackingReminder.reminderEndTime = $scope.state.reminderEndTimeStringLocal;
            //$scope.state.trackingReminder.reminderEndTimeEpochSeconds = $scope.state.reminderEndTimeEpochTime;
            $scope.state.trackingReminder.reminderStartTimeEpochSeconds = $scope.state.reminderStartTimeEpochTime;
            $scope.state.trackingReminder.nextReminderTimeEpochSeconds = $scope.state.reminderStartTimeEpochTime;


            localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminders', $scope.state.trackingReminder)
                .then(function(){
                    reminderService.addNewReminder($scope.state.trackingReminder)
                        .then(function(){
                            $scope.hideLoader();
                        }, function(err){
                            $scope.hideLoader();
                            console.error("addNewReminder ERROR: " + err);
                            $ionicLoading.hide();
                            $scope.loading = false;
                        });

                    if($stateParams.fromUrl && ($stateParams.fromUrl.indexOf('manage') > -1 )){
                        window.location = $stateParams.fromUrl;
                    } else {
                    	var variableCategoryName = $stateParams.variableCategoryName;
                    	if (!$stateParams.variableCategoryName) {
                    		variableCategoryName = 'Anything';
                    	}
                        $state.go('app.remindersManage',{
                            variableCategoryName: variableCategoryName
                        });
                    }
                }

            );

	    };


	    // setup editing view
	    var setupEditReminder = function(trackingReminder){
            $scope.state.trackingReminder = trackingReminder;
            $scope.setupVariableCategory($scope.state.trackingReminder.variableCategoryName);
            $scope.state.trackingReminder.firstDailyReminderTime = null;
            $scope.state.trackingReminder.secondDailyReminderTime = null;
            $scope.state.trackingReminder.thirdDailyReminderTime = null;
	    	$scope.state.title = "Edit " +  trackingReminder.variableName + " Reminder";
            $scope.state.reminderStartTimeStringLocal = timeService.getLocalTimeStringFromUtcString(trackingReminder.reminderStartTime);
            $scope.state.reminderStartTimeEpochTime = timeService.getEpochTimeFromLocalString($scope.state.reminderStartTimeStringLocal);
            //$scope.state.reminderEndTimeStringLocal = trackingReminder.reminderEndTime;
            
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

			// This is no longer reminder-specific
            // if(typeof $stateParams.reminder.reminderEndTime !== "undefined" &&
            //     $stateParams.reminder.reminderEndTime !== null){
            //
            //     $scope.state.reminderEndTimeStringLocal = $stateParams.reminder.reminderEndTime;
            //     $scope.state.reminderEndTimeEpochTime =
            //         timeService.getEpochTimeFromLocalString($stateParams.reminder.reminderEndTime);
            // }

	    	if($scope.state.trackingReminder.reminderFrequency && $scope.state.trackingReminder.reminderFrequency !== null){
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.trackingReminder.reminderFrequency];
	    	}

	    	$scope.state.showReminderFrequencyCard = true;

	    };

	    // setup category view
	    $scope.setupVariableCategory = function(variableCategoryName){
            console.log("remindersAdd.setupVariableCategory " + variableCategoryName);
            if(!variableCategoryName || variableCategoryName === 'Anything'){
                variableCategoryName = '';
            }
            $scope.state.trackingReminder.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            if (!$scope.state.trackingReminder.abbreviatedUnitName) {
            	$scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            }
            $scope.state.title = "Add " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Reminder";
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            $scope.state.variableSearchPlaceholderText = 'Search for a ' + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + '...';
            
            if(variableCategoryName === 'Treatments'){
                $scope.state.showInstructionsField = true;
            }
	    };

        function setupReminderEditingFromVariableId(variableId) {
            if(variableId){
                variableService.getVariableById(variableId)
                    .then(function (variables) {
                        $scope.variableObject = variables[0];
                        console.log('setupReminderEditingFromVariableId got this variable object ' +
                            JSON.stringify($scope.variableObject));
                        $scope.onVariableSelect($scope.variableObject);
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function () {
                        $ionicLoading.hide();
                        $scope.loading = false;
                        console.error('ERROR: failed to get variable with id ' + variableId);
                    });

            }
        }

        function setupReminderEditingFromUrlParameter(reminderIdUrlParameter) {
            reminderService.getTrackingReminderById(reminderIdUrlParameter)
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
                    console.error('ERROR: failed to get reminder with reminderIdUrlParameter ' + reminderIdUrlParameter);
                });
        }

        $scope.init = function(){
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.context = "reminderAdd";
            }
            if (typeof analytics !== 'undefined')  { analytics.trackView("Add Reminder Controller"); }

            authService.checkAuthOrSendToLogin();

            unitService.getUnits().then(function () {
                var reminderIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'reminderId');
                var variableIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'variableId');

                if ($stateParams.variableObject) {
                    $scope.variableObject = $stateParams.variableObject;
                    $scope.onVariableSelect($stateParams.variableObject);
                } else if($stateParams.variableCategoryName){
                    $scope.state.trackingReminder.variableCategoryName = $stateParams.variableCategoryName;
                    $scope.setupVariableCategory($scope.state.trackingReminder.variableCategoryName);
                } else if ($stateParams.reminder && $stateParams.reminder !== null) {
                    setupEditReminder($stateParams.reminder);
                } else if(reminderIdUrlParameter) {
                    setupReminderEditingFromUrlParameter(reminderIdUrlParameter);
                } else if(variableIdUrlParameter) {
                    setupReminderEditingFromVariableId(variableIdUrlParameter);
                } else {
                    $ionicHistory.goBack();
                }
            });
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
            $scope.hideLoader();
    		$scope.init();
    	});

        $scope.deleteReminder = function(){
            localStorageService.deleteElementOfItemById('trackingReminders', $scope.state.trackingReminder.id)
                .then(function(){
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go('app.remindersManage');
                    }
                });

            reminderService.deleteReminder($scope.state.trackingReminder.id)
                .then(function(){
                    $ionicLoading.hide();
                    $scope.loading = false;
                    console.debug('Reminder Deleted');
                }, function(err){
                    $ionicLoading.hide();
                    $scope.loading = false;
                    console.error('ERROR: reminderService.deleteReminder Failed to Delete Reminder with id ' +
                        $scope.state.trackingReminder.id);
                });
        };

        // Deprecated - not used
        /*
        // when a unit is selected
        $scope.unitSelected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.state.trackingReminder.abbreviatedUnitName = unit.abbreviatedName;
            $scope.state.showUnits = false;
            $scope.state.selectedUnitAbbreviatedName = unit.abbreviatedName;
        };
        */

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits=!$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        $rootScope.showActionSheetMenu = function() {
            $scope.state.variableObject = $scope.state.trackingReminder;
            $scope.state.variableObject.id = $scope.state.trackingReminder.variableId;
            $scope.state.variableObject.name = $scope.state.trackingReminder.variableName;
            console.debug("remindersAddCtrl.showActionSheetMenu:   $scope.state.variableObject: ", $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites' },
                    { text: '<i class="icon ion-android-notifications-none"></i>Record Measurement'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History' },
                    { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                    { text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
                    { text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Favorite',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.log('BUTTON CLICKED', index);

                    if(index === 0){
                        $scope.addToFavoritesUsingVariableObject($scope.state.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddMeasurementForVariableObject($scope.state.variableObject);
                    }
                    if(index === 2){
                        $scope.goToChartsPageForVariableObject($scope.state.variableObject);
                    }
                    if(index === 3) {
                        $scope.goToHistoryForVariableObject($scope.state.variableObject);
                    }
                    if (index === 4) {
                        $state.go('app.variableSettings',
                            {variableName: $scope.state.trackingReminder.variableName});
                    }
                    if(index === 5){
                        $state.go('app.predictors',
                            {
                                variableObject: $scope.state.variableObject,
                                requestParams: {
                                    effect:  $scope.state.variableObject.name,
                                    correlationCoefficient: "(gt)0"
                                }
                            });
                    }
                    if(index === 6){
                        $state.go('app.predictors',
                            {
                                variableObject: $scope.state.variableObject,
                                requestParams: {
                                    effect:  $scope.state.variableObject.name,
                                    correlationCoefficient: "(lt)0"
                                }
                            });
                    }
                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.deleteReminder();
                    return true;
                }
            });


            $timeout(function() {
                hideSheet();
            }, 20000);

        };

	});