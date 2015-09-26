angular.module('starter')
	// returns string for time
	.filter('time', function(){
	    return function(time){
	    	return moment(time*1000).format("dddd, MMMM Do YYYY, h:mm:ss a")
	    }
	});