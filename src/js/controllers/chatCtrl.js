angular.module('starter').controller('SettingsCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService",
	function( $state, $scope, $rootScope, $http, qmService) {
	$scope.controller_name = "ChatCtrl";
	$scope.state = {};
	qmService.navBar.setFilterBarSearchIcon(false);
	$scope.$on('$ionicView.beforeEnter', function(e) {
		qmLog.debug('beforeEnter state ' + $state.current.name);
	});
    $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();});

}]);
