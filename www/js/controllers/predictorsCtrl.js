angular.module('starter')
	
	// Controls the Positive Factors page
	.controller('PredictorsCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading,
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService, $stateParams) {
        
        $scope.loading = true;

        if(!$rootScope.user){
            console.debug("predictorsCtrl: not logged in, going to default state");
            $state.go(config.appSettings.defaultState);
            // app wide signal to sibling controllers that the state has changed
            $rootScope.$broadcast('transition');
        }
        
        if ($stateParams.valence === "positive") {
            $scope.title = "Positive Predictors";
        }
        else {
            $scope.title = "Negative Predictors";
        }
        
		$scope.controller_name = "PredictorsCtrl";

        $scope.init = function(){
            if ($stateParams.valence === "positive") {
                $scope.valence = true;
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

            }
            else if ($stateParams.valence === "negative") {
                $scope.valence = false;
                $scope.increasingDecreasing = "DECREASING";
                $scope.increasesDecreases = "decreases";
                Bugsnag.context = "negativePredictors";
                $scope.showLoader('Fetching negative predictors...');
                $scope.templateConfirmationUp = '<label><input type="checkbox" ng-model="$parent.notShowConfirmationNegative" class="show-again-checkbox">Don\'t show this again</label>';
                $scope.templateConfirmationDown = '<label><input type="checkbox" ng-model="$parent.notShowConfirmationNegativeDown" class="show-again-checkbox">Don\'t show this again</label>';

                /*
                localStorageService.getItem('notShowConfirmationNegative', function (notShowConfirmation) {
                    $scope.notShowConfirmationNegative = notShowConfirmation ? JSON.parse(notShowConfirmation) : false;
                });
                localStorageService.getItem('notShowConfirmationNegativeDown', function (notShowConfirmationDown) {
                    $scope.notShowConfirmationNegativeDown = notShowConfirmationDown ?
                        JSON.parse(notShowConfirmationDown) : false;
                });
                */
            }
            else {
                // go to default state
                $state.go(config.appSettings.defaultState);
            }
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  {
                analytics.trackView("Predictors Controller");
            }
            if(isAuthorized){
                if ($scope.valence) {
                    correlationService.getPositiveFactors()
                        .then(function(correlationObjects){
                            $scope.factors = correlationObjects;
                            correlationService.getUsersPositiveFactors().then(function(correlationObjects){
                                $scope.usersFactors = correlationObjects;
                            });
                            $ionicLoading.hide();
                            $scope.loading = false;
                        }, function(){
                            $scope.loading = false;
                            $ionicLoading.hide();
                            console.log('predictorsCtrl: Could not get positive correlations');
                        });
                }
                else {
                    correlationService.getNegativeFactors()
                        .then(function(correlationObjects){
                            $scope.factors = correlationObjects;
                            correlationService.getUsersNegativeFactors().then(function(correlationObjects){
                                $scope.usersFactors = correlationObjects;
                            });
                            $ionicLoading.hide();
                            $scope.loading = false;
                        }, function(){
                            $ionicLoading.hide();
                            $scope.loading = false;
                            console.log('predictorsCtrl: Could not get negative correlations');
                        });
                }

            }
        };

        // when downVoted
	    $scope.downVote = function(factor){
            if (factor.userVote !== 0) {
                if (($scope.valence && !$scope.notShowConfirmationPositiveDown) ||
                    (!$scope.valence && !$scope.notShowConfirmationNegativeDown)) {
                    $ionicPopup.show({
                        title:'Voting thumbs down indicates',
                        subTitle: 'you disagree that ' + factor.cause + ' ' + $scope.increasesDecreases + ' your ' + factor.effect + '.',
                        scope: $scope,
                        template: $scope.templateConfirmatioDown,
                        buttons:[
                            {text: 'Cancel'},
                            {text: 'Disagree',
                                type: 'button-positive',
                                onTap: function(){
                                    if ($scope.valence) {
                                        localStorageService.setItem('notShowConfirmationPositiveDown', JSON.stringify($scope.notShowConfirmationPositiveDown));
                                    }
                                    else {
                                        localStorageService.setItem('notShowConfirmationNegativeDown', JSON.stringify($scope.notShowConfirmationNegativeDown));
                                    }
                                    downVote(factor);
                                }
                            }
                        ]
                    });
                } else {
                    downVote(factor);
                }
            } else {
                deleteVote(factor);
            }
        };

        function downVote(factor){
            // params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 0;
            var correlationCoefficient = factor.correlationCoefficient;

            // call service method for voting
            if($rootScope.user) {
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function () {
                        factor.userVote = vote;
                        utilsService.showAlert('Down voted!');
                    }, function () {
                        utilsService.showAlert('Down vote failed !');
                    });
            } else {
                console.debug("predictorsCtrl: not logged in, going to default state");
                $state.go(config.appSettings.defaultState);
            }
        }

	    // when upVoted
	    $scope.upVote = function(factor){
            if (factor.userVote !== 1) {
                if (($scope.valence && !$scope.notShowConfirmationPositive) ||
                    (!$scope.valence && !$scope.notShowConfirmationNegative)) {
                    $ionicPopup.show({
                        title:'Voting thumbs up indicates',
                        subTitle: 'you agree that '+ factor.cause + ' ' + $scope.increasesDecreases + ' your ' + factor.effect + '.',
                        scope: $scope,
                        template: $scope.templateConfirmationUp,
                        buttons:[
                            {text: 'Cancel'},
                            {text: 'Agree',
                                type: 'button-positive',
                                onTap: function(){
                                    if ($scope.valence) {
                                        localStorageService.setItem('notShowConfirmationPositive',JSON.stringify($scope.notShowConfirmationPositive));
                                    }
                                    else {
                                        localStorageService.setItem('notShowConfirmationNegative',JSON.stringify($scope.notShowConfirmationNegative));
                                    }
                                    upVote(factor);
                                }
                            }
                        ]
                    });
                } else {
                    upVote(factor);
                }
            }
            else {
                deleteVote(factor);
            }

	    };

        function upVote(factor){
            if ($rootScope.user) {
                // params
                var cause = factor.cause;
                var effect = factor.effect;
                var correlationCoefficient = factor.correlationCoefficient;
                var vote = 1; // true

                // call service method for voting
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function () {
                        factor.userVote = vote;
                        utilsService.showAlert('Upvoted!');
                    }, function () {
                        utilsService.showAlert('Upvote Failed!');

                    });
            } else {
                console.debug("predictorsCtrl: not logged in, going to default state");
                $state.go(config.appSettings.defaultState);
            }

        }

        function deleteVote(factor) {
            if ($rootScope.user) {
                // params
                var cause = factor.cause;
                var effect = factor.effect;
                var correlationCoefficient = factor.correlationCoefficient;

                // call service method for voting
                correlationService.deleteVote(cause, effect, correlationCoefficient)
                    .then(function () {
                        factor.userVote = null;
                        utilsService.showAlert('Vote Undone!');
                    }, function () {
                        utilsService.showAlert('Undo Vote Failed!');

                    });
            } else {
                console.debug("predictorsCtrl: not logged in, going to default state");
                $state.go(config.appSettings.defaultState);
            }
        }

        // open store in inAppbrowser
	    $scope.openStore = function(name){
            console.log("open store for ", name);
	    	// make url
	    	name = name.split(' ').join('+');
            // launch inAppBrowser
            window.open('http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k='+name, '_blank', 'location=no');
	    };

        // Where is this used?
        $scope.changePage = function(){
            if ($scope.valence) {
                $state.go('app.predictors', {
                    valence: "negative"
                });
            }
            else {
                $state.go('app.predictors', {
                    valence: "positive"
                });
            }
            $state.reload();
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