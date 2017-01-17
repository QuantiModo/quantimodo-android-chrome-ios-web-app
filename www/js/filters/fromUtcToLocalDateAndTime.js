angular.module('starter')
	// returns string for time
	.filter('fromUtcToLocalDate', function(){
		var localDateAndTime;
		return function(epochTime){
			if(epochTime){
				if(typeof epochTime === "number") {
					localDateAndTime = moment(epochTime * 1000).format(" dddd, MMM Do");
					return localDateAndTime;
				}
				localDateAndTime = moment.utc(epochTime).local().format(" dddd, MMMM Do");
				return localDateAndTime;
			} else {
				return "";
			}
		};
	})
	.filter('fromUtcToLocalDateAndTime', function(){
		var localDateAndTime;
	    return function(epochTime){
	    	if(epochTime){
	    		if(typeof epochTime === "number") {
					localDateAndTime = moment(epochTime * 1000).format(" h:mm a dddd, MMM Do");
					return localDateAndTime;
                }
				localDateAndTime = moment.utc(epochTime).local().format(" h:mm a dddd, MMMM Do");
				return localDateAndTime;
	    	} else {
				return "";
            }
	    };
	});