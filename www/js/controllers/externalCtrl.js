angular.module('starter')

	// Handles All the Views that have an iframe
	.controller('ExternalCtrl', function($scope, $ionicModal, $timeout, utilsService) {
		$scope.controller_name = "ExternalCtrl";
	    
	    // when page load completes
	    window.closeLoading = function(){
			$scope.hideLoader();
	    };
	    
	    // constructor
	    $scope.init = function(){
			$scope.showLoader();
	    };

	    // call constructor
	    $scope.init();
	});