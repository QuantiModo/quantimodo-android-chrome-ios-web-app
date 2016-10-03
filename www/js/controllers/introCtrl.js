angular.module('starter')
.controller('IntroCtrl', function($scope, $state, localStorageService, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams) {

    $scope.viewTitle = config.appSettings.appName;
    $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
    $scope.introConfiguration = config.appSettings.intro;

    $scope.myIntro = {
        ready : false,

        slideIndex : 0,
        // Called to navigate to the main app
        startApp : function() {
            localStorage.setItem('introSeen', true);
            console.debug('startApp: Going to welcome state...');
            $state.go(config.appSettings.welcomeState);
        },

        next : function() {
            $ionicSlideBoxDelegate.next();
        },

        previous : function() {
            $ionicSlideBoxDelegate.previous();
        },

        // Called each time the slide changes
        slideChanged : function(index) {
            $scope.myIntro.slideIndex = index;
        }
    };

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        if($rootScope.user || window.localStorage.introSeen || $rootScope.getAccessTokenFromUrlParameter()){
            console.debug('introCtrl init: Skipping to default state: ' + config.appSettings.defaultState);
            $state.go(config.appSettings.defaultState);
        } else {
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.myIntro.ready = true;
            $scope.hideLoader();
        }
    });

    $scope.$on('$ionicView.afterEnter', function(){
        if(navigator && navigator.splashscreen) {
            console.debug('introCtrl.afterEnter: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
        localStorage.setItem('introSeen', true);
    });

});
