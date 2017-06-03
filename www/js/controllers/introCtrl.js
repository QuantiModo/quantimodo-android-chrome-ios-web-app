angular.module('starter').controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, quantimodoService, appSettingsResponse) {

    if(window.debugMode){console.debug('IntroCtrl first starting in state: ' + $state.current.name);}
    quantimodoService.initializeApplication(appSettingsResponse);
    $rootScope.showFilterBarSearchIcon = false;
    $scope.myIntro = {
        ready : false,
        backgroundColor : 'white',
        textColor : 'black',
        slideIndex : 0,
        startApp : function() { // Called to navigate to the main app
            if(!$rootScope.user){ // Prevents onboarding page flicker
                console.debug('Setting afterLoginGoToState to ' + $state.current.name);
                quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.onboarding');
                $state.go('app.login'); return;
            }
            $state.go('app.onboarding');
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
        //console.debug("Entering state " + $state.current.name);
        if(!$rootScope.appSettings){$rootScope.appSettings = window.config.appSettings;}
        if($rootScope.appSettings.appDesign.intro.active[0].backgroundColor){ $scope.myIntro.backgroundColor = $rootScope.appSettings.appDesign.intro.active[0].backgroundColor; }
        if($rootScope.appSettings.appDesign.intro.active[0].textColor){ $scope.myIntro.textColor = $rootScope.appSettings.appDesign.intro.active[0].textColor; }
        if(quantimodoService.getUrlParameter('accessToken')){
            console.debug('introCtrl beforeEnter: Skipping to default state: ' + config.appSettings.appDesign.defaultState);
            $state.go(config.appSettings.appDesign.defaultState);
        } else {
            //console.debug($state.current.name + ' initializing...');
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.myIntro.ready = true;
            $rootScope.hideNavigationMenu = true;
        }

        try {
            localStorage.setItem('introSeen', true);
        } catch(error) {
            var metaData = { localStorageItems: quantimodoService.getLocalStorageList() };
            var name = error;
            var message = 'Error saving introSeen to local storage';
            var severity = 'error';
            quantimodoService.bugsnagNotify(name, message, metaData, severity);
        }
    });
    $scope.$on('$ionicView.afterEnter', function(){
        quantimodoService.hideLoader();
        $rootScope.hideNavigationMenu = true;
        if(navigator && navigator.splashscreen) {
            console.debug('introCtrl.afterEnter: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
        quantimodoService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });
});
