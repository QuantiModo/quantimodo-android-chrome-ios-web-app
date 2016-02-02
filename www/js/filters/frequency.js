angular.module('starter')
	.filter('frequency', function() {
		return function(value){

			var reverseFrequencyChart = {
				0: "never", 
				3600: "hourly", 
				10800: "every three hours", 
				43200: "twice daily",
				86400: "daily" 
			};

			return reverseFrequencyChart[value];
		}
	});