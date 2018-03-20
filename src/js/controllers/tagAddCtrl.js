angular.module('starter').controller('TagAddCtrl', ["$scope", "$q", "$timeout", "$state", "$rootScope", "$stateParams", "$filter", "$ionicActionSheet", "$ionicHistory", "$ionicLoading", "qmService", "qmLogService", function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, $ionicLoading, qmService, qmLogService) {
    $scope.controller_name = "TagAddCtrl";
    $scope.state = { };
    $scope.cancel = function(){
        $ionicHistory.goBack();
    };
    var goBack = function () {
        qmService.hideLoader();
        if($stateParams.fromState && $stateParams.fromStateParams){
            qmService.goToState($stateParams.fromState, {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});
        } else {
            $scope.goBack();
        }
    };
    // delete measurement
    $scope.deleteTag = function(variableObject){
        var userTagData = {
            userTagVariableId: $scope.stateParams.userTagVariableObject.id,
            userTaggedVariableId: $scope.stateParams.userTaggedVariableObject.id
        };
        qmService.showBlackRingLoader();
        if(variableObject.userTagVariables){
            variableObject.userTagVariables =
                variableObject.userTagVariables.filter(function( obj ) {
                    return obj.id !== $scope.stateParams.userTagVariableObject.id;
                });
        }
        if(variableObject.userTaggedVariables){
            variableObject.userTaggedVariables =
                variableObject.userTaggedVariables.filter(function( obj ) {
                    return obj.id !== $scope.stateParams.userTaggedVariableObject.id;
                });
        }
        qm.userVariables.saveToLocalStorage(variableObject);
        qmService.deleteUserTagDeferred(userTagData).then(function (response) {
            goBack();
        }, function (error) {
            qmLogService.error(error);
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
        qmService.showBlackRingLoader();
        qm.userVariables.saveToLocalStorage($rootScope.variableObject);
        qmService.postUserTagDeferred(userTagData).then(function (response) {
            goBack();
        }, function (error) {
            qmLogService.error(error);
            goBack();
        });
    };
    // update data when view is navigated to
    $scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug('$ionicView.enter ' + $state.current.name, null);
    });
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.state.title = 'Record a Tag';
        $scope.stateParams = $stateParams;
        if(!$scope.stateParams.userTagVariableObject){
            qmService.showBlackRingLoader();
            qm.userVariables.getByName('Anxiety', {}, null, function (variable) {
                $scope.stateParams.userTagVariableObject = variable;
                qmService.hideLoader();
            });
        }
        if(!$scope.stateParams.userTaggedVariableObject){
            qmService.showBlackRingLoader();
            qm.userVariables.getByName('Overall Mood', {}, null, function (variable) {
                $scope.stateParams.userTaggedVariableObject = variable;
                qmService.hideLoader();
            });
        }
        qmLogService.debug($state.current.name + ': beforeEnter', null);
    });
}]);
