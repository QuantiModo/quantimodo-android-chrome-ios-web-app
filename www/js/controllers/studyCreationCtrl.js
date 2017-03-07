angular.module('starter')
	.controller('StudyCreationCtrl', function($scope, $state) {

        var green = { backgroundColor: "#0f9d58", circleColor: "#03c466" };
        var blue = { backgroundColor: "#3467d6", circleColor: "#5b95f9" };
        var yellow = { backgroundColor: "#f09402", circleColor: "#fab952" };
        $scope.state = {
            title: 'Create a Study',
            color: blue,
            image: {
                url: "img/quantimodo-robot-waving-2.svg",
                height: "120",
                width: "120"
            },
            bodyText: "One moment please...",
        };

        $scope.$on('$ionicView.beforeEnter', function(e) { });

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name); });

        $scope.$on('$ionicView.afterEnter', function(){ });

        $scope.$on('$ionicView.beforeLeave', function(){ });

        $scope.$on('$ionicView.leave', function(){ });

        $scope.$on('$ionicView.afterLeave', function(){ });
	});
