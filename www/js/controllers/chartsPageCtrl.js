angular.module('starter').controller('ChartsPageCtrl', function($scope, $q, $state, $timeout, $rootScope, $ionicLoading,  $ionicActionSheet, $stateParams, qmService, clipboard) {
    $scope.controller_name = "ChartsPageCtrl";
    $scope.addReminderButtonText = "Add Reminder";
    $scope.recordMeasurementButtonText = "Record Measurement";
    $scope.lineChartConfig = false;
    $scope.distributionChartConfig = false;
    $rootScope.showFilterBarSearchIcon = false;
    $scope.state = {
        history : [],
        dailyHistory : [],
        sum : 0,
        rangeLength : 0,
        averageValue : 0,
        offset: 0,
        dailyHistoryOffset: 0,
        title: "Charts"
    };
    var maximumMeasurements = 999; // Highcharts will only show 1000 measurements with notes
    function getTruncatedVariableName(variableName) {if(variableName.length > 18){return variableName.substring(0, 18) + '...';} else { return variableName;}}
    $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
        if(qmService.getUrlParameter('variableName')){$stateParams.variableName = qmService.getUrlParameter('variableName', window.location.href, true);}
        $rootScope.hideNavigationMenu = false;
        $scope.stopGettingMeasurements = false;
        qmService.hideLoader();
        console.debug("variablePageCtrl: enter");
        if($stateParams.variableObject){
            $rootScope.variableObject = $stateParams.variableObject;
            refreshUserVariable($rootScope.variableObject.name);
        } else if ($stateParams.trackingReminder){
            getStatisticsForVariable($stateParams.trackingReminder.variableName);
        } else if ($stateParams.variableName){
            if(!$rootScope.variableObject || $rootScope.variableObject.name !== $stateParams.variableName){getStatisticsForVariable($stateParams.variableName);}
        } else if (qmService.getPrimaryOutcomeVariable()){
            $stateParams.variableName = qmService.getPrimaryOutcomeVariable().name;
            getStatisticsForVariable($stateParams.variableName);
        } else {
            $scope.goBack();
            return;
        }
        qmService.hideLoader();
        if($rootScope.variableObject.name){
            $rootScope.variableName = $rootScope.variableObject.name;
            var params = {sort: "-startTimeEpoch", variableName: $rootScope.variableObject.name, limit: maximumMeasurements, offset: 0};
            $scope.state.title = qmService.getTruncatedVariableName($rootScope.variableObject.name);
            getDailyHistoryForVariable(params);
            getHistoryForVariable(params);
        } else {qmService.logError($state.current.name + ' ERROR: $rootScope.variableObject.name not defined!', $rootScope.variableObject);}
        $rootScope.showActionSheetMenu = qmService.variableObjectActionSheet;
    });
    $scope.$on('$ionicView.beforeLeave', function(){
        console.debug('Leaving so setting $scope.stopGettingMeasurements to true');
        $scope.stopGettingMeasurements = true;
    });
    if (!clipboard.supported) {
        console.log('Sorry, copy to clipboard is not supported');
        $scope.hideClipboardButton = true;
    }
    $scope.addNewReminderButtonClick = function() {
        console.debug("addNewReminderButtonClick");
        $state.go('app.reminderAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name});
    };
    $scope.recordMeasurementButtonClick = function() {$state.go('app.measurementAdd', {variableObject: $rootScope.variableObject, fromState: $state.current.name});};
    $scope.editSettingsButtonClick = function() {$state.go('app.variableSettings', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});};
    var updateDailyCharts = function(){
        if ($scope.state.dailyHistory.length > 0) {
            if($rootScope.variableObject.fillingValue !== null && $rootScope.variableObject.fillingValue !== -1){
                $scope.distributionChartConfig = qmService.processDataAndConfigureDistributionChart($scope.state.dailyHistory, $rootScope.variableObject);
                $scope.lineChartConfig = qmService.processDataAndConfigureLineChart($scope.state.dailyHistory, $rootScope.variableObject);
            } else {
                if(!$scope.lineChartConfig || $scope.state.history.length === maximumMeasurements){  // We want to use daily in this case so we can see a longer time range
                    $scope.lineChartConfig = qmService.processDataAndConfigureLineChart($scope.state.dailyHistory, $rootScope.variableObject);
                }
                //$scope.smoothedLineChartConfig = qmService.processDataAndConfigureLineChart($scope.state.dailyHistory, $rootScope.variableObject);
            }
            $scope.weekdayChartConfig = qmService.processDataAndConfigureWeekdayChart($scope.state.dailyHistory, $rootScope.variableObject);
            $scope.monthlyChartConfig = qmService.processDataAndConfigureMonthlyChart($scope.state.dailyHistory, $rootScope.variableObject);
            qmService.highchartsReflow();
        }
    };
    var updateCharts = function(){
        if ($scope.state.history.length > 0) {
            if($rootScope.variableObject.fillingValue === null || $rootScope.variableObject.fillingValue === -1){
                $scope.distributionChartConfig = qmService.processDataAndConfigureDistributionChart($scope.state.history, $rootScope.variableObject);
                if($scope.state.history.length < maximumMeasurements){  // We want to use daily in this case so we can see a longer time range
                    $scope.lineChartConfig = qmService.processDataAndConfigureLineChart($scope.state.history, $rootScope.variableObject);
                }
            }
            $scope.hourlyChartConfig = qmService.processDataAndConfigureHourlyChart($scope.state.history, $rootScope.variableObject);
            qmService.highchartsReflow();
        }
    };
    var getHistoryForVariable = function(params){
        if($scope.stopGettingMeasurements){return;}
        if(!params.variableName){
            qmService.logError("ERROR: params.variableName not provided to getHistoryForVariable.  params are: ", params);
            return;
        }
        if(qmService.getUrlParameter('doNotProcess')){params.doNotProcess = true;}
        $scope.state.loadingHistory = true;
        qmService.getMeasurementsFromApi(params, function(history){
            $scope.state.history = $scope.state.history.concat(history);
            if(params.limit > 0 && history.length > 0 && $scope.state.history.length < maximumMeasurements){
                $scope.state.offset = $scope.state.offset + 200;
                params.offset = $scope.state.offset;
                updateCharts();
                getHistoryForVariable(params);
            } else {
                $scope.state.loadingHistory = false;
                if ($scope.state.history.length > 0) {updateCharts();}
            }
        }, function(error){
            qmService.logError($state.current.name + ' error getting measurements: ' + JSON.stringify(error));
            $scope.state.loadingHistory = false;
        }, function(history) {
            $scope.state.history = $scope.state.history.concat(history);
        });
    };
    var getDailyHistoryForVariable = function(params){
        if($scope.stopGettingMeasurements){return;}
        if(!params.variableName){
            qmService.logError("ERROR: params.variableName not provided to getHistoryForVariable. params: " + JSON.stringify(params));
            return;
        }
        $scope.state.loadingDailyHistory = true;
        qmService.getMeasurementsDailyFromApiDeferred(params).then(function(dailyHistory){
            $scope.state.dailyHistory = $scope.state.dailyHistory.concat(dailyHistory);
            if(params.limit > 0 && dailyHistory.length > 0 && $scope.state.dailyHistory.length < maximumMeasurements){
                $scope.state.dailyHistoryOffset = $scope.state.dailyHistoryOffset + 200;
                params.offset = $scope.state.dailyHistoryOffset;
                updateDailyCharts();
                getDailyHistoryForVariable(params);
            } else {
                $scope.state.loadingDailyHistory = false;
                if ($scope.state.dailyHistory.length > 0) {updateDailyCharts();}
            }
        }, function(error){
            qmService.logError($state.current.name + ' error getting dailyHistory measurements: ' + JSON.stringify(error));
            $scope.state.loadingDailyHistory = false;
        }, function(history) {
            $scope.state.loadingDailyHistory = false;
            $scope.state.dailyHistory = $scope.state.dailyHistory.concat(history);
        });
    };
    var refreshUserVariable = function (variableName) {
        qmService.refreshUserVariableByNameDeferred(variableName).then(function (variableObject) {$rootScope.variableObject = variableObject;});
    };
    var getStatisticsForVariable = function (variableName) {
        $rootScope.variableObject = {name:  variableName};
        $rootScope.variableName = variableName;
        var params = {};
        qmService.getUserVariableByNameFromLocalStorageOrApiDeferred(variableName, params).then(function(variableObject){
            $rootScope.variableObject = variableObject;
            refreshUserVariable(variableName);
        });
    };
});
