angular.module('starter')

    .controller('VariableButtonIconsCtrl', function($scope, $rootScope) {

        $scope.controller_name = "VariableButtonIconsCtrl";

        $rootScope.hideNavigationMenu = true;

        $scope.loadImages = function() {
            for(var i = 0; i < 15; i++) {
                $scope.images.push( );
            }
        };

    });