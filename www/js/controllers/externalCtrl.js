angular.module('starter')

	// Handles all views that have an iFrame
	.controller('ExternalCtrl', function($scope, $stateParams, $rootScope, $state) {
		$scope.controller_name = "ExternalCtrl";

        $rootScope.showFilterBarSearchIcon = false;
	    
	    // when page load completes
	    window.closeLoading = function(){
			$scope.hideLoader();
	    };

	    $scope.init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
	    };

	    $scope.init();
	});