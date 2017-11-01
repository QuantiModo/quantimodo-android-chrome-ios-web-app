angular.module('starter').controller('VariableSearchCtrl', function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService) {
    $scope.controller_name = "VariableSearchCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.state = $stateParams;
    $scope.state.searching = true;
    $scope.state.variableSearchResults = [];
    //$scope.state.variableSearchParameters = {};  DON'T OVERWRITE $stateParams.variableSearchParameters
    $scope.state.variableSearchQuery = {name:''};
    if(!$scope.state.noVariablesFoundCard) {$scope.state.noVariablesFoundCard = {show: false, title: 'No Variables Found', body: "You don't have any data, yet.  Start tracking!"};}
    if(!$scope.state.title) {$scope.state.title = "Select Variable";}
    if(!$scope.state.variableSearchPlaceholderText) {$scope.state.variableSearchPlaceholderText = "Search for a variable here...";}
    $scope.$on('$ionicView.beforeEnter', function(e) {
        qmLogService.debug(null, $state.current.name + ' beforeEnter...', null);
        $rootScope.hideNavigationMenu = false;
        $scope.state.variableSearchParameters.variableCategoryName = qmService.getVariableCategoryNameFromStateParamsOrUrl($stateParams);
        if ($scope.state.variableSearchParameters.variableCategoryName) {
            $scope.state.variableSearchPlaceholderText = "Search for a " + $filter('wordAliases')(pluralize($scope.state.variableSearchParameters.variableCategoryName, 1).toLowerCase()) + " here...";
            $scope.state.title = "Select " + $filter('wordAliases')(pluralize($scope.state.variableSearchParameters.variableCategoryName, 1));
            $scope.state.noVariablesFoundCard.title = 'No ' + $scope.state.variableSearchParameters.variableCategoryName + ' Found';
        }
        setHelpText();
    });
    $scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug(null, $state.current.name + ' enter...', null);
        // We always need to repopulate in case variable was updated in local storage and the search view was cached
        populateUserVariables();
        populateCommonVariables();
        setHelpText();
        qmService.hideLoader();
    });
    $scope.selectVariable = function(variableObject) {
        qmLogService.debug(null, $state.current.name + ': ' + '$scope.selectVariable: ' + JSON.stringify(variableObject).substring(0, 140) + '...', null);
        variableObject.latestMeasurementTime = timeHelper.getUnixTimestampInSeconds();  // Do this so it's at the top of the list
        if(variableObject.lastValue !== null){qmService.qmStorage.addToOrReplaceByIdAndMoveToFront('userVariables', variableObject);}
        qmService.qmStorage.addToOrReplaceByIdAndMoveToFront('commonVariables', variableObject);
        $scope.state.variableSearchQuery.name = '';
        var userTagData;
        if($state.current.name === 'app.favoriteSearch') {
            qmService.addToFavoritesUsingVariableObject(variableObject);
        } else if (window.location.href.indexOf('reminder-search') !== -1) {
            var options = {skipReminderSettingsIfPossible: $scope.state.skipReminderSettingsIfPossible, doneState: $scope.state.doneState};
            qmService.addToRemindersUsingVariableObject(variableObject, options);
        } else if ($scope.state.nextState.indexOf('predictor') !== -1) {
            qmService.goToState($scope.state.nextState, {effectVariableName: variableObject.name});
        } else if ($scope.state.nextState.indexOf('outcome') !== -1) {
            qmService.goToState($scope.state.nextState, {causeVariableName: variableObject.name});
        } else if ($scope.state.userTaggedVariableObject) {
            if($scope.state.userTaggedVariableObject.unit.abbreviatedName !== '/5'){
                qmService.goToState($scope.state.nextState, {
                    userTaggedVariableObject: $scope.state.userTaggedVariableObject,
                    fromState: $scope.state.fromState,
                    fromStateParams: {variableObject: $scope.state.userTaggedVariableObject},
                    userTagVariableObject: variableObject
                });
            } else {
                userTagData = {userTagVariableId: variableObject.id, userTaggedVariableId: $scope.state.userTaggedVariableObject.id, conversionFactor: 1};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function () {
                    qmService.hideLoader();
                    if ($scope.state.fromState) {qmService.goToState($scope.state.fromState, {variableName: $scope.state.userTaggedVariableObject.name});
                    } else {qmService.goToState(config.appSettings.appDesign.defaultState);}
                });
            }
        } else if($scope.state.userTagVariableObject) {
            if($scope.state.userTagVariableObject.unit.abbreviatedName !== '/5'){
                qmService.goToState($scope.state.nextState, {
                    userTaggedVariableObject: variableObject,
                    fromState: $scope.state.fromState,
                    fromStateParams: {variableObject: $scope.state.userTagVariableObject},
                    userTagVariableObject: $scope.state.userTagVariableObject
                });
            } else {
                userTagData = {userTagVariableId: $scope.state.userTagVariableObject.id, userTaggedVariableId: variableObject.id, conversionFactor: 1};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function () {
                    qmService.hideLoader();
                    if ($scope.state.fromState) {qmService.goToState($scope.state.fromState, {variableName: $scope.state.userTagVariableObject.name});
                    } else {qmService.goToState(config.appSettings.appDesign.defaultState);}
                });
            }
        } else {
            $scope.state.variableName = variableObject.name;
            $scope.state.variableObject = variableObject;
            qmService.goToState($scope.state.nextState, $scope.state);
        }
    };
    $scope.goToStateFromVariableSearch = function(stateName){qmService.goToState(stateName, $stateParams);};
    // when a query is searched in the search box
    function showAddVariableButtonIfNecessary(variables) {
        if($scope.state.doNotShowAddVariableButton){
            $scope.state.showAddVariableButton = false;
            return;
        }
        var resultIndex = 0;
        var found = false;
        while (!found && resultIndex < $scope.state.variableSearchResults.length) {
            if ($scope.state.variableSearchResults[resultIndex].name.toLowerCase() ===
                $scope.state.variableSearchQuery.name.toLowerCase()) {
                found = true;
            } else {resultIndex++;}
        }
        // If no results or no exact match, show "+ Add [variable]" button for query
        if ((variables.length < 1 || !found)) {
            $scope.showSearchLoader = false;
            qmLogService.debug(null, $state.current.name + ': ' + '$scope.onVariableSearch: Set showAddVariableButton to true', null);
            $scope.state.showAddVariableButton = true;
            if ($scope.state.nextState === "app.reminderAdd") {
                $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name + ' reminder';
            } else if ($scope.state.nextState === "app.measurementAdd") {
                $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name + ' measurement';
            } else {
                $scope.state.addNewVariableButtonText = '+ ' + $scope.state.variableSearchQuery.name;
            }
        }
    }
    function showNoVariablesFoundCardIfNecessary() {
        if ($scope.state.variableSearchResults.length || !$scope.state.doNotShowAddVariableButton) {
            $scope.state.noVariablesFoundCard.show = false;
            return;
        }
        $scope.state.noVariablesFoundCard.title = $scope.state.variableSearchQuery.name + ' Not Found';
        if($scope.state.noVariablesFoundCard && $scope.state.noVariablesFoundCard.body){
            $scope.state.noVariablesFoundCard.body = $scope.state.noVariablesFoundCard.body.replace('__VARIABLE_NAME__', $scope.state.variableSearchQuery.name.toUpperCase());
        } else {
            $scope.state.noVariablesFoundCard.body = "You don't have any data for " + $scope.state.variableSearchQuery.name.toUpperCase() + ", yet.  Start tracking!";
        }
        $scope.state.noVariablesFoundCard.show = true;
    }
    $scope.onVariableSearch = function(){
        $scope.state.noVariablesFoundCard.show = false;
        $scope.state.showAddVariableButton = false;
        qmLogService.debug(null, $state.current.name + ': ' + 'Search term: ', null, $scope.state.variableSearchQuery.name);
        if($scope.state.variableSearchQuery.name.length > 2){
            $scope.state.searching = true;
            qmService.searchUserVariablesDeferred($scope.state.variableSearchQuery.name, $scope.state.variableSearchParameters)
                .then(function(variables){
                    $scope.state.noVariablesFoundCard.show = false;
                    $scope.state.showAddVariableButton = false;
                    $scope.state.variableSearchResults = variables;
                    qmLogService.debug(null, 'variable search results', null, variables);
                    $scope.state.searching = false;
                    showAddVariableButtonIfNecessary(variables);
                    showNoVariablesFoundCardIfNecessary();
                });
        } else {
            populateUserVariables();
        }
    };
    var populateCommonVariables = function(){
        if(!$scope.state.variableSearchParameters.includePublic) {return;}
        if($scope.state.variableSearchQuery.name.length > 2){return;}
        $scope.state.showAddVariableButton = false;
        if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){$scope.state.searching = true;}
        qmService.getCommonVariablesDeferred($scope.state.variableSearchParameters).then(function (commonVariables) {
            if(commonVariables && commonVariables.length > 0){
                if($scope.state.variableSearchQuery.name.length < 3) {
                    $scope.state.variableSearchResults = qmService.removeArrayElementsWithDuplicateIds($scope.state.variableSearchResults.concat(commonVariables));
                    //checkThatVariableNamesExist();
                    $scope.state.searching = false;
                }
            }
        }, function (error) {qmLogService.error(null, error);});
    };
    var populateUserVariables = function(){
        if($scope.state.variableSearchQuery.name.length > 2){return;}
        $scope.state.showAddVariableButton = false;
        if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){$scope.state.searching = true;}
        qmService.getUserVariablesFromLocalStorageOrApiDeferred($scope.state.variableSearchParameters).then(function (userVariables) {
            if(userVariables && userVariables.length > 0){
                if($scope.state.variableSearchQuery.name.length < 3) {
                    var sort = ($scope.state.variableSearchParameters.sort) ? $scope.state.variableSearchParameters.sort : '-latestMeasurementTime';
                    // Put user variables at top of list
                    userVariables = qmService.sortByProperty(userVariables, sort);
                    $scope.state.variableSearchResults = qmService.removeArrayElementsWithDuplicateIds(userVariables.concat($scope.state.variableSearchResults));
                    $scope.state.searching = false;
                    $scope.state.noVariablesFoundCard.show = false;
                    //checkThatVariableNamesExist();
                }
            } else {
                if(!$scope.state.variableSearchParameters.includePublic){
                    $scope.state.noVariablesFoundCard.show = true;
                    $scope.state.searching = false;
                }
                if($scope.state.variableSearchResults.length < 1 && $scope.state.variableSearchParameters.includePublic){populateCommonVariables();}
            }
        }, function (error) {qmLogService.error(null, error);});
    };
    $scope.addNewVariable = function(){
        var variableObject = {};
        variableObject.name = $scope.state.variableSearchQuery.name;
        if($scope.state.variableSearchParameters.variableCategoryName){
            variableObject.variableCategoryName = $scope.state.variableSearchParameters.variableCategoryName;
        }
        qmLogService.debug(null, $state.current.name + ': ' + '$scope.addNewVariable: ' + JSON.stringify(variableObject), null);
        if ($scope.state.nextState) {
            $scope.state.variableObject = variableObject;
            qmService.goToState($scope.state.nextState, $scope.state);
        }
    };
    function setHelpText() {
        if ($scope.state.userTaggedVariableObject) {
            $scope.state.helpText = "Search for a variable like an ingredient, category, or duplicate variable " +
                "that you'd like to tag " + $scope.state.userTaggedVariableObject.name.toUpperCase() + " with.  Then " +
                "when your tag variable is analyzed, measurements from " +
                $scope.state.userTaggedVariableObject.name.toUpperCase() + " will be included.";
            $scope.state.helpText = " <br><br> Search for a variable " +
                "that you'd like to tag with " + $scope.state.userTaggedVariableObject.name.toUpperCase() + ".  Then " +
                "when " + $scope.state.userTaggedVariableObject.name.toUpperCase() +
                " is analyzed, measurements from your selected tagged variable will be included. <br><br> For instance, if " +
                "your currently selected variable were Inflammatory Pain, you could search for and select Back Pain " +
                "to be tagged with Inflammatory Pain since Inflammatory Pain includes Back Pain.  Then Back Pain " +
                "measurements would be included when Inflammatory Pain is analyzed";
        }
        if ($scope.state.userTagVariableObject) {
            $scope.state.helpText = "Search for a child variable " +
                "that you'd like to tag with " + $scope.state.userTagVariableObject.name.toUpperCase() + ".  Then " +
                "when " + $scope.state.userTagVariableObject.name.toUpperCase() +
                " is analyzed, measurements from your selected tagged variable will be included.";
            $scope.state.helpText = $scope.state.helpText + " <br><br> For instance, if " +
                "your currently selected variable were Sugar, you could search for Coke and tag it with 37 grams of " +
                "sugar per serving. Then coke measurements would be included when analyzing to see how sugar affects you.  <br><br>" +
                "If your current parent tag variable were Inflammatory Pain, you could search for Back Pain and then your " +
                "Inflammatory Pain analysis would include Back Pain measurements as well.";
        }
        if(!$scope.state.helpText && $scope.state.variableSearchParameters.variableCategoryName && $rootScope.variableCategories[$scope.state.variableSearchParameters.variableCategoryName].variableCategoryNameSingular){
            $scope.state.helpText = 'Enter a ' + $rootScope.variableCategories[$scope.state.variableSearchParameters.variableCategoryName].variableCategoryNameSingular.toLowerCase() +
                ' in the search box or select one from the list below.';
        }
        if(!$scope.state.helpText){$scope.state.helpText = 'Enter a variable in the search box or select one from the list below.';}
    }
    var checkNameExists = function (item) {
        if(!item.name){
            var message = "variable doesn't have a name! variable: " + JSON.stringify(item);
            qmLogService.error(null, message);
            qmLogService.error(null, message);
            return false;
        }
        return true;
    };
    $scope.matchEveryWord = function() {
        return function( item ) {
            if(!checkNameExists(item)){return false;}
            if(item.variableCategoryName){
                if($scope.state.variableSearchParameters.manualTracking && $scope.state.variableSearchQuery.name.length < 5){
                    if(item.variableCategoryName.indexOf('Location') !== -1 || item.variableCategoryName.indexOf('Software') !== -1 || item.variableCategoryName.indexOf('Environment') !== -1){
                        return false;
                    }
                }
            }
            if( $scope.state.excludeDuplicateBloodPressure ) {
                if(item.name.toLowerCase().indexOf('diastolic') !== -1 || item.name.toLowerCase().indexOf('systolic') !== -1 ) {return false;}
            }
            if($scope.state.excludeSingularBloodPressure && item.name.toLowerCase() === 'blood pressure') {return false;}
            var variableObjectAsString = JSON.stringify(item).toLowerCase();
            var lowercaseVariableSearchQuery = $scope.state.variableSearchQuery.name.toLowerCase();
            var filterBy = lowercaseVariableSearchQuery.split(/\s+/);
            if(lowercaseVariableSearchQuery){if(!filterBy.length){return true;}} else {return true;}
            return filterBy.every(function (word){
                var exists = variableObjectAsString.indexOf(word);
                if(exists !== -1){return true;}
            });
        };
    };
});
