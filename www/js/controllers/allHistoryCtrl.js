angular.module('starter')

	// Controls the History Page of the App.
	.controller('AllHistoryCtrl', function($scope, $state, $ionicModal, $timeout, $ionicLoading,
										   authService, $ionicPopover, 
                                           measurementService,
										   $ionicPopup, 
                                           variableCategoryService, 
                                           unitService,
                                            utilsService){

	    $scope.controller_name = "AllHistoryCtrl";
        
	    $scope.state = {
	    	offset : 0,
	    	limit : 50,
	    	history : [],
			units : [],
			variableCategories : [],
			showLoadMoreButton: false
	    };

        $scope.goToState = function(state){
            $state.go(state, {
                fromState: $state.current.name
            });
        };

	    $scope.editMeasurement = function(measurement){
	    	$state.go('app.measurementAdd', {
	    		measurement: measurement,
				fromState: $state.current.name
	    	});
	    };

	    $scope.getUnitFromUnitId = function(id){
	    	if(!id) {
				return false;
			}

	    	var unit = $scope.state.unitObjects.filter(function(u){
	    		return u.id === id;
	    	})[0];

	    	return unit? unit : false;
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
	    	utilsService.startLoading();
	    	measurementService.getHistoryMeasurements({
    		    offset: $scope.state.offset,
    		    limit: $scope.state.limit,
    		    sort: "-startTime"
	    	}).then(function(history){
    			$scope.state.history = $scope.state.history.concat(history);
				if($scope.state.history.length > 49){
					$scope.state.showLoadMoreButton = true;
				}
    			utilsService.stopLoading();
	    	}, function(error){
	    		console.log('error getting measurements', error);
	    		utilsService.stopLoading();
	    	});

	    };

	    $scope.getNext = function(){
	    	$scope.state.offset += $scope.state.limit;
	    	getHistory();
	    };
	    
	    // constructor
	    $scope.init = function(){
	    	utilsService.startLoading();
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
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
    		$scope.state.history = [];
    		$scope.init();
    	});

	});