angular.module('starter')

	// Handles All the Views that have an iframe
	.controller('ExternalCtrl', function($scope, $ionicModal, $timeout, utilsService) {
		$scope.controller_name = "ExternalCtrl";
	    
	    // when page load completes
	    window.closeLoading = function(){
			utilsService.loadingStop();
	    };
	    
	    // constructor
	    $scope.init = function(){
			utilsService.loadingStart();
	    };

	    // call constructor
	    $scope.init();
	});