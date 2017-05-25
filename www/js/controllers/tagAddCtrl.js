angular.module('starter').controller('TagAddCtrl', function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, $ionicLoading, quantimodoService) {
    $scope.controller_name = "TagAddCtrl";
    $scope.state = { };
    $scope.cancel = function(){
        $ionicHistory.goBack();
    };
    var goBack = function () {
        $ionicLoading.hide();
        if($stateParams.fromState && $stateParams.fromStateParams){
            $state.go($stateParams.fromState, {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});
        } else {
            $scope.goBack();
        }
    };
    // delete measurement
    $scope.deleteTag = function(){
        var userTagData = {
            userTagVariableId: $scope.stateParams.userTagVariableObject.id,
            userTaggedVariableId: $scope.stateParams.userTaggedVariableObject.id
        };
        quantimodoService.showLoader();

        if($rootScope.variableObject.userTagVariables){
            $rootScope.variableObject.userTagVariables =
                $rootScope.variableObject.userTagVariables.filter(function( obj ) {
                    return obj.id !== $scope.stateParams.userTagVariableObject.id;
                });
        }

        if($rootScope.variableObject.userTaggedVariables){
            $rootScope.variableObject.userTaggedVariables =
                $rootScope.variableObject.userTaggedVariables.filter(function( obj ) {
                    return obj.id !== $scope.stateParams.userTaggedVariableObject.id;
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

        if(!$scope.stateParams.tagConversionFactor){
            $scope.stateParams.tagConversionFactor = 1;
        }
        var userTagData = {
            userTagVariableId: $scope.stateParams.userTagVariableObject.id,
            userTaggedVariableId: $scope.stateParams.userTaggedVariableObject.id,
            conversionFactor: $scope.stateParams.tagConversionFactor
        };

        if($rootScope.variableObject.id === $scope.stateParams.userTagVariableObject.id){
            $scope.stateParams.userTaggedVariableObject.tagConversionFactor = $scope.stateParams.tagConversionFactor;
            $scope.stateParams.userTaggedVariableObject.tagDisplayText = $scope.stateParams.tagConversionFactor +
                ' ' + $scope.stateParams.userTagVariableObject.unitName + ' of ' +
                $scope.stateParams.userTagVariableObject.name + ' per ' +
                $scope.stateParams.userTaggedVariableObject.unitName + ' of ' +
                $scope.stateParams.userTaggedVariableObject.name;
            if(!$rootScope.variableObject.userTaggedVariables){
                $rootScope.variableObject.userTaggedVariables = [];
            }
            $rootScope.variableObject.userTaggedVariables.push($scope.stateParams.userTaggedVariableObject);
        }

        if($rootScope.variableObject.id === $scope.stateParams.userTaggedVariableObject.id){
            $scope.stateParams.userTagVariableObject.tagConversionFactor = $scope.stateParams.tagConversionFactor;
            $scope.stateParams.userTagVariableObject.tagDisplayText = $scope.stateParams.tagConversionFactor +
                ' ' + $scope.stateParams.userTagVariableObject.unitName + ' of ' +
                $scope.stateParams.userTagVariableObject.name + ' per ' +
                $scope.stateParams.userTaggedVariableObject.unitName + ' of ' +
                $scope.stateParams.userTaggedVariableObject.name;
            if(!$rootScope.variableObject.userTagVariables){
                $rootScope.variableObject.userTagVariables = [];
            }
            $rootScope.variableObject.userTagVariables.push($scope.stateParams.userTagVariableObject);
        }

        quantimodoService.showLoader();

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
        $scope.stateParams = $stateParams;
        if(!$scope.stateParams.userTagVariableObject){
            quantimodoService.showLoader();
            quantimodoService.getUserVariableByNameFromLocalStorageOrApiDeferred('Anxiety').then(function (variable) {
                $scope.stateParams.userTagVariableObject = variable;
                $ionicLoading.hide();
            });
        }

        if(!$scope.stateParams.userTaggedVariableObject){
            quantimodoService.showLoader();
            quantimodoService.getUserVariableByNameFromLocalStorageOrApiDeferred('Overall Mood').then(function (variable) {
                $scope.stateParams.userTaggedVariableObject = variable;
                $ionicLoading.hide();
            });
        }
        console.debug($state.current.name + ": beforeEnter");

    });
});