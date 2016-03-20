angular.module('starter')
    
    // Controls the Track Factors Page
    .controller('TrackFactorsCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading, authService, measurementService, $state, $rootScope, utilsService, localStorageService){

        $scope.controller_name = "TrackFactorsCtrl";

        // flags
        $scope.flags = {
            showTrack : true,
            showAddVariable : false,
            showAddMeasurement : false,
            showCategoryAsSelector : true,
            show_units: false
        };

        // lists
        $scope.lists = {
            list : [],
            userVariables : [],
            searchVariables : [],
            categories : []
        };

        // state
        $scope.state = {
            
            // category object,
            categoryValues : {}, 

            // variables
            variable_category : "",
            variable_name : "",
            factor : "factors",
            help_text: "What do you want to track?",
            
            // default operation
            sumAvg : "avg",
            variable_value : "",

            searchedUnits : []
        };
            

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
        var set_unit = function(unit){
            console.log(unit);
            
            // filter the unit object from all units
            var unit_obj = $scope.state.units.filter(function(x){return x.abbreviatedName === unit})[0];
            console.log("unit_obj", unit_obj);
            
            // hackish timeout for view to update itself
            setTimeout(function(){
                console.log("unit_obj.category = ",unit_obj.category);

                // update viewmodel
                $scope.selected_unit_category = unit_obj.category;
                $scope.unit_selected(unit_obj);
                
                // redraw view
                $scope.$apply();

                // hackish timeout for view to update itself
                setTimeout(function(){
                    console.log("unit_obj.abbreviatedName == ",unit_obj.abbreviatedName);
                    
                    // update viewmodel
                    $scope.state.selected_sub = unit_obj.abbreviatedName;
                    
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
                    return x.unit === $scope.state.selected_sub;
                });
                
                setTimeout(function(){
                    var value = matched[matched.length-1]? matched[matched.length-1].value : $scope.item.mostCommonValue;
                    if(value) $scope.state.variable_value = value;
                    // redraw view
                    $scope.$apply();
                }, 500);
            });
        };

        // when an old measurement is tapped to remeasure
        $scope.measure = function(item){
            console.log(item);
            $scope.item = item;

            // set values in form
            $scope.state.sumAvg = item.combinationOperation == "MEAN"? "avg" : "sum";
            $scope.state.variable_category = item.category;
            $scope.state.variable_name = item.name;
            set_unit(item.abbreviatedUnitName);

            // set flags
            $scope.flags.showTrack = false;
            $scope.flags.showAddVariable = false;
            $scope.flags.showAddMeasurement = true;
            
            // update time in the datepicker
            $scope.slots = {epochTime: new Date().getTime()/1000, format: 24, step: 1};

            $scope.onMeasurementStart();
        };

        // when add new variable is tapped
        $scope.add_variable = function(){
            console.log("add variable");

            // set flags
            $scope.flags.showTrack = false;
            $scope.flags.showAddVariable = true;
            $scope.flags.showAddMeasurement = true;

            // set default
            $scope.state.variable_name = "";
        };

        // cancel activity
        $scope.cancel = function(){
            
            // show list again
            $scope.flags.showAddVariable = false;
            $scope.flags.showAddMeasurement = false;
            $scope.flags.showTrack = true;
        };

        // completed adding and/or measuring
        $scope.done = function(){

            // populate params
            var params = {
                variable : $scope.state.variable_name || jQuery('#variable_name').val(),
                value : $scope.state.variable_value || jQuery('#variable_value').val(),
                epoch : $scope.slots.epochTime * 1000,
                unit : $scope.flags.showAddVariable? $scope.state.unit_text : $scope.state.selected_sub,
                category : $scope.state.variable_category,
                isAvg : $scope.state.sumAvg === "avg"? true : false
            };

            console.log(params);

            // check if it is a new variable
            if($scope.flags.showAddVariable){

                // validation
                if(params.variable_name === ""){
                    $scope.showAlert('Variable Name missing');
                } else {
                    

                    // add variable
                    measurementService.post_tracking_measurement(params.epoch, params.variable, params.value, params.unit, params.isAvg, params.category, true)
                    .then(function(){

                        $scope.showAlert('Added Variable');

                        // set flags
                        $scope.flags.showAddVariable = false;
                        $scope.flags.showAddMeasurement = false;
                        $scope.flags.showTrack = true;

                        // refresh the last updated at from api
                        setTimeout($scope.init, 200);

                    }, function(err){
                        $scope.showAlert(err);
                    });
                }

            } else {

                // validation
                if(params.variable_value === ""){
                    $scope.showAlert('Enter a Value');

                } else {
                    // measurement only

                    // post measurement
                    measurementService.post_tracking_measurement(params.epoch, params.variable, params.value, params.unit, params.isAvg, params.category);
                    $scope.showAlert('Measurement Added');

                    // set flags
                    $scope.flags.showAddVariable = false;
                    $scope.flags.showAddMeasurement = false;
                    $scope.flags.showTrack = true;
                    
                    // refresh data
                    setTimeout($scope.init, 200);
                }
            }
        };

        // when a unit category is changed
        $scope.change_unit_category = function(x){
            $scope.selected_unit_category = x;
            console.log('changed', $scope.selected_unit_category);

            // update the sub unit
            setTimeout(function(){
                console.log('changed to ', $scope.state.categoryValues[$scope.selected_unit_category][0].abbreviatedName);
                $scope.state.selected_sub = $scope.state.categoryValues[$scope.selected_unit_category][0].abbreviatedName;
                $scope.$apply();
            }, 100);
        };

        $scope.unit_search = function(){
            var query = $scope.state.unit_text;
            if(query !== ""){
                $scope.flags.show_units = true;
                var matches = $scope.state.units.filter(function(unit) {
                    return unit.abbreviatedName.toLowerCase().indexOf(query.toLowerCase()) !== -1;
                });

                $timeout(function() {
                    $scope.state.searchedUnits = matches;
                }, 100);


            } else $scope.flags.show_units = false;
        };

        // when a unit is selected
        $scope.unit_selected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.state.unit_text = unit.abbreviatedName;
            $scope.flags.show_units = false;
            $scope.state.selected_sub = unit.abbreviatedName;
        };

        // constructor
        $scope.init = function(){
            
            // $ionicLoading.hide();
            $scope.state.loading = true;
            $scope.lists.userVariables = [];
            $scope.lists.searchVariables = [];

            // data default
            $scope.lists.categories = [];
            $scope.state.categoryValues = {};
            
            // variable
            $scope.state.variable_category = "";
            $scope.state.variable_name = "";

            // defaults
            $scope.state.sumAvg = "avg";
            $scope.state.variable_value = "";
            $scope.unit_text = "";
            $scope.state.selected_sub = "";

            // show spinner
            $ionicLoading.show({
                noBackdrop: true,
                template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
            });  

            // get user token
            authService.getAccessToken().then(function(token){
                
                // get all variables
                measurementService.getVariables().then(function(variables){

                    console.log("got variables", variables);
                    
                    // update flags
                    $scope.state.loading = false;
                    $scope.lists.userVariables = variables;
                    $scope.lists.list = [];
                    
                    // populate list
                    $scope.lists.list = $scope.lists.list.concat(variables);
                    
                    // show list
                    $ionicLoading.hide();
                });

                // get variabls cateogries
                measurementService.getVariableCategories().then(function(variableCategories){
                    
                    // update viewmodel
                    $scope.state.variableCategories = variableCategories;
                    console.log("got variable categories", variableCategories);

                    // hackish way to update category
                    setTimeout(function(){
                        $scope.state.variable_category = config.appSettings.primary_outcome_variable;
                        
                        // redraw everythign
                        $scope.$apply();
                    },100)

                    // hide spinner
                    $ionicLoading.hide();
                    
                });

                // get units
                measurementService.getUnits().then(function(units){
                    
                    $scope.state.units = units;
                    console.log('got units', units);
                    // populate categoryValues
                    for(var i in units){
                        if($scope.lists.categories.indexOf(units[i].category) === -1){
                            $scope.lists.categories.push(units[i].category);
                            $scope.state.categoryValues[units[i].category] = [{
                                name : units[i].name,
                                abbreviatedName: units[i].abbreviatedName
                            }];
                        } else {
                            $scope.state.categoryValues[units[i].category].push({
                                name: units[i].name,
                                abbreviatedName: units[i].abbreviatedName
                            });
                        }
                    }

                    // set default unit category
                    $scope.selected_unit_category = 'Duration';
                    
                    // set first sub unit of selected category
                    $scope.state.selected_sub = $scope.state.categoryValues[$scope.selected_unit_category][0].abbreviatedName;
                    
                    console.log("got units", units);
                    
                    // hide spinenr
                    $ionicLoading.hide();

                });

            }, function(){
                console.log("need to log in");
                utilsService.showLoginRequiredAlert($scope.login);
                $ionicLoading.hide();
                return;
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

        // time picker defaults
        $scope.slots = {
            epochTime: new Date().getTime()/1000,
            format: 24,
            step: 1
        };

        // when time is changed
        $scope.timePickerCallback = function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var a = new Date();
            a.setHours(val.hours);
            a.setMinutes(val.minutes);
            $scope.slots.epochTime = a.getTime()/1000;
          }
        };

        // search a variable
        $scope.search = function(query){
            console.log(query);

            $scope.state.loading = true;

            if(query == ''){
                // if search is cleared 
                
                console.log('yay');

                // repopulate to last reported variables
                $scope.lists.list = $scope.lists.userVariables;

                // update view
                $scope.state.loading = false;
                $scope.$apply();
            } else {

                // search server for the query
                measurementService.getPublicVariables(query).then(function(variables){
                    
                    // populate list with results
                    $scope.lists.searchVariables = variables;
                    $scope.lists.list = $scope.lists.searchVariables;  
                    $scope.state.loading = false;           
                });
            }
        };

    });