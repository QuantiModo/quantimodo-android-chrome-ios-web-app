angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $ionicModal, $timeout, $injector, utilsService, authService,
                                    measurementService, $ionicPopover, $ionicLoading, $state, $ionicHistory,
                                    QuantiModo, notificationService, $rootScope, localStorageService, reminderService,
                                    $ionicPopup, $ionicSideMenuDelegate) {

    // flags
    $scope.controller_name = "AppCtrl";
    $scope.menu = config.appSettings.menu;
    $scope.isLoggedIn  = false;
    $scope.showTrackingSubMenu = false;
    $scope.showReminderSubMenu = false;
    $scope.closeMenu = function() {
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    $scope.not_show_help_popup;
    var help_popup_messages = config.appSettings.help_popup_messages || false;

    $scope.$on('$ionicView.enter', function(e) {
        if(help_popup_messages && typeof help_popup_messages[location.hash] !== "undefined"){
            localStorageService.getItem('not_show_help_popup',function(val){
                $scope.not_show_help_popup = val ? JSON.parse(val) : false;

                // Had to add "&& e.targetScope !== $scope" to prevent duplicate popups
                if(!$scope.not_show_help_popup && e.targetScope !== $scope){
                    $ionicPopup.show({
                        title: help_popup_messages[location.hash],
                        subTitle: '',
                        scope:$scope,
                        template:'<label><input type="checkbox" ng-model="$parent.not_show_help_popup" class="show-again-checkbox">Don\'t show these tips</label>',
                        buttons:[
                            {
                                text: 'OK',
                                type: 'button-calm',
                                onTap: function(){
                                    localStorageService.setItem('not_show_help_popup',JSON.stringify($scope.not_show_help_popup));
                                }
                            }
                        ]
                    });
                }
            });
        }
    });

    $scope.closeMenuIfNeeded = function(menuItem){
        if(menuItem.click){
            $scope[menuItem.click] && $scope[menuItem.click]();
        }
        else if(!menuItem.subMenuPanel){
            $scope.closeMenu();
        }
    };
    $scope.showHistorySubMenu = false;
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
    $scope.primary_outcome_variable = config.appSettings.primary_outcome_variable;
    $scope.primary_outcome_variable_options = config.getPrimaryOutcomeVariableOptions();
    $scope.primary_outcome_variable_numbers = config.getPrimaryOutcomeVariableOptions(true);
    $scope.welcome_text = config.appSettings.welcome_text;
    $scope.tracking_question = config.appSettings.tracking_question;
    $scope.factor_average_text = config.appSettings.factor_average_text;
    /*Wrapper Config End*/

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
        } else {
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

    scheduleReminder = function(){
        if($rootScope.reminderToSchedule){

            reminderService.addNewReminder(
                $rootScope.reminderToSchedule.id,
                $rootScope.reminderToSchedule.reportedVariableValue,
                $rootScope.reminderToSchedule.interval,
                $rootScope.reminderToSchedule.name,
                $rootScope.reminderToSchedule.category,
                $rootScope.reminderToSchedule.unit,
                $rootScope.reminderToSchedule.combinationOperation)
            .then(function(){
                delete $rootScope.reminderToSchedule;
                console.log('reminder scheduled');
            }, function(err){
                console.log(err);
            });
        }
    };

    // get Access Token
    $scope.getAccessToken = function(authorization_code, withJWT){
    	authService.getAccessTokenFromAuthorizationCode(authorization_code, withJWT)
    	.then(function(response) {

            if(response.error){
                console.error("Error generating access token");
                console.log('response', response);
                // set flags
                $scope.isLoggedIn = false;
                localStorageService.setItem('isLoggedIn', false);
            } else {
                console.log("Access token received",response);
                if(typeof withJWT !== "undefined" && withJWT === true) {
                    authService.updateAccessToken(response, withJWT);
                }
                else {
                    authService.updateAccessToken(response);
                }

                // set flags
                $scope.isLoggedIn = true;
                localStorageService.setItem('isLoggedIn', true);

                // get user details from server
                getUser();

                // update app view wrt app state
                $scope.init();
            }
    	})
    	.catch(function(err){

            console.log("error in generating access token", err);
            // set flags
    		$scope.isLoggedIn = false;
            localStorageService.setItem('isLoggedIn', false);
    	});
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

            if(isWelcomed  === true || isWelcomed === "true"){
                $rootScope.isWelcomed = true;
                console.log("isWelcomed is true. going");

                // move to tracking page
                if($state.current.name === "app.welcome" || $state.current.name === "app.login"){
                    $state.go(config.appSettings.default_state);
                    $rootScope.hideMenu = false;
                }

                // don't animate, clear back history
                $ionicHistory.nextViewOptions({
                    disableAnimate: false,
                    disableBack: true
                });

                if(location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                   $rootScope.skipMenu = true;
                }

                // redraw everything according to updated appstate
                $rootScope.$broadcast('redraw');
            } else {
                if(location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                   $rootScope.skipMenu = true;
                }
            }
        });
    };

    // when user is logging out
    $scope.logout = function(){

        var start_logout = function(){
            if(ionic.Platform.platforms[0] !== "browser"){
                console.log('start_logout: Open the auth window via inAppBrowser.  Platform is ' + ionic.Platform.platforms[0]);
                var ref = window.open(config.getApiUrl() + '/api/v2/auth/logout','_blank', 'location=no,toolbar=yes');

                console.log('start_logout: listen to its event when the page changes');

                ref.addEventListener('loadstart', function(event) {
                    ref.close();
                    showPopup();
                });
            } else {
                showPopup();
            }
        };

        var showPopup = function(){
            $ionicPopup.show({
                title:'Clear local storage?',
                subTitle: 'Do you want do delete all data from local storage?',
                scope: $scope,
                buttons:[
                    {
                        text: 'No',
                        type: 'button-assertive',
                        onTap : after_logout_no_local
                    },
                    {
                        text: 'Yes',
                        type: 'button-positive',
                        onTap: after_logout
                    }
                ]

            });
        };

        var after_logout = function(){

            // set flags
            $scope.isLoggedIn = false;
            localStorageService.clear();

            //clear notification
            notificationService.cancelNotifications();

            //Set out localstorage flag for welcome screen variables
            localStorageService.setItem('interval',true);
            localStorageService.setItem('primaryOutcomeVariableReportedWelcomeScreen',true);
            localStorageService.setItem('allData',JSON.stringify([]));

            // calculate primary outcome variable and chart data
            measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function(){
                measurementService.calculateBothChart();
                measurementService.resetSyncFlag();
                //hard reload
                $state.go('app.welcome',{
                },{
                    reload:true
                });
            });

            if(window.chrome && window.chrome.extension && typeof window.chrome.identity === "undefined"){
                chrome.tabs.create({
                    url: config.getApiUrl() + "/api/v2/auth/logout"
                });
            }
        };

        var after_logout_no_local = function(){
            // set flags
            $scope.isLoggedIn = false;

            //clear notification
            notificationService.cancelNotifications();

            //Set out localstorage flag for welcome screen variables
            localStorageService.setItem('isLoggedIn',false);
            localStorageService.setItem('interval',true);
            localStorageService.setItem('primaryOutcomeVariableReportedWelcomeScreen',true);
            localStorageService.deleteItem('accessToken');
            localStorageService.deleteItem('refreshToken');
            localStorageService.deleteItem('expiresAt');


            // calculate primary outcome variable and chart data
            measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function(){
                measurementService.calculateBothChart();
                measurementService.resetSyncFlag();
                //hard reload
                $state.go('app.welcome',{
                },{
                    reload:true
                });
            });

            if(window.chrome && window.chrome.extension && typeof window.chrome.identity === "undefined"){
                chrome.tabs.create({
                    url: config.getApiUrl() + "/api/v2/auth/logout"
                });
            }
        };

        start_logout();

    };

    // User wants to login
    $scope.login = function(register) {

        localStorageService.setItem('isWelcomed', true);
        $rootScope.isWelcomed = true;

    	var url = config.getURL("api/oauth2/authorize", true);

        if (window.chrome && chrome.runtime && chrome.runtime.id) {
            console.log("Chrome Detected");
            authService.chromeLogin(url, register);
        }

		else if(ionic.Platform.platforms[0] === "browser"){
            console.log("Browser Detected");
            authService.browserLogin(url, register);
		} else {
            console.log("Browser and Chrome Not Detected.  Assuming mobile platform");
            authService.nonNativeMobileLogin(url, register);
        }
    };

    $scope.native_login = function(platform, accessToken){
        localStorageService.setItem('isWelcomed', true);
        $rootScope.isWelcomed = true;

        showLoader('Talking to QuantiModo');
        authService.getJWTToken(platform, accessToken)
        .then(function(responseToken){
            // success

            console.log("native_login: Mobile device detected and platform is " + platform);
            var url = authService.generateV2OAuthUrl(responseToken);

            $ionicLoading.hide();

            console.log('open the auth window via inAppBrowser.');
            var ref = window.open(url,'_blank', 'location=no,toolbar=no');

            console.log('listen to event when the page changes.');
            ref.addEventListener('loadstart', function(event) {

                console.log("loadstart event", event);
                console.log('check if changed url is the same as redirection url.');

                if(utilsService.startsWith(event.url, config.getRedirectUri())) {

                    console.log('if there is no error');
                    if(!utilsService.getUrlParameter(event.url,'error')) {
                        
                        var authorizationCode = authService.getAuthorizationCodeFromUrl(event);
                        
                        console.log('close inAppBrowser.');
                        ref.close();

                        var withJWT = true;
                        // get access token from authorization code
                        $scope.getAccessToken(authorizationCode, withJWT);

                    } else {

                        console.log("error occurred", utilsService.getUrlParameter(event.url, 'error'));

                        // close inAppBrowser
                        ref.close();
                    }
                }

            });
        }, function(){
            // error

            $ionicLoading.hide();
            console.log("error occurred, couldn't generate JWT");
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
    };

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
        localStorageService.setItem('isWelcomed', true);
        $rootScope.isWelcomed = true;
        // move to the next screen
        $scope.movePage();
    };

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

        scheduleReminder();

        // try to get access token
    	authService.getAccessToken().then(function(data) {

            console.log('got the access token');
            var accessToken = data.accessToken;

            // set flags
            $scope.isLoggedIn = true;

            localStorageService.getItem('user',function(user){
                if(!user){
                    console.log("Don't have a user.");
                    QuantiModo.getUser(function(user){

                        // set user data in local storage
                        localStorageService.setItem('user', JSON.stringify(user));

                        $scope.user_name = user.displayName;
                    },function(err){

                        // error
                        console.log(err);
                    });
                }
                if(user){
                    user = JSON.parse(user);
                    console.log('user:' + user);
                    window.intercomSettings = {
                        app_id: "uwtx2m33",
                        name: user.displayName,
                        email: user.email,
                        user_id:user.id
                    };
                }

            });



            // update loader text
            $ionicLoading.hide();
            //showLoader('Syncing data');

            app.track, app.welcome, app.history

            // sync data
            $scope.movePage();

            var sync_enabled_states = [
                'app.track',
                'app.welcome',
                'app.history'
            ];

            if(sync_enabled_states.indexOf($state.current.name) !== -1 && config.appSettings.primary_outcome_variable != false){
                $rootScope.isSyncing = true;
                console.log('setting sync true');

                measurementService.sync_data().then(function(){
                    console.log("sync complete");
                    $rootScope.isSyncing = false;

                    // update loader text
                    $ionicLoading.hide();
                    showLoader('Calculating stuff');

                    // calculate primary outcome variable values
                    measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function(){
                        measurementService.getPrimaryOutcomeVariableValue().then(calculateChartValues, calculateChartValues);
                    });

                }, hideLoaderMove);
            }

        }, function () {

            //set flags
			$scope.isLoggedIn = false;
            $ionicLoading.hide();

            console.log('need to login again');
        });

    };

    $scope.toggleTrackingSubMenu = function(){
        $scope.showTrackingSubMenu = !$scope.showTrackingSubMenu;
    };

    $scope.togglePredictorSearchSubMenu = function(){
        $scope.showPredictorSearchSubMenu = !$scope.showPredictorSearchSubMenu;
    };

    $scope.toggleOutcomePredictorSubMenu = function(){
        $scope.showOutcomePredictorSubMenu = !$scope.showOutcomePredictorSubMenu;
    };

    $scope.toggleHistorySubMenu = function(){
        $scope.showHistorySubMenu = !$scope.showHistorySubMenu;
    };

    $scope.toggleReminderSubMenu = function(){
        $scope.showReminderSubMenu = !$scope.showReminderSubMenu;
    };

    // call constructor
    $scope.init();

    var tokenInGetParams = utilsService.getUrlParameter(location.href, 'accessToken');

    if(!tokenInGetParams){
        tokenInGetParams = utilsService.getUrlParameter(location.href, 'access_token');
    }

    // redirection if already welcomed before
    var isWelcomed;
    localStorageService.getItem('isWelcomed',function(val){
        isWelcomed = val;
        console.log('isWelcomed ' + isWelcomed);
        if(isWelcomed  === true || isWelcomed === "true" || tokenInGetParams){
            $rootScope.isWelcomed = true;
            //$state.go(config.appSettings.default_state);
        } else {
            console.log("isWelcomed is " + isWelcomed + ". Setting to true and going to welcome now.");
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            $state.go('app.welcome');
        }

    });
});
