angular.module('starter')
.controller('IntroCtrl', function($scope, $state, localStorageService, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, QuantiModo) {

    $scope.viewTitle = config.appSettings.appName;
    $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
    $scope.introSlides = config.appSettings.intro;

    $scope.myIntro = {
        ready : false,
        backgroundColor : 'white',
        textColor : 'black',
        slideIndex : 0,
        // Called to navigate to the main app
        startApp : function() {
            console.debug('startApp: Going to welcome state...');
            $rootScope.hideNavigationMenu = false;
            $state.go(config.appSettings.welcomeState);
        },

        next : function(index) {
            if(index === $scope.introSlides.length - 1){
                console.debug('startApp: Going to welcome state...');
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.welcomeState);
            }
            $ionicSlideBoxDelegate.next();
        },

        previous : function() {
            $ionicSlideBoxDelegate.previous();
        },

        // Called each time the slide changes
        slideChanged : function(index) {
            $scope.myIntro.slideIndex = index;
            if($scope.introSlides[index].backgroundColor){
                $scope.myIntro.backgroundColor = $scope.introSlides[index].backgroundColor;
            }
            if($scope.introSlides[index].textColor){
                $scope.myIntro.textColor = $scope.introSlides[index].textColor;
            }
        }
    };

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        if($scope.introSlides[0].backgroundColor){
            $scope.myIntro.backgroundColor = $scope.introSlides[0].backgroundColor;
        }
        if($scope.introSlides[0].textColor){
            $scope.myIntro.textColor = $scope.introSlides[0].textColor;
        }
        if(QuantiModo.getAccessTokenFromUrlParameter()){
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
        if(navigator && navigator.splashscreen) {
            console.debug('introCtrl.afterEnter: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
    });

});
