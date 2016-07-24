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
            var requestParams = {};
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
                Bugsnag.context = "positivePredictors";
                $scope.showLoader('Fetching positive predictors...');
                requestParams.correlationCoefficient = '(gt)0';
            }

            if ($stateParams.valence === "negative") {
                $scope.state.title = "Negative Predictors of " + $scope.state.variableName;
                $scope.increasingDecreasing = "DECREASING";
                Bugsnag.context = "negativePredictors";
                $scope.showLoader('Fetching negative predictors...');
                requestParams.correlationCoefficient = '(lt)0';
            }

            correlationService.getPublicCauses($scope.state.variableName, requestParams)
                .then(function(correlationObjects){
                    $scope.state.correlationObjects = correlationObjects;
                    correlationService.getUserCauses($scope.state.variableName, requestParams)
                        .then(function(correlationObjects){
                            $scope.state.usersCorrelationObjects = correlationObjects;
                        });
                    $ionicLoading.hide();
                    $scope.loading = false;
                }, function(){
                    $ionicLoading.hide();
                    $scope.loading = false;
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
                    template: $scope.templateConfirmatioDown,
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
        $scope.$on('$ionicView.enter', function(e){
            $scope.init();
        });
	});