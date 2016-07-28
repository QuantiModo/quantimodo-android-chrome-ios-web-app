angular.module('starter')
// Handles the Notifications (inapp, push)
    .factory('notificationService',function($rootScope, $ionicPlatform, $state, localStorageService, $q, QuantiModo,
                                            timeService, bugsnagService, qmLocationService){

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

            setOnClickAction: function(QuantiModo) {
                var params = {};
                var locationTrackingNotificationId = 666;
                cordova.plugins.notification.local.on("click", function (notification) {
                    console.debug("onClick: notification: ", notification);
                    var notificationData = null;
                    if(notification && notification.data){
                        notificationData = JSON.parse(notification.data);
                        console.debug("onClick: notification.data : ", notificationData);
                    } else {
                        console.debug("onClick: No notification.data provided");
                    }

                    if(notification.id !== locationTrackingNotificationId){
                        cordova.plugins.notification.local.clearAll(function () {
                            console.debug("onClick: onClick: clearAll active notifications");
                        }, this);
                    }

                    if(notificationData && notificationData.trackingReminderNotificationId){
                        console.debug("onClick: Notification was a reminder notification not reminder.  Skipping notification with id: " + notificationData.trackingReminderNotificationId);
                        params = {
                            trackingReminderNotificationId: notificationData.trackingReminderNotificationId
                        };
                    } else if (notificationData && notificationData.id) {
                        console.debug("onClick: Notification was a reminder not a reminder notification.  Skipping next notification for reminder id: " + notificationData.id);
                        params = {
                            trackingReminderId: notificationData.id
                        };
                    } else {
                        console.debug("onClick: No notification data provided. Going to remindersInbox page.");
                        $state.go('app.remindersInbox');
                    }

                    if(params.trackingReminderId || params.trackingReminderNotificationId ){
                        QuantiModo.skipTrackingReminderNotification(params, function(response){
                            console.debug(response);
                        }, function(err){
                            console.error(err);
                            Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                        });
                        console.debug("onClick: Notification data provided. Going to addMeasurement page. Data: ", notificationData);
                        //notificationService.decrementNotificationBadges();
                        $state.go('app.measurementAdd',
                            {
                                reminder: notificationData,
                                fromState: 'app.remindersInbox'
                            });
                    } else {
                        console.debug("onClick: No params.trackingReminderId || params.trackingReminderNotificationId. Should have already gone to remindersInbox page.");
                    }
                });
            },

            setOnTriggerAction: function() {

                function getNotificationsFromApiAndClearOrUpdateLocalNotifications() {
                    var updateBadgesAndTextOnAllNotifications = function () {
                        $ionicPlatform.ready(function () {
                            if(!$rootScope.numberOfPendingNotifications){
                                $rootScope.numberOfPendingNotifications = 0;
                            }
                            cordova.plugins.notification.local.getAll(function (notifications) {
                                console.debug("All notifications ", notifications);
                                for (var i = 0; i < notifications.length; i++) {
                                    console.log('Updating notification', notifications[i]);
                                    var notificationSettings = {
                                        id: notifications[i].id,
                                        badge: $rootScope.numberOfPendingNotifications,
                                        title: "Time to track!",
                                        text: $rootScope.numberOfPendingNotifications + " waiting tracking reminder notifications"
                                    };
                                    cordova.plugins.notification.local.update(notificationSettings);
                                }
                            });
                        });
                    };

                    var currentDateTimeInUtcStringPlus5Min = timeService.getCurrentDateTimeInUtcStringPlusMin(5);
                    var params = {
                        reminderTime: '(lt)' + currentDateTimeInUtcStringPlus5Min
                    };
                    QuantiModo.getTrackingReminderNotifications(params, function (response) {
                        if (response.success) {
                            $rootScope.trackingReminderNotifications = response.data;
                            $rootScope.numberOfPendingNotifications = $rootScope.trackingReminderNotifications.length;
                            if (!$rootScope.numberOfPendingNotifications) {
                                console.debug("onTrigger: No notifications from API so clearAll active notifications");
                                cordova.plugins.notification.local.clearAll(function () {
                                    console.debug("onTrigger: cleared all active notifications");
                                }, this);
                            } else {
                                updateBadgesAndTextOnAllNotifications();
                                console.debug("onTrigger: notifications from API", $rootScope.trackingReminderNotifications);
                            }
                        }
                    }, function (err) {
                        Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                    });
                }

                function clearOtherLocalNotifications(currentNotification) {
                    console.debug("Creating notification trigger event to clear other notifications");
                    $ionicPlatform.ready(function () {
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
                    });
                }

                function clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification) {
                    console.log("onTrigger: Checking notification time limits", currentNotification);
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

                    try {
                        qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
                        console.debug("just triggered this notification: ",  currentNotification);
                        var notificationData = null;
                        if(currentNotification && currentNotification.data){
                            notificationData = JSON.parse(currentNotification.data);
                            console.debug("onTrigger: notification.data : ", notificationData);
                            clearNotificationIfOutsideAllowedTimes(notificationData, currentNotification);
                        } else {
                            console.debug("onTrigger: No notification.data provided");
                        }

                        if(!notificationData){
                            console.debug("onTrigger: This is a generic notification that sends to inbox, so we'll check the API for pending notifications.");
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
                    this.updateNotificationBadges($rootScope.numberOfPendingNotifications);
                }
            },

            setNotificationBadge: function(numberOfPendingNotifications){
                $rootScope.numberOfPendingNotifications = numberOfPendingNotifications;
                this.updateNotificationBadges($rootScope.numberOfPendingNotifications);
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
                        if($rootScope.showOnlyOneNotification !== "true"){
                            try {
                                this.scheduleNotificationByReminder(trackingRemindersFromApi[i]);
                            } catch (err) {
                                console.error('scheduleAllNotifications error');
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
                                //if($rootScope.showOnlyOneNotification === "false"){
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
                    var intervalInMinutes  = trackingReminder.reminderFrequency / 60;
                    var numberOfPendingNotifications = 0;
                    if($rootScope.numberOfPendingNotifications){
                        numberOfPendingNotifications = $rootScope.numberOfPendingNotifications;
                    }
                    var notificationSettings = {
                        autoClear: true,
                        badge: numberOfPendingNotifications,
                        color: undefined,
                        data: trackingReminder,
                        led: undefined,
                        sound: "file://sound/silent.ogg",
                        ongoing: false,
                        title: "Track " + trackingReminder.variableName,
                        text: "Tap to record measurement",
                        at: trackingReminder.nextReminderTimeEpochSeconds * 1000,
                        icon: 'ic_stat_icon_bw',
                        id: trackingReminder.id
                    };

                    notificationSettings.every = intervalInMinutes;

                    console.debug("Trying to create Android notification for " + JSON.stringify(notificationSettings));
                    //notificationSettings.sound = "res://platform_default";
                    //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
                }

                function scheduleIosNotificationByTrackingReminder(trackingReminder) {

                    var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                    at.setUTCSeconds(trackingReminder.nextReminderTimeEpochSeconds);
                    // Using milliseconds might cause app to crash with this error:
                    // NSInvalidArgumentException·unable to serialize userInfo: Error Domain=NSCocoaErrorDomain Code=3851 "Property list invalid for format: 200 (property lists cannot contain objects of type 'CFNull')" UserInfo={NSDeb
                    var intervalInMinutes  = trackingReminder.reminderFrequency / 60;
                    var everyString = 'minute';
                    if (intervalInMinutes > 1) {everyString = 'hour';}
                    if (intervalInMinutes > 60) {everyString = 'day';}
                    console.debug("iOS requires second, minute, hour, day, week, month, year so converting " +
                        intervalInMinutes + " minutes to string: " + everyString);
                    var numberOfPendingNotifications = 0;
                    if($rootScope.numberOfPendingNotifications){
                        numberOfPendingNotifications = $rootScope.numberOfPendingNotifications;
                    }
                    var notificationSettings = {
                        autoClear: true,
                        badge: numberOfPendingNotifications,
                        color: undefined,
                        data: trackingReminder,
                        led: undefined,
                        ongoing: false,
                        sound: "file://sound/silent.ogg",
                        title: "Track " + trackingReminder.variableName,
                        text: "Record a measurement",
                        at: at,
                        icon: config.appSettings.mobileNotificationImage,
                        id: trackingReminder.id
                    };

                    notificationSettings.every = everyString;

                    //notificationSettings.sound = "res://platform_default";
                    //notificationSettings.smallIcon = 'ic_stat_icon_bw';
                    createOrUpdateIonicNotificationForTrackingReminder(notificationSettings);
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
                            console.debug('Created alarm for alarmName ' + alarmName, alarmInfo);
                        }
                    });
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

                var notificationSettings = {
                    title: config.appSettings.appName,
                    text: config.appSettings.mobileNotificationText,
                    every: intervalInMinutes,
                    id: config.appSettings.primaryOutcomeVariableDetails.id,
                    sound: "file://sound/silent.ogg",
                    badge: 0
                };
                if($rootScope.numberOfPendingNotifications > 0) {
                    notificationSettings.badge = $rootScope.numberOfPendingNotifications;
                }

                function scheduleGenericAndroidNotification(notificationSettings) {
                    notificationSettings.icon = 'ic_stat_icon_bw';
                    cordova.plugins.notification.local.schedule(notificationSettings, function () {
                        console.log('notification scheduled', notificationSettings);
                    });
                }

                function scheduleGenericIosNotification(notificationSettings) {
                    var everyString = 'minute';
                    if (notificationSettings.every > 1) {everyString = 'hour';}
                    if (notificationSettings.every > 60) {everyString = 'day';}
                    console.debug("iOS requires second, minute, hour, day, week, month, year so converting " +
                        notificationSettings.every + " minutes to string: " + everyString);
                    notificationSettings.every = everyString;
                    // Don't include notificationSettings.icon for iOS. I keep seeing "Unknown property: icon" in Safari console
                    cordova.plugins.notification.local.schedule(notificationSettings, function () {
                        console.log('iOS notification scheduled', notificationSettings);
                    });
                }

                function scheduleGenericChromeExtensionNotification(intervalInMinutes) {
                    console.log('Reminder notification interval is ' + intervalInMinutes + ' minutes');
                    var alarmInfo = {periodInMinutes: intervalInMinutes};
                    chrome.alarms.clear("genericTrackingReminderNotificationAlarm");
                    chrome.alarms.create("genericTrackingReminderNotificationAlarm", alarmInfo);
                    console.log("Alarm set, every " + intervalInMinutes + " minutes");

                }

                if (intervalInMinutes > 0) {
                    $ionicPlatform.ready(function () {
                        if (typeof cordova !== "undefined") {
                            cordova.plugins.notification.local.cancel(config.appSettings.primaryOutcomeVariableDetails.id);
                            if (ionic.Platform.isAndroid()) {
                                console.debug('Scheduling Android notification for every ' + intervalInMinutes + ' minutes');
                                scheduleGenericAndroidNotification(notificationSettings);
                            } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                                scheduleGenericIosNotification(notificationSettings);
                            }
                        }
                    });
                    if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        scheduleGenericChromeExtensionNotification(intervalInMinutes);
                    }
                }
            },

            cancelIonicNotificationById: function(notificationId){
                $ionicPlatform.ready(function () {
                    if (typeof cordova !== "undefined") {
                        console.debug('cancelIonicNotificationById ' + notificationId);
                        cordova.plugins.notification.local.cancel(notificationId, function (cancelledNotification) {
                            console.debug("Canceled notification ", cancelledNotification);
                        });
                    }
                });
            },

            // cancel all existing notifications
            cancelAllNotifications: function(){

                var deferred = $q.defer();
                if(typeof cordova !== "undefined"){
                    $ionicPlatform.ready(function () {
                        cordova.plugins.notification.local.cancelAll(function () {
                            console.log('notifications have been cancelled');
                            deferred.resolve();
                        });
                    });
                } else if (typeof chrome !== "undefined" && typeof chrome.alarms !== "undefined"){
                    chrome.alarms.clearAll(function (){
                        console.debug('Cleared all Chrome alarms!');
                        deferred.resolve();
                    });
                } else {
                    console.debug('cancelAllNotifications: Chrome and cordova are not defined.');
                }

                return deferred.promise;
            }
        };
    });