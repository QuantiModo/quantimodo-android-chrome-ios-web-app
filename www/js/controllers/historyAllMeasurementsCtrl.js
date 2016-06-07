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
	    	limit : 50,
	    	history : [],
			units : [],
			variableCategories : [],
			showLoadMoreButton: false
	    };

		$scope.title = 'Measurement History';

		var setupVariableCategory = function () {
			if($stateParams.variableCategoryName){
				$scope.title = $stateParams.variableCategoryName + ' History';
			}
		};

        $scope.goToState = function(state){
            $state.go(state, {
                fromState: $state.current.name,
				fromUrl: window.location.href
			});
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
	    	//$scope.showLoader();
	    	measurementService.getHistoryMeasurements({
    		    offset: $scope.state.offset,
    		    limit: $scope.state.limit,
    		    sort: "-startTimeEpoch",
				variableCategoryName: $stateParams.variableCategoryName
	    	}).then(function(history){
    			$scope.state.history = $scope.state.history.concat(history);
				$scope.state.history = ratingService.addImagesToMeasurements($scope.state.history);
				if($scope.state.history.length > 49){
					$scope.state.showLoadMoreButton = true;
				}
				$scope.hideLoader();
	    	}, function(error){
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
			if($stateParams.variableCategoryName) {
				$scope.showLoader('Fetching ' + $stateParams.variableCategoryName.toLowerCase()
					+ ' measurements...');
			} else {
				$scope.showLoader('Fetching measurements...');
			}
			setupVariableCategory();
            var isAuthorized = authService.checkAuthOrSendToLogin();
			if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                variableCategoryService.getVariableCategories()
                    .then(function(variableCategories){
                        $scope.state.variableCategories = variableCategories;
                    }, function(err){
                        console.log("error getting variable categories", err);
                    });
                unitService.getUnits()
                    .then(function(units){
                        $scope.state.unitObjects = units;
                    }, function(err){
                        console.log("error getting units", err);
                    });
                getHistory();
			}
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
    		$scope.state.history = [];
    		$scope.init();
    	});

	});