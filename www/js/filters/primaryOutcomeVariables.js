angular.module('starter')
	// returns the Image string against value
	.filter('positiveImageByValue', function(ratingService){
	    return function(ratingValue){
	        return ratingService.getPositiveImageByRatingValue(ratingValue);
	    };
	})
	.filter('negativeImageByValue', function(ratingService){
		return function(ratingValue){
			return ratingService.getNegativeImageByRatingValue(ratingValue);
		};
	})
	.filter('numericImageByValue', function(ratingService){
		return function(ratingValue){
			return ratingService.getNumericImageByRatingValue(ratingValue);
		};
	})
	.filter('PrimaryOutcomeVariableByNumber', function(ratingService){
		return function(value){
			return ratingService.getPrimaryOutcomeVariableByNumber(value);
		};
	});