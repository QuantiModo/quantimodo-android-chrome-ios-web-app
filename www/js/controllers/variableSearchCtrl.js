angular.module('starter')
    .controller('VariableSearchCtrl', function($scope, $state, $rootScope, $stateParams, $filter, localStorageService, 
                                               authService,  variableCategoryService, variableService, 
                                               reminderService) {

        $scope.controller_name = "VariableSearchCtrl";

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
            variableSearchQuery: '',
            trackingReminder: {}
        };

        if(variableCategoryName && variableCategoryName !== 'Anything'){
            $scope.state.variableSearchPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
        } else {
            $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
        }

        if ($stateParams.nextState === "app.reminderAdd") {
            if(variableCategoryName && variableCategoryName !== 'Anything'){
                $scope.state.title = $filter('wordAliases')('Add') + " " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Reminder";
            } else {
                $scope.state.title = $filter('wordAliases')('Add Reminder');
            }
        }

        if ($stateParams.nextState === "app.favoriteAdd") {
            if(variableCategoryName && variableCategoryName !== 'Anything'){
                $scope.state.title = $filter('wordAliases')('Add') + " " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Favorite";
            } else {
                $scope.state.title = $filter('wordAliases')('Add Favorite');
            }
        }


        else if ($stateParams.doNotIncludePublicVariables || $stateParams.nextState === "app.variables") {
            $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
            $scope.state.title = $filter('wordAliases')('Your Variables');
        }
        else if ($stateParams.nextState === "app.measurementAdd"){
            if(variableCategoryName && variableCategoryName !== 'Anything'){
                $scope.state.variableSearchPlaceholderText = "Search for a " +  $filter('wordAliases')(pluralize(variableCategoryName, 1).toLowerCase()) + " here...";
                $scope.state.title = $filter('wordAliases')('Record') + " " + $filter('wordAliases')(variableCategoryName);
            } else {
                $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
                $scope.state.title = $filter('wordAliases')('Record a Measurement');
            }
        }
        
        
        // when an old measurement is tapped to remeasure
        $scope.selectVariable = function(variableObject) {

            if($state.current.name === 'app.favoriteSearch'){
                $scope.state.trackingReminder.variableId = variableObject.id;
                $scope.state.trackingReminder.reminderFrequency = 0;
                $scope.state.trackingReminder.variableName = variableObject.name;
                $scope.state.trackingReminder.abbreviatedUnitName = variableObject.abbreviatedUnitName;
                $scope.state.trackingReminder.variableDescription = variableObject.description;
                $scope.state.trackingReminder.variableCategoryName = variableObject.variableCategoryName;


                if($scope.state.trackingReminder.abbreviatedUnitName === '/5'){
                    $scope.state.trackingReminder.defaultValue = 3;
                    localStorageService.replaceElementOfItemById('trackingReminders', $scope.state.trackingReminder);
                    reminderService.addNewReminder($scope.state.trackingReminder)
                        .then(function(){
                            console.debug("Saved Reminder", $scope.state.trackingReminder);
                        }, function(err){
                            console.error('Failed to add Reminder!',  $scope.state.trackingReminder);
                        });
                    $state.go('app.favorites',
                        {
                            trackingReminder : $scope.state.trackingReminder,
                            fromState : $state.current.name,
                            fromUrl: window.location.href
                        }
                    );
                } else {
                    $state.go($stateParams.nextState,
                        {
                            variableObject : variableObject,
                            fromState : $state.current.name,
                            fromUrl: window.location.href,
                        }
                    );
                }

            } else if ($stateParams.doNotIncludePublicVariables) { // implies going to variable page
                //TODO: Figure out why this is causing a duplicate error on variable searches
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
                        fromUrl: window.location.href,
                        variableCategoryName: $stateParams.variableCategoryName
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
                            // Populate list with results
                            $scope.state.showAddVariableButton = false;
                            $scope.state.variableSearchResults = variables;
                            $scope.state.searching = false;
                            // Check if exact match is present in results
                            var resultIndex = 0;
                            var found = false;
                            while (!found && resultIndex < $scope.state.variableSearchResults.length) {
                                if ($scope.state.variableSearchResults[resultIndex].name.toLowerCase() ===
                                    $scope.state.variableSearchQuery.toLowerCase()) {
                                    found = true;
                                }
                                else {
                                    resultIndex++;
                                }
                            }
                            // If no results or no exact match, show "+ Add [variable]" button for query
                            // Also, can only favorite existing variables
                            if((variables.length < 1 || !found) && $stateParams.nextState !== "app.favoriteAdd"){
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
            if (variableCategoryName === 'Anything') {
                variableCategoryName = null;
            }
            
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
            if (variableCategoryName === 'Anything') {
                variableCategoryName = null;
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
            if($scope.state.variableCategoryName && $scope.state.variableCategoryName !== 'Anything'){
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
        $scope.$on('$ionicView.enter', function(e) {
            $scope.hideLoader();
            $scope.init();
        });


    });