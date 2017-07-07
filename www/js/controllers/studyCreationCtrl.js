angular.module('starter').controller('StudyCreationCtrl', function($scope, $state, quantimodoService, clipboard, $mdDialog) {
    $scope.state = {
        title: 'Create a Study',
        color: quantimodoService.colors.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85" },
        bodyText: "One moment please..."
    };
    if (!clipboard.supported) {
        console.debug('Sorry, copy to clipboard is not supported');
        $scope.hideClipboardButton = true;
    }
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = 'Copied!';
        clipboard.copyText(quantimodoService.getStudyLinkByVariableNames(causeVariableName, effectVariableName));
    };
    var SelectVariableDialogController = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log, dataToPass) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dataToPass.title;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.newVariable = newVariable;
        self.cancel = function() {
            self.items = null;
            $mdDialog.cancel();
        };
        self.finish = function() {
            self.items = null;
            $mdDialog.hide($scope.variable);
        };
        function newVariable(variable) {alert("Sorry! You'll need to create a Constitution for " + variable + " first!");}
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            if(!query){
                console.error("Why are we searching without a query?");
                if(!self.items || self.items.length < 10){self.items = loadAll();}
                deferred.resolve(self.items);
                return deferred.promise;
            }
            if(quantimodoService.arrayHasItemWithNameProperty(self.items)){
                self.items = quantimodoService.removeItemsWithDifferentName(self.items, query);
                var minimumNumberOfResultsRequiredToAvoidAPIRequest = 2;
                if(quantimodoService.arrayHasItemWithNameProperty(self.items) && self.items.length > minimumNumberOfResultsRequiredToAvoidAPIRequest){
                    deferred.resolve(self.items);
                    return deferred.promise;
                }
            }
            quantimodoService.searchVariablesIncludingLocalDeferred(query, dataToPass.requestParams)
                .then(function(results){
                    console.debug("Got " + results.length + " results matching " + query);
                    deferred.resolve(loadAll(results));
                });
            return deferred.promise;
        }
        function searchTextChange(text) { console.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            if(!item){return;}
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
            $scope.variable = item.variable;
            quantimodoService.addVariableToLocalStorage(item.variable);
            console.debug('Item changed to ' + item.variable.name);
        }

        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){variables = quantimodoService.getVariablesFromLocalStorage(dataToPass.requestParams);}
            if(!variables || !variables[0]){ return []; }
            return variables.map( function (variable) {
                return {
                    value: variable.name.toLowerCase(),
                    name: variable.name,
                    variable: variable,
                    ionIcon: variable.ionIcon
                };
            });
        }
    };
    $scope.selectOutcomeVariable = function (ev) {
        $mdDialog.show({
            controller: SelectVariableDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: quantimodoService.explanations.outcomeSearch.title,
                    helpText: quantimodoService.explanations.outcomeSearch.textContent,
                    placeholder: "Search for an outcome...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsEffect"}
                }
            }
        }).then(function(variable) {
            $scope.outcomeVariable = variable;
            $scope.outcomeVariableName = variable.name;
        }, function() {console.debug('User cancelled selection');});
    };
    $scope.selectPredictorVariable = function (ev) {
        $mdDialog.show({
            controller: SelectVariableDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: quantimodoService.explanations.predictorSearch.title,
                    helpText: quantimodoService.explanations.predictorSearch.textContent,
                    placeholder: "Search for a predictor...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsCause"}
                }
            }
        }).then(function(variable) {
            $scope.predictorVariable = variable;
            $scope.predictorVariableName = variable.name;
        }, function() {
            console.debug('User cancelled selection');
        });
    };
});
