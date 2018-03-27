angular.module('starter')
.controller('IframeScreenCtrl', ["$stateParams", "$scope", "$ionicLoading", "$sce", "$state", "$rootScope", "qmService", "qmLogService", function ($stateParams, $scope, $ionicLoading, $sce, $state, $rootScope, qmService, qmLogService) {
    qmLogService.debug('IframeScreenCtrl works!', null);
    qmService.navBar.setFilterBarSearchIcon(false);
    var embedPlugin;
    var urlParameters = '';
    var iFrameUrl;
    $scope.iFrameStyle = "height:2000px; width:100%;";
    if($state.current.name === 'app.studyCreate')
    {
        $scope.iFrameStyle = "height:5000px; width:100%;";
        iFrameUrl = qm.api.getBaseUrl() + '/api/v2/studies?hideMenu=true';
        $scope.title = 'Create Study';
    }
    if($stateParams.title) {
        $scope.title = $stateParams.title;
    }
    if($stateParams.path) {
        iFrameUrl = qm.api.getBaseUrl() + $stateParams.path;
    }
    if($stateParams.iFrameStyle) {
        $scope.iFrameStyle = $stateParams.iFrameStyle;
    }
    if(window.location.href.indexOf('search-variables') > -1 )
    {
        iFrameUrl = qm.api.getBaseUrl() + '/embeddable/?plugin=search-variables';
        $scope.title = 'Your Variables';
    }
    if(window.location.href.indexOf('search-common-relationships') > -1 )
    {
        iFrameUrl = qm.api.getBaseUrl() + '/embeddable/?plugin=search-relationships&commonOrUser=common';
        $scope.title = 'Common Variable Relationships';
    }
    if(window.location.href.indexOf('search-user-relationships') > -1 )
    {
        iFrameUrl = qm.api.getBaseUrl() + '/embeddable/?plugin=search-relationships&commonOrUser=user';
        $scope.title = 'Your Variable Relationships';
    }
    if(window.location.href.indexOf('import-data') > -1 )
    {
        iFrameUrl = qm.api.getBaseUrl() + '/api/v1/connect/mobile';
        $scope.title = 'Your Variable Relationships';
    }
    qmLogService.debug('iframeScreen.init: Going to qmService.getAccessTokenFromAnySource', null);
    qmService.getAccessTokenFromAnySource().then(function(accessToken) {

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
        qmService.hideLoader();
    }, function(){
        qmLogService.debug('iframeScreen: No access token. Need to log in.', null);
        qmService.sendToLoginIfNecessaryAndComeBack();
        qmService.hideLoader();
    });
}]);
