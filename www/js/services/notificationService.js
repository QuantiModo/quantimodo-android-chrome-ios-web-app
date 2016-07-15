angular.module('starter')
// Handles the Notifications (inapp, push)
    .factory('notificationService',function($rootScope, $ionicPlatform, $state, localStorageService, $q, $timeout){



        return {

            scheduleAllNotifications: function(trackingRemindersFromApi) {
                if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
                    for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                        if($rootScope.combineNotifications !== "true"){
                            this.scheduleNotification(false, trackingRemindersFromApi[i]);
                        }
                    }
                    this.cancelNotificationsForDeletedReminders(trackingRemindersFromApi);
                }

                if($rootScope.isIOS || $rootScope.isAndroid) {
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.on("click", function (notification) {
                            cordova.plugins.notification.local.clearAll(function () {
                                console.debug("clearAll active notifications");
                            }, this);
                            console.debug("$state.go('app.remindersInbox')");
                            $state.go('app.remindersInbox');
                        });

                        console.debug("Creating notification trigger event to clear other notifications");
                        cordova.plugins.notification.local.on("trigger", function (currentNotification) {

                            try {
                                console.debug("just triggered: " + currentNotification.id);
                                cordova.plugins.notification.local.getAll(function (notifications) {
                                    console.debug("All notifications ", notifications);
                                });

                                cordova.plugins.notification.local.getTriggeredIds(function (triggeredNotifications) {
                                    console.debug("found triggered notifications before removing current one: " + JSON.stringify(triggeredNotifications));
                                    if(triggeredNotifications.length < 1){
                                        console.error("Triggered notifications is empty so maybe it's not working.");
                                        // setTimeout(function () {
                                        //     cordova.plugins.notification.local.clearAll(function () {
                                        //         console.debug("It has been an hour so clearAll active notifications");
                                        //     }, this);
                                        // }, 3600000);
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
                    });
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
                                    //console.debug('Server returned a reminder matching' + trackingRemindersFromApi[j]);
                                    existingReminderFoundInApiResponse = true;
                                }
                            }
                            if(!existingReminderFoundInApiResponse) {
                                if($rootScope.combineNotifications === "false"){
                                    console.debug('Matching API reminder not found. Clearing scheduled notification ' + JSON.stringify(scheduledNotifications[i]));
                                    cordova.plugins.notification.local.cancel(scheduledNotifications[i].id, function (cancelledNotification) {
                                        console.debug("Canceled notification ", cancelledNotification);
                                    });
                                }
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

            scheduleNotification: function(intervalInMinutes, trackingReminder){

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
                            cordova.plugins.notification.local.get(notificationSettings.id,
                                function (existingNotification) {
                                    //console.debug("Notification already set for " + JSON.stringify(existingNotification));
                                    var frequencyChanged = false;
                                    if (existingNotification && existingNotification.every !== notificationSettings.every) {
                                        frequencyChanged = true;
                                    }
                                    if (frequencyChanged) {
                                        cordova.plugins.notification.local.cancel(notificationSettings.id, function () {
                                            console.debug("Canceled notification " + notificationSettings.id);
                                        });
                                        cordova.plugins.notification.local.schedule(notificationSettings,
                                            function () {
                                                console.debug('notification scheduled', notificationSettings);
                                            });
                                        cordova.plugins.notification.local.on("click", function (notification) {
                                            console.debug("$state.go('app.remindersInbox')");
                                            $state.go('app.remindersInbox');
                                        });
                                    }
                                    if (!frequencyChanged) {
                                        //console.debug("Not creating notification because frequency not changed for " + JSON.stringify(existingNotification));
                                    }
                                }
                            );
                        }
                    });
                }

                function scheduleAndroidNotificationByTrackingReminder(trackingReminder) {
                    if (trackingReminder) {
                        var at = new Date(trackingReminder.nextReminderTimeEpochSeconds*1000);
                        var minuteFrequency  = trackingReminder.reminderFrequency / 60;
                        var notificationSettings = {
                            autoClear: true,
                            badge: 0,
                            color: undefined,
                            data: undefined,
                            led: undefined,
                            sound: "file://sound/silent.ogg",
                            ongoing: false,
                            title: "Track " + trackingReminder.variableName,
                            text: "Tap to open reminder inbox",
                            at: at,
                            every: minuteFrequency,
                            icon: 'ic_stat_icon_bw',
                            id: trackingReminder.id
                        };
                        //console.debug("Trying to create Android notification for " + JSON.stringify(notificationSettings));
                        //notificationSettings.sound = "res://platform_default";
                        //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                        createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                    }
                }

                function scheduleGenericAndroidNotification(intervalInMinutes) {
                    cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                    var notificationSettings = {
                        text: config.appSettings.mobileNotificationText,
                        every: intervalInMinutes,
                        icon: 'ic_stat_icon_bw',
                        id: config.appSettings.primaryOutcomeVariableDetails.id,
                        sound: "file://sound/silent.ogg"
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

                function scheduleIosNotificationByTrackingReminder(trackingReminder) {
                    if (trackingReminder) {
                        var at = new Date(trackingReminder.nextReminderTimeEpochSeconds*1000);
                        var minuteFrequency  = trackingReminder.reminderFrequency / 60;
                        var notificationSettings = {
                            autoClear: true,
                            badge: 0,
                            color: undefined,
                            data: undefined,
                            led: undefined,
                            ongoing: false,
                            sound: "file://sound/silent.ogg",
                            title: "Track " + trackingReminder.variableName,
                            text: "Swipe to open reminder inbox",
                            at: at,
                            every: minuteFrequency,
                            icon: config.appSettings.mobileNotificationImage,
                            id: trackingReminder.id
                        };
                        //notificationSettings.sound = "res://platform_default";
                        //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                        createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                    }
                }

                function scheduleGenericIosNotification(intervalInMinutes) {
                    cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                    var notificationSettings = {
                        text: config.appSettings.mobileNotificationText,
                        every: intervalInMinutes,
                        icon: config.appSettings.mobileNotificationImage,
                        id: config.appSettings.primaryOutcomeVariableDetails.id,
                        sound: "file://sound/silent.ogg"
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

                function scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder) {
                    var alarmInfo = {};
                    alarmInfo.when =  trackingReminder.nextReminderTimeEpochSeconds * 1000;
                    alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
                    var alarmName = {
                        reminderId: trackingReminder.id,
                        variableName: trackingReminder.variableName,
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

                $ionicPlatform.ready(function () {
                    //console.debug('Ionic is ready to schedule notifications');
                    if (typeof cordova !== "undefined") {
                        if (ionic.Platform.isAndroid()) {
                            if (intervalInMinutes > 0) {
                                console.debug('Scheduling Android notification for every ' + intervalInMinutes + ' minutes');
                                scheduleGenericAndroidNotification(intervalInMinutes);
                            }
                            if(trackingReminder){
                                //console.debug('Scheduling Android notification for ' + JSON.stringify(trackingReminder));
                                scheduleAndroidNotificationByTrackingReminder(trackingReminder);
                            }
                        } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                            if (intervalInMinutes > 0) {
                                scheduleGenericIosNotification(intervalInMinutes);
                            }
                            if(trackingReminder){
                                scheduleIosNotificationByTrackingReminder(trackingReminder);
                            }
                        }
                    } else if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        if (intervalInMinutes > 0) {
                            scheduleGenericChromeExtensionNotification(intervalInMinutes);
                        }
                        if(trackingReminder){
                            scheduleChromeExtensionNotificationWithTrackingReminder(trackingReminder);
                        }
                    } else {
                        console.debug('Not scheduling notifications because platform is not Chrome, Android, or iOS ');
                    }
                });
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