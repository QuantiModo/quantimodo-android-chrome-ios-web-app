angular.module('starter')
.controller('UpgradeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

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

    $scope.hideUpgradePage = function () {

        $rootScope.upgradePages = $rootScope.upgradePages.filter(function( obj ) {
            return obj.id !== $rootScope.upgradePages[0].id;
        });

        if($rootScope.upgradePages.length === 1){
            $scope.hideLearnMoreButton = true;
        }

        if(!$rootScope.upgradePages || $rootScope.upgradePages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.defaultState);
        } else {
            $rootScope.hideMenuButton = true;
        }
    };
    
});
