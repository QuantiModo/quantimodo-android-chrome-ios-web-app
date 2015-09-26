angular.module('starter')
	
	// controls the Import Data page of the app
	.controller('ImportCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $state, $rootScope,utilsService){
		
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
	            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
	        });  

	        // get user's access token
	        authService.getAccessToken().then(function(token){
	            
	            console.log("valid Token", token);

	            // create an iframe
	            var iframe = document.createElement('iframe');
	            
	            // when iframe load close the spinner
	            iframe.onload=function(){
	                window.closeloading();
	            };

	            console.log("import url: ", "connect/connect.html?");
	            // redirect to the mobile connect page with the token
	            iframe.src = "connect/connect.html?";
	            
	            // append in view
	            document.getElementById('import_iframe').appendChild(iframe);
	            
	            // set attributes
	            jQuery("#import_iframe iframe").attr('frameborder', "0").attr('data-tap-disabled',"true");

	        }, function(){

	            console.log("need to log in");
                utilsService.showLoginRequiredAlert($scope.login);
                $ionicLoading.hide();

	        });
	       
	    };

	    // call the constructor
	    $scope.init();
	})