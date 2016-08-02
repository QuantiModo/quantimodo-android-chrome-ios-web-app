angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $ionicModal, $timeout, $injector, utilsService, authService,
                                    measurementService, $ionicPopover, $ionicLoading, $state, $ionicHistory,
                                    QuantiModo, notificationService, $rootScope, localStorageService, reminderService,
                                    $ionicPopup, $ionicSideMenuDelegate, ratingService, migrationService,
                                    ionicDatePicker, unitService, variableService, $ionicPlatform, $cordovaGeolocation,
                                    qmLocationService, variableCategoryService, bugsnagService) {

        $rootScope.loaderImagePath = config.appSettings.loaderImagePath;
        $rootScope.appMigrationVersion = 1489;
        if (!$rootScope.loaderImagePath) {
            $rootScope.loaderImagePath = 'img/circular-loader.gif';
        }
        $rootScope.trackLocation = false;
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
            localStorageService.setItem(flagName, true);
            $scope[flagName] = true;
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
            $state.go('app.variables',
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

        $scope.goToSettingsForVariableObject = function (variableObject) {
            if (variableObject.variableName) {
                $state.go('app.variableSettings',
                    {
                        variableName: variableObject.variableName,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    });
            }
            else if (variableObject.name) {
                $state.go('app.variableSettings',
                    {
                        variableName: variableObject.name,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    });
            }

        };

        $scope.addToFavoritesUsingStateVariableObject = function (variableObject) {
            var trackingReminder = {};
            trackingReminder.variableId = variableObject.id;
            trackingReminder.reminderFrequency = 0;
            trackingReminder.variableName = variableObject.name;
            trackingReminder.abbreviatedUnitName = variableObject.abbreviatedUnitName;
            trackingReminder.variableDescription = variableObject.description;
            trackingReminder.variableCategoryName = variableObject.variableCategoryName;

            if (trackingReminder.abbreviatedUnitName === '/5') {
                trackingReminder.defaultValue = 3;
                localStorageService.replaceElementOfItemById('trackingReminders', trackingReminder);
                reminderService.addNewReminder(trackingReminder)
                    .then(function () {
                        console.debug("Saved Reminder", trackingReminder);
                    }, function (err) {
                        console.error('Failed to add Reminder!', trackingReminder);
                    });
                $state.go('app.favorites',
                    {
                        trackingReminder: trackingReminder,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    }
                );
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
        $scope.shoppingCartEnabled = config.shoppingCartEnabled;
        //$rootScope.isSyncing = false;
        //$rootScope.syncDisplayText = '';
        $scope.loading = false;
        $ionicLoading.hide();

        setPlatformVariables();

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
                e.targetScope.controller_name === "VariablePageCtrl" ||
                e.targetScope.controller_name === "VariableSettingsCtrl" ||
                e.targetScope.controller_name === "RemindersInboxCtrl"
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

        var scheduleReminder = function () {
            if ($rootScope.reminderToSchedule) {

                var trackingReminder = {
                    variableId: $rootScope.reminderToSchedule.id,
                    defaultValue: $rootScope.reminderToSchedule.reportedVariableValue,
                    variableName: $rootScope.reminderToSchedule.name,
                    frequency: $rootScope.reminderToSchedule.interval,
                    variableCategoryName: $rootScope.reminderToSchedule.category,
                    abbreviatedUnitName: $rootScope.reminderToSchedule.unit,
                    combinationOperation: $rootScope.reminderToSchedule.combinationOperation
                };

                reminderService.addNewReminder(trackingReminder)
                    .then(function () {
                        console.log('reminder scheduled', $rootScope.reminderToSchedule);
                        delete $rootScope.reminderToSchedule;
                    }, function (err) {
                        Bugsnag.notify("reminderService.addNewReminder", JSON.stringify(trackingReminder), {}, "error");
                        console.log(err);
                    });
            }
        };

        // when work on this activity is complete
        function hideNavigationMenuIfSetInUrlParameter() {
            if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                $rootScope.hideNavigationMenu = true;
            }
        }

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
            measurementService.syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts();
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
            $scope.shouldWeCombineNotifications();
            if (!$rootScope.user) {
                $rootScope.user = localStorageService.getItemAsObject('user');
            }
            if (!$rootScope.user && config.getClientId() === 'oAuthDisabled') {
                $rootScope.getUserAndSetInLocalStorage();
            }
            if ($rootScope.user) {
                $rootScope.setUserForIntercom($rootScope.user);
                $rootScope.setUserForBugsnag($rootScope.user);
                $scope.syncEverything();
            }
            // Don't think we need this anymore since everyone should have been migrated by now
            // migrationService.version1466();
            hideNavigationMenuIfSetInUrlParameter();
            //goToWelcomeStateIfNotWelcomed();
            scheduleReminder();
            if ($rootScope.isIOS || $rootScope.isAndroid) {
                console.debug("Going to try setting on trigger and on click actions for notifications when device is ready");
                $ionicPlatform.ready(function () {
                    console.debug("Setting on trigger and on click actions for notifications");
                    notificationService.setOnTriggerAction();
                    notificationService.setOnClickAction(QuantiModo);
                    notificationService.setOnUpdateAction();
                });
            } else {
                console.debug("Not setting on trigger and on click actions for notifications because is not ios or android.");
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

        $rootScope.getTrackingReminderNotifications = function (params) {
            if (!params) {
                params = {};
            }

            var groupTrackingReminderNotificationsByDateRange = function (trackingReminderNotifications) {
                var result = [];
                var reference = moment().local();
                var today = reference.clone().startOf('day');
                var yesterday = reference.clone().subtract(1, 'days').startOf('day');
                var weekold = reference.clone().subtract(7, 'days').startOf('day');
                var monthold = reference.clone().subtract(30, 'days').startOf('day');

                var todayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
                    return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
                });

                if (todayResult.length) {
                    result.push({name: "Today", trackingReminderNotifications: todayResult});
                }

                var yesterdayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
                    return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
                });

                if (yesterdayResult.length) {
                    result.push({name: "Yesterday", trackingReminderNotifications: yesterdayResult});
                }

                var last7DayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
                    var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

                    return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true &&
                        date.isSame(today, 'd') !== true;
                });

                if (last7DayResult.length) {
                    result.push({name: "Last 7 Days", trackingReminderNotifications: last7DayResult});
                }

                var last30DayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {

                    var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

                    return date.isAfter(monthold) === true && date.isBefore(weekold) === true &&
                        date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
                });

                if (last30DayResult.length) {
                    result.push({name: "Last 30 Days", trackingReminderNotifications: last30DayResult});
                }

                var olderResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
                    return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isBefore(monthold) === true;
                });

                if (olderResult.length) {
                    result.push({name: "Older", trackingReminderNotifications: olderResult});
                }

                return result;
            };

            $scope.showLoader('Syncing reminder notifications...');
            reminderService.getTrackingReminderNotifications(params.variableCategoryName, params.today)
                .then(function (trackingReminderNotifications) {

                    if (trackingReminderNotifications.length !== $rootScope.numberOfPendingNotifications) {
                        console.debug("New API response trackingReminderNotifications.length (" + trackingReminderNotifications.length +
                            ") is different from the previous $rootScope.numberOfPendingNotifications (" + $rootScope.numberOfPendingNotifications +
                            ") so updating or recreating notifications...");
                        $rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
                        notificationService.updateOrRecreateNotifications();
                    } else {
                        console.debug("New API response trackingReminderNotifications.length (" + trackingReminderNotifications.length +
                            ") is still the same as the previous $rootScope.numberOfPendingNotifications (" + $rootScope.numberOfPendingNotifications +
                            ") so no need to update or recreate notifications...");
                    }
                    
                    $rootScope.trackingRemindersNotifications =
                        variableCategoryService.attachVariableCategoryIcons(trackingReminderNotifications);
                    $rootScope.filteredTrackingReminderNotifications = groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.hideLoader();
                }, function(){
                    $scope.hideLoader();
                    console.error("failed to get reminder notifications!");
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        };

        $rootScope.updateOrRecreateNotifications = function () {
            notificationService.updateOrRecreateNotifications();
        };

        function setPlatformVariables() {
            $rootScope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
            $rootScope.isAndroid = ionic.Platform.isAndroid();
            $rootScope.isMobile = ionic.Platform.isAndroid() || ionic.Platform.isIPad() || ionic.Platform.isIOS();
            $rootScope.isChrome = window.chrome ? true : false;
            $rootScope.currentPlatform = ionic.Platform.platform();
            $rootScope.currentPlatformVersion = ionic.Platform.version();

            var currentUrl =  window.location.href;
            console.log('currentUrl is ' + currentUrl );
            if (currentUrl.indexOf('chrome-extension') !== -1) {
                $rootScope.isChromeExtension = true;
                $rootScope.isChromeApp = false;
            } 

            if ($rootScope.isChrome && chrome.identity) {
                $rootScope.isChromeExtension = false;
                $rootScope.isChromeApp = true;
            }
        }


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


            try {
                var intervalBetweenCheckingForNotificationsInMinutes = 15;
                if($rootScope.showOnlyOneNotification === true){
                    var notificationSettings = {
                        every: intervalBetweenCheckingForNotificationsInMinutes
                    };
                    console.debug("appCtrl.saveInterval: Going to schedule generic notification",
                        notificationSettings);
                    notificationService.scheduleGenericNotification(notificationSettings);
                }
            } catch (err) {
                console.error('scheduleGenericNotification error');
                bugsnagService.reportError(err);
                console.error(err);
            }

            $rootScope.reminderToSchedule = {
                id: config.appSettings.primaryOutcomeVariableDetails.id,
                reportedVariableValue: $scope.reportedVariableValue,
                interval: intervals[$scope.primaryOutcomeRatingFrequencyDescription],
                variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                category: config.appSettings.primaryOutcomeVariableDetails.category,
                unit: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                combinationOperation : config.appSettings.primaryOutcomeVariableDetails.combinationOperation
            };

            localStorageService.setItem('primaryOutcomeRatingFrequencyDescription', $scope.primaryOutcomeRatingFrequencyDescription);
            $scope.showIntervalCard = false;
        };

        $scope.shouldWeCombineNotifications = function(){
            localStorageService.getItem('showOnlyOneNotification', function(showOnlyOneNotification){
                if(showOnlyOneNotification === "false") {
                    console.debug("showOnlyOneNotification from local storage is a false string: " + showOnlyOneNotification);
                    $rootScope.showOnlyOneNotification = false;
                } else if (showOnlyOneNotification === "true") {
                    $rootScope.showOnlyOneNotification = true;
                } else {
                    console.debug("showOnlyOneNotification from local storage is not a false string");
                    localStorageService.setItem('showOnlyOneNotification', true);
                    $rootScope.showOnlyOneNotification = true;

                    // notificationService.cancelAllNotifications().then(function() {
                    //     localStorageService.getItem('primaryOutcomeRatingFrequencyDescription', function (primaryOutcomeRatingFrequencyDescription) {
                    //         console.debug("Cancelled individual notifications and now scheduling combined one with interval: " + primaryOutcomeRatingFrequencyDescription);
                    //         $scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription ? primaryOutcomeRatingFrequencyDescription : "daily";
                    //         $scope.saveInterval($scope.primaryOutcomeRatingFrequencyDescription);
                    //     });
                    // });
                }
            });
        };

        $rootScope.getUserAndSetInLocalStorage = function(){
            
            var successHandler = function(userObject) {
                if (userObject) {
                    // set user data in local storage
                    console.log('Setting user in getUserAndSetInLocalStorage');
                    localStorageService.setItem('user', JSON.stringify(userObject));
                    $rootScope.user = userObject;
                    $rootScope.setUserForIntercom($rootScope.user);
                    $rootScope.setUserForBugsnag($rootScope.user);
                    //$rootScope.$broadcast('updateChartsAndSyncMeasurements');
                    var currentStateName = $state.current.name;
                    console.log('Current state is  ' + currentStateName);
                    if (currentStateName === 'app.login') {
                        goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                    }
                    return userObject;
                }
            };
            
            authService.apiGet('api/user/me',
                [],
                {},
                successHandler,
                function(err){
                    Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                    console.log(err);
                }
            );
        };

        $rootScope.setUserForIntercom = function(userObject) {
            if(userObject){
                window.intercomSettings = {
                    app_id: "uwtx2m33",
                    name: userObject.displayName,
                    email: userObject.email,
                    user_id: userObject.id,
                    app_name: config.appSettings.appName,
                    app_version: $rootScope.appVersion,
                    platform: $rootScope.currentPlatform,
                    platform_version: $rootScope.currentPlatformVersion
                };
            }
            return userObject;
        };

        $rootScope.setUserForBugsnag = function(userObject) {
            Bugsnag.metaData = {
                user: {
                    name: userObject.displayName,
                    email: userObject.email
                }
            };
            return userObject;
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
                measurementService.syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts();
                reminderService.refreshTrackingRemindersAndScheduleAlarms();
                console.debug("syncEverything: calling refreshTrackingRemindersAndScheduleAlarms");
                variableService.refreshUserVariables();
                variableService.refreshCommonVariables();
                unitService.refreshUnits();
                $rootScope.syncedEverything = true;
                qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
            }
        };

        $scope.sendWithMailTo = function(subjectLine, emailBody){
            var emailUrl = 'mailto:?subject=' + subjectLine + '&body=' + emailBody;
            if($rootScope.isChromeExtension){
                console.debug('isChromeExtension so sending to website to share data');
                var url = config.getURL("api/v2/account/applications", true);
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
        
        $scope.init();
    });
