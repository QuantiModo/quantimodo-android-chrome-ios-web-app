angular.module('starter')
// Handles the Notifications (inapp, push)
    .factory('notificationService',function($rootScope, $ionicPlatform, $state, $q, QuantiModo, timeService,
                                            bugsnagService, qmLocationService, variableCategoryService,
                                            pushNotificationService, localStorageService) {

        function createChromeAlarmNameFromTrackingReminder(trackingReminder) {
            var alarmName = {
                trackingReminderId: trackingReminder.id,
                variableName: trackingReminder.variableName,
                defaultValue: trackingReminder.defaultValue,
                abbreviatedUnitName: trackingReminder.abbreviatedUnitName,
                periodInMinutes: trackingReminder.reminderFrequency / 60,
                reminderStartTime: trackingReminder.reminderStartTime,
                startTrackingDate: trackingReminder.startTrackingDate,
                variableCategoryName: trackingReminder.variableCategoryName,
                variableDescription: trackingReminder.variableDescription,
                reminderEndTime: trackingReminder.reminderEndTime
            };
            return alarmName;
        }

        return {

            setOnUpdateAction: function(){
                cordova.plugins.notification.local.on("update", function(notification) {
                    console.log("onUpdate: Just updated this notification: ", notification);
                    cordova.plugins.notification.local.getAll(function (notifications) {
                        console.log("onUpdate: All notifications after update: ", notifications);
                    });
                });
            },

            setOnClickAction: function(QuantiModo) {
                var params = {};
                var locationTrackingNotificationId = 666;
                cordova.plugins.notification.local.on("click", function (notification) {
                    console.log("onClick: notification: ", notification);
                    var notificationData = null;
                    if(notification && notification.data){
                        notificationData = JSON.parse(notification.data);
                        console.log("onClick: notification.data : ", notificationData);
                    } else {
                        console.log("onClick: No notification.data provided");
                    }

                    if(notification.id !== locationTrackingNotificationId){
                        cordova.plugins.notification.local.clearAll(function () {
                            console.log("onClick: clearAll active notifications");
                        }, this);
                    }

                    if(notificationData && notificationData.trackingReminderNotificationId){
                        console.log("onClick: Notification was a reminder notification not reminder.  " +
                            "Skipping notification with id: " + notificationData.trackingReminderNotificationId);
                        params = {
                            trackingReminderNotificationId: notificationData.trackingReminderNotificationId
                        };
                    } else if (notificationData && notificationData.id) {
                        console.log("onClick: Notification was a reminder not a reminder notification.  " +
                            "Skipping next notification for reminder id: " + notificationData.id);
                        params = {
                            trackingReminderId: notificationData.id
                        };
                    } else {
                        console.log("onClick: No notification data provided. Going to remindersInbox page.");
                        $state.go('app.remindersInbox');
                    }

                    if(params.trackingReminderId || params.trackingReminderNotificationId ){
                        QuantiModo.skipTrackingReminderNotification(params, function(response){
                            console.log(response);
                        }, function(err){
                            console.error(err);
                            Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                        });
                        console.log("onClick: Notification data provided. Going to addMeasurement page. Data: ", notificationData);
                        //notificationService.decrementNotificationBadges();
                        $state.go('app.measurementAdd',
                            {
                                reminderNotification: notificationData,
                                fromState: 'app.remindersInbox'
                            });
                    } else {
                        console.log("onClick: No params.trackingReminderId || params.trackingReminderNotificationId. " +
                            "Should have already gone to remindersInbox page.");
                    }
                });
            },

            updateBadgesAndTextOnAllNotifications : function () {
                console.log("updateOrRecreateNotifications: Disabled until everything works right");
                return;

                if($rootScope.isIOS){
                    console.warn("updateBadgesAndTextOnAllNotifications: updating notifications on " +
                        "iOS might make duplicates");
                    //return;
                }
                $ionicPlatform.ready(function () {
                    if(!$rootScope.numberOfPendingNotifications){
                        $rootScope.numberOfPendingNotifications = 0;
                    }
                    cordova.plugins.notification.local.getAll(function (notifications) {
                        console.log("onTrigger.updateBadgesAndTextOnAllNotifications: " +
                            "All notifications ", notifications);
                        for (var i = 0; i < notifications.length; i++) {
                            if(notifications[i].badge === $rootScope.numberOfPendingNotifications){
                                console.warn("updateBadgesAndTextOnAllNotifications: Not updating notification because $rootScope.numberOfPendingNotifications" +
                                    " === notifications[i].badge", notifications[i]);
                                continue;
                            }
                            console.log('onTrigger.updateBadgesAndTextOnAllNotifications' +
                                ':Updating notification', notifications[i]);
                            var notificationSettings = {
                                id: notifications[i].id,
                                badge: $rootScope.numberOfPendingNotifications,
                                title: "Time to track!",
                                text: "Add a tracking reminder!"
                            };
                            if($rootScope.numberOfPendingNotifications > 0){
                                notificationSettings.text = $rootScope.numberOfPendingNotifications + " tracking " +
                                    "reminder notifications";
                            }
                            cordova.plugins.notification.local.update(notificationSettings);
                        }
                    });
                });
            },

            setOnTriggerAction: function() {

                function getNotificationsFromApiAndClearOrUpdateLocalNotifications() {
                    var currentDateTimeInUtcStringPlus5Min = timeService.getCurrentDateTimeInUtcStringPlusMin(5);
                    var params = {
                        reminderTime: '(lt)' + currentDateTimeInUtcStringPlus5Min
                    };
                    QuantiModo.getTrackingReminderNotifications(params, function (response) {
                        if (response.success) {
                            $rootScope.trackingReminderNotifications = response.data;
                            $rootScope.numberOfPendingNotifications = $rootScope.trackingReminderNotifications.length;
                            $rootScope.trackingRemindersNotifications =
                                variableCategoryService.attachVariableCategoryIcons(trackingReminderNotifications);
                            localStorageService.setItem('trackingReminderNotifications',
                                JSON.stringify($rootScope.trackingRemindersNotifications));

                            if (window.chrome && window.chrome.browserAction) {
                                chrome.browserAction.setBadgeText({
                                    text: String($rootScope.numberOfPendingNotifications)
                                });
                            }

                            if (!$rootScope.numberOfPendingNotifications) {
                                console.log("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: No notifications from API so clearAll active notifications");
                                cordova.plugins.notification.local.clearAll(function () {
                                    console.log("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: cleared all active notifications");
                                }, this);
                            } else {
                                console.log("onTrigger.getNotificationsFromApiAndClearOrUpdateLocalNotifications: notifications from API", $rootScope.trackingReminderNotifications);
                                $rootScope.updateOrRecreateNotifications();
                            }
                        }
                    }, function (err) {
                        Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                    });
                }

                function clearOtherLocalNotifications(currentNotification) {
                    console.log("onTrigger.clearOtherLocalNotifications: Clearing notifications except the one " +
                        "that just triggered...");
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.getTriggeredIds(function (triggeredNotifications) {
                            console.log("onTrigger.clearOtherLocalNotifications: found triggered notifications " +
                                "before removing current one: " + JSON.stringify(triggeredNotifications));
                            if (triggeredNotifications.length < 1) {
                                console.warn("onTrigger.clearOtherLocalNotifications: Triggered notifications is " +
                                    "empty so maybe it's not working.");
                            } else {
                                triggeredNotifications.splice(triggeredNotifications.indexOf(currentNotification.id), 1);
                                console.log("onTrigger.clearOtherLocalNotifications: found triggered notifications " +
                                    "after removing current one: " + JSON.stringify(triggeredNotifications));
                                cordova.plugins.notification.local.clear(triggeredNotifications);
                            }
                        });
                    });
                }

                function clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification) {
                    console.log("onTrigger.clearNotificationIfOutsideAllowedTimes: Checking notification time limits",
                        currentNotification);
                    if (notificationData.reminderFrequency < 86400) {
                        var currentTimeInLocalString = timeService.getCurrentTimeInLocalString();
                        var reminderStartTimeInLocalString = timeService.getLocalTimeStringFromUtcString(notificationData.reminderStartTime);
                        var reminderEndTimeInLocalString = timeService.getLocalTimeStringFromUtcString(notificationData.reminderEndTime);
                        if (currentTimeInLocalString < reminderStartTimeInLocalString) {
                            $ionicPlatform.ready(function () {
                                cordova.plugins.notification.local.clear(currentNotification.id, function (currentNotification) {
                                    console.log("onTrigger: Cleared notification because current time " +
                                        currentTimeInLocalString + " is before reminder start time" +
                                        reminderStartTimeInLocalString, currentNotification);
                                });
                            });
                        }
                        if (currentTimeInLocalString > reminderEndTimeInLocalString) {
                            $ionicPlatform.ready(function () {
                                cordova.plugins.notification.local.clear(currentNotification.id, function (currentNotification) {
                                    console.log("onTrigger: Cleared notification because current time " +
                                        currentTimeInLocalString + " is before reminder start time" +
                                        reminderStartTimeInLocalString, currentNotification);
                                });
                            });
                        }
                    }
                }

                cordova.plugins.notification.local.on("trigger", function (currentNotification) {

/*                   I don't think this is necessary because we're going to check the API anyway
                    if(currentNotification.badge < 1){
                        $ionicPlatform.ready(function () {
                            cordova.plugins.notification.local.clearAll(function () {
                                console.warn("onTrigger: Cleared all notifications because badge is less than 1");
                            });
                        });
                        return;
                    }
                    */

                    try {
                        qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
                        console.log("onTrigger: just triggered this notification: ",  currentNotification);
                        var notificationData = null;
                        if(currentNotification && currentNotification.data){
                            notificationData = JSON.parse(currentNotification.data);
                            console.log("onTrigger: notification.data : ", notificationData);
                            clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification);
                        } else {
                            console.log("onTrigger: No notification.data provided");
                        }

                        if(!notificationData){
                            console.log("onTrigger: This is a generic notification that sends to inbox, so we'll " +
                                "check the API for pending notifications.");
                            getNotificationsFromApiAndClearOrUpdateLocalNotifications();
                        }

                        clearOtherLocalNotifications(currentNotification);
                    } catch (err) {
                        console.error('onTrigger error');
                        bugsnagService.reportError(err);
                        console.error(err);
                    }
                });
            },

            decrementNotificationBadges: function(){
                if($rootScope.numberOfPendingNotifications > 0){
                    $rootScope.numberOfPendingNotifications = $rootScope.numberOfPendingNotifications - 1;
                    if (window.chrome && window.chrome.browserAction) {
                        chrome.browserAction.setBadgeText({
                            text: String($rootScope.numberOfPendingNotifications)
                        });
                    }
                    this.updateOrRecreateNotifications();
                }
            },

            setNotificationBadge: function(numberOfPendingNotifications){
                console.log("setNotificationBadge: numberOfPendingNotifications is " + numberOfPendingNotifications);
                $rootScope.numberOfPendingNotifications = numberOfPendingNotifications;
                if (window.chrome && window.chrome.browserAction) {
                    chrome.browserAction.setBadgeText({
                        text: String($rootScope.numberOfPendingNotifications)
                    });
                }
                this.updateOrRecreateNotifications();
            },

            updateOrRecreateNotifications: function() {
                console.log("updateOrRecreateNotifications: Disabled until everything works right");
                return;

                if($rootScope.isAndroid){
                    console.log("updateOrRecreateNotifications: Updating " +
                        "notifications for Android because Samsung limits number of notifications " +
                        "that can be scheduled in a day.");
                    this.updateBadgesAndTextOnAllNotifications();
                }
                if($rootScope.isIOS){
                    console.warn('updateOrRecreateNotifications: Updating local notifications on iOS might ' +
                        'make duplicates and we cannot recreate here because we will lose the previously set interval');
                    this.updateBadgesAndTextOnAllNotifications();

                    //console.log("updateOrRecreateNotifications: iOS makes duplicates when updating for some reason so we just cancel all and schedule again");
                    //this.scheduleGenericNotification(notificationSettings);
                }
            },

            scheduleSingleMostFrequentNotification: function(trackingRemindersFromApi) {
                if($rootScope.showOnlyOneNotification === false){
                    console.warn("scheduleSingleMostFrequentNotification: $rootScope.showOnlyOneNotification === false" +
                        " so we shouldn't be calling this function");
                    return;
                }

                var shortestInterval = 86400;
                var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
                    for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                        if(trackingRemindersFromApi[i].reminderFrequency < shortestInterval){
                            shortestInterval = trackingRemindersFromApi[i].reminderFrequency;
                            at.setUTCSeconds(trackingRemindersFromApi[i].nextReminderTimeEpochSeconds);
                        }
                    }
                    var notificationSettings = {
                        every: shortestInterval/60,
                        at: at
                    };

                    if($rootScope.previousSingleNotificationSettings && notificationSettings === $rootScope.previousSingleNotificationSettings){
                        console.log("scheduleSingleMostFrequentNotification: Notification settings haven't changed so" +
                            " no need to scheduleGenericNotification", notificationSettings);
                        return;
                    }
                    console.log("scheduleSingleMostFrequentNotification: Going to schedule generic notification",
                        notificationSettings);
                    $rootScope.previousSingleNotificationSettings = notificationSettings;
                    this.scheduleGenericNotification(notificationSettings);
                }
            },

            scheduleAllNotificationsByTrackingReminders: function(trackingRemindersFromApi) {
                if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
                    for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                        if($rootScope.showOnlyOneNotification === false){
                            try {
                                this.scheduleNotificationByReminder(trackingRemindersFromApi[i]);
                            } catch (err) {
                                console.error('scheduleAllNotificationsByTrackingReminders error');
                                bugsnagService.reportError(err);
                                console.error(err);
                            }
                        }
                    }
                    this.cancelNotificationsForDeletedReminders(trackingRemindersFromApi);
                }
            },

            cancelNotificationsForDeletedReminders: function(trackingRemindersFromApi) {

                function cancelChromeExtensionNotificationsForDeletedReminders(trackingRemindersFromApi) {
                    chrome.alarms.getAll(function(scheduledTrackingReminders) {
                        for (var i = 0; i < scheduledTrackingReminders.length; i++) {
                            var existingReminderFoundInApiResponse = false;
                            for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                                var alarmName = createChromeAlarmNameFromTrackingReminder(trackingRemindersFromApi[j]);
                                if (JSON.stringify(alarmName) === scheduledTrackingReminders[i].name) {
                                    console.log('Server has a reminder matching alarm ' + JSON.stringify(scheduledTrackingReminders[i]));
                                    existingReminderFoundInApiResponse = true;
                                }
                            }
                            if(!existingReminderFoundInApiResponse) {
                                console.log('No api reminder found matching so cancelling this alarm ', JSON.stringify(scheduledTrackingReminders[i]));
                                chrome.alarms.clear(scheduledTrackingReminders[i].name);
                            }
                        }
                    });
                }

                function cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi) {
                    cordova.plugins.notification.local.getAll(function (scheduledNotifications) {
                        console.log("cancelIonicNotificationsForDeletedReminders: notification.local.getAll " +
                            "scheduledNotifications: ",
                            scheduledNotifications);
                        for (var i = 0; i < scheduledNotifications.length; i++) {
                            var existingReminderFoundInApiResponse = false;
                            for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                                if (trackingRemindersFromApi[j].id === scheduledNotifications[i].id) {
                                    console.log('Server returned a reminder matching' + trackingRemindersFromApi[j]);
                                    existingReminderFoundInApiResponse = true;
                                }
                            }
                            if(!existingReminderFoundInApiResponse) {
                                console.log('Matching API reminder not found. Cancelling scheduled notification ' + JSON.stringify(scheduledNotifications[i]));
                                cordova.plugins.notification.local.cancel(scheduledNotifications[i].id, function (cancelledNotification) {
                                    console.log("Canceled notification ", cancelledNotification);
                                });
                            }
                        }
                    });

                }

                if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                    cancelChromeExtensionNotificationsForDeletedReminders(trackingRemindersFromApi);
                }

                $ionicPlatform.ready(function () {
                    if (typeof cordova !== "undefined") {
                        console.log('cancelIonicNotificationsForDeletedReminders');
                        cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi);
                    }
                });

            },

            scheduleNotificationByReminder: function(trackingReminder){

                if($rootScope.showOnlyOneNotification === true){
                    console.warn("Not going to scheduleNotificationByReminder because $rootScope.showOnlyOneNotification === true");
                    return;
                }


                if(!$rootScope.user.earliestReminderTime){
                    console.error("Cannot schedule notifications because $rootScope.user.earliestReminderTime not set",
                        $rootScope.user);
                    return;
                }

                if(!$rootScope.user.latestReminderTime){
                    console.error("Cannot schedule notifications because $rootScope.user.latestReminderTime not set",
                        $rootScope.user);
                    return;
                }

                function createOrUpdateIonicNotificationForTrackingReminder(notificationSettings) {
                    cordova.plugins.notification.local.isPresent(notificationSettings.id, function (present) {

                        if (!present) {
                            console.log("createOrUpdateIonicNotificationForTrackingReminder: Creating notification " +
                                "because not already set for " +
                                JSON.stringify(notificationSettings));
                            cordova.plugins.notification.local.schedule(notificationSettings,
                                function () {
                                    console.log('createOrUpdateIonicNotificationForTrackingReminder: notification ' +
                                        'scheduled', notificationSettings);
                                });
                        }

                        if (present) {
                            console.log('createOrUpdateIonicNotificationForTrackingReminder: Updating notification',
                                notificationSettings);
                            cordova.plugins.notification.local.update(notificationSettings,
                                            function () {
                                                console.log('createOrUpdateIonicNotificationForTrackingReminder: ' +
                                                    'notification updated', notificationSettings);
                                            });
                        }
                    });
                }

                function scheduleAndroidNotificationByTrackingReminder(trackingReminder) {

                    var notificationSettings = {
                        autoClear: true,
                        color: undefined,
                        data: trackingReminder,
                        led: undefined,
                        sound: "file://sound/silent.ogg",
                        ongoing: false,
                        title: "Track " + trackingReminder.variableName,
                        text: "Tap to record measurement",
                        icon: 'ic_stat_icon_bw',
                        id: trackingReminder.id
                    };

                    if($rootScope.numberOfPendingNotifications){
                        notificationSettings.badge = $rootScope.numberOfPendingNotifications;
                    }

                    var dayInMinutes = 24 * 60;
                    notificationSettings.every = dayInMinutes;

                    console.log("Trying to create Android notification for " + JSON.stringify(notificationSettings));
                    //notificationSettings.sound = "res://platform_default";
                    //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                    var totalSeconds = 0;
                    var at;
                    while (totalSeconds < 86400) {
                        at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                        at.setUTCSeconds(trackingReminder.nextReminderTimeEpochSeconds + totalSeconds);
                        notificationSettings.at = at;
                        notificationSettings.id = parseInt(trackingReminder.id + "000" +  moment(at).format("HHMMSS"));
                        totalSeconds = totalSeconds + trackingReminder.reminderFrequency;
                        if(moment(at).format("HH:MM:SS") < $rootScope.user.latestReminderTime &&
                            moment(at).format("HH:MM:SS") > $rootScope.user.earliestReminderTime ){
                            console.log("Scheduling notification because it is within time limits: " +
                                $rootScope.user.earliestReminderTime + " to " + $rootScope.user.latestReminderTime,
                                notificationSettings);
                            createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                        } else {
                            console.log("NOT scheduling notification because it is outside time limits: " +
                                $rootScope.user.earliestReminderTime + " to " + $rootScope.user.latestReminderTime,
                                notificationSettings);
                        }
                    }
                }

                function scheduleIosNotificationByTrackingReminder(trackingReminder) {

                    // Using milliseconds might cause app to crash with this error:
                    // NSInvalidArgumentException·unable to serialize userInfo: Error Domain=NSCocoaErrorDomain Code=3851 "Property list invalid for format: 200 (property lists cannot contain objects of type 'CFNull')" UserInfo={NSDeb
                    var intervalInMinutes  = trackingReminder.reminderFrequency / 60;
                    var everyString = 'day';
                    if (intervalInMinutes === 1) {everyString = 'minute';}
                    var numberOfPendingNotifications = 0;
                    if($rootScope.numberOfPendingNotifications){
                        numberOfPendingNotifications = $rootScope.numberOfPendingNotifications;
                    }
                    var notificationSettings = {
                        //autoClear: true,  iOS doesn't recognize this property
                        badge: numberOfPendingNotifications,
                        //color: undefined,  iOS doesn't recognize this property
                        data: trackingReminder,
                        //led: undefined,  iOS doesn't recognize this property
                        //ongoing: false,  iOS doesn't recognize this property
                        sound: "file://sound/silent.ogg",
                        title: "Track " + trackingReminder.variableName,
                        text: "Record a measurement",
                        at: at,
                        //icon: config.appSettings.mobileNotificationImage,  iOS doesn't recognize this property
                        id: trackingReminder.id
                    };

                    notificationSettings.every = everyString;

                    //notificationSettings.sound = "res://platform_default";
                    //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                    var totalSeconds = 0;
                    var at;
                    while (totalSeconds < 86400) {
                        console.log("iOS requires second, minute, hour, day, week, month, year so converting " +
                            intervalInMinutes + " minutes to string: " + everyString);
                        at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                        at.setUTCSeconds(trackingReminder.nextReminderTimeEpochSeconds + totalSeconds);
                        notificationSettings.at = at;
                        notificationSettings.id = parseInt(trackingReminder.id + "000" +  moment(at).format("HHMMSS"));
                        totalSeconds = totalSeconds + trackingReminder.reminderFrequency;
                        if(moment(at).format("HH:MM:SS") < $rootScope.user.latestReminderTime &&
                            moment(at).format("HH:MM:SS") > $rootScope.user.earliestReminderTime ){
                            createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                        } else {
                            console.log("Not scheduling notification because it's outside time limits",
                                notificationSettings);
                        }
                    }
                }

                function scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder) {
                    var alarmInfo = {};
                    alarmInfo.when =  trackingReminder.nextReminderTimeEpochSeconds * 1000;
                    alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
                    var alarmName = createChromeAlarmNameFromTrackingReminder(trackingReminder);
                    alarmName = JSON.stringify(alarmName);

                    chrome.alarms.getAll(function(alarms) {
                        var hasAlarm = alarms.some(function(oneAlarm) {
                            return oneAlarm.name === alarmName;
                        });
                        if (hasAlarm) {
                            console.log('Already have an alarm for ' + alarmName);
                        }
                        if (!hasAlarm) {
                            chrome.alarms.create(alarmName, alarmInfo);
                            console.log('Created alarm for alarmName ' + alarmName, alarmInfo);
                        }
                    });
                }

                if(trackingReminder.reminderFrequency > 0){
                    $ionicPlatform.ready(function () {
                        //console.log('Ionic is ready to schedule notifications');
                        if (typeof cordova !== "undefined") {
                            cordova.plugins.notification.local.getAll(function (notifications) {
                                console.log("scheduleNotificationByReminder: All notifications before scheduling", notifications);
                                for(var i = 0; i < notifications.length; i++){
                                    if(notifications[i].every * 60 === trackingReminder.reminderFrequency &&
                                        notifications[i].id === trackingReminder.id){
                                        console.warn("already have a local notification with this trackingReminder's id " +
                                            "and frequency.  Might be" +
                                            " pointlessly rescheduling", trackingReminder);
                                    }
                                }
                                if (ionic.Platform.isAndroid()) {
                                    scheduleAndroidNotificationByTrackingReminder(trackingReminder);
                                } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                                    scheduleIosNotificationByTrackingReminder(trackingReminder);
                                }
                            });
                        }
                    });
                    if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder);
                    }
                }

            },

            scheduleGenericNotification: function(notificationSettings){

                if(!notificationSettings.every){
                    console.error("scheduleGenericNotification: Called scheduleGenericNotification without providing " +
                        "notificationSettings.every " +
                        notificationSettings.every + ". Not going to scheduleGenericNotification.");
                    return;
                }

                if(!notificationSettings.at){
                    var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                    var epochSecondsPlus15Minutes = new Date() / 1000 + 15 * 60;
                    at.setUTCSeconds(epochSecondsPlus15Minutes);
                    notificationSettings.at = at;
                }

                if(!notificationSettings.id){
                    notificationSettings.id = config.appSettings.primaryOutcomeVariableDetails.id;
                }

                notificationSettings.title = "Time to track!";
                notificationSettings.text = "Open reminder inbox";
                notificationSettings.sound = "file://sound/silent.ogg";
                notificationSettings.badge = 0;

                if($rootScope.numberOfPendingNotifications > 0) {
                    notificationSettings.text = $rootScope.numberOfPendingNotifications + " tracking reminder notifications";
                    notificationSettings.badge = $rootScope.numberOfPendingNotifications;
                }
                if($rootScope.isAndroid){
                    notificationSettings.icon = 'ic_stat_icon_bw';
                }

                if($rootScope.isIOS){
                    var everyString = 'minute';
                    if (notificationSettings.every > 1) {everyString = 'hour';}
                    if (notificationSettings.every > 60) {everyString = 'day';}
                    console.warn("scheduleGenericIosNotification: iOS requires second, minute, hour, day, week, " +
                        "month, year so converting " +
                        notificationSettings.every + " minutes to string: " + everyString);
                    // Don't include notificationSettings.icon for iOS. I keep seeing "Unknown property: icon" in Safari console
                    notificationSettings.every = everyString;
                }

                function scheduleGenericChromeExtensionNotification(intervalInMinutes) {
                    console.log('scheduleGenericChromeExtensionNotification: Reminder notification interval is ' +
                        intervalInMinutes + ' minutes');
                    var alarmInfo = {periodInMinutes: intervalInMinutes};
                    console.log("scheduleGenericChromeExtensionNotification: clear genericTrackingReminderNotificationAlarm");
                    chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
                    console.log("scheduleGenericChromeExtensionNotification: create genericTrackingReminderNotificationAlarm", alarmInfo);
                    chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
                    console.log("Alarm set, every " + intervalInMinutes + " minutes");
                }

                $ionicPlatform.ready(function () {
                    if (typeof cordova !== "undefined") {
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            console.log("scheduleGenericNotification: All notifications before scheduling", notifications);
                            if(notifications[0] && notifications[0].length === 1 &&
                                notifications[0].every === notificationSettings.every) {
                                console.warn("Not scheduling generic notification because we already have one with " +
                                    "the same frequency.");
                                return;
                            }

                            cordova.plugins.notification.local.cancelAll(function () {
                                console.log('cancelAllNotifications: notifications have been cancelled');
                                cordova.plugins.notification.local.getAll(function (notifications) {
                                    console.log("cancelAllNotifications: All notifications after cancelling", notifications);
                                    cordova.plugins.notification.local.schedule(notificationSettings, function () {
                                        console.log('scheduleGenericNotification: notification scheduled' + JSON.stringify(notificationSettings));
                                    });
                                });
                            });
                        });
                    }
                });
                if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                    scheduleGenericChromeExtensionNotification(notificationSettings.every);
                }

            },

            cancelIonicNotificationById: function(notificationId){
                $ionicPlatform.ready(function () {
                    if (typeof cordova !== "undefined") {
                        console.log('cancelIonicNotificationById ' + notificationId);
                        cordova.plugins.notification.local.cancel(notificationId, function (cancelledNotification) {
                            console.log("Canceled notification ", cancelledNotification);
                        });
                    }
                });
            },

            scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: function(trackingReminders){

                if(!$rootScope.isMobile && !$rootScope.isChromeExtension){
                    console.log('Not scheduling notifications because we are not mobile or Chrome extension');
                    return;
                }

                if($rootScope.isAndroid){
                    this.cancelAllNotifications();
                    console.log('Not scheduling local notifications because Android uses push notifications');
                    return;
                }

                if(!trackingReminders || !trackingReminders[0]){
                    console.log('Not scheduling notifications because we do not have any reminders');
                    return;
                }

                var localDailyReminderNotificationTimesFromApi =
                    trackingReminders[0].localDailyReminderNotificationTimesForAllReminders;
                console.log('localDailyReminderNotificationTimesFromApi: ' +
                    JSON.stringify(localDailyReminderNotificationTimesFromApi));
                if(localDailyReminderNotificationTimesFromApi.length < 1){
                    console.warn('Cannot schedule notifications because ' +
                        'trackingReminders[0].localDailyReminderNotificationTimes is empty.');
                    return;
                }

                if($rootScope.isMobile){
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.getAll(function (existingLocalNotifications) {
                            var notificationSettings = {
                                every: 60 * 24,
                                title: "How are you?",
                                text: "Time to track!",
                                sound: "file://sound/silent.ogg"
                            };
                            console.log("scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: All " +
                                "existing notifications before scheduling", existingLocalNotifications);
                            for (var i = 0; i < existingLocalNotifications.length; i++) {
                                var existingReminderNotificationTimeFoundInApiResponse = false;
                                for (var j = 0; j < localDailyReminderNotificationTimesFromApi.length; j++) {
                                    if (parseInt(localDailyReminderNotificationTimesFromApi[j].replace(":", "")) ===
                                            existingLocalNotifications[i].id &&
                                        existingLocalNotifications[i].text === notificationSettings.text
                                    ) {
                                        console.log('Server has a reminder notification matching local notification ' +
                                            JSON.stringify(existingLocalNotifications[i]));
                                        existingReminderNotificationTimeFoundInApiResponse = true;
                                    }
                                }
                                if(!existingReminderNotificationTimeFoundInApiResponse) {
                                    console.log('No matching notification time found so cancelling this local notification ',
                                        JSON.stringify(existingLocalNotifications[i]));
                                    cordova.plugins.notification.local.cancel(existingLocalNotifications[i].id);
                                }
                            }
                            for (var k = 0; k < localDailyReminderNotificationTimesFromApi.length; k++) {
                                console.log('localDailyReminderNotificationTimesFromApi[k] is ',
                                    localDailyReminderNotificationTimesFromApi[k]);
                                var existingLocalNotificationScheduled = false;
                                for (var l = 0; l < existingLocalNotifications.length; l++) {
                                    if(!localDailyReminderNotificationTimesFromApi[k]){
                                        console.error('localDailyReminderNotificationTimesFromApi[' + k + '] is not defined! ' +
                                            'localDailyReminderNotificationTimesFromApi: ', localDailyReminderNotificationTimesFromApi);
                                    }
                                    if (parseInt(localDailyReminderNotificationTimesFromApi[k].replace(":", "")) ===
                                        existingLocalNotifications[l].id &&
                                        existingLocalNotifications[l].text === notificationSettings.text) {
                                        console.log('Server has a reminder notification matching local notification ' +
                                            JSON.stringify(existingLocalNotifications[l]));
                                        existingLocalNotificationScheduled = true;
                                    }
                                }
                                if(!existingLocalNotificationScheduled) {
                                    if(!localDailyReminderNotificationTimesFromApi[k]){
                                        console.error("Did not get localDailyReminderNotificationTimesFromApi", trackingReminders);
                                    }
                                    var at = new Date();
                                    var splitUpLocalDailyReminderNotificationTimesFromApi =
                                        localDailyReminderNotificationTimesFromApi[k].split(":");
                                    at.setHours(splitUpLocalDailyReminderNotificationTimesFromApi[0]);
                                    at.setMinutes(splitUpLocalDailyReminderNotificationTimesFromApi[1]);
                                    var now = new Date();
                                    if(at < now){
                                        at = new Date(at.getTime() + 60 * 60 * 24 * 1000);
                                    }
                                    console.log('No existing local notification so scheduling ',
                                        JSON.stringify(localDailyReminderNotificationTimesFromApi[k]));
                                    notificationSettings.at = at;
                                    notificationSettings.id = parseInt(localDailyReminderNotificationTimesFromApi[k].replace(":", ""));
                                    if($rootScope.numberOfPendingNotifications > 0) {
                                        notificationSettings.badge = $rootScope.numberOfPendingNotifications;
                                    }
                                    if($rootScope.isAndroid){
                                        notificationSettings.icon = 'ic_stat_icon_bw';
                                    }
                                    if($rootScope.isIOS){
                                        notificationSettings.every = 'day';
                                    }
                                    if(!(notificationSettings.at instanceof Date)){
                                      var errorMessage = 'Skipping notification creation because notificationSettings.at is not an instance of Date: ' + JSON.stringify(notificationSettings);
                                      console.error(errorMessage);
                                      bugsnagService.reportError(errorMessage);
                                      return;
                                    }
                                    if(!isNaN(notificationSettings.at) &&
                                            parseInt(Number(notificationSettings.at)) === notificationSettings.at &&
                                            !isNaN(parseInt(notificationSettings.at, 10))){
                                        var intErrorMessage = 'Skipping notification creation because notificationSettings.at is not an instance of Date: ' + JSON.stringify(notificationSettings);
                                        console.error(intErrorMessage);
                                        bugsnagService.reportError(intErrorMessage);
                                        return;
                                    }
                                    try{
                                        console.log('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes: ' +
                                            'About to schedule this notification: ',
                                            JSON.stringify(notificationSettings));
                                        cordova.plugins.notification.local.schedule(notificationSettings, function (notification) {
                                            console.log('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes:' +
                                                ' notification scheduled: ' + JSON.stringify(notification));
                                        });
                                    } catch (error) {
                                        bugsnagService.reportError(error);
                                        console.error('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes error: ' + error);
                                        console.error('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes' +
                                            ' notificationSettings: ' + JSON.stringify(notificationSettings));
                                    }
                                }
                            }
                        });
                    });
                }

                if($rootScope.isChromeExtension){
                    chrome.alarms.getAll(function(existingLocalAlarms) {
                        console.log('Existing Chrome alarms before scheduling: ', existingLocalAlarms);
                        for (var i = 0; i < existingLocalAlarms.length; i++) {
                            var existingAlarmTimeFoundInApiResponse = false;
                            for (var j = 0; j < localDailyReminderNotificationTimesFromApi.length; j++) {
                                if (existingLocalAlarms[i].name === localDailyReminderNotificationTimesFromApi[j]) {
                                    console.log('Server has a reminder notification time matching time ' + existingLocalAlarms[i].name);
                                    existingAlarmTimeFoundInApiResponse = true;
                                }
                            }
                            if(!existingAlarmTimeFoundInApiResponse) {
                                console.log('No api reminder found matching so cancelling this alarm ', JSON.stringify(existingLocalAlarms[i]));
                                chrome.alarms.clear(existingLocalAlarms[i].name);
                            }
                        }
                        for (var k = 0; k < localDailyReminderNotificationTimesFromApi.length; k++) {
                            var existingAlarmScheduled = false;
                            for (var l = 0; l < existingLocalAlarms.length; l++) {
                                if (existingLocalAlarms[l].name === localDailyReminderNotificationTimesFromApi[k]) {
                                    console.log('Server has a reminder notification matching local notification ' +
                                        JSON.stringify(existingLocalAlarms[i]));
                                    existingAlarmScheduled = true;
                                }
                            }
                            if(!existingAlarmScheduled) {
                                if(!localDailyReminderNotificationTimesFromApi[k]){
                                    console.error('localDailyReminderNotificationTimesFromApi[' + k + '] is not defined! ' +
                                        'localDailyReminderNotificationTimesFromApi: ', localDailyReminderNotificationTimesFromApi);
                                }
                                var alarmInfo = {};
                                var at = new Date(); // The 0 there is the key, which sets the date to the epoch
                                var splitUpLocalDailyReminderNotificationTimesFromApi =
                                    localDailyReminderNotificationTimesFromApi[k].split(":");
                                at.setHours(splitUpLocalDailyReminderNotificationTimesFromApi[0]);
                                at.setMinutes(splitUpLocalDailyReminderNotificationTimesFromApi[1]);
                                alarmInfo.when =  at.getTime();
                                alarmInfo.periodInMinutes = 24 * 60;
                                console.log('No existing local notification so scheduling ',
                                    alarmInfo);
                                chrome.alarms.create(localDailyReminderNotificationTimesFromApi[k], alarmInfo);
                            }
                        }

                    });
                }
            },

            // cancel all existing notifications
            cancelAllNotifications: function(){

                var deferred = $q.defer();
                if(typeof cordova !== "undefined"){
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.cancelAll(function () {
                            console.log('cancelAllNotifications: notifications have been cancelled');
                            cordova.plugins.notification.local.getAll(function (notifications) {
                                console.log("cancelAllNotifications: All notifications after cancelling", notifications);
                            });
                            deferred.resolve();
                        });
                    });
                } else if (typeof chrome !== "undefined" && typeof chrome.alarms !== "undefined"){
                    chrome.alarms.clearAll(function (){
                        console.log('Cleared all Chrome alarms!');
                        deferred.resolve();
                    });
                } else {
                    console.log('cancelAllNotifications: Chrome and cordova are not defined.');
                }

                return deferred.promise;
            }
        };
    });
