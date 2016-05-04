angular.module('starter')
	
	// Controlls the Positive Factors page
	.controller('PositiveCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading, 
                                         $state, $ionicPopup, correlationService, $rootScope,
                                         localStorageService, utilsService) {


        if(!$scope.isLoggedIn){
            $state.go('app.welcome');
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

		// show spinner
		$ionicLoading.show({
			noBackdrop: true,
			template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
	    });
        
	    // downVote
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

            }else{
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

	    // when upvoted
	    $scope.upvote = function(factor){

	    
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
                                upvote(factor);
                            }
                        }
                    ]

                });

            }else{
                upvote(factor);
            }

	    };

        function upvote(factor){

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

	    // constructor
	    $scope.init = function(){

	    	// show spinenr
	    	$ionicLoading.show({
				noBackdrop: true,
				template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
		    }); 

	        if($scope.isLoggedIn){
	        	// get correlationObjects
                correlationService.getPositiveFactors()
	            .then(function(correlationObjects){
                    // update view model
                    $scope.positives = correlationObjects;
                    $ionicLoading.hide();
                    correlationService.getUsersPositiveFactors().then(function(correlationObjects){
                        $scope.usersPositiveFactors = correlationObjects;
                    });
	            }, function(){
	                $ionicLoading.hide();
	            });    
	        } else {
	            $ionicLoading.hide();
                utilsService.showLoginRequiredAlert($scope.login);
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

	    // run constructor
	    $scope.init();
	});