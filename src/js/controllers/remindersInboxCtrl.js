angular.module('starter').controller('RemindersInboxCtrl', ["$scope", "$state", "$stateParams", "$rootScope", "$filter",
    "$ionicPlatform", "$ionicActionSheet", "$timeout", "qmService",
    function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform, $ionicActionSheet, $timeout, qmService){
        if(!$rootScope.appSettings){
            qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());
        }
        $scope.controller_name = "RemindersInboxCtrl";
        qmLog.debug('Loading ' + $scope.controller_name);
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            maximumNotificationsToDisplay: 20,
            showMeasurementBox: false,
            selectedReminder: false,
            reminderDefaultValue: "",
            selected1to5Value: false,
            allReminders: [],
            trackingReminderNotifications: [],
            filteredReminderNotifications: [],
            favoritesArray: null,
            measurementDate: new Date(),
            slots: {
                epochTime: new Date().getTime() / 1000,
                format: 12,
                step: 1,
                closeLabel: 'Cancel'
            },
            variable: {},
            isDisabled: false,
            loading: true,
            lastButtonPressTimeStamp: 0,
            lastClientX: 0,
            lastClientY: 0,
            numberOfDisplayedNotifications: 0,
            favoritesTitle: "Your Favorites",
            studiesResponse: null,
            title: "Inbox"
        };
        //createWordCloudFromNotes();
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info('RemindersInboxCtrl beforeEnter: ' + window.location.href);
            $scope.state.loading = true;
            if(qmService.login.sendToLoginIfNecessaryAndComeBack("beforeEnter in " + $state.current.name)){
                return;
            }
            $rootScope.hideBackButton = true;
            $rootScope.hideHomeButton = true;
            if($stateParams.hideNavigationMenu !== true){
                qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            }
            // setPageTitle(); // Setting title beforeEnter doesn't fix cutoff on Android
        });
        $scope.$on('$ionicView.enter', function(e){
            qmLog.info('RemindersInboxCtrl enter: ' + window.location.href);
            $scope.defaultHelpCards = qmService.setupHelpCards($rootScope.appSettings);
            readHelpCards();
            getTrackingReminderNotifications();
            //getFavorites();  Not sure why we need to do this here?
            qmService.rootScope.setProperty('bloodPressure', {
                systolicValue: null,
                diastolicValue: null,
                displayTotal: "Blood Pressure"
            });
            $scope.stateParams = $stateParams;
            qmService.actionSheet.setDefaultActionSheet(function(){
                    $scope.refreshTrackingReminderNotifications();
                },
                getVariableCategoryName(), 'Clear All Notifications',
                function(){
                    qmService.showInfoToast('Skipping all reminder notifications...');
                    qm.notifications.skipAllTrackingReminderNotifications({}, function(){
                        $scope.refreshTrackingReminderNotifications();
                    }, function(error){
                        qmLog.error(error);
                        qmService.showMaterialAlert('Failed to skip! ', 'Please let me know by pressing the help button.  Thanks!');
                    });
                    return true;
                }
            );
            qmService.splash.hideSplashScreen();
        });
        $scope.$on('$ionicView.afterEnter', function(){
            qmLog.info('RemindersInboxCtrl afterEnter: ' + window.location.href);
            setPageTitle(); // Setting title afterEnter doesn't fix cutoff on Android
            if(needToRefresh()){
                $scope.refreshTrackingReminderNotifications();
            }
            if($rootScope.platform.isWeb){
                qm.webNotifications.registerServiceWorker();
            }
            autoRefresh();
        });
        function readHelpCards(helpCard){
            if(!qm.speech.getSpeechEnabled()){
                return;
            }
            if(!$scope.defaultHelpCards || !$scope.defaultHelpCards.length){
                return;
            }
            qm.speech.talkRobot(helpCard, function(){
                //$scope.hideHelpCard($scope.defaultHelpCards[0], $scope.defaultHelpCards[0].emailType);
                //readHelpCards();
            });
        }
        function needToRefresh(){
            if(!qm.storage.getItem(qm.items.trackingReminderNotifications)){
                return true;
            }
            if(!qm.storage.getItem(qm.items.trackingReminderNotifications).length){
                return true;
            }
            if(qm.notifications.mostRecentNotificationIsOlderThanMostFrequentInterval()){
                return true;
            }
            return false;
        }
        function autoRefresh(){
            $timeout(function(){
                if($state.current.name.toLowerCase().indexOf('inbox') !== -1){
                    $scope.refreshTrackingReminderNotifications();
                    autoRefresh();
                }
            }, 30 * 60 * 1000);
        }
        $scope.$on('$ionicView.afterLeave', function(){
            qmLog.debug('RemindersInboxCtrl afterLeave', null);
            $rootScope.hideHomeButton = false;
            $rootScope.hideBackButton = false;
        });
        var setPageTitle = function(){
            if($stateParams.today){
                if(getVariableCategoryName() === 'Treatments'){
                    $scope.state.title = "Today's Scheduled Meds";
                    $scope.state.favoritesTitle = "As-Needed Meds";
                }else if(getVariableCategoryName()){
                    $scope.state.title = "Today's Scheduled " + getVariableCategoryName();
                }else{
                    $scope.state.title = "Today's Reminder Notifications";
                }
            }else{
                if(getVariableCategoryName() === 'Treatments'){
                    $scope.state.title = 'Overdue Meds';
                    $scope.state.favoritesTitle = "As-Needed Meds";
                }else if(getVariableCategoryName()){
                    $scope.state.title = $filter('wordAliases')(getVariableCategoryName()) + " " + $filter('wordAliases')("Reminder Inbox");
                }else{
                    $scope.state.title = 'Inbox';
                }
            }
        };
        var isGhostClick = function($event){
            if(!$rootScope.platform.isMobile){
                return false;
            }
            if($event && $scope.state.lastButtonPressTimeStamp > $event.timeStamp - 3000 && $scope.state.lastClientX === $event.clientX && $scope.state.lastClientY === $event.clientY){
                qmLog.debug('This event is probably a ghost click so not registering.', null, $event);
                return true;
            }else{
                if(!$event){
                    qmLog.error('No event provided to isGhostClick!');
                    return false;
                }
                qmLog.debug('This Track event is not a ghost click so registering.', null, $event);
                $scope.state.lastButtonPressTimeStamp = $event.timeStamp;
                $scope.state.lastClientX = $event.clientX;
                $scope.state.lastClientY = $event.clientY;
                return false;
            }
        };
        function refreshIfRunningOutOfNotifications(){
            if($scope.state.numberOfDisplayedNotifications < 2){
                if(qm.notifications.getNumberInGlobalsOrLocalStorage(getVariableCategoryName())){
                    getTrackingReminderNotifications();
                }else{
                    $scope.refreshTrackingReminderNotifications();
                }
            }
        }
        $scope.trackByValueField = function(trackingReminderNotification, $event){
            if(isGhostClick($event)){
                return;
            }
            if(!qmService.valueIsValid(trackingReminderNotification, trackingReminderNotification.modifiedValue)){
                return false;
            }
            trackingReminderNotification.modifiedValue = trackingReminderNotification.total;
            var lastAction = 'Recorded ' + trackingReminderNotification.modifiedValue + ' ' + trackingReminderNotification.unitAbbreviatedName;
            qm.notifications.lastAction = qm.stringHelper.formatValueUnitDisplayText(lastAction) + ' for '+trackingReminderNotification.variableName;
            notificationAction(trackingReminderNotification);
            qm.notifications.trackNotification(trackingReminderNotification);
            refreshIfRunningOutOfNotifications();
        };
        function getFavorites(){
            if(!$scope.state.favoritesArray){
                qmService.storage.getFavorites(getVariableCategoryName())
                    .then(function(favorites){
                        $scope.state.favoritesArray = favorites;
                    });
            }
        }
        var getFallbackInboxContentIfNecessary = function(){
            if(!$scope.state.numberOfDisplayedNotifications){
                if(getVariableCategoryName()){
                    qmLog.info('Falling back to getTrackingReminderNotificationsFromApi request for category ' + getVariableCategoryName());
                    qmService.refreshTrackingReminderNotifications({
                        variableCategoryName: getVariableCategoryName(),
                        onlyPast: true
                    }, function(response){
                        qmLog.info('getTrackingReminderNotificationsFromApi response for ' + getVariableCategoryName() +
                            ': ' + JSON.stringify(response));
                        addNotificationsToScope(response.data)
                    });
                }
                getFavorites();
                getDiscoveries();
            }
        };
        var closeWindowIfNecessary = function(){
            if($state.current.name === "app.remindersInboxCompact" && !$scope.state.numberOfDisplayedNotifications){
                $scope.refreshTrackingReminderNotifications();
                window.close();
            }
        };
        var enlargeChromePopupIfNecessary = function(){
            if($rootScope.alreadyEnlargedWindow){
                return;
            }
            var largeInboxWindowParams = {top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
            if($state.current.name === "app.remindersInboxCompact"){
                qmService.goToState("app.remindersInbox");
                chrome.windows.getCurrent({}, function(chromeWindow){
                    $rootScope.alreadyEnlargedWindow = true;
                    var vid = chromeWindow.id;
                    chrome.windows.update(vid, largeInboxWindowParams);
                });
            }
        };
        var notificationAction = function(trackingReminderNotification){
            trackingReminderNotification = qmService.notifications.handleNotificationAction(trackingReminderNotification,
                getTrackingReminderNotifications);
            $scope.state.numberOfDisplayedNotifications--;
            if($state.current.name === "app.remindersInboxCompact"){
                if(!$scope.state.numberOfDisplayedNotifications){
                    window.close();
                }
                $scope.trackingReminderNotifications.shift();
            }
            closeWindowIfNecessary();
            return trackingReminderNotification;
        };
        $scope.track = function(notification, value, $event){
            if(isGhostClick($event)){return false;}
            notification.modifiedValue = value;
            var valueUnit = notification.modifiedValue + ' ' + notification.unitAbbreviatedName;
            var variableName = notification.variableName;
            valueUnit = qm.stringHelper.formatValueUnitDisplayText(valueUnit);
            qm.notifications.lastAction = 'Recorded ' + valueUnit + ' for '+ variableName;
            var body = notificationAction(notification);
            if(value !== null){body.modifiedValue = value;}
            qm.notifications.trackNotification(body);
            refreshIfRunningOutOfNotifications();
            if($scope.state.showTrackAllButtons){
                qm.toast.showQuestionToast('Want to record ' + valueUnit + " for ALL remaining " + variableName + " notifications?",
                'Recorded ' + valueUnit + " for ALL remaining " + variableName + " notifications!", function () {
                    $scope.trackAll(notification, value);
                })
            }
        };
        $scope.trackAll = function(notification, value, ev){
            notification.modifiedValue = value;
            var lastAction = 'Recorded ' + value + ' ' + notification.unitAbbreviatedName;
            qm.notifications.lastAction = qm.stringHelper.formatValueUnitDisplayText(lastAction) + ' for all '+notification.variableName;
            var body = notificationAction(notification);
            qmService.notifications.trackAll(body, value, ev);
            getTrackingReminderNotifications();
        }
        $scope.trackAllWithConfirmation = function(trackingReminderNotification, modifiedReminderValue, ev){
            qm.ui.preventDragAfterAlert(ev);
            var title = "Record " + qm.stringHelper.formatValueUnitDisplayText(modifiedReminderValue + " " + trackingReminderNotification.unitAbbreviatedName) + " for all?";
            var textContent = "Do you want to record " + qm.stringHelper.formatValueUnitDisplayText(modifiedReminderValue + " " + trackingReminderNotification.unitAbbreviatedName) +
                " for all remaining past " + trackingReminderNotification.variableName + " reminder notifications?";
            function yesCallback(ev){
                $scope.trackAll(trackingReminderNotification, modifiedReminderValue, ev);
            }
            function noCallback(){
            }
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        };
        $scope.skip = function(trackingReminderNotification, $event){
            if(isGhostClick($event)){
                return;
            }
            qm.notifications.lastAction = 'Skipped '+trackingReminderNotification.variableName;
            var params = notificationAction(trackingReminderNotification);
            qm.notifications.skip(params);
            qmService.logEventToGA(qm.analytics.eventCategories.inbox, "skip");
            refreshIfRunningOutOfNotifications();
        };
        $scope.snooze = function(trackingReminderNotification, $event){
            if(isGhostClick($event)){
                return;
            }
            qm.notifications.lastAction = 'Snoozed '+trackingReminderNotification.variableName;
            var params = notificationAction(trackingReminderNotification);
            qm.notifications.snoozeNotification(params);
            qmService.logEventToGA(qm.analytics.eventCategories.inbox, "snooze");
            refreshIfRunningOutOfNotifications();
        };
        function wordClicked(word){
            alert(word.text + " appears " + word.count + " times and the average " + qm.getPrimaryOutcomeVariable().name +
                " value when it is written is " + word.average + qm.getPrimaryOutcomeVariable().unitAbbreviatedName + '.');
        }
        function createWordCloudFromNotes(){
            $scope.height = window.innerHeight * 0.5;
            $scope.width = window.innerWidth; //element.find('word-cloud')[0].offsetWidth;
            $scope.wordClicked = wordClicked;
            qmService.getNotesDeferred(qm.getPrimaryOutcomeVariable().name).then(function(response){
                $scope.words = response;
            });
        }
        function logNotificationDividers(dividers) {
            if(!dividers){
                qmLog.info("No notification dividers!")
                return;
            }
            qmLog.debug('Just added ' + dividers.length +' notification dividers to $scope.notificationDividers. \n' +
                'state.numberOfDisplayedNotifications is '+$scope.state.numberOfDisplayedNotifications);
            if(typeof dividers.forEach !== "function"){
                qmLog.error("typeof dividers.forEach !== \"function\"")
                return;
            }
            dividers.forEach(function (divider) {
                qmLog.debug('Notification Divider '+divider.name);
                divider.trackingReminderNotifications.forEach(function (notification) {
                    qmLog.debug("notification title: " + notification.title+ "| id: "+notification.id+")"+
                        " | trackingReminderNotificationId: "+notification.trackingReminderNotificationId+")");
                })
            })
        }
        var getFilteredTrackingReminderNotificationsFromLocalStorage = function(){
            var notifications = qm.storage.getTrackingReminderNotifications(getVariableCategoryName(),
                $scope.state.maximumNotificationsToDisplay);
            qmLog.debug('Just got ' + notifications.length + ' trackingReminderNotifications from local storage');
            if($state.current.name === "app.remindersInboxCompact"){
                $scope.trackingReminderNotifications = notifications;
            }else{
                addNotificationsToScope(notifications)
            }
            hideInboxLoader();
        };
        var hideInboxLoader = function(){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $scope.state.loading = false;
            qmService.hideLoader();
        };
        function addNotificationsToScope(trackingReminderNotifications) {
            for(var i = 0; i < trackingReminderNotifications.length; i++){
                var n = trackingReminderNotifications[i]
                n.showZeroButton = shouldWeShowZeroButton(trackingReminderNotifications[i]);
                n.trackAllActions.forEach(function (a) {
                    if(a.callback === "skipAction"){
                        a.valueUnit = "Skip"
                        a.longTitle = "Skip all remaining un-tracked past notifications"
                        a.titleHtml = "<p>Skip All</p>"
                    } else{
                        a.valueUnit = a.title.replace(" for all", "");
                        a.longTitle = "Record "+a.valueUnit + " for all remaining un-tracked past notifications"
                        a.titleHtml = "<p>"+a.valueUnit+"</p>"+"<p><small>for all</small></p>"
                    }
                })
            }
            trackingReminderNotifications = qm.reminderHelper.removeDuplicateNotifications(trackingReminderNotifications);
            var dividers = qmService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications)
            $scope.safeApply(function () { // For som reason these are not visible to Ghost Inspector sometimes
                $scope.notificationDividers = dividers;
                $scope.state.numberOfDisplayedNotifications = trackingReminderNotifications.length;
                $scope.state.showTrackAllButtons = trackingReminderNotifications.length >= $scope.state.maximumNotificationsToDisplay;
                logNotificationDividers($scope.notificationDividers);
            })
        }
        var getFilteredTodayTrackingReminderNotifications = function(){
            qmService.getTodayTrackingReminderNotificationsDeferred(getVariableCategoryName())
                .then(function(trackingReminderNotifications){
                    addNotificationsToScope(trackingReminderNotifications)
                    getFallbackInboxContentIfNecessary();
                    hideInboxLoader();
                }, function(error){
                    getFallbackInboxContentIfNecessary();
                    qmLog.error(error);
                    qmLog.error('failed to get reminder notifications!');
                    hideInboxLoader();
                });
        };
        $rootScope.$on('broadcastGetTrackingReminderNotifications', function(){
            qmLog.info('getTrackingReminderNotifications broadcast received..');
            if(!$stateParams.today){
                getFilteredTrackingReminderNotificationsFromLocalStorage();
            }
        });
        var getTrackingReminderNotifications = function(){
            qmLog.info('RemindersInboxCtrl called getTrackingReminderNotifications: ' + window.location.href);
            if($stateParams.today){
                getFilteredTodayTrackingReminderNotifications();
            }else{
                getFilteredTrackingReminderNotificationsFromLocalStorage();
            }
        };
        function shouldWeShowZeroButton(trackingReminderNotification){
            return trackingReminderNotification.inputType === 'defaultValue' ||
                (trackingReminderNotification.inputType === 'value' && trackingReminderNotification.defaultValue !== null);
        }
        var showLoader = function(){
            $scope.state.loading = true;
            $timeout(function(){
                if($scope.state.loading){
                    $scope.state.loading = false;
                }
            }, 10000);
        };
        $scope.refreshTrackingReminderNotifications = function(params){
            showLoader();
            qmService.refreshTrackingReminderNotifications(params).then(function(){
                getTrackingReminderNotifications();
                if(!qm.notifications.getNumberInGlobalsOrLocalStorage(getVariableCategoryName())){
                    getFallbackInboxContentIfNecessary();
                }
            }, function(error){
                if(!qm.notifications.getNumberInGlobalsOrLocalStorage(getVariableCategoryName())){
                    getFallbackInboxContentIfNecessary();
                }
                qmLog.info('$scope.refreshTrackingReminderNotifications: ', error);
                hideInboxLoader();
            });
        };
        $scope.editMeasurement = function(trackingReminderNotification){
            enlargeChromePopupIfNecessary();
            //$scope.notificationDividers[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
            trackingReminderNotification.hide = true;
            qm.notifications.numberOfPendingNotifications--;
            $scope.state.numberOfDisplayedNotifications--;
            qm.notifications.deleteById(trackingReminderNotification.id);
            qmService.goToState('app.measurementAdd', {
                reminderNotification: trackingReminderNotification,
                fromUrl: window.location.href
            });
        };
        $scope.editReminderSettingsByNotification = function(trackingReminderNotification){
            enlargeChromePopupIfNecessary();
            //$scope.notificationDividers[dividerIndex].trackingReminderNotifications[trackingReminderNotificationIndex].hide = true;
            trackingReminderNotification.hide = true;
            qm.notifications.numberOfPendingNotifications--;
            $scope.state.numberOfDisplayedNotifications--;
            var trackingReminder = trackingReminderNotification;
            trackingReminder.id = trackingReminderNotification.trackingReminderId;
            qmService.goToState('app.reminderAdd', {
                reminder: trackingReminder,
                fromUrl: window.location.href,
                fromState: $state.current.name
            });
        };
        $scope.skipAllForVariable = function(trackingReminderNotification, ev){
            qm.ui.preventDragAfterAlert(ev);
            qmService.notifications.skipAllForVariable(trackingReminderNotification, function(trackingReminderNotifications){
                getFilteredTrackingReminderNotificationsFromLocalStorage();
            }, function(error){
                hideInboxLoader();
            });
            return true;
        };
        // Triggered on a button click, or some other target
        $scope.showActionSheetForNotification = function(trackingReminderNotification, $event, dividerIndex, trackingReminderNotificationIndex){
            if(isGhostClick($event)){
                return;
            }
            enlargeChromePopupIfNecessary();
            $scope.state.trackingReminderNotification = trackingReminderNotification;
            $scope.state.trackingReminder = trackingReminderNotification;
            $scope.state.trackingReminder.id = trackingReminderNotification.trackingReminderId;
            $scope.state.variableObject = trackingReminderNotification;
            $scope.state.variableObject.variableId = trackingReminderNotification.variableId;
            $scope.state.variableObject.name = trackingReminderNotification.variableName;
            // Show the action sheet
            var buttons = [
                {text: 'Actions for ' + trackingReminderNotification.variableName},
                {text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
                qmService.actionSheets.actionSheetButtons.charts,
                qmService.actionSheets.actionSheetButtons.historyAllVariable,
                //qmService.actionSheets.actionSheetButtons.variableSettings
            ];
            if(trackingReminderNotification.outcome === true){
                buttons.push(qmService.actionSheets.actionSheetButtons.predictors);
            }else if(trackingReminderNotification.outcome === false){
                buttons.push(qmService.actionSheets.actionSheetButtons.outcomes);
            }else{
                qmLog.error("Why is outcome not boolean in this notification!?!?!", null, trackingReminderNotification)
            }
            for(var i = 0; i < trackingReminderNotification.trackAllActions.length; i++){
                buttons.push({
                    text: '<i class="icon ion-android-done-all"></i>' + trackingReminderNotification.trackAllActions[i].title,
                    trackAllIndex: i
                })
            }
            //buttons.push({ text: '<i class="icon ion-trash-a"></i>Skip All '});  // TODO: Why aren't we using the destructive button for this?
            var hideSheetForNotification = $ionicActionSheet.show({
                buttons: buttons,
                destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug('CANCELLED', null);
                },
                buttonClicked: function(index, button){
                    qmLog.debug('BUTTON CLICKED', null, index);
                    if(index === 0){
                        qmLog.debug('clicked variable name');
                        return false; // Don't hide
                    }
                    if(typeof button.trackAllIndex !== "undefined"){
                        $scope.trackAll(trackingReminderNotification, trackingReminderNotification.trackAllActions[button.trackAllIndex].modifiedValue);
                        return true; // Hide sheet
                    }
                    if(button.state){
                        qmService.goToState(button.state, {
                            variableObject: $scope.state.variableObject,
                            variableName: $scope.state.variableObject.name
                        });
                        return true; // Hide sheet
                    }
                    if(button.text.indexOf("Edit Reminder") !== -1){
                        $scope.editReminderSettingsByNotification($scope.state.trackingReminderNotification, dividerIndex, trackingReminderNotificationIndex);
                        return true; // Hide sheet
                    }
                    if(button.text.indexOf("Skip All") !== -1){
                        $scope.skipAllForVariable(trackingReminderNotification);
                        return true; // Hide sheet
                    }
                    qmLog.error("How should I handle this button?", {button: button});
                    //if(index === buttonIndex){qmService.goToVariableSettingsByName($scope.state.trackingReminderNotification.variableName);}
                    return true; // Hide sheet
                },
                destructiveButtonClicked: function(){
                    $scope.skipAllForVariable(trackingReminderNotification);
                    return true;
                }
            });
            //$timeout(function() {hideSheetForNotification();}, 20000);
        };
        $scope.hideHelpCard = function(helpCard, emailType){
            if(emailType){
                $scope.sendEmailAfterVerification(emailType);
            }
            helpCard.hide = true;
            $scope.defaultHelpCards = $scope.defaultHelpCards.filter(function(obj){
                return obj.id !== helpCard.id;
            });
            qmService.storage.deleteById('defaultHelpCards', helpCard.id);
        };
        function getDiscoveries(){
            if(!$scope.state.studiesResponse){
                qm.studyHelper.getStudiesFromApi({
                    limit: 10,
                    fallbackToAggregateCorrelations: true
                }, function(studiesResponse){
                    $scope.state.studiesResponse = studiesResponse;
                }, function(error){
                    qmLog.error(error);
                });
            }
        }
        function getVariableCategoryName(){
            if($stateParams.variableCategoryName){
                return $stateParams.variableCategoryName;
            }
            if(qm.urlHelper.getParam('variableCategoryName')){
                return qm.urlHelper.getParam('variableCategoryName');
            }
        }
    }]);
