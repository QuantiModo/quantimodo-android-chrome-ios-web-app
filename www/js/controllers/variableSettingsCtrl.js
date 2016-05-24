angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading, authService,
                                             measurementService, $state, $rootScope, utilsService, localStorageService,
                                                $filter, $stateParams, $ionicHistory, variableService){

        $scope.controller_name = "VariableSettingsCtrl";

        // state
        $scope.state = {
            // category object,
            unitCategories : {},
            searchedUnits : []
        };
        $scope.state.title = $stateParams.variableName + ' Variable Settings';
        $scope.state.variableName = $stateParams.variableName;
            
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
                utilsService.showAlert('Variable Name missing');
            } else {
                // add variable
                $ionicHistory.goBack();
            }
        };

        // constructor
        $scope.init = function(){
            $scope.loading = true;
            $scope.showLoader();
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                $scope.loading = true;
                $scope.state.sumAvg = "avg";
                variableService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $scope.state.variableObject = variableObject;
                    console.log(variableObject);
                    $scope.item = variableObject;
                    $scope.state.sumAvg = variableObject.combinationOperation === "MEAN"? "avg" : "sum";
                    $scope.state.variableCategory = variableObject.category;
                    $scope.state.selectedUnitAbbreviatedName = variableObject.abbreviatedUnitName;
                });
                $ionicLoading.hide();
            } 
        };
        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);

    }
    );