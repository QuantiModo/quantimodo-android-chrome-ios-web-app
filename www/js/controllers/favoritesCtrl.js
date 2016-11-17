angular.module('starter')

	.controller('FavoritesCtrl', function($scope, $state, $ionicActionSheet, $timeout, reminderService, QuantiModo,
										  localStorageService, measurementService, variableCategoryService, $rootScope,
										  $stateParams, utilsService) {

	    $scope.controller_name = "FavoritesCtrl";

		console.debug('Loading ' + $scope.controller_name);
		
	    $scope.state = {
	    	selected1to5Value : false,
			loading : true,
            trackingReminder : null,
            lastSent: new Date(),
			title: "Favorites",
			bloodPressure: {
            	systolicValue: null,
				diastolicValue: null,
				displayTotal: "Blood Pressure"
			},
			favorites: [],
			addButtonText: "Add a Favorite Variable",
			addButtonIcon: "ion-ios-star",
			helpText: "Favorites are variables that you might want to track on a frequent but irregular basis.  Examples: As-needed medications, cups of coffee, or glasses of water",
			moreHelpText: "Tip: I recommend using reminders instead of favorites whenever possible because they allow you to record regular 0 values as well. Knowing when you didn't take a medication or eat something helps our analytics engine to figure out how these things might be affecting you."
	    };



		$scope.favoriteAddButtonClick = function () {
			$scope.goToState('app.favoriteSearch', $rootScope.stateParams);
		};

		$scope.trackBloodPressure = function(){
			if(!$scope.state.bloodPressure.diastolicValue || !$scope.state.bloodPressure.systolicValue){
				$scope.favoriteValidationFailure('Please enter both values for blood pressure.');
				return;
			}
			$scope.state.bloodPressure.displayTotal = "Recorded " + $scope.state.bloodPressure.systolicValue + "/" + $scope.state.bloodPressure.diastolicValue + ' Blood Pressure';
			measurementService.postBloodPressureMeasurements($scope.state.bloodPressure)
				.then(function () {
					console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify($scope.state.bloodPressure));
				}, function(error) {
					if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
					console.error('Failed to Track by favorite, Try again!');
				});
		};

		$scope.refreshFavorites = function () {
			if($rootScope.syncingReminders !== true) {
				console.debug("ReminderMange init: calling refreshTrackingRemindersAndScheduleAlarms");
				$scope.showLoader('Syncing...');
				reminderService.refreshTrackingRemindersAndScheduleAlarms().then(function () {
					//QuantiModo.getFavoriteTrackingRemindersFromLocalStorage();  This is already done in refreshTrackingRemindersAndScheduleAlarms
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
				});
			} else {
				$scope.$broadcast('scroll.refreshComplete');
			}
		};

	    $scope.init = function(){
			$rootScope.stateParams = $stateParams;

			if($stateParams.variableCategoryName && $stateParams.variableCategoryName  !== 'Anything'){
				$scope.state.addButtonText = "Add favorite " + pluralize($stateParams.variableCategoryName, 1).toLowerCase();
				$scope.state.title = pluralize($stateParams.variableCategoryName, 1) + " Favorites";
				$scope.state.moreHelpText = null;
			}
			if($stateParams.variableCategoryName === 'Treatments') {
				$scope.state.addButtonText = "Add an as-needed medication";
				$scope.state.helpText = "Quickly record doses of medications taken as needed just by tapping.  Tap twice for two doses, etc.";
				$scope.state.addButtonIcon = "ion-ios-medkit-outline";
				$scope.state.title = 'As-Needed Meds';
			}

			if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
			if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
			if($stateParams.presetVariables){
				$rootScope.favoritesArray = $stateParams.presetVariables;
				//Stop the ion-refresher from spinning
				$scope.$broadcast('scroll.refreshComplete');
			} else {
				QuantiModo.getFavoriteTrackingRemindersFromLocalStorage();
				$scope.refreshFavorites();
			}
			$scope.showHelpInfoPopupIfNecessary();

	    };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
			$scope.hideLoader();
    		$scope.init();
    	});
		
	});
