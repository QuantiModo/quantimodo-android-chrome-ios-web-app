angular.module('starter').controller('ReminderAddCtrl', function($scope, $state, $stateParams, $ionicLoading, $filter, $timeout, $rootScope,
                                             $ionicActionSheet, $ionicHistory, qmService, qmLogService, ionicTimePicker) {
    $scope.controller_name = "ReminderAddCtrl";
    qmLogService.debug(null, 'Loading ' + $scope.controller_name, null);
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
        showMoreUnits: false,
        trackingReminder: {
            variableId : null,
            variableName : null,
            combinationOperation : null
        }
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
            { id : 8, name : 'Miscellaneous' },
            { id : 9, name : 'Environment' }
        ],
        frequencyVariables : [
            { id : 2, name : 'Daily'},  // Default Daily has to be first because As-Needed will be above the fold on Android
            { id : 1, name : 'As-Needed'},
            { id : 3, name : 'Every 12 hours'},
            { id : 4, name : 'Every 8 hours'},
            { id : 5, name : 'Every 6 hours'},
            { id : 6, name : 'Every 4 hours'},
            { id : 7, name : 'Every 3 hours'},
            { id : 8, name : 'Every 2 hours'},
            { id : 9, name : 'Hourly'},
            { id : 10, name : 'Every 30 minutes'},
            { id : 11, name : 'Every other day'},
            { id : 12, name : 'Weekly'},
            { id : 13, name : 'Every 2 weeks'},
            { id : 14, name : 'Every 4 weeks'}
        ]
    };
    if($rootScope.user && $rootScope.user.administrator){$scope.variables.frequencyVariables.push({ id : 15, name : 'Minutely'});}
    if(!$rootScope.user){qmService.refreshUser();}
    $scope.$on('$ionicView.beforeEnter', function(){ qmLogService.info(null, 'ReminderAddCtrl beforeEnter...', null);
        var backView = $ionicHistory.backView();
        $scope.state.moreUnits = $rootScope.manualTrackingUnitObjects;
        $rootScope.hideNavigationMenu = false;
        qmService.sendToLoginIfNecessaryAndComeBack();
        if($stateParams.variableObject){ $stateParams.variableCategoryName = $stateParams.variableObject.variableCategoryName; }
        if($stateParams.reminder){ $stateParams.variableCategoryName = $stateParams.reminder.variableCategoryName; }
        $scope.stateParams = $stateParams;
        setTitle();
        var reminderIdUrlParameter = urlHelper.getParam('reminderId');
        var variableIdUrlParameter = urlHelper.getParam('variableId');
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
        } else if (qmService.getPrimaryOutcomeVariable()){
            $rootScope.variableObject = qmService.getPrimaryOutcomeVariable();
            setupByVariableObject(qmService.getPrimaryOutcomeVariable());
        } else { $scope.goBack(); }
    });
    $scope.showMoreOptions = function(){ $scope.state.showMoreOptions = true; };
    if($rootScope.user) {
        $scope.state.firstReminderStartTimeLocal = $rootScope.user.earliestReminderTime;
        $scope.state.firstReminderStartTimeEpochTime =
            qmService.getEpochTimeFromLocalStringRoundedToHour('20:00:00');
        $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeEpochTime * 1000);
    } else { qmLogService.error($state.current.name + ': $rootScope.user is not defined!'); }
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
        var defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString($rootScope.user.earliestReminderTime);
        if(order === 'first'&& $scope.state.firstReminderStartTimeLocal){
            defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString($scope.state.firstReminderStartTimeLocal);
        }
        if(order === 'second' && $scope.state.secondReminderStartTimeLocal){
            defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString($scope.state.secondReminderStartTimeLocal);
        }
        if(order === 'third' && $scope.state.thirdReminderStartTimeLocal){
            defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString($scope.state.thirdReminderStartTimeLocal);
        }
        defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteen(defaultStartTimeInSecondsSinceMidnightLocal);
        $scope.state.timePickerConfiguration = {
            callback: function (val) {
                if (typeof (val) === 'undefined') {
                    qmLogService.debug(null, 'Time not selected', null);
                } else {
                    var a = new Date();
                    var selectedTime = new Date(val * 1000);
                    a.setHours(selectedTime.getUTCHours());
                    a.setMinutes(selectedTime.getUTCMinutes());
                    a.setSeconds(0);
                    qmLogService.debug('Selected epoch is: ', val, 'and the time is ',
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
        qmLogService.info(null, 'remindersAdd.setupByVariableObject: ' + selectedVariable.name, null);
        if (!selectedVariable.variableCategoryName) { $scope.state.showAddVariableCard = true; }
        $rootScope.variableObject=selectedVariable;
        setupVariableCategory(selectedVariable.variableCategoryName);
        if (selectedVariable.unitAbbreviatedName) {
            $scope.state.trackingReminder.unitAbbreviatedName = selectedVariable.unitAbbreviatedName;
        } else {
            qmLogService.error("selectedVariable does not have unitAbbreviatedName", selectedVariable)
        }

        if (selectedVariable.combinationOperation) {$scope.state.trackingReminder.combinationOperation = selectedVariable.combinationOperation;}
        if (selectedVariable.id) {$scope.state.trackingReminder.variableId = selectedVariable.id;}
        if (selectedVariable.name) {$scope.state.trackingReminder.variableName = selectedVariable.name;}
        if (selectedVariable.variableName) {$scope.state.trackingReminder.variableName = selectedVariable.variableName;}
        setHideDefaultValueField();
        if (selectedVariable.valence) {$scope.state.trackingReminder.valence = selectedVariable.valence;}
        $scope.state.showReminderFrequencyCard = true;
        showMoreUnitsIfNecessary();
    };
    var getFrequencyChart = function(){
        return {
            "As-Needed": 0,
            "Every 12 hours" : 12*60*60,
            "Every 8 hours": 8*60*60,
            "Every 6 hours": 6*60*60,
            "Every 4 hours": 4*60*60,
            "Every 3 hours" : 180*60,
            "Every 30 minutes": 30*60,
            "Every minute": 60,
            "Hourly":60*60,
            "Daily": 24*60*60,
            "Twice a day" : 12*60*60,
            "Three times a day": 8*60*60,
            "Minutely": 60,
            "Every other day": 172800,
            'Weekly': 7 * 86400,
            'Every 2 weeks': 14 * 86400,
            'Every 4 weeks': 28 * 86400
        };
    };
    $scope.showAdditionalReminderTime = function(){
        if(!$scope.state.secondReminderStartTimeEpochTime){
            $scope.openReminderStartTimePicker('second');
            return;
        }
        if(!$scope.state.thirdReminderStartTimeEpochTime) { $scope.openReminderStartTimePicker('third'); }
    };
    $scope.oldShowAdditionalReminderTime = function(){
        if(!$scope.state.secondReminderStartTimeEpochTime){
            $scope.oldOpenReminderStartTimePicker('second');
            return;
        }
        if(!$scope.state.thirdReminderStartTimeEpochTime) { $scope.oldOpenReminderStartTimePicker('third'); }
    };
    var validationFailure = function (message) {
        qmService.showMaterialAlert('Whoops!', message);
        qmLogService.error(message, {trackingReminder: $scope.state.trackingReminder});
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
        if(!$scope.state.trackingReminder.unitAbbreviatedName) {
            validationFailure('Please select a unit for ' + $scope.state.trackingReminder.variableName);
            return false;
        } else {$scope.state.trackingReminder.unitId = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].id;}
        if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName] &&
            typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].minimumValue !== "undefined" &&
            $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].minimumValue !== null)
        {
            if($scope.state.trackingReminder.defaultValue !== null && $scope.state.trackingReminder.defaultValue <
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].minimumValue){
                validationFailure($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].minimumValue +
                    ' is the smallest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].name +
                    ".  Please select another unit or value.");
                return false;
            }
        }
        if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName] &&
            typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].maximumValue !== "undefined" &&
            $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].maximumValue !== null)
        {
            if($scope.state.trackingReminder.defaultValue !== null && $scope.state.trackingReminder.defaultValue >
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].maximumValue){
                validationFailure($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].maximumValue +
                    ' is the largest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].name +
                    ".  Please select another unit or value.");
                return false;
            }
        }
        if($scope.state.selectedStopTrackingDate && $scope.state.selectedStartTrackingDate && $scope.state.selectedStopTrackingDate < $scope.state.selectedStartTrackingDate){
            validationFailure("Start date cannot be later than the end date");
            return false;
        }
        return true;
    };
    var configureReminderTimeSettings = function(trackingReminder, reminderStartTimeEpochTime){
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
        updatedTrackingReminder.valueAndFrequencyTextDescriptionWithTime = qmService.getValueAndFrequencyTextDescriptionWithTime(updatedTrackingReminder);
        updatedTrackingReminder.reminderStartTime = qmService.getUtcTimeStringFromLocalString(updatedTrackingReminder.reminderStartTimeLocal);
        updatedTrackingReminder.reminderStartTimeEpochSeconds = reminderStartTimeEpochTime;
        updatedTrackingReminder.nextReminderTimeEpochSeconds = reminderStartTimeEpochTime;
        return updatedTrackingReminder;
    };
    $scope.save = function(){
        qmLogService.info(null, 'Clicked save reminder', null);
        if($stateParams.favorite){
            $scope.state.trackingReminder.reminderFrequency = 0;
            $scope.state.trackingReminder.valueAndFrequencyTextDescription = "As Needed";
        }
        if(!validReminderSettings()){return false;}
        $scope.state.trackingReminder.reminderFrequency = getFrequencyChart()[$scope.state.selectedFrequency];
        $scope.state.trackingReminder.valueAndFrequencyTextDescription = $scope.state.selectedFrequency;
        var dateFormat = 'YYYY-MM-DD';
        $scope.state.trackingReminder.stopTrackingDate = $scope.state.trackingReminder.startTrackingDate = null;
        if($scope.state.selectedStopTrackingDate){$scope.state.trackingReminder.stopTrackingDate = moment($scope.state.selectedStopTrackingDate).format(dateFormat);}
        if($scope.state.selectedStartTrackingDate){$scope.state.trackingReminder.startTrackingDate = moment($scope.state.selectedStartTrackingDate).format(dateFormat);}
        var remindersArray = [];
        if(typeof $scope.state.trackingReminder.defaultValue === "undefined"){$scope.state.trackingReminder.defaultValue = null;}
        remindersArray[0] = JSON.parse(JSON.stringify($scope.state.trackingReminder));
        if($scope.state.firstReminderStartTimeMoment){
            $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeMoment);
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
        if($scope.state.trackingReminder.id){qmService.qmStorage.deleteById('trackingReminders', $scope.state.trackingReminder.id);}
        qmService.showBasicLoader();
        qmService.qmStorage.addToOrReplaceByIdAndMoveToFront('trackingReminderSyncQueue', remindersArray).then(function() {
            qmService.syncTrackingReminders(true).then(function () {
                var toastMessage = $scope.state.trackingReminder.variableName + ' saved';
                qmService.showInfoToast(toastMessage);
                qmService.hideLoader();
                $scope.goBack(); // We can't go back until we get new notifications
            });
        });
    };
    var setupEditReminder = function(trackingReminder){
        $scope.state.trackingReminder = trackingReminder;
        setupVariableCategory($scope.state.trackingReminder.variableCategoryName);
        $scope.state.trackingReminder.firstDailyReminderTime = null;
        $scope.state.trackingReminder.secondDailyReminderTime = null;
        $scope.state.trackingReminder.thirdDailyReminderTime = null;
        $scope.state.firstReminderStartTimeLocal = qmService.getLocalTimeStringFromUtcString(trackingReminder.reminderStartTime);
        $scope.state.firstReminderStartTimeEpochTime = qmService.getEpochTimeFromLocalString($scope.state.firstReminderStartTimeLocal);
        $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeEpochTime * 1000);
        //$scope.state.reminderEndTimeStringLocal = trackingReminder.reminderEndTime;
        if(trackingReminder.stopTrackingDate){$scope.state.selectedStopTrackingDate = new Date(trackingReminder.stopTrackingDate);}
        if(trackingReminder.startTrackingDate){$scope.state.selectedStartTrackingDate = new Date(trackingReminder.startTrackingDate);}
        var reverseFrequencyChart = {
            604800: 'Weekly',
            1209600: 'Every 2 weeks',
            2419200: 'Every 4 weeks',
            172800: "Every other day",
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
            0: "As-Needed"
        };
        if($scope.state.trackingReminder.reminderFrequency !== null){
            $scope.state.selectedFrequency = reverseFrequencyChart[$scope.state.trackingReminder.reminderFrequency];
        }
        $scope.state.showReminderFrequencyCard = true;
        setHideDefaultValueField();
    };
    $scope.variableCategorySelectorChange = function(variableCategoryName) {
        $scope.state.variableCategoryObject = qmService.getVariableCategoryInfo(variableCategoryName);
        $scope.state.trackingReminder.unitAbbreviatedName = $scope.state.variableCategoryObject.defaultUnitAbbreviatedName;
        $scope.state.defaultValuePlaceholderText = 'Enter most common value';
        $scope.state.defaultValueLabel = 'Default Value';
        setupVariableCategory(variableCategoryName);
        showMoreUnitsIfNecessary();
    };
    var showMoreUnitsIfNecessary = function () {
        if($scope.state.trackingReminder.unitAbbreviatedName && !$rootScope.nonAdvancedUnitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName]){
            if($rootScope.manualTrackingUnitObjects[$scope.state.trackingReminder.unitAbbreviatedName]){
                $scope.state.moreUnits = $rootScope.manualTrackingUnitObjects;
            } else {
                $scope.state.showMoreUnits = true;
                $scope.state.moreUnits = $rootScope.unitObjects;
            }
        }
    };
    var setupVariableCategory = function(variableCategoryName){
        qmLogService.debug(null, 'remindersAdd.setupVariableCategory ' + variableCategoryName, null);
        if(!variableCategoryName || variableCategoryName === 'Anything'){variableCategoryName = '';}
        $scope.state.trackingReminder.variableCategoryName = variableCategoryName;
        $scope.state.variableCategoryObject = qmService.getVariableCategoryInfo(variableCategoryName);
        if (!$scope.state.trackingReminder.unitAbbreviatedName) {
            $scope.state.trackingReminder.unitAbbreviatedName = $scope.state.variableCategoryObject.defaultUnitAbbreviatedName;
        }
        $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
        if($scope.state.variableCategoryObject.defaultValueLabel){
            $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
        }
        if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
            $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
        }
        if(variableCategoryName === 'Treatments'){$scope.state.showInstructionsField = true;}
        $scope.state.trackingReminder = qmService.addImagePaths($scope.state.trackingReminder);
        showMoreUnitsIfNecessary();
        setHideDefaultValueField();
    };
    function setupReminderEditingFromVariableId(variableId) {
        if(variableId){
            qmService.getVariableByIdDeferred(variableId)
                .then(function (variables) {
                    $rootScope.variableObject = variables[0];
                    qmLogService.debug(null, 'setupReminderEditingFromVariableId got this variable object ' + JSON.stringify($rootScope.variableObject), null);
                    setupByVariableObject($rootScope.variableObject);
                    qmService.hideLoader();
                    $scope.loading = false;
                }, function () {
                    qmService.hideLoader();
                    $scope.loading = false;
                    qmLogService.error('ERROR: failed to get variable with id ' + variableId);
                });
        }
    }
    function setupReminderEditingFromUrlParameter(reminderIdUrlParameter) {
        qmService.getTrackingReminderByIdDeferred(reminderIdUrlParameter)
            .then(function (reminders) {
                if (reminders.length !== 1) {
                    validationFailure("Reminder id " + reminderIdUrlParameter + " not found!", 'assertive');
                    $scope.goBack();
                }
                $stateParams.reminder = reminders[0];
                setupEditReminder($stateParams.reminder);
                qmService.hideLoader();
                $scope.loading = false;
            }, function () {
                qmService.hideLoader();
                $scope.loading = false;
                qmLogService.error('ERROR: failed to get reminder with reminderIdUrlParameter ' + reminderIdUrlParameter);
            });
    }
    var setTitle = function(){
        if($stateParams.favorite){
            $scope.state.selectedFrequency = 'As-Needed';
            if($stateParams.reminder) {
                if($stateParams.variableCategoryName === 'Treatments'){$scope.state.title = "Modify As-Needed Med";} else {$scope.state.title = "Edit Favorite";}
            } else {
                if($stateParams.variableCategoryName === 'Treatments'){$scope.state.title = "Add As-Needed Med";} else {$scope.state.title = "Add Favorite";}
            }
        } else {if($stateParams.reminder) {$scope.state.title = "Edit Reminder Settings";} else {$scope.state.title = "Add Reminder";}}
    };
    $scope.deleteReminder = function(){
        qmService.qmStorage.deleteById('trackingReminders', $scope.state.trackingReminder.id).then(function(){$scope.goBack();});
        qmService.deleteTrackingReminderDeferred($scope.state.trackingReminder).then(function(){}, function(error){qmLogService.error(error);});
    };
    function setHideDefaultValueField(){
        if(!$scope.state.trackingReminder.variableName){return;}
        if($scope.state.trackingReminder.variableName.toLowerCase().indexOf('blood pressure') > -1 ||
            $scope.state.trackingReminder.unitAbbreviatedName === '/5' ||
            $scope.state.trackingReminder.unitAbbreviatedName === '/10' || $scope.state.trackingReminder.unitAbbreviatedName === 'yes/no'){
            $scope.state.hideDefaultValueField = true;
        } else {$scope.state.hideDefaultValueField = false;}
    }
    $scope.unitSelected = function(){
        $scope.state.showVariableCategorySelector = true;  // Need to show category selector in case someone picks a nutrient like Magnesium and changes the unit to pills
        if($scope.state.trackingReminder.unitAbbreviatedName === 'Show more units'){
            $scope.state.showMoreUnits = true;
            $scope.state.trackingReminder.unitAbbreviatedName = null;
            $scope.state.trackingReminder.unitName = null;
            $scope.state.trackingReminder.unitId = null;
        } else {
            qmLogService.debug(null, 'selecting_unit', null, $scope.state.trackingReminder.unitAbbreviatedName);
            $scope.state.trackingReminder.unitName = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].name;
            $scope.state.trackingReminder.unitId = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.unitAbbreviatedName].id;
        }
        setHideDefaultValueField();
    };
    $scope.toggleShowUnits = function(){$scope.state.showUnits=!$scope.state.showUnits;};
    $scope.showUnitsDropDown = function(){$scope.showUnitsDropDown = true;};
    $rootScope.showActionSheetMenu = function() {
        $rootScope.variableObject = $scope.state.trackingReminder;
        $rootScope.variableObject.id = $scope.state.trackingReminder.variableId;
        $rootScope.variableObject.name = $scope.state.trackingReminder.variableName;
        qmLogService.debug(null, 'ReminderAddCtrl.showActionSheetMenu:   $rootScope.variableObject: ', null, $rootScope.variableObject);
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                qmService.actionSheetButtons.recordMeasurement,
                qmService.actionSheetButtons.charts,
                qmService.actionSheetButtons.history,
                qmService.actionSheetButtons.analysisSettings,
                { text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
            ],
            destructiveText: '<i class="icon ion-trash-a"></i>Delete Favorite',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {qmLogService.debug(null, 'CANCELLED', null);},
            buttonClicked: function(index) {
                if(index === 0){qmService.goToState('app.measurementAddVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 1){qmService.goToState('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 2) {qmService.goToState('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 3) {qmService.goToState('app.variableSettings', {variableName: $scope.state.trackingReminder.variableName});}
                if(index === 4) {$scope.state.showMoreUnits = true;}
                return true;
            },
            destructiveButtonClicked: function() {
                $scope.deleteReminder();
                return true;
            }
        });
        qmLogService.debug(null, 'Setting hideSheet timeout', null);
        $timeout(function() {hideSheet();}, 20000);
    };
});
