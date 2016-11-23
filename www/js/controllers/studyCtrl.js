angular.module('starter')
	.controller('StudyCtrl', function($scope, $state, QuantiModo, $stateParams, $ionicHistory, $rootScope,
                                      correlationService, chartService, $timeout, $ionicLoading, localStorageService) {

		$scope.controller_name = "StudyCtrl";
        
        $scope.init = function(){

            $rootScope.getAllUrlParams();
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state = {
                title: 'Loading study...',
                requestParams: {},
                hideStudyButton: true
            };
            
            $scope.correlationObject = $stateParams.correlationObject;
            localStorageService.setItem('lastStudy', JSON.stringify($scope.correlationObject));
            
            if($scope.correlationObject){
                $scope.state.requestParams = {
                    causeVariableName: $scope.correlationObject.causeVariableName,
                    effectVariableName: $scope.correlationObject.effectVariableName
                };
                $scope.state.title = $scope.correlationObject.predictorExplanation;
                if($scope.correlationObject.userId){
                    createUserCharts($scope.state.requestParams);
                }
                return;
            }

            if($rootScope.urlParameters.causeVariableName){
                $scope.state.requestParams.causeVariableName = $rootScope.urlParameters.causeVariableName;
            }

            if($rootScope.urlParameters.effectVariableName){
                $scope.state.requestParams.effectVariableName = $rootScope.urlParameters.effectVariableName;
            }

            if ($rootScope.urlParameters.aggregated) {
                var fallbackToUserStudy = false;
                if($rootScope.user){
                    fallbackToUserStudy = true;
                }
                getAggregateStudy($scope.state.requestParams, fallbackToUserStudy);
            } else {
                var fallbackToAggregateStudy = true;
                getUserStudy($scope.state.requestParams, fallbackToAggregateStudy);
            }

            //chartCorrelationsOverTime();
        };

        function createUserCharts(params) {
            $scope.loadingCharts = true;
            params.includeProcessedMeasurements = true;
            QuantiModo.getPairsDeferred(params).then(function (data) {
                $scope.loadingCharts = false;
                $scope.scatterplotChartConfig = chartService.createScatterPlot(params, data.pairs);
                //$scope.timelineChartConfig = chartService.configureLineChartForPairs(params, pairs);
                //$scope.causeTimelineChartConfig = chartService.configureLineChartForPairs(params, pairs);
                $scope.causeTimelineChartConfig = chartService.processDataAndConfigureLineChart(
                    data.causeProcessedMeasurements, {variableName: params.causeVariableName});
                $scope.effectTimelineChartConfig = chartService.processDataAndConfigureLineChart(
                    data.effectProcessedMeasurements, {variableName: params.effectVariableName});
            });
        }

        var getUserStudy = function (params, fallbackToAggregateStudy) {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            
            correlationService.getUserCorrelations(params).then(function (correlations) {
                $ionicLoading.hide();
                if (correlations[0]) {
                    $scope.correlationObject = correlations[0];
                    localStorageService.setItem('lastStudy', JSON.stringify($scope.correlationObject));
                    $scope.state.title = $scope.correlationObject.predictorExplanation;
                    createUserCharts(params);
                } else {
                    if(!fallbackToAggregateStudy){
                        $scope.state.studyNotFound = true;
                        $scope.state.title = 'Study Not Found';
                    } else {
                        getAggregateStudy(params);
                    }
                }
            }, function (error) {
                console.error(error);
                $ionicLoading.hide();
                if(!fallbackToAggregateStudy){
                    $scope.state.studyNotFound = true;
                    $scope.state.title = 'Study Not Found';
                } else {
                    getAggregateStudy(params);
                }
            });
        };

        var getAggregateStudy = function (params, fallbackToUserStudy) {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            correlationService.getAggregatedCorrelations(params).then(function (correlations) {
                $ionicLoading.hide();
                if (correlations[0]) {
                    $scope.correlationObject = correlations[0];
                    localStorageService.setItem('lastStudy', JSON.stringify($scope.correlationObject));
                    $scope.state.title = $scope.correlationObject.predictorExplanation;
                } else {
                    if(!fallbackToUserStudy){
                        $scope.state.studyNotFound = true;
                        $scope.state.title = 'Study Not Found';
                    } else {
                        getUserStudy(params);
                    }
                }
            }, function (error) {
                $ionicLoading.hide();
                if(!fallbackToUserStudy){
                    $scope.state.studyNotFound = true;
                    $scope.state.title = 'Study Not Found';
                } else {
                    getUserStudy(params);
                }
            });
        };

        var chartCorrelationsOverTime = function () {
            var params = {
                effectVariableName: $scope.correlationObject.effectVariableName,
                causeVariableName: $scope.correlationObject.causeVariableName,
                durationOfAction: 86400,
                doNotGroup: true
            };

            if($scope.correlationObject.userId){
                correlationService.getUserCorrelations(params).then(function(userCorrelations){
                    if(userCorrelations.length > 2){
                        $scope.lineChartConfig = chartService.processDataAndConfigureCorrelationOverTimeChart(userCorrelations);
                        console.debug($scope.lineChartConfig);
                    }
                });
            } else {
                correlationService.getAggregatedCorrelations(params).then(function(aggregatedCorrelations){
                    if(aggregatedCorrelations.length > 2){
                        $scope.lineChartConfig = chartService.processDataAndConfigureCorrelationOverTimeChart(aggregatedCorrelations);
                        console.debug($scope.lineChartConfig);
                    }
                });
            }
        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });
	});