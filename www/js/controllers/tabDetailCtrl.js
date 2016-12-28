
angular.module('starter')

.controller('TabDetailCtrl', function($scope, $stateParams,$ionicHistory,$ionicLoading,$timeout,$state) {


     $scope.controller_name = "TabDetailCtrl";

        $scope.state = {
            title: tabs.tabId 
            //title:tabs.variableId?
        };
 

// $http.get('js/defaultReminders.json').success(function(data){
    $scope.defaultVariables=data;
    $scope.selectedDefaultVariable=$stateParams.tabId;


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
    
    $scope.goToRemindersTab = function () {

            $scope.state.title = 'Reminders';
     };
 })


.directive('bloodPressure',function(){

     return{
  
       templateUrl: 'templates/bloodpressure.html'
     }
})

.directive('nonbloodPressure',function(){
     return{    
       template: '<form class="item-input-wrapper removeWrapper"><input type="text" placeholder="{{variables[selectedVariable].shortName}}"></form>'         
    }
    
})
