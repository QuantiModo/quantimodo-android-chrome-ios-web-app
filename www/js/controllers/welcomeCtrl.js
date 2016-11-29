angular.module('starter')
    
    // Handlers the Welcome Page
    .controller('WelcomeCtrl', function($scope, $state, $rootScope, localStorageService, measurementService, $stateParams) {
        
        $scope.controller_name = "WelcomeCtrl";
        $rootScope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $rootScope.isAndroid = ionic.Platform.isAndroid();
        $rootScope.isChrome = window.chrome ? true : false;
        $rootScope.hideNavigationMenu = true;
        $scope.reportedVariableValue = false;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        $rootScope.showFilterBarSearchIcon = false;


        localStorageService.getItem('primaryOutcomeRatingFrequencyDescription',
            function(primaryOutcomeRatingFrequencyDescription) {
                if (primaryOutcomeRatingFrequencyDescription) {
                    $scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;
                }
                if (!primaryOutcomeRatingFrequencyDescription && $rootScope.isIOS) {
                    $scope.primaryOutcomeRatingFrequencyDescription = 'day';
                }
                if (!primaryOutcomeRatingFrequencyDescription && !$rootScope.isIOS) {
                    $scope.primaryOutcomeRatingFrequencyDescription = 'daily';
                }
            }
        );

        $scope.sendReminderNotificationEmails = true;
        $rootScope.sendDailyEmailReminder = true;

        $scope.saveIntervalAndGoToLogin = function(primaryOutcomeRatingFrequencyDescription){
            $scope.saveInterval(primaryOutcomeRatingFrequencyDescription);
            $rootScope.sendToLogin();
        };

        // skip interval reporting is tapped
        $scope.skipInterval = function(){
            $scope.showIntervalCard = false;
            console.debug('skipInterval: Going to login state...');
            $rootScope.sendToLogin();
        };

        $scope.storeRatingLocally = function(ratingValue){
            $scope.reportedVariableValue = config.appSettings.ratingTextToValueConversionDataSet[ratingValue] ?
                config.appSettings.ratingTextToValueConversionDataSet[ratingValue] : false;
            var primaryOutcomeMeasurement = measurementService.createPrimaryOutcomeMeasurement(ratingValue);
            measurementService.addToMeasurementsQueue(primaryOutcomeMeasurement);
            $scope.hidePrimaryOutcomeVariableCard = true;
            $scope.showIntervalCard = true;
        };


        $scope.init = function(){
            $rootScope.hideNavigationMenu = true;
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            
        };

        $scope.$on('$ionicView.beforeEnter', function(){
            if($rootScope.user){
                console.debug('Already have user so no need to welcome. Going to default state.');
                $state.go(config.appSettings.defaultState);
            }
        });

        $scope.init();
    });