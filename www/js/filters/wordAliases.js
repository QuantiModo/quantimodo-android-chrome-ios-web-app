angular.module('starter')
	// returns the Image string against value
	.filter('wordAliases', function(){
	    return function(originalName){
			
			var aliasName = config.appSettings.wordAliases[originalName];
			
			if(typeof(aliasName) !== "undefined"){
				return aliasName;
			}
			
	        return originalName;
	    };
	});