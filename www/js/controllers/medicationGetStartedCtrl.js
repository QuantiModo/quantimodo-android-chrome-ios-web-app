angular.module('starter')
    
    // Handlers the Welcome Page
    .controller('MedicationGetStartedCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService, $state, $ionicHistory, notificationService, localStorageService, $rootScope, reminderService) {
        
        $scope.controller_name = "MedicationGetStartedCtrl";
        $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
        $rootScope.hideMenu = true;
        $scope.reportedVariableValue = false;

        // constructor
        $scope.init = function(){
            console.log("get started init");
        };

        $scope.init();
    });