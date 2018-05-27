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
            qmService.goToState($stateParams.fromState, {});
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

    function addTaggedToTagVariable() {
        $scope.stateParams.userTaggedVariableObject.tagConversionFactor = $scope.stateParams.tagConversionFactor;
        $scope.stateParams.userTaggedVariableObject.tagDisplayText = $scope.stateParams.tagConversionFactor +
            ' ' + $scope.stateParams.userTagVariableObject.unitName + ' of ' +
            $scope.stateParams.userTagVariableObject.name + ' per ' +
            $scope.stateParams.userTaggedVariableObject.unitName + ' of ' +
            $scope.stateParams.userTaggedVariableObject.name;
        if (!$scope.stateParams.userTagVariableObject.userTaggedVariables) {
            $scope.stateParams.userTagVariableObject.userTaggedVariables = [];
        }
        var userTaggedVariableObject = JSON.parse(JSON.stringify($scope.stateParams.userTaggedVariableObject));  // Avoid TypeError: Converting circular structure to JSON
        $scope.stateParams.userTagVariableObject.userTaggedVariables.push(userTaggedVariableObject);
        qm.userVariables.saveToLocalStorage($scope.stateParams.userTagVariableObject);
    }

    function addTagToTaggedVariable() {
        $scope.stateParams.userTagVariableObject.tagConversionFactor = $scope.stateParams.tagConversionFactor;
        $scope.stateParams.userTagVariableObject.tagDisplayText = $scope.stateParams.tagConversionFactor +
            ' ' + $scope.stateParams.userTagVariableObject.unitName + ' of ' +
            $scope.stateParams.userTagVariableObject.name + ' per ' +
            $scope.stateParams.userTaggedVariableObject.unitName + ' of ' +
            $scope.stateParams.userTaggedVariableObject.name;
        if (!$scope.stateParams.userTaggedVariableObject.userTagVariables) {
            $scope.stateParams.userTaggedVariableObject.userTagVariables = [];
        }
        var userTagVariableObject = JSON.parse(JSON.stringify($scope.stateParams.userTagVariableObject));  // Avoid TypeError: Converting circular structure to JSON
        $scope.stateParams.userTaggedVariableObject.userTagVariables.push(userTagVariableObject);
        qm.userVariables.saveToLocalStorage($scope.stateParams.userTaggedVariableObject);
    }

    $scope.done = function(){
        if(!$scope.stateParams.tagConversionFactor){$scope.stateParams.tagConversionFactor = 1;}
        var userTagData = {
            userTagVariableId: $scope.stateParams.userTagVariableObject.id,
            userTaggedVariableId: $scope.stateParams.userTaggedVariableObject.id,
            conversionFactor: $scope.stateParams.tagConversionFactor
        };
        addTaggedToTagVariable();
        addTagToTaggedVariable();
        qmService.showBlackRingLoader();
        qmService.postUserTagDeferred(userTagData).then(function (response) {
            qmLog.info(response);
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
        var debug = false;
        if(debug && qm.appMode.isDevelopment()){setDebugVariables();}
        qmLogService.debug($state.current.name + ': beforeEnter', null);
    });

    function setDebugVariables() {
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
    }
}]);
