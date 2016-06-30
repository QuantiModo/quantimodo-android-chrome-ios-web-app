angular.module('starter')
	
	// Controls the Positive Factors page
	.controller('PositiveCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading, 
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService, authService) {


        $scope.loading = true;

        if(!$rootScope.user){
        	/*
        	console.debug("postiveCtrl going to welcome state");
            $state.go(config.appSettings.welcomeState);
            */
            console.debug("positiveCtrl: not logged in, going to default state");
            $state.go(config.appSettings.defaultState);
            // app wide signal to sibling controllers that the state has changed
            $rootScope.$broadcast('transition');
        }
        
         localStorageService.getItem('notShowConfirmationPositive',function(val){
             $scope.notShowConfirmationPositive = val ? JSON.parse(val) : false;
         });

        localStorageService.getItem('notShowConfirmationPositive',function(val){
            $scope.notShowConfirmationPositiveDown = val ? JSON.parse(val) : false;
        });        

		$scope.controller_name = "PositiveCtrl";
        $scope.positives = false;
        $scope.usersPositiveFactors = false;

	    $scope.downVote = function(factor){

            if(!$scope.notShowConfirmationPositiveDown){
                $ionicPopup.show({
                    title:'Voting thumbs down indicates',
                    subTitle: 'you disagree that '+factor.cause+' increases your '+factor.effect+'.',
                    scope:$scope,
                    template:'<label><input type="checkbox" ng-model="$parent.notShowConfirmationPositiveDown" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons:[
                        {text: 'Cancel'},
                        {text: 'Disagree',
                            type: 'button-positive',
                            onTap: function(){
                                localStorageService.setItem('notShowConfirmationPositiveDown',JSON.stringify($scope.notShowConfirmationPositiveDown));
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
            // params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 0;
            var correlationCoefficient = factor.correlationCoefficient;

            // call vote method
            correlationService.vote(vote, cause, effect, correlationCoefficient)
                .then(function(){
                    utilsService.showAlert('Down voted!');
                }, function(){
                    utilsService.showAlert('Down vote failed !');
                });
        }

	    // when upVoted
	    $scope.upVote = function(factor){

	    
            if(!$scope.notShowConfirmationPositive){
                $ionicPopup.show({
                    title:'Voting thumbs up indicates',
                    subTitle: 'it seems likely that '+factor.cause+' increases your '+factor.effect+'.',
                    scope:$scope,
                    template:'<label><input type="checkbox" ng-model="$parent.notShowConfirmationPositive" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons:[
                        {text: 'Cancel'},
                        {text: 'Agree',
                            type: 'button-positive',
                            onTap: function(){
                                localStorageService.setItem('notShowConfirmationPositive',JSON.stringify($scope.notShowConfirmationPositive));
                                upVote(factor);
                            }
                        }
                    ]

                });

            }else{
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
            
            correlationService.vote(vote, cause, effect, correlationCoefficient)
                .then(function(){
                    utilsService.showAlert('Upvoted !');
                }, function(){
                    utilsService.showAlert('Upvote Failed !');
                    factor.userVote = prevValue;
                });
        }
        
	    $scope.init = function(){
            Bugsnag.context = "positivePredictors";
            $scope.showLoader('Fetching positive predictors...');
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  { analytics.trackView("Positive Predictors Controller"); }
            if(isAuthorized){
                correlationService.getPositiveFactors()
                    .then(function(correlationObjects){
                        $scope.positives = correlationObjects;
                        correlationService.getUsersPositiveFactors().then(function(correlationObjects){
                            $scope.usersPositiveFactors = correlationObjects;
                        });
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function(){
                        $scope.loading = false;
                        $ionicLoading.hide();
                    });
            }
	    };

	    $scope.openStore = function(name){
	    	// make url
	    	name = name.split(' ').join('+');
	    	// open store
	       window.open('http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k='+name, '_blank', 'location=no');
	    };

        $scope.changePage = function(){
            $state.go('app.negative');
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