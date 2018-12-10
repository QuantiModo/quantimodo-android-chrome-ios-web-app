angular.module('starter').controller('IntroCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading",
    "$rootScope", "$stateParams", "qmService", "qmLogService", "appSettingsResponse", "$timeout",
    function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
             $rootScope, $stateParams, qmService, qmLogService, appSettingsResponse, $timeout) {

    qmLogService.debug('IntroCtrl first starting in state: ' + $state.current.name);
    qmService.initializeApplication(appSettingsResponse);
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.state = {
        hideSplashText: false,
        hideCircle: false,
        backgroundImage: null,
        splashBackground: true,
        speechEnabled: null,
        setSpeechEnabled: function(value){
            $scope.state.speechEnabled = value;
            qmService.rootScope.setProperty('speechEnabled', value);
            $scope.showRobot = value;  // For some reason rootScope.showRobot doesn't work
            qm.speech.setSpeechEnabled(value);
            if(value){readMachinesOfLovingGrace();} else {$scope.myIntro.ready = true;}
        }
    };
    var slide;
    $scope.myIntro = {
        ready : false,
        backgroundColor : 'white',
        textColor : 'black',
        slideIndex : 0,
        startApp : function() {
            qmService.intro.setIntroSeen(true, "User clicked startApp in intro");
            if($state.current.name.indexOf('intro') !== -1){
                function goToLoginConfigurationOrOnboarding(){
                    // Called to navigate to the main app
                    if(qm.auth.sendToLogin("Intro has completed")){ return; }
                    if(qm.platform.isDesignMode()){
                        qmService.goToState(qm.stateNames.configuration);
                    } else {
                        qmService.goToState(qm.stateNames.onboarding);
                    }
                }
                var message = "Now let's create a mathematical model of YOU!  ";
                if(slide){slide.title = message;}
                qm.speech.talkRobot(message, goToLoginConfigurationOrOnboarding, goToLoginConfigurationOrOnboarding);
            } else {
                console.error('Why are we calling $scope.myIntro.startApp from state other than into?');
            }
        },
        next : function(index) {
            qmLog.info("Going to next slide");
            if(!index && index !== 0){index = $scope.myIntro.slideIndex;}
            qmService.intro.setIntroSeen(true, "User clicked next in intro");
            var introSlides = $rootScope.appSettings.appDesign.intro.active;
            if(index === introSlides.length - 1){
                $scope.myIntro.startApp();
            } else {
                $ionicSlideBoxDelegate.next();
            }
            qm.splash.text.hide();
        },
        previous : function() { $ionicSlideBoxDelegate.previous(); },
        slideChanged : function(index) {
            qmLog.info("slideChanged");
            $scope.myIntro.slideIndex = index;
            if(index > 0 ){qm.splash.text.hide();}
            readSlide();
            setColorsFromSlide(introSlides()[index]);
        }
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        $rootScope.hideNavigationMenu = true; // Need set hideNavigationMenu immediately (without timeout) in intro beforeEnter or it will show part of the second slide
        //qmLogService.debug("Entering state " + $state.current.name);
        if(!$rootScope.appSettings){qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());}
        makeBackgroundTransparentIfUsingFuturisticBackground();
        setColorsFromSlide(introSlides()[0]);
        if(qm.auth.getAccessTokenFromCurrentUrl() && !$stateParams.doNotRedirect){
            qmLogService.debug('introCtrl beforeEnter: Skipping to default state because we have access token in url: ' +
                qm.getAppSettings().appDesign.defaultState, null);
            qmService.goToDefaultState();
        } else {
            //qmLogService.debug($state.current.name + ' initializing...');
        }
        if(!qm.speech.getSpeechAvailable() || useFuturisticBackground() === false){
            $scope.state.setSpeechEnabled(false);
        }
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        qm.splash.text.show();
        qmService.splash.hideSplashScreen();
        qm.robot.onRobotClick = $scope.myIntro.next;
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
    $scope.$on('$ionicView.beforeLeave', function(){
        qm.music.fadeOut();
        qm.robot.onRobotClick = null;
    });
    function makeBackgroundTransparentIfUsingFuturisticBackground() {
        if(useFuturisticBackground() !== false){
            var slides = introSlides();
            slides.forEach(function (slide) {
                slide.color.backgroundColor = 'transparent';
            })
        }
    }
    function introSettings() {return $rootScope.appSettings.appDesign.intro;}
    function introSlides() {return introSettings().active;}
    function useFuturisticBackground() {return introSettings().futuristicBackground;}
    function setColorsFromSlide(slide) {
        if(useFuturisticBackground()){
            if (slide.color.backgroundColor) {
                $scope.myIntro.backgroundColor = slide.color.backgroundColor;
            }
            if (slide.backgroundColor) {
                $scope.myIntro.backgroundColor = slide.backgroundColor;
            }
        }
        if (slide.textColor) {
            $scope.myIntro.textColor = slide.textColor;
        }
    }
    function readSlide() {
        //qm.visualizer.hide();
        //qm.mic.setMicEnabled(false);
        if(!qm.speech.getSpeechAvailable()){return;}
        if(!qm.speech.getSpeechEnabled()){return;}
        qm.music.play();
        var slide = getSlide();
        $scope.state.hideCircle = $scope.myIntro.slideIndex === 0;
        $scope.state.hideSplashText = $scope.myIntro.slideIndex !== 0;
        qm.speech.talkRobot(
            //slide.title + ".  " +
            slide.bodyText + ".  "
            , $scope.myIntro.next
            , function (error){
               qmLog.info("Could not read intro slide because: " + error);
            },  false, false
        );
        slide.bodyText = null;
    }
    function getSlide(){
        return introSlides()[$scope.myIntro.slideIndex];
    }
    function readMachinesOfLovingGrace() {
        qm.robot.showRobot();
        qm.mic.setMicEnabled(true);
        qm.visualizer.rainbowCircleVisualizer();
        function callback(){
            $scope.myIntro.ready = true;
            readSlide();
        }
        //callback();
        qm.speech.machinesOfLovingGrace(callback);
        qm.music.play();
    }
}]);
