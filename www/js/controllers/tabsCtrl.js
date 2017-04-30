angular.module('starter').controller('TabsCtrl', function($scope, $state) {
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        $scope.tabsTitle = "Tabs Title";
    });
});
