angular.module('starter')
    
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService, $ionicPopover, $ionicLoading, $state, $ionicHistory, QuantiModo, notificationService, $rootScope,localStorageService) {

    // flags
    $scope.controller_name = "AppCtrl";
    $scope.isLoggedIn  = false;
    $scope.showSubMenu = false;
    $scope.shopping_cart_enabled = config.shopping_cart_enabled;
    $rootScope.isSyncing = false;

    
    /*Wrapper Config*/
    $scope.view_title = config.appSettings.app_name;
    $scope.tracking_factor = config.appSettings.tracking_factor;
    $scope.tracking_factor_options = config.getTrackingFactorOptions();
    $scope.tracking_factor_numbers = config.getTrackingFactorOptions(true);
    $scope.welcome_text = config.appSettings.welcome_text;
    $scope.tracking_question = config.appSettings.tracking_question;
    $scope.factor_average_text = config.appSettings.factor_average_text;
    /*Wrapper Config End*/


    // to handle transition event's triggered through sibling controllers.
    /*$scope.$on('transition', function(){
        // Timout to let the transition finish.
        setTimeout(function(){
            // For smaller devices, iphone <= 5s Only keep the first word of sentence in back button.
            // to stop text from overlaying on top of each other.
            console.log("transitioning");

            var text = jQuery('.previous-title:visible').text();
            if(text.length) {
               jQuery('.previous-title:visible').text(text.split(" ")[0]);
            }
            
        }, 300);
    });*/

    // when view is changed
    $scope.$on('$ionicView.enter', function(e) {
        if(e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackCtrl" && $scope.isLoggedIn){
            $scope.showCalender = true;
        } else {
        	$scope.showCalender = false;
        }
    });

    // load the calender popup
	$ionicPopover.fromTemplateUrl('templates/popover.html', {
		scope: $scope,
	}).then(function(popover) {
		$scope.popover = popover;
	});

    // update dates selected from calender
	$scope.saveDates = function(){
		var to = moment(document.getElementById('toDate').value).unix();
		var from = moment(document.getElementById('fromDate').value).unix();
		
		measurementService.setDates(to, from);
		$scope.popover.hide();
        $scope.init();
	};

    // show calender popup
	$scope.showCalenderF = function($event){
		console.log("showing");
        $scope.popover.show($event);

        measurementService.getToDate(function(end_date){
            document.getElementById('toDate').valueAsDate = new Date(end_date);
            measurementService.getFromDate(function(from_date){
                document.getElementById('fromDate').valueAsDate = new Date(from_date);
            });
        });


	};

    // get Authentication Token
    $scope.getAuthToken = function(request_token){
    	authService.getAccessTokenFromRequestToken(request_token)
    	.then(function(response) {
    		
            console.log("access token recieved",response);
            authService.updateAccessToken(response);
    		
            // set flags
    		$scope.isLoggedIn = true;
            localStorageService.setItem('isLoggedIn', true);

            // get user details from server
            getUser();

            // update app view wrt app state
            $scope.init();
    	})
    	.catch(function(err){
            
            console.log("error in generating access token", err);
            // set flags
    		$scope.isLoggedIn = false;
            localStorageService.setItem('isLoggedIn', false);
    	})
    };

    //get User
    var getUser = function(){
        QuantiModo.getUser(function(user){
            
            // set user data in local storage
            localStorageService.setItem('user', JSON.stringify(user));

            $scope.user_name = user.displayName;
        },function(err){

            // error
            console.log(err);
        });
    };

    // when work on this activity is complete
    $scope.movePage = function(){

        // if user has seen the welcome screen before
        localStorageService.getItem('isWelcomed',function(isWelcomed) {

            if(isWelcomed){
                $rootScope.isWelcomed = true;
                console.log("going");

                // move to tracking page
                if($state.current.name == "app.welcome"){
                    $state.go('app.track');
                    $rootScope.hideMenu = false;
                }

                // don't animate, clear back history
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true
                });

                // redraw everything according to updated appstate
                $rootScope.$broadcast('redraw');
            }


        });
    };

    // when user is logging out
    $scope.logout = function(){
        
        // set flags
        $scope.isLoggedIn = false;
        localStorageService.clear();

        //clear notification
        notificationService.cancelNotifications();
        
        //Set out localstorage flag for welcome screen variables
        localStorageService.setItem('interval',true);
        localStorageService.setItem('trackingFactorReportedWelcomeScreen',true);
        localStorageService.setItem('allData',JSON.stringify([]));

        // calculate tracking factor and chart data
        measurementService.calculateAverageTrackingFactorValue().then(function(){
            measurementService.calculateBothChart();
            measurementService.resetSyncFlag();
            //hard reload
            $state.go('app.welcome',{
            },{
                reload:true
            });
        });


    };

    // User wants to login
    $scope.login = function() {

        localStorageService.setItem('isWelcomed',"true");

    	var url = config.getURL("api/oauth2/authorize", true);

        if (window.chrome && chrome.runtime && chrome.runtime.id) {
            // Code running in a Chrome extension (content script, background page, etc.
            url = "http://app.quantimo.do/api/oauth2/authorize?"
            // add params
            url += "response_type=code";
            url += "&client_id="+config.getClientId();
            url += "&client_secret="+config.getClientSecret();
            url += "&scope="+config.getPermissionString();
            url += "&state=testabcd";

            chrome.identity.launchWebAuthFlow({
                'url': url, 
                'interactive': true
            }, function(redirect_url) {
                var requestToken = utilsService.getUrlParameter(redirect_url, 'code');
                $scope.getAuthToken(requestToken);
            });
        }

		else if(ionic.Platform.platforms[0] === "browser"){
			console.log("Browser Detected");

            // add params
            url += "response_type=code";
            url += "&client_id="+config.getClientId();
            url += "&client_secret="+config.getClientSecret();
            url += "&scope="+config.getPermissionString();
            url += "&state=testabcd";

            var ref = window.open(url,'_blank');

            if(!ref){
                alert("You must first unblock popups, and and refresh the page for this to work!");
            } else {
                // broadcast message question every second to sibling tabs
                var interval = setInterval(function(){
                    ref.postMessage('isLoggedIn?','https://app.quantimo.do/ionic/Modo/www/callback/');
                    ref.postMessage('isLoggedIn?','https://local.quantimo.do:4417/ionic/Modo/www/callback/');
                    ref.postMessage('isLoggedIn?','https://staging.quantimo.do/ionic/Modo/www/callback/');
                }, 1000);

                // handler when a message is recieved from a sibling tab
                window.onMessageRecieved = function(event){
                    console.log("message recieved", event.data);
                    
                    // Don't ask login question anymore
                    clearInterval(interval);
                    
                    // the url that QuantiModo redirected us to
                    var iframe_url = event.data;

                    // validate if the url is same as we wanted it to be
                    if(utilsService.hasInIt(iframe_url, "/ionic/Modo/www/callback")) {
                        
                        // if there is no error
                        if(!utilsService.getUrlParameter(iframe_url,'error')) {
                            
                            // extract token
                            var requestToken = utilsService.getUrlParameter(iframe_url, 'code');
                            
                            // get auth token from request token
                            $scope.getAuthToken(requestToken);
                            
                            // close the sibling tab
                            ref.close();

                        } else {
                            // TODO : display_error
                            console.log("error occoured", utilsService.getUrlParameter(iframe_url, 'error'));

                            // close the sibling tab
                            ref.close();
                        }
                    }  
                };

                // listen to broadcast messages from other tabs within browser 
                window.addEventListener("message", window.onMessageRecieved, false);
            }

		} else {

            console.log("Mobile device detected!");

            url += "response_type=code";
            url += "&client_id="+config.getClientId();
            url += "&client_secret="+config.getClientSecret();
            url += "&scope="+config.getPermissionString();
            url += "&state=testabcd";

            // open the auth window via inAppBrowser
			var ref = window.open(url,'_blank', 'location=no,toolbar=no');
			
            // listen to it's event when the page changes
			ref.addEventListener('loadstart', function(event) {
				
                // check if changed url is the same as redirection url
                if(utilsService.hasInIt(event.url, "/ionic/Modo/www/callback")) {
					
                    // if there is no error
                    if(!utilsService.getUrlParameter(event.url,'error')) {
						
                        // extract request token
                        var requestToken = utilsService.getUrlParameter(event.url, 'code');
						
                        // close inAppBrowser
                        ref.close();
						
                        // get auth token from request token
                        $scope.getAuthToken(requestToken);

					} else {

                        console.log("error occoured", utilsService.getUrlParameter(event.url, 'error'));
                        
                        // close inAppBrowser
                        ref.close();
                    }
                }

            });
        }
    };

    // when user click's skip button
    $scope.skipLogin = function(){
        localStorageService.setItem('isWelcomed',true);
        // move to the next screen
        $scope.movePage();
    }

    // show loading spinner
    var showLoader = function(str){
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">'+str+'...<ion-spinner icon="lines"/></p>'
        });
    };

    // hide loader and move to next page
    var hideLoaderMove = function(){
        $ionicLoading.hide();
        $scope.movePage();
    };

    // calculate values for both of the charts
    var calculateChartValues = function(){
        measurementService.calculateBothChart().then(hideLoaderMove, hideLoaderMove);
    };

    // Demonstration of a sample API call
    $scope.init = function () {
        console.log("Main Constructor Start");
        
        showLoader('Logging you in');

        // try to get access token
    	authService.getAccessToken().then(function(data) {
    		
            console.log('got the access token');
            var accessToken = data.accessToken;
            
            // set flags
            $scope.isLoggedIn = true;

            localStorageService.getItem('user',function(user){
                if(user){
                    user = JSON.parse(user);
                    console.log('user:' + user);
                    window.intercomSettings = {
                        app_id: "uwtx2m33",
                        name: user.displayName,
                        email: user.email,
                        user_id:user.id
                    }
                }

            });



            // update loader text
            $ionicLoading.hide();
            //showLoader('Syncing data');
            
            // sync data
            $scope.movePage();
            $rootScope.isSyncing = true;
            console.log('setting sync true');
            measurementService.sync_data().then(function(){
                console.log("sync complete");
                $rootScope.isSyncing = false;
                
                // update loader text
                $ionicLoading.hide();
                showLoader('Calculating stuff');
                
                // calculate tracking factor values
                measurementService.calculateAverageTrackingFactorValue().then(function(){
                    measurementService.getTrackingFactorValue().then(calculateChartValues, calculateChartValues);
                });

            }, hideLoaderMove);

        }, function () {

            //set flags
			$scope.isLoggedIn = false;
            $ionicLoading.hide();

            console.log('need to login again');
        });

    };

    $scope.toggleSubMenu = function(){
        $scope.showSubMenu = !$scope.showSubMenu;
    }

    // call constructor
    $scope.init();

    // redirection if already welcomed before
        var isWelcomed;
        localStorageService.getItem('isWelcomed',function(val){
            isWelcomed = val;
            console.log('isWelcomed '+isWelcomed);
            if(isWelcomed  === true || isWelcomed === "true"){
                $rootScope.isWelcomed=true;
                $state.go('app.track');
            } else {
                $state.go('app.welcome');
            }

        });



})