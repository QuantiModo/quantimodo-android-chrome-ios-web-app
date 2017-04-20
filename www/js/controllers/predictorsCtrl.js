angular.module('starter').controller('PredictorsCtrl', function($scope, $ionicLoading, $state, $stateParams, $ionicPopup, quantimodoService,
                                           $rootScope, $ionicActionSheet, $mdDialog) {
    $scope.controller_name = "PredictorsCtrl";
    $scope.state = {
        requestParams: $stateParams.requestParams,
        variableName: quantimodoService.getPrimaryOutcomeVariable().name,
        correlationObjects: [],
        showLoadMoreButton: false
    };
    $scope.data = { "search" : '' };
    $scope.filterSearchQuery = '';
    $scope.searching = true;
    $scope.showSearchFilterBox = false;
    $rootScope.showFilterBarSearchIcon = true;
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("beforeEnter state " + $state.current.name);
        $rootScope.hideNavigationMenu = false;
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        if($stateParams.requestParams){ $scope.state.requestParams = $stateParams.requestParams; }
        $scope.state.requestParams.aggregated = quantimodoService.getUrlParameter('aggregated');
        if(quantimodoService.getUrlParameter('causeVariableName')){ $stateParams.causeVariableName = quantimodoService.getUrlParameter('causeVariableName', window.location.href, true); }
        if(quantimodoService.getUrlParameter('effectVariableName')){ $stateParams.effectVariableName = quantimodoService.getUrlParameter('effectVariableName', window.location.href, true); }
        if(!$stateParams.causeVariableName && ! $stateParams.effectVariableName) { $stateParams.effectVariableName = quantimodoService.getPrimaryOutcomeVariable().name; }
        $scope.state.requestParams.offset = 0;
        $scope.state.requestParams.limit = 10;
        if ($stateParams.causeVariableName){
            $scope.state.requestParams.causeVariableName = $stateParams.causeVariableName;
            $rootScope.variableName = $stateParams.causeVariableName;
            $scope.outcomeList = true;
        }
        if ($stateParams.effectVariableName) {
            $scope.state.requestParams.effectVariableName = $stateParams.effectVariableName;
            $rootScope.variableName = $stateParams.effectVariableName;
            $scope.predictorList = true;
        }
        if($stateParams.valence === 'positive'){$scope.state.requestParams.correlationCoefficient = "(gt)0";}
        if($stateParams.valence === 'negative'){$scope.state.requestParams.correlationCoefficient = "(lt)0";}
        if($stateParams.effectVariableName){$scope.state.title = "Predictors";} else {$scope.state.title = "Outcomes";}
        populateCorrelationList();
    });
    $rootScope.toggleFilterBar = function () {$scope.showSearchFilterBox = !$scope.showSearchFilterBox;};
    $scope.filterSearch = function () {
        console.debug($scope.data.search);
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
    function populateCorrelationList() {
        $scope.searching = true;
        quantimodoService.getCorrelationsDeferred($scope.state.requestParams)
            .then(function (data) {
                if(data.correlations.length) {
                    $scope.state.correlationsExplanation = data.explanation;
                    if($scope.state.requestParams.offset){$scope.state.correlationObjects = $scope.state.correlationObjects.concat(data.correlations);
                    } else {$scope.state.correlationObjects = data.correlations;}
                    showLoadMoreButtonIfNecessary();
                } else {
                    $scope.state.noCorrelations = true;
                }
                $ionicLoading.hide();
                $scope.searching = false;
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }, function (error) {
                $ionicLoading.hide();
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.searching = false;
                console.error('predictorsCtrl: Could not get correlations: ' + JSON.stringify(error));
            });
    }
    $scope.loadMore = function () {
        $ionicLoading.show();
        if($scope.state.correlationObjects.length){
            $scope.state.requestParams.offset = $scope.state.requestParams.offset + $scope.state.requestParams.limit;
            populateCorrelationList();
        }
    };
    $scope.refreshList = function () {
        quantimodoService.clearCorrelationCache();
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
            cancel: function() { console.debug('CANCELLED'); },
            buttonClicked: function(index) {
                console.debug('BUTTON CLICKED', index);
                if(index === 0){
                    console.debug("Sort by Statistical Significance");
                    $scope.state.requestParams.sort = '-statisticalSignificance';
                    populateCorrelationList();
                }
                if(index === 1){
                    console.debug("Sort by QM Score");
                    $scope.state.requestParams.sort = '-qmScore';
                    populateCorrelationList();
                }
                if(index === 2){
                    console.debug("Ascending Predictive Correlation");
                    $scope.state.requestParams.sort = 'correlationCoefficient';
                    populateCorrelationList();
                }
                if(index === 3){
                    console.debug("Descending Predictive Correlation");
                    $scope.state.requestParams.sort = '-correlationCoefficient';
                    populateCorrelationList();
                }
                return true;
            }
        });
    };
    $scope.openStore = function(name){
        console.debug("open store for ", name); // make url
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
    var CorrelationSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log) {
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
        self.cancel = function() { $mdDialog.cancel(); };
        self.finish = function() {
            $state.go('app.study', {correlationObject: self.correlationObject});
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
            quantimodoService.getCorrelationsDeferred(requestParams)
                .then(function (data) { deferred.resolve(loadAll(data.correlations)); }, function (error) { deferred.reject(error); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.correlationObject = item.correlationObject;
            self.buttonText = "Go to Study";
            $log.info('Item changed to ' + item.name);
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
});
