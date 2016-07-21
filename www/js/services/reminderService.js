angular.module('starter')
	// Measurement Service
	.factory('reminderService', function($http, $q, QuantiModo, timeService, notificationService, localStorageService, $rootScope){

		// service methods
		var reminderService = {

			addNewReminder : function(trackingReminder){
				
				var deferred = $q.defer();
				if(trackingReminder.reminderFrequency !== 0){
					notificationService.scheduleNotificationByReminder(trackingReminder);
				}
				
				trackingReminder.timeZoneOffset = new Date().getTimezoneOffset();
                QuantiModo.postTrackingReminder(trackingReminder, function(){
					//update alarms and local notifications
					console.debug("remindersService:  Finished postTrackingReminder so now refreshTrackingRemindersAndScheduleAlarms");
					reminderService.refreshTrackingRemindersAndScheduleAlarms();
                	deferred.resolve();
                }, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                	deferred.reject(err);
                });

				return deferred.promise;
			},

			skipReminderNotification : function(params){
				var deferred = $q.defer();

				// Not keeping notifications in local storage currently
				//localStorageService.deleteElementOfItemById('trackingReminderNotifications', trackingReminderNotificationId);

				QuantiModo.skipTrackingReminder(params, function(response){
					if(response.success) {
						deferred.resolve();
                    }
					else {
						deferred.reject();
					}
				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				});
				
				return deferred.promise;
			},

			trackReminderNotification : function(params){
				var deferred = $q.defer();
				// Not keeping notifications in local storage currently
				//localStorageService.deleteElementOfItemById('trackingReminderNotifications', trackingReminderNotificationId);

				QuantiModo.trackTrackingReminder(params, function(response){
					if(response.success) {
						deferred.resolve();
					}
					else {
						deferred.reject();
					}
				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				});
				
				return deferred.promise;
			},

			snoozeReminderNotification : function(params){
				var deferred = $q.defer();
				// Not keeping notifications in local storage currently
				//localStorageService.deleteElementOfItemById('trackingReminderNotifications', trackingReminderNotificationId);

				QuantiModo.snoozeTrackingReminder(params, function(response){
					if(response.success) {
						deferred.resolve();
                    }
					else {
						deferred.reject();
					}
				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				});
				
				return deferred.promise;
			},

			refreshTrackingRemindersAndScheduleAlarms : function(){

				$rootScope.isSyncing = true;
				$rootScope.syncDisplayText = 'Syncing reminders...';

				if(!$rootScope.syncingReminders){
					$rootScope.syncingReminders = true;
					var deferred = $q.defer();

					var params = {
						limit: 200
					};

					QuantiModo.getTrackingReminders(params, function(remindersResponse){
						var trackingReminders = remindersResponse.data;
						if(remindersResponse.success) {
							if($rootScope.showOnlyOneNotification !== true){
								notificationService.scheduleAllNotifications(trackingReminders);
							}
							//$rootScope.numberOfPendingNotifications = trackingReminders[0].numberOfPendingNotifications;
							//notificationService.updateNotificationBadges($rootScope.numberOfPendingNotifications);
							localStorageService.setItem('trackingReminders', JSON.stringify(trackingReminders));
							$rootScope.syncingReminders = false;
							$rootScope.isSyncing = false;
							$rootScope.syncDisplayText = '';
							deferred.resolve(trackingReminders);
						}
						else {
							$rootScope.syncingReminders = false;
							$rootScope.isSyncing = false;
							$rootScope.syncDisplayText = '';
							deferred.reject("error");
							Bugsnag.notify(remindersResponse, JSON.stringify(remindersResponse), {}, "error");
						}
					}, function(err){
						$rootScope.syncingReminders = false;
						$rootScope.isSyncing = false;
						$rootScope.syncDisplayText = '';
						Bugsnag.notify(err, JSON.stringify(err), {}, "error");
						deferred.reject(err);
					});

					return deferred.promise;
				}
			},

			getTrackingReminderNotifications : function(category, today){

				var localMidnightInUtcString = timeService.getLocalMidnightInUtcString();
				var currentDateTimeInUtcStringPlus5Min = timeService.getCurrentDateTimeInUtcStringPlusMin(5);
				var params = {};

				if (today && !category) {
					var reminderTime = '(gt)' + localMidnightInUtcString;
					params = {
						reminderTime: reminderTime,
						sort: 'reminderTime'
					};
				}

				if (!today && category) {
					params = {
						variableCategoryName: category,
						reminderTime: '(lt)' + currentDateTimeInUtcStringPlus5Min
					};
				}

				if (today && category) {
					params = {
						reminderTime: '(gt)' + localMidnightInUtcString,
						variableCategoryName: category,
						sort: 'reminderTime'
					};
				}

				if (!today && !category) {
					params = {
						reminderTime: '(lt)' + currentDateTimeInUtcStringPlus5Min
					};
				}


				var deferred = $q.defer();
				QuantiModo.getTrackingReminderNotifications(params, function(reminders){
					if(reminders.success) {
						deferred.resolve(reminders.data);
						if($rootScope.showOnlyOneNotification !== true){
							notificationService.scheduleAllNotifications(reminders.data);
						}
					}
					else {
						deferred.reject("error");
					}
				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				});

				return deferred.promise;
			},

			getTrackingReminderById : function(reminderId){
				var deferred = $q.defer();
				var params = {id : reminderId};
				QuantiModo.getTrackingReminders(params, function(remindersResponse){
					var trackingReminders = remindersResponse.data;
					if(remindersResponse.success) {
						deferred.resolve(trackingReminders);
					}
					else {
						deferred.reject("error");
					}
				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				});
				return deferred.promise;
			},

			getCurrentTrackingReminderNotificationsFromApi : function(category, today){

				var localMidnightInUtcString = timeService.getLocalMidnightInUtcString();
				var currentDateTimeInUtcString = timeService.getCurrentDateTimeInUtcString();
				var params = {};
				if(today && !category){
					var reminderTime = '(gt)' + localMidnightInUtcString;
					params = {
						reminderTime : reminderTime,
						sort : 'reminderTime'
					};
				}

				if(!today && category){
					params = {
						variableCategoryName : category,
						reminderTime : '(lt)' + currentDateTimeInUtcString
					};
				}

				if(today && category){
					params = {
						reminderTime : '(gt)' + localMidnightInUtcString,
						variableCategoryName : category,
						sort : 'reminderTime'
					};
				}

				if(!today && !category){
					params = {
						reminderTime : '(lt)' + currentDateTimeInUtcString
					};
				}

				var deferred = $q.defer();

				var successHandler = function(trackingReminderNotifications) {
					if (trackingReminderNotifications.success) {
						deferred.resolve(trackingReminderNotifications.data);
					}
					else {
						deferred.reject("error");
					}
				};

				var errorHandler = function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				};


				QuantiModo.get('api/v1/trackingReminderNotifications',
					['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'],
					params,
					successHandler,
					errorHandler);

				return deferred.promise;
			},

			getTrackingReminderNotificationsFromLocalStorage : function(category, today){

				var localMidnightInUtcString = timeService.getLocalMidnightInUtcString();
				var currentDateTimeInUtcString = timeService.getCurrentDateTimeInUtcString();
				var trackingReminderNotifications = [];

				if(today && !category){
					trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
						'trackingReminderNotifications', null, null, null, null, 'reminderTime', localMidnightInUtcString);
					var reminderTime = '(gt)' + localMidnightInUtcString;
				}

				if(!today && category){
					trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
						'trackingReminderNotifications', 'variableCategoryName', category, 'reminderTime', currentDateTimeInUtcString, null, null);
				}

				if(today && category){
					trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
						'trackingReminderNotifications', 'variableCategoryName', category, null, null, 'reminderTime', localMidnightInUtcString);
				}

				if(!today && !category){
					trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
						'trackingReminderNotifications', null, null, 'reminderTime', currentDateTimeInUtcString, null, null);
				}
				
				return trackingReminderNotifications;
			},			

			deleteReminder : function(reminderId){
				var deferred = $q.defer();

				localStorageService.deleteElementOfItemById('trackingReminders', reminderId);

				QuantiModo.deleteTrackingReminder(reminderId, function(response){
					if(response.success) {
						//update alarms and local notifications
						console.debug("remindersService:  Finished deleteReminder so now refreshTrackingRemindersAndScheduleAlarms");
						reminderService.refreshTrackingRemindersAndScheduleAlarms();
						deferred.resolve();
					}
					else {
						deferred.reject();
					}
				}, function(err){
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					deferred.reject(err);
				});
				
				return deferred.promise;
			},
			
			addRatingTimesToDailyReminders : function(reminders) {
				var index;
				for (index = 0; index < reminders.length; ++index) {
					if (reminders[index].valueAndFrequencyTextDescription.indexOf('daily') > 0) {
						reminders[index].valueAndFrequencyTextDescription =
							reminders[index].valueAndFrequencyTextDescription + ' at ' +
							reminderService.convertReminderTimeStringToMoment(reminders[index].reminderStartTime).format("h:mm A");
					}
				}
				return reminders;
			},

			convertReminderTimeStringToMoment : function(reminderTimeString) {
				var now = new Date();
				var hourOffsetFromUtc = now.getTimezoneOffset()/60;
				var parsedReminderTimeUtc = reminderTimeString.split(':');
				var minutes = parsedReminderTimeUtc[1];
				var hourUtc = parseInt(parsedReminderTimeUtc[0]);

				var localHour = hourUtc - parseInt(hourOffsetFromUtc);
				if(localHour > 23){
					localHour = localHour - 24;
				}
				if(localHour < 0){
					localHour = localHour + 24;
				}
				return moment().hours(localHour).minutes(minutes);
			}
			
        };

		return reminderService;
	});