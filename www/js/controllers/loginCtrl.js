angular.module('starter').controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading, $injector, $stateParams, $timeout, qmService, $mdDialog) {
    $scope.state = { loading: false};
    $scope.controller_name = "LoginCtrl";
    $scope.headline = config.appSettings.headline;
    $rootScope.showFilterBarSearchIcon = false;
    if($rootScope.isMobile){
        if(window && window.plugins && window.plugins.googleplus){
            $scope.showGoogleLoginButton = true;
        } else {
            if($rootScope.isMobile){qmService.reportErrorDeferred("Google login not available on mobile!");}
        }
        var $cordovaFacebook = {};
        var disableFacebookLogin = true;  // Causing failures on IPv6 networks according to iTunes reviewer
        if (!disableFacebookLogin && $rootScope.isIOS && $rootScope.appSettings.appDisplayName === "MoodiModo") {
            console.debug('Injecting $cordovaFacebook');
            $cordovaFacebook = $injector.get('$cordovaFacebook');
            $scope.showFacebookLoginButton = true;
        } else { console.debug("Could not inject $cordovaFacebook"); }
    }
    $scope.circlePage = {
        title: null,
        overlayIcon: false, //TODO: Figure out how to position properly in circle-page.html
        color: {
            "backgroundColor": "#3467d6",
            circleColor: "#5b95f9"
        },
        image: {
            url: "img/robots/robot-waving.svg",
            height: "120",
            width: "120",
            display: "block",
            left: "10px"
        },
        bodyText: "Now let's get you signed in to make sure you never lose your precious data.",
        // moreInfo: "Your data belongs to you.  Security and privacy our top priorities. I promise that even if " +
        //     "the NSA waterboards me, I will never divulge share your data without your permission.",
    };
    var leaveIfLoggedIn = function () {
        if($rootScope.user){
            console.debug("Already logged in on login page.  goToDefaultStateIfNoAfterLoginUrlOrState...");
            qmService.goToDefaultStateIfNoAfterLoginUrlOrState();
        }
        // Should already be doing this in AppCtrl
        // if(qmService.getAccessTokenFromUrlParameter()){
        //     qmService.showBlackRingLoader();
        //     qmService.refreshUser().then(function () {
        //         //qmService.hideLoader();  // Causes loader to hide while still refreshing inbox
        //     }, function (error) {
        //         qmService.logError(error);
        //         qmService.hideLoader();
        //     });
        // }
    };
    var loginTimeout = function () {
        qmService.showBlackRingLoader();
        $scope.circlePage.title = 'Logging in...';
        console.debug('Setting login timeout...');
        return $timeout(function () {
            console.debug('Finished login timeout');
            if(!$rootScope.user){
                $scope.circlePage.title = 'Please try logging in again';
                qmService.reportErrorDeferred('Login failure');
            }
            if($rootScope.user && $state.current.name.indexOf('login') !== -1){
                qmService.goToDefaultStateIfNoAfterLoginUrlOrState();
            }
        }, 40000);
    };
    function tryToGetUser() {
        if($rootScope.isChromeExtension){qmService.showBasicLoader();} // Chrome needs to do this because we can't redirect with access token
        qmService.refreshUser().then(function () {
            qmService.hideLoader();
            leaveIfLoggedIn();
        }, function (error) {
            //qmService.showMaterialAlert(error);  Can't do this because it has a not authenticate popup
            qmService.hideLoader();
            leaveIfLoggedIn();
        });
    }
    $scope.$on('$ionicView.beforeEnter', function(e) {
        console.debug("beforeEnter in state " + $state.current.name);
        leaveIfLoggedIn();
        if($rootScope.appSettings.appDisplayName !== "MoodiModo"){$scope.hideFacebookButton = true;}
        if(qmService.getUrlParameter('loggingIn') || qmService.getAccessTokenFromUrl()){
            loginTimeout();
        } else {
            console.debug("refreshUser in beforeEnter in state " + $state.current.name + " in case we're on a Chrome extension that we can't redirect to with a token");
            tryToGetUser();
        }
    });
    $scope.$on('$ionicView.enter', function(){
        //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
        console.debug($state.current.name + ' enter...');
        $rootScope.hideNavigationMenu = true;
    });
    $scope.$on('$ionicView.afterEnter', function(){
        //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
        if(navigator && navigator.splashscreen) {
            console.debug('ReminderInbox: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
        qmService.hideLoader(0.5);
    });
    $scope.register = function() {
        var register = true;
        $scope.login(register);
    };
    var oAuthBrowserLogin = function (register) {
        var url = qmService.generateV1OAuthUrl(register);
        console.debug("Going to try logging in by opening new tab at url " + url);
        qmService.showBlackRingLoader();
        var ref = window.open(url, '_blank');
        if (!ref) {
            alert("You must first unblock popups, and and refresh the page for this to work!");
        } else {
            console.debug('Opened ' + url + ' and now broadcasting isLoggedIn message question every second to sibling tabs');
            var interval = setInterval(function () {ref.postMessage('isLoggedIn?', qmService.getRedirectUri());}, 1000);
            window.onMessageReceived = function (event) {  // handler when a message is received from a sibling tab
                console.debug("message received from sibling tab", event.url);
                if(interval !== false){
                    clearInterval(interval);  // Don't ask login question anymore
                    interval = false;
                    if (qmService.getAuthorizationCodeFromEventUrl(event)) {
                        var authorizationCode = qmService.getAuthorizationCodeFromEventUrl(event);
                        qmService.fetchAccessTokenAndUserDetails(authorizationCode);  // get access token from authorization code
                        ref.close();  // close the sibling tab
                    }
                    qmService.checkLoadStartEventUrlForErrors(ref, event);
                }
            };
            // listen to broadcast messages from other tabs within browser
            window.addEventListener("message", window.onMessageReceived, false);
        }
    };
    var browserLogin = function(register) {
        console.debug("Browser Login");
        if (qmService.weShouldUseOAuthLogin()) {
            if($scope.$root.$$phase) {$timeout(function() {oAuthBrowserLogin(register);},0,false);} else {oAuthBrowserLogin(register);} // Avoid Error: [$rootScope:inprog]
        } else {
            qmService.sendToNonOAuthBrowserLoginUrl(register);
        }
    };
    $scope.login = function(register, event) {
        if(window.developmentMode && window.devCredentials){
            //showLoginModal(event);
            qmService.refreshUser();
            return;
        }
        if(window.location.href.indexOf('localhost') !== -1){
            showLoginModal(event);
            return;
        }
        if(window && window.plugins && window.plugins.googleplus){googleLogout();}
        if($rootScope.isChromeApp){
            qmService.chromeAppLogin(register);
        } else if ($rootScope.isChromeExtension) {
            qmService.chromeExtensionLogin(register);
        } else if ($rootScope.isAndroid || $rootScope.isIOS || $rootScope.isWindows) {
            console.debug("$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform and using qmService.nonNativeMobileLogin");
            loginTimeout();
            qmService.nonNativeMobileLogin(register);
        } else {
            qmService.showBlackRingLoader();
            $scope.circlePage.title = 'Logging in...';
            console.debug("$scope.login: Not windows, android or is so assuming browser.");
            browserLogin(register);
        }
        if($rootScope.user){
            qmService.createDefaultReminders();
            console.debug($scope.controller_name + ".login: Got user and going to default state");
            qmService.goToDefaultStateIfNoAfterLoginUrlOrState();
        }
    };
    $scope.nativeSocialLogin = function(provider, accessToken){
        console.debug('$scope.nativeSocialLogin: Going to try to qmService.getTokensAndUserViaNativeSocialLogin for ' + provider + ' provider');
        qmService.getTokensAndUserViaNativeSocialLogin(provider, accessToken).then(function(response){
                console.debug('$scope.nativeSocialLogin: Response from qmService.getTokensAndUserViaNativeSocialLogin:' + JSON.stringify(response));
                if(response.user){
                    qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                    return;
                }
                var JWTToken = response.jwtToken;
                console.debug("nativeSocialLogin: Mobile device detected and provider is " + provider + ". Got JWT token " + JWTToken);
                var url = qmService.generateV2OAuthUrl(JWTToken);
                console.debug('nativeSocialLogin: open the auth window via inAppBrowser.');
                var ref = cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
                console.debug('nativeSocialLogin: listen to event at ' + url + ' when the page changes.');
                ref.addEventListener('loadstart', function(event) {
                    console.debug('nativeSocialLogin: loadstart event is ' + JSON.stringify(event));
                    console.debug('nativeSocialLogin: check if changed url is the same as redirection url.');
                    if(qmService.getAuthorizationCodeFromEventUrl(event)) {
                        var authorizationCode = qmService.getAuthorizationCodeFromEventUrl(event);
                        console.debug('nativeSocialLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.');
                        ref.close();
                        var withJWT = true;
                        qmService.fetchAccessTokenAndUserDetails(authorizationCode, withJWT);  // get access token from authorization code
                    }
                    qmService.checkLoadStartEventUrlForErrors(ref, event);
                });
            }, function(error){
                qmService.reportErrorDeferred("qmService.getTokensAndUserViaNativeSocialLogin error occurred Couldn't generate JWT! Error response: " + JSON.stringify(error));
            });
    };
    $scope.googleLoginDebug = function () {
        var userData = '{"email":"m@thinkbynumbers.org","idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxMjg1OGI1YTZiNDQ3YmY4MDdjNTJkOGJjZGQyOGMwODJmZjc4MjYifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0ODM4MTM4MTcsImV4cCI6MTQ4MzgxNzQxNywiYXVkIjoiMTA1MjY0ODg1NTE5NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExODQ0NDY5MzE4NDgyOTU1NTM2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIxMDUyNjQ4ODU1MTk0LWVuMzg1amxua25iMzhtYThvbTI5NnBuZWozaTR0amFkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaGQiOiJ0aGlua2J5bnVtYmVycy5vcmciLCJlbWFpbCI6Im1AdGhpbmtieW51bWJlcnMub3JnIiwibmFtZSI6Ik1pa2UgU2lubiIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLUJIcjRoeVVXcVpVL0FBQUFBQUFBQUFJL0FBQUFBQUFFNkw0LzIxRHZnVC1UNVZNL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJNaWtlIiwiZmFtaWx5X25hbWUiOiJTaW5uIiwibG9jYWxlIjoiZW4ifQ.YiHQH3-mBCaFxi9BgXe52S2scgVbMQ_-bMWVYY3d8MJZegQI5rl0IvUr0RmYT1k5bIda1sN0qeRyGkbzBHc7f3uctgpXtzjd02flgl4fNHmRgJkRgK_ttTO6Upx9bRR0ItghS_okM2gjgDWwO5wceTNF1f46vEVFH72GAUHVR9Csh4qs9yjqK66vxOEKN4UqIE9JRSn58dgIW8s6CNlBHiLUChUy1nfd2U0zGQ_tmu90y_76vVw5AYDrHDDPQBJ5Z4K_arzjnVzjhKeHpgOaywS4S1ifrylGkpGt5L2iB9sfdA8tNR5iJcEvEuhzGohnd7HvIWyJJ2-BRHukNYQX4Q","serverAuthCode":"4/3xjhGuxUYJVTVPox8Knyp0xJSzMFteFMvNxdwO5H8jQ","userId":"118444693184829555362","displayName":"Mike Sinn","familyName":"Sinn","givenName":"Mike","imageUrl":"https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAE6L4/21DvgT-T5VM/s96-c/photo.jpg"}';
        qmService.getTokensAndUserViaNativeGoogleLogin(JSON.parse(userData)).then(function (response) {
            console.debug('$scope.nativeSocialLogin: Response from qmService.getTokensAndUserViaNativeSocialLogin:' + JSON.stringify(response));
            qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
        }, function (errorMessage) {
            qmService.reportErrorDeferred("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
            var register = true;
            qmService.nonNativeMobileLogin(register);
        });
    };
    function reportLoginError(message) {
        qmService.reportErrorDeferred(message);
        if(window.debugMode){alert(message);}
    }
    function loginLog(message) {
        console.debug(message);
        if(window.debugMode){
            alert(message);
            qmService.reportErrorDeferred(message);
        }
    }
    $scope.googleLogin = function(register) {
        var debugMode = false;
        $scope.hideGoogleLoginButton = true;
        var timeout = loginTimeout();
        document.addEventListener('deviceready', deviceReady, false);
        function deviceReady() {
            //I get called when everything's ready for the plugin to be called!
            if(debugMode){alert('Device is ready in googleLogin!');}
            console.debug('Device is ready in googleLogin!');
            window.plugins.googleplus.login({
                'scopes': 'email https://www.googleapis.com/auth/plus.login', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
            }, function (userData) {
                $timeout.cancel(timeout);
                timeout = loginTimeout();
                loginLog('window.plugins.googleplus.login response:' + JSON.stringify(userData));
                qmService.getTokensAndUserViaNativeGoogleLogin(userData).then(function (response) {
                    $timeout.cancel(timeout);
                    qmService.hideLoader();
                    loginLog('googleLogin: Response from QM server via getTokensAndUserViaNativeSocialLogin:' + JSON.stringify(response));
                    qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                }, function (errorMessage) {
                    qmService.hideLoader();
                    reportLoginError("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                    var register = true;
                    qmService.nonNativeMobileLogin(register);
                });
            }, function (errorMessage) {
                qmService.hideLoader();
                reportLoginError("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                register = true;
                qmService.nonNativeMobileLogin(register);
            });
        }
    };
    var googleLogout = function(){
        document.addEventListener('deviceready', deviceReady, false);
        function deviceReady() {
            /** @namespace window.plugins.googleplus */
            window.plugins.googleplus.logout(function (msg) {console.debug("logged out of google!");}, function (fail) {console.debug("failed to logout", fail);});
            window.plugins.googleplus.disconnect(function (msg) {console.debug("disconnect google!");});
        }
    };
    $scope.facebookLogin = function(){
        qmService.showInfoToast('Logging you in...');
        console.debug("$scope.facebookLogin about to try $cordovaFacebook.login");
        var seconds  = 30;
        $scope.hideFacebookButton = true; // Hide button so user tries other options if it didn't work
        console.debug('Setting facebookLogin timeout for ' + seconds + ' seconds');
        $timeout(function () {
            if(!$rootScope.user){
                qmService.reportErrorDeferred('Could not get user $scope.facebookLogin within 30 seconds! Falling back to non-native registration...');
                var register = true;
                qmService.nonNativeMobileLogin(register);
            }
        }, seconds * 1000);
        $cordovaFacebook.login(["public_profile", "email", "user_friends"])
            .then(function(response) {
                console.debug("facebookLogin_success response->", JSON.stringify(response));
                var accessToken = response.authResponse.accessToken;
                if(!accessToken){
                    qmService.reportErrorDeferred('ERROR: facebookLogin could not get accessToken! response: ' + JSON.stringify(response));
                    qmService.showMaterialAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
                $scope.nativeSocialLogin('facebook', accessToken);
            }, function (error) {
                Bugsnag.notify("ERROR: facebookLogin could not get accessToken!  ", JSON.stringify(error), {}, "error");
                console.debug("facebook login error"+ JSON.stringify(error));
            });
    };
    var showLoginModal = function (ev) {
        $mdDialog.show({
            controller: LoginModalController,
            templateUrl: 'templates/modals/login-modal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen
        });
    };
    function LoginModalController($scope, $mdDialog, qmService) {
        $scope.credentials = {};
        $scope.close = function () { $mdDialog.cancel(); };
        $scope.hide = function () { $mdDialog.hide(); };
        $scope.answer = function (credentials) {
            window.devCredentials = credentials;
            qmService.showBasicLoader();
            qmService.refreshUser().then(function () {
                $mdDialog.hide();
                $state.go('app.remindersInbox');
            });
        };
    }
});
