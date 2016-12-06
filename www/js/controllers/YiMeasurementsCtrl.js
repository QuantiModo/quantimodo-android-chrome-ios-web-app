angular.module('starter')

	// .controller('YiMeasurementsCtrl', function($scope, $state, $ionicActionSheet, $timeout, reminderService, QuantiModo,
	// 									  localStorageService, measurementService, variableCategoryService, $rootScope,
	// 									  $stateParams, utilsService) {

	//     $scope.controller_name = "YiMeasurementsCtrl";

.controller('yiMeasurementsCtrl', function($scope, $http) {

  /* now this part is set to Quantimodo-tobenamed.js, so the rest link should be changed also*/
  $http.get('js/defaultReminders.json').success(function(data){

  	/* from test json 's data'*/
    $scope.measurements=data;
   //$('.avaText').text(data.description.replace('\n','<br>'));
    $scope.images =$scope.measurements.localImage;
 
  
    $scope.loadImages = function() {
       for(var i = 0; i < 15; i++) {
        $scope.images.push( );
       }
     }
 })



});
		
	
