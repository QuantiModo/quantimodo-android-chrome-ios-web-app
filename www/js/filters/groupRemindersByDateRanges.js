angular.module('starter')
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

			if(todayResult.length) result.push({ name : "Today", reminders : todayResult });

			var yesterdayResult = reminders.filter(function(reminder){
				return moment.utc(reminder.trackingReminderNotificationTime).local().isSame(yesterday, 'd') === true;
			});

			if(yesterdayResult.length) result.push({ name : "Yesterday", reminders : yesterdayResult });

			var last7DayResult = reminders.filter(function(reminder){
				var date = moment.utc(reminder.trackingReminderNotificationTime).local();

				return date.isAfter(weekold) === true
					&& date.isSame(yesterday, 'd') !== true
					&& date.isSame(today, 'd') !== true;
			});

			if(last7DayResult.length) result.push({ name : "Last 7 Days", reminders : last7DayResult });

			var last30DayResult = reminders.filter(function(reminder){

				var date = moment.utc(reminder.trackingReminderNotificationTime).local();

				return date.isAfter(monthold) === true
					&& date.isBefore(weekold) === true
					&& date.isSame(yesterday, 'd') !== true
					&& date.isSame(today, 'd') !== true;
			});

			if(last30DayResult.length) result.push({ name : "Last 30 Days", reminders : last30DayResult });

			var olderResult = reminders.filter(function(reminder){
				return moment.utc(reminder.trackingReminderNotificationTime).local().isBefore(monthold) === true;
			});

			if(olderResult.length) result.push({ name : "Older", reminders : olderResult });

			return result;
		};
	});