angular.module('starter').controller('IntroCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading", "$rootScope", "$stateParams", "qmService", "qmLogService", "appSettingsResponse", function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                                           $rootScope, $stateParams, qmService, qmLogService, appSettingsResponse) {

    if(window.debugMode){qmLogService.debug('IntroCtrl first starting in state: ' + $state.current.name, null);}
    qmService.initializeApplication(appSettingsResponse);
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.myIntro = {
        ready : false,
        backgroundColor : 'white',
        textColor : 'black',
        slideIndex : 0,
        startApp : function() {
            if($state.current.name.indexOf('intro') !== -1){
                // Called to navigate to the main app
                if(qmService.sendToLogin()){ return; }
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
        qmService.storage.setItem('introSeen', true);
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        if(navigator && navigator.splashscreen) {
            qmLogService.debug('introCtrl.afterEnter: Hiding splash screen because app is ready', null);
            navigator.splashscreen.hide();
        }
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
}]);
