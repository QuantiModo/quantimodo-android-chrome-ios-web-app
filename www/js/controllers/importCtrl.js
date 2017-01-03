angular.module('starter')
	
	// controls the Import Data page of the app
	.controller('ImportCtrl', function($scope, $ionicLoading, $state, $rootScope, quantimodoService,
									   $cordovaOauth, $ionicPopup, $stateParams) {

		$scope.controller_name = "ImportCtrl";

        $rootScope.showFilterBarSearchIcon = false;
		
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

		var goToWebImportDataPage = function() {
			console.debug('importCtrl.init: Going to quantimodoService.getAccessTokenFromAnySource');
			$state.go(config.appSettings.defaultState);
			quantimodoService.getAccessTokenFromAnySource().then(function(accessToken){
				$ionicLoading.hide();
				if(ionic.Platform.platforms[0] === "browser"){
					console.debug("Browser Detected");

					var url = quantimodoService.getQuantiModoUrl("api/v2/account/connectors", true);
					if(accessToken){
						url += "access_token=" + accessToken;
					}
					var newTab = window.open(url,'_blank');

					if(!newTab){
						alert("Please unblock popups and refresh to access the Import Data page.");
					}
					$rootScope.hideNavigationMenu = false;
					//noinspection JSCheckFunctionSignatures
					$state.go(config.appSettings.defaultState);
				} else {
					var targetUrl = quantimodoService.getQuantiModoUrl("api/v1/connect/mobile", true);
					if(accessToken){
						targetUrl += "access_token=" + accessToken;
					}
					var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
					ref.addEventListener('exit', function(){
						$rootScope.hideNavigationMenu = false;
						//noinspection JSCheckFunctionSignatures
						$state.go(config.appSettings.defaultState);
					});
				}
			}, function(){
				$ionicLoading.hide();
				console.debug('importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...');
				quantimodoService.setLocalStorageItem('afterLoginGoTo', window.location.href);
				console.debug("set afterLoginGoTo to " + window.location.href);
				$rootScope.sendToLogin();
			});
		};

		var loadNativeConnectorPage = function(){
			console.debug('importCtrl: $rootScope.isMobile so using native connector page');
			quantimodoService.getConnectorsDeferred()
				.then(function(connectors){
					$rootScope.connectors = connectors;
                    if(connectors) {
						//Stop the ion-refresher from spinning
						$scope.$broadcast('scroll.refreshComplete');
                        $ionicLoading.hide().then(function(){
                            console.debug("The loading indicator is now hidden");
                        });
                    }
					$scope.refreshConnectors();
				});
		};

	    // constructor
	    var init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			$ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });

			if(true || $rootScope.isMobile || $stateParams.native){
				loadNativeConnectorPage();
			} else {
				goToWebImportDataPage();
			}
	    };

	    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
			init();
	    });

	});
