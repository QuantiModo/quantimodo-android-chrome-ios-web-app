angular.module('starter')
    .controller('VariableSearchCtrl', function($scope, $state, $rootScope, $stateParams, $filter, localStorageService, 
                                               QuantiModo,  variableCategoryService, variableService, $timeout, $ionicLoading) {

        $scope.controller_name = "VariableSearchCtrl";
        $rootScope.showFilterBarSearchIcon = false;

        $scope.state = {
            showAddVariableButton: false,
            showVariableCategorySelector: false,
            variableSearchResults : [],
            variableCategoryName: $stateParams.variableCategoryName,
            variableSearchQuery : {name:''},
            trackingReminder: {},
            noVariablesFoundCard: {
                show: false,
                title: 'No Variables Found',
                body: "You don't have any data, yet.  Start tracking!"
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

            var userTagData;
            if($state.current.name === 'app.favoriteSearch') {
                $scope.addToFavoritesUsingVariableObject(variableObject);
            } else if ($stateParams.nextState.indexOf('predictor') !== -1) {
                $state.go($stateParams.nextState, {requestParams: {effectVariableName: variableObject.name}});
            } else if ($stateParams.nextState.indexOf('outcome') !== -1) {
                $state.go($stateParams.nextState, {requestParams: {causeVariableName: variableObject.name}});
            } else if ($stateParams.taggedVariableObject) {
                if($stateParams.taggedVariableObject.abbreviatedUnitName !== '/5'){
                    $state.go($stateParams.nextState, {
                        taggedVariableObject: $stateParams.taggedVariableObject,
                        fromState: $stateParams.fromState,
                        tagVariableObject: variableObject
                    });
                } else {
                    userTagData = {
                        tagVariableId: variableObject.id,
                        taggedVariableId: $stateParams.taggedVariableObject.id,
                        conversionFactor: 1
                    };

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner>'
                    });

                    QuantiModo.postUserTagDeferred(userTagData).then(function () {
                        $ionicLoading.hide();
                        if ($stateParams.fromState) {
                            $state.go($stateParams.fromState, {
                                variableName: $stateParams.taggedVariableObject.name
                            });
                        } else {
                            $state.go(config.appSettings.defaultState);
                        }
                    });
                }

            } else if($stateParams.tagVariableObject) {

                if($stateParams.tagVariableObject.abbreviatedUnitName !== '/5'){
                    $state.go($stateParams.nextState, {
                        taggedVariableObject: variableObject,
                        fromState: $stateParams.fromState,
                        tagVariableObject: $stateParams.tagVariableObject
                    });
                } else {
                    userTagData = {
                        tagVariableId: $stateParams.tagVariableObject.id,
                        taggedVariableId: variableObject.id,
                        conversionFactor: 1
                    };

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner>'
                    });

                    QuantiModo.postUserTagDeferred(userTagData).then(function () {
                        $ionicLoading.hide();
                        if ($stateParams.fromState) {
                            $state.go($stateParams.fromState, {
                                variableName: $stateParams.tagVariableObject.name
                            });
                        } else {
                            $state.go(config.appSettings.defaultState);
                        }
                    });
                }

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

            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.showHelpInfoPopupIfNecessary();
            if($stateParams.variableCategoryName && $stateParams.variableCategoryName !== 'Anything'){
                $stateParams.variableSearchParameters.variableCategoryName = $stateParams.variableCategoryName;
            }
            if($scope.state.variableSearchResults.length < 10){
                populateUserVariables();
                populateCommonVariables();
            }
            setHelpText();
        };

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
                } else {
                    resultIndex++;
                }
            }
            // If no results or no exact match, show "+ Add [variable]" button for query
            if ((variables.length < 1 || !found)) {
                $scope.showSearchLoader = true;
                $timeout(function () {
                    if (!$scope.state.searching) {
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
        }

        function showNoVariablesFoundCardIfNecessary() {

            if ($scope.state.variableSearchResults.length) {
                $scope.state.noVariablesFoundCard.show = false;
                return;
            }

            if (!$stateParams.doNotShowAddVariableButton) {
                $scope.state.noVariablesFoundCard.show = false;
                return;
            }

            $scope.state.noVariablesFoundCard.title = $scope.state.variableSearchQuery.name + ' Not Found';
            if($stateParams.noVariablesFoundCard && $stateParams.noVariablesFoundCard.body){
                $scope.state.noVariablesFoundCard.body =
                    $stateParams.noVariablesFoundCard.body.replace('__VARIABLE_NAME__', $scope.state.variableSearchQuery.name.toUpperCase());
            } else {
                $scope.state.noVariablesFoundCard.body = "You don't have any data for " +
                    $scope.state.variableSearchQuery.name.toUpperCase() + ", yet.  Start tracking!";
            }
            $scope.state.noVariablesFoundCard.show = true;
        }

        $scope.onVariableSearch = function(){
            $scope.state.noVariablesFoundCard.show = false;
            $scope.state.showAddVariableButton = false;
            console.debug($state.current.name + ": " + "Search term: ", $scope.state.variableSearchQuery.name);
            if($scope.state.variableSearchQuery.name.length > 2){
                $scope.state.searching = true;
                variableService.searchUserVariables($scope.state.variableSearchQuery.name, $stateParams.variableSearchParameters)
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

        $scope.$on('populateUserVariables', function(){
            console.debug('populateUserVariables broadcast received..');
            populateUserVariables();
        });

        $scope.$on('populateCommonVariables', function(){
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
                        $scope.state.variableSearchResults = arrayUniqueId($scope.state.variableSearchResults.concat(commonVariables));
                        $scope.state.searching = false;
                    }
                }
            }, function (error) {
                console.error(error);
            });
        };

        function arrayUniqueId(array) {
            var a = array.concat();
            for(var i=0; i<a.length; ++i) {
                for(var j=i+1; j<a.length; ++j) {
                    if(a[i].id === a[j].id)
                        a.splice(j--, 1);
                }
            }

            return a;
        }

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
                        $scope.state.variableSearchResults = arrayUniqueId(userVariables.concat($scope.state.variableSearchResults));
                        $scope.state.searching = false;
                        $scope.state.noVariablesFoundCard.show = false;
                    }
                } else {
                    if(!$stateParams.variableSearchParameters.includePublic){
                        $scope.state.noVariablesFoundCard.show = true;
                        $scope.state.searching = false;
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
        function setHelpText() {
            if ($stateParams.taggedVariableObject) {
                $scope.state.helpText = "Search for a variable like an ingredient, category, or duplicate variable " +
                    "that you'd like to tag " + $stateParams.taggedVariableObject.name.toUpperCase() + " with.  Then " +
                    "when your tag variable is analyzed, measurements from " +
                    $stateParams.taggedVariableObject.name.toUpperCase() + " will be included.";
                $rootScope.stateParams.helpText = " <br><br> Search for a variable " +
                    "that you'd like to tag with " + $stateParams.taggedVariableObject.name.toUpperCase() + ".  Then " +
                    "when " + $stateParams.taggedVariableObject.name.toUpperCase() +
                    " is analyzed, measurements from your selected tagged variable will be included. <br><br> For instance, if " +
                    "your currently selected variable were Inflammatory Pain, you could search for and select Back Pain " +
                    "to be tagged with Inflammatory Pain since Inflammatory Pain includes Back Pain.  Then Back Pain " +
                    "measurements would be included when Inflammatory Pain is analyzed";
            }

            if ($stateParams.tagVariableObject) {
                $scope.state.helpText = "Search for a child variable " +
                    "that you'd like to tag with " + $stateParams.tagVariableObject.name.toUpperCase() + ".  Then " +
                    "when " + $stateParams.tagVariableObject.name.toUpperCase() +
                    " is analyzed, measurements from your selected tagged variable will be included.";
                $rootScope.stateParams.helpText = $scope.state.helpText + " <br><br> For instance, if " +
                    "your currently selected variable were Sugar, you could search for Coke and tag it with 37 grams of " +
                    "sugar per serving. Then coke measurements would be included when analyzing to see how sugar affects you.  <br><br>" +
                    "If your current parent tag variable were Inflammatory Pain, you could search for Back Pain and then your " +
                    "Inflammatory Pain analysis would include Back Pain measurements as well.";
            }
        }

        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            $rootScope.stateParams = $stateParams;
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
            setHelpText();
        });

        $scope.matchEveryWord = function() {
            return function( item ) {

                if(!item.name){
                    var message = "variable doesn't have a name! variable: " + JSON.stringify(item);
                    console.error(message);
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    return false;
                }

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

                if( $stateParams.excludeDuplicateBloodPressure ) {
                    if(item.name.toLowerCase().indexOf('diastolic') !== -1 ||
                        item.name.toLowerCase().indexOf('systolic') !== -1 ) {
                        return false;
                    }
                }

                if($stateParams.excludeSingularBloodPressure &&  item.name.toLowerCase() === 'blood pressure') {
                    return false;
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