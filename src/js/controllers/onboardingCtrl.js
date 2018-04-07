angular.module('starter').controller('OnboardingCtrl',
    ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading", "$rootScope", "$stateParams", "qmService", "qmLogService",
    function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, qmService, qmLogService) {
    $scope.state = {
        showSkipButton: false
    };
    if(!$rootScope.appSettings){qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());}
    $scope.$on('$ionicView.beforeEnter', function(e) {
        qmLogService.debug('OnboardingCtrl beforeEnter in state ' + $state.current.name, null);
        qmService.navBar.hideNavigationMenu();
        if(qmService.sendToLoginIfNecessaryAndComeBack('app.onboarding')){ return; }
        qmService.setupOnboardingPages();
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        $scope.circlePage = $rootScope.appSettings.appDesign.onboarding.active[0];
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmLogService.debug('OnboardingCtrl afterEnter in state ' + $state.current.name, null);
        qmService.getConnectorsDeferred(); // Make sure they're ready in advance
        qm.reminderHelper.getNumberOfReminders(function (number) {
            if(number){$scope.state.showSkipButton = true;}
        });
    });
    var removeImportPage = function () {
        $rootScope.appSettings.appDesign.onboarding.active = $rootScope.appSettings.appDesign.onboarding.active.filter(function( obj ) {return obj.id.indexOf('import') === -1;});
        if(!$rootScope.appSettings.designMode){qmService.storage.setItem('onboardingPages', $rootScope.appSettings.appDesign.onboarding.active);}
        $scope.circlePage = $rootScope.appSettings.appDesign.onboarding.active[0];
    };
    $scope.onboardingGoToImportPage = function () {
        $rootScope.hideHomeButton = true;
        qmService.rootScope.setProperty('hideMenuButton', true);
        removeImportPage();
        $scope.circlePage = $rootScope.appSettings.appDesign.onboarding.active[0];
        $scope.circlePage.nextPageButtonText = "Done connecting data sources";
        qmService.goToState('app.import');
    };
    $scope.goToUpgradePage = function () {
        qmService.backButtonState = 'app.onboarding';
        qmService.goToState('app.upgrade');
    };
    $scope.skipOnboarding = function () {
        qmService.rootScope.setProperty('hideMenuButton', false);
        window.qm.storage.setItem(qm.items.onboarded, true);
        qmService.goToDefaultState();
    };
    $scope.goToReminderSearchFromOnboarding = function(ev) {
        qmService.showVariableSearchDialog({
            title: "Enter " + $scope.circlePage.variableCategoryName,
            helpText: "Pick one you'd like to discover the effects or causes of. You'll be able to track this regularly in your inbox.",
            requestParams: {
                variableCategoryName : $scope.circlePage.variableCategoryName,
                includePublic: true,
            },
            skipReminderSettingsIfPossible: true
        }, function (variableObject) {
            qmService.addToRemindersUsingVariableObject(variableObject, {skipReminderSettingsIfPossible: true, doneState: "false"}); // false must have quotes
        }, null, ev);
        // $rootScope.hideHomeButton = true;
        // qmService.rootScope.setProperty('hideMenuButton', true);
        // if(!$rootScope.user){
        //     $rootScope.appSettings.appDesign.onboarding.active = null;
        //     qm.storage.removeItem('onboardingPages');
        //     qmService.goToState('app.onboarding');
        //     return;
        // }
        //$scope.goToReminderSearch($scope.circlePage.variableCategoryName);
    };
    $scope.enableLocationTracking = function (event) {
        $scope.trackLocationChange(event, true);
        $scope.hideOnboardingPage();
    };
    $scope.connectWeatherOnboarding = function (event) {
        qmService.connectConnectorWithParamsDeferred({}, 'worldweatheronline');
        $scope.hideOnboardingPage();
    };
    $scope.doneOnboarding = function () {
        qmService.goToState('app.remindersInbox');
        qmService.rootScope.setProperty('hideMenuButton', false);
        window.qm.storage.setItem(qm.items.onboarded, true);
        qm.storage.removeItem('onboardingPages');
    };
    $scope.hideOnboardingPage = function () {
        $rootScope.appSettings.appDesign.onboarding.active = $rootScope.appSettings.appDesign.onboarding.active.filter(function( obj ) {return obj.id !== $rootScope.appSettings.appDesign.onboarding.active[0].id;});
        qmService.storage.setItem('onboardingPages', $rootScope.appSettings.appDesign.onboarding.active);
        $scope.circlePage = $rootScope.appSettings.appDesign.onboarding.active[0];
        if(!$rootScope.appSettings.appDesign.onboarding.active || $rootScope.appSettings.appDesign.onboarding.active.length === 0){
            qmService.rootScope.setProperty('hideMenuButton', false);
            qmService.goToDefaultState();
        } else {
            qmService.rootScope.setProperty('hideMenuButton', true);
        }
    };
    $scope.goToReminderSearch = function(variableCategoryName) {
        qmService.goToState('app.reminderSearch',
            {
                variableCategoryName : variableCategoryName,
                fromUrl: window.location.href,
                hideNavigationMenu: $rootScope.hideNavigationMenu,
                skipReminderSettingsIfPossible: true,
                doneState: $state.current.name
            });
    };
    $scope.postMeasurement = function(circlePage, value) {
        circlePage.measurements = {value: value};
        qmService.postMeasurementsToApi(circlePage, function(response){
            if(response.success) {
                qmLogService.info('qmService.postMeasurementsToApi success: ' + JSON.stringify(response));
            }
        });
        $scope.hideOnboardingPage();
    };
}]);
