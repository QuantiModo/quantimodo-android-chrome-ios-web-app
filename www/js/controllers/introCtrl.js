angular.module('starter').controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                                           $rootScope, $stateParams, qmService, appSettingsResponse) {

    if(window.debugMode){qmService.logDebug('IntroCtrl first starting in state: ' + $state.current.name);}
    qmService.initializeApplication(appSettingsResponse);
    $rootScope.showFilterBarSearchIcon = false;
    $scope.myIntro = {
        ready : false,
        backgroundColor : 'white',
        textColor : 'black',
        slideIndex : 0,
        startApp : function() {
            if($state.current.name.indexOf('intro') !== -1){
                // Called to navigate to the main app
                if(qmService.sendToLogin()){ return; }
                qmService.goToState('app.onboarding');
            } else {
                console.error("Why are we calling $scope.myIntro.startApp from state other than into?");
            }
        },
        next : function(index) {
            if(index === $rootScope.appSettings.appDesign.intro.active.length - 1){$scope.myIntro.startApp();} else {$ionicSlideBoxDelegate.next();}
        },
        previous : function() { $ionicSlideBoxDelegate.previous(); },
        slideChanged : function(index) {
            $scope.myIntro.slideIndex = index;
            if($rootScope.appSettings.appDesign.intro.active[index].backgroundColor){$scope.myIntro.backgroundColor = $rootScope.appSettings.appDesign.intro.active[index].backgroundColor;}
            if($rootScope.appSettings.appDesign.intro.active[index].textColor){$scope.myIntro.textColor = $rootScope.appSettings.appDesign.intro.active[index].textColor;}
        }
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        //qmService.logDebug("Entering state " + $state.current.name);
        if(!$rootScope.appSettings){$rootScope.appSettings = window.config.appSettings;}
        if($rootScope.appSettings.appDesign.intro.active[0].backgroundColor){ $scope.myIntro.backgroundColor = $rootScope.appSettings.appDesign.intro.active[0].backgroundColor; }
        if($rootScope.appSettings.appDesign.intro.active[0].textColor){ $scope.myIntro.textColor = $rootScope.appSettings.appDesign.intro.active[0].textColor; }
        if(qmService.getAccessTokenFromCurrentUrl() && !$stateParams.doNotRedirect){
            qmService.logDebug('introCtrl beforeEnter: Skipping to default state because we have access token in url: ' + config.appSettings.appDesign.defaultState);
            qmService.goToState(config.appSettings.appDesign.defaultState);
        } else {
            //qmService.logDebug($state.current.name + ' initializing...');
            $scope.myIntro.ready = true;
            $rootScope.hideNavigationMenu = true;
        }
        qmService.setLocalStorageItem('introSeen', true);
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        $rootScope.hideNavigationMenu = true;
        if(navigator && navigator.splashscreen) {
            qmService.logDebug('introCtrl.afterEnter: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
});
