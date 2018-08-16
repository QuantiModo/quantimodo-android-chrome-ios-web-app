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
        backgroundImage: null
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
            $scope.myIntro.slideIndex = index;
            if(index > 0 ){qm.splash.text.hide();}
            readSlide();
            var slide = $rootScope.appSettings.appDesign.intro.active[index];
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
    });
    function readSlide() {
        if(!qm.speech.getSpeechAvailable()){return;}
        if(!qm.speech.getSpeechEnabled()){return;}
        qm.music.play();
        var slide = getSlide();
        $scope.state.hideCircle = $scope.myIntro.slideIndex === 0;
        $scope.state.hideSplashText = $scope.myIntro.slideIndex !== 0;
        qm.speech.talkRobot(
            //slide.title + ".  " +
            slide.bodyText + ".  "
            //, $scope.myIntro.next
        );
        slide.bodyText = null;
    }
    function getSlide(){
        return $rootScope.appSettings.appDesign.intro.active[$scope.myIntro.slideIndex];
    }
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        qm.splash.text.hide();
        qm.splash.text.show();
        if(navigator && navigator.splashscreen) {
            qmLogService.debug('introCtrl.afterEnter: Hiding splash screen because app is ready', null);
            navigator.splashscreen.hide();
        }
        function start(){if(qm.speech.getSpeechEnabled()){readMachinesOfLovingGrace();} else {$scope.myIntro.ready = true;}}
        var speechEnabled = qm.speech.getSpeechEnabled();
        if(qm.speech.getSpeechAvailable() && !speechEnabled){
            qmService.dialogs.mayISpeak(function (answer) {start();});
        } else {
            start();
        }
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
    $scope.$on('$ionicView.beforeLeave', function(){
        qm.music.fadeOut();
        qm.visualizer.hide();
        //qm.appContainer.setOpacity(1);
        qm.robot.hide();
    });
    function readMachinesOfLovingGrace() {
        qm.robot.show();
        qm.music.play();
        qm.visualizer.show();

        qm.speech.talkRobot("I like to think (and " +
            "the sooner the better!) " +
            "of a cybernetic meadow " +
            "where mammals and computers " +
            "live together in mutually " +
            "programming harmony " +
            "like pure water " +
            "touching clear sky! " +
            "I like to think " +
            "(right now, please!) " +
            "of a cybernetic forest " +
            "filled with pines and electronics " +
            "where deer stroll peacefully " +
            "past computers " +
            "as if they were flowers " +
            "with spinning blossoms.  " +
            "I like to think " +
            "(it has to be!) " +
            "of a cybernetic ecology! " +
            "where we are free of our labors " +
            "and joined back to nature, " +
            "returned to our mammal " +
            "brothers and sisters, " +
            "and all watched over " +
            "by machines of loving grace!  " +
            "I'm Dr. Roboto!  ",
            function () {
                $scope.myIntro.ready = true;
                $timeout(function () {
                    readSlide();
                }, 1);
            });
    }
}]);
