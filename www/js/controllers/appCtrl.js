angular.module('starter')
    
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $ionicModal, $timeout, $injector, utilsService, authService, measurementService, $ionicPopover, $ionicLoading, $state, $ionicHistory, QuantiModo, notificationService, $rootScope, localStorageService) {

    // flags
    $scope.controller_name = "AppCtrl";
    $scope.isLoggedIn  = false;
    $scope.showSubMenu = false;
    $scope.shopping_cart_enabled = config.shopping_cart_enabled;
    $rootScope.isSyncing = false;
    var $cordovaFacebook = {};

    $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
    $scope.isAndroid = ionic.Platform.isAndroid();
    $scope.isChrome = window.chrome ? true : false;

    if($scope.isIOS && $injector.has('$cordovaFacebook')){
        $cordovaFacebook = $injector.get('$cordovaFacebook');
    }
    
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

    $scope.fromDate = new Date();
    $scope.toDate = new Date();

    // when date is updated
    $scope.datePickerFromCallback = function (val) {
      if(typeof(val)==='undefined'){        
          console.log('Date not selected');
      }else{
          $scope.fromDate = new Date(val);
          $scope.saveDates();
      }
    };

    $scope.datePickerToCallback = function (val) {
      if(typeof(val)==='undefined'){        
          console.log('Date not selected');
      }else{
          $scope.toDate = new Date(val);
          $scope.saveDates();
      }
    };

    // update dates selected from calender
	$scope.saveDates = function(){
		var to = moment($scope.toDate).unix()*1000;
		var from = moment($scope.fromDate).unix()*1000;
		
		measurementService.setDates(to, from);
		$scope.popover.hide();
        $scope.init();
	};

    // show calender popup
	$scope.showCalenderF = function($event){
        $scope.popover.show($event);
        measurementService.getToDate(function(end_date){
            $scope.toDate = new Date(end_date);
            measurementService.getFromDate(function(from_date){
                $scope.fromDate = new Date(from_date);
            });
        });
	};

    // get Authentication Token
    $scope.getAuthToken = function(request_token, withJWT){
    	authService.getAccessTokenFromRequestToken(request_token, withJWT)
    	.then(function(response) {
    		
            console.log("access token recieved",response);
            if(typeof withJWT !== "undefined" && withJWT === true) authService.updateAccessToken(response, withJWT);
            else authService.updateAccessToken(response);
    		
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
            url += "&redirect_uri=https://app.quantimo.do/ionic/Modo/www/callback";

            chrome.identity.launchWebAuthFlow({
                'url': url, 
                'interactive': true
            }, function(redirect_url) {
                var requestToken = utilsService.getUrlParameter(event.url, 'code');
                
                if(requestToken === false) requestToken = utilsService.getUrlParameter(event.url, 'token');

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
            url += "&redirect_uri=https://app.quantimo.do/ionic/Modo/www/callback";

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
                    if(utilsService.startsWith(iframe_url, "https://app.quantimo.do/ionic/Modo/www/callback/")) {    
                        // if there is no error
                        if(!utilsService.getUrlParameter(iframe_url,'error')) {
                            
                            // extract token
                            var requestToken = utilsService.getUrlParameter(iframe_url, 'code');
                            
                            if(requestToken === false) requestToken = utilsService.getUrlParameter(iframe_url, 'token');
                            
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
            url += "&redirect_uri=https://app.quantimo.do/ionic/Modo/www/callback";

            // open the auth window via inAppBrowser
			var ref = window.open(url,'_blank', 'location=no,toolbar=yes');
			                 
            // listen to it's event when the page changes
			ref.addEventListener('loadstart', function(event) {
				
                console.log('the loadstart url is', event.url);

                // check if changed url is the same as redirection url
                if(utilsService.startsWith(event.url, "https://app.quantimo.do/ionic/Modo/www/callback/")) {
					
                    // if there is no error
                    if(!utilsService.getUrlParameter(event.url,'error')) {
                        
                        // extract request token
						var requestToken = utilsService.getUrlParameter(event.url, 'code');
                        console.log('code found', requestToken);

                        if(requestToken === false) requestToken = utilsService.getUrlParameter(event.url, 'token');
                        
                        console.log('token found', requestToken);
                        
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

    $scope.native_login = function(platform, accessToken){
        localStorageService.setItem('isWelcomed',"true");
        showLoader('Talking to QuantiModo');
        authService.getJWTToken(platform, accessToken)
        .then(function(responseToken){
            // success

            console.log("Mobile device detected!");
            var url = config.getURL("api/v2/bshaffer/oauth/authorize", true);

            url += "response_type=code";
            url += "&client_id="+config.getClientId();
            url += "&client_secret="+config.getClientSecret();
            url += "&scope="+config.getPermissionString();
            url += "&state=testabcd";
            url += "&token="+responseToken;
            url += "&redirect_uri=https://app.quantimo.do/ionic/Modo/www/callback";

            $ionicLoading.hide();

            // open the auth window via inAppBrowser
            var ref = window.open(url,'_blank', 'location=no,toolbar=no');
            
            // listen to it's event when the page changes
            ref.addEventListener('loadstart', function(event) {
                
                console.log("loadstart event", event);
                // check if changed url is the same as redirection url
                
                if(utilsService.startsWith(event.url, "https://app.quantimo.do/ionic/Modo/www/callback/")) {    
                    
                    // if there is no error
                    if(!utilsService.getUrlParameter(event.url,'error')) {
                        
                        console.log('the request token that i got is: ' + event.url);
                        // extract request token
                        var requestToken = utilsService.getUrlParameter(event.url, 'code');
                        
                        if(requestToken === false) requestToken = utilsService.getUrlParameter(event.url, 'token');
                        // close inAppBrowser
                        ref.close();
                        
                        var withJWT = true;
                        // get auth token from request token
                        $scope.getAuthToken(requestToken, withJWT);

                    } else {

                        console.log("error occoured", utilsService.getUrlParameter(event.url, 'error'));
                        
                        // close inAppBrowser
                        ref.close();
                    }
                }

            });
        }, function(){
            // error

            $ionicLoading.hide();
            console.log("error occured, couldn't generate JWT");
        });
    };

    // log in with google
    $scope.google_login = function(){
        showLoader('Logging you in');
        window.plugins.googleplus.login({}, function (user_data) {
            $ionicLoading.hide();
            console.log('successfully logged in');
            console.log('google->', JSON.stringify(user_data));
            var accessToken = user_data.accessToken;
            
            $scope.native_login('google', accessToken);
        },
        function (msg) {
            console.log("google login error", msg);
        });

    };

    $scope.google_logout = function(){
        window.plugins.googleplus.logout(function (msg) {
          console.log("logged out of google!");
      }, function(fail){
          console.log("failed to logout", fail);
      });
    }

    // login with facebook
    $scope.facebook_login = function(){
        showLoader('Logging you in');
        $cordovaFacebook.login(["public_profile", "email", "user_friends"])
        .then(function(success) {
            // success
            $ionicLoading.hide();
            console.log("facebook_login_success");
            console.log("facebook->", JSON.stringify(success));
            var accessToken = success.authResponse.accessToken;

            $scope.native_login('facebook', accessToken);
        }, function (error) {
            // error
            console.log("facebook login error", error);
        });
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