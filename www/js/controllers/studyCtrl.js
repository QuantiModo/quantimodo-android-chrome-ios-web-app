angular.module('starter')
	
	// Controls the Positive Factors page
	.controller('StudyCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading,
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService, $stateParams, $ionicHistory) {

        $scope.state = {
            correlationObject: $stateParams.correlationObject
        };
		$scope.controller_name = "StudyCtrl";
        
        $scope.init = function(){
            authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  {analytics.trackView("Study Controller");}
            if(!$scope.state.correlationObject) {
                $ionicHistory.backView();
            }
        };

        $scope.$on('$ionicView.enter', function(e){
            console.log("about to call init from enter: else");
            $scope.init();
        });
	});