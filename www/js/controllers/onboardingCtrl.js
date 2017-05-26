angular.module('starter').controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, quantimodoService, onboardingPages) {
    $scope.$on('$ionicView.beforeEnter', function(e) {
        console.debug('OnboardingCtrl beforeEnter in state ' + $state.current.name);
        $rootScope.hideNavigationMenu = true;
        if(quantimodoService.goToLoginIfNecessary()){ return; }
        quantimodoService.setupOnboardingPages(onboardingPages.data);
        quantimodoService.hideLoader();
        $rootScope.hideNavigationMenu = true;
        $scope.circlePage = $rootScope.onboardingPages[0];
    });
    $scope.$on('$ionicView.afterEnter', function(){
        console.debug('OnboardingCtrl afterEnter in state ' + $state.current.name);
        quantimodoService.getConnectorsDeferred(); // Make sure they're ready in advance
    });
    var removeImportPage = function () {
        quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
        var onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {return obj.id.indexOf('import') === -1;});
        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify(onboardingPages));
        $scope.circlePage = $rootScope.onboardingPages[0];
    };
    $scope.onboardingGoToImportPage = function () {
        $rootScope.hideHomeButton = true;
        $rootScope.hideMenuButton = true;
        removeImportPage();
        $scope.circlePage = $rootScope.onboardingPages[0];
        $scope.circlePage.nextPageButtonText = "Done connecting data sources";
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
    $scope.goToReminderSearchCategoryFromOnboarding = function() {
        $rootScope.hideHomeButton = true;
        $rootScope.hideMenuButton = true;
        if(!$rootScope.user){
            $rootScope.onboardingPages = null;
            quantimodoService.deleteItemFromLocalStorage('onboardingPages');
            $state.go('app.onboarding');
            return;
        }
        $scope.goToReminderSearchCategory($scope.circlePage.variableCategoryName);
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
        $scope.circlePage = $rootScope.onboardingPages[0];
        if(!$rootScope.onboardingPages || $rootScope.onboardingPages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.defaultState);
        } else {
            $rootScope.hideMenuButton = true;
        }
    };
});
