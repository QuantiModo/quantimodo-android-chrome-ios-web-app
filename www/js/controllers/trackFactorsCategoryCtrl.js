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
            searching: true,
            showVariableSearchCard: false,
            showAddVariableButton: false,
            showVariableCategorySelector: false,
            variableSearchResults : [],
            variableCategoryName: variableCategoryName,
            variableCategoryObject : variableCategoryObject,
            // variables
            variableName : "",
            helpText: variableCategoryObject.helpText,
            variableSearchQuery: ''
        };

        if ($stateParams.reminderSearch) {
            if(variableCategoryName){
                $scope.state.variableSearchPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
                $scope.state.title = $filter('wordAliases')('Add') + " " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Reminder";
            } else {
                $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
                $scope.state.title = $filter('wordAliases')('Add Reminder');
            }
        }
        else if ($stateParams.variableSearch) {
            $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
            $scope.state.title = $filter('wordAliases')('Variables');
        }
        else {
            if(variableCategoryName){
                $scope.state.variableSearchPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
                $scope.state.title = $filter('wordAliases')('Record') + " " + $filter('wordAliases')(variableCategoryName);
            } else {
                $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
                $scope.state.title = $filter('wordAliases')('Record a Measurement');
            }
        }
        
        
        // when an old measurement is tapped to remeasure
        $scope.selectVariable = function(variableObject) {
            if ($stateParams.reminderSearch) {
                $state.go('app.reminderAdd',
                    {
                        variableObject: variableObject,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }
            else if ($stateParams.variableSearch) {
                $state.go('app.variables',
                    {
                        variableName: variableObject.name,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }
            else {
                $state.go('app.measurementAdd',
                    {
                        variableObject : variableObject,
                        fromState : $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }

        };
        
        $scope.init = function(){
            $scope.loading = true;
            $scope.showLoader();
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                $scope.state.showVariableSearchCard = true;
                populateUserVariables();
                $ionicLoading.hide();
            } 
        };

        // when a query is searched in the search box
        $scope.onVariableSearch = function(){
            console.log("Search: ", $scope.state.variableSearchQuery);
            if($scope.state.variableSearchQuery.length > 2){
                $scope.state.showResults = true;
                $scope.state.searching = true;
                variableService.searchVariablesIncludePublic($scope.state.variableSearchQuery, $scope.state.variableCategoryName)
                    .then(function(variables){
                        // populate list with results
                        $scope.state.showAddVariableButton = false;
                        $scope.state.showResults = true;
                        $scope.state.variableSearchResults = variables;
                        $scope.state.searching = false;
                        if(variables.length < 1){
                            $scope.state.showAddVariableButton = true;
                            if ($stateParams.reminderSearch) {
                                $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery +
                                    ' reminder';
                            }
                            else {
                                $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery +
                                    ' measurement';
                            }

                        }
                    });
            }
        };

        var populateUserVariables = function(){
            $scope.state.showAddVariableButton = false;
            $scope.state.searching = true;
            if($stateParams.variableCategoryName){
                $scope.showLoader('Fetching most recent ' +
                    $filter('wordAliases')($stateParams.variableCategoryName.toLowerCase()) + '...');
            } else {
                $scope.showLoader('Fetching most recent variables...');
            }
            variableService.getUserVariablesByCategory($scope.state.variableCategoryName)
                .then(function(variables){
                    $scope.state.showResults = true;
                    $scope.state.variableSearchResults = variables;
                    $scope.state.searching = false;
                    if(!$scope.state.variableCategoryName){
                        $scope.state.showVariableCategorySelector = true;
                    }
                    $ionicLoading.hide();
                    $scope.loading = false;
                    $scope.state.showSearchBox = true;
                });
        };

        // when add new variable is tapped
        $scope.addNewVariable = function(){
            
            var variableObject = {};
            variableObject.name = $scope.state.variableSearchQuery;
            if($scope.state.variableCategoryName){
                variableObject.variableCategoryName = $scope.state.variableCategoryName;
            }

            if ($stateParams.reminderSearch) {
                $state.go('app.reminderAdd',
                    {
                        variableObject : variableObject,
                        fromState : $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }
            else {
                $state.go('app.measurementAdd',
                    {
                        variableObject : variableObject,
                        fromState : $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }

        };

        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);


    });