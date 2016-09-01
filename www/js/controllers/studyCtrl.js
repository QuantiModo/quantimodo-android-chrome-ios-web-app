angular.module('starter')
	.controller('StudyCtrl', function($scope, $state, authService, $stateParams, $ionicHistory) {

		$scope.controller_name = "StudyCtrl";
        
        $scope.init = function(){
            $scope.state = {
                correlationObject: $stateParams.correlationObject
            };
            authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  {analytics.trackView("Study Controller");}
            if(!$scope.state.correlationObject) {
                $ionicHistory.goBack();
            }
        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });
	});