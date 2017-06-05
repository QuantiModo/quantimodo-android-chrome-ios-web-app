angular.module('starter')// Parent Controller - This controller runs before every one else
.controller('AppCtrl', function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector, quantimodoService,
                                ionicDatePicker, $cordovaOauth, clipboard, $ionicActionSheet, Analytics, //$ionicDeploy,
                                $locale, $mdDialog, $mdToast, wikipediaFactory, appSettingsResponse) {

    $scope.controller_name = "AppCtrl";
    quantimodoService.initializeApplication(appSettingsResponse);
    $rootScope.numberOfPendingNotifications = null;
    quantimodoService.removeAppStorageIdentifiers();
    $scope.primaryOutcomeVariableDetails = quantimodoService.getPrimaryOutcomeVariable();
    $rootScope.favoritesOrderParameter = 'numberOfRawMeasurements';
    $scope.$on('$ionicView.enter', function (e) {
        console.debug('appCtrl enter in state ' + $state.current.name);
        //$scope.showHelpInfoPopupIfNecessary(e);
        if (e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackPrimaryOutcomeCtrl") {
            $scope.showCalendarButton = true;
        } else { $scope.showCalendarButton = false; }
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
            e.targetScope.controller_name === "PredictorsCtrl" ||
            e.targetScope.controller_name === "historyAllMeasurementsCtrl"
        ) { $scope.showMoreMenuButton = true;
        } else { $scope.showMoreMenuButton = false; }
    });
    $scope.closeMenu = function () { $ionicSideMenuDelegate.toggleLeft(false); };
    $scope.$watch(function () { return $ionicSideMenuDelegate.getOpenRatio();
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
        /** @namespace correlationObject.causeVariable */
        if(correlationObject.causeVariable){ $state.go('app.variableSettings', {variableObject: correlationObject.causeVariable, variableName: correlationObject.causeVariableName});
        } else { $state.go('app.variableSettings', {variableName: correlationObject.causeVariableName}); }
    };
    $scope.goToVariableSettingsForEffectVariable = function(correlationObject) {
        /** @namespace correlationObject.effectVariable */
        if(correlationObject.effectVariable){ $state.go('app.variableSettings', {variableObject: correlationObject.effectVariable, variableName: correlationObject.effectVariableName});
        } else { $state.go('app.variableSettings', {variableName: correlationObject.effectVariableName}); }
    };
    $scope.openUrl = function(url){
        if(typeof cordova !== "undefined"){ cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
        } else { window.open(url,'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes'); }
    };
    $scope.shareCharts = function(variableObject, sharingUrl, ev){
        if(!variableObject.shareUserMeasurements){
            showShareVariableConfirmation(variableObject, sharingUrl, ev);
            return;
        }
        quantimodoService.openSharingUrl(sharingUrl);
    };
    $scope.shareStudy = function(correlationObject, sharingUrl, ev){
        if(sharingUrl.indexOf('userId') !== -1 && !correlationObject.shareUserMeasurements){
            showShareStudyConfirmation(correlationObject, sharingUrl, ev);
            return;
        }
        quantimodoService.openSharingUrl(sharingUrl);
    };
    $scope.openSharingUrl = function(sharingUrl){ quantimodoService.openSharingUrl(sharingUrl); };
    $scope.openStudyLinkFacebook = function (predictorVariableName, outcomeVariableName) {
        quantimodoService.openSharingUrl(quantimodoService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkFacebook);
    };
    $scope.openStudyLinkTwitter = function (predictorVariableName, outcomeVariableName) {
        quantimodoService.openSharingUrl(quantimodoService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkTwitter);
    };
    $scope.openStudyLinkGoogle = function (predictorVariableName, outcomeVariableName) {
        quantimodoService.openSharingUrl(quantimodoService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkGoogle);
    };
    $scope.openStudyLinkEmail = function (predictorVariableName, outcomeVariableName) {
        quantimodoService.openSharingUrl(quantimodoService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkEmail);
    };
    var showShareStudyConfirmation = function(correlationObject, sharingUrl, ev) {
        var title = 'Share Study';
        var textContent = 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
                ' and ' + correlationObject.effectVariableName + ' measurements publicly visible? You can make them private again at any time on this study page.';
        function yesCallback() {
                correlationObject.shareUserMeasurements = true;
                quantimodoService.setLocalStorageItem('lastStudy', JSON.stringify(correlationObject));
                var body = {causeVariableId: correlationObject.causeVariableId, effectVariableId: correlationObject.effectVariableId, shareUserMeasurements: true};
                quantimodoService.showBlackRingLoader();
                quantimodoService.postStudyDeferred(body).then(function () {
                    quantimodoService.hideLoader();
                    if(sharingUrl){quantimodoService.openSharingUrl(sharingUrl);}
                }, function (error) {
                    quantimodoService.hideLoader();
                    console.error(error);
                });
        }
        function noCallback() {correlationObject.shareUserMeasurements = false;}
        quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    var showUnshareStudyConfirmation = function(correlationObject, ev) {
        var title = 'Share Study';
        var textContent = 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
            ' and ' + correlationObject.effectVariableName + ' measurements private? Links to studies your ' +
            'previously shared with these variables will no longer work.';
        function yesCallback() {
            correlationObject.shareUserMeasurements = false;
            var body = {causeVariableId: correlationObject.causeVariableId, effectVariableId: correlationObject.effectVariableId, shareUserMeasurements: false};
            quantimodoService.postStudyDeferred(body);
        }
        function noCallback() {correlationObject.shareUserMeasurements = true;}
        quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    $scope.toggleStudyShare = function (correlationObject, ev) {
        if(correlationObject.shareUserMeasurements){showShareStudyConfirmation(correlationObject, ev);} else {showUnshareStudyConfirmation(correlationObject, ev);}
    };
    var showShareVariableConfirmation = function(variableObject, sharingUrl, ev) {
        var title = 'Share Variable';
        var textContent = 'Are you absolutely sure you want to make your ' + variableObject.name +
            ' measurements publicly visible? You can make them private again at any time on this page.';
        function yesCallback() {
            variableObject.shareUserMeasurements = true;
            var body = {variableId: variableObject.id, shareUserMeasurements: true};
            quantimodoService.showBlackRingLoader();
            quantimodoService.postUserVariableDeferred(body).then(function () {
                quantimodoService.hideLoader();
                quantimodoService.openSharingUrl(sharingUrl);
            }, function (error) {
                quantimodoService.hideLoader();
                console.error(error);
            });
        }
        function noCallback() {variableObject.shareUserMeasurements = false;}
        quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    var showUnshareVariableConfirmation = function(variableObject, ev) {
        var title = 'Share Variable';
        var textContent = 'Are you absolutely sure you want to make your ' + variableObject.name +
            ' and ' + variableObject.name + ' measurements private? Links to studies you ' +
            'previously shared with this variable will no longer work.';
        function yesCallback() {
            variableObject.shareUserMeasurements = false;
            var body = {variableId: variableObject.id, shareUserMeasurements: false};
            quantimodoService.postUserVariableDeferred(body).then(function () {}, function (error) {console.error(error);});
        }
        function noCallback() {variableObject.shareUserMeasurements = true;}
        quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    $scope.toggleVariableShare = function (variableObject, ev) {
        if(variableObject.shareUserMeasurements){showShareVariableConfirmation(variableObject, ev);} else {showUnshareVariableConfirmation(variableObject, ev);}
    };
    $rootScope.setLocalStorageFlagTrue = function (flagName) {
        console.debug('Set ' + flagName + ' to true');
        $rootScope[flagName] = true;
        quantimodoService.setLocalStorageItem(flagName, true);
    };
    // open datepicker for "from" date
    $scope.openFromDatePicker = function () {ionicDatePicker.openDatePicker($scope.fromDatePickerObj);};
    // open datepicker for "to" date
    $scope.openToDatePicker = function () {ionicDatePicker.openDatePicker($scope.toDatePickerObj);};
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
    $scope.showHelpInfoPopup = function (explanationId, ev) {
        quantimodoService.showMaterialAlert(quantimodoService.explanations[explanationId].title, quantimodoService.explanations[explanationId].textContent);
    };
    $scope.tagAnotherVariable = function () {
        $state.go('app.tageeSearch',  {fromState: $state.current.name, userTagVariableObject: $rootScope.variableObject});
    };
    $scope.goToChartsPageForVariableObject = function (variableObject) {
        $state.go('app.charts', {variableObject: variableObject});
    };
    $scope.closeMenuIfNeeded = function (menuItem) {
        menuItem.showSubMenu = !menuItem.showSubMenu;
        if (menuItem.click) { $scope[menuItem.click] && $scope[menuItem.click](); } else if (!menuItem.subMenu) { $scope.closeMenu();}
    };
    /*Wrapper Config*/
    $scope.positiveRatingOptions = quantimodoService.getPositiveRatingOptions();
    $scope.negativeRatingOptions = quantimodoService.getNegativeRatingOptions();
    $scope.numericRatingOptions = quantimodoService.getNumericRatingOptions();
    $scope.welcomeText = config.appSettings.welcomeText;
    /*Wrapper Config End*/


/*
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
            if(config.appSettings.additionalSettings.ionicAppId){
                $ionicCloudProvider.init({
                        "core": {
                            "app_id": config.appSettings.additionalSettings.ionicAppId
                        }
                });
            } else {
                console.warn('Cannot initialize $ionicCloudProvider because appSettings.additionalSettings.ionicAppId is not set');
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
            $scope.showSyncDisplayText(message);
            $ionicDeploy.check().then(function(snapshotAvailable) {
                if (snapshotAvailable) {
                    message = 'Downloading ' + releaseTrack + ' update...';
                    console.debug(message);
                    if($rootScope.isAndroid){
                        $scope.showSyncDisplayText(message);
                    }
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    // When snapshotAvailable is true, you can apply the snapshot
                    $ionicDeploy.download().then(function() {
                        message = 'Downloaded new version.  Extracting...';
                        console.debug(message);
                        if($rootScope.isAndroid){
                            $scope.showSyncDisplayText(message);
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
                        $scope.showSyncDisplayText(message);
                    }
                    console.debug(message);
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                }
            });
            $timeout(function () {
                $scope.hideSyncDisplayText();
            }, 60 * 1000);

        });

    };

    $scope.autoUpdateApp();
*/
    $ionicPopover.fromTemplateUrl('templates/popover.html', {scope: $scope}).then(function (popover) {$scope.popover = popover;});
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

    $scope.saveInterval = function(primaryOutcomeRatingFrequencyDescription){
        if(primaryOutcomeRatingFrequencyDescription){$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;}
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
            variableId: quantimodoService.getPrimaryOutcomeVariable().id,
            defaultValue: 3
        };
        quantimodoService.addToTrackingReminderSyncQueue(reminderToSchedule);
        $scope.showIntervalCard = false;
    };
    $scope.downVote = function(correlationObject, $index, ev){
        if (correlationObject.correlationCoefficient > 0) {$scope.increasesDecreases = "increases";} else {$scope.increasesDecreases = "decreases";}
        var title, textContent, yesCallback, noCallback;
        if (correlationObject.userVote !== 0) {
            title = 'Implausible relationship?';
            textContent =  'Do you think is is IMPOSSIBLE that ' + correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '?';
            yesCallback = function() {
                correlationObject.userVote = 0;
                correlationObject.vote = 0;
                quantimodoService.postVoteDeferred(correlationObject).then(function () {console.debug('Down voted!');}, function () {console.error('Down vote failed!');});
            };
            noCallback = function() {};
            quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        } else {
            title = 'Delete Downvote';
            textContent = 'You previously voted that it is IMPOSSIBLE that ' + correlationObject.causeVariableName +
                ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '. Do you want to delete this down vote?';
            yesCallback = function() {deleteVote(correlationObject, $index);};
            noCallback = function () {};
            quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        }
    };
    $scope.upVote = function(correlationObject, $index, ev){
        if (correlationObject.correlationCoefficient > 0) {$scope.increasesDecreases = "increases";} else {$scope.increasesDecreases = "decreases";}
        var title, textContent, yesCallback, noCallback;
        if (correlationObject.userVote !== 1) {
            title = 'Plausible relationship?';
            textContent = 'Do you think it is POSSIBLE that '+ correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '?';
            yesCallback = function() {
                correlationObject.userVote = 1;
                correlationObject.vote = 1;
                quantimodoService.postVoteDeferred(correlationObject).then(function () {console.debug('upVote');}, function () {console.error('upVote failed!');});
            };
            noCallback = function () {};
            quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        } else {
            title = 'Delete Upvote';
            textContent = 'You previously voted that it is POSSIBLE that '+ correlationObject.causeVariableName +
                ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '. Do you want to delete this up vote?';
            yesCallback = function() {deleteVote(correlationObject, $index);};
            noCallback = function () {};
            quantimodoService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
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
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {fn();}
        } else {this.$apply(fn);}
    };
    $scope.showSyncDisplayText = function (loadingText) {
        $rootScope.isSyncing = true;
        $rootScope.syncDisplayText = loadingText;
        if(!loadingText){loadingText = '';}
        $scope.loading = true;
        var seconds = 30;
        console.debug('Setting showLoader timeout for ' + seconds + ' seconds.  loadingText is ' + loadingText);
        $timeout(function () {$scope.hideSyncDisplayText();}, seconds * 1000);
    };
    $scope.hideSyncDisplayText = function () {
        $rootScope.isSyncing = false;
        $rootScope.syncDisplayText = '';
        $scope.loading = false;
        quantimodoService.hideLoader();
    };
    $scope.onTextClick = function ($event) {
        console.debug("Auto selecting text so the user doesn't have to press backspace...");
        $event.target.select();
    };
    $scope.favoriteValidationFailure = function (message) {
        quantimodoService.showMaterialAlert('Whoops!', message);
        console.error(message);
        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
    };
    $scope.trackFavoriteByValueField = function(trackingReminder, $index){
        if(trackingReminder.total === null){
            $scope.favoriteValidationFailure('Please specify a value for ' + trackingReminder.variableName);
            return;
        }
        trackingReminder.displayTotal = "Recorded " + (trackingReminder.total + " " + trackingReminder.unitAbbreviatedName).replace(' /', '/');
        quantimodoService.postMeasurementByReminder(trackingReminder, trackingReminder.total)
            .then(function () {
                console.debug("Successfully quantimodoService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
            }, function(error) {
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                console.error(error);
                console.error('Failed to track favorite! ', 'Please let me know by pressing the help button.  Thanks!');
            });
    };
    $scope.trackByFavorite = function(trackingReminder, modifiedReminderValue){
        if(!modifiedReminderValue){modifiedReminderValue = trackingReminder.defaultValue;}
        if(trackingReminder.unitAbbreviatedName !== '/5') {
            if(trackingReminder.combinationOperation === "SUM"){trackingReminder.total = trackingReminder.total + modifiedReminderValue;} else {trackingReminder.total = modifiedReminderValue;}
            trackingReminder.displayTotal = "Recorded " + (trackingReminder.total + " " + trackingReminder.unitAbbreviatedName).replace(' /', '/');
        } else {trackingReminder.displayTotal = "Recorded " + modifiedReminderValue + '/5';}
        if(!trackingReminder.tally){trackingReminder.tally = 0;}
        if(trackingReminder.combinationOperation === "SUM"){trackingReminder.tally += modifiedReminderValue;} else {trackingReminder.tally = modifiedReminderValue;}
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
                        if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
                        console.error(error);
                        console.error('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
                    });
                trackingReminder.tally = 0;
            }
        }, 2000);
    };
    // Triggered on a button click, or some other target
    $scope.showFavoriteActionSheet = function(favorite, $index, bloodPressure) {
        var variableObject = {id: favorite.variableId, name: favorite.variableName};
        var actionMenuButtons = [
            { text: '<i class="icon ion-gear-a"></i>Edit' },
            { text: '<i class="icon ion-edit"></i>Other Value/Time/Note' },
            quantimodoService.actionSheetButtons.charts,
            quantimodoService.actionSheetButtons.history,
            quantimodoService.actionSheetButtons.analysisSettings
        ];
        /** @namespace config.appSettings.favoritesController */
        if(config.appSettings.favoritesController && config.appSettings.favoritesController.actionMenuButtons){
            actionMenuButtons = config.appSettings.favoritesController.actionMenuButtons;
        }
        if(bloodPressure){actionMenuButtons = [];}
        var hideSheet = $ionicActionSheet.show({
            buttons: actionMenuButtons,
            destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {console.debug('CANCELLED');},
            buttonClicked: function(index) {
                console.debug('BUTTON CLICKED', index);
                if(index === 0){$state.go('app.reminderAdd', {reminder: favorite});}
                if(index === 1){$state.go('app.measurementAdd', {trackingReminder: favorite});}
                if(index === 2){$state.go('app.charts', {trackingReminder: favorite, fromState: $state.current.name, fromUrl: window.location.href});}
                if(index === 3){$state.go('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
                if(index === 4){$state.go('app.variableSettings', {variableName: favorite.variableName});}
                return true;
            },
            destructiveButtonClicked: function() {
                favorite.hide = true;
                quantimodoService.deleteTrackingReminderDeferred(favorite);
            }
        });
        $timeout(function() {hideSheet();}, 20000);
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
    $scope.showExplanationsPopup = function(settingName, ev) {
        quantimodoService.showMaterialAlert(quantimodoService.explanations[settingName].title, quantimodoService.explanations[settingName].explanation, ev);
    };
    $scope.saveVariableSettings = function(variableObject){
        quantimodoService.showBlackRingLoader();
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
            defaultUnitId: variableObject.userVariableDefaultUnitId,
            userVariableVariableCategoryName: variableObject.userVariableVariableCategoryName,
            //userVariableAlias: $scope.state.userVariableAlias
            experimentStartTimeString: (variableObject.experimentStartTimeString) ? variableObject.experimentStartTimeString.toString() : null,
            experimentEndTimeString: (variableObject.experimentEndTimeString) ? variableObject.experimentEndTimeString.toString() : null,
        };
        quantimodoService.postUserVariableDeferred(body).then(function(userVariable) {
            quantimodoService.hideLoader();
            $scope.showInfoToast('Saved ' + variableObject.name + ' settings');
            $scope.goBack({variableObject: userVariable});  // Temporary workaround to make tests pass
        }, function(error) {
            quantimodoService.hideLoader();
            console.error(error);
        });
    };
    $scope.goBack = function (stateParams) {
        if($ionicHistory.viewHistory().backView){
            var backView = $ionicHistory.backView();
            var stateId = backView.stateName;
            if(stateId.toLowerCase().indexOf('search') !== -1){ // Skip search pages
                $ionicHistory.goBack(-2);
                //$state.go(config.appSettings.appDesign.defaultState, stateParams);
                return;
            }
            if(stateParams){
                for (var key in stateParams) {
                    if (stateParams[key] && stateParams[key] !== "") { stateId += "_" + key + "=" + stateParams[key]; }
                }
                backView.stateParams = stateParams;
                backView.stateId = stateId;
            }
            $ionicHistory.goBack();
        } else {
            $state.go(config.appSettings.appDesign.defaultState, stateParams);
        }
    };
    $scope.setupVariableByVariableObject = function(variableObject) {
        $rootScope.variableName = variableObject.name;
        $rootScope.variableObject = variableObject;
    };
    $scope.getUserVariableByName = function (variableName, refresh, hideLoader) {
        if(!variableName){
            quantimodoService.reportErrorDeferred('No variable name provided to $scope.getUserVariableByName');
            return;
        }
        if($rootScope.variableObject && $rootScope.variableObject.name !== variableName){ $rootScope.variableObject = null; }
        if(!hideLoader){ quantimodoService.showBlackRingLoader(); }
        var params = {includeTags : true};
        quantimodoService.getUserVariableByNameFromLocalStorageOrApiDeferred(variableName, params, refresh).then(function(variableObject){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            quantimodoService.hideLoader();
            $rootScope.variableObject = variableObject;
            //quantimodoService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
            $scope.setupVariableByVariableObject(variableObject);
        }, function (error) {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            quantimodoService.hideLoader();
            console.error(error);
        });
    };
    $scope.refreshUserVariable = function (hideLoader) {
        var refresh = true;
        if($rootScope.variableObject){ $rootScope.variableName = $rootScope.variableObject.name; }
        $scope.getUserVariableByName($rootScope.variableName, refresh, hideLoader);
    };
    $scope.resetVariableToDefaultSettings = function(variableObject) {
        // Populate fields with original settings for variable
        quantimodoService.showBlackRingLoader();
        quantimodoService.resetUserVariableDeferred(variableObject.id).then(function(userVariable) {
            $rootScope.variableObject = userVariable;
            //quantimodoService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
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
        var linkToChromeExtension = config.appSettings.additionalSettings.downloadLinks.chromeExtension;
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

        connectWithParams({}, 'worldweatheronline');
        //
        // $scope.data = {};
        // var myPopup = $ionicPopup.show({
        //     template: '<label class="item item-input">' +
        //     '<i class="icon ion-location placeholder-icon"></i>' +
        //     '<input type="text" placeholder="Zip Code or City, Country" ng-model="data.location"></label>',
        //     title: 'Weather',
        //     subTitle: 'Enter Your Zip Code or City, Country/State',
        //     scope: $scope,
        //     buttons: [
        //         { text: 'Cancel' },
        //         {
        //             text: '<b>Save</b>',
        //             type: 'button-positive',
        //             onTap: function(e) {
        //                 if (!$scope.data.location) {
        //                     //don't allow the user to close unless he enters wifi password
        //                     e.preventDefault();
        //                 } else {
        //                     return $scope.data.location;
        //                 }
        //             }
        //         }
        //     ]
        // });
        // myPopup.then(function(res) {
        //     var params = {location: String($scope.data.location)};
        //     connectWithParams(params, 'worldweatheronline');
        //     $scope.showInfoToast('Weather logging activated');
        //     console.debug('Entered zip code. Result: ', res);
        // });
    };
    $scope.connect = function(connector){
        var scopes;
        var myPopup;
        var options;
        //connector.loadingText = 'Connecting...'; // TODO: Show Connecting... text again once we figure out how to update after connection is completed
        connector.loadingText = null;
        connector.connecting = true;
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
                scopes).then(function(result) {connectWithToken(result);}, function(error) {errorHandler(error);});
        }
        if(connector.name === 'withings') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            $cordovaOauth.withings(window.private_keys.WITHINGS_CLIENT_ID, window.private_keys.WITHINGS_CLIENT_SECRET)
                .then(function(result) {connectWithToken(result);}, function(error) {errorHandler(error);});
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
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {errorHandler(error);});
        }
        if(connector.name === 'runkeeper') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = [];
            options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.fitbit(window.private_keys.RUNKEEPER_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {errorHandler(error);});
        }
        if(connector.name === 'rescuetime') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['time_data', 'category_data', 'productivity_data'];
            options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.rescuetime(window.private_keys.RESCUETIME_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {errorHandler(error);});
        }
        if(connector.name === 'slice') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = [];
            options = {redirect_uri: quantimodoService.getApiUrl() + '/api/v1/connectors/' + connector.name + '/connect'};
            $cordovaOauth.slice(window.private_keys.SLICE_CLIENT_ID, scopes, options)
                .then(function(authorizationCode) {connectWithAuthCode(authorizationCode, connector);}, function(error) {errorHandler(error);});
        }
        if(connector.name === 'facebook') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = ['user_likes', 'user_posts'];
            $cordovaOauth.facebook(window.private_keys.FACEBOOK_APP_ID, scopes)
                .then(function(result) {connectWithToken(result);}, function(error) {errorHandler(error);});
        }
        function connectGoogle(connector, scopes) {
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                window.plugins.googleplus.login({
                    'scopes': scopes, // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                    'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                    'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                }, function (response) {
                    console.debug('window.plugins.googleplus.login response:' + JSON.stringify(response));
                    connectWithAuthCode(response.serverAuthCode, connector);
                }, function (errorMessage) {
                    quantimodoService.reportErrorDeferred("ERROR: googleLogin could not get userData!  Fallback to quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                });
            }
        }
        if(connector.name === 'googlefit') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.nutrition.read https://www.googleapis.com/auth/fitness.location.read';
            connectGoogle(connector, scopes);
        }
        if(connector.name === 'googlecalendar') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes =  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";
            connectGoogle(connector, scopes);
        }
        if(connector.name === 'sleepcloud') {
            if($rootScope.isWeb || $rootScope.isChromeExtension){
                webConnect(connector);
                return;
            }
            scopes =  "https://www.googleapis.com/auth/userinfo.email";
            connectGoogle(connector, scopes);
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
                            } else {return $scope.data.username;}
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
                            } else {return $scope.data;}
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
                            } else {return $scope.data;}
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
                            } else {return $scope.data;}
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
                            } else {return $scope.data;}
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
        connector.loadingText = 'Disconnected';
        quantimodoService.disconnectConnectorDeferred(connector.name).then(function (){ $scope.refreshConnectors();
        }, function() { console.error("error disconnecting " + connector.name); });
    };
    $scope.getItHere = function (connector){ window.open(connector.getItUrl, '_blank'); };
    var webConnect = function (connector) {
        /** @namespace connector.connectInstructions */
        var url = connector.connectInstructions.url;
        console.debug('targetUrl is ',  url);
        var ref = window.open(url,'', "width=600,height=800");
        console.debug('Opened ' + url);
    };
    $scope.trackLocationChange = function(event, trackLocation) {
        if(trackLocation !== null && typeof trackLocation !== "undefined"){$rootScope.user.trackLocation = trackLocation;}
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
    $scope.showMaterialAlert = function(title, textContent, ev) {
        quantimodoService.showMaterialAlert(title, textContent, ev);
    };
    if(!$scope.productId){ $scope.productId = 'monthly7'; }
    $scope.monthlySubscription = function () { $scope.productId = 'yearly60'; $scope.upgrade(); };
    $scope.yearlySubscription = function () { $scope.productId = 'yearly60';  $scope.upgrade(); };
    var mobilePurchaseDebug = false;
    $scope.upgrade = function (ev) {
        if($rootScope.isMobile || mobilePurchaseDebug){  mobileUpgrade(ev);} else { webUpgrade(ev); }
    };
    var webUpgrade = function(ev) {
        quantimodoService.reportErrorDeferred('User clicked upgrade button');
        $mdDialog.show({
            controller: WebUpgradeDialogController,
            templateUrl: 'templates/fragments/web-upgrade-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false
        }).then(function(answer) {
            quantimodoService.reportErrorDeferred('User submitted credit card info');
            var body = {
                "card_number": answer.creditCardInfo.cardNumber,
                "card_month": answer.creditCardInfo.month,
                "card_year": answer.creditCardInfo.year,
                "card_cvc": answer.creditCardInfo.securityCode,
                'productId': answer.productId,
                'coupon': answer.coupon
            };
            quantimodoService.recordUpgradeProductPurchase(answer.productId, null, 1);
            quantimodoService.showBlackRingLoader();
            quantimodoService.postCreditCardDeferred(body).then(function (response) {
                quantimodoService.reportErrorDeferred('Got successful upgrade response from API');
                quantimodoService.hideLoader();
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
                    /** @namespace response.data.purchaseId */
                    quantimodoService.recordUpgradeProductPurchase(answer.productId, response.data.purchaseId, 2);
                });
            }, function (response) {
                quantimodoService.reportErrorDeferred(response);
                var message = '';
                if(response.error){ message = response.error; }
                quantimodoService.hideLoader();
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
            quantimodoService.reportErrorDeferred('User cancelled upgrade!  What happened?');
            $mdDialog.cancel();
        };
        $scope.webSubscribe = function(productId, coupon, creditCardInfo, event) {
            if (!creditCardInfo.securityCode) { quantimodoService.reportErrorDeferred('Please enter card number'); return;}
            if (!creditCardInfo.cardNumber) {quantimodoService.reportErrorDeferred('Please enter card number'); return; }
            if (!creditCardInfo.month) { quantimodoService.reportErrorDeferred('Please enter card month'); return; }
            if (!creditCardInfo.year) { quantimodoService.reportErrorDeferred('Please enter card year'); return; }
            var answer = { productId: productId, coupon: coupon, creditCardInfo: creditCardInfo };
            $mdDialog.hide(answer);
        };
    }
    function MobileUpgradeDialogController($scope, $mdDialog) {
        console.debug('$scope.productId is ' + $scope.productId);
        $scope.productId = 'monthly7';
        $scope.hide = function(){$mdDialog.hide();};
        $scope.cancel = function() {
            quantimodoService.reportErrorDeferred('User cancelled upgrade!  What happened?');
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
            //makeInAppPurchase(baseProductId);  // iOS requires us to get products first or we get "unknown product id" error
            getProductsAndMakeInAppPurchase(baseProductId);
        }, function() {
            quantimodoService.reportErrorDeferred('User cancelled mobileUpgrade subscription selection');
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
        if($rootScope.isIOS){ return config.appSettings.clientId + '_' + baseProductId; }
        return baseProductId;
    }
    function handleSubscribeResponse(baseProductId, data) {
        quantimodoService.reportErrorDeferred('inAppPurchase.subscribe response: ' + JSON.stringify(data));
        quantimodoService.hideLoader();
        var alert;
        function showSuccessAlert() {
            alert = $mdDialog.alert({  title: 'Thank you!', textContent: "Let's get started!", ok: 'OK' });
            $mdDialog.show( alert )
                .finally(function() {
                    $scope.goBack();
                    $rootScope.user.stripeActive = true;
                    alert = undefined;
                });
        }
        showSuccessAlert();
        quantimodoService.reportErrorDeferred("User subscribed to " + getProductId(baseProductId) + ": " + JSON.stringify(data));
        quantimodoService.updateUserSettingsDeferred({
            subscriptionProvider: getSubscriptionProvider(),
            productId: getProductId(baseProductId),
            trialEndsAt: moment().add(14, 'days').toISOString()
            //coupon: answer.coupon
        }).then(function (response) {quantimodoService.recordUpgradeProductPurchase(baseProductId, response.data.purchaseId, 2);});
        $rootScope.user.stripeActive = true;
    }
    function makeInAppPurchase(baseProductId) {
        quantimodoService.showBlackRingLoader();
        var getReceipt = false;
        inAppPurchase.subscribe(getProductId(baseProductId))
            .then(function (data) {
                if(getReceipt){
                    inAppPurchase.getReceipt()
                        .then(function (receipt) {
                            quantimodoService.reportErrorDeferred('inAppPurchase.getReceipt response: ' + JSON.stringify(receipt));
                            console.debug("inAppPurchase.getReceipt " + receipt);
                        }).catch(function (error) { quantimodoService.reportErrorDeferred('inAppPurchase.getReceipt error response: ' + JSON.stringify(error)); });
                }
                handleSubscribeResponse(baseProductId, data);
            }).catch(function (error) {
                quantimodoService.hideLoader();
                var alert;
                function showErrorAlert() {
                    alert = $mdDialog.alert({ title: error.errorMessage,
                        textContent: "Please try again or contact mike@quantimo.do with Error Code: " + error.errorCode + ", Error Message: " + error.errorMessage + ", Product ID: " + getProductId(baseProductId),
                        ok: 'OK' });
                    $mdDialog.show(alert).finally(function() { alert = undefined; });
                }
                if($rootScope.isIOS){ showErrorAlert(); } // We want to alert the Apple Reviews about their stupid errors
                if($rootScope.isAndroid){ handleSubscribeResponse(baseProductId, error); } // Sometimes Android has an error message even though it actually succeeds
                quantimodoService.reportErrorDeferred('inAppPurchase.catch error ' + JSON.stringify(error));
            });
    }
    var getProductsAndMakeInAppPurchase = function (baseProductId) {
        if(purchaseDebugMode){
            alert('Called makeInAppPurchase for ' + getProductId(baseProductId));
            quantimodoService.updateUserSettingsDeferred({ subscriptionProvider: getSubscriptionProvider(), productId: getProductId(baseProductId), trialEndsAt: moment().add(14, 'days').toISOString() });
        }
        quantimodoService.showBlackRingLoader();
        //quantimodoService.recordUpgradeProductPurchase(baseProductId, null, 1);
        inAppPurchase
            .getProducts([getProductId(baseProductId)])
            .then(function (products) {
                quantimodoService.reportErrorDeferred('inAppPurchase.getProducts response: ' + JSON.stringify(products));
                if(purchaseDebugMode){alert('Available Products: ' + JSON.stringify(products));}
                 //[{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
                makeInAppPurchase(baseProductId);
            }).catch(function (err) {
                quantimodoService.hideLoader();
                quantimodoService.reportErrorDeferred("couldn't get product " + getProductId(baseProductId) + ": " + JSON.stringify(err));
            });
    };
    var webDowngrade = function() {
        quantimodoService.showBlackRingLoader();
        quantimodoService.postDowngradeSubscriptionDeferred().then(function (response) {
            quantimodoService.hideLoader();
            console.debug(JSON.stringify(response));
            quantimodoService.showMaterialAlert('Downgraded', 'Successfully downgraded to QuantiModo Lite');
        }, function (error) {
            quantimodoService.hideLoader();
            quantimodoService.showMaterialAlert('Error', 'An error occurred while downgrading. Please email mike@quantimo.do');
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
        var confirmPopup = $ionicPopup.confirm({title: 'App Store',
            template: "You subscribed through the App Store so I have to send you to a page that tells you how to unsubscribe from App Store subscriptions"});
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
    var toastPosition = angular.extend({},{ bottom: true, top: false, left: true, right: false });
    var getToastPosition = function() {return Object.keys(toastPosition).filter(function(pos) { return toastPosition[pos]; }).join(' ');};
    $scope.showInfoToast = function(text) {$mdToast.show($mdToast.simple().textContent(text).position(getToastPosition()).hideDelay(3000));};
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyChartsUrlToClipboard = function () {
        $scope.copyLinkText = 'Copied!';
        /** @namespace $rootScope.variableObject.chartsUrl */
        clipboard.copyText($rootScope.variableObject.chartsLinkStatic);
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
        quantimodoService.showMaterialAlert('Coupon Redemption', 'Please go check your email at ' +  $rootScope.user.email + ' for instructions to redeem your coupon.', event);
    };
    var sendFitbitEmail = function () {
        quantimodoService.sendEmailViaAPIDeferred('fitbit');
        quantimodoService.showMaterialAlert('Get Fitbit', 'Please check your email at ' +  $rootScope.user.email + ' for instructions to get and connect Fitbit.', event);
    };
    var sendChromeEmail = function () {
        quantimodoService.sendEmailViaAPIDeferred('chrome');
        quantimodoService.showMaterialAlert('Get the Chrome Extension', 'Please check your email at ' +  $rootScope.user.email + ' for your link.', event);
    };
    $scope.sendEmailAfterVerification = function(emailType) {
        if(emailType === 'couponInstructions'){ verifyEmailAddressAndExecuteCallback(sendCouponEmail); }
        if(emailType === 'fitbit'){ verifyEmailAddressAndExecuteCallback(sendFitbitEmail); }
        if(emailType === 'chrome'){ verifyEmailAddressAndExecuteCallback(sendChromeEmail); }
    };
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
    var SelectVariableDialogController = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log, dataToPass) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dataToPass.title;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.newVariable = newVariable;
        self.cancel = function() {
            self.items = null;
            $mdDialog.cancel();
        };
        self.finish = function() {
            self.items = null;
            $mdDialog.hide($scope.variable);
        };
        function newVariable(variable) {alert("Sorry! You'll need to create a Constitution for " + variable + " first!");}
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            if(!query){
                console.error("Why are we searching without a query?");
                if(!self.items || self.items.length < 10){self.items = loadAll();}
                deferred.resolve(self.items);
                return deferred.promise;
            }
            if(quantimodoService.arrayHasItemWithNameProperty(self.items)){
                self.items = quantimodoService.removeItemsWithDifferentName(self.items, query);
                var minimumNumberOfResultsRequiredToAvoidAPIRequest = 2;
                if(quantimodoService.arrayHasItemWithNameProperty(self.items) && self.items.length > minimumNumberOfResultsRequiredToAvoidAPIRequest){
                    deferred.resolve(self.items);
                    return deferred.promise;
                }
            }
            quantimodoService.searchVariablesIncludingLocalDeferred(query, dataToPass.requestParams)
                .then(function(results){
                    console.debug("Got " + results.length + " results matching " + query);
                    deferred.resolve(loadAll(results));
                });
            return deferred.promise;
        }
        function searchTextChange(text) { console.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            if(!item){return;}
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
            $scope.variable = item.variable;
            quantimodoService.addVariableToLocalStorage(item.variable);
            console.debug('Item changed to ' + item.variable.name);
        }

        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){variables = quantimodoService.getVariablesFromLocalStorage(dataToPass.requestParams);}
            if(!variables || !variables[0]){ return []; }
            return variables.map( function (variable) {
                return {
                    value: variable.name.toLowerCase(),
                    name: variable.name,
                    variable: variable
                };
            });
        }
    };
    $scope.selectOutcomeVariable = function (ev) {
        $mdDialog.show({
            controller: SelectVariableDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: quantimodoService.explanations.outcomeSearch.title,
                    helpText: quantimodoService.explanations.outcomeSearch.textContent,
                    placeholder: "Search for an outcome...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsEffect"}
                }
            }
        }).then(function(variable) {
            $scope.outcomeVariable = variable;
            $scope.outcomeVariableName = variable.name;
        }, function() {console.debug('User cancelled selection');});
    };
    $scope.selectPredictorVariable = function (ev) {
        $mdDialog.show({
            controller: SelectVariableDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: quantimodoService.explanations.predictorSearch.title,
                    helpText: quantimodoService.explanations.predictorSearch.textContent,
                    placeholder: "Search for a predictor...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort:"-numberOfAggregateCorrelationsAsCause"}
                }
            }
        }).then(function(variable) {
            $scope.predictorVariable = variable;
            $scope.predictorVariableName = variable.name;
        }, function() {
            console.debug('User cancelled selection');
        });
    };
    $scope.goToStudyPage = function(correlationObject) {quantimodoService.goToStudyPageViaCorrelationObject(correlationObject);};
    $scope.goToStudyPageWithVariableNames = function(causeVariableName, effectVariableName) {
        if($rootScope.correlationObject && ($rootScope.correlationObject.causeVariableName !== causeVariableName || $rootScope.correlationObject.effectVariableName !== effectVariableName)){
            $rootScope.correlationObject = null;
        }
        $state.go('app.study', {causeVariableName: causeVariableName, effectVariableName: effectVariableName});
    };
    var SelectWikpdediaArticleController = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log, dataToPass) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dataToPass.title;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event, variableName) { $mdDialog.hide($scope.variable); };
        function querySearch (query) {
            self.notFoundText = "No articles matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            if(!query || !query.length){ query = dataToPass.variableName; }
            wikipediaFactory.searchArticles({
                term: query, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
                //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (repsonse) {
                if(repsonse.data.query) {
                    deferred.resolve(loadAll(repsonse.data.query.pages));
                    $scope.causeWikiEntry = repsonse.data.query.pages[0].extract;
                    //$rootScope.correlationObject.studyBackground = $rootScope.correlationObject.studyBackground + '<br>' + $scope.causeWikiEntry;
                    if(repsonse.data.query.pages[0].thumbnail){$scope.causeWikiImage = repsonse.data.query.pages[0].thumbnail.source;}
                } else {
                    var error = 'Wiki not found for ' + query;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                    console.error(error);
                }
            }).catch(function (error) {console.error(error);});
            return deferred.promise;
        }
        function searchTextChange(text) { console.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            $rootScope.variableObject.wikipediaPage = item.page;
            $rootScope.variableObject.wikipediaExtract = item.page.extract;
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(pages) {
            if(!pages){ return []; }
            return pages.map( function (page) {
                return {
                    value: page.title,
                    display: page.title,
                    page: page,
                };
            });
        }
    };
    $scope.searchWikipediaArticle = function (ev) {
        $mdDialog.show({
            controller: SelectWikpdediaArticleController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: "Select Wikipedia Article",
                    helpText: "Change the search query until you see a relevant article in the search results.  This article will be included in studies involving this variable.",
                    placeholder: "Search for a Wikipedia article...",
                    buttonText: "Select Article",
                    variableName: $rootScope.variableObject.name
                }
            },
        }).then(function(page) {
            $rootScope.variableObject.wikipediaPage = page;
        }, function() {
            console.debug('User cancelled selection');
        });
    };
});
