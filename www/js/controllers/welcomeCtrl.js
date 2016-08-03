angular.module('starter')
    
    // Handlers the Welcome Page
    .controller('WelcomeCtrl', function($scope, $state, $rootScope, localStorageService, measurementService) {
        
        $scope.controller_name = "WelcomeCtrl";
        $rootScope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $rootScope.isAndroid = ionic.Platform.isAndroid();
        $rootScope.isChrome = window.chrome ? true : false;
        $rootScope.hideNavigationMenu = true;
        $scope.reportedVariableValue = false;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        $scope.appName = config.appSettings.appName;

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

        $scope.subscribeNotification = true;

        $scope.saveIntervalAndGoToLogin = function(){
            $scope.saveInterval();
            $state.go('app.login');
        };

        // skip interval reporting is tapped
        $scope.skipInterval = function(){
            $scope.showIntervalCard = false;
            console.debug('skipInterval: Going to login state...');
            $state.go('app.login');
        };

        // ratingValue is reported
        $scope.storeRatingLocally = function(ratingValue){

            $scope.reportedVariableValue = config.appSettings.ratingTextToValueConversionDataSet[ratingValue] ?
                config.appSettings.ratingTextToValueConversionDataSet[ratingValue] : false;
            
            localStorageService.setItem('primaryOutcomeVariableReportedWelcomeScreen',true);
            //localStorageService.setItem('allMeasurements', JSON.stringify([]));
            
            // update local storage
            var primaryOutcomeMeasurement = measurementService.createPrimaryOutcomeMeasurement(ratingValue);
            measurementService.addToMeasurementsQueue(primaryOutcomeMeasurement);
            
            $scope.hidePrimaryOutcomeVariableCard = true;
            $scope.showIntervalCard = true;
        };


        $scope.init = function(){
            Bugsnag.context = "welcome";
            console.log("welcome initialization...");
            if (typeof analytics !== 'undefined')  { analytics.trackView("Welcome Controller"); }
            
        };

        $scope.init();
    });