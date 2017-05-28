angular.module('starter').controller('AppDesignerCtrl', function( $state, $scope, $ionicPopover, $ionicPopup, $rootScope, quantimodoService) {
	$scope.controller_name = "AppDesignerCtrl";
	$scope.state = {
		appSettings: config.appSettings
	};
    function toTitleCase(str) {return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}
    var appTypes = [];
    var appSettingsFields = [];
    for (var appType in quantimodoService.menus) {
        if (quantimodoService.menus.hasOwnProperty(appType)) {
            appTypes.push(toTitleCase(appType));
        }
    }
    for (var appSettingsProperty in $rootScope.appSettings) {
        if ($rootScope.appSettings.hasOwnProperty(appSettingsProperty)) {
            appSettingsFields.push({
				name: appSettingsProperty,
				value: $rootScope.appSettings[appSettingsProperty]
			});
        }
    }
    $scope.state.appSettingsFields = appSettingsFields;
    $scope.state.appTypes = appTypes.sort();
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
    $scope.postAppSettings = function () {
        quantimodoService.showBlackRingLoader();
        quantimodoService.postAppSettingsDeferred($rootScope.appSettings).then(function () {
			quantimodoService.hideLoader();
        }, function (error) {
			quantimodoService.showMaterialAlert(error);
        });
    };
});
