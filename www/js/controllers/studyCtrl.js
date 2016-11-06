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
                correlationObject: $stateParams.correlationObject,
                title: 'Loading study...'
            };

            if($scope.state.correlationObject){
                $scope.state.title = $scope.state.correlationObject.predictorExplanation;
            }

            if($rootScope.urlParameters.causeVariableId && $rootScope.urlParameters.effectVariableId) {
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                var params = {
                    causeVariableId: $rootScope.urlParameters.causeVariableId,
                    effectVariableId: $rootScope.urlParameters.effectVariableId
                };

                if (!$rootScope.urlParameters.aggregated) {
                    correlationService.getUserCorrelations(params).then(function (correlations) {
                        if (correlations[0]) {
                            $scope.state.correlationObject = correlations[0];
                            $scope.state.title = $scope.state.correlationObject.predictorExplanation;
                        }
                        $ionicLoading.hide();
                    }, function (error) {
                        $ionicLoading.hide();
                        alert('Could not find this study!  Error: ' + error);
                        $ionicHistory.goBack();
                    });
                }

                if ($rootScope.urlParameters.aggregated) {
                    correlationService.getAggregatedCorrelations(params).then(function (correlations) {
                        if (correlations[0]) {
                            $scope.state.correlationObject = correlations[0];
                            $scope.state.title = $scope.state.correlationObject.predictorExplanation;
                        }
                        $ionicLoading.hide();
                    }, function (error) {
                        $ionicLoading.hide();
                        alert('Could not find this study!  Error: ' + error);
                        $ionicHistory.goBack();
                    });
                }
            }

            if(!$scope.state.correlationObject && !$rootScope.urlParameters.causeVariableId) {
                $ionicHistory.goBack();
            }

            //chartCorrelationsOverTime();
        };

        var chartCorrelationsOverTime = function () {
            var params = {
                effectVariableName: $scope.state.correlationObject.effectVariableName,
                causeVariableName: $scope.state.correlationObject.causeVariableName,
                durationOfAction: 86400,
                doNotGroup: true
            };

            if($scope.state.correlationObject.userId){
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