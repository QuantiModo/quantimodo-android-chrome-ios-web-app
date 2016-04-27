angular.module('starter')

	// Controls the History Page of the App.
	.controller('AllHistoryCtrl', function($scope, $state, $ionicModal, $timeout, $ionicLoading, authService, $ionicPopover, measurementService, $ionicPopup, localStorageService, QuantiModo){

	    $scope.controller_name = "AllHistoryCtrl";

	    var utils = {
		    showAlert : function(title, template) {
		       var alertPopup = $ionicPopup.alert({
		         cssClass : 'calm',
	             okType : 'button-calm',
		         title: title,
		         template: template
		       });
		    },

		    // Hide spinner
		    stopLoading : function(){
		        $ionicLoading.hide();
		    },

		    // show spinner
		    startLoading : function(){
		    	// show loading spinner
		    	$ionicLoading.show({
		    	    noBackdrop: true,
		    	    template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
		    	});	 
		    }
	    };

	    $scope.state = {
	    	offset : 0,
	    	limit : 50,
	    	history : [],
			units : [],
			variableCategories : []
	    };

	    $scope.editMeasurement = function(measurement){
	    	$state.go('app.edit', {
	    		unit: measurement.unit,
	    		variableName : measurement.variable,
	    		dateTime : measurement.startTime,
	    		value : measurement.value
	    	});
	    };

	    $scope.getUnitFromUnitId = function(id){
	    	if(!id) return false;

	    	var unit = $scope.state.unitObjects.filter(function(u){
	    		return u.id === id;
	    	})[0];

	    	return unit? unit : false;
	    };

	    $scope.getVariableCategoryByUnit = function(unit){
	    	
	    	if(!unit) return false;
	    	
	    	var variableCategory = $scope.state.variableCategories.filter(function(vc){
	    		return vc.name === unit.category;
	    	})[0];

	    	return variableCategory? variableCategory : false;
	    };


	    var getHistory = function(){
	    	utils.startLoading();
	    	measurementService.getHistoryMeasurements({
    		    offset: $scope.state.offset,
    		    limit: $scope.state.limit,
    		    sort: "-startTime"
	    	}).then(function(history){
    			$scope.state.history = $scope.state.history.concat(history);
    			utils.stopLoading();
	    	}, function(error){
	    		console.log('error getting measurements', error);
	    		utils.stopLoading();
	    	});

	    };

	    $scope.getNext = function(){
	    	$scope.state.offset += $scope.state.limit;
	    	getHistory();
	    };
	    
	    // constructor
	    $scope.init = function(){
	    	utils.startLoading();
	    	measurementService.getVariableCategories()
	    	.then(function(variableCategories){
	    		$scope.state.variableCategories = variableCategories;
	    	}, function(err){
	    		console.log("error getting variable categories", err);
	    	});

	    	measurementService.getUnits()
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