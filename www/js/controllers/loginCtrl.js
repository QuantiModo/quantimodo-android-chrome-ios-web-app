angular.module('starter')

    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading, $injector, $stateParams, quantimodoService) {

        $scope.state = { loading: false};
        $scope.controller_name = "LoginCtrl";
        $rootScope.hideNavigationMenu = true;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        $rootScope.showFilterBarSearchIcon = false;

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
                quantimodoService.goToDefaultStateIfNoAfterLoginUrlOrState();
            }
        };

        $scope.init();

        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            if($rootScope.appDisplayName !== "MoodiModo"){
                $scope.hideFacebookButton = true;
            }
        });
    });
