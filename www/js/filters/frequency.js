angular.module('starter')
	.filter('frequency', function() {
		return function(value){

			var reverseFrequencyChart = {
				86400: "every 24 hours",
				43200: "every 12 hours",
				28800: "every 8 hours",
				21600: "every 6 hours",
				14400: "every 4 hours",
				10800: "every 3 hours",
				86400: "once a day",
				43200: "twice a day",
				28800: "three times a day",	
				3600: "hourly",
				10800: "every three hours",
				1800: "every 30 minutes",
				0: "never",
			};

			return reverseFrequencyChart[value];
		}
	});