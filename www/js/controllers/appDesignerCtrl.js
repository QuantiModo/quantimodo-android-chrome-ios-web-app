angular.module('starter').controller('AppDesignerCtrl', function( $state, $scope, $ionicPopover, $ionicPopup, $rootScope, quantimodoService) {
	$scope.controller_name = "AppDesignerCtrl";
	$scope.state = {
		appTypes: [],
		appSettings: config.appSettings
	};
    function toTitleCase(str) {return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}
    for (var appType in quantimodoService.menus) {
        if (quantimodoService.menus.hasOwnProperty(appType)) {
            $scope.state.appTypes.push(toTitleCase(appType));
        }
    }
	$scope.state.appSettings.appType = "Diet";
	$rootScope.showFilterBarSearchIcon = false;
	$scope.$on('$ionicView.beforeEnter', function(e) {
		$rootScope.hideNavigationMenu = false;
	});
	quantimodoService.hideLoader();
    $rootScope.appSettings.appType = "Diet";
    console.log($rootScope.appSettings);

	$scope.appTypeChange = function () {
        $rootScope.appSettings.menu = quantimodoService.getMenu($rootScope.appSettings.appType);
    };
});
