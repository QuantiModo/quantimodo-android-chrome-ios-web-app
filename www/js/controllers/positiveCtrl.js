angular.module('starter')
	
	// Controlls the Positive Factors page
	.controller('PositiveCtrl', function($scope, $ionicModal, $timeout, measurementService, $ionicLoading, $ionicPopup, $state, $ionicPopup, correlationService, $rootScope,localStorageService,utilsService) {

        /*// redirect if not logged in
        if(!$scope.isLoggedIn){
            $state.go('app.welcome');
            // app wide signal to sibling controllers that the state has changed
            $rootScope.$broadcast('transition');
        }*/

        $scope.not_show_confirmation_positive;
         localStorageService.getItem('not_show_confirmation_positive',function(val){
             $scope.not_show_confirmation_positive = val ? JSON.parse(val) : false;
         });



        $scope.not_show_confirmation_positive_down;
        localStorageService.getItem('not_show_confirmation_positive',function(val){
            $scope.not_show_confirmation_positive_down = val ? JSON.parse(val) : false;
        });

		$scope.controller_name = "PositiveCtrl";

        $scope.positives = false;
        $scope.users_positive_factors = false;

		// show spinner
		$ionicLoading.show({
			noBackdrop: true,
			template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
	    });

		// show alert box
	    $scope.showAlert = function(title, template) {
	        $ionicPopup.alert({
	          title: title,
	          template: template
	        });
	    };

	    // downvote
	    $scope.downvote = function(factor){

            if(!$scope.not_show_confirmation_positive_down){
                $ionicPopup.show({
                    title:'Voting thumbs down indicates',
                    subTitle: 'you disagree that '+factor.cause+' increases your '+factor.effect+'.',
                    scope:$scope,
                    template:'<label><input type="checkbox" ng-model="$parent.not_show_confirmation_positive_down" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons:[
                        {text: 'Cancel'},
                        {text: 'Disagree',
                            type: 'button-positive',
                            onTap: function(){
                                localStorageService.setItem('not_show_confirmation_positive_down',JSON.stringify($scope.not_show_confirmation_positive_down));
                                downvote(factor);
                            }
                        }
                    ]

                });

            }else{
                downvote(factor);
            }


        };

        function downvote(factor){
            var prevValue = factor.userVote;
            factor.userVote = 0;
            // params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 0;
            var correlationCoefficient = factor.correlationCoefficient;

            if($scope.isLoggedIn){

                // call vote method
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function(){
                        $scope.showAlert('Downvoted !');
                    }, function(){
                        $scope.showAlert('Downvote Failed !');
                    });
            } else {
                $ionicLoading.hide();
                utilsService.showLoginRequiredAlert($scope.login);
                factor.userVote = prevValue;
            }
        };

	    // when upvoted
	    $scope.upvote = function(factor){

	    
            if(!$scope.not_show_confirmation_positive){
                $ionicPopup.show({
                    title:'Voting thumbs up indicates',
                    subTitle: 'it seems likely that '+factor.cause+' increases your '+factor.effect+'.',
                    scope:$scope,
                    template:'<label><input type="checkbox" ng-model="$parent.not_show_confirmation_positive" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons:[
                        {text: 'Cancel'},
                        {text: 'Agree',
                            type: 'button-positive',
                            onTap: function(){
                                localStorageService.setItem('not_show_confirmation_positive',JSON.stringify($scope.not_show_confirmation_positive));
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

            if($scope.isLoggedIn){
                // call vote method
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function(){
                        $scope.showAlert('Upvoted !');
                    }, function(){
                        $scope.showAlert('Upvote Failed !');
                        factor.userVote = prevValue;
                    });
            } else {
                utilsService.showLoginRequiredAlert($scope.login);
                factor.userVote = prevValue;
            }
        };

	    // constructor
	    $scope.init = function(){

	    	// show spinenr
	    	$ionicLoading.show({
				noBackdrop: true,
				template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
		    }); 

	        if($scope.isLoggedIn){

	        	// get list
                correlationService.getPositiveFactors()
	            .then(function(list){
                        // update view model
                        $scope.positives = list;
                        $ionicLoading.hide();

                        correlationService.getUsersPositiveFactors().then(function(list){
                            $scope.users_positive_factors = list;
                        })



	            }, function(){
	                $ionicLoading.hide();
	            });    
	        } else {

	            $ionicLoading.hide();
                utilsService.showLoginRequiredAlert($scope.login);
            }
	    };

	    $scope.open_store = function(name){

	    	// make url
	    	name = name.split(' ').join('+');
	    	
	    	// open store
	       window.open('http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k='+name, '_blank', 'location=no');
	    };

        $scope.changePage = function(){
            $state.go('app.negative');
            $state.reload();
        }

	    // run constructor
	    $scope.init();
	});