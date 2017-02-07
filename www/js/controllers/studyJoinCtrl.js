angular.module('starter')
	.controller('StudyJoinCtrl', function($scope, $state, quantimodoService, $rootScope, $stateParams) {

		$scope.controller_name = "StudyJoinCtrl";

        $scope.studyJoinPage = {
            title: 'Joining Study',
            "backgroundColor": "#3467d6",
            circleColor: "#fefdfc",
            image: {
                url: "img/cute_robot_happy_transparent.png",
                height: "96",
                width: "70"
            },
            bodyText: "One moment please...",
            // moreInfo: "Your data belongs to you.  Security and privacy our top priorities. I promise that even if " +
            //     "the NSA waterboards me, I will never divulge share your data without your permission.",
        };

        $scope.$on('$ionicView.beforeEnter', function(e) {
            $scope.studyJoinPage.loading = true;
            $rootScope.stateParams = $stateParams;
            if(!$rootScope.user){
                quantimodoService.setLocalStorageItem('afterLoginGoToState', $state.current.name);
                $state.go('app.login');
            }

            $scope.requestParams = {
                causeVariableName: $rootScope.urlParameters.causeVariableName,
                effectVariableName: $rootScope.urlParameters.causeVariableName,
            };

            if($stateParams.correlationObject){
                $scope.requestParams = $stateParams.correlationObject;
            }

            if(!$scope.requestParams.causeVariableName){
                $scope.goBack();
            }

            quantimodoService.joinStudyDeferred($scope.requestParams).then(function () {
                $scope.studyJoinPage.title = "Thank you!";
                $scope.studyJoinPage.bodyText = 'Thank you for helping us to discover the relationship between ' +
                    $scope.requestParams.causeVariableName + ' and ' + $scope.requestParams.effectVariableName +
                    "! <br> Now let's record your first measurements!";
                $scope.studyJoinPage.loading = false;
            }, function (error) {
                $scope.studyJoinPage.loading = false;
                quantimodoService.reportError(error);
                $scope.showAlert("Could not join study.  Please contact mike@quantimo.do and he'll fix it for you.  Thanks!");
            });

        });

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);

        });

        $scope.$on('$ionicView.afterEnter', function(){

        });

        $scope.$on('$ionicView.beforeLeave', function(){

        });

        $scope.$on('$ionicView.leave', function(){

        });

        $scope.$on('$ionicView.afterLeave', function(){

        });

	});
