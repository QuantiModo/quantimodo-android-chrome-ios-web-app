angular.module('starter').controller('PredictorsCtrl', ["$scope", "$ionicLoading", "$state", "$stateParams", "qmService", "qmLogService", "$rootScope", "$ionicActionSheet", "$mdDialog", function($scope, $ionicLoading, $state, $stateParams, qmService, qmLogService,
                                           $rootScope, $ionicActionSheet, $mdDialog) {
    $scope.controller_name = "PredictorsCtrl";
    $scope.state = {
        variableName: null,
        correlationObjects: [],
        showLoadMoreButton: false
    };
    $scope.data = { "search" : '' };
    $scope.filterSearchQuery = '';
    $scope.searching = true;
    function getEffectVariableName() {
        if(urlHelper.getParam('effectVariableName')){ return urlHelper.getParam('effectVariableName', window.location.href, true); }
        if($stateParams.effectVariableName){return $stateParams.effectVariableName;}
        //if(!getCauseVariableName()){return qm.getPrimaryOutcomeVariable().name;}
    }
    function getCauseVariableName() {
        if(urlHelper.getParam('causeVariableName')){ return urlHelper.getParam('causeVariableName', window.location.href, true); }
        if($stateParams.causeVariableName){return $stateParams.causeVariableName;}
    }
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug('beforeEnter state ' + $state.current.name);
        $scope.showSearchFilterBox = false;
        $rootScope.showFilterBarSearchIcon = true;
        qmService.unHideNavigationMenu();
        if($stateParams.requestParams){ $scope.state.requestParams = $stateParams.requestParams; }
    });
    // Have to get url params after entering.  Otherwise, we get params from study if coming back
    $scope.$on('$ionicView.afterEnter', function(e) {
        qmLogService.debug('beforeEnter state ' + $state.current.name);
        $scope.state.requestParams.aggregated = urlHelper.getParam('aggregated');
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
    $rootScope.toggleFilterBar = function () {$scope.showSearchFilterBox = !$scope.showSearchFilterBox;};
    $scope.filterSearch = function () {
        qmLogService.debug(null, $scope.data.search, null);
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
    function populateCorrelationList() {
        $scope.searching = true;
        var params = $scope.state.requestParams;
        params.limit = 10;
        params.offset = $scope.state.correlationObjects.length;
        qmService.getCorrelationsDeferred(params)
            .then(function (data) {
                if(data.correlations.length) {
                    $scope.state.correlationsExplanation = data.explanation;
                    if($scope.state.requestParams.offset){$scope.state.correlationObjects = $scope.state.correlationObjects.concat(data.correlations);
                    } else {$scope.state.correlationObjects = data.correlations;}
                    showLoadMoreButtonIfNecessary();
                } else {
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
        qmService.clearCorrelationCache();
        populateCorrelationList();
    };
    $rootScope.showActionSheetMenu = function() {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: '<i class="icon ion-arrow-down-c"></i>Descending Significance'},
                { text: '<i class="icon ion-arrow-down-c"></i>Descending QM Score' },
                { text: '<i class="icon ion-arrow-down-c"></i>Ascending Correlation' },
                { text: '<i class="icon ion-arrow-up-c"></i>Descending Correlation' }
            ],
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() { qmLogService.debug(null, 'CANCELLED', null); },
            buttonClicked: function(index) {
                qmLogService.debug(null, 'BUTTON CLICKED', null, index);
                if(index === 0){
                    qmLogService.debug(null, 'Sort by Statistical Significance', null);
                    $scope.state.requestParams.sort = '-statisticalSignificance';
                    populateCorrelationList();
                }
                if(index === 1){
                    qmLogService.debug(null, 'Sort by QM Score', null);
                    $scope.state.requestParams.sort = '-qmScore';
                    populateCorrelationList();
                }
                if(index === 2){
                    qmLogService.debug(null, 'Ascending Predictive Correlation', null);
                    $scope.state.requestParams.sort = 'correlationCoefficient';
                    populateCorrelationList();
                }
                if(index === 3){
                    qmLogService.debug(null, 'Descending Predictive Correlation', null);
                    $scope.state.requestParams.sort = '-correlationCoefficient';
                    populateCorrelationList();
                }
                return true;
            }
        });
    };
    $scope.openStore = function(name){
        qmLogService.debug(null, 'open store for ', null, name); // make url
        name = name.split(' ').join('+'); // launch inAppBrowser
        var url  = 'http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k=' + name;
        $scope.openUrl(url);
    };
    $rootScope.openCorrelationSearchDialog = function($event) {
        $mdDialog.show({
            controller: CorrelationSearchCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
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
        function searchTextChange(text) { $log.debug(null, 'Text changed to ' + text, null); }
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
