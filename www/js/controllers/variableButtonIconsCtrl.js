angular.module('starter')

    .controller('VariableButtonIconsCtrl', function($scope, $http) {

        $scope.controller_name = "VariableButtonIconsCtrl";

        $scope.loadImages = function() {
            for(var i = 0; i < 15; i++) {
                $scope.images.push( );
            }
        };

    });