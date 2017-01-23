angular.module('starter')

    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $state, $rootScope, $ionicLoading, $injector, $stateParams, quantimodoService) {

        $scope.state = { loading: false};
        $scope.controller_name = "LoginCtrl";
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        $rootScope.showFilterBarSearchIcon = false;

        $scope.loginPage = {
            title: 'Sign In',
            "backgroundColor": "#3467d6",
            circleColor: "#fefdfc",
            image: {
                url: "img/cute_robot_happy_transparent.png",
                height: "96",
                width: "70"
            },
            bodyText: "Now let's get you signed in to make sure you never lose your precious data.",
            // moreInfo: "Your data belongs to you.  Security and privacy our top priorities. I promise that even if " +
            //     "the NSA waterboards me, I will never divulge share your data without your permission.",
        };


        $scope.$on('$ionicView.enter', function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.hideLoader();
            if($rootScope.helpPopup){
                console.debug('Closing help popup!');
                $rootScope.helpPopup.close();
            }
        });

        $scope.$on('$ionicView.afterEnter', function(){
            $rootScope.hideNavigationMenu = true;
            quantimodoService.setupHelpCards();
            if(navigator && navigator.splashscreen) {
                console.debug('ReminderInbox: Hiding splash screen because app is ready');
                navigator.splashscreen.hide();
            }
        });

        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            if($rootScope.user){
                $scope.hideLoader();
                console.debug("Already logged in on login page.  Going to default state...");
                $rootScope.hideNavigationMenu = false;
                quantimodoService.goToDefaultStateIfNoAfterLoginUrlOrState();
            }
            if($rootScope.appDisplayName !== "MoodiModo"){
                $scope.hideFacebookButton = true;
            }
        });
    });
