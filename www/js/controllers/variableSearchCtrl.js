angular.module('starter').controller('VariableSearchCtrl', function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $timeout, $ionicLoading) {
    $scope.controller_name = "VariableSearchCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.state = {
        showAddVariableButton: false,
        showVariableCategorySelector: false,
        variableSearchResults : [],
        variableCategoryName: $stateParams.variableCategoryName,
        variableSearchQuery : {name:''},
        trackingReminder: {},
        noVariablesFoundCard: {show: false, title: 'No Variables Found', body: "You don't have any data, yet.  Start tracking!"},
        searching: true,
        title : "Select Variable",
        variableSearchPlaceholderText: "Search for a variable here..."
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        console.debug($state.current.name + " beforeEnter...");
        $scope.stateParams = $stateParams;
        //if(!$stateParams.hideNavigationMenu){$rootScope.hideNavigationMenu = false;}
        $rootScope.hideNavigationMenu = false;
        if($stateParams.helpText){$scope.state.helpText = $stateParams.helpText;}
        if($stateParams.title){$scope.state.title = $stateParams.title;}
        if($stateParams.variableSearchPlaceholderText){$scope.state.variableSearchPlaceholderText = $stateParams.variableSearchPlaceholderText;}
        if ($scope.variableCategoryName === 'Anything') {$scope.variableCategoryName = null;}
        if(!$stateParams.variableSearchParameters){$stateParams.variableSearchParameters = {};}
        if(!$stateParams.variableSearchParameters.variableCategoryName){$stateParams.variableSearchParameters.variableCategoryName = $scope.variableCategoryName;}
        if(!$stateParams.commonVariableSearchParameters){$stateParams.commonVariableSearchParameters = $stateParams.variableSearchParameters;}
        if(!$stateParams.commonVariableSearchParameters.variableCategoryName){$stateParams.commonVariableSearchParameters.variableCategoryName = $scope.variableCategoryName;}
        if($stateParams.variableCategoryName){$scope.variableCategoryName = $stateParams.variableCategoryName;}
        if ($scope.variableCategoryName && $scope.variableCategoryName !== 'Anything') {
            $scope.state.variableSearchPlaceholderText = "Search for a " + $filter('wordAliases')(pluralize($scope.variableCategoryName, 1).toLowerCase()) + " here...";
            $scope.state.title = "Select " + $filter('wordAliases')(pluralize($scope.variableCategoryName, 1));
            $scope.state.noVariablesFoundCard.title = 'No ' + $stateParams.variableCategoryName + ' Found';
        }
        setHelpText();
    });
    // update data when view is navigated to
    $scope.$on('$ionicView.enter', function(e) {
        console.debug($state.current.name + " enter...");
        $scope.hideLoader();
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){
            $stateParams.variableSearchParameters.variableCategoryName = $stateParams.variableCategoryName;
        }
        // We always need to repopulate in case variable was updated in local storage and the search view was cached
        populateUserVariables();
        populateCommonVariables();
        setHelpText();
    });
    $scope.selectVariable = function(variableObject) {
        console.debug($state.current.name + ": " + "$scope.selectVariable: " + JSON.stringify(variableObject).substring(0, 140) + '...');
        if(variableObject.lastValue !== null){quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables', variableObject);}
        quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('commonVariables', variableObject);
        var userTagData;
        if($state.current.name === 'app.favoriteSearch') {
            quantimodoService.addToFavoritesUsingVariableObject(variableObject);
        } else if (window.location.href.indexOf('reminder-search') !== -1) {
            var options = {skipReminderSettingsIfPossible: $stateParams.skipReminderSettingsIfPossible, doneState: $stateParams.doneState};
            quantimodoService.addToRemindersUsingVariableObject(variableObject, options);
        } else if ($stateParams.nextState.indexOf('predictor') !== -1) {
            $state.go($stateParams.nextState, {effectVariableName: variableObject.name});
        } else if ($stateParams.nextState.indexOf('outcome') !== -1) {
            $state.go($stateParams.nextState, {causeVariableName: variableObject.name});
        } else if ($stateParams.userTaggedVariableObject) {
            if($stateParams.userTaggedvariableObject.userVariableDefaultUnitAbbreviatedName !== '/5'){
                $state.go($stateParams.nextState, {
                    userTaggedVariableObject: $stateParams.userTaggedVariableObject,
                    fromState: $stateParams.fromState,
                    fromStateParams: {variableObject: $stateParams.userTaggedVariableObject},
                    userTagVariableObject: variableObject
                });
            } else {
                userTagData = {userTagVariableId: variableObject.id, userTaggedVariableId: $stateParams.userTaggedVariableObject.id, conversionFactor: 1};
                quantimodoService.showLoader();
                quantimodoService.postUserTagDeferred(userTagData).then(function () {
                    $ionicLoading.hide();
                    if ($stateParams.fromState) {$state.go($stateParams.fromState, {variableName: $stateParams.userTaggedVariableObject.name});
                    } else {$state.go(config.appSettings.defaultState);}
                });
            }
        } else if($stateParams.userTagVariableObject) {
            if($stateParams.userTagvariableObject.userVariableDefaultUnitAbbreviatedName !== '/5'){
                $state.go($stateParams.nextState, {
                    userTaggedVariableObject: variableObject,
                    fromState: $stateParams.fromState,
                    fromStateParams: {variableObject: $stateParams.userTagVariableObject},
                    userTagVariableObject: $stateParams.userTagVariableObject
                });
            } else {
                userTagData = {userTagVariableId: $stateParams.userTagVariableObject.id, userTaggedVariableId: variableObject.id, conversionFactor: 1};
                quantimodoService.showLoader();
                quantimodoService.postUserTagDeferred(userTagData).then(function () {
                    $ionicLoading.hide();
                    if ($stateParams.fromState) {$state.go($stateParams.fromState, {variableName: $stateParams.userTagVariableObject.name});
                    } else {$state.go(config.appSettings.defaultState);}
                });
            }
        } else {
            $scope.stateParams.variableName = variableObject.name;
            $scope.stateParams.variableObject = variableObject;
            $state.go($stateParams.nextState, $scope.stateParams);
        }
    };
    $scope.goToStateFromVariableSearch = function(stateName){$state.go(stateName, $stateParams);};
    // when a query is searched in the search box
    function showAddVariableButtonIfNecessary(variables) {
        if($stateParams.doNotShowAddVariableButton){
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
            console.debug($state.current.name + ": " + "$scope.onVariableSearch: Set showAddVariableButton to true");
            $scope.state.showAddVariableButton = true;
            if ($stateParams.nextState === "app.reminderAdd") {
                $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name + ' reminder';
            } else if ($stateParams.nextState === "app.measurementAdd") {
                $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name + ' measurement';
            } else {
                $scope.state.addNewVariableButtonText = '+ ' + $scope.state.variableSearchQuery.name;
            }
        }
    }
    function showNoVariablesFoundCardIfNecessary() {
        if ($scope.state.variableSearchResults.length || !$stateParams.doNotShowAddVariableButton) {
            $scope.state.noVariablesFoundCard.show = false;
            return;
        }
        $scope.state.noVariablesFoundCard.title = $scope.state.variableSearchQuery.name + ' Not Found';
        if($stateParams.noVariablesFoundCard && $stateParams.noVariablesFoundCard.body){
            $scope.state.noVariablesFoundCard.body = $stateParams.noVariablesFoundCard.body.replace('__VARIABLE_NAME__', $scope.state.variableSearchQuery.name.toUpperCase());
        } else {
            $scope.state.noVariablesFoundCard.body = "You don't have any data for " + $scope.state.variableSearchQuery.name.toUpperCase() + ", yet.  Start tracking!";
        }
        $scope.state.noVariablesFoundCard.show = true;
    }
    $scope.onVariableSearch = function(){
        $scope.state.noVariablesFoundCard.show = false;
        $scope.state.showAddVariableButton = false;
        console.debug($state.current.name + ": " + "Search term: ", $scope.state.variableSearchQuery.name);
        if($scope.state.variableSearchQuery.name.length > 2){
            $scope.state.searching = true;
            quantimodoService.searchUserVariablesDeferred($scope.state.variableSearchQuery.name, $stateParams.variableSearchParameters)
                .then(function(variables){
                    $scope.state.noVariablesFoundCard.show = false;
                    $scope.state.showAddVariableButton = false;
                    $scope.state.variableSearchResults = variables;
                    $scope.state.searching = false;
                    showAddVariableButtonIfNecessary(variables);
                    showNoVariablesFoundCardIfNecessary();
                });
        } else {
            populateUserVariables();
        }
    };
    var populateCommonVariables = function(){
        if(!$stateParams.variableSearchParameters.includePublic) {return;}
        if($scope.state.variableSearchQuery.name.length > 2){return;}
        $scope.state.showAddVariableButton = false;
        if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){$scope.state.searching = true;}
        quantimodoService.getCommonVariablesDeferred($stateParams.commonVariableSearchParameters).then(function (commonVariables) {
            if(commonVariables && commonVariables.length > 0){
                if($scope.state.variableSearchQuery.name.length < 3) {
                    $scope.state.variableSearchResults = quantimodoService.removeArrayElementsWithDuplicateIds($scope.state.variableSearchResults.concat(commonVariables));
                    //checkThatVariableNamesExist();
                    $scope.state.searching = false;
                }
            }
        }, function (error) {console.error(error);});
    };
    var populateUserVariables = function(){
        if($scope.state.variableSearchQuery.name.length > 2){return;}
        $scope.state.showAddVariableButton = false;
        if(!$scope.state.variableSearchResults || $scope.state.variableSearchResults.length < 1){$scope.state.searching = true;}
        quantimodoService.getUserVariablesFromLocalStorageOrApiDeferred($stateParams.variableSearchParameters).then(function (userVariables) {
            if(userVariables && userVariables.length > 0){
                if($scope.state.variableSearchQuery.name.length < 3) {
                    // Put user variables at top of list
                    userVariables = quantimodoService.sortByProperty(userVariables, '-latestMeasurementTime');
                    $scope.state.variableSearchResults = quantimodoService.removeArrayElementsWithDuplicateIds(userVariables.concat($scope.state.variableSearchResults));
                    $scope.state.searching = false;
                    $scope.state.noVariablesFoundCard.show = false;
                    //checkThatVariableNamesExist();
                }
            } else {
                if(!$stateParams.variableSearchParameters.includePublic){
                    $scope.state.noVariablesFoundCard.show = true;
                    $scope.state.searching = false;
                }
                if($scope.state.variableSearchResults.length < 1 && $stateParams.variableSearchParameters.includePublic){populateCommonVariables();}
            }
        }, function (error) {console.error(error);});
    };
    $scope.addNewVariable = function(){
        var variableObject = {};
        variableObject.name = $scope.state.variableSearchQuery.name;
        if($scope.variableCategoryName && $scope.variableCategoryName !== 'Anything'){variableObject.variableCategoryName = $scope.variableCategoryName;}
        console.debug($state.current.name + ": " + "$scope.addNewVariable: " + JSON.stringify(variableObject));
        if ($stateParams.nextState) {
            $scope.stateParams.variableObject = variableObject;
            $state.go($stateParams.nextState, $scope.stateParams);
        }
    };
    function setHelpText() {
        if ($stateParams.userTaggedVariableObject) {
            $scope.state.helpText = "Search for a variable like an ingredient, category, or duplicate variable " +
                "that you'd like to tag " + $stateParams.userTaggedVariableObject.name.toUpperCase() + " with.  Then " +
                "when your tag variable is analyzed, measurements from " +
                $stateParams.userTaggedVariableObject.name.toUpperCase() + " will be included.";
            $scope.stateParams.helpText = " <br><br> Search for a variable " +
                "that you'd like to tag with " + $stateParams.userTaggedVariableObject.name.toUpperCase() + ".  Then " +
                "when " + $stateParams.userTaggedVariableObject.name.toUpperCase() +
                " is analyzed, measurements from your selected tagged variable will be included. <br><br> For instance, if " +
                "your currently selected variable were Inflammatory Pain, you could search for and select Back Pain " +
                "to be tagged with Inflammatory Pain since Inflammatory Pain includes Back Pain.  Then Back Pain " +
                "measurements would be included when Inflammatory Pain is analyzed";
        }
        if ($stateParams.userTagVariableObject) {
            $scope.state.helpText = "Search for a child variable " +
                "that you'd like to tag with " + $stateParams.userTagVariableObject.name.toUpperCase() + ".  Then " +
                "when " + $stateParams.userTagVariableObject.name.toUpperCase() +
                " is analyzed, measurements from your selected tagged variable will be included.";
            $scope.stateParams.helpText = $scope.state.helpText + " <br><br> For instance, if " +
                "your currently selected variable were Sugar, you could search for Coke and tag it with 37 grams of " +
                "sugar per serving. Then coke measurements would be included when analyzing to see how sugar affects you.  <br><br>" +
                "If your current parent tag variable were Inflammatory Pain, you could search for Back Pain and then your " +
                "Inflammatory Pain analysis would include Back Pain measurements as well.";
        }
        if(!$scope.state.helpText && $stateParams.variableCategoryName && $rootScope.variableCategories[$stateParams.variableCategoryName].variableCategoryNameSingular){
            $scope.state.helpText = 'Enter a ' + $rootScope.variableCategories[$stateParams.variableCategoryName].variableCategoryNameSingular.toLowerCase() +
                ' in the search box or select one from the list below.';
        }
        if(!$scope.state.helpText){$scope.state.helpText = 'Enter a variable in the search box or select one from the list below.';}
    }
    var checkNameExists = function (item) {
        if(!item.name){
            var message = "variable doesn't have a name! variable: " + JSON.stringify(item);
            console.error(message);
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
            return false;
        }
        return true;
    };
    $scope.matchEveryWord = function() {
        return function( item ) {
            if(!checkNameExists(item)){return false;}
            if(item.variableCategoryName){
                if($stateParams.variableSearchParameters.manualTracking && $scope.state.variableSearchQuery.name.length < 5){
                    if(item.variableCategoryName.indexOf('Location') !== -1 || item.variableCategoryName.indexOf('Software') !== -1 || item.variableCategoryName.indexOf('Environment') !== -1){
                        return false;
                    }
                }
            }
            if( $stateParams.excludeDuplicateBloodPressure ) {
                if(item.name.toLowerCase().indexOf('diastolic') !== -1 || item.name.toLowerCase().indexOf('systolic') !== -1 ) {return false;}
            }
            if($stateParams.excludeSingularBloodPressure && item.name.toLowerCase() === 'blood pressure') {return false;}
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
