angular.module('starter')
	// Measurement Service
	.factory('reminderService', function($http, $q, QuantiModo, timeService){

		// service methods
		var reminderService = {

			addNewReminder : function(variableId, 
				defaultValue, 
				reminderFrequency, 
				variableName, 
				variableCategoryName, 
				abbreviatedUnitName, 
				combinationOperation,
				reminderStartTime){
				
				var deferred = $q.defer();

                var params = {
					variableId : variableId, 
                    defaultValue : defaultValue,
                    reminderFrequency : reminderFrequency,
                    variableName : variableName,
                    variableCategoryName : variableCategoryName,
                    abbreviatedUnitName : abbreviatedUnitName,
                    combinationOperation : combinationOperation,
                    reminderStartTime : reminderStartTime
                };

                QuantiModo.postTrackingReminder(params, function(){
                	deferred.resolve();
                }, function(err){
                	deferred.reject(err);
                });

				return deferred.promise;
			},

			postTrackingReminder: function(id,
				variableId, 
				defaultValue, 
				reminderFrequency, 
				variableName, 
				variableCategoryName, 
				abbreviatedUnitName, 
				combinationOperation,
				reminderStartTime){
				
				var deferred = $q.defer();

                console.log('Reminder frequency is ' + reminderFrequency);

                var params = {
                	id : id,
					variableId : variableId, 
                    defaultValue : defaultValue,
                    reminderFrequency : reminderFrequency,
                    variableName : variableName,
                    variableCategoryName : variableCategoryName,
                    abbreviatedUnitName : abbreviatedUnitName,
                    combinationOperation : combinationOperation,
                    reminderStartTime : reminderStartTime
                };

                QuantiModo.postTrackingReminder(params, function(){
                	deferred.resolve();
                }, function(err){
                	deferred.reject(err);
                });

				return deferred.promise;
			},

			skipReminder : function(reminderId){
				var deferred = $q.defer();

				QuantiModo.skipTrackingReminder(reminderId, function(response){
					if(response.success) deferred.resolve();
					else {
						deferred.reject();
					}
				}, function(err){
					deferred.reject(err);
				});
				
				return deferred.promise;
			},

			trackReminder : function(reminderId, modifiedReminderValue){
				var deferred = $q.defer();

				QuantiModo.trackTrackingReminder(reminderId, modifiedReminderValue, function(response){
					if(response.success) {
						deferred.resolve();
					}
					else {
						deferred.reject();
					}
				}, function(err){
					deferred.reject(err);
				});
				
				return deferred.promise;
			},

			snoozeReminder : function(reminderId){
				var deferred = $q.defer();

				QuantiModo.snoozeTrackingReminder(reminderId, function(response){
					if(response.success) deferred.resolve();
					else {
						deferred.reject();
					}
				}, function(err){
					deferred.reject(err);
				});
				
				return deferred.promise;
			},

			getTrackingReminders : function(category, reminderId){

				var deferred = $q.defer();
				var params = typeof category != "undefined" && category != "" ? {variableCategoryName : category} : {};
				if(reminderId){
					params = {id : reminderId};
				}
				QuantiModo.getTrackingReminders(params, function(reminders){
					if(reminders.success) deferred.resolve(reminders.data);
					else deferred.reject("error");
				}, function(err){
					deferred.reject(err);
				});

				return deferred.promise;
			},

			getTrackingReminderNotifications : function(category, today){

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
				QuantiModo.getTrackingReminderNotifications(params, function(reminders){
					if(reminders.success) {
						deferred.resolve(reminders.data);
					}
					else {
						deferred.reject("error");
					}
				}, function(err){
					deferred.reject(err);
				});

				return deferred.promise;
			},

			deleteReminder : function(reminderId){
				var deferred = $q.defer();

				QuantiModo.deleteTrackingReminder(reminderId, function(response){
					if(response.success) deferred.resolve();
					else {
						deferred.reject();
					}
				}, function(err){
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