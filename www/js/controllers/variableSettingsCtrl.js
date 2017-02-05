angular.module('starter')

    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $state, $rootScope, $timeout, $ionicPopup, $q, $mdDialog, $ionicLoading,
                 $stateParams, $ionicHistory, $ionicActionSheet) {

        $scope.controller_name = "VariableSettingsCtrl";
        $rootScope.showFilterBarSearchIcon = false;

        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        $rootScope.showActionSheetMenu = function() {
            console.debug("variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $rootScope.variableObject: ", $rootScope.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'},
                    { text: '<i class="icon ion-pricetag"></i>Tag ' + $rootScope.variableObject.name},
                    { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}

                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug('variableSettingsCtrl BUTTON CLICKED: ' + index);
                    if(index === 0){
                        $scope.addToFavoritesUsingVariableObject($rootScope.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddMeasurementForVariableObject($rootScope.variableObject);
                    }
                    if(index === 2){
                        $scope.goToAddReminderForVariableObject($rootScope.variableObject);
                    }
                    if (index === 3) {
                        $scope.goToChartsPageForVariableObject($rootScope.variableObject);
                    }
                    if(index === 4) {
                        console.debug('variableSettingsCtrl going to history' + JSON.stringify($rootScope.variableObject));
                        $scope.goToHistoryForVariableObject($rootScope.variableObject);
                    }
                    if (index === 5) {
                        $scope.addTag($rootScope.variableObject);
                    }
                    if(index === 6) {
                        console.debug('variableSettingsCtrl going to history' + JSON.stringify($rootScope.variableObject));
                        $scope.tagAnotherVariable($rootScope.variableObject);
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.showDeleteAllMeasurementsForVariablePopup();
                    return true;
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.loading = true;
            $scope.showLoader('Getting variable details');
            if($stateParams.variableObject){
                $scope.setupVariableByVariableObject($stateParams.variableObject);
            } else if ($stateParams.variableName) {
                $rootScope.variableName = $stateParams.variableName;
                $scope.getUserVariableByName($rootScope.variableName);
            } else if ($rootScope.variableObject) {
                $scope.setupVariableByVariableObject($rootScope.variableObject);
            } else {
                console.error("Variable name not provided to variable settings controller!");
                $state.go(config.appSettings.defaultState);
                //$ionicHistory.goBack();  Plain goBack can cause infinite loop if we came from a tagAdd controller
            }
        });

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

        var TagVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter,
                                          quantimodoService, $q, $log) {

            var self = this;

            self.simulateQuery = true;
            self.isDisabled    = false;

            // list of `state` value/display objects
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

            self.newVariable = newVariable;

            self.cancel = function($event) {
                $mdDialog.cancel();
            };

            self.finish = function($event) {
                var userTagData;
                if($rootScope.variableObject.abbreviatedUnitName !== '/5'){
                    $state.go('app.tagAdd', {
                        userTaggedVariableObject: $rootScope.variableObject,
                        fromState: $state.current.name,
                        fromStateParams: {variableObject: $rootScope.variableObject},
                        userTagVariableObject: self.selectedItem.variable
                    });
                } else {
                    userTagData = {
                        userTagVariableId: self.selectedItem.variable.id,
                        userTaggedVariableId: $rootScope.variableObject.id,
                        conversionFactor: 1
                    };

                    $ionicLoading.show();
                    quantimodoService.postUserTagDeferred(userTagData).then(function (response) {
                        $rootScope.variableObject = response.data.userTaggedVariable;
                        $ionicLoading.hide();
                    });
                }

                $mdDialog.hide();
            };

            function newVariable(variable) {
                alert("Sorry! You'll need to create a Constitution for " + variable + " first!");
            }

            function querySearch (query) {
                self.notFoundText = "No variables matching " + query + " were found.";
                var deferred = $q.defer();
                var requestParams = {};
                if($rootScope.variableObject.defaultUnitAbbreviatedName === '/5'){
                    requestParams = {defaultUnitId: $rootScope.variableObject.defaultUnitId};
                }

                quantimodoService.searchUserVariablesDeferred(query, requestParams)
                    .then(function(results){
                        deferred.resolve(loadAll(results));
                    });
                return deferred.promise;
            }

            function searchTextChange(text) {
                $log.info('Text changed to ' + text);
            }

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
                if(!variables){
                    variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables'));
                }

                if(variables && $rootScope.variableObject.defaultUnitAbbreviatedName === '/5'){
                    variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId));
                }

                if(variables){
                    variables = variables.filter(excludeParentVariable());
                }

                return variables.map( function (variable) {
                    return {
                        value: variable.name.toLowerCase(),
                        display: variable.name,
                        variable: variable
                    };
                });
            }

            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(item) {
                    return (item.value.indexOf(lowercaseQuery) !== -1);
                };
            }

            /**
             * Create filter function for a query string
             */
            function filterByProperty(filterPropertyName, allowedFilterValue) {
                return function filterFn(item) {
                    return (item[filterPropertyName] === allowedFilterValue);
                };
            }

            /**
             * Create filter function for a query string
             */
            function excludeParentVariable() {
                return function filterFn(item) {
                    return (item.id !== $rootScope.variableObject.id);
                };
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

        var JoinVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter,
                                          quantimodoService, $q, $log) {

            var self = this;

            self.simulateQuery = true;
            self.isDisabled    = false;

            // list of `state` value/display objects
            self.variables        = loadAll();
            self.querySearch   = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange   = searchTextChange;

            self.variableObject = $rootScope.variableObject;

            self.title = "Join a Variable";
            self.helpText = "Search for a duplicated or synonymous variable that you'd like to join to " +
                self.variableObject.name + ". Once joined, its measurements will be included in the analysis of " +
                self.variableObject.name + ".  You can only join variables that have the same unit " +
                self.variableObject.abbreviatedUnitName + ".";
            self.placeholder = "What variable would you like to join?";

            self.newVariable = newVariable;

            self.cancel = function($event) {
                $mdDialog.cancel();
            };

            self.finish = function($event) {
                var variableData = {
                    parentVariableId: $rootScope.variableObject.id,
                    joinedVariableId: self.selectedItem.variable.id,
                    conversionFactor: 1
                };
                $ionicLoading.show();
                quantimodoService.postVariableJoinDeferred(variableData).then(function (response) {
                    $ionicLoading.hide();
                    $rootScope.variableObject = response.data.parentVariable;
                }, function (error) {
                    $ionicLoading.hide();
                    console.error(error);
                });

                $mdDialog.hide();
            };

            function newVariable(variable) {
                alert("Sorry! You'll need to create a Constitution for " + variable + " first!");
            }

            function querySearch (query) {
                self.notFoundText = "No variables matching " + query + " were found.";
                var deferred = $q.defer();
                quantimodoService.searchUserVariablesDeferred(query, {defaultUnitId: $rootScope.variableObject.defaultUnitId})
                    .then(function(results){
                        deferred.resolve(loadAll(results));
                    });
                return deferred.promise;
            }

            function searchTextChange(text) {
                $log.info('Text changed to ' + text);
            }

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
                if(!variables){
                    variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables'));
                }

                if(variables){
                    variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId));
                }

                if(variables){
                    variables = variables.filter(excludeParentVariable());
                }

                return variables.map( function (variable) {
                    return {
                        value: variable.name.toLowerCase(),
                        display: variable.name,
                        variable: variable
                    };
                });
            }

            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(item) {
                    return (item.value.indexOf(lowercaseQuery) !== -1);
                };
            }

            /**
             * Create filter function for a query string
             */
            function filterByProperty(filterPropertyName, allowedFilterValue) {
                return function filterFn(item) {
                    return (item[filterPropertyName] === allowedFilterValue);
                };
            }

            /**
             * Create filter function for a query string
             */
            function excludeParentVariable() {
                return function filterFn(item) {
                    return (item.id !== $rootScope.variableObject.id);
                };
            }
        };
    });
