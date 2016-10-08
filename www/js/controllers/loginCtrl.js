angular.module('starter')

    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading, $injector, utilsService,
                                      localStorageService, $timeout, bugsnagService, QuantiModo, $stateParams, reminderService) {

        $scope.state = { loading: false};
        $scope.controller_name = "LoginCtrl";
        console.log("isIos is" + $rootScope.isIos);
        $rootScope.hideNavigationMenu = true;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        var $cordovaFacebook = {};
        if (($rootScope.isIOS || $rootScope.isAndroid) && $injector.has('$cordovaFacebook')) {
            console.log('Injecting $cordovaFacebook');
            $cordovaFacebook = $injector.get('$cordovaFacebook');
        } else {
            console.log("Could not inject $cordovaFacebook");
        }

        $scope.init = function () {
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.hideLoader();
            if($rootScope.helpPopup){
                console.log('Closing help popup!');
                $rootScope.helpPopup.close();
            }
            if(navigator && navigator.splashscreen) {
                console.debug('ReminderInbox: Hiding splash screen because app is ready');
                navigator.splashscreen.hide();
            }
            if(!$rootScope.user){
                $rootScope.getUserAndSetInLocalStorage();
            }
            if($rootScope.user){
                $scope.hideLoader();
                console.log("Already logged in on login page.  Going to default state...");
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

            $timeout(function () {
                if(!$rootScope.user){
                    bugsnagService.reportError('$scope.login: Could not get user within 30 seconds!');
                    //utilsService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
            }, 30000);
            
            $scope.showLoader('Logging you in...');
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;

            if($rootScope.isChromeApp){
                chromeAppLogin(register);
            } else if ($rootScope.isChromeExtension) {
                chromeExtensionLogin(register);
            } else if ($rootScope.isAndroid || $rootScope.isIOS || $rootScope.isWindows) {
                console.log("$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform and using nonNativeMobileLogin");
                nonNativeMobileLogin(register);
            } else {
                console.log("$scope.login: Not windows, android or is so assuming browser.");
                browserLogin(register);
            }

            var userObject = localStorageService.getItemAsObject('user');

            $rootScope.user = userObject;
            console.debug('$scope.login just set $rootScope.user to: ' + JSON.stringify($rootScope.user));

            if($rootScope.user){
                console.debug('$scope.login calling setUserInLocalStorageBugsnagAndRegisterDeviceForPush');
                $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush($rootScope.user);
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
                if (typeof analytics !== 'undefined')  {
                    analytics.trackView("Login Controller");
                    analytics.setUserId(userObject.id);
                }
                reminderService.createDefaultReminders();
            }
        };

        var getOrSetUserInLocalStorage = function() {
            var userObject = localStorageService.getItemAsObject('user');
            if(!userObject){
                userObject = $rootScope.getUserAndSetInLocalStorage();
            }
            if(userObject){
                $rootScope.user = userObject;
                console.debug('getOrSetUserInLocalStorage just set $rootScope.user to: ' + JSON.stringify($rootScope.user));
                return userObject;
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
                        console.log("Access token received",response);
                        QuantiModo.saveAccessTokenInLocalStorage(response);
                        console.debug('get user details from server and going to defaultState...');
                        $rootScope.getUserAndSetInLocalStorage();
                        $rootScope.hideNavigationMenu = false;
                        $rootScope.$broadcast('callAppCtrlInit');
                        $state.go(config.appSettings.defaultState);
                    }
                })
                .catch(function(exception){ if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
                    localStorageService.setItem('user', null);
                });
        };

        var nonNativeMobileLogin = function(register) {
            console.log('nonNativeMobileLogin: open the auth window via inAppBrowser.');
            // Set location=yes instead of location=no temporarily to try to diagnose intermittent white screen on iOS

            //var ref = window.open(url,'_blank', 'location=no,toolbar=yes');
            // Try clearing inAppBrowser cache to avoid intermittent connectors page redirection problem
            // Note:  Clearing cache didn't solve the problem, but I'll leave it because I don't think it hurts anything
            var ref = window.open(QuantiModo.generateV1OAuthUrl(register),'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');

            // Commented because I think it's causing "$apply already in progress" error
            // $timeout(function () {
            //     console.log('nonNativeMobileLogin: Automatically closing inAppBrowser auth window after 60 seconds.');
            //     ref.close();
            // }, 60000);

            console.log('nonNativeMobileLogin: listen to its event when the page changes');
            ref.addEventListener('loadstart', function(event) {
                console.log('nonNativeMobileLogin: Checking if changed url ' + event.url + ' is the same as redirection url ' + utilsService.getRedirectUri());
                if(utilsService.startsWith(event.url, utilsService.getRedirectUri())) {
                    console.log('nonNativeMobileLogin: event.url starts with ' + utilsService.getRedirectUri());
                    if(!utilsService.getUrlParameter(event.url,'error')) {
                        var authorizationCode = QuantiModo.getAuthorizationCodeFromUrl(event);
                        ref.close();
                        console.log('nonNativeMobileLogin: Going to get an access token using authorization code.');
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
          console.log("login: Use Chrome app (content script, background page, etc.");
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
            console.log("Using Chrome extension, so we use sessions instead of OAuth flow. ");
            chrome.tabs.create({ url: loginUrl });
            window.close();
        };

        $scope.nativeSocialLogin = function(provider, accessToken){
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;
            console.log('$scope.nativeSocialLogin: Going to try to QuantiModo.getTokensAndUserViaNativeSocialLogin for ' +
                provider + ' provider');

            QuantiModo.getTokensAndUserViaNativeSocialLogin(provider, accessToken)
                .then(function(response){
                    console.log('$scope.nativeSocialLogin: Response from QuantiModo.getTokensAndUserViaNativeSocialLogin:' +
                        JSON.stringify(response));

                    if(response.user){
                        localStorageService.setItem('user', response.user);
                        $rootScope.user = response.user;
                        console.debug('$scope.nativeSocialLogin just set $rootScope.user to: ' + JSON.stringify($rootScope.user));
                        localStorageService.setItem('accessToken', response.accessToken);
                        $rootScope.accessToken = response.accessToken;
                        localStorageService.setItem('refreshToken', response.refreshToken);
                        $rootScope.refreshToken = response.refreshToken;
                        localStorageService.setItem('expiresAt', response.expiresAt);
                        $rootScope.expiresAt = response.expiresAt;
                        $rootScope.setUserInLocalStorageBugsnagAndRegisterDeviceForPush(response.user);
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                        return;
                    }

                    var JWTToken = response.jwtToken;
                    console.debug("nativeSocialLogin: Mobile device detected and provider is " + provider + ". Got JWT token " + JWTToken);
                    var url = QuantiModo.generateV2OAuthUrl(JWTToken);

                    console.log('nativeSocialLogin: open the auth window via inAppBrowser.');
                    var ref = cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');

                    console.log('nativeSocialLogin: listen to event at ' + url + ' when the page changes.');
/*
                    $timeout(function () {
                        if(!$rootScope.user){
                            bugsnagService.reportError('Could not get user with url ' + url);
                        }
                    }, 30000);
*/
                    ref.addEventListener('loadstart', function(event) {

                        console.debug('nativeSocialLogin: loadstart event is ' + JSON.stringify(event));
                        console.log('nativeSocialLogin: check if changed url is the same as redirection url.');

                        if(utilsService.startsWith(event.url, utilsService.getRedirectUri())) {
                            if(!utilsService.getUrlParameter(event.url,'error')) {
                                var authorizationCode = QuantiModo.getAuthorizationCodeFromUrl(event);
                                console.log('nativeSocialLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.');
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
            $rootScope.syncDisplayText = 'Logging you in...';
            $timeout(function () {
                $scope.hideLoader();
            }, 15000);
        };

        $scope.googleLogin = function(register){

            $timeout(function () {
                if(!$rootScope.user){
                    bugsnagService.reportError('$scope.googleLogin: Could not get user within 30 seconds! Fallback to non-native registration...');
                    register = true;
                    nonNativeMobileLogin(register);
                    //utilsService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
            }, 30000);
            $scope.showLoader('Logging you in...');
            document.addEventListener('deviceready', deviceReady, false);
            function deviceReady() {
                //I get called when everything's ready for the plugin to be called!
                console.log('Device is ready!');
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
                            console.log('userData.oauthToken is ' + userData.oauthToken);
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
                console.log("logged out of google!");
            }, function(fail){
                console.log("failed to logout", fail);
            });
        };

        $scope.facebookLogin = function(){
            $scope.showLoader('Logging you in...');
            console.log("$scope.facebookLogin about to try $cordovaFacebook.login");
            $scope.hideFacebookButton = true; // Hide button so user tries other options if it didn't work
            $timeout(function () {
                if(!$rootScope.user){
                    bugsnagService.reportError('Could not get user $scope.facebookLogin within 30 seconds! Falling back to non-native registration...');
                    var register = true;
                    nonNativeMobileLogin(register);
                }
            }, 30000);

            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(response) {
                    console.log("facebookLogin_success response->", JSON.stringify(response));
                    var accessToken = response.authResponse.accessToken;
                    if(!accessToken){
                        bugsnagService.reportError('ERROR: facebookLogin could not get accessToken! response: ' + JSON.stringify(response));
                        utilsService.showAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                    }
                    $scope.nativeSocialLogin('facebook', accessToken);
                }, function (error) {
                    Bugsnag.notify("ERROR: facebookLogin could not get accessToken!  ", JSON.stringify(error), {}, "error");
                    console.log("facebook login error", error);
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
            console.log("Browser Login");
            if (utilsService.getClientId() !== 'oAuthDisabled') {
                oAuthBrowserLogin(register);
            } else {
                sendToNonOAuthBrowserLoginUrl(register);
            }
        };

        var sendToNonOAuthBrowserLoginUrl = function(register) {

            var user = getOrSetUserInLocalStorage();
            if(user){
                $rootScope.hideNavigationMenu = false;
                console.debug('sendToNonOAuthBrowserLoginUrl: User logged in so going to defaultState');
                $state.go(config.appSettings.defaultState);
            }
            if(!user){
                var loginUrl = utilsService.getURL("api/v2/auth/login");
                if (register === true) {
                    loginUrl = utilsService.getURL("api/v2/auth/register");
                }
                console.log("sendToNonOAuthBrowserLoginUrl: Client id is oAuthDisabled - will redirect to regular login.");
                loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href.replace('app/login','app/reminders-inbox'));
                console.debug('sendToNonOAuthBrowserLoginUrl: AUTH redirect URL created:', loginUrl);
                var apiUrlMatchesHostName = $rootScope.qmApiUrl.indexOf(window.location.hostname);
                if(apiUrlMatchesHostName > -1 || $rootScope.isChromeExtension) {
                    $scope.showLoader('Logging you in...');
                    window.location.replace(loginUrl);
                } else {
                    alert("API url doesn't match auth base url.  Please make use the same domain in config file");
                }
            }
        };

        var oAuthBrowserLogin = function (register) {
            //$scope.showLoader();
            var url = QuantiModo.generateV1OAuthUrl(register);
            console.log("Going to try logging by opening new tab at url " + url);

            var ref = window.open(url, '_blank');

            if (!ref) {
                alert("You must first unblock popups, and and refresh the page for this to work!");
            } else {
                console.log('Opened ' + url + ' and now broadcasting isLoggedIn message question every second to sibling tabs');
                var interval = setInterval(function () {
                    ref.postMessage('isLoggedIn?', utilsService.getRedirectUri());
                }, 1000);

                // handler when a message is received from a sibling tab
                window.onMessageReceived = function (event) {
                    console.log("message received from sibling tab", event.url);

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
