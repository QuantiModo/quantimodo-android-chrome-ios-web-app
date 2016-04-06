angular.module('starter')
	// returns the Image string against value
	.filter('ImageByValue', function(){
	    return function(value){
	        return config.getImageForPrimaryOutcomeVariableByNumber(value);
	    };
	})
	.filter('PrimaryOutcomeVariableByNumber', function(){
		return function(value){
			return config.getPrimaryOutcomeVariableByNumber(value);
		};
	});