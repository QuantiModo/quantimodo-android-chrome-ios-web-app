angular.module('starter')
	// returns string for time
	.filter('fromUtcToLocalDateAndTime', function(){
	    return function(time){
	    	if(time){
	    		if(typeof time === "number") {
					var localDateAndTime = moment(time * 1000).format(" hh:mm a dddd, MMM Do");
					return localDateAndTime;
                }
				localDateAndTime = moment.utc(time).local().format(" hh:mm a dddd, MMMM Do");
				return localDateAndTime;
	    	} else {
				return "";
            }
	    };
	});