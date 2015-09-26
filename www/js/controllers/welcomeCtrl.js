angular.module('starter')
    
    // Handlers the Welcom Page
    .controller('WelcomeCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService, $state, $ionicHistory,notificationService,localStorageService,$rootScope) {
        
        $scope.controller_name = "WelcomeCtrl";
        $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
        $rootScope.hideMenu = true;
        console.log('hide menu');


        // flags
        
        localStorageService.getItem('trackingFactorReportedWelcomeScreen', function (trackingFactorReportedWelcomeScreen) {
            $scope.show_tracking_factor_card = trackingFactorReportedWelcomeScreen ? false : true;

        });

        localStorageService.getItem('interval',function(interval){
            $scope.show_interval_card = interval ? false : true;

        });
        
        localStorageService.getItem('askForRating',function(askForRating){
            $scope.notification_interval = askForRating || "hour";
        });

        $scope.subscribe_notification = true;
        
        console.log("$scope", $scope.show_interval_card);

        // when interval is set 
        $scope.save_interval = function(){
            localStorageService.setItem('interval',true);
            /*TODO schedule notification*/
            if($scope.subscribe_notification){
                notificationService.scheduleNotification($scope.notification_interval);
            }

            // update localstorage
            localStorageService.setItem('askForRating', $scope.notification_interval);
            $scope.show_interval_card = false;
        };

        // skip interval reporting is tapped
        $scope.skip_interval = function(){
            localStorageService.setItem('interval',true);
            $scope.show_interval_card = false;
        };

        // factorValue is reported
        $scope.report_tracking_factor = function(factorValue){
            
            localStorageService.setItem('trackingFactorReportedWelcomeScreen',true);
            localStorageService.setItem('allData', JSON.stringify([]));
            
            // update localstorage
            measurementService.updateTrackingFactorLocally(factorValue).then(function () {
                // try to send the data to server
                measurementService.updateTrackingFactor(factorValue);

                // calculate charts data
                measurementService.calculateAverageTrackingFactorValue().then(function(){
                    measurementService.calculateBothChart();
                    $scope.show_tracking_factor_card = false;
                });
            });
        };

        // constructo
        $scope.init = function(){
            console.log("welcom init");
            
            // for setting intervals
            $scope.timeRemaining = false;
            
        };

        $scope.init();
    });