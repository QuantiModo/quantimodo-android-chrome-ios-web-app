angular.module('starter').controller('WelcomeCtrl', ["$scope", "$state", "$rootScope", "qmService", "$stateParams",
    function($scope, $state, $rootScope, qmService, $stateParams){
    $scope.controller_name = "WelcomeCtrl";
    qmService.navBar.hideNavigationMenu();
    $scope.primaryOutcomeVariableDetails = qm.getPrimaryOutcomeVariable();
    $scope.reportedVariableValue = false;
    qmService.navBar.setFilterBarSearchIcon(false);
    $scope.sendReminderNotificationEmails = true;
    $rootScope.sendDailyEmailReminder = true;
    $scope.saveIntervalAndGoToLogin = function(frequency){
        $scope.saveInterval(frequency);
        qm.auth.sendToLogin("welcome completed");
    };
    $scope.skipInterval = function(){
        $scope.showIntervalCard = false;
        qmLog.debug('skipInterval: Going to login state...', null);
        qm.auth.sendToLogin("welcome completed");
    };
    $scope.saveInterval = function(frequency){
        if(frequency){
            $scope.primaryOutcomeRatingFrequencyDescription = frequency;
        }
        var intervals = {
            "minutely": 60,
            "every five minutes": 5 * 60,
            "never": 0,
            "hourly": 60 * 60,
            "hour": 60 * 60,
            "every three hours": 3 * 60 * 60,
            "twice a day": 12 * 60 * 60,
            "daily": 24 * 60 * 60,
            "day": 24 * 60 * 60
        };
        qm.reminderHelper.addToQueue({
            reminderFrequency: intervals[$scope.primaryOutcomeRatingFrequencyDescription],
            variableId: qm.getPrimaryOutcomeVariable().id,
            defaultValue: 3
        });
        $scope.showIntervalCard = false;
    }
    $scope.storeRatingLocally = function(ratingValue){
        $scope.reportedVariableValue = qm.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[ratingValue] ? qm.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[ratingValue] : false;
        var primaryOutcomeMeasurement = qmService.createPrimaryOutcomeMeasurement(ratingValue);
        qm.measurements.addToMeasurementsQueue(primaryOutcomeMeasurement);
        $scope.hidePrimaryOutcomeVariableCard = true;
        $scope.showIntervalCard = true;
    };
    $scope.$on('$ionicView.beforeEnter', function(){
        if (document.title !== "Welcome") {document.title = "Welcome";}
        if($rootScope.user){
            qmLog.debug('Already have user so no need to welcome. Going to default state.');
            qmService.goToDefaultState();
        }
        qmService.navBar.hideNavigationMenu();
        qmLog.debug($state.current.name + ' initializing...', null);
    });
}]);
