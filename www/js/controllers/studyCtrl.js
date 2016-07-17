angular.module('starter')
	
	// Controls the Positive Factors page
	.controller('StudyCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading,
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService, $stateParams) {

        $scope.loading = true;
        $scope.title = $stateParams.factor;

        if(!$rootScope.user){
            console.debug("studyCtrl: not logged in, going to default state");
            $state.go(config.appSettings.defaultState);
            // app wide signal to sibling controllers that the state has changed
            $rootScope.$broadcast('transition');
        }
        
		$scope.controller_name = "StudyCtrl";
        
        $scope.init = function(){

            var isAuthorized = authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  {
                analytics.trackView("Study Controller");
            }
            if (isAuthorized){
                if ($stateParams.factorObject) {
                    $rootScope.studyPage = {
                        factor: $stateParams.factorObject
                    };
                    $scope.factor = $rootScope.studyPage.factor;
                    $scope.title = $scope.factor.cause;
                    $scope.showStudy = true;
                }
                else {
                    console.debug("studyCtrl: no factor, going to default state");
                    // FIXME go to fromUrl or fromState instead
                    $state.go(config.appSettings.defaultState);
                    // app wide signal to sibling controllers that the state has changed
                    $rootScope.$broadcast('transition');
                }
            }
            else {
                console.debug("studyCtrl: not logged in, going to default state");
                $state.go(config.appSettings.defaultState);
                // app wide signal to sibling controllers that the state has changed
                $rootScope.$broadcast('transition');
            }
        };

        // when view is changed
        $scope.$on('$ionicView.enter', function(e){

            if (!$rootScope.studyPage) {
                console.log("about to call init from enter: no $rootScope.studyPage");
                $scope.init();
            }
            else if (!$rootScope.studyPage.factor) {
                console.log("about to call init from enter: no $rootScope.studyPage.factor");
                $scope.init();
            }
            else if ($rootScope.studyPage.factor.cause !== $stateParams.factor) {
                console.log("about to call init from enter: new factor");
                $scope.init();
            } else if ($rootScope.studyPage.factor.cause === $stateParams.factor) {
                if ($stateParams.factorObject) {
                    console.log("about to call init from enter: new factor object");
                    $scope.init();
                }
                else {
                    $scope.factor = $rootScope.studyPage.factor;
                }
            }
            else {
                console.log("about to call init from enter: else");
                $scope.init();
            }
        });
	});