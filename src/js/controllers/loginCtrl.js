angular.module('starter').controller('LoginCtrl', ["$scope", "$state", "$rootScope", "$ionicLoading", "$injector",
    "$stateParams", "$timeout", "qmService", "qmLogService", "$mdDialog",
    function($scope, $state, $rootScope, $ionicLoading, $injector, $stateParams, $timeout, qmService, qmLogService, $mdDialog) {
    $scope.state = { loading: false, alreadyRetried: false, showRetry: false};
    $scope.state.socialLogin = function(connectorName, ev, additionalParams) {
        // qmService.createDefaultReminders();  TODO:  Do this at appropriate time. Maybe on the back end during user creation?
        loginTimeout();
        qmService.auth.socialLogin(connectorName, ev, additionalParams, function (response) {
            qmLog.authDebug("Called socialLogin successHandler with response: "+JSON.stringify(response), null, response);
            if(!qm.getUser()){
                handleLoginError("No user after successful social login!");} else {handleLoginSuccess();
            }
        }, function (error) {
            handleLoginError("SocialLogin failed! error: " + error);
        });
    };
    $scope.controller_name = "LoginCtrl";
    $scope.headline = qm.getAppSettings().headline;
    qmService.navBar.setFilterBarSearchIcon(false);
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
        bodyText: "Sign so you never lose your precious data.",
        // moreInfo: "Your data belongs to you.  Security and privacy our top priorities. I promise that even if " +
        //     "the NSA waterboards me, I will never divulge share your data without your permission.",
    };
    var leaveIfLoggedIn = function () {
        if(qm.getUser() && qm.auth.getAccessTokenFromUrlUserOrStorage()){
            qmLog.authDebug('Already logged in on login page.  goToDefaultStateIfNoAfterLoginGoToUrlOrState...');
            qmService.login.afterLoginGoToUrlOrState();
        }
    };
    function handleLoginError(error) {
        $scope.retryLogin(error);
        qmLogService.error('Login failure: '+error);
    }
    function handleLoginSuccess() {
        if(qm.getUser() && $state.current.name.indexOf('login') !== -1){
            qmService.login.afterLoginGoToUrlOrState();
        }
    }
    var loginTimeout = function () {
        var duration = 60000;
        qmService.showBlackRingLoader(duration);
        $scope.circlePage.title = 'Logging in...';
        $scope.circlePage.bodyText = 'Thank you for your patience. Your call is very important to us!';
        qmLog.authDebug('Setting login timeout...');
        $timeout(function () {$scope.state.showRetry = true;}, 15000);
        return $timeout(function () {
            qmLog.authDebug('Finished login timeout');
            if(!qm.getUser()){handleLoginError("timed out");} else {handleLoginSuccess();}
        }, duration);
    };
    function tryToGetUser() {
        qmService.showBasicLoader(); // Chrome needs to do this because we can't redirect with access token
        console.info("Trying to get user");
        qmService.refreshUser().then(function () {
            console.info("Got user");
            qmService.hideLoader();
            leaveIfLoggedIn();
        }, function (error) {
            console.info("Could not get user! error: "+error);
            //qmService.showMaterialAlert(error);  Can't do this because it has a not authenticate popup
            qmService.hideLoader();  // Hides login loader too early
            leaveIfLoggedIn();
        });
    }
    $scope.$on('$ionicView.beforeEnter', function(e) {
        qmLog.authDebug('beforeEnter in state ' + $state.current.name);
        leaveIfLoggedIn();
        if(qm.urlHelper.getParam('loggingIn') || qmService.getAccessTokenFromUrlAndSetLocalStorageFlags()){
            loginTimeout();
        } else {
            qmLog.authDebug('refreshUser in beforeEnter in state ' + $state.current.name + ' in case we\'re on a Chrome extension that we can\'t redirect to with a token');
            tryToGetUser();
        }
    });
    $scope.$on('$ionicView.enter', function(){
        //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
        qmLog.authDebug($state.current.name + ' enter...');
        qmService.navBar.hideNavigationMenu();
    });
    $scope.$on('$ionicView.afterEnter', function(){
        qm.connectorHelper.getConnectorsFromLocalStorageOrApi();  // Pre-load to speed up login
        //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
        if(navigator && navigator.splashscreen) {
            qmLog.authDebug('ReminderInbox: Hiding splash screen because app is ready');
            navigator.splashscreen.hide();
        }
    });
    $scope.state.setAuthDebugEnabled = function(){
        qmLog.setAuthDebugEnabled(true);
        qmLog.authDebug("Enabled auth debug with on-hold button");
    };
    $scope.retryLogin = function(error){
        qmLog.setAuthDebugEnabled(true);
        $scope.state.alreadyRetried = true;
        $scope.state.showRetry = false;
        //$scope.circlePage.title = 'Please try logging in again';
        $scope.circlePage.title = null;
        qmLog.error("Called retry login because: " + error);
    };
}]);
