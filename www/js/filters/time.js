angular.module('starter')
	// returns string for time
	.filter('time', function(){
	    return function(time){
	    	if(time){
	    		return moment(time*1000).format("MMM Do YYYY, hh:mm a").split(/,/g);;
	    	} else return "";
	    }
	});