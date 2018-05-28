angular.module("starter").controller("StudyCtrl", ["$scope", "$state", "qmService", "qmLogService", "$stateParams", "$ionicHistory", "$rootScope", "$timeout", "$ionicLoading", "wikipediaFactory", "$ionicActionSheet", "clipboard", "$mdDialog", function($scope, $state, qmService, qmLogService, $stateParams, $ionicHistory, $rootScope,
                                      $timeout, $ionicLoading, wikipediaFactory, $ionicActionSheet, clipboard, $mdDialog) {
    VariableSettingsController.$inject = ["qmService", "qmLogService", "dialogParameters"];
    $scope.controller_name = "StudyCtrl";
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.$on("$ionicView.beforeEnter", function() {
        $scope.loadingCharts = true;  // Need to do this here so robot works properly
        qmLogService.debug('beforeEnter state ' + $state.current.name);
        $scope.state = {
            title: "Loading study...",
            requestParams: {},
            hideStudyButton: true,
            loading: true,
            study: null
        };
        qmService.hideLoader(); // Hide before robot is called in afterEnter
        setAllStateProperties(getScopedStudyIfMatchesVariableNames());
    });
    $scope.$on("$ionicView.enter", function() {
        qmLogService.debug('enter state ' + $state.current.name);
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        if($stateParams.correlationObject){
            setAllStatePropertiesAndSaveToLocalStorage($stateParams.correlationObject);
        }
        setupRequestParams();
        getStudy();
    });
    $scope.$on("$ionicView.afterEnter", function() {
        qm.loaders.robots();
        if(qm.urlHelper.getParam('causeVariableName') && qm.urlHelper.getParam('effectVariableName')){
            qmService.stateHelper.previousUrl = window.location.href;
        }
    });
    function setAllStateProperties(lastStudyOrCorrelation) {
        if(!lastStudyOrCorrelation){return;}
        if(!lastStudyOrCorrelation.statistics && lastStudyOrCorrelation.correlationCoefficient){
            lastStudyOrCorrelation.statistics = JSON.parse(JSON.stringify(lastStudyOrCorrelation));
        }
        if(lastStudyOrCorrelation.statistics){
            delete lastStudyOrCorrelation.statistics.studyText;
            delete lastStudyOrCorrelation.statistics.charts;
            delete lastStudyOrCorrelation.statistics.highcharts;
            $scope.correlationObject = lastStudyOrCorrelation.statistics;
        } else {
            $scope.correlationObject = lastStudyOrCorrelation;
        }
        if(lastStudyOrCorrelation.charts){
            lastStudyOrCorrelation.charts = qm.arrayHelper.convertObjectToArray(lastStudyOrCorrelation.charts);
        } else {
            qmLog.info("No charts on: " + JSON.stringify(lastStudyOrCorrelation).substring(0, 140));
        }
        $scope.state.study = lastStudyOrCorrelation;
    }
    function setAllStatePropertiesAndSaveToLocalStorage(lastStudyOrCorrelation) {
        if(!lastStudyOrCorrelation){return;}
        setAllStateProperties(lastStudyOrCorrelation);
        qm.studyHelper.saveLastStudy(lastStudyOrCorrelation);
    }
    function matchesVariableNames(study) {
        if(!study){return false;}
        if(!getCauseVariableName() || !getEffectVariableName()){return true;}
        if(study.causeVariableName === getCauseVariableName() && study.effectVariableName === getEffectVariableName()){return true;}
        if(!study.statistics){return false;}
        if(study.statistics.causeVariableName === getCauseVariableName() && study.statistics.effectVariableName === getEffectVariableName()){
            return true;
        }
        return false;
    }
    function getScopedStudyIfMatchesVariableNames() {
        if(matchesVariableNames($stateParams.correlationObject)){return $stateParams.correlationObject;}
        if($scope.state && matchesVariableNames($scope.state.study)){return $scope.state.study;}
        if(matchesVariableNames(qm.studyHelper.lastStudyOrCorrelation)){return qm.studyHelper.lastStudyOrCorrelation;}
    }
    function getStatistics() {
        if($scope.state.study && $scope.state.study.statistics){return $scope.state.study.statistics;}
        if($stateParams.correlationObject){ return $stateParams.correlationObject;}
    }
    function getStateOrUrlOrRootScopeCorrelationOrRequestParam(paramName) {
        if(window.qm.urlHelper.getParam(paramName)){return window.qm.urlHelper.getParam(paramName, window.location.href, true);}
        if($stateParams[paramName]){ return $stateParams[paramName]; }
        if($scope.state.requestParams && $scope.state.requestParams[paramName]){return $scope.state.requestParams[paramName];}
        return null;
    }
    function setupRequestParams() {
        $scope.state.requestParams.causeVariableName = getCauseVariableName();
        $scope.state.requestParams.effectVariableName = getEffectVariableName();
        $scope.state.requestParams.userId = getStateOrUrlOrRootScopeCorrelationOrRequestParam("userId");
    }
    $scope.refreshStudy = function() {
        qmService.clearCorrelationCache();
        getStudy(true);
        qm.windowHelper.scrollToTop();
    };
    $scope.joinStudy = function () { qmService.goToState("app.studyJoin", {correlationObject: getStatistics()}); };
    if (!clipboard.supported) {
        qmLogService.debug('Sorry, copy to clipboard is not supported', null);
        $scope.hideClipboardButton = true;
    }
    $scope.copyLinkText = "Copy Shareable Link to Clipboard";
    function getStudyLinks() {
        if(getScopedStudyIfMatchesVariableNames().studyLinks){return getScopedStudyIfMatchesVariableNames().studyLinks;}
    }
    function getStudyLinkStatic() {
        if(getStudyLinks()){return getStudyLinks().studyLinkStatic;}
    }
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = "Copied!";
        var studyLink;
        if(causeVariableName && effectVariableName){studyLink = qmService.getStudyLinkByVariableNames(causeVariableName, effectVariableName);}
        if(getStudyLinkStatic()){studyLink = getStudyLinkStatic(); }
        clipboard.copyText(studyLink);
    };
    function addWikipediaInfo() {
        $scope.causeWikiEntry = null;
        $scope.causeWikiImage = null;
        $scope.effectWikiEntry = null;
        $scope.effectWikiImage = null;
        var causeSearchTerm = getStatistics().causeVariableCommonAlias;
        if(!causeSearchTerm){ causeSearchTerm = $scope.state.requestParams.causeVariableName; }
        wikipediaFactory.searchArticlesByTitle({
            term: causeSearchTerm,
            pithumbsize: "200",
            exlimit: "1", // (optional) "max": extracts for all articles, otherwise only for the first
            exintro: "1" // (optional) "1": if we just want the intro, otherwise it shows all sections
        }).then(function (causeData) {
            if(causeData.data.query) {
                $scope.causeWikiEntry = causeData.data.query.pages[0].extract;
                if(causeData.data.query.pages[0].thumbnail){ $scope.causeWikiImage = causeData.data.query.pages[0].thumbnail.source; }
            } else {
                var error = "Wiki not found for " + causeSearchTerm;
                qmLogService.error(null, error);
            }
        }).catch(function (error) { qmLogService.error(null, error); });
        var effectSearchTerm = getStatistics().effectVariableCommonAlias;
        if(!effectSearchTerm){ effectSearchTerm = $scope.state.requestParams.effectVariableName; }
        wikipediaFactory.searchArticlesByTitle({
            term: effectSearchTerm,
            pithumbsize: "200", // (optional) default: 400
            exlimit: "1", // (optional) "max": extracts for all articles, otherwise only for the first
            exintro: "1" // (optional) "1": if we just want the intro, otherwise it shows all sections
        }).then(function (effectData) {
            if(effectData.data.query){
                $scope.effectWikiEntry = effectData.data.query.pages[0].extract;
                if(effectData.data.query.pages[0].thumbnail){ $scope.effectWikiImage = effectData.data.query.pages[0].thumbnail.source; }
            } else {
                var error = "Wiki not found for " + effectSearchTerm;
                qmLogService.error(null, error);
            }
        }).catch(function (error) { qmLogService.error(null, error); });
    }
    $scope.weightedPeriod = 5;
    function getCorrelationObjectIfNecessary(){
        if(getScopedStudyIfMatchesVariableNames()){return;}
        qmService.getCorrelationsDeferred($scope.state.requestParams)
            .then(function (data) {
                if(data.correlations.length) {setAllStatePropertiesAndSaveToLocalStorage(data.correlations[0]);}
            }, function (error) {
                qmLogService.error('predictorsCtrl: Could not get correlations: ' + JSON.stringify(error));
            });
    }
    function getStudy(recalculate) {
        if(!getCauseVariableName() || !getEffectVariableName()){
            qmLogService.error('Cannot get study. Missing cause or effect variable name.');
            qmService.goToDefaultState();
            return;
        }
        getCorrelationObjectIfNecessary(); // Get it quick so they have something to look at while waiting for charts
        $scope.loadingCharts = true;
        qmService.getStudyDeferred($scope.state.requestParams).then(function (study) {
            qmService.hideLoader();
            if(study){$scope.state.studyNotFound = false;}
            setAllStatePropertiesAndSaveToLocalStorage(study);
            $scope.loadingCharts = false;
            setActionSheetMenu();
        }, function (error) {
            qmLogService.error(null, error);
            qmService.hideLoader();
            $scope.loadingCharts = false;
            $scope.state.studyNotFound = true;
            $scope.state.title = "Not Enough Data, Yet";
            if(recalculate || qm.urlHelper.getParam('recalculate')){$scope.state.requestParams.recalculate = true;}
        });
    }
    function getEffectVariableName() {return qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope);}
    function getCauseVariableName() {return qm.studyHelper.getCauseVariableName($stateParams, $scope, $rootScope);}
    function getCauseVariable() {return qm.studyHelper.getCauseVariable($stateParams, $scope, $rootScope);}
    function getEffectVariable() {return qm.studyHelper.getEffectVariable($stateParams, $scope, $rootScope);}
    function setActionSheetMenu(){
         var showActionSheetMenu = function() {
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-log-in"></i>' + getCauseVariableName().substring(0,15) + ' Settings' },
                    { text: '<i class="icon ion-log-out"></i>' + getEffectVariableName().substring(0,15) + ' Settings' },
                    { text: '<i class="icon ion-thumbsup"></i> Seems Right' },
                    qmService.actionSheets.actionSheetButtons.refresh
                ],
                destructiveText: '<i class="icon ion-thumbsdown"></i>Seems Wrong',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() { qmLogService.debug($state.current.name + ': ' + 'CANCELLED', null); },
                buttonClicked: function(index) {
                    if(index === 0){ qmService.goToVariableSettingsByObject(getCauseVariable()); }
                    if(index === 1){ qmService.goToVariableSettingsByObject(getEffectVariable()); }
                    if(index === 2){ $scope.upVote(getStatistics()); }
                    if(index === 3){ $scope.refreshStudy(); }
                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.downVote(getStatistics());
                    return true;
                }
            });
            $timeout(function() { hideSheet(); }, 20000);
        };
         // FYI Using timeout to modify rootScope Seems to solve robot animation problems
        qmService.rootScope.setShowActionSheetMenu(showActionSheetMenu);
    }
    $scope.changeVariableSetting = function(variable, propertyToUpdate, ev){
        $mdDialog.show({
            controller: VariableSettingsController,
            controllerAs: "ctrl",
            templateUrl: "templates/dialogs/variable-settings-dialog.html",
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dialogParameters: {
                    propertyToUpdate: propertyToUpdate,
                    buttonText: "Save",
                    variable: variable
                }
            }
        }).then(function(variable) {
            qmService.showInfoToast("Re-analyzing data using updated " + qm.stringHelper.camelToTitleCase(propertyToUpdate));
            var postData = {variableName: variable.name};
            postData[propertyToUpdate] = variable[propertyToUpdate];
            qmService.postUserVariableDeferred(postData).then(function (response) {
                $scope.refreshStudy();
            });
        }, function() {qmLogService.debug('User cancelled selection', null);});
    };
    function VariableSettingsController(qmService, qmLogService, dialogParameters) {
        var self = this;
        var explanations = qm.help.getExplanations();
        self.title = explanations[dialogParameters.propertyToUpdate].title;
        self.helpText = explanations[dialogParameters.propertyToUpdate].explanation;
        self.placeholder = explanations[dialogParameters.propertyToUpdate].title;
        if(explanations[dialogParameters.propertyToUpdate].unitName){self.placeholder = self.placeholder + " in " + explanations[dialogParameters.propertyToUpdate].unitName;}
        self.value = dialogParameters.variable[dialogParameters.propertyToUpdate];
        self.unitName = explanations[dialogParameters.propertyToUpdate].unitName;
        self.getHelp = function(){
            if(self.helpText && !self.showHelp){return self.showHelp = true;}
            qmService.goToState(window.qmStates.help);
            $mdDialog.cancel();
        };
        self.cancel = function() {
            self.items = null;
            $mdDialog.cancel();
        };
        self.finish = function() {
            dialogParameters.variable[dialogParameters.propertyToUpdate] = self.value;
            $mdDialog.hide(dialogParameters.variable);
        };
    }
}]);
