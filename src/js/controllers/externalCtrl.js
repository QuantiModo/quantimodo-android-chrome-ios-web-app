angular.module('starter')  // Handles all views that have an iFrame
    .controller('ExternalCtrl', ["$scope", "$stateParams", "$rootScope", "$state", "qmService",
        function($scope, $stateParams, $rootScope, $state, qmService){
        $scope.controller_name = "ExternalCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        // when page load completes
        window.closeLoading = function(){
            qmService.hideLoader();
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            qmLog.debug('beforeEnter state ' + $state.current.name);
            qmService.rootScope.setProperty('hideHelpButton', true);
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        });
        $scope.$on('$ionicView.afterLeave', function(){
            qmService.rootScope.setProperty('hideHelpButton', false);
        });
    }]);
