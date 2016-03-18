angular.module('starter')
	// returns the Image string against value
	.filter('ImageByValue', function(){
	    return function(value){
	        return config.getImageForTrackingFactorByNumber(value);
	    }
	})
	.filter('TrackingFactorByNumber', function(){
		return function(value){
			return config.getTrackingFactorByNumber(value);
		}
	})