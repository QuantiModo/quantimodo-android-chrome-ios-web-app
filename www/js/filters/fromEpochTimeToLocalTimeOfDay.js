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
	})
	.filter('fromTwentyFourToTwelveHourFormat', function(){
		return function(twentyFourHourFormatString){
			var twentyFourHourFormatSetting = "HH:mm:ss";
			if (twentyFourHourFormatString){
				return moment(twentyFourHourFormatString, twentyFourHourFormatSetting).format('h:mm A');
			} else {
				return "";
			}
		};
	});