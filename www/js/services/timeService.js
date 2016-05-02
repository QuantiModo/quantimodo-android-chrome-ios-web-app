angular.module('starter')
	// Measurement Service
	.factory('timeService', function($http, $q, QuantiModo, localStorageService){

		// service methods
		var timeService = {

			getSecondsSinceMidnightLocal: function (utcTimeString) {

				var timeFormat = "HH:mm:ss Z";
				var utcTimeStringFull = moment().format(timeFormat);
				if(utcTimeString){
					utcTimeStringFull = utcTimeString + " +0000";
				}
				
				var hoursSinceMidnightLocal = moment(utcTimeStringFull, timeFormat).format("HH");
				var minutesSinceMidnightLocal = moment(utcTimeStringFull, timeFormat).format("mm");
				var secondsSinceMidnightLocal =
					hoursSinceMidnightLocal * 60 *60 + minutesSinceMidnightLocal * 60;

                // not sure why this is necessary
                secondsSinceMidnightLocal = secondsSinceMidnightLocal - 60 * 60;
                if(secondsSinceMidnightLocal < 0) {
                    secondsSinceMidnightLocal = secondsSinceMidnightLocal + 86400;
                }

				return secondsSinceMidnightLocal;
			},

            getEpochTimeFromUtcString: function (utcTimeString) {

                var timeFormat = "HH:mm:ss Z";
                var utcTimeStringFull = moment().format(timeFormat);
                if(utcTimeString){
                    utcTimeStringFull = utcTimeString + " +0000";
                }

                var epochTime = moment(utcTimeStringFull, timeFormat).unix();
                
                return epochTime;
            }
		};

		return timeService;
	});