angular.module('starter').controller('MeasurementAddCtrl', ["$scope", "$q", "$timeout", "$state", "$rootScope",
    "$stateParams", "$filter", "$ionicActionSheet", "$ionicHistory", "qmService",
    function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter, $ionicActionSheet, $ionicHistory, qmService){
        $scope.controller_name = "MeasurementAddCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            measurementIsSetup: false,
            showAddVariable: false,
            showVariableCategorySelector: false,
            showUnits: false,
            unitCategories: [],
            unitAbbreviatedName: '',
            measurement: {},
            searchedUnits: [],
            defaultValueLabel: 'Value',
            defaultValuePlaceholderText: 'Enter a value',
            hideReminderMeButton: false,
            editReminder: false,
            variableCategoryNames: qm.manualTrackingVariableCategoryNames,
            title: "Record a Measurement"
        };
        var unitChanged = false;
        $scope.$on('$ionicView.beforeEnter', function(){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            unitChanged = false;
            qmLog.debug($state.current.name + ': beforeEnter', null);
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            qmService.rootScope.setProperty('bloodPressure', {systolicValue: null, diastolicValue: null, show: false});
            $scope.state.title = 'Record a Measurement';
            setupMeasurement();
            var cat = getVariableCategory();
            if(cat){setupVariableCategory(cat);}
        });
        $scope.$on('$ionicView.enter', function(e){
            qmLog.debug('$ionicView.enter ' + $state.current.name);
            qmService.hideLoader();
            qmLog.info("$ionicView.enter $scope.state.measurement is ", $scope.state.measurement);
        });
        function setupMeasurement() {
            $scope.state.selectedDate = moment();
            $scope.state.units = qm.unitHelper.getNonAdvancedUnits();
            var reminderFromUrl = qm.urlHelper.getParam('trackingReminderObject', window.location.href, true);
            var measurementFromUrl = qm.urlHelper.getParam('measurementObject', window.location.href, true);
            var tr = $stateParams.trackingReminder;
            var m = $stateParams.measurement;
            var v = $stateParams.variableObject;
            var n = $stateParams.reminderNotification;
            var id = qm.urlHelper.getParam(['measurementId', 'id'], location.href, true);
            if (id) {
                setupByID(id).then(function () {
                    if (!$scope.state.measurementIsSetup) {
                        $scope.goBack();
                    }
                });
            } else if (tr) {
                setupByReminder(tr);
            } else if (m) {
                setupByMeasurement(m);
            } else if (measurementFromUrl) {
                setupByMeasurement(JSON.parse(measurementFromUrl));
            } else if (v) {
                setupFromVariable(v);
            } else if (reminderFromUrl) {
                setupByReminder(JSON.parse(reminderFromUrl));
            } else if (n) {
                setupByReminder(n);
            } else if ($stateParams.variableName) {
                setupFromVariableName($stateParams.variableName);
            }
            if (!$scope.state.measurementIsSetup) {
                setupFromUrlParameters();
            }
            if (!$scope.state.measurementIsSetup) {
                setupFromVariable(qm.getPrimaryOutcomeVariable());
            }
        }
        var trackBloodPressure = function(){
            if(!$rootScope.bloodPressure.diastolicValue || !$rootScope.bloodPressure.systolicValue){
                qmService.validationFailure('Please enter both values for blood pressure.', $scope.state.measurement);
                return;
            }
            $scope.state.selectedDate = moment($scope.state.selectedDate);
            $rootScope.bloodPressure.startTimeEpoch = parseInt($scope.state.selectedDate.format("X"));
            $rootScope.bloodPressure.note = $scope.state.measurement.note;
            qmService.postBloodPressureMeasurements($rootScope.bloodPressure)
                .then(function(){
                    qmLog.debug('Successfully qmService.postMeasurementByReminder: ' + JSON.stringify($rootScope.bloodPressure), null);
                }, function(error){
                    qmLog.error('Failed to Track by favorite! ', error);
                });
            $scope.goBack();
        };
        $scope.cancel = function(){
            $scope.goBack();
        };
        $scope.deleteMeasurementFromMeasurementAddCtrl = function(){
            qmService.showInfoToast('Deleting ' + $scope.state.measurement.variableName + ' measurement');
            qmService.deleteMeasurementFromServer($scope.state.measurement);
            $scope.goBack({});
        };
        $scope.done = function(){
            if($rootScope.bloodPressure.show){
                trackBloodPressure();
                return;
            }
            if(!qmService.measurements.measurementValid($scope.state.measurement)){return false;}
            if(!qmService.valueIsValid($scope.state.measurement, $scope.state.measurement.value)){return false;}
            if($stateParams.reminderNotification && $ionicHistory.backView().stateName.toLowerCase().indexOf('inbox') > -1){
                // If "record a different value/time was pressed", skip reminder upon save
                var params = {trackingReminderNotificationId: $stateParams.reminderNotification.id};
                qmService.skipTrackingReminderNotification(params, function(){
                    qmLog.debug($state.current.name + ': skipTrackingReminderNotification');
                }, function(error){
                    qmLog.error($state.current.name + ": skipTrackingReminderNotification error", error);
                });
            }
            $scope.state.selectedDate = moment($scope.state.selectedDate);
            var m = {
                id: $scope.state.measurement.id,
                variableName: $scope.state.measurement.variableName || jQuery('#variableName').val(),
                value: $scope.state.measurement.value,
                note: $scope.state.measurement.note || jQuery('#note').val(),
                prevStartTimeEpoch: $scope.state.measurement.prevStartTimeEpoch,
                startTimeEpoch: parseInt($scope.state.selectedDate.format("X")),
                unitAbbreviatedName: $scope.state.measurement.unitAbbreviatedName,
                variableCategoryName: getVariableCategoryName(),
                combinationOperation: $scope.state.variableObject.combinationOperation
            };
            // Assign measurement value if it does not exist
            if(!m.value && m.value !== 0){m.value = jQuery('#measurementValue').val();}
            qmLog.debug($state.current.name + ': ' + 'measurementAddCtrl.done is posting this measurement: ' + JSON.stringify(m));
            var toastMessage = 'Recorded ' + $scope.state.measurement.value + ' ' + $scope.state.measurement.unitAbbreviatedName;
            toastMessage = toastMessage.replace(' /', '/');
            qmService.showInfoToast(toastMessage);
            // Measurement only - post measurement. This is for adding or editing
            var backStateParams = {};
            qm.measurements.postMeasurement(m, function(){
                if(unitChanged){
                    qmLog.error("Syncing reminders because unit changed");
                    qm.storage.removeItem(qm.items.trackingReminders);
                    qmService.trackingReminders.syncTrackingReminders();
                    $scope.goBack(backStateParams);
                }
            });
            if(!unitChanged){
                $scope.goBack(backStateParams);  // We can go back immediately if no unit change
            }else{
                qmService.showBasicLoader(20);
                qmService.showInfoToast("Saving measurement and updating your default unit");
            }
        };
        $scope.variableCategorySelectorChange = function(variableCategoryName){
            var cat = qm.variableCategoryHelper.findVariableCategory(variableCategoryName);
            setupUnit(cat.defaultUnitAbbreviatedName);
            $scope.state.defaultValuePlaceholderText = 'Enter a value';
            $scope.state.defaultValueLabel = 'Value';
            setupVariableCategory(variableCategoryName);
        };
        var setupVariableCategory = function(variableCategoryName){
            var cat = getVariableCategory(variableCategoryName);
            qmLog.debug($state.current.name + ': ' + 'variableCategoryName  is ' + variableCategoryName);
            if($scope.state.measurement){
                $scope.state.measurement.variableCategoryName = cat.name;
            }
            $scope.state.variableCategoryObject = cat;
            $scope.state.helpText = cat.helpText;
            $scope.state.title = "Add Measurement";
            $scope.state.measurementSynonymSingularLowercase = cat.measurementSynonymSingularLowercase;
            if(cat.defaultValueLabel){$scope.state.defaultValueLabel = cat.defaultValueLabel;}
            if(cat.defaultValuePlaceholderText){$scope.state.defaultValuePlaceholderText = cat.defaultValuePlaceholderText;}
            if(!$scope.state.measurement.unitAbbreviatedName && cat.defaultUnitAbbreviatedName){
                setupUnit(cat.defaultUnitAbbreviatedName);
            }
        };
        $scope.unitSelected = function(){
            $scope.state.showVariableCategorySelector = true;  // Need to show category selector in case someone picks a nutrient like Magnesium and changes the unit to pills
            setupUnit($scope.state.measurement.unitAbbreviatedName);
            unitChanged = true;
        };
        function showMoreUnits(){
            $scope.state.units = qm.unitHelper.getProgressivelyMoreUnits($scope.state.units);
            $scope.state.measurement.unitAbbreviatedName = null;
            $scope.state.measurement.unitName = null;
            $scope.state.measurement.unitId = null;
        }
        function setupUnit(unitAbbreviatedName, valence){
            if(!unitAbbreviatedName){
                qmLog.info("No unitAbbreviatedName provided to setupUnit! Maybe a new variable?");
                return;
            }
            if(unitAbbreviatedName === 'Show more units'){
                showMoreUnits();
            }else{
                qmLog.info('selected unit: ' + unitAbbreviatedName);
                $scope.state.measurement.unitAbbreviatedName = unitAbbreviatedName;
                $scope.state.measurement = qm.unitHelper.updateAllUnitPropertiesOnObject(unitAbbreviatedName, $scope.state.measurement);
                qmLog.info("Setting $scope.state.measurement to ", $scope.state.measurement);
                qm.unitHelper.setInputType($scope.state.measurement);
                $scope.state.units = qm.unitHelper.getUnitArrayContaining(unitAbbreviatedName);
            }
        }
        $scope.selectPrimaryOutcomeVariableValue = function($event, newValue){
            // remove any previous primary outcome variables if present
            jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');
            // make this primary outcome variable glow visually
            jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');
            jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');
            if($scope.state.measurement.displayValueAndUnitString){
                $scope.state.measurement.displayValueAndUnitString =
                    $scope.state.measurement.displayValueAndUnitString.replace($scope.state.measurement.value, newValue);
            }
            $scope.state.measurement.value = newValue;
            $scope.state.measurement.pngPath = $event.currentTarget.currentSrc;
            qm.qmLog.debug($state.current.name + ': ' + 'measurementAddCtrl.selectPrimaryOutcomeVariableValue selected rating value: ' + newValue);
        };
        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };
        var setupFromUrlParameters = function(){
            var unitAbbreviatedName = qm.urlHelper.getParam('unitAbbreviatedName', location.href, true);
            var variableName = qm.urlHelper.getParam('variableName', location.href, true);
            var startTimeEpoch = qm.urlHelper.getParam('startTimeEpoch', location.href, true);
            var value = qm.urlHelper.getParam('value', location.href, true);
            if(unitAbbreviatedName || variableName || startTimeEpoch || value){
                var m = {};
                m.unitAbbreviatedName = unitAbbreviatedName;
                m.variableName = variableName;
                m.startTimeEpoch = startTimeEpoch;
                m.value = value;
                setupByMeasurement(m);
            }
        };
        function isYesNo() {
            var yesNo = qm.unitHelper.getYesNo();
            return $scope.state.measurement.unitAbbreviatedName === yesNo.unitAbbreviatedName;
        }
        function setDefaultValue(v) {
            var unitAbbreviatedName = $scope.state.measurement.unitAbbreviatedName;
            if (v &&
                unitAbbreviatedName !== '/5' &&
                !$scope.state.measurement.value &&
                typeof v.lastValue !== "undefined") {
                $scope.state.measurement.value = Number((v.lastValueInUserUnit) ? v.lastValueInUserUnit : v.lastValue);
            }
            if(isYesNo()){
                if(typeof $scope.state.measurement.value === "undefined"){
                    $scope.state.measurement.value = 1;
                }
            }
        }
        function setupFromVariable(v){
            $stateParams.variableObject = v;
            // Gets version from local storage in case we just updated unit in variable settings
            var userVariables = qm.storage.getElementsWithRequestParams(qm.items.userVariables, {name: v.name});
            if(userVariables && userVariables.length){v = userVariables[0];}
            $scope.state.variableObject = v;
            $scope.state.title = "Record Measurement";
            if(v.unitAbbreviatedName){
                setupUnit(v.unitAbbreviatedName, v.valence);
            }else if(v.variableCategoryName){
                var category = qm.variableCategoryHelper.findVariableCategory(v);
                setupUnit(category.defaultUnitAbbreviatedName, v.valence);
            }
            var m = qm.measurements.newMeasurement(v);
            if(m.variableName.toLowerCase().indexOf('blood pressure') > -1){$rootScope.bloodPressure.show = true;}
            if(m.variableCategoryName){
                setupVariableCategory(m.variableCategoryName);
            }else{
                $scope.state.showVariableCategorySelector = true;
            }
            $scope.state.measurement = m;
            $scope.state.measurementIsSetup = true;
            // Fill in default value as last value if not /5
            /** @namespace variableObject.lastValue */
            setDefaultValue(v);
        }
        var setupFromVariableName = function(variableName){
            qmService.showBlackRingLoader();
            qm.userVariables.getByName(variableName, {}, null, function(variable){
                qmService.hideLoader();
                setupFromVariable(variable);
            }, function(error){
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                qmService.hideLoader();
                qmLog.error(error);
            });
        };
        var setupByID = function(id){
            var deferred = $q.defer();
            qmService.showBlackRingLoader();
            qmService.getMeasurementById(id)
                .then(function(m){
                        qmService.hideLoader();
                        $scope.state.measurementIsSetup = true;
                        setupByMeasurement(m);
                        deferred.resolve();
                    }, function(error){
                    qmService.hideLoader();
                    qmLog.error($state.current.name + ": " + "Error response: ", error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };
        $scope.goToAddReminder = function(){
            qmService.goToState('app.reminderAdd', {
                variableObject: $scope.state.variableObject,
                fromState: $state.current.name,
                fromUrl: window.location.href,
                measurement: $stateParams.measurement
            });
        };
        function setVariableFromMeasurement(){
            $scope.state.variableObject = {
                unitAbbreviatedName: $scope.state.measurement.unitAbbreviatedName,
                variableCategoryName: getVariableCategoryName(),
                id: $scope.state.measurement.variableId ? $scope.state.measurement.variableId : null,
                name: $scope.state.measurement.variableName,
                valence: $scope.state.measurement.valence
            };
        }
        function setStateVariable(){
            if(!$scope.state.variableObject || $scope.state.variableObject !== $scope.state.measurement.variableName){
                if($stateParams.variableObject){
                    $scope.state.variableObject = $stateParams.variableObject;
                }else{
                    setVariableFromMeasurement();
                }
            }
        }
        var setupByMeasurement = function(m){
            if(isNaN(m.startTimeEpoch)){m.startTimeEpoch = moment(m.startTimeEpoch).unix();}
            if(!m.id){m.prevStartTimeEpoch = m.startTimeEpoch;}
            $scope.state.title = "Edit Measurement";
            $scope.state.selectedDate = moment(m.startTimeEpoch * 1000);
            $scope.state.measurement = m;
            qmLog.info("Setting $scope.state.measurement to ", m);
            $scope.state.measurementIsSetup = true;
            setupUnit(m.unitAbbreviatedName, m.valence);
            setStateVariable();
        };
        var setupByReminder = function(n){
            $scope.state.title = "Record Measurement";
            if(!$scope.state.measurement.unitAbbreviatedName){
                setupUnit(n.unitAbbreviatedName);
            }
            $scope.state.hideRemindMeButton = true;
            var m = qm.measurements.fromNotification(n);
            $scope.state.measurement = m;
            if(m.startTime){$scope.state.selectedDate = moment(m.startTime * 1000);}
            $scope.state.measurementIsSetup = true;
            setupUnit(n.unitAbbreviatedName, n.valence);
            setStateVariable();
            // Create variableObject
            if(!$scope.state.variableObject){
                if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined"){
                    $scope.state.variableObject = $stateParams.variableObject;
                }else if(n){
                    $scope.state.variableObject = {
                        unitAbbreviatedName: n.unitAbbreviatedName,
                        combinationOperation: n.combinationOperation,
                        userId: n.userId,
                        variableCategoryName: getVariableCategoryName(n),
                        id: n.variableId,
                        name: n.variableName
                    };
                }
            }
        };
        qmService.rootScope.setShowActionSheetMenu(function(){
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    qmService.actionSheets.actionSheetButtons.reminderAdd,
                    qmService.actionSheets.actionSheetButtons.charts,
                    qmService.actionSheets.actionSheetButtons.historyAllVariable,
                    qmService.actionSheets.actionSheetButtons.variableSettings,
                    {text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug(null, $state.current.name + ': ' + 'CANCELLED', null);
                },
                buttonClicked: function(index, button){
                    var params = {
                        variableObject: $scope.state.variableObject,
                        variableName: $scope.state.variableObject.name
                    };
                    if(index === 0){qmService.goToState('app.reminderAdd', params);}
                    if(index === 1){qmService.goToState('app.charts', params);}
                    if(index === 2){qmService.goToState('app.historyAllVariable', params);}
                    if(index === 3){qmService.goToVariableSettingsByName($scope.state.measurement.variableName);}
                    if(index === 4){showMoreUnits();}
                    return true;
                },
                destructiveButtonClicked: function(){
                    $scope.deleteMeasurementFromMeasurementAddCtrl();
                    return true;
                }
            });
            $timeout(function(){
                hideSheet();
            }, 20000);
        });
        function getVariableCategoryName(obj){
            var cat = getVariableCategory(obj);
            if(!cat){return null;}
            return cat.name;
        }
        function getVariableCategory(obj){
            var cat;
            if(obj){cat = qm.variableCategoryHelper.findVariableCategory(obj);}
            if(!cat && $scope.state){cat = qm.variableCategoryHelper.findVariableCategory($scope.state);}
            if(!cat){cat = qm.variableCategoryHelper.findVariableCategory($stateParams);}
            if(!cat){
                qmLog.debug("No variable category name from getVariableCategory")
                return null;
            }
            return cat;
        }
    }]);
