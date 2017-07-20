angular.module('starter')// Parent Controller - This controller runs before every one else
.controller('AppCtrl', function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector, qmService,
                                ionicDatePicker, $cordovaOauth, clipboard, $ionicActionSheet, Analytics, //$ionicDeploy,
                                $locale, $mdDialog, $mdToast, wikipediaFactory, appSettingsResponse) {

    $scope.controller_name = "AppCtrl";
    qmService.initializeApplication(appSettingsResponse);
    $rootScope.numberOfPendingNotifications = null;
    $scope.primaryOutcomeVariableDetails = qmService.getPrimaryOutcomeVariable();
    $rootScope.favoritesOrderParameter = 'numberOfRawMeasurements';
    $scope.$on('$ionicView.enter', function (e) {
        console.debug('appCtrl enter in state ' + $state.current.name + " and url is " + window.location.href);
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
            e.targetScope.controller_name === "historyAllMeasurementsCtrl" ||
            e.targetScope.controller_name === "ConfigurationCtrl"
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
        qmService.openSharingUrl(sharingUrl);
    };
    $scope.shareStudy = function(correlationObject, sharingUrl, ev){
        if(sharingUrl.indexOf('userId') !== -1 && !correlationObject.shareUserMeasurements){
            showShareStudyConfirmation(correlationObject, sharingUrl, ev);
            return;
        }
        qmService.openSharingUrl(sharingUrl);
    };
    $scope.openSharingUrl = function(sharingUrl){ qmService.openSharingUrl(sharingUrl); };
    $scope.openStudyLinkFacebook = function (predictorVariableName, outcomeVariableName) {
        qmService.openSharingUrl(qmService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkFacebook);
    };
    $scope.openStudyLinkTwitter = function (predictorVariableName, outcomeVariableName) {
        qmService.openSharingUrl(qmService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkTwitter);
    };
    $scope.openStudyLinkGoogle = function (predictorVariableName, outcomeVariableName) {
        qmService.openSharingUrl(qmService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkGoogle);
    };
    $scope.openStudyLinkEmail = function (predictorVariableName, outcomeVariableName) {
        qmService.openSharingUrl(qmService.getStudyLinks(predictorVariableName, outcomeVariableName).studyLinkEmail);
    };
    var showShareStudyConfirmation = function(correlationObject, sharingUrl, ev) {
        var title = 'Share Study';
        var textContent = 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
                ' and ' + correlationObject.effectVariableName + ' measurements publicly visible? You can make them private again at any time on this study page.';
        function yesCallback() {
                correlationObject.shareUserMeasurements = true;
                qmService.setLocalStorageItem('lastStudy', JSON.stringify(correlationObject));
                var body = {causeVariableId: correlationObject.causeVariableId, effectVariableId: correlationObject.effectVariableId, shareUserMeasurements: true};
                qmService.showBlackRingLoader();
                qmService.postStudyDeferred(body).then(function () {
                    qmService.hideLoader();
                    if(sharingUrl){qmService.openSharingUrl(sharingUrl);}
                }, function (error) {
                    qmService.hideLoader();
                    qmService.logError(error);
                });
        }
        function noCallback() {correlationObject.shareUserMeasurements = false;}
        qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    var showUnshareStudyConfirmation = function(correlationObject, ev) {
        var title = 'Share Study';
        var textContent = 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
            ' and ' + correlationObject.effectVariableName + ' measurements private? Links to studies your ' +
            'previously shared with these variables will no longer work.';
        function yesCallback() {
            correlationObject.shareUserMeasurements = false;
            var body = {causeVariableId: correlationObject.causeVariableId, effectVariableId: correlationObject.effectVariableId, shareUserMeasurements: false};
            qmService.postStudyDeferred(body);
        }
        function noCallback() {correlationObject.shareUserMeasurements = true;}
        qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
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
            qmService.showBlackRingLoader();
            qmService.postUserVariableDeferred(body).then(function () {
                qmService.hideLoader();
                qmService.openSharingUrl(sharingUrl);
            }, function (error) {
                qmService.hideLoader();
                qmService.logError(error);
            });
        }
        function noCallback() {variableObject.shareUserMeasurements = false;}
        qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    var showUnshareVariableConfirmation = function(variableObject, ev) {
        var title = 'Share Variable';
        var textContent = 'Are you absolutely sure you want to make your ' + variableObject.name +
            ' and ' + variableObject.name + ' measurements private? Links to studies you ' +
            'previously shared with this variable will no longer work.';
        function yesCallback() {
            variableObject.shareUserMeasurements = false;
            var body = {variableId: variableObject.id, shareUserMeasurements: false};
            qmService.postUserVariableDeferred(body).then(function () {}, function (error) {qmService.logError(error);});
        }
        function noCallback() {variableObject.shareUserMeasurements = true;}
        qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
    };
    $scope.toggleVariableShare = function (variableObject, ev) {
        if(variableObject.shareUserMeasurements){showShareVariableConfirmation(variableObject, ev);} else {showUnshareVariableConfirmation(variableObject, ev);}
    };
    $rootScope.setLocalStorageFlagTrue = function (flagName) {
        console.debug('Set ' + flagName + ' to true');
        $rootScope[flagName] = true;
        qmService.setLocalStorageItem(flagName, true);
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
        console.debug("$scope.updateDatesLocalStorage is calling qmService.setDates");
        qmService.setDates(to, from);
    };
    // show main calendar popup (from and to)
    $scope.showCalendarPopup = function ($event) {
        $scope.popover.show($event);
        qmService.getToDate(function (endDate) {
            $scope.toDate = new Date(endDate);
            $scope.fromDatePickerObj.to = $scope.toDate;
            qmService.getFromDate(function (fromDate) {
                $scope.fromDate = new Date(fromDate);
                $scope.toDatePickerObj.from = $scope.fromDate;
            });
        });
    };
    $scope.showHelpInfoPopup = function (explanationId, ev) {
        qmService.showMaterialAlert(qmService.explanations[explanationId].title, qmService.explanations[explanationId].textContent);
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
    $scope.positiveRatingOptions = qmService.getPositiveRatingOptions();
    $scope.negativeRatingOptions = qmService.getNegativeRatingOptions();
    $scope.numericRatingOptions = qmService.getNumericRatingOptions();
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
            qmService.showInfoToast(message);
            $ionicDeploy.check().then(function(snapshotAvailable) {
                if (snapshotAvailable) {
                    message = 'Downloading ' + releaseTrack + ' update...';
                    console.debug(message);
                    if($rootScope.isAndroid){
                        qmService.showInfoToast(message);
                    }
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    // When snapshotAvailable is true, you can apply the snapshot
                    $ionicDeploy.download().then(function() {
                        message = 'Downloaded new version.  Extracting...';
                        console.debug(message);
                        if($rootScope.isAndroid){
                            qmService.showInfoToast(message);
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
                        qmService.showInfoToast(message);
                    }
                    console.debug(message);
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                }
            });

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
    $scope.downVote = function(correlationObject, $index, ev){
        if (correlationObject.correlationCoefficient > 0) {$scope.increasesDecreases = "increases";} else {$scope.increasesDecreases = "decreases";}
        var title, textContent, yesCallback, noCallback;
        if (correlationObject.userVote !== 0) {
            title = 'Implausible relationship?';
            textContent =  'Do you think is is IMPOSSIBLE that ' + correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '?';
            yesCallback = function() {
                correlationObject.userVote = 0;
                correlationObject.vote = 0;
                qmService.postVoteDeferred(correlationObject).then(function () {console.debug('Down voted!');}, function () {qmService.logError('Down vote failed!');});
            };
            noCallback = function() {};
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        } else {
            title = 'Delete Downvote';
            textContent = 'You previously voted that it is IMPOSSIBLE that ' + correlationObject.causeVariableName +
                ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '. Do you want to delete this down vote?';
            yesCallback = function() {deleteVote(correlationObject, $index);};
            noCallback = function () {};
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
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
                qmService.postVoteDeferred(correlationObject).then(function () {console.debug('upVote');}, function () {qmService.logError('upVote failed!');});
            };
            noCallback = function () {};
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        } else {
            title = 'Delete Upvote';
            textContent = 'You previously voted that it is POSSIBLE that '+ correlationObject.causeVariableName +
                ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '. Do you want to delete this up vote?';
            yesCallback = function() {deleteVote(correlationObject, $index);};
            noCallback = function () {};
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        }
    };
    function deleteVote(correlationObject, $index) {
        correlationObject.userVote = null;
        qmService.deleteVoteDeferred(correlationObject, function(response){
            console.debug("deleteVote response", response);
        }, function(response){
            qmService.logError("deleteVote response", response);
        });
    }
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {fn();}
        } else {this.$apply(fn);}
    };
    $scope.onTextClick = function ($event) {
        console.debug("Auto selecting text so the user doesn't have to press backspace...");
        $event.target.select();
    };
    $scope.favoriteValidationFailure = function (message) {
        qmService.showMaterialAlert('Whoops!', message);
        qmService.logError(message);
        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
    };
    $scope.trackFavoriteByValueField = function(trackingReminder, $index){
        if(trackingReminder.total === null){
            $scope.favoriteValidationFailure('Please specify a value for ' + trackingReminder.variableName);
            return;
        }
        trackingReminder.displayTotal = "Recorded " + (trackingReminder.total + " " + trackingReminder.unitAbbreviatedName).replace(' /', '/');
        qmService.postMeasurementByReminder(trackingReminder, trackingReminder.total)
            .then(function () {
                console.debug("Successfully qmService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
            }, function(error) {
                qmService.logError('Failed to track favorite! ', 'Please let me know by pressing the help button.  Thanks!');
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
                qmService.logError("$rootScope.favoritesTally[trackingReminder.id] is undefined so we can't send tally in favorite controller. Not sure how this is happening.");
                return;
            }
            if(trackingReminder.tally) {
                qmService.postMeasurementByReminder(trackingReminder, trackingReminder.tally)
                    .then(function () {
                        console.debug("Successfully qmService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
                    }, function(error) {
                        if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
                        qmService.logError(error);
                        qmService.logError('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
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
            qmService.actionSheetButtons.charts,
            qmService.actionSheetButtons.history,
            qmService.actionSheetButtons.analysisSettings
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
                qmService.deleteTrackingReminderDeferred(favorite);
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
        qmService.postBloodPressureMeasurements($rootScope.bloodPressure)
            .then(function () {
                console.debug("Successfully qmService.postMeasurementByReminder: " + JSON.stringify($rootScope.bloodPressure));
            }, function(error) {
                qmService.logError('Failed to Track by favorite! ', 'Please let me know by pressing the help button.  Thanks!');
            });
    };
    $scope.showExplanationsPopup = function(settingName, ev) {
        qmService.showMaterialAlert(qmService.explanations[settingName].title, qmService.explanations[settingName].explanation, ev);
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
            qmService.reportErrorDeferred('No variable name provided to $scope.getUserVariableByName');
            return;
        }
        if($rootScope.variableObject && $rootScope.variableObject.name !== variableName){ $rootScope.variableObject = null; }
        if(!hideLoader){ qmService.showBlackRingLoader(); }
        var params = {includeTags : true};
        qmService.getUserVariableByNameFromLocalStorageOrApiDeferred(variableName, params, refresh).then(function(variableObject){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            $rootScope.variableObject = variableObject;
            //qmService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
            $scope.setupVariableByVariableObject(variableObject);
        }, function (error) {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            qmService.logError(error);
        });
    };
    $scope.refreshUserVariable = function (hideLoader) {
        var refresh = true;
        if($rootScope.variableObject){ $rootScope.variableName = $rootScope.variableObject.name; }
        $scope.getUserVariableByName($rootScope.variableName, refresh, hideLoader);
    };
    $scope.trackLocationChange = function(event, trackLocation) {
        if(trackLocation !== null && typeof trackLocation !== "undefined"){$rootScope.user.trackLocation = trackLocation;}
        console.debug('trackLocation', $rootScope.user.trackLocation);
        qmService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
        if($rootScope.user && $rootScope.user.trackLocation){
            console.debug('Going to execute qmService.backgroundGeolocationInit if $ionicPlatform.ready');
            qmService.backgroundGeolocationInit();
        }
        if($rootScope.user.trackLocation){
            qmService.showInfoToast('Location tracking enabled');
            qmService.updateLocationVariablesAndPostMeasurementIfChanged();
        }
        if(!$rootScope.user.trackLocation) {
            qmService.showInfoToast('Location tracking disabled');
            qmService.backgroundGeolocationStop();
            console.debug("Do not track location");
        }
    };
    $scope.$on('$stateChangeSuccess', function() {
        if($rootScope.offlineConnectionErrorShowing){$rootScope.offlineConnectionErrorShowing = false;}
        $scope.closeMenu();
    });
    $scope.showMaterialAlert = function(title, textContent, ev) {
        qmService.showMaterialAlert(title, textContent, ev);
    };

    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyChartsUrlToClipboard = function () {
        $scope.copyLinkText = 'Copied!';
        /** @namespace $rootScope.variableObject.chartsUrl */
        clipboard.copyText($rootScope.variableObject.chartsLinkStatic);
        qmService.showInfoToast('Copied link!');
    };
    var verifyEmailAddressAndExecuteCallback = function (callback) {
        if($rootScope.user.email || $rootScope.user.userEmail){
            callback();
            return;
        }
        $scope.updateEmailAndExecuteCallback(callback);
    };
    var sendCouponEmail = function () {
        qmService.sendEmailViaAPIDeferred('couponInstructions');
        qmService.showMaterialAlert('Coupon Redemption', 'Please go check your email at ' +  $rootScope.user.email + ' for instructions to redeem your coupon.', event);
    };
    var sendFitbitEmail = function () {
        qmService.sendEmailViaAPIDeferred('fitbit');
        qmService.showMaterialAlert('Get Fitbit', 'Please check your email at ' +  $rootScope.user.email + ' for instructions to get and connect Fitbit.', event);
    };
    var sendChromeEmail = function () {
        qmService.sendEmailViaAPIDeferred('chrome');
        qmService.showMaterialAlert('Get the Chrome Extension', 'Please check your email at ' +  $rootScope.user.email + ' for your link.', event);
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
            qmService.updateUserSettingsDeferred({email: $scope.data.email});
            $rootScope.user.email = $scope.data.email;
            if(callback){ callback(); }
        });
    };
    $scope.goToStudyPage = function(correlationObject) {qmService.goToStudyPageViaCorrelationObject(correlationObject);};
    $scope.goToStudyPageWithVariableNames = function(causeVariableName, effectVariableName) {
        if($rootScope.correlationObject && ($rootScope.correlationObject.causeVariableName !== causeVariableName || $rootScope.correlationObject.effectVariableName !== effectVariableName)){
            $rootScope.correlationObject = null;
        }
        $state.go('app.study', {causeVariableName: causeVariableName, effectVariableName: effectVariableName});
    };

});
