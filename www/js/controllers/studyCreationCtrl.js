angular.module('starter').controller('StudyCreationCtrl', function($scope, $state, quantimodoService, clipboard) {
    $scope.state = {
        title: 'Create a Study',
        color: quantimodoService.colors.blue,
        image: { url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85" },
        bodyText: "One moment please..."
    };
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
