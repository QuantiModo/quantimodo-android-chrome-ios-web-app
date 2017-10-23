angular.module('starter').controller('TabsCtrl', function($scope, $state) {
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLogService.debug(null, 'Entering state ' + $state.current.name, null);
        $scope.tabsTitle = "Tabs Title";
    });
});
