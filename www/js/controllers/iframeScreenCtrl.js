angular.module('starter')
    .controller('IframeScreenCtrl', function ($scope, $ionicLoading, $sce, $state, $rootScope, QuantiModo, localStorageService) {

        $scope.showLoader();
        console.debug('IframeScreenCtrl works!');

        var embedPlugin;
        var urlParameters = '';
        var iFrameUrl;
        $scope.iFrameStyle = "height:2000px; width:100%;";

        if($state.current.name === 'app.studyCreate')
        {
            $scope.iFrameStyle = "height:5000px; width:100%;";
            iFrameUrl = $rootScope.qmApiUrl + '/api/v2/studies?hideMenu=true';
            $scope.title = 'Create Study';
        }

        if(window.location.href.indexOf('update-card') > -1 )
        {
            $scope.iFrameStyle = "height:2500px; width:100%;";
            iFrameUrl = $rootScope.qmApiUrl + '/api/v2/account/update-card?hideMenu=true';
            $scope.title = 'Update Card';
        }

        if(window.location.href.indexOf('search-variables') > -1 )
        {
            iFrameUrl = $rootScope.qmApiUrl + '/embeddable/?plugin=search-variables';
            $scope.title = 'Your Variables';
        }

        if(window.location.href.indexOf('search-common-relationships') > -1 )
        {
            iFrameUrl = $rootScope.qmApiUrl + '/embeddable/?plugin=search-relationships&commonOrUser=common';
            $scope.title = 'Common Variable Relationships';
        }

        if(window.location.href.indexOf('search-user-relationships') > -1 )
        {
            iFrameUrl = $rootScope.qmApiUrl + '/embeddable/?plugin=search-relationships&commonOrUser=user';
            $scope.title = 'Your Variable Relationships';
        }

        if(window.location.href.indexOf('import-data') > -1 )
        {
            iFrameUrl = $rootScope.qmApiUrl + '/api/v1/connect/mobile';
            $scope.title = 'Your Variable Relationships';
        }
        console.debug('iframeScreen.init: Going to QuantiModo.getAccessTokenFromAnySource');
        QuantiModo.getAccessTokenFromAnySource().then(function(accessToken) {

            if(accessToken){
                if(iFrameUrl.indexOf('?') > -1){
                    iFrameUrl = iFrameUrl + '&access_token=' + accessToken;
                } else {
                    iFrameUrl = iFrameUrl + '?access_token=' + accessToken;
                }
            }
            $scope.iframeUrl = $sce.trustAsResourceUrl(
                iFrameUrl
            );
            $ionicLoading.hide();
        }, function(){
            console.debug("iframeScreen: No access token. Need to log in.");
            localStorageService.setItem('afterLoginGoTo', window.location.href);
            console.debug("set afterLoginGoTo to " + window.location.href);
            $rootScope.sendToLogin();
            $ionicLoading.hide();
        });
    });