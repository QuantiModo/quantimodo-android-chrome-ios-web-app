angular.module('starter')

    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading, $injector,
                                      $timeout, $stateParams, quantimodoService) {

        $scope.state = { loading: false};
        $scope.controller_name = "LoginCtrl";
        $rootScope.hideNavigationMenu = true;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        $rootScope.showFilterBarSearchIcon = false;
        var $cordovaFacebook = {};
        if (($rootScope.isIOS || $rootScope.isAndroid) && $injector.has('$cordovaFacebook')) {
            console.debug('Injecting $cordovaFacebook');
            $cordovaFacebook = $injector.get('$cordovaFacebook');
        } else {
            console.debug("Could not inject $cordovaFacebook");
        }

        $scope.init = function () {
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.hideLoader();
            if($rootScope.helpPopup){
                console.debug('Closing help popup!');
                $rootScope.helpPopup.close();
            }
            if(navigator && navigator.splashscreen) {
                console.debug('ReminderInbox: Hiding splash screen because app is ready');
                navigator.splashscreen.hide();
            }
            if($rootScope.user){
                $scope.hideLoader();
                console.debug("Already logged in on login page.  Going to default state...");
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
            }
        };

        $scope.register = function() {
            var register = true;
            $scope.login(register);
        };

        // User wants to login
        $scope.login = function(register) {
            
            $scope.showLoader('Logging you in...');
            quantimodoService.setLocalStorageItem('isWelcomed', true);
            $rootScope.isWelcomed = true;

            if($rootScope.isChromeApp){
                quantimodoService.chromeAppLogin(register);
            } else if ($rootScope.isChromeExtension) {
                quantimodoService.chromeExtensionLogin(register);
            } else if ($rootScope.isAndroid || $rootScope.isIOS || $rootScope.isWindows) {
                console.debug("$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform and using quantimodoService.nonNativeMobileLogin");
                quantimodoService.nonNativeMobileLogin(register);
            } else {
                console.debug("$scope.login: Not windows, android or is so assuming browser.");
                $scope.showLoader('Logging you in...');
                quantimodoService.browserLogin(register);
            }

            if($rootScope.user){
                $rootScope.hideNavigationMenu = false;
                quantimodoService.createDefaultReminders();
                console.debug($scope.controller_name + ".login: Got user and going to default state");
                $state.go(config.appSettings.defaultState);
            }
        };

        $scope.nativeSocialLogin = function(provider, accessToken){
            quantimodoService.setLocalStorageItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            console.debug('$scope.nativeSocialLogin: Going to try to quantimodoService.getTokensAndUserViaNativeSocialLogin for ' +
                provider + ' provider');

            quantimodoService.getTokensAndUserViaNativeSocialLogin(provider, accessToken)
                .then(function(response){
                    console.debug('$scope.nativeSocialLogin: Response from quantimodoService.getTokensAndUserViaNativeSocialLogin:' +
                        JSON.stringify(response));

                    if(response.user){
                        quantimodoService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                        $rootScope.hideNavigationMenu = false;
                        console.debug($scope.controller_name + ".getTokensAndUserViaNativeSocialLogin: Got user and going to default state");
                        $state.go(config.appSettings.defaultState);
                        return;
                    }

                    var JWTToken = response.jwtToken;
                    console.debug("nativeSocialLogin: Mobile device detected and provider is " + provider + ". Got JWT token " + JWTToken);
                    var url = quantimodoService.generateV2OAuthUrl(JWTToken);

                    console.debug('nativeSocialLogin: open the auth window via inAppBrowser.');
                    var ref = cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');

                    console.debug('nativeSocialLogin: listen to event at ' + url + ' when the page changes.');
/*
                    $timeout(function () {
                        if(!$rootScope.user){
                            quantimodoService.reportError('Could not get user with url ' + url);
                        }
                    }, 30000);
*/
                    ref.addEventListener('loadstart', function(event) {

                        console.debug('nativeSocialLogin: loadstart event is ' + JSON.stringify(event));
                        console.debug('nativeSocialLogin: check if changed url is the same as redirection url.');

                        if(quantimodoService.startsWith(event.url, quantimodoService.getRedirectUri())) {
                            if(!quantimodoService.getUrlParameter(event.url,'error')) {
                                var authorizationCode = quantimodoService.getAuthorizationCodeFromUrl(event);
                                console.debug('nativeSocialLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.');
                                ref.close();

                                var withJWT = true;
                                // get access token from authorization code
                                quantimodoService.fetchAccessTokenAndUserDetails(authorizationCode, withJWT);
                            } else {
                                var errorMessage = "nativeSocialLogin: error occurred: " + quantimodoService.getUrlParameter(event.url, 'error');
                                quantimodoService.reportError(errorMessage);
                                // close inAppBrowser
                                ref.close();
                                $scope.hideLoader();
                            }
                        }

                    });
                }, function(error){
                    $scope.hideLoader();
                    quantimodoService.reportError("quantimodoService.getTokensAndUserViaNativeSocialLogin error occurred! " +
                        "Couldn't generate JWT! Error response: " + JSON.stringify(error));
                });
        };

        $scope.hideLoader = function () {
            $scope.state.loading = false;
            $ionicLoading.hide();
        };

        $scope.showLoader = function () {
            //$scope.state.loading = true;
            var seconds  = 15;
            $rootScope.syncDisplayText = 'Logging you in...';
            console.debug('Setting showLoader timeout for ' + seconds + ' seconds');
            $timeout(function () {
                $scope.hideLoader();
            }, seconds * 1000);
        };

        $scope.googleLogin = function(register){
            // For debugging Google login
            // var tokenForApi = 'ya29.CjF7A0faph6-8m91vuLDZVnKZqXeC4JjGWfubyV6PmgTqZmjkPohGx2tXVNpSjn4euhV';
            // $scope.nativeSocialLogin('google', tokenForApi);
            // return;

            /* Too many undesirable redirects
            var seconds  = 30;
            console.debug('Setting googleLogin timeout for ' + seconds + ' seconds');
            $timeout(function () {
                if(!$rootScope.user){
                    quantimodoService.reportError('$scope.googleLogin: Could not get user within 30 seconds! Fallback to non-native registration...');
                    register = true;
                    quantimodoService.nonNativeMobileLogin(register);
                    //quantimodoService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
            }, seconds * 1000);
            */
            $scope.showLoader('Logging you in...');
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                //I get called when everything's ready for the plugin to be called!
                console.debug('Device is ready!');
                window.plugins.googleplus.login({
                        'scopes': 'email https://www.googleapis.com/auth/fitness.activity.write https://www.googleapis.com/auth/fitness.body.write https://www.googleapis.com/auth/fitness.nutrition.write https://www.googleapis.com/auth/plus.login', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                        'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                        'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                    },
                    function (userData) {
                        console.debug('$scope.googleLogin: successfully got user data-> ', JSON.stringify(userData));
                        var tokenForApi = null;

                        /** @namespace userData.oauthToken */
                        /** @namespace userData.serverAuthCode */
                        if(userData.oauthToken) {
                            console.debug('userData.oauthToken is ' + userData.oauthToken);
                            tokenForApi = userData.oauthToken;
                        } else if(userData.serverAuthCode) {
                            console.error('googleLogin: No userData.accessToken!  You might have to use cordova-plugin-googleplus@4.0.8 or update API to use serverAuthCode to get an accessToken from Google...');
                            tokenForApi = userData.serverAuthCode;
                        }

                        if(!tokenForApi){
                            Bugsnag.notify("ERROR: googleLogin could not get userData.oauthToken!  ", JSON.stringify(userData), {}, "error");
                            console.error('googleLogin: No userData.accessToken or userData.idToken provided! Fallback to quantimodoService.nonNativeMobileLogin registration...');
                            register = true;
                            quantimodoService.nonNativeMobileLogin(register);
                        } else {
                            $scope.nativeSocialLogin('google', tokenForApi);
                        }
                    },
                    function (errorMessage) {
                        $scope.hideLoader();
                        quantimodoService.reportError("ERROR: googleLogin could not get userData!  Fallback to quantimodoService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                        register = true;
                        quantimodoService.nonNativeMobileLogin(register);
                    }
                );
            }

        };

        $scope.googleLogout = function(){
            /** @namespace window.plugins.googleplus */
            window.plugins.googleplus.logout(function (msg) {
                console.debug("logged out of google!");
            }, function(fail){
                console.debug("failed to logout", fail);
            });
        };

        $scope.facebookLogin = function(){
            $scope.showLoader('Logging you in...');
            console.debug("$scope.facebookLogin about to try $cordovaFacebook.login");
            var seconds  = 30;
            $scope.hideFacebookButton = true; // Hide button so user tries other options if it didn't work
            console.debug('Setting facebookLogin timeout for ' + seconds + ' seconds');
            $timeout(function () {
                if(!$rootScope.user){
                    quantimodoService.reportError('Could not get user $scope.facebookLogin within 30 seconds! Falling back to non-native registration...');
                    var register = true;
                    quantimodoService.nonNativeMobileLogin(register);
                }
            }, seconds * 1000);

            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(response) {
                    console.debug("facebookLogin_success response->", JSON.stringify(response));
                    var accessToken = response.authResponse.accessToken;
                    if(!accessToken){
                        quantimodoService.reportError('ERROR: facebookLogin could not get accessToken! response: ' + JSON.stringify(response));
                        quantimodoService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                    }
                    $scope.nativeSocialLogin('facebook', accessToken);
                }, function (error) {
                    Bugsnag.notify("ERROR: facebookLogin could not get accessToken!  ", JSON.stringify(error), {}, "error");
                    console.debug("facebook login error"+ JSON.stringify(error));
                });
        };
        // when user click's skip button
        $scope.skipLogin = function(){
            quantimodoService.setLocalStorageItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            // move to the next screen
            $scope.goToDefaultStateIfWelcomed();
        };

        $scope.init();

        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            if($rootScope.appDisplayName !== "MoodiModo"){
                $scope.hideFacebookButton = true;
            }
        });
    });
