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
                    if(qm.auth.sendToLogin()){ return; }
                    if(qm.platform.isDesignMode()){
                        qmService.goToState(qmStates.configuration);
                    } else {
                        qmService.goToState(qmStates.onboarding);
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
            var intro = $rootScope.appSettings.appDesign.intro.active;
            if(index === intro.length - 1){
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
            slide = $rootScope.appSettings.appDesign.intro.active[index];
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
        }
        if(!qm.speech.getSpeechAvailable()){$scope.state.setSpeechEnabled(false);}
    });
    function readSlide() {
        //qm.visualizer.hide();
        qm.microphone.setMicrophoneEnabled(false);
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
        return $rootScope.appSettings.appDesign.intro.active[$scope.myIntro.slideIndex];
    }
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        qm.splash.text.show();
        qmService.splash.hideSplashScreen();
        $scope.state.robotClick = $scope.myIntro.next;
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
    $scope.$on('$ionicView.beforeLeave', function(){
        qm.music.fadeOut();
    });
    function readMachinesOfLovingGrace() {
        qm.robot.show();
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
