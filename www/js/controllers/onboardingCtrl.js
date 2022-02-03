angular.module('starter').controller('OnboardingCtrl',
    ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading", "$rootScope", "$stateParams", "qmService", "$timeout",
        function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, qmService, $timeout){
            var speechEnabled = false;
            var pageIndex = 0;
            $scope.state = {
                showSkipButton: false,
                //requireUpgrades: true // Might want to do this at some point
                requireUpgrades: false, // Default to false for new users
            };
            if(!$rootScope.appSettings){
                qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());
            }
            $scope.$on('$ionicView.beforeEnter', function(e){
                if (document.title !== "Get Started") {document.title = "Get Started";}
                setRequireUpgradesInOnboarding();
                qmService.navBar.hideNavigationMenu();
                if(qmService.login.sendToLoginIfNecessaryAndComeBack(
                    "No user in " + $state.current.name, qm.staticData.stateNames.onboarding)){
                    return;
                }
                qmService.setupOnboardingPages();
                qmService.hideLoader();
                qmService.navBar.hideNavigationMenu();
                setCirclePage();
                setRequireUpgradesInOnboarding();
                if(!speechEnabled){
                    $rootScope.setMicAndSpeechEnabled(false, true);
                }
            });
            $scope.$on('$ionicView.afterEnter', function(){
                qmLog.debug('OnboardingCtrl afterEnter in state ' + $state.current.name);
                if(!speechEnabled){
                    $rootScope.setMicAndSpeechEnabled(false);
                }
                qmService.getConnectorsDeferred(); // Make sure they're ready in advance
                qm.reminderHelper.getNumberOfReminders()
                    .then(function(number){
                        if(number > 5){
                            $scope.state.showSkipButton = true;
                        }
                });
                initializeAddRemindersPageIfNecessary();
            });
            function getPages(){
                var pages = $rootScope.appSettings.appDesign.onboarding.active;
                pages = pages.map(function(page) {
                    page.image.url = qm.imageHelper.replaceOldCategoryImages(page.image.url);
                    return page;
                });
                return pages;
            }
            function nextPage(){
                pageIndex++;
                setCirclePage();
            }
            function setCirclePage(){
                $scope.circlePage = getPages()[pageIndex];
                $timeout(function(){
                    askQuestion($scope.circlePage);
                }, 1);
            }
            function askQuestion(circlePage){
                if(!speechEnabled){
                    qmLog.debug("Speech disabled");
                    return false;
                }
                qm.speech.askYesNoQuestion(circlePage.bodyText, function(){
                    if(circlePage.addButtonText){
                        $scope.goToReminderSearchFromOnboarding();
                    }else if(circlePage.id === 'locationTrackingPage'){
                        $scope.enableLocationTrackingWithMeasurements();
                    }else if(circlePage.id === 'weatherTrackingPage'){
                        $scope.connectWeatherOnboarding();
                    }else if(circlePage.id === 'importDataPage'){
                        $scope.onboardingGoToImportPage();
                    }else if(circlePage.id === 'allDoneCard'){
                        $scope.hideOnboardingPage();
                    }else if(circlePage.unitAbbreviatedName === 'yes/no'){
                        $scope.postMeasurement(circlePage, 1);
                    }else{
                        qmLog.error("Not sure how to respond here");
                        $scope.hideOnboardingPage();
                    }
                }, function(){
                    if(circlePage.unitAbbreviatedName === 'yes/no'){
                        $scope.postMeasurement(circlePage, 0);
                    }else{
                        $scope.hideOnboardingPage();
                    }
                });
            }
            function setOnboardedTrueAndResetOnboardingSequence(){
                pageIndex = 0;
                window.qm.storage.setItem(qm.items.onboarded, true);
            }
            function setRequireUpgradesInOnboarding(){
                if(qm.getUser() && qm.getUser().stripeActive){
                    $scope.state.requireUpgrades = false;
                }else if(!$rootScope.appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled.value){
                    $scope.state.requireUpgrades = false;
                }
            }
            $scope.onboardingGoToImportPage = function(){
                $rootScope.hideHomeButton = true;
                qmService.rootScope.setProperty('hideMenuButton', true);
                nextPage();
                $scope.circlePage.nextPageButtonText = "Done connecting data sources";
                qmService.goToState(qm.staticData.stateNames.import);
            };
            $scope.goToUpgradePage = function(){
                qmService.backButtonState = qm.staticData.stateNames.onboarding;
                qmService.goToState('app.upgrade');
            };
            $scope.skipOnboarding = function(){
                qmService.rootScope.setProperty('hideMenuButton', false);
                setOnboardedTrueAndResetOnboardingSequence();
                qmService.goToDefaultState();
            };
            $scope.goToReminderSearchFromOnboarding = function(ev){
                qmService.search.reminderSearch(function(variableObject){
                    var page = $scope.circlePage;
                    if(page.id.toLowerCase().indexOf('reminder') !== -1){
                        if(page.title){
                            page.title = page.title.replace('Any', 'More');
                            page.title = page.title.replace('any', 'more');
                        }
                        page.addButtonText = "Add Another";
                        page.nextPageButtonText = "All Done";
                        page.bodyText = "Great job!  Now you'll be able to instantly record " +
                            variableObject.name + " in the Reminder Inbox.  Want to add any more " +
                            variableObject.variableCategoryName.toLowerCase() + '?';
                        askQuestion(page);
                    }
                }, ev, $scope.circlePage.variableCategoryName);
            };
            $scope.enableLocationTrackingWithMeasurements = function(event){
                $scope.trackLocationWithMeasurementsChange(event, true);
                $scope.hideOnboardingPage();
            };
            function initializeAddRemindersPageIfNecessary(){
                if(!$scope.circlePage){
                    return;
                }
                if($scope.circlePage.variableCategoryName && $scope.circlePage.addButtonText){
                    qm.variablesHelper.getFromLocalStorageOrApi({
                        variableCategoryName: $scope.circlePage.variableCategoryName,
                        includePublic: true
                    });
                    $scope.circlePage.addButtonText = "Yes";
                    $scope.circlePage.nextPageButtonText = "No";
                }
            }
            $scope.connectWeatherOnboarding = function(event){
                var weatherPage = JSON.parse(JSON.stringify($scope.circlePage));
                function nextPageIfStillWeather(){ // Refuses to hide during tests for some reason
                    if($scope.circlePage.title === weatherPage.title){
                        nextPage();
                    }
                }
                qmService.connectors.weatherConnect(null, $scope, nextPageIfStillWeather, nextPageIfStillWeather);
                $scope.hideOnboardingPage();
            };
            $scope.doneOnboarding = function(){
                qmService.goToState('app.remindersInbox');
                qmService.rootScope.setProperty('hideMenuButton', false);
                setOnboardedTrueAndResetOnboardingSequence();
            };
            $scope.hideOnboardingPage = function(){
                var pages = getPages();
                if(pageIndex === pages.length - 1){
                    qmService.rootScope.setProperty('hideMenuButton', false);
                    qmService.goToDefaultState();
                }else{
                    nextPage();
                    initializeAddRemindersPageIfNecessary();
                    qmService.rootScope.setProperty('hideMenuButton', true);
                }
            };
            $scope.postMeasurement = function(circlePage, value){
                circlePage.measurements = {value: value};
                qm.measurements.postMeasurements(circlePage);
                $scope.hideOnboardingPage();
            };
        }]);
