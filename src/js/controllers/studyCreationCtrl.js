angular.module('starter').controller('StudyCreationCtrl', ["$scope", "$state", "qmService", "qmLogService", "clipboard", "$mdDialog", "$stateParams", "$rootScope",
    function($scope, $state, qmService, qmLogService, clipboard, $mdDialog, $stateParams, $rootScope) {
    $scope.state = {
        title: 'Create a Study',
        color: qmService.colors.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85" },
        bodyText: "One moment please...",
        study: null,
        causeVariable: null,
        effectVariable: null
    };
    $scope.$on('$ionicView.beforeEnter', function(){
        if(!qm.getUser()){qm.auth.setAfterLoginGoToUrlAndSendToLogin();}
        if($stateParams.causeVariable){$scope.state.causeVariable = $stateParams.causeVariable;}
        if($stateParams.effectVariable){$scope.state.effectVariable = $stateParams.effectVariable;}
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmLogService.debug('StudyCreationCtrl afterEnter in state ' + $state.current.name);
        qmService.hideLoader();
    });
    if (!clipboard.supported) {
        qmLogService.debug('Sorry, copy to clipboard is not supported', null);
        $scope.hideClipboardButton = true;
    }
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName, study) {
        $scope.copyLinkText = 'Copied!';
        var url = qmService.getStudyLinkStatic(causeVariableName, effectVariableName, study);
        clipboard.copyText(url);
    };
    function setOutcomeVariable(variable) {
        $scope.state.effectVariable = variable;
        //qm.urlHelper.addUrlParmsToCurrentUrl('effectVariableName', variable.name);  // Doesn't work
        qmLogService.debug('Selected outcome ' + variable.name);
    }
    function setPredictorVariable(variable) {
        $scope.state.causeVariable = variable;
        //qm.urlHelper.addUrlParmsToCurrentUrl('causeVariableName', variable.name);  // Doesn't work
        qmLogService.debug('Selected predictor ' + variable.name);
    }
    $scope.selectOutcomeVariable = function (ev) {
        qm.help.getExplanation('outcomeSearch', null, function (explanation) {
            var dialogParameters = {
                title: explanation.title,
                helpText: explanation.textContent,
                placeholder: "Search for an outcome...",
                buttonText: "Select Variable",
                requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsEffect"}
            };
            qmService.showVariableSearchDialog(dialogParameters, setOutcomeVariable, null, ev);
        });
    };
    $scope.selectPredictorVariable = function (ev) {
        qm.help.getExplanation('predictorSearch', null, function (explanation) {
            var dialogParameters = {
                title: explanation.title,
                helpText: explanation.textContent,
                placeholder: "Search for a predictor...",
                buttonText: "Select Variable",
                requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsCause"}
            };
            qmService.showVariableSearchDialog(dialogParameters, setPredictorVariable, null, ev);
        });
    };
    $scope.createStudy = function(causeVariableName, effectVariableName) {
        qmLog.info('Clicked createStudy for ' + causeVariableName + ' and ' + effectVariableName);
        qmService.showInfoToast("Creating study...", 20);
        qmService.showBasicLoader(60);
        qm.studiesCreated.createStudy({causeVariableName: causeVariableName, effectVariableName: effectVariableName}, function (study) {
            qmService.hideLoader();
            $scope.state.study = study;
            //qmService.goToStudyPage(study.causeVariable.name, study.effectVariable.name, study.studyId);
        }, function (error) {
            qmService.hideLoader();
            qmService.auth.showErrorAlertMessageOrSendToLogin("Could Not Create Study", error);
        });
    };
}]);
