angular.module("starter").controller("DataSharingCtrl", ["$scope", "$state", "qmService",
    function($scope, $state, qmService) {
        $scope.controller_name = "DataSharingCtrl";
        $scope.state = {
            authorizedClients: null
        };
        $scope.$on("$ionicView.beforeEnter", function() {
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            $scope.state.refreshAuthorizedClients();
            qm.shares.getAuthorizedClientsFromLocalStorageOrApi(function (authorizedClients) {
                $scope.state.authorizedClients = authorizedClients;
            });
        });
        $scope.$on("$ionicView.enter", function() {

        });
        $scope.$on("$ionicView.afterEnter", function() {

        });
        $scope.state.revokeAccess = function (client) {
            client.hide = true;
            qmService.showInfoToast("Revoked data access from "+client.appDisplayName);
            qm.shares.revokeClientAccess(client.clientId, function (authorizedClients) {
                setAuthorizedClients(authorizedClients);
            })
        };
        $scope.state.refreshAuthorizedClients = function () {
            qm.shares.getAuthorizedClientsFromApi(function (authorizedClients) {
                setAuthorizedClients(authorizedClients);
            });
        };
        function setAuthorizedClients(response) {
            var authorizedClients = response.authorizedClients || response;
            if(authorizedClients){$scope.state.authorizedClients = authorizedClients;}
        }
}]);
