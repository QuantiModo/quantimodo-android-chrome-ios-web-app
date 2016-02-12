angular.module('starter')

	// Controls the History Page of the App.
	.controller('AllHistoryCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $ionicPopover, measurementService, $ionicPopup, localStorageService, QuantiModo){

	    $scope.controller_name = "AllHistoryCtrl";

	    $scope.utils = {
		    showAlert : function(title, template) {
		       var alertPopup = $ionicPopup.alert({
		         cssClass : 'calm',
	             okType : 'button-calm',
		         title: title,
		         template: template
		       });
		    },

		    // Hide spinner
		    closeloading : function(){
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
	    }

	    $scope.state = {
	    	history : [],
			units : [],
			variableCategories : []
	    };

	    $scope.getUnitFromUnitId = function(id){
	    	if(!id) return false;

	    	var unit = $scope.state.units.filter(function(u){
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
	    
	    // constuctor
	    $scope.init = function(){
	    	measurementService.getVariableCategories()
	    	.then(function(variableCategories){
	    		$scope.state.variableCategories = variableCategories;
	    	}, function(err){
	    		console.log("error getting variable categories", err);
	    	});

	    	measurementService.getUnits()
	    	.then(function(units){
	    		$scope.state.units = units;
	    	}, function(err){
	    		console.log("error getting units", err);
	    	});

	    	measurementService.getHistoryMeasurements({
    		    offset:0,
    		    limit:200,
    		    sort: "-updatedTime"
	    	}).then(function(history){
    			$scope.state.history = history;
	    	}, function(error){
	    		console.log('error getting measurements', error)
	    	});

	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
    		$scope.init();
    	});

	})