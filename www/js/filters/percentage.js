angular.module('starter')
	// returns percentage for a track factor value
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
		}
	});