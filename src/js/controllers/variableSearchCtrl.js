angular.module('starter').controller('VariableSearchCtrl',
    ["$scope", "$state", "$rootScope", "$stateParams", "$timeout", "$filter", "qmService",
        function($scope, $state, $rootScope, $stateParams, $timeout, $filter, qmService){
        $scope.controller_name = "VariableSearchCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.$on('$ionicView.beforeEnter', function(e){
            qmLog.info($state.current.name + ' beforeEnter...');
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            //qm.objectHelper.copyPropertiesFromOneObjectToAnother($stateParams, $scope.state, true);
            $scope.state = JSON.parse(JSON.stringify($stateParams)); // Overwrites cached results.  Necessary if in a different state
            $scope.state.searching = true;
            $scope.state.variableSearchResults = [];
            if(!$scope.state.variableSearchParameters){$scope.state.variableSearchParameters = {};}
            $scope.state.variableSearchParameters.searchPhrase = "";
            if(!$scope.state.noVariablesFoundCard){
                $scope.state.noVariablesFoundCard = {
                    show: false,
                    title: 'No Variables Found',
                    body: "You don't have any data, yet.  Start tracking!"
                };
            }
            if(!$scope.state.title){$scope.state.title = "Select Variable";}
            if(!$scope.state.variableSearchPlaceholderText){$scope.state.variableSearchPlaceholderText = "Search for a variable here...";}
            $scope.state.variableSearchParameters.variableCategoryName = getVariableCategoryName();
            //$scope.showBarcodeScanner = $rootScope.platform.isMobile && (qm.arrayHelper.inArray($scope.state.variableSearchParameters.variableCategoryName, ['Anything', 'Foods', 'Treatments']));
            if(getVariableCategoryName()){
                $scope.state.variableSearchPlaceholderText = "Search for a " + getPluralVariableCategoryName().toLowerCase() + " here...";
                $scope.state.title = "Select " + getPluralVariableCategoryName();
                $scope.state.noVariablesFoundCard.title = 'No ' + getVariableCategoryName() + ' Found';
            }
            setHelpText();
        });
        $scope.$on('$ionicView.enter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info($state.current.name + ' enter...');
            // We always need to repopulate in case variable was updated in local storage and the search view was cached
            populateSearchResults();
            setHelpText();
            qmService.hideLoader();
            var upcTest = false;
            if(upcTest){
                $scope.state.variableSearchParameters.barcode = $scope.state.variableSearchParameters.searchPhrase = "028400064057";
                $scope.onVariableSearch(function(){
                });
            }
            if(qm.urlHelper.getParam('upc')){
                qmService.barcodeScanner.scanSuccessHandler({text: qm.urlHelper.getParam('upc')},
                    {}, function(variables){
                    console.log(variables)
                }, function(error){
                    console.error(error);
                })
            }
        });
        function saveTagged(selected) {
            if ($scope.state.userTagVariableObject.unitAbbreviatedName !== '/5') {
                qmService.goToState(getNextState(), {
                    userTaggedVariableObject: selected,
                    fromState: $scope.state.fromState,
                    fromStateParams: {variableObject: $scope.state.userTagVariableObject},
                    userTagVariableObject: $scope.state.userTagVariableObject
                });
            } else {
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred({
                    userTagVariableId: $scope.state.userTagVariableObject.variableId,
                    userTaggedVariableId: selected.variableId,
                    conversionFactor: 1
                }).then(function () {
                    qmService.hideLoader();
                    if ($scope.state.fromState) {
                        qmService.goToState($scope.state.fromState, {variableName: $scope.state.userTagVariableObject.name});
                    } else {
                        qmService.goToDefaultState();
                    }
                });
            }
        }
        function getNextState() {
            var s = $state.current;
            var next = s.params.nextState;
            if(!next){
                console.info("No next state!")
                return null;
            }
            return next;
        }
        function saveTag(selected) {
            if ($scope.state.userTaggedVariableObject.unitAbbreviatedName !== '/5') {
                qmService.goToState(getNextState(), {
                    userTaggedVariableObject: $scope.state.userTaggedVariableObject,
                    fromState: $scope.state.fromState,
                    fromStateParams: {variableObject: $scope.state.userTaggedVariableObject},
                    userTagVariableObject: selected
                });
            } else {
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred({
                    userTagVariableId: selected.variableId,
                    userTaggedVariableId: $scope.state.userTaggedVariableObject.variableId,
                    conversionFactor: 1
                }).then(function () {
                    qmService.hideLoader();
                    if ($scope.state.fromState) {
                        qmService.goToState($scope.state.fromState, {variableName: $scope.state.userTaggedVariableObject.name});
                    } else {
                        qmService.goToDefaultState();
                    }
                });
            }
        }
        $scope.selectVariable = function(selected){
            selected = qmService.barcodeScanner.addUpcToVariableObject(selected);
            var next = getNextState();
            if(!next){
                $scope.showVariableActionSheet(selected, [], $scope.state);
                return;
            }
            var s = $state.current;
            qmLog.info(s.name + ': ' + '$scope.selectVariable: ' + JSON.stringify(selected).substring(0, 140) + '...', null);
            qm.variablesHelper.setLastSelectedAtAndSave(selected);
            $scope.state.variableSearchParameters.searchPhrase = '';
            if(s.name === 'app.favoriteSearch'){
                qmService.addToFavoritesUsingVariableObject(selected);
            }else if(window.location.href.indexOf('reminder-search') !== -1){
                qmService.reminders.addToRemindersUsingVariableObject(selected, {
                    skipReminderSettingsIfPossible: $scope.state.skipReminderSettingsIfPossible,
                    doneState: $scope.state.doneState
                });
            }else if(next.indexOf('predictor') !== -1){
                qmService.goToState(next, {effectVariableName: selected.name});
            }else if(next.indexOf('outcome') !== -1){
                qmService.goToState(next, {causeVariableName: selected.name});
            }else if($scope.state.userTaggedVariableObject){
                saveTag(selected);
            }else if($scope.state.userTagVariableObject){
                saveTagged(selected);
            }else{
                $scope.state.variableName = selected.name;
                $scope.state.variableObject = selected;
                qmService.goToState(next, $scope.state);
            }
        };
        $scope.goToStateFromVariableSearch = function(stateName, params){
            if(!params){params = $stateParams;}
            qmService.goToState(stateName, params);
        };
        // when a query is searched in the search box
        function showAddVariableButtonIfNecessary(variables){
            var barcode = $scope.state.variableSearchParameters.barcode;
            if(barcode && barcode === $scope.state.variableSearchParameters.searchPhrase){
                $scope.state.showAddVariableButton = false;
                return;
            }
            if($scope.state.doNotShowAddVariableButton){
                $scope.state.showAddVariableButton = false;
                return;
            }
            var resultIndex = 0;
            var found = false;
            while(!found && resultIndex < $scope.state.variableSearchResults.length){
                if($scope.state.variableSearchResults[resultIndex].name.toLowerCase() ===
                    $scope.state.variableSearchParameters.searchPhrase.toLowerCase()){
                    found = true;
                }else{
                    resultIndex++;
                }
            }
            // If no results or no exact match, show "+ Add [variable]" button for query
            if((variables.length < 1 || !found)){
                //debugger
                $scope.showSearchLoader = false;
                qmLog.info($state.current.name + ': ' + '$scope.onVariableSearch: Set showAddVariableButton to true', null);
                $scope.state.showAddVariableButton = true;
                var s = $state.current;
                var next = s.params.nextState;
                var text;
                var q = $scope.state.variableSearchParameters.searchPhrase;
                if(next === qm.staticData.stateNames.reminderAdd){
                    text = '+ Add ' + q + ' reminder';
                }else if(next === qm.staticData.stateNames.measurementAdd){
                    text = '+ Add ' + q + ' measurement';
                }else{
                    text = '+ ' + q;
                }
                $scope.safeApply(function(){
                    $scope.state.addNewVariableButtonText = text;
                })
            }
        }
        function showNoVariablesFoundCardIfNecessary(errorHandler){
            if($scope.state.variableSearchResults.length || !$scope.state.doNotShowAddVariableButton){
                $scope.state.noVariablesFoundCard.show = false;
                return;
            }
            $scope.state.noVariablesFoundCard.title = $scope.state.variableSearchParameters.searchPhrase + ' Not Found';
            if($scope.state.noVariablesFoundCard && $scope.state.noVariablesFoundCard.body){
                $scope.state.noVariablesFoundCard.body = $scope.state.noVariablesFoundCard.body.replace(
                    '__VARIABLE_NAME__', $scope.state.variableSearchParameters.searchPhrase.toUpperCase());
            }else{
                $scope.state.noVariablesFoundCard.body = "You don't have any data for " +
                    $scope.state.variableSearchParameters.searchPhrase.toUpperCase() + ", yet.  Start tracking!";
            }
            if(errorHandler){
                errorHandler();
            }
            $scope.state.noVariablesFoundCard.show = true;
        }
        function variableSearchSuccessHandler(variables, successHandler, errorHandler){
            if(successHandler && variables && variables.length){
                successHandler();
            }
            if(errorHandler && (!variables || !variables.length)){
                errorHandler();
            }
            addVariablesToScope(variables);
            if(!errorHandler){
                $scope.safeApply(function (){
                    showAddVariableButtonIfNecessary(variables);
                })
            }
            showNoVariablesFoundCardIfNecessary(errorHandler);
        }
        function addVariablesToScope(variables){
            variables = qm.arrayHelper.removeArrayElementsWithDuplicateIds(variables, 'variable');
            $scope.safeApply(function(){
                $scope.state.noVariablesFoundCard.show = false;
                $scope.state.showAddVariableButton = false;
                $scope.state.variableSearchResults = variables;
                var count = (variables) ? variables.length : 0;
                qmLog.info(count + ' variable search results from ' + $scope.state.variableSearchParameters.searchPhrase + " search");
                $scope.state.searching = false;
            });
        }
        function getVariableSearchParameters(){
            // $stateParams.variableSearchParameters.searchPhrase is getting populated somehow and is not being updated
            delete $stateParams.variableSearchParameters.searchPhrase;
            return qm.objectHelper.copyPropertiesFromOneObjectToAnother($scope.state.variableSearchParameters,
                $stateParams.variableSearchParameters, false);
        }
        $scope.onVariableSearch = function(successHandler, errorHandler){
            $scope.state.noVariablesFoundCard.show = false;
            $scope.state.showAddVariableButton = false;
            var params = getVariableSearchParameters();
            var q = $scope.state.variableSearchParameters.searchPhrase;
            qmLog.info($state.current.name + ': ' + 'Search term: ' + q + " with params: ", params);
            if(q.length > 2){
                $scope.state.searching = true;
                params.searchPhrase = q;
                qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                    variableSearchSuccessHandler(variables, successHandler, errorHandler);
                });
            }else{
                populateSearchResults();
            }
        };
        var populateSearchResults = function(){
            var q = $scope.state.variableSearchParameters.searchPhrase;
            if(q.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            var previous = $scope.state.variableSearchResults;
            if(!previous || previous.length < 1){$scope.state.searching = true;}
            var params = getVariableSearchParameters();
            qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                qmLog.info("Got "+variables.length+" matching params: ", params)
                if(variables && variables.length > 0){
                    if(q.length < 3){
                        // Not sure what this is for but it breaks the category filter: if(previous){variables = previous.concat(variables);}
                        addVariablesToScope(variables);
                    }
                }else{
                    $scope.state.noVariablesFoundCard.show = true;
                    $scope.state.searching = false;
                }
            });
        };
        $scope.addNewVariable = function(){
            var variableObject = {};
            variableObject = qmService.barcodeScanner.addUpcToVariableObject(variableObject);
            variableObject.name = $scope.state.variableSearchParameters.searchPhrase;
            if(getVariableCategoryName()){
                variableObject.variableCategoryName = getVariableCategoryName();
            }
            qmLog.info($state.current.name + ': ' + '$scope.addNewVariable: ' + JSON.stringify(variableObject));
            $scope.state.variableObject = variableObject;
            qmService.goToState(getNextState(), $scope.state);
        };
        function setHelpText(){
            if($scope.state.userTaggedVariableObject){
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
            if($scope.state.userTagVariableObject){
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
            var singularCategoryName = getSingularVariableCategoryName();
            if(!$scope.state.helpText && singularCategoryName){
                $scope.state.helpText = 'Enter a ' + singularCategoryName.toLowerCase() + ' in the search box or select one from the list below.';
            }
            if(!$scope.state.helpText){
                $scope.state.helpText = 'Enter a variable in the search box or select one from the list below.';
            }
        }
        function getSingularVariableCategoryName(){
            var variableCategory = getVariableCategory();
            if(variableCategory && variableCategory.variableCategoryNameSingular){
                return variableCategory.variableCategoryNameSingular;
            }
            return null;
        }
        function getVariableCategory(){
            var name = getVariableCategoryName();
            if(name){return qm.variableCategoryHelper.findByNameIdObjOrUrl(name);}
            return null;
        }
        function getVariableCategoryName(){
            var fromUrl = qm.variableCategoryHelper.getNameFromStateParamsOrUrl();
            if(fromUrl){return fromUrl;}
            var params = getVariableSearchParameters();
            if(params.variableCategoryName){
                return params.variableCategoryName;
            }
            return qm.variableCategoryHelper.getNameFromStateParamsOrUrl($stateParams);
        }
        function getPluralVariableCategoryName(){
            return $filter('wordAliases')(pluralize(getVariableCategoryName(), 1));
        }
        // https://open.fda.gov/api/reference/ API Key https://open.fda.gov/api/reference/
        $scope.scanBarcode = function(){
            var params = getVariableSearchParameters();
            qmService.barcodeScanner.scanBarcode(params, variableSearchSuccessHandler, function(error){
                qmLog.error(error);
            });
        }
    }]);
