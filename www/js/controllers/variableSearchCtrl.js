angular.module('starter')
    .controller('VariableSearchCtrl', function($scope, $state, $rootScope, $stateParams, $filter, localStorageService, 
                                               QuantiModo,  variableCategoryService, variableService, $timeout) {

        $scope.controller_name = "VariableSearchCtrl";

        $scope.state = {
            showAddVariableButton: false,
            showVariableCategorySelector: false,
            variableSearchResults : [],
            variableCategoryName: $stateParams.variableCategoryName,
            variableSearchQuery : {name:''},
            trackingReminder: {},
            noVariablesFoundCard: {
                show: false,
                title: 'No Variables Found'
            },
            searching: true,
            title : "Select Variable",
            variableSearchPlaceholderText: "Search for a variable here..."
        };

        $scope.selectVariable = function(variableObject) {
            console.debug($state.current.name + ": " + "$scope.selectVariable: " + JSON.stringify(variableObject));
            if(variableObject.lastValue !== null){
                localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('userVariables', variableObject);
            }
            localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('commonVariables', variableObject);

            if($state.current.name === 'app.favoriteSearch') {
                $scope.addToFavoritesUsingVariableObject(variableObject);
            } else if ($stateParams.nextState.indexOf('predictor') !== -1) {
                $state.go($stateParams.nextState, {requestParams: {effectVariableName: variableObject.name}});
            } else if ($stateParams.nextState.indexOf('outcome') !== -1) {
                $state.go($stateParams.nextState, {requestParams: {causeVariableName: variableObject.name}});
            } else {
                $rootScope.stateParams.variableObject = variableObject;
                $state.go($stateParams.nextState, $rootScope.stateParams);
            }
        };

        $scope.goToStateFromVariableSearch = function(stateName){
            $state.go(stateName, $stateParams);
        };

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.showHelpInfoPopupIfNecessary();
            if($scope.state.variableSearchResults.length < 10){
                populateUserVariables();
                populateCommonVariables();
            }
        };

        // when a query is searched in the search box
        $scope.onVariableSearch = function(){
            $scope.state.showAddVariableButton = false;
            console.debug($state.current.name + ": " + "Search term: ", $scope.state.variableSearchQuery.name);
            if($scope.state.variableSearchQuery.name.length > 2){
                $scope.state.searching = true;
                if (!$stateParams.variableSearchParameters.includePublic) { // on variable search page, only show user's variables
                    variableService.searchUserVariables($scope.state.variableSearchQuery.name, $stateParams.variableSearchParameters)
                        .then(function(variables){
                            $scope.state.showAddVariableButton = false;
                            $scope.state.variableSearchResults = variables;
                            $scope.state.searching = false;
                            if(!$scope.state.variableSearchResults){
                                $scope.state.noVariablesFoundCard.show = true;
                            } else {
                                $scope.state.noVariablesFoundCard.show = false;
                            }
                        });
                } else { // on add reminder or record measurement search pages; include public variables
                    variableService.searchUserVariables($scope.state.variableSearchQuery.name, $stateParams.variableSearchParameters)
                        .then(function(variables){
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
                                } else {
                                    resultIndex++;
                                }
                            }
                            // If no results or no exact match, show "+ Add [variable]" button for query
                            if((variables.length < 1 || !found)){
                                $scope.showSearchLoader = true;
                                $timeout(function () {
                                    if(!$scope.state.searching){
                                        $scope.showSearchLoader = false;
                                        console.debug($state.current.name + ": " + "$scope.onVariableSearch: Set showAddVariableButton to true");
                                        $scope.state.showAddVariableButton = true;
                                    }
                                }, 1000);
                                if ($stateParams.nextState === "app.reminderAdd") {
                                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name +
                                        ' reminder';
                                } else if ($stateParams.nextState === "app.measurementAdd") {
                                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name +
                                        ' measurement';
                                } else {
                                    $scope.state.addNewVariableButtonText = '+ ' + $scope.state.variableSearchQuery.name;
                                }
                            }
                        });
                }
            } else {
                populateUserVariables();
            }
        };

        $scope.$on('populateUserVariables', function(){
            console.debug('populateUserVariables broadcast received..');
            populateUserVariables();
        });

        var populateCommonVariables = function(){
            if(!$stateParams.variableSearchParameters.includePublic) {
                return;
            }
            if($scope.state.variableSearchQuery.name.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }
            variableService.getCommonVariables($stateParams.commonVariableSearchParameters).then(function (commonVariables) {
                if(commonVariables && commonVariables.length > 0){
                    if($scope.state.variableSearchQuery.name.length < 3) {
                        $scope.state.variableSearchResults = $scope.state.variableSearchResults.concat(commonVariables);
                        $scope.state.searching = false;
                    }
                }
            }, function (error) {
                console.error(error);
            });
        };

        var populateUserVariables = function(){
            if($scope.state.variableSearchQuery.name.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){
                $scope.state.searching = true;
            }

            variableService.getUserVariables($stateParams.variableSearchParameters).then(function (userVariables) {
                if(userVariables && userVariables.length > 0){
                    if($scope.state.variableSearchQuery.name.length < 3) {
                        // Put user variables at top of list
                        var existingResults = $scope.state.variableSearchResults;
                        $scope.state.variableSearchResults = userVariables;
                        $scope.state.variableSearchResults = $scope.state.variableSearchResults.concat(existingResults);
                        $scope.state.searching = false;
                        $scope.state.noVariablesFoundCard.show = false;
                    }
                } else {
                    if(!$stateParams.variableSearchParameters.includePublic){
                        $scope.state.noVariablesFoundCard.show = true;
                    }
                    if($scope.state.variableSearchResults.length < 1 && $stateParams.variableSearchParameters.includePublic){
                        populateCommonVariables();
                    }
                }
            }, function (error) {
                console.error(error);
            });
        };

        // when add new variable is tapped
        $scope.addNewVariable = function(){
            
            var variableObject = {};
            variableObject.name = $scope.state.variableSearchQuery.name;
            if($rootScope.variableCategoryName && $rootScope.variableCategoryName !== 'Anything'){
                variableObject.variableCategoryName = $rootScope.variableCategoryName;
            }

            console.debug($state.current.name + ": " + "$scope.addNewVariable: " + JSON.stringify(variableObject));
            if ($stateParams.nextState) {
                $rootScope.stateParams.variableObject = variableObject;
                $state.go($stateParams.nextState, $rootScope.stateParams);
            }
        };

        // update data when view is navigated to
        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });

        // update data when view is navigated to
        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            if($stateParams.helpText){
                $scope.state.helpText = $stateParams.helpText;
            }

            if($stateParams.title){
                $scope.state.title = $stateParams.title;
            }

            if($stateParams.variableSearchPlaceholderText){
                $scope.state.variableSearchPlaceholderText = $stateParams.variableSearchPlaceholderText;
            }

            if ($rootScope.variableCategoryName === 'Anything') {
                $rootScope.variableCategoryName = null;
            }

            if(!$stateParams.variableSearchParameters){
                $stateParams.variableSearchParameters = {};
            }
            if(!$stateParams.variableSearchParameters.variableCategoryName){
                $stateParams.variableSearchParameters.variableCategoryName = $rootScope.variableCategoryName;
            }

            if(!$stateParams.commonVariableSearchParameters){
                $stateParams.commonVariableSearchParameters = $stateParams.variableSearchParameters;
            }

            if(!$stateParams.commonVariableSearchParameters.variableCategoryName){
                $stateParams.commonVariableSearchParameters.variableCategoryName = $rootScope.variableCategoryName;
            }

            if ($rootScope.variableCategoryName && $rootScope.variableCategoryName !== 'Anything') {
                $scope.state.variableSearchPlaceholderText = "Search for a " +
                    $filter('wordAliases')(pluralize($rootScope.variableCategoryName, 1).toLowerCase()) + " here...";
                $scope.state.title = "Select " + $filter('wordAliases')(pluralize($rootScope.variableCategoryName, 1));
                $scope.state.noVariablesFoundCard.title = 'No ' + $stateParams.variableCategoryName + ' Found';
            }
        });

        $scope.matchEveryWord = function() {
            return function( item ) {
                if(item.variableCategoryName){
                    if($stateParams.variableSearchParameters.manualTracking && $scope.state.variableSearchQuery.name.length < 5){
                        if(item.variableCategoryName.indexOf('Location') !== -1 ||
                            item.variableCategoryName.indexOf('Software') !== -1 ||
                            item.variableCategoryName.indexOf('Environment') !== -1
                        ){
                            return false;
                        }
                    }
                }

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