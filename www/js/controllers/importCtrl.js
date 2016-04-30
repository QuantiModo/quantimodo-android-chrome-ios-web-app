angular.module('starter')
	
	// controls the Import Data page of the app
	.controller('ImportCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $state, $rootScope,
									   utilsService){
		
		$state.go('app');
		$scope.controller_name = "ImportCtrl";
		
		/*// redirect if not logged in
	    if(!$scope.isLoggedIn){

	        $state.go('app.welcome');
	        // app wide signal to sibling controllers that the state has changed
	        $rootScope.$broadcast('transition');
	    }*/

	    // close the loader
	    window.closeloading = function(){
	        $ionicLoading.hide();
	    };

	    // constructor
	    $scope.init = function(){
	        
	        // show spinner
	        $ionicLoading.show({
	            noBackdrop: true,
	            template: '<p class="item-icon-left">One moment please...<ion-spinner icon="lines"/></p>'
	        });  

	        // get user's access token
	        authService.getAccessTokenFromAnySource().then(function(token){
	            
	            console.log("Valid token", token);

	            $ionicLoading.hide();

	            if(ionic.Platform.platforms[0] === "browser"){
					console.log("Browser Detected");
					
					var url = config.getURL("api/v1/connect/mobile", true);
					url += "access_token=" + token.accessToken;
					var newTab = window.open(url,'_blank');

					if(!newTab){
						alert("Please unblock popups and refresh to access the Import Data page.");
					}
					
					$state.go(config.appSettings.defaultState);
	            } else {	            	
	            	var targetUrl = config.getURL("api/v1/connect/mobile", true);
	            	targetUrl += "access_token="+token.accessToken;
	            	var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
	            	ref.addEventListener('exit', function(){
						$state.go(config.appSettings.defaultState);
					});
	            }	            

	        }, function(){

	            console.log("need to log in");
                utilsService.showLoginRequiredAlert($scope.login);
                $ionicLoading.hide();

	        });
	       
	    };

	    // call the constructor
	    // when view is changed
	    $scope.$on('$ionicView.enter', function(e) {
			$scope.init();
	    });
	});
