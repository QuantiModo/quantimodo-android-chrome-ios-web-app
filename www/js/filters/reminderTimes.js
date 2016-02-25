angular.module('starter')
	// returns string for time
	.filter('reminderTimes', function(){
	    return function(reminder){
	    	
	    	var parseDate = function(reminderTime){	    		
	    		var parsedDate = reminderTime.split(':');
	    		return moment().hours(parsedDate[0]).minutes(parsedDate[1]);
	    	};

	    	if (reminder.reminderFrequency === 28800){
	    		return  "at " + parseDate(reminder.firstDailyReminderTime).format("hh:mm A") + " , " + 
	    		parseDate(reminder.secondDailyReminderTime).format("hh:mm A")+ " and " +
	    		parseDate(reminder.thirdDailyReminderTime).format("hh:mm A");
	    	} else if (reminder.reminderFrequency === 43200){
	    		return "at " + parseDate(reminder.firstDailyReminderTime).format('hh:mm A') + " and " + 
	    		parseDate(reminder.secondDailyReminderTime).format("hh:mm A");
	    	} else if (reminder.reminderFrequency === 86400){
	    		return "at " + parseDate(reminder.firstDailyReminderTime).format("hh:mm A");
	    	} else return "";
	    }
	})