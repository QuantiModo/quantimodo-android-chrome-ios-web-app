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
    $scope.$on("$ionicView.afterEnter", function() {
        robots();
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
        if(!$scope.state.requestParams.includeCharts){
            $scope.state.requestParams.includeCharts = true;
            getStudy();
            return;
        }
        $scope.loadingCharts = false;
        /** @namespace $rootScope.correlationObject.causeProcessedDailyMeasurements */
        $scope.causeTimelineChartConfig = quantimodoService.processDataAndConfigureLineChart($rootScope.correlationObject.causeProcessedDailyMeasurements, {variableName: $scope.state.requestParams.causeVariableName});
        /** @namespace $rootScope.correlationObject.effectProcessedDailyMeasurements */
        $scope.effectTimelineChartConfig = quantimodoService.processDataAndConfigureLineChart($rootScope.correlationObject.effectProcessedDailyMeasurements, {variableName: $scope.state.requestParams.effectVariableName});
        quantimodoService.highchartsReflow();
        $ionicLoading.hide();
    }
    function getStudy() {
        if(!$scope.state.requestParams.causeVariableName || !$scope.state.requestParams.effectVariableName){
            console.error('Cannot get study. Missing cause or effect variable name.');
            return;
        }
        $scope.loadingCharts = true;
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
});
