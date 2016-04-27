angular.module('starter')
	// returns the Image string against value
	.filter('singularize', function(){
	    return function(originalWord){
			if(!originalWord){
				return originalWord;
			}
			var singularWord = pluralize(originalWord, 1);
			
	        return singularWord;
	    };
	});