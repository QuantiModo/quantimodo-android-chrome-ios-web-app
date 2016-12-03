angular.module('starter')
	.controller('StudyCtrl', function($scope, $state, QuantiModo, $stateParams, $ionicHistory, $rootScope,
                                      correlationService, chartService, $timeout, $ionicLoading, localStorageService,
                                      wikipediaFactory, $ionicActionSheet) {

		$scope.controller_name = "StudyCtrl";
        $rootScope.showFilterBarSearchIcon = false;

        $scope.getStudy = function() {
            if ($rootScope.urlParameters.aggregated) {
                var fallbackToUserStudy = false;
                if ($rootScope.user) {
                    fallbackToUserStudy = true;
                }
                getAggregateStudy($scope.state.requestParams, fallbackToUserStudy);
                //addWikipediaInfo();
            } else {
                var fallbackToAggregateStudy = true;
                getUserStudy(fallbackToAggregateStudy);
                //addWikipediaInfo();
            }
        };

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

            if($stateParams.correlationObject){
                $scope.correlationObject = $stateParams.correlationObject;
                localStorageService.setItem('lastStudy', JSON.stringify($scope.correlationObject));
            }
            
            if($scope.correlationObject){
                $scope.state.requestParams = {
                    causeVariableName: $scope.correlationObject.causeVariableName,
                    effectVariableName: $scope.correlationObject.effectVariableName
                };
                $scope.state.title = $scope.correlationObject.predictorExplanation;
                //addWikipediaInfo();
                if($scope.correlationObject.userId){
                    getPairsAndCreateUserCharts($scope.state.requestParams);
                }
                return;
            }

            if($rootScope.urlParameters.causeVariableName){
                $scope.state.requestParams.causeVariableName = $rootScope.urlParameters.causeVariableName;
            }

            if($rootScope.urlParameters.effectVariableName){
                $scope.state.requestParams.effectVariableName = $rootScope.urlParameters.effectVariableName;
            }

            if(!$scope.state.requestParams.effectVariableName){
                $scope.correlationObject = localStorageService.getItemAsObject('lastStudy');
                $scope.state.requestParams = {
                    causeVariableName: $scope.correlationObject.causeVariableName,
                    effectVariableName: $scope.correlationObject.effectVariableName
                };
                $scope.state.title = $scope.correlationObject.predictorExplanation;
                //addWikipediaInfo();
                if($scope.correlationObject.userId){
                    var data;
                    //We shouldn't cache because they don't update after we change settings
                    //data = localStorageService.getItemAsObject('lastPairsData');
                    if(data){
                        createUserCharts(data);
                    } else {
                        getPairsAndCreateUserCharts($scope.state.requestParams);
                    }
                }
            } else {
                $scope.getStudy();
            }

            //chartCorrelationsOverTime();
        };

        function addWikipediaInfo() {
            $scope.causeWikiEntry = null;
            $scope.causeWikiImage = null;
            $scope.effectWikiEntry = null;
            $scope.effectWikiImage = null;

            var causeSearchTerm = $scope.correlationObject.causeVariableCommonAlias;
            if(!causeSearchTerm){
                causeSearchTerm = $scope.state.requestParams.causeVariableName;
            }

            wikipediaFactory.searchArticlesByTitle({
                term: causeSearchTerm, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: '1', // (optional) 'max': extracts for all articles, otherwise only for the first
                exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (causeData) {
                if(causeData.data.query) {
                    $scope.causeWikiEntry = causeData.data.query.pages[0].extract;
                    //$scope.correlationObject.studyBackground = $scope.correlationObject.studyBackground + '<br>' + $scope.causeWikiEntry;
                    if(causeData.data.query.pages[0].thumbnail){
                        $scope.causeWikiImage = causeData.data.query.pages[0].thumbnail.source;
                    }
                    //on success
                } else {
                    var error = 'Wiki not found for ' + causeSearchTerm;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                    console.error(error);
                }
            }).catch(function (error) {
                console.error(error);
                //on error
            });

            var effectSearchTerm = $scope.correlationObject.effectVariableCommonAlias;
            if(!effectSearchTerm){
                effectSearchTerm = $scope.state.requestParams.effectVariableName;
            }

            wikipediaFactory.searchArticlesByTitle({
                term: effectSearchTerm, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: '1', // (optional) 'max': extracts for all articles, otherwise only for the first
                exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (effectData) {
                if(effectData.data.query){
                    $scope.effectWikiEntry = effectData.data.query.pages[0].extract;
                    //$scope.correlationObject.studyBackground = $scope.correlationObject.studyBackground + '<br>' + $scope.effectWikiEntry;
                    if(effectData.data.query.pages[0].thumbnail){
                        $scope.effectWikiImage = effectData.data.query.pages[0].thumbnail.source;
                    }

                } else {
                    var error = 'Wiki not found for ' + effectSearchTerm;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                    console.error(error);
                }

                //on success
            }).catch(function (error) {
                console.error(error);
                //on error
            });
        }

        function createUserCharts(data) {
            $scope.loadingCharts = false;
            $scope.scatterplotChartConfig = chartService.createScatterPlot($scope.state.requestParams, data.pairs);
            //$scope.timelineChartConfig = chartService.configureLineChartForPairs(params, pairs);
            //$scope.causeTimelineChartConfig = chartService.configureLineChartForPairs(params, pairs);
            $scope.causeTimelineChartConfig = chartService.processDataAndConfigureLineChart(
                data.causeProcessedMeasurements, {variableName: $scope.state.requestParams.causeVariableName});
            $scope.effectTimelineChartConfig = chartService.processDataAndConfigureLineChart(
                data.effectProcessedMeasurements, {variableName: $scope.state.requestParams.effectVariableName});
            $scope.correlationOverTimeChartConfig =
                chartService.processDataAndConfigureCorrelationOverTimeChart(data.correlationsOverTime);
            $scope.pairsOverTimeChartConfig =
                chartService.processDataAndConfigurePairsOverTimeChart(data.pairs, $scope.state.requestParams);
            $scope.highchartsReflow();
        }

        function getPairsAndCreateUserCharts() {
            $scope.loadingCharts = true;
            $scope.state.requestParams.includeProcessedMeasurements = true;
            QuantiModo.getPairsDeferred($scope.state.requestParams).then(function (data) {
                //We shouldn't cache because they don't update after we change settings
                //localStorageService.setItem('lastPairsData', JSON.stringify(data));
                createUserCharts(data);
            });
        }


        var getUserStudy = function (fallbackToAggregateStudy) {
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            
            correlationService.getUserCorrelations($scope.state.requestParams).then(function (correlations) {
                $ionicLoading.hide();
                if (correlations[0]) {
                    $scope.correlationObject = correlations[0];
                    localStorageService.setItem('lastStudy', JSON.stringify($scope.correlationObject));
                    $scope.state.title = $scope.correlationObject.predictorExplanation;
                    getPairsAndCreateUserCharts();
                } else {
                    if(!fallbackToAggregateStudy){
                        $scope.state.studyNotFound = true;
                        $scope.state.title = 'Study Not Found';
                    } else {
                        getAggregateStudy();
                    }
                }
            }, function (error) {
                console.error(error);
                $ionicLoading.hide();
                if(!fallbackToAggregateStudy){
                    $scope.state.studyNotFound = true;
                    $scope.state.title = 'Study Not Found';
                } else {
                    getAggregateStudy();
                }
            });
        };

        var getAggregateStudy = function (fallbackToUserStudy) {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            correlationService.getAggregatedCorrelations($scope.state.requestParams).then(function (correlations) {
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
                        getUserStudy();
                    }
                }
            }, function (error) {
                $ionicLoading.hide();
                if(!fallbackToUserStudy){
                    $scope.state.studyNotFound = true;
                    $scope.state.title = 'Study Not Found';
                } else {
                    getUserStudy();
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
                correlationService.getUserCorrelations($scope.state.requestParams).then(function(userCorrelations){
                    if(userCorrelations.length > 2){
                        $scope.lineChartConfig = chartService.processDataAndConfigureCorrelationOverTimeChart(userCorrelations);
                        console.debug($scope.lineChartConfig);
                        $scope.highchartsReflow();
                    }
                });
            } else {
                correlationService.getAggregatedCorrelations($scope.state.requestParams).then(function(aggregatedCorrelations){
                    if(aggregatedCorrelations.length > 2){
                        $scope.lineChartConfig = chartService.processDataAndConfigureCorrelationOverTimeChart(aggregatedCorrelations);
                        console.debug($scope.lineChartConfig);
                        $scope.highchartsReflow();
                    }
                });
            }
        };

        $rootScope.showActionSheetMenu = function() {

            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-log-in"></i>' + $scope.correlationObject.causeVariableName + ' Settings' },
                    { text: '<i class="icon ion-log-out"></i>' + $scope.correlationObject.effectVariableName + ' Settings' },
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Seems Wrong',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug($state.current.name + ": " + 'CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug($state.current.name + ": " + 'BUTTON CLICKED', index);
                    if(index === 0){
                        $state.go('app.variableSettings',
                            {variableName: $scope.correlationObject.causeVariableName});
                    }
                    if(index === 1){
                        $state.go('app.variableSettings',
                            {variableName: $scope.correlationObject.effectVariableName});
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.downVote();
                    return true;
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });
	});