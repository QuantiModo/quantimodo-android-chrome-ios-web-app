angular.module('starter')

    // Controls the Negative Factors page
    .controller('NegativeCtrl', function($scope, $ionicModal, $timeout, measurementService,
                                         $ionicLoading, $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService) {

        $scope.loading = true;

        if(!$rootScope.user){
            console.debug("negativeCtrl: not logged in, going to default state");
            $state.go(config.appSettings.defaultState);
            // app wide signal to sibling controllers that the state has changed
            $rootScope.$broadcast('transition');
        }
        
        localStorageService.getItem('notShowConfirmationNegative',function(notShowConfirmation){
            $scope.notShowConfirmationNegative = notShowConfirmation ? JSON.parse(notShowConfirmation) : false;
        });
        
        localStorageService.getItem('notShowConfirmationNegativeDown',function(notShowConfirmationDown){
           $scope.notShowConfirmationNegativeDown = notShowConfirmationDown ?
               JSON.parse(notShowConfirmationDown) : false;
        });

        $scope.controller_name = "NegativeCtrl";
        $scope.negatives = false;
        $scope.usersNegativeFactors = false;
        
        $scope.init = function(){
            Bugsnag.context = "negativePredictors";
            $scope.showLoader('Fetching negative predictors...');
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  { 
                analytics.trackView("Negative Predictors Controller"); 
            }
            if(isAuthorized){
                correlationService.getNegativeFactors()
                    .then(function(correlationObjects){
                        $scope.negatives = correlationObjects;
                        correlationService.getUsersNegativeFactors().then(function(correlationObjects){
                            $scope.usersNegativeFactors = correlationObjects;
                        });
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function(){
                        $ionicLoading.hide();
                        $scope.loading = false;
                        console.log('negativeCtrl: Could not get correlations');
                    });
            } 
        };

        // when downVoted
        $scope.downVote = function(factor) {
            if (!$scope.notShowConfirmationNegativeDown) {
                $ionicPopup.show({
                    title: 'Voting thumbs down indicates',
                    subTitle: 'you disagree that ' + factor.cause + ' decreases your ' + factor.effect + '.',
                    scope: $scope,
                    template: '<label><input type="checkbox" ng-model="$parent.notShowConfirmationNegativeDown" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons: [
                        {text: 'Cancel'},
                        {text: 'Disagree',
                            type: 'button-positive',
                            onTap: function () {
                                localStorageService.setItem('notShowConfirmationNegativeDown', JSON.stringify($scope.notShowConfirmationNegativeDown));
                                downVote(factor);
                            }
                        }
                    ]
                });
            } else {
                downVote(factor);
            }
        };

        function downVote(factor){
        	var prevValue = factor.userVote;
            factor.userVote = 0;
            
            // get params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 0;
            var correlationCoefficient = factor.correlationCoefficient;

            // call service method for voting
            if($rootScope.user){
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function(){
                        utilsService.showAlert('Downvoted!');
                    }, function(){
                        factor.userVote = prevValue;
                        utilsService.showAlert('Downvote Failed!');
                    });
            } else {
                factor.userVote = prevValue;
            	console.debug("negativeCtrl: not logged in, going to default state");
            	$state.go(config.appSettings.defaultState);
            }
        }

        // when upVoted
        $scope.upVote = function(factor){
            if(!$scope.notShowConfirmationNegative){
                $ionicPopup.show({
                    title:'Voting thumbs up indicates',
                    subTitle: 'you agree that '+ factor.cause + ' decreases your ' + factor.effect+'.',
                    scope: $scope,
                    template:'<label><input type="checkbox" ng-model="$parent.notShowConfirmationNegative" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons:[
                        {text: 'Cancel'},
                        {text: 'Agree',
                            type: 'button-positive',
                            onTap: function(){
                                localStorageService.setItem('notShowConfirmationNegative',JSON.stringify($scope.notShowConfirmationNegative));
                                upVote(factor);
                            }
                        }
                    ]
                });
            } else {
                upVote(factor);
            }
        };

        function upVote(factor){
        	var prevValue = factor.userVote;
            factor.userVote = 1;
        
            // params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 1;
            var correlationCoefficient = factor.correlationCoefficient;

            if($rootScope.user){
                // call service method for voting
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function(){
                        utilsService.showAlert('Upvoted!');
                    }, function(){
                    	factor.userVote = prevValue;
                        utilsService.showAlert('Upvote Failed!');
                    });
            } else {
				factor.userVote = prevValue;
            	console.debug("negativeCtrl: not logged in, going to default state");
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

        $scope.changePage = function(){
            $state.go('app.positive');
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
        
        // when view is changed
        $scope.$on('$ionicView.enter', function(e){
            $scope.init();
        });
    });