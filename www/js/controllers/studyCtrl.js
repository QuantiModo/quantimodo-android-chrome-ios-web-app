angular.module('starter')
	.controller('StudyCtrl', function($scope, $state, QuantiModo, $stateParams, $ionicHistory, $rootScope,
                                      correlationService, chartService, $timeout, $ionicLoading) {

		$scope.controller_name = "StudyCtrl";
        
        $scope.init = function(){

            $rootScope.getAllUrlParams();
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state = {
                title: 'Loading study...',
                requestParams: {}
            };
            
            $scope.correlationObject = $stateParams.correlationObject;
            
            if($scope.correlationObject){
                $scope.state.title = $scope.correlationObject.predictorExplanation;
                return;
            }

            if($rootScope.urlParameters.causeVariableName){
                $scope.state.requestParams.causeVariableName = $rootScope.urlParameters.causeVariableName;
            }

            if($rootScope.urlParameters.effectVariableName){
                $scope.state.requestParams.effectVariableName = $rootScope.urlParameters.effectVariableName;
            }

            if ($rootScope.urlParameters.aggregated || !$rootScope.user) {
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

        var getUserStudy = function (params, fallbackToAggregateStudy) {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            correlationService.getUserCorrelations(params).then(function (correlations) {
                $ionicLoading.hide();
                if (correlations[0]) {
                    $scope.correlationObject = correlations[0];
                    $scope.state.title = $scope.correlationObject.predictorExplanation;
                } else {
                    if(!fallbackToAggregateStudy){
                        $scope.state.studyNotFound = true;
                        $scope.state.title = 'Study Not Found';
                    } else {
                        getAggregateStudy(params);
                    }
                }
            }, function (error) {
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
                        windowResize();
                    }
                });
            } else {
                correlationService.getAggregatedCorrelations(params).then(function(aggregatedCorrelations){
                    if(aggregatedCorrelations.length > 2){
                        $scope.lineChartConfig = chartService.processDataAndConfigureCorrelationOverTimeChart(aggregatedCorrelations);
                        console.debug($scope.lineChartConfig);
                        windowResize();
                    }
                });
            }
        };

        var windowResize = function() {
            $(window).resize();

            // Not sure what this does
            var seconds = 0.1;
            console.debug('Setting windowResize timeout for ' + seconds + ' seconds');
            $timeout(function() {
                $scope.$broadcast('highchartsng.reflow');
            }, seconds * 1000);
            // Fixes chart width
            $scope.$broadcast('highchartsng.reflow');
        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });
	});