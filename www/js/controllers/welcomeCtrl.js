angular.module('starter')
    
    // Handlers the Welcome Page
    .controller('WelcomeCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService, $state, $ionicHistory, notificationService, localStorageService, $rootScope, reminderService) {
        
        $scope.controller_name = "WelcomeCtrl";
        $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
        $rootScope.hideMenu = true;
        $scope.reportedVariableValue = false;
        console.log('hide menu');


        // flags
        localStorageService.getItem('primaryOutcomeVariableReportedWelcomeScreen', function (primaryOutcomeVariableReportedWelcomeScreen) {
            $scope.show_primary_outcome_variable_card = primaryOutcomeVariableReportedWelcomeScreen ? false : true;

        });

        localStorageService.getItem('interval',function(interval){
            $scope.show_interval_card = interval ? false : true;

        });
        
        localStorageService.getItem('askForRating',function(askForRating){
            $scope.notification_interval = askForRating || $scope.isIOS? "hour" : "hourly";
        });

        $scope.subscribe_notification = true;
        
        console.log("$scope", $scope.show_interval_card);

        // when interval is set 
        $scope.save_interval = function(){
            localStorageService.setItem('interval',true);
            /*TODO schedule notification*/
            if($scope.subscribe_notification){

                notificationService.scheduleNotification($scope.notification_interval);

                var intervals = {
                    "never" : 0,
                    "hourly": 60 * 60,
                    "hour": 60 * 60,
                    "three" : 03 * 60 * 60,
                    "twice" : 12 * 60 * 60,
                    "daily" : 24 * 60 * 60,
                    "day" : 24 * 60 * 60
                };

                $rootScope.reminderToSchedule = {
                    id: config.appSettings.primary_outcome_variable_details.id,
                    reportedVariableValue: $scope.reportedVariableValue,
                    interval: intervals[$scope.notification_interval], 
                    name: config.appSettings.primary_outcome_variable_details.name,
                    category: config.appSettings.primary_outcome_variable_details.category,
                    unit: config.appSettings.primary_outcome_variable_details.unit,
                    combinationOperation : config.appSettings.primary_outcome_variable_details.combinationOperation
                };

                localStorageService.setItem('askForRating', $scope.notification_interval);
                $scope.show_interval_card = false;
            }            
        };

        // skip interval reporting is tapped
        $scope.skip_interval = function(){
            localStorageService.setItem('interval',true);
            $scope.show_interval_card = false;
        };

        // factorValue is reported
        $scope.report_primary_outcome_variable = function(factorValue){

            $scope.reportedVariableValue = config.appSettings.conversion_dataset_reversed[factorValue] ? 
                config.appSettings.conversion_dataset_reversed[factorValue] : false;
            
            localStorageService.setItem('primaryOutcomeVariableReportedWelcomeScreen',true);
            localStorageService.setItem('allData', JSON.stringify([]));
            
            // update localstorage
            measurementService.updatePrimaryOutcomeVariableLocally(factorValue).then(function () {
                // try to send the data to server
                measurementService.updatePrimaryOutcomeVariable(factorValue);

                // calculate charts data
                measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function(){
                    measurementService.calculateBothChart();
                    $scope.show_primary_outcome_variable_card = false;
                });
            });
        };

        // constructor
        $scope.init = function(){
            console.log("welcome init");
            
            // for setting intervals
            $scope.timeRemaining = false;
            
        };

        $scope.init();
    });