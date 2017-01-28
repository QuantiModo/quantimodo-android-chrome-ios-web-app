angular.module('starter')

    .controller('TagAddCtrl', function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, $ionicLoading, quantimodoService) {

        $scope.controller_name = "TagAddCtrl";

        $scope.state = { };

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        var goBack = function () {
            $ionicLoading.hide();
            if($stateParams.fromState && $stateParams.fromStateParams){
                $state.go($stateParams.fromState, {variableObject: $rootScope.variableObject});
            } else {
                $scope.goBack();
            }
        };

        // delete measurement
        $scope.deleteTag = function(){
            var userTagData = {
                userTagVariableId: $rootScope.stateParams.userTagVariableObject.id,
                userTaggedVariableId: $rootScope.stateParams.userTaggedVariableObject.id
            };
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

            if($rootScope.variableObject.userTagVariables){
                $rootScope.variableObject.userTagVariables =
                    $rootScope.variableObject.userTagVariables.filter(function( obj ) {
                        return obj.id !== $rootScope.stateParams.userTagVariableObject.id;
                    });
            }

            if($rootScope.variableObject.userTaggedVariables){
                $rootScope.variableObject.userTaggedVariables =
                    $rootScope.variableObject.userTaggedVariables.filter(function( obj ) {
                        return obj.id !== $rootScope.stateParams.userTaggedVariableObject.id;
                    });
            }

            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables',
                $rootScope.variableObject);

            quantimodoService.deleteUserTagDeferred(userTagData).then(function (response) {
                goBack();
            }, function (error) {
                console.error(error);
                goBack();
            });
        };

        $scope.done = function(){

            if(!$rootScope.stateParams.tagConversionFactor){
                $rootScope.stateParams.tagConversionFactor = 1;
            }
            var userTagData = {
                userTagVariableId: $rootScope.stateParams.userTagVariableObject.id,
                userTaggedVariableId: $rootScope.stateParams.userTaggedVariableObject.id,
                conversionFactor: $rootScope.stateParams.tagConversionFactor
            };

            if($rootScope.variableObject.id === $rootScope.stateParams.userTagVariableObject.id){
                $rootScope.stateParams.userTaggedVariableObject.tagConversionFactor = $rootScope.stateParams.tagConversionFactor;
                $rootScope.stateParams.userTaggedVariableObject.tagDisplayText = $rootScope.stateParams.tagConversionFactor +
                    ' ' + $rootScope.stateParams.userTagVariableObject.unitName + ' of ' +
                    $rootScope.stateParams.userTagVariableObject.name + ' per ' +
                    $rootScope.stateParams.userTaggedVariableObject.unitName + ' of ' +
                    $rootScope.stateParams.userTaggedVariableObject.name;
                if(!$rootScope.variableObject.userTaggedVariables){
                    $rootScope.variableObject.userTaggedVariables = [];
                }
                $rootScope.variableObject.userTaggedVariables.push($rootScope.stateParams.userTaggedVariableObject);
            }

            if($rootScope.variableObject.id === $rootScope.stateParams.userTaggedVariableObject.id){
                $rootScope.stateParams.userTagVariableObject.tagConversionFactor = $rootScope.stateParams.tagConversionFactor;
                $rootScope.stateParams.userTagVariableObject.tagDisplayText = $rootScope.stateParams.tagConversionFactor +
                    ' ' + $rootScope.stateParams.userTagVariableObject.unitName + ' of ' +
                    $rootScope.stateParams.userTagVariableObject.name + ' per ' +
                    $rootScope.stateParams.userTaggedVariableObject.unitName + ' of ' +
                    $rootScope.stateParams.userTaggedVariableObject.name;
                if(!$rootScope.variableObject.userTagVariables){
                    $rootScope.variableObject.userTagVariables = [];
                }
                $rootScope.variableObject.userTagVariables.push($rootScope.stateParams.userTagVariableObject);
            }

            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables',
                $rootScope.variableObject);

            quantimodoService.postUserTagDeferred(userTagData).then(function (response) {
                goBack();
            }, function (error) {
                console.error(error);
                goBack();
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
            if(!$rootScope.stateParams.userTagVariableObject){
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                quantimodoService.getUserVariableByNameDeferred('Anxiety').then(function (variable) {
                    $rootScope.stateParams.userTagVariableObject = variable;
                    $ionicLoading.hide();
                });
            }

            if(!$rootScope.stateParams.userTaggedVariableObject){
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                quantimodoService.getUserVariableByNameDeferred('Overall Mood').then(function (variable) {
                    $rootScope.stateParams.userTaggedVariableObject = variable;
                    $ionicLoading.hide();
                });
            }
            console.debug($state.current.name + ": beforeEnter");

        });

    });
