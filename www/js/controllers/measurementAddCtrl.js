angular.module('starter')

    // Controls the Track Factors Page
    .controller('MeasurementAddCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading,
                                                     authService, measurementService, $state, $rootScope, $stateParams,
                                                     utilsService, localStorageService, $filter, $ionicScrollDelegate,
                                                        variableCategoryService, ionicTimePicker, ionicDatePicker, variableService,
                                                        unitService){

        $scope.controller_name = "MeasurementAddCtrl";

        var variableCategoryName = $stateParams.variableCategoryName;
        var variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
        var currentTime = new Date();

        $scope.state = {
            measurementIsSetup : false,
            showAddVariable: false,
            showVariableCategorySelector: false,
            showUnits: false,
            unitCategories : [],
            variableCategoryName: variableCategoryName,
            variableCategoryObject : variableCategoryObject,
            // variables
            variableName : "",
            measurementStartTimeEpochTime : currentTime.getTime() / 1000,
            helpText: variableCategoryObject.helpText,
            abbreviatedUnitName : '',
            measurement : {},
            // default operation
            sumAvg : "avg",
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
            ]
        };

        // when a unit is changed
        var setUnit = function(abbreviatedUnitName){
            console.log(abbreviatedUnitName);

            // filter the unit object from all units
            var unitObject = $scope.state.unitObjects.filter(
                function(x){
                    return x.abbreviatedName === abbreviatedUnitName;
                })[0];
            console.log("unitObject", unitObject);

            // hackish timeout for view to update itself
            setTimeout(function(){
                console.log("unitObject.category = ",unitObject.category);

                // update view-model
                $scope.selectedUnitCategoryName = unitObject.category;
                $scope.unitSelected(unitObject);

                // redraw view
                $scope.safeApply();

                // hackish timeout for view to update itself
                setTimeout(function(){
                    console.log("unitObject.abbreviatedName == ", unitObject.abbreviatedName);

                    // update viewmodel
                    $scope.state.measurement.abbreviatedUnitName = unitObject.abbreviatedName;

                    // redraw view
                    $scope.safeApply();
                },100);

            },100);
        };

        $scope.openMeasurementStartTimePicker = function() {

            var secondsSinceMidnightLocal = ($scope.selectedHours * 60 * 60) + ($scope.selectedMinutes * 60);

            $scope.state.timePickerConfiguration = {
                callback: function (val) {
                    if (typeof (val) === 'undefined') {
                        console.log('Time not selected');
                    } else {
                        var selectedDateTime = new Date(val * 1000);
                        $scope.selectedHours = selectedDateTime.getUTCHours();
                        $scope.selectedMinutes = selectedDateTime.getUTCMinutes();
                        $scope.selectedDate.setHours($scope.selectedHours);
                        $scope.selectedDate.setMinutes($scope.selectedMinutes);

                        console.log('Selected epoch is : ', val, 'and the time is ',
                            $scope.selectedHours, 'H :', $scope.selectedMinutes, 'M');
                    }
                },
                inputTime: secondsSinceMidnightLocal,
                step: 1,
                closeLabel: 'Cancel'
            };
            ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
        };

        $scope.openMeasurementDatePicker = function() {
            $scope.state.datePickerConfiguration = {
                callback: function(val) {
                    if (typeof(val)==='undefined') {
                        console.log('Date not selected');
                    } else {
                        // clears out hours and minutes
                        $scope.selectedDate = new Date(val);
                        $scope.selectedDate.setHours($scope.selectedHours);
                        $scope.selectedDate.setMinutes($scope.selectedMinutes);
                    }
                },
                inputDate: $scope.selectedDate,
                from:new Date(2012, 8, 1),
                to: new Date()
            };
            ionicDatePicker.openDatePicker($scope.state.datePickerConfiguration);
        };

        // when add new variable is tapped
        $scope.addVariable = function(){
            console.log("add variable");

            $scope.state.showAddVariable = true;

            // set default
            $scope.state.measurement.variable = "";
            $scope.state.measurement.value = "";
            $scope.state.measurement.note = null;
            if($scope.state.variableCategoryObject) {
                setUnit(variableCategoryObject.defaultAbbreviatedUnitName);
            }
        };

        // cancel activity
        $scope.cancel = function(){
            var variableName = $scope.state.measurement.variable;
            if($stateParams.fromUrl){
                window.location = $stateParams.fromUrl;
            } else if
            ($stateParams.fromState){
                $state.go($stateParams.fromState, {
                    variableName: variableName,
                    noReload: true
                });
            } else {
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
            }
        };

        // delete measurement
        $scope.deleteMeasurement = function(){
            var measurementToDelete = {
                id : $scope.state.measurement.id,
                variableName : $scope.state.measurement.variable,
                startTimeEpoch : $scope.state.measurement.startTimeEpoch
            };
            measurementService.deleteMeasurementFromLocalStorage(measurementToDelete).then(
                function() {
                    console.log("About to delete measurement on server");
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                    measurementService.deleteMeasurementFromServer(measurementToDelete);
                },
                function() {
                    console.log("Cannot delete measurement from local storage");
                    measurementService.deleteMeasurementFromServer(measurementToDelete);
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                }
            );
        };

        $scope.onMeasurementStart = function(){
            localStorageService.getItem('allTrackingData', function(allTrackingData){
                allTrackingData = allTrackingData? JSON.parse(allTrackingData) : [];

                var matched = allTrackingData.filter(function(x){
                    return x.abbreviatedUnitName === $scope.state.measurement.abbreviatedUnitName;
                });

                setTimeout(function(){
                    var value = matched[matched.length-1]? matched[matched.length-1].value : $scope.variableObject.mostCommonValue;
                    if(value) {
                        $scope.state.measurement.value = value;
                    }
                    console.debug('onMeasurementStart: redrawing view...');
                    $scope.safeApply();
                }, 500);
            });
        };

        $scope.done = function(){



            if($scope.state.measurement.value === '' || typeof $scope.state.measurement.value === 'undefined'){
                utilsService.showAlert('Please enter a value');
                return;
            }

            if(!$scope.state.measurement.variable && !$scope.state.measurement.variableName){
                utilsService.showAlert('Please enter a variable name');
                return;
            }

            if(!$scope.state.measurement.variableCategoryName){
                utilsService.showAlert('Please select a variable category');
                return;
            }

            if(!$scope.state.measurement.abbreviatedUnitName && !$scope.abbreviatedUnitName){
                utilsService.showAlert('Please select a unit');
                return;
            }



            // combine selected date and time
            $scope.state.measurement.startTimeEpoch = $scope.selectedDate.getTime()/1000;

            // populate params
            var params = {
                id : $scope.state.measurement.id,
                variableName : $scope.state.measurement.variable || jQuery('#variableName').val(),
                value : $scope.state.measurement.value,
                note : $scope.state.measurement.note || jQuery('#note').val(),
                prevStartTimeEpoch : $scope.state.measurement.prevStartTimeEpoch,
                startTimeEpoch : $scope.state.measurement.startTimeEpoch,
                abbreviatedUnitName : $scope.state.showAddVariable ? (typeof $scope.abbreviatedUnitName ===
                    "undefined" || $scope.abbreviatedUnitName === "" ) ?
                    $scope.state.measurement.abbreviatedUnitName :
                    $scope.abbreviatedUnitName :
                    $scope.state.measurement.abbreviatedUnitName,
                variableCategoryName : $scope.state.measurement.variableCategoryName,
                isAvg : $scope.state.sumAvg === "avg"? true : false
            };

            if(!params.value && params.value !== 0){
                params.value = jQuery('#measurementValue').val();
            }

            console.log(params);

            var measurementInfo = {
                id: params.id,
                prevStartTimeEpoch: params.prevStartTimeEpoch,
                startTimeEpoch: params.startTimeEpoch,
                variableName: params.variableName,
                value: params.value,
                abbreviatedUnitName: params.abbreviatedUnitName,
                isAvg: params.isAvg,
                variableCategoryName: params.variableCategoryName,
                note: params.note
            };

            if($scope.state.showAddVariable){
                console.debug('done: Adding new variable..');

                // validation
                if(params.variableName === ""){
                    utilsService.showAlert('Please enter a variable name');
                } else {
                    $scope.showLoader();
                    // add variable
                    measurementService.postTrackingMeasurement(
                        measurementInfo, true)
                    .then(function(){
                        utilsService.showAlert('Added Variable');

                        if($stateParams.fromUrl){
                            window.location = $stateParams.fromUrl;
                        } else if ($stateParams.fromState){
                            $state.go($stateParams.fromState);
                        } else {
                            $rootScope.hideNavigationMenu = false;
                            $state.go(config.appSettings.defaultState);
                        }

                        // refresh the last updated at from api
                        //setTimeout($scope.init, 200);
                    }, function(err){
                        Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                        utilsService.showAlert(err);
                    });
                }

            } else {

                // validation
                if($scope.state.measurement.value === '' || typeof $scope.state.measurement.value === 'undefined'){
                    utilsService.showAlert('Please enter a value');
                } else {
                    // measurement only
                    // note: this is for adding or editing

                    // post measurement
                    measurementService.postTrackingMeasurement(measurementInfo, true)
                    .then(function() {

                    });

                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        var variableName = $scope.state.measurement.variable;
                        $state.go($stateParams.fromState, {
                            variableName: variableName,
                            measurementInfo: measurementInfo
                        });
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                    //utilsService.showAlert(params.variableName + ' measurement saved!');
                    
                    // refresh data
                    //setTimeout($scope.init, 200);
                }
            }
        };

        // setup category view
        $scope.setupVariableCategory = function(variableCategoryName){
            console.log("variableCategoryName  is " + variableCategoryName);
            //$scope.state.showVariableCategorySelector = false;
            if(!variableCategoryName){
                variableCategoryName = '';
            }
            $scope.state.measurement.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.measurement.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            $scope.state.title = "Add " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Measurement";
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            $scope.state.variableSearchPlaceholderText = 'Search for a ' + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + '...';
            setupValueFieldType($scope.state.variableCategoryObject.defaultAbbreviatedUnitName, null);
        };

        // when a unit category is changed
        $scope.changeUnitCategory = function(x){
            $scope.selectedUnitCategoryName = x;
            console.log('changed', $scope.selectedUnitCategoryName);

            // update the sub unit
            setTimeout(function(){
                console.log('changed to ', $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName);
                $scope.state.measurement.abbreviatedUnitName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;
                $scope.safeApply();
            }, 100);
        };

        $scope.unitSearch = function(){

            var unitSearchQuery = $scope.state.measurement.abbreviatedUnitName;
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

        // when a unit is selected
        $scope.unitSelected = function(unit){
            console.log("selecting unit",unit);

            // update view model
            $scope.state.measurement.abbreviatedUnitName = unit.abbreviatedName;
            $scope.state.showUnits = false;
        };

        // constructor
        $scope.init = function(){
            //$scope.showLoader();
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if(isAuthorized){
                if(!$scope.state.measurementIsSetup){
                    setupFromUrlParameters();
                }
                if(!$scope.state.measurementIsSetup) {
                    setupFromMeasurementStateParameter();
                }
                if(!$scope.state.measurementIsSetup) {
                    setupFromVariableStateParameter();
                }

                if(!$scope.state.measurementIsSetup){
                    setMeasurementVariablesByMeasurementId();
                }
                if(!$scope.state.measurementIsSetup) {
                    setupFromReminderStateParameter();
                }
                if(!$scope.state.measurementIsSetup){
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                }
                populateUnits();
                $scope.hideLoader();
            }
        };

        var populateUnits = function () {
            unitService.getUnits().then(function(unitObjects){
                $scope.state.unitObjects = unitObjects;
                $scope.hideLoader();
            });
        };
        
        $scope.selectedDate = new Date();
        $scope.selectedHours = $scope.selectedDate.getHours();
        $scope.selectedMinutes = $scope.selectedDate.getMinutes();

        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);

        $scope.selectPrimaryOutcomeVariableValue = function($event, val){
            // remove any previous primary outcome variables if present
            jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

            // make this primary outcome variable glow visually
            jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');

            jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

            // update view
            $scope.state.measurement.value = val;
        };

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits = !$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        var setupFromUrlParameters = function() {
            var unit = utilsService.getUrlParameter(location.href, 'unit', true);
            var variableName = utilsService.getUrlParameter(location.href, 'variableName', true);
            var startTimeEpoch = utilsService.getUrlParameter(location.href, 'startTimeEpoch', true);
            var value = utilsService.getUrlParameter(location.href, 'value', true);

            if (unit || variableName || startTimeEpoch || value) {
                var measurementObject = {};
                measurementObject.abbreviatedUnitName = unit;
                measurementObject.variable = variableName;
                measurementObject.startTimeEpoch = startTimeEpoch;
                measurementObject.value = value;
                setupTrackingByMeasurement(measurementObject);
            }
        };

        var setupFromMeasurementStateParameter = function(){
            if($stateParams.measurement !== null && typeof $stateParams.measurement !== "undefined"){
                setupTrackingByMeasurement($stateParams.measurement);
            }
        };

        var setupFromReminderStateParameter = function(){
            if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
                setupTrackingByReminder();
            }
        };

        var setupFromVariableStateParameter = function(){
            console.log('variableObject is ' + $stateParams.variableObject);
            if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                $scope.variableObject = $stateParams.variableObject;
                $scope.state.title = "Record Measurement";
                $scope.state.measurement.variable = $stateParams.variableObject.name;
                if (!$scope.state.measurement.variable) {
                    $scope.state.measurement.variable = $stateParams.variableObject.variableName;
                }
                if($stateParams.variableObject.abbreviatedUnitName){
                    $scope.state.measurement.abbreviatedUnitName = $stateParams.variableObject.abbreviatedUnitName;
                }
                if($stateParams.variableObject.category){
                    $scope.state.measurement.variableCategoryName = $stateParams.variableObject.category;
                } else if($stateParams.variableObject.variableCategoryName) {
                    $scope.state.measurement.variableCategoryName = $stateParams.variableObject.variableCategoryName;
                } else {
                    $scope.state.showVariableCategorySelector = true;
                }
                if($stateParams.variableObject.combinationOperation){
                    $scope.state.measurement.combinationOperation = $stateParams.variableObject.combinationOperation;
                } else {
                    $stateParams.variableObject.combinationOperation = 'MEAN';
                }
                $scope.state.measurement.startTimeEpoch = currentTime.getTime() / 1000;
                $scope.state.measurementIsSetup = true;
                setupValueFieldType($stateParams.variableObject.abbreviatedUnitName, $stateParams.variableObject.description);
                $scope.hideLoader();
            }
        };

        var setMeasurementVariablesByMeasurementId = function(){
            var measurementId = utilsService.getUrlParameter(location.href, 'measurementId', true);
            if(measurementId){
                var measurementObject = measurementService.getMeasurementById(measurementId);
                setupTrackingByMeasurement(measurementObject);
            }
            $scope.hideLoader();
        };

        $scope.goToAddReminder = function(){
            $state.go('app.reminderAdd', {
                variableObject: $scope.variableObject,
                fromState: $state.current.name,
                fromUrl: window.location.href
            });
        };

        function setupValueFieldType(abbreviatedUnitName, variableDescription) {
            if (abbreviatedUnitName === '/5') {
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
        
        var setupTrackingByMeasurement = function(measurementObject){

            if(isNaN(measurementObject.startTimeEpoch)){
                measurementObject.startTimeEpoch = moment(measurementObject.startTimeEpoch).unix();
            }

            if (!measurementObject.id) {
                measurementObject.prevStartTimeEpoch = measurementObject.startTimeEpoch;
            }

            $scope.selectedDate = new Date(measurementObject.startTimeEpoch * 1000);
            $scope.selectedHours = $scope.selectedDate.getHours();
            $scope.selectedMinutes = $scope.selectedDate.getMinutes();

            // Not used
            /*
            $scope.datePickerObj = {
                inputDate: $scope.selectedDate,
                setLabel: 'Set',
                todayLabel: 'Today',
                closeLabel: 'Cancel',
                mondayFirst: false,
                weeksList: ["S", "M", "T", "W", "T", "F", "S"],
                monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
                templateType: 'popup',
                from: new Date(2012, 8, 1),
                to: new Date(),
                showTodayButton: true,
                dateFormat: 'dd MMMM yyyy',
                closeOnSelect: false
            };
            */

            console.log('track : ' , measurementObject);

            $scope.state.title = "Edit Measurement";
            $scope.state.measurement = measurementObject;
            //$scope.state.measurementDate = moment(measurementObject.startTimeEpoch)._d;
            $scope.state.measurementIsSetup = true;
            setupValueFieldType($scope.state.measurement.abbreviatedUnitName,
                $scope.state.measurement.variableDescription);
            $scope.hideLoader();
        };

        var setupTrackingByReminder = function(){
            if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
                $scope.state.title = "Record Measurement";
                $scope.state.measurement.value = $stateParams.reminder.defaultValue;
                $scope.state.measurement.variable = $stateParams.reminder.variableName;
                $scope.state.measurement.abbreviatedUnitName = $stateParams.reminder.abbreviatedUnitName;
                $scope.state.measurement.variableCategoryName = $stateParams.reminder.variableCategoryName;
                $scope.state.measurement.combinationOperation = $stateParams.reminder.combinationOperation;
                $scope.state.measurement.startTimeEpoch = currentTime.getTime() / 1000;
                $scope.state.measurementIsSetup = true;
                setupValueFieldType($stateParams.reminder.abbreviatedUnitName,
                    $stateParams.reminder.variableDescription);
                $scope.hideLoader();
            }
        };

    });