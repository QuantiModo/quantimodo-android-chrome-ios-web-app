angular.module('starter')// Parent Controller - This controller runs before every one else
.controller('AppCtrl', ["$scope", "$timeout", "$ionicPopover", "$ionicLoading", "$state", "$ionicHistory", "$rootScope",
    "$ionicPopup", "$ionicSideMenuDelegate", "$ionicPlatform", "$injector", "qmService", "qmLogService",
    "$cordovaOauth", "clipboard", "$ionicActionSheet", "Analytics", "$locale", "$mdDialog", "$mdToast", "$sce",
    "wikipediaFactory", "appSettingsResponse", function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector, qmService, qmLogService,
                                $cordovaOauth, clipboard, $ionicActionSheet, Analytics, //$ionicDeploy,
                                $locale, $mdDialog, $mdToast, $sce, wikipediaFactory, appSettingsResponse) {
    $scope.controller_name = "AppCtrl";
    qmService.initializeApplication(appSettingsResponse);
    qmService.numberOfPendingNotifications = null;
    $scope.$on('$ionicView.enter', function (e) {
        qmLogService.debug('appCtrl enter in state ' + $state.current.name + ' and url is ' + window.location.href, null);
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
    $scope.$on('$ionicView.afterEnter', function (e) {
        qmLog.info($scope.controller_name + ".afterEnter so posting queued notifications if any");
        qmService.postTrackingReminderNotificationsDeferred();
        qmService.refreshUserUsingAccessTokenInUrlIfNecessary();
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
    $scope.goToVariableSettingsForCauseVariable = function(correlationObject) {
        /** @namespace correlationObject.causeVariable */
        if(correlationObject.causeVariable){
            qmService.goToState('app.variableSettingsVariableName', {variableObject: correlationObject.causeVariable, variableName: correlationObject.causeVariableName});
        } else {
            qmService.goToState('app.variableSettingsVariableName', {variableName: correlationObject.causeVariableName});
        }
    };
    $scope.goToVariableSettingsForEffectVariable = function(correlationObject) {
        /** @namespace correlationObject.effectVariable */
        if(correlationObject.effectVariable){ qmService.goToState('app.variableSettingsVariableName', {variableObject: correlationObject.effectVariable, variableName: correlationObject.effectVariableName});
        } else { qmService.goToState('app.variableSettingsVariableName', {variableName: correlationObject.effectVariableName}); }
    };
    $scope.openUrl = function (url, showLocationBar, windowTarget) {
        showLocationBar = showLocationBar || "no";
        windowTarget = windowTarget || '_blank';
        if(typeof cordova !== "undefined"){
            cordova.InAppBrowser.open(url,windowTarget, 'location='+showLocationBar+',toolbar=yes,clearcache=no,clearsessioncache=no');
        } else {
            if($rootScope.platform.isWeb){
                window.open(url, windowTarget);  // Otherwise it opens weird popup instead of new tab
            } else {
                window.open(url, windowTarget, 'location='+showLocationBar+',toolbar=yes,clearcache=yes,clearsessioncache=yes');
            }
        }
    };
    $scope.toggleStudyShare = function (correlationObject, ev) {
        if(correlationObject.shareUserMeasurements){
            qmService.studyHelper.showShareStudyConfirmation(correlationObject, ev);
        } else {
            qmService.studyHelper.showUnShareStudyConfirmation(correlationObject, ev);
        }
    };
    $scope.shareStudy = function(correlationObject, shareType, ev){
        if(!correlationObject){
            qmLogService.error("No correlationObject provided to shareStudy!");
            return;
        }
        var sharingUrl = qm.objectHelper.getValueOfPropertyOrSubPropertyWithNameLike(shareType, correlationObject);
        if(!sharingUrl){qmLogService.error("No sharing url for this correlation: ", {correlation: correlationObject});}
        if(sharingUrl.indexOf('userId') !== -1 && !correlationObject.shareUserMeasurements){
            qmService.studyHelper.showShareStudyConfirmation(correlationObject, sharingUrl, ev);
            return;
        }
        qmService.studyHelper.shareStudyNativelyOrViaWeb(correlationObject, sharingUrl);
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
    $scope.toggleVariableShare = function (variableObject, ev) {
        if(variableObject.shareUserMeasurements){qmService.showShareVariableConfirmation(variableObject, ev);} else {qmService.showUnShareVariableConfirmation(variableObject, ev);}
    };
    $rootScope.setLocalStorageFlagTrue = function (flagName) {
        qmLogService.debug('Set ' + flagName + ' to true', null);
        $rootScope[flagName] = true;
        qmService.storage.setItem(flagName, true);
    };
    $scope.showHelpInfoPopup = function (explanationId, ev, modelName) {
        qmService.help.showExplanationsPopup(explanationId, ev, modelName);
    };
    $scope.closeMenuIfNeeded = function (menuItem) {
        menuItem.showSubMenu = !menuItem.showSubMenu;
        if (menuItem.click) { $scope[menuItem.click] && $scope[menuItem.click](); } else if (!menuItem.subMenu) { $scope.closeMenu();}
    };
    $scope.positiveRatingOptions = qmService.getPositiveRatingOptions();
    $scope.negativeRatingOptions = qmService.getNegativeRatingOptions();
    $scope.numericRatingOptions = qmService.getNumericRatingOptions();
    $scope.welcomeText = qm.getAppSettings().welcomeText;
    $scope.downVote = function(correlationObject, $index, ev){
        if (correlationObject.correlationCoefficient > 0) {$scope.increasesDecreases = "increases";} else {$scope.increasesDecreases = "decreases";}
        var title, textContent, yesCallback, noCallback;
        if (correlationObject.userVote !== 0) {
            title = 'Implausible relationship?';
            textContent =  'Do you think is is IMPOSSIBLE that ' + correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effectVariableName+ '?';
            yesCallback = function() {
                correlationObject.userVote = 0;
                correlationObject.vote = 0;
                qmService.postVoteDeferred(correlationObject).then(function () {qmLogService.debug('Down voted!', null);}, function () {qmLogService.error('Down vote failed!');});
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
                qmService.postVoteDeferred(correlationObject).then(function () {qmLogService.debug('upVote', null);}, function () {qmLogService.error('upVote failed!');});
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
            qmLogService.debug('deleteVote response', null, response);
        }, function(response){
            qmLogService.error("deleteVote response", response);
        });
    }
    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if(fn && (typeof(fn) === 'function')) {fn();}
        } else {this.$apply(fn);}
    };
    $scope.onTextClick = function ($event) {
        qmLogService.debug('Auto selecting text so the user doesn\'t have to press backspace...', null);
        $event.target.select();
    };
    $scope.favoriteValidationFailure = function (message) {
        qmService.showMaterialAlert('Whoops!', message);
        qmLogService.error(message);
    };
    $scope.trackFavoriteByValueField = function(trackingReminder, modifiedValue){
        if(typeof modifiedValue !== "undefined" && modifiedValue !== null){
            trackingReminder.modifiedValue = modifiedValue;
        }
        if(trackingReminder.modifiedValue === null){
            $scope.favoriteValidationFailure('Please specify a value for ' + trackingReminder.variableName);
            return;
        }
        trackingReminder.displayTotal =
            qmService.formatValueUnitDisplayText("Recorded " + trackingReminder.modifiedValue + " " + trackingReminder.unitAbbreviatedName);
        qmService.postMeasurementByReminder(trackingReminder, trackingReminder.modifiedValue)
            .then(function () {
                qmLogService.debug('Successfully qmService.postMeasurementByReminder: ' + JSON.stringify(trackingReminder));
            }, function(error) {
                qmLogService.error('Failed to track favorite! error: ' + error, null, trackingReminder);
            });
    };
    $scope.trackByFavorite = function(trackingReminder, modifiedReminderValue){
        qmService.trackByFavorite(trackingReminder, modifiedReminderValue);
    };
    // Triggered on a button click, or some other target
    $scope.showFavoriteActionSheet = function(favorite, $index, bloodPressure) {
        var variableObject = {id: favorite.variableId, name: favorite.variableName};
        var actionMenuButtons = [
            { text: '<i class="icon ion-gear-a"></i>Edit Reminder' },
            { text: '<i class="icon ion-edit"></i>Other Value/Time/Note' },
            qmService.actionSheets.actionSheetButtons.charts,
            qmService.actionSheets.actionSheetButtons.historyAllVariable,
            qmService.actionSheets.actionSheetButtons.variableSettings
        ];
        /** @namespace qm.getAppSettings().favoritesController */
        if(qm.getAppSettings().favoritesController && qm.getAppSettings().favoritesController.actionMenuButtons){
            actionMenuButtons = qm.getAppSettings().favoritesController.actionMenuButtons;
        }
        if(bloodPressure){actionMenuButtons = [];}
        var hideSheet = $ionicActionSheet.show({
            buttons: actionMenuButtons,
            destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {qmLogService.debug('CANCELLED', null);},
            buttonClicked: function(index) {
                qmLogService.debug('BUTTON CLICKED', null, index);
                if(index === 0){qmService.goToState('app.reminderAdd', {reminder: favorite});}
                if(index === 1){qmService.goToState('app.measurementAdd', {trackingReminder: favorite});}
                if(index === 2){qmService.goToState('app.charts', {trackingReminder: favorite, fromState: $state.current.name, fromUrl: window.location.href});}
                if(index === 3){qmService.goToState('app.historyAllVariable', {variableObject: variableObject, variableName: variableObject.name});}
                if(index === 4){qmService.goToVariableSettingsByName(favorite.variableName);}
                return true;
            },
            destructiveButtonClicked: function() {
                favorite.hide = true;
                qmService.deleteTrackingReminderDeferred(favorite);
                return true;
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
                qmLogService.debug('Successfully qmService.postMeasurementByReminder: ' + JSON.stringify($rootScope.bloodPressure), null);
            }, function(error) {
                qmLogService.error('Failed to Track by favorite! ', $rootScope.bloodPressure);
            });
    };
    $scope.showExplanationsPopup = function(parameterOrPropertyName, ev, modelName, title) {
        qmService.help.showExplanationsPopup(parameterOrPropertyName, ev, modelName, title);
    };
    $scope.goBack = function (providedStateParams) {
        qmService.stateHelper.goBack(providedStateParams);
    };
    $scope.trackLocationWithMeasurementsChange = function(event, trackLocation) {
        if(trackLocation !== null && typeof trackLocation !== "undefined"){$rootScope.user.trackLocation = trackLocation;}
        qmLogService.debug('trackLocation', null, $rootScope.user.trackLocation);
        qmService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
        if($rootScope.user && $rootScope.user.trackLocation){
            qmLogService.debug('Going to execute qmService.backgroundGeolocationStartIfEnabled if $ionicPlatform.ready');
            qmService.showInfoToast('Location tracking enabled');
            qmService.updateLocationVariablesAndPostMeasurementIfChanged();
        }
        if(!$rootScope.user.trackLocation) {
            qmService.showInfoToast('Location tracking disabled');
            qmLogService.debug('Do not track location');
        }
    };
    $scope.$on('$stateChangeSuccess', function() {
        qmService.navBar.setOfflineConnectionErrorShowing(false);
        qmLog.context = $state.current.name;
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        $scope.closeMenu();
    });
    $scope.showMaterialAlert = function(title, textContent, ev) {
        qmService.showMaterialAlert(title, textContent, ev);
    };
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyToClipboard = function (text, name) {
        name = name || text;
        $scope.copyLinkText = 'Copied!';
        clipboard.copyText(text);
        qmService.showInfoToast('Copied ' + name + ' to clipboard!');
    };
    $scope.sendEmailAfterVerification = function(emailType) {
        qmService.sendEmailAfterVerification(emailType);
    };
    $scope.updateEmailAndExecuteCallback = function (callback) {
        qmService.updateEmailAndExecuteCallback(callback);
    };
    $scope.goToStudyPage = function(correlationObject) {qmService.goToStudyPageViaCorrelationObject(correlationObject);};
    $scope.goToStudyPageWithVariableNames = function(causeVariableName, effectVariableName) {
        qmLogService.debug('Clicked go goToStudyPageWithVariableNames for ' + causeVariableName + ' and ' + effectVariableName, null);
        //qmService.goToState('app.study', {causeVariableName: causeVariableName, effectVariableName: effectVariableName});
        qmService.goToStudyPage(causeVariableName, effectVariableName);
    };
    $scope.showGeneralVariableSearchDialog = function (ev) {
        function selectVariable(variable) {
            $scope.variableObject = variable;
            qmLogService.debug('Selected variable: ' + variable.name);
            var showActionSheet = qmService.actionSheets.getVariableObjectActionSheet(variable.name, variable);
            showActionSheet();
        }
        var dialogParameters = {
            title: 'Select Variable',
            helpText: "Search for a variable to add a measurement, reminder, view history, or see relationships",
            placeholder: "Search for a variable", // Don't use ellipses because we append to this sometimes
            buttonText: "Select Variable",
            requestParams: {includePublic: true}
        };
        qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, ev);
    };
    $scope.switchToPatient = qmService.switchToPatient;
    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };
}]);
