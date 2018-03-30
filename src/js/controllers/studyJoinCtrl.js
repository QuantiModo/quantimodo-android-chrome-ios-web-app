angular.module('starter').controller('StudyJoinCtrl', ["$scope", "$state", "qmService", "qmLogService", "$rootScope", "$stateParams", function($scope, $state, qmService, qmLogService, $rootScope, $stateParams) {
    $scope.controller_name = "StudyJoinCtrl";
    if(window.debugMode){qmLogService.debug(null, $scope.controller_name + ' first starting in state: ' + $state.current.name, null);}
    var green = { backgroundColor: "#0f9d58", circleColor: "#03c466" };
    var blue = { backgroundColor: "#3467d6", circleColor: "#5b95f9" };
    var yellow = { backgroundColor: "#f09402", circleColor: "#fab952" };
    $scope.state = {
        title: 'Join Our Study',
        color: blue,
        image: { url: "img/robots/quantimodo-robot-puzzled.svg", height: "100", width: "100" },
        bodyText: "One moment please...",
        moreInfo: "No personally identifiable data will be shared.  Data will only be used in an anonymous and " +
            "aggregated form as is done in epidemiological studies."
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        if(window.debugMode){qmLogService.debug(null, $scope.controller_name + ' $ionicView.beforeEnter in state: ' + $state.current.name, null);}
        if(!$rootScope.user){
            qmLogService.debug('Hiding nav menu because we do not have a user', null);
            qmService.navBar.hideNavigationMenu();
        }
        $scope.requestParams = {
            causeVariableName: getParameterByName('causeVariableName'),
            effectVariableName: getParameterByName('effectVariableName'),
        };
        if($stateParams.correlationObject){ $scope.requestParams = $stateParams.correlationObject; }
        if(!$scope.requestParams.causeVariableName){ $scope.goBack(); }
        $scope.state.title = "Help us discover the effects of " + $scope.requestParams.causeVariableName + " on " +
            $scope.requestParams.effectVariableName +"!" ;
        $scope.state.bodyText = "It only takes a few seconds to answer two questions a day.";
        $scope.state.moreInfo = "By taking a few seconds to answer two questions a day and anonymously pooling your responses with thousands " +
            "of other participants, you can help us discover the effects of " + $scope.requestParams.causeVariableName +
            " on " + $scope.requestParams.effectVariableName + ".  After we accumulate a month or two of data, " +
            "you'll also be able to see personalized study results" +
            " showing the likely effects of " + $scope.requestParams.causeVariableName + " on your own " +
            $scope.requestParams.effectVariableName;
    });
    $scope.$on('$ionicView.enter', function(e) {
        if(window.debugMode){qmLogService.debug(null, $scope.controller_name + ' $ionicView.enter in state: ' + $state.current.name, null);}
        qmService.hideLoader();
        if(getParameterByName('alreadyJoined')){ $scope.joinStudy(); }
    });
    $scope.$on('$ionicView.afterEnter', function(){ });
    $scope.$on('$ionicView.beforeLeave', function(){ });
    $scope.$on('$ionicView.leave', function(){ });
    $scope.$on('$ionicView.afterLeave', function(){ });
    function getParameterByName(name, url) {
        if (!url) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) { return null; }
        if (!results[2]) { return ''; }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    $scope.joinStudy = function () {
        $scope.hideJoinStudyButton = true;
        $scope.state.image.url = "img/robots/quantimodo-robot-happy.svg";
        if(qmService.sendToLoginIfNecessaryAndComeBack(null, window.location.href + '&alreadyJoined=true')){return;}
        $scope.state.title = "Joining study...";
        $scope.state.bodyText = "Thank you for helping us accelerate scientific discovery!";
        qmService.joinStudyDeferred($scope.requestParams).then(function () {
            qmService.hideLoader();
            $scope.state.title = "Thank you!";
            $scope.state.bodyText = "Let's record your first measurements!";
            $scope.showGetStartedButton = true;
        }, function (error) {
            qmService.hideLoader();
            qmLogService.error(error);
            qmService.showMaterialAlert("Could not join study!", "Please contact mike@quantimo.do and he'll fix it for you.  Thanks!");
        });
    };
    $scope.showMoreInfo = function () { qmService.showMaterialAlert($scope.state.title, $scope.state.moreInfo); };
}]);
