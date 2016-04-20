angular.module('starter')
	// Measurement Service
	.factory('reminderService', function($http, $q, QuantiModo, localStorageService){

		// service methods
		var reminderService = {

			addNewReminder : function(variableId, 
				defaultValue, 
				reminderFrequency, 
				variableName, 
				variableCategoryName, 
				abbreviatedUnitName, 
				combinationOperation,
				firstDailyReminderTime,
				secondDailyReminderTime,
				thirdDailyReminderTime){
				
				var deferred = $q.defer();

                var params = {
					variableId : variableId, 
                    defaultValue : defaultValue,
                    reminderFrequency : reminderFrequency,
                    variableName : variableName,
                    variableCategoryName : variableCategoryName,
                    abbreviatedUnitName : abbreviatedUnitName,
                    combinationOperation : combinationOperation,
                    firstDailyReminderTime : firstDailyReminderTime,
                    secondDailyReminderTime : secondDailyReminderTime,
                    thirdDailyReminderTime : thirdDailyReminderTime
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
				firstDailyReminderTime,
				secondDailyReminderTime,
				thirdDailyReminderTime){
				
				var deferred = $q.defer();

                console.log('Reminder frequency is ' + reminderFrequency);

                if(firstDailyReminderTime || secondDailyReminderTime || thirdDailyReminderTime){
                    reminderFrequency = null;
                }

                var params = {
                	id : id,
					variableId : variableId, 
                    defaultValue : defaultValue,
                    reminderFrequency : reminderFrequency,
                    variableName : variableName,
                    variableCategoryName : variableCategoryName,
                    abbreviatedUnitName : abbreviatedUnitName,
                    combinationOperation : combinationOperation,
                    firstDailyReminderTime : firstDailyReminderTime,
                    secondDailyReminderTime : secondDailyReminderTime,
                    thirdDailyReminderTime : thirdDailyReminderTime
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

			getTrackingReminders : function(category){

				var deferred = $q.defer();
				var params = typeof category != "undefined" && category != "" ? {variableCategoryName : category} : {};
				QuantiModo.getTrackingReminders(params ,function(reminders){
					if(reminders.success) deferred.resolve(reminders.data);
					else deferred.reject("error");
				}, function(err){
					deferred.reject(err);
				});

				return deferred.promise;
			},

			getTrackingReminderNotifications : function(category){

				var deferred = $q.defer();
				var params = typeof category != "undefined" && category != "" ?{variableCategoryName : category} : {};
				QuantiModo.getTrackingReminderNotifications(params, function(reminders){
					if(reminders.success) deferred.resolve(reminders.data);
					else deferred.reject("error");
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
			}
        };

		return reminderService;
	});