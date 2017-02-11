angular.module('starter')
	.controller('ReminderAddCtrl', function($scope, $state, $stateParams, $ionicLoading, $filter, $timeout, $rootScope,
                                             $ionicActionSheet, $ionicHistory,
                                             quantimodoService, ionicTimePicker, $ionicPopup) {

	    $scope.controller_name = "ReminderAddCtrl";
		console.debug('Loading ' + $scope.controller_name);
        $rootScope.showFilterBarSearchIcon = false;
	    $scope.state = {
            showAddVariableCard : false,
            showReminderFrequencyCard : false,
            showUnits: false,
            selectedFrequency : 'Daily',
            selectedReminder : false,
            measurementSynonymSingularLowercase : 'measurement',
            defaultValueLabel : 'Default Value',
            defaultValuePlaceholderText : 'Enter typical value',
            showInstructionsField : false,
            selectedStopTrackingDate: null,
            showMoreOptions: false,
            showMoreUnits: false
        };


        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.init();
            $rootScope.hideNavigationMenu = false;
        });

        $scope.showMoreOptions = function(){
            $scope.state.showMoreOptions = true;
        };

        if($rootScope.user) {
            $scope.state.firstReminderStartTimeLocal = $rootScope.user.earliestReminderTime;
            $scope.state.firstReminderStartTimeEpochTime =
                quantimodoService.getEpochTimeFromLocalStringRoundedToHour('20:00:00');
            $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeEpochTime * 1000);
        } else {
            quantimodoService.reportError($state.current.name + ': $rootScope.user is not defined!');
        }

        $scope.state.trackingReminder = {
            variableId : null,
            variableName : null,
            combinationOperation : null
        };

        $scope.loading = true;

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
                { id : 10, name : 'Weekly'},
                { id : 10, name : 'Every 2 weeks'},
                { id : 10, name : 'Every 4 weeks'}
                //{ id : 11, name : 'Minutely'}
	    	]
	    };

        $scope.openReminderStartTimePicker = function(order) {
            var a = new Date();
            if(order === 'first'){
                $scope.state.firstReminderStartTimeEpochTime = a.getTime() / 1000;
                $scope.state.firstReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                $scope.state.firstReminderStartTimeMoment = moment(a);
            }

            if(order === 'second'){

                $scope.state.secondReminderStartTimeEpochTime = a.getTime() / 1000;
                $scope.state.secondReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                $scope.state.secondReminderStartTimeMoment = moment(a);
            }

            if(order === 'third'){
                $scope.state.hideAdditionalReminderTimeButton = true;
                $scope.state.thirdReminderStartTimeEpochTime = a.getTime() / 1000;
                $scope.state.thirdReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                $scope.state.thirdReminderStartTimeMoment = moment(a);
            }
        };

		$scope.oldOpenReminderStartTimePicker = function(order) {
            var defaultStartTimeInSecondsSinceMidnightLocal =
                quantimodoService.getSecondsSinceMidnightLocalFromLocalString($rootScope.user.earliestReminderTime);
		    if(order === 'first') {
                if($scope.state.firstReminderStartTimeLocal){
                    defaultStartTimeInSecondsSinceMidnightLocal =
                        quantimodoService.getSecondsSinceMidnightLocalFromLocalString($scope.state.firstReminderStartTimeLocal);
                }
            }

            if(order === 'second') {
                if($scope.state.secondReminderStartTimeLocal){
                    defaultStartTimeInSecondsSinceMidnightLocal =
                        quantimodoService.getSecondsSinceMidnightLocalFromLocalString($scope.state.secondReminderStartTimeLocal);
                }
            }

            if(order === 'third') {
                if($scope.state.thirdReminderStartTimeLocal){
                    defaultStartTimeInSecondsSinceMidnightLocal =
                        quantimodoService.getSecondsSinceMidnightLocalFromLocalString($scope.state.thirdReminderStartTimeLocal);
                }
            }

            defaultStartTimeInSecondsSinceMidnightLocal =
                quantimodoService.getSecondsSinceMidnightLocalRoundedToNearestFifteen(defaultStartTimeInSecondsSinceMidnightLocal);

            $scope.state.timePickerConfiguration = {
                callback: function (val) {
                    if (typeof (val) === 'undefined') {
                        console.debug('Time not selected');
                    } else {
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());
                        a.setSeconds(0);

                        console.debug('Selected epoch is : ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');

                        if(order === 'first'){
                            $scope.state.firstReminderStartTimeEpochTime = a.getTime() / 1000;
                            $scope.state.firstReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                            $scope.state.firstReminderStartTimeMoment = moment(a);
                        }

                        if(order === 'second'){
                            $scope.state.secondReminderStartTimeEpochTime = a.getTime() / 1000;
                            $scope.state.secondReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                            $scope.state.secondReminderStartTimeMoment = moment(a);
                        }

                        if(order === 'third'){
                            $scope.state.hideAdditionalReminderTimeButton = true;
                            $scope.state.thirdReminderStartTimeEpochTime = a.getTime() / 1000;
                            $scope.state.thirdReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                            $scope.state.thirdReminderStartTimeMoment = moment(a);
                        }

                    }
                },
                inputTime: defaultStartTimeInSecondsSinceMidnightLocal,
                step: 15,
                closeLabel: 'Cancel'
            };

			ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
		};

	    var setupByVariableObject = function(selectedVariable){
            console.debug("remindersAdd.onVariableSelect: " + JSON.stringify(selectedVariable).substring(0, 140) + '...');

	    	if(!selectedVariable.variableCategoryName){
	    		selectedVariable.variableCategoryName = selectedVariable.category;
	    	}
	    	if (!selectedVariable.variableCategoryName) {
	    		$scope.state.showAddVariableCard = true;
	    	}
	    	$rootScope.variableObject=selectedVariable;

            setupVariableCategory(selectedVariable.variableCategoryName);
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

            if($scope.state.trackingReminder.variableName.toLowerCase().indexOf('blood pressure') > -1 ||
                $scope.state.trackingReminder.abbreviatedUnitName === '/5') {
                $scope.state.hideDefaultValueField = true;
            }
            if (selectedVariable.description) {
                $scope.state.trackingReminder.variableDescription = selectedVariable.description;
            }

            $scope.state.showReminderFrequencyCard = true;
            showMoreUnitsIfNecessary();
	    };

	    $scope.cancel = function(){
            $scope.goBack();
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
                "Minutely": 60,
                'Weekly': 7 * 86400,
                'Every 2 weeks': 14 * 86400,
                'Every 4 weeks': 28 * 86400
	    	};
	    };

        $scope.addToFavorites = function(){
            $scope.state.trackingReminder.reminderFrequency = 0;
            $scope.state.selectedFrequency = 'Never';
            $stateParams.fromUrl = null;
            $stateParams.fromState = 'app.favorites';
            $scope.save();
        };


        $scope.showAdditionalReminderTime = function(){
            if(!$scope.state.secondReminderStartTimeEpochTime){
                $scope.openReminderStartTimePicker('second');
                return;
            }

            if(!$scope.state.thirdReminderStartTimeEpochTime) {
                $scope.openReminderStartTimePicker('third');
            }
        };

        $scope.oldShowAdditionalReminderTime = function(){
            if(!$scope.state.secondReminderStartTimeEpochTime){
                $scope.oldOpenReminderStartTimePicker('second');
                return;
            }

            if(!$scope.state.thirdReminderStartTimeEpochTime) {
                $scope.oldOpenReminderStartTimePicker('third');
            }
        };

        var validationFailure = function (message) {
            quantimodoService.showAlert(message);
            console.error(message);
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.notify(message, "trackingReminder is " + JSON.stringify($scope.state.trackingReminder), {}, "error");
            }
        };

        var validReminderSettings = function(){

            if(!$scope.state.trackingReminder.variableCategoryName) {
                validationFailure('Please select a variable category');
                return false;
            }

            if(!$scope.state.trackingReminder.variableName) {
                validationFailure('Please enter a variable name');
                return false;
            }

            if(!$scope.state.trackingReminder.abbreviatedUnitName) {
                validationFailure('Please select a unit');
                return false;
            } else {
                $scope.state.trackingReminder.unitId =
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].id;
            }

            if(!$stateParams.favorite && !$scope.state.trackingReminder.defaultValue && $scope.state.trackingReminder.defaultValue !== 0) {
                //validationFailure('Please enter a default value');
                //return false;
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue !== null)
            {
                if($scope.state.trackingReminder.defaultValue !== null && $scope.state.trackingReminder.defaultValue <
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue){
                    validationFailure($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue +
                        ' is the smallest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return false;
                }
            }


            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue !== null)
            {
                if($scope.state.trackingReminder.defaultValue !== null && $scope.state.trackingReminder.defaultValue >
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue){
                    validationFailure($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue +
                        ' is the largest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return false;
                }
            }

            if($scope.state.selectedStopTrackingDate && $scope.state.selectedStartTrackingDate){
                if($scope.state.selectedStopTrackingDate < $scope.state.selectedStartTrackingDate){
                    validationFailure("Start date cannot be later than the end date");
                    return false;
                }
            }


            return true;
        };

        var configureReminderTimeSettings = function(trackingReminder,
                                                     reminderStartTimeEpochTime){

            var updatedTrackingReminder = trackingReminder;

            updatedTrackingReminder.reminderStartTimeEpochTime = reminderStartTimeEpochTime;
            updatedTrackingReminder.reminderStartTimeLocal = moment(reminderStartTimeEpochTime * 1000).format('HH:mm:ss');

            if(updatedTrackingReminder.reminderStartTimeLocal < $rootScope.user.earliestReminderTime){
                validationFailure(updatedTrackingReminder.reminderStartTimeLocal + " is earlier than your earliest allowed " +
                    "notification time.  You can change your earliest notification time on the settings page.");
            }

            if(updatedTrackingReminder.reminderStartTimeLocal > $rootScope.user.latestReminderTime){
                validationFailure(updatedTrackingReminder.reminderStartTimeLocal + " is later than your latest allowed " +
                    "notification time.  You can change your latest notification time on the settings page.");
            }


            if(updatedTrackingReminder.reminderFrequency === 86400){
                if(updatedTrackingReminder.abbreviatedUnitName === '/5'){
                    updatedTrackingReminder.valueAndFrequencyTextDescription = 'Daily at ' +
                        quantimodoService.humanFormat(updatedTrackingReminder.reminderStartTimeLocal);
                } else {
                    updatedTrackingReminder.valueAndFrequencyTextDescription = updatedTrackingReminder.defaultValue +
                        ' ' + updatedTrackingReminder.abbreviatedUnitName + ' daily at ' +
                        quantimodoService.humanFormat(updatedTrackingReminder.reminderStartTimeLocal);
                }
            }
            updatedTrackingReminder.reminderStartTime =
                quantimodoService.getUtcTimeStringFromLocalString(updatedTrackingReminder.reminderStartTimeLocal);

            updatedTrackingReminder.reminderStartTimeEpochSeconds = reminderStartTimeEpochTime;
            updatedTrackingReminder.nextReminderTimeEpochSeconds = reminderStartTimeEpochTime;
            return updatedTrackingReminder;
        };

        var goBack = function () {
            $ionicLoading.hide();
            $scope.loading = false;

            if($stateParams.doneState){
                $state.go($stateParams.doneState);
                return;
            }

            var backView = $ionicHistory.backView();
            if(backView.stateName.toLowerCase().indexOf('search') > -1){
                $state.go(config.appSettings.defaultState);
                // This often doesn't work and the user should go to the inbox more anyway
                //$ionicHistory.goBack(-2);
            } else {
                $ionicHistory.goBack();
            }
        };

	    // when the reminder is saved/edited
	    $scope.save = function(){

	        if($stateParams.favorite){
                $scope.state.trackingReminder.reminderFrequency = 0;
                $scope.state.trackingReminder.valueAndFrequencyTextDescription = "As Needed";
            }

            if($scope.state.trackingReminder.abbreviatedUnitName === '/5' && !$scope.state.trackingReminder.defaultValue){
                //$scope.state.trackingReminder.defaultValue = 3;
            }

            if(!validReminderSettings()){
                return false;
            }

            $scope.state.trackingReminder.reminderFrequency = getFrequencyChart()[$scope.state.selectedFrequency];
            $scope.state.trackingReminder.valueAndFrequencyTextDescription = $scope.state.selectedFrequency;
            var dateFormat = 'YYYY-MM-DD';
            if($scope.state.selectedStopTrackingDate){
                $scope.state.trackingReminder.stopTrackingDate = moment($scope.state.selectedStopTrackingDate).format(dateFormat);
            }

            if($scope.state.selectedStartTrackingDate){
                $scope.state.trackingReminder.startTrackingDate = moment($scope.state.selectedStartTrackingDate).format(dateFormat);
            }

            var remindersArray = [];

            if(typeof $scope.state.trackingReminder.defaultValue === "undefined"){
                $scope.state.trackingReminder.defaultValue = null;
            }

            remindersArray[0] = JSON.parse(JSON.stringify($scope.state.trackingReminder));
            if($scope.state.firstReminderStartTimeMoment){
                $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeMoment);
                console.log($scope.state.firstReminderStartTimeMoment);
                $scope.state.firstReminderStartTimeEpochTime = parseInt($scope.state.firstReminderStartTimeMoment.format("X"));
            }
            remindersArray[0] = configureReminderTimeSettings(remindersArray[0], $scope.state.firstReminderStartTimeEpochTime);

            if($scope.state.secondReminderStartTimeMoment){
                $scope.state.secondReminderStartTimeMoment = moment($scope.state.secondReminderStartTimeMoment);
                $scope.state.secondReminderStartTimeEpochTime = parseInt($scope.state.secondReminderStartTimeMoment.format("X"));
            }

            if($scope.state.secondReminderStartTimeEpochTime){
                remindersArray[1] = JSON.parse(JSON.stringify($scope.state.trackingReminder));
                remindersArray[1].id = null;
                remindersArray[1] = configureReminderTimeSettings(remindersArray[1], $scope.state.secondReminderStartTimeEpochTime);
            }

            if($scope.state.thirdReminderStartTimeMoment){
                $scope.state.thirdReminderStartTimeMoment = moment($scope.state.thirdReminderStartTimeMoment);
                $scope.state.thirdReminderStartTimeEpochTime = $scope.state.thirdReminderStartTimeMoment.format("X");
            }

            if($scope.state.thirdReminderStartTimeEpochTime){
                remindersArray[2] = JSON.parse(JSON.stringify($scope.state.trackingReminder));
                remindersArray[2].id = null;
                remindersArray[2] = configureReminderTimeSettings(remindersArray[2], $scope.state.thirdReminderStartTimeEpochTime);
            }

            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderSyncQueue',
                remindersArray).then(function(){
                    quantimodoService.syncTrackingReminders();
                    goBack(); // We can't go back until reminder is posted so the correct reminders or favorites are shown when we return
                }
            );

	    };


	    // setup editing view
	    var setupEditReminder = function(trackingReminder){
            $scope.state.trackingReminder = trackingReminder;
            setupVariableCategory($scope.state.trackingReminder.variableCategoryName);
            $scope.state.trackingReminder.firstDailyReminderTime = null;
            $scope.state.trackingReminder.secondDailyReminderTime = null;
            $scope.state.trackingReminder.thirdDailyReminderTime = null;
            $scope.state.firstReminderStartTimeLocal = quantimodoService.getLocalTimeStringFromUtcString(trackingReminder.reminderStartTime);
            $scope.state.firstReminderStartTimeEpochTime = quantimodoService.getEpochTimeFromLocalString($scope.state.firstReminderStartTimeLocal);
            $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeEpochTime * 1000);
            //$scope.state.reminderEndTimeStringLocal = trackingReminder.reminderEndTime;
            if(trackingReminder.stopTrackingDate){
                $scope.state.selectedStopTrackingDate = new Date(trackingReminder.stopTrackingDate);
            }

            if(trackingReminder.startTrackingDate){
                $scope.state.selectedStartTrackingDate = new Date(trackingReminder.startTrackingDate);
            }

	    	var reverseFrequencyChart = {
                604800: 'Weekly',
                1209600: 'Every 2 weeks',
                2419200: 'Every 4 weeks',
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
            //         quantimodoService.getEpochTimeFromLocalString($stateParams.reminder.reminderEndTime);
            // }

	    	if($scope.state.trackingReminder.reminderFrequency && $scope.state.trackingReminder.reminderFrequency !== null){
	    		$scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.trackingReminder.reminderFrequency];
	    	}

	    	$scope.state.showReminderFrequencyCard = true;
	    };

        $scope.variableCategorySelectorChange = function(variableCategoryName) {
            $scope.state.variableCategoryObject = quantimodoService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            $scope.state.defaultValuePlaceholderText = 'Enter most common value';
            $scope.state.defaultValueLabel = 'Default Value';
            setupVariableCategory(variableCategoryName);
            showMoreUnitsIfNecessary();
        };

        var showMoreUnitsIfNecessary = function () {
            if($scope.state.trackingReminder.abbreviatedUnitName &&
                !$rootScope.nonAdvancedUnitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName]){
                $scope.state.showMoreUnits = true;
            }
        };

	    // setup category view
	    var setupVariableCategory = function(variableCategoryName){
            console.debug("remindersAdd.setupVariableCategory " + variableCategoryName);
            if(!variableCategoryName || variableCategoryName === 'Anything'){
                variableCategoryName = '';
            }
            $scope.state.trackingReminder.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = quantimodoService.getVariableCategoryInfo(variableCategoryName);
            if (!$scope.state.trackingReminder.abbreviatedUnitName) {
            	$scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            }
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }

            if(variableCategoryName === 'Treatments'){
                $scope.state.showInstructionsField = true;
            }
            showMoreUnitsIfNecessary();
	    };

        function setupReminderEditingFromVariableId(variableId) {
            if(variableId){
                quantimodoService.getVariableByIdDeferred(variableId)
                    .then(function (variables) {
                        $rootScope.variableObject = variables[0];
                        console.debug('setupReminderEditingFromVariableId got this variable object ' +
                            JSON.stringify($rootScope.variableObject));
                        setupByVariableObject($rootScope.variableObject);
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
            quantimodoService.getTrackingReminderByIdDeferred(reminderIdUrlParameter)
                .then(function (reminders) {
                    if (reminders.length !== 1) {
                        validationFailure("Reminder id " + reminderIdUrlParameter + " not found!", 'assertive');
                        $ionicHistory.goBack();
                    }
                    $stateParams.reminder = reminders[0];
                    setupEditReminder($stateParams.reminder);
                    $ionicLoading.hide();
                    $scope.loading = false;
                }, function () {
                    $ionicLoading.hide();
                    $scope.loading = false;
                    console.error('ERROR: failed to get reminder with reminderIdUrlParameter ' + reminderIdUrlParameter);
                });
        }

        var setTitle = function(){
            if($stateParams.favorite){
                $scope.state.selectedFrequency = 'Never';
                if($stateParams.reminder) {
                    if($stateParams.variableCategoryName === 'Treatments'){
                        $scope.state.title = "Modify As-Needed Med";
                    } else {
                        $scope.state.title = "Edit Favorite";
                    }
                } else {
                    if($stateParams.variableCategoryName === 'Treatments'){
                        $scope.state.title = "Add As-Needed Med";
                    } else {
                        $scope.state.title = "Add Favorite";
                    }
                }
            } else {
                if($stateParams.reminder) {
                    $scope.state.title = "Edit Reminder Settings";
                } else {
                    $scope.state.title = "Add Reminder";
                }
            }
        };

        var refreshUnitsIfStale = function () {
            var ignoreExpiration = false;
            quantimodoService.getUnits(ignoreExpiration);
        };

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            if($stateParams.variableObject){
                $stateParams.variableCategoryName = $stateParams.variableObject.variableCategoryName;
            }
            if($stateParams.reminder){
                $stateParams.variableCategoryName = $stateParams.reminder.variableCategoryName;
            }
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            setTitle();
            var ignoreExpiration = true; //Gets them as quickly as possible and refresh later
            $ionicLoading.show();
            quantimodoService.getUnits(ignoreExpiration).then(function () {
                $ionicLoading.hide();
                refreshUnitsIfStale();
                var reminderIdUrlParameter = quantimodoService.getUrlParameter(window.location.href, 'reminderId');
                var variableIdUrlParameter = quantimodoService.getUrlParameter(window.location.href, 'variableId');
                if ($stateParams.variableObject) {
                    $rootScope.variableObject = $stateParams.variableObject;
                    setupByVariableObject($stateParams.variableObject);
                } else if ($stateParams.reminder && $stateParams.reminder !== null) {
                    setupEditReminder($stateParams.reminder);
                } else if(reminderIdUrlParameter) {
                    setupReminderEditingFromUrlParameter(reminderIdUrlParameter);
                } else if(variableIdUrlParameter) {
                    setupReminderEditingFromVariableId(variableIdUrlParameter);
                } else if($stateParams.variableCategoryName){
                    $scope.state.trackingReminder.variableCategoryName = $stateParams.variableCategoryName;
                    setupVariableCategory($scope.state.trackingReminder.variableCategoryName);
                } else {
                    $ionicHistory.goBack();
                }
            });
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
    	});

        $scope.deleteReminder = function(){
            quantimodoService.deleteElementOfLocalStorageItemById('trackingReminders', $scope.state.trackingReminder.id)
                .then(function(){
                    $ionicHistory.goBack();
                });

            quantimodoService.deleteTrackingReminderDeferred($scope.state.trackingReminder.id)
                .then(function(){
                    console.debug('Reminder Deleted');
                }, function(error){
                    console.error('ERROR: quantimodoService.deleteTrackingReminderDeferred Failed to Delete Reminder with id ' +
                        $scope.state.trackingReminder.id);
                });
        };


        $scope.unitSelected = function(){
            if($scope.state.trackingReminder.abbreviatedUnitName === 'Show more units'){
                $scope.state.showMoreUnits = true;
                $scope.state.trackingReminder.abbreviatedUnitName = null;
                $scope.state.trackingReminder.unitName = null;
                $scope.state.trackingReminder.unitId = null;
            } else {
                console.debug("selecting_unit", $scope.state.trackingReminder.abbreviatedUnitName);
                $scope.state.trackingReminder.unitName =
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name;
                $scope.state.trackingReminder.unitId =
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].id;
            }
        };

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits=!$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        $rootScope.showActionSheetMenu = function() {
            $rootScope.variableObject = $scope.state.trackingReminder;
            $rootScope.variableObject.id = $scope.state.trackingReminder.variableId;
            $rootScope.variableObject.name = $scope.state.trackingReminder.variableName;
            console.debug("ReminderAddCtrl.showActionSheetMenu:   $rootScope.variableObject: ", $rootScope.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites' },
                    { text: '<i class="icon ion-android-notifications-none"></i>Record Measurement'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History' },
                    { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                    { text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Favorite',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug('BUTTON CLICKED', index);

                    if(index === 0){
                        $scope.addToFavoritesUsingVariableObject($rootScope.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddMeasurementForVariableObject($rootScope.variableObject);
                    }
                    if(index === 2){
                        $scope.goToChartsPageForVariableObject($rootScope.variableObject);
                    }
                    if(index === 3) {
                        $scope.goToHistoryForVariableObject($rootScope.variableObject);
                    }
                    if (index === 4) {
                        $state.go('app.variableSettings',
                            {variableName: $scope.state.trackingReminder.variableName});
                    }
                    if (index === 5) {
                        $scope.state.showMoreUnits = true;
                    }
                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.deleteReminder();
                    return true;
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        $scope.showExplanationsPopup = function(helpTitle) {
            var explanationText;
            if (helpTitle === "Default Value") {
                explanationText = "If specified, there will be a button that allows you to quickly record this value.";
            }

            $ionicPopup.show({
                title: helpTitle,
                //subTitle: '',
                template: explanationText,
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    }
                ]
            });

        };


	});
