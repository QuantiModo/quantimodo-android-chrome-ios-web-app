angular.module('starter')
    
    // Controls the Track Factors Page
    .controller('TrackFactorsCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading, authService, measurementService, $state, $rootScope,utilsService){

        $scope.controller_name = "TrackFactorsCtrl";

        /*// if logged in
        if(!$scope.isLoggedIn){
            //$state.go('app.welcome');
            // app wide signal to sibling controllers that the state has changed
            utilsService.showLoginRequiredAlert($scope.login);
            $rootScope.$broadcast('transition');
        }*/

        // flags
        $scope.showTrack = true;
        $scope.showAddVariable = false;
        $scope.showAddMeasurement = false;
        $scope.showCategoryAsSelector = true;

        // lists
        $scope.list = [];
        $scope.userVariables = [];
        $scope.searchVariables = [];
        $scope.categories = [];
        
        // category object
        $scope.categoryValues = {};
        
        // variables
        $scope.variable_category = "";
        $scope.variable_name = "";
        $scope.factor = "factors";
        $scope.help_text = "What do you want to track?";

        // default operation
        $scope.sumAvg = "avg";
        $scope.variable_value = "";

        // alert box
        $scope.showAlert = function(title, template) {
           var alertPopup = $ionicPopup.alert({
             title: title,
             template: template
           });
        };

        // when a unit is changed
        var set_unit = function(unit){
            console.log(unit);
            
            // filter the unit object from all units
            var unit_obj = $scope.units.filter(function(x){return x.abbreviatedName === unit})[0];
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
                    $scope.selected_sub = unit_obj.abbreviatedName;
                    
                    // redraw view
                    $scope.$apply();
                },100);
            
            },100);
        };

        // when an old measurement is tapped to remeasure
        $scope.measure = function(item){
            console.log(item);
            $scope.item = item;

            // set values in form
            $scope.sumAvg = item.combinationOperation == "MEAN"? "avg" : "sum";
            $scope.variable_category = item.category;
            $scope.variable_name = item.name;
            set_unit(item.abbreviatedUnitName);

            // set flags
            $scope.showTrack = false;
            $scope.showAddVariable = false;
            $scope.showAddMeasurement = true;
            
            // update time in the datepicker
            $scope.slots = {epochTime: new Date().getTime()/1000, format: 24, step: 1};
        };

        // when add new variable is tapped
        $scope.add_variable = function(){
            console.log("add variable");

            // set flags
            $scope.showTrack = false;
            $scope.showAddVariable = true;
            $scope.showAddMeasurement = true;

            // set default
            $scope.variable_name = "";
        };

        // cancel activity
        $scope.cancel = function(){
            
            // show list again
            $scope.showAddVariable = false;
            $scope.showAddMeasurement = false;
            $scope.showTrack = true;
        };

        // completed adding and/or measuring
        $scope.done = function(){

            // populate params
            var params = {
                variable : $scope.variable_name || jQuery('#variable_name').val(),
                value : $scope.variable_value || jQuery('#variable_value').val(),
                epoch : $scope.slots.epochTime * 1000,
                unit : $scope.selected_sub,
                category : $scope.variable_category,
                isAvg : $scope.sumAvg === "avg"? true : false
            };

            console.log(params);

            // check if it is a new variable
            if($scope.showAddVariable){

                // validation
                if(params.variable_name === ""){
                    $scope.showAlert('Variable Name missing');
                } else {
                    
                    // add variable
                    measurementService.post_tracking_measurement(params.epoch, params.variable, params.value, params.unit, params.isAvg, params.category);

                    $scope.showAlert('Added Variable');

                    // set flags
                    $scope.showAddVariable = false;
                    $scope.showAddMeasurement = false;
                    $scope.showTrack = true;

                    // refresh the last updated at from api
                    setTimeout($scope.init, 200);
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
                    $scope.showAddVariable = false;
                    $scope.showAddMeasurement = false;
                    $scope.showTrack = true;
                    
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
                console.log('changed to ', $scope.categoryValues[$scope.selected_unit_category][0].abbreviatedName);
                $scope.selected_sub = $scope.categoryValues[$scope.selected_unit_category][0].abbreviatedName;
                $scope.$apply();
            }, 100);
        };

        // when a unit is selected
        $scope.unit_selected = function(unit){
            console.log("selecting_unit",unit);

            // update viewmodel
            $scope.unit_text = unit.name;
            $scope.show_units = false;
            $scope.selected_sub = unit.abbreviatedName;


        };

        // constructor
        $scope.init = function(){
            
            // $ionicLoading.hide();
            $scope.loading = true;
            $scope.userVariables = [];
            $scope.searchVariables = [];

            // data default
            $scope.categories = [];
            $scope.categoryValues = {};
            
            // variable
            $scope.variable_category = "";
            $scope.variable_name = "";

            // defaults
            $scope.sumAvg = "avg";
            $scope.variable_value = "";
            $scope.variable_value = "";
            $scope.unit_text = "";
            $scope.selected_sub = "";

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
                    $scope.loading = false;
                    $scope.userVariables = variables;
                    $scope.list = [];
                    
                    // populate list
                    $scope.list = $scope.list.concat(variables);
                    
                    // show list
                    $ionicLoading.hide();
                });

                // get variabls cateogries
                measurementService.getVariableCategories().then(function(variableCategories){
                    
                    // update viewmodel
                    $scope.variableCategories = variableCategories;
                    console.log("got variable categories", variableCategories);

                    // hackish way to update category
                    setTimeout(function(){
                        $scope.variable_category = config.appSettings.tracking_factor;
                        
                        // redraw everythign
                        $scope.$apply();
                    },100)

                    // hide spinner
                    $ionicLoading.hide();
                    
                });

                // get units
                measurementService.getUnits().then(function(units){
                    
                    $scope.units = units;

                    // populate categoryValues
                    for(var i in units){
                        if($scope.categories.indexOf(units[i].category) === -1){
                            $scope.categories.push(units[i].category);
                            $scope.categoryValues[units[i].category] = [{name : units[i].name, abbreviatedName: units[i].abbreviatedName}];
                        } else {
                            $scope.categoryValues[units[i].category].push({name: units[i].name, abbreviatedName: units[i].abbreviatedName});
                        }
                    }

                    // set default unit category
                    $scope.selected_unit_category = 'Duration';
                    
                    // set first sub unit of selected category
                    $scope.selected_sub = $scope.categoryValues[$scope.selected_unit_category][0].abbreviatedName;
                    
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
        $scope.slots = {epochTime: new Date().getTime()/1000, format: 24, step: 1};

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

            $scope.loading = true;

            if(query == ''){
                // if search is cleared 
                
                console.log('yay');

                // repopulate to last reported variables
                $scope.list = $scope.userVariables;

                // update view
                $scope.loading = false;
                $scope.$apply();
            } else {

                // search server for the query
                measurementService.getPublicVariables(query).then(function(variables){
                    
                    // populate list with results
                    $scope.searchVariables = variables;
                    $scope.list = $scope.searchVariables;  
                    $scope.loading = false;           
                });
            }
        };

        // delay function for searching variables to minimize requests on the server
        var delay = (function(){
          var timer = 0;
          return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
          };
        })();
        

        // $scope.init();
    });