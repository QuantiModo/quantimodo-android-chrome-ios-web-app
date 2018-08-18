angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout", "$q",
	function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout, $q) {
		$scope.controller_name = "ChatCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
		$scope.state = {
			dialogFlow: false,
			trackingReminderNotification: null,
			messages: [],
            userInputString: '',
            visualizationType: 'rainbow', // 'siri', 'rainbow', 'equalizer'
            listening: qm.microphone.listening,
            circlePage: {
			    title: null,
                image: {
			        url: null
                }
            }
		};
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
        });
        $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();
            if(!qm.getUser()){
                qmService.login.sendToLoginIfNecessaryAndComeBack();
                return;
            }

        });
		if($scope.state.visualizationType === 'rainbow'){$scope.state.bodyCss = "background: hsl(250,10%,10%); overflow: hidden;"}
        if($scope.state.visualizationType === 'siri'){$scope.state.bodyCss = "background: radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat fixed 0 0; margin: 0;"}
        if($scope.state.visualizationType === 'equalizer'){$scope.state.bodyCss = "background-color:#333;"}
        function notification() {
            qm.notifications.getMostRecentNotification(function (notification) {
                $scope.circlePage = qm.notifications.getCirclePage(notification);
            });
            $timeout(function () {
                qm.speech.getMostRecentNotificationAndTalk();
            }, 1);
        }
        function getQuestion() {
		    var text = qm.urlHelper.getParam('text');
            if(qm.urlHelper.getParam('type') === 'question'){
		        var question = qm.urlHelper.getParam('type')
            }
        }
        function blurAll(){
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
        }
		$scope.state.toggleMicrophone = function(){
            $scope.state.listening = qm.microphone.toggleListening();
            var container = document.getElementById('mic-input-field-container');
            if($scope.state.listening){
                blurAll();
            } else {
                container[0].focus();
            }
        };

        $scope.state.userReply = function(reply) {
            reply = reply || $scope.state.userInputString;
            if(reply){$scope.state.userInputString = reply;}
            if ( reply === '' || !reply) {
                qmLog.error("No reply!");
                return;
            }
			$scope.state.messages.push({who: 'user', message: $scope.state.userInputString, time: 'Just now'});
            qm.speech.getMostRecentNotificationAndTalk();
			$scope.state.userInputString = '';
		};
		qm.staticData.dialogAgent.intents["Cancel Intent"].callback = function(){
		    qm.speech.talkRobot(qm.staticData.dialogAgent.intents["Cancel Intent"].responses.messages.speech);
		    qm.microphone.abortListening();
		    qmService.goToDefaultState();
        };
        qm.staticData.dialogAgent.intents["Create Reminder Intent"].callback = function(){
		    qm.speech.currentIntent.name = "Create Reminder Intent";
		    var intent = qm.staticData.dialogAgent.intents["Create Reminder Intent"];
            if(!qm.dialogFlow.weHaveRequiredParams(intent)){return;}
            qm.variablesHelper.getFromLocalStorageOrApi({searchPhrase: qm.speech.currentIntent.parameters.variableName}, function(variable){
                qmService.addToRemindersUsingVariableObject(variable, {skipReminderSettingsIfPossible: true, doneState: "false"});
            });
        };
    }]
);