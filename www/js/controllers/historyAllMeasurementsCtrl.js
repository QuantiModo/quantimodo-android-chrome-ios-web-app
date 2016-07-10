angular.module('starter')

	// Controls the History Page of the App.
	.controller('historyAllMeasurementsCtrl', function($scope, $state, $ionicModal, $timeout, $ionicLoading,
										   authService, $ionicPopover, 
                                           measurementService,
										   $ionicPopup, 
                                           variableCategoryService, 
                                           unitService,
                                            utilsService, $stateParams, ratingService){

	    $scope.controller_name = "historyAllMeasurementsCtrl";
        
	    $scope.state = {
	    	offset : 0,
	    	limit : 200,
	    	history : [],
			units : [],
			variableCategories : [],
			hideLoadMoreButton : true
	    };

		$scope.title = 'Measurement History';

		var setupVariableCategory = function () {
			if($stateParams.variableCategoryName){
				$scope.title = $stateParams.variableCategoryName + ' History';
			}
		};

	    $scope.editMeasurement = function(measurement){
	    	$state.go('app.measurementAdd', {
	    		measurement: measurement,
				fromState: $state.current.name,
				fromUrl: window.location.href
	    	});
	    };

	    $scope.getVariableCategoryByUnit = function(unit){
	    	
	    	if(!unit) {
                return false;
            }
	    	
	    	var variableCategory = $scope.state.variableCategories.filter(function(vc){
	    		return vc.name === unit.category;
	    	})[0];

	    	return variableCategory? variableCategory : false;
	    };


	    var getHistory = function(){
			if($scope.state.history.length < 1){
				$scope.showLoader('Getting your measurements...');
			}
	    	measurementService.getHistoryMeasurements({
    		    offset: $scope.state.offset,
    		    limit: $scope.state.limit,
    		    sort: "-startTimeEpoch",
				variableCategoryName: $stateParams.variableCategoryName
	    	}).then(function(history){
    			$scope.state.history = $scope.state.history.concat(history);
				$scope.state.history = ratingService.addImagesToMeasurements($scope.state.history);
				$scope.hideLoader();
				if(history.length < 200){
					$scope.state.hideLoadMoreButton = true;
				} else {
					$scope.state.hideLoadMoreButton = false;
				}
	    	}, function(error){
				Bugsnag.notify(error, JSON.stringify(error), {}, "error");
	    		console.log('error getting measurements', error);
				$scope.hideLoader();
	    	});
	    };

	    $scope.getNext = function(){
	    	$scope.state.offset += $scope.state.limit;
	    	getHistory();
	    };
	    
	    // constructor
	    $scope.init = function(){
			if (typeof analytics !== 'undefined')  { analytics.trackView("All Measurements Controller"); }
			Bugsnag.context = "historyAll";
			
			setupVariableCategory();
            var isAuthorized = authService.checkAuthOrSendToLogin();
			if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                variableCategoryService.getVariableCategories()
                    .then(function(variableCategories){
                        $scope.state.variableCategories = variableCategories;
                    }, function(err){
						Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                        console.log("error getting variable categories", err);
                    });
                getHistory();
			}
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
			$scope.state.offset = 0;
    		//$scope.state.history = [];
    		$scope.init();
    	});

	});