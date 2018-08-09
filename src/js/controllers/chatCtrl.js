angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout",
	function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout) {
		$scope.controller_name = "ChatCtrl";
		$scope.state = {
			dialogFlow: false,
			trackingReminderNotification: null,
			messages: [],
            replyMessage: ''
		};
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
        });
        $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();
            postMessage(qm.dialogFlow.welcomeBody);
        });
        $scope.state.userReply = function(reply) {
            if(reply){$scope.state.replyMessage = reply;}
            if ( $scope.state.replyMessage === '' ) {return;}
			$scope.state.messages.push({
				who    : 'user',
				message: $scope.state.replyMessage,
				time   : 'Just now'
			});
			qm.dialogFlow.postNotificationResponse($scope.state.replyMessage, function (body) {
				respondWithMessageToUser()
			}, function (error) {
				respondWithMessageToUser(error)
			});
			$scope.state.replyMessage = '';
		};
		function postMessage(body) {
            qm.dialogFlow.post(body, function (response) {
                respondWithMessageToUser();
            }, function(error){
            	respondWithMessageToUser(error);
			});
        }
        function talk(message) {
            var useRobot = false;
            if(useRobot){qm.speech.makeRobotTalk(message);} else {qm.speech.readOutLoud(message);}
        }
        function respondWithMessageToUser(message) {
			if(!message && !qm.dialogFlow.lastApiResponse.payload.google){return;}
			message = message || qm.dialogFlow.lastApiResponse.payload.google.systemIntent.data.listSelect.title;
			$scope.state.lastBotMessage = message;
			talk(message);
            $scope.state.messages.push({
                who    : 'bot',
                message: message,
                time   : 'Just now'
            });
            //qm.speech.initializeSpeechKit(qmService);
            var commands = {
                "I don't know": function () {
                    talk("OK. We'll skip that one.");
                    $scope.state.userReply('skip');
                },
                '*tag': function(tag) {
                	if(tag.indexOf($scope.state.lastBotMessage.toLowerCase().substring(0, 10)) !== -1){
                		qmLog.info("Just heard bot say " + tag);
					} else {
                        qmLog.info("Just heard user say " + tag);
					}
                    $scope.state.userReply(tag);
                }
            };
            qm.speech.startListening(commands);
        }
		function getMostRecentNotification() {
			$scope.state.trackingReminderNotification = qm.notifications.getMostRecentNotification();
			$scope.state.messages.push({
				who    : 'bot',
				message: $scope.state.trackingReminderNotification.longQuestion,
				time   : 'Just now'
			})
		}
        $(function() {
            $(".anim").on("click", ".material-icons", function() {
                var $this = $(this),
                    $anim = $this.closest(".anim");
                $anim.addClass("animate");
                $("input.search").addClass("speak").attr("placeholder", "Listening...  Speak Now...");
                setTimeout( removeAnim, 7000);

            })
        });
        function removeAnim() {
            $(".anim").removeClass("animate");
            $("input.search").removeClass("speak").attr("placeholder", "Enter a Keyword, Phrase, or Question...");
        }
    }]
);