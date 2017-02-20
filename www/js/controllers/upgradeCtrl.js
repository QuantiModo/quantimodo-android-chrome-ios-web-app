angular.module('starter')
.controller('UpgradeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);

        if(!$rootScope.user){ 
            quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.upgrade');
            $state.go('app.login');
            return;
        }

        if($rootScope.isChromeExtension){
            chrome.tabs.create({ url: 'https://app.quantimo.do/upgrade' });
            window.close();
            return;
        }

        $scope.planFeaturesCard = $rootScope.planFeaturesCards[1];
        $rootScope.upgradeFooterText = null;
        $rootScope.hideNavigationMenu = true;
        quantimodoService.setupUpgradePages();

        $ionicLoading.hide();
    });

    $scope.$on('$ionicView.afterEnter', function(){
    });

    $scope.$on('$ionicView.leave', function(){

    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.hideNavigationMenu = false; console.debug('$rootScope.hideNavigationMenu = false');
    });

    $scope.$on('$ionicView.afterLeave', function(){

    });

    $scope.useLitePlan = function () {
        if($stateParams.litePlanState){
            $state.go($stateParams.litePlanState);
        } else {
            $scope.goBack();
        }
    };

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
