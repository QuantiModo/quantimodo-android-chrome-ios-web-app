angular.module('starter')
.controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        if(!$rootScope.onboardingPages){
            quantimodoService.setupOnboardingPages();
        }
        $ionicLoading.hide();
        $rootScope.hideNavigationMenu = true;
    });

    $scope.$on('$ionicView.afterEnter', function(){

    });

    $rootScope.hideOnboardingPage = function () {
        var card = $rootScope.onboardingPages[0];
        card.hide = true;
        $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id !== card.id;
        });
        quantimodoService.deleteElementOfLocalStorageItemById('onboardingPages', card.id);
        if(!$rootScope.onboardingPages || $rootScope.onboardingPages.length === 0){
            $rootScope.hideNavigationMenu = false;
        } else {
            $rootScope.hideNavigationMenu = true;
        }
    };

});
