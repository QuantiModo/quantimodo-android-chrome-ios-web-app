angular.module('starter').controller('SearchCtrl', ["$scope", "$q", "$state", "$timeout", "$rootScope",
    "$ionicLoading", "$ionicActionSheet", "$stateParams", "qmService",
    function($scope, $q, $state, $timeout, $rootScope, $ionicLoading, $ionicActionSheet, $stateParams, qmService){
        $scope.controller_name = "SearchCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {title: "Search",};
        // eslint-disable-next-line no-invalid-this
        var ctrl = this;
        ctrl.simulateQuery = false;
        ctrl.isDisabled    = false;
        // list of `state` value/display objects
        ctrl.states        = loadAll();
        ctrl.querySearch   = querySearch;
        ctrl.selectedItemChange = selectedItemChange;
        ctrl.searchTextChange   = searchTextChange;
        $scope.$on('$ionicView.enter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.debug('Entering state ' + $state.current.name);
            qm.urlHelper.addUrlParamsToObject($scope.state);
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        });
        ctrl.newState = newState;
        function newState(state) {
            alert("Sorry! You'll need to create a Constitution for " + state + " first!");
        }
        // ******************************
        // Internal methods
        // ******************************
        /**
         * Search for states... use $timeout to simulate
         * remote dataservice call.
         */
        function querySearch (query) {
            var results = query ? ctrl.states.filter(createFilterFor(query)) : ctrl.states,
                deferred;
            if (ctrl.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }
        function searchTextChange(text) {
            qmLog.info('Text changed to ' + text);
        }
        function selectedItemChange(item) {
            qmLog.info('Item changed to ' + JSON.stringify(item));
        }
        /**
         * Build `states` list of key/value pairs
         */
        function loadAll() {
            var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware';
            return allStates.split(/, +/g).map(function (state) {
                return {
                    value: state.toLowerCase(),
                    display: state
                };
            });
        }
    }]);
