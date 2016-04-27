angular.module('starter')
    
    // Controls the Track Factors Page
    .controller('TrackFactorsCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading, authService,
                                             measurementService, $state, $rootScope, utilsService, localStorageService,
                                             $ionicScrollDelegate, ionicTimePicker) {
        $scope.controller_name = "TrackFactorsCtrl";

        // state
        $scope.state = {
            showTrackingHelpQuestion : false,
            showVariableSearchCard : true,
            showAddVariable : false,
            showAddMeasurement : false,
            showCategoryAsSelector : true,
            showUnits: false,
            
            variableSearchResults : [],
            
            unitCategories : {}, 

            // variables
            variableCategory : "",
            variableName : "",
            factor : "factors",
            helpText: "What do you want to track?",
            trackFactorsPlaceholderText: "Search for a variable here...",
            // default operation
            sumAvg : "avg",
            measurementValue : "",

            searchedUnits : []
        };

        $scope.state.title = 'Add Measurement';
        
            

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
        var setUnit = function(unit){
            console.log(unit);
            
            // filter the unit object from all units
            var unitObject = $scope.state.unitObjects.filter(function(x){return x.abbreviatedName === unit})[0];
            console.log("unitObject", unitObject);
            
            // hackish timeout for view to update itself
            setTimeout(function(){
                console.log("unitObject.category = ",unitObject.category);

                // update viewmodel
                $scope.selectedUnitCategoryName = unitObject.category;
                $scope.unitSelected(unitObject);
                
                // redraw view
                $scope.$apply();

                // hackish timeout for view to update itself
                setTimeout(function(){
                    console.log("unitObject.abbreviatedName == ",unitObject.abbreviatedName);
                    
                    // update viewmodel
                    $scope.state.selectedUnitAbbreviatedName = unitObject.abbreviatedName;
                    
                    // redraw view
                    $scope.$apply();
                },100);
            
            },100);
        };

        $scope.onMeasurementStart = function(){
            localStorageService.getItem('allTrackingData', function(allTrackingData){
                var allTrackingData = allTrackingData? JSON.parse(allTrackingData) : [];
                
                var current = '';
                var matched = allTrackingData.filter(function(x){
                    return x.unit === $scope.state.selectedUnitAbbreviatedName;
                });
                
                setTimeout(function(){
                    var value = matched[matched.length-1]? matched[matched.length-1].value : $scope.item.mostCommonValue;
                    if(value) {
                        $scope.state.measurementValue = value;
                    }
                    // redraw view
                    $scope.$apply();
                }, 500);
            });
        };

        // when an existing variable is tapped to remeasure
        $scope.measure = function(item){
            console.log(item);
            $scope.item = item;

            // set values in form
            $scope.state.sumAvg = item.combinationOperation == "MEAN"? "avg" : "sum";
            $scope.state.variableCategory = item.category;
            $scope.state.variableName = item.name;
            setUnit(item.abbreviatedUnitName);

            // set flags
            $scope.state.showVariableSearchCard = false;
            $scope.state.showAddVariable = false;
            $scope.state.showAddMeasurement = true;
            
            // update time in the datepicker
            $scope.slots = {epochTime: new Date().getTime()/1000};

            $scope.onMeasurementStart();
        };

        // when add new variable is tapped
        $scope.add_variable = function(){
            console.log("add variable");

            // set flags
            $scope.state.showVariableSearchCard = false;
            $scope.state.showAddVariable = true;
            $scope.state.showAddMeasurement = true;

            // set default
            $scope.state.variableName = "";
        };

        // cancel activity
        $scope.cancel = function(){
            
            // show list again
            $scope.state.showAddVariable = false;
            $scope.state.showAddMeasurement = false;
            $scope.state.showVariableSearchCard = true;
            $ionicScrollDelegate.scrollTop();
        };

        // completed adding and/or measuring
        $scope.done = function(){

            // populate params
            var params = {
                variable : $scope.state.variableName || jQuery('#variableName').val(),
                value : $scope.state.measurementValue || jQuery('#measurementValue').val(),
                epoch : $scope.slots.epochTime * 1000,
                unit : $scope.state.showAddVariable? $scope.state.abbreviatedUnitName : $scope.state.selectedUnitAbbreviatedName,
                category : $scope.state.variableCategory,
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
                    measurementService.post_tracking_measurement(params.epoch, params.variable, params.value, params.unit, params.isAvg, params.category, params.note, true)
                    .then(function(){

                        $scope.showAlert('Added Variable');

                        // set flags
                        $scope.state.showAddVariable = false;
                        $scope.state.showAddMeasurement = false;
                        $scope.state.showVariableSearchCard = true;

                        // refresh the last updated at from api
                        setTimeout($scope.init, 200);

                    }, function(err){
                        $scope.showAlert(err);
                    });
                }

            } else {

                // validation
                if(params.measurementValue === ""){
                    $scope.showAlert('Enter a Value');

                } else {
                    // measurement only

                    // post measurement
                    measurementService.post_tracking_measurement(params.epoch, params.variable, params.value, params.unit, params.isAvg, params.category, params.note);
                    $scope.showAlert(params.variable + ' measurement added!');

                    // set flags
                    $scope.state.showAddVariable = false;
                    $scope.state.showAddMeasurement = false;
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
                $scope.state.selectedUnitAbbreviatedName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;
                $scope.$apply();
            }, 100);
        };

        $scope.unitSearch = function(){

            var unitSearchQuery = $scope.state.abbreviatedUnitName;
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

            } else $scope.state.showUnits = false;
        };

        // when a unit is selected
        $scope.unitSelected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.state.abbreviatedUnitName = unit.abbreviatedName;
            $scope.state.showUnits = false;
            $scope.state.selectedUnitAbbreviatedName = unit.abbreviatedName;
        };

        // constructor
        $scope.init = function(){
            
            // $ionicLoading.hide();
            $scope.state.loading = true;
            $scope.state.variableSearchResults = [];

            // data default
            $scope.state.unitCategories = [];
            $scope.state.unitCategories = {};
            
            // variable
            $scope.state.variableCategory = "";
            $scope.state.variableName = "";

            // defaults
            $scope.state.sumAvg = "avg";
            $scope.state.measurementValue = "";
            $scope.abbreviatedUnitName = "";
            $scope.state.selectedUnitAbbreviatedName = "";

            // show spinner
            $ionicLoading.show({
                noBackdrop: true,
                template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
            });  

            // get user token
            authService.getAccessTokenFromAnySource().then(function(token){
                
                // get all variables
                measurementService.getVariables().then(function(variables){

                    console.log("got variables", variables);
                    
                    // update flags
                    $scope.state.loading = false;
                    
                    // populate list
                    $scope.state.variableSearchResults = $scope.state.variableSearchResults.concat(variables);
                    
                    // show list
                    $ionicLoading.hide();
                });

                // get variable categories
                measurementService.getVariableCategories().then(function(variableCategories){
                    
                    // update viewmodel
                    $scope.state.variableCategories = variableCategories;
                    console.log("got variable categories", variableCategories);

                    // hackish way to update category
                    setTimeout(function(){
                        //$scope.state.variableCategory = config.appSettings.primary_outcome_variable;
                        
                        // redraw everything
                        $scope.$apply();
                    },100);

                    // hide spinner
                    $ionicLoading.hide();
                    
                });

                // get units
                measurementService.refreshUnits();
                measurementService.getUnits().then(function(unitObjects){
                    
                    $scope.state.unitObjects = unitObjects;
                    console.log('got units', unitObjects);
                    // populate unitCategories
                    for(var i in units){
                        if($scope.state.unitCategories.indexOf(unitObjects[i].category) === -1){
                            $scope.state.unitCategories.push(unitObjects[i].category);
                            $scope.state.unitCategories[unitObjects[i].category] = [{
                                name : unitObjects[i].name,
                                abbreviatedName: unitObjects[i].abbreviatedName
                            }];
                        } else {
                            $scope.state.unitCategories[unitObjects[i].category].push({
                                name: unitObjects[i].name,
                                abbreviatedName: unitObjects[i].abbreviatedName
                            });
                        }
                    }

                    // set default unit category
                    $scope.selectedUnitCategoryName = 'Duration';
                    
                    // set first sub unit of selected category
                    $scope.state.selectedUnitAbbreviatedName = $scope.state.unitCategories[$scope.selectedUnitCategoryName][0].abbreviatedName;
                    
                    console.log("got units", units);
                    
                    // hide spinner
                    $ionicLoading.hide();

                });

            }, function(){
                console.log("need to log in");
                utilsService.showLoginRequiredAlert($scope.login);
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

        var timePicker = {
            callback: function (val) {
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var a = new Date();
                    var selectedTime = new Date(val * 1000);
                    a.setHours(selectedTime.getUTCHours());
                    a.setMinutes(selectedTime.getUTCMinutes());

                    $scope.slots.epochTime = a.getTime()/1000;
                }
            }
        };

        $scope.timePicker = function() {
            ionicTimePicker.openTimePicker(timePicker);
        };

        // search a variable
        $scope.search = function(variableSearchQuery){
            console.log(variableSearchQuery);

            $scope.state.loading = true;
            
            // search server for the variableSearchQuery
            measurementService.searchVariablesIncludePublic(variableSearchQuery).then(function(variables){
                
                // populate list with results
                $scope.state.variableSearchResults = variables;
                $scope.state.loading = false;           
            });
            
        };

    });