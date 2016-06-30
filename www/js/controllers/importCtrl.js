angular.module('starter')
	
	// controls the Import Data page of the app
	.controller('ImportCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $state, $rootScope,
									   utilsService){
		
		$state.go('app');
		$scope.controller_name = "ImportCtrl";
		
		/*// redirect if not logged in
	    if(!$rootScope.user){

	        $state.go(config.appSettings.welcomeState);
	        // app wide signal to sibling controllers that the state has changed
	        $rootScope.$broadcast('transition');
	    }*/

	    // close the loader
	    window.closeLoading = function(){
	        $ionicLoading.hide();
	    };

	    // constructor
	    $scope.init = function(){
			Bugsnag.context = "importData";
			if (typeof analytics !== 'undefined')  { analytics.trackView("Import Data Controller"); }
			$scope.showLoader();
	        // get user's access token
	        authService.getAccessTokenFromAnySource().then(function(token){
	            $ionicLoading.hide();
	            if(ionic.Platform.platforms[0] === "browser"){
					console.log("Browser Detected");
					
					var url = config.getURL("api/v2/account/connectors", true);
					url += "access_token=" + token.accessToken;
					var newTab = window.open(url,'_blank');

					if(!newTab){
						alert("Please unblock popups and refresh to access the Import Data page.");
					}
                    $rootScope.hideNavigationMenu = false;
					$state.go(config.appSettings.defaultState);
	            } else {	            	
	            	var targetUrl = config.getURL("api/v1/connect/mobile", true);
	            	targetUrl += "access_token="+token.accessToken;
	            	var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
	            	ref.addEventListener('exit', function(){
                        $rootScope.hideNavigationMenu = false;
						$state.go(config.appSettings.defaultState);
					});
	            }
	        }, function(){
				$ionicLoading.hide();
				console.log('importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...');
				$state.go('app.login', {
					fromUrl : window.location.href
				});
	        });
	       
	    };

	    // call the constructor
	    // when view is changed
	    $scope.$on('$ionicView.enter', function(e) {
			$scope.init();
	    });
	});
