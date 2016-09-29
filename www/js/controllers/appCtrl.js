angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                    $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, authService,
                                    measurementService, QuantiModo, notificationService, localStorageService,
                                    reminderService, ratingService, migrationService, ionicDatePicker, unitService,
                                    variableService, qmLocationService, variableCategoryService, bugsnagService,
                                    pushNotificationService, utilsService, connectorsService, userService) {

        $rootScope.loaderImagePath = config.appSettings.loaderImagePath;
        $rootScope.appMigrationVersion = 1489;
        $rootScope.appVersion = "1.9.9.0";
        if (!$rootScope.loaderImagePath) {
            $rootScope.loaderImagePath = 'img/circular-loader.gif';
        }
        if($rootScope.user && typeof $rootScope.user.trackLocation === "undefined"){
            localStorageService.getItem('trackLocation', function(trackLocation){
                $rootScope.user.trackLocation = trackLocation;
                if($rootScope.user.trackLocation){
                    userService.updateUserSettings({trackLocation: $rootScope.user.trackLocation});
                }
            });
        }
        $rootScope.placeName = null;
        $rootScope.lastLatitude = null;
        $rootScope.lastLongitude = null;
        $scope.controller_name = "AppCtrl";
        $scope.menu = config.appSettings.menu;
        $scope.appSettings = config.appSettings;
        $scope.showTrackingSubMenu = false;
        $rootScope.allowOffline = config.appSettings.allowOffline;
        $rootScope.numberOfPendingNotifications = null;
        $scope.showReminderSubMenu = false;
        $scope.primaryOutcomeVariableDetails = config.appSettings.primaryOutcomeVariableDetails;
        // Not used
        //$scope.ratingInfo = ratingService.getRatingInfo();
        $scope.closeMenu = function () {
            $ionicSideMenuDelegate.toggleLeft(false);
        };
        $scope.floatingMaterialButton = config.appSettings.floatingMaterialButton;
        $rootScope.unitsIndexedByAbbreviatedName = [];
        $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];

        $scope.hideAddTreatmentRemindersCard = localStorageService.getItemSync('hideAddTreatmentRemindersCard');
        $scope.hideAddFoodRemindersCard = localStorageService.getItemSync('hideAddFoodRemindersCard');
        $scope.hideAddSymptomRemindersCard = localStorageService.getItemSync('hideAddSymptomRemindersCard');
        $scope.hideAddEmotionRemindersCard = localStorageService.getItemSync('hideAddEmotionRemindersCard');
        $scope.hideHistoryPageInstructionsCard = localStorageService.getItemSync('hideHistoryPageInstructionsCard');
        $scope.hideImportDataCard = localStorageService.getItemSync('hideImportDataCard');
        $scope.hideRecordMeasurementInfoCard = localStorageService.getItemSync('hideRecordMeasurementInfoCard');
        $scope.hideNotificationSettingsInfoCard = localStorageService.getItemSync('hideNotificationSettingsInfoCard');
        $scope.hideLocationTrackingInfoCard = localStorageService.getItemSync('hideLocationTrackingInfoCard');
        $scope.hideChromeExtensionInfoCard = localStorageService.getItemSync('hideChromeExtensionInfoCard');

        //  Calendar and  Date picker

        // will update from showCalendarPopup
        $scope.fromDate = new Date();
        $scope.toDate = new Date();

        // "from" datepicker config
        $scope.fromDatePickerObj = {
            callback: function (val) {
                if (typeof(val) === 'undefined') {
                    console.log('Date not selected');
                } else {
                    $scope.fromDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.fromDate, // previously selected value
            from: new Date(2012, 8, 1),
            to: $scope.toDate // don't allow fromDate to be after toDate
        };

        // "to" datepicker config
        $scope.toDatePickerObj = {
            callback: function (val) {
                if (typeof(val) === 'undefined') {
                    console.log('Date not selected');
                } else {
                    $scope.toDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.toDate, // previously selected value
            from: $scope.fromDate, // don't allow toDate to be after fromDate
            to: new Date() //today
        };

        $scope.goToState = function (state, stateParameters) {
            var variableCategoryName = null;
            if (stateParameters && stateParameters.variableCategoryName) {
                variableCategoryName = stateParameters.variableCategoryName;
            }
            $state.go(state, {
                fromState: $state.current.name,
                fromUrl: window.location.href,
                variableCategoryName: variableCategoryName
            });
        };

        $scope.setLocalStorageFlagTrue = function (flagName) {
            $scope[flagName] = true;
            localStorageService.setItem(flagName, true);
        };

        // open datepicker for "from" date
        $scope.openFromDatePicker = function () {
            ionicDatePicker.openDatePicker($scope.fromDatePickerObj);
        };

        // open datepicker for "to" date
        $scope.openToDatePicker = function () {
            ionicDatePicker.openDatePicker($scope.toDatePickerObj);
        };

        // update dates selected from calendar
        $scope.saveDates = function () {
            $scope.updateDatesLocalStorage();
            $scope.updateDatePickerObjects();
            $scope.popover.hide();
            $scope.init();
        };

        // update fromDate and toDate in datepicker objects
        $scope.updateDatePickerObjects = function () {
            $scope.fromDatePickerObj.to = $scope.toDate;
            $scope.toDatePickerObj.from = $scope.fromDate;
            $scope.fromDatePickerObj.inputDate = $scope.fromDate;
            $scope.toDatePickerObj.inputDate = $scope.toDate;
        };

        $scope.updateDatesLocalStorage = function () {
            var to = moment($scope.toDate).unix() * 1000;
            var from = moment($scope.fromDate).unix() * 1000;
            console.log("$scope.updateDatesLocalStorage is calling measurementService.setDates");
            measurementService.setDates(to, from);
        };

        // show main calendar popup (from and to)
        $scope.showCalendarPopup = function ($event) {
            $scope.popover.show($event);
            measurementService.getToDate(function (endDate) {
                $scope.toDate = new Date(endDate);
                $scope.fromDatePickerObj.to = $scope.toDate;
                measurementService.getFromDate(function (fromDate) {
                    $scope.fromDate = new Date(fromDate);
                    $scope.toDatePickerObj.from = $scope.fromDate;
                });
            });
        };

        var helpPopupMessages = config.appSettings.helpPopupMessages || false;

        $scope.showHelpInfoPopup = function () {
            $rootScope.helpPopup = $ionicPopup.show({
                title: helpPopupMessages[location.hash],
                subTitle: '',
                scope: $scope,
                template: '<label><input type="checkbox" ng-model="$parent.notShowHelpPopup" class="show-again-checkbox">Don\'t show these tips</label>',
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive',
                        onTap: function () {
                            localStorageService.setItem('notShowHelpPopup', JSON.stringify($scope.notShowHelpPopup));
                        }
                    }
                ]
            });
        };

        $scope.onHelpButtonPress = function () {
            $rootScope.helpButtonPopup = $ionicPopup.show({
                title: $rootScope.stateParams.title,
                subTitle: $rootScope.stateParams.helpText,
                scope: $scope,
                template: '',
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    },
                    {
                        text: 'More Help',
                        type: 'button-positive',
                        onTap: function(e) {
                            $state.go('app.help');
                        }
                    }
                ]
            });
        };

        $scope.showHelpInfoPopupIfNecessary = function (e) {
            localStorageService.getItem('isWelcomed', function (isWelcomed) {
                if (isWelcomed === true || isWelcomed === "true") {
                    if (helpPopupMessages && typeof helpPopupMessages[location.hash] !== "undefined") {
                        localStorageService.getItem('notShowHelpPopup', function (val) {
                            if (typeof val === "undefined" || val === "undefined") {
                                $scope.notShowHelpPopup = false;
                            } else {
                                $scope.notShowHelpPopup = val ? JSON.parse(val) : false;
                            }

                            // Had to add "&& e.targetScope !== $scope" to prevent duplicate popups
                            //if (!$scope.notShowHelpPopup && e.targetScope !== $scope) {
                            if (!$scope.notShowHelpPopup) {
                                $scope.showHelpInfoPopup();
                            }
                        });
                    }
                }
            });
        };

        $scope.goToAddMeasurementForVariableObject = function (variableObject) {
            $state.go('app.measurementAdd',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.goToHistoryForVariableObject = function (variableObject) {
            $state.go('app.historyAll',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.goToChartsPageForVariableObject = function (variableObject) {
            $state.go('app.charts',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.goToAddReminderForVariableObject = function (variableObject) {
            $state.go('app.reminderAdd',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.addToFavoritesUsingVariableObject = function (variableObject) {
            var trackingReminder = {};
            trackingReminder.variableId = variableObject.id;
            trackingReminder.reminderFrequency = 0;
            trackingReminder.variableName = variableObject.name;
            trackingReminder.abbreviatedUnitName = variableObject.abbreviatedUnitName;
            trackingReminder.variableDescription = variableObject.description;
            trackingReminder.variableCategoryName = variableObject.variableCategoryName;

            if (trackingReminder.abbreviatedUnitName === '/5') {
                trackingReminder.defaultValue = 3;
                localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminders', trackingReminder)
                    .then(function() {
                        reminderService.postTrackingReminders(trackingReminder)
                            .then(function () {
                                console.debug("Saved to favorites: " + JSON.stringify(trackingReminder));
                                $state.go('app.favorites',
                                    {
                                        trackingReminder: trackingReminder,
                                        fromState: $state.current.name,
                                        fromUrl: window.location.href
                                    }
                                );
                            }, function (err) {
                                console.error('Failed to add favorite!', trackingReminder);
                            });
                    });
            } else {
                $state.go('app.favoriteAdd',
                    {
                        variableObject: variableObject,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }
        };

        $scope.$on('$ionicView.enter', function (e) {
            //$scope.showHelpInfoPopupIfNecessary(e);
            qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
        });

        $scope.closeMenuIfNeeded = function (menuItem) {
            if (menuItem.click) {
                $scope[menuItem.click] && $scope[menuItem.click]();
            }
            else if (!menuItem.isSubMenuParent) {
                $scope.closeMenu();
            }
        };
        $scope.showHistorySubMenu = false;
        $scope.shoppingCartEnabled = config.appSettings.shoppingCartEnabled;
        $scope.loading = false;
        $ionicLoading.hide();

        utilsService.setPlatformVariables();

        /*Wrapper Config*/
        $scope.viewTitle = config.appSettings.appName;
        $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
        $scope.positiveRatingOptions = ratingService.getPositiveRatingOptions();
        $scope.negativeRatingOptions = ratingService.getNegativeRatingOptions();
        $scope.numericRatingOptions = ratingService.getNumericRatingOptions();
        $scope.welcomeText = config.appSettings.welcomeText;
        $scope.primaryOutcomeVariableTrackingQuestion = config.appSettings.primaryOutcomeVariableTrackingQuestion;
        $scope.primaryOutcomeVariableAverageText = config.appSettings.primaryOutcomeVariableAverageText;
        /*Wrapper Config End*/

        // when view is changed
        $scope.$on('$ionicView.enter', function (e) {
            if (e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackPrimaryOutcomeCtrl") {
                $scope.showCalendarButton = true;
            } else {
                $scope.showCalendarButton = false;
            }

            // Show "..." button on top rigt
            if (e.targetScope && e.targetScope.controller_name &&
                e.targetScope.controller_name === "MeasurementAddCtrl" ||
                e.targetScope.controller_name === "RemindersAddCtrl" ||
                e.targetScope.controller_name === "FavoriteAddCtrl" ||
                e.targetScope.controller_name === "ChartsPageCtrl" ||
                e.targetScope.controller_name === "VariableSettingsCtrl" ||
                e.targetScope.controller_name === "RemindersInboxCtrl" ||
                e.targetScope.controller_name === "RemindersManageCtrl"
            ) {
                $scope.showMoreMenuButton = true;
            } else {
                $scope.showMoreMenuButton = false;
            }
        });

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        // when work on this activity is complete
        $rootScope.hideNavigationMenuIfSetInUrlParameter = function() {
            if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                $rootScope.hideNavigationMenu = true;
            } else {
                $rootScope.hideNavigationMenu = false;
            }
        };

        function goToDefaultStateShowMenuClearIntroHistoryAndRedraw() {

            if ($state.current.name === "app.welcome") {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }

            if ($state.current.name === "app.login" && $rootScope.user) {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }

            if (config.appSettings.allowOffline) {
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
            }

            // don't animate, clear back history
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });

            // redraw everything according to updated appstate
            measurementService.syncPrimaryOutcomeVariableMeasurements();
        }

        $scope.goToDefaultStateIfWelcomed = function () {
            console.debug('appCtrl: user has seen the welcome screen before...');
            localStorageService.getItem('isWelcomed', function (isWelcomed) {
                if (isWelcomed === true || isWelcomed === "true") {
                    $rootScope.isWelcomed = true;
                    console.debug('goToDefaultStateIfWelcomed: Going to default state...');
                    goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                }
            });
        };

        var goToDefaultStateIfLoggedInOnLoginState = function () {
            var loginState = 'app.login';
            if (loginState.indexOf($state.current.name) !== -1 && $rootScope.user) {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateIfLoggedInOnLoginState: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }
        };

        $scope.init = function () {
            console.log("Main Constructor Start");
            $rootScope.getAccessTokenFromUrlParameter();
            $rootScope.hideNavigationMenuIfSetInUrlParameter();
            localStorageService.getItem('introSeen', function(introSeen){
                $rootScope.introSeen = introSeen;
            });
            if (!$rootScope.user) {
                $rootScope.user = localStorageService.getItemAsObject('user');
                if(!$rootScope.user && utilsService.getClientId() === 'oAuthDisabled') {
                    $rootScope.getUserAndSetInLocalStorage();
                }
                console.debug('appCtrl.init just set $rootScope.user from local storage to: ' + JSON.stringify($rootScope.user));
            }
            if ($rootScope.user) {
                console.debug("appCtrl.init calling setUserInLocalStorageBugsnagAndRegisterDeviceForPush");
                $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush($rootScope.user);
                $scope.syncEverything();
            }

            if ($rootScope.isMobile && $rootScope.localNotificationsEnabled) {
                console.debug("Going to try setting on trigger and on click actions for notifications when device is ready");
                $ionicPlatform.ready(function () {
                    console.debug("Setting on trigger and on click actions for notifications");
                    notificationService.setOnTriggerAction();
                    notificationService.setOnClickAction(QuantiModo);
                    notificationService.setOnUpdateAction();
                });
            } else {
                //console.debug("Not setting on trigger and on click actions for notifications because is not ios or android.");
            }
            goToDefaultStateIfLoggedInOnLoginState();
        };

        $scope.$on('callAppCtrlInit', function () {
            console.log("calling init");
            $scope.init();
        });

        $scope.togglePrimaryOutcomeSubMenu = function () {
            $scope.showPrimaryOutcomeSubMenu = !$scope.showPrimaryOutcomeSubMenu;
        };

        $scope.toggleEmotionsSubMenu = function () {
            $scope.showEmotionsSubMenu = !$scope.showEmotionsSubMenu;
        };

        $scope.toggleDietSubMenu = function () {
            $scope.showDietSubMenu = !$scope.showDietSubMenu;
        };

        $scope.toggleTreatmentsSubMenu = function () {
            $scope.showTreatmentsSubMenu = !$scope.showTreatmentsSubMenu;
        };

        $scope.toggleSymptomsSubMenu = function () {
            $scope.showSymptomsSubMenu = !$scope.showSymptomsSubMenu;
        };

        $scope.togglePhysicalActivitySubMenu = function () {
            $scope.showPhysicalActivitySubMenu = !$scope.showPhysicalActivitySubMenu;
        };

        $scope.toggleVitalSignsSubMenu = function () {
            $scope.showVitalSignsSubMenu = !$scope.showVitalSignsSubMenu;
        };

        $scope.toggleTrackingSubMenu = function () {
            $scope.showTrackingSubMenu = !$scope.showTrackingSubMenu;
        };

        $scope.togglePredictorSearchSubMenu = function () {
            $scope.showPredictorSearchSubMenu = !$scope.showPredictorSearchSubMenu;
        };

        $scope.toggleOutcomePredictorSubMenu = function () {
            $scope.showOutcomePredictorSubMenu = !$scope.showOutcomePredictorSubMenu;
        };

        $scope.toggleHistorySubMenu = function () {
            $scope.showHistorySubMenu = !$scope.showHistorySubMenu;
        };

        $scope.toggleReminderSubMenu = function () {
            $scope.showReminderSubMenu = !$scope.showReminderSubMenu;
        };

        $rootScope.updateOrRecreateNotifications = function () {
            if($rootScope.localNotificationsEnabled){
                notificationService.updateOrRecreateNotifications();
            }
        };

        $scope.saveInterval = function(primaryOutcomeRatingFrequencyDescription){
            if(primaryOutcomeRatingFrequencyDescription){
                $scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;
            }

            var intervals = {
                "minutely" : 60,
                "every five minutes" : 5 * 60,
                "never" : 0,
                "hourly": 60 * 60,
                "hour": 60 * 60,
                "every three hours" : 3 * 60 * 60,
                "twice a day" : 12 * 60 * 60,
                "daily" : 24 * 60 * 60,
                "day" : 24 * 60 * 60
            };

            var reminderToSchedule = {
                reminderFrequency: intervals[$scope.primaryOutcomeRatingFrequencyDescription],
                variableId: config.appSettings.primaryOutcomeVariableDetails.id,
                defaultValue: 3
            };
            reminderService.addToTrackingReminderSyncQueue(reminderToSchedule);
            $scope.showIntervalCard = false;
        };

        $rootScope.getUserAndSetInLocalStorage = function(){
            
            var successHandler = function(userObject) {
                if (userObject) {
                    console.log('Setting user in getUserAndSetInLocalStorage');
                    $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush(userObject);
                    if ($state.current.name === 'app.login') {
                        goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                    }
                    return userObject;
                }
            };
            
            QuantiModo.get('api/user/me',
                [],
                {},
                successHandler,
                function(err){
                    bugsnagService.reportError(err);
                }
            );
        };

        $rootScope.sendToLogin = function(){
            localStorageService.deleteItem('user');
            localStorageService.deleteItem('accessToken');
            localStorageService.deleteItem('accessTokenInUrl');
            $rootScope.accessToken = null;
            console.debug('appCtrl.sendToLogin just set $rootScope.user to null');
            $rootScope.user = null;
            $state.go('app.login');
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase === '$apply' || phase === '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $scope.showLoader = function (loadingText) {
            $rootScope.isSyncing = true;
            $rootScope.syncDisplayText = loadingText;
            console.debug('Showing Loader');
            if(!loadingText){
                loadingText = '';
            }
            $scope.loading = true;
/*            $ionicLoading.show({
                template: loadingText+ '<br><br><img src={{loaderImagePath}}>',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 1000,
                showDelay: 0,
                noBackdrop: true,
                hideOnStateChange: true,
                duration: 15000
            });
            */
            $timeout(function () {
                $scope.hideLoader();
            }, 30000);

        };


        $scope.hideLoader = function () {
            $rootScope.isSyncing = false;
            $rootScope.syncDisplayText = '';
            $scope.loading = false;
            $ionicLoading.hide();
        };

        $scope.syncEverything = function () {
            if(!$rootScope.syncedEverything && $rootScope.user){
                console.debug('syncEverything for this user: ' + JSON.stringify($rootScope.user));
                //measurementService.syncPrimaryOutcomeVariableMeasurements();
                if($rootScope.localNotificationsEnabled){
                    console.debug("syncEverything: calling refreshTrackingRemindersAndScheduleAlarms");
                    reminderService.refreshTrackingRemindersAndScheduleAlarms();
                }
                variableService.getUserVariables();
                variableService.getCommonVariables();
                unitService.getUnits();
                $rootScope.syncedEverything = true;
                if($rootScope.user.trackLocation){
                    qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
                }
                reminderService.syncTrackingReminderSyncQueueToServer();
                //connectorsService.getConnectors();
            }
        };

        $scope.sendWithMailTo = function(subjectLine, emailBody){
            var emailUrl = 'mailto:?subject=' + subjectLine + '&body=' + emailBody;
            if($rootScope.isChromeExtension){
                console.debug('isChromeExtension so sending to website to share data');
                var url = utilsService.getURL("api/v2/account/applications", true);
                var newTab = window.open(url,'_blank');
                if(!newTab){
                    alert("Please unblock popups and refresh to access the Data Sharing page.");
                }
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);

            } else {
                console.debug('window.plugins.emailComposer not found!  Generating email normal way.');
                window.location.href = emailUrl;
            }
        };

        $scope.sendWithEmailComposer = function(subjectLine, emailBody){
            if(!cordova || !cordova.plugins.email){
                bugsnagService.reportError('Trying to send with cordova.plugins.email even though it is not installed. ' +
                    ' Using $scope.sendWithMailTo instead.');
                $scope.sendWithMailTo(subjectLine, emailBody);
                return;
            }

            document.addEventListener('deviceready', function () {
                console.debug('deviceready');
                cordova.plugins.email.isAvailable(
                    function (isAvailable) {
                        if(isAvailable){
                            if(window.plugins && window.plugins.emailComposer) {
                                console.debug('Generating email with cordova-plugin-email-composer');
                                window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                                        console.log("Response -> " + result);
                                    },
                                    subjectLine, // Subject
                                    emailBody,                      // Body
                                    null,    // To
                                    'info@quantimo.do',                    // CC
                                    null,                    // BCC
                                    true,                   // isHTML
                                    null,                    // Attachments
                                    null);                   // Attachment Data
                            } else {
                                console.error('window.plugins.emailComposer not available!');
                                $scope.sendWithMailTo(subjectLine, emailBody);
                            }
                        } else {
                            console.error('Email has not been configured for this device!');
                            $scope.sendWithMailTo(subjectLine, emailBody);
                        }
                    }
                );

            }, false);
        };

        $rootScope.getAccessTokenFromUrlParameter = function () {
            $rootScope.accessTokenInUrl = utilsService.getUrlParameter(location.href, 'accessToken');
            if (!$rootScope.accessTokenInUrl) {
                $rootScope.accessTokenInUrl = utilsService.getUrlParameter(location.href, 'access_token');
            }
            if($rootScope.accessTokenInUrl){
                localStorageService.setItem('accessTokenInUrl', $rootScope.accessTokenInUrl);
                localStorageService.setItem('accessToken', $rootScope.accessTokenInUrl);
            } else {
                localStorageService.deleteItem('accessTokenInUrl');
            }

            return $rootScope.accessTokenInUrl;
        };

        $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush = function(userData){
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.metaData = {
                    user: {
                        name: userData.displayName,
                        email: userData.email
                    }
                };
            }
            localStorageService.setItem('user', JSON.stringify(userData));
            $rootScope.user = userData;
            console.debug('$rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush just set $rootScope.user to: ' + JSON.stringify($rootScope.user));
            window.intercomSettings = {
                app_id: "uwtx2m33",
                name: userData.displayName,
                email: userData.email,
                user_id: userData.id,
                app_name: config.appSettings.appName,
                app_version: $rootScope.appVersion,
                platform: $rootScope.currentPlatform,
                platform_version: $rootScope.currentPlatformVersion
            };

            var deviceTokenOnServer = localStorageService.getItemSync('deviceTokenOnServer');
            if(deviceTokenOnServer){
                console.log("This token is already on the server: " + deviceTokenOnServer);
                return;
            }

            var deviceTokenToSync = localStorageService.getItemSync('deviceTokenToSync');
            if(deviceTokenToSync){
                pushNotificationService.registerDeviceToken(deviceTokenToSync);
            }
        };

        $scope.onTextClick = function ($event) {
            console.log("Auto selecting text so the user doesn't have to press backspace...");
            $event.target.select();
        };
        
        $scope.init();
    });
