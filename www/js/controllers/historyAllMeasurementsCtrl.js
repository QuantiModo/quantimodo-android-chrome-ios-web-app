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
			variableCategories : []
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
	    	$scope.showLoader();
	    	measurementService.getHistoryMeasurements({
    		    offset: $scope.state.offset,
    		    limit: $scope.state.limit,
    		    sort: "-startTimeEpoch",
				variableCategoryName: $stateParams.variableCategoryName
	    	}).then(function(history){
    			$scope.state.history = $scope.state.history.concat(history);
				$scope.state.history = ratingService.addImagesToMeasurements($scope.state.history);
				$scope.hideLoader();
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
                unitService.getUnits()
                    .then(function(units){
                        $scope.state.unitObjects = units;
                    }, function(err){
						Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                        console.log("error getting units", err);
                    });
                getHistory();
			}
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
			$scope.state.offset = 0;
    		$scope.state.history = [];
    		$scope.init();
    	});

	});