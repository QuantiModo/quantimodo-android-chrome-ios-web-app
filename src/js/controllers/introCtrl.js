angular.module('starter').controller('IntroCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading",
    "$rootScope", "$stateParams", "qmService", "qmLogService", "appSettingsResponse", "$timeout",
    function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
             $rootScope, $stateParams, qmService, qmLogService, appSettingsResponse, $timeout) {

    qmLogService.debug('IntroCtrl first starting in state: ' + $state.current.name);
    qmService.initializeApplication(appSettingsResponse);
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.state = {
        hideSplashText: true,
        hideCircle: false,
    };
    $scope.myIntro = {
        ready : false,
        backgroundColor : 'white',
        textColor : 'black',
        slideIndex : 0,
        startApp : function() {
            qmService.intro.setIntroSeen(true, "User clicked startApp in intro");
            if($state.current.name.indexOf('intro') !== -1){
                // Called to navigate to the main app
                if(qm.auth.sendToLogin()){ return; }
                if(qm.platform.isDesignMode()){
                    qmService.goToState(qmStates.configuration);
                } else {
                    qmService.goToState(qmStates.onboarding);
                }
            } else {
                console.error('Why are we calling $scope.myIntro.startApp from state other than into?');
            }
        },
        next : function(index) {
            if(index === null){index = $scope.myIntro.slideIndex++;}
            qmService.intro.setIntroSeen(true, "User clicked next in intro");
            if(index === $rootScope.appSettings.appDesign.intro.active.length - 1){$scope.myIntro.startApp();} else {$ionicSlideBoxDelegate.next();}
        },
        previous : function() { $ionicSlideBoxDelegate.previous(); },
        slideChanged : function(index) {
            $scope.myIntro.slideIndex = index;
            readSlide();
            if($rootScope.appSettings.appDesign.intro.active[index].backgroundColor){$scope.myIntro.backgroundColor = slide.backgroundColor;}
            if($rootScope.appSettings.appDesign.intro.active[index].textColor){$scope.myIntro.textColor = slide.textColor;}
        }
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        $rootScope.hideNavigationMenu = true; // Need set hideNavigationMenu immediately (without timeout) in intro beforeEnter or it will show part of the second slide
        //qmLogService.debug("Entering state " + $state.current.name);
        if(!$rootScope.appSettings){qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());}
        if($rootScope.appSettings.appDesign.intro.active[0].backgroundColor){ $scope.myIntro.backgroundColor = $rootScope.appSettings.appDesign.intro.active[0].backgroundColor; }
        if($rootScope.appSettings.appDesign.intro.active[0].textColor){ $scope.myIntro.textColor = $rootScope.appSettings.appDesign.intro.active[0].textColor; }
        if(qm.auth.getAccessTokenFromCurrentUrl() && !$stateParams.doNotRedirect){
            qmLogService.debug('introCtrl beforeEnter: Skipping to default state because we have access token in url: ' + qm.getAppSettings().appDesign.defaultState, null);
            qmService.goToDefaultState();
        } else {
            //qmLogService.debug($state.current.name + ' initializing...');
            $scope.myIntro.ready = true;
        }
    });
    function readSlide() {
        if(!qm.speech.getSpeechAvailable()){return;}
        var slide = getSlide();
        $scope.state.hideSplashText = $scope.myIntro.slideIndex !== 0;
        $scope.state.hideCircle = $scope.myIntro.slideIndex === 0;
        qm.speech.talkRobot(
            //slide.title + ".  " +
            slide.bodyText + ".  ", $scope.myIntro.next);
    }
    function getSlide(){
        return $rootScope.appSettings.appDesign.intro.active[$scope.myIntro.slideIndex];
    }
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        if(navigator && navigator.splashscreen) {
            qmLogService.debug('introCtrl.afterEnter: Hiding splash screen because app is ready', null);
            navigator.splashscreen.hide();
        }
        qmService.speech.showRobot();
        qm.music.play();
        qmService.speech.showVisualizer("1");
        $timeout(function () {readSlide();}, 1000);  // Wait for robot to render
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
        $scope.$on('$ionicView.afterLeave', function(){
            qm.music.fadeOut();
            qmService.speech.hideVisualizer();
        });
}]);
