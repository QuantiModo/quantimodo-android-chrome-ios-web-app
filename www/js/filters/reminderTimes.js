angular.module('starter')
	// returns string for time
	.filter('reminderTimes', function(){
        "use strict";
        
	    return function(reminder){
	    	
	    	var parseDate = function(reminderTimeUtc){

				var now = new Date();
				var hourOffsetFromUtc = now.getTimezoneOffset()/60;
	    		var parsedReminderTimeUtc = reminderTimeUtc.split(':');
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

			if(reminder.reminderFrequency === 86400){
				if(!reminder.reminderStartTime){
                    reminder.reminderStartTime = '00:00:00';
				}
				return 'daily at ' + parseDate(reminder.reminderStartTime).format("hh:mm A");
			}

			return reminder.frequencyTextDescription;
	    };
	});