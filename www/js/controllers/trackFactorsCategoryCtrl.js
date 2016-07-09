angular.module('starter')

    // Controls the Track Factors Page and the search bar
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
            $scope.state.title = $filter('wordAliases')('Your Variables');
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
            //TODO: Figure out why this is causing a duplicate error on variable searches
            //localStorageService.replaceElementOfItemById('userVariables', variableObject);
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
                        variableObject: variableObject,
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
            Bugsnag.context = "variableSearch";

            if (typeof analytics !== 'undefined')  { analytics.trackView("Variable Search Controller"); }
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                $scope.state.showVariableSearchCard = true;
                if($scope.state.variableSearchResults < 10){
                    populateUserVariables();
                }
            } 
        };

        // when a query is searched in the search box
        $scope.onVariableSearch = function(){
            console.log("Search: ", $scope.state.variableSearchQuery);
            if($scope.state.variableSearchQuery.length > 2){
                $scope.state.searching = true;
                if ($stateParams.variableSearch) { // on variable search page, only show user's variables
                    variableService.searchUserVariables($scope.state.variableSearchQuery, $scope.state.variableCategoryName)
                        .then(function(variables){
                            // populate list with results
                            $scope.state.showAddVariableButton = false;
                            $scope.state.variableSearchResults = variables;
                            $scope.state.searching = false;
                            if(variables.length < 1){
                                $scope.state.showAddVariableButton = false;
                            }
                        });
                }
                else { // on add reminder or record measurement search pages; include public variables
                    variableService.searchVariablesIncludePublic($scope.state.variableSearchQuery, $scope.state.variableCategoryName)
                        .then(function(variables){
                            // populate list with results
                            $scope.state.showAddVariableButton = false;
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
            }
            else {
                $scope.state.variableSearchResults = null;
                var reset = true;
                populateUserVariables(reset);
            }
        };

        var populateUserVariables = function(reset){
            if($scope.state.variableSearchResults && $scope.state.variableSearchResults.length > 1){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }

            variableService.getUserVariables($scope.state.variableCategoryName)
                .then(function(userVariables){
                    $scope.state.variableSearchResults = userVariables;
                    $scope.state.searching = false;
                    if(!$scope.state.variableCategoryName){
                        $scope.state.showVariableCategorySelector = true;
                    }
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