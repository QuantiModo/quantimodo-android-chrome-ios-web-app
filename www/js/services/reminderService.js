angular.module('starter')
	// Measurement Service
	.factory('reminderService', function($q, $rootScope, QuantiModo, timeService, notificationService,
										 localStorageService, $timeout, bugsnagService, variableCategoryService) {

		var reminderService = {};

		reminderService.addNewReminder = function(trackingReminder){

			var deferred = $q.defer();
			if(trackingReminder.reminderFrequency !== 0 && !$rootScope.showOnlyOneNotification){
				notificationService.scheduleNotificationByReminder(trackingReminder);
			}

			trackingReminder.timeZoneOffset = new Date().getTimezoneOffset();
			QuantiModo.postTrackingReminder(trackingReminder, function(){
				//update alarms and local notifications
				console.debug("remindersService:  Finished postTrackingReminder so now refreshTrackingRemindersAndScheduleAlarms");
				reminderService.refreshTrackingRemindersAndScheduleAlarms();
				deferred.resolve();
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.skipReminderNotification = function(params){
			var deferred = $q.defer();

			// Not keeping notifications in local storage currently
			//localStorageService.deleteElementOfItemById('trackingReminderNotifications', trackingReminderNotificationId);

			QuantiModo.skipTrackingReminderNotification(params, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.skipAllReminderNotifications = function(params){
			var deferred = $q.defer();
			QuantiModo.skipAllTrackingReminderNotifications(params, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.trackReminderNotification = function(params){
			var deferred = $q.defer();
			// Not keeping notifications in local storage currently
			//localStorageService.deleteElementOfItemById('trackingReminderNotifications', trackingReminderNotificationId);

			QuantiModo.trackTrackingReminderNotification(params, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.snoozeReminderNotification = function(params){
			var deferred = $q.defer();
			// Not keeping notifications in local storage currently
			//localStorageService.deleteElementOfItemById('trackingReminderNotifications', trackingReminderNotificationId);

			QuantiModo.snoozeTrackingReminderNotification(params, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.refreshTrackingRemindersAndScheduleAlarms = function(){
			if($rootScope.syncingReminders !== true){
				$rootScope.syncingReminders = true;
				var deferred = $q.defer();

				var params = {
					limit: 200
				};

				$timeout(function() {
					// Set to false after 30 seconds because it seems to get stuck on true sometimes for some reason
					$rootScope.syncingReminders = false;
				}, 30000);

				QuantiModo.getTrackingReminders(params, function(remindersResponse){
					var trackingReminders = remindersResponse.data;
					if(remindersResponse.success) {
						if($rootScope.showOnlyOneNotification !== true){
							try {
								notificationService.scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes(trackingReminders);
							} catch (err) {
								console.error('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes error: ' + err);
								if (typeof Bugsnag !== "undefined") {
									bugsnagService.reportError(err);
								}
							}
							//notificationService.scheduleAllNotificationsByTrackingReminders(trackingReminders);
						} else {
							try {
								notificationService.scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes(trackingReminders);
							} catch (err) {
								console.error('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes error: ' + err);
								bugsnagService.reportError(err);
							}
						}
						localStorageService.setItem('trackingReminders', JSON.stringify(trackingReminders));
						$rootScope.syncingReminders = false;
						deferred.resolve(trackingReminders);
					}
					else {
						$rootScope.syncingReminders = false;
						deferred.reject("error");
						if (typeof Bugsnag !== "undefined") {
							Bugsnag.notify(remindersResponse, JSON.stringify(remindersResponse), {}, "error");
						}
					}
				}, function(err){
					$rootScope.syncingReminders = false;
					if (typeof Bugsnag !== "undefined") {
						Bugsnag.notify(err, JSON.stringify(err), {}, "error");
					}
					deferred.reject(err);
				});

				return deferred.promise;
			}
		};

		reminderService.getTrackingReminderNotifications = function(variableCategoryName, today){

			var localMidnightInUtcString = timeService.getLocalMidnightInUtcString();
			var currentDateTimeInUtcStringPlus5Min = timeService.getCurrentDateTimeInUtcStringPlusMin(5);
			var params = {};

			if (today) {
				params.reminderTime = '(gt)' + localMidnightInUtcString;
				params.sort = 'reminderTime';
			} else {
				params.reminderTime = '(lt)' + currentDateTimeInUtcStringPlus5Min;
				params.sort = '-reminderTime';
			}

			if (variableCategoryName) {
				params.variableCategoryName = variableCategoryName;
			}

			var deferred = $q.defer();
			QuantiModo.getTrackingReminderNotifications(params, function(response){
				if(response.success) {
					var trackingRemindersNotifications =
						variableCategoryService.attachVariableCategoryIcons(response.data);
					deferred.resolve(trackingRemindersNotifications);
				}
				else {
					deferred.reject("error");
				}
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.getTrackingReminderById = function(reminderId){
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
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});
			return deferred.promise;
		};

		reminderService.getCurrentTrackingReminderNotificationsFromApi = function(category, today){

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
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			};


			QuantiModo.get('api/v1/trackingReminderNotifications',
				['variableCategoryName', 'id', 'sort', 'limit','offset','updatedAt', 'reminderTime'],
				params,
				successHandler,
				errorHandler);

			return deferred.promise;
		};

		reminderService.getTrackingReminderNotificationsFromLocalStorage = function(category, today){

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
		};

		reminderService.deleteReminder = function(reminderId){
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
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.addRatingTimesToDailyReminders = function(reminders) {
			var index;
			for (index = 0; index < reminders.length; ++index) {
				if (reminders[index].valueAndFrequencyTextDescription.indexOf('daily') > 0) {
					reminders[index].valueAndFrequencyTextDescription =
						reminders[index].valueAndFrequencyTextDescription + ' at ' +
						reminderService.convertReminderTimeStringToMoment(reminders[index].reminderStartTime).format("h:mm A");
				}
			}
			return reminders;
		};

		reminderService.convertReminderTimeStringToMoment = function(reminderTimeString) {
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
		};
        
        reminderService.addToTrackingReminderSyncQueue = function(trackingReminder) {
        	localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminderSyncQueue', trackingReminder);
		};

		reminderService.syncTrackingReminderSyncQueueToServer = function() {
			localStorageService.getItem('trackingReminderSyncQueue', function (trackingReminders) {
				if(trackingReminders){
					reminderService.addNewReminder(JSON.parse(trackingReminders)).then(function () {
						console.log('reminder queue synced' + trackingReminders);
						localStorageService.deleteItem('trackingReminderSyncQueue');
					}, function (err) {
						bugsnagService.reportError(err);
					});
				}
			});
		};

		return reminderService;
	});