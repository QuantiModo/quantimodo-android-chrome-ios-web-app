angular.module('starter')
	// returns string for time
	.filter('reminderTimes', function(){
        "use strict";
        
	    return function(reminder){
	    	
	    	var parseDate = function(reminderTime){	    		
	    		var parsedDate = reminderTime.split(':');
	    		return moment().hours(parsedDate[0]).minutes(parsedDate[1]);
	    	};

	    	if (reminder.firstDailyReminderTime && reminder.secondDailyReminderTime && reminder.thirdDailyReminderTime){
	    		return  "at " + parseDate(reminder.firstDailyReminderTime).format("hh:mm A") + ", " +
	    		parseDate(reminder.secondDailyReminderTime).format("hh:mm A")+ " and " +
	    		parseDate(reminder.thirdDailyReminderTime).format("hh:mm A");
	    	}

			if (reminder.firstDailyReminderTime && reminder.secondDailyReminderTime){
	    		return "at " + parseDate(reminder.firstDailyReminderTime).format('hh:mm A') + " and " + 
	    		parseDate(reminder.secondDailyReminderTime).format("hh:mm A");
	    	}

			if (reminder.firstDailyReminderTime){
	    		return "at " + parseDate(reminder.firstDailyReminderTime).format("hh:mm A");
	    	}

			return "";
	    };
	});