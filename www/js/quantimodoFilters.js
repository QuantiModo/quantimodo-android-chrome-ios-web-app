angular.module('starter')
.filter('frequency', function() {
    return function(value){
        var reverseFrequencyChart = {
            43200: "every 12 hours",
            28800: "every 8 hours",
            21600: "every 6 hours",
            14400: "every 4 hours",
            10800: "every 3 hours",
            7200: "every 2 hours",
            3600: "hourly",
            1800: "every 30 minutes",
            60: "every minute",
            0: "never"
        };
        return reverseFrequencyChart[value];
    };
})
.filter('range', function() {
        var filter =
            function(arr, lower, upper) {
                for (var i = lower; i <= upper; i++) {
                    arr.push(i);
                }
                return arr;
            };
        return filter;
    })
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
})
.filter('fromNow', function(){
    return function(value){
        if(value){
            var d = new Date(value * 1000);
            return moment(d).fromNow();
        } else {
            return "";
        }
    };
})
.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
})
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
            localDateAndTime = moment.utc(epochTime).local().format(" h:mm a ddd, MMMM Do");
            return localDateAndTime;
        } else {
            return "";
        }
    };
})
.filter('fromUtcToLocalDateAndTimeCompact', function(){
    var localDateAndTime;
    return function(epochTime){
        if(epochTime){
            if(typeof epochTime === "number") {
                localDateAndTime = moment(epochTime * 1000).format(" h A dddd, MMM Do");
                return localDateAndTime;
            }
            localDateAndTime = moment.utc(epochTime).local().format(" h A dddd, MMM Do");
            return localDateAndTime;
        } else {
            return "";
        }
    };
})
.filter('groupRemindersByDateRanges', function() {
    return function(reminders){
        var result = [];
        var reference = moment().local();
        var today = reference.clone().startOf('day');
        var yesterday = reference.clone().subtract(1, 'days').startOf('day');
        var weekold = reference.clone().subtract(7, 'days').startOf('day');
        var monthold = reference.clone().subtract(30, 'days').startOf('day');
        var todayResult = reminders.filter(function(reminder){
            return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(today, 'd') === true;
        });
        if(todayResult.length) {result.push({name: "Today", reminders: todayResult});}
        var yesterdayResult = reminders.filter(function(reminder){
            return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
        });
        if(yesterdayResult.length) {result.push({name: "Yesterday", reminders: yesterdayResult});}
        var last7DayResult = reminders.filter(function(reminder){
            var date = moment.utc(reminder.trackingReminderNotificationTime).local();
            return date.isAfter(weekold) === true && date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
        });
        if(last7DayResult.length) {result.push({name: "Last 7 Days", reminders: last7DayResult});}
        var last30DayResult = reminders.filter(function(reminder){
            var date = moment.utc(reminder.trackingReminderNotificationTime).local();
            return date.isAfter(monthold) === true && date.isBefore(weekold) === true && date.isSame(yesterday, 'd') !== true && date.isSame(today, 'd') !== true;
        });
        if(last30DayResult.length) {result.push({name: "Last 30 Days", reminders: last30DayResult});}
        var olderResult = reminders.filter(function(reminder){
            return moment.utc(reminder.trackingReminderNotificationTime).local().isBefore(monthold) === true;
        });
        if(olderResult.length) {result.push({name: "Older", reminders: olderResult});}
        return result;
    };
})
.filter('reminderTimes', function(){
    "use strict";
    return function(reminder){
        var parseDate = function(reminderTimeUtc){
            var now = new Date();
            var hourOffsetFromUtc = now.getTimezoneOffset()/60;
            var parsedReminderTimeUtc = reminderTimeUtc.split(':');
            var minutes = parsedReminderTimeUtc[1];
            var hourUtc = parseInt(parsedReminderTimeUtc[0]);
            var localHour = hourUtc - parseInt(hourOffsetFromUtc);
            if(localHour > 23){localHour = localHour - 24;}
            if(localHour < 0){localHour = localHour + 24;}
            return moment().hours(localHour).minutes(minutes);
        };
        if(reminder.reminderFrequency === 86400){
            if(!reminder.reminderStartTime){reminder.reminderStartTime = '00:00:00';}
            return 'daily at ' + parseDate(reminder.reminderStartTime).format("h:mm A");
        }
        return reminder.frequencyTextDescription;
    };
})
.filter('percentage', function(){
    return function(value){
        var track_factors = {
            "1": 0,
            "2": 25,
            "3": 50,
            "4": 75,
            "5": 100
        };

        return track_factors[value]? track_factors[value] : 0;
    };
})
.filter('positiveImageByValue', function(quantimodoService){
    return function(ratingValue){
        return quantimodoService.getPositiveImageByRatingValue(ratingValue);
    };
})
.filter('negativeImageByValue', function(quantimodoService){
    return function(ratingValue){
        return quantimodoService.getNegativeImageByRatingValue(ratingValue);
    };
})
.filter('numericImageByValue', function(quantimodoService){
    return function(ratingValue){
        return quantimodoService.getNumericImageByRatingValue(ratingValue);
    };
})
.filter('PrimaryOutcomeVariableByNumber', function(quantimodoService){
    return function(value){
        return quantimodoService.getPrimaryOutcomeVariableByNumber(value);
    };
})
.filter('time', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("MMM Do YYYY, h:mm a").split(/,/g);
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
                return moment(time * 1000).format("hA");
            }
            return moment.utc(time).local().format("hA");
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
.filter('timeOfDayDayOfWeekNoArray', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("h:mm a dddd");
            }
            return moment.utc(time).local().format("h:mm a dddd");
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
.filter('justDateNoArray', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("MMMM Do YYYY");
            }
            return moment.utc(time).local().format("MMMM Do YYYY");
        } else {
            return "";
        }
    };
})
.filter('dayOfWeekAndDate', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("ddd, MMM Do, YYYY");
            }
            return moment.utc(time).local().format("ddd, MMM Do, YYYY");
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
            var localStartTimeString = moment(reminderStartTimeStringUtc, reminderStartTimeFormat).format("h:mm a");
            return localStartTimeString;
        } else {
            return "";
        }
    };
})
.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
})
// returns the Image string against value
.filter('wordAliases', function(){
    return function(originalName){
        var aliasName = config.appSettings.wordAliases[originalName];
        if(typeof(aliasName) !== "undefined"){return aliasName;}
        return originalName;
    };
})
.filter('truncateText', function(){
    return function(originalText){
        if(originalText.length > 25){return originalText.substring(0,25)+'...';}
        return originalText;
    };
});
