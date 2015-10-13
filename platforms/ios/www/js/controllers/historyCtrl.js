angular.module('starter')

	// Controls the History Page of the App.
	.controller('HistoryCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $ionicPopover, measurementService, $ionicPopup,localStorageService){

	    $scope.controller_name = "HistoryCtrl";

	    // Show alert with a title
	    $scope.showAlert = function(title, template) {
	       var alertPopup = $ionicPopup.alert({
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
	        scope: $scope,
	    }).then(function(popover) {
	        $scope.history_popover = popover;
	    });

	    // open popover when a history item is tapped
	    $scope.open_popover = function(history){
	        
	        // update scope
	        $scope.selected_item  = history;
	        
	        // open popover
	        $scope.history_popover.show();
	        
	        // remove any previous factors if present
	        jQuery('.tracking_factors .active_tracking_factor').removeClass('active_tracking_factor');
	        
	        // highlight the approporiate factor for the history item.
	        jQuery('.'+config.appSettings.conversion_dataset[Math.ceil(history.value)]).addClass('active_tracking_factor');
	    };

	    // when a value is edited
	    $scope.save_value = function(){
	        
	        // update on the server
	        measurementService.editTrackingFactor($scope.selected_item.timestamp, $scope.selected_tracking_factor, $scope.selected_item.note)
	        .then(function(){
	        	// do nothing user would have safely navigated away
	        	console.log("edit complete");
	        }, function(){

	        	// show alert
	            $scope.showAlert('Failed to edit tracking_factor !');
	        });
	        
	        // update the main list for the recently updated value
	        $scope.selected_item.value = $scope.selected_tracking_factor;
	        
	        // hide the popover
	        $scope.history_popover.hide();
	    };

	    // manually close the popover
	    $scope.close_popover = function(){
	        $scope.history_popover.hide();
	    };

	    // select a mod manually on popover
	    $scope.select_tracking_factor = function($event, option){
	    	// remove any previous tracking factors if present
	        jQuery('.tracking_factors .active_tracking_factor').removeClass('active_tracking_factor');
	        
	        // make this tracking factor glow visually
	        jQuery($event.target).addClass('active_tracking_factor');
	        
	        // update view
	        $scope.selected_tracking_factor = config.appSettings.conversion_dataset_reversed[option.value];

	    };

	    // constuctor
	    $scope.init = function(){
	        
	        // show loading spinner
	        $ionicLoading.show({
	            noBackdrop: true,
	            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
	        });  

	        // get the history data

            var history;
            localStorageService.getItem('allData',function(allData){
                history = allData? JSON.parse(allData) : [];
                $scope.history = history.sort(function(a,b){
                    if(a.timestamp < b.timestamp){
                        return 1;}
                    if(a.timestamp> b.timestamp)
                    {return -1}
                    return 0
                });
            });
	        // try to access user token to check if the user is logged in
	        authService.getAccessToken().then(function(token){
	            $ionicLoading.hide();
	        }, function(){
	            console.log("need to log in");
	            $ionicLoading.hide();
	        });
	       
	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) {
    		$scope.init();
    	});

	})