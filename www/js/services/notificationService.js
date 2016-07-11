angular.module('starter')
// Handles the Notifications (inapp, push)
    .factory('notificationService',function($rootScope, $ionicPlatform, $state, localStorageService, timeService){

        //Notification intervals in minutes
        var intervals = {
            'minutely':1,
            "every five minutes":5,
            "hourly":60,
            "every three hours":180,
            "twice a day": 720,
            "daily": 1440
        };

        return {

            scheduleAllNotifications: function(trackingRemindersFromApi) {
                if($rootScope.isChromeExtension || $rootScope.isIOS || $rootScope.isAndroid) {
                    for (var i = 0; i < trackingRemindersFromApi.length; i++) {
                        this.scheduleNotification(false, trackingRemindersFromApi[i]);
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

                        console.debug("Creating notification trigger event ");
                        cordova.plugins.notification.local.on("trigger", function (currentNotification) {
                            
                            try {
                                console.debug("just triggered: " + currentNotification.id);

                                cordova.plugins.notification.local.getTriggeredIds(function (triggeredNotifications) {
                                    console.debug("found triggered notifications before removing current one: " + JSON.stringify(triggeredNotifications));
                                    triggeredNotifications.splice(triggeredNotifications.indexOf(currentNotification.id), 1);
                                    console.debug("found triggered notifications after removing current one: " + JSON.stringify(triggeredNotifications));
                                    cordova.plugins.notification.local.clear(triggeredNotifications);
                                    if(triggeredNotifications.length < 1){
                                        console.error("Triggered notifications is empty so maybe it's not working.  Setting timer to clearAll notifications in 1 hour" );
                                        setTimeout(function () {
                                            cordova.plugins.notification.local.clearAll(function () {
                                                console.debug("It has been an hour so clearAll active notifications");
                                            }, this);
                                        }, 3600000);
                                    }
                                });
                            } catch (err) {
                                console.error(err);
                            }

                            /* Doesn't work on Android

                            function sleepFor( sleepDuration ){
                                var now = new Date().getTime();
                                while(new Date().getTime() < now + sleepDuration){ }
                            }

                            cordova.plugins.notification.local.getAllIds(function (ids) {
                                console.debug("Clearing all ids individually in a loop" + JSON.stringify(ids));
                                for (var i = 0; i < ids.length; i++) {

                                    console.debug("Checking if notification id " + ids[i] + " has been triggered." );
                                    cordova.plugins.notification.local.isTriggered(ids[i], function (present) {
                                        if(present){
                                            console.debug("Notification " + ids[i] + " IS triggered");
                                        } else {
                                            console.debug("Notification " + ids[i] + " is NOT triggered");
                                        }
                                    });
                                    sleepFor(200);
                                    if(ids[i] !== currentNotification.id){
                                        console.debug("Clearing id: " + ids[i]);
                                        cordova.plugins.notification.local.clear(ids[i]);
                                    } else {
                                        console.debug("Not clearing id " + ids[i] + " because it is the currently triggered notification");
                                    }

                                }
                            }, cordova.plugins);

*/

                            // cordova.plugins.notification.local.getAllIds(function (ids) {
                            //     console.debug("a local notification was triggered: clear all others at the same time");
                            //     console.debug("found notification ids before removing current: " + JSON.stringify(ids));
                            //     ids.splice(ids.indexOf(currentNotification.id), 1);
                            //     console.debug("found notification ids after removing current: " + JSON.stringify(ids));
                            //     cordova.plugins.notification.local.clear(ids);
                            //
                            // });

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
                                console.debug('Matching API reminder not found. Clearing scheduled notification ' + JSON.stringify(scheduledNotifications[i]));
                                cordova.plugins.notification.local.cancel(scheduledNotifications[i].id, function (cancelledNotification) {
                                    console.debug("Canceled notification ", cancelledNotification);
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
                        console.debug('cancelIonicNotificationsForDeletedReminders');
                        cancelIonicNotificationsForDeletedReminders(trackingRemindersFromApi);
                    }
                });

            },

            scheduleNotification: function(interval, trackingReminder){

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

                function scheduleGenericAndroidNotification(interval) {
                    cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                    var notificationSettings = {
                        text: config.appSettings.mobileNotificationText,
                        every: intervals[interval],
                        icon: 'ic_stat_icon_bw',
                        id: config.appSettings.primaryOutcomeVariableDetails.id,
                        sound: "file://sound/silent.ogg"
                    };
                    if (interval && interval !== "never") {
                        cordova.plugins.notification.local.cancel(notificationSettings.id, function() {
                            console.log("Canceled Android notification " + notificationSettings.id);
                        });
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
                            text: "Tap to open reminder inbox",
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

                function scheduleGenericIosNotification(interval) {
                    cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                    var notificationSettings = {
                        text: config.appSettings.mobileNotificationText,
                        every: interval,
                        icon: config.appSettings.mobileNotificationImage,
                        id: config.appSettings.primaryOutcomeVariableDetails.id,
                        sound: "file://sound/silent.ogg"
                    };
                    if (interval && interval !== "never") {
                        cordova.plugins.notification.local.schedule(notificationSettings, function () {
                            console.log('iOS notification scheduled', notificationSettings);
                        });
                        cordova.plugins.notification.local.on("click", function (notification) {
                            console.log("$state.go('app.remindersInbox')");
                            $state.go('app.remindersInbox');
                        });
                    }
                }

                function scheduleGenericChromeExtensionNotification(interval) {
                    console.log('Reminder notification interval is ' + interval);
                    var alarmInfo = {periodInMinutes: intervals[interval]};
                    chrome.alarms.clear("trackReportAlarm");
                    chrome.alarms.create("trackReportAlarm", alarmInfo);
                    console.log("Alarm set, every " + intervals[interval] + " minutes");

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
                            if (interval && interval !== "never") {
                                console.debug('Scheduling Android notification for interval ' + interval);
                                scheduleGenericAndroidNotification(interval);
                            }
                            if(trackingReminder){
                                //console.debug('Scheduling Android notification for ' + JSON.stringify(trackingReminder));
                                scheduleAndroidNotificationByTrackingReminder(trackingReminder);
                            }
                        } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                            if (interval && interval !== "never") {
                                scheduleGenericIosNotification(interval);
                            }
                            if(trackingReminder){
                                scheduleIosNotificationByTrackingReminder(trackingReminder);
                            }
                        }
                    } else if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        if (interval && interval !== "never") {
                            scheduleGenericChromeExtensionNotification(interval);
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
                if(typeof cordova !== "undefined"){
                    cordova.plugins.notification.local.cancelAll(function(){
                        console.log('notifications cancelled');
                    });
                }else if(typeof chrome.alarms !== "undefined"){
                    chrome.alarms.clearAll(function (){
                        console.debug('Cleared all Chrome alarms!');
                    });
                }

            }
        };
    });