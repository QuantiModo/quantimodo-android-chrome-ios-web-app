angular.module('starter')

	// Controls the History Page of the App.
	.controller('historyAllMeasurementsCtrl', function($scope, $state, $ionicModal, $timeout, $ionicLoading,
													   authService, $ionicPopover, measurementService, $ionicPopup,
													   variableCategoryService, unitService, utilsService,
													   $stateParams, ratingService, $rootScope, localStorageService){

	    $scope.controller_name = "historyAllMeasurementsCtrl";
        
	    $scope.state = {
	    	offset : 0,
	    	limit : 200,
	    	history : [],
			units : [],
			variableCategories : [],
			hideLoadMoreButton : true,
			trackLocation : $rootScope.trackLocation,
			showLocationToggle: false,
			noHistory: false
	    };

		$scope.title = 'Measurement History';

		if($stateParams.variableObject){
			$scope.title = $stateParams.variableObject.name + ' History';
		}

		var setupVariableCategory = function () {
			if($stateParams.variableCategoryName){
				$scope.title = $stateParams.variableCategoryName + ' History';
				if ($stateParams.variableCategoryName === "Location") {
					$scope.state.showLocationToggle = true;
				}
				else {
					$scope.state.showLocationToggle = false;
				}
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


	    var getHistory = function(concat){
			if($scope.state.history.length < 1){
				$scope.showLoader('Squirrels retrieving measurements...');
			}
			var params = {
				offset: $scope.state.offset,
				limit: $scope.state.limit,
				sort: "-startTimeEpoch"
			};

			if($stateParams.variableCategoryName){
				params.variableCategoryName = $stateParams.variableCategoryName;
			}

			if($stateParams.variableObject){
				params.variableName = $stateParams.variableObject.name;
			}

	    	measurementService.getHistoryMeasurements(params).then(function(history){
	    		if (concat) {
					$scope.state.history = $scope.state.history.concat(history);
				}
    			else {
					$scope.state.history = history;
				}
				$scope.state.history = ratingService.addInfoAndImagesToMeasurements($scope.state.history);
				$scope.hideLoader();
				if(history.length < 200){
					$scope.state.hideLoadMoreButton = true;
					if (history.length === 0) {
						$scope.state.noHistory = true;
					}
				} else {
					$scope.state.hideLoadMoreButton = false;
				}
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
	    	}, function(error){
				Bugsnag.notify(error, JSON.stringify(error), {}, "error");
	    		console.log('error getting measurements', error);
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
				$scope.hideLoader();
	    	});
	    };

	    $scope.getNext = function(){
	    	$scope.state.offset += $scope.state.limit;
	    	getHistory(true);
	    };

		$scope.trackLocationChange = function() {

			console.log('trackLocation', $scope.state.trackLocation);
			$rootScope.trackLocation = $scope.state.trackLocation;
			localStorageService.setItem('trackLocation', $scope.state.trackLocation);
			if($scope.state.trackLocation){
				$scope.getLocation();
			} else {
				console.debug("Do not track location");
			}

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
			$scope.state.trackLocation = $rootScope.trackLocation;
    		$scope.init();
    	});

	});