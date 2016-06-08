angular.module('starter')
    // Handles the Notifications (inapp, push)
    .factory('notificationService',function($rootScope, $ionicPlatform, $state){

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

            scheduleAllNotifications: function(trackingReminders) {
                if(trackingReminders.length > 0){
                    if ($rootScope.isChromeExtension || $rootScope.isChromeApp)
                    {
                        chrome.alarms.clearAll();
                    }

                    if ($rootScope.isAndroid)
                    {
                        cordova.plugins.notification.local.cancelAll();
                    }
                    
                }
                for (var i = 0; i < trackingReminders.length; i++) {
                    this.scheduleNotification(false, trackingReminders[i]);
                }
            },
            
            // schedule new notifications
            scheduleNotification:function(interval, trackingReminder){

                function scheduleAndroidNotification(interval, trackingReminder) {

                    if (interval !== "never") {
                        cordova.plugins.notification.local.schedule({
                            text: config.appSettings.mobileNotificationText,
                            every: intervals[interval],
                            icon: config.appSettings.mobileNotificationImage,
                            id: 1
                        }, function () {
                            console.log('notification scheduled');
                        });
                        cordova.plugins.notification.local.on("click", function (notification) {
                            // var redirectUrl = window.location.href + 'app/reminders-inbox';
                            // console.log('Setting window.location to ' + redirectUrl);
                            // window.location = redirectUrl;
                            console.log("$state.go('app.remindersInbox')");
                            $state.go('app.remindersInbox');
                        });
                    } else if (trackingReminder) {
                        var firstAt = new Date(trackingReminder.nextReminderTimeEpochSeconds*1000);
                        var minuteFrequency  = trackingReminder.reminderFrequency / 60;
                        var notificationSettings = {
                            text: config.appSettings.mobileNotificationText,
                            firstAt: firstAt,
                            every: minuteFrequency,
                            icon: config.appSettings.mobileNotificationImage,
                            id: trackingReminder.id
                        };
                        cordova.plugins.notification.local.schedule(notificationSettings,
                            function () {
                            console.log('notification scheduled', notificationSettings);
                        });
                        cordova.plugins.notification.local.on("click", function (notification) {
                            // var redirectUrl = window.location.href + 'app/reminders-inbox';
                            // console.log('Setting window.location to ' + redirectUrl);
                            // window.location = redirectUrl;
                            console.log("$state.go('app.remindersInbox')");
                            $state.go('app.remindersInbox');
                        });
                    }
                }

                function scheduleIosNotification(interval, trackingReminder) {
                    cordova.plugins.notification.local.cancelAll(function () {
                        if (interval && interval !== "never") {
                            cordova.plugins.notification.local.schedule({
                                text: config.appSettings.mobileNotificationText,
                                every: interval,
                                icon: config.appSettings.mobileNotificationImage,
                                id: 1
                            }, function () {
                                console.log('notification scheduled');
                            });
                            cordova.plugins.notification.local.on("click", function (notification) {
                                // var redirectUrl = window.location.href + 'app/reminders-inbox';
                                // console.log('Setting window.location to ' + redirectUrl);
                                // window.location = redirectUrl;
                                console.log("$state.go('app.remindersInbox')");
                                $state.go('app.remindersInbox');
                            });
                        }
                    });
                }

                function scheduleChromeExtensionNotification(interval, trackingReminder) {
                    var alarmInfo = {};
                    if(interval && interval !== "never"){
                        console.log('Reminder notification interval is ' + interval);
                        alarmInfo = {periodInMinutes: intervals[interval]};
                        chrome.alarms.clear("trackReportAlarm");
                        chrome.alarms.create("trackReportAlarm", alarmInfo);
                        console.log("Alarm set, every " + intervals[interval] + " minutes");
                    } else if (trackingReminder) {
                        console.debug('Creating reminder for ', trackingReminder);
                        alarmInfo.when =  trackingReminder.nextReminderTimeEpochSeconds * 1000;
                        alarmInfo.periodInMinutes = trackingReminder.reminderFrequency / 60;
                        var alarmName = 'when:' + alarmInfo.when + ' periodInMinutes:' + alarmInfo.periodInMinutes;
                        chrome.alarms.clear(alarmName);
                        chrome.alarms.create(alarmName, alarmInfo);
                        console.debug('Created alarm for alarmName ' + alarmName, alarmInfo);
                    }
                    

                }

                $ionicPlatform.ready(function () {

                    if (typeof cordova != "undefined") {
                        if (ionic.Platform.isAndroid()) {
                            scheduleAndroidNotification(interval, trackingReminder);
                        } else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                            scheduleIosNotification(interval, trackingReminder);
                        }
                    } else if ($rootScope.isChromeExtension || $rootScope.isChromeApp) {
                        scheduleChromeExtensionNotification(interval, trackingReminder);
                    }
                });
            },

            // cancel all existing notifications
            cancelNotifications: function(){
                if(typeof cordova != "undefined"){
                    cordova.plugins.notification.local.cancelAll(function(){
                        console.log('notifications cancelled');
                    });
                }else if(typeof chrome.alarms != "undefined"){
                    chrome.alarms.clear("trackReportAlarm");
                }

            },

            scheduleReminder:function(params){
                var id = Math.floor((Math.random() * 10000) + 1);
                var text = "Reminder " + params.variableName;

                if (params.frequency === "Daily") {
                    var time = params.reminderTime.match(/(\d+)(?::(\d\d))?\s*(p?)/);
                    var reminderTime = new Date();
                    reminderTime.setHours( parseInt(time[1]) + (time[3] ? 12 : 0) );
                    reminderTime.setMinutes( parseInt(time[2]) || 0 );
                }

                if (params.frequency !== "Daily") {
                    if(typeof cordova != "undefined"){
                        //Android and iOS frequency reminders
                        cordova.plugins.notification.local.clearAll(function(){
                            if(params['frequency'] !== "Never"){
                                cordova.plugins.notification.local.schedule({
                                    text: text,
                                    every: intervals[interval],
                                    icon: config.appSettings.notification_image,
                                    id : id
                                }, function(){
                                    console.log('notification scheduled');
                                });
                                cordova.plugins.notification.local.on("click", function (notification) {
                                    // var redirectUrl = window.location.href + 'app/reminders-inbox';
                                    // console.log('Setting window.location to ' + redirectUrl);
                                    // window.location = redirectUrl;
                                    console.log("$state.go('app.remindersInbox')");
                                    $state.go('app.remindersInbox');
                                });
                            }
                        });
                    }
                    else if($rootScope.isChrome){
                        // chrome frequency reminders
                        alarmInfo = {periodInMinutes: intervals[interval]};
                        chrome.alarms.create("trackReportAlarm", alarmInfo);
                        console.log("Alarm set, every " + intervals[interval] + " minutes");
                    }
                } else if(typeof cordova != "undefined") {
                    //android and ios daily notifications
                    cordova.plugins.notification.local.schedule({
                        id: id,
                        text: text,
                        every: 'day',
                        at: reminderTime
                    });
                    console.log("Alarm set, every day on", reminderTime);
                } else {
                    // chrome daily notifications
                    var alarmInfo = {when: reminderTime.getTime(), periodInMinutes: 24*60};
                    console.log('alarminfo', alarmInfo);
                    chrome.alarms.create("reminderNotification", alarmInfo);
                    console.log("Alarm set, every day on", reminderTime);
                }
            }
        };
    });