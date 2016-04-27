angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading, authService,
                                             measurementService, $state, $rootScope, utilsService, localStorageService,
                                                $filter, $stateParams, $ionicHistory){

        $scope.controller_name = "VariableSettingsCtrl";

        // state
        $scope.state = {
            // category object,
            unitCategories : {},
            searchedUnits : []
        };
        $scope.state.title = $stateParams.variableName + ' Variable Settings';
        $scope.state.variableName = $stateParams.variableName;

        // alert box
        $scope.showAlert = function(title, template) {
            var alertPopup = $ionicPopup.alert({
                cssClass : 'calm',
                okType : 'button-calm',
                title: title,
                template: template
            });
        };

        $scope.updateDisplayedVariableSettings = function(selectedVariable){

        };

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
        };


        $scope.done = function(){

            // populate params
            var params = {
                variable : $scope.state.variableName || jQuery('#variableName').val(),
                unit : $scope.state.abbreviatedUnitName,
                category : $scope.state.variableCategory,
                isAvg : $scope.state.sumAvg === "avg"
            };

            console.log(params);

            // validation
            if (params.variableName === "") {
                $scope.showAlert('Variable Name missing');
            } else {
                // add variable
                measurementService.post_tracking_measurement(params.epoch, params.variable, params.value, params.unit, params.isAvg, params.category, params.note, true)
                    .then(function ()
                    {
                        $scope.showAlert('Added Variable');
                        // set flags
                        $scope.state.showAddVariable = false;
                        $scope.state.showAddMeasurement = false;
                        $scope.state.showVariableSearchCard = true;
                        // refresh the last updated at from api
                        setTimeout($scope.init, 200);
                    }, function (err) {
                        $scope.showAlert(err);
                    }
                    );
                $ionicHistory.goBack();
            }
        };

        // constructor
        $scope.init = function(){
            
            // $ionicLoading.hide();
            $scope.state.loading = true;

            $scope.state.sumAvg = "avg";
            // show spinner
            $ionicLoading.show({
                noBackdrop: true,
                template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
            });  

            // get user token
            authService.getAccessTokenFromAnySource().then(function(){
                
                // get all variables
                measurementService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $scope.state.variableObject = variableObject;
                    console.log(variableObject);
                    $scope.item = variableObject;

                    // set values in form
                    $scope.state.sumAvg = variableObject.combinationOperation == "MEAN"? "avg" : "sum";
                    $scope.state.variableCategory = variableObject.category;
                    $scope.state.selectedUnitAbbreviatedName = variableObject.abbreviatedUnitName;
                });



            }, function(){
                console.log("need to log in");
                utilsService.showLoginRequiredAlert($scope.login);
                $ionicLoading.hide();
            });

            $ionicLoading.hide();

        };
        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);

    }
    );