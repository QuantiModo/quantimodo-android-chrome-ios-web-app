angular.module('starter')
.controller('UpgradeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService, $timeout) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);

        $rootScope.upgradeFooterText = null;
        quantimodoService.setupUpgradePages();

        $ionicLoading.hide();
    });

    $scope.$on('$ionicView.afterEnter', function(){
    });

    $scope.$on('$ionicView.leave', function(){
        $rootScope.hideNavigationMenu = false; console.debug('$rootScope.hideNavigationMenu = false');
    });

    $scope.$on('$ionicView.beforeLeave', function(){

    });

    $scope.$on('$ionicView.afterLeave', function(){

    });


});
