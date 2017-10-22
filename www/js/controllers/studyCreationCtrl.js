angular.module('starter').controller('StudyCreationCtrl', function($scope, $state, qmService, qmLog, clipboard, $mdDialog) {
    $scope.state = {
        title: 'Create a Study',
        color: qmService.colors.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85" },
        bodyText: "One moment please..."
    };
    if (!clipboard.supported) {
        qmLog.debug('Sorry, copy to clipboard is not supported');
        $scope.hideClipboardButton = true;
    }
    $scope.$on('$ionicView.afterEnter', function(){
        qmLog.debug('StudyCreationCtrl afterEnter in state ' + $state.current.name);
        qmService.hideLoader();
    });
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = 'Copied!';
        clipboard.copyText(qmService.getStudyLinkByVariableNames(causeVariableName, effectVariableName));
    };
    var SelectVariableDialogController = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLog, $q, $log, dataToPass) {
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
                qmLog.debug("Why are we searching without a query?");
                if(!self.items || self.items.length < 10){self.items = loadAll();}
                deferred.resolve(self.items);
                return deferred.promise;
            }
            if(qmService.arrayHasItemWithNameProperty(self.items)){
                self.items = qmService.removeItemsWithDifferentName(self.items, query);
                var minimumNumberOfResultsRequiredToAvoidAPIRequest = 2;
                if(qmService.arrayHasItemWithNameProperty(self.items) && self.items.length > minimumNumberOfResultsRequiredToAvoidAPIRequest){
                    deferred.resolve(self.items);
                    return deferred.promise;
                }
            }
            qmService.searchVariablesIncludingLocalDeferred(query, dataToPass.requestParams)
                .then(function(results){
                    qmLog.debug("Got " + results.length + " results matching " + query);
                    deferred.resolve(loadAll(results));
                });
            return deferred.promise;
        }
        function searchTextChange(text) { qmLog.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            if(!item){return;}
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
            $scope.variable = item.variable;
            qmService.addVariableToLocalStorage(item.variable);
            qmLog.debug('Item changed to ' + item.variable.name);
        }

        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){variables = qmService.getVariablesFromLocalStorage(dataToPass.requestParams);}
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
                    title: qmService.explanations.outcomeSearch.title,
                    helpText: qmService.explanations.outcomeSearch.textContent,
                    placeholder: "Search for an outcome...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsEffect"}
                }
            }
        }).then(function(variable) {
            $scope.outcomeVariable = variable;
            $scope.outcomeVariableName = variable.name;
            qmLog.debug("Selected outcome " + variable.name);
        }, function() {qmLog.debug('User cancelled selection');});
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
                    title: qmService.explanations.predictorSearch.title,
                    helpText: qmService.explanations.predictorSearch.textContent,
                    placeholder: "Search for a predictor...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsCause"}
                }
            }
        }).then(function(variable) {
            $scope.predictorVariable = variable;
            $scope.predictorVariableName = variable.name;
            qmLog.debug("Selected predictor " + variable.name);
        }, function() {
            qmLog.debug('User cancelled selection');
        });
    };
});
