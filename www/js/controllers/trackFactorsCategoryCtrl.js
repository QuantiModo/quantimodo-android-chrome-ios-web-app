angular.module('starter')

    // Controls the Track Factors Page
    .controller('TrackFactorsCategoryCtrl', function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading,
                                                     authService, measurementService, $state, $rootScope, $stateParams,
                                                     utilsService, localStorageService, $filter, $ionicScrollDelegate,
                                                        variableCategoryService, ionicTimePicker, variableService){

        $scope.controller_name = "TrackFactorsCategoryCtrl";

        var variableCategoryName = $stateParams.variableCategoryName;
        var variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);

        $scope.state = {
            showVariableSearchCard: true,
            showAddVariableButton: false,
            showCategoryAsSelector: false,
            variableSearchResults : [],
            variableCategoryName: variableCategoryName,
            variableCategoryObject : variableCategoryObject,
            // variables
            variableName : "",
            helpText: variableCategoryObject.helpText
        };

        if(variableCategoryName){
            $scope.state.trackFactorsPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
            $scope.state.title = $filter('wordAliases')('Track') + " " + $filter('wordAliases')(variableCategoryName);
        } else {
            $scope.state.trackFactorsPlaceholderText = "Search for a variable here...";
            $scope.state.title = $filter('wordAliases')('Track');
        }
        
        // when an old measurement is tapped to remeasure
        $scope.selectVariable = function(variableObject){
            $state.go('app.measurementAdd', 
                {
                    variableObject : variableObject,
                    fromState : $state.current.name
                }
            );
        };
        
        $scope.init = function(){
            $scope.state.loading = true;
            utilsService.loadingStart();
            populateVariableSearchList();
            console.log("need to log in");
            utilsService.showLoginRequiredAlert($scope.login);
            $ionicLoading.hide();
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
        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);
        
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

    });