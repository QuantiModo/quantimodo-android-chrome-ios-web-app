angular.module('starter').controller('UpgradeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, quantimodoService) {
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        if(!$rootScope.user){
            console.debug('Setting afterLoginGoToState to ' + $state.current.name);
            quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.upgrade');
            $state.go('app.login');
            return;
        }
        if($rootScope.isChromeExtension){chrome.tabs.create({url: quantimodoService.getApiUrl() + '/upgrade'}); window.close(); return;}
        $scope.planFeaturesCard = quantimodoService.getPlanFeatureCards()[1];
        $rootScope.upgradeFooterText = null;
        $rootScope.hideNavigationMenu = true;
        quantimodoService.setupUpgradePages();
        quantimodoService.hideLoader();
    });
    $scope.useLitePlan = function () {if($stateParams.litePlanState){$state.go($stateParams.litePlanState);} else { $scope.goBack();}};
    $scope.hideUpgradePage = function () {
        $rootScope.upgradePages = $rootScope.upgradePages.filter(function( obj ) {
            return obj.id !== $rootScope.upgradePages[0].id; });
        if($rootScope.upgradePages.length === 1){ $scope.hideLearnMoreButton = true; }
        if(!$rootScope.upgradePages || $rootScope.upgradePages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.defaultState);
        } else { $rootScope.hideMenuButton = true; }
    };
});
