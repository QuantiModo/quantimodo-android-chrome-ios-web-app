angular.module('starter')
	// returns the Image string against value
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
	});