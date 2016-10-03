angular.module('starter')
	.controller('StudyCtrl', function($scope, $state, QuantiModo, $stateParams, $ionicHistory, $rootScope) {

		$scope.controller_name = "StudyCtrl";
        
        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state = {
                correlationObject: $stateParams.correlationObject
            };
            if(!$scope.state.correlationObject) {
                $ionicHistory.goBack();
            }
        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });
	});