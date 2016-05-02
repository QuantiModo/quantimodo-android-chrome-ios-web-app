angular.module('starter')

	// Controls the History Page of the App.
	.controller('HistoryCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, authService, $ionicPopover,
										measurementService, $ionicPopup, localStorageService, utilsService){

	    $scope.controller_name = "HistoryCtrl";
	    
	    // Show alert with a title
	    $scope.showAlert = function(title, template) {
	       var alertPopup = $ionicPopup.alert({
	         cssClass : 'positive',
             okType : 'button-positive',
	         title: title,
	         template: template
	       });
	    };

	    // Hide spinner
	    window.closeLoading = function(){
	        $ionicLoading.hide();
	    };
	    
	    // load editing popover
	    $ionicPopover.fromTemplateUrl('templates/history_popup.html', {
	        scope: $scope
	    }).then(function(popover) {
	        $scope.historyPopover = popover;
	    });

	    // open popover when a history item is tapped
	    $scope.openPopover = function(history){
	        
	        // update scope
	        $scope.selectedItem  = history;
	        
	        // open popover
	        $scope.historyPopover.show();
	        
	        $scope.selectedPrimaryOutcomeVariableValue = history.value;

	        // remove any previous factors if present
	        jQuery('.primary-outcome-variable .active-primary-outcome-variable').removeClass('active-primary-outcome-variable');
	        
	        // highlight the appropriate factor for the history item.
	        jQuery('.'+config.appSettings.primaryOutcomeValueConversionDataSet[Math.ceil(history.value)]).addClass('active-primary-outcome-variable');
	    };

	    // when a value is edited
	    $scope.saveValue = function(){

			var note = $scope.selectedItem.note? $scope.selectedItem.note : null;

	        // update on the server
	        measurementService.editPrimaryOutcomeVariable($scope.selectedItem.timestamp, $scope.selectedPrimaryOutcomeVariableValue, note)
	        .then(function(){
	        	// do nothing user would have safely navigated away
	        	console.log("edit complete");
	        }, function(){

	        	// show alert
	            $scope.showAlert('Failed to edit primaryOutcomeVariable !');
	        });
	        
	        // update the main list for the recently updated value
	        $scope.selectedItem.value = $scope.selectedPrimaryOutcomeVariableValue;
	        
	        // hide the popover
	        $scope.historyPopover.hide();
	    };

	    // manually close the popover
	    $scope.closePopover = function(){
	        $scope.historyPopover.hide();
	    };

	    // select a mod manually on popover
	    $scope.selectPrimaryOutcomeVariableValue = function($event, option){
	    	// remove any previous primary outcome variables if present
	        jQuery('.primary-outcome-variable .active-primary-outcome-variable').removeClass('active-primary-outcome-variable');
	        
	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active-primary-outcome-variable');
	        
	        // update view
	        $scope.selectedPrimaryOutcomeVariableValue = config.appSettings.primaryOutcomeValueConversionDataSetReversed[option.value];

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
            localStorageService.getItem('allData',function(allData){
                history = allData? JSON.parse(allData) : [];
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