angular.module('starter')

	.controller('PredictorsCtrl', function($scope, $ionicLoading, $state, $stateParams, $ionicPopup, correlationService,
                                           $rootScope) {

		$scope.controller_name = "PredictorsCtrl";
        $scope.state = {
            requestParams: $stateParams.requestParams,
            variableName: config.appSettings.primaryOutcomeVariableDetails.name,
            increasingDecreasing: '',
            correlationObjects: [],
            showLoadMoreButton: false,
        };

        $scope.data = { "search" : '' };

        $scope.filterSearchQuery = '';

        $scope.searching = true;

        $scope.showSearchFilterBox = false;

        $rootScope.showFilterBarSearchIcon = true;

        $rootScope.toggleFilterBar = function () {
            //$ionicFilterBar.show();
            console.debug('clicked showFilterBar');
            $scope.showSearchFilterBox = !$scope.showSearchFilterBox;
        };

        $scope.filterSearch = function () {

            console.debug($scope.data.search);
            if($scope.outcomeList) {
                $scope.state.correlationObjects = $scope.state.correlationObjects.filter(function( obj ) {
                    return obj.effectVariableName.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1;
                });
            } else {
                $scope.state.correlationObjects = $scope.state.correlationObjects.filter(function( obj ) {
                    return obj.causeVariableName.toLowerCase().indexOf($scope.data.search.toLowerCase()) !== -1;
                });
            }
            if($scope.data.search.length < 4 || $scope.state.correlationObjects.length) {
                return;
            }

            if($scope.outcomeList) {
                $scope.state.requestParams.effectVariableName = '**' + $scope.data.search + '**';
            } else {
                $scope.state.requestParams.causeVariableName = '**' + $scope.data.search + '**';
            }
            $scope.state.requestParams.offset = null;
            populateUserCorrelationList();
        };
        

        function showLoadMoreButtonIfNecessary() {
            if($scope.state.correlationObjects.length &&
                $scope.state.correlationObjects.length%$scope.state.requestParams.limit === 0){
                $scope.state.showLoadMoreButton = true;
            } else {
                $scope.state.showLoadMoreButton = false;
            }
        }

        function populateAggregatedCorrelationList() {
/*            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });*/
            $scope.searching = true;
            setupAggregatedPredictors();
            correlationService.getAggregatedCorrelations($scope.state.requestParams)
                .then(function (correlationObjects) {
                    if(correlationObjects.length) {
                        if($scope.state.requestParams.offset){
                            $scope.state.correlationObjects = $scope.state.correlationObjects.concat(correlationObjects);
                        } else {
                            $scope.state.correlationObjects = correlationObjects;
                        }
                        showLoadMoreButtonIfNecessary();
                        $scope.searching = false;
                        $ionicLoading.hide();
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    } else {
                        correlationService.getUserCorrelations($scope.state.requestParams)
                            .then(function (correlationObjects) {
                                $ionicLoading.hide();
                                $scope.searching = false;
                                $scope.$broadcast('scroll.infiniteScrollComplete');
                                if(correlationObjects.length) {
                                    setupUserPredictors();
                                    $scope.state.explanationText = "Unfortunately, I don't have enough data get common " +
                                        " predictors for " + $rootScope.variableName + ", yet. " + $scope.state.explanationText;
                                    if($scope.state.requestParams.offset){
                                        $scope.state.correlationObjects = $scope.state.correlationObjects.concat(correlationObjects);
                                    } else {
                                        $scope.state.correlationObjects = correlationObjects;
                                    }
                                    showLoadMoreButtonIfNecessary();
                                } else {
                                    $scope.state.noCorrelations = true;
                                }
                                
                            });
                    }

                }, function (error) {
                    $ionicLoading.hide();
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.searching = false;
                    console.error('predictorsCtrl: Could not get correlations: ' + JSON.stringify(error));
                });
        }

/*
        Keeps getting called all the time for no reason
        $scope.$on('$stateChangeSuccess', function() {
            $scope.loadMore();
        });
*/


        function populateUserCorrelationList() {
/*            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });*/
            $scope.searching = true;
            setupUserPredictors();
            if(typeof $scope.state.requestParams.fallbackToAggregatedCorrelations === "undefined"){
                $scope.state.requestParams.fallbackToAggregatedCorrelations = true;
            }

            correlationService.getUserCorrelations($scope.state.requestParams)
                .then(function (correlationObjects) {
                    if(correlationObjects.length) {
                        if($scope.state.requestParams.offset){
                            $scope.state.correlationObjects = $scope.state.correlationObjects.concat(correlationObjects);
                        } else {
                            $scope.state.correlationObjects = correlationObjects;
                        }
                        if(!$scope.state.correlationObjects[0].userId){
                            setupAggregatedPredictors();
                            $scope.state.explanationText = "Unfortunately, I don't have enough data from you to get " +
                                "your personal predictors for " + $rootScope.variableName + ", yet. " + $scope.state.explanationText;
                        }
                        showLoadMoreButtonIfNecessary();
                    } else {
                        $scope.state.noCorrelations = true;
                    }
                    $ionicLoading.hide();
                    $scope.searching = false;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }, function (error) {
                    $ionicLoading.hide();
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.searching = false;
                    console.error('predictorsCtrl: Could not get correlations: ' + JSON.stringify(error));
                });
        }

        $scope.loadMore = function () {
            if($scope.state.correlationObjects.length){
                $scope.state.requestParams.offset = $scope.state.requestParams.offset + $scope.state.requestParams.limit;
                populateUserCorrelationList();
            }
        };
        
        $scope.refreshList = function () {
            $scope.state.requestParams.offset = 0;
            correlationService.clearCorrelationCache();
            $scope.init();
        };

        function setupUserPredictors() {
            if($scope.state.requestParams.effectVariableName){
                $scope.state.explanationHeader = "Your Top Predictors";
                $scope.state.explanationIcon = "ion-ios-person";
                $scope.state.explanationText = 'These factors are most predictive of ' + $scope.state.increasingDecreasing +
                    ' your ' + $rootScope.variableName + ' based on your own data.  ' +
                    'Want more accurate results? Add some reminders and start tracking!';
            } else {
                setupUserOutcomes();
            }
        }

        function setupAggregatedPredictors() {
            if($scope.state.requestParams.effectVariableName){
                $scope.state.explanationHeader = "Common Predictors";
                $scope.state.explanationIcon = "ion-ios-people";
                $scope.state.explanationText = 'These factors are most predictive of ' + $scope.state.increasingDecreasing +
                    ' ' + $rootScope.variableName + ' for the average QuantiModo user.  ' +
                'Want PERSONALIZED results? Add some reminders and start tracking!';
            } else {
                setupAggregatedOutcomes();
            }
        }

        function setupUserOutcomes() {
            $scope.state.explanationHeader = "Your Top Outcomes";
            $scope.state.explanationIcon = "ion-ios-person";
            $scope.state.explanationText = 'These are the outcomes most likely to be influenced by ' + $scope.state.increasingDecreasing +
                ' your ' + $rootScope.variableName + ' based on your own data.  ' +
                'Want more accurate results? Add some reminders and start tracking!';
        }

        function setupAggregatedOutcomes() {
            $scope.state.explanationHeader = "Common Outcomes";
            $scope.state.explanationIcon = "ion-ios-people";
            $scope.state.explanationText = 'These are the outcomes most likely to be influenced by ' + $scope.state.increasingDecreasing +
                ' ' + $rootScope.variableName + ' for the average QuantiModo user.  ' +
                'Want PERSONALIZED results? Add some reminders and start tracking!';
        }

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.getAllUrlParams();
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }

            if($rootScope.urlParameters.aggregated){
                $stateParams.aggregated = $rootScope.urlParameters.aggregated;
            }

            if($stateParams.requestParams){
                $scope.state.requestParams = $stateParams.requestParams;
            }
            
            if($rootScope.urlParameters.causeVariableName){
                $scope.state.requestParams.causeVariableName = $rootScope.urlParameters.causeVariableName;
            }

            if($rootScope.urlParameters.effectVariableName){
                $scope.state.requestParams.effectVariableName = $rootScope.urlParameters.effectVariableName;
            }

            if(!$scope.state.requestParams.causeVariableName && ! $scope.state.requestParams.effectVariableName) {
                $scope.state.requestParams.effectVariableName = config.appSettings.primaryOutcomeVariableDetails.name;
            }

            $scope.state.requestParams.offset = 0;
            $scope.state.requestParams.limit = 10;

            if ($scope.state.requestParams.causeVariableName){
                $rootScope.variableName = $scope.state.requestParams.causeVariableName;
                $scope.outcomeList = true;
                $scope.searchFilterBoxPlaceholderText = "Filter by specific outcome";
            }

            if ($scope.state.requestParams.effectVariableName) {
                $rootScope.variableName = $scope.state.requestParams.effectVariableName;
                $scope.predictorList = true;
                $scope.searchFilterBoxPlaceholderText = "Filter by specific predictor";
            }

            if($scope.state.requestParams.effectVariableName){
                if($stateParams.valence === 'positive'){
                    $scope.state.increasingDecreasing = 'INCREASING';
                    $scope.state.requestParams.correlationCoefficient = "(gt)0";
                    $scope.state.title = "Positive Predictors";
                } else if($stateParams.valence === 'negative'){
                    $scope.state.increasingDecreasing = 'DECREASING';
                    $scope.state.requestParams.correlationCoefficient = "(lt)0";
                    $scope.state.title = "Negative Predictors";
                } else {
                    $scope.state.title = "Predictors";
                }
            } else {
                $scope.state.title = "Outcomes";
            }


            if($stateParams.aggregated){
                populateAggregatedCorrelationList();
            } else {
                populateUserCorrelationList();
            }
        };

        // open store in inAppbrowser
	    $scope.openStore = function(name){
            console.debug("open store for ", name);
	    	// make url
	    	name = name.split(' ').join('+');
            // launch inAppBrowser

            var url  = 'http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k=' + name;
            $scope.openUrl(url);
	    };

        $scope.showLoader = function (loadingText) {
            if(!loadingText){
                loadingText = '';
            }
            $scope.loading = true;
            $ionicLoading.show({
                template: loadingText + '<br><br><img src={{loaderImagePath}}>',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 1000,
                showDelay: 0
            });
        };

        $scope.goToStudyPage = function(correlationObject) {
            //console.debug('Going to study page for ' + JSON.stringify(correlationObject));
            $state.go('app.study', {
                correlationObject: correlationObject
            });
        };

        // when view is changed
        $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });

	});