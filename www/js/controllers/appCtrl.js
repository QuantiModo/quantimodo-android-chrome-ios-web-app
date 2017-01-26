angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                    $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector,
                                    quantimodoService, ionicDatePicker, $cordovaOauth,
                                    $ionicActionSheet, $ionicDeploy, $locale, $mdDialog, $mdToast) {

        $rootScope.appMigrationVersion = 1489;
        $rootScope.appVersion = "2.3.3.0";

        if($rootScope.user && typeof $rootScope.user.trackLocation === "undefined"){
            quantimodoService.getLocalStorageItemAsStringWithCallback('trackLocation', function(trackLocation){
                $rootScope.user.trackLocation = trackLocation;
                if($rootScope.user.trackLocation){
                    quantimodoService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
                }
            });
        }
        $rootScope.placeName = null;
        $rootScope.lastLatitude = null;
        $rootScope.lastLongitude = null;
        $scope.controller_name = "AppCtrl";
        $scope.menu = config.appSettings.menu;
        $rootScope.appSettings = config.appSettings;
        if (!$rootScope.appSettings.loaderImagePath) {
            $rootScope.appSettings.loaderImagePath = 'img/circular_loader.gif';
        }
        if(!$rootScope.appSettings.ionNavBarClass){
            $rootScope.appSettings.ionNavBarClass = "bar-positive";
        }
        $scope.showTrackingSubMenu = false;
        $rootScope.allowOffline = config.appSettings.allowOffline;
        $rootScope.numberOfPendingNotifications = null;
        $scope.showReminderSubMenu = false;
        $scope.primaryOutcomeVariableDetails = config.appSettings.primaryOutcomeVariableDetails;
        $rootScope.appDisplayName = config.appSettings.appDisplayName;

        // Not used
        //$scope.ratingInfo = quantimodoService.getRatingInfo();
        $scope.closeMenu = function () {
            $ionicSideMenuDelegate.toggleLeft(false);
        };

        $scope.$watch(function () {
            return $ionicSideMenuDelegate.getOpenRatio();
        }, function (ratio) {
            if (ratio == 1){
                $scope.showCloseMenuButton = true;
                $scope.hideMenuButton = true;
            }
            if (ratio == 0){
                $scope.showCloseMenuButton = false;
                $scope.hideMenuButton = false;
            }
        });

        $scope.floatingMaterialButton = config.appSettings.floatingMaterialButton;
        $rootScope.unitsIndexedByAbbreviatedName = [];
        $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];

        //  Calendar and  Date picker
        // will update from showCalendarPopup
        $scope.fromDate = new Date();
        $scope.toDate = new Date();

        // "from" datepicker config
        $scope.fromDatePickerObj = {
            callback: function (val) {
                if (typeof(val) === 'undefined') {
                    console.debug('Date not selected');
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
                    console.debug('Date not selected');
                } else {
                    $scope.toDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.toDate, // previously selected value
            from: $scope.fromDate, // don't allow toDate to be after fromDate
            to: new Date() //today
        };

        $scope.goToVariableSettingsForCauseVariable = function(correlationObject) {
            if(correlationObject.causeVariable){
                $rootScope.goToVariableSettingsForVariableObject(correlationObject.causeVariable);
            } else {
                $state.go('app.variableSettings', {variableName: correlationObject.causeVariableName});
            }
        };

        $scope.goToVariableSettingsForEffectVariable = function(correlationObject) {
            if(correlationObject.effectVariable){
                $rootScope.goToVariableSettingsForVariableObject(correlationObject.effectVariable);
            } else {
                $state.go('app.variableSettings', {variableName: correlationObject.effectVariableName});
            }
        };

        $scope.goToState = function (state, stateParameters) {
            if(!stateParameters){
                stateParameters = {};
            }
            stateParameters.fromState = $state.current.name;
            stateParameters.fromUrl = window.location.href;
            $state.go(state, stateParameters);
        };

        $scope.openUrl = function(url){
            if(typeof cordova !== "undefined"){
                cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
            } else {
                window.open(url,'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');
            }
        };

        $scope.shareStudy = function(correlationObject, url){
            if(url.indexOf('userId') !== -1){
                if(!correlationObject.shareUserMeasurements){
                    showShareStudyConfirmation(correlationObject, url);
                } else {
                    $scope.openUrl(url);
                }
            } else {
                $scope.openUrl(url);
            }
        };

        var showShareStudyConfirmation = function(correlationObject, url) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Share Study',
                template: 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
                ' and ' + correlationObject.effectVariableName + ' measurements publicly visible? <br><br> You can ' +
                'make them private again at any time on this study page.'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    correlationObject.shareUserMeasurements = true;
                    $rootScope.correlationObject.shareUserMeasurements = true;
                    quantimodoService.setLocalStorageItem('lastStudy', JSON.stringify(correlationObject));
                    var body = {
                        causeVariableId: correlationObject.causeVariableId,
                        effectVariableId: correlationObject.effectVariableId,
                        shareUserMeasurements: true
                    };
                    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
                    quantimodoService.postStudyDeferred(body).then(function () {
                        $ionicLoading.hide();
                        if(url){
                            $scope.openUrl(url);
                        }
                    }, function (error) {
                        $ionicLoading.hide();
                        console.error(error);
                    });
                } else {
                    correlationObject.shareUserMeasurements = false;
                    console.log('You are not sure');
                }
            });
        };

        $scope.openVariableSearchDialog = function($event) {
            $mdDialog.show({
                controller: VariableSearchCtrl,
                controllerAs: 'ctrl',
                templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose:true
            });
        };

        $scope.showUnshareStudyConfirmation = function(correlationObject) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Share Study',
                template: 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
                ' and ' + correlationObject.effectVariableName + ' measurements private? <br><br> Links to studies you ' +
                'previously shared with these variables will no longer work.'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    correlationObject.shareUserMeasurements = false;
                    var body = {
                        causeVariableId: correlationObject.causeVariableId,
                        effectVariableId: correlationObject.effectVariableId,
                        shareUserMeasurements: false
                    };
                    quantimodoService.postStudyDeferred(body).then(function () {

                    }, function (error) {
                        console.error(error);
                    });
                } else {
                    correlationObject.shareUserMeasurements = true;
                    console.log('You are not sure');
                }
            });
        };

        $scope.toggleStudyShare = function (correlationObject) {
            if(correlationObject.shareUserMeasurements){
                showShareStudyConfirmation(correlationObject);
            } else {
                $scope.showUnshareStudyConfirmation(correlationObject);
            }
        };

        // Gets measurements directly from API instead of checking local storage cache first
        // To restrict to a specific variable, provide params = {variableName: "Your Variable Name Here"}
        $scope.refreshMeasurementHistory = function(params){
            var refresh = true;
            $scope.getMeasurementHistory(params, refresh);
        };

        // Returns cached measurements in local storage if available
        // To restrict to a specific variable, provide params = {variableName: "Your Variable Name Here"}
        $scope.getMeasurementHistory = function(params, refresh){
            quantimodoService.getHistoryMeasurements(params, refresh).then(function(measurements){
                $scope.measurementHistory = measurements;
                $scope.hideLoader();
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, function(error){
                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                console.error('error getting measurements' + JSON.stringify(error));
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.hideLoader();
            });
        };

        $scope.showShareVariableConfirmation = function(variableObject, url) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Share Variable',
                template: 'Are you absolutely sure you want to make your ' + variableObject.name +
                ' measurements publicly visible? <br><br> You can ' +
                'make them private again at any time on this page.'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    variableObject.shareUserMeasurements = true;
                    var body = {
                        variableId: variableObject.id,
                        shareUserMeasurements: true
                    };
                    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
                    quantimodoService.postUserVariableDeferred(body).then(function () {
                        $ionicLoading.hide();
                        if(url){
                            $scope.openUrl(url);
                        }
                    }, function (error) {
                        $ionicLoading.hide();
                        console.error(error);
                    });
                } else {
                    variableObject.shareUserMeasurements = false;
                    console.log('You are not sure');
                }
            });
        };

        $scope.showUnshareVariableConfirmation = function(variableObject) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Share Variable',
                template: 'Are you absolutely sure you want to make your ' + variableObject.name +
                ' and ' + variableObject.name + ' measurements private? <br><br> Links to studies you ' +
                'previously shared with this variable will no longer work.'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    variableObject.shareUserMeasurements = false;
                    var body = {
                        variableId: variableObject.id,
                        shareUserMeasurements: true
                    };
                    quantimodoService.postUserVariableDeferred(body).then(function () {

                    }, function (error) {
                        console.error(error);
                    });
                } else {
                    variableObject.shareUserMeasurements = true;
                    console.log('You are not sure');
                }
            });
        };

        $scope.toggleVariableShare = function (variableObject) {
            if(variableObject.shareUserMeasurements){
                $scope.showShareVariableConfirmation(variableObject);
            } else {
                $scope.showUnshareVariableConfirmation(variableObject);
            }
        };

        $rootScope.setLocalStorageFlagTrue = function (flagName) {
            console.debug('Set ' + flagName + ' to true');
            $rootScope[flagName] = true;
            quantimodoService.setLocalStorageItem(flagName, true);
        };

        $rootScope.hideHelpCard = function () {
            var card = $rootScope.defaultHelpCards[0];
            card.hide = true;
            $rootScope.defaultHelpCards = $rootScope.defaultHelpCards.filter(function( obj ) {
                return obj.id !== card.id;
            });
            quantimodoService.deleteElementOfLocalStorageItemById('defaultHelpCards', card.id);
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
            console.debug("$scope.updateDatesLocalStorage is calling quantimodoService.setDates");
            quantimodoService.setDates(to, from);
        };

        // show main calendar popup (from and to)
        $scope.showCalendarPopup = function ($event) {
            $scope.popover.show($event);
            quantimodoService.getToDate(function (endDate) {
                $scope.toDate = new Date(endDate);
                $scope.fromDatePickerObj.to = $scope.toDate;
                quantimodoService.getFromDate(function (fromDate) {
                    $scope.fromDate = new Date(fromDate);
                    $scope.toDatePickerObj.from = $scope.fromDate;
                });
            });
        };

        var helpPopupMessages = config.appSettings.helpPopupMessages || false;

        $scope.showHelpInfoPopup = function () {
            $rootScope.helpPopup = $ionicPopup.show({
                title: helpPopupMessages[location.hash],
                //subTitle: '',
                scope: $scope,
                template: '<label><input type="checkbox" ng-model="$parent.notShowHelpPopup" class="show-again-checkbox">Don\'t show these tips</label>',
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive',
                        onTap: function () {
                            quantimodoService.setLocalStorageItem('notShowHelpPopup', JSON.stringify($scope.notShowHelpPopup));
                        }
                    }
                ]
            });
        };

        $scope.onGenericHelpButtonPress = function () {
            $state.go('app.help');
        };

        $scope.onHelpButtonPress = function (title, helpText) {

            if(!helpText){
                helpText = $rootScope.stateParams.helpText;
            }

            if(!title){
                title = $rootScope.stateParams.title;
            }

            $rootScope.helpButtonPopup = $ionicPopup.show({
                title: title,
                //subTitle: '',
                scope: $scope,
                template: helpText,
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

        $scope.addTag = function () {
            $state.go('app.tagSearch',  {
                fromState: $state.current.name,
                taggedVariableObject: $rootScope.variableObject
            });
        };

        $scope.tagAnotherVariable = function () {
            $state.go('app.tageeSearch',  {
                fromState: $state.current.name,
                tagVariableObject: $rootScope.variableObject
            });
        };

        $scope.showHelpInfoPopupIfNecessary = function (e) {
            quantimodoService.getLocalStorageItemAsStringWithCallback('isWelcomed', function (isWelcomed) {
                if (isWelcomed === true || isWelcomed === "true") {
                    if (helpPopupMessages && typeof helpPopupMessages[location.hash] !== "undefined") {
                        quantimodoService.getLocalStorageItemAsStringWithCallback('notShowHelpPopup', function (val) {
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
            $state.go('app.historyAllVariable',
                {
                    variableObject: variableObject,
                    variableName: variableObject.name
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

        $scope.addToRemindersUsingVariableObject = function (variableObject, options) {
            var doneState = config.appSettings.defaultState;
            if(options.doneState){
                doneState = options.doneState;
            }

            if($rootScope.onboardingPages && $rootScope.onboardingPages[0] &&
                $rootScope.onboardingPages[0].id.toLowerCase().indexOf('reminder') !== -1){
                $rootScope.onboardingPages[0].title = $rootScope.onboardingPages[0].title.replace('Any', 'More');
                $rootScope.onboardingPages[0].buttons[0].buttonText = "Add Another";
                $rootScope.onboardingPages[0].buttons[1].buttonText = "All Done";
                $rootScope.onboardingPages[0].bodyText = "Great job!  Now you'll be able to instantly record " +
                    variableObject.name + " in the Reminder Inbox. <br><br>   Want to add any more " +
                    variableObject.variableCategoryName.toLowerCase() + '?';
                quantimodoService.setLocalStorageItem('onboardingPages', JSON.stringify($rootScope.onboardingPages));
            }

            var trackingReminder = {};
            trackingReminder.variableId = variableObject.id;
            trackingReminder.variableName = variableObject.name;
            trackingReminder.abbreviatedUnitName = variableObject.abbreviatedUnitName;
            trackingReminder.variableDescription = variableObject.description;
            trackingReminder.variableCategoryName = variableObject.variableCategoryName;
            trackingReminder.reminderFrequency = 86400;
            trackingReminder.reminderStartTime = quantimodoService.getUtcTimeStringFromLocalString("19:00:00");

            var skipReminderSettings = false;

            if(variableObject.variableName === "Blood Pressure"){
                skipReminderSettings = true;
            }

            if(options.skipReminderSettingsIfPossible){
                if(variableObject.abbreviatedUnitName === '/5'){
                    skipReminderSettings = true;
                }

                if(variableObject.abbreviatedUnitName === 'serving'){
                    skipReminderSettings = true;
                    trackingReminder.defaultValue = 1;
                }
            }

            if (!skipReminderSettings) {
                $state.go('app.reminderAdd',
                    {
                        variableObject: variableObject,
                        doneState: doneState
                    }
                );
                return;
            }

            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminders', trackingReminder)
                .then(function() {
                    // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                    $state.go(doneState,
                        {
                            trackingReminder: trackingReminder,
                            fromState: $state.current.name,
                            fromUrl: window.location.href
                        }
                    );
                    quantimodoService.postTrackingRemindersDeferred(trackingReminder)
                        .then(function () {
                            $ionicLoading.hide();
                            console.debug("Saved to reminders: " + JSON.stringify(trackingReminder));
                        }, function(error) {
                            $ionicLoading.hide();
                            console.error('Failed to add reminders!' + JSON.stringify(error));
                        });
                });
        };

        $scope.addToFavoritesUsingVariableObject = function (variableObject) {

            var trackingReminder = {};
            trackingReminder.variableId = variableObject.id;
            trackingReminder.variableName = variableObject.name;
            trackingReminder.abbreviatedUnitName = variableObject.abbreviatedUnitName;
            trackingReminder.variableDescription = variableObject.description;
            trackingReminder.variableCategoryName = variableObject.variableCategoryName;
            trackingReminder.reminderFrequency = 0;

            if($rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise){
                var message = 'Got deletion request before last reminder refresh completed';
                console.debug(message);
                $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise.reject();
                $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise = null;
                $rootScope.syncingReminders = false;
            }

            if ((trackingReminder.abbreviatedUnitName !== '/5' && trackingReminder.variableName !== "Blood Pressure")) {
                $state.go('app.favoriteAdd',
                    {
                        variableObject: variableObject,
                        fromState: $state.current.name,
                        fromUrl: window.location.href,
                        doneState: 'app.favorites'
                    }
                );
                return;
            }

            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            //trackingReminder.defaultValue = 3;
            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminders', trackingReminder)
                .then(function() {
                    // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                    $state.go('app.favorites',
                        {
                            trackingReminder: trackingReminder,
                            fromState: $state.current.name,
                            fromUrl: window.location.href
                        }
                    );
                    quantimodoService.postTrackingRemindersDeferred(trackingReminder)
                        .then(function () {
                            $ionicLoading.hide();
                            console.debug("Saved to favorites: " + JSON.stringify(trackingReminder));
                        }, function(error) {
                            $ionicLoading.hide();
                            console.error('Failed to add favorite!' + JSON.stringify(error));
                        });
                });

        };

        $scope.closeMenuIfNeeded = function (menuItem) {
            if (menuItem.click) {
                $scope[menuItem.click] && $scope[menuItem.click]();
            } else if (!menuItem.isSubMenuParent) {
                $scope.closeMenu();
            }
        };
        $scope.showHistorySubMenu = false;
        $scope.shoppingCartEnabled = config.appSettings.shoppingCartEnabled;
        $scope.loading = false;
        $ionicLoading.hide();

        quantimodoService.setPlatformVariables();

        /*Wrapper Config*/
        $scope.viewTitle = config.appSettings.appDisplayName;
        $scope.primaryOutcomeVariableName = config.appSettings.primaryOutcomeVariableDetails.name;
        $scope.positiveRatingOptions = quantimodoService.getPositiveRatingOptions();
        $scope.negativeRatingOptions = quantimodoService.getNegativeRatingOptions();
        $scope.numericRatingOptions = quantimodoService.getNumericRatingOptions();
        $scope.welcomeText = config.appSettings.welcomeText;
        $scope.primaryOutcomeVariableTrackingQuestion = config.appSettings.primaryOutcomeVariableTrackingQuestion;
        $scope.primaryOutcomeVariableAverageText = config.appSettings.primaryOutcomeVariableAverageText;
        /*Wrapper Config End*/


        $scope.$on('$ionicView.beforeEnter', function (e) {
            quantimodoService.getAccessTokenFromUrlParameter();
            if(!window.private_keys) {
                console.error('Please add private config file to www/private_configs folder!  Contact mike@quantimo.do if you need help');
            }
            if($rootScope.urlParameters.refreshUser){
                quantimodoService.clearLocalStorage();
                window.localStorage.introSeen = true;
                window.localStorage.isWelcomed = true;
                $rootScope.user = null;
                $rootScope.refreshUser = false;
            }
        });

        // when view is changed
        $scope.$on('$ionicView.enter', function (e) {
            //$scope.showHelpInfoPopupIfNecessary(e);
            if (e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackPrimaryOutcomeCtrl") {
                $scope.showCalendarButton = true;
            } else {
                $scope.showCalendarButton = false;
            }

            // Show "..." button on top right
            if (e.targetScope && e.targetScope.controller_name &&
                e.targetScope.controller_name === "MeasurementAddCtrl" ||
                e.targetScope.controller_name === "ReminderAddCtrl" ||
                e.targetScope.controller_name === "FavoriteAddCtrl" ||
                e.targetScope.controller_name === "ChartsPageCtrl" ||
                e.targetScope.controller_name === "VariableSettingsCtrl" ||
                e.targetScope.controller_name === "RemindersInboxCtrl" ||
                e.targetScope.controller_name === "RemindersManageCtrl" ||
                e.targetScope.controller_name === "StudyCtrl" ||
                e.targetScope.controller_name === "PredictorsCtrl" || $state.current.name === 'app.historyAllVariable'
            ) {
                $scope.showMoreMenuButton = true;
            } else {
                $scope.showMoreMenuButton = false;
            }
        });

        // when view is changed
        $scope.$on('$ionicView.afterEnter', function (e) {
            if($rootScope.user && $rootScope.user.trackLocation){
                $ionicPlatform.ready(function() { //For Ionic
                    quantimodoService.backgroundGeolocationInit();
                });
            }
            //quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();  // Using background geolocation
            $rootScope.hideNavigationMenuIfSetInUrlParameter();
            quantimodoService.updateUserTimeZoneIfNecessary();
            quantimodoService.shouldWeUseIonicLocalNotifications();
            quantimodoService.setupBugsnag();
            if($rootScope.user){
                $rootScope.trackLocation = $rootScope.user.trackLocation;
                console.debug('$rootScope.trackLocation  is '+ $rootScope.trackLocation);
                if(!$rootScope.user.getPreviewBuilds){
                    $rootScope.user.getPreviewBuilds = false;
                }
            }

            if ($rootScope.isMobile && $rootScope.localNotificationsEnabled) {
                console.debug("Going to try setting on trigger and on click actions for notifications when device is ready");
                $ionicPlatform.ready(function () {
                    console.debug("Setting on trigger and on click actions for notifications");
                    quantimodoService.setOnTriggerActionForLocalNotifications();
                    quantimodoService.setOnClickActionForLocalNotifications(quantimodoService);
                    quantimodoService.setOnUpdateActionForLocalNotifications();
                });
            } else {
                //console.debug("Not setting on trigger and on click actions for notifications because is not ios or android.");
            }
        });

        $scope.highchartsReflow = function() {
            // Fixes chart width
            //$(window).resize(); This doesn't seem to do anything

            if(!$rootScope.reflowScheduled){
                $rootScope.reflowScheduled = true; // Avoids Error: [$rootScope:inprog] $digest already in progress
                var seconds = 0.1;
                console.debug('Setting highchartsReflow timeout for ' + seconds + ' seconds');
                $timeout(function() {
                    console.debug('executing broadcast(highchartsng.reflow)');
                    $scope.$broadcast('highchartsng.reflow');
                    $rootScope.reflowScheduled = false;
                }, seconds * 1000);

                //$scope.$broadcast('highchartsng.reflow'); This doesn't seem to do anything
            } else {
                console.debug('broadcast(highchartsng.reflow) already scheduled');
            }

        };

        $scope.autoUpdateApp = function () {

            var appUpdatesDisabled = true;
            if(appUpdatesDisabled){
                console.debug("App updates disabled until more testing is done");
                return;
            }

            if(!$rootScope.isMobile){
                console.debug("Cannot update app because platform is not mobile");
                return;
            }

            $scope.updateApp();
        };

        $scope.updateApp = function () {
            var message;
            var releaseTrack;
            $ionicPlatform.ready(function () {

                if(typeof $ionicCloudProvider == "undefined"){
                    console.warn('$ionicCloudProvider is not defined so we cannot use ionic deploy');
                    return;
                }
                // We might need to move this back to app.js if it doesn't work
                if(config.appSettings.ionicAppId){
                    $ionicCloudProvider.init({
                            "core": {
                                "app_id": config.appSettings.ionicAppId
                            }
                    });
                } else {
                    console.warn('Cannot initialize $ionicCloudProvider because appSettings.ionicAppId is not set');
                    return;
                }
                if($rootScope.user && $rootScope.user.getPreviewBuilds){
                    $ionicDeploy.channel = 'staging';
                    releaseTrack = "beta";
                } else {
                    $ionicDeploy.channel = 'production';
                    releaseTrack = "production";
                    message = 'Not updating because user is not signed up for preview builds';
                    console.debug(message);
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    return;
                }
                message = 'Checking for ' + releaseTrack + ' updates...';
                $scope.showLoader(message);
                $ionicDeploy.check().then(function(snapshotAvailable) {
                    if (snapshotAvailable) {
                        message = 'Downloading ' + releaseTrack + ' update...';
                        console.debug(message);
                        if($rootScope.isAndroid){
                            $scope.showLoader(message);
                        }
                        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                        // When snapshotAvailable is true, you can apply the snapshot
                        $ionicDeploy.download().then(function() {
                            message = 'Downloaded new version.  Extracting...';
                            console.debug(message);
                            if($rootScope.isAndroid){
                                $scope.showLoader(message);
                            }
                            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                            $ionicDeploy.extract().then(function() {
                                if($rootScope.isAndroid){
                                    $ionicPopup.show({
                                        title: 'Update available',
                                        //subTitle: '',
                                        template: 'An update was just downloaded. Would you like to restart your app to use the latest features?',
                                        buttons: [
                                            { text: 'Not now' },
                                            {
                                                text: 'Restart',
                                                onTap: function(e) {
                                                    $ionicDeploy.load();
                                                }
                                            }
                                        ]
                                    });
                                }
                            });
                        });
                    } else {
                        message = 'No updates available';
                        if($rootScope.isAndroid){
                            $scope.showLoader(message);
                        }
                        console.debug(message);
                        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    }
                });
                $timeout(function () {
                    $scope.hideLoader();
                }, 60 * 1000);

            });

        };

        $scope.autoUpdateApp();

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        // when work on this activity is complete
        $rootScope.hideNavigationMenuIfSetInUrlParameter = function() {
            if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                $rootScope.hideNavigationMenu = true;
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
            quantimodoService.syncPrimaryOutcomeVariableMeasurements();
        }

        $scope.goToDefaultStateIfWelcomed = function () {
            console.debug('appCtrl: user has seen the welcome screen before...');
            quantimodoService.getLocalStorageItemAsStringWithCallback('isWelcomed', function (isWelcomed) {
                if (isWelcomed === true || isWelcomed === "true") {
                    $rootScope.isWelcomed = true;
                    console.debug('goToDefaultStateIfWelcomed: Going to default state...');
                    goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                }
            });
        };

        $scope.editTag = function(tagVariable){
            $state.go('app.tagAdd', {
                tagConversionFactor: tagVariable.tagConversionFactor,
                taggedVariableObject: $rootScope.variableObject,
                fromState: $state.current.name,
                tagVariableObject: tagVariable,
                variableObject: $rootScope.variableObject,
                fromStateParameters: {variableName: $rootScope.variableObject.name}
            });
        };

        $scope.editTagged = function(taggedVariable){
            $state.go('app.tagAdd', {
                tagConversionFactor: taggedVariable.tagConversionFactor,
                taggedVariableObject: taggedVariable,
                fromState: $state.current.name,
                tagVariableObject: $rootScope.variableObject,
                variableObject: $rootScope.variableObject,
                fromStateParameters: {variableName: $rootScope.variableObject.name}
            });
        };

        $scope.$on('getFavoriteTrackingRemindersFromLocalStorage', function(){
            quantimodoService.getFavoriteTrackingRemindersFromLocalStorage($rootScope.variableCategoryName);
        });

        $scope.init = function () {

            //if($rootScope.showUndoButton){
                //$rootScope.showUndoButton = false;
            //}

            $rootScope.favoritesOrderParameter = 'numberOfRawMeasurements';

            if(!$rootScope.user){
                $rootScope.user = JSON.parse(quantimodoService.getLocalStorageItemAsString('user'));
            }
            if(!$rootScope.user){
                quantimodoService.refreshUser().then(function(){
                    $scope.syncEverything();
                }, function(error){
                    console.error('AppCtrl.init could not refresh user because ' + JSON.stringify(error));
                });
            }
        };

        $scope.$on('callAppCtrlInit', function () {
            console.debug("calling init");
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

        $scope.toggleChartSearchSubMenu = function () {
            $scope.showChartSearchSubMenu = !$scope.showChartSearchSubMenu;
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
                quantimodoService.updateOrRecreateNotifications();
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
            quantimodoService.addToTrackingReminderSyncQueue(reminderToSchedule);
            $scope.showIntervalCard = false;
        };

        $scope.downVote = function(correlationObject, $index){
            if (correlationObject.correlationCoefficient > 0) {
                $scope.increasesDecreases = "increases";
            } else {
                $scope.increasesDecreases = "decreases";
            }

            if (correlationObject.userVote !== 0) {
                $ionicPopup.show({
                    title:'Implausible relationship?',
                    //subTitle: '',
                    scope: $scope,
                    template: 'Do you think is is IMPOSSIBLE that ' + correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                correlationObject.userVote = 0;
                                correlationObject.vote = 0;
                                quantimodoService.postVoteDeferred(correlationObject)
                                    .then(function () {
                                        console.debug('Down voted!');
                                    }, function () {
                                        console.error('Down vote failed!');
                                    });
                            }
                        }
                    ]
                });
            } else {
                $ionicPopup.show({
                    title:'Delete Downvote',
                    //subTitle: '',
                    scope: $scope,
                    template: 'You previously voted that it is IMPOSSIBLE that ' + correlationObject.causeVariableName +
                    ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '. Do you want to delete this down vote?',
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                deleteVote(correlationObject, $index);
                            }
                        }
                    ]
                });
            }
        };

        $scope.upVote = function(correlationObject, $index){
            if (correlationObject.correlationCoefficient > 0) {
                $scope.increasesDecreases = "increases";
            } else {
                $scope.increasesDecreases = "decreases";
            }
            if (correlationObject.userVote !== 1) {
                $ionicPopup.show({
                    title:'Plausible relationship?',
                    //subTitle: '',
                    scope: $scope,
                    template: 'Do you think it is POSSIBLE that '+ correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                correlationObject.userVote = 1;
                                correlationObject.vote = 1;
                                quantimodoService.postVoteDeferred(correlationObject)
                                    .then(function () {
                                        console.debug('upVote');
                                    }, function () {
                                        console.error('upVote failed!');
                                    });
                            }
                        }
                    ]
                });
            } else {
                $ionicPopup.show({
                    title:'Delete Upvote',
                    //subTitle: '',
                    scope: $scope,
                    template: 'You previously voted that it is POSSIBLE that '+ correlationObject.causeVariableName +
                    ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '. Do you want to delete this up vote?',
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                deleteVote(correlationObject, $index);
                            }
                        }
                    ]
                });
            }
        };

        function deleteVote(correlationObject, $index) {
            correlationObject.userVote = null;
            quantimodoService.deleteVoteDeferred(correlationObject, function(response){
                console.debug("deleteVote response", response);
            }, function(response){
                console.error("deleteVote response", response);
            });
        }

        $rootScope.sendToLogin = function(){
            quantimodoService.deleteItemFromLocalStorage('user');
            quantimodoService.deleteItemFromLocalStorage('accessToken');
            quantimodoService.deleteItemFromLocalStorage('accessTokenInUrl');
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
                template: loadingText+ '<br><br><img src={{appSettings.loaderImagePath}}>',
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
            var seconds = 30;
            console.debug('Setting showLoader timeout for ' + seconds + ' seconds.  loadingText is ' + loadingText);
            $timeout(function () {
                $scope.hideLoader();
            }, seconds * 1000);

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
                //quantimodoService.syncPrimaryOutcomeVariableMeasurements();
                if($rootScope.localNotificationsEnabled){
                    console.debug("syncEverything: calling refreshTrackingRemindersAndScheduleAlarms");
                    quantimodoService.refreshTrackingRemindersAndScheduleAlarms();
                }
                quantimodoService.getUserVariablesDeferred();
                quantimodoService.getCommonVariablesDeferred();
                quantimodoService.getUnits();
                $rootScope.syncedEverything = true;
                quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();
                quantimodoService.syncTrackingReminderSyncQueueToServer();
                //quantimodoService.getConnectorsDeferred();
            }
        };

        $scope.sendWithMailTo = function(subjectLine, emailBody, emailAddress, fallbackUrl){
            var emailUrl = 'mailto:';
            if(emailAddress){
                emailUrl = emailUrl + emailAddress;
            }
            emailUrl = emailUrl + '?subject=' + subjectLine + '&body=' + emailBody;
            if($rootScope.isChromeExtension){
                console.debug('isChromeExtension so sending to website');
                var newTab = window.open(fallbackUrl,'_blank');
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

        $scope.sendWithEmailComposer = function(subjectLine, emailBody, emailAddress, fallbackUrl){
            if(!cordova || !cordova.plugins.email){
                quantimodoService.reportError('Trying to send with cordova.plugins.email even though it is not installed. ' +
                    ' Using $scope.sendWithMailTo instead.');
                $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                return;
            }

            if(!emailAddress){
                emailAddress = null;
            }

            document.addEventListener('deviceready', function () {
                console.debug('deviceready');
                cordova.plugins.email.isAvailable(
                    function (isAvailable) {
                        if(isAvailable){
                            if(window.plugins && window.plugins.emailComposer) {
                                console.debug('Generating email with cordova-plugin-email-composer');
                                window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                                        console.debug("Response -> " + result);
                                    },
                                    subjectLine, // Subject
                                    emailBody,                      // Body
                                    emailAddress,    // To
                                    'info@quantimo.do',                    // CC
                                    null,                    // BCC
                                    true,                   // isHTML
                                    null,                    // Attachments
                                    null);                   // Attachment Data
                            } else {
                                console.error('window.plugins.emailComposer not available!');
                                $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                            }
                        } else {
                            console.error('Email has not been configured for this device!');
                            $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                        }
                    }
                );

            }, false);
        };

        $scope.onTextClick = function ($event) {
            console.debug("Auto selecting text so the user doesn't have to press backspace...");
            $event.target.select();
        };

        $scope.favoriteValidationFailure = function (message) {
            quantimodoService.showAlert(message);
            console.error(message);
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
        };

        $scope.trackFavoriteByValueField = function(trackingReminder, $index){
            if($rootScope.favoritesArray[$index].total === null){
                $scope.favoriteValidationFailure('Please specify a value for ' + $rootScope.favoritesArray[$index].variableName);
                return;
            }
            $rootScope.favoritesArray[$index].displayTotal = "Recorded " + $rootScope.favoritesArray[$index].total + " " + $rootScope.favoritesArray[$index].abbreviatedUnitName;
            quantimodoService.postMeasurementByReminder($rootScope.favoritesArray[$index], $rootScope.favoritesArray[$index].total)
                .then(function () {
                    console.debug("Successfully quantimodoService.postMeasurementByReminder: " + JSON.stringify($rootScope.favoritesArray[$index]));
                }, function(error) {
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    console.error(error);
                    console.error('Failed to track favorite! ', 'Please let me know by pressing the help button.  Thanks!');
                });
        };

        $scope.trackByFavorite = function(trackingReminder, modifiedReminderValue){
            if(!modifiedReminderValue){
                modifiedReminderValue = trackingReminder.defaultValue;
            }
            console.debug('Tracking reminder', trackingReminder);
            console.debug('modifiedReminderValue is ' + modifiedReminderValue);
            for(var i = 0; i < $rootScope.favoritesArray.length; i++){
                if($rootScope.favoritesArray[i].id === trackingReminder.id){
                    if($rootScope.favoritesArray[i].abbreviatedUnitName !== '/5') {
                        if(trackingReminder.combinationOperation === "SUM"){
                            $rootScope.favoritesArray[i].total = $rootScope.favoritesArray[i].total + modifiedReminderValue;
                        } else {
                            $rootScope.favoritesArray[i].total = modifiedReminderValue;
                        }
                        $rootScope.favoritesArray[i].displayTotal = $rootScope.favoritesArray[i].total + " " + $rootScope.favoritesArray[i].abbreviatedUnitName;
                    } else {
                        $rootScope.favoritesArray[i].displayTotal = modifiedReminderValue + '/5';
                    }

                }
            }

            if(!$rootScope.favoritesTally){
                $rootScope.favoritesTally = {};
            }


            if(!$rootScope.favoritesTally[trackingReminder.id] || !$rootScope.favoritesTally[trackingReminder.id].tally){
                $rootScope.favoritesTally[trackingReminder.id] = {
                    tally: 0
                };
            }

            if(trackingReminder.combinationOperation === "SUM"){
                $rootScope.favoritesTally[trackingReminder.id].tally += modifiedReminderValue;
            } else {
                $rootScope.favoritesTally[trackingReminder.id].tally = modifiedReminderValue;
            }

            console.debug('modified tally is ' + $rootScope.favoritesTally[trackingReminder.id].tally);

            console.debug('Setting trackByFavorite timeout');
            $timeout(function() {
                if(typeof $rootScope.favoritesTally[trackingReminder.id] === "undefined"){
                    console.error("$rootScope.favoritesTally[trackingReminder.id] is undefined so we can't send tally in favorite controller. Not sure how this is happening.");
                    return;
                }
                if($rootScope.favoritesTally[trackingReminder.id].tally) {
                    quantimodoService.postMeasurementByReminder(trackingReminder, $rootScope.favoritesTally[trackingReminder.id].tally)
                        .then(function () {
                            console.debug("Successfully quantimodoService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
                        }, function(error) {
                            if (typeof Bugsnag !== "undefined") {
                                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                            }
                            console.error(error);
                            console.error('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
                        });
                    $rootScope.favoritesTally[trackingReminder.id].tally = 0;
                }
            }, 2000);

        };

        $scope.deleteAllMeasurementsForVariable = function() {
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            // Delete all measurements for a variable
            quantimodoService.deleteAllMeasurementsForVariableDeferred($rootScope.variableObject.id).then(function() {
                // If primaryOutcomeVariableName, delete local storage measurements
                if ($rootScope.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    quantimodoService.setLocalStorageItem('primaryOutcomeVariableMeasurements',[]);
                    quantimodoService.setLocalStorageItem('measurementsQueue',[]);
                    quantimodoService.setLocalStorageItem('averagePrimaryOutcomeVariableValue',0);
                    quantimodoService.setLocalStorageItem('lastSyncTime',0);
                }
                $ionicLoading.hide();
                $state.go(config.appSettings.defaultState);
                console.debug("All measurements for " + $rootScope.variableName + " deleted!");
            }, function(error) {
                $ionicLoading.hide();
                console.debug('Error deleting measurements: '+ JSON.stringify(error));
            });
        };

        $scope.showDeleteAllMeasurementsForVariablePopup = function(){
            $ionicPopup.show({
                title:'Delete all ' + $rootScope.variableName + " measurements?",
                //subTitle: '',
                template: 'This cannot be undone!',
                scope: $scope,
                buttons:[
                    {
                        text: 'Yes',
                        type: 'button-positive',
                        onTap: $scope.deleteAllMeasurementsForVariable
                    },
                    {
                        text: 'No',
                        type: 'button-assertive'
                    }
                ]

            });
        };

        $rootScope.goToVariableSettingsForVariableObject = function (variableObject) {
            $state.go('app.variableSettings', {variableObject: variableObject, variableName: variableObject.name});
        };

        // Triggered on a button click, or some other target
        $scope.showFavoriteActionSheet = function(favorite, $index, bloodPressure) {

            var variableObject = {
                id: favorite.variableId,
                name: favorite.variableName
            };

            var actionMenuButtons = [
                { text: '<i class="icon ion-gear-a"></i>Change Default Value' },
                { text: '<i class="icon ion-edit"></i>Other Value/Time/Note' },
                { text: '<i class="icon ion-arrow-graph-up-right"></i>Charts'},
                { text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
                { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'}
            ];

            if(config.appSettings.favoritesController){
                if(config.appSettings.favoritesController.actionMenuButtons){
                    actionMenuButtons = config.appSettings.favoritesController.actionMenuButtons;
                }
            }

            if(bloodPressure){
                actionMenuButtons = [];
            }

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: actionMenuButtons,
                destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug('BUTTON CLICKED', index);
                    if(index === 0){
                        $state.go('app.favoriteAdd', {reminder: favorite});
                    }
                    if(index === 1){
                        $state.go('app.measurementAdd', {trackingReminder: favorite});
                    }
                    if(index === 2){
                        $state.go('app.charts',
                            {
                                trackingReminder: favorite,
                                fromState: $state.current.name,
                                fromUrl: window.location.href
                            });
                    }
                    if (index === 3) {
                        $scope.goToHistoryForVariableObject(variableObject);
                    }
                    if (index === 4) {
                        $state.go('app.variableSettings',
                            {variableName: favorite.variableName});
                    }
                    if(index === 5){
                        var reminder = JSON.parse(JSON.stringify(favorite));
                        reminder.id = null;
                        reminder.trackingReminderId = null;
                        $state.go('app.reminderAdd',
                            {
                                reminder: reminder,
                                fromState: $state.current.name,
                                fromUrl: window.location.href
                            });
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    if(!bloodPressure){
                        $rootScope.favoritesArray.splice($index, 1);
                        quantimodoService.deleteTrackingReminderDeferred(favorite.id)
                            .then(function(){
                                console.debug('Favorite deleted: ' + JSON.stringify(favorite));
                            }, function(error){
                                console.error('Failed to Delete Favorite!  Error is ' + error.message + '.  Favorite is ' + JSON.stringify(favorite));
                            });
                        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminders', favorite.id)
                            .then(function(){
                                //$scope.init();
                            });
                        return true;
                    }

                    if(bloodPressure){
                        quantimodoService.deleteTrackingReminderDeferred($rootScope.bloodPressureReminderId)
                            .then(function(){
                                console.debug('Favorite deleted: ' + JSON.stringify($rootScope.bloodPressure));
                            }, function(error){
                                console.error('Failed to Delete Favorite!  Error is ' + error.message + '.  Favorite is ' + JSON.stringify($rootScope.bloodPressure));
                            });
                        quantimodoService.deleteElementOfLocalStorageItemById('trackingReminders', $rootScope.bloodPressureReminderId)
                            .then(function(){
                                //$scope.init();
                            });
                        $rootScope.bloodPressureReminderId = null;
                        return true;
                    }
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        $scope.trackBloodPressure = function(){
            if(!$rootScope.bloodPressure.diastolicValue || !$rootScope.bloodPressure.systolicValue){
                $scope.favoriteValidationFailure('Please enter both values for blood pressure.');
                return;
            }
            $rootScope.bloodPressure.displayTotal = "Recorded " + $rootScope.bloodPressure.systolicValue + "/" + $rootScope.bloodPressure.diastolicValue + ' Blood Pressure';
            quantimodoService.postBloodPressureMeasurements($rootScope.bloodPressure)
                .then(function () {
                    console.debug("Successfully quantimodoService.postMeasurementByReminder: " + JSON.stringify($rootScope.bloodPressure));
                }, function(error) {
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    console.error('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
                });
        };

        $scope.refreshVariables = function () {
            quantimodoService.refreshCommonVariables().then(function () {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, function (error) {
                console.error(error);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
            quantimodoService.refreshUserVariables().then(function () {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, function (error) {
                console.error(error);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.showExplanationsPopup = function(settingName) {
            var explanationText = {
                "Minimum value": "The minimum allowed value for measurements. " +
                    "While you can record a value below this minimum, it will be " +
                    "excluded from the correlation analysis.",
                "Maximum value": "The maximum allowed value for measurements. " +
                    "While you can record a value above this maximum, it will be " +
                    "excluded from the correlation analysis.",
                "Onset delay": "An outcome is always preceded by the predictor or stimulus. " +
                    "The amount of time that elapses after the predictor/stimulus event " +
                    "before the outcome as perceived by a self-tracker is known as the “onset delay”.  " +
                    "For example, the “onset delay” between the time a person takes an aspirin " +
                    "(predictor/stimulus event) and the time a person perceives a change in their" +
                    " headache severity (outcome) is approximately 30 minutes.",
                "Duration of action": "The amount of time over " +
                    "which a predictor/stimulus event can exert an observable influence " +
                    "on an outcome variable’s value. For instance, aspirin (stimulus/predictor) " +
                    "typically decreases headache severity for approximately four hours" +
                    " (duration of action) following the onset delay.",
                "Filling value": "When it comes to analysis to determine the effects of this variable," +
                    " knowing when it did not occur is as important as knowing when it did occur. " +
                    "For example, if you are tracking a medication, it is important to know " +
                    "when you did not take it, but you do not have to log zero values for " +
                    "all the days when you haven't taken it. Hence, you can specify a filling value " +
                    "(typically 0) to insert whenever data is missing.",
                "Combination Method": "How multiple measurements are combined over time.  We use the average (or mean) " +
                    "for things like your weight.  Summing is used for things like number of apples eaten. "
            };

            $ionicPopup.show({
                title: settingName,
                //subTitle: '',
                template: explanationText[settingName],
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    }
                ]
            });

        };

        $scope.saveVariableSettings = function(variableObject){
            var params = {
                variableId: variableObject.id,
                durationOfAction: variableObject.durationOfActionInHours*60*60,
                fillingValue: variableObject.fillingValue,
                //joinWith
                maximumAllowedValue: variableObject.maximumAllowedValue,
                minimumAllowedValue: variableObject.minimumAllowedValue,
                onsetDelay: variableObject.onsetDelayInHours*60*60,
                combinationOperation: variableObject.combinationOperation
                //userVariableAlias: $scope.state.userVariableAlias
                //experimentStartTime
                //experimentEndTime
            };

            console.debug('Saving variable settings ' + JSON.stringify(params));
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            quantimodoService.postUserVariableDeferred(params).then(function() {
                quantimodoService.deleteItemFromLocalStorage('lastStudy');
                console.debug("quantimodoService.postUserVariableDeferred: success: " + JSON.stringify(params));
                $ionicLoading.hide();
                $rootScope.goBack();
            }, function(error) {
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $rootScope.goBack = function () {
            if($ionicHistory.viewHistory().backView){
                $ionicHistory.goBack();
            } else {
                $state.go(config.appSettings.defaultState);
            }
        };

        $scope.setupVariableByVariableObject = function(variableObject) {
            $rootScope.variableName = variableObject.name;
            $rootScope.variableObject = variableObject;
            $rootScope.variableObject.onsetDelayInHours = variableObject.onsetDelay/3600;
            $rootScope.variableObject.durationOfActionInHours = variableObject.durationOfAction/3600;
            $scope.loading = false;
            $scope.hideLoader() ;
        };

        $scope.getUserVariableByName = function (variableName, refresh) {
            if(!variableName){
                quantimodoService.reportError('No variable name provided to $scope.getUserVariableByName');
                return;
            }
            if($rootScope.variableObject && $rootScope.variableObject.name !== variableName){
                $rootScope.variableObject = null;
            }
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            var params = {includeTags : true};
            quantimodoService.getUserVariableByNameDeferred(variableName, params, refresh).then(function(variableObject){
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $ionicLoading.hide();
                $rootScope.variableObject = variableObject;
                $scope.setupVariableByVariableObject(variableObject);
            }, function (error) {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $scope.refreshUserVariable = function () {
            var refresh = true;
            if($rootScope.variableObject){
                $rootScope.variableName = $rootScope.variableObject.name;
            }
            $scope.getUserVariableByName($rootScope.variableName, refresh);
        };

        $scope.resetVariableToDefaultSettings = function(variableObject) {
            // Populate fields with original settings for variable
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            quantimodoService.resetUserVariableDeferred(variableObject.id).then(function() {
                $scope.getUserVariableByName(variableObject.name);
            });
        };

        $scope.goToReminderSearchCategory = function(variableCategoryName) {
            $state.go('app.reminderSearchCategory',
                {
                    variableCategoryName : variableCategoryName,
                    fromUrl: window.location.href,
                    hideNavigationMenu: $rootScope.hideNavigationMenu,
                    skipReminderSettingsIfPossible: true,
                    doneState: $state.current.name
                });
        };

        $scope.sendChromeEmailLink = function(){
            var subjectLine = "Install%20the%20" + config.appSettings.appDisplayName + "%20Chrome%20Browser%20Extension";
            var linkToChromeExtension = config.appSettings.linkToChromeExtension;
            var emailBody = "Did%20you%20know%20that%20you%20can%20easily%20track%20everything%20on%20your%20laptop%20and%20desktop%20with%20our%20Google%20Chrome%20browser%20extension%3F%20%20Your%20data%20is%20synced%20between%20devices%20so%20you%27ll%20never%20have%20to%20track%20twice!%0A%0ADownload%20it%20here!%0A%0A" + encodeURIComponent(linkToChromeExtension)  + "%0A%0ALove%2C%20%0AYou";
            var fallbackUrl = null;
            var emailAddress = $rootScope.user.email;
            if($rootScope.isMobile){
                $scope.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
            } else {
                $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
            }
        };

        $scope.refreshConnectors = function(){
            quantimodoService.refreshConnectors()
                .then(function(connectors){
                    $rootScope.connectors = connectors;
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide().then(function(){
                        console.debug("The loading indicator is now hidden");
                    });
                }, function(response){
                    console.error(response);
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicLoading.hide().then(function(){
                        console.debug("The loading indicator is now hidden");
                    });
                });
        };

        $scope.connect = function(connector){

            var scopes;
            var myPopup;
            var options;
            connector.loadingText = 'Connecting...';

            var connectWithParams = function(params, lowercaseConnectorName) {
                quantimodoService.connectConnectorWithParamsDeferred(params, lowercaseConnectorName)
                    .then(function(result){
                        console.debug(JSON.stringify(result));
                        $scope.refreshConnectors();
                    }, function (error) {
                        errorHandler(error);
                        $scope.refreshConnectors();
                    });
            };

            var connectWithToken = function(response) {
                console.debug("Response Object -> " + JSON.stringify(response));
                var body = {
                    connectorCredentials: {token: response},
                    connector: connector
                };
                quantimodoService.connectConnectorWithTokenDeferred(body).then(function(result){
                    console.debug(JSON.stringify(result));
                    $scope.refreshConnectors();
                }, function (error) {
                    errorHandler(error);
                    $scope.refreshConnectors();
                });
            };

            var connectWithAuthCode = function(authorizationCode, connector){
                console.debug(connector.name + " connect result is " + JSON.stringify(authorizationCode));
                quantimodoService.connectConnectorWithAuthCodeDeferred(authorizationCode, connector.name).then(function (){
                    $scope.refreshConnectors();
                }, function() {
                    console.error("error on connectWithAuthCode for " + connector.name);
                    $scope.refreshConnectors();
                });
            };

            var errorHandler = function(error){
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
            };

            if(connector.name === 'github') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = ['user', 'repo'];
                $cordovaOauth.github(window.private_keys.GITHUB_CLIENT_ID, window.private_keys.GITHUB_CLIENT_SECRET,
                    scopes).then(function(result) {
                    connectWithToken(result);
                }, function(error) {
                    errorHandler(error);
                });
            }

            if(connector.name === 'withings') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                $cordovaOauth.withings(window.private_keys.WITHINGS_CLIENT_ID, window.private_keys.WITHINGS_CLIENT_SECRET)
                    .then(function(result) {
                        connectWithToken(result);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'fitbit') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [
                    'activity',
                    'heartrate',
                    'location',
                    'nutrition',
                    'profile',
                    'settings',
                    'sleep',
                    'social',
                    'weight'
                ];

                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.fitbit(window.private_keys.FITBIT_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'runkeeper') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [];
                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.fitbit(window.private_keys.RUNKEEPER_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'rescuetime') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = ['time_data', 'category_data', 'productivity_data'];
                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.rescuetime(window.private_keys.RESCUETIME_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'slice') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [];
                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.slice(window.private_keys.SLICE_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }


            if(connector.name === 'facebook') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = ['user_likes', 'user_posts'];
                $cordovaOauth.facebook(window.private_keys.FACEBOOK_APP_ID, scopes)
                    .then(function(result) {
                        connectWithToken(result);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'googlefit') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [
                    "https://www.googleapis.com/auth/fitness.activity.read",
                    "https://www.googleapis.com/auth/fitness.body.read",
                    "https://www.googleapis.com/auth/fitness.location.read"
                ];

                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.googleOffline(window.private_keys.GOOGLE_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'googlecalendar') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [
                    "https://www.googleapis.com/auth/calendar",
                    "https://www.googleapis.com/auth/calendar.readonly"
                ];
                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.googleOffline(window.private_keys.GOOGLE_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'sleepcloud') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [
                    'https://www.googleapis.com/auth/userinfo.email'
                ];
                options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
                $cordovaOauth.googleOffline(window.private_keys.GOOGLE_CLIENT_ID, scopes, options)
                    .then(function(authorizationCode) {
                        connectWithAuthCode(authorizationCode, connector);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'up') {

                if($rootScope.isWeb){
                    webConnect(connector);
                    return;
                }

                scopes = [
                    'basic_read',
                    'extended_read',
                    'location_read',
                    'friends_read',
                    'mood_read',
                    'move_read',
                    'sleep_read',
                    'meal_read',
                    'weight_read',
                    'heartrate_read',
                    'generic_event_read'
                ];

                $cordovaOauth.jawbone(window.private_keys.JAWBONE_CLIENT_ID, window.private_keys.JAWBONE_CLIENT_SECRET, scopes)
                    .then(function(result) {
                        connectWithToken(result);
                    }, function(error) {
                        errorHandler(error);
                    });
            }

            if(connector.name === 'worldweatheronline') {
                $scope.data = {};

                myPopup = $ionicPopup.show({
                    template: '<label class="item item-input">' +
                    '<i class="icon ion-location placeholder-icon"></i>' +
                    '<input type="text" placeholder="Zip Code or City, Country" ng-model="data.location"></label>',
                    title: connector.displayName,
                    subTitle: 'Enter Your Zip Code or City, Country/State',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.location) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data.location;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function(res) {
                    var params = {
                        location: String($scope.data.location)
                    };
                    connectWithParams(params, connector.name);
                    console.debug('Entered zip code. Result: ', res);
                });
            }

            if(connector.name === 'whatpulse') {
                $scope.data = {};

                myPopup = $ionicPopup.show({
                    template: '<label class="item item-input">' +
                    '<i class="icon ion-person placeholder-icon"></i>' +
                    '<input type="text" placeholder="Username" ng-model="data.username"></label>',
                    title: connector.displayName,
                    subTitle: 'Enter your ' + connector.displayName + ' username found next to your avatar on the WhatPulse My Stats page',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.username) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data.username;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function(res) {
                    var params = {
                        username: $scope.data.username
                    };
                    var body = {
                        connectorCredentials: params,
                        connector: connector
                    };
                    connectWithParams(params, connector.name);
                });
            }

            if(connector.name === 'myfitnesspal') {
                $scope.data = {};

                myPopup = $ionicPopup.show({
                    template: '<label class="item item-input">' +
                    '<i class="icon ion-person placeholder-icon"></i>' +
                    '<input type="text" placeholder="Username" ng-model="data.username"></label>' +
                    '<br> <label class="item item-input">' +
                    '<i class="icon ion-locked placeholder-icon"></i>' +
                    '<input type="password" placeholder="Password" ng-model="data.password"></label>',
                    title: connector.displayName,
                    subTitle: 'Enter Your ' + connector.displayName + ' Credentials',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.username || !$scope.data.password) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function(res) {
                    var params = {
                        username: $scope.data.username,
                        password: $scope.data.password
                    };
                    connectWithParams(params, connector.name);
                });
            }

            if(connector.name === 'mynetdiary') {
                $scope.data = {};

                myPopup = $ionicPopup.show({
                    template: '<label class="item item-input">' +
                    '<i class="icon ion-person placeholder-icon"></i>' +
                    '<input type="text" placeholder="Username" ng-model="data.username"></label>' +
                    '<br> <label class="item item-input">' +
                    '<i class="icon ion-locked placeholder-icon"></i>' +
                    '<input type="password" placeholder="Password" ng-model="data.password"></label>',
                    title: connector.displayName,
                    subTitle: 'Enter Your ' + connector.displayName + ' Credentials',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.password || !$scope.data.username) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function(res) {
                    var params = {
                        username: $scope.data.username,
                        password: $scope.data.password
                    };
                    connectWithParams(params, connector.name);
                });
            }

            if(connector.name === 'moodpanda') {
                $scope.data = {};

                myPopup = $ionicPopup.show({
                    template: '<label class="item item-input">' +
                    '<i class="icon ion-email placeholder-icon"></i>' +
                    '<input type="email" placeholder="Email" ng-model="data.email"></label>',
                    title: connector.displayName,
                    subTitle: 'Enter Your ' + connector.displayName + ' Email',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.email) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function(res) {
                    var params = {
                        email: $scope.data.email
                    };
                    connectWithParams(params, connector.name);
                });
            }

            if(connector.name === 'moodscope') {
                $scope.data = {};

                myPopup = $ionicPopup.show({
                    template: '<label class="item item-input">' +
                    '<i class="icon ion-person placeholder-icon"></i>' +
                    '<input type="text" placeholder="Username" ng-model="data.username"></label>' +
                    '<br> <label class="item item-input">' +
                    '<i class="icon ion-locked placeholder-icon"></i>' +
                    '<input type="password" placeholder="Password" ng-model="data.password"></label>',
                    title: connector.displayName,
                    subTitle: 'Enter Your ' + connector.displayName + ' Credentials',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                if (!$scope.data.password || !$scope.data.username) {
                                    //don't allow the user to close unless he enters wifi password
                                    e.preventDefault();
                                } else {
                                    return $scope.data;
                                }
                            }
                        }
                    ]
                });

                myPopup.then(function(res) {
                    var params = {
                        username: $scope.data.username,
                        password: $scope.data.password
                    };
                    connectWithParams(params, connector.name);
                });
            }
        };

        $scope.disconnect = function (connector){
            connector.loadingText = 'Disconnecting...';
            quantimodoService.disconnectConnectorDeferred(connector.name).then(function (){
                $scope.refreshConnectors();
            }, function() {
                console.error("error disconnecting " + connector.name);
            });
        };

        $scope.getItHere = function (connector){
            window.open(connector.getItUrl, '_blank');
        };

        var webConnect = function (connector) {
            var url = connector.connectInstructions.url;
            console.debug('targetUrl is ',  url);
            var ref = window.open(url,'', "width=600,height=800");
            console.debug('Opened ' + url);
        };

        // LOGIN FUNCTIONS

        $scope.register = function() {
            var register = true;
            $scope.login(register);
        };

        $scope.login = function(register) {

            if(window && window.plugins && window.plugins.googleplus){
                $scope.googleLogout();
            }

            $scope.showLoader('Logging you in...');
            quantimodoService.setLocalStorageItem('isWelcomed', true);
            $rootScope.isWelcomed = true;

            if($rootScope.isChromeApp){
                quantimodoService.chromeAppLogin(register);
            } else if ($rootScope.isChromeExtension) {
                quantimodoService.chromeExtensionLogin(register);
            } else if ($rootScope.isAndroid || $rootScope.isIOS || $rootScope.isWindows) {
                console.debug("$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform and using quantimodoService.nonNativeMobileLogin");
                quantimodoService.nonNativeMobileLogin(register);
            } else {
                console.debug("$scope.login: Not windows, android or is so assuming browser.");
                $scope.showLoader('Logging you in...');
                quantimodoService.browserLogin(register);
            }

            if($rootScope.user){
                $rootScope.hideNavigationMenu = false;
                quantimodoService.createDefaultReminders();
                console.debug($scope.controller_name + ".login: Got user and going to default state");
                quantimodoService.goToDefaultStateIfNoAfterLoginUrlOrState();
            }
        };

        $scope.nativeSocialLogin = function(provider, accessToken){
            quantimodoService.setLocalStorageItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            console.debug('$scope.nativeSocialLogin: Going to try to quantimodoService.getTokensAndUserViaNativeSocialLogin for ' +
                provider + ' provider');

            quantimodoService.getTokensAndUserViaNativeSocialLogin(provider, accessToken)
                .then(function(response){
                    console.debug('$scope.nativeSocialLogin: Response from quantimodoService.getTokensAndUserViaNativeSocialLogin:' +
                        JSON.stringify(response));

                    if(response.user){
                        $scope.hideLoader();
                        $rootScope.hideNavigationMenu = false;
                        quantimodoService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                        return;
                    }

                    var JWTToken = response.jwtToken;
                    console.debug("nativeSocialLogin: Mobile device detected and provider is " + provider + ". Got JWT token " + JWTToken);
                    var url = quantimodoService.generateV2OAuthUrl(JWTToken);

                    console.debug('nativeSocialLogin: open the auth window via inAppBrowser.');
                    var ref = cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');

                    console.debug('nativeSocialLogin: listen to event at ' + url + ' when the page changes.');
                    /*
                     $timeout(function () {
                     if(!$rootScope.user){
                     quantimodoService.reportError('Could not get user with url ' + url);
                     }
                     }, 30000);
                     */
                    ref.addEventListener('loadstart', function(event) {

                        console.debug('nativeSocialLogin: loadstart event is ' + JSON.stringify(event));
                        console.debug('nativeSocialLogin: check if changed url is the same as redirection url.');

                        if(quantimodoService.startsWith(event.url, quantimodoService.getRedirectUri())) {
                            if(!quantimodoService.getUrlParameter(event.url,'error')) {
                                var authorizationCode = quantimodoService.getAuthorizationCodeFromUrl(event);
                                console.debug('nativeSocialLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.');
                                ref.close();

                                var withJWT = true;
                                // get access token from authorization code
                                quantimodoService.fetchAccessTokenAndUserDetails(authorizationCode, withJWT);
                            } else {
                                var errorMessage = "nativeSocialLogin: error occurred: " + quantimodoService.getUrlParameter(event.url, 'error');
                                quantimodoService.reportError(errorMessage);
                                // close inAppBrowser
                                ref.close();
                                $scope.hideLoader();
                            }
                        }

                    });
                }, function(error){
                    $scope.hideLoader();
                    quantimodoService.reportError("quantimodoService.getTokensAndUserViaNativeSocialLogin error occurred! " +
                        "Couldn't generate JWT! Error response: " + JSON.stringify(error));
                });
        };

        $scope.googleLoginDebug = function () {
            var userData = '{"email":"m@thinkbynumbers.org","idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxMjg1OGI1YTZiNDQ3YmY4MDdjNTJkOGJjZGQyOGMwODJmZjc4MjYifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0ODM4MTM4MTcsImV4cCI6MTQ4MzgxNzQxNywiYXVkIjoiMTA1MjY0ODg1NTE5NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExODQ0NDY5MzE4NDgyOTU1NTM2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIxMDUyNjQ4ODU1MTk0LWVuMzg1amxua25iMzhtYThvbTI5NnBuZWozaTR0amFkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaGQiOiJ0aGlua2J5bnVtYmVycy5vcmciLCJlbWFpbCI6Im1AdGhpbmtieW51bWJlcnMub3JnIiwibmFtZSI6Ik1pa2UgU2lubiIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLUJIcjRoeVVXcVpVL0FBQUFBQUFBQUFJL0FBQUFBQUFFNkw0LzIxRHZnVC1UNVZNL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJNaWtlIiwiZmFtaWx5X25hbWUiOiJTaW5uIiwibG9jYWxlIjoiZW4ifQ.YiHQH3-mBCaFxi9BgXe52S2scgVbMQ_-bMWVYY3d8MJZegQI5rl0IvUr0RmYT1k5bIda1sN0qeRyGkbzBHc7f3uctgpXtzjd02flgl4fNHmRgJkRgK_ttTO6Upx9bRR0ItghS_okM2gjgDWwO5wceTNF1f46vEVFH72GAUHVR9Csh4qs9yjqK66vxOEKN4UqIE9JRSn58dgIW8s6CNlBHiLUChUy1nfd2U0zGQ_tmu90y_76vVw5AYDrHDDPQBJ5Z4K_arzjnVzjhKeHpgOaywS4S1ifrylGkpGt5L2iB9sfdA8tNR5iJcEvEuhzGohnd7HvIWyJJ2-BRHukNYQX4Q","serverAuthCode":"4/3xjhGuxUYJVTVPox8Knyp0xJSzMFteFMvNxdwO5H8jQ","userId":"118444693184829555362","displayName":"Mike Sinn","familyName":"Sinn","givenName":"Mike","imageUrl":"https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAE6L4/21DvgT-T5VM/s96-c/photo.jpg"}';
            quantimodoService.getTokensAndUserViaNativeGoogleLogin(JSON.parse(userData)).then(function (response) {
                $scope.hideLoader();
                console.debug('$scope.nativeSocialLogin: Response from quantimodoService.getTokensAndUserViaNativeSocialLogin:' +
                    JSON.stringify(response));
                quantimodoService.setUserInLocalStorageBugsnagIntercomPush(response.user);
            }, function (errorMessage) {
                $scope.hideLoader();
                quantimodoService.reportError("ERROR: googleLogin could not get userData!  Fallback to " +
                    "quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                var register = true;
                quantimodoService.nonNativeMobileLogin(register);
            });
        };

        $scope.googleLogin = function(register) {
            var debugMode = false;
            $scope.showLoader('Logging you in...');
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                //I get called when everything's ready for the plugin to be called!
                if(debugMode){
                    alert('Device is ready in googleLogin!');
                }
                console.debug('Device is ready in googleLogin!');
                window.plugins.googleplus.login({
                    'scopes': 'email https://www.googleapis.com/auth/fitness.activity.write https://www.googleapis.com/auth/fitness.body.write https://www.googleapis.com/auth/fitness.nutrition.write https://www.googleapis.com/auth/plus.login', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                    'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                    'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                }, function (userData) {
                    quantimodoService.getTokensAndUserViaNativeGoogleLogin(userData).then(function (response) {
                        $scope.hideLoader();
                        if(debugMode){
                            alert('$scope.nativeSocialLogin: Response from quantimodoService.getTokensAndUserViaNativeSocialLogin:' +
                                JSON.stringify(response));
                        }
                        console.debug('$scope.nativeSocialLogin: Response from quantimodoService.getTokensAndUserViaNativeSocialLogin:' +
                            JSON.stringify(response));
                        quantimodoService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                    }, function (errorMessage) {
                        $scope.hideLoader();
                        if(debugMode){
                            alert("ERROR: googleLogin could not get userData!  Fallback to " +
                                "quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                        }
                        quantimodoService.reportError("ERROR: googleLogin could not get userData!  Fallback to " +
                            "quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                        var register = true;
                        quantimodoService.nonNativeMobileLogin(register);
                    });
                }, function (errorMessage) {
                    $scope.hideLoader();
                    if(debugMode){
                        alert("ERROR: googleLogin could not get userData!  Fallback to " +
                            "quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                    }
                    quantimodoService.reportError("ERROR: googleLogin could not get userData!  Fallback to " +
                        "quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                    register = true;
                    quantimodoService.nonNativeMobileLogin(register);
                });
            }
        };

        $scope.googleLogout = function(){
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                /** @namespace window.plugins.googleplus */
                window.plugins.googleplus.logout(function (msg) {
                    console.debug("logged out of google!");
                }, function (fail) {
                    console.debug("failed to logout", fail);
                });

                window.plugins.googleplus.disconnect(
                    function (msg) {
                        console.debug("disconnect google!");
                    }
                );
            }
        };

        $scope.facebookLogin = function(){
            $scope.showLoader('Logging you in...');
            console.debug("$scope.facebookLogin about to try $cordovaFacebook.login");
            var $cordovaFacebook = {};
            if (($rootScope.isIOS || $rootScope.isAndroid) && $injector.has('$cordovaFacebook')) {
                console.debug('Injecting $cordovaFacebook');
                $cordovaFacebook = $injector.get('$cordovaFacebook');
            } else {
                console.debug("Could not inject $cordovaFacebook");
            }

            var seconds  = 30;
            $scope.hideFacebookButton = true; // Hide button so user tries other options if it didn't work
            console.debug('Setting facebookLogin timeout for ' + seconds + ' seconds');
            $timeout(function () {
                if(!$rootScope.user){
                    quantimodoService.reportError('Could not get user $scope.facebookLogin within 30 seconds! Falling back to non-native registration...');
                    var register = true;
                    quantimodoService.nonNativeMobileLogin(register);
                }
            }, seconds * 1000);

            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(response) {
                    console.debug("facebookLogin_success response->", JSON.stringify(response));
                    var accessToken = response.authResponse.accessToken;
                    if(!accessToken){
                        quantimodoService.reportError('ERROR: facebookLogin could not get accessToken! response: ' + JSON.stringify(response));
                        quantimodoService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                    }
                    $scope.nativeSocialLogin('facebook', accessToken);
                }, function (error) {
                    Bugsnag.notify("ERROR: facebookLogin could not get accessToken!  ", JSON.stringify(error), {}, "error");
                    console.debug("facebook login error"+ JSON.stringify(error));
                });
        };

        $rootScope.trackLocationChange = function(trackLocation, skipPopup) {
            if(trackLocation !== null){
                $rootScope.trackLocation = trackLocation;
            }
            console.debug('trackLocation', $rootScope.trackLocation);
            $rootScope.user.trackLocation = $rootScope.trackLocation;
            quantimodoService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
            if($rootScope.user && $rootScope.user.trackLocation){
                console.debug('Going to execute quantimodoService.backgroundGeolocationInit if $ionicPlatform.ready');
                $ionicPlatform.ready(function() { //For Ionic
                    quantimodoService.backgroundGeolocationInit();
                });
            }
            if($rootScope.trackLocation && !skipPopup){
                $ionicPopup.alert({
                    title: 'Location Tracking Enabled',
                    template: 'Location tracking is an experimental feature.  Your location is automatically logged ' +
                    'when you open the app. Your location is not logged when the ' +
                    'app is closed so you should create reminder and open the app regularly to ' +
                    'keep your location up to date.'
                });
                quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();
            }

            if(!$rootScope.trackLocation) {
                quantimodoService.backgroundGeolocationStop();
                console.debug("Do not track location");
            }

        };

        $scope.$on('$stateChangeSuccess', function() {
            if($rootScope.offlineConnectionErrorShowing){
                $rootScope.offlineConnectionErrorShowing = false;
            }
            $scope.closeMenu();
        });

        $scope.showAlert = function(title, template, subTitle) {
            quantimodoService.showAlert(title, template, subTitle);
        };

        if(!$scope.subscriptionPlanId){
            $scope.subscriptionPlanId = 'monthly7';
        }

        $scope.monthlySubscription = function () {
            $scope.subscriptionPlanId = 'yearly60';
            $scope.upgrade();
        };

        $scope.yearlySubscription = function () {
            $scope.subscriptionPlanId = 'yearly60';
            $scope.upgrade();
        };

        var mobilePurchaseDebug = false;

        $scope.upgrade = function () {
            if($rootScope.isMobile || mobilePurchaseDebug){
                mobileUpgrade();
            } else {
                webUpgrade();
            }
        };

        var webUpgrade = function() {
            var myPopup;
            $scope.currentYear = new Date().getFullYear();
            $scope.currentMonth = new Date().getMonth() + 1;
            $scope.months = $locale.DATETIME_FORMATS.MONTH;
            $scope.ccinfo = {type:undefined};
            $scope.popupSubtitle = '';

            myPopup = $ionicPopup.show({
                templateUrl: 'templates/credit-card.html',
                title: 'Select Plan',
                subTitle: $scope.popupSubtitle,
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.ccinfo.securityCode) {
                                $scope.showAlert('Please enter security code');
                                e.preventDefault();
                            } else if (!$scope.ccinfo.number) {
                                $scope.showAlert('Please enter card number');
                                e.preventDefault();
                            } else {
                                return $scope.ccinfo;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function(result) {
                if(!result){
                    return;
                }
                var body = {
                    "card_number": $scope.ccinfo.number,
                    "card_month": $scope.ccinfo.month,
                    "card_year": $scope.ccinfo.year,
                    "card_cvc": $scope.ccinfo.securityCode,
                    'plan': $scope.subscriptionPlanId,
                    'coupon': $scope.coupon
                };

                $ionicLoading.show();

                quantimodoService.postCreditCardDeferred(body).then(function (response) {
                    $ionicLoading.hide();
                    console.debug(JSON.stringify(response));
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title('Thank you!')
                            .textContent("Now you can forever enjoy all the great features of QuantiModo Premium!")
                            .ariaLabel('Alert Dialog Demo')
                            .ok('Get Started')
                    )
                    .finally(function() {
                        $state.go(config.appSettings.defaultState);
                    });
                }, function (error) {
                    $ionicLoading.hide();
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title('Error')
                            .textContent(JSON.stringify(error))
                            .ariaLabel('Alert Dialog Demo')
                            .ok('Get Started')
                    );
                    console.debug(JSON.stringify(error));
                });
            });
        };

        var purchaseDebugMode = false;
        function DialogController($scope, $mdDialog) {
            $scope.subscriptionPlanId = 'monthly7';
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.subscribe = function(answer) {
                $mdDialog.hide(answer);
            };
        }

        var mobileUpgrade = function (ev) {
            if (!window.inAppPurchase && !mobilePurchaseDebug) {
                console.error('inAppPurchase not available');
                webUpgrade();
                return;
            }

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/fragments/select-subscription-plan-fragment.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function(answer) {
                if(purchaseDebugMode){
                    alert('About to call makeInAppPurchase for ' + answer);
                }
                makeInAppPurchase(answer);
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
        };

        var makeInAppPurchase = function (productName) {

            if(purchaseDebugMode){
                alert('Called makeInAppPurchase for ' + productName);
            }
            $ionicLoading.show();
            if($rootScope.isIOS){
                productName = config.appSettings.lowercaseAppName + '_' + productName;
            }
            inAppPurchase
                .getProducts([productName])
                .then(function (products) {
                    console.debug('Available Products: ' + JSON.stringify(products));
                    if(purchaseDebugMode){
                        alert('Available Products: ' + JSON.stringify(products));
                    }
                    /*
                     [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                     */
                    if(purchaseDebugMode){
                        alert('About to subscribe to ' + JSON.stringify(productName));
                    }
                    inAppPurchase
                        .subscribe(productName)
                        .then(function (data) {
                            $ionicLoading.hide();
                            quantimodoService.reportError("User subscribed to " + productName + ": " +
                                JSON.stringify(data));
                            /*
                             {
                             transactionId: ...
                             receipt: ...
                             signature: ...
                             }
                             */
                            var subscriptionProvider = 'unknown';
                            if($rootScope.isAndroid){
                                subscriptionProvider = 'google';
                            }
                            if($rootScope.isIOS){
                                subscriptionProvider = 'apple';
                            }
                            quantimodoService.updateUserSettingsDeferred({
                                subscriptionProvider: subscriptionProvider,
                                stripePlan: productName,
                                trialEndsAt: moment().add(14, 'days').toISOString()
                            });
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                    .clickOutsideToClose(true)
                                    .title('Thank you!')
                                    .textContent("Now you can forever enjoy all the great features of QuantiModo Premium!")
                                    .ariaLabel('Alert Dialog Demo')
                                    .ok('Get Started')
                            ).finally(function() {
                                $scope.goBack();
                            });
                        })
                        .catch(function (err) {
                            $ionicLoading.hide();
                            quantimodoService.reportError(JSON.stringify(err));
                        });
                })
                .catch(function (err) {
                    $ionicLoading.hide();
                    quantimodoService.reportError("couldn't get product " + productName + ": " + JSON.stringify(err));
                });
        };

        var webDowngrade = function() {
            $ionicLoading.show();
            quantimodoService.postUnsubscribeDeferred().then(function (response) {
                $ionicLoading.hide();
                console.debug(JSON.stringify(response));
                $scope.showAlert('Successfully downgraded to QuantiModo Lite');
            }, function (error) {
                $ionicLoading.hide();
                $scope.showAlert('An error occurred while downgrading.  Please email mike@quantimo.do');
                console.debug(JSON.stringify(error));
            });
        };

        var androidDowngrade = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Google Play',
                template: "You subscribed through Google Play so I have to send you to a page that tells you how to " +
                    "unsubscribe from Play subscriptions"
            });

            confirmPopup.then(function(res) {
                if(res) {
                    window.open("https://support.google.com/googleplay/answer/7018481", '_system', 'location=yes');
                    quantimodoService.postUnsubscribeDeferred().then(function (response) {
                        console.debug(JSON.stringify(response));
                    }, function (error) {
                        console.error(JSON.stringify(error));
                    });
                } else {
                    console.log('You are not sure');
                }
            });
        };

        var appleDowngrade = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'App Store',
                template: "You subscribed through the App Store so I have to send you to a page that tells you how to " +
                "unsubscribe from App Store subscriptions"
            });

            confirmPopup.then(function(res) {
                if(res) {
                    window.open("https://support.apple.com/en-us/HT202039", '_system', 'location=yes');
                    //quantimodoService.updateUserSettingsDeferred({subscriptionProvider: null});
                    quantimodoService.postUnsubscribeDeferred().then(function (response) {
                        console.debug(JSON.stringify(response));
                    }, function (error) {
                        console.error(JSON.stringify(error));
                    });

                } else {
                    console.log('You are not sure');
                }
            });
        };

        var googleDowngradeDebug = false;
        $scope.downgrade = function () {
            if ($rootScope.user.subscriptionProvider === 'google' || googleDowngradeDebug) {
                androidDowngrade();
            } else if ($rootScope.user.subscriptionProvider === 'apple') {
                appleDowngrade();
            } else {
                webDowngrade();
            }
        };
        var last = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };

        $scope.toastPosition = angular.extend({},{
            bottom: true,
            top: false,
            left: true,
            right: false
        });

        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition)
                .filter(function(pos) { return $scope.toastPosition[pos]; })
                .join(' ');
        };

        $scope.showUndoToast = function(lastAction) {
            var toast = $mdToast.simple()
                .textContent(lastAction)
                .action('UNDO')
                .highlightAction(true)
                .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                .hideDelay(10000)
                .position($scope.getToastPosition());

            $mdToast.show(toast).then(function(response) {
                if ( response === 'ok' ) {
                    //alert('You clicked the \'UNDO\' action.');
                    $rootScope.undoInboxAction();
                }
            });
        };

        $scope.showInfoToast = function(text) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .position($scope.getToastPosition())
                    .hideDelay(3000)
            );
        };

        $scope.init();

        var VariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter,
                 quantimodoService, $q, $log) {

            var self = this;

            self.simulateQuery = true;
            self.isDisabled    = false;

            // list of `state` value/display objects
            self.variables        = loadAll();
            self.querySearch   = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange   = searchTextChange;

            self.variableObject = $rootScope.variableObject;

            self.newVariable = newVariable;

            self.cancel = function($event) {
                $mdDialog.cancel();
            };

            self.finish = function($event) {
                var variableData = {
                    parentVariableId: $rootScope.variableObject.id,
                    joinedVariableId: self.selectedItem.variable.id,
                    conversionFactor: 1
                };
                $ionicLoading.show();
                quantimodoService.postVariableJoinDeferred(variableData).then(function (response) {
                    $ionicLoading.hide();
                    $rootScope.variableObject = response.userVariable;
                    quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('userVariables',
                        response.userVariable);
                }, function (error) {
                    $ionicLoading.hide();
                    console.error(error);
                });

                $mdDialog.hide();
            };

            function newVariable(variable) {
                alert("Sorry! You'll need to create a Constitution for " + variable + " first!");
            }

            function querySearch (query) {
                var results = query ? self.variables.filter( createFilterFor(query) ) : self.variables,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    results = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables'));
                    if(results && results.length){
                        results = loadAll(results).filter(createFilterFor(query));
                        if(results && results.length){
                            deferred.resolve(results);
                            return deferred.promise;
                        }
                    }

                    quantimodoService.searchUserVariablesDeferred(query, {defaultUnitId:
                        $rootScope.variableObject.defaultUnitId})
                        .then(function(results){
                            deferred.resolve(loadAll(results));
                        });
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            function searchTextChange(text) {
                $log.info('Text changed to ' + text);
            }

            function selectedItemChange(item) {
                self.selectedItem = item;
                $log.info('Item changed to ' + JSON.stringify(item));
            }

            /**
             * Build `variables` list of key/value pairs
             */
            function loadAll(variables, filters) {
                if(!variables){
                    variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables'));
                }

                if(variables){
                    variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId));
                }

                if(variables){
                    variables = variables.filter(excludeParentVariable());
                }

                return variables.map( function (variable) {
                    return {
                        value: variable.name.toLowerCase(),
                        display: variable.name,
                        variable: variable
                    };
                });
            }

            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(item) {
                    return (item.value.indexOf(lowercaseQuery) !== -1);
                };
            }

            /**
             * Create filter function for a query string
             */
            function filterByProperty(filterPropertyName, allowedFilterValue) {
                return function filterFn(item) {
                    return (item[filterPropertyName] === allowedFilterValue);
                };
            }

            /**
             * Create filter function for a query string
             */
            function excludeParentVariable() {
                return function filterFn(item) {
                    return (item.id !== $rootScope.variableObject.id);
                };
            }
        };
    });
