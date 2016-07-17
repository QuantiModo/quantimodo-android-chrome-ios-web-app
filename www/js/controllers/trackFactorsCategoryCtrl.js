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

        if ($stateParams.nextState === "app.reminderAdd") {
            if(variableCategoryName){
                $scope.state.variableSearchPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
                $scope.state.title = $filter('wordAliases')('Add') + " " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Reminder";
            } else {
                $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
                $scope.state.title = $filter('wordAliases')('Add Reminder');
            }
        }
        else if ($stateParams.doNotIncludePublicVariables || $stateParams.nextState === "app.variables") {
            $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
            $scope.state.title = $filter('wordAliases')('Your Variables');
        }
        else if ($stateParams.nextState === "app.measurementAdd"){
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
            if ($stateParams.doNotIncludePublicVariables) { // implies going to variable page
                $state.go('app.variables',
                    {
                        variableName: variableObject.name,
                        variableObject: variableObject,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    }
                ).then(function() {
                    console.log("Transition to app.variables finished");
                });
            }
            else {
                $state.go($stateParams.nextState,
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
                if ($stateParams.doNotIncludePublicVariables) { // on variable search page, only show user's variables
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
                                if ($stateParams.nextState === "app.reminderAdd") {
                                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery +
                                        ' reminder';
                                }
                                else if ($stateParams.nextState === "app.measurementAdd") {
                                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery +
                                        ' measurement';
                                }
                                else {
                                    $scope.state.addNewVariableButtonText = $scope.state.variableSearchQuery;
                                }

                            }
                        });
                }
            }
            else {
                //$scope.state.variableSearchResults = null;
                //var reset = true;
                populateUserVariables();
            }
        };


        var populateCommonVariables = function(){
            if($scope.state.variableSearchQuery.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }

            var commonVariables = localStorageService.getElementsFromItemWithFilters(
                'commonVariables', 'variableCategoryName', variableCategoryName);
            if(commonVariables && commonVariables.length > 0){
                if($scope.state.variableSearchQuery.length < 3 && $scope.state.variableSearchResults.length < 1) {
                    $scope.state.variableSearchResults = commonVariables;
                    $scope.state.searching = false;
                }
            } else {
                if($scope.state.variableSearchQuery.length < 3 && $scope.state.variableSearchResults.length < 1) {
                    if(!$rootScope.syncingCommonVariables) {
                        variableService.refreshCommonVariables().then(function () {
                            if ($scope.state.variableSearchQuery.length < 3 && $scope.state.variableSearchResults.length < 1) {
                                $scope.state.variableSearchResults = localStorageService.getElementsFromItemWithFilters(
                                    'commonVariables', 'variableCategoryName', variableCategoryName);
                                $scope.state.searching = false;
                            }
                        });
                    }
                }
            }
        };

        var populateUserVariables = function(reset){
            if($scope.state.variableSearchQuery.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }

            var userVariables = localStorageService.getElementsFromItemWithFilters(
                'userVariables', 'variableCategoryName', variableCategoryName);
            if(userVariables && userVariables.length > 0){
                if($scope.state.variableSearchQuery.length < 3) {
                    $scope.state.variableSearchResults = userVariables;
                    $scope.state.searching = false;
                }
            } else {
                if($scope.state.variableSearchResults.length < 1 && !$stateParams.doNotIncludePublicVariables){
                    populateCommonVariables();
                }
                if($scope.state.variableSearchQuery.length < 3 && $scope.state.variableSearchResults.length < 1) {
                    if(!$rootScope.syncingUserVariables) {
                        variableService.refreshUserVariables().then(function () {
                            if ($scope.state.variableSearchQuery.length < 3 && $scope.state.variableSearchResults.length < 1) {
                                $scope.state.variableSearchResults = localStorageService.getElementsFromItemWithFilters(
                                    'userVariables', 'variableCategoryName', variableCategoryName);
                                $scope.state.searching = false;
                            }
                        });
                    }
                }
            }
            
        };

        // when add new variable is tapped
        $scope.addNewVariable = function(){
            
            var variableObject = {};
            variableObject.name = $scope.state.variableSearchQuery;
            if($scope.state.variableCategoryName){
                variableObject.variableCategoryName = $scope.state.variableCategoryName;
            }

            if ($stateParams.nextState) {
                $state.go($stateParams.nextState,
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