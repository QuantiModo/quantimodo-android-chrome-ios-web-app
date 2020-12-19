angular.module('starter').controller('SearchPageCtrl', ["$scope", "$q", "$state", "$timeout", "$rootScope",
    "$ionicLoading", "$ionicActionSheet", "$stateParams", "qmService",
    function ($scope, $q, $state, $timeout, $rootScope, $ionicLoading, $ionicActionSheet, $stateParams, qmService) {
        var self = this;
        var dialogParams = {requestParams: {}};
        //debugger
        if (!dialogParams.placeholder) {
            dialogParams.placeholder = "Enter a variable";
        }
        if (dialogParams.requestParams && dialogParams.requestParams.variableCategoryName) {
            var cat = qm.variableCategoryHelper.findByNameIdObjOrUrl(dialogParams.requestParams);
            if (cat) {
                var name = cat.variableCategoryNameSingular.toLowerCase();
                dialogParams.title = 'Select ' + name;
                dialogParams.placeholder = dialogParams.placeholder.replace('variable', name);
                dialogParams.helpText = dialogParams.helpText.replace('variable', name);
            }
        }
        if (qm.platform.isMobile()) {
            dialogParams.placeholder += ' or press camera to scan';
            dialogParams.helpText += '. Press the camera button to scan a barcode.';
        }
        $timeout(function () {
            showVariableList();
        }, 500);
        qm.mic.wildCardHandler = function (tag) {
            showVariableList();
            if (qm.speech.callback) {
                qm.speech.callback(tag);
            }
            qm.speech.lastUserStatement = tag;
            qmLog.info("Just heard user say " + tag);
            querySearch(tag);
            self.searchText = tag;
        };
        self.minLength = dialogParams.minLength || 0;
        self.dialogParameters = dialogParams;
        self.querySearch = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange = searchTextChange;
        self.platform = {};
        self.platform.isMobile = $rootScope.platform.isMobile;
//self.showHelp = !($rootScope.platform.isMobile);
        self.showHelp = true;
        self.title = dialogParams.title;
        self.helpText = dialogParams.helpText;
        self.placeholder = dialogParams.placeholder;
        self.createNewVariable = createNewVariable;
        self.getHelp = function () {
            if (self.helpText && !self.showHelp) {
                return self.showHelp = true;
            }
            qmService.goToState(window.qm.staticData.stateNames.help);
        };
        self.cancel = function () {
            self.items = null;
        };
        self.finish = function () {
            self.items = null;
            $scope.variable = qmService.barcodeScanner.addUpcToVariableObject($scope.variable);
            qm.urlHelper.goToUrl($scope.variable.url)
        };
        self.scanBarcode = function (deferred) {
            self.helpText = "One moment please";
            self.searchText = "Searching by barcode...";
            self.title = "Barcode Search";
            self.loading = true;

            function noResultsHandler(userErrorMessage) {
                self.helpText = userErrorMessage;
                self.title = "No matches found";
                self.searchText = "";
                delete dialogParams.requestParams.upc;
                delete dialogParams.requestParams.barcodeFormat;
                deferred.reject(self.title);
                querySearch();
                qmLog.error(userErrorMessage);
                showVariableList();
            }

            if (!qm.platform.isMobile()) {
                qmService.barcodeScanner.quaggaScan();
                return;
            }
            qmService.barcodeScanner.scanBarcode(dialogParams.requestParams, function (variables) {
                if (variables && variables.length) {
                    self.helpText = "If you don't see what you're looking for, click the x and try a manual search";
                    self.lastResults = variables;
                    self.items = convertVariablesToToResultsList(variables);
                    self.searchText = "Barcode search results";
                    deferred.resolve(self.items);
                    showVariableList();
                    //self.selectedItemChange(self.items[0]);
                    //self.searchText = variables[0].name;
                    //qmService.actionSheets.showVariableObjectActionSheet(variables[0].name, variables[0])
                    //$mdDialog.hide(variables[0]);
                } else {
                    var userErrorMessage = qmService.barcodeScanner.noVariableResultsHandler();
                    noResultsHandler(userErrorMessage);
                }
            }, function (userErrorMessage) {
                noResultsHandler(userErrorMessage)
            });
        };

        function logDebug(message, queryString) {
            if (queryString) {
                message += "(" + queryString + ")";
            }
            qmLog.debug("VariableSearchDialog: " + message)
        }

        logDebug("Opened search dialog");

        function showVariableList() {
            $timeout(function () {
                if (self.items && self.items.length) {
                    self.hidden = false;
                    logDebug("showing list");
                    document.querySelector('#variable-search-box').focus();
                    document.getElementById('#variable-search-box').querySelector('input').focus();
                    //document.getElementById('variable-search-box').focus();
                    //document.getElementById('variable-search-box').select();
                } else {
                    logDebug("Not showing list because we don't have results yet");
                }
            }, 100);
        }

        function createNewVariable(variableName) {
            logDebug("Creating new variable: " + variableName);
            qmService.goToState(qm.staticData.stateNames.reminderAdd, {variableName: variableName});
        }

        function querySearch(query, variableSearchSuccessHandler, variableSearchErrorHandler) {
            var deferred = $q.defer();
            if (query === 'barcode') {
                self.scanBarcode(deferred);
                return deferred.promise;
            }
            if (self.searchText && self.searchText.toLowerCase().indexOf('barcode') !== -1) {
                qmLog.info("Already searching by barcode");
                deferred.resolve(self.items || []);
                return deferred.promise;
            }
            if (!query || query === "") {
                if (self.items && self.items.length > 10) {
                    logDebug("Returning " + self.items.length + " items from querySearch");
                    deferred.resolve(self.items);
                    return deferred.promise;
                }
            }
            self.notFoundText = "No variables found. Please try another wording or contact mike@quantimo.do.";
            if (query === self.lastApiQuery && self.lastResults) {
                logDebug("Why are we researching with the same query?", query);
                deferred.resolve(self.lastResults);
                return deferred.promise;
            }
            if (query && query.indexOf("Not seeing") !== -1) {
                self.searchPhrase = query = self.lastApiQuery;
                self.dialogParameters.excludeLocal = true;
            }
            if (self.dialogParameters.excludeLocal) {
                dialogParams.requestParams.excludeLocal = self.dialogParameters.excludeLocal;
            }
            if (query && query !== "") {
                dialogParams.requestParams.searchPhrase = query;
                self.lastApiQuery = query;
            }
            if (query === "" && dialogParams.requestParams.searchPhrase) {
                delete dialogParams.requestParams.searchPhrase;
            } // This happens after clicking x clear button
            logDebug("getFromLocalStorageOrApi in querySearch with params: " +
                JSON.stringify(dialogParams.requestParams), query);
            if (query && query.length) {
                //debugger
            }
            // Debounce in the template doesn't seem to work so we wait 500ms before searching here
            clearTimeout(qmService.searchTimeout);
            qmService.searchTimeout = setTimeout(function () {
                qm.variablesHelper.getFromLocalStorageOrApi(dialogParams.requestParams).then(function (variables) {
                    logDebug('Got ' + variables.length + ' results matching ', query);
                    showVariableList();
                    var list = convertVariablesToToResultsList(variables);
                    if (!dialogParams.requestParams.excludeLocal) {
                        list.push({
                            value: "search-more",
                            name: "Not seeing what you're looking for?",
                            variable: "Search for more...",
                            ionIcon: ionIcons.search,
                            subtitle: "Search for more..."
                        });
                    } else if (!list.length) {
                        list.push({
                            value: "create-new-variable",
                            name: "Create " + query + " variable",
                            variable: {name: query},
                            ionIcon: ionIcons.plus,
                            subtitle: null
                        });
                    }
                    self.lastResults = list;
                    deferred.resolve(list);
                    if (variables && variables.length) {
                        if (variableSearchSuccessHandler) {
                            variableSearchSuccessHandler(variables);
                        }
                    } else {
                        if (variableSearchErrorHandler) {
                            variableSearchErrorHandler();
                        }
                    }
                }, variableSearchErrorHandler);
            }, 500);
            return deferred.promise;
        }

        function searchTextChange(text) {
            logDebug('Text changed to ' + text + " in querySearch");
        }

        function selectedItemChange(item) {
            if (!item) {
                return;
            }
            if (item.value === "search-more" && !dialogParams.requestParams.excludeLocal) {
                self.selectedItem = null;
                //dialogParameters.requestParams.excludeLocal = true;
                //querySearch(self.searchText);
                return;
            }
            if (item.value === "create-new-variable") {
                createNewVariable(item.variable.name);
                return;
            }
            self.selectedItem = item;
            self.buttonText = "Select " + item.variable.name;
            if (self.barcode) {
                item.variable.barcode = item.variable.upc = self.barcode;
                item.variable.barcodeFormat = self.barcodeFormat;
            }
            $scope.variable = item.variable;
            item.variable.lastSelectedAt = qm.timeHelper.getUnixTimestampInSeconds();
            qm.variablesHelper.setLastSelectedAtAndSave(item.variable);
            logDebug('Item changed to ' + item.variable.name + " in querySearch");
            self.finish();
        }

        /**
         * Build `variables` list of key/value pairs
         */
        function convertVariablesToToResultsList(variables) {
            if (!variables || !variables[0]) {
                return [];
            }
            var list = variables.map(function (variable) {
                var variableName =
                    //variable.displayName || Don't use this or we can't differentiate Water (mL) from Water (serving)
                    variable.variableName || variable.name;
                if (!variableName) {
                    qmLog.error("No variable name in convertVariablesToToResultsList: " + JSON.stringify(variable));
                    return;
                }
                return {
                    value: variable.name.toLowerCase(),
                    name: variableName,
                    displayName: variable.name,
                    variable: variable,
                    ionIcon: variable.ionIcon,
                    subtitle: variable.subtitle
                };
            });
            return list;
        }
        querySearch();
    }]);
