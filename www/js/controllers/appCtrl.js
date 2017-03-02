angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                    $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector,
                                    quantimodoService, ionicDatePicker, $cordovaOauth, clipboard,
                                    $ionicActionSheet, Analytics,
                                    //$ionicDeploy,
                                    $locale, $mdDialog, $mdToast) {

	    console.debug('Starting AppCtrl');

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
        $rootScope.numberOfPendingNotifications = null;
        $scope.showReminderSubMenu = false;
        $scope.primaryOutcomeVariableDetails = config.appSettings.primaryOutcomeVariableDetails;
        $rootScope.appDisplayName = config.appSettings.appDisplayName;
        $rootScope.favoritesOrderParameter = 'numberOfRawMeasurements';

        if(!$rootScope.user){
            $rootScope.user = JSON.parse(quantimodoService.getLocalStorageItemAsString('user'));
        }

        if($rootScope.user && !$rootScope.user.trackLocation){
            $rootScope.user.trackLocation = false;
        }

        if(!$rootScope.user){
            quantimodoService.refreshUser().then(function(){
                $scope.syncEverything();
            }, function(error){
                console.error('AppCtrl.init could not refresh user because ' + JSON.stringify(error));
            });
        }

        quantimodoService.getAccessTokenFromUrlParameter();
        quantimodoService.backgroundGeolocationInit();
        quantimodoService.setupBugsnag();
        quantimodoService.getUserAndSetupGoogleAnalytics();

        if(!window.private_keys) {
            console.error('Please add private config file to www/private_configs folder!  Contact mike@quantimo.do if you need help');
        }
        if($rootScope.urlParameters.refreshUser){
            quantimodoService.clearLocalStorage();
            window.localStorage.introSeen = true;
            window.localStorage.onboarded = true;
            $rootScope.user = null;
            $rootScope.refreshUser = false;
        }

        if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
            $rootScope.hideNavigationMenu = true;
        }

        if($rootScope.user){
            quantimodoService.getUserVariablesDeferred();  // For getting the new chartsUrl links
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

        $scope.$on('$ionicView.loaded', function(){
            console.debug('appCtrl loaded in state ' + $state.current.name);
            // This event will only happen once per view being created. If a view is cached but not active, this event
            // will not fire again on a subsequent viewing.
        });

        $scope.$on('$ionicView.beforeEnter', function (e) {
            console.debug('appCtrl beforeEnter in state ' + $state.current.name);

        });

        // when view is changed
        $scope.$on('$ionicView.enter', function (e) {
            console.debug('appCtrl enter in state ' + $state.current.name);
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
            console.debug('appCtrl afterEnter in state ' + $state.current.name);

        });

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
                $state.go('app.variableSettings', {variableObject: correlationObject.causeVariable});
            } else {
                $state.go('app.variableSettings', {variableName: correlationObject.causeVariableName});
            }
        };

        $scope.goToVariableSettingsForEffectVariable = function(correlationObject) {
            if(correlationObject.effectVariable){
                $state.go('app.variableSettings', {variableObject: correlationObject.effectVariable});
            } else {
                $state.go('app.variableSettings', {variableName: correlationObject.effectVariableName});
            }
        };

        $scope.openUrl = function(url){
            if(typeof cordova !== "undefined"){
                cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
            } else {
                window.open(url,'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');
            }
        };

        $scope.shareCharts = function(variableObject, sharingUrl){
            if(!variableObject.shareUserMeasurements){
                showShareVariableConfirmation(variableObject, sharingUrl);
                return;
            }
            quantimodoService.openSharingUrl(sharingUrl);
        };

        $scope.shareStudy = function(correlationObject, sharingUrl){
            if(sharingUrl.indexOf('userId') !== -1 && !correlationObject.shareUserMeasurements){
                showShareStudyConfirmation(correlationObject, sharingUrl);
                return;
            }
            quantimodoService.openSharingUrl(sharingUrl);
        };

        var showShareStudyConfirmation = function(correlationObject, sharingUrl) {
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
                        if(sharingUrl){
                            quantimodoService.openSharingUrl(sharingUrl);
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

        var showUnshareStudyConfirmation = function(correlationObject) {
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
                showUnshareStudyConfirmation(correlationObject);
            }
        };

        var showShareVariableConfirmation = function(variableObject, sharingUrl) {
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
                        quantimodoService.openSharingUrl(sharingUrl);
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

        var showUnshareVariableConfirmation = function(variableObject) {
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
                showShareVariableConfirmation(variableObject);
            } else {
                showUnshareVariableConfirmation(variableObject);
            }
        };

        $rootScope.setLocalStorageFlagTrue = function (flagName) {
            console.debug('Set ' + flagName + ' to true');
            $rootScope[flagName] = true;
            quantimodoService.setLocalStorageItem(flagName, true);
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


        $scope.showHelpInfoPopup = function (ev, id) {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title(quantimodoService.helpInfo[id].title)
                    .textContent(quantimodoService.helpInfo[id].textContent)
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                    .targetEvent(ev)
            );
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
                userTaggedVariableObject: $rootScope.variableObject
            });
        };

        $scope.tagAnotherVariable = function () {
            $state.go('app.tageeSearch',  {
                fromState: $state.current.name,
                userTagVariableObject: $rootScope.variableObject
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
                $rootScope.onboardingPages[0].addButtonText = "Add Another";
                $rootScope.onboardingPages[0].nextPageButtonText = "All Done";
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

            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderSyncQueue', trackingReminder)
                .then(function() {
                    // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                    $state.go(doneState,
                        {
                            trackingReminder: trackingReminder,
                            fromState: $state.current.name,
                            fromUrl: window.location.href
                        }
                    );
                    quantimodoService.syncTrackingReminders();
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
                    quantimodoService.syncTrackingReminders();
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

        /*Wrapper Config*/
        $scope.primaryOutcomeVariableName = config.appSettings.primaryOutcomeVariableDetails.name;
        $scope.positiveRatingOptions = quantimodoService.getPositiveRatingOptions();
        $scope.negativeRatingOptions = quantimodoService.getNegativeRatingOptions();
        $scope.numericRatingOptions = quantimodoService.getNumericRatingOptions();
        $scope.welcomeText = config.appSettings.welcomeText;
        $scope.primaryOutcomeVariableTrackingQuestion = config.appSettings.primaryOutcomeVariableTrackingQuestion;
        $scope.primaryOutcomeVariableAverageText = config.appSettings.primaryOutcomeVariableAverageText;
        /*Wrapper Config End*/

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

        $scope.editTag = function(userTagVariable){
            $state.go('app.tagAdd', {
                tagConversionFactor: userTagVariable.tagConversionFactor,
                userTaggedVariableObject: $rootScope.variableObject,
                fromState: $state.current.name,
                userTagVariableObject: userTagVariable
            });
        };

        $scope.editTagged = function(userTaggedVariable){
            $state.go('app.tagAdd', {
                tagConversionFactor: userTaggedVariable.tagConversionFactor,
                userTaggedVariableObject: userTaggedVariable,
                fromState: $state.current.name,
                userTagVariableObject: $rootScope.variableObject
            });
        };

        $scope.$on('getFavoriteTrackingRemindersFromLocalStorage', function(){
            quantimodoService.getFavoriteTrackingRemindersFromLocalStorage($rootScope.variableCategoryName);
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
                    quantimodoService.syncTrackingReminders();
                }
                quantimodoService.getUserVariablesDeferred();
                quantimodoService.getCommonVariablesDeferred();
                quantimodoService.getUnits();
                $rootScope.syncedEverything = true;
                quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();
            }
        };

        $scope.onTextClick = function ($event) {
            console.debug("Auto selecting text so the user doesn't have to press backspace...");
            $event.target.select();
        };

        $scope.favoriteValidationFailure = function (message) {
            $scope.showMaterialAlert(message);
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

            if(trackingReminder.abbreviatedUnitName !== '/5') {
                if(trackingReminder.combinationOperation === "SUM"){
                    trackingReminder.total = trackingReminder.total + modifiedReminderValue;
                } else {
                    trackingReminder.total = modifiedReminderValue;
                }
                trackingReminder.displayTotal = trackingReminder.total + " " + trackingReminder.abbreviatedUnitName;
            } else {
                trackingReminder.displayTotal = modifiedReminderValue + '/5';
            }

            if(!trackingReminder.tally){
                trackingReminder.tally = 0;
            }

            if(trackingReminder.combinationOperation === "SUM"){
                trackingReminder.tally += modifiedReminderValue;
            } else {
                trackingReminder.tally = modifiedReminderValue;
            }

            console.debug('modified tally is ' + trackingReminder.tally);

            console.debug('Setting trackByFavorite timeout');
            $timeout(function() {
                if(typeof trackingReminder === "undefined"){
                    console.error("$rootScope.favoritesTally[trackingReminder.id] is undefined so we can't send tally in favorite controller. Not sure how this is happening.");
                    return;
                }
                if(trackingReminder.tally) {
                    quantimodoService.postMeasurementByReminder(trackingReminder, trackingReminder.tally)
                        .then(function () {
                            console.debug("Successfully quantimodoService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
                        }, function(error) {
                            if (typeof Bugsnag !== "undefined") {
                                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                            }
                            console.error(error);
                            console.error('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
                        });
                    trackingReminder.tally = 0;
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
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            var body = {
                variableId: variableObject.id,
                durationOfAction: variableObject.durationOfActionInHours*60*60,
                fillingValue: variableObject.fillingValue,
                //joinWith
                maximumAllowedValue: variableObject.maximumAllowedValue,
                minimumAllowedValue: variableObject.minimumAllowedValue,
                onsetDelay: variableObject.onsetDelayInHours*60*60,
                combinationOperation: variableObject.combinationOperation,
                shareUserMeasurements: variableObject.shareUserMeasurements,
                defaultUnitId: variableObject.defaultUnitId
                //userVariableAlias: $scope.state.userVariableAlias
                //experimentStartTime
                //experimentEndTime
            };

            quantimodoService.postUserVariableDeferred(body).then(function() {
                $ionicLoading.hide();
                $scope.showInfoToast('Saved ' + variableObject.name + ' settings');
                $scope.goBack();  // Temporary workaround to make tests pass
            }, function(error) {
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $scope.goBack = function () {
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
            quantimodoService.resetUserVariableDeferred(variableObject.id).then(function(userVariable) {
                $rootScope.variableObject = userVariable;
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

        $rootScope.sendChromeEmailLink = function(){
            var subjectLine = "Install%20the%20" + config.appSettings.appDisplayName + "%20Chrome%20Browser%20Extension";
            var linkToChromeExtension = config.appSettings.linkToChromeExtension;
            var emailBody = "Did%20you%20know%20that%20you%20can%20easily%20track%20everything%20on%20your%20laptop%20and%20desktop%20with%20our%20Google%20Chrome%20browser%20extension%3F%20%20Your%20data%20is%20synced%20between%20devices%20so%20you%27ll%20never%20have%20to%20track%20twice!%0A%0ADownload%20it%20here!%0A%0A" + encodeURIComponent(linkToChromeExtension)  + "%0A%0ALove%2C%20%0AYou";
            var fallbackUrl = null;
            var emailAddress = $rootScope.user.email;
            if($rootScope.isMobile){
                quantimodoService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
            } else {
                quantimodoService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
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

        var errorHandler = function(error){
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
        };

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

        $scope.connectWeather = function () {
            $scope.data = {};

            var myPopup = $ionicPopup.show({
                template: '<label class="item item-input">' +
                '<i class="icon ion-location placeholder-icon"></i>' +
                '<input type="text" placeholder="Zip Code or City, Country" ng-model="data.location"></label>',
                title: 'Weather',
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
                connectWithParams(params, 'worldweatheronline');
                $scope.showInfoToast('Weather logging activated');
                console.debug('Entered zip code. Result: ', res);
            });
        };

        $scope.connect = function(connector){

            var scopes;
            var myPopup;
            var options;
            connector.loadingText = 'Connecting...';

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

            if(connector.name === 'github') {

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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

                if($rootScope.isWeb || $rootScope.isChromeExtension){
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
                    .then(function(result) { connectWithToken(result);
                    }, function(error) { errorHandler(error); });
            }

            if(connector.name === 'worldweatheronline') {
                $scope.connectWeather();
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
                    var params = { username: $scope.data.username };
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
                    var params = { username: $scope.data.username, password: $scope.data.password };
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
                    var params = { username: $scope.data.username, password: $scope.data.password };
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
                    var params = { email: $scope.data.email };
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
                    var params = { username: $scope.data.username, password: $scope.data.password };
                    connectWithParams(params, connector.name);
                });
            }
        };

        $scope.disconnect = function (connector){
            connector.loadingText = 'Disconnecting...';
            quantimodoService.disconnectConnectorDeferred(connector.name).then(function (){ $scope.refreshConnectors();
            }, function() { console.error("error disconnecting " + connector.name); });
        };

        $scope.getItHere = function (connector){ window.open(connector.getItUrl, '_blank'); };

        var webConnect = function (connector) {
            var url = connector.connectInstructions.url;
            console.debug('targetUrl is ',  url);
            var ref = window.open(url,'', "width=600,height=800");
            console.debug('Opened ' + url);
        };

        $rootScope.trackLocationChange = function(event, trackLocation) {
            if(trackLocation !== null && typeof trackLocation !== "undefined"){
                $rootScope.user.trackLocation = trackLocation;
            }
            console.debug('trackLocation', $rootScope.user.trackLocation);
            quantimodoService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
            if($rootScope.user && $rootScope.user.trackLocation){
                console.debug('Going to execute quantimodoService.backgroundGeolocationInit if $ionicPlatform.ready');
                quantimodoService.backgroundGeolocationInit();
            }
            if($rootScope.user.trackLocation){
                $scope.showInfoToast('Location tracking enabled');
                quantimodoService.updateLocationVariablesAndPostMeasurementIfChanged();
            }
            if(!$rootScope.user.trackLocation) {
                $scope.showInfoToast('Location tracking disabled');
                quantimodoService.backgroundGeolocationStop();
                console.debug("Do not track location");
            }
        };

        $scope.$on('$stateChangeSuccess', function() {
            if($rootScope.offlineConnectionErrorShowing){$rootScope.offlineConnectionErrorShowing = false;}
            $scope.closeMenu();
        });

        $scope.showAlert = function(title, template, subTitle) {
            quantimodoService.showAlert(title, template, subTitle);
        };

        $scope.showMaterialAlert = function(title, textContent, ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title(title)
                    .textContent(textContent)
                    .ariaLabel(title)
                    .ok('OK')
                    .targetEvent(ev)
            );
        };

        if(!$scope.productId){ $scope.productId = 'monthly7'; }
        $scope.monthlySubscription = function () { $scope.productId = 'yearly60'; $scope.upgrade(); };
        $scope.yearlySubscription = function () { $scope.productId = 'yearly60';  $scope.upgrade(); };
        var mobilePurchaseDebug = false;
        $scope.upgrade = function (ev) {
            if($rootScope.isMobile || mobilePurchaseDebug){  mobileUpgrade(ev);
            } else { webUpgrade(ev); }
        };

        var webUpgrade = function(ev) {

            $mdDialog.show({
                controller: WebUpgradeDialogController,
                templateUrl: 'templates/fragments/web-upgrade-dialog-fragment.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function(answer) {

                var body = {
                    "card_number": answer.creditCardInfo.cardNumber,
                    "card_month": answer.creditCardInfo.month,
                    "card_year": answer.creditCardInfo.year,
                    "card_cvc": answer.creditCardInfo.securityCode,
                    'productId': answer.productId,
                    'coupon': answer.coupon
                };

                quantimodoService.recordUpgradeProductPurchase(answer.productId, null, 1);
                $ionicLoading.show();
                quantimodoService.postCreditCardDeferred(body).then(function (response) {
                    $ionicLoading.hide();
                    console.debug(JSON.stringify(response));
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title('Thank you!')
                            .textContent("Let's get started!")
                            .ariaLabel('OK!')
                            .ok('Get Started')
                    ).finally(function() {
                        $scope.goBack();
                        quantimodoService.recordUpgradeProductPurchase(answer.productId, response.data.purchaseId, 2);
                    });
                }, function (response) {
                    quantimodoService.reportError(response);
                    var message = '';
                    if(response.error){ message = response.error; }
                    $ionicLoading.hide();
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title('Could not upgrade')
                            .textContent(message + '  Please try again or contact mike@quantimo.do for help.')
                            .ariaLabel('Error')
                            .ok('OK')
                    );
                });
            }, function() {  $scope.status = 'You cancelled the dialog.'; });
        };

        var purchaseDebugMode = false;
        function WebUpgradeDialogController($scope, $mdDialog) {
            $scope.productId = 'monthly7';
            var currentYear = new Date().getFullYear();
            $scope.creditCardInfo = { year: null };
            $scope.months = $locale.DATETIME_FORMATS.MONTH;
            $scope.years = [];
            for(var i = 0; i < 13; i++){  $scope.years.push(currentYear + i); }
            $scope.hide = function() { $mdDialog.hide(); };
            $scope.cancel = function() {
                quantimodoService.reportError('User cancelled upgrade!  What happened?');
                $mdDialog.cancel();
            };
            $scope.webSubscribe = function(productId, coupon, creditCardInfo, event) {
                if (!creditCardInfo.securityCode) { quantimodoService.reportError('Please enter card number'); return;}
                if (!creditCardInfo.cardNumber) {quantimodoService.reportError('Please enter card number'); return; }
                if (!creditCardInfo.month) { quantimodoService.reportError('Please enter card month'); return; }
                if (!creditCardInfo.year) { quantimodoService.reportError('Please enter card year'); return; }
                var answer = { productId: productId, coupon: coupon, creditCardInfo: creditCardInfo };
                $mdDialog.hide(answer);
            };
        }

        function MobileUpgradeDialogController($scope, $mdDialog) {
            console.debug('$scope.productId is ' + $scope.productId);
            $scope.productId = 'monthly7';
            $scope.hide = function(){$mdDialog.hide();};
            $scope.cancel = function() {
                quantimodoService.reportError('User cancelled upgrade!  What happened?');
                $mdDialog.cancel();
            };
            $scope.subscribe = function(answer) {$mdDialog.hide(answer);};
        }

        var mobileUpgrade = function (ev) {
            if (!window.inAppPurchase && !mobilePurchaseDebug) {
                console.error('inAppPurchase not available');
                webUpgrade(ev);
                return;
            }

            $mdDialog.show({
                controller: MobileUpgradeDialogController,
                templateUrl: 'templates/fragments/select-subscription-plan-fragment.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false
            }).then(function(baseProductId) {
                //makeInAppPurchase(baseProductId);
                getProductsAndMakeInAppPurchase(baseProductId);
            }, function() {
                quantimodoService.reportError('User cancelled mobileUpgrade subscription selection');
                $scope.status = 'You cancelled the dialog.';
            });
        };

        function getSubscriptionProvider() {
            var subscriptionProvider = 'unknown';
            if($rootScope.isAndroid){ subscriptionProvider = 'google';}
            if($rootScope.isIOS){subscriptionProvider = 'apple';}
            return subscriptionProvider;
        }

        function getProductId(baseProductId) {
            if($rootScope.isIOS){ return config.appSettings.lowercaseAppName + '_' + baseProductId; }
            return baseProductId;
        }

        var upgradeCompletePopup = $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title( 'Thank you!')
                .textContent( "Let's get started!")
                .ariaLabel('Alert Dialog Demo')
                .ok('OK!')
        ).finally(function() {
            $scope.goBack();
            $rootScope.user.stripeActive = true;
        });

        function makeInAppPurchase(baseProductId) {
            $ionicLoading.show();
            inAppPurchase.subscribe(getProductId(baseProductId))
                .then(function (data) {
                    quantimodoService.reportError('inAppPurchase.subscribe response: ' + JSON.stringify(data));
                    $ionicLoading.hide();
                    upgradeCompletePopup();
                    quantimodoService.reportError("User subscribed to " + getProductId(baseProductId) + ": " + JSON.stringify(data));
                    quantimodoService.updateUserSettingsDeferred({
                        subscriptionProvider: getSubscriptionProvider(),
                        productId: getProductId(baseProductId),
                        trialEndsAt: moment().add(14, 'days').toISOString()
                        //coupon: answer.coupon
                    }).then(function (response) {
                        quantimodoService.recordUpgradeProductPurchase(baseProductId, response.data.purchaseId, 2);
                    });
                    $rootScope.user.stripeActive = true;
                }).catch(function (error) {
                    $ionicLoading.hide();
                    $mdDialog.show(
                        $mdDialog.alert()
                            .parent(angular.element(document.querySelector('#popupContainer')))
                            .clickOutsideToClose(true)
                            .title( error.errorMessage )
                            .textContent("Please try again or contact mike@quantimo.do with Error Code: " +
                                error.errorCode + ", Error Message: " + error.errorMessage + ", Product ID: " +
                                getProductId(baseProductId))
                            .ariaLabel(error.errorMessage)
                            .ok('OK')
                    ).finally(function() {});
                    quantimodoService.reportError('inAppPurchase.catch error ' + JSON.stringify(error));
                });
        }

        var getProductsAndMakeInAppPurchase = function (baseProductId) {
            if(purchaseDebugMode){
                alert('Called makeInAppPurchase for ' + getProductId(baseProductId));
                quantimodoService.updateUserSettingsDeferred({
                    subscriptionProvider: getSubscriptionProvider(),
                    productId: getProductId(baseProductId),
                    trialEndsAt: moment().add(14, 'days').toISOString()
                    //coupon: answer.coupon
                });
            }
            $ionicLoading.show();
            //quantimodoService.recordUpgradeProductPurchase(baseProductId, null, 1);
            inAppPurchase
                .getProducts([getProductId(baseProductId)])
                .then(function (products) {
                    quantimodoService.reportError('inAppPurchase.getProducts response: ' + JSON.stringify(products));
                    if(purchaseDebugMode){alert('Available Products: ' + JSON.stringify(products));}
                     //[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                    makeInAppPurchase(baseProductId);
                }).catch(function (err) {
                    $ionicLoading.hide();
                    quantimodoService.reportError("couldn't get product " + getProductId(baseProductId) + ": " + JSON.stringify(err));
                });
        };

        var webDowngrade = function() {
            $ionicLoading.show();
            quantimodoService.postDowngradeSubscriptionDeferred().then(function (response) {
                $ionicLoading.hide();
                console.debug(JSON.stringify(response));
                $scope.showMaterialAlert('Successfully downgraded to QuantiModo Lite');
            }, function (error) {
                $ionicLoading.hide();
                $scope.showMaterialAlert('An error occurred while downgrading.', 'Please email mike@quantimo.do');
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
                    quantimodoService.postDowngradeSubscriptionDeferred().then(function (response) {
                        console.debug(JSON.stringify(response));
                    }, function (error) { console.error(JSON.stringify(error)); });
                    window.open("https://support.google.com/googleplay/answer/7018481", '_blank', 'location=yes');
                } else { console.log('You are not sure'); }
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
                    $rootScope.user.stripeActive = false;
                    quantimodoService.postDowngradeSubscriptionDeferred().then(function (response) {
                        console.debug(JSON.stringify(response));
                    }, function (error) { console.error(JSON.stringify(error)); });
                    window.open("https://support.apple.com/en-us/HT202039", '_blank', 'location=yes');
                } else { console.log('You are not sure'); }
            });
        };

        var googleDowngradeDebug = false;
        $scope.downgrade = function () {
            if ($rootScope.user.subscriptionProvider === 'google' || googleDowngradeDebug) { androidDowngrade();
            } else if ($rootScope.user.subscriptionProvider === 'apple') { appleDowngrade();
            } else { webDowngrade(); }
        };

        var last = {bottom: true, top: false, left: true, right: false };
        $scope.toastPosition = angular.extend({},{ bottom: true, top: false, left: true, right: false });
        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition).filter(function(pos) { return $scope.toastPosition[pos]; }).join(' ');
        };

        var undoInboxAction = function(){
            var notificationsSyncQueue = quantimodoService.getLocalStorageItemAsObject('notificationsSyncQueue');
            if(!notificationsSyncQueue){ return false; }
            notificationsSyncQueue[0].hide = false;
            quantimodoService.addToOrReplaceElementOfLocalStorageItemByIdOrMoveToFront('trackingReminderNotifications',
                notificationsSyncQueue[0]);
            quantimodoService.deleteElementsOfLocalStorageItemByProperty('notificationsSyncQueue',
                'trackingReminderNotificationId', notificationsSyncQueue[0].trackingReminderNotificationId);
            $rootScope.$broadcast('getTrackingReminderNotificationsFromLocalStorage');
        };

        $scope.showUndoToast = function(lastAction) {
            var toast = $mdToast.simple()
                .textContent(lastAction)
                .action('UNDO')
                .highlightAction(true)
                .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                .hideDelay(10000)
                .position($scope.getToastPosition());
            $mdToast.show(toast).then(function(response) {  if ( response === 'ok' ) { undoInboxAction(); } });
        };

        $scope.showInfoToast = function(text) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
                    .position($scope.getToastPosition())
                    .hideDelay(3000)
            );
        };

        $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
        $scope.copyChartsUrlToClipboard = function () {
            $scope.copyLinkText = 'Copied!';
            clipboard.copyText($rootScope.variableObject.chartsUrl);
            $scope.showInfoToast('Copied link!');
        };

        var verifyEmailAddressAndExecuteCallback = function (callback) {
            if($rootScope.user.email || $rootScope.user.userEmail){
                callback();
                return;
            }
            $scope.updateEmailAndExecuteCallback(callback);
        };

        var sendCouponEmail = function () {
            quantimodoService.sendEmailViaAPIDeferred('couponInstructions');
            $scope.showMaterialAlert('Coupon Redemption', 'Please go check your email at ' +  $rootScope.user.email +
                ' for instructions to redeem your coupon.', event);
        };

        $scope.sendCouponEmail = function() { verifyEmailAddressAndExecuteCallback(sendCouponEmail); };

        $scope.updateEmailAndExecuteCallback = function (callback) {
            if($rootScope.user.email){ $scope.data = { email: $rootScope.user.email }; }
            var myPopup = $ionicPopup.show({
                template: '<label class="item item-input">' +
                '<i class="icon ion-email placeholder-icon"></i>' +
                '<input type="email" placeholder="Email" ng-model="data.email"></label>',
                title: 'Update Email',
                subTitle: 'Enter Your Email Address',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.email) {
                                //don't allow the user to close unless he enters email
                                e.preventDefault();
                            } else {
                                return $scope.data;
                            }
                        }
                    }
                ]
            });

            myPopup.then(function(res) {
                quantimodoService.updateUserSettingsDeferred({email: $scope.data.email});
                $rootScope.user.email = $scope.data.email;
                if(callback){ callback(); }
            });
        };

    });
