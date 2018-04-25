angular.module('starter').controller('ChartsPageCtrl', ["$scope", "$q", "$state", "$timeout", "$rootScope",
    "$ionicLoading", "$ionicActionSheet", "$stateParams", "qmService", "qmLogService", "clipboard",
    function($scope, $q, $state, $timeout, $rootScope, $ionicLoading,  $ionicActionSheet, $stateParams, qmService, qmLogService, clipboard) {
    $scope.controller_name = "ChartsPageCtrl";
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.state = {title: "Charts"};
    $scope.$on('$ionicView.enter', function(e) { qmLogService.debug('Entering state ' + $state.current.name);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        $scope.variableName = getVariableName();
        $scope.state.title = qmService.getTruncatedVariableName(getVariableName());
        if(getScopedVariableObject()){
            qmService.rootScope.setShowActionSheetMenu(function setActionSheet() {
                return qmService.actionSheets.showVariableObjectActionSheet(getVariableName(), getScopedVariableObject());
            });
        }
        initializeCharts();
        if (!clipboard.supported) {
            console.log('Sorry, copy to clipboard is not supported');
            $scope.hideClipboardButton = true;
        }
    });
    function getVariableName() {
        if($scope.variableName){return $scope.variableName;}
        if(qm.urlHelper.getParam('variableName')){return qm.urlHelper.getParam('variableName');}
        if($stateParams.variableName){return $stateParams.variableName;}
        if($stateParams.variableObject){return $stateParams.variableObject.name;}
        if($scope.state.variableObject){return $scope.state.variableObject.name;}
        $scope.goBack();
    }
    function getScopedVariableObject() {
        if($scope.state.variableObject && $scope.state.variableObject.name === getVariableName()){return $scope.state.variableObject;}
        if($stateParams.variableObject){
            return $scope.state.variableObject = $stateParams.variableObject;
        }
        return $scope.state.variableObject;
    }
    function initializeCharts() {
        if(!getScopedVariableObject() || !getScopedVariableObject().charts){
            qmService.showBlackRingLoader();
            getCharts();
        } else if ($stateParams.refresh) {
            $scope.refreshCharts();
        } else {
            qmService.hideLoader();
        }
    }
    function getCharts(refresh) {
        qm.userVariables.getByName(getVariableName(), {includeCharts: true}, refresh, function (variableObject) {
            qmLog.info("Got variable " + variableObject.name);
            if(!variableObject.charts){
                qmLog.error("No charts!");
                if(!$scope.state.variableObject || !$scope.state.variableObject.charts){
                    qmService.goToDefaultState();
                    return;
                }
            }
            $scope.state.variableObject = variableObject;
            if(variableObject){
                qmLog.info("Setting action sheet with variable " + variableObject.name);
                qmService.rootScope.setShowActionSheetMenu(function setActionSheet() {
                    return qmService.actionSheets.showVariableObjectActionSheet(getVariableName(), variableObject);
                });
            } else {
                qmLog.error("No variable for action sheet!");
            }
            qmService.hideLoader();
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
    $scope.refreshCharts = function () {getCharts(true);};
    $scope.addNewReminderButtonClick = function() {
        qmLogService.debug('addNewReminderButtonClick', null);
        qmService.goToState('app.reminderAdd', {variableObject: $scope.state.variableObject, fromState: $state.current.name});
    };
    $scope.compareButtonClick = function() {
        qmLogService.debug('compareButtonClick');
        qmService.goToStudyCreationForVariable($scope.state.variableObject);
    };
    $scope.recordMeasurementButtonClick = function() {
        qmLog.info("Going to record measurement for "+JSON.stringify($scope.state.variableObject));
        qmService.goToState(qmStates.measurementAdd, {variableObject: $scope.state.variableObject, fromState: $state.current.name});
    };
    $scope.editSettingsButtonClick = function() {qmService.goToVariableSettingsByObject($scope.state.variableObject);};
    $scope.shareCharts = function(variableObject, sharingUrl, ev){
        if(!variableObject.shareUserMeasurements){
            qmService.showShareVariableConfirmation(variableObject, sharingUrl, ev);
        } else {
            qmService.openSharingUrl(sharingUrl);
        }
    };
}]);
