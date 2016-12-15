angular.module('starter')

	.controller('SpreadsheetImportCtrl', function($scope, $ionicLoading, $state, $rootScope, utilsService, QuantiModo,
									   connectorsService, $cordovaOauth, $ionicPopup, $stateParams) {

		$scope.controller_name = "SpreadsheetImportCtrl";

	    // constructor
	    var init = function(){
			console.debug($state.current.name + ' initializing...');
			$rootScope.stateParams = $stateParams;
			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }


	    };

	    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
			init();
	    });

        $scope.uploadSpreadsheet = function() {
        	alert('Select spreadsheet');
        };

        $scope.displayFileContents = function(contents) {
            console.log(contents);
            $scope.results = contents;
        };
		
	});
