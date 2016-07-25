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

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
            // FIXME Test this
        };

        $scope.resetToDefaultSettings = function() {
            // FIXME get default settings from API
        };

        $scope.deleteAllMeasurementsForVariable = function() {
            // FIXME prompt to confirm or cancel
            // FIXME delete all variables from server
        };

        $scope.save = function(){
            var maximumAllowedValue = $scope.state.maximumAllowedValue;
            var minimumAllowedValue = $scope.state.minimumAllowedValue;
            if (maximumAllowedValue === "" || maximumAllowedValue === null) {
                maximumAllowedValue = "Infinity";
            }
            if (minimumAllowedValue === "" || minimumAllowedValue === null) {
                minimumAllowedValue = "-Infinity";
            }

            // populate params
            var params = {
                user: $scope.variableObject.userId,
                variableId: $scope.variableObject.id,
                durationOfAction: $scope.state.durationOfAction*60*60,
                //fillingValue
                //joinWith
                maximumAllowedValue: maximumAllowedValue,
                minimumAllowedValue: minimumAllowedValue,
                onsetDelay: $scope.state.delayBeforeOnset*60*60,
                //experimentStartTime
                //experimentEndTime
            };
            console.log(params);
            variableService.postUserVariable(params).then(function() {
                console.log("success");
            },
            function() {
                console.log("error");
            });

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
                    $scope.variableObject = variableObject;
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