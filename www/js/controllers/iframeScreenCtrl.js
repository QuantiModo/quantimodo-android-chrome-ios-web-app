angular.module('starter')
    .controller('IframeScreenCtrl', function ($scope, authService, utilsService, $ionicLoading, $sce, $state) {

        $scope.showLoader();
        console.debug('IframeScreenCtrl works!');

        var embedPlugin;
        var urlParameters = '';

        if(window.location.href.indexOf('search-variables') > -1 )
        {
            embedPlugin = 'search-variables';
            $scope.title = 'Your Variables';
        }

        if(window.location.href.indexOf('search-common-relationships') > -1 )
        {
            embedPlugin = 'search-relationships';
            urlParameters = '&commonOrUser=common';
            $scope.title = 'Common Variable Relationships';
        }

        if(window.location.href.indexOf('search-user-relationships') > -1 )
        {
            embedPlugin = 'search-relationships';
            urlParameters = '&commonOrUser=user';
            $scope.title = 'Your Variable Relationships';
        }

        authService.getAccessTokenFromAnySource().then(function(token) {
            $scope.iframeUrl = $sce.trustAsResourceUrl(
                config.getApiUrl() + '/embeddable/?plugin=' + embedPlugin + urlParameters + '&access_token=' + token.accessToken
            );
            $ionicLoading.hide();
        }, function(){
            console.log("getAccessTokenFromAnySource: No access token. Need to log in.");
            $state.go('app.login', {
                fromUrl : window.location.href
            });
            $ionicLoading.hide();
        });
    });