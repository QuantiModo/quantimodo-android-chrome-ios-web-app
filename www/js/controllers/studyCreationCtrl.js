angular.module('starter').controller('StudyCreationCtrl', function($scope, $state, quantimodoService, clipboard) {
    $scope.state = {
        title: 'Create a Study',
        color: quantimodoService.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "100", width: "100" },
        bodyText: "One moment please...",
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        //quantimodoService.goToLoginIfNecessary();  Why do we need to login?
    });
    if (!clipboard.supported) {
        console.debug('Sorry, copy to clipboard is not supported');
        $scope.hideClipboardButton = true;
    }
    $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
    $scope.copyStudyUrlToClipboard = function (causeVariableName, effectVariableName) {
        $scope.copyLinkText = 'Copied!';
        var studyLink = 'https://app.quantimo.do/api/v2/study?causeVariableName=' + encodeURIComponent(causeVariableName) + '&effectVariableName=' + encodeURIComponent(effectVariableName);
        clipboard.copyText(studyLink);
    };
});
