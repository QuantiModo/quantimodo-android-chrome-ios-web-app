angular.module('starter')
	.controller('StudyCreationCtrl', function($scope, $state, quantimodoService) {

        $scope.state = {
            title: 'Create a Study',
            color: quantimodoService.blue,
            image: { url: "img/quantimodo-robot-waving-2.svg", height: "120", width: "120" },
            bodyText: "One moment please...",
        };

        $scope.$on('$ionicView.beforeEnter', function(e) { quantimodoService.goToLoginIfNecessary(); });
	});
