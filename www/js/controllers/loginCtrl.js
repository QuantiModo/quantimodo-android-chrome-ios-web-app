angular.module('starter')

    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService,
                                      $state, $ionicHistory, notificationService, localStorageService, $rootScope,
                                      $ionicLoading, $injector) {

        $scope.controller_name = "LoginCtrl";
        console.log("isIos is" + $scope.isIos);
        $rootScope.hideMenu = true;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        var $cordovaFacebook = {};
        if($rootScope.isIOS && $injector.has('$cordovaFacebook')){
            $cordovaFacebook = $injector.get('$cordovaFacebook');
        }

        $scope.init = function(){
            if($rootScope.helpPopup){
                console.log('Closing help popup!');
                $rootScope.helpPopup.close();
            }
            console.log("login initialized");
            if($rootScope.user){
                console.log("Already logged in on login page.  Going to default state...");
                $state.go(config.appSettings.defaultState);
            }
        };

        // User wants to login
        $scope.login = function(register) {

            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;

            var url = config.getURL("api/oauth2/authorize", true);

            if($rootScope.isChromeApp){
                chromeAppLogin(register);
            } else if ($rootScope.isChromeExtension) {
                chromeExtensionLogin(register);
            } else if(ionic.Platform.is('browser')){
                console.log("$scope.login: Browser Detected");
                browserLogin(url, register);
            } else {
                console.log("$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform");
                nonNativeMobileLogin(url, register);
            }

            var userObject = localStorageService.getItemAsObject('user');

            $rootScope.user = userObject;

            if($rootScope.user){
                console.log('Settings user in login');
                $rootScope.setUserForIntercom($rootScope.user);
                $rootScope.setUserForBugsnag($rootScope.user);
                $state.go(config.appSettings.defaultState);
            }
        };

        var getOrSetUserInLocalStorage = function() {
            var userObject = localStorageService.getItemAsObject('user');
            if(!userObject){
                userObject = $rootScope.getUserAndSetInLocalStorage();
            }
            if(userObject){
                console.log('Settings user in getOrSetUserInLocalStorage');
                $rootScope.user = userObject;
                return userObject;
            }

        };

        // get Access Token
        var fetchAccessTokenAndUserDetails = function(authorization_code, withJWT) {
            authService.getAccessTokenFromAuthorizationCode(authorization_code, withJWT)
                .then(function(response) {

                    if(response.error){
                        console.error("Error generating access token");
                        console.log('response', response);
                        localStorageService.setItem('user', null);
                    } else {
                        console.log("Access token received",response);
                        if(typeof withJWT !== "undefined" && withJWT === true) {
                            authService.updateAccessToken(response, withJWT);
                        }
                        else {
                            authService.updateAccessToken(response);
                        }

                        // get user details from server
                        $rootScope.getUserAndSetInLocalStorage();

                        $rootScope.$broadcast('callAppCtrlInit');
                    }
                })
                .catch(function(err){

                    console.log("error in generating access token", err);
                    // set flags
                    localStorageService.setItem('user', null);
                });
        };

        var nonNativeMobileLogin = function(register) {
            console.log("nonNativeMobileLogin: Mobile device detected and ionic platform is " + ionic.Platform.platforms[0]);
            console.log(JSON.stringify(ionic.Platform.platforms));

            var url = authService.generateV1OAuthUrl(register);

            console.log('nonNativeMobileLogin: open the auth window via inAppBrowser.');
            var ref = window.open(url,'_blank', 'location=no,toolbar=yes');

            console.log('nonNativeMobileLogin: listen to its event when the page changes');
            ref.addEventListener('loadstart', function(event) {

                console.log(JSON.stringify(event));
                console.log('nonNativeMobileLogin: The event.url is ' + event.url);
                console.log('nonNativeMobileLogin: The redirection url is ' + config.getRedirectUri());

                console.log('nonNativeMobileLogin: Checking if changed url is the same as redirection url.');
                if(utilsService.startsWith(event.url, config.getRedirectUri())) {

                    console.log('nonNativeMobileLogin: event.url starts with ' + config.getRedirectUri());
                    if(!utilsService.getUrlParameter(event.url,'error')) {

                        var authorizationCode = authService.getAuthorizationCodeFromUrl(event);
                        console.log('nonNativeMobileLogin: Closing inAppBrowser.');
                        ref.close();
                        console.log('nonNativeMobileLogin: Going to get an access token using authorization code.');
                        fetchAccessTokenAndUserDetails(authorizationCode);

                    } else {
                        console.log("nonNativeMobileLogin: error occurred", utilsService.getUrlParameter(event.url, 'error'));
                        console.log('nonNativeMobileLogin: close inAppBrowser');
                        ref.close();
                    }
                }

            });
        };

        var chromeAppLogin = function(register){
          console.log("login: Use Chrome app (content script, background page, etc.");
          var url = authService.generateV1OAuthUrl(register);
          chrome.identity.launchWebAuthFlow({
              'url': url,
              'interactive': true
          }, function() {
              var authorizationCode = authService.getAuthorizationCodeFromUrl(event);
              authService.getAccessTokenFromAuthorizationCode(authorizationCode);
          });
        };

        var chromeExtensionLogin = function(register) {
              console.log("Using Chrome extension, so we use sessions instead of OAuth flow. ");
              chrome.tabs.create({ url: config.getApiUrl() + "/" });
        };

        $scope.nativeLogin = function(platform, accessToken){
            localStorageService.setItem('isWelcomed', true);
            $rootScope.isWelcomed = true;

            utilsService.loadingStart('Talking to QuantiModo', 3000);
            authService.getJWTToken(platform, accessToken)
                .then(function(JWTToken){
                    // success

                    console.log("nativeLogin: Mobile device detected and platform is " + platform);
                    var url = authService.generateV2OAuthUrl(JWTToken);

                    $ionicLoading.hide();

                    console.log('nativeLogin: open the auth window via inAppBrowser.');
                    var ref = window.open(url,'_blank', 'location=no,toolbar=no');

                    console.log('nativeLogin: listen to event when the page changes.');
                    ref.addEventListener('loadstart', function(event) {

                        console.log("nativeLogin: loadstart event", event);
                        console.log('nativeLogin: check if changed url is the same as redirection url.');

                        if(utilsService.startsWith(event.url, config.getRedirectUri())) {

                            if(!utilsService.getUrlParameter(event.url,'error')) {

                                var authorizationCode = authService.getAuthorizationCodeFromUrl(event);

                                console.log('nativeLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.');
                                ref.close();

                                var withJWT = true;
                                // get access token from authorization code
                                fetchAccessTokenAndUserDetails(authorizationCode, withJWT);
                            } else {

                                console.log("nativeLogin: error occurred", utilsService.getUrlParameter(event.url, 'error'));

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
        $scope.googleLogin = function(){
            utilsService.loadingStart('Logging you in', 2000);
            window.plugins.googleplus.login({}, function (userData) {
                    $ionicLoading.hide();
                    console.log('successfully logged in');
                    console.log('google->', JSON.stringify(userData));
                    var accessToken = userData.accessToken;

                    $scope.nativeLogin('google', accessToken);
                },
                function (msg) {
                    $ionicLoading.hide();
                    console.log("google login error", msg);
                });
        };

        $scope.googleLogout = function(){
            window.plugins.googleplus.logout(function (msg) {
                console.log("logged out of google!");
            }, function(fail){
                console.log("failed to logout", fail);
            });
        };

        // login with facebook
        $scope.facebookLogin = function(){
            utilsService.loadingStart('Logging you in', 2000);
            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(success) {
                    // success
                    $ionicLoading.hide();
                    console.log("facebookLogin_success");
                    console.log("facebook->", JSON.stringify(success));
                    var accessToken = success.authResponse.accessToken;

                    $scope.nativeLogin('facebook', accessToken);
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
            $scope.goToDefaultStateIfWelcomed();
        };

        var browserLogin = function(register) {
            console.log("Browser Login");
            if (config.getClientId() !== 'oAuthDisabled') {
                oAuthBrowserLogin(register);
            } else {
                sendToNonOAuthBrowserLoginUrl(register);
            }
        };

        var sendToNonOAuthBrowserLoginUrl = function(register) {
            var user = getOrSetUserInLocalStorage();
            if(user){
                $state.go(config.appSettings.defaultState);
            }
            if(!user){
                var loginUrl = config.getURL("api/v2/auth/login");
                if (register === true) {
                    loginUrl = config.getURL("api/v2/auth/register");
                }
                console.log("sendToNonOAuthBrowserLoginUrl: Client id is oAuthDisabled - will redirect to regular login.");
                loginUrl += "redirect_uri=" + encodeURIComponent(window.location.href);
                console.debug('sendToNonOAuthBrowserLoginUrl: AUTH redirect URL created:', loginUrl);
                var apiUrl = config.getApiUrl();
                var apiUrlMatchesHostName = apiUrl.indexOf(window.location.hostname);
                if(apiUrlMatchesHostName > -1 || $rootScope.isChromeExtension) {
                    window.location.replace(loginUrl);
                } else {
                    alert("API url doesn't match auth base url.  Please make use the same domain in config file");
                }
            }
        };

        var oAuthBrowserLogin = function (register) {
            var url = authService.generateV1OAuthUrl(register);

            var ref = window.open(url, '_blank');

            if (!ref) {
                alert("You must first unblock popups, and and refresh the page for this to work!");
            } else {
                // broadcast message question every second to sibling tabs
                var interval = setInterval(function () {
                    ref.postMessage('isLoggedIn?', config.getRedirectUri());
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
                        if (utilsService.startsWith(iframe_url, config.getRedirectUri())) {
                            // if there is no error
                            if (!utilsService.getUrlParameter(iframe_url, 'error')) {
                                var authorizationCode = authService.getAuthorizationCodeFromUrl(event);
                                // get access token from authorization code
                                fetchAccessTokenAndUserDetails(authorizationCode);

                                // close the sibling tab
                                ref.close();

                            } else {
                                // TODO : display_error
                                console.log("Error occurred validating redirect url. Closing the sibling tab.",
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
