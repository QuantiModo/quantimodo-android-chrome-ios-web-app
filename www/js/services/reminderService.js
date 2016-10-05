angular.module('starter')
	// Measurement Service
	.factory('reminderService', function($q, $rootScope, QuantiModo, timeService, notificationService,
										 localStorageService, $timeout, bugsnagService, variableCategoryService) {

		var reminderService = {};

		reminderService.postTrackingReminders = function(trackingRemindersArray){
			var deferred = $q.defer();
			QuantiModo.postTrackingReminders(trackingRemindersArray, function(){
				//update alarms and local notifications
				console.debug("remindersService:  Finished postTrackingReminder so now refreshTrackingRemindersAndScheduleAlarms");
				reminderService.refreshTrackingRemindersAndScheduleAlarms();
				deferred.resolve();
			}, function(err){
				bugsnagService.reportError(err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.skipReminderNotification = function(body){
			var deferred = $q.defer();
			reminderService.deleteNotificationFromLocalStorage(body);
			QuantiModo.skipTrackingReminderNotification(body, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				bugsnagService.reportError(err);
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
				bugsnagService.reportError(err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.trackReminderNotification = function(body){
			var deferred = $q.defer();
			console.debug('reminderService.trackReminderNotification: Going to track ' + JSON.stringify(body));
			reminderService.deleteNotificationFromLocalStorage(body);
			QuantiModo.trackTrackingReminderNotification(body, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				bugsnagService.reportError(err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.snoozeReminderNotification = function(body){
			var deferred = $q.defer();
			reminderService.deleteNotificationFromLocalStorage(body);
			QuantiModo.snoozeTrackingReminderNotification(body, function(response){
				if(response.success) {
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				bugsnagService.reportError(err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.getTrackingReminders = function(variableCategoryName) {
			var deferred = $q.defer();
			reminderService.getTrackingRemindersFromLocalStorage(variableCategoryName)
				.then(function (trackingReminders) {
					if (trackingReminders) {
						deferred.resolve(trackingReminders);
					} else {
						reminderService.refreshTrackingRemindersAndScheduleAlarms.then(function () {
							reminderService.getTrackingRemindersFromLocalStorage(variableCategoryName)
								.then(function (trackingReminders) {
									deferred.resolve(trackingReminders);
								});
						});
					}
				});
			return deferred.promise;
		};

		reminderService.refreshTrackingRemindersAndScheduleAlarms = function(){
			var deferred = $q.defer();
			if($rootScope.syncingReminders){
				console.warn('Already refreshTrackingRemindersAndScheduleAlarms within last 10 seconds! Rejecting promise!');
				deferred.reject('Already refreshTrackingRemindersAndScheduleAlarms within last 10 seconds! Rejecting promise!');
				return deferred.promise;
			}

			if(!$rootScope.syncingReminders){
				$rootScope.syncingReminders = true;
				$timeout(function() {
					// Set to false after 30 seconds because it seems to get stuck on true sometimes for some reason
					$rootScope.syncingReminders = false;
				}, 10000);

				var params = {
					limit: 200
				};

				QuantiModo.getTrackingReminders(params, function(remindersResponse){
					var trackingReminders = remindersResponse.data;
					if(remindersResponse.success) {
						if($rootScope.user){
							if($rootScope.user.combineNotifications !== true){
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
						} else {
							bugsnagService.reportError('No $rootScope.user in successful QuantiModo.getTrackingReminders callback! How did this happen?');
						}

						localStorageService.setItem('trackingReminders', JSON.stringify(trackingReminders));
						$rootScope.syncingReminders = false;
						deferred.resolve(trackingReminders);
					}
					else {
						$rootScope.syncingReminders = false;
						bugsnagService.reportError('No success from getTrackingReminders request');
						deferred.reject('No success from getTrackingReminders request');
					}
				}, function(err){
					$rootScope.syncingReminders = false;
					bugsnagService.reportError(err);
					deferred.reject(err);
				});

				return deferred.promise;
			}
		};

		reminderService.getTodayTrackingReminderNotifications = function(variableCategoryName){
			var params = {
				minimumReminderTimeUtcString : timeService.getLocalMidnightInUtcString(),
				maximumReminderTimeUtcString : timeService.getTomorrowLocalMidnightInUtcString(),
				sort : 'reminderTime'
			};
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
				bugsnagService.reportError(err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.getTrackingReminderNotifications = function(variableCategoryName){
			var deferred = $q.defer();
			var trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
				'trackingReminderNotifications', 'variableCategoryName', variableCategoryName);
			if(trackingReminderNotifications && trackingReminderNotifications.length){
				$rootScope.numberOfPendingNotifications = trackingReminderNotifications.length;
				if (window.chrome && window.chrome.browserAction && !variableCategoryName) {
					chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
				}
				deferred.resolve(trackingReminderNotifications);
			} else {
				$rootScope.numberOfPendingNotifications = 0;
				reminderService.refreshTrackingReminderNotifications().then(function () {
					trackingReminderNotifications = localStorageService.getElementsFromItemWithFilters(
						'trackingReminderNotifications', 'variableCategoryName', variableCategoryName);
					deferred.resolve(trackingReminderNotifications);
				}, function(error){
					bugsnagService.reportError('reminderService.getTrackingReminderNotifications: ' + error);
					deferred.reject(error);
				});
			}
			return deferred.promise;
		};

		reminderService.refreshTrackingReminderNotifications = function(){
			var deferred = $q.defer();
			if($rootScope.refreshingTrackingReminderNotifications){
				console.warn('Already called refreshTrackingReminderNotifications within last 10 seconds!  Rejecting promise!');
				deferred.reject('Already called refreshTrackingReminderNotifications within last 10 seconds!  Rejecting promise!');
				return deferred.promise;
			}
			$rootScope.refreshingTrackingReminderNotifications = true;
			$timeout(function() {
				// Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
				$rootScope.refreshingTrackingReminderNotifications = false;
			}, 10000);
			var currentDateTimeInUtcStringPlus5Min = timeService.getCurrentDateTimeInUtcStringPlusMin(5);
			var params = {};
			params.reminderTime = '(lt)' + currentDateTimeInUtcStringPlus5Min;
			params.sort = '-reminderTime';
			QuantiModo.getTrackingReminderNotifications(params, function(response){
				if(response.success) {
					var trackingRemindersNotifications =
						variableCategoryService.attachVariableCategoryIcons(response.data);
					$rootScope.numberOfPendingNotifications = trackingRemindersNotifications.length;
					if (window.chrome && window.chrome.browserAction) {
						chrome.browserAction.setBadgeText({text: String($rootScope.numberOfPendingNotifications)});
					}
					localStorageService.setItem('trackingReminderNotifications', JSON.stringify(trackingRemindersNotifications));
					$rootScope.refreshingTrackingReminderNotifications = false;
					$rootScope.$broadcast('getTrackingReminderNotifications');
					deferred.resolve(trackingRemindersNotifications);
				}
				else {
					$rootScope.refreshingTrackingReminderNotifications = false;
					deferred.reject("error");
				}
			}, function(err){
				bugsnagService.reportError(err);
				$rootScope.refreshingTrackingReminderNotifications = false;
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
				bugsnagService.reportError(err);
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
				bugsnagService.reportError(err);
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
                    // No need to do this for favorites so we do it at a higher level
					//reminderService.refreshTrackingReminderNotifications();
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				bugsnagService.reportError(err);
				deferred.reject(err);
			});

			return deferred.promise;
		};

		reminderService.addRatingTimesToDailyReminders = function(reminders) {
			var index;
			for (index = 0; index < reminders.length; ++index) {
				if (reminders[index].valueAndFrequencyTextDescription.indexOf('daily') > 0 &&
					reminders[index].valueAndFrequencyTextDescription.indexOf(' at ') === -1) {
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
			reminderService.createDefaultReminders();
			localStorageService.getItem('trackingReminderSyncQueue', function (trackingReminders) {
				if(trackingReminders){
					reminderService.postTrackingReminders(JSON.parse(trackingReminders)).then(function () {
						console.log('reminder queue synced' + trackingReminders);
						localStorageService.deleteItem('trackingReminderSyncQueue');
                        reminderService.refreshTrackingReminderNotifications().then(function(){
							console.debug('reminderService.syncTrackingReminderSyncQueueToServer successfully refreshed notifications');
						}, function (error) {
							console.error('reminderService.syncTrackingReminderSyncQueueToServer: ' + error);
						});
					}, function (err) {
						bugsnagService.reportError(err);
					});
				} else {
					console.log('No reminders to sync');
				}
			});
		};

		reminderService.deleteNotificationFromLocalStorage = function(body){
			var trackingReminderNotificationId = body;
			if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotification){
				trackingReminderNotificationId = body.trackingReminderNotification.id;
			}
			if(isNaN(trackingReminderNotificationId) && body.trackingReminderNotificationId){
				trackingReminderNotificationId = body.trackingReminderNotificationId;
			}
			$rootScope.numberOfPendingNotifications -= $rootScope.numberOfPendingNotifications;
			localStorageService.deleteElementOfItemById('trackingReminderNotifications',
				trackingReminderNotificationId);
			if(body.trackingReminderNotification && typeof body.trackingReminderNotification.variableCategoryName !== "undefined"){
				localStorageService.deleteElementOfItemById('trackingReminderNotifications' +
					body.trackingReminderNotification.variableCategoryName,
					trackingReminderNotificationId);
			}
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

		reminderService.getTrackingRemindersFromLocalStorage = function (variableCategoryName){
			var deferred = $q.defer();
			var allReminders = [];
			var nonFavoriteReminders = [];
			var unfilteredReminders = JSON.parse(localStorageService.getItemSync('trackingReminders'));
			unfilteredReminders =
				variableCategoryService.attachVariableCategoryIcons(unfilteredReminders);
			if(unfilteredReminders) {
				for(var k = 0; k < unfilteredReminders.length; k++){
					if(unfilteredReminders[k].reminderFrequency !== 0){
						nonFavoriteReminders.push(unfilteredReminders[k]);
					}
				}
				if(variableCategoryName && variableCategoryName !== 'Anything') {
					for(var j = 0; j < nonFavoriteReminders.length; j++){
						if(variableCategoryName === nonFavoriteReminders[j].variableCategoryName){
							allReminders.push(nonFavoriteReminders[j]);
						}
					}
				} else {
					allReminders = nonFavoriteReminders;
				}
				allReminders = reminderService.addRatingTimesToDailyReminders(allReminders);
				deferred.resolve(allReminders);
			}
			return deferred.promise;
		};

		reminderService.createDefaultReminders = function () {
			var deferred = $q.defer();

			localStorageService.getItem('defaultRemindersCreated', function (defaultRemindersCreated) {
				if(JSON.parse(defaultRemindersCreated) !== true) {
					var defaultReminders = config.appSettings.defaultReminders;
					if(defaultReminders && defaultReminders.length){
						localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminders', defaultReminders);
						console.debug('Creating default reminders ' + JSON.stringify(defaultReminders));
						reminderService.postTrackingReminders(defaultReminders).then(function () {
							console.debug('Default reminders created ' + JSON.stringify(defaultReminders));
							reminderService.refreshTrackingReminderNotifications().then(function(){
								console.debug('reminderService.createDefaultReminders successfully refreshed notifications');
							}, function (error) {
								console.error('reminderService.createDefaultReminders: ' + error);
							});
							reminderService.refreshTrackingRemindersAndScheduleAlarms();
							localStorageService.setItem('defaultRemindersCreated', true);
							deferred.resolve();
						}, function (err) {
							bugsnagService.reportError(err);
							deferred.reject();
						});
					}
				} else {
					console.log('Default reminders already created');
				}
			});
			return deferred.promise;
		};

		return reminderService;
	});