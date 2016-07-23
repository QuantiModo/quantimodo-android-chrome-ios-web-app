angular.module('starter')

	.controller('PredictorsCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading,
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService, $stateParams) {
        
        $scope.loading = true;
        $scope.state = {
            variableName: config.appSettings.primaryOutcomeVariableDetails.name
        };


		$scope.controller_name = "PredictorsCtrl";

        $scope.init = function(){
            $scope.state.correlationObjects = null;
            $scope.state.usersCorrelationObjects = null;
            authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  {analytics.trackView("Predictors Controller");}
            if($stateParams.variableObject){
                $scope.state.variableName = $stateParams.variableObject.name;
            }
            
            if ($stateParams.valence === "positive") {
                $scope.state.title = "Positive Predictors of " + $scope.state.variableName;
                $scope.increasingDecreasing = "INCREASING";
                $scope.increasesDecreases = "increases";
                Bugsnag.context = "positivePredictors";
                $scope.showLoader('Fetching positive predictors...');
                $scope.templateConfirmationUp = '<label><input type="checkbox" ng-model="$parent.notShowConfirmationPositive" class="show-again-checkbox">Don\'t show this again</label>';
                $scope.templateConfirmationDown = '<label><input type="checkbox" ng-model="$parent.notShowConfirmationPositiveDown" class="show-again-checkbox">Don\'t show this again</label>';

                localStorageService.getItem('notShowConfirmationPositive',function(notShowConfirmation){
                    $scope.notShowConfirmationPositive = notShowConfirmation ? JSON.parse(notShowConfirmation) : false;
                });
                localStorageService.getItem('notShowConfirmationPositiveDown',function(notShowConfirmationDown){
                    $scope.notShowConfirmationPositiveDown = notShowConfirmationDown ?
                        JSON.parse(notShowConfirmationDown) : false;
                });
                correlationService.getPositivePredictors($scope.state.variableName)
                    .then(function(correlationObjects){
                        $scope.state.correlationObjects = correlationObjects;
                        correlationService.getUsersPositivePredictors($scope.state.variableName).then(function(correlationObjects){
                            $scope.state.usersCorrelationObjects = correlationObjects;
                        });
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function(){
                        $scope.loading = false;
                        $ionicLoading.hide();
                        console.log('predictorsCtrl: Could not get positive correlations');
                    });
            }
            else if ($stateParams.valence === "negative") {
                $scope.state.title = "Negative Predictors of " + $scope.state.variableName;
                $scope.increasingDecreasing = "DECREASING";
                $scope.increasesDecreases = "decreases";
                Bugsnag.context = "negativePredictors";
                $scope.showLoader('Fetching negative predictors...');
                $scope.templateConfirmationUp = '<label><input type="checkbox" ng-model="$parent.notShowConfirmationNegative" class="show-again-checkbox">Don\'t show this again</label>';
                $scope.templateConfirmationDown = '<label><input type="checkbox" ng-model="$parent.notShowConfirmationNegativeDown" class="show-again-checkbox">Don\'t show this again</label>';
                correlationService.getNegativePredictors($scope.state.variableName)
                    .then(function(correlationObjects){
                        $scope.state.correlationObjects = correlationObjects;
                        correlationService.getUsersNegativePredictors($scope.state.variableName).then(function(correlationObjects){
                            $scope.state.usersCorrelationObjects = correlationObjects;
                        });
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function(){
                        $ionicLoading.hide();
                        $scope.loading = false;
                        console.log('predictorsCtrl: Could not get negative correlations');
                    });
            }
            else {
                $state.go(config.appSettings.defaultState);
            }

        };

        // when downVoted
	    $scope.downVote = function(correlationObject){
            if (correlationObject.userVote !== 0) {
                if (($stateParams.valence === "positive" && !$scope.notShowConfirmationPositiveDown) ||
                    ($stateParams.valence === "negative" && !$scope.notShowConfirmationNegativeDown)) {
                    $ionicPopup.show({
                        title:'Implausible relationship?',
                        subTitle: 'Do you think is is IMPOSSIBLE that ' + correlationObject.cause + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                        scope: $scope,
                        template: $scope.templateConfirmatioDown,
                        buttons:[
                            {text: 'No'},
                            {text: 'Yes',
                                type: 'button-positive',
                                onTap: function(){
                                    if ($stateParams.valence === "positive") {
                                        localStorageService.setItem('notShowConfirmationPositiveDown', JSON.stringify($scope.notShowConfirmationPositiveDown));
                                    }
                                    else {
                                        localStorageService.setItem('notShowConfirmationNegativeDown', JSON.stringify($scope.notShowConfirmationNegativeDown));
                                    }
                                    downVote(correlationObject);
                                }
                            }
                        ]
                    });
                } else {
                    downVote(correlationObject);
                }
            } else {
                deleteVote(correlationObject);
            }
        };

        function downVote(correlationObject){
            var vote = 0;
            correlationService.vote(vote, correlationObject.cause, correlationObject.effect, correlationObject.correlationCoefficient)
                .then(function () {
                    correlationObject.userVote = vote;
                    utilsService.showAlert('Down voted!');
                }, function () {
                    utilsService.showAlert('Down vote failed !');
                });
        }

	    // when upVoted
	    $scope.upVote = function(correlationObject){
            if (correlationObject.userVote !== 1) {
                if (($stateParams.valence === "positive" && !$scope.notShowConfirmationPositive) ||
                    ($stateParams.valence === "negative" && !$scope.notShowConfirmationNegative)) {
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
                                    if ($stateParams.valence === "positive") {
                                        localStorageService.setItem('notShowConfirmationPositive',JSON.stringify($scope.notShowConfirmationPositive));
                                    }
                                    else {
                                        localStorageService.setItem('notShowConfirmationNegative',JSON.stringify($scope.notShowConfirmationNegative));
                                    }
                                    upVote(correlationObject);
                                }
                            }
                        ]
                    });
                } else {
                    upVote(correlationObject);
                }
            }
            else {
                deleteVote(correlationObject);
            }

	    };

        function upVote(correlationObject){
            var vote = 1; // true
            correlationService.vote(vote, correlationObject.cause, correlationObject.effect, correlationObject.correlationCoefficient)
                .then(function () {
                    correlationObject.userVote = vote;
                    utilsService.showAlert('Upvoted!');
                }, function () {
                    utilsService.showAlert('Upvote Failed!');

                });
        }

        function deleteVote(correlationObject) {
            correlationService.deleteVote(correlationObject.cause, correlationObject.effect, correlationObject.correlationCoefficient)
                .then(function () {
                    correlationObject.userVote = null;
                    utilsService.showAlert('Vote Undone!');
                }, function () {
                    console.error('Undo Vote Failed!');
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
        $scope.$on('$ionicView.enter', function(e){
            $scope.init();
        });
	});