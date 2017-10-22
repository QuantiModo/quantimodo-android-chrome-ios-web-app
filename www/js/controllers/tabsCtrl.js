angular.module('starter').controller('TabsCtrl', function($scope, $state) {
    $scope.$on('$ionicView.beforeEnter', function(e) { qmLog.debug("Entering state " + $state.current.name);
        $scope.tabsTitle = "Tabs Title";
    });
});
