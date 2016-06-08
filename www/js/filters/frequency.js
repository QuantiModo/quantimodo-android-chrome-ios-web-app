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
		}
	});