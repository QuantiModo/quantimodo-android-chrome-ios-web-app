angular.module('starter')
// Handles the Notifications (inapp, push)
    .factory('notificationService',function($rootScope, $ionicPlatform, $state, localStorageService, $q, QuantiModo){

        return {

            setOnClickAction: function(QuantiModo) {
                var params = {};
                cordova.plugins.notification.local.on("click", function (notification) {

                    var notificationData = JSON.parse(notification.data);
                    console.debug("onClick: Notification data : ", notificationData);

                    // cordova.plugins.notification.local.clearAll(function () {
                    //     console.debug("clearAll active notifications");
                    // }, this);

                    if(notificationData.trackingReminderNotificationId){
                        console.debug("onClick: Notification was a reminder notification not reminder.  Skipping notification with id: " + notificationData.trackingReminderNotificationId);
                        params = {
                            trackingReminderNotificationId: notificationData.trackingReminderNotificationId
                        };
                    } else if (notificationData.id) {
                        console.debug("onClick: Notification was a reminder not a reminder notification.  Skipping next notification for reminder id: " + notificationData.id);
                        params = {
                            trackingReminderId: notificationData.id
                        };
                    }

                    //QuantiModo.skipTrackingReminder(params);

                    QuantiModo.skipTrackingReminder(params, function(response){
                        console.debug(response);
                    }, function(err){
                        console.error(err);
                        Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                    });

                    if(notificationData && notificationData.id){
                        console.debug("onClick: Notification data provided. Going to addMeasurement page. Data: ", notificationData);
                        //notificationService.decrementNotificationBadges();
                        $state.go('app.measurementAdd',
                            {
                                reminder: notificationData,
                                fromState: 'app.remindersInbox'
                            });
                    } else {
                        console.debug("No notification data provided. Going to remindersInbox page.");
                        $state.go('app.remindersInbox');
                    }
                });
            },

            setOnTriggerAction: function() {
                console.debug("Creating notification trigger event to clear other notifications");
                cordova.plugins.notification.local.on("trigger", function (currentNotification) {

                    try {
                        console.debug("just triggered this notification: ",  currentNotification);
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            console.debug("All notifications ", notifications);
                        });

                        cordova.plugins.notification.local.getTriggeredIds(function (triggeredNotifications) {
                            console.debug("found triggered notifications before removing current one: " + JSON.stringify(triggeredNotifications));
                            if (triggeredNotifications.length < 1) {
                                console.warn("Triggered notifications is empty so maybe it's not working.");
                            } else {
                                triggeredNotifications.splice(triggeredNotifications.indexOf(currentNotification.id), 1);
                                console.debug("found triggered notifications after removing current one: " + JSON.stringify(triggeredNotifications));
                                cordova.plugins.notification.local.clear(triggeredNotifications);
                            }
                        });
                    } catch (err) {
                        console.error(err);
                    }
                });
            },

            decrementNotificationBadges: function(){
                if($rootScope.numberOfPendingNotifications > 0){
                    $rootScope.numberOfPendingNotifications = $rootScope.numberOfPendingNotifications - 1;
                    this.updateNotificationBadges($rootScope.numberOfPendingNotifications);
                }
            },

            updateNotificationBadges: function(numberOfPendingNotifications) {
                if($rootScope.isIOS || $rootScope.isAndroid) {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.getAll(function (notifications) {
                            console.debug("All notifications ", notifications);
                            for (var i = 0; i < notifications.length; i++) {
                                console.log('Updating notification', notifications[i]);
                                cordova.plugins.notification.local.update({
                                    id: notifications[i].id,
                                    badge: numberOfPendingNotifications
                                });
                            }
                        });
                    });
                }
            },

            scheduleAllNotifications: function(trackingRemindersFromApi) {
                if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
                    for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                        if($rootScope.combineNotifications !== "true"){
                            this.scheduleNotificationByReminder(trackingRemindersFromApi[i]);
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
                                var alarmName = {
                                    reminderId: trackingRemindersFromApi[j].id,
                                    variableName: trackingRemindersFromApi[j].variableName,
                                    periodInMinutes: trackingRemindersFromApi[j].reminderFrequency / 60,
                                    reminderStartTime: trackingRemindersFromApi[j].reminderStartTime,
                                    startTrackingDate: trackingRemindersFromApi[j].startTrackingDate
                                };
                                if (JSON.stringify(alarmName) === scheduledTrackingReminders[i].name) {
                                    console.debug('Server has a reminder matching alarm ' + JSON.stringify(scheduledTrackingReminders[i]));
                                    existingReminderFoundInApiResponse = true;
                                }
                            }
                            if(!existingReminderFoundInApiResponse) {
                                console.debug('No api reminder found matching so cancelling this alarm ', JSON.stringify(scheduledTrackingReminders[i]));
                                chrome.alarms.clear(scheduledTrackingReminders[i].name);
                            }
                        }
                    });
                }

                function cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi) {
                    cordova.plugins.notification.local.getAll(function (scheduledNotifications) {
                        for (var i = 0; i < scheduledNotifications.length; i++) {
                            var existingReminderFoundInApiResponse = false;
                            for (var j = 0; j < trackingRemindersFromApi.length; j++) {
                                if (trackingRemindersFromApi[j].id === scheduledNotifications[i].id) {
                                    console.debug('Server returned a reminder matching' + trackingRemindersFromApi[j]);
                                    existingReminderFoundInApiResponse = true;
                                }
                            }
                            if(!existingReminderFoundInApiResponse) {
                                //if($rootScope.combineNotifications === "false"){
                                    console.debug('Matching API reminder not found. Cancelling scheduled notification ' + JSON.stringify(scheduledNotifications[i]));
                                    cordova.plugins.notification.local.cancel(scheduledNotifications[i].id, function (cancelledNotification) {
                                        console.debug("Canceled notification ", cancelledNotification);
                                    });
                                //}
                            }
                        }
                    });

                }

                if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                    cancelChromeExtensionNotificationsForDeletedReminders(trackingRemindersFromApi);
                }

                $ionicPlatform.ready(function () {
                    if (typeof cordova !== "undefined") {
                        console.debug('cancelIonicNotificationsForDeletedReminders');
                        cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi);
                    }
                });

            },

            scheduleNotificationByReminder: function(trackingReminder){

                function createOrUpdateIonicNotificationForTrackingReminder(notificationSettings) {
                    cordova.plugins.notification.local.isPresent(notificationSettings.id, function (present) {

                        if (!present) {
                            console.debug("Creating notification because not already set for " + JSON.stringify(notificationSettings));
                            cordova.plugins.notification.local.schedule(notificationSettings,
                                function () {
                                    console.debug('notification scheduled', notificationSettings);
                                });
                        }

                        if (present) {
                            console.debug('Updating notification', notificationSettings);
                            cordova.plugins.notification.local.update(notificationSettings,
                                            function () {
                                                console.debug('notification updated', notificationSettings);
                                            });
                        }
                    });
                }

                function scheduleAndroidNotificationByTrackingReminder(trackingReminder) {
                    // var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                    // at.setUTCSeconds(trackingReminder.at);
                    var minuteFrequency  = trackingReminder.reminderFrequency / 60;
                    var notificationSettings = {
                        autoClear: true,
                        badge: $rootScope.numberOfPendingNotifications,
                        color: undefined,
                        data: trackingReminder,
                        led: undefined,
                        sound: "file://sound/silent.ogg",
                        ongoing: false,
                        title: "Track " + trackingReminder.variableName,
                        text: "Tap to record or modify measurement",
                        at: trackingReminder.at * 1000,
                        icon: 'ic_stat_icon_bw',
                        id: trackingReminder.id
                    };
                    if(trackingReminder.repeating){
                        notificationSettings.every = minuteFrequency;
                    }
                    console.debug("Trying to create Android notification for " + JSON.stringify(notificationSettings));
                    //notificationSettings.sound = "res://platform_default";
                    //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                }

                function scheduleIosNotificationByTrackingReminder(trackingReminder) {

                    var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                    at.setUTCSeconds(trackingReminder.at);
                    // Using milliseconds might cause app to crash with this error:
                    // NSInvalidArgumentException·unable to serialize userInfo: Error Domain=NSCocoaErrorDomain Code=3851 "Property list invalid for format: 200 (property lists cannot contain objects of type 'CFNull')" UserInfo={NSDeb
                    // var at = trackingReminder.nextReminderTimeEpochSeconds;
                    var minuteFrequency  = trackingReminder.reminderFrequency / 60;
                    var notificationSettings = {
                        autoClear: true,
                        badge: $rootScope.numberOfPendingNotifications,
                        color: undefined,
                        data: trackingReminder,
                        led: undefined,
                        ongoing: false,
                        sound: "file://sound/silent.ogg",
                        title: "Track " + trackingReminder.variableName,
                        text: "Record or modify measurement",
                        at: at,
                        icon: config.appSettings.mobileNotificationImage,
                        id: trackingReminder.id
                    };
                    if(trackingReminder.repeating){
                        notificationSettings.every = minuteFrequency;
                    }
                    //notificationSettings.sound = "res://platform_default";
                    //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                }

                function scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder) {
                    var alarmInfo = {};
                    alarmInfo.when =  trackingReminder.at * 1000;
                    if(trackingReminder.repeating){
                        alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
                    }
                    var alarmName = {
                        reminderId: trackingReminder.id,
                        variableName: trackingReminder.variableName,
                        defaultValue: trackingReminder.defaultValue,
                        abbreviatedUnitName: trackingReminder.abbreviatedUnitName,
                        periodInMinutes: trackingReminder.reminderFrequency / 60,
                        reminderStartTime: trackingReminder.reminderStartTime,
                        startTrackingDate: trackingReminder.startTrackingDate
                    };

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
                            console.debug('Created alarm for alarmName ' + alarmName, alarmInfo);
                        }
                    });
                }

                if(trackingReminder.nextReminderTimeEpochSeconds){
                    console.debug('Scheduling repeating notifications by reminder');
                    trackingReminder.at = trackingReminder.nextReminderTimeEpochSeconds;
                    trackingReminder.repeating = true;
                }

                if(trackingReminder.trackingReminderNotificationTimeEpoch){
                    console.debug('Scheduling single notification by reminder notification');
                    trackingReminder.at = trackingReminder.trackingReminderNotificationTimeEpoch;
                    trackingReminder.repeating = false;
                }

                if(trackingReminder.reminderFrequency > 0){
                    $ionicPlatform.ready(function () {
                        //console.debug('Ionic is ready to schedule notifications');
                        if (typeof cordova !== "undefined") {
                            if (ionic.Platform.isAndroid()) {
                                scheduleAndroidNotificationByTrackingReminder(trackingReminder);
                            } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                                scheduleIosNotificationByTrackingReminder(trackingReminder);
                            }
                        }
                    });
                    if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder);
                    }
                }

            },

            scheduleGenericNotification: function(intervalInMinutes){

                function scheduleGenericAndroidNotification(intervalInMinutes) {
                    cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                    var notificationSettings = {
                        text: config.appSettings.mobileNotificationText,
                        every: intervalInMinutes,
                        icon: 'ic_stat_icon_bw',
                        id: config.appSettings.primaryOutcomeVariableDetails.id,
                        sound: "file://sound/silent.ogg",
                        badge: $rootScope.numberOfPendingNotifications
                    };
                    if (intervalInMinutes > 0) {
                        cordova.plugins.notification.local.schedule(notificationSettings, function () {
                            console.log('notification scheduled', notificationSettings);
                        });
                        cordova.plugins.notification.local.on("click", function (notification) {
                            console.log("$state.go('app.remindersInbox')");
                            $state.go('app.remindersInbox');
                        });
                    }
                }

                function scheduleGenericIosNotification(intervalInMinutes) {
                    cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                    var notificationSettings = {
                        text: config.appSettings.mobileNotificationText,
                        every: intervalInMinutes,
                        icon: config.appSettings.mobileNotificationImage,
                        id: config.appSettings.primaryOutcomeVariableDetails.id,
                        sound: "file://sound/silent.ogg",
                        badge: $rootScope.numberOfPendingNotifications
                    };
                    if (intervalInMinutes > 0) {
                        cordova.plugins.notification.local.schedule(notificationSettings, function () {
                            console.log('iOS notification scheduled', notificationSettings);
                        });
                        cordova.plugins.notification.local.on("click", function (notification) {
                            console.log("$state.go('app.remindersInbox')");
                            $state.go('app.remindersInbox');
                        });
                    }
                }

                function scheduleGenericChromeExtensionNotification(intervalInMinutes) {
                    console.log('Reminder notification interval is ' + intervalInMinutes + ' minutes');
                    var alarmInfo = {periodInMinutes: intervalInMinutes};
                    chrome.alarms.clear("trackReportAlarm");
                    chrome.alarms.create("trackReportAlarm", alarmInfo);
                    console.log("Alarm set, every " + intervalInMinutes + " minutes");

                }

                if (intervalInMinutes > 0) {
                    $ionicPlatform.ready(function () {
                        if (typeof cordova !== "undefined") {
                            if (ionic.Platform.isAndroid()) {
                                console.debug('Scheduling Android notification for every ' + intervalInMinutes + ' minutes');
                                scheduleGenericAndroidNotification(intervalInMinutes);
                            } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                                scheduleGenericIosNotification(intervalInMinutes);
                            }
                        }
                    });
                    if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        scheduleGenericChromeExtensionNotification(intervalInMinutes);
                    }
                }
            },

            // cancel all existing notifications
            cancelAllNotifications: function(){
                console.log('Cancelling all notifications');
                var deferred = $q.defer();
                if(typeof cordova !== "undefined"){
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.cancelAll(function () {
                            console.log('notifications have been cancelled');
                            deferred.resolve();
                        });
                    });
                } else if (typeof chrome.alarms !== "undefined"){
                    chrome.alarms.clearAll(function (){
                        console.debug('Cleared all Chrome alarms!');
                        deferred.resolve();
                    });
                }

                return deferred.promise;
            }
        };
    });