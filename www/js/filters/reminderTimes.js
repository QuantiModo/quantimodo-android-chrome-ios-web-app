angular.module('starter')
	// returns string for time
	.filter('reminderTimes', function(){
        "use strict";
        
	    return function(reminder){
	    	
	    	var parseDate = function(reminderTime){

				var now = new Date();
				var hourOffsetFromUtc = now.getTimezoneOffset()/60;
	    		var parsedDate = reminderTime.split(':');
				var minutes = parsedDate[1];
				
				var localHour = parseInt(parsedDate[0]) - parseInt(hourOffsetFromUtc);
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
				return 'daily at ' + parseDate(reminder.reminderStartTime).format("hh:mm A")
			}

			return reminder.frequencyTextDescription;

/*	    	if (reminder.firstDailyReminderTime && reminder.secondDailyReminderTime && reminder.thirdDailyReminderTime){
	    		return  reminder.frequencyTextDescription + " at " + parseDate(reminder.firstDailyReminderTime).format("hh:mm A") + ", " +
	    		parseDate(reminder.secondDailyReminderTime).format("hh:mm A")+ " and " +
	    		parseDate(reminder.thirdDailyReminderTime).format("hh:mm A");
	    	}

			if (reminder.firstDailyReminderTime && reminder.secondDailyReminderTime){
	    		return reminder.frequencyTextDescription + " at " + parseDate(reminder.firstDailyReminderTime).format('hh:mm A') + " and " +
	    		parseDate(reminder.secondDailyReminderTime).format("hh:mm A");
	    	}

			if (reminder.firstDailyReminderTime){
	    		return "at " + parseDate(reminder.firstDailyReminderTime).format("hh:mm A");
	    	}

			return reminder.frequencyTextDescription;*/
	    };
	});