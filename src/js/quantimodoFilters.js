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
    return function(arr, lower, upper) {
        for (var i = lower; i <= upper; i++) {arr.push(i);}
        return arr;
    };
})
.filter('fromUnixTimestampToLocalTimeOfDay', function(){
    return function(epochTime){if (epochTime){return moment(epochTime*1000).format('h:mm A');} else {return "";}};
})
.filter('fromTwentyFourToTwelveHourFormat', function(){
    return function(twentyFourHourFormatString){
        var twentyFourHourFormatSetting = "HH:mm:ss";
        if (twentyFourHourFormatString){return moment(twentyFourHourFormatString, twentyFourHourFormatSetting).format('h:mm A');} else {return "";}
    };
})
.filter('fromNow', function(){
    return function(value){
        if(value){
            var d = new Date(value * 1000);
            return moment(d).fromNow();
        }
        return "";
    };
})
.filter('fromNowISO8601', function(){
    return function(isoString){
        if(isoString){
            return moment(isoString).fromNow();
        }
        return "";
    };
})
.filter('unique', function() {
    return function(collection, keyname) {
        var output = [], keys = [];
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
        }
        return "";
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
        }
        return "";
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
        }
        return "";
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
.filter('positiveImageByValue', ["qmService", "qmLogService", function(qmService, qmLogService){
    return function(ratingValue){
        return qmService.getPositiveImageByRatingValue(ratingValue);
    };
}])
.filter('negativeImageByValue', ["qmService", "qmLogService", function(qmService, qmLogService){
    return function(ratingValue){
        return qmService.getNegativeImageByRatingValue(ratingValue);
    };
}])
.filter('numericImageByValue', ["qmService", "qmLogService", function(qmService, qmLogService){
    return function(ratingValue){
        return qmService.getNumericImageByRatingValue(ratingValue);
    };
}])
.filter('PrimaryOutcomeVariableByNumber', ["qmService", "qmLogService", function(qmService, qmLogService){
    return function(value){
        return qm.getPrimaryOutcomeVariableByNumber(value);
    };
}])
.filter('time', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("MMM Do YYYY, h:mm a").split(/,/g);
            }
            return moment.utc(time).local().format("dddd, MMMM Do YYYY, h:mm:ss a").split(/,/g);
        }
        return "";
    };
})
.filter('timeDateOneLine', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("h:mm a MMM Do YYYY").split(/,/g);
            }
            return moment.utc(time).local().format("h:mm a dddd MMMM Do YYYY").split(/,/g);
        }
        return "";
    };
})
.filter('timeDayDate', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("h:mm a dddd MMM Do YYYY").split(/,/g);
            }
            return moment.utc(time).local().format("dddd h:mm a dddd MMMM Do YYYY").split(/,/g);
        }
        return "";
    };
})
.filter('timeOfDay', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("hA");
            }
            return moment.utc(time).local().format("hA");
        }
        return "";
    };
})
.filter('timeOfDayDayOfWeek', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("h:mm a dddd").split(/,/g);
            }
            return moment.utc(time).local().format("h:mm a dddd").split(/,/g);
        }
        return "";
    };
})
.filter('timeOfDayDayOfWeekNoArray', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("h:mm a dddd");
            }
            return moment.utc(time).local().format("h:mm a dddd");
        }
        return "";
    };
})
.filter('timeOfDayDayOfWeekDate', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("h:mm a dddd, MMMM Do YYYY");
            }
            return moment.utc(time).local().format("h:mm a dddd, MMMM Do YYYY");
        }
        return "";
    };
})
.filter('justDate', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("MMMM Do YYYY").split(/,/g);
            }
            return moment.utc(time).local().format("MMMM Do YYYY").split(/,/g);
        }
        return "";
    };
})
.filter('justDateNoArray', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("MMMM Do YYYY");
            }
            return moment.utc(time).local().format("MMMM Do YYYY");
        }
        return "";
    };
})
.filter('dayOfWeekAndDate', function(){
    return function(time){
        if(time){
            if(typeof time === "number") {
                return moment(time * 1000).format("ddd, MMM Do, YYYY");
            }
            return moment.utc(time).local().format("ddd, MMM Do, YYYY");
        }
        return "";
    };
})
.filter('reminderTime', function(){
    return function(time){
        if(time){
            var reminderTime = moment.utc(time).local().calendar();
            return reminderTime;
        }
        return "";
    };
})
.filter('reminderStartTimeUtcToLocal', function(){
    return function(reminderStartTime){
        if(reminderStartTime){
            var reminderStartTimeStringUtc = reminderStartTime + " +0000";
            var reminderStartTimeFormat = "HH:mm:ss Z";
            var localStartTimeString = moment(reminderStartTimeStringUtc, reminderStartTimeFormat).format("h:mm a");
            return localStartTimeString;
        }
        return "";
    };
})
.filter('unique', function() {
    return function(collection, keyname) {
        var output = [], keys = [];
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
        var aliasName = qm.getAppSettings().appDesign.wordAliases[originalName];
        if(typeof(aliasName) !== "undefined"){return aliasName;}
        return originalName;
    };
})
.filter('useHttps', function(){
    return function(originalName){
        if(!originalName){return originalName;}
        return originalName.replace("http://", "https://");
    };
})
.filter('truncateText', function(){
    return function(originalText){
        if(originalText.length > 25){return originalText.substring(0,25)+'...';}
        return originalText;
    };
})
.filter('capitalizeFirstLetter', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
})
.filter('camelCaseToTitleCase', function() {
    return function(input) {
        if(!input || typeof input !== "string"){return input;}
        var result = input.replace('app.', '');
        result = result.replace( /([A-Z])/g, " $1" );
        return result.charAt(0).toUpperCase() + result.slice(1); // capitalize the first letter - as an example.
    };
})
.filter('ionIconDisplayName', function() {
    return function(name) {
        if(!name || typeof name !== "string"){return name;}
        name = name.replace('ion-', '');
        name = name.replace('android-', '');
        name = name.replace('ios-', '');
        name = name.split('-').join(' ');
        var splitStr = name.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);}
        return splitStr.join(' ');
    };
})
.filter('prettyJSON', function () {
    function prettyPrintJson(json) {
        return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
    }
    return prettyPrintJson;
});
