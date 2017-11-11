angular.module("starter").controller("StudyCtrl", ["$scope", "$state", "qmService", "qmLogService", "$stateParams", "$ionicHistory", "$rootScope", "$timeout", "$ionicLoading", "wikipediaFactory", "$ionicActionSheet", "clipboard", "$mdDialog", function($scope, $state, qmService, qmLogService, $stateParams, $ionicHistory, $rootScope,
                                      $timeout, $ionicLoading, wikipediaFactory, $ionicActionSheet, clipboard, $mdDialog) {
    VariableSettingsController.$inject = ["qmService", "qmLogService", "dataToPass"];
    $scope.controller_name = "StudyCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.$on("$ionicView.beforeEnter", function() {
        qmLogService.debug(null, 'beforeEnter state ' + $state.current.name, null);
        $scope.state = {
            title: "Loading study...",
            requestParams: {},
            hideStudyButton: true,
            loading: true
        };
        qmService.hideLoader(); // Hide before robot is called in afterEnter
    });
    $scope.$on("$ionicView.enter", function() {
        qmLogService.debug(null, 'enter state ' + $state.current.name, null);
        qmService.unHideNavigationMenu();
        if($stateParams.correlationObject){
            qmService.qmStorage.setItem('lastStudy', JSON.stringify($stateParams.correlationObject));
            $rootScope.correlationObject = $stateParams.correlationObject;
        }
        setupRequestParams();
        if(!$rootScope.correlationObject){
            var lastStudy = qmStorage.getAsObject("lastStudy");
            if(lastStudy){
                if((!$scope.state.requestParams.causeVariableName || !$scope.state.requestParams.effectVariableName) ||
                    (lastStudy.causeVariableName === $scope.state.requestParams.causeVariableName && lastStudy.effectVariableName === $scope.state.requestParams.effectVariableName)){
                    $rootScope.correlationObject = lastStudy;
                    setupRequestParams();
                }
            }
        }
        getStudy();
    });
    $scope.$on("$ionicView.afterEnter", function() {
        robots();
    });
    function setupRequestParams() {
        if(urlHelper.getParam("causeVariableName")){ $scope.state.requestParams.causeVariableName = urlHelper.getParam("causeVariableName", window.location.href, true); }
        if(urlHelper.getParam("effectVariableName")){ $scope.state.requestParams.effectVariableName = urlHelper.getParam("effectVariableName", window.location.href, true); }
        if($stateParams.causeVariableName){ $scope.state.requestParams.causeVariableName = $stateParams.causeVariableName; }
        if($stateParams.effectVariableName){ $scope.state.requestParams.effectVariableName = $stateParams.effectVariableName; }
        if(urlHelper.getParam("userId")){$scope.state.requestParams.userId = urlHelper.getParam("userId");}
        if($rootScope.correlationObject && !$scope.state.requestParams.causeVariableName){
            $scope.state.requestParams = {
                causeVariableName: $rootScope.correlationObject.causeVariableName,
                effectVariableName: $rootScope.correlationObject.effectVariableName
            };
        }
    }
    $scope.refreshStudy = function() {
        qmService.clearCorrelationCache();
        getStudy();
    };
    $scope.joinStudy = function () { qmService.goToState("app.studyJoin", {correlationObject: $rootScope.correlationObject}); };
    if (!clipboard.supported) {
        qmLogService.debug(null, 'Sorry, copy to clipboard is not supported', null);
        $scope.hideClipboardButton = true;
    }
    $scope.copyLinkText = "Copy Shareable Link to Clipboard";
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = "Copied!";
        var studyLink;
        if(causeVariableName && effectVariableName){studyLink = qmService.getStudyLinkByVariableNames(causeVariableName, effectVariableName);}
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
                qmLogService.error(null, error);
            }
        }).catch(function (error) { qmLogService.error(null, error); });
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
                qmLogService.error(null, error);
            }
        }).catch(function (error) { qmLogService.error(null, error); });
    }
    $scope.weightedPeriod = 5;
    function getStudy() {
        if(!$scope.state.requestParams.causeVariableName || !$scope.state.requestParams.effectVariableName){
            qmLogService.error(null, 'Cannot get study. Missing cause or effect variable name.');
            qmService.goToState(config.appSettings.appDesign.defaultState);
            return;
        }
        $scope.loadingCharts = true;
        qmService.getStudyDeferred($scope.state.requestParams).then(function (study) {
            qmService.hideLoader();
            if(study){$scope.state.studyNotFound = false;}
            $scope.study = study;
            $scope.loadingCharts = false;
            $rootScope.correlationObject = study.statistics;
        }, function (error) {
            qmLogService.error(null, error);
            qmService.hideLoader();
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
            cancel: function() { qmLogService.debug(null, $state.current.name + ': ' + 'CANCELLED', null); },
            buttonClicked: function(index) {
                if(index === 0){ qmService.goToVariableSettingsByObject($rootScope.correlationObject.causeVariable); }
                if(index === 1){ qmService.goToVariableSettingsByObject($rootScope.correlationObject.effectVariable); }
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
            qmService.showInfoToast("Re-analyzing data using updated " + qmService.explanations[propertyToUpdate].title);
            var postData = {variableName: variable.name};
            postData[propertyToUpdate] = variable[propertyToUpdate];
            qmService.postUserVariableDeferred(postData).then(function (response) {
                getStudy();
            });
        }, function() {qmLogService.debug(null, 'User cancelled selection', null);});
    };
    function VariableSettingsController(qmService, qmLogService, dataToPass) {
        var self = this;
        self.title = qmService.explanations[dataToPass.propertyToUpdate].title;
        self.helpText = qmService.explanations[dataToPass.propertyToUpdate].explanation;
        self.placeholder = qmService.explanations[dataToPass.propertyToUpdate].title;
        if(qmService.explanations[dataToPass.propertyToUpdate].unitName){self.placeholder = self.placeholder + " in " + qmService.explanations[dataToPass.propertyToUpdate].unitName;}
        self.value = dataToPass.variable[dataToPass.propertyToUpdate];
        self.unitName = qmService.explanations[dataToPass.propertyToUpdate].unitName;
        self.cancel = function() {
            self.items = null;
            $mdDialog.cancel();
        };
        self.finish = function() {
            dataToPass.variable[dataToPass.propertyToUpdate] = self.value;
            $mdDialog.hide(dataToPass.variable);
        };
    }

     var robots = function(){
        var tm = new TimelineMax({repeat:-1,repeatDelay:2})
            //.to('#redBot',2,{x:500,ease:Power3.easeInOut},'+=2')
            .fromTo('#blueBot',2,{x:0},{x:0,ease:Power3.easeInOut},'-=1.5')
            //.to('body',2,{backgroundColor:'#FFDC6D'},'-=2')
            .to('#blueBot',2,{x:0,onStart:newBot,ease:Power3.easeInOut},'+=2')

        function newBot(){
            TweenMax.fromTo('#redBot',2,{x:-1000},{x:0,delay:.65,ease:Power3.easeInOut})
            TweenMax.to('body',2,{backgroundColor:'#ADBD90',delay:.65})
        }

// /////////////////////////////////////////////////////////////

        var sig = new TimelineMax({repeat:-1})
        sig.fromTo('#redBotSignal', .5,{drawSVG:"0% 15%",ease:Linear.easeInOut},{drawSVG:"85% 100%",ease:Linear.easeInOut})
            .fromTo('#redBotSignal', .5,{drawSVG:"85% 100%",ease:Linear.easeInOut},{drawSVG:"0% 15%",ease:Linear.easeInOut})

        var bolt = new TweenMax.to(['#bolt','#leftEar','#rightEar','#nose'],.5,{opacity:.25,onComplete:function(){bolt.reverse()},onReverseComplete:function(){bolt.play()}})

        var rhb = new TweenMax.to('#redHeart',.5,{scale:1.1,transformOrigin:'50% 50%',ease:Power2.easeInOut,onComplete:function(){rhb.reverse()},onReverseComplete:function(){rhb.play()}})

        var sra= new TweenMax.to('#redRightArm',.5,{rotation:-3,ease:Linear.easeInOut,transformOrigin:'45% 25%',onComplete:function(){sra.reverse()},onReverseComplete:function(){sra.play()}})

        var sla= new TweenMax.to('#redLeftArm',.5,{rotation:3,ease:Linear.easeInOut,transformOrigin:'25% 25%',onComplete:function(){sla.reverse()},onReverseComplete:function(){sla.play()}})

        var redhead = new TweenMax.to('#redHead',1,{y:5,ease:Power2.easeInOut,onComplete:function(){redhead.reverse()},onReverseComplete:function(){redhead.play()}})

// ////////////////////////////////////////////////////

        var lights1 = new TweenMax.staggerFromTo(['#light3','#light6'],.5,{fill:'#fff'},{fill:'#398080',repeat:-1},0.2)
        var lights2 = new TweenMax.staggerFromTo(['#light2','#light5'],.5,{fill:'#398080'},{fill:'#E20717',repeat:-1},0.2)
        var lights3 = new TweenMax.staggerFromTo(['#light1','#light4'],.5,{fill:'#E20717'},{fill:'#fffff',repeat:-1},0.2)
        var eeg = new TweenMax.fromTo('#pulse',2,{drawSVG:"0%",ease:Linear.easeInOut},{drawSVG:"100%",ease:Linear.easeInOut,repeat:-1})
        var static = new TweenMax.fromTo('#blueBotStatic',.75,{ease:Power1.easeInOut,opacity:0},{ease:Power1.easeInOut,opacity:1,repeat:-1})
        var blueBotRArm= new TweenMax.to('#blueBotRightArm',.5,{rotation:-3,y:2,ease:Linear.easeInOut,transformOrigin:'65% 100%',onComplete:function(){blueBotRArm.reverse()},onReverseComplete:function(){blueBotRArm.play()}})
        var blueBotLArm= new TweenMax.to('#blueBotLeftArm',.5,{rotation:3,y:2,ease:Linear.easeInOut,transformOrigin:'100% 65%',onComplete:function(){blueBotLArm.reverse()},onReverseComplete:function(){blueBotLArm.play()}})
        var dial = new TweenMax.to('#dial',.5,{rotation:30,ease:Linear.easeInOut,transformOrigin:'50% 100%',onComplete:function(){dial.reverse()},onReverseComplete:function(){dial.play()}})
        var blueBotBody = new TweenMax.to('#blueBotBody',.5,{y:2,ease:Sine.easeInOut,onComplete:function(){blueBotBody.reverse()},onReverseComplete:function(){blueBotBody.play()}})
        var blueBotHead = new TweenMax.to('#blueBotHead',.5,{y:-2,ease:Sine.easeInOut,onComplete:function(){blueBotHead.reverse()},onReverseComplete:function(){blueBotHead.play()}})
        var mouthBars = new TweenMax.staggerFromTo('#mouthBars rect',.5,{fill:'#398080'},{fill:'#fffff',repeat:-1},0.2)
        var eyes = new TweenMax.to('#blueBotEyes',.5,{scale:1.1,transformOrigin:'50% 50%',ease:Sine.easeInOut,onComplete:function(){eyes.reverse()},onReverseComplete:function(){eyes.play()}})
    }

}]);
