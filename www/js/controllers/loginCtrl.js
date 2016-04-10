angular.module('starter')
    
    // Handlers the Welcome Page
    .controller('LoginCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService, $state, $ionicHistory, notificationService, localStorageService, $rootScope, reminderService) {
        
        $scope.controller_name = "LoginCtrl";
        $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
        $rootScope.hideMenu = true;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;

        // constructor
        $scope.init = function(){
            console.log("login init");
        };

        $scope.init();
    });