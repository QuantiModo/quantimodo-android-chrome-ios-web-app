angular.module('starter').controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, quantimodoService) {
    $scope.$on('$ionicView.beforeEnter', function(e) {
        console.debug('OnboardingCtrl beforeEnter in state ' + $state.current.name);
        $rootScope.hideNavigationMenu = true;
        if(quantimodoService.goToLoginIfNecessary()){ return; }
        $scope.hideLoader();
        quantimodoService.setupOnboardingPages();
        if($rootScope.onboardingPages && $rootScope.user){
            $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
                return obj.id !== 'loginOnboardingPage';
            });
        }
        $ionicLoading.hide();
        $rootScope.hideNavigationMenu = true;
    });
    $scope.$on('$ionicView.afterEnter', function(){
        console.debug('OnboardingCtrl afterEnter in state ' + $state.current.name);
        quantimodoService.getConnectorsDeferred(); // Make sure they're ready in advance
    });
    $scope.showMaterialAlert = function(title, textContent, ev) {quantimodoService.showMaterialAlert(title, textContent, ev);};
    var removeImportPage = function () {
        quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
        var onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {return obj.id.indexOf('import') === -1;});
        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify(onboardingPages));
    };
    $scope.onboardingGoToImportPage = function () {
        $rootScope.hideHomeButton = true;
        $rootScope.hideMenuButton = true;
        removeImportPage();
        $rootScope.onboardingPages[0].nextPageButtonText = "Done connecting data sources";
        $state.go('app.import');
    };
    $scope.goToUpgradePage = function () {
        $rootScope.backButtonState = 'app.onboarding';
        $state.go('app.upgrade');
    };
    $scope.skipOnboarding = function () {
        $rootScope.hideMenuButton = false;
        window.localStorage.onboarded = true;
        $state.go(config.appSettings.defaultState);
    };
    $rootScope.showMoreOnboardingInfo = function () {
        $scope.onHelpButtonPress($rootScope.onboardingPages[0].title, $rootScope.onboardingPages[0].moreInfo);
    };
    $scope.goToReminderSearchCategoryFromOnboarding = function() {
        $rootScope.hideHomeButton = true;
        $rootScope.hideMenuButton = true;
        if(!$rootScope.user){
            $rootScope.onboardingPages = null;
            quantimodoService.deleteItemFromLocalStorage('onboardingPages');
            $state.go('app.onboarding');
            return;
        }
        $scope.goToReminderSearchCategory($rootScope.onboardingPages[0].variableCategoryName);
    };
    $scope.enableLocationTracking = function (event) {
        $scope.trackLocationChange(event, true);
        $scope.hideOnboardingPage();
    };
    $scope.connectWeatherOnboarding = function (event) {
        $scope.connectWeather();
        $scope.hideOnboardingPage();
    };
    $scope.doneOnboarding = function () {
        $state.go('app.remindersInbox');
        $rootScope.hideMenuButton = false;
        window.localStorage.onboarded = true;
        quantimodoService.deleteItemFromLocalStorage('onboardingPages');
    };
    $scope.hideOnboardingPage = function () {
        $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {return obj.id !== $rootScope.onboardingPages[0].id;});
        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify($rootScope.onboardingPages));
        if(!$rootScope.onboardingPages || $rootScope.onboardingPages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.defaultState);
        } else {
            $rootScope.hideMenuButton = true;
        }
    };
});
