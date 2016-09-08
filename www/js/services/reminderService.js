angular.module('starter')
	// Measurement Service
	.factory('reminderService', function($q, $rootScope, QuantiModo, timeService, notificationService,
										 localStorageService, $timeout, bugsnagService, variableCategoryService) {

		var reminderService = {};

		reminderService.addNewReminder = function(trackingReminder){

			var deferred = $q.defer();
			if(trackingReminder.reminderFrequency !== 0 && !$rootScope.showOnlyOneNotification){
				if($rootScope.localNotificationsEnabled){
					notificationService.scheduleNotificationByReminder(trackingReminder);
				}

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
			reminderService.deleteNotificationFromLocalStorage(params.trackingReminderNotification);
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
			localStorageService.deleteItem('trackingReminderNotifications');
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
			reminderService.deleteNotificationFromLocalStorage(params.trackingReminderNotification);
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
			reminderService.deleteNotificationFromLocalStorage(params.trackingReminderNotification);
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
								if($rootScope.localNotificationsEnabled){
									notificationService.scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes(trackingReminders);
								}
							} catch (err) {
								console.error('scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes error: ' + err);
								if (typeof Bugsnag !== "undefined") {
									bugsnagService.reportError(err);
								}
							}
							//notificationService.scheduleAllNotificationsByTrackingReminders(trackingReminders);
						} else {
							try {
								if($rootScope.localNotificationsEnabled){
									notificationService.scheduleUpdateOrDeleteGenericNotificationsByDailyReminderTimes(trackingReminders);
								}
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

		reminderService.getTodayTrackingReminderNotifications = function(variableCategoryName){
			var localMidnightInUtcString = timeService.getLocalMidnightInUtcString();
			var params = {};
			params.reminderTime = '(gt)' + localMidnightInUtcString;
			params.sort = 'reminderTime';
			if (variableCategoryName) {
				params.variableCategoryName = variableCategoryName;
			}
			var deferred = $q.defer();
			QuantiModo.getTrackingReminderNotifications(params, function(response){
				if(response.success) {
					var trackingRemindersNotifications =
						variableCategoryService.attachVariableCategoryIcons(response.data);
					$rootScope.numberOfPendingNotifications = trackingRemindersNotifications.length;
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

		reminderService.getTrackingReminderNotifications = function(variableCategoryName){
			var localStorageItemName = 'trackingReminderNotifications';
			if(variableCategoryName){
				localStorageItemName = localStorageItemName + variableCategoryName;
			}
			var deferred = $q.defer();
			localStorageService.getItem(localStorageItemName, function(trackingReminderNotifications){
				if(trackingReminderNotifications){
					trackingReminderNotifications = JSON.parse(trackingReminderNotifications);
					$rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
					if (window.chrome && window.chrome.browserAction) {
						chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
					}
					deferred.resolve(trackingReminderNotifications);
				} else {
					reminderService.refreshTrackingReminderNotifications(variableCategoryName)
						.then(function (trackingReminderNotifications) {
							deferred.resolve(trackingReminderNotifications);
						}, function(){
							console.error("failed to get reminder notifications!");
						});
				}
			});
			return deferred.promise;
		};

		reminderService.getFilteredTrackingReminderNotifications = function(variableCategoryName){
			var deferred = $q.defer();
			reminderService.getTrackingReminderNotifications(variableCategoryName)
				.then(function (trackingReminderNotifications) {
					var filteredTrackingReminderNotifications =
						reminderService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
					deferred.resolve(filteredTrackingReminderNotifications);
				}, function(){
					console.error("failed to get filtered reminder notifications!");
				});
			return deferred.promise;
		};

		reminderService.getFilteredTodayTrackingReminderNotifications = function(variableCategoryName){
			var deferred = $q.defer();
			reminderService.getTodayTrackingReminderNotifications(variableCategoryName)
				.then(function (trackingReminderNotifications) {
					var filteredTrackingReminderNotifications =
						reminderService.groupTrackingReminderNotificationsByDateRange(trackingReminderNotifications);
					deferred.resolve(filteredTrackingReminderNotifications);
				}, function(){
					console.error("failed to get filtered reminder notifications!");
				});
			return deferred.promise;
		};

		reminderService.refreshTrackingReminderNotifications = function(variableCategoryName){
			var localStorageItemName = 'trackingReminderNotifications';
			if(variableCategoryName){
				localStorageItemName = localStorageItemName + variableCategoryName;
			}
			var currentDateTimeInUtcStringPlus5Min = timeService.getCurrentDateTimeInUtcStringPlusMin(5);
			var params = {};
			params.reminderTime = '(lt)' + currentDateTimeInUtcStringPlus5Min;
			params.sort = '-reminderTime';
			if (variableCategoryName) {
				params.variableCategoryName = variableCategoryName;
			}
			var deferred = $q.defer();
			QuantiModo.getTrackingReminderNotifications(params, function(response){
				if(response.success) {
					var trackingRemindersNotifications =
						variableCategoryService.attachVariableCategoryIcons(response.data);
					$rootScope.numberOfPendingNotifications = trackingRemindersNotifications.length;
					if (window.chrome && window.chrome.browserAction) {
						chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
					}
					localStorageService.setItem(localStorageItemName, JSON.stringify(trackingRemindersNotifications));
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

		reminderService.deleteNotificationFromLocalStorage = function(trackingReminderNotification){
			$rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
			localStorageService.deleteElementOfItemById('trackingReminderNotifications',
				trackingReminderNotification.id);
			localStorageService.deleteElementOfItemById('trackingReminderNotifications' +
				trackingReminderNotification.variableCategoryName,
				trackingReminderNotification.id);
		};

		reminderService.groupTrackingReminderNotificationsByDateRange = function (trackingReminderNotifications) {
			var result = [];
			var reference = moment().local();
			var today = reference.clone().startOf('day');
			var yesterday = reference.clone().subtract(1, 'days').startOf('day');
			var weekold = reference.clone().subtract(7, 'days').startOf('day');
			var monthold = reference.clone().subtract(30, 'days').startOf('day');

			var todayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
				return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
			});

			if (todayResult.length) {
				result.push({name: "Today", trackingReminderNotifications: todayResult});
			}

			var yesterdayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
				return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
			});

			if (yesterdayResult.length) {
				result.push({name: "Yesterday", trackingReminderNotifications: yesterdayResult});
			}

			var last7DayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
				var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

				return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true &&
					date.isSame(today, 'd') !== true;
			});

			if (last7DayResult.length) {
				result.push({name: "Last 7 Days", trackingReminderNotifications: last7DayResult});
			}

			var last30DayResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {

				var date = moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local();

				return date.isAfter(monthold) === true && date.isBefore(weekold) === true &&
					date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
			});

			if (last30DayResult.length) {
				result.push({name: "Last 30 Days", trackingReminderNotifications: last30DayResult});
			}

			var olderResult = trackingReminderNotifications.filter(function (trackingReminderNotification) {
				return moment.utc(trackingReminderNotification.trackingReminderNotificationTime).local().isBefore(monthold) === true;
			});

			if (olderResult.length) {
				result.push({name: "Older", trackingReminderNotifications: olderResult});
			}

			return result;
		};

		return reminderService;
	});