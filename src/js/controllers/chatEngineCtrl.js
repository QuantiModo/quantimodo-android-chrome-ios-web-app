angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout",
    function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout) {
        $scope.controller_name = "ChatCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.ChatEngine.connect(new Date().getTime(), {}, 'auth-key');
        $scope.ChatEngine.on('$.ready', function(data) {
            $scope.me = data.me;
        });
    }]
);
