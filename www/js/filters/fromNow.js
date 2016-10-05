angular.module('starter')
	// returns human readable age i.e 10 minutes ago
	.filter('fromNow', function(){
	    return function(value){
	    	if(value){
	    		var d = new Date(value * 1000);
	    		return moment(d).fromNow();
	    	} else {
				return "";
			}
	    };
	})
	.filter('unique', function() {
	   return function(collection, keyname) {
	      var output = [], 
	          keys = [];

	      angular.forEach(collection, function(item) {
	          var key = item[keyname];
	          if(keys.indexOf(key) === -1) {
	              keys.push(key);
	              output.push(item);
	          }
	      });

	      return output;
	   };
	});