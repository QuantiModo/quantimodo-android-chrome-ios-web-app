angular.module('starter').controller('MeasurementAddCtrl', ["$scope", "$q", "$timeout", "$state", "$rootScope", "$stateParams", "$filter", "$ionicActionSheet", "$ionicHistory", "qmService", "qmLogService", "ionicTimePicker", "ionicDatePicker", "$ionicLoading", function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, qmService, qmLogService, ionicTimePicker, ionicDatePicker, $ionicLoading) {
    $scope.controller_name = "MeasurementAddCtrl";
    var variableCategoryName = $stateParams.variableCategoryName;
    var variableCategoryObject = qmService.getVariableCategoryInfo(variableCategoryName);
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
        hideReminderMeButton : false,
        editReminder : false,
        variableCategoryNames: qm.manualTrackingVariableCategoryNames
    };
    $scope.$on('$ionicView.beforeEnter', function(){
        qmLogService.debug(null, $state.current.name + ': beforeEnter', null);
        $rootScope.hideNavigationMenu = false;
        $rootScope.bloodPressure = {diastolicValue: null, systolicValue: null, show: false};
        $scope.state.title = 'Record a Measurement';
        $scope.state.selectedDate = moment();
        if($stateParams.trackingReminder){
            setupTrackingByReminderNotification($stateParams.trackingReminder);
        } else if ($stateParams.measurement){
            setupTrackingByMeasurement($stateParams.measurement);
        } else if (urlHelper.getParam('measurementObject', window.location.href, true)) {
            setupTrackingByMeasurement(JSON.parse(urlHelper.getParam('measurementObject', window.location.href, true)));
        } else if ($stateParams.variableObject) {
            setupFromVariableObject($stateParams.variableObject);
        } else if (urlHelper.getParam('trackingReminderObject', window.location.href, true)) {
            setupTrackingByReminderNotification(JSON.parse(urlHelper.getParam('trackingReminderObject', window.location.href, true)));
        } else if ($stateParams.reminderNotification){
            setupTrackingByReminderNotification($stateParams.reminderNotification);
        } else if (urlHelper.getParam('measurementId', location.href, true)){
            setMeasurementVariablesByMeasurementId().then(function() {if(!$scope.state.measurementIsSetup){ $scope.goBack();}});
        } else if ($stateParams.variableName){
            setupFromVariableName($stateParams.variableName);
        }
        if (!$scope.state.measurementIsSetup) {setupFromUrlParameters();}
        if(!$scope.state.measurementIsSetup){setupFromVariableObject(qm.getPrimaryOutcomeVariable());}
    });
    $scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug(null, '$ionicView.enter ' + $state.current.name, null);
    });
    var trackBloodPressure = function(){
        if(!$rootScope.bloodPressure.diastolicValue || !$rootScope.bloodPressure.systolicValue){
            qmService.validationFailure('Please enter both values for blood pressure.', $scope.state.measurement);
            return;
        }
        $scope.state.selectedDate = moment($scope.state.selectedDate);
        $rootScope.bloodPressure.startTimeEpoch = parseInt($scope.state.selectedDate.format("X"));
        $rootScope.bloodPressure.note = $scope.state.measurement.note;
        qmService.postBloodPressureMeasurements($rootScope.bloodPressure)
            .then(function () {
                qmLogService.debug(null, 'Successfully qmService.postMeasurementByReminder: ' + JSON.stringify($rootScope.bloodPressure), null);
            }, function(error) {
                qmLogService.error('Failed to Track by favorite! ', error);
            });
        $scope.goBack();
    };
    $scope.cancel = function(){ $scope.goBack(); };
    $scope.deleteMeasurementFromMeasurementAddCtrl = function(){
        qmService.showInfoToast('Deleting measurement...');
        qmService.deleteMeasurementFromServer($scope.state.measurement).then(function (){
            $scope.goBack();
        });
    };
    var validate = function () {
        var message;
        if($scope.state.measurement.value === null || $scope.state.measurement.value === '' ||
            typeof $scope.state.measurement.value === 'undefined'){
            if($scope.state.measurement.unitAbbreviatedName === '/5'){message = 'Please select a rating';} else {message = 'Please enter a value';}
            qmService.validationFailure(message, $scope.state.measurement);
            return false;
        }
        if(!$scope.state.measurement.variableName || $scope.state.measurement.variableName === ""){
            message = 'Please enter a variable name';
            qmService.validationFailure(message, $scope.state.measurement);
            return false;
        }
        if(!$scope.state.measurement.variableCategoryName){
            message = 'Please select a variable category';
            qmService.validationFailure(message, $scope.state.measurement);
            return false;
        }
        if(!$scope.state.measurement.unitAbbreviatedName){
            message = 'Please select a unit for ' + $scope.state.measurement.variableName;
            qmService.validationFailure(message, $scope.state.measurement);
            return false;
        } else {
            if(!qm.unitHelper.getByAbbreviatedName($scope.state.measurement.unitAbbreviatedName)){
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify('Cannot get unit id', 'abbreviated unit name is ' + $scope.state.measurement.unitAbbreviatedName +
                        ' and qm.unitsIndexedByAbbreviatedName are ' + JSON.stringify(qm.unitsIndexedByAbbreviatedName), {}, "error");
                }
            } else {$scope.state.measurement.unitId = qm.unitHelper.getByAbbreviatedName($scope.state.measurement.unitAbbreviatedName).id;}
        }
        return true;
    };
    $scope.done = function(){
        if($rootScope.bloodPressure.show){
            trackBloodPressure();
            return;
        }
        if(!validate()){ return false; }
        if(!qmService.valueIsValid($scope.state.measurement, $scope.state.measurement.value)){return false;}
        if ($stateParams.reminderNotification && $ionicHistory.backView().stateName.toLowerCase().indexOf('inbox') > -1) {
            // If "record a different value/time was pressed", skip reminder upon save
            var params = { trackingReminderNotificationId: $stateParams.reminderNotification.id };
            qmService.skipTrackingReminderNotification(params, function(){
                qmLogService.debug(null, $state.current.name + ': skipTrackingReminderNotification', null);
            }, function(error){
                qmLogService.error($state.current.name + ": skipTrackingReminderNotification error");
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
        qmLogService.debug(null, $state.current.name + ': ' + 'measurementAddCtrl.done is posting this measurement: ' + JSON.stringify(measurementInfo), null);
        // Measurement only - post measurement. This is for adding or editing
        qmService.postMeasurementDeferred(measurementInfo);
        var toastMessage = 'Recorded ' + $scope.state.measurement.value  + ' ' + $scope.state.measurement.unitAbbreviatedName;
        toastMessage = toastMessage.replace(' /', '/');
        qmService.showInfoToast(toastMessage);
        $scope.goBack();
    };
    $scope.variableCategorySelectorChange = function(variableCategoryName) {
        setupUnit(qmService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName);
        $scope.state.defaultValuePlaceholderText = 'Enter a value';
        $scope.state.defaultValueLabel = 'Value';
        setupVariableCategory(variableCategoryName);
    };
    var setupVariableCategory = function(variableCategoryName){
        qmLogService.debug(null, $state.current.name + ': ' + 'variableCategoryName  is ' + variableCategoryName, null);
        //$scope.state.showVariableCategorySelector = false;
        if(!variableCategoryName){ variableCategoryName = ''; }
        $scope.state.measurement.variableCategoryName = variableCategoryName;
        $scope.state.title = "Add Measurement";
        $scope.state.measurementSynonymSingularLowercase = qmService.getVariableCategoryInfo(variableCategoryName).measurementSynonymSingularLowercase;
        if(qmService.getVariableCategoryInfo(variableCategoryName).defaultValueLabel){
            $scope.state.defaultValueLabel = qmService.getVariableCategoryInfo(variableCategoryName).defaultValueLabel;
        }
        if(qmService.getVariableCategoryInfo(variableCategoryName).defaultValuePlaceholderText){
            $scope.state.defaultValuePlaceholderText = qmService.getVariableCategoryInfo(variableCategoryName).defaultValuePlaceholderText;
        }
        if(!$scope.state.measurement.unitAbbreviatedName && qmService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName){
            setupUnit(qmService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName);
        }
    };
    $scope.unitSelected = function(){
        $scope.state.showVariableCategorySelector = true;  // Need to show category selector in case someone picks a nutrient like Magnesium and changes the unit to pills
        setupUnit($scope.state.measurement.unitAbbreviatedName);
    };
    function showMoreUnits(){
        $scope.state.units = qm.unitHelper.getProgressivelyMoreUnits($scope.state.units);
        $scope.state.measurement.unitAbbreviatedName = null;
        $scope.state.measurement.unitName = null;
        $scope.state.measurement.unitId = null;
    }
    function setupUnit(unitAbbreviatedName, valence){
        if(!unitAbbreviatedName){
            qmLogService.error("No unitAbbreviatedName provided to setupUnit!");
            return;
        }
        if(unitAbbreviatedName === 'Show more units'){
            showMoreUnits();
        } else {
            qmLogService.debug(null, 'selecting_unit ' + unitAbbreviatedName, null);
            $scope.state.measurement.unitAbbreviatedName = unitAbbreviatedName;
            $scope.state.measurement.unitName = qm.unitHelper.getByAbbreviatedName(unitAbbreviatedName).name;
            $scope.state.measurement.unitId = qm.unitHelper.getByAbbreviatedName(unitAbbreviatedName).id;
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
        qmLogService.debug(null, $state.current.name + ': ' + 'measurementAddCtrl.selectPrimaryOutcomeVariableValue selected rating value: ' + val, null);
    };
    $scope.showUnitsDropDown = function(){ $scope.showUnitsDropDown = true; };
    var setupFromUrlParameters = function() {
        var unitAbbreviatedName = urlHelper.getParam('unitAbbreviatedName', location.href, true);
        var variableName = urlHelper.getParam('variableName', location.href, true);
        var startTimeEpoch = urlHelper.getParam('startTimeEpoch', location.href, true);
        var value = urlHelper.getParam('value', location.href, true);
        if (unitAbbreviatedName || variableName || startTimeEpoch || value) {
            var measurementObject = {};
            measurementObject.unitAbbreviatedName = unitAbbreviatedName;
            measurementObject.variableName = variableName;
            measurementObject.startTimeEpoch = startTimeEpoch;
            measurementObject.value = value;
            setupTrackingByMeasurement(measurementObject);
        }
    };
    var setupFromVariableObject = function(variableObject){
        $stateParams.variableObject = variableObject;
        // Gets version from local storage in case we just updated unit in variable settings
        var userVariables = qmService.qmStorage.getElementsWithRequestParams(qmItems.userVariables, {name: variableObject.name});
        if(userVariables && userVariables.length){ variableObject = userVariables[0]; }
        $rootScope.variableObject = variableObject;
        $scope.state.title = "Record Measurement";
        if(variableObject.unit && variableObject.unit.abbreviatedName){
            setupUnit(variableObject.unit.abbreviatedName, variableObject.valence);
        } else if (variableObject.defaultUnitAbbreviatedName){
            setupUnit(variableObject.defaultUnitAbbreviatedName, variableObject.valence);
        } else if (variableObject.variableCategoryName){
            setupUnit(qmService.getVariableCategoryInfo(variableCategoryName).defaultUnitAbbreviatedName, variableObject.valence);
        }
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
        // Fill in default value as last value if not /5
        /** @namespace variableObject.lastValue */
        if ($scope.state.measurement.unitAbbreviatedName !== '/5' && !$scope.state.measurement.value && typeof variableObject.lastValue !== "undefined") {
            $scope.state.measurement.value = Number((variableObject.lastValueInUserUnit) ? variableObject.lastValueInUserUnit : variableObject.lastValue);
        }
    };
    var setupFromVariableName = function(variableName){
        qmService.showBlackRingLoader();
        qmService.getUserVariableByNameFromLocalStorageOrApiDeferred(variableName, {}).then(function(variableObject){
            qmService.hideLoader();
            setupFromVariableObject(variableObject);
        }, function (error) {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
    var setMeasurementVariablesByMeasurementId = function(){
        var deferred = $q.defer();
        qmService.showBlackRingLoader();
        qmService.getMeasurementById(urlHelper.getParam('measurementId', location.href, true))
            .then(function(measurementObject) {
                qmService.hideLoader();
                $scope.state.measurementIsSetup = true;
                setupTrackingByMeasurement(measurementObject);
                deferred.resolve();
            }, function(error) {
                qmService.hideLoader();
                qmLogService.error($state.current.name + ": " + "Error response: " + error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };
    $scope.goToAddReminder = function(){
        qmService.goToState('app.reminderAdd', {
            variableObject: $rootScope.variableObject,
            fromState: $state.current.name,
            fromUrl: window.location.href,
            measurement: $stateParams.measurement
        });
    };
    function setupValueFieldType(unitAbbreviatedName, valence, variableName) {
        $scope.state.units = qm.unitHelper.getUnitArrayContaining(unitAbbreviatedName);
        //if($scope.state.measurement.inputType){return;} Why is this here?  It prevents updating when we change a unit!  :(
        if(!unitAbbreviatedName){
            qmLogService.error('No unitAbbreviatedName provided to setupValueFieldType');
            return false;
        }
        $scope.state.measurement.inputType = qmService.getInputType(unitAbbreviatedName, valence, variableName);
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
            if(!$scope.state.measurement.unitAbbreviatedName){setupUnit(reminderNotification.unitAbbreviatedName);}
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
        qmLogService.debug(null, $state.current.name + ': ' + 'measurementAddCtrl.showActionSheetMenu:  $rootScope.variableObject: ', null, $rootScope.variableObject);
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                qmService.actionSheetButtons.addReminder,
                qmService.actionSheetButtons.charts,
                qmService.actionSheetButtons.history,
                qmService.actionSheetButtons.analysisSettings,
                { text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
            ],
            destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {qmLogService.debug(null, $state.current.name + ': ' + 'CANCELLED', null);},
            buttonClicked: function(index) {
                if(index === 0){qmService.goToState('app.reminderAdd', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 1){qmService.goToState('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 2) {qmService.goToState('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 3) {qmService.goToVariableSettingsByName($scope.state.measurement.variableName);}
                if(index === 4) { showMoreUnits(); }
                return true;
            },
            destructiveButtonClicked: function() {
                $scope.deleteMeasurementFromMeasurementAddCtrl();
                return true;
            }
        });
        qmLogService.debug(null, 'Setting hideSheet timeout', null);
        $timeout(function() { hideSheet(); }, 20000);
    };
}]);
