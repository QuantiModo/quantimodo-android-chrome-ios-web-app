angular.module('starter')
	// returns string for time
	.filter('time', function(){
	    return function(time){
	    	if(time){
	    		if(typeof time === "number") {
					return moment(time * 1000).format("MMM Do YYYY, hh:mm a").split(/,/g);
                }
				return moment.utc(time).local().format("dddd, MMMM Do YYYY, h:mm:ss a").split(/,/g);
	    	} else {
				return "";
            }
	    };
	})
	.filter('timeDateOneLine', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("h:mm a MMM Do YYYY").split(/,/g);
				}
				return moment.utc(time).local().format("h:mm a dddd MMMM Do YYYY").split(/,/g);
			} else {
				return "";
			}
		};
	})
	.filter('timeDayDate', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("h:mm a dddd MMM Do YYYY").split(/,/g);
				}
				return moment.utc(time).local().format("dddd h:mm a dddd MMMM Do YYYY").split(/,/g);
			} else {
				return "";
			}
		};
	})
	.filter('timeOfDay', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("h:mm a").split(/,/g);
				}
				return moment.utc(time).local().format("h:mm a").split(/,/g);
			} else {
				return "";
			}
		};
	})
	.filter('timeOfDayDayOfWeek', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("h:mm a dddd").split(/,/g);
				}
				return moment.utc(time).local().format("h:mm a dddd").split(/,/g);
			} else {
				return "";
			}
		};
	})
	.filter('timeOfDayDayOfWeekDate', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("h:mm a dddd, MMMM Do YYYY");
				}
				return moment.utc(time).local().format("h:mm a dddd, MMMM Do YYYY");
			} else {
				return "";
			}
		};
	})
	.filter('justDate', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("MMMM Do YYYY").split(/,/g);
				}
				return moment.utc(time).local().format("MMMM Do YYYY").split(/,/g);
			} else {
				return "";
			}
		};
	})
	.filter('dayOfWeekAndDate', function(){
		return function(time){
			if(time){
				if(typeof time === "number") {
					return moment(time * 1000).format("dddd MMM Do YYYY").split(/,/g);
				}
				return moment.utc(time).local().format("dddd MMMM Do YYYY").split(/,/g);
			} else {
				return "";
			}
		};
	})
	.filter('reminderTime', function(){
	    return function(time){
	    	if(time){
				var reminderTime = moment.utc(time).local().calendar();
	    		return reminderTime;
	    	} else {
				return "";
            }
	    };
	})
	.filter('reminderStartTimeUtcToLocal', function(){
		return function(reminderStartTime){
			if(reminderStartTime){
				var reminderStartTimeStringUtc = reminderStartTime + " +0000";
				var reminderStartTimeFormat = "HH:mm:ss Z";
				var localStartTimeString = moment(reminderStartTimeStringUtc, reminderStartTimeFormat).format("hh:mm a");
				return localStartTimeString;
			} else {
				return "";
			}
		};
	});