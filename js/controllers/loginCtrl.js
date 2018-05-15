angular.module('starter').controller('LoginCtrl', ["$scope", "$state", "$rootScope", "$ionicLoading", "$injector",
    "$stateParams", "$timeout", "qmService", "qmLogService", "$mdDialog",
    function($scope, $state, $rootScope, $ionicLoading, $injector, $stateParams, $timeout, qmService, qmLogService, $mdDialog) {
    LoginModalController.$inject = ["$scope", "$mdDialog", "qmService", "qmLogService"];
    $scope.state = { loading: false, alreadyRetried: false};
    $scope.controller_name = "LoginCtrl";
    $scope.headline = qm.getAppSettings().headline;
    qmService.navBar.setFilterBarSearchIcon(false);
    if($rootScope.platform.isMobile){
        if(window && window.plugins && window.plugins.googleplus){
            $scope.showGoogleLoginButton = true;
        } else {
            if($rootScope.platform.isMobile){qmLogService.error("Google login not available on mobile!");}
        }
        var $cordovaFacebook = {};
        var disableFacebookLogin = true;  // Causing failures on IPv6 networks according to iTunes reviewer
        if (!disableFacebookLogin && $rootScope.platform.isIOS && $rootScope.appSettings.appDisplayName === "MoodiModo") {
            qmLog.authDebug('Injecting $cordovaFacebook', null);
            $cordovaFacebook = $injector.get('$cordovaFacebook');
            $scope.showFacebookLoginButton = true;
        } else { qmLog.authDebug('Could not inject $cordovaFacebook', null); }
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
        if($rootScope.user && $rootScope.user.accessToken){
            qmLog.authDebug('Already logged in on login page.  goToDefaultStateIfNoAfterLoginGoToUrlOrState...');
            qmService.goToDefaultStateIfNoAfterLoginGoToUrlOrState();
        }
        // Should already be doing this in AppCtrl
        // if(qmService.getAccessTokenFromUrlAndSetLocalStorageFlagsParameter()){
        //     qmService.showBlackRingLoader();
        //     qmService.refreshUser().then(function () {
        //         //qmService.hideLoader();  // Causes loader to hide while still refreshing inbox
        //     }, function (error) {
        //         qmLogService.error(error);
        //         qmService.hideLoader();
        //     });
        // }
    };
    var loginTimeout = function () {
        qmService.showBlackRingLoader();
        $scope.circlePage.title = 'Logging in...';
        qmLog.authDebug('Setting login timeout...', null);
        return $timeout(function () {
            qmLog.authDebug('Finished login timeout', null);
            if(!$rootScope.user){
                $scope.circlePage.title = 'Please try logging in again';
                qmLogService.error('Login failure');
            }
            if($rootScope.user && $state.current.name.indexOf('login') !== -1){
                qmService.goToDefaultStateIfNoAfterLoginGoToUrlOrState();
            }
        }, 40000);
    };
    function tryToGetUser() {
        if($rootScope.platform.isChromeExtension){qmService.showBasicLoader();} // Chrome needs to do this because we can't redirect with access token
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
        qmLog.authDebug('beforeEnter in state ' + $state.current.name, null);
        leaveIfLoggedIn();
        if($rootScope.appSettings.appDisplayName !== "MoodiModo"){$scope.hideFacebookButton = true;}
        if(qm.urlHelper.getParam('loggingIn') || qmService.getAccessTokenFromUrlAndSetLocalStorageFlags()){
            loginTimeout();
        } else {
            qmLog.authDebug('refreshUser in beforeEnter in state ' + $state.current.name + ' in case we\'re on a Chrome extension that we can\'t redirect to with a token', null);
            tryToGetUser();
        }
    });
    $scope.$on('$ionicView.enter', function(){
        //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
        qmLog.authDebug($state.current.name + ' enter...', null);
        qmService.navBar.hideNavigationMenu();
    });
    $scope.$on('$ionicView.afterEnter', function(){
        //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
        if(navigator && navigator.splashscreen) {
            qmLog.authDebug('ReminderInbox: Hiding splash screen because app is ready', null);
            navigator.splashscreen.hide();
        }
        qmService.hideLoader(0.5);
        if(qm.platform.isDevelopmentMode()){qmService.getDevCredentials();}
    });
    $scope.register = function() {
        var register = true;
        $scope.login(register);
    };
    var oAuthBrowserLogin = function (register) {
        var url = qmService.generateV1OAuthUrl(register);
        qmLog.authDebug('Going to try logging in by opening new tab at url ' + url);
        qmService.showBlackRingLoader();
        var ref = window.open(url, '_blank');
        if (!ref) {
            qmLogService.error('You must first unblock popups, and and refresh the page for this to work!');
            alert("You must first unblock popups, and and refresh the page for this to work!");
        } else {
            qmLog.authDebug('Opened ' + url + ' and now broadcasting isLoggedIn message question every second to sibling tabs', null);
            var interval = setInterval(function () {ref.postMessage('isLoggedIn?', qmService.getRedirectUri());}, 1000);
            window.onMessageReceived = function (event) {  // handler when a message is received from a sibling tab
                qmLog.authDebug('message received from sibling tab', null, event.url);
                if(interval !== false){
                    clearInterval(interval);  // Don't ask login question anymore
                    interval = false;
                    if (qmService.getAuthorizationCodeFromEventUrl(event)) {
                        var authorizationCode = qmService.getAuthorizationCodeFromEventUrl(event);
                        qmService.fetchAccessTokenAndUserDetails(authorizationCode);  // get access token from authorization code
                        ref.close();  // close the sibling tab
                        // Called twice!  Let's do this later after the user understands the point of popups
                        //qmService.notifications.showEnablePopupsConfirmation();  // This is strangely disabled sometimes
                    }
                    qmService.checkLoadStartEventUrlForErrors(ref, event);
                }
            };
            // listen to broadcast messages from other tabs within browser
            window.addEventListener("message", window.onMessageReceived, false);
        }
    };
    var browserLogin = function(register) {
        qmLog.authDebug('Browser Login', null);
        if (qmService.weShouldUseOAuthLogin()) {
            if($scope.$root.$$phase) {$timeout(function() {oAuthBrowserLogin(register);},0,false);} else {oAuthBrowserLogin(register);} // Avoid Error: [$rootScope:inprog]
        } else {
            qmService.sendToNonOAuthBrowserLoginUrl(register);
        }
    };
    $scope.login = function(register, event) {
        if(qm.platform.isDevelopmentMode() && window.devCredentials){
            //showLoginModal(event);
            qmLog.authDebug("$scope.login: has dev credentials");
            qmService.refreshUser();
            return;
        }
        if(window.location.href.indexOf('localhost') !== -1){
            qmLog.authDebug("$scope.login: on localhost");
            showLoginModal(event);
            return;
        }
        if(window && window.plugins && window.plugins.googleplus){googleLogout();}
        if (qm.platform.isChromeExtension()) {
            qmService.chromeExtensionLogin(register);
        } else if ($rootScope.platform.isAndroid || $rootScope.platform.isIOS || $rootScope.platform.isWindows) {
            qmLog.authDebug('$scope.login: Browser and Chrome Not Detected.  Assuming mobile platform and using qmService.nonNativeMobileLogin', null);
            loginTimeout();
            qmService.nonNativeMobileLogin(register);
        } else {
            qmService.showBlackRingLoader();
            $scope.circlePage.title = 'Logging in...';
            qmLog.authDebug('$scope.login: Not windows, android or is so assuming browser.', null);
            browserLogin(register);
        }
        if($rootScope.user){
            qmService.createDefaultReminders();
            qmLog.authDebug($scope.controller_name + '.login: Got user and going to default state', null);
            qmService.goToDefaultStateIfNoAfterLoginGoToUrlOrState();
        }
    };
    $scope.retryLogin = function(){
        qmLog.setAuthDebug(true);
        qmLog.error("Clicked retry login!");
        if($scope.state.alreadyRetried){
            showLoginModal()
        } else {
            $scope.state.alreadyRetried = true;
            $scope.circlePage.title = 'Please try logging in again';
        }
    };
    $scope.nativeSocialLogin = function(provider, accessToken){
        qmLog.authDebug('$scope.nativeSocialLogin: Going to try to qmService.getTokensAndUserViaNativeSocialLogin for ' + provider + ' provider', null);
        qmService.getTokensAndUserViaNativeSocialLogin(provider, accessToken).then(function(response){
                qmLog.authDebug('$scope.nativeSocialLogin: Response from qmService.getTokensAndUserViaNativeSocialLogin:' + JSON.stringify(response), null);
                if(response.user){
                    qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                    return;
                }
                var JWTToken = response.jwtToken;
                qmLog.authDebug('nativeSocialLogin: Mobile device detected and provider is ' + provider + '. Got JWT token ' + JWTToken, null);
                var url = qmService.generateV2OAuthUrl(JWTToken);
                qmLog.authDebug('nativeSocialLogin: open the auth window via inAppBrowser.', null);
                var ref = cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
                qmLog.authDebug('nativeSocialLogin: listen to event at ' + url + ' when the page changes.', null);
                ref.addEventListener('loadstart', function(event) {
                    qmLog.authDebug('nativeSocialLogin: loadstart event is ' + JSON.stringify(event), null);
                    qmLog.authDebug('nativeSocialLogin: check if changed url is the same as redirection url.', null);
                    if(qmService.getAuthorizationCodeFromEventUrl(event)) {
                        var authorizationCode = qmService.getAuthorizationCodeFromEventUrl(event);
                        qmLog.authDebug('nativeSocialLogin: Got authorization code: ' + authorizationCode + ' Closing inAppBrowser.', null);
                        ref.close();
                        var withJWT = true;
                        qmService.fetchAccessTokenAndUserDetails(authorizationCode, withJWT);  // get access token from authorization code
                        // Called twice!  Let's do this later after the user understands the point of popups
                        //qmService.notifications.showEnablePopupsConfirmation();  // This is strangely disabled sometimes
                    }
                    qmService.checkLoadStartEventUrlForErrors(ref, event);
                });
            }, function(error){
                qmLogService.error("qmService.getTokensAndUserViaNativeSocialLogin error occurred Couldn't generate JWT! Error response: " + JSON.stringify(error));
            });
    };
    $scope.googleLoginDebug = function () {
        var userData = '{"email":"m@thinkbynumbers.org","idToken":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxMjg1OGI1YTZiNDQ3YmY4MDdjNTJkOGJjZGQyOGMwODJmZjc4MjYifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0ODM4MTM4MTcsImV4cCI6MTQ4MzgxNzQxNywiYXVkIjoiMTA1MjY0ODg1NTE5NC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExODQ0NDY5MzE4NDgyOTU1NTM2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIxMDUyNjQ4ODU1MTk0LWVuMzg1amxua25iMzhtYThvbTI5NnBuZWozaTR0amFkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaGQiOiJ0aGlua2J5bnVtYmVycy5vcmciLCJlbWFpbCI6Im1AdGhpbmtieW51bWJlcnMub3JnIiwibmFtZSI6Ik1pa2UgU2lubiIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLUJIcjRoeVVXcVpVL0FBQUFBQUFBQUFJL0FBQUFBQUFFNkw0LzIxRHZnVC1UNVZNL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJNaWtlIiwiZmFtaWx5X25hbWUiOiJTaW5uIiwibG9jYWxlIjoiZW4ifQ.YiHQH3-mBCaFxi9BgXe52S2scgVbMQ_-bMWVYY3d8MJZegQI5rl0IvUr0RmYT1k5bIda1sN0qeRyGkbzBHc7f3uctgpXtzjd02flgl4fNHmRgJkRgK_ttTO6Upx9bRR0ItghS_okM2gjgDWwO5wceTNF1f46vEVFH72GAUHVR9Csh4qs9yjqK66vxOEKN4UqIE9JRSn58dgIW8s6CNlBHiLUChUy1nfd2U0zGQ_tmu90y_76vVw5AYDrHDDPQBJ5Z4K_arzjnVzjhKeHpgOaywS4S1ifrylGkpGt5L2iB9sfdA8tNR5iJcEvEuhzGohnd7HvIWyJJ2-BRHukNYQX4Q","serverAuthCode":"4/3xjhGuxUYJVTVPox8Knyp0xJSzMFteFMvNxdwO5H8jQ","userId":"118444693184829555362","displayName":"Mike Sinn","familyName":"Sinn","givenName":"Mike","imageUrl":"https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAE6L4/21DvgT-T5VM/s96-c/photo.jpg"}';
        qmService.getTokensAndUserViaNativeGoogleLogin(JSON.parse(userData)).then(function (response) {
            qmLog.authDebug('$scope.nativeSocialLogin: Response from qmService.getTokensAndUserViaNativeSocialLogin:' + JSON.stringify(response), null);
            qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
        }, function (errorMessage) {
            qmLogService.error("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
            var register = true;
            qmService.nonNativeMobileLogin(register);
        });
    };
    $scope.googleLogin = function(register) {
        $scope.hideGoogleLoginButton = true;
        var timeout = loginTimeout();
        document.addEventListener('deviceready', deviceReady, false);
        function deviceReady() {
            //I get called when everything's ready for the plugin to be called!
            qmLog.authDebug('Device is ready in googleLogin!');
            window.plugins.googleplus.login({
                'scopes': 'email https://www.googleapis.com/auth/plus.login', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
            }, function (userData) {
                $timeout.cancel(timeout);
                timeout = loginTimeout();
                qmLog.authDebug('window.plugins.googleplus.login response:' + JSON.stringify(userData));
                qmService.getTokensAndUserViaNativeGoogleLogin(userData).then(function (response) {
                    $timeout.cancel(timeout);
                    qmService.hideLoader();
                    qmLog.authDebug('googleLogin: Response from QM server via getTokensAndUserViaNativeSocialLogin:' + JSON.stringify(response));
                    qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                    // Called twice!  Let's do this later after the user understands the point of popups
                    //qmService.notifications.showEnablePopupsConfirmation();  // This is strangely disabled sometimes
                }, function (errorMessage) {
                    qmLog.setAuthDebug(true);
                    qmService.hideLoader();
                    qmLog.error("ERROR: googleLogin could not get userData!  Fallback to qmService.nonNativeMobileLogin registration. Error: " + JSON.stringify(errorMessage));
                    qmService.nonNativeMobileLogin(true);
                });
            }, function (errorMessage) {
                qmLog.error("googleLogin error: " + JSON.stringify(errorMessage));
                qmLog.setAuthDebug(true);
                if(!qmService.alreadyRetriedGoogleLogin){
                    $scope.googleLogin(register);
                    qmService.alreadyRetriedGoogleLogin = true;
                } else {
                    qmService.nonNativeMobileLogin(true);
                }
                qmService.hideLoader();
            });
        }
    };
    var googleLogout = function(){
        qmLog.authDebug('googleLogout');
        document.addEventListener('deviceready', deviceReady, false);
        function deviceReady() {
            /** @namespace window.plugins.googleplus */
            window.plugins.googleplus.logout(function (msg) {qmLog.authDebug('logged out of google!');},
                function (fail) {qmLog.authDebug('failed to logout', null, fail);});
            window.plugins.googleplus.disconnect(function (msg) {qmLog.authDebug('disconnect google!');});
        }
    };
    $scope.facebookLogin = function(){
        qmService.showInfoToast('Logging you in...');
        qmLog.authDebug('$scope.facebookLogin about to try $cordovaFacebook.login', null);
        var seconds  = 30;
        $scope.hideFacebookButton = true; // Hide button so user tries other options if it didn't work
        qmLog.authDebug('Setting facebookLogin timeout for ' + seconds + ' seconds', null);
        $timeout(function () {
            if(!$rootScope.user){
                qmLogService.error('Could not get user $scope.facebookLogin within 30 seconds! Falling back to non-native registration...');
                var register = true;
                qmService.nonNativeMobileLogin(register);
            }
        }, seconds * 1000);
        $cordovaFacebook.login(["public_profile", "email", "user_friends"])
            .then(function(response) {
                qmLog.authDebug('facebookLogin_success response->', null, JSON.stringify(response));
                var accessToken = response.authResponse.accessToken;
                if(!accessToken){
                    qmLogService.error('ERROR: facebookLogin could not get accessToken! response: ' + JSON.stringify(response));
                    qmService.showMaterialAlert('Facebook Login Issue', 'Please try to sign in using on of the other methods below');
                }
                $scope.nativeSocialLogin('facebook', accessToken);
            }, function (error) {
                qmLog.error("ERROR: facebookLogin could not get accessToken!  ", JSON.stringify(error), {}, "error");
                qmLog.authDebug('facebook login error' + JSON.stringify(error));
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
                qmService.goToDefaultStateIfNoAfterLoginGoToUrlOrState();
            });
        };
    }
}]);
