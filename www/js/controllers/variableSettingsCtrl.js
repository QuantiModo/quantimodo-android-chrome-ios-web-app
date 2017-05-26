angular.module('starter').controller('VariableSettingsCtrl', function($scope, $state, $rootScope, $timeout, $q, $mdDialog, $ionicLoading,
                 $stateParams, $ionicHistory, $ionicActionSheet, quantimodoService) {
    $scope.controller_name = "VariableSettingsCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        $rootScope.hideNavigationMenu = false;
        console.debug($state.current.name + ' initializing...');
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        $scope.loading = true;
        if($stateParams.variableObject){
            $scope.setupVariableByVariableObject($stateParams.variableObject);
            refreshUserVariable($stateParams.variableObject.name);
        } else if ($stateParams.variableName) {
            $rootScope.variableName = $stateParams.variableName;
            $scope.getUserVariableByName($rootScope.variableName);
            refreshUserVariable($rootScope.variableName);
        } else if ($rootScope.variableObject) {
            $scope.setupVariableByVariableObject($rootScope.variableObject);
            refreshUserVariable($rootScope.variableObject.name);
        } else {
            console.error("Variable name not provided to variable settings controller!");
            $state.go(config.appSettings.defaultState);
            //$ionicHistory.goBack();  Plain goBack can cause infinite loop if we came from a tagAdd controller
        }
    });
    function getTruncatedVariableName(variableName) {
        if(variableName.length > 18){return variableName.substring(0, 18) + '...';} else { return variableName;}
    }
    function refreshUserVariable(variableName) {
        quantimodoService.refreshUserVariableByNameDeferred(variableName).then(function(userVariable){$rootScope.variableObject = userVariable;});
    }
    $rootScope.showActionSheetMenu = function() {
        console.debug("variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $rootScope.variableObject: ", $rootScope.variableObject);
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                quantimodoService.actionSheetButtons.recordMeasurement,
                quantimodoService.actionSheetButtons.addReminder,
                quantimodoService.actionSheetButtons.charts,
                quantimodoService.actionSheetButtons.history,
                { text: '<i class="icon ion-pricetag"></i>Tag ' + getTruncatedVariableName($rootScope.variableObject.name)},
                { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}

            ],
            destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() { console.debug('CANCELLED'); },
            buttonClicked: function(index) {
                if(index === 0){$state.go('app.measurementAddVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 1){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 2) {$state.go('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 3) {$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 4) {$state.go('app.tagSearch',  {fromState: $state.current.name, userTaggedVariableObject: $rootScope.variableObject}); }
                if(index === 5) {$scope.tagAnotherVariable($rootScope.variableObject);}
                return true;
            },
            destructiveButtonClicked: function() {quantimodoService.showDeleteAllMeasurementsForVariablePopup($rootScope.variableObject); return true;}
        });
        console.debug('Setting hideSheet timeout');
        $timeout(function() { hideSheet(); }, 20000);
    };
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
    var TagVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log) {
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
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event) {
            var userTagData;
            if($rootScope.variableObject.userVariableDefaultUnitAbbreviatedName !== '/5'){
                $state.go('app.tagAdd', {
                    userTaggedVariableObject: $rootScope.variableObject,
                    fromState: $state.current.name,
                    fromStateParams: {variableObject: $rootScope.variableObject},
                    userTagVariableObject: self.selectedItem.variable
                });
            } else {
                userTagData = {userTagVariableId: self.selectedItem.variable.id, userTaggedVariableId: $rootScope.variableObject.id, conversionFactor: 1};
                quantimodoService.showLoader();
                quantimodoService.postUserTagDeferred(userTagData).then(function (response) {
                    $rootScope.variableObject = response.data.userTaggedVariable;
                    quantimodoService.hideLoader();
                });
            }
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.";
            var deferred = $q.defer();
            var requestParams = {defaultUnitCategoryName:  $rootScope.variableObject.defaultUnitCategoryName};
            if($rootScope.variableObject.defaultUnitCategoryName !== "Rating"){requestParams.defaultUnitCategoryName = "(ne)Rating";}
            quantimodoService.searchUserVariablesDeferred(query, requestParams).then(function(results){ deferred.resolve(loadAll(results)); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.info('Text changed to ' + text); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.buttonText = "Tag Variable";
            quantimodoService.addVariableToLocalStorage(item.variable);
            $log.info('Item changed to ' + JSON.stringify(item));
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){ variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables')); }
            if(variables && $rootScope.variableObject.defaultUnitAbbreviatedName === '/5'){ variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId)); }
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
    var JoinVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log) {
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
            self.variableObject.userVariableDefaultUnitAbbreviatedName + ".";
        self.placeholder = "What variable would you like to join?";
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event) {
            var variableData = {
                parentVariableId: $rootScope.variableObject.id,
                joinedVariableId: self.selectedItem.variable.id,
                conversionFactor: 1
            };
            quantimodoService.showLoader();
            quantimodoService.postVariableJoinDeferred(variableData).then(function (response) {
                quantimodoService.hideLoader();
                $rootScope.variableObject = response.data.parentVariable;
            }, function (error) {
                quantimodoService.hideLoader();
                console.error(error);
            });
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.";
            var deferred = $q.defer();
            quantimodoService.searchUserVariablesDeferred(query, {tagVariableId: $rootScope.variableObject.defaultUnitId})
                .then(function(results){ deferred.resolve(loadAll(results)); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.info('Text changed to ' + text); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.buttonText = "Join Variable";
            quantimodoService.addVariableToLocalStorage(item.variable);
            $log.info('Item changed to ' + JSON.stringify(item));
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables')); }
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
});
