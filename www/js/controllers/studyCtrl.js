angular.module("starter").controller("StudyCtrl", function($scope, $state, quantimodoService, $stateParams, $ionicHistory, $rootScope,
                                      $timeout, $ionicLoading, wikipediaFactory, $ionicActionSheet, clipboard, $mdDialog) {
    $scope.controller_name = "StudyCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.$on("$ionicView.beforeEnter", function() {
        console.debug("beforeEnter state " + $state.current.name);
        $scope.state = {
            title: "Loading study...",
            requestParams: {},
            hideStudyButton: true,
            loading: true
        };
    });
    $scope.$on("$ionicView.enter", function() {
        console.debug("enter state " + $state.current.name);
        $rootScope.hideNavigationMenu = false;
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== "undefined")  { analytics.trackView($state.current.name); }
        if($stateParams.correlationObject){
            quantimodoService.setLocalStorageItem('lastStudy', JSON.stringify($stateParams.correlationObject));
            $rootScope.correlationObject = $stateParams.correlationObject;
        }
        setupRequestParams();
        if(!$rootScope.correlationObject){
            var lastStudy = quantimodoService.getLocalStorageItemAsObject("lastStudy");
            if(lastStudy){
                if((!$scope.state.requestParams.causeVariableName || !$scope.state.requestParams.effectVariableName) ||
                    (lastStudy.causeVariableName === $scope.state.requestParams.causeVariableName && lastStudy.effectVariableName === $scope.state.requestParams.effectVariableName)){
                    $rootScope.correlationObject = lastStudy;
                    setupRequestParams();
                    quantimodoService.highchartsReflow();  //Need callback to make sure we get the study before we reflow
                }
            }
        }
        getStudy();
    });
    function setupRequestParams() {
        if(quantimodoService.getUrlParameter("causeVariableName")){ $scope.state.requestParams.causeVariableName = quantimodoService.getUrlParameter("causeVariableName", window.location.href, true); }
        if(quantimodoService.getUrlParameter("effectVariableName")){ $scope.state.requestParams.effectVariableName = quantimodoService.getUrlParameter("effectVariableName", window.location.href, true); }
        if($stateParams.causeVariableName){ $scope.state.requestParams.causeVariableName = $stateParams.causeVariableName; }
        if($stateParams.effectVariableName){ $scope.state.requestParams.effectVariableName = $stateParams.effectVariableName; }
        if(quantimodoService.getUrlParameter("userId")){$scope.state.requestParams.userId = quantimodoService.getUrlParameter("userId");}
        if($rootScope.correlationObject && !$scope.state.requestParams.causeVariableName){
            $scope.state.requestParams = {
                causeVariableName: $rootScope.correlationObject.causeVariableName,
                effectVariableName: $rootScope.correlationObject.effectVariableName
            };
        }
    }
    $scope.refreshStudy = function() {
        quantimodoService.clearCorrelationCache();
        getStudy();
    };
    $scope.joinStudy = function () { $state.go("app.studyJoin", {correlationObject: $rootScope.correlationObject}); };
    if (!clipboard.supported) {
        console.debug("Sorry, copy to clipboard is not supported");
        $scope.hideClipboardButton = true;
    }
    $scope.copyLinkText = "Copy Shareable Link to Clipboard";
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = "Copied!";
        var studyLink;
        if(causeVariableName && effectVariableName){
            studyLink = "https://app.quantimo.do/api/v2/study?causeVariableName=" + encodeURIComponent(causeVariableName) + "&effectVariableName=" + encodeURIComponent(effectVariableName);
        }
        if($rootScope.correlationObject){
            /** @namespace $rootScope.correlationObject.studyLinkStatic */
            if($rootScope.correlationObject.studyLinkStatic){ studyLink = $rootScope.correlationObject.studyLinkStatic; }
            /** @namespace $rootScope.correlationObject.userStudy */
            if($rootScope.correlationObject.userStudy && $rootScope.correlationObject.userStudy.studyLinkStatic){
                studyLink = $rootScope.correlationObject.userStudy.studyLinkStatic;
            }
            /** @namespace $rootScope.correlationObject.publicStudy */
            if($rootScope.correlationObject.publicStudy && $rootScope.correlationObject.publicStudy.studyLinkStatic){
                studyLink = $rootScope.correlationObject.publicStudy.studyLinkStatic;
            }
        }
        clipboard.copyText(studyLink);
    };
    function addWikipediaInfo() {
        $scope.causeWikiEntry = null;
        $scope.causeWikiImage = null;
        $scope.effectWikiEntry = null;
        $scope.effectWikiImage = null;
        var causeSearchTerm = $rootScope.correlationObject.causeVariableCommonAlias;
        if(!causeSearchTerm){ causeSearchTerm = $scope.state.requestParams.causeVariableName; }
        wikipediaFactory.searchArticlesByTitle({
            term: causeSearchTerm,
            pithumbsize: "200",
            exlimit: "1", // (optional) "max": extracts for all articles, otherwise only for the first
            exintro: "1" // (optional) "1": if we just want the intro, otherwise it shows all sections
        }).then(function (causeData) {
            if(causeData.data.query) {
                $scope.causeWikiEntry = causeData.data.query.pages[0].extract;
                //$rootScope.correlationObject.studyBackground = $rootScope.correlationObject.studyBackground + "<br>" + $scope.causeWikiEntry;
                if(causeData.data.query.pages[0].thumbnail){ $scope.causeWikiImage = causeData.data.query.pages[0].thumbnail.source; }
            } else {
                var error = "Wiki not found for " + causeSearchTerm;
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                console.error(error);
            }
        }).catch(function (error) { console.error(error); });
        /** @namespace $rootScope.correlationObject.effectVariableCommonAlias */
        var effectSearchTerm = $rootScope.correlationObject.effectVariableCommonAlias;
        if(!effectSearchTerm){ effectSearchTerm = $scope.state.requestParams.effectVariableName; }
        wikipediaFactory.searchArticlesByTitle({
            term: effectSearchTerm,
            pithumbsize: "200", // (optional) default: 400
            exlimit: "1", // (optional) "max": extracts for all articles, otherwise only for the first
            exintro: "1" // (optional) "1": if we just want the intro, otherwise it shows all sections
        }).then(function (effectData) {
            if(effectData.data.query){
                $scope.effectWikiEntry = effectData.data.query.pages[0].extract;
                //$rootScope.correlationObject.studyBackground = $rootScope.correlationObject.studyBackground + "<br>" + $scope.effectWikiEntry;
                if(effectData.data.query.pages[0].thumbnail){ $scope.effectWikiImage = effectData.data.query.pages[0].thumbnail.source; }
            } else {
                var error = "Wiki not found for " + effectSearchTerm;
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                console.error(error);
            }
        }).catch(function (error) { console.error(error); });
    }
    $scope.weightedPeriod = 5;
    function createUserCharts() {
        $scope.loadingCharts = false;
        /** @namespace $rootScope.correlationObject.causeProcessedDailyMeasurements */
        $scope.causeTimelineChartConfig = quantimodoService.processDataAndConfigureLineChart($rootScope.correlationObject.causeProcessedDailyMeasurements, {variableName: $scope.state.requestParams.causeVariableName});
        /** @namespace $rootScope.correlationObject.effectProcessedDailyMeasurements */
        $scope.effectTimelineChartConfig = quantimodoService.processDataAndConfigureLineChart($rootScope.correlationObject.effectProcessedDailyMeasurements, {variableName: $scope.state.requestParams.effectVariableName});
        quantimodoService.highchartsReflow();
        $ionicLoading.hide();
    }
    function getStudy() {
        $scope.loadingCharts = true;
        if(!$rootScope.correlationObject){$ionicLoading.show();}
        quantimodoService.getStudyDeferred($scope.state.requestParams).then(function (study) {
            $ionicLoading.hide();
            if(study){$scope.state.studyNotFound = false;}
            $rootScope.correlationObject = study;
            createUserCharts();
        }, function (error) {
            console.error(error);
            $ionicLoading.hide();
            $scope.loadingCharts = false;
            $scope.state.studyNotFound = true;
            $scope.state.title = "Not Enough Data, Yet";
        });
    }
    $rootScope.showActionSheetMenu = function() {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: '<i class="icon ion-log-in"></i>' + $rootScope.correlationObject.causeVariableName.substring(0,15) + ' Settings' },
                { text: '<i class="icon ion-log-out"></i>' + $rootScope.correlationObject.effectVariableName.substring(0,15) + ' Settings' },
                { text: '<i class="icon ion-thumbsup"></i> Seems Right' }
            ],
            destructiveText: '<i class="icon ion-thumbsdown"></i>Seems Wrong',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() { console.debug($state.current.name + ": " + 'CANCELLED'); },
            buttonClicked: function(index) {
                if(index === 0){ $state.go("app.variableSettings", {variableName: $rootScope.correlationObject.causeVariableName}); }
                if(index === 1){ $state.go("app.variableSettings", {variableName: $rootScope.correlationObject.effectVariableName}); }
                if(index === 2){ $scope.upVote($rootScope.correlationObject); }
                return true;
            },
            destructiveButtonClicked: function() {
                $scope.downVote($rootScope.correlationObject);
                return true;
            }
        });
        $timeout(function() { hideSheet(); }, 20000);
    };
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
                dataToPass: {
                    propertyToUpdate: propertyToUpdate,
                    buttonText: "Save",
                    variable: variable
                }
            }
        }).then(function(variable) {
            $scope.showLoader("Re-analyzing data using updated " + quantimodoService.explanations[propertyToUpdate].title);
            var postData = {variableName: variable.name};
            postData[propertyToUpdate] = variable[propertyToUpdate];
            quantimodoService.postUserVariableDeferred(postData).then(function (response) {
                getStudy();
            });
        }, function() {console.debug("User cancelled selection");});
    };
    function VariableSettingsController(quantimodoService, dataToPass) {
        var self = this;
        self.title = quantimodoService.explanations[dataToPass.propertyToUpdate].title;
        self.helpText = quantimodoService.explanations[dataToPass.propertyToUpdate].explanation;
        self.placeholder = quantimodoService.explanations[dataToPass.propertyToUpdate].title;
        if(quantimodoService.explanations[dataToPass.propertyToUpdate].unitName){self.placeholder = self.placeholder + " in " + quantimodoService.explanations[dataToPass.propertyToUpdate].unitName;}
        self.value = dataToPass.variable[dataToPass.propertyToUpdate];
        self.unitName = quantimodoService.explanations[dataToPass.propertyToUpdate].unitName;
        self.cancel = function() {
            self.items = null;
            $mdDialog.cancel();
        };
        self.finish = function() {
            dataToPass.variable[dataToPass.propertyToUpdate] = self.value;
            $mdDialog.hide(dataToPass.variable);
        };
    }
});
