angular.module('starter')
.controller('OnboardingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
                                  $rootScope, $stateParams, quantimodoService) {

    // when view is changed
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);

        $rootScope.onboardingFooterText = null;
        //quantimodoService.setupOnboardingPages();
        if(!$rootScope.onboardingPages){
            quantimodoService.setupOnboardingPages();
        }

        if($rootScope.user){
            $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
                return obj.id !== 'loginOnboardingPage';
            });
        }

        $ionicLoading.hide();
        $rootScope.hideNavigationMenu = true;
    });

    $scope.$on('$ionicView.afterEnter', function(){

    });

    $scope.onboardingLogin = function () {
        if(!$rootScope.user){
            removeLoginPage();
            $scope.login();
        } else {
            $rootScope.hideOnboardingPage();
        }
    };

    $scope.onboardingRegister = function () {
        if(!$rootScope.user){
            removeLoginPage();
            $scope.register();
        } else {
            $rootScope.hideOnboardingPage();
        }
    };

    var removeLoginPage = function () {
        quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
        var onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id !== 'loginOnboardingPage';
        });
        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify(onboardingPages));
    };

    var removeImportPage = function () {
        quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
        var onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id.indexOf('import') !== -1;
        });
        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify(onboardingPages));
    };

    $scope.onboardingGoToImportPage = function () {
        removeImportPage();
        $state.go('app.import');
    };

    $scope.skipOnboarding = function () {
        $state.go(config.appSettings.defaultState);
    };

    $scope.showMoreOnboardingInfo = function () {
        $scope.onHelpButtonPress($rootScope.onboardingPages[0].title, $rootScope.onboardingPages[0].moreInfo);
    };

    $scope.doneOnboarding = function () {

        var getStartedHelpCard = {
            id: "getStartedHelpCard",
                ngIfLogic: "stateParams.showHelpCards === true && !hideGetStartedHelpCard",
            title: 'Great Job!',
            "backgroundColor": "#f09402",
            circleColor: "#fab952",
            iconClass: "icon positive ion-happy",
            image: {
                url: "img/variable_categories/vegetarian_food-96.png",
                    height: "96",
                    width: "96"
            },
            bodyText: "You're all set up!  Let's record your first measurements. Scroll through the inbox and press the " +
                "appropriate button on each reminder notification.  Each one only takes a few seconds. You'll be " +
                "shocked at how much data you can collect with just a few minutes in the inbox each day!",
                buttons: [
                    {
                        id: "hideRecordMeasurementInfoCardButton",
                        clickFunctionCall: "hideHelpCard(card)",
                        buttonText: 'Got it!',
                        buttonIconClass: "ion-checkmark",
                        buttonClass: "button button-clear button-balanced"
                    }
                ]
        };

        quantimodoService.setupHelpCards(getStartedHelpCard);

    };

    $rootScope.hideOnboardingPage = function () {

        $rootScope.onboardingPages = $rootScope.onboardingPages.filter(function( obj ) {
            return obj.id !== $rootScope.onboardingPages[0].id;
        });

        quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify($rootScope.onboardingPages));

        if(!$rootScope.onboardingPages || $rootScope.onboardingPages.length === 0){
            $rootScope.hideNavigationMenu = false;
            $state.go(config.appSettings.defaultState);
        } else {
            $rootScope.hideNavigationMenu = true;
        }

        if($rootScope.onboardingPages[0] && $rootScope.onboardingPages[0].id === "importDataCard"){
            $rootScope.onboardingFooterText = "Done connecting data sources";
        }
    };

});
