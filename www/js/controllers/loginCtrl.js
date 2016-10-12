angular.module('starter')

    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading, $injector, utilsService,
                                      localStorageService, $timeout, bugsnagService, QuantiModo, $stateParams, reminderService) {

        $scope.state = { loading: false};
        $scope.controller_name = "LoginCtrl";
        console.debug("isIos is" + $rootScope.isIos);
        $rootScope.hideNavigationMenu = true;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
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

            var seconds  = 30;
            console.debug('Setting login timeout for ' + seconds + ' seconds');
            $timeout(function () {
                if(!$rootScope.user){
                    bugsnagService.reportError('$scope.login: Could not get user within 30 seconds!');
                    //utilsService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
            }, seconds * 1000);
            
            $scope.showLoader('Logging you in...');
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;

            if($rootScope.isChromeApp){
                chromeAppLogin(register);
            } else if ($rootScope.isChromeExtension) {
                chromeExtensionLogin(register);
            } else if ($rootScope.isAndroid || $rootScope.isIOS || $rootScope.isWindows) {
                console.debug("$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform and using nonNativeMobileLogin");
                nonNativeMobileLogin(register);
            } else {
                console.debug("$scope.login: Not windows, android or is so assuming browser.");
                browserLogin(register);
            }

            if($rootScope.user){
                $rootScope.hideNavigationMenu = false;
                reminderService.createDefaultReminders();
                $state.go(config.appSettings.defaultState);
            }
        };

        var fetchAccessTokenAndUserDetails = function(authorization_code, withJWT) {
            QuantiModo.getAccessTokenFromAuthorizationCode(authorization_code, withJWT)
                .then(function(response) {
                    if(response.error){
                        bugsnagService.reportError(response.error);
                        console.error("Error generating access token");
                        localStorageService.setItem('user', null);
                    } else {
                        console.debug("Access token received",response);
                        QuantiModo.saveAccessTokenInLocalStorage(response);
                        console.debug('get user details from server and going to defaultState...');
                        QuantiModo.refreshUser().then(function(user){
                            console.debug($state.current.name + ' fetchAccessTokenAndUserDetails got this user ' +
                                JSON.stringify(user));
                            $rootScope.hideNavigationMenu = false;
                            $rootScope.$broadcast('callAppCtrlInit');
                            $state.go(config.appSettings.defaultState);
                        }, function(error){
                            console.error($state.current.name + ' could not refresh user because ' + error);
                        });
                    }
                })
                .catch(function(exception){ if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                    localStorageService.setItem('user', null);
                });
        };

        var nonNativeMobileLogin = function(register) {
            console.debug('nonNativeMobileLogin: open the auth window via inAppBrowser.');
            // Set location=yes instead of location=no temporarily to try to diagnose intermittent white screen on iOS

            //var ref = window.open(url,'_blank', 'location=no,toolbar=yes');
            // Try clearing inAppBrowser cache to avoid intermittent connectors page redirection problem
            // Note:  Clearing cache didn't solve the problem, but I'll leave it because I don't think it hurts anything
            var ref = window.open(QuantiModo.generateV1OAuthUrl(register),'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');

            // Commented because I think it's causing "$apply already in progress" error
            // $timeout(function () {
            //     console.debug('nonNativeMobileLogin: Automatically closing inAppBrowser auth window after 60 seconds.');
            //     ref.close();
            // }, 60000);

            console.debug('nonNativeMobileLogin: listen to its event when the page changes');
            ref.addEventListener('loadstart', function(event) {
                console.debug('nonNativeMobileLogin: Checking if changed url ' + event.url + ' is the same as redirection url ' + utilsService.getRedirectUri());
                if(utilsService.startsWith(event.url, utilsService.getRedirectUri())) {
                    console.debug('nonNativeMobileLogin: event.url starts with ' + utilsService.getRedirectUri());
                    if(!utilsService.getUrlParameter(event.url,'error')) {
                        var authorizationCode = QuantiModo.getAuthorizationCodeFromUrl(event);
                        ref.close();
                        console.debug('nonNativeMobileLogin: Going to get an access token using authorization code.');
                        fetchAccessTokenAndUserDetails(authorizationCode);

                    } else {
                        var errorMessage = "nonNativeMobileLogin: error occurred:" + utilsService.getUrlParameter(event.url, 'error');
                        bugsnagService.reportError(errorMessage);
                        ref.close();
                    }
                }

            });
        };

        var chromeAppLogin = function(register){
          console.debug("login: Use Chrome app (content script, background page, etc.");
          var url = QuantiModo.generateV1OAuthUrl(register);
          chrome.identity.launchWebAuthFlow({
              'url': url,
              'interactive': true
          }, function() {
              var authorizationCode = QuantiModo.getAuthorizationCodeFromUrl(event);
              QuantiModo.getAccessTokenFromAuthorizationCode(authorizationCode);
          });
        };

        var chromeExtensionLogin = function(register) {
            var loginUrl = utilsService.getURL("api/v2/auth/login");
            if (register === true) {
                loginUrl = utilsService.getURL("api/v2/auth/register");
            }
            console.debug("Using Chrome extension, so we use sessions instead of OAuth flow. ");
            chrome.tabs.create({ url: loginUrl });
            window.close();
        };

        $scope.nativeSocialLogin = function(provider, accessToken){
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            console.debug('$scope.nativeSocialLogin: Going to try to QuantiModo.getTokensAndUserViaNativeSocialLogin for ' +
                provider + ' provider');

            QuantiModo.getTokensAndUserViaNativeSocialLogin(provider, accessToken)
                .then(function(response){
                    console.debug('$scope.nativeSocialLogin: Response from QuantiModo.getTokensAndUserViaNativeSocialLogin:' +
                        JSON.stringify(response));

                    if(response.user){
                        QuantiModo.setUserInLocalStorageBugsnagIntercomPush(response.user);
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                        return;
                    }

                    var JWTToken = response.jwtToken;
                    console.debug("nativeSocialLogin: Mobile device detected and provider is " + provider + ". Got JWT token " + JWTToken);
                    var url = QuantiModo.generateV2OAuthUrl(JWTToken);

                    console.debug('nativeSocialLogin: open the auth window via inAppBrowser.');
                    var ref = cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');

                    console.debug('nativeSocialLogin: listen to event at ' + url + ' when the page changes.');
/*
                    $timeout(function () {
                        if(!$rootScope.user){
                            bugsnagService.reportError('Could not get user with url ' + url);
                        }
                    }, 30000);
*/
                    ref.addEventListener('loadstart', function(event) {

                        console.debug('nativeSocialLogin: loadstart event is ' + JSON.stringify(event));
                        console.debug('nativeSocialLogin: check if changed url is the same as redirection url.');

                        if(utilsService.startsWith(event.url, utilsService.getRedirectUri())) {
                            if(!utilsService.getUrlParameter(event.url,'error')) {
                                var authorizationCode = QuantiModo.getAuthorizationCodeFromUrl(event);
                                console.debug('nativeSocialLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.');
                                ref.close();

                                var withJWT = true;
                                // get access token from authorization code
                                fetchAccessTokenAndUserDetails(authorizationCode, withJWT);
                            } else {
                                var errorMessage = "nativeSocialLogin: error occurred: " + utilsService.getUrlParameter(event.url, 'error');
                                bugsnagService.reportError(errorMessage);
                                // close inAppBrowser
                                ref.close();
                                $scope.hideLoader();
                            }
                        }

                    });
                }, function(error){
                    $scope.hideLoader();
                    bugsnagService.reportError("QuantiModo.getTokensAndUserViaNativeSocialLogin error occurred! " +
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

            var seconds  = 30;
            console.debug('Setting googleLogin timeout for ' + seconds + ' seconds');
            $timeout(function () {
                if(!$rootScope.user){
                    bugsnagService.reportError('$scope.googleLogin: Could not get user within 30 seconds! Fallback to non-native registration...');
                    register = true;
                    nonNativeMobileLogin(register);
                    //utilsService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
            }, seconds * 1000);
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
                            console.error('googleLogin: No userData.accessToken or userData.idToken provided! Fallback to nonNativeMobileLogin registration...');
                            register = true;
                            nonNativeMobileLogin(register);
                        } else {
                            $scope.nativeSocialLogin('google', tokenForApi);
                        }
                    },
                    function (errorMessage) {
                        $scope.hideLoader();
                        bugsnagService.reportError("ERROR: googleLogin could not get userData!  Fallback to nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                        register = true;
                        nonNativeMobileLogin(register);
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
                    bugsnagService.reportError('Could not get user $scope.facebookLogin within 30 seconds! Falling back to non-native registration...');
                    var register = true;
                    nonNativeMobileLogin(register);
                }
            }, seconds * 1000);

            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(response) {
                    console.debug("facebookLogin_success response->", JSON.stringify(response));
                    var accessToken = response.authResponse.accessToken;
                    if(!accessToken){
                        bugsnagService.reportError('ERROR: facebookLogin could not get accessToken! response: ' + JSON.stringify(response));
                        utilsService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                    }
                    $scope.nativeSocialLogin('facebook', accessToken);
                }, function (error) {
                    Bugsnag.notify("ERROR: facebookLogin could not get accessToken!  ", JSON.stringify(error), {}, "error");
                    console.debug("facebook login error"+ JSON.stringify(error));
                });
        };

        // when user click's skip button
        $scope.skipLogin = function(){
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            // move to the next screen
            $scope.goToDefaultStateIfWelcomed();
        };

        var browserLogin = function(register) {
            //$scope.showLoader();
            console.debug("Browser Login");
            if (utilsService.getClientId() !== 'oAuthDisabled') {
                oAuthBrowserLogin(register);
            } else {
                sendToNonOAuthBrowserLoginUrl(register);
            }
        };

        var sendToNonOAuthBrowserLoginUrl = function(register) {
            var loginUrl = utilsService.getURL("api/v2/auth/login");
            if (register === true) {
                loginUrl = utilsService.getURL("api/v2/auth/register");
            }
            console.debug("sendToNonOAuthBrowserLoginUrl: Client id is oAuthDisabled - will redirect to regular login.");
            loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href.replace('app/login','app/reminders-inbox'));
            console.debug('sendToNonOAuthBrowserLoginUrl: AUTH redirect URL created:', loginUrl);
            var apiUrlMatchesHostName = $rootScope.qmApiUrl.indexOf(window.location.hostname);
            if(apiUrlMatchesHostName > -1 || $rootScope.isChromeExtension) {
                $scope.showLoader('Logging you in...');
                window.location.replace(loginUrl);
            } else {
                alert("API url doesn't match auth base url.  Please make use the same domain in config file");
            }
        };

        var oAuthBrowserLogin = function (register) {
            //$scope.showLoader();
            var url = QuantiModo.generateV1OAuthUrl(register);
            console.debug("Going to try logging by opening new tab at url " + url);

            var ref = window.open(url, '_blank');

            if (!ref) {
                alert("You must first unblock popups, and and refresh the page for this to work!");
            } else {
                console.debug('Opened ' + url + ' and now broadcasting isLoggedIn message question every second to sibling tabs');
                var interval = setInterval(function () {
                    ref.postMessage('isLoggedIn?', utilsService.getRedirectUri());
                }, 1000);

                // handler when a message is received from a sibling tab
                window.onMessageReceived = function (event) {
                    console.debug("message received from sibling tab", event.url);

                    if(interval !== false){
                        // Don't ask login question anymore
                        clearInterval(interval);
                        interval = false;

                        // the url that QuantiModo redirected us to
                        var iframe_url = event.data;

                        // validate if the url is same as we wanted it to be
                        if (utilsService.startsWith(iframe_url, utilsService.getRedirectUri())) {
                            // if there is no error
                            if (!utilsService.getUrlParameter(iframe_url, 'error')) {
                                var authorizationCode = QuantiModo.getAuthorizationCodeFromUrl(event);
                                // get access token from authorization code
                                fetchAccessTokenAndUserDetails(authorizationCode);

                                // close the sibling tab
                                ref.close();

                            } else {
                                // TODO : display_error
                                console.error("Error occurred validating redirect url. Closing the sibling tab.",
                                    utilsService.getUrlParameter(iframe_url, 'error'));

                                // close the sibling tab
                                ref.close();
                            }
                        }
                    }
                };

                // listen to broadcast messages from other tabs within browser
                window.addEventListener("message", window.onMessageReceived, false);
            }
        };

        $scope.init();
    });
