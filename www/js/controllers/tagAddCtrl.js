angular.module('starter')

    .controller('TagAddCtrl', function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, variableService, $ionicLoading, QuantiModo) {

        $scope.controller_name = "TagAddCtrl";

        $scope.state = { };

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        // delete measurement
        $scope.deleteTag = function(){
            var userTagData = {
                tagVariableId: $rootScope.stateParams.tagVariableObject.id,
                taggedVariableId: $rootScope.stateParams.taggedVariableObject.id
            };
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            $stateParams.taggedVariableObject.userTagVariables = $stateParams.taggedVariableObject.userTagVariables.filter(function( obj ) {
                return obj.id !== $rootScope.stateParams.tagVariableObject.id;
            });

            QuantiModo.deleteUserTagDeferred(userTagData).then(function () {
                $ionicLoading.hide();
                $state.go($stateParams.fromState, {
                    variableObject: $stateParams.taggedVariableObject
                });
            }, function (error) {
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $scope.done = function(){

            if(!$rootScope.stateParams.tagConversionFactor){
                $rootScope.stateParams.tagConversionFactor = 1;
            }
            var userTagData = {
                tagVariableId: $rootScope.stateParams.tagVariableObject.id,
                taggedVariableId: $rootScope.stateParams.taggedVariableObject.id,
                conversionFactor: $rootScope.stateParams.tagConversionFactor
            };

            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            QuantiModo.postUserTagDeferred(userTagData).then(function () {
                $ionicLoading.hide();
                if($stateParams.fromState){
                    $state.go($stateParams.fromState, {
                        variableObject: $stateParams.taggedVariableObject
                    });
                } else {
                    $state.go(config.appSettings.defaultState);
                }

            }, function (error) {
                $ionicLoading.hide();
                console.error(error);
            });
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
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                variableService.getVariablesByName('Anxiety').then(function (variable) {
                    $rootScope.stateParams.tagVariableObject = variable;
                    $ionicLoading.hide();
                });
            }

            if(!$rootScope.stateParams.taggedVariableObject){
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                variableService.getVariablesByName('Overall Mood').then(function (variable) {
                    $rootScope.stateParams.taggedVariableObject = variable;
                    $ionicLoading.hide();
                });
            }
            console.debug($state.current.name + ": beforeEnter");

        });

    });