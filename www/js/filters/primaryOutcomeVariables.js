angular.module('starter')
	// returns the Image string against value
	.filter('ImageByValue', function(ratingService){
	    return function(value){
	        return ratingService.getImageForPrimaryOutcomeVariableByNumber(value);
	    };
	})
	.filter('PrimaryOutcomeVariableByNumber', function(){
		return function(value){
			return ratingService.getPrimaryOutcomeVariableByNumber(value);
		};
	});