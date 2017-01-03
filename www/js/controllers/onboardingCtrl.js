angular.module('starter')
.controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        quantimodoService.setupOnboardingPages();
        if(!$rootScope.onboardingPages){
            quantimodoService.setupOnboardingPages();
        }

        if($rootScope.user){
            $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
                return obj.id !== 'loginOnboardingPage';
            });
        }

        $ionicLoading.hide();
        $rootScope.hideNavigationMenu = true;
    });

    $scope.$on('$ionicView.afterEnter', function(){

    });

    $scope.onboardingLogin = function () {
        if(!$rootScope.user){
            quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
            $scope.login();
            $rootScope.hideOnboardingPage();
        } else {
            $rootScope.hideOnboardingPage();
        }
    };

    $scope.onboardingRegister = function () {
        if(!$rootScope.user){
            quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
            $scope.register();
            $rootScope.hideOnboardingPage();
        } else {
            $rootScope.hideOnboardingPage();
        }
    };

    $rootScope.hideOnboardingPage = function () {

        $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id !== $rootScope.onboardingPages[0].id;
        });

        if(!$rootScope.onboardingPages || $rootScope.onboardingPages.length === 0){
            $rootScope.hideNavigationMenu = false;
            $state.go(console.appSettings.defaultState);
        } else {
            $rootScope.hideNavigationMenu = true;
        }
    }

});
