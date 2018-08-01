angular.module('starter').controller('StudyCreationCtrl', ["$scope", "$state", "qmService", "qmLogService", "clipboard", "$mdDialog", "$stateParams", "$rootScope",
    function($scope, $state, qmService, qmLogService, clipboard, $mdDialog, $stateParams, $rootScope) {
    $scope.state = {
        title: 'Create a Study',
        color: qmService.colors.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85" },
        bodyText: "One moment please...",
        study: null,
        causeVariable: null,
        effectVariable: null,
        typesDescription: ""
    };
    $scope.$on('$ionicView.beforeEnter', function(){
        if(!qm.getUser()){qm.auth.setAfterLoginGoToUrlAndSendToLogin();}
        if($stateParams.causeVariable){$scope.state.causeVariable = $stateParams.causeVariable;}
        if($stateParams.effectVariable){$scope.state.effectVariable = $stateParams.effectVariable;}
        qm.apiHelper.getPropertyDescription('StudyCreationBody', 'type', function (description) {
            $scope.state.title = "What kind of study do you want to create?";
            $scope.state.bodyText = description;
        });
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmLog.debug('StudyCreationCtrl afterEnter in state ' + $state.current.name);
        qmService.hideLoader();
    });
    if (!clipboard.supported) {
        qmLog.debug('Sorry, copy to clipboard is not supported', null);
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
        showTypesExplanation();
    }
    function setPredictorVariable(variable) {
        $scope.state.causeVariable = variable;
        //qm.urlHelper.addUrlParmsToCurrentUrl('causeVariableName', variable.name);  // Doesn't work
        qmLogService.debug('Selected predictor ' + variable.name);
        showTypesExplanation();
    }
    function showTypesExplanation() {
        $scope.state.study = null;
        if($scope.state.causeVariable && $scope.state.effectVariable){
            qm.apiHelper.getPropertyDescription('StudyCreationBody', 'type', function (description) {
                $scope.state.title = "What kind of study do you want to create?";
                $scope.state.bodyText = description;
            });
        }
    }
    $scope.selectOutcomeVariable = function (ev) {
        qm.help.getExplanation('outcomeSearch', null, function (explanation) {
            var dialogParameters = {
                title: explanation.title,
                helpText: explanation.textContent,
                placeholder: "Search for an outcome...",
                buttonText: "Select Variable",
                requestParams: {includePublic: true, sort:"-numberOfCorrelationsAsEffect"}
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
                requestParams: {includePublic: true, sort:"-numberOfCorrelationsAsCause"}
            };
            qmService.showVariableSearchDialog(dialogParameters, setPredictorVariable, null, ev);
        });
    };
    $scope.createStudy = function(type) {
        qmLog.info('Clicked createStudy for ' + getCauseVariableName() + ' and ' + getEffectVariableName());
        qmService.showInfoToast("Creating study...", 20);
        qmService.showBasicLoader(60);
        var body = new Quantimodo.StudyCreationBody(getCauseVariableName(), getEffectVariableName(), type);
        qm.studiesCreated.createStudy(body, function (study) {
            qmService.hideLoader();
            $scope.state.study = study;
        }, function (error) {
            qmService.hideLoader();
            qmService.auth.showErrorAlertMessageOrSendToLogin("Could Not Create Study", error);
        });
    };
    function getEffectVariableName() {return qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope);}
    function getCauseVariableName() {return qm.studyHelper.getCauseVariableName($stateParams, $scope, $rootScope);}
}]);
