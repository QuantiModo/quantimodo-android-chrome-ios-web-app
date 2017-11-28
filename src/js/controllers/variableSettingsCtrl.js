angular.module('starter').controller('VariableSettingsCtrl', ["$scope", "$state", "$rootScope", "$timeout", "$q", "$mdDialog", "$ionicLoading", "$stateParams", "$ionicHistory", "$ionicActionSheet", "qmService", "qmLogService", function($scope, $state, $rootScope, $timeout, $q, $mdDialog, $ionicLoading,
                 $stateParams, $ionicHistory, $ionicActionSheet, qmService, qmLogService) {
    $scope.controller_name = "VariableSettingsCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.state = {variableObject: null};
    function getVariableName() {
        if($stateParams.variableName){$scope.variableName = $stateParams.variableName;}
        if($stateParams.variableObject){$scope.variableName = $stateParams.variableObject.name;}
        if($scope.variableName){return $scope.variableName;}
        qmLog.error("No variable name in variable settings page!");
        $scope.goBack();
    }
    function getUserVariableWithTags() {
        if(!$rootScope.variableObject){qmService.showBlackRingLoader();}
        qmService.getUserVariablesFromApi({name: getVariableName(), includeTags: true}, function(userVariables){
            qmService.hideLoader();
            if(userVariables && userVariables[0]){
                setVariableObject(userVariables[0]);
            }
        })
    }
    function setVariableObject(variableObject) {
        $rootScope.variableObject = $scope.state.variableObject = variableObject;
        setShowActionSheetMenu(variableObject);
    }
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug(null, 'Entering state ' + $state.current.name, null);
        qmService.sendToLoginIfNecessaryAndComeBack();
        $rootScope.hideNavigationMenu = false;
        if($stateParams.variableObject){
            setVariableObject($stateParams.variableObject);
            getUserVariableWithTags();
        } else {
            getUserVariableWithTags();
        }
    });
    function setShowActionSheetMenu(variableObject) {
        $rootScope.showActionSheetMenu = function() {
            qmLogService.debug('variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $rootScope.variableObject: ', null, variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    qmService.actionSheetButtons.recordMeasurement,
                    qmService.actionSheetButtons.addReminder,
                    qmService.actionSheetButtons.charts,
                    qmService.actionSheetButtons.history,
                    { text: '<i class="icon ion-pricetag"></i>Tag ' + qmService.getTruncatedVariableName(variableObject.name)},
                    { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() { qmLogService.debug(null, 'CANCELLED', null); },
                buttonClicked: function(index) {
                    if(index === 0){qmService.goToState('app.measurementAddVariable', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 1){qmService.goToState('app.reminderAdd', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 2) {qmService.goToState('app.charts', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 3) {qmService.goToState('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
                    if(index === 4) {qmService.goToState('app.tagSearch',  {fromState: $state.current.name, userTaggedVariableObject: variableObject}); }
                    if(index === 5) {$scope.tagAnotherVariable(variableObject);}
                    return true;
                },
                destructiveButtonClicked: function() {qmService.showDeleteAllMeasurementsForVariablePopup(variableObject.name); return true;}
            });
            qmLogService.debug(null, 'Setting hideSheet timeout', null);
            $timeout(function() { hideSheet(); }, 20000);
        };
    }
    $scope.openTagVariableSearchDialog = function($event) {
        $mdDialog.show({
            controller: TagVariableSearchCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose:true
        });
    };
    var TagVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService, $q, $log) {
        var self = this;
        self.variables        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.variableObject = $rootScope.variableObject;
        self.title = "Add a Tag";
        self.helpText = "Search for a variable like an ingredient or category " +
            "that you'd like to tag " + $rootScope.variableObject.name.toUpperCase() + " with.  Then " +
            "when your tag variable is analyzed, measurements from " +
            $rootScope.variableObject.name.toUpperCase() + " will be included.";
        self.placeholder = "Search for a tag...";
        self.getHelp = function(){
            if(self.helpText && !self.showHelp){return self.showHelp = true;}
            qmService.goToState(window.qmStates.help);
            $mdDialog.cancel();
        };
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event) {
            var userTagData;
            if($rootScope.variableObject.unit.abbreviatedName !== '/5'){
                qmService.goToState('app.tagAdd', {
                    userTaggedVariableObject: $rootScope.variableObject,
                    fromState: $state.current.name,
                    fromStateParams: {variableObject: $rootScope.variableObject},
                    userTagVariableObject: self.selectedItem.variable
                });
            } else {
                userTagData = {userTagVariableId: self.selectedItem.variable.id, userTaggedVariableId: $rootScope.variableObject.id, conversionFactor: 1};
                qmService.showBlackRingLoader();
                qmService.postUserTagDeferred(userTagData).then(function (response) {
                    $rootScope.variableObject = response.data.userTaggedVariable;
                    qmService.hideLoader();
                });
            }
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.";
            var deferred = $q.defer();
            var requestParams = {defaultUnitCategoryName:  $rootScope.variableObject.defaultUnitCategoryName};
            if($rootScope.variableObject.defaultUnitCategoryName !== "Rating"){requestParams.defaultUnitCategoryName = "(ne)Rating";}
            qmService.searchUserVariablesDeferred(query, requestParams).then(function(results){ deferred.resolve(loadAll(results)); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.info(null, 'Text changed to ' + text, null); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.buttonText = "Tag Variable";
            qmService.addVariableToLocalStorage(item.variable);
            $log.info(null, 'Item changed to ' + JSON.stringify(item), null);
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){ variables = qmStorage.getAsObject(qmItems.userVariables); }
            if(variables && $rootScope.variableObject.unit.abbreviatedName === '/5'){ variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId)); }
            if(variables){ variables = variables.filter(excludeParentVariable()); }
            return variables.map( function (variable) {
                return {value: variable.name.toLowerCase(), name: variable.name, variable: variable};
            });
        }
        /**
         * Create filter function for a query string
         */
        function filterByProperty(filterPropertyName, allowedFilterValue) {
            return function filterFn(item) { return (item[filterPropertyName] === allowedFilterValue); };
        }
        /**
         * Create filter function for a query string
         */
        function excludeParentVariable() {
            return function filterFn(item) { return (item.id !== $rootScope.variableObject.id); };
        }
    };
    TagVariableSearchCtrl.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "qmLogService", "$q", "$log"];
    $scope.openJoinVariableSearchDialog = function($event) {
        $mdDialog.show({
            controller: JoinVariableSearchCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose:true
        });
    };
    var JoinVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService, $q, $log) {
        var self = this;
        self.variables        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.variableObject = $rootScope.variableObject;
        self.title = "Join a Variable";
        self.helpText = "Search for a duplicated or synonymous variable that you'd like to join to " +
            self.variableObject.name + ". Once joined, its measurements will be included in the analysis of " +
            self.variableObject.name + ".  You can only join variables that have the same unit " +
            self.variableObject.unit.abbreviatedName + ".";
        self.placeholder = "What variable would you like to join?";
        self.getHelp = function(){
            if(self.helpText && !self.showHelp){return self.showHelp = true;}
            qmService.goToState(window.qmStates.help);
            $mdDialog.cancel();
        };
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event) {
            var variableData = {
                parentVariableId: $rootScope.variableObject.id,
                joinedVariableId: self.selectedItem.variable.id,
                conversionFactor: 1
            };
            qmService.showBlackRingLoader();
            qmService.postVariableJoinDeferred(variableData).then(function (response) {
                qmService.hideLoader();
                $rootScope.variableObject = response.data.parentVariable;
            }, function (error) {
                qmService.hideLoader();
                qmLogService.error(null, error);
            });
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.";
            var deferred = $q.defer();
            qmService.searchUserVariablesDeferred(query, {tagVariableId: $rootScope.variableObject.defaultUnitId})
                .then(function(results){ deferred.resolve(loadAll(results)); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.info(null, 'Text changed to ' + text, null); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.buttonText = "Join Variable";
            qmService.addVariableToLocalStorage(item.variable);
            $log.info(null, 'Item changed to ' + JSON.stringify(item), null);
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){variables = qmStorage.getAsObject(qmItems.userVariables); }
            if(variables){ variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId)); }
            if(variables){ variables = variables.filter(excludeParentVariable()); }
            return variables.map( function (variable) {
                return {
                    value: variable.name.toLowerCase(),
                    name: variable.name,
                    variable: variable
                };
            });
        }
        /**
         * Create filter function for a query string
         */
        function filterByProperty(filterPropertyName, allowedFilterValue) {
            return function filterFn(item) { return (item[filterPropertyName] === allowedFilterValue); };
        }
        /**
         * Create filter function for a query string
         */
        function excludeParentVariable() {
            return function filterFn(item) { return (item.id !== $rootScope.variableObject.id); };
        }
    };
    JoinVariableSearchCtrl.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "qmLogService", "$q", "$log"];
    var SelectWikpdediaArticleController = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService, $q, $log, dataToPass) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dataToPass.title;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.getHelp = function(){
            if(self.helpText && !self.showHelp){return self.showHelp = true;}
            qmService.goToState(window.qmStates.help);
            $mdDialog.cancel();
        };
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event, variableName) { $mdDialog.hide($scope.variable); };
        function querySearch (query) {
            self.notFoundText = "No articles matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            if(!query || !query.length){ query = dataToPass.variableName; }
            wikipediaFactory.searchArticles({
                term: query, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
                //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (repsonse) {
                if(repsonse.data.query) {
                    deferred.resolve(loadAll(repsonse.data.query.pages));
                    $scope.causeWikiEntry = repsonse.data.query.pages[0].extract;
                    //$rootScope.correlationObject.studyBackground = $rootScope.correlationObject.studyBackground + '<br>' + $scope.causeWikiEntry;
                    if(repsonse.data.query.pages[0].thumbnail){$scope.causeWikiImage = repsonse.data.query.pages[0].thumbnail.source;}
                } else {
                    var error = 'Wiki not found for ' + query;
                    qmLogService.error(null, error);
                    qmLogService.error(null, error);
                }
            }).catch(function (error) {qmLogService.error(null, error);});
            return deferred.promise;
        }
        function searchTextChange(text) { qmLogService.debug(null, 'Text changed to ' + text, null); }
        function selectedItemChange(item) {
            $rootScope.variableObject.wikipediaPage = item.page;
            $rootScope.variableObject.wikipediaExtract = item.page.extract;
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(pages) {
            if(!pages){ return []; }
            return pages.map( function (page) {
                return {
                    value: page.title,
                    display: page.title,
                    page: page,
                };
            });
        }
    };
    SelectWikpdediaArticleController.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "qmLogService", "$q", "$log", "dataToPass"];
    $scope.searchWikipediaArticle = function (ev) {
        $mdDialog.show({
            controller: SelectWikpdediaArticleController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: "Select Wikipedia Article",
                    helpText: "Change the search query until you see a relevant article in the search results.  This article will be included in studies involving this variable.",
                    placeholder: "Search for a Wikipedia article...",
                    buttonText: "Select Article",
                    variableName: $rootScope.variableObject.name
                }
            },
        }).then(function(page) {
            $rootScope.variableObject.wikipediaPage = page;
        }, function() {
            qmLogService.debug(null, 'User cancelled selection', null);
        });
    };
    $scope.resetVariableToDefaultSettings = function(variableObject) {
        // Populate fields with original settings for variable
        qmService.showBlackRingLoader();
        qmService.resetUserVariableDeferred(variableObject.id).then(function(userVariable) {
            $rootScope.variableObject = userVariable;
            //qmService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
        });
    };
    $scope.saveVariableSettings = function(variableObject){
        qmService.showBlackRingLoader();
        var experimentEndTimeString, experimentStartTimeString = null;
        if(variableObject.experimentStartTimeString){
            try {
                experimentStartTimeString = variableObject.experimentStartTimeString.toISOString();
            } catch (error){
                qmLogService.error(null, 'Could not convert experimentStartTimeString to ISO format', {experimentStartTimeString: variableObject.experimentStartTimeString, errorMessage: error});
            }
        }
        if(variableObject.experimentEndTimeString){
            try {
                experimentEndTimeString = variableObject.experimentEndTimeString.toISOString();
            } catch (error){
                qmLogService.error(null, 'Could not convert experimentEndTimeString to ISO format', {experimentEndTimeString: variableObject.experimentEndTimeString, errorMessage: error});
            }
        }
        console.log("debugMode is " + window.debugMode);
        var body = {
            variableId: variableObject.id,
            durationOfAction: variableObject.durationOfActionInHours*60*60,
            fillingValue: variableObject.fillingValue,
            //joinWith
            maximumAllowedValue: variableObject.maximumAllowedValue,
            minimumAllowedValue: variableObject.minimumAllowedValue,
            onsetDelay: variableObject.onsetDelayInHours*60*60,
            combinationOperation: variableObject.combinationOperation,
            shareUserMeasurements: variableObject.shareUserMeasurements,
            defaultUnitId: variableObject.userVariableDefaultUnitId,
            userVariableVariableCategoryName: variableObject.userVariableVariableCategoryName,
            //userVariableAlias: $scope.state.userVariableAlias
            experimentStartTimeString: experimentStartTimeString,
            experimentEndTimeString: experimentEndTimeString
        };
        qmService.postUserVariableDeferred(body).then(function(userVariable) {
            qmService.hideLoader();
            qmService.showInfoToast('Saved ' + variableObject.name + ' settings');
            $scope.goBack({variableObject: userVariable});  // Temporary workaround to make tests pass
        }, function(error) {
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
}]);
