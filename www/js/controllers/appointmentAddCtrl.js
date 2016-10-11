angular.module('starter')

	// Controls the History Page of the App.
	.controller('AppointmentAddCtrl', function($scope, $state, $stateParams, $ionicLoading, $filter, $timeout, $rootScope,
                                             $ionicActionSheet, $ionicHistory, QuantiModo, localStorageService,
                                             reminderService, utilsService, ionicTimePicker, variableCategoryService,
                                             variableService, unitService, timeService, bugsnagService, $ionicPopup,
                                             ionicDatePicker) {

	    $scope.controller_name = "AppointmentAddCtrl";
		console.debug('Loading ' + $scope.controller_name);
		$scope.appointmentAddButtonClick = function(){
			
				$state.go('app.appointmentAdd',
					{
					  //any code :-(
					});
			};

	});