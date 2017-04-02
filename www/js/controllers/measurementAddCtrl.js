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
            showMoreMenuButton: true,
            editReminder : false,
            showMoreUnits: false
        };
        $scope.$on('$ionicView.beforeEnter', function(){
            console.debug($state.current.name + ": beforeEnter");
            $rootScope.hideNavigationMenu = false;
            $rootScope.bloodPressure = {diastolicValue: null, systolicValue: null, show: false};
            $rootScope.stateParams = $stateParams;
            if($stateParams.trackingReminder){$stateParams.reminderNotification = $stateParams.trackingReminder;}
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state.title = 'Record a Measurement';
            var ignoreExpiration = true; //Gets them as quickly as possible and refresh later
            $ionicLoading.show();
            quantimodoService.getUnits(ignoreExpiration).then(function () {
                $ionicLoading.hide();
                refreshUnitsIfStale();
                console.debug($state.current.name + ": " + "got units in init function");
                if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                    $scope.state.measurement.unitAbbreviatedName = $stateParams.variableObject.userVariableDefaultUnitAbbreviatedName;
                }
                if($stateParams.reminderNotification) {$scope.state.measurement.unitAbbreviatedName = $stateParams.reminderNotification.unitAbbreviatedName;}
                $scope.state.selectedDate = moment();
                if(!$scope.state.measurementIsSetup) { setupFromUrlParameters(); }
                if(!$scope.state.measurementIsSetup) { setupFromMeasurementStateParameter(); }
                if(!$scope.state.measurementIsSetup) { setupFromMeasurementObjectInUrl(); }
                if(!$scope.state.measurementIsSetup) { setupFromVariableStateParameter(); }
                if(!$scope.state.measurementIsSetup) { setupFromReminderObjectInUrl(); }
                if(!$scope.state.measurementIsSetup) { setupFromReminderNotificationStateParameter(); }
                if(!$scope.state.measurementIsSetup){
                    setMeasurementVariablesByMeasurementId().then(function() {
                        if(!$scope.state.measurementIsSetup){
                            // Not set up, go to different state
                            if($stateParams.fromUrl){window.location = $stateParams.fromUrl;
                            } else if ($stateParams.fromState){$state.go($stateParams.fromState);
                            } else {
                                $rootScope.hideNavigationMenu = false;
                                $state.go(config.appSettings.defaultState);
                            }
                        }
                    });
                }
                if(!$scope.state.measurementIsSetup){ setupFromVariableNameStateParameter(); }
            });
        });
        $scope.$on('$ionicView.enter', function(e) {
            console.debug("$ionicView.enter " + $state.current.name);
            $scope.hideLoader();
        });
        var trackBloodPressure = function(){
            if(!$rootScope.bloodPressure.diastolicValue || !$rootScope.bloodPressure.systolicValue){
                validationFailure('Please enter both values for blood pressure.');
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
        var validationFailure = function (message) {
            $scope.showMaterialAlert(message);
            console.error(message);
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(message, "measurement is " + JSON.stringify($scope.state.measurement), {}, "error");}
        };
        var validate = function () {
            var message;
            if($scope.state.measurement.value === null || $scope.state.measurement.value === '' ||
                typeof $scope.state.measurement.value === 'undefined'){
                if($scope.state.measurement.unitAbbreviatedName === '/5'){message = 'Please select a rating';} else {message = 'Please enter a value';}
                validationFailure(message);
                return false;
            }
            if(!$scope.state.measurement.variableName || $scope.state.measurement.variableName === ""){
                message = 'Please enter a variable name';
                validationFailure(message);
                return false;
            }
            if(!$scope.state.measurement.variableCategoryName){
                message = 'Please select a variable category';
                validationFailure(message);
                return false;
            }
            if(!$scope.state.measurement.unitAbbreviatedName){
                message = 'Please select a unit';
                validationFailure(message);
                return false;
            } else {
                if(!$rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName]){
                    if (typeof Bugsnag !== "undefined") {
                        Bugsnag.notify('Cannot get unit id', 'abbreviated unit name is ' + $scope.state.measurement.unitAbbreviatedName +
                            ' and $rootScope.unitsIndexedByAbbreviatedName are ' + JSON.stringify($rootScope.unitsIndexedByAbbreviatedName), {}, "error");
                    }
                } else {$scope.state.measurement.unitId = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].id;}
            }
            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].minimumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].minimumValue !== null)
            {
                if($scope.state.measurement.value <
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].minimumValue){
                    message = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].minimumValue +
                        ' is the smallest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].name +
                        ".  Please select another unit or value.";
                    validationFailure(message);
                    return false;
                }
            }
            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].maximumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].maximumValue !== null)
            {
                if($scope.state.measurement.value > $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].maximumValue){
                    message = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].maximumValue +
                        ' is the largest possible value for the unit ' + $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].name +
                        ".  Please select another unit or value.";
                    validationFailure(message);
                    return false;
                }
            }
            return true;
        };
        $scope.done = function(){
            if($rootScope.bloodPressure.show){
                trackBloodPressure();
                return;
            }
            if(!validate()){ return false; }
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
            $scope.state.variableCategoryObject = quantimodoService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.measurement.unitAbbreviatedName = $scope.state.variableCategoryObject.defaultUnitAbbreviatedName;
            $scope.state.defaultValuePlaceholderText = 'Enter a value';
            $scope.state.defaultValueLabel = 'Value';
            setupVariableCategory(variableCategoryName);
        };
        var setupVariableCategory = function(variableCategoryName){
            console.debug($state.current.name + ": " + "variableCategoryName  is " + variableCategoryName);
            //$scope.state.showVariableCategorySelector = false;
            if(!variableCategoryName){ variableCategoryName = ''; }
            $scope.state.measurement.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = quantimodoService.getVariableCategoryInfo(variableCategoryName);
            if(!$scope.state.measurement.unitAbbreviatedName && $scope.state.variableCategoryObject.defaultUnitAbbreviatedName){
                $scope.state.measurement.unitAbbreviatedName = $scope.state.variableCategoryObject.defaultUnitAbbreviatedName;
            }
            $scope.state.title = "Add Measurement";
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            setupValueFieldType($scope.state.variableCategoryObject.defaultUnitAbbreviatedName, null);
        };
        $scope.unitSelected = function(){
            $scope.state.showVariableCategorySelector = true;  // Need to show category selector in case someone picks a nutrient like Magnesium and changes the unit to pills
            if($scope.state.measurement.unitAbbreviatedName === 'Show more units'){
                $scope.state.showMoreUnits = true;
                $scope.state.measurement.unitAbbreviatedName = null;
                $scope.state.measurement.unitName = null;
                $scope.state.measurement.unitId = null;
            } else {
                console.debug("selecting_unit", $scope.state.measurement.unitAbbreviatedName);
                $scope.state.measurement.unitName = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].name;
                $scope.state.measurement.unitId = $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.unitAbbreviatedName].id;
            }
            setupValueFieldType($scope.state.measurement.unitAbbreviatedName, $scope.state.measurement.variableDescription);
        };
        var refreshUnitsIfStale = function () {
            var ignoreExpiration = false;
            quantimodoService.getUnits(ignoreExpiration);
        };
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
            console.debug($state.current.name + ": " + "setupFromUrlParameters");
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
        var setupFromMeasurementStateParameter = function(){
            if($stateParams.measurement){
                console.debug($state.current.name + ": " + "setupFromMeasurementStateParameter");
                setupTrackingByMeasurement($stateParams.measurement);
            }
        };
        var setupFromReminderNotificationStateParameter = function(){
            if($stateParams.reminderNotification){
                console.debug($state.current.name + ": " + "setupFromReminderNotificationStateParameter");
                setupTrackingByReminderNotification();
            }
        };
        var setupFromReminderObjectInUrl = function(){
            if(!$stateParams.reminderNotification){
                var reminderFromURL =  quantimodoService.getUrlParameter('trackingReminderObject', window.location.href, true);
                if(reminderFromURL){
                    $stateParams.reminderNotification = JSON.parse(reminderFromURL);
                    console.debug($state.current.name + ": " + "setupFromReminderObjectInUrl: ", $stateParams.reminderNotification);
                    setupTrackingByReminderNotification();
                }
            }
        };
        var setupFromMeasurementObjectInUrl = function(){
            if(!$stateParams.measurement){
                var measurementFromURL =  quantimodoService.getUrlParameter('measurementObject', window.location.href, true);
                if(measurementFromURL){
                    measurementFromURL = JSON.parse(measurementFromURL);
                    console.debug($state.current.name + ": " + "setupFromMeasurementObjectInUrl: ", measurementFromURL);
                    setupTrackingByMeasurement(measurementFromURL);
                }
            }
        };
        var setupFromVariableStateParameter = function(){
            if($stateParams.variableObject) {
                console.debug($state.current.name + ": " + 'setupFromVariableStateParameter: variableObject is ' + JSON.stringify($stateParams.variableObject));
                // Gets version from local storage in case we just updated unit in variable settings
                var userVariables = quantimodoService.getElementsFromLocalStorageItemWithRequestParams('userVariables', {name: $stateParams.variableObject.name});
                if(userVariables && userVariables.length){ $stateParams.variableObject = userVariables[0]; }
                $rootScope.variableObject = $stateParams.variableObject;
                $scope.state.title = "Record Measurement";
                $scope.state.measurement.variableName = $stateParams.variableObject.name;
                if (!$scope.state.measurement.variableName) {$scope.state.measurement.variableName = $stateParams.variableObject.variableName;}
                if($scope.state.measurement.variableName.toLowerCase().indexOf('blood pressure') > -1) {$rootScope.bloodPressure.show = true;}
                if($stateParams.variableObject.variableCategoryName){
                    $scope.state.measurement.variableCategoryName = $stateParams.variableObject.variableCategoryName;
                    setupVariableCategory($scope.state.measurement.variableCategoryName);
                } else if($stateParams.variableObject.variableCategoryName) {
                    $scope.state.measurement.variableCategoryName = $stateParams.variableObject.variableCategoryName;
                    setupVariableCategory($scope.state.measurement.variableCategoryName);
                } else {$scope.state.showVariableCategorySelector = true;}
                if($stateParams.variableObject.combinationOperation){$scope.state.measurement.combinationOperation = $stateParams.variableObject.combinationOperation;
                } else {$stateParams.variableObject.combinationOperation = 'MEAN';}
                $scope.state.measurementIsSetup = true;
                setupValueFieldType($stateParams.variableObject.userVariableDefaultUnitAbbreviatedName, $stateParams.variableObject.description);
                // Fill in default value as last value if not /5
                /** @namespace $stateParams.variableObject.lastValue */
                if ($scope.state.measurement.unitAbbreviatedName !== '/5' && !$scope.state.measurement.value &&
                    typeof $stateParams.variableObject.lastValue !== "undefined") {
                    $scope.state.measurement.value = Number($stateParams.variableObject.lastValue);
                }
            }
        };
        var setupFromVariableNameStateParameter = function(){
            if($stateParams.variableName) {
                $ionicLoading.show();
                quantimodoService.getUserVariableByNameDeferred($stateParams.variableName, {}).then(function(variableObject){
                    $ionicLoading.hide();
                    $rootScope.variableObject = variableObject;
                    $stateParams.variableObject = variableObject;
                    setupFromVariableStateParameter();
                }, function (error) {
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide();
                    console.error(error);
                });
            }
        };
        var setMeasurementVariablesByMeasurementId = function(){
            var deferred = $q.defer();
            var measurementId = quantimodoService.getUrlParameter('measurementId', location.href, true);
            if(measurementId){
                var measurementObject;
                $ionicLoading.show();
                quantimodoService.getMeasurementById(measurementId).then(
                    function(response) {
                        $ionicLoading.hide();
                        $scope.state.measurementIsSetup = true;
                        console.debug($state.current.name + ": " + "Setting up tracking by this measurement ");
                        measurementObject = response;
                        setupTrackingByMeasurement(measurementObject);
                        deferred.resolve();
                    }, function(error) {
                        $ionicLoading.hide();
                        console.error($state.current.name + ": " + "Error response: " + error);
                        deferred.reject(error);
                    }
                );
            }
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
        function setupValueFieldType(unitAbbreviatedName, variableDescription) {
            if(!unitAbbreviatedName){
                console.error('No unitAbbreviatedName provided to setupValueFieldType');
                return false;
            }
            showMoreUnitsIfNecessary();
            if (unitAbbreviatedName === '/5') {
                if (!variableDescription) {
                    $scope.showNumericRatingNumberButtons = true;
                    $scope.showNegativeRatingFaceButtons = false;
                    $scope.showValueBox = false;
                    $scope.showPositiveRatingFaceButtons = false;
                } else if (variableDescription.toLowerCase().indexOf('positive') > -1) {
                    $scope.showPositiveRatingFaceButtons = true;
                    $scope.showNumericRatingNumberButtons = false;
                    $scope.showNegativeRatingFaceButtons = false;
                    $scope.showValueBox = false;
                } else if (variableDescription.toLowerCase().indexOf('negative') > -1) {
                    $scope.showNegativeRatingFaceButtons = true;
                    $scope.showValueBox = false;
                    $scope.showPositiveRatingFaceButtons = false;
                    $scope.showNumericRatingNumberButtons = false;
                }
            } else {
                $scope.showValueBox = true;
                $scope.showNegativeRatingFaceButtons = false;
                $scope.showPositiveRatingFaceButtons = false;
                $scope.showNumericRatingNumberButtons = false;
            }
        }
        function setVariableObjectFromMeasurement() {
            $rootScope.variableObject = {
                unitAbbreviatedName: $scope.state.measurement.unitAbbreviatedName,
                variableCategoryName: $scope.state.measurement.variableCategoryName ? $scope.state.measurement.variableCategoryName : null,
                id: $scope.state.measurement.variableId ? $scope.state.measurement.variableId : null,
                name: $scope.state.measurement.variableName,
                description: $scope.state.measurement.variableDescription
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
            setupValueFieldType($scope.state.measurement.unitAbbreviatedName, $scope.state.measurement.variableDescription);
            if ($scope.state.measurement.variable) { $scope.state.measurement.variableName = $scope.state.measurement.variable; }
            setVariableObject();
        };
        var setupTrackingByReminderNotification = function(){
            if($stateParams.reminderNotification){
                $scope.state.title = "Record Measurement";
                if(!$scope.state.measurement.unitAbbreviatedName){$scope.state.measurement.unitAbbreviatedName = $stateParams.reminderNotification.unitAbbreviatedName;}
                $scope.state.hideRemindMeButton = true;
                $scope.state.measurement.value = $stateParams.reminderNotification.defaultValue;
                $scope.state.measurement.variableName = $stateParams.reminderNotification.variableName;
                $scope.state.measurement.variableCategoryName = $stateParams.reminderNotification.variableCategoryName;
                $scope.state.measurement.combinationOperation = $stateParams.reminderNotification.combinationOperation;
                if($stateParams.reminderNotification.trackingReminderNotificationTimeEpoch !== "undefined" && $stateParams.reminderNotification.trackingReminderNotificationTimeEpoch){
                    $scope.state.selectedDate = moment($stateParams.reminderNotification.trackingReminderNotificationTimeEpoch * 1000);
                }
                $scope.state.measurementIsSetup = true;
                setupValueFieldType($stateParams.reminderNotification.unitAbbreviatedName, $stateParams.reminderNotification.variableDescription);
                setVariableObject();
            }
            // Create variableObject
            if (!$rootScope.variableObject) {
                if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                    $rootScope.variableObject = $stateParams.variableObject;
                } else if ($stateParams.reminderNotification) {
                    $rootScope.variableObject = {
                        unitAbbreviatedName : $stateParams.reminderNotification.unitAbbreviatedName,
                        combinationOperation : $stateParams.reminderNotification.combinationOperation,
                        userId : $stateParams.reminderNotification.userId,
                        variableCategoryName : $stateParams.reminderNotification.variableCategoryName,
                        id : $stateParams.reminderNotification.variableId,
                        name : $stateParams.reminderNotification.variableName
                    };
                }
            }
        };
        $rootScope.showActionSheetMenu = function() {
            console.debug($state.current.name + ": " + "measurementAddCtrl.showActionSheetMenu:  $rootScope.variableObject: ", $rootScope.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    //{ text: '<i class="icon ion-ios-star"></i>Add to Favorites' },
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History' },
                    { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                    { text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {console.debug($state.current.name + ": " + 'CANCELLED');},
                buttonClicked: function(index) {
                    if(index === 0){ $scope.goToAddReminderForVariableObject($rootScope.variableObject); }
                    if(index === 1){ $scope.goToChartsPageForVariableObject($rootScope.variableObject); }
                    if(index === 2) { $scope.goToHistoryForVariableObject($rootScope.variableObject); }
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
