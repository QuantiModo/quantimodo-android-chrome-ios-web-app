angular.module('starter')// Parent Controller - This controller runs before every one else
.controller('AppCtrl', ["$scope", "$timeout", "$ionicPopover", "$ionicLoading", "$state", "$ionicHistory", "$rootScope",
    "$ionicPopup", "$ionicSideMenuDelegate", "$ionicPlatform", "$injector", "qmService", "qmLogService",
    "$cordovaOauth", "clipboard", "$ionicActionSheet", "Analytics", "$locale", "$mdDialog", "$mdToast",
    "wikipediaFactory", "appSettingsResponse", function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector, qmService, qmLogService,
                                $cordovaOauth, clipboard, $ionicActionSheet, Analytics, //$ionicDeploy,
                                $locale, $mdDialog, $mdToast, wikipediaFactory, appSettingsResponse) {
    $scope.controller_name = "AppCtrl";
    qmService.initializeApplication(appSettingsResponse);
    $rootScope.numberOfPendingNotifications = null;
    $scope.primaryOutcomeVariableDetails = qm.getPrimaryOutcomeVariable();
    $rootScope.favoritesOrderParameter = 'numberOfRawMeasurements';
    $scope.$on('$ionicView.enter', function (e) {
        qmLogService.debug(null, 'appCtrl enter in state ' + $state.current.name + ' and url is ' + window.location.href, null);
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
    $scope.goToVariableSettingsForCauseVariable = function(correlationObject) {
        /** @namespace correlationObject.causeVariable */
        if(correlationObject.causeVariable){
            qmService.goToState('app.variableSettings', {variableObject: correlationObject.causeVariable, variableName: correlationObject.causeVariableName});
        } else {
            qmService.goToState('app.variableSettings', {variableName: correlationObject.causeVariableName});
        }
    };
    $scope.goToVariableSettingsForEffectVariable = function(correlationObject) {
        /** @namespace correlationObject.effectVariable */
        if(correlationObject.effectVariable){ qmService.goToState('app.variableSettings', {variableObject: correlationObject.effectVariable, variableName: correlationObject.effectVariableName});
        } else { qmService.goToState('app.variableSettings', {variableName: correlationObject.effectVariableName}); }
    };
    $scope.openUrl = function(url){
        if(typeof cordova !== "undefined"){ cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
        } else { window.open(url,'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes'); }
    };
    var showShareStudyConfirmation = function(correlationObject, sharingUrl, ev) {
        var title = 'Share Study';
        var textContent = 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
            ' and ' + correlationObject.effectVariableName + ' measurements publicly visible? You can make them private again at any time on this study page.';
        function yesCallback() {
            correlationObject.shareUserMeasurements = true;
            qmService.qmStorage.setItem('lastStudy', JSON.stringify(correlationObject));
            var body = {causeVariableId: correlationObject.causeVariableId, effectVariableId: correlationObject.effectVariableId, shareUserMeasurements: true};
            qmService.showBlackRingLoader();
            qmService.postStudyDeferred(body).then(function () {
                qmService.hideLoader();
                if(sharingUrl){
                    shareStudyNativelyOrViaWeb(correlationObject, sharingUrl);
                }
            }, function (error) {
                qmService.hideLoader();
                qmLogService.error(error);
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

    function shareStudyNativelyOrViaWeb(correlationObject, sharingUrl) {
        if ($rootScope.isMobile){
            // this is the complete list of currently supported params you can pass to the plugin (all optional)
            var options = {
                //message: correlationObject.sharingTitle, // not supported on some apps (Facebook, Instagram)
                //subject: correlationObject.sharingTitle, // fi. for email
                //files: ['', ''], // an array of filenames either locally or remotely
                url: correlationObject.studyLinks.studyLinkStatic.replace('local.q', 'app.q'),
                chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
            };
            var onSuccess = function(result) {
                //qmLog.error("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
                qmLog.error("Share to " + result.app + ' completed: ' + result.completed); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
            };
            var onError = function(msg) {
                qmLog.error("Sharing failed with message: " + msg);
            };
            window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
        } else {
            qmService.openSharingUrl(sharingUrl);
        }
    }

    $scope.shareStudy = function(correlationObject, sharingUrl, ev){
        if(!correlationObject){
            qmLogService.error("No correlationObject provided to shareStudy!");
            return;
        }
        if(!sharingUrl){qmLogService.error("No sharing url for this correlation: ", {correlation: correlationObject});}
        if(sharingUrl.indexOf('userId') !== -1 && !correlationObject.shareUserMeasurements){
            showShareStudyConfirmation(correlationObject, sharingUrl, ev);
            return;
        }
        shareStudyNativelyOrViaWeb(correlationObject, sharingUrl);
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
        if(variableObject.shareUserMeasurements){qmService.showShareVariableConfirmation(variableObject, ev);} else {qmService.showUnshareVariableConfirmation(variableObject, ev);}
    };
    $rootScope.setLocalStorageFlagTrue = function (flagName) {
        qmLogService.debug(null, 'Set ' + flagName + ' to true', null);
        $rootScope[flagName] = true;
        qmService.qmStorage.setItem(flagName, true);
    };
    $scope.showHelpInfoPopup = function (explanationId, ev) {
        qmService.showMaterialAlert(qmService.explanations[explanationId].title, qmService.explanations[explanationId].textContent);
    };
    $scope.tagAnotherVariable = function (variableObject) {
        qmService.goToState('app.tageeSearch',  {fromState: $state.current.name, userTagVariableObject: variableObject});
    };
    $scope.closeMenuIfNeeded = function (menuItem) {
        menuItem.showSubMenu = !menuItem.showSubMenu;
        if (menuItem.click) { $scope[menuItem.click] && $scope[menuItem.click](); } else if (!menuItem.subMenu) { $scope.closeMenu();}
    };
    $scope.positiveRatingOptions = qmService.getPositiveRatingOptions();
    $scope.negativeRatingOptions = qmService.getNegativeRatingOptions();
    $scope.numericRatingOptions = qmService.getNumericRatingOptions();
    $scope.welcomeText = config.appSettings.welcomeText;
    $scope.editTag = function(userTagVariable){
        qmService.goToState('app.tagAdd', {
            tagConversionFactor: userTagVariable.tagConversionFactor,
            userTaggedVariableObject: $rootScope.variableObject,
            fromState: $state.current.name,
            userTagVariableObject: userTagVariable
        });
    };
    $scope.editTagged = function(userTaggedVariable){
        qmService.goToState('app.tagAdd', {
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
                qmService.postVoteDeferred(correlationObject).then(function () {qmLogService.debug(null, 'Down voted!', null);}, function () {qmLogService.error('Down vote failed!');});
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
                qmService.postVoteDeferred(correlationObject).then(function () {qmLogService.debug(null, 'upVote', null);}, function () {qmLogService.error('upVote failed!');});
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
            qmLogService.debug(null, 'deleteVote response', null, response);
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
        qmLogService.debug(null, 'Auto selecting text so the user doesn\'t have to press backspace...', null);
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
        if(typeof modifiedReminderValue === "undefined" || modifiedReminderValue === null){modifiedReminderValue = trackingReminder.defaultValue;}
        if(trackingReminder.combinationOperation === "SUM"){
            trackingReminder.total = trackingReminder.total + modifiedReminderValue;
        } else {
            trackingReminder.total = modifiedReminderValue;
        }
        trackingReminder.displayTotal = qmService.formatValueUnitDisplayText("Recorded " + trackingReminder.total + " " + trackingReminder.unitAbbreviatedName);
        if(!trackingReminder.tally){trackingReminder.tally = 0;}
        if(trackingReminder.combinationOperation === "SUM"){
            trackingReminder.tally += modifiedReminderValue;
        } else {
            trackingReminder.tally = modifiedReminderValue;
        }
        qmService.showInfoToast(trackingReminder.displayTotal + " " + trackingReminder.variableName);
        $timeout(function() {
            if(typeof trackingReminder === "undefined"){
                qmLogService.error("$rootScope.favoritesTally[trackingReminder.id] is undefined so we can't send tally in favorite controller. Not sure how this is happening.");
                return;
            }
            if(trackingReminder.tally !== null) {
                qmService.postMeasurementByReminder(trackingReminder, trackingReminder.tally)
                    .then(function () {
                        qmLogService.debug(null, 'Successfully qmService.postMeasurementByReminder: ' + JSON.stringify(trackingReminder), null);
                    }, function(error) {
                        qmLogService.error(error);
                        qmLogService.error('Failed to Track by favorite! ', trackingReminder);
                    });
                trackingReminder.tally = null;
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
            cancel: function() {qmLogService.debug(null, 'CANCELLED', null);},
            buttonClicked: function(index) {
                qmLogService.debug(null, 'BUTTON CLICKED', null, index);
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
                qmLogService.debug(null, 'Successfully qmService.postMeasurementByReminder: ' + JSON.stringify($rootScope.bloodPressure), null);
            }, function(error) {
                qmLogService.error('Failed to Track by favorite! ', $rootScope.bloodPressure);
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
                $ionicHistory.removeBackView();
                backView = $ionicHistory.backView();  // TODO: Figure out why $stateParams are null
                stateId = backView.stateName;
                //$ionicHistory.goBack(-2);
                //qmService.goToDefaultState(stateParams);
                //return;
            }
            if(stateParams){
                for (var key in stateParams) {
                    if (stateParams[key] && stateParams[key] !== "") { stateId += "_" + key + "=" + stateParams[key]; }
                }
                backView.stateParams = stateParams;
                backView.stateId = stateId;
            }
            qmLogService.debug(null, 'Going back to ' + backView.stateId + '  with stateParams ' + JSON.stringify(backView.stateParams), null);
            $ionicHistory.goBack();
        } else {
            qmService.goToDefaultState(stateParams);
        }
    };

    $scope.getUserVariableByName = function (variableName, refresh, hideLoader) {
        if(!variableName){
            qmLogService.error('No variable name provided to $scope.getUserVariableByName');
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
            qmService.setupVariableByVariableObject(variableObject);
        }, function (error) {
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            qmLogService.error(error);
        });
    };
    $scope.refreshUserVariable = function (hideLoader) {
        var refresh = true;
        if($rootScope.variableObject){ $rootScope.variableName = $rootScope.variableObject.name; }
        $scope.getUserVariableByName($rootScope.variableName, refresh, hideLoader);
    };
    $scope.trackLocationChange = function(event, trackLocation) {
        if(trackLocation !== null && typeof trackLocation !== "undefined"){$rootScope.user.trackLocation = trackLocation;}
        qmLogService.debug('trackLocation', null, $rootScope.user.trackLocation);
        qmService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
        if($rootScope.user && $rootScope.user.trackLocation){
            qmLogService.debug('Going to execute qmService.backgroundGeolocationInit if $ionicPlatform.ready');
        }
        if($rootScope.user.trackLocation){
            qmService.showInfoToast('Location tracking enabled');
            qmService.updateLocationVariablesAndPostMeasurementIfChanged();
        }
        if(!$rootScope.user.trackLocation) {
            qmService.showInfoToast('Location tracking disabled');
            qmLogService.debug('Do not track location');
        }
    };

    $scope.$on('$stateChangeSuccess', function() {
        if($rootScope.offlineConnectionErrorShowing){$rootScope.offlineConnectionErrorShowing = false;}
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
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
        qmService.showMaterialAlert('Coupon Redemption', 'Please go check your email at ' +  $rootScope.user.email + ' for instructions to redeem your coupon.');
    };
    var sendFitbitEmail = function () {
        qmService.sendEmailViaAPIDeferred('fitbit');
        qmService.showMaterialAlert('Get Fitbit', 'Please check your email at ' +  $rootScope.user.email + ' for instructions to get and connect Fitbit.');
    };
    var sendChromeEmail = function () {
        qmService.sendEmailViaAPIDeferred('chrome');
        qmService.showMaterialAlert('Get the Chrome Extension', 'Please check your email at ' +  $rootScope.user.email + ' for your link.');
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
        qmLogService.debug(null, 'Clicked go goToStudyPageWithVariableNames for ' + causeVariableName + ' and ' + effectVariableName, null);
        if($rootScope.correlationObject && ($rootScope.correlationObject.causeVariableName !== causeVariableName || $rootScope.correlationObject.effectVariableName !== effectVariableName)){
            $rootScope.correlationObject = null;
        }
        //qmService.goToState('app.study', {causeVariableName: causeVariableName, effectVariableName: effectVariableName});
        qmService.goToStudyPage(causeVariableName, effectVariableName);
    };
}]);
