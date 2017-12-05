angular.module('starter').controller('IntroCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading", "$rootScope", "$stateParams", "qmService", "qmLogService", "appSettingsResponse", function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                                           $rootScope, $stateParams, qmService, qmLogService, appSettingsResponse) {

    if(window.debugMode){qmLogService.debug(null, 'IntroCtrl first starting in state: ' + $state.current.name, null);}
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
        //qmLogService.debug("Entering state " + $state.current.name);
        if(!$rootScope.appSettings){$rootScope.appSettings = window.config.appSettings;}
        if($rootScope.appSettings.appDesign.intro.active[0].backgroundColor){ $scope.myIntro.backgroundColor = $rootScope.appSettings.appDesign.intro.active[0].backgroundColor; }
        if($rootScope.appSettings.appDesign.intro.active[0].textColor){ $scope.myIntro.textColor = $rootScope.appSettings.appDesign.intro.active[0].textColor; }
        if(qm.auth.getAccessTokenFromCurrentUrl() && !$stateParams.doNotRedirect){
            qmLogService.debug('introCtrl beforeEnter: Skipping to default state because we have access token in url: ' + config.appSettings.appDesign.defaultState, null);
            qmService.goToDefaultState();
        } else {
            //qmLogService.debug($state.current.name + ' initializing...');
            $scope.myIntro.ready = true;
            $rootScope.hideNavigationMenu = true;
        }
        qmService.qmStorage.setItem('introSeen', true);
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmService.hideLoader();
        $rootScope.hideNavigationMenu = true;
        if(navigator && navigator.splashscreen) {
            qmLogService.debug('introCtrl.afterEnter: Hiding splash screen because app is ready', null);
            navigator.splashscreen.hide();
        }
        qmService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
}]);
