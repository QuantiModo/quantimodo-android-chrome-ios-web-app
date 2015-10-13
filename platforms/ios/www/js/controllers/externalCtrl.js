angular.module('starter')

	// Handles All the Views that have an iframe
	.controller('ExternalCtrl', function($scope, $ionicModal, $timeout, $ionicLoading) {
		$scope.controller_name = "ExternalCtrl";
	    
	    // when page load completes
	    window.closeloading = function(){
	    	$ionicLoading.hide();
	    };
	    
	    // constructor
	    $scope.init = function(){
			
	    	// show loader
			$ionicLoading.show({
				noBackdrop: true,
				template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
		    });    	
	    };

	    // call constructor
	    $scope.init();
	})