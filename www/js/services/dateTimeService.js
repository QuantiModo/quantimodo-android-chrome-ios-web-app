angular.module('starter')

    // utility methods
    .factory('dateTimeService', function($state) {

        return {

            convertUtcHhmmssToSecondsSinceMidnightLocal : function (HhmmssUtcTime) {
                var now = new Date();
                var hourOffsetFromUtc = now.getTimezoneOffset()/60;
                var parsedDate = HhmmssUtcTime.split(':');
                var minutes = parsedDate[1];

                var localHour = parseInt(parsedDate[0]) - parseInt(hourOffsetFromUtc);
                if(localHour > 23){
                    localHour = localHour - 24;
                }
                if(localHour < 0){
                    localHour = localHour + 24;
                }

                return moment().hours(localHour).minutes(minutes);

            }

        };
    });