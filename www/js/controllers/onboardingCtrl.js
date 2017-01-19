angular.module('starter')
.controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService, $timeout) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);

        $rootScope.onboardingFooterText = null;
        quantimodoService.setupOnboardingPages();
        if($rootScope.onboardingPages && $rootScope.user){
            $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
                return obj.id !== 'loginOnboardingPage';
            });
        }

        $ionicLoading.hide();
        //$rootScope.hideMenuButton = true;
        $rootScope.hideNavigationMenu = true;
    });

    $scope.$on('$ionicView.afterEnter', function(){

        quantimodoService.setupHelpCards();
    });

    $scope.$on('$ionicView.leave', function(){
        $rootScope.hideNavigationMenu = false; console.debug('$rootScope.hideNavigationMenu = false');
    });

    $scope.$on('$ionicView.beforeLeave', function(){

    });

    $scope.$on('$ionicView.afterLeave', function(){

    });

    $rootScope.onboardingLogin = function () {
        if(!$rootScope.user){
            $scope.login();
        } else {
            quantimodoService.removeOnboardingLoginPage();
        }
    };

    $rootScope.onboardingRegister = function () {
        if(!$rootScope.user){
            quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
            $scope.register();
        } else {
            quantimodoService.removeOnboardingLoginPage();
        }
    };

    $rootScope.onboardingGoogleLogin = function () {
        if(!$rootScope.user){
            if($rootScope.isAndroid){
                $scope.googleLogin();
            } else {
                $scope.onboardingRegister();
            }

            //$scope.googleLoginDebug();
        } else {
            quantimodoService.removeOnboardingLoginPage();
        }
    };

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
        $rootScope.onboardingFooterText = "Done connecting data sources";
        $state.go('app.import');
    };

    $rootScope.skipOnboarding = function () {
        $rootScope.hideMenuButton = false;
        $state.go(config.appSettings.defaultState);
    };

    $rootScope.showMoreOnboardingInfo = function () {
        $scope.onHelpButtonPress($rootScope.onboardingPages[0].title, $rootScope.onboardingPages[0].moreInfo);
    };

    $rootScope.goToReminderSearchCategoryFromOnboarding = function(variableCategoryName) {
        $rootScope.hideHomeButton = true;
        $rootScope.hideMenuButton = true;
        if(!$rootScope.user){
            $rootScope.onboardingPages = null;
            quantimodoService.deleteItemFromLocalStorage('onboardingPages');
            $state.go('app.onboarding');
            return;
        }

        $scope.goToReminderSearchCategory(variableCategoryName);
    };

    $rootScope.enableLocationTracking = function () {
        $rootScope.trackLocationChange(true, true);
        $rootScope.hideOnboardingPage();
    };

    $rootScope.doneOnboarding = function () {
        $rootScope.hideMenuButton = false;
        $rootScope.defaultHelpCards = null;
        var getStartedHelpCard = {
            id: "getStartedHelpCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideGetStartedHelpCard",
            title: 'Reminder Inbox',
            "backgroundColor": "#f09402",
            circleColor: "#fab952",
            iconClass: "icon positive ion-archive",
            image: {
                url: "img/variable_categories/vegetarian_food-96.png",
                    height: "96",
                    width: "96"
            },
            bodyText: "Scroll through the Inbox and press the appropriate button on each reminder notification. " +
                "Each one only takes a few seconds. You'll be " +
                "shocked at how much valuable data you can collect with just a few minutes in the Reminder Inbox each day!",
                buttons: [
                    {
                        id: "hideRecordMeasurementInfoCardButton",
                        clickFunctionCall: function(card){ $rootScope.hideHelpCard(card);},
                        buttonText: 'Got it!',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-balanced"
                    }
                ]
        };

        $rootScope.defaultHelpCards = [getStartedHelpCard].concat($rootScope.defaultHelpCards);
        quantimodoService.deleteItemFromLocalStorage('onboardingPages');
        $rootScope.onboardingPages = null;
        if(!$rootScope.user.stripePlan && !$rootScope.isIOS){
            $state.go('app.upgrade');
        } else {
            $state.go('app.remindersInbox');
        }
    };

    $rootScope.hideOnboardingPage = function () {

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
