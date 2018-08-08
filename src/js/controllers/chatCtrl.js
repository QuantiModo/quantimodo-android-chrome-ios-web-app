angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams",
	function( $state, $scope, $rootScope, $http, qmService, $stateParams) {
	$scope.controller_name = "ChatCtrl";
	$scope.state = {
		trackingReminderNotification: null
	};
	qmService.navBar.setFilterBarSearchIcon(false);
	$scope.$on('$ionicView.beforeEnter', function(e) {
		qmLog.debug('beforeEnter state ' + $state.current.name);
        if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}


	});
    $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();});
    function getMostRecentNotification() {
        $scope.state.trackingReminderNotification = qm.notifications.getMostRecentNotification();
        $scope.state.messages.push($scope.state.trackingReminderNotification.listCard)
    }
}]);
