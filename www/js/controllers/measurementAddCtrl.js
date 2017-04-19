angular.module('starter').controller('MeasurementAddCtrl', function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, quantimodoService, ionicTimePicker, ionicDatePicker, $ionicLoading) {
    $scope.controller_name = "MeasurementAddCtrl";
    var variableCategoryName = $stateParams.variableCategoryName;
    var variableCategoryObject = quantimodoService.getVariableCategoryInfo(variableCategoryName);
    $rootScope.showFilterBarSearchIcon = false;
    $scope.state = {
        measurementIsSetup : false,
        showAddVariable: false,
        showVariableCategorySelector: false,
        showUnits: false,
        unitCategories : [],
        variableCategoryName: variableCategoryName,
        variableCategoryObject : variableCategoryObject,
        helpText: variableCategoryObject.helpText,
        unitAbbreviatedName : '',
        measurement : {},
        searchedUnits : [],
        defaultValueLabel : 'Value',
        defaultValuePlaceholderText : 'Enter a value',
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
        hideReminderMeButton : false,
        editReminder : false,
        showMoreUnits: false
    };
    $scope.$on('$ionicView.beforeEnter', function(){
        console.debug($state.current.name + ": beforeEnter");
        $rootScope.hideNavigationMenu = false;
        $rootScope.bloodPressure = {diastolicValue: null, systolicValue: null, show: false};
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        $scope.state.title = 'Record a Measurement';
        $scope.state.selectedDate = moment();
        if($stateParams.trackingReminder){
            setupTrackingByReminderNotification($stateParams.trackingReminder);
        } else if ($stateParams.measurement){
            setupTrackingByMeasurement($stateParams.measurement);
        } else if (quantimodoService.getUrlParameter('measurementObject', window.location.href, true)) {
            setupTrackingByMeasurement(JSON.parse(quantimodoService.getUrlParameter('measurementObject', window.location.href, true))); 
        } else if ($stateParams.variableObject) {
            setupFromVariableObject($stateParams.variableObject);
        } else if (quantimodoService.getUrlParameter('trackingReminderObject', window.location.href, true)) {
            setupTrackingByReminderNotification(JSON.parse(quantimodoService.getUrlParameter('trackingReminderObject', window.location.href, true)));
        } else if ($stateParams.reminderNotification){
            setupTrackingByReminderNotification($stateParams.reminderNotification);
        } else if (quantimodoService.getUrlParameter('measurementId', location.href, true)){
            setMeasurementVariablesByMeasurementId().then(function() {if(!$scope.state.measurementIsSetup){ $scope.goBack();}});
        } else if ($stateParams.variableName){
            setupFromVariableName($stateParams.variableName);
        }
        if (!$scope.state.measurementIsSetup) {setupFromUrlParameters();}
        if(!$scope.state.measurementIsSetup){setupFromVariableObject(quantimodoService.getPrimaryOutcomeVariable());}
    });
    $scope.$on('$ionicView.enter', function(e) {
        console.debug("$ionicView.enter " + $state.current.name);
        $scope.hideLoader();
    });
    var trackBloodPressure = function(){
        if(!$rootScope.bloodPressure.diastolicValue || !$rootScope.bloodPressure.systolicValue){
            quantimodoService.validationFailure('Please enter both values for blood pressure.', $scope.state.measurement);
            return;
        }
        $scope.state.selectedDate = moment($scope.state.selectedDate);
        $rootScope.bloodPressure.startTimeEpoch = parseInt($scope.state.selectedDate.format("X"));
        $rootScope.bloodPressure.note = $scope.state.measurement.note;
        quantimodoService.postBloodPressureMeasurements($rootScope.bloodPressure)
            .then(function () {
                console.debug("Successfully quantimodoService.postMeasurementByReminder: " + JSON.stringify($rootScope.bloodPressure));
            }, function(error) {
                if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
                console.error(error);
                console.error('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
            });
        $scope.goBack();
    };
    $scope.cancel = function(){ $scope.goBack(); };
    $scope.deleteMeasurementFromMeasurementAddCtrl = function(){
        $scope.showLoader('Deleting measurement...');
        quantimodoService.deleteMeasurementFromServer($scope.state.measurement).then(function (){
            $scope.hideLoader();
            $scope.goBack();
        });
    };
    var validate = function () {
        var message;
        if($scope.state.measurement.value === null || $scope.state.measurement.value === '' ||
            typeof $scope.state.measurement.value === 'undefined'){
            if($scope.state.measurement.unitAbbreviatedName === '/5'){message = 'Please select a rating';} else {message = 'Please enter a value';}
            quantimodoService.validationFailure(message, $scope.state.measurement);
            return false;
        }
        if(!$scope.state.measurement.variableName || $scope.state.measurement.variableName === ""){
            message = 'Please enter a variable name';
            quantimodoService.validationFailure(message, $scope.state.measurement);
            return false;
        }
        if(!$scope.state.measurement.variableCategoryName){
            message = 'Please select a variable category';
            quantimodoService.validationFailure(message, $scope.state.measurement);
            return false;
        }
        if(!$scope.state.measurement.unitAbbreviatedName){
            message = 'Please select a unit for ' + $scope.state.measurement.variableName;
            quantimodoService.validationFailure(message, $scope.state.measurement);
            return false;
        } else {
            if(!$rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName]){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify('Cannot get unit id', 'abbreviated unit name is ' + $scope.state.measurement.unitAbbreviatedName +
                        ' and $rootScope.unitsIndexedByAbbreviatedName are ' + JSON.stringify($rootScope.unitsIndexedByAbbreviatedName), {}, "error");
                }
            } else {$scope.state.measurement.unitId = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].id;}
        }
        return true;
    };
    $scope.done = function(){
        if($rootScope.bloodPressure.show){
            trackBloodPressure();
            return;
        }
        if(!validate()){ return false; }
        if(!quantimodoService.valueIsValid($scope.state.measurement, $scope.state.measurement.value)){return false;}
        if ($stateParams.reminderNotification && $ionicHistory.backView().stateName.toLowerCase().indexOf('inbox') > -1) {
            // If "record a different value/time was pressed", skip reminder upon save
            var params = { trackingReminderNotificationId: $stateParams.reminderNotification.id };
            quantimodoService.skipTrackingReminderNotification(params, function(){
                console.debug($state.current.name + ": skipTrackingReminderNotification");
            }, function(error){
                console.error($state.current.name + ": skipTrackingReminderNotification error");
                if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(error); }
            });
        }
        $scope.state.selectedDate = moment($scope.state.selectedDate);
        var measurementInfo = {
            id : $scope.state.measurement.id,
            variableName : $scope.state.measurement.variableName || jQuery('#variableName').val(),
            value : $scope.state.measurement.value,
            note : $scope.state.measurement.note || jQuery('#note').val(),
            prevStartTimeEpoch : $scope.state.measurement.prevStartTimeEpoch,
            startTimeEpoch : parseInt($scope.state.selectedDate.format("X")),
            unitAbbreviatedName : $scope.state.measurement.unitAbbreviatedName,
            variableCategoryName : $scope.state.measurement.variableCategoryName,
            combinationOperation : $rootScope.variableObject.combinationOperation
        };
        // Assign measurement value if it does not exist
        if(!measurementInfo.value && measurementInfo.value !== 0){ measurementInfo.value = jQuery('#measurementValue').val(); }
        console.debug($state.current.name + ": " + 'measurementAddCtrl.done is posting this measurement: ' + JSON.stringify(measurementInfo));
        // Measurement only - post measurement. This is for adding or editing
        quantimodoService.postMeasurementDeferred(measurementInfo);
        var toastMessage = 'Recorded ' + $scope.state.measurement.value  + ' ' + $scope.state.measurement.unitAbbreviatedName;
        toastMessage = toastMessage.replace(' /', '/');
        $scope.showInfoToast(toastMessage);
        $scope.goBack();
    };
    $scope.variableCategorySelectorChange = function(variableCategoryName) {
        $scope.state.measurement.unitAbbreviatedName = quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName;
        $scope.state.defaultValuePlaceholderText = 'Enter a value';
        $scope.state.defaultValueLabel = 'Value';
        setupVariableCategory(variableCategoryName);
    };
    var setupVariableCategory = function(variableCategoryName){
        console.debug($state.current.name + ": " + "variableCategoryName  is " + variableCategoryName);
        //$scope.state.showVariableCategorySelector = false;
        if(!variableCategoryName){ variableCategoryName = ''; }
        $scope.state.measurement.variableCategoryName = variableCategoryName;
        $scope.state.title = "Add Measurement";
        $scope.state.measurementSynonymSingularLowercase = quantimodoService.getVariableCategoryInfo(variableCategoryName).measurementSynonymSingularLowercase;
        if(quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultValueLabel){
            $scope.state.defaultValueLabel = quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultValueLabel;
        }
        if(quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultValuePlaceholderText){
            $scope.state.defaultValuePlaceholderText = quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultValuePlaceholderText;
        }
        if(!$scope.state.measurement.unitAbbreviatedName && quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName){
            setupUnit(quantimodoService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName);
        }
    };
    $scope.unitSelected = function(){
        $scope.state.showVariableCategorySelector = true;  // Need to show category selector in case someone picks a nutrient like Magnesium and changes the unit to pills
        setupUnit($scope.state.measurement.unitAbbreviatedName);
    };
    function setupUnit(unitAbbreviatedName, valence){
        if(!unitAbbreviatedName){
            console.error("No unitAbbreviatedName provided to setupUnit!");
            return;
        }
        if(unitAbbreviatedName === 'Show more units'){
            $scope.state.showMoreUnits = true;
            $scope.state.measurement.unitAbbreviatedName = null;
            $scope.state.measurement.unitName = null;
            $scope.state.measurement.unitId = null;
        } else {
            console.debug("selecting_unit " + unitAbbreviatedName);
            $scope.state.measurement.unitAbbreviatedName = unitAbbreviatedName;
            $scope.state.measurement.unitName = $rootScope.unitsIndexedByAbbreviatedName[unitAbbreviatedName].name;
            $scope.state.measurement.unitId = $rootScope.unitsIndexedByAbbreviatedName[unitAbbreviatedName].id;
        }
        setupValueFieldType(unitAbbreviatedName, valence);
    }
    $scope.selectPrimaryOutcomeVariableValue = function($event, val){
        // remove any previous primary outcome variables if present
        jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');
        // make this primary outcome variable glow visually
        jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');
        jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');
        $scope.state.measurement.value = val;
        console.debug($state.current.name + ": " + 'measurementAddCtrl.selectPrimaryOutcomeVariableValue selected rating value: ' + val);
    };
    $scope.toggleShowUnits = function(){ $scope.state.showUnits = !$scope.state.showUnits; };
    $scope.showUnitsDropDown = function(){ $scope.showUnitsDropDown = true; };
    var setupFromUrlParameters = function() {
        var unit = quantimodoService.getUrlParameter('unit', location.href, true);
        var variableName = quantimodoService.getUrlParameter('variableName', location.href, true);
        var startTimeEpoch = quantimodoService.getUrlParameter('startTimeEpoch', location.href, true);
        var value = quantimodoService.getUrlParameter('value', location.href, true);
        if (unit || variableName || startTimeEpoch || value) {
            var measurementObject = {};
            measurementObject.unitAbbreviatedName = unit;
            measurementObject.variableName = variableName;
            measurementObject.startTimeEpoch = startTimeEpoch;
            measurementObject.value = value;
            setupTrackingByMeasurement(measurementObject);
        }
    };
    var setupFromVariableObject = function(variableObject){
        $stateParams.variableObject = variableObject;
        if(variableObject.userVariableDefaultUnitAbbreviatedName){
            $scope.state.measurement.unitAbbreviatedName = variableObject.userVariableDefaultUnitAbbreviatedName;
        } else if (variableObject.defaultUnitAbbreviatedName){
            $scope.state.measurement.unitAbbreviatedName = variableObject.defaultUnitAbbreviatedName;
        }
        // Gets version from local storage in case we just updated unit in variable settings
        var userVariables = quantimodoService.getElementsFromLocalStorageItemWithRequestParams('userVariables', {name: variableObject.name});
        if(userVariables && userVariables.length){ variableObject = userVariables[0]; }
        $rootScope.variableObject = variableObject;
        $scope.state.title = "Record Measurement";
        $scope.state.measurement.inputType = variableObject.inputType;
        $scope.state.measurement.variableName = variableObject.name;
        $scope.state.measurement.maximumAllowedValue = variableObject.maximumAllowedValue;
        $scope.state.measurement.minimumAllowedValue = variableObject.minimumAllowedValue;
        if (!$scope.state.measurement.variableName) {$scope.state.measurement.variableName = variableObject.variableName;}
        if($scope.state.measurement.variableName.toLowerCase().indexOf('blood pressure') > -1) {$rootScope.bloodPressure.show = true;}
        if(variableObject.variableCategoryName){
            $scope.state.measurement.variableCategoryName = variableObject.variableCategoryName;
            setupVariableCategory($scope.state.measurement.variableCategoryName);
        } else {$scope.state.showVariableCategorySelector = true;}
        $scope.state.measurement.combinationOperation = (variableObject.combinationOperation) ? variableObject.combinationOperation : 'MEAN';
        $scope.state.measurementIsSetup = true;
        setupUnit($scope.state.measurement.unitAbbreviatedName, variableObject.valence);
        // Fill in default value as last value if not /5
        /** @namespace variableObject.lastValue */
        if ($scope.state.measurement.unitAbbreviatedName !== '/5' && !$scope.state.measurement.value && typeof variableObject.lastValue !== "undefined") {
            $scope.state.measurement.value = Number((variableObject.lastValueInUserUnit) ? variableObject.lastValueInUserUnit : variableObject.lastValue);
        }
    };
    var setupFromVariableName = function(variableName){
        $ionicLoading.show();
        quantimodoService.getUserVariableByNameFromLocalStorageOrApiDeferred($stateParams.variableName, {}).then(function(variableObject){
            $ionicLoading.hide();
            setupFromVariableObject(variableObject);
        }, function (error) {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
            console.error(error);
        });
    };
    var setMeasurementVariablesByMeasurementId = function(){
        var deferred = $q.defer();
        $ionicLoading.show();
        quantimodoService.getMeasurementById(quantimodoService.getUrlParameter('measurementId', location.href, true))
            .then(function(measurementObject) {
                $ionicLoading.hide();
                $scope.state.measurementIsSetup = true;
                setupTrackingByMeasurement(measurementObject);
                deferred.resolve();
            }, function(error) {
                $ionicLoading.hide();
                console.error($state.current.name + ": " + "Error response: " + error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };
    $scope.goToAddReminder = function(){
        $state.go('app.reminderAdd', {
            variableObject: $rootScope.variableObject,
            fromState: $state.current.name,
            fromUrl: window.location.href,
            measurement: $stateParams.measurement
        });
    };
    var showMoreUnitsIfNecessary = function () {
        if($scope.state.measurement.unitAbbreviatedName &&
            !$rootScope.nonAdvancedUnitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName]){
            $scope.state.showMoreUnits = true;
        }
    };
    function setupValueFieldType(unitAbbreviatedName, valence, variableName) {
        showMoreUnitsIfNecessary();
        //if($scope.state.measurement.inputType){return;} Why is this here?  It prevents updating when we change a unit!  :(
        if(!unitAbbreviatedName){
            console.error('No unitAbbreviatedName provided to setupValueFieldType');
            return false;
        }
        $scope.state.measurement.inputType = quantimodoService.getInputType(unitAbbreviatedName, valence, variableName);
    }
    function setVariableObjectFromMeasurement() {
        $rootScope.variableObject = {
            unitAbbreviatedName: $scope.state.measurement.unitAbbreviatedName,
            variableCategoryName: $scope.state.measurement.variableCategoryName ? $scope.state.measurement.variableCategoryName : null,
            id: $scope.state.measurement.variableId ? $scope.state.measurement.variableId : null,
            name: $scope.state.measurement.variableName,
            valence: $scope.state.measurement.valence
        };
    }
    function setVariableObject() {
        if (!$rootScope.variableObject || $rootScope.variableObject !== $scope.state.measurement.variableName ) {
            if ($stateParams.variableObject) {$rootScope.variableObject = $stateParams.variableObject;} else { setVariableObjectFromMeasurement(); }
        }
    }
    var setupTrackingByMeasurement = function(measurementObject){
        if(isNaN(measurementObject.startTimeEpoch)){ measurementObject.startTimeEpoch = moment(measurementObject.startTimeEpoch).unix(); }
        if (!measurementObject.id) { measurementObject.prevStartTimeEpoch = measurementObject.startTimeEpoch; }
        $scope.state.title = "Edit Measurement";
        $scope.state.selectedDate = moment(measurementObject.startTimeEpoch * 1000);
        $scope.state.measurement = measurementObject;
        $scope.state.measurementIsSetup = true;
        setupUnit($scope.state.measurement.unitAbbreviatedName, $scope.state.measurement.valence);
        if ($scope.state.measurement.variable) { $scope.state.measurement.variableName = $scope.state.measurement.variable; }
        setVariableObject();
    };
    var setupTrackingByReminderNotification = function(reminderNotification){
        if(reminderNotification){
            $scope.state.title = "Record Measurement";
            if(!$scope.state.measurement.unitAbbreviatedName){$scope.state.measurement.unitAbbreviatedName = reminderNotification.unitAbbreviatedName;}
            $scope.state.hideRemindMeButton = true;
            $scope.state.measurement.value = reminderNotification.defaultValue;
            $scope.state.measurement.variableName = reminderNotification.variableName;
            $scope.state.measurement.variableCategoryName = reminderNotification.variableCategoryName;
            $scope.state.measurement.combinationOperation = reminderNotification.combinationOperation;
            if(reminderNotification.trackingReminderNotificationTimeEpoch !== "undefined" && reminderNotification.trackingReminderNotificationTimeEpoch){
                $scope.state.selectedDate = moment(reminderNotification.trackingReminderNotificationTimeEpoch * 1000);
            }
            $scope.state.measurementIsSetup = true;
            setupUnit(reminderNotification.unitAbbreviatedName, reminderNotification.valence);
            setVariableObject();
        }
        // Create variableObject
        if (!$rootScope.variableObject) {
            if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                $rootScope.variableObject = $stateParams.variableObject;
            } else if (reminderNotification) {
                $rootScope.variableObject = {
                    unitAbbreviatedName : reminderNotification.unitAbbreviatedName,
                    combinationOperation : reminderNotification.combinationOperation,
                    userId : reminderNotification.userId,
                    variableCategoryName : reminderNotification.variableCategoryName,
                    id : reminderNotification.variableId,
                    name : reminderNotification.variableName
                };
            }
        }
    };
    $rootScope.showActionSheetMenu = function() {
        console.debug($state.current.name + ": " + "measurementAddCtrl.showActionSheetMenu:  $rootScope.variableObject: ", $rootScope.variableObject);
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                quantimodoService.actionSheetButtons.addReminder,
                quantimodoService.actionSheetButtons.charts,
                quantimodoService.actionSheetButtons.history,
                quantimodoService.actionSheetButtons.analysisSettings,
                { text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
            ],
            destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {console.debug($state.current.name + ": " + 'CANCELLED');},
            buttonClicked: function(index) {
                if(index === 0){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject});}
                if(index === 1){$state.go('app.charts', {variableObject: $rootScope.variableObject});}
                if(index === 2) {$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject});}
                if(index === 3) {$state.go('app.variableSettings', {variableName: $scope.state.measurement.variableName});}
                if(index === 4) { $scope.state.showMoreUnits = true; }
                return true;
            },
            destructiveButtonClicked: function() {
                $scope.deleteMeasurementFromMeasurementAddCtrl();
                return true;
            }
        });
        console.debug('Setting hideSheet timeout');
        $timeout(function() { hideSheet(); }, 20000);
    };
});
