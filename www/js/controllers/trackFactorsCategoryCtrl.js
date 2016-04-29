angular.module('starter')

    // Controls the Track Factors Page
    .controller('TrackFactorsCategoryCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading,
                                                     authService, measurementService, $state, $rootScope, $stateParams,
                                                     utilsService, localStorageService, $filter, $ionicScrollDelegate,
                                                        variableCategoryService, ionicTimePicker, variableService,
                                                        unitService){

        $scope.controller_name = "TrackFactorsCategoryCtrl";

        var variableCategoryName = $stateParams.variableCategoryName;
        var variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
        var currentTime = new Date();

        $scope.state = {
            showVariableSearchCard: true,
            showAddVariable: false,
            showAddVariableButton: false,
            showAddMeasurementCard: false,
            showCategoryAsSelector: false,
            showUnits: false,
            variableSearchResults : [],
            unitCategories : [],
            variableCategoryObject : variableCategoryObject,
            // variables
            variableCategoryName : variableCategoryName,
            variableName : "",
            measurementStartTimeEpochTime : currentTime.getTime() / 1000,
            helpText: variableCategoryObject.helpText,
            abbreviatedUnitName : '',
            measurement : {},
            // default operation
            sumAvg : "avg",

            searchedUnits : []
        };

        if(variableCategoryName){
            $scope.state.trackFactorsPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
            $scope.state.title = $filter('wordAliases')('Track') + " " + $filter('wordAliases')(variableCategoryName);
        } else {
            $scope.state.trackFactorsPlaceholderText = "Search for a variable here...";
            $scope.state.title = $filter('wordAliases')('Track');
        }


        // alert box
        $scope.showAlert = function(title, template) {
            var alertPopup = $ionicPopup.alert({
                cssClass : 'calm',
                okType : 'button-calm',
                title: title,
                template: template
            });
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


        // when an old measurement is tapped to remeasure
        $scope.measure = function(variableObject){
            console.log(variableObject);
            $scope.variableObject = variableObject;

            // set values in form
            $scope.state.sumAvg = variableObject.combinationOperation === "MEAN"? "avg" : "sum";
            $scope.state.variableCategoryName = variableObject.category;
            $scope.state.measurement.variable = variableObject.name;
            setUnit(variableObject.abbreviatedUnitName);

            // set flags
            $scope.state.showVariableSearchCard = false;
            $scope.state.showAddVariable = false;
            $scope.state.showAddMeasurementCard = true;

            $scope.onMeasurementStart();
        };

        // when add new variable is tapped
        $scope.add_variable = function(){
            console.log("add variable");

            // set flags
            $scope.state.showVariableSearchCard = false;
            $scope.state.showAddVariable = true;
            $scope.state.showAddMeasurementCard = true;

            // set default
            $scope.state.measurement.variable = "";
            $scope.state.measurement.value = "";
            $scope.state.note = null;
        };

        // cancel activity
        $scope.cancel = function(){

            // show list again
            $scope.state.showAddVariable = false;
            $scope.state.showAddMeasurementCard = false;
            $scope.state.showVariableSearchCard = true;
            $ionicScrollDelegate.scrollTop();
        };

        // cancel activity
        $scope.deleteMeasurement = function(){
            var measurementToDelete = {
                variableName : $scope.state.measurement.variable,
                startTime : $scope.state.measurement.startTime
            };
            measurementService.deleteMeasurement(measurementToDelete);
            // show list again
            $scope.state.showAddVariable = false;
            $scope.state.showAddMeasurementCard = false;
            $scope.state.showVariableSearchCard = true;
            $ionicScrollDelegate.scrollTop();
        };

        $scope.onMeasurementStart = function(){
            localStorageService.getItem('allTrackingData', function(allTrackingData){
                allTrackingData = allTrackingData? JSON.parse(allTrackingData) : [];

                var matched = allTrackingData.filter(function(x){
                    return x.unit === $scope.state.measurement.abbreviatedUnitName;
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
                note : $scope.state.note || jQuery('#note').val(),
                startTime : $scope.state.measurement.startTime * 1000,
                abbreviatedUnitName : $scope.state.showAddVariable? (typeof $scope.abbreviatedUnitName === "undefined" || $scope.abbreviatedUnitName === "" )? $scope.state.measurement.abbreviatedUnitName : $scope.abbreviatedUnitName : $scope.state.measurement.abbreviatedUnitName,
                variableCategoryName : $scope.state.variableCategoryName,
                isAvg : $scope.state.sumAvg === "avg"? true : false
            };

            console.log(params);

            // check if it is a new variable
            if($scope.state.showAddVariable){

                // validation
                if(params.variableName === ""){
                    $scope.showAlert('Variable Name missing');
                } else {

                    // add variable
                    measurementService.post_tracking_measurement(
                        params.startTime,
                        params.variableName,
                        params.value,
                        params.abbreviatedUnitName,
                        params.isAvg,
                        params.variableCategoryName,
                        params.note, true)
                    .then(function(){
                        $scope.showAlert('Added Variable');

                        // set flags
                        $scope.state.showAddVariable = false;
                        $scope.state.showAddMeasurementCard = false;
                        $scope.state.showVariableSearchCard = true;

                        // refresh the last updated at from api
                        setTimeout($scope.init, 200);
                    }, function(err){
                        $scope.showAlert(err);
                    });
                }

            } else {

                // validation
                if(params.value === ""){
                    $scope.showAlert('Enter a Value');

                } else {
                    // measurement only

                    // post measurement
                    measurementService.post_tracking_measurement(
                        params.startTime,
                        params.variableName,
                        params.value,
                        params.abbreviatedUnitName,
                        params.isAvg,
                        params.variableCategoryName,
                        params.note);
                    $scope.showAlert(params.variableName + ' measurement added!');

                    // set flags
                    $scope.state.showAddVariable = false;
                    $scope.state.showAddMeasurementCard = false;
                    $scope.state.showVariableSearchCard = true;

                    // refresh data
                    setTimeout($scope.init, 200);
                }
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
            console.log("selecting_unit",unit);

            // update view model
            $scope.state.measurement.abbreviatedUnitName = unit.abbreviatedName;
            $scope.state.showUnits = false;
            $scope.state.measurement.abbreviatedUnitName = unit.abbreviatedName;
        };

        // constructor
        $scope.init = function(){

            // $ionicLoading.hide();
            $scope.state.loading = true;

            // show spinner
            $ionicLoading.show({
                noBackdrop: true,
                template: '<p class="item-icon-left">One moment, please...<ion-spinner icon="lines"/></p>'
            });

            if(!$scope.state.measurementIsSetup){
                setMeasurementVariablesFromUrlParameters();
            }

            if(!$scope.state.measurementIsSetup) {
                setMeasurementVariablesFromStateParameters();
            }

            if(!$scope.state.measurementIsSetup){
                setMeasurementVariablesByMeasurementId();
            }

            if(!$scope.state.measurementIsSetup){
                // get user token
                authService.getAccessTokenFromAnySource().then(function(token){
                    populateVariableSearchList();
                    populateVariableCategories();
                    populateUnits();
                }, function(){
                    console.log("need to log in");
                    utilsService.showLoginRequiredAlert($scope.login);
                });
            }

            $ionicLoading.hide();
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
                $scope.selectedUnitCategoryName = 'Duration';

                // set first sub unit of selected category
                $scope.state.measurement.abbreviatedUnitName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;

                console.log("got units", unitObjects);

                var variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);

                if(variableCategoryObject.defaultUnitAbbreviatedName) {
                    setUnit(variableCategoryObject.defaultUnitAbbreviatedName);
                }

                // hide spinner
                $ionicLoading.hide();

            });
        };

        var populateVariableCategories = function(){
            // get variable categories
            variableCategoryService.getVariableCategories().then(function(variableCategories){

                // update viewmodel
                $scope.state.variableCategories = variableCategories;
                console.log("got variable categories", variableCategories);

                // hackish way to update variableCategoryName
                setTimeout(function(){
                    $scope.state.variableCategoryName = variableCategoryName;

                    // redraw everything
                    $scope.$apply();
                },100);

                // hide spinner
                $ionicLoading.hide();

            });
        };


        var populateVariableSearchList = function(){
            // get all variables
            variableService.searchVariablesIncludePublic('*', $scope.state.variableCategoryName).then(function(variables){

                // populate list with results
                $scope.state.variableSearchResults = variables;

                console.log("got variables", variables);

                $scope.state.loading = false;
                $ionicLoading.hide();
                if(variables.length < 1){
                    $scope.state.showAddVariableButton = true;
                }
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

        // search a variable
        $scope.search = function(variableSearchQuery){
            console.log(variableSearchQuery);

            $scope.state.loading = true;

            // search server for the query
            variableService.searchVariablesIncludePublic(variableSearchQuery, variableCategoryName).then(function(variables){

                // populate list with results
                $scope.state.variableSearchResults = variables;
                $scope.state.loading = false;
                if(variables.length < 1){
                    $scope.state.showAddVariableButton = true;
                }
            });

            $scope.state.loading = false;
        };

        $scope.select_primary_outcome_variable = function($event, val){
            // remove any previous primary outcome variables if present
            jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');

            // make this primary outcome variable glow visually
            jQuery($event.target).addClass('active_primary_outcome_variable');

            jQuery($event.target).parent().removeClass('primary_outcome_variable_history').addClass('primary_outcome_variable_history');

            // update view
            $scope.state.measurement.value = val;
        };

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits = !$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        var setMeasurementVariablesFromUrlParameters = function() {
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

        var setMeasurementVariablesFromStateParameters = function(){
            if($stateParams.measurement !== null && typeof $stateParams.measurement !== "undefined"){
                setupTracking($stateParams.measurement);
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
            $scope.state.measurement.startTime = moment(measurementObject.startTime).unix();
            $scope.state.measurementDate = moment(measurementObject.startTime)._d;
            $scope.state.measurementIsSetup = true;
            $scope.state.showVariableSearchCard = false;
            $scope.state.showAddMeasurementCard = true;
        };

        var getVariable = function(variableName){
            variableService.getVariablesByName(variableName)
                .then(function(variable){
                    $scope.state.measurement.variable = variable;
                }, function(){
                    utils.showAlert('Can\'t find variable. Try again!', 'assertive').then(function(){
                        $state.go('app.historyAll');
                    });
                });
        };


        var utils = {
            startLoading : function(){
                // show spinner
                $ionicLoading.show({
                    noBackdrop: true,
                    template: '<p class="item-icon-left">One moment please...<ion-spinner icon="lines"/></p>'
                });
            },

            stopLoading : function(){
                // hide spinner
                $ionicLoading.hide();
            },

            // alert box
            showAlert : function(title, cssClass) {
                return $ionicPopup.alert({
                    cssClass : cssClass? cssClass : 'calm',
                    okType : cssClass? 'button-'+cssClass : 'button-calm',
                    title: title
                });
            }
        };

    });