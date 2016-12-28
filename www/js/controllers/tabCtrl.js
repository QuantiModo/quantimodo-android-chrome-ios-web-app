angular.module('starter')

    .controller('TabCtrl', function($scope) {

        $scope.controller_name = "TabCtrl";

        $scope.state = {
            title: 'Measurements'
        };

        $scope.goToSettingsTab = function () {
            $scope.state.title = 'Settings';

        };

        $scope.goToRemindersTab = function () {

            $scope.state.title = 'Reminders';
        };

        $scope.goToMeasurementsTab = function () {
            $scope.state.title = 'Measurements';
        };

    });