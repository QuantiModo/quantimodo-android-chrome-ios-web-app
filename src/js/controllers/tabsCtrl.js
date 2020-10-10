angular.module('starter').controller('TabsCtrl', ["$scope", "$state", function($scope, $state){
    $scope.$on('$ionicView.beforeEnter', function(e){
        qmLog.debug('Entering state ' + $state.current.name, null);
        $scope.tabsTitle = "Tabs Title";
    });
}]);
