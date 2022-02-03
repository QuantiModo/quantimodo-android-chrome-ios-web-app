angular.module('starter').controller('TagAddCtrl', ["$scope", "$q", "$timeout", "$state", "$rootScope", "$stateParams",
    "$filter", "$ionicActionSheet", "$ionicHistory", "$ionicLoading", "qmService",
    function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter, $ionicActionSheet, $ionicHistory,
             $ionicLoading, qmService){
    $scope.controller_name = "TagAddCtrl";
    $scope.state = {
        title: "Add Tag",
        saveButtonText: "Save"
    };
    $scope.cancel = function(){
        $ionicHistory.goBack();
    };
    var goBack = function(){
        qmService.hideLoader();
        if($stateParams.fromState && $stateParams.fromStateParams){
            // We stored update variable in local storage so this will force us to get it from there when we get back to the variable settings page
            delete $stateParams.fromStateParams.variableObject;
            qmService.goToState($stateParams.fromState, $stateParams.fromStateParams);
        }else{
            $scope.goBack();
        }
    };
    // delete measurement
    $scope.deleteTag = function(variableObject){
        var userTagData = {
            userTagVariableId: $scope.stateParams.userTagVariableObject.variableId,
            userTaggedVariableId: $scope.stateParams.userTaggedVariableObject.variableId
        };
        qmService.showBlackRingLoader();
        if(variableObject.userTagVariables){
            variableObject.userTagVariables =
                variableObject.userTagVariables.filter(function(obj){
                    return obj.id !== $scope.stateParams.userTagVariableObject.variableId;
                });
        }
        if(variableObject.userTaggedVariables){
            variableObject.userTaggedVariables =
                variableObject.userTaggedVariables.filter(function(obj){
                    return obj.id !== $scope.stateParams.userTaggedVariableObject.variableId;
                });
        }
        qm.variablesHelper.setLastSelectedAtAndSave(variableObject);
        qm.tags.deleteUserTag(userTagData).then(function(response){
            goBack();
        }, function(error){
            qmLog.error(error);
            goBack();
        });
    };
    function addTaggedToTagVariable(){
        $scope.stateParams.userTaggedVariableObject.tagConversionFactor = $scope.stateParams.tagConversionFactor;
        $scope.stateParams.userTaggedVariableObject.tagDisplayText = $scope.stateParams.tagConversionFactor +
            ' ' + $scope.stateParams.userTagVariableObject.unitName + ' of ' +
            $scope.stateParams.userTagVariableObject.name + ' per ' +
            $scope.stateParams.userTaggedVariableObject.unitName + ' of ' +
            $scope.stateParams.userTaggedVariableObject.name;
        if(!$scope.stateParams.userTagVariableObject.userTaggedVariables){
            $scope.stateParams.userTagVariableObject.userTaggedVariables = [];
        }
        var userTaggedVariableObject = JSON.parse(JSON.stringify($scope.stateParams.userTaggedVariableObject));  // Avoid TypeError: Converting circular structure to JSON
        $scope.stateParams.userTagVariableObject.userTaggedVariables.push(userTaggedVariableObject);
        qm.variablesHelper.setLastSelectedAtAndSave($scope.stateParams.userTagVariableObject);
    }
    function addTagToTaggedVariable(){
        $scope.stateParams.userTagVariableObject.tagConversionFactor = $scope.stateParams.tagConversionFactor;
        $scope.stateParams.userTagVariableObject.tagDisplayText = $scope.stateParams.tagConversionFactor +
            ' ' + $scope.stateParams.userTagVariableObject.unitName + ' of ' +
            $scope.stateParams.userTagVariableObject.name + ' per ' +
            $scope.stateParams.userTaggedVariableObject.unitName + ' of ' +
            $scope.stateParams.userTaggedVariableObject.name;
        if(!$scope.stateParams.userTaggedVariableObject.userTagVariables){
            $scope.stateParams.userTaggedVariableObject.userTagVariables = [];
        }
        var userTagVariableObject = JSON.parse(JSON.stringify($scope.stateParams.userTagVariableObject));  // Avoid TypeError: Converting circular structure to JSON
        $scope.stateParams.userTaggedVariableObject.userTagVariables.push(userTagVariableObject);
        qm.variablesHelper.setLastSelectedAtAndSave($scope.stateParams.userTaggedVariableObject);
    }
    $scope.done = function(){
        $scope.state.saveButtonText = 'Saving...';
        if(!$scope.stateParams.tagConversionFactor){
            $scope.stateParams.tagConversionFactor = 1;
        }
        var userTagData = {
            userTagVariableId: $scope.stateParams.userTagVariableObject.variableId,
            userTaggedVariableId: $scope.stateParams.userTaggedVariableObject.variableId,
            conversionFactor: $scope.stateParams.tagConversionFactor
        };
        addTaggedToTagVariable();
        addTagToTaggedVariable();
        qmService.showBlackRingLoader();
        qmService.postUserTagDeferred(userTagData).then(function(response){
            qmLog.info("postUserTagDeferred: ", response);
            goBack();
        }, function(error){
            qmLog.error(error);
            goBack();
        });
    };
    // update data when view is navigated to
    $scope.$on('$ionicView.enter', function(e){
        qmLog.debug('$ionicView.enter ' + $state.current.name, null);
    });
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.state.title = 'Add a Tag';
        $scope.state.saveButtonText = 'Save';
        if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
        $scope.stateParams = $stateParams;
        var debug = false;
        if(debug && qm.appMode.isDevelopment()){
            setDebugVariables();
        }
        qmLog.debug($state.current.name + ': beforeEnter', null);
    });
    function setDebugVariables(){
        if(!$scope.stateParams.userTagVariableObject){
            qmService.showBlackRingLoader();
            qm.userVariables.findByName('Anxiety', {}, null)
                .then(function(variable){
                    $scope.stateParams.userTagVariableObject = variable;
                    qmService.hideLoader();
                });
        }
        if(!$scope.stateParams.userTaggedVariableObject){
            qmService.showBlackRingLoader();
            qm.userVariables.findByName('Overall Mood', {}, null)
                .then(function(variable){
                    $scope.stateParams.userTaggedVariableObject = variable;
                    qmService.hideLoader();
                });
        }
    }
}]);
