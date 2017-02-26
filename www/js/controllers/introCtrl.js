angular.module('starter').controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                                           $rootScope, $stateParams, quantimodoService) {

    $scope.primaryOutcomeVariableName = config.appSettings.primaryOutcomeVariableDetails.name;
    if($state.current.name === 'app.introNew'){ $scope.introSlides = quantimodoService.getIntroSlidesNew(); }
    else { $scope.introSlides = quantimodoService.getIntroSlides(); }
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
            if(index === $scope.introSlides.length - 1){$scope.myIntro.startApp();} else {$ionicSlideBoxDelegate.next();}
        },
        previous : function() { $ionicSlideBoxDelegate.previous(); },
        slideChanged : function(index) {
            $scope.myIntro.slideIndex = index;
            if($scope.introSlides[index].backgroundColor){$scope.myIntro.backgroundColor = $scope.introSlides[index].backgroundColor;}
            if($scope.introSlides[index].textColor){$scope.myIntro.textColor = $scope.introSlides[index].textColor;}
        }
    };

    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        if($scope.introSlides[0].backgroundColor){ $scope.myIntro.backgroundColor = $scope.introSlides[0].backgroundColor; }
        if($scope.introSlides[0].textColor){ $scope.myIntro.textColor = $scope.introSlides[0].textColor; }
        if(quantimodoService.getAccessTokenFromUrlParameter()){
            console.debug('introCtrl beforeEnter: Skipping to default state: ' + config.appSettings.defaultState);
            $state.go(config.appSettings.defaultState);
        } else {
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.myIntro.ready = true;
            $rootScope.hideNavigationMenu = true;
        }
        localStorage.setItem('introSeen', true);
    });

    $scope.$on('$ionicView.afterEnter', function(){
        $rootScope.hideNavigationMenu = true;
        if(navigator && navigator.splashscreen) {
            console.debug('introCtrl.afterEnter: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
        quantimodoService.setupOnboardingPages(); // Preemptive setup to avoid transition artifacts
    });

});
