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
            // FIXME Write this function

        };

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
            // FIXME Test this
        };


        $scope.done = function(){
            // FIXME This doesn't actually submit anything to API
            // FIXME Call updateDisplayedVariableSettings (and rename)
            // FIXME And we need more params

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
            Bugsnag.context = "variableSettings";
            $scope.loading = true;
            $scope.showLoader();
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  { analytics.trackView("Variable Settings Controller"); }
            if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                $scope.loading = true;
                $scope.state.sumAvg = "avg"; // FIXME should this be the default?
                variableService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $scope.state.variableObject = variableObject;
                    console.log(variableObject);
                    $scope.item = variableObject;
                    $scope.state.sumAvg = variableObject.combinationOperation === "MEAN"? "avg" : "sum";
                    $scope.state.variableCategory = variableObject.category;
                    if (variableObject.abbreviatedUnitName === "/5") {
                        // FIXME hide other fixed range variables as well
                        $scope.state.hideMinMax = true;
                    }
                    else {
                        if (variableObject.minimumAllowedValue !== "-Infinity") {
                            $scope.state.minimumAllowedValue = variableObject.minimumAllowedValue;
                        }
                        else {
                            $scope.state.minimumAllowedValue = "";
                        }
                        if (variableObject.maximumAllowedValue !== "Infinity") {
                            $scope.state.maximumAllowedValue = variableObject.maximumAllowedValue;
                        }
                        else {
                            $scope.state.maximumAllowedValue = "";
                        }
                    }

                    $scope.state.delayBeforeOnset = variableObject.onsetDelay/(60*60); // seconds -> hours
                    $scope.state.durationOfAction = variableObject.durationOfAction/(60*60); // seconds - > hours

                });
                $ionicLoading.hide();
            } 
        };
        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);

    }
    );