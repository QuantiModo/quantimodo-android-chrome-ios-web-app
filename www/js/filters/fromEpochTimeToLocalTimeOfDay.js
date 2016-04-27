angular.module('starter')
	// Returns time in HH:MM format
	.filter('fromUnixTimestampToLocalTimeOfDay', function(){
	    return function(epochTime){
	    	if (epochTime){
	    		return moment(epochTime*1000).format('h:mm A');
	    	} else {
				return "";
            }
        };
	});