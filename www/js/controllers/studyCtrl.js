angular.module('starter')
	.controller('StudyCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading,
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService, $stateParams, $ionicHistory) {

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

        $scope.$on('$ionicView.enter', function(e){
            $scope.init();
        });
	});