angular.module('starter').controller('StudyCreationCtrl', ["$scope", "$state", "qmService", "qmLogService", "clipboard", "$mdDialog", "$stateParams",
    function($scope, $state, qmService, qmLogService, clipboard, $mdDialog, $stateParams) {
    $scope.state = {
        title: 'Create a Study',
        color: qmService.colors.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85" },
        bodyText: "One moment please..."
    };
    if (!clipboard.supported) {
        qmLogService.debug(null, 'Sorry, copy to clipboard is not supported', null);
        $scope.hideClipboardButton = true;
    }
    $scope.$on('$ionicView.beforeEnter', function(){
        qmLogService.debug('StudyCreationCtrl beforeEnter in state ' + $state.current.name);
        if($stateParams.causeVariable){setPredictorVariable($stateParams.causeVariable);}
        if($stateParams.effectVariable){setOutcomeVariable($stateParams.effectVariable);}
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmLogService.debug('StudyCreationCtrl afterEnter in state ' + $state.current.name);
        qmService.hideLoader();
    });
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = 'Copied!';
        clipboard.copyText(qmService.getStudyLinkByVariableNames(causeVariableName, effectVariableName));
    };

    function setOutcomeVariable(variable) {
        $scope.outcomeVariable = variable;
        $scope.outcomeVariableName = variable.name;
        qmLogService.debug('Selected outcome ' + variable.name);
    }
    function setPredictorVariable(variable) {
        $scope.predictorVariable = variable;
        $scope.predictorVariableName = variable.name;
        qmLogService.debug('Selected predictor ' + variable.name);
    }
    $scope.selectOutcomeVariable = function (ev) {
        var dataToPass = {
            title: qmService.explanations.outcomeSearch.title,
                helpText: qmService.explanations.outcomeSearch.textContent,
                placeholder: "Search for an outcome...",
                buttonText: "Select Variable",
                requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsEffect"}
        };
        qmService.showVariableSearchDialog(dataToPass, setOutcomeVariable, null, ev);
    };
    $scope.selectPredictorVariable = function (ev) {
        var dataToPass = {
            title: qmService.explanations.predictorSearch.title,
            helpText: qmService.explanations.predictorSearch.textContent,
            placeholder: "Search for a predictor...",
            buttonText: "Select Variable",
            requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsCause"}
        };
        qmService.showVariableSearchDialog(dataToPass, setPredictorVariable, null, ev);
    };
}]);
