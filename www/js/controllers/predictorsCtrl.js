angular.module('starter')

	.controller('PredictorsCtrl', function($scope, $ionicLoading, $state, $stateParams, $ionicPopup, correlationService,
                                           authService) {

		$scope.controller_name = "PredictorsCtrl";
        $scope.state = {
            requestParams: {
                cause: null,
                effect: config.appSettings.primaryOutcomeVariableDetails.name
            },
            variableObject: null
        };

        function showPositivePredictors() {
            $scope.state.title = "Positive Predictors of " + $stateParams.variableObject.name;
            $scope.increasingDecreasing = "INCREASING";
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.context = "positivePredictors";
            }
            $scope.showLoader('Fetching positive predictors...');
        }

        function showNegativePredictors() {
            $scope.state.title = "Negative Predictors of " + $stateParams.variableObject.name;
            $scope.increasingDecreasing = "DECREASING";
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.context = "negativePredictors";
            }
            $scope.showLoader('Fetching negative predictors...');
        }

        function showPredictors() {
            $scope.state.title = "Predictors of " + $stateParams.variableObject.name;
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.context = "predictors";
            }
            $scope.showLoader('Fetching predictors...');

        }

        function showOutcomes() {
            $scope.state.title = "Likely Outcomes of " + $stateParams.variableObject.name;
            if (typeof Bugsnag !== "undefined") {
                Bugsnag.context = "outcomes";
            }
            $scope.showLoader('Fetching outcomes...');
        }

        $scope.init = function(){
            $scope.state.correlationObjects = null;
            $scope.state.usersCorrelationObjects = null;
            if(!$stateParams.variableObject){
                $stateParams.variableObject = config.appSettings.primaryOutcomeVariableDetails;
            }
            if($stateParams.requestParams.cause || $stateParams.requestParams.effect){
                $scope.state.requestParams = $stateParams.requestParams;
            }
            if($stateParams.valence === 'positive'){
                $scope.state.requestParams.correlationCoefficient = "(gt)0";
            }
            if($stateParams.valence === 'negative'){
                $scope.state.requestParams.correlationCoefficient = "(lt)0";
            }
            $scope.state.variableObject = $stateParams.variableObject;
            authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  {analytics.trackView("Predictors Controller");}
            if($scope.state.requestParams.effect){
                if ($scope.state.requestParams.correlationCoefficient === "(lt)0") {
                    showNegativePredictors();
                } else if ($scope.state.requestParams.correlationCoefficient === "(gt)0") {
                    showPositivePredictors();
                } else{
                    showPredictors();
                }
            } else if ($scope.state.requestParams.cause){
                showOutcomes();
            } else {
                console.error("Please provide a $stateParams.requestParams.cause or $scope.state.requestParams.effect variable name.");
            }

            correlationService.getAggregatedCorrelations($scope.state.requestParams)
                .then(function(correlationObjects){
                    $scope.state.correlationObjects = correlationObjects;
                    correlationService.getUserCorrelations($scope.state.requestParams)
                        .then(function(correlationObjects){
                            $scope.state.usersCorrelationObjects = correlationObjects;
                        });
                    $ionicLoading.hide();
                    $scope.hideLoader();
                }, function(){
                    $ionicLoading.hide();
                    $scope.hideLoader();
                    console.error('predictorsCtrl: Could not get correlations');
                });
        };

	    $scope.downVote = function(correlationObject, $index, userOrPublic){
            if (correlationObject.correlationCoefficient > 0) {
                $scope.increasesDecreases = "increases";
            } else {
                $scope.increasesDecreases = "decreases";
            }

            if (correlationObject.userVote !== 0) {
                $ionicPopup.show({
                    title:'Implausible relationship?',
                    subTitle: 'Do you think is is IMPOSSIBLE that ' + correlationObject.cause + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                    scope: $scope,
                    template: $scope.templateConfirmationDown,
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                downVote(correlationObject, $index, userOrPublic);
                            }
                        }
                    ]
                });
            } else {
                deleteVote(correlationObject, $index, userOrPublic);
            }
        };

        function downVote(correlationObject, $index, userOrPublic){
            if(userOrPublic === 'user'){
                $scope.state.usersCorrelationObjects[$index].userVote = 0;
            } else {
                $scope.state.correlationObjects[$index].userVote = 0;
            }
            correlationObject.vote = 0;
            correlationService.vote(correlationObject)
                .then(function () {
                    console.debug('Down voted!');
                }, function () {
                    console.error('Down vote failed!');
                });
        }

	    $scope.upVote = function(correlationObject, $index, userOrPublic){
            if (correlationObject.correlationCoefficient > 0) {
                $scope.increasesDecreases = "increases";
            } else {
                $scope.increasesDecreases = "decreases";
            }
            if (correlationObject.userVote !== 1) {
                $ionicPopup.show({
                    title:'Plausible relationship?',
                    subTitle: 'Do you think it is POSSIBLE that '+ correlationObject.cause + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                    scope: $scope,
                    template: $scope.templateConfirmationUp,
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                upVote(correlationObject, $index, userOrPublic);
                            }
                        }
                    ]
                });
            } else {

                deleteVote(correlationObject, $index, userOrPublic);
            }
	    };

        function upVote(correlationObject, $index, userOrPublic){
            if(userOrPublic === 'user'){
                $scope.state.usersCorrelationObjects[$index].userVote = 1;
            } else {
                $scope.state.correlationObjects[$index].userVote = 1;
            }
            correlationObject.vote = 1;
            correlationService.vote(correlationObject)
                .then(function () {
                    console.debug('upVote');
                }, function () {
                    console.error('upVote failed!');
                });
        }

        function deleteVote(correlationObject, $index, userOrPublic) {
            if(userOrPublic === 'user'){
                $scope.state.usersCorrelationObjects[$index].userVote = null;
            } else {
                $scope.state.correlationObjects[$index].userVote = null;
            }
            correlationService.deleteVote(correlationObject, function(response){
                console.debug("deleteVote response", response);
            }, function(response){
                console.error("deleteVote response", response);
            });
        }

        // open store in inAppbrowser
	    $scope.openStore = function(name){
            console.log("open store for ", name);
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
            $state.go('app.study', {
                correlationObject: correlationObject
            });
        };

        // when view is changed
        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });

        $scope.init();
	});