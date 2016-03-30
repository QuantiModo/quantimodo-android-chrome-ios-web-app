angular.module('starter')
	.filter('frequency', function() {
		return function(value){

			var reverseFrequencyChart = {
				86400: "once a day",
				43200: "twice a day",
				28800: "three times a day",	
				3600: "hourly",
				10800: "every three hours",
				1800: "every 30 minutes",
				0: "never"
			};

			return reverseFrequencyChart[value];
		}
	});