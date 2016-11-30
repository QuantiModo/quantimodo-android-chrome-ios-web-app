angular.module('starter')

    .controller('TagAddCtrl', function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, variableService) {

        $scope.controller_name = "TagAddCtrl";

        $scope.state = { };

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        // delete measurement
        $scope.deleteTag = function(){
        };

        $scope.done = function(){
        };

        // update data when view is navigated to
        $scope.$on('$ionicView.enter', function(e) {
            console.debug("$ionicView.enter " + $state.current.name);
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        });

        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.state.title = 'Record a Tag';
            $rootScope.stateParams = $stateParams;
            if(!$rootScope.stateParams.tagVariableObject){
                variableService.getVariablesByName('Anxiety').then(function (variable) {
                    $rootScope.stateParams.tagVariableObject = variable;
                });
            }

            if(!$rootScope.stateParams.taggedVariableObject){
                variableService.getVariablesByName('Anxiety').then(function (variable) {
                    $rootScope.stateParams.taggedVariableObject = variable;
                });
            }
            console.debug($state.current.name + ": beforeEnter");
            $scope.init();
        });

    });