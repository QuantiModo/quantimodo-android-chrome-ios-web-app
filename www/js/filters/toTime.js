angular.module('starter')
	// Returns time in HH:MM format
	.filter('toTime', function(){
	    return function(value){
	    	if (value){
	    		return moment(value*1000).format('hh:mm A')
	    	} else return "";
        }
	});