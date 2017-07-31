angular.module('starter')  // Handles all views that have an iFrame
.controller('ExternalCtrl', function($scope, $stateParams, $rootScope, $state, qmService) {
	$scope.controller_name = "ExternalCtrl";
	$rootScope.showFilterBarSearchIcon = false;
	// when page load completes
	window.closeLoading = function(){qmService.hideLoader();};
	$scope.$on('$ionicView.beforeEnter', function(e) {
		console.debug("beforeEnter state " + $state.current.name);
		$rootScope.hideHelpButton = true;
        $rootScope.hideNavigationMenu = false;
	});
	$scope.$on('$ionicView.afterLeave', function(){
		$rootScope.hideHelpButton = false;
	});
});
