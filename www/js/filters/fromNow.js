angular.module('starter')
	// returns human readable age i.e 10 minutes ago
	.filter('fromNow', function(){
	    return function(value){
	    	if(value){
	    		var d = new Date(value * 1000);
	    		return moment(d).fromNow();
	    	} else return "";
	    }
	});