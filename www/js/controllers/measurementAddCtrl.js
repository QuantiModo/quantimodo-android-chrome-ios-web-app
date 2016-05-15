angular.module('starter')

    // Controls the Track Factors Page
    .controller('MeasurementAddCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading,
                                                     authService, measurementService, $state, $rootScope, $stateParams,
                                                     utilsService, localStorageService, $filter, $ionicScrollDelegate,
                                                        variableCategoryService, ionicTimePicker, variableService,
                                                        unitService, timeService){

        $scope.controller_name = "MeasurementAddCtrl";

        var variableCategoryName = $stateParams.variableCategoryName;
        var variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
        var currentTime = new Date();

        $scope.state = {
            measurementIsSetup : false,
            showAddVariable: false,
            showCategoryAsSelector: false,
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

            searchedUnits : []
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
                $scope.$apply();

                // hackish timeout for view to update itself
                setTimeout(function(){
                    console.log("unitObject.abbreviatedName == ", unitObject.abbreviatedName);

                    // update viewmodel
                    $scope.state.measurement.abbreviatedUnitName = unitObject.abbreviatedName;

                    // redraw view
                    $scope.$apply();
                },100);

            },100);
        };

        $scope.openMeasurementStartTimePicker = function() {

            var hoursSinceMidnightLocal = moment().format("HH");
            var minutesSinceMidnightLocal = moment().format("mm");
            var secondsSinceMidnightLocal =
                hoursSinceMidnightLocal * 60 * 60 + minutesSinceMidnightLocal * 60;

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

                        $scope.state.measurement.startTime = a.getTime() / 1000;
                        $scope.state.measurementStartTimeUtc = moment.utc(a).format('HH:mm:ss');
                    }
                },
                inputTime: secondsSinceMidnightLocal
            };

            ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
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
                setUnit(variableCategoryObject.defaultUnitAbbreviatedName);
            }
        };

        // cancel activity
        $scope.cancel = function(){
            if($stateParams.fromUrl){
                window.location = $stateParams.fromUrl;
            } else if ($stateParams.fromState){
                $state.go($stateParams.fromState);
            } else {
                $rootScope.hideMenu = false;
                $state.go(config.appSettings.defaultState);
            }
        };

        // cancel activity
        $scope.deleteMeasurement = function(){
            var measurementToDelete = {
                variableName : $scope.state.measurement.variable,
                startTime : $scope.state.measurement.startTime
            };
            measurementService.deleteMeasurement(measurementToDelete);

            if($stateParams.fromUrl){
                window.location = $stateParams.fromUrl;
            } else if ($stateParams.fromState){
                $state.go($stateParams.fromState);
            } else {
                $rootScope.hideMenu = false;
                $state.go(config.appSettings.defaultState);
            }
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
                    // redraw view
                    $scope.$apply();
                }, 500);
            });
        };

        // completed adding and/or measuring
        $scope.done = function(){

            // populate params
            var params = {
                variableName : $scope.state.measurement.variable || jQuery('#variableName').val(),
                value : $scope.state.measurement.value || jQuery('#measurementValue').val(),
                note : $scope.state.measurement.note || jQuery('#note').val(),
                startTime : $scope.state.measurement.startTime * 1000,
                abbreviatedUnitName : $scope.state.showAddVariable? (typeof $scope.abbreviatedUnitName === "undefined" || $scope.abbreviatedUnitName === "" )? $scope.state.measurement.abbreviatedUnitName : $scope.abbreviatedUnitName : $scope.state.measurement.abbreviatedUnitName,
                variableCategoryName : $scope.state.measurement.variableCategoryName,
                isAvg : $scope.state.sumAvg === "avg"? true : false
            };

            console.log(params);

            // check if it is a new variable
            if($scope.state.showAddVariable){

                // validation
                if(params.variableName === ""){
                    utilsService.showAlert('Variable Name missing');
                } else {

                    // add variable
                    measurementService.postTrackingMeasurement(
                        params.startTime,
                        params.variableName,
                        params.value,
                        params.abbreviatedUnitName,
                        params.isAvg,
                        params.variableCategoryName,
                        params.note, true)
                    .then(function(){
                        utilsService.showAlert('Added Variable');

                        if($stateParams.fromUrl){
                            window.location = $stateParams.fromUrl;
                        } else if ($stateParams.fromState){
                            $state.go($stateParams.fromState);
                        } else {
                            $rootScope.hideMenu = false;
                            $state.go(config.appSettings.defaultState);
                        }

                        // refresh the last updated at from api
                        setTimeout($scope.init, 200);
                    }, function(err){
                        utilsService.showAlert(err);
                    });
                }

            } else {

                // validation
                if(params.value === ""){
                    utilsService.showAlert('Enter a Value');

                } else {
                    // measurement only

                    // post measurement
                    measurementService.postTrackingMeasurement(
                        params.startTime,
                        params.variableName,
                        params.value,
                        params.abbreviatedUnitName,
                        params.isAvg,
                        params.variableCategoryName,
                        params.note);
                    utilsService.showAlert(params.variableName + ' measurement saved!');

                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }

                    // refresh data
                    setTimeout($scope.init, 200);
                }
            }

            if($stateParams.fromUrl){
                window.location = $stateParams.fromUrl;
            } else if ($stateParams.fromState){
                $state.go($stateParams.fromState);
            } else {
                $rootScope.hideMenu = false;
                $state.go(config.appSettings.defaultState);
            }

        };

        // when a unit category is changed
        $scope.changeUnitCategory = function(x){
            $scope.selectedUnitCategoryName = x;
            console.log('changed', $scope.selectedUnitCategoryName);

            // update the sub unit
            setTimeout(function(){
                console.log('changed to ', $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName);
                $scope.state.measurement.abbreviatedUnitName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;
                $scope.$apply();
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
            $scope.state.loading = true;
            utilsService.loadingStart();
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if(isAuthorized){
                $scope.state.loading = true;
                utilsService.loadingStart();
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
                        $rootScope.hideMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                }
                populateUnits();
                $ionicLoading.hide();
            }
        };

        var populateUnits = function () {
            // get units
            unitService.refreshUnits();
            unitService.getUnits().then(function(unitObjects){

                $scope.state.unitObjects = unitObjects;

                // populate unitCategories
                for(var i in unitObjects){
                    if($scope.state.unitCategories.indexOf(unitObjects[i].category) === -1){
                        $scope.state.unitCategories.push(unitObjects[i].category);
                        $scope.state.unitCategories[unitObjects[i].category] = [{name : unitObjects[i].name, abbreviatedName: unitObjects[i].abbreviatedName}];
                    } else {
                        $scope.state.unitCategories[unitObjects[i].category].push({name: unitObjects[i].name, abbreviatedName: unitObjects[i].abbreviatedName});
                    }
                }

                // set default unit category
                // Don't know why we need this
                //$scope.selectedUnitCategoryName = 'Duration';

                // set first sub unit of selected category
                // Not sure what this is for but it overwrites the existing unit for measurements
                //$scope.state.measurement.abbreviatedUnitName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;

                //console.log("got units", unitObjects);

                // hide spinner
                $ionicLoading.hide();

            });
        };


        // for date
        $scope.currentDate = new Date();

        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);

        // when date is updated
        $scope.datePickerCallback = function (val) {
            if(typeof(val)==='undefined'){
                console.log('Date not selected');
            }else{
                $scope.currentDate = new Date(val);
            }
        };

        $scope.selectPrimaryOutcomeVariableValue = function($event, val){
            // remove any previous primary outcome variables if present
            jQuery('.primary-outcome-variable .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

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
            var startTime = utilsService.getUrlParameter(location.href, 'startTime', true);
            var value = utilsService.getUrlParameter(location.href, 'value', true);

            if (unit || variableName || startTime || value) {
                var measurementObject = {};
                measurementObject.abbreviatedUnitName = unit;
                measurementObject.variable = variableName;
                measurementObject.startTime = startTime;
                measurementObject.value = value;
                setupTracking(measurementObject);
            }
        };

        var setupFromMeasurementStateParameter = function(){
            if($stateParams.measurement !== null && typeof $stateParams.measurement !== "undefined"){
                setupTracking($stateParams.measurement);
            }
        };

        var setupFromReminderStateParameter = function(){
            if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
                setupTrackingByReminder();
            }
        };

        var setupFromVariableStateParameter = function(){
            if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined"){
                $scope.state.title = "Record Measurement";
                $scope.state.measurement.variable = $stateParams.variableObject.name;
                $scope.state.measurement.abbreviatedUnitName = $stateParams.variableObject.abbreviatedUnitName;
                $scope.state.measurement.variableCategoryName = $stateParams.variableObject.category;
                $scope.state.measurement.combinationOperation = $stateParams.variableObject.combinationOperation;
                $scope.state.measurement.startTime = currentTime.getTime() / 1000;
                $scope.state.measurementIsSetup = true;
            }
        };

        var setMeasurementVariablesByMeasurementId = function(){
            var measurementId = utilsService.getUrlParameter(location.href, 'measurementId', true);
            if(measurementId){
                var measurementObject = measurementService.getMeasurementById(measurementId);
                setupTracking(measurementObject);
            }
        };

        var setupTracking = function(measurementObject){
            console.log('track : ' , measurementObject);

            if(measurementObject.startTime.indexOf(" ") !== -1) {
                measurementObject.startTime = measurementObject.startTime.replace(/\ /g,'+');
            }

            $scope.state.title = "Edit Measurement";
            $scope.state.measurement = measurementObject;
            if(!$scope.state.measurement.variableCategoryName){
                $scope.state.measurement.variableCategoryName = measurementObject.variableCategoryName;
            }
            $scope.state.measurement.startTime = moment(measurementObject.startTime).unix();
            $scope.state.measurementDate = moment(measurementObject.startTime)._d;
            $scope.state.measurementIsSetup = true;
        };

        var setupTrackingByReminder = function(){
            if($stateParams.reminder !== null && typeof $stateParams.reminder !== "undefined"){
                $scope.state.title = "Record Measurement";
                $scope.state.measurement.value = $stateParams.reminder.defaultValue;
                $scope.state.measurement.variable = $stateParams.reminder.variableName;
                $scope.state.measurement.abbreviatedUnitName = $stateParams.reminder.abbreviatedUnitName;
                $scope.state.measurement.variableCategoryName = $stateParams.reminder.variableCategoryName;
                $scope.state.measurement.combinationOperation = $stateParams.reminder.combinationOperation;
                $scope.state.measurement.startTime = currentTime.getTime() / 1000;
                $scope.state.measurementIsSetup = true;
            }
        };

    });