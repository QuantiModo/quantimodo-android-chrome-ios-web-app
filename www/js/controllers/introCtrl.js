angular.module('starter')
.controller('IntroCtrl', function($scope, $state, localStorageService, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope) {

    $scope.viewTitle = config.appSettings.appName;
    $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
    $scope.introConfiguration = config.appSettings.intro;

    $scope.myIntro = {
        ready : false,

        slideIndex : 0,
        // Called to navigate to the main app
        startApp : function() {
            $rootScope.introSeen = true;
            localStorageService.setItem('introSeen', true);
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

    $scope.showLoader = function (loadingText) {
        if(!loadingText){
            loadingText = '';
        }
        $scope.loading = true;
        $ionicLoading.show({
            template: loadingText+ '<br><br><img src={{loaderImagePath}}>',
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 1000,
            showDelay: 0
        });
    };

    $scope.hideLoader = function () {
        $scope.loading = false;
        $ionicLoading.hide();
    };

    var init = function(){
        if($rootScope.user || $rootScope.introSeen){
            $state.go(config.appSettings.defaultState);
        } else {
            Bugsnag.context = "intro";

            $scope.showLoader();

            localStorageService.getItem('introSeen', function(introSeen){
                if(introSeen){
                    console.debug('introCtrl init: Going to default state: ' + config.appSettings.defaultState);
                    $state.go(config.appSettings.defaultState);
                } else {
                    $scope.myIntro.ready = true;
                }
                $scope.hideLoader();
            });
        }
    };


    // when view is changed
    $scope.$on('$ionicView.enter', function(e) {
        $scope.hideLoader();
        init();
    });

});
