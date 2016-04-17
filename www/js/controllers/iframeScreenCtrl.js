angular.module('starter')
    .controller('IframeScreenCtrl', function ($scope, authService, utilsService, $ionicLoading, $sce) {
        // show spinner
        $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">One moment please...<ion-spinner icon="lines"/></p>'
        });
        console.debug('IframeScreenCtrl works!');

        var embedPlugin;
        var urlParameters = '';

        if(window.location.href.indexOf('search-variables') > -1 )
        {
            embedPlugin = 'search-variables';
        }

        if(window.location.href.indexOf('search-common-relationships') > -1 )
        {
            embedPlugin = 'search-relationships';
            urlParameters = '&commonOrUser=common';
        }

        if(window.location.href.indexOf('search-user-relationships') > -1 )
        {
            embedPlugin = 'search-relationships';
            urlParameters = '&commonOrUser=user';
        }

        authService.getAccessTokenFromAnySource().then(function(token) {
            $scope.iframeUrl = $sce.trustAsResourceUrl(
                config.getApiUrl() + '/embeddable/?plugin=' + embedPlugin + urlParameters + '&access_token=' + token.accessToken
            );
        }, function(){
            console.log("No access token. Need to log in.");
            utilsService.showLoginRequiredAlert($scope.login);
            $ionicLoading.hide();
        });
    });