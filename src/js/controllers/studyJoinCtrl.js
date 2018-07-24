angular.module('starter').controller('StudyJoinCtrl', ["$scope", "$state", "qmService", "qmLogService", "$rootScope", "$stateParams",
    function($scope, $state, qmService, qmLogService, $rootScope, $stateParams) {
    $scope.controller_name = "StudyJoinCtrl";
    qmLogService.debug($scope.controller_name + ' first starting in state: ' + $state.current.name);
    var blue = { backgroundColor: "#3467d6", circleColor: "#5b95f9" };
    $scope.state = {
        title: 'Join Our Study',
        color: blue,
        image: { url: "img/robots/quantimodo-robot-puzzled.svg", height: "100", width: "100" },
        bodyText: "One moment please...",
        moreInfo: "No personally identifiable data will be shared.  Data will only be used in an anonymous and " +
            "aggregated form as is done in epidemiological studies.",
        study: null,
        joining: false
    };
    $scope.$on('$ionicView.beforeEnter', function(e) {
        qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
        $scope.state.study = $stateParams.study;
        qmLogService.debug($scope.controller_name + ' $ionicView.beforeEnter in state: ' + $state.current.name, null);
        if(!$rootScope.user){
            qmLogService.debug('Hiding nav menu because we do not have a user', null);
            qmService.navBar.hideNavigationMenu();
        }
        initializeScope();
        var params = getRequestParams();
        qm.studyHelper.getStudyFromLocalStorageOrApi(params, function (study) {
            $scope.state.study = study;
            initializeScope();
        }, function (error) {
            qmLog.error(error);
            //$scope.goBack();
        });
    });
    $scope.$on('$ionicView.enter', function(e) {
        qmLogService.debug($scope.controller_name + ' $ionicView.enter in state: ' + $state.current.name, null);
        qmService.hideLoader();
        if(qm.urlHelper.getParam('alreadyJoined')){ $scope.joinStudy(); }
    });
    $scope.$on('$ionicView.afterEnter', function(){ });
    $scope.$on('$ionicView.beforeLeave', function(){ });
    $scope.$on('$ionicView.leave', function(){ });
    $scope.$on('$ionicView.afterLeave', function(){ });
    function initializeScope() {
        $scope.requestParams = getRequestParams();
        $scope.state.title = "Help us discover the effects of " + getCauseVariableName() + " on " + getEffectVariableName() +"!" ;
        $scope.state.bodyText = "It only takes a few seconds to answer two questions a day.";
        $scope.state.moreInfo = "By taking a few seconds to answer two questions a day and anonymously pooling your responses with thousands " +
            "of other participants, you can help us discover the effects of " + getCauseVariableName() +
            " on " + getEffectVariableName() + ".  After we accumulate a month or two of data, " +
            "you'll also be able to see personalized study results" +
            " showing the likely effects of " + getCauseVariableName() + " on your own " +
            getEffectVariableName();
    }
    function getRequestParams(){
        var body = {
            studyId: getStudyId(),
            causeVariableName: getCauseVariableName(),
            effectVariableName: getEffectVariableName()
        };
        return body;
    }
    $scope.joinStudy = function () {
        qmService.showBasicLoader();
        $scope.state.joining = true;
        $scope.state.image.url = "img/robots/quantimodo-robot-happy.svg";
        if(qmService.login.sendToLoginIfNecessaryAndComeBack(null, window.location.href + '&alreadyJoined=true')){return;}
        $scope.state.title = "Joining study...";
        $scope.state.bodyText = "Thank you for helping us accelerate scientific discovery!";
        if(!$scope.state.study){
            //qmService.showBasicLoader();
        } else {
            $scope.state.study.joined = true;
        }
        qm.studiesJoined.joinStudy(getRequestParams(), function (study) {
            study.joined = true;
            $scope.state.study = study;
            qmService.hideLoader();
            $scope.state.title = "Thank you!";
            $scope.state.bodyText = "Let's record your first measurements!";
        }, function (error) {
            qmService.hideLoader();
            qmLogService.error(error);
            qmService.showMaterialAlert("Could not join study!", "Please contact mike@quantimo.do and he'll fix it for you.  Thanks!");
        });
    };
    $scope.showMoreInfo = function () { qmService.showMaterialAlert($scope.state.title, $scope.state.moreInfo); };
    function getEffectVariableName() {return qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope);}
    function getCauseVariableName() {return qm.studyHelper.getCauseVariableName($stateParams, $scope, $rootScope);}
    function getStudyId() {return qm.studyHelper.getStudyId($stateParams, $scope, $rootScope);}
    function getCauseVariable() {return qm.studyHelper.getCauseVariable($stateParams, $scope, $rootScope);}
    function getEffectVariable() {return qm.studyHelper.getEffectVariable($stateParams, $scope, $rootScope);}
}]);
