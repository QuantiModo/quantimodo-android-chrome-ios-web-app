angular.module('starter')

	.controller('PredictorsCtrl', function($scope, $ionicLoading, $state, $stateParams, $ionicPopup, correlationService,
                                           $rootScope) {

		$scope.controller_name = "PredictorsCtrl";
        $scope.state = {
            requestParams: $stateParams.requestParams,
            variableName: config.appSettings.primaryOutcomeVariableDetails.name,
            increasingDecreasing: ''
        };

        function populateAggregatedCorrelationList() {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            setupAggregatedPredictors();
            correlationService.getAggregatedCorrelations($scope.state.requestParams)
                .then(function (correlationObjects) {
                    if(correlationObjects.length) {
                        $scope.state.correlationObjects = correlationObjects;
                        $ionicLoading.hide();
                    } else {
                        correlationService.getUserCorrelations($scope.state.requestParams)
                            .then(function (correlationObjects) {
                                $ionicLoading.hide();
                                if(correlationObjects.length) {
                                    setupUserPredictors();
                                    $scope.state.explanationText = "Unfortunately, I don't have enough data get common " +
                                        " predictors for " + $scope.state.variableName + ", yet. " + $scope.state.explanationText;
                                    $scope.state.correlationObjects = correlationObjects;
                                } else {
                                    $scope.state.noCorrelations = true;
                                }
                                
                            });
                    }

                }, function () {
                    $ionicLoading.hide();
                    console.error('predictorsCtrl: Could not get correlations');
                });
        }

        function populateUserCorrelationList() {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            setupUserPredictors();
            correlationService.getUserCorrelations($scope.state.requestParams)
                .then(function (correlationObjects) {
                    if(correlationObjects.length) {
                        $scope.state.correlationObjects = correlationObjects;
                        $ionicLoading.hide();
                    } else {
                        correlationService.getAggregatedCorrelations($scope.state.requestParams)
                            .then(function (correlationObjects) {
                                $ionicLoading.hide();
                                if(correlationObjects.length) {
                                    setupAggregatedPredictors();
                                    $scope.state.explanationText = "Unfortunately, I don't have enough data from you to get " +
                                        "your personal predictors for " + $scope.state.variableName + ", yet. " + $scope.state.explanationText;
                                    $scope.state.correlationObjects = correlationObjects;
                                } else {
                                    $scope.state.noCorrelations = true;
                                }
                            });
                    }
                }, function () {
                    $ionicLoading.hide();
                    console.error('predictorsCtrl: Could not get correlations');
                });
        }
        
        function setupUserPredictors() {
            $scope.state.explanationHeader = "Your Top Predictors";
            $scope.state.explanationIcon = "ion-ios-person";
            $scope.state.explanationText = 'These factors are most likely to affect ' + $scope.state.increasingDecreasing +
                ' your ' + $scope.state.variableName + ' based on your own data.  ' +
            'Want more accurate results? Add some reminders and start tracking!';
        }

        function setupAggregatedPredictors() {
            $scope.state.explanationHeader = "Common Predictors";
            $scope.state.explanationIcon = "ion-ios-people";
            $scope.state.explanationText = 'These factors are most likely to affect ' + $scope.state.increasingDecreasing +
                ' ' + $scope.state.variableName + ' for the average QuantiModo user.  ' +
            'Want PERSONALIZED results? Add some reminders and start tracking!';
        }

        $scope.goToVariableSettings = function(correlationObject) {
            $state.go('app.variableSettings',
                {variableName: correlationObject.causeVariableName});
        };

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.getAllUrlParams();
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state.correlationObjects = [];

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

            if ($scope.state.requestParams.causeVariableName){
                $scope.state.variableName = $scope.state.requestParams.causeVariableName;
            }

            if ($scope.state.requestParams.effectVariableName) {
                $scope.state.variableName = $scope.state.requestParams.effectVariableName;
            }

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
            window.open('http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k='+name, '_blank', 'location=no');
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
            console.debug('Going to study page for ' + JSON.stringify(correlationObject));
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