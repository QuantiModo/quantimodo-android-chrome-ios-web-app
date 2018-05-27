angular.module('starter').controller('PredictorsCtrl', ["$scope", "$ionicLoading", "$state", "$stateParams", "qmService",
    "qmLogService", "$rootScope", "$ionicActionSheet", "$mdDialog", "$timeout",
    function($scope, $ionicLoading, $state, $stateParams, qmService, qmLogService, $rootScope, $ionicActionSheet, $mdDialog, $timeout) {
    $scope.controller_name = "PredictorsCtrl";
    $scope.state = {
        variableName: null,
        correlationObjects: [],
        showLoadMoreButton: false
    };
    $scope.data = { "search" : '' };
    $scope.filterSearchQuery = '';
    $scope.searching = true;
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug('beforeEnter state ' + $state.current.name);
        qmLogService.info('beforeEnter state ' + $state.current.name);
        $scope.showSearchFilterBox = false;
        qmService.navBar.setFilterBarSearchIcon(true);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        if($stateParams.requestParams){ $scope.state.requestParams = $stateParams.requestParams; }
        updateNavigationMenuButton();
    });
    function updateNavigationMenuButton() {
        qmService.rootScope.setShowActionSheetMenu(function() {
            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-arrow-down-c"></i>Descending Significance'},
                    { text: '<i class="icon ion-arrow-down-c"></i>Descending QM Score' },
                    { text: '<i class="icon ion-arrow-down-c"></i>Positive Relationships' },
                    { text: '<i class="icon ion-arrow-up-c"></i>Negative Relationships' },
                    { text: '<i class="icon ion-arrow-down-c"></i>Number of Participants' },
                    { text: '<i class="icon ion-arrow-up-c"></i>Ascending pValue' },
                    { text: '<i class="icon ion-arrow-down-c"></i>Optimal Pearson Product' },
                    qmService.actionSheets.actionSheetButtons.refresh,
                    qmService.actionSheets.actionSheetButtons.settings
                ],
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() { qmLogService.debug('CANCELLED', null); },
                buttonClicked: function(index) {
                    if(index === 0){populateCorrelationList('-statisticalSignificance');}
                    if(index === 1){populateCorrelationList('-qmScore');}
                    if(index === 2){populateCorrelationList('correlationCoefficient');}
                    if(index === 3){populateCorrelationList('-correlationCoefficient');}
                    if(index === 4){populateCorrelationList('-numberOfUsers');}
                    if(index === 5){populateCorrelationList('pValue');}
                    if(index === 6){populateCorrelationList('-optimalPearsonProduct');}
                    if(index === 7){$scope.refreshList();}
                    if(index === 8){qmService.goToState(qmStates.settings);}
                    return true;
                }
            });
        });
    }
    // Have to get url params after entering.  Otherwise, we get params from study if coming back
    $scope.$on('$ionicView.afterEnter', function(e) {
        qm.loaders.robots();
        qmLogService.info('afterEnter state ' + $state.current.name);
        $scope.state.requestParams.aggregated = qm.urlHelper.getParam('aggregated');
        if(!variablesHaveChanged()){return;}
        if (getCauseVariableName()){
            $scope.state.requestParams.causeVariableName = getCauseVariableName();
            $scope.state.variableName = getCauseVariableName();
            $scope.outcomeList = true;
        }
        if (getEffectVariableName()) {
            $scope.state.requestParams.effectVariableName = getEffectVariableName();
            $scope.state.variableName = getEffectVariableName();
            $scope.predictorList = true;
        }
        if($stateParams.valence === 'positive'){$scope.state.requestParams.correlationCoefficient = "(gt)0";}
        if($stateParams.valence === 'negative'){$scope.state.requestParams.correlationCoefficient = "(lt)0";}
        if($stateParams.effectVariableName){$scope.state.title = "Predictors";} else {$scope.state.title = "Outcomes";}
        populateCorrelationList();
    });
    function variablesHaveChanged() {
        if(!$scope.state.correlationObjects || !$scope.state.correlationObjects.length){return true;}
        if(getEffectVariableName() && $scope.state.requestParams.effectVariableName &&
            getEffectVariableName() !== $scope.state.requestParams.effectVariableName){
            return true;
        }
        if(getCauseVariableName() && $scope.state.requestParams.causeVariableName &&
            getCauseVariableName() !== $scope.state.requestParams.causeVariableName){
            return true;
        }
        return false;
    }
    function getEffectVariableName() {
        if(qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope)){
            return qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope);
        }
        if($stateParams.fallBackToPrimaryOutcome && !getCauseVariableName()){return qm.getPrimaryOutcomeVariable().name;}
    }
    function getCauseVariableName() {return qm.studyHelper.getCauseVariableName($stateParams, $scope, $rootScope);}
    $rootScope.toggleFilterBar = function () {$scope.showSearchFilterBox = !$scope.showSearchFilterBox;};
    $scope.filterSearch = function () {
        qmLogService.debug($scope.data.search, null);
        if($scope.outcomeList) {
            $scope.state.correlationObjects = $scope.state.correlationObjects.filter(function( obj ) {
                return obj.effectVariableName.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1; });
        } else {
            $scope.state.correlationObjects = $scope.state.correlationObjects.filter(function( obj ) {
                return obj.causeVariableName.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1; });
        }
        if($scope.data.search.length < 4 || $scope.state.correlationObjects.length) { return; }
        if($scope.outcomeList) { $stateParams.effectVariableName = '**' + $scope.data.search + '**';
        } else { $stateParams.causeVariableName = '**' + $scope.data.search + '**'; }
        $scope.state.requestParams.offset = null;
        populateCorrelationList();
    };
    function showLoadMoreButtonIfNecessary() {
        if($scope.state.correlationObjects.length && $scope.state.correlationObjects.length%$scope.state.requestParams.limit === 0){
            $scope.state.showLoadMoreButton = true;
        } else {
            $scope.state.showLoadMoreButton = false;
        }
    }
    function hideLoader(){
        $scope.$broadcast('scroll.infiniteScrollComplete');
        qmService.hideLoader();
        $scope.searching = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    function populateCorrelationList(newSortParam) {
        if(newSortParam){
            $scope.state.correlationObjects = [];
            qmLogService.debug('Sort by ' + newSortParam);
            $scope.state.requestParams.sort = newSortParam;
        }
        $scope.searching = true;
        var params = $scope.state.requestParams;
        params.limit = 10;
        qmLogService.info('Getting correlations with params ' + JSON.stringify(params));
        qmService.getCorrelationsDeferred(params)
            .then(function (data) {
                if(data){$scope.state.correlationsExplanation = data.explanation;}
                if(data.correlations.length) {
                    qmLogService.info('Got ' + data.correlations.length + ' correlations with params ' + JSON.stringify(params));
                    qmLogService.info('First correlation is ' + data.correlations[0].causeVariableName + " vs " + data.correlations[0].effectVariableName);
                    if($scope.state.requestParams.offset){
                        $scope.state.correlationObjects = $scope.state.correlationObjects.concat(data.correlations);
                    } else {
                        $scope.state.correlationObjects = data.correlations;
                    }
                    $scope.state.requestParams.offset = $scope.state.correlationObjects.length;
                    showLoadMoreButtonIfNecessary();
                } else {
                    qmLogService.info('Did not get any correlations with params ' + JSON.stringify(params));
                    $scope.state.noCorrelations = true;
                }
                hideLoader();
            }, function (error) {
                hideLoader();
                qmLogService.error('predictorsCtrl: Could not get correlations: ' + JSON.stringify(error));
            });
    }
    $scope.loadMore = function () {
        qmService.showBlackRingLoader();
        if($scope.state.correlationObjects.length){
            $scope.state.requestParams.offset = $scope.state.requestParams.offset + $scope.state.requestParams.limit;
            populateCorrelationList();
        }
    };
    $scope.refreshList = function () {
        $scope.state.requestParams.offset = 0;
        qmService.clearCorrelationCache();
        populateCorrelationList();
    };
    $scope.openStore = function(name){
        qmLogService.debug('open store for ', null, name); // make url
        name = name.split(' ').join('+'); // launch inAppBrowser
        var url  = 'http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k=' + name;
        $scope.openUrl(url);
    };
    $rootScope.openCorrelationSearchDialog = function($event) {
        $mdDialog.show({
            controller: CorrelationSearchCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'templates/dialogs/variable-search-dialog.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false // I think true causes auto-close on iOS
        });
    };
    var CorrelationSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, qmService, qmLogService, $q, $log) {
        var self = this;
        self.correlations        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        if ($stateParams.causeVariableName){
            self.variableName = $stateParams.causeVariableName;
            self.title = "Specific Outcome";
            self.helpText = "Search for an outcome that you think might be influenced by " + self.variableName + ".";
            self.placeholder = "Search for an outcome...";
        }
        if ($stateParams.effectVariableName) {
            self.variableName = $stateParams.effectVariableName;
            self.title = "Specific Predictor";
            self.helpText = "Search for a factor that you think might influence " + self.variableName + ".";
            self.placeholder = "Search for a predictor...";
        }
        self.helpText = self.helpText + "  Then you can see a study exploring the relationship between those variables.";
        self.getHelp = function(){
            if(self.helpText && !self.showHelp){return self.showHelp = true;}
            qmService.goToState(window.qmStates.help);
            $mdDialog.cancel();
        };
        self.cancel = function() { $mdDialog.cancel(); };
        self.finish = function() {
            qmService.goToStudyPageViaCorrelationObject(self.correlationObject);
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "I don't have enough data to determine the relationship between " + query + " and " +
                self.variableName + ".  I generally need about a month of overlapping data for each variable first.  " +
                "Create some reminders and let's make some discoveries!";
            var deferred = $q.defer();
            var requestParams = {};
            if($stateParams.causeVariableName){
                requestParams.causeVariableName = $stateParams.causeVariableName;
                requestParams.effectVariableName = "**" + query + "**";
            }
            if($stateParams.effectVariableName){
                requestParams.effectVariableName = $stateParams.effectVariableName;
                requestParams.causeVariableName = "**" + query + "**";
            }
            qmService.getCorrelationsDeferred(requestParams)
                .then(function (data) { deferred.resolve(loadAll(data.correlations)); }, function (error) { deferred.reject(error); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.debug('Text changed to ' + text, null); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.correlationObject = item.correlationObject;
            self.buttonText = "Go to Study";
            $log.info(null, 'Item changed to ' + item.name, null);
        }
        function loadAll(correlations) {
            if(!correlations){ return []; }
            return correlations.map( function (correlationObject) {
                if($stateParams.effectVariableName){
                    return {
                        value: correlationObject.causeVariableName.toLowerCase(),
                        name: correlationObject.causeVariableName,
                        correlationObject: correlationObject
                    };
                }
                if($stateParams.causeVariableName){
                    return {
                        value: correlationObject.effectVariableName.toLowerCase(),
                        name: correlationObject.effectVariableName,
                        correlationObject: correlationObject
                    };
                }
            });
        }
    };
    CorrelationSearchCtrl.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "qmLogService", "$q", "$log"];
}]);
