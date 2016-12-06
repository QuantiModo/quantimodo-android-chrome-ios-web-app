angular.module('starter')
.controller('MeasurementVariableButtonDetailsCtrl', function($scope, $stateParams,$http,$ionicHistory,$ionicLoading,$timeout,$state) {

$http.get('js/defaultReminders.json').success(function(data){
    $scope.measurements=data;
    $scope.selectedMeasurement=$stateParams.measurementId;
 
    $scope.goBack=function(){
      $ionicHistory.goBack();
    };
    $scope.save=function(){
    
      // $ionicLoading.show({
      //     template: '<ion-spinner></ion-spinner>',

      //   });

     alert('alert now saved');

     // $timeout(function(){
     //       $ionicLoading.hide().then(function(){
     //         alert('hided');
     //       });

     //  });
   }
   $scope.history= function(){

    $state.go('tab.history');

   }
    
   $scope.addToReminder=function(){
      $state.go('tab.reminder');
   }
    
 })

})

.directive('bloodPressure',function(){

     return{
  
       templateUrl: 'templates/bloodpressure.html'
     }
})

.directive('nonbloodPressure',function(){
     return{    
       template: '<form class="item-input-wrapper removeWrapper"><input type="text" placeholder="{{measurements.default[selectedMeasurement].shortName}}"></form>'         
    }
    
})

