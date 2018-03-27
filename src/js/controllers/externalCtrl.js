angular.module('starter')  // Handles all views that have an iFrame
.controller('ExternalCtrl', ["$scope", "$stateParams", "$rootScope", "$state", "qmService", "qmLogService", function($scope, $stateParams, $rootScope, $state, qmService, qmLogService) {
	$scope.controller_name = "ExternalCtrl";
	qmService.navBar.setFilterBarSearchIcon(false);
	// when page load completes
	window.closeLoading = function(){qmService.hideLoader();};
	$scope.$on('$ionicView.beforeEnter', function(e) {
		qmLogService.debug(null, 'beforeEnter state ' + $state.current.name);
		qmService.rootScope.setProperty('hideHelpButton', true);
        qmService.unHideNavigationMenu();
	});
	$scope.$on('$ionicView.afterLeave', function(){
        qmService.rootScope.setProperty('hideHelpButton', false);
	});
}]);
