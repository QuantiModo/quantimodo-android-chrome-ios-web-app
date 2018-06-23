angular.module("starter").controller("DataSharingCtrl", ["$scope", "$state", "qmService", "qmLogService", "$stateParams",
    "$ionicHistory", "$rootScope", "$timeout", "$ionicLoading", "wikipediaFactory", "$ionicActionSheet", "clipboard", "$mdDialog",
    function($scope, $state, qmService, qmLogService, $stateParams, $ionicHistory, $rootScope,
                                      $timeout, $ionicLoading, wikipediaFactory, $ionicActionSheet, clipboard, $mdDialog) {

        $scope.controller_name = "DataSharingCtrl";
        $scope.state = {
            authorizedClients: null
        };
        $scope.$on("$ionicView.beforeEnter", function() {
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            $scope.state.refreshAuthorizedClients();
        });
        $scope.$on("$ionicView.enter", function() {

        });
        $scope.$on("$ionicView.afterEnter", function() {

        });
        $scope.state.revokeAccess = function (clientId) {
            qm.userHelper.revokeClientAccess(clientId, function (user) {
                qmService.rootScope.setProperty('user', user);
            })
        };
        $scope.state.refreshAuthorizedClients = function () {
            qm.userHelper.getUserFromApi(function (user) {
                qmService.rootScope.setProperty('user', user);
            }, function (error) {
                qmLog.error(error);
            });
        };
}]);
