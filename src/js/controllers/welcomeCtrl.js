angular.module('starter').controller('WelcomeCtrl', ["$scope", "$state", "$rootScope", "qmService", "qmLogService", "$stateParams", function($scope, $state, $rootScope, qmService, qmLogService, $stateParams) {
    $scope.controller_name = "WelcomeCtrl";
    qmService.navBar.hideNavigationMenu();
    $scope.primaryOutcomeVariableDetails = qm.getPrimaryOutcomeVariable();
    $scope.reportedVariableValue = false;
    qmService.navBar.setFilterBarSearchIcon(false);
    qmService.storage.getAsStringWithCallback('primaryOutcomeRatingFrequencyDescription',
        function(primaryOutcomeRatingFrequencyDescription) {
            if (primaryOutcomeRatingFrequencyDescription) {$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;}
            if (!primaryOutcomeRatingFrequencyDescription && $rootScope.platform.isIOS) {$scope.primaryOutcomeRatingFrequencyDescription = 'day';}
            if (!primaryOutcomeRatingFrequencyDescription && !$rootScope.platform.isIOS) {$scope.primaryOutcomeRatingFrequencyDescription = 'daily';}
        }
    );
    $scope.sendReminderNotificationEmails = true;
    $rootScope.sendDailyEmailReminder = true;
    $scope.saveIntervalAndGoToLogin = function(primaryOutcomeRatingFrequencyDescription){
        $scope.saveInterval(primaryOutcomeRatingFrequencyDescription);
        qmService.sendToLogin();
    };
    $scope.skipInterval = function(){
        $scope.showIntervalCard = false;
        qmLogService.debug('skipInterval: Going to login state...', null);
        qmService.sendToLogin();
    };
    $scope.saveInterval = function(primaryOutcomeRatingFrequencyDescription){
        if(primaryOutcomeRatingFrequencyDescription){$scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;}
        var intervals = {
            "minutely" : 60,
            "every five minutes" : 5 * 60,
            "never" : 0,
            "hourly": 60 * 60,
            "hour": 60 * 60,
            "every three hours" : 3 * 60 * 60,
            "twice a day" : 12 * 60 * 60,
            "daily" : 24 * 60 * 60,
            "day" : 24 * 60 * 60
        };
        var reminderToSchedule = {
            reminderFrequency: intervals[$scope.primaryOutcomeRatingFrequencyDescription],
            variableId: qm.getPrimaryOutcomeVariable().id,
            defaultValue: 3
        };
        qmService.addToTrackingReminderSyncQueue(reminderToSchedule);
        $scope.showIntervalCard = false;
    }
    $scope.storeRatingLocally = function(ratingValue){
        $scope.reportedVariableValue = qm.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[ratingValue] ? qm.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[ratingValue] : false;
        var primaryOutcomeMeasurement = qmService.createPrimaryOutcomeMeasurement(ratingValue);
        qmService.addToMeasurementsQueue(primaryOutcomeMeasurement);
        $scope.hidePrimaryOutcomeVariableCard = true;
        $scope.showIntervalCard = true;
    };
    $scope.init = function(){
        qmService.navBar.hideNavigationMenu();
        qmLogService.debug($state.current.name + ' initializing...', null);

    };
    $scope.$on('$ionicView.beforeEnter', function(){
        if($rootScope.user){
            qmLogService.debug('Already have user so no need to welcome. Going to default state.', null);
            qmService.goToDefaultState();
        }
    });
    $scope.init();
}]);
