angular.module('starter')

	// Controls the History Page of the App.
	.controller('HistoryCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $ionicPopover,
										measurementService, $ionicPopup, localStorageService, utilsService){

	    $scope.controller_name = "HistoryCtrl";
	    
	    // Show alert with a title
	    $scope.showAlert = function(title, template) {
	       var alertPopup = $ionicPopup.alert({
	         cssClass : 'calm',
             okType : 'button-calm',
	         title: title,
	         template: template
	       });
	    };

	    // Hide spinner
	    window.closeloading = function(){
	        $ionicLoading.hide();
	    };
	    
	    // load editing popover
	    $ionicPopover.fromTemplateUrl('templates/history_popup.html', {
	        scope: $scope
	    }).then(function(popover) {
	        $scope.history_popover = popover;
	    });

	    // open popover when a history item is tapped
	    $scope.open_popover = function(history){
	        
	        // update scope
	        $scope.selected_item  = history;
	        
	        // open popover
	        $scope.history_popover.show();
	        
	        $scope.selected_primary_outcome_variable = history.value;

	        // remove any previous factors if present
	        jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');
	        
	        // highlight the appropriate factor for the history item.
	        jQuery('.'+config.appSettings.conversion_dataset[Math.ceil(history.value)]).addClass('active_primary_outcome_variable');
	    };

	    // when a value is edited
	    $scope.save_value = function(){

			var note = $scope.selected_item.note? $scope.selected_item.note : null;

	        // update on the server
	        measurementService.editPrimaryOutcomeVariable($scope.selected_item.timestamp, $scope.selected_primary_outcome_variable, note)
	        .then(function(){
	        	// do nothing user would have safely navigated away
	        	console.log("edit complete");
	        }, function(){

	        	// show alert
	            $scope.showAlert('Failed to edit primary_outcome_variable !');
	        });
	        
	        // update the main list for the recently updated value
	        $scope.selected_item.value = $scope.selected_primary_outcome_variable;
	        
	        // hide the popover
	        $scope.history_popover.hide();
	    };

	    // manually close the popover
	    $scope.close_popover = function(){
	        $scope.history_popover.hide();
	    };

	    // select a mod manually on popover
	    $scope.selectRatingValue = function($event, option){
	    	// remove any previous primary outcome variables if present
	        jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');
	        
	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active_primary_outcome_variable');
	        
	        // update view
	        $scope.selected_primary_outcome_variable = config.appSettings.conversion_dataset_reversed[option.value];

	    };

	    // constructor
	    $scope.init = function(){


	        // show loading spinner
	        $ionicLoading.show({
	            noBackdrop: true,
	            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
	        });  

	        // get the history data

            var history;
            localStorageService.getItem('allLocalMeasurements',function(allLocalMeasurements){
                history = allLocalMeasurements? JSON.parse(allLocalMeasurements) : [];
                $scope.history = history.sort(function(a,b){
                    if(a.timestamp < b.timestamp){
                        return 1;}
                    if(a.timestamp> b.timestamp)
                    {return -1;}
                    return 0;
                });
            });
	        // try to access user token to check if the user is logged in
	        authService.getAccessTokenFromAnySource().then(function(token){
	            $ionicLoading.hide();
	        }, function(){
	            console.log("need to log in");
	            $ionicLoading.hide();
	            utilsService.showLoginRequiredAlert($scope.login);
	        });

	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
    		$scope.init();
    	});

	});