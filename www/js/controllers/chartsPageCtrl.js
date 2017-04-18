angular.module('starter').controller('ChartsPageCtrl', function($scope, $q, $state, $timeout, $rootScope, $ionicLoading,  $ionicActionSheet, $stateParams, quantimodoService, clipboard) {
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
        if(quantimodoService.getUrlParameter('variableName')){$stateParams.variableName = quantimodoService.getUrlParameter('variableName', window.location.href, true);}
        $rootScope.hideNavigationMenu = false;
        $scope.stopGettingMeasurements = false;
        $ionicLoading.hide();
        console.debug("variablePageCtrl: enter");
        if($stateParams.variableObject){
            $rootScope.variableObject = $stateParams.variableObject;
            refreshUserVariable($rootScope.variableObject.name);
        } else if ($stateParams.trackingReminder){
            getStatisticsForVariable($stateParams.trackingReminder.variableName);
        } else if ($stateParams.variableName){
            if(!$rootScope.variableObject || $rootScope.variableObject.name !== $stateParams.variableName){getStatisticsForVariable($stateParams.variableName);}
        } else if (quantimodoService.getPrimaryOutcomeVariable()){
            $stateParams.variableName = quantimodoService.getPrimaryOutcomeVariable().name;
            getStatisticsForVariable($stateParams.variableName);
        } else {
            $scope.goBack();
            return;
        }
        $ionicLoading.hide();
        if($rootScope.variableObject.name){
            $rootScope.variableName = $rootScope.variableObject.name;
            var params = {sort: "-startTimeEpoch", variableName: $rootScope.variableObject.name, limit: maximumMeasurements, offset: 0};
            $scope.state.title = getTruncatedVariableName($rootScope.variableObject.name);
            getDailyHistoryForVariable(params);
            getHistoryForVariable(params);
        } else {console.error($state.current.name + ' ERROR: $rootScope.variableObject.name not defined! $rootScope.variableObject: ' + JSON.stringify($rootScope.variableObject));}
        $rootScope.showActionSheetMenu = function() {
            console.debug("variablePageCtrl.showActionSheetMenu:  $rootScope.variableObject: ", $rootScope.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    quantimodoService.actionSheetButtons.recordMeasurement,
                    quantimodoService.actionSheetButtons.addReminder,
                    quantimodoService.actionSheetButtons.history,
                    quantimodoService.actionSheetButtons.analysisSettings,
                    { text: '<i class="icon ion-pricetag"></i>Tag ' + getTruncatedVariableName($rootScope.variableObject.name)},
                    { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '},
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {console.debug('CANCELLED');},
                buttonClicked: function(index) {
                    console.debug('BUTTON CLICKED', index);
                    if(index === 0){$state.go('app.measurementAdd', {variableObject: $rootScope.variableObject});}
                    if(index === 1){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject});}
                    if(index === 2) {$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject});}
                    if(index === 3) {$state.go('app.variableSettings', {variableObject: $rootScope.variableObject});}
                    return true;
                },
                destructiveButtonClicked: function() {
                    quantimodoService.showDeleteAllMeasurementsForVariablePopup();
                    return true;
                }
            });
            $timeout(function() {hideSheet();}, 20000);
        };
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
    $scope.editSettingsButtonClick = function() {$state.go('app.variableSettings', {variableObject: $rootScope.variableObject});};
    var updateDailyCharts = function(){
        if ($scope.state.dailyHistory.length > 0) {
            if($rootScope.variableObject.fillingValue !== null && $rootScope.variableObject.fillingValue !== -1){
                $scope.distributionChartConfig = quantimodoService.processDataAndConfigureDistributionChart($scope.state.dailyHistory, $rootScope.variableObject);
                $scope.lineChartConfig = quantimodoService.processDataAndConfigureLineChart($scope.state.dailyHistory, $rootScope.variableObject);
            }
            $scope.weekdayChartConfig = quantimodoService.processDataAndConfigureWeekdayChart($scope.state.dailyHistory, $rootScope.variableObject);
            $scope.monthlyChartConfig = quantimodoService.processDataAndConfigureMonthlyChart($scope.state.dailyHistory, $rootScope.variableObject);
            $scope.highchartsReflow();
        }
    };
    var updateCharts = function(){
        if ($scope.state.history.length > 0) {
            if($rootScope.variableObject.fillingValue === null || $rootScope.variableObject.fillingValue === -1){
                $scope.distributionChartConfig = quantimodoService.processDataAndConfigureDistributionChart($scope.state.history, $rootScope.variableObject);
                $scope.lineChartConfig = quantimodoService.processDataAndConfigureLineChart($scope.state.history, $rootScope.variableObject);
            }
            $scope.hourlyChartConfig = quantimodoService.processDataAndConfigureHourlyChart($scope.state.history, $rootScope.variableObject);
            $scope.highchartsReflow();
        }
    };
    var getHistoryForVariable = function(params){
        if($scope.stopGettingMeasurements){return;}
        if(!params.variableName){
            console.error("ERROR: params.variableName not provided to getHistoryForVariable.  params are: " + JSON.stringify(params));
            return;
        }
        if(quantimodoService.getUrlParameter('doNotProcess')){params.doNotProcess = true;}
        $scope.state.loadingHistory = true;
        quantimodoService.getMeasurementsFromApi(params, function(history){
            $scope.state.history = $scope.state.history.concat(history);
            if(params.limit > 0 && history.length > 0 && $scope.state.history.length < maximumMeasurements){
                $scope.state.offset = $scope.state.offset + 200;
                params.offset = $scope.state.offset;
                updateCharts();
                getHistoryForVariable(params);
            } else {
                $scope.state.loadingHistory = false;
                $scope.hideLoader();
                if ($scope.state.history.length > 0) {updateCharts();}
            }
        }, function(error){
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            console.error($state.current.name + ' error getting measurements: ' + JSON.stringify(error));
            $scope.state.loadingHistory = false;
            $scope.hideLoader();
        }, function(history) {
            $scope.state.history = $scope.state.history.concat(history);
        });
    };
    var getDailyHistoryForVariable = function(params){
        if($scope.stopGettingMeasurements){return;}
        if(!params.variableName){
            console.error("ERROR: params.variableName not provided to getHistoryForVariable. params: " + JSON.stringify(params));
            return;
        }
        $scope.state.loadingDailyHistory = true;
        quantimodoService.getMeasurementsDailyFromApiDeferred(params).then(function(dailyHistory){
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
            if (typeof Bugsnag !== "undefined") {Bugsnag.notify(error, JSON.stringify(error), {}, "error");}
            console.error($state.current.name + ' error getting dailyHistory measurements: ' + JSON.stringify(error));
            $scope.hideLoader();
            $scope.state.loadingDailyHistory = false;
        }, function(history) {
            $scope.state.loadingDailyHistory = false;
            $scope.state.dailyHistory = $scope.state.dailyHistory.concat(history);
        });
    };
    var refreshUserVariable = function (variableName) {
        quantimodoService.refreshUserVariableByNameDeferred(variableName).then(function (variableObject) {$rootScope.variableObject = variableObject;});
    };
    var getStatisticsForVariable = function (variableName) {
        $rootScope.variableObject = {name:  variableName};
        $rootScope.variableName = variableName;
        var params = {};
        quantimodoService.getUserVariableByNameFromLocalStorageOrApiDeferred(variableName, params).then(function(variableObject){
            $rootScope.variableObject = variableObject;
            refreshUserVariable(variableName);
        });
    };
});
