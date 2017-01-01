angular.module('starter')
.controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        quantimodoService.setupHelpCards();

    });

    $scope.$on('$ionicView.afterEnter', function(){

    });

});
