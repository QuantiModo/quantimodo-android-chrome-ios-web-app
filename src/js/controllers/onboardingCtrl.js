angular.module('starter').controller('OnboardingCtrl',
    ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading", "$rootScope", "$stateParams", "qmService", "qmLogService", "$timeout",
    function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, qmService, qmLogService, $timeout) {
    $scope.state = {
        showSkipButton: false,
        //requireUpgrades: true // Might want to do this at some point
        requireUpgrades: false, // Default to false for new users

    };
    if(!$rootScope.appSettings){qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());}
    $scope.$on('$ionicView.beforeEnter', function(e) {
        setRequireUpgradesInOnboarding();
        qmLogService.debug('OnboardingCtrl beforeEnter in state ' + $state.current.name, null);
        qmService.navBar.hideNavigationMenu();
        if(qmService.login.sendToLoginIfNecessaryAndComeBack(qmStates.onboarding)){ return; }
        if(!qm.getUser()){qmLog.debug("No user in onboarding!")}
        qmService.setupOnboardingPages();
        qmService.hideLoader();
        qmService.navBar.hideNavigationMenu();
        setCirclePage($rootScope.appSettings.appDesign.onboarding.active[0]);
        setRequireUpgradesInOnboarding();
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qmLogService.debug('OnboardingCtrl afterEnter in state ' + $state.current.name);
        qmService.getConnectorsDeferred(); // Make sure they're ready in advance
        qm.reminderHelper.getNumberOfReminders(function (number) {
            if(number > 5){$scope.state.showSkipButton = true;}
        });
        initializeAddRemindersPageIfNecessary();
    });
    function setRequireUpgradesInOnboarding() {
        if(qm.getUser() && qm.getUser().stripeActive){
            $scope.state.requireUpgrades = false;
        } else if (!$rootScope.appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled.value){
            $scope.state.requireUpgrades = false;
        }
    }
    var removeImportPage = function () {
        $rootScope.appSettings.appDesign.onboarding.active = $rootScope.appSettings.appDesign.onboarding.active.filter(function( obj ) {return obj.id.indexOf('import') === -1;});
        if(!$rootScope.appSettings.designMode){qmService.storage.setItem('onboardingPages', $rootScope.appSettings.appDesign.onboarding.active);}
        setCirclePage($rootScope.appSettings.appDesign.onboarding.active[0]);
    };
    $scope.onboardingGoToImportPage = function () {
        $rootScope.hideHomeButton = true;
        qmService.rootScope.setProperty('hideMenuButton', true);
        removeImportPage();
        setCirclePage($rootScope.appSettings.appDesign.onboarding.active[0]);
        $scope.circlePage.nextPageButtonText = "Done connecting data sources";
        qmService.goToState('app.import');
    };
    $scope.goToUpgradePage = function () {
        qmService.backButtonState = qmStates.onboarding;
        qmService.goToState('app.upgrade');
    };
    $scope.skipOnboarding = function () {
        qmService.rootScope.setProperty('hideMenuButton', false);
        window.qm.storage.setItem(qm.items.onboarded, true);
        qmService.goToDefaultState();
    };
    $scope.goToReminderSearchFromOnboarding = function(ev) {
        qmService.search.reminderSearch(function (variableObject) {
            if($rootScope.appSettings.appDesign.onboarding.active && $rootScope.appSettings.appDesign.onboarding.active[0] &&
                $rootScope.appSettings.appDesign.onboarding.active[0].id.toLowerCase().indexOf('reminder') !== -1){
                var circlePage = $rootScope.appSettings.appDesign.onboarding.active[0];
                if(circlePage.title){circlePage.title = circlePage.title.replace('Any', 'More');}
                circlePage.addButtonText = "Add Another";
                circlePage.nextPageButtonText = "All Done";
                circlePage.bodyText = "Great job!  Now you'll be able to instantly record " +
                    variableObject.name + " in the Reminder Inbox.  Want to add any more " +
                    variableObject.variableCategoryName.toLowerCase() + '?';
                askQuestion(circlePage);
                qmService.storage.setItem('onboardingPages', $rootScope.appSettings.appDesign.onboarding.active);
            }
        }, ev, $scope.circlePage.variableCategoryName);
        // $rootScope.hideHomeButton = true;
        // qmService.rootScope.setProperty('hideMenuButton', true);
        // if(!$rootScope.user){
        //     $rootScope.appSettings.appDesign.onboarding.active = null;
        //     qm.storage.removeItem('onboardingPages');
        //     qmService.goToState(qmStates.onboarding);
        //     return;
        // }
        //$scope.goToReminderSearch($scope.circlePage.variableCategoryName);
    };
    $scope.enableLocationTrackingWithMeasurements = function (event) {
        $scope.trackLocationWithMeasurementsChange(event, true);
        $scope.hideOnboardingPage();
    };
    function initializeAddRemindersPageIfNecessary() {
        if(!$scope.circlePage){return;}
        if ($scope.circlePage.variableCategoryName && $scope.circlePage.addButtonText) {
            qm.variablesHelper.getFromLocalStorageOrApi({
                variableCategoryName: $scope.circlePage.variableCategoryName,
                includePublic: true
            });
            $scope.circlePage.addButtonText = "Yes";
            $scope.circlePage.nextPageButtonText = "No";
        }
    }
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
    function askQuestion(circlePage) {
        qm.speech.askYesNoQuestion(circlePage.bodyText, function () {
            if(circlePage.addButtonText){
                $scope.goToReminderSearchFromOnboarding();
            } else if (circlePage.id === 'locationTrackingPage'){
                $scope.enableLocationTrackingWithMeasurements();
            } else if (circlePage.id === 'weatherTrackingPage'){
                $scope.connectWeatherOnboarding();
            } else if (circlePage.id === 'importDataPage'){
                $scope.onboardingGoToImportPage();
            } else if (circlePage.id === 'allDoneCard') {
                $scope.hideOnboardingPage();
            } else if (circlePage.unitAbbreviatedName === 'yes/no'){
                $scope.postMeasurement(circlePage, 1);
            } else {
                qmLog.error("Not sure how to respond here");
                $scope.hideOnboardingPage();
            }
        }, function () {
            if (circlePage.unitAbbreviatedName === 'yes/no'){
                $scope.postMeasurement(circlePage, 0);
            } else {
                $scope.hideOnboardingPage();
            }
        });
    }
    function setCirclePage(circlePage){
        $timeout(function () {
            askQuestion(circlePage);
        }, 1);
        $scope.circlePage = circlePage;
    }
    $scope.hideOnboardingPage = function () {
        $rootScope.appSettings.appDesign.onboarding.active = $rootScope.appSettings.appDesign.onboarding.active.filter(function( obj ) {
            return obj.id !== $rootScope.appSettings.appDesign.onboarding.active[0].id;
        });
        qmService.storage.setItem('onboardingPages', $rootScope.appSettings.appDesign.onboarding.active);
        setCirclePage($rootScope.appSettings.appDesign.onboarding.active[0]);
        initializeAddRemindersPageIfNecessary();
        if(!$rootScope.appSettings.appDesign.onboarding.active || $rootScope.appSettings.appDesign.onboarding.active.length === 0){
            qmService.rootScope.setProperty('hideMenuButton', false);
            qmService.goToDefaultState();
        } else {
            qmService.rootScope.setProperty('hideMenuButton', true);
        }
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
