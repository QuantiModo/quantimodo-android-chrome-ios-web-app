angular.module('starter')
    .controller('VariableSearchCtrl', function($scope, $state, $rootScope, $stateParams, $filter, localStorageService, 
                                               authService,  variableCategoryService, variableService) {

        $scope.controller_name = "VariableSearchCtrl";

        $scope.state = {
            showVariableSearchCard: false,
            showAddVariableButton: false,
            showVariableCategorySelector: false,
            variableSearchResults : [],
            variableCategoryName: $stateParams.variableCategoryName,
            helpText: variableCategoryService.getVariableCategoryInfo($stateParams.variableCategoryName).helpText,
            variableSearchQuery : {name:''},
            trackingReminder: {}
        };
        
        // when an old measurement is tapped to remeasure
        $scope.selectVariable = function(variableObject) {
            console.debug($state.current.name + ": " + "$scope.selectVariable: " + JSON.stringify(variableObject));
            if(variableObject.lastValue !== null){
                localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('userVariables', variableObject);
            }
            localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('commonVariables', variableObject);

            if($state.current.name === 'app.favoriteSearch'){
                $scope.addToFavoritesUsingVariableObject(variableObject);
            } else {
                $state.go($stateParams.nextState,
                    {
                        variableObject : variableObject,
                        fromState : $state.current.name,
                        fromUrl: window.location.href,
                        variableCategoryName: $scope.state.variableCategoryName
                    });
            }
        };

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

            $scope.state.variableSearchPlaceholderText = "Search for a variable here...";
            $scope.state.title = "Select Variable";

            if ($scope.state.variableCategoryName && $scope.state.variableCategoryName !== 'Anything') {
                $scope.state.variableSearchPlaceholderText = "Search for a " +
                    $filter('wordAliases')(pluralize($scope.state.variableCategoryName, 1).toLowerCase()) + " here...";
                $scope.state.title = "Select " + $filter('wordAliases')(pluralize($scope.state.variableCategoryName, 1));
            }

            $scope.showHelpInfoPopupIfNecessary();
            $scope.state.showVariableSearchCard = true;
            if($scope.state.variableSearchResults.length < 10){
                populateUserVariables();
            }

        };

        // when a query is searched in the search box
        $scope.onVariableSearch = function(){
            var params;
            $scope.state.showAddVariableButton = false;
            console.log($state.current.name + ": " + "Search term: ", $scope.state.variableSearchQuery.name);
            if($scope.state.variableSearchQuery.name.length > 2){
                $scope.state.searching = true;
                if ($stateParams.doNotIncludePublicVariables) { // on variable search page, only show user's variables
                    params = {
                        'limit' : 100,
                        'includePublic' : false,
                        'variableCategoryName' : $scope.state.variableCategoryName,
                        'manualTracking': true
                    };
                    variableService.searchUserVariables($scope.state.variableSearchQuery.name, params)
                        .then(function(variables){
                            console.debug($state.current.name + ": " + "$scope.onVariableSearch: Populating list with " +
                                "variableService.searchUserVariables results ");
                            $scope.state.showAddVariableButton = false;
                            $scope.state.variableSearchResults = variables;
                            $scope.state.searching = false;
                        });
                }
                else { // on add reminder or record measurement search pages; include public variables
                    params = {
                        'limit' : 100,
                        'includePublic' : true,
                        'variableCategoryName' : $scope.state.variableCategoryName,
                        'manualTracking': true
                    };
                    variableService.searchUserVariables($scope.state.variableSearchQuery.name, params)
                        .then(function(variables){
                            console.debug($state.current.name + ": " + "$scope.onVariableSearch: Populating list with " +
                                "variableService.searchVariablesIncludePublic results ");
                            $scope.state.showAddVariableButton = false;
                            $scope.state.variableSearchResults = variables;
                            $scope.state.searching = false;
                            // Check if exact match is present in results
                            var resultIndex = 0;
                            var found = false;
                            while (!found && resultIndex < $scope.state.variableSearchResults.length) {
                                if ($scope.state.variableSearchResults[resultIndex].name.toLowerCase() ===
                                    $scope.state.variableSearchQuery.name.toLowerCase()) {
                                    found = true;
                                }
                                else {
                                    resultIndex++;
                                }
                            }
                            // If no results or no exact match, show "+ Add [variable]" button for query
                            // Also, can only favorite existing variables
                            if((variables.length < 1 || !found) && $stateParams.nextState !== "app.favoriteAdd"){
                                console.debug($state.current.name + ": " + "$scope.onVariableSearch: Set showAddVariableButton to true");
                                $scope.state.showAddVariableButton = true;
                                if ($stateParams.nextState === "app.reminderAdd") {
                                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name +
                                        ' reminder';
                                }
                                else if ($stateParams.nextState === "app.measurementAdd") {
                                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name +
                                        ' measurement';
                                }
                                else {
                                    $scope.state.addNewVariableButtonText = $scope.state.variableSearchQuery.name;
                                }

                            }
                        });
                }
            }
            else {
                populateUserVariables();
            }
        };


        var populateCommonVariables = function(){
            if ($scope.state.variableCategoryName === 'Anything') {
                $scope.state.variableCategoryName = null;
            }
            
            if($scope.state.variableSearchQuery.name.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }

            var commonVariables = localStorageService.getElementsFromItemWithFilters(
                'commonVariables', 'variableCategoryName', $scope.state.variableCategoryName);
            if(commonVariables && commonVariables.length > 0){
                if($scope.state.variableSearchQuery.name.length < 3 && $scope.state.variableSearchResults.length < 1) {
                    $scope.state.variableSearchResults = $scope.state.variableSearchResults.concat(commonVariables);
                    $scope.state.searching = false;
                }
            } else {
                if($scope.state.variableSearchQuery.name.length < 3 && $scope.state.variableSearchResults.length < 1) {
                    if(!$rootScope.syncingCommonVariables) {
                        variableService.refreshCommonVariables().then(function () {
                            if ($scope.state.variableSearchQuery.name.length < 3 && $scope.state.variableSearchResults.length < 1) {
                                commonVariables = localStorageService.getElementsFromItemWithFilters(
                                    'commonVariables', 'variableCategoryName', $scope.state.variableCategoryName);
                                if(commonVariables){
                                    $scope.state.variableSearchResults = $scope.state.variableSearchResults.concat(commonVariables);
                                }
                                $scope.state.searching = false;
                            }
                        });
                    }
                }
            }
        };

        var populateUserVariables = function(){
            if($scope.state.variableSearchQuery.name.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }
            if ($scope.state.variableCategoryName === 'Anything') {
                $scope.state.variableCategoryName = null;
            }

            var userVariables = localStorageService.getElementsFromItemWithFilters(
                'userVariables', 'variableCategoryName', $scope.state.variableCategoryName);
            if(userVariables && userVariables.length > 0){
                if($scope.state.variableSearchQuery.name.length < 3) {
                    $scope.state.variableSearchResults = userVariables;
                    $scope.state.searching = false;
                }
            } else {
                if($scope.state.variableSearchResults.length < 1 && !$stateParams.doNotIncludePublicVariables){
                    populateCommonVariables();
                }
                if($scope.state.variableSearchQuery.name.length < 3 && $scope.state.variableSearchResults.length < 1) {
                    if(!$rootScope.syncingUserVariables) {
                        variableService.refreshUserVariables().then(function () {
                            if ($scope.state.variableSearchQuery.name.length < 3 && $scope.state.variableSearchResults.length < 1) {
                                userVariables = localStorageService.getElementsFromItemWithFilters(
                                    'userVariables', 'variableCategoryName', $scope.state.variableCategoryName);
                                if(userVariables){
                                    $scope.state.variableSearchResults = userVariables;
                                }
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
            variableObject.name = $scope.state.variableSearchQuery.name;
            if($scope.state.variableCategoryName && $scope.state.variableCategoryName !== 'Anything'){
                variableObject.variableCategoryName = $scope.state.variableCategoryName;
            }

            console.debug($state.current.name + ": " + "$scope.addNewVariable: " + JSON.stringify(variableObject));
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
        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });


        $scope.matchEveryWord = function() {
            return function( item ) {
                var variableObjectAsString = JSON.stringify(item).toLowerCase();
                var lowercaseVariableSearchQuery = $scope.state.variableSearchQuery.name.toLowerCase();

                var filterBy = lowercaseVariableSearchQuery.split(/\s+/);

                if(lowercaseVariableSearchQuery){
                    if(!filterBy.length){
                        return true;
                    }
                } else {
                    return true;
                }

                return filterBy.every(function (word){
                    var exists = variableObjectAsString.indexOf(word);
                    if(exists !== -1){
                        return true;
                    }
                });

            };
        };


    });