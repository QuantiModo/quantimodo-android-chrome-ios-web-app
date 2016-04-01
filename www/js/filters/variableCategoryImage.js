angular.module('starter')
	// returns the Image string against value
	.filter('ImageByVariableCategoryName', function(){
	    return function(variableCategoryName){
			console.log('Look up variable category image');
			if(variableCategoryName === 'Foods'){
				return 'ion-ios-nutrition';
			}
			if(variableCategoryName === 'Emotions'){
				return 'ion-happy-outline';
			}
			if(variableCategoryName === 'Symptoms'){
				return 'ion-ios-pulse';
			}
			if(variableCategoryName === 'Treatments'){
				return 'ion-ios-medkit-outline';
			}
			if(variableCategoryName === 'Physical Activity'){
				return 'ion-ios-body';
			}
			return 'ion-speedometer';
	    };
	});