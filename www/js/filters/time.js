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
	.filter('reminderTime', function(){
	    return function(time){
	    	if(time){
	    		return moment.utc(time).local().calendar();
	    	} else {
				return "";
            }
	    };
	});