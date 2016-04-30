angular.module('starter')
.controller('IntroCtrl', function($scope, $state, localStorageService, $ionicSlideBoxDelegate, $ionicLoading) {
    
    $scope.view_title = config.appSettings.app_name;
    $scope.primary_outcome_variable = config.appSettings.primary_outcome_variable;
    $scope.primaryOutcomeVariableRatingOptions = config.getPrimaryOutcomeVariableOptions();
    $scope.primary_outcome_variable_numbers = config.getPrimaryOutcomeVariableOptions(true);
    $scope.intro_config = config.appSettings.intro;
    
    $scope.myIntro = {
        ready : false,

        slideIndex : 0,
        // Called to navigate to the main app
        startApp : function() {
            localStorageService.setItem('introSeen', true);
            $state.go('app.welcome');
        },

        next : function() {
            $ionicSlideBoxDelegate.next();
        },

        previous : function() {
            $ionicSlideBoxDelegate.previous();
        },

        // Called each time the slide changes
        slideChanged : function(index) {
            $scope.myIntro.slideIndex = index;
        },
    };

    var init = function(){
        // show loader
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>'
        });

        localStorageService.getItem('introSeen', function(introSeen){
            if(introSeen){
                $state.go('app.welcome');
            } else {
                $scope.myIntro.ready = true;
            }
            $ionicLoading.hide();
        });
    };

    // when view is changed
    $scope.$on('$ionicView.enter', function(e) {
        init();
    });

});
