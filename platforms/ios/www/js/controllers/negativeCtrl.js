angular.module('starter')

    // Controlls the Negative Factors page
    .controller('NegativeCtrl', function($scope,localStorageService, $ionicModal, $timeout, measurementService, $ionicLoading, $ionicPopup,$state, correlationService, $rootScope,utilsService) {

        /*// redirect if not logged in
        if(!$scope.isLoggedIn){
            $state.go('app.welcome');
            // app wide signal to sibling controllers that the state has changed
            $rootScope.$broadcast('transition');
        }*/

        $scope.not_show_confirmation_negative;
        localStorageService.getItem('not_show_confirmation_negative',function(not_show_confirmation_negative){
            $scope.not_show_confirmation_negative = not_show_confirmation_negative ? JSON.parse(not_show_confirmation_negative) : false;
        });
        $scope.not_show_confirmation_negative_down;
        localStorageService.getItem('not_show_confirmation_negative_down',function(not_show_confirmation_negative_down){
           $scope.not_show_confirmation_negative_down = not_show_confirmation_negative_down ? JSON.parse(not_show_confirmation_negative_down) : false;
        });


        $scope.controller_name = "NegativeCtrl";



        $scope.negatives = false;
        $scope.users_negative_factors = false;

        // show alert for upvoted/failure
        $scope.showAlert = function(title, template) {
            $ionicPopup.alert({
              title: title,
              template: template
            });
        };

        // constructor
        $scope.init = function(){



            if($scope.isLoggedIn){

                // show loader
                $ionicLoading.show({
                    noBackdrop: true,
                    template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
                });

                // get negative list
                correlationService.getNegativeFactors()
                .then(function(list){
                    
                    // update view model
                    $scope.negatives = list;
                    
                    // hide spinner
                    $ionicLoading.hide();

                    correlationService.getUsersPositiveFactors().then(function(list){
                        $scope.users_negative_factors = list;
                     });

                }, function(){
                    
                    // hide spinner
                    $ionicLoading.hide();
                    utilsService.showLoginRequiredAlert($scope.login);

                    });
            } else {
                utilsService.showLoginRequiredAlert($scope.login);
            }

        };

        // when downvoted
        $scope.downvote = function(factor) {

            if (!$scope.not_show_confirmation_negative_down) {

                $ionicPopup.show({
                    title: 'Voting thumbs down indicates',
                    subTitle: 'you disagree that ' + factor.cause + ' decreases your ' + factor.effect + '.',
                    scope: $scope,
                    template: '<label><input type="checkbox" ng-model="$parent.not_show_confirmation_negative_down" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons: [
                        {text: 'Cancel'},
                        {text: 'Disagree',
                            type: 'button-positive',
                            onTap: function () {
                                localStorageService.setItem('not_show_confirmation_negative_down',$scope.not_show_confirmation_negative_down);
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
            
            // get params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 0;
            var correlationCoefficient = factor.correlationCoefficient;

            // call service method for voting
            if($scope.isLoggedIn){
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function(){
                        $scope.showAlert('Downvoted !');
                    }, function(){
                        factor.userVote = prevValue;
                        $scope.showAlert('Downvote Failed !');
                        
                    });
            } else {
                factor.userVote = prevValue;
            	$state.go('app.welcome')
            	};
        };

        // when upvoted
        $scope.upvote = function(factor){
            if(!$scope.not_show_confirmation_negative){
                $ionicPopup.show({
                    title:'Voting thumbs up indicates',
                    subTitle: 'you agree that '+factor.cause+' decreases your '+factor.effect+'.',
                    scope:$scope,
                    template:'<label><input type="checkbox" ng-model="$parent.not_show_confirmation_negative" class="show-again-checkbox">Don\'t show this again</label>',
                    buttons:[
                        {text: 'Cancel'},
                        {text: 'Agree',
                            type: 'button-positive',
                            onTap: function(){
                                localStorageService.setItem('not_show_confirmation_negative',$scope.not_show_confirmation_negative);
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
            factor.userVote =1;
        
            // get params
            var cause = factor.cause;
            var effect = factor.effect;
            var vote = 1;
            var correlationCoefficient = factor.correlationCoefficient;

            if($scope.isLoggedIn){

                // call service method for voting
                correlationService.vote(vote, cause, effect, correlationCoefficient)
                    .then(function(){
                        $scope.showAlert('Upvoted !');
                    }, function(){
                    	factor.userVote = prevValue;
                        $scope.showAlert('Upvote Failed !');
                    });

            } else {
				factor.userVote = prevValue
            	$state.go('app.welcome')
            	};
        };

        // open store in inAppbrowser
        $scope.open_store = function(name){
            console.log("open store for ", name);
            
            // create link
            name = name.split(' ').join('+');
            
            // launch inAppBrowser
            window.open('http://www.amazon.com/gp/aw/s/ref=mh_283155_is_s_stripbooks?ie=UTF8&n=283155&k='+name, '_blank', 'location=no');

        };

        // call constructor
        $scope.init();
    })