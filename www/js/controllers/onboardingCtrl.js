angular.module('starter')
.controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

    $scope.$on('$ionicView.beforeEnter', function(e) {
        console.debug("OnboardingCtrl beforeEnter");
        $rootScope.hideNavigationMenu = true;
        if(!$rootScope.user){
            quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.onboarding');
            $state.go('app.login');
            return;
        }
        $scope.hideLoader();
        quantimodoService.setupOnboardingPages();
        if($rootScope.onboardingPages && $rootScope.user){
            $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
                return obj.id !== 'loginOnboardingPage';
            });
        }

        $ionicLoading.hide();
    });

    $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);

    });

    $scope.$on('$ionicView.afterEnter', function(){
        console.debug("OnboardingCtrl afterEnter");
        quantimodoService.getConnectorsDeferred(); // Make sure they're ready in advance
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        console.debug("OnboardingCtrl beforeLeave");
        //Can't do this here because it makes menu show while searching for reminders
        //$rootScope.hideNavigationMenu = false; console.debug('$rootScope.hideNavigationMenu = false');
    });

    $scope.$on('$ionicView.leave', function(){

    });

    $scope.$on('$ionicView.afterLeave', function(){

    });

    var removeImportPage = function () {
        quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
        var onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id.indexOf('import') === -1;
        });
        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify(onboardingPages));
    };

    $rootScope.onboardingGoToImportPage = function () {
        $rootScope.hideHomeButton = true;
        $rootScope.hideMenuButton = true;
        removeImportPage();
        $rootScope.onboardingPages[0].nextPageButtonText = "Done connecting data sources";
        $state.go('app.import');
    };

    $rootScope.skipOnboarding = function () {
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

    $scope.enableLocationTracking = function () {
        $rootScope.trackLocationChange(true, true);
        $rootScope.hideOnboardingPage();
    };

    $rootScope.doneOnboarding = function () {
        $state.go('app.remindersInbox');
        $rootScope.hideMenuButton = false;
        window.localStorage.onboarded = true;
        quantimodoService.deleteItemFromLocalStorage('onboardingPages');
        //$rootScope.onboardingPages = null;
    };

    $scope.hideOnboardingPage = function () {

        $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id !== $rootScope.onboardingPages[0].id;
        });

        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify($rootScope.onboardingPages));

        if(!$rootScope.onboardingPages || $rootScope.onboardingPages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.defaultState);
        } else {
            $rootScope.hideMenuButton = true;
        }
    };

});
